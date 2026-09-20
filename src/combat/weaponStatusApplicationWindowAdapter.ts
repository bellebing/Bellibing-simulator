import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';

export const WEAPON_STATUS_APPLICATION_WINDOW_PRIMITIVE_ID = 'weapon-explicit-status-application-self-window-v1';

const CONTRACT = {
  effectId: 'WA-AERO',
  weaponId: 'woodland-aria',
  statOrEffect: 'Aero DMG',
  trigger: 'Inflict Aero Erosion on target',
} as const;

function resolveContract(catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG) {
  const rows = catalog.filter(row => row.effectId === CONTRACT.effectId);
  if (rows.length !== 1) throw new Error('WA-AERO requires exactly one canonical source row');
  const effect = rows[0];
  if (effect.weaponId !== CONTRACT.weaponId || effect.statOrEffect !== CONTRACT.statOrEffect
    || effect.trigger !== CONTRACT.trigger || effect.effectType !== 'TRIGGERED'
    || effect.appliesTo !== 'SELF' || effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL'
    || effect.valueUnit !== 'DECIMAL_MULTIPLIER' || effect.durationSeconds === null
    || !Number.isFinite(effect.durationSeconds) || effect.durationSeconds <= 0
    || effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0
    || effect.triggerCooldownSeconds !== null || effect.conditions.length !== 0
    || effect.rankValues.length !== 5
    || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
    throw new Error('WA-AERO reviewed status-application source contract drift');
  }
  return effect;
}

/** Identity-only capability. Numeric truth remains in the canonical weapon row. */
export function listWeaponStatusApplicationWindowSupport() {
  resolveContract();
  return [{
    ...CONTRACT,
    primitiveId: WEAPON_STATUS_APPLICATION_WINDOW_PRIMITIVE_ID,
    scope: 'EXPLICIT_VERIFIED_AERO_EROSION_APPLICATION_ONLY' as const,
  }];
}

export interface QualifiedAeroErosionApplicationEvent {
  readonly kind: 'AERO_EROSION_APPLIED';
  readonly actorId: string;
  readonly targetId: string;
  readonly sourceFactId: string;
  readonly stacksApplied: number;
  readonly atSeconds: number;
  readonly sourceTriggerQualification: 'VERIFIED_AERO_EROSION_APPLICATION' | 'UNKNOWN';
}

/**
 * One explicit source-qualified status application creates one self window.
 * This primitive never derives the application from free text, target state or
 * the older event-indexed short-rotation adapter.
 */
export function activateWeaponStatusApplicationWindow(params: {
  readonly effectId: 'WA-AERO';
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly event: QualifiedAeroErosionApplicationEvent;
  readonly catalog?: readonly WeaponEffectData[];
}) {
  const effect = resolveContract(params.catalog ?? WEAPON_EFFECT_CATALOG);
  const { selectedWeapon, wielderId, event } = params;
  if (params.effectId !== effect.effectId || selectedWeapon.id !== effect.weaponId) {
    throw new Error('Status-application window requires exact Woodland Aria selection');
  }
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error('Weapon rank must be explicit R1 through R5');
  }
  if (![wielderId, event.actorId, event.targetId, event.sourceFactId].every(id => id.trim())
    || !Number.isInteger(event.stacksApplied) || event.stacksApplied <= 0
    || !Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error('Exact status source/target identity, positive applied stacks and finite time are required');
  }
  if (event.kind !== 'AERO_EROSION_APPLIED'
    || event.sourceTriggerQualification !== 'VERIFIED_AERO_EROSION_APPLICATION') {
    throw new Error('Explicit source-qualified Aero Erosion application is required');
  }
  if (event.actorId !== wielderId) return null;
  const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) {
    throw new Error('Weapon status-application window expiration is not representable');
  }
  return Object.freeze({
    primitiveId: WEAPON_STATUS_APPLICATION_WINDOW_PRIMITIVE_ID,
    effectId: effect.effectId,
    weaponId: effect.weaponId,
    actorId: wielderId,
    triggerTargetId: event.targetId,
    sourceFactId: event.sourceFactId,
    statOrEffect: effect.statOrEffect,
    value: effect.rankValues[selectedWeapon.rank - 1],
    valueUnit: effect.valueUnit,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds,
  });
}

export type ActiveWeaponStatusApplicationWindow =
  NonNullable<ReturnType<typeof activateWeaponStatusApplicationWindow>>;

export function isWeaponStatusApplicationWindowActive(
  window: ActiveWeaponStatusApplicationWindow,
  query: {
    readonly actorId: string;
    readonly atSeconds: number;
    readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
  },
) {
  if (!query.actorId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0
    || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(query.sameTimestampOrder)) {
    throw new Error('Status-window query requires exact actor/time/order');
  }
  return query.actorId === window.actorId
    && query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds
    && !(query.atSeconds === window.startedAtSeconds && query.sameTimestampOrder === 'BEFORE_TRIGGER');
}
