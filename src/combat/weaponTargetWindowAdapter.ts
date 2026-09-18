import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import type { ExplicitPreAttackTarget } from './sonataTargetWindowAdapter.ts';

export const WEAPON_TARGET_WINDOW_PRIMITIVE_ID = 'weapon-explicit-target-hit-window-v1';

const CONTRACTS = [{
  effectId: 'WA-AERO-RES',
  weaponId: 'woodland-aria',
  statOrEffect: 'Aero RES Reduction',
  trigger: 'Hit target affected by Aero Erosion',
  condition: 'AERO_EROSION',
}] as const;

function resolveContract(effectId: string, catalog: readonly WeaponEffectData[]) {
  const contract = CONTRACTS.find(row => row.effectId === effectId);
  if (!contract) throw new Error(`No reviewed weapon target-window contract for ${effectId}`);
  const rows = catalog.filter(row => row.effectId === effectId);
  if (rows.length !== 1) throw new Error(`${effectId} requires exactly one canonical source row`);
  const effect = rows[0];
  if (effect.weaponId !== contract.weaponId || effect.statOrEffect !== contract.statOrEffect
    || effect.trigger !== contract.trigger || effect.effectType !== 'TRIGGERED'
    || effect.appliesTo !== 'TARGET' || effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL'
    || effect.valueUnit !== 'DECIMAL_MULTIPLIER' || effect.durationSeconds === null
    || !Number.isFinite(effect.durationSeconds) || effect.durationSeconds <= 0
    || effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0
    || effect.triggerCooldownSeconds !== null
    || JSON.stringify(effect.conditions) !== JSON.stringify(['Target is affected by Aero Erosion'])
    || effect.rankValues.length !== 5
    || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
    throw new Error(`${effectId} reviewed weapon target-window source contract drift`);
  }
  return { contract, effect };
}

export function listWeaponTargetWindowSupport() {
  return CONTRACTS.map(({ effectId }) => {
    const { contract } = resolveContract(effectId, WEAPON_EFFECT_CATALOG);
    return {
      ...contract,
      primitiveId: WEAPON_TARGET_WINDOW_PRIMITIVE_ID,
      scope: 'EXPLICIT_PRE_HIT_TARGET_STATE_ONLY' as const,
    };
  });
}

export interface WeaponTargetHitEvent {
  readonly kind: 'HIT_TARGET';
  readonly actorId: string;
  readonly targetId: string;
  readonly sourceFactId: string;
  readonly atSeconds: number;
  readonly sourceTriggerQualification: 'VERIFIED_SOURCE_TRIGGER' | 'UNKNOWN';
}

/**
 * One independent target debuff window. No target state, hit occurrence,
 * refresh, same-hit benefit or profile uptime is inferred.
 */
export function activateWeaponTargetWindow(params: {
  readonly effectId: string;
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly event: WeaponTargetHitEvent;
  readonly target: ExplicitPreAttackTarget;
  readonly catalog?: readonly WeaponEffectData[];
}) {
  const { selectedWeapon, wielderId, event, target } = params;
  const { effect } = resolveContract(params.effectId, params.catalog ?? WEAPON_EFFECT_CATALOG);
  if (selectedWeapon.id !== effect.weaponId) throw new Error('Target window requires the exact selected weapon');
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error('Weapon rank must be explicit R1 through R5');
  }
  if (![wielderId, event.actorId, event.targetId, event.sourceFactId, target.targetId].every(id => id.trim())) {
    throw new Error('Exact wielder, source fact and target identities are required');
  }
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error('Finite non-negative target-hit time is required');
  }
  if (event.kind !== 'HIT_TARGET' || event.sourceTriggerQualification !== 'VERIFIED_SOURCE_TRIGGER') {
    throw new Error('Exact source-qualified target-hit trigger is required');
  }
  if (target.kind !== 'AERO_EROSION' || typeof target.affected !== 'boolean') {
    throw new Error('Explicit Aero Erosion target state is required');
  }
  if (target.targetId !== event.targetId || target.observedAtSeconds !== event.atSeconds
    || target.observationOrder !== 'BEFORE_TRIGGER') {
    throw new Error('Target state must be observed for the exact target/time before the trigger');
  }
  if (event.actorId !== wielderId || !target.affected) return null;
  const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) {
    throw new Error('Weapon target window expiration is not representable');
  }
  return Object.freeze({
    primitiveId: WEAPON_TARGET_WINDOW_PRIMITIVE_ID,
    effectId: effect.effectId,
    weaponId: effect.weaponId,
    actorId: wielderId,
    targetId: event.targetId,
    statOrEffect: effect.statOrEffect,
    value: effect.rankValues[selectedWeapon.rank - 1],
    valueUnit: effect.valueUnit,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds,
  });
}

export type ActiveWeaponTargetWindow = NonNullable<ReturnType<typeof activateWeaponTargetWindow>>;

export function isWeaponTargetWindowActive(window: ActiveWeaponTargetWindow, query: {
  readonly actorId: string;
  readonly targetId: string;
  readonly atSeconds: number;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
}) {
  if (!query.actorId.trim() || !query.targetId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0
    || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(query.sameTimestampOrder)) {
    throw new Error('Target-window query requires exact actor/target/time/order');
  }
  return query.actorId === window.actorId && query.targetId === window.targetId
    && query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds
    && !(query.atSeconds === window.startedAtSeconds && query.sameTimestampOrder === 'BEFORE_TRIGGER');
}
