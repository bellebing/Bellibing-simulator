import { auditWeaponEffectCoverage, getWeaponEffectCoverageStatus } from './data/weaponEffectAudit.ts';
import { WEAPON_CATALOG } from './data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from './data/weaponEffects.ts';
import type { WeaponEffectData } from './effectDomain.ts';

function validateEffect(effect: WeaponEffectData): void {
  if (!WEAPON_CATALOG.some((weapon) => weapon.id === effect.weaponId)) {
    throw new Error(`${effect.effectId}: unknown weapon ${effect.weaponId}.`);
  }
  if (effect.rankValues.length !== 5 || effect.rankValues.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error(`${effect.effectId}: invalid R1-R5 values.`);
  }
  if (!Number.isInteger(effect.maxStacks) || effect.maxStacks < 1) {
    throw new Error(`${effect.effectId}: maxStacks must be a positive integer.`);
  }
  if (!(effect.stackIntervalSeconds >= 0)) throw new Error(`${effect.effectId}: invalid stack interval.`);
  if (effect.effectType === 'PERMANENT') {
    if (effect.durationSeconds !== null) throw new Error(`${effect.effectId}: permanent effect cannot have duration.`);
    if (effect.trigger !== 'Passive') throw new Error(`${effect.effectId}: permanent effect must use Passive trigger.`);
  } else if (!(effect.durationSeconds !== null && effect.durationSeconds > 0)) {
    throw new Error(`${effect.effectId}: triggered/stacking effect requires positive duration.`);
  }
}

export const WEAPON_EFFECT_BY_ID: ReadonlyMap<string, WeaponEffectData> = (() => {
  const map = new Map<string, WeaponEffectData>();
  for (const effect of WEAPON_EFFECT_CATALOG) {
    validateEffect(effect);
    if (map.has(effect.effectId)) throw new Error(`Duplicate weapon effect id: ${effect.effectId}`);
    map.set(effect.effectId, effect);
  }
  return map;
})();

export const WEAPON_EFFECTS_BY_WEAPON: ReadonlyMap<string, readonly WeaponEffectData[]> = (() => {
  const mutable = new Map<string, WeaponEffectData[]>();
  for (const effect of WEAPON_EFFECT_CATALOG) {
    const rows = mutable.get(effect.weaponId) ?? [];
    rows.push(effect);
    mutable.set(effect.weaponId, rows);
  }
  return new Map([...mutable].map(([weaponId, effects]) => [weaponId, Object.freeze([...effects])]));
})();

export function getWeaponEffect(effectId: string): WeaponEffectData | null {
  return WEAPON_EFFECT_BY_ID.get(effectId) ?? null;
}

/**
 * Returns source-audited effect rows only.
 *
 * Pending or missing coverage is an error, not an empty passive. An empty array
 * is only valid after a weapon has been explicitly verified to have no
 * combat-affecting effect.
 */
export function getWeaponEffects(weaponId: string): readonly WeaponEffectData[] {
  const coverage = getWeaponEffectCoverageStatus(weaponId);
  if (coverage === 'AUDITED_EFFECTS') {
    return WEAPON_EFFECTS_BY_WEAPON.get(weaponId) ?? [];
  }
  if (coverage === 'VERIFIED_NO_COMBAT_EFFECT') return [];

  throw new Error(
    `${weaponId}: Weapon Effect coverage is ${coverage}; missing effect rows must not be interpreted as zero effect.`,
  );
}

const coverageAudit = auditWeaponEffectCoverage();

export const WEAPON_EFFECT_CATALOG_META = {
  migratedEffectCount: WEAPON_EFFECT_CATALOG.length,
  coveredWeaponCount: WEAPON_EFFECTS_BY_WEAPON.size,
  totalWeaponCount: WEAPON_CATALOG.length,
  releasedWeaponCount: coverageAudit.releasedCount,
  releasedExplicitCoverageCount: coverageAudit.explicitCoverageCount,
  pendingSourceAuditCount: coverageAudit.pendingSourceAuditCount,
  fullReleasedRosterComplete: coverageAudit.fullReleasedRosterComplete,
  completeness: coverageAudit.fullReleasedRosterComplete ? 'COMPLETE' as const : 'PARTIAL' as const,
  source: 'V9.15 Weapon Effects + Version 3.6 released-roster coverage audit',
  checkedAt: '2026-08-25',
};
