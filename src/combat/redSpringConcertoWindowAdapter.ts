import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import type { ResonatorSwitchOutEvent } from './incomingTransferState.ts';

export const RED_SPRING_CONCERTO_WINDOW_PRIMITIVE_ID =
  'red-spring-explicit-concerto-consume-basic-window-v1';

const CONTRACT = {
  effectId: 'RS-CONCERTO-BASIC',
  weaponId: 'red-spring',
  statOrEffect: 'Basic Attack DMG',
  trigger: 'Consume Concerto Energy',
  durationSeconds: 10,
  triggerCooldownSeconds: 1,
  condition: 'Effect ends when wielder switches off field',
} as const;

function resolveContract(catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG) {
  const rows = catalog.filter(row => row.effectId === CONTRACT.effectId);
  if (rows.length !== 1) throw new Error('RS-CONCERTO-BASIC requires exactly one canonical source row');
  const effect = rows[0];
  if (effect.weaponId !== CONTRACT.weaponId || effect.statOrEffect !== CONTRACT.statOrEffect
    || effect.trigger !== CONTRACT.trigger || effect.effectType !== 'TRIGGERED'
    || effect.appliesTo !== 'SELF' || effect.mechanicsStatus !== 'VERIFIED_CONDITIONAL'
    || effect.valueUnit !== 'DECIMAL_MULTIPLIER'
    || effect.durationSeconds !== CONTRACT.durationSeconds
    || effect.triggerCooldownSeconds !== CONTRACT.triggerCooldownSeconds
    || effect.maxStacks !== 1 || effect.stackIntervalSeconds !== 0
    || JSON.stringify(effect.conditions) !== JSON.stringify([CONTRACT.condition])
    || effect.rankValues.length !== 5
    || effect.rankValues.some(value => !Number.isFinite(value) || value <= 0 || value >= 1)) {
    throw new Error('RS-CONCERTO-BASIC reviewed Red Spring source contract drift');
  }
  return effect;
}

export function validateRedSpringConcertoWindowContract(
  catalog: readonly WeaponEffectData[] = WEAPON_EFFECT_CATALOG,
) {
  try {
    resolveContract(catalog);
    return [] as string[];
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
}

/** Identity/scope only. Rank value, duration and cooldown remain canonical WeaponEffectData. */
export function listRedSpringConcertoWindowSupport() {
  const effect = resolveContract();
  return [{
    effectId: effect.effectId,
    weaponId: effect.weaponId,
    statOrEffect: effect.statOrEffect,
    primitiveId: RED_SPRING_CONCERTO_WINDOW_PRIMITIVE_ID,
    selectedHitScope: 'BASIC_DIRECT_HIT_ONLY' as const,
    occurrencePolicy: 'CALLER_QUALIFIED_CONCERTO_CONSUMPTION_ONLY' as const,
    lifecyclePolicy: 'ENDS_ON_WIELDER_SWITCH_OUT' as const,
  }];
}

export interface QualifiedConcertoConsumptionEvent {
  readonly kind: 'CONCERTO_ENERGY_CONSUMED';
  readonly actorId: string;
  readonly sourceFactId: string;
  readonly atSeconds: number;
  readonly sourceTriggerQualification: 'VERIFIED_RED_SPRING_CONCERTO_CONSUMPTION' | 'UNKNOWN';
}

export function activateRedSpringConcertoWindow(params: {
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly event: QualifiedConcertoConsumptionEvent;
  readonly cooldownReadyAtSeconds: number;
  readonly catalog?: readonly WeaponEffectData[];
}) {
  const effect = resolveContract(params.catalog ?? WEAPON_EFFECT_CATALOG);
  const { selectedWeapon, wielderId, event, cooldownReadyAtSeconds } = params;
  if (selectedWeapon.id !== effect.weaponId) throw new Error('Red Spring Concerto window requires exact Red Spring selection');
  if (!Number.isInteger(selectedWeapon.rank) || selectedWeapon.rank < 1 || selectedWeapon.rank > 5) {
    throw new Error('Red Spring rank must be explicit R1 through R5');
  }
  if (![wielderId, event.actorId, event.sourceFactId].every(id => id.trim())
    || !Number.isFinite(event.atSeconds) || event.atSeconds < 0
    || !Number.isFinite(cooldownReadyAtSeconds) || cooldownReadyAtSeconds < 0) {
    throw new Error('Exact Concerto consumer/source fact, event time and cooldown-ready time are required');
  }
  if (event.kind !== 'CONCERTO_ENERGY_CONSUMED'
    || event.sourceTriggerQualification !== 'VERIFIED_RED_SPRING_CONCERTO_CONSUMPTION') {
    throw new Error('Explicit source-qualified Concerto Energy consumption is required');
  }
  if (event.actorId !== wielderId) return null;
  if (event.atSeconds < cooldownReadyAtSeconds) return null;
  const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
  const nextCooldownReadyAtSeconds = event.atSeconds + effect.triggerCooldownSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds
    || !Number.isFinite(nextCooldownReadyAtSeconds) || nextCooldownReadyAtSeconds <= event.atSeconds) {
    throw new Error('Red Spring window/cooldown expiration is not representable');
  }
  return Object.freeze({
    primitiveId: RED_SPRING_CONCERTO_WINDOW_PRIMITIVE_ID,
    effectId: effect.effectId,
    weaponId: effect.weaponId,
    actorId: wielderId,
    sourceFactId: event.sourceFactId,
    statOrEffect: effect.statOrEffect,
    value: effect.rankValues[selectedWeapon.rank - 1],
    valueUnit: effect.valueUnit,
    startedAtSeconds: event.atSeconds,
    expiresAtSeconds,
    nextCooldownReadyAtSeconds,
    endsOnWielderSwitchOut: true as const,
  });
}

export type ActiveRedSpringConcertoWindow =
  NonNullable<ReturnType<typeof activateRedSpringConcertoWindow>>;

function validateSwitchOutEvent(event: ResonatorSwitchOutEvent) {
  if (event.kind !== 'RESONATOR_SWITCH_OUT' || !event.actorId.trim()
    || !Number.isFinite(event.atSeconds) || event.atSeconds < 0) {
    throw new Error('Red Spring switch-out history requires exact Resonator switch-out events');
  }
}

export function isRedSpringConcertoWindowActive(
  window: ActiveRedSpringConcertoWindow,
  query: {
    readonly actorId: string;
    readonly atSeconds: number;
    readonly sameTimestampTriggerOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
    readonly sameTimestampSwitchOutOrder: 'NOT_TIED' | 'BEFORE_QUERY' | 'AFTER_QUERY';
    readonly switchOutEvents: readonly ResonatorSwitchOutEvent[];
  },
) {
  if (!query.actorId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0
    || !['BEFORE_TRIGGER', 'AFTER_TRIGGER'].includes(query.sameTimestampTriggerOrder)
    || !['NOT_TIED', 'BEFORE_QUERY', 'AFTER_QUERY'].includes(query.sameTimestampSwitchOutOrder)
    || !Array.isArray(query.switchOutEvents)) {
    throw new Error('Red Spring window query requires exact actor/time/order and switch-out history');
  }
  query.switchOutEvents.forEach(validateSwitchOutEvent);
  const tiedSwitch = query.switchOutEvents.some(event =>
    event.actorId === window.actorId && event.atSeconds === query.atSeconds);
  if (tiedSwitch !== (query.sameTimestampSwitchOutOrder !== 'NOT_TIED')) {
    throw new Error('Red Spring same-timestamp switch-out/query ordering must match supplied history');
  }
  if (query.actorId !== window.actorId
    || query.atSeconds < window.startedAtSeconds || query.atSeconds >= window.expiresAtSeconds
    || (query.atSeconds === window.startedAtSeconds && query.sameTimestampTriggerOrder === 'BEFORE_TRIGGER')) {
    return false;
  }
  const endedBeforeQuery = query.switchOutEvents.some(event =>
    event.actorId === window.actorId
    && event.atSeconds >= window.startedAtSeconds
    && (event.atSeconds < query.atSeconds
      || (event.atSeconds === query.atSeconds && query.sameTimestampSwitchOutOrder === 'BEFORE_QUERY')));
  return !endedBeforeQuery;
}
