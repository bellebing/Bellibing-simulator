import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import type { WeaponEffectData } from '../effectDomain.ts';
import type { WeaponCastEvent, WeaponCastEventKind } from './weaponCastWindowAdapter.ts';

export const WEAPON_RESOURCE_CAST_REVIEW = {
  primitiveId: 'weapon-cast-flat-resource-v1',
  reviewedAt: '2026-09-08',
  pendingExecutionId: 'weapon:stellar-symphony:SSY-CONCERTO:resource-event-adapter',
  closesPendingExecutionIds: [] as readonly string[],
  requiresProfileEventTimeline: true,
} as const;

const CAST_TRIGGERS: Readonly<Record<string, WeaponCastEventKind>> = {
  'Cast Resonance Skill': 'RESONANCE_SKILL_CAST',
  'Cast Resonance Liberation': 'RESONANCE_LIBERATION_CAST',
};
type Resource = 'Concerto Energy' | 'Resonance Energy';

/** Only the reviewed flat SELF resource/cast/cooldown family; no healing or stacks. */
export function supportsWeaponResourceCast(effect: WeaponEffectData): boolean {
  return effect.effectType === 'INSTANT' && effect.valueUnit === 'FLAT_AMOUNT'
    && (effect.statOrEffect === 'Concerto Energy' || effect.statOrEffect === 'Resonance Energy')
    && (effect.mechanicsStatus === 'VERIFIED_CONDITIONAL' || effect.mechanicsStatus === 'VERIFIED_MODELED')
    && Object.hasOwn(CAST_TRIGGERS, effect.trigger)
    && effect.appliesTo === 'SELF' && effect.durationSeconds === null
    && effect.maxStacks === 1 && effect.stackIntervalSeconds === 0 && effect.conditions.length === 0
    && typeof effect.triggerCooldownSeconds === 'number'
    && Number.isFinite(effect.triggerCooldownSeconds) && effect.triggerCooldownSeconds > 0
    && effect.rankValues.length === 5 && effect.rankValues.every((value) => Number.isFinite(value) && value > 0);
}

export function listWeaponResourceCastSupport() {
  return WEAPON_EFFECT_CATALOG.filter(supportsWeaponResourceCast).map((effect) => ({
    effectId: effect.effectId,
    weaponId: effect.weaponId,
    primitiveId: WEAPON_RESOURCE_CAST_REVIEW.primitiveId,
    resource: effect.statOrEffect as Resource,
    triggerEvent: CAST_TRIGGERS[effect.trigger],
  })).sort((a, b) => a.effectId < b.effectId ? -1 : a.effectId > b.effectId ? 1 : 0);
}

export interface WeaponResourceCastState {
  readonly effectId: string;
  readonly weaponId: string;
  readonly rank: number;
  readonly actorId: string;
  readonly observedAtSeconds: number;
  readonly cooldownReadyAtSeconds: number;
}

function requireEffect(effectId: string): WeaponEffectData {
  const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === effectId);
  if (!effect || !supportsWeaponResourceCast(effect)) throw new Error(`${effectId}: unsupported resource-cast effect`);
  return effect;
}

function requireTime(value: number): void {
  if (!Number.isFinite(value) || value < 0) throw new Error('Resource cast requires known finite non-negative timestamps');
}

function validateState(state: WeaponResourceCastState): WeaponEffectData {
  const effect = requireEffect(state.effectId);
  if (state.weaponId !== effect.weaponId) throw new Error('Resource effect must belong to the selected weapon');
  if (!state.actorId.trim()) throw new Error('Resource effect requires an explicit wielder');
  if (!Number.isInteger(state.rank) || state.rank < 1 || state.rank > 5) throw new Error('Weapon rank must be 1 through 5');
  requireTime(state.observedAtSeconds);
  requireTime(state.cooldownReadyAtSeconds);
  return effect;
}

/** Caller must establish initial cooldown readiness; unknown is never assumed ready. */
export function createWeaponResourceCastState(input: {
  readonly effectId: string;
  readonly selectedWeapon: { readonly id: string; readonly rank: number };
  readonly wielderId: string;
  readonly observedAtSeconds: number;
  readonly cooldownReadyAtSeconds: number;
}): WeaponResourceCastState {
  const state = {
    effectId: input.effectId, weaponId: input.selectedWeapon.id, rank: input.selectedWeapon.rank,
    actorId: input.wielderId, observedAtSeconds: input.observedAtSeconds,
    cooldownReadyAtSeconds: input.cooldownReadyAtSeconds,
  };
  validateState(state);
  return Object.freeze(state);
}

/**
 * Advance one ordered source-proven cast and return the nominal flat resource
 * amount. Pool caps, resource spending, ER scaling and rotation timing are not
 * supplied here. Events during cooldown do not restart the cooldown.
 */
export function advanceWeaponResourceCast(state: WeaponResourceCastState, event: WeaponCastEvent) {
  const effect = validateState(state);
  requireTime(event.atSeconds);
  if (event.atSeconds < state.observedAtSeconds) throw new Error('Resource cast events must be ordered');
  if (!event.actorId.trim()) throw new Error('Resource cast requires an explicit event actor');
  if (!['INTRO_SKILL_CAST', 'RESONANCE_SKILL_CAST', 'RESONANCE_LIBERATION_CAST', 'ECHO_SKILL_CAST', 'BASIC_ATTACK_CAST'].includes(event.kind)) {
    throw new Error('Resource cast requires a resolved cast event kind');
  }
  const triggered = event.actorId === state.actorId && event.kind === CAST_TRIGGERS[effect.trigger]
    && event.atSeconds >= state.cooldownReadyAtSeconds;
  const readyAt = triggered ? event.atSeconds + effect.triggerCooldownSeconds! : state.cooldownReadyAtSeconds;
  if (!Number.isFinite(readyAt) || (triggered && readyAt <= event.atSeconds)) {
    throw new Error('Resource trigger cooldown expiration is not representable');
  }
  return {
    primitiveId: WEAPON_RESOURCE_CAST_REVIEW.primitiveId,
    effectId: effect.effectId,
    resource: effect.statOrEffect as Resource,
    triggered,
    nominalFlatAmount: triggered ? effect.rankValues[state.rank - 1] : 0,
    state: Object.freeze({ ...state, observedAtSeconds: event.atSeconds, cooldownReadyAtSeconds: readyAt }),
  };
}
