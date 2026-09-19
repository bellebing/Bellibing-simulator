import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';

export const EVERBRIGHT_POLESTAR_STATUS_WINDOW_PRIMITIVE_ID =
  'everbright-polestar-explicit-negative-status-liberation-defense-window-v1';

const CONTRACT = {
  effectId: 'EP-LIB-DEF',
  weaponId: 'everbright-polestar',
  statOrEffect: 'Resonance Liberation DMG DEF Ignore',
  trigger: 'Inflict Tune Rupture - Shifting or Fusion Burst',
  durationSeconds: 8,
  selectedHitScope: 'LIBERATION_DIRECT_HIT_ONLY',
} as const;

function resolveContract(catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG) {
  const rows = catalog.filter(row => row.effectId === CONTRACT.effectId);
  if (rows.length !== 1) throw new Error('EP-LIB-DEF requires exactly one canonical source row');
  const effect = rows[0];
  if (effect.weaponId !== CONTRACT.weaponId || effect.statOrEffect !== CONTRACT.statOrEffect
    || effect.trigger !== CONTRACT.trigger || effect.effectType !== 'TRIGGERED'
    || effect.appliesTo !== 'SELF' || effect.mechanicsStatus !== 'VERIFIED_MODELED'
    || effect.valueUnit !== 'DECIMAL_MULTIPLIER'
    || effect.durationSeconds !== CONTRACT.durationSeconds
    || effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0
    || effect.triggerCooldownSeconds !== null
    || JSON.stringify(effect.conditions) !== JSON.stringify(['Damage is Resonance Liberation DMG'])
    || effect.rankValues.length !== 5
    || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
    throw new Error('EP-LIB-DEF reviewed Everbright Polestar source contract drift');
  }
  return effect;
}

export function validateEverbrightPolestarStatusWindowContract(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
) {
  try {
    resolveContract(catalog);
    return [] as readonly string[];
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)] as readonly string[];
  }
}

/** Identity/scope only. Numeric rank truth remains canonical WeaponEffectData. */
export function listEverbrightPolestarStatusWindowSupport() {
  resolveContract();
  return [{
    ...CONTRACT,
    primitiveId: EVERBRIGHT_POLESTAR_STATUS_WINDOW_PRIMITIVE_ID,
    occurrencePolicy: 'CALLER_QUALIFIED_TIMESTAMP_ONLY' as const,
    triggerStatusKinds: ['FUSION_BURST_APPLIED', 'TUNE_RUPTURE_SHIFTING_APPLIED'] as const,
    siblingEffectOutsideThisPrimitive: 'EP-LIB-FUSION-RES' as const,
    siblingReason: 'RES_IGNORE_ARITHMETIC_NOT_REVIEWED' as const,
  }];
}

export interface QualifiedEverbrightPolestarStatusApplicationEvent {
  readonly kind: 'FUSION_BURST_APPLIED' | 'TUNE_RUPTURE_SHIFTING_APPLIED';
  readonly actorId: string;
  readonly targetId: string;
  readonly sourceFactId: string;
  readonly atSeconds: number;
  readonly sourceTriggerQualification: 'VERIFIED_EVERBRIGHT_POLESTAR_STATUS_APPLICATION' | 'UNKNOWN';
}

/**
 * One caller-qualified negative-status application creates the canonical
 * eight-second Liberation DEF-ignore window. No mode, rotation occurrence,
 * refresh, target persistence or sibling RES-ignore arithmetic is inferred.
 */
export function activateEverbrightPolestarStatusWindow(params: {
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly event: QualifiedEverbrightPolestarStatusApplicationEvent;
  readonly catalog?: readonly WeaponEffectData[];
}) {
  const effect = resolveContract(params.catalog ?? WEAPON_EFFECT_CATALOG);
  const { selectedWeapon, wielderId, event } = params;
  if (selectedWeapon.id !== effect.weaponId) {
    throw new Error('Everbright Polestar status window requires exact Everbright Polestar selection');
  }
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error('Everbright Polestar rank must be explicit R1 through R5');
  }
  if (![wielderId, event.actorId, event.targetId, event.sourceFactId].every(id => id.trim())
    || !Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error('Exact Everbright status source/target/fact and finite non-negative time are required');
  }
  if (!['FUSION_BURST_APPLIED', 'TUNE_RUPTURE_SHIFTING_APPLIED'].includes(event.kind)
    || event.sourceTriggerQualification !== 'VERIFIED_EVERBRIGHT_POLESTAR_STATUS_APPLICATION') {
    throw new Error('Explicit source-qualified Fusion Burst or Tune Rupture - Shifting application is required');
  }
  if (event.actorId !== wielderId) return null;
  const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) {
    throw new Error('Everbright Polestar window expiration is not representable');
  }
  return Object.freeze({
    primitiveId: EVERBRIGHT_POLESTAR_STATUS_WINDOW_PRIMITIVE_ID,
    effectId: CONTRACT.effectId,
    weaponId: effect.weaponId,
    actorId: wielderId,
    triggerTargetId: event.targetId,
    sourceFactId: event.sourceFactId,
    triggerStatusKind: event.kind,
    statOrEffect: effect.statOrEffect,
    value: effect.rankValues[selectedWeapon.rank - 1],
    valueUnit: effect.valueUnit,
    selectedHitScope: CONTRACT.selectedHitScope,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds,
  });
}

export type ActiveEverbrightPolestarStatusWindow =
  NonNullable<ReturnType<typeof activateEverbrightPolestarStatusWindow>>;

export function isEverbrightPolestarStatusWindowActive(
  window: ActiveEverbrightPolestarStatusWindow,
  query: {
    readonly actorId: string;
    readonly atSeconds: number;
    readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
  },
) {
  if (!query.actorId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0
    || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(query.sameTimestampOrder)) {
    throw new Error('Everbright Polestar window query requires exact actor/time/order');
  }
  return query.actorId === window.actorId
    && query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds
    && !(query.atSeconds === window.startedAtSeconds && query.sameTimestampOrder === 'BEFORE_TRIGGER');
}
