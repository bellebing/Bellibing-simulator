import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import type { WeaponCastEvent } from './weaponCastWindowAdapter.ts';

export const WEAPON_COOLDOWN_CAST_WINDOW_PRIMITIVE_ID = 'weapon-cooldown-qualified-cast-self-window-v1';

const EFFECT_IDS = ['CS-ATK', 'EC-ATK', 'FA-ATK', 'RJ-ATK', 'WR-ATK'] as const;
export type CooldownCastWindowEffectId = typeof EFFECT_IDS[number];

function effectById(effectId: string, catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG) {
  const rows = catalog.filter(row => row.effectId === effectId);
  if (rows.length !== 1) throw new Error(`${effectId}: expected exactly one canonical weapon effect`);
  return rows[0];
}

export function validateWeaponCooldownCastWindowContracts(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
): readonly string[] {
  const issues: string[] = [];
  for (const effectId of EFFECT_IDS) {
    let effect: WeaponEffectData;
    try { effect = effectById(effectId, catalog); } catch (error) {
      issues.push(error instanceof Error ? error.message : String(error));
      continue;
    }
    if (effect.effectType !== 'TRIGGERED') issues.push(`${effectId} must remain TRIGGERED`);
    if (effect.trigger !== 'Cast Resonance Skill') issues.push(`${effectId} trigger drift`);
    if (effect.statOrEffect !== 'ATK%') issues.push(`${effectId} stat drift`);
    if (effect.valueUnit !== 'DECIMAL_MULTIPLIER') issues.push(`${effectId} value-unit drift`);
    if (effect.appliesTo !== 'SELF') issues.push(`${effectId} scope drift`);
    if (effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push(`${effectId} modeling-status drift`);
    if (effect.durationSeconds !== 16) issues.push(`${effectId} duration drift`);
    if (effect.triggerCooldownSeconds !== 20) issues.push(`${effectId} cooldown drift`);
    if (effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0) issues.push(`${effectId} stack contract drift`);
    if (effect.conditions.length !== 0) issues.push(`${effectId} gained unsupported conditions`);
    if (effect.rankValues.length !== 5 || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
      issues.push(`${effectId} requires five bounded source rank values`);
    }
  }
  return issues;
}

const CONTRACT_ISSUES = validateWeaponCooldownCastWindowContracts();
if (CONTRACT_ISSUES.length) throw new Error(`Invalid cooldown-cast weapon contracts: ${CONTRACT_ISSUES.join('; ')}`);

export function listWeaponCooldownCastWindowSupport() {
  return EFFECT_IDS.map(effectId => {
    const effect = effectById(effectId);
    return {
      effectId,
      weaponId: effect.weaponId,
      statOrEffect: effect.statOrEffect,
      triggerEvent: 'RESONANCE_SKILL_CAST' as const,
      primitiveId: WEAPON_COOLDOWN_CAST_WINDOW_PRIMITIVE_ID,
      scope: 'EXPLICIT_CAST_WITH_COOLDOWN_READY_STATE' as const,
    };
  });
}

export function activateWeaponCooldownCastWindow(params: {
  readonly effectId: CooldownCastWindowEffectId;
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly event: WeaponCastEvent;
  /** Caller-proven time at which the source passive is next allowed to trigger. */
  readonly cooldownReadyAtSeconds: number;
}) {
  const effect = effectById(params.effectId);
  if (params.selectedWeapon.id !== effect.weaponId) {
    throw new Error('Cooldown-cast window requires the exact selected source weapon');
  }
  if (!Number.isInteger(params.selectedWeapon.rank) || params.selectedWeapon.rank < 1 || params.selectedWeapon.rank > 5) {
    throw new Error('Cooldown-cast window requires explicit R1 through R5');
  }
  if (!params.wielderId.trim() || !Number.isFinite(params.event.atSeconds) || params.event.atSeconds < 0
    || !Number.isFinite(params.cooldownReadyAtSeconds) || params.cooldownReadyAtSeconds < 0) {
    throw new Error('Cooldown-cast window requires explicit actor and finite non-negative event/cooldown times');
  }
  if (params.event.kind !== 'RESONANCE_SKILL_CAST' || params.event.actorId !== params.wielderId) return null;
  if (params.event.atSeconds < params.cooldownReadyAtSeconds) return null;
  const expiresAtSeconds = params.event.atSeconds + effect.durationSeconds!;
  const nextCooldownReadyAtSeconds = params.event.atSeconds + effect.triggerCooldownSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || !Number.isFinite(nextCooldownReadyAtSeconds)
    || expiresAtSeconds <= params.event.atSeconds || nextCooldownReadyAtSeconds <= params.event.atSeconds) {
    throw new Error('Cooldown-cast source window/cooldown expiration is not representable');
  }
  return Object.freeze({
    primitiveId: WEAPON_COOLDOWN_CAST_WINDOW_PRIMITIVE_ID,
    effectId: effect.effectId,
    weaponId: effect.weaponId,
    actorId: params.wielderId,
    statOrEffect: effect.statOrEffect,
    value: effect.rankValues[params.selectedWeapon.rank - 1],
    startedAtSeconds: params.event.atSeconds,
    expiresAtSeconds,
    nextCooldownReadyAtSeconds,
  });
}

export type ActiveWeaponCooldownCastWindow =
  NonNullable<ReturnType<typeof activateWeaponCooldownCastWindow>>;

export function isWeaponCooldownCastWindowActive(
  window: ActiveWeaponCooldownCastWindow,
  query: {
    readonly actorId: string;
    readonly atSeconds: number;
    readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
  },
) {
  if (!query.actorId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0
    || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(query.sameTimestampOrder)) {
    throw new Error('Cooldown-cast query requires exact actor/time/order');
  }
  return query.actorId === window.actorId
    && query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds
    && !(query.atSeconds === window.startedAtSeconds && query.sameTimestampOrder === 'BEFORE_TRIGGER');
}
