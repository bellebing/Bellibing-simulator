import type { WeaponEffectData, WeaponEffectValueUnit } from '../effectDomain.ts';
import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';

export type WeaponDamageEventKind = 'ECHO_SKILL_DAMAGE';

export interface WeaponDamageEvent {
  readonly kind: WeaponDamageEventKind;
  readonly actorId: string;
  readonly atSeconds: number;
}

export interface WeaponDamageWindowContract {
  readonly effectId: string;
  readonly expectedSourceTrigger: string;
  readonly expectedConditions: readonly string[];
  readonly triggerEvents: readonly WeaponDamageEventKind[];
}

export interface ActiveWeaponDamageWindow {
  readonly adapterId: 'weapon-damage-timed-self-window-v1';
  readonly effectId: string;
  readonly weaponId: string;
  readonly actorId: string;
  readonly statOrEffect: string;
  readonly value: number;
  readonly valueUnit: WeaponEffectValueUnit;
  readonly conditions: readonly string[];
  readonly startedAtSeconds: number;
  readonly expiresAtSeconds: number;
}

export const WEAPON_DAMAGE_WINDOW_CONTRACTS: readonly WeaponDamageWindowContract[] = [
  {
    effectId: 'SCIP-AERO-DEF',
    expectedSourceTrigger: 'Deal Echo Skill DMG',
    expectedConditions: ['Damage is Aero DMG'],
    triggerEvents: ['ECHO_SKILL_DAMAGE'],
  },
] as const;

function effectsById(catalog: readonly WeaponEffectData[], effectId: string): readonly WeaponEffectData[] {
  return catalog.filter((effect) => effect.effectId === effectId);
}

function uniqueEffectById(catalog: readonly WeaponEffectData[], effectId: string): WeaponEffectData | null {
  const matches = effectsById(catalog, effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate weapon effect id ${effectId}`);
  return matches[0];
}

function sameStrings(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

export function validateWeaponDamageWindowContracts(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const contract of WEAPON_DAMAGE_WINDOW_CONTRACTS) {
    if (seen.has(contract.effectId)) issues.push(`duplicate damage-window contract ${contract.effectId}`);
    seen.add(contract.effectId);

    const matches = effectsById(catalog, contract.effectId);
    if (matches.length === 0) {
      issues.push(`missing weapon effect ${contract.effectId}`);
      continue;
    }
    if (matches.length > 1) {
      issues.push(`duplicate weapon effect id ${contract.effectId}`);
      continue;
    }

    const effect = matches[0];
    if (effect.trigger !== contract.expectedSourceTrigger) {
      issues.push(`${contract.effectId} trigger drift: expected "${contract.expectedSourceTrigger}", got "${effect.trigger}"`);
    }
    if (!sameStrings(effect.conditions, contract.expectedConditions)) {
      issues.push(`${contract.effectId} conditions drift: expected ${contract.expectedConditions.join(' | ')}, got ${effect.conditions.join(' | ')}`);
    }
    if (effect.effectType !== 'TRIGGERED') issues.push(`${contract.effectId} must remain TRIGGERED`);
    if (effect.appliesTo !== 'SELF') issues.push(`${contract.effectId} must remain SELF`);
    if (effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push(`${contract.effectId} must remain VERIFIED_CONDITIONAL`);
    if (effect.maxStacks !== 1) issues.push(`${contract.effectId} must remain maxStacks=1`);
    if (effect.durationSeconds === null || !Number.isFinite(effect.durationSeconds) || effect.durationSeconds <= 0) {
      issues.push(`${contract.effectId} requires a positive finite duration`);
    }
    if (effect.triggerCooldownSeconds !== null) {
      issues.push(`${contract.effectId} source defines trigger cooldown semantics not supported by damage-window-v1`);
    }
    if (contract.triggerEvents.length === 0) issues.push(`${contract.effectId} has no executable trigger events`);
    if (new Set(contract.triggerEvents).size !== contract.triggerEvents.length) {
      issues.push(`${contract.effectId} repeats an executable trigger event`);
    }
  }

  return issues;
}

const CONTRACT_ISSUES = validateWeaponDamageWindowContracts();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid weapon damage-window contracts: ${CONTRACT_ISSUES.join('; ')}`);
}

export function activateWeaponDamageWindow(params: {
  readonly effectId: string;
  readonly rank: 1 | 2 | 3 | 4 | 5;
  readonly wielderId: string;
  readonly event: WeaponDamageEvent;
  readonly catalog?: readonly WeaponEffectData[];
}): ActiveWeaponDamageWindow | null {
  const { effectId, rank, wielderId, event, catalog = WEAPON_EFFECT_CATALOG } = params;
  const contract = WEAPON_DAMAGE_WINDOW_CONTRACTS.find((row) => row.effectId === effectId);
  if (!contract) throw new Error(`No verified damage-window contract for weapon effect ${effectId}`);
  if (!Number.isInteger(rank) || rank < 1 || rank > 5) {
    throw new Error(`Weapon rank must be an integer from 1 through 5: ${rank}`);
  }
  if (!wielderId.trim()) throw new Error('Weapon damage-window wielderId must be non-blank');
  if (!event.actorId.trim()) throw new Error('Weapon damage event actorId must be non-blank');
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error(`Weapon damage event time must be a finite non-negative number: ${event.atSeconds}`);
  }
  if (event.actorId !== wielderId) return null;
  if (!contract.triggerEvents.includes(event.kind)) return null;

  const effect = uniqueEffectById(catalog, effectId);
  if (!effect) throw new Error(`Missing weapon effect ${effectId}`);
  const durationSeconds = effect.durationSeconds;
  if (durationSeconds === null || durationSeconds <= 0) {
    throw new Error(`Weapon effect ${effectId} has no executable damage-window duration`);
  }
  const value = effect.rankValues[rank - 1];
  if (!Number.isFinite(value)) throw new Error(`Weapon effect ${effectId} has no finite R${rank} value`);

  return {
    adapterId: 'weapon-damage-timed-self-window-v1',
    effectId,
    weaponId: effect.weaponId,
    actorId: wielderId,
    statOrEffect: effect.statOrEffect,
    value,
    valueUnit: effect.valueUnit,
    conditions: effect.conditions,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds: event.atSeconds + durationSeconds,
  };
}

export function isWeaponDamageWindowActive(window: ActiveWeaponDamageWindow, atSeconds: number): boolean {
  if (!Number.isFinite(atSeconds) || atSeconds < 0) {
    throw new Error(`Weapon damage window query time must be a finite non-negative number: ${atSeconds}`);
  }
  return atSeconds >= window.startedAtSeconds && atSeconds < window.expiresAtSeconds;
}
