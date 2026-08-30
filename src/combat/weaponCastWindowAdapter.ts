import type { WeaponEffectData, WeaponEffectValueUnit } from '../effectDomain.ts';
import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';

export type WeaponCastEventKind =
  | 'INTRO_SKILL_CAST'
  | 'RESONANCE_SKILL_CAST'
  | 'RESONANCE_LIBERATION_CAST';

export interface WeaponCastEvent {
  readonly kind: WeaponCastEventKind;
  readonly actorId: string;
  readonly atSeconds: number;
}

export interface WeaponCastWindowContract {
  readonly effectId: string;
  readonly expectedSourceTrigger: string;
  readonly triggerEvents: readonly WeaponCastEventKind[];
}

export interface ActiveWeaponSelfWindow {
  readonly adapterId: 'weapon-cast-timed-self-window-v1';
  readonly effectId: string;
  readonly weaponId: string;
  readonly actorId: string;
  readonly statOrEffect: string;
  readonly value: number;
  readonly valueUnit: WeaponEffectValueUnit;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
}

/**
 * Manual semantic review of the cast-event subset behind the syntactic
 * `weapon:trigger-uptime-adapter` dependency family.
 *
 * These mappings are deliberately explicit. Executable code must never parse
 * human-readable `trigger` strings and guess that two different source phrases
 * mean the same event.
 */
export const WEAPON_CAST_WINDOW_CONTRACTS: readonly WeaponCastWindowContract[] = [
  {
    effectId: 'AH-INTRO',
    expectedSourceTrigger: 'Intro Skill',
    triggerEvents: ['INTRO_SKILL_CAST'],
  },
  {
    effectId: 'AH-SKILL',
    expectedSourceTrigger: 'Resonance Skill',
    triggerEvents: ['RESONANCE_SKILL_CAST'],
  },
  {
    effectId: 'WM-LIB',
    expectedSourceTrigger: 'Intro Skill or Resonance Liberation',
    triggerEvents: ['INTRO_SKILL_CAST', 'RESONANCE_LIBERATION_CAST'],
  },
  {
    effectId: 'TLD-SKILL',
    expectedSourceTrigger: 'Cast Intro Skill or Resonance Liberation',
    triggerEvents: ['INTRO_SKILL_CAST', 'RESONANCE_LIBERATION_CAST'],
  },
  {
    effectId: 'MGS-LIB',
    expectedSourceTrigger: 'Cast Intro Skill or Resonance Liberation',
    triggerEvents: ['INTRO_SKILL_CAST', 'RESONANCE_LIBERATION_CAST'],
  },
] as const;

export const WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT = {
  adapterId: 'weapon-cast-timed-self-window-v1',
  reviewedAt: '2026-08-30',
  castWindowPendingExecutionIds: [
    'weapon:ages-of-harvest:AH-INTRO:trigger-uptime-adapter',
    'weapon:ages-of-harvest:AH-SKILL:trigger-uptime-adapter',
    'weapon:wildfire-mark:WM-LIB:trigger-uptime-adapter',
    'weapon:the-last-dance:TLD-SKILL:trigger-uptime-adapter',
    'weapon:moongazers-sigil:MGS-LIB:trigger-uptime-adapter',
  ],
  targetStatusPendingExecutionIds: [
    'weapon:woodland-aria:WA-AERO:trigger-uptime-adapter',
  ],
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
  notes: [
    'Five canonical edges share an explicit cast-event -> timed SELF-window mechanic and are covered by the reusable primitive.',
    'Woodland Aria WA-AERO is not a cast-window mechanic: it activates when Aero Erosion is inflicted on a target and remains a separate target-status event boundary.',
    'Implementing the primitive does not close a profile dependency while its rotation is SOURCE_SEQUENCE_ONLY; an executable profile event timeline must supply the actual trigger event and timing.',
    'The primitive creates one source-backed activation window. It does not invent multi-trigger refresh/overlap policy beyond the event supplied by an executable caller.',
  ],
} as const;

function effectById(catalog: readonly WeaponEffectData[], effectId: string): WeaponEffectData | null {
  return catalog.find((effect) => effect.effectId === effectId) ?? null;
}

export function validateWeaponCastWindowContracts(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const contract of WEAPON_CAST_WINDOW_CONTRACTS) {
    if (seen.has(contract.effectId)) issues.push(`duplicate cast-window contract ${contract.effectId}`);
    seen.add(contract.effectId);

    const effect = effectById(catalog, contract.effectId);
    if (!effect) {
      issues.push(`missing weapon effect ${contract.effectId}`);
      continue;
    }
    if (effect.trigger !== contract.expectedSourceTrigger) {
      issues.push(`${contract.effectId} trigger drift: expected "${contract.expectedSourceTrigger}", got "${effect.trigger}"`);
    }
    if (effect.effectType !== 'TRIGGERED') issues.push(`${contract.effectId} must remain TRIGGERED`);
    if (effect.appliesTo !== 'SELF') issues.push(`${contract.effectId} must remain SELF`);
    if (effect.maxStacks !== 1) issues.push(`${contract.effectId} must remain single-window maxStacks=1`);
    if (effect.durationSeconds === null || !Number.isFinite(effect.durationSeconds) || effect.durationSeconds <= 0) {
      issues.push(`${contract.effectId} requires a positive finite duration`);
    }
    if (effect.triggerCooldownSeconds !== null) {
      issues.push(`${contract.effectId} source defines trigger cooldown semantics not supported by cast-window-v1`);
    }
    if (effect.conditions.length > 0) {
      issues.push(`${contract.effectId} has additional source conditions not supported by cast-window-v1`);
    }
    if (contract.triggerEvents.length === 0) issues.push(`${contract.effectId} has no executable trigger events`);
    if (new Set(contract.triggerEvents).size !== contract.triggerEvents.length) {
      issues.push(`${contract.effectId} repeats an executable trigger event`);
    }
  }

  return issues;
}

const CONTRACT_ISSUES = validateWeaponCastWindowContracts();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid weapon cast-window contracts: ${CONTRACT_ISSUES.join('; ')}`);
}

export function activateWeaponCastWindow(params: {
  readonly effectId: string;
  readonly rank: 1 | 2 | 3 | 4 | 5;
  readonly wielderId: string;
  readonly event: WeaponCastEvent;
  readonly catalog?: readonly WeaponEffectData[];
}): ActiveWeaponSelfWindow | null {
  const { effectId, rank, wielderId, event, catalog = WEAPON_EFFECT_CATALOG } = params;
  const contract = WEAPON_CAST_WINDOW_CONTRACTS.find((row) => row.effectId === effectId);
  if (!contract) throw new Error(`No verified cast-window contract for weapon effect ${effectId}`);
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error(`Weapon cast event time must be a finite non-negative number: ${event.atSeconds}`);
  }
  if (event.actorId !== wielderId) return null;
  if (!contract.triggerEvents.includes(event.kind)) return null;

  const effect = effectById(catalog, effectId);
  if (!effect) throw new Error(`Missing weapon effect ${effectId}`);
  const durationSeconds = effect.durationSeconds;
  if (durationSeconds === null || durationSeconds <= 0) {
    throw new Error(`Weapon effect ${effectId} has no executable cast-window duration`);
  }

  return {
    adapterId: 'weapon-cast-timed-self-window-v1',
    effectId,
    weaponId: effect.weaponId,
    actorId: wielderId,
    statOrEffect: effect.statOrEffect,
    value: effect.rankValues[rank - 1],
    valueUnit: effect.valueUnit,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + durationSeconds,
  };
}

export function isWeaponCastWindowActive(window: ActiveWeaponSelfWindow, atSeconds: number): boolean {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Weapon window query time must be a finite non-negative number: ${atSeconds}`);
  }
  return atSeconds >= window.startedAtSeconds && atSeconds < window.expiresAtSeconds;
}
