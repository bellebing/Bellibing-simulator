import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import type { SonataEffectModel } from '../sonataEffectDomain.ts';

export type StatusInflictionEventKind =
  | 'FUSION_BURST_INFLICTED'
  | 'TUNE_RUPTURE_SHIFTING_INFLICTED';

export interface StatusInflictionEvent {
  readonly kind: StatusInflictionEventKind;
  readonly actorId: string;
  readonly atSeconds: number;
}

interface StatusInflictionWindowContractBase {
  readonly effectId: string;
  readonly expectedStatOrEffect: string;
  readonly expectedValue: number;
  readonly expectedDurationSeconds: number;
  readonly triggerEvents: readonly StatusInflictionEventKind[];
}

export interface WeaponStatusInflictionWindowContract extends StatusInflictionWindowContractBase {
  readonly sourceKind: 'WEAPON';
  readonly expectedWeaponId: string;
  readonly rank: 1 | 2 | 3 | 4 | 5;
}

export interface SonataStatusInflictionWindowContract extends StatusInflictionWindowContractBase {
  readonly sourceKind: 'SONATA';
  readonly expectedSonataSetId: string;
  readonly expectedPieces: 5;
}

export type StatusInflictionWindowContract =
  | WeaponStatusInflictionWindowContract
  | SonataStatusInflictionWindowContract;

export interface ActiveStatusInflictionSelfWindow {
  readonly adapterId: 'status-infliction-timed-self-window-v1';
  readonly sourceKind: 'WEAPON' | 'SONATA';
  readonly effectId: string;
  readonly sourceId: string;
  readonly actorId: string;
  readonly statOrEffect: string;
  readonly value: number;
  readonly triggerEvent: StatusInflictionEventKind;
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
}

const BOTH_STATUS_EVENTS = [
  'FUSION_BURST_INFLICTED',
  'TUNE_RUPTURE_SHIFTING_INFLICTED',
] as const;

/**
 * Manual semantic contracts only. This primitive never parses trigger prose and
 * never discovers a status event from a source-sequence action label.
 */
export const STATUS_INFLICTION_WINDOW_CONTRACTS: readonly StatusInflictionWindowContract[] = [
  {
    sourceKind: 'WEAPON',
    effectId: 'EP-LIB-DEF',
    expectedWeaponId: 'everbright-polestar',
    rank: 1,
    expectedStatOrEffect: 'Resonance Liberation DMG DEF Ignore',
    expectedValue: 0.32,
    expectedDurationSeconds: 8,
    triggerEvents: BOTH_STATUS_EVENTS,
  },
  {
    sourceKind: 'WEAPON',
    effectId: 'EP-LIB-FUSION-RES',
    expectedWeaponId: 'everbright-polestar',
    rank: 1,
    expectedStatOrEffect: 'Resonance Liberation Fusion RES Ignore',
    expectedValue: 0.10,
    expectedDurationSeconds: 8,
    triggerEvents: BOTH_STATUS_EVENTS,
  },
  {
    sourceKind: 'SONATA',
    effectId: 'S27_5PC_CR',
    expectedSonataSetId: 'sonata-27',
    expectedPieces: 5,
    expectedStatOrEffect: 'CRIT Rate',
    expectedValue: 0.20,
    expectedDurationSeconds: 8,
    triggerEvents: BOTH_STATUS_EVENTS,
  },
  {
    sourceKind: 'SONATA',
    effectId: 'S27_5PC_FUSION',
    expectedSonataSetId: 'sonata-27',
    expectedPieces: 5,
    expectedStatOrEffect: 'Fusion DMG Bonus',
    expectedValue: 0.20,
    expectedDurationSeconds: 8,
    triggerEvents: BOTH_STATUS_EVENTS,
  },
] as const;

export const STATUS_INFLICTION_WINDOW_SEMANTIC_SPLIT = {
  adapterId: 'status-infliction-timed-self-window-v1',
  reviewedAt: '2026-09-01',
  weaponPendingExecutionIds: [
    'weapon:everbright-polestar:EP-LIB-DEF:trigger-uptime-adapter',
    'weapon:everbright-polestar:EP-LIB-FUSION-RES:trigger-uptime-adapter',
  ],
  sonataPendingExecutionIds: [
    'sonata:sonata-27:S27_5PC_CR:trigger-uptime-adapter',
    'sonata:sonata-27:S27_5PC_FUSION:trigger-uptime-adapter',
  ],
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
  notes: [
    'Everbright Polestar and Trailblazing Star use the same source-explicit 8-second SELF window after the wielder inflicts Fusion Burst or Tune Rupture - Shifting.',
    'Fusion Burst and Tune Rupture - Shifting remain distinct executable event kinds even though either event can activate each reviewed contract.',
    'The primitive requires an explicit actor and timestamp; it never assumes trigger uptime from equipped gear, team selection, Resonance Mode or source action order.',
  ],
} as const;

function weaponById(catalog: readonly WeaponEffectData[], effectId: string): WeaponEffectData | null {
  const matches = catalog.filter((effect) => effect.effectId === effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate weapon effect id ${effectId}`);
  return matches[0];
}

function sonataById(catalog: readonly SonataEffectModel[], effectId: string): SonataEffectModel | null {
  const matches = catalog.filter((effect) => effect.effectId === effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate Sonata effect id ${effectId}`);
  return matches[0];
}

export function validateStatusInflictionWindowContracts(params: {
  readonly weaponCatalog?: readonly WeaponEffectData[];
  readonly sonataCatalog?: readonly SonataEffectModel[];
} = {}): readonly string[] {
  const weaponCatalog = params.weaponCatalog ?? WEAPON_EFFECT_CATALOG;
  const sonataCatalog = params.sonataCatalog ?? SONATA_EFFECT_MODELS;
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const contract of STATUS_INFLICTION_WINDOW_CONTRACTS) {
    const key = `${contract.sourceKind}:${contract.effectId}`;
    if (seen.has(key)) issues.push(`duplicate status-infliction contract ${key}`);
    seen.add(key);
    if (contract.triggerEvents.length === 0) issues.push(`${key} has no executable trigger events`);
    if (new Set(contract.triggerEvents).size !== contract.triggerEvents.length) {
      issues.push(`${key} repeats an executable trigger event`);
    }

    if (contract.sourceKind === 'WEAPON') {
      const effect = weaponById(weaponCatalog, contract.effectId);
      if (!effect) {
        issues.push(`missing weapon effect ${contract.effectId}`);
        continue;
      }
      if (effect.weaponId !== contract.expectedWeaponId) issues.push(`${contract.effectId} weapon drift`);
      if (effect.statOrEffect !== contract.expectedStatOrEffect) issues.push(`${contract.effectId} stat drift`);
      if (effect.rankValues[contract.rank - 1] !== contract.expectedValue) issues.push(`${contract.effectId} R${contract.rank} value drift`);
      if (effect.durationSeconds !== contract.expectedDurationSeconds) issues.push(`${contract.effectId} duration drift`);
      if (effect.effectType !== 'TRIGGERED') issues.push(`${contract.effectId} must remain TRIGGERED`);
      if (effect.appliesTo !== 'SELF') issues.push(`${contract.effectId} must remain SELF`);
      if (effect.maxStacks !== 1) issues.push(`${contract.effectId} must remain single-state`);
      if (effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push(`${contract.effectId} must remain VERIFIED_CONDITIONAL`);
      continue;
    }

    const effect = sonataById(sonataCatalog, contract.effectId);
    if (!effect) {
      issues.push(`missing Sonata effect ${contract.effectId}`);
      continue;
    }
    if (effect.sonataSetId !== contract.expectedSonataSetId) issues.push(`${contract.effectId} Sonata set drift`);
    if (effect.pieces !== contract.expectedPieces) issues.push(`${contract.effectId} piece-count drift`);
    if (effect.statOrEffect !== contract.expectedStatOrEffect) issues.push(`${contract.effectId} stat drift`);
    if (effect.value !== contract.expectedValue) issues.push(`${contract.effectId} value drift`);
    if (effect.durationSeconds !== contract.expectedDurationSeconds) issues.push(`${contract.effectId} duration drift`);
    if (effect.valueMode !== 'FLAT') issues.push(`${contract.effectId} must remain FLAT`);
    if (effect.effectType !== 'TRIGGERED') issues.push(`${contract.effectId} must remain TRIGGERED`);
    if (effect.appliesTo !== 'SELF') issues.push(`${contract.effectId} must remain SELF`);
    if (effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push(`${contract.effectId} must remain VERIFIED_CONDITIONAL`);
  }

  return issues;
}

const CONTRACT_ISSUES = validateStatusInflictionWindowContracts();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid status-infliction window contracts: ${CONTRACT_ISSUES.join('; ')}`);
}

function validateEvent(ownerId: string, event: StatusInflictionEvent): void {
  if (!ownerId.trim()) throw new Error('Status-infliction window ownerId must be non-blank');
  if (!event.actorId.trim()) throw new Error('Status-infliction event actorId must be non-blank');
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error(`Status-infliction event time must be a finite non-negative number: ${event.atSeconds}`);
  }
}

export function activateWeaponStatusInflictionWindow(params: {
  readonly effectId: string;
  readonly ownerId: string;
  readonly event: StatusInflictionEvent;
  readonly rank?: 1 | 2 | 3 | 4 | 5;
  readonly catalog?: readonly WeaponEffectData[];
}): ActiveStatusInflictionSelfWindow | null {
  const { effectId, ownerId, event, rank = 1, catalog = WEAPON_EFFECT_CATALOG } = params;
  validateEvent(ownerId, event);
  const contract = STATUS_INFLICTION_WINDOW_CONTRACTS.find(
    (row): row is WeaponStatusInflictionWindowContract => row.sourceKind === 'WEAPON' && row.effectId === effectId,
  );
  if (!contract) throw new Error(`No verified weapon status-infliction contract for ${effectId}`);
  if (event.actorId !== ownerId || !contract.triggerEvents.includes(event.kind)) return null;

  const effect = weaponById(catalog, effectId);
  if (!effect) throw new Error(`Missing weapon effect ${effectId}`);
  const durationSeconds = effect.durationSeconds;
  if (durationSeconds === null || durationSeconds <= 0) throw new Error(`Weapon effect ${effectId} has no executable window duration`);
  const value = effect.rankValues[rank - 1];
  if (!Number.isFinite(value)) throw new Error(`Weapon effect ${effectId} has no finite R${rank} value`);

  return {
    adapterId: 'status-infliction-timed-self-window-v1',
    sourceKind: 'WEAPON',
    effectId,
    sourceId: effect.weaponId,
    actorId: ownerId,
    statOrEffect: effect.statOrEffect,
    value,
    triggerEvent: event.kind,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + durationSeconds,
  };
}

export function activateSonataStatusInflictionWindow(params: {
  readonly effectId: string;
  readonly ownerId: string;
  readonly event: StatusInflictionEvent;
  readonly catalog?: readonly SonataEffectModel[];
}): ActiveStatusInflictionSelfWindow | null {
  const { effectId, ownerId, event, catalog = SONATA_EFFECT_MODELS } = params;
  validateEvent(ownerId, event);
  const contract = STATUS_INFLICTION_WINDOW_CONTRACTS.find(
    (row): row is SonataStatusInflictionWindowContract => row.sourceKind === 'SONATA' && row.effectId === effectId,
  );
  if (!contract) throw new Error(`No verified Sonata status-infliction contract for ${effectId}`);
  if (event.actorId !== ownerId || !contract.triggerEvents.includes(event.kind)) return null;

  const effect = sonataById(catalog, effectId);
  if (!effect) throw new Error(`Missing Sonata effect ${effectId}`);
  const durationSeconds = effect.durationSeconds;
  if (durationSeconds === null || durationSeconds <= 0) throw new Error(`Sonata effect ${effectId} has no executable window duration`);
  if (!Number.isFinite(effect.value)) throw new Error(`Sonata effect ${effectId} has no finite value`);

  return {
    adapterId: 'status-infliction-timed-self-window-v1',
    sourceKind: 'SONATA',
    effectId,
    sourceId: effect.sonataSetId,
    actorId: ownerId,
    statOrEffect: effect.statOrEffect,
    value: effect.value,
    triggerEvent: event.kind,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + durationSeconds,
  };
}

export function isStatusInflictionWindowActive(window: ActiveStatusInflictionSelfWindow, atSeconds: number): boolean {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Status-infliction window query time must be a finite non-negative number: ${atSeconds}`);
  }
  return atSeconds >= window.startedAtSeconds && atSeconds < window.expiresAtSeconds;
}
