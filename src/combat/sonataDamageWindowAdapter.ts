import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import { SONATA_EFFECT_SOURCE_REVIEWS } from '../data/sonataEffectSourceReview.ts';
import type { SonataEffectModel } from '../sonataEffectDomain.ts';
import { DAMAGE_SOURCE_TRIGGERS, matchesQualifiedDamageTrigger, isExplicitDamageWindowActive,
  type QualifiedDamageEvent, type ExplicitDamageWindowQuery } from './qualifiedDamageEvent.ts';

export const SONATA_DAMAGE_WINDOW_PRIMITIVE_ID = 'sonata-damage-timed-self-window-v1';

// Exact reviewed canonical identities and event scopes; no copied source values.
const CONTRACTS = [
  { effectId: 'S22_3PC_HEAVY_CR', sonataSetId: 'sonata-22', pieces: 3, statOrEffect: 'Heavy Attack CRIT Rate', damageClass: 'ECHO' },
  { effectId: 'S22_3PC_ECHO_CR', sonataSetId: 'sonata-22', pieces: 3, statOrEffect: 'Echo Skill CRIT Rate', damageClass: 'HEAVY' },
  { effectId: 'S29_5PC_ECHO_CR', sonataSetId: 'sonata-29', pieces: 5, statOrEffect: 'Echo Skill CRIT Rate', damageClass: 'ECHO' },
  { effectId: 'S29_5PC_AERO', sonataSetId: 'sonata-29', pieces: 5, statOrEffect: 'Aero DMG Bonus', damageClass: 'ECHO' },
] as const;

function resolveContract(effectId: string, catalog: readonly SonataEffectModel[]) {
  const contract = CONTRACTS.find((row) => row.effectId === effectId);
  if (!contract) throw new Error(`No reviewed Sonata damage-window contract for ${effectId}.`);
  const matches = catalog.filter((row) => row.effectId === effectId);
  if (matches.length !== 1) throw new Error(`${effectId} requires exactly one source row.`);
  const row = matches[0];
  const review = SONATA_EFFECT_SOURCE_REVIEWS.find((review) => review.sonataSetId === contract.sonataSetId && review.pieces === contract.pieces);
  if (review?.status !== 'MODELED' || row.sonataSetId !== contract.sonataSetId || row.pieces !== contract.pieces
    || row.statOrEffect !== contract.statOrEffect || row.trigger !== DAMAGE_SOURCE_TRIGGERS[contract.damageClass]
    || row.effectType !== 'TRIGGERED' || row.valueMode !== 'FLAT' || row.appliesTo !== 'SELF'
    || row.mechanicsStatus !== 'VERIFIED_CONDITIONAL' || row.maxStacks !== undefined
    || row.capValue !== undefined || row.stackIntervalSeconds !== undefined
    || !Number.isFinite(row.value) || row.value < 0
    || row.durationSeconds === null || !Number.isFinite(row.durationSeconds) || row.durationSeconds <= 0) {
    throw new Error(`${effectId} reviewed Sonata damage-window source contract drift.`);
  }
  return { contract, effect: row };
}

export function listSonataDamageWindowSupport() {
  return CONTRACTS.map(({ effectId }) => ({
    ...resolveContract(effectId, SONATA_EFFECT_MODELS).contract,
    primitiveId: SONATA_DAMAGE_WINDOW_PRIMITIVE_ID, scope: 'EXPLICIT_DAMAGE_EVENT_ONLY' as const,
  })).sort((a, b) => a.effectId < b.effectId ? -1 : a.effectId > b.effectId ? 1 : 0);
}

/** One independent source window. Selected piece count is actual equipped count, never defaulted. */
export function activateSonataDamageWindow(params: {
  readonly effectId: string;
  readonly ownerId: string;
  readonly selectedSet: { readonly id: string; readonly pieces: number };
  readonly event: QualifiedDamageEvent;
  readonly catalog?: readonly SonataEffectModel[];
}) {
  const { effectId, ownerId, selectedSet, event, catalog = SONATA_EFFECT_MODELS } = params;
  const { contract, effect } = resolveContract(effectId, catalog);
  if (selectedSet.id !== effect.sonataSetId) throw new Error('Damage window requires the exact selected Sonata set.');
  if (!Number.isInteger(selectedSet.pieces) || selectedSet.pieces < 0 || selectedSet.pieces > 5) {
    throw new Error('An explicit equipped Sonata piece count from 0 through 5 is required.');
  }
  const matchedEvent = matchesQualifiedDamageTrigger(ownerId, contract.damageClass, event);
  if (selectedSet.pieces < effect.pieces || !matchedEvent) return null;
  const expiresAtSeconds = event.atSeconds + effect.durationSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) throw new Error('Sonata damage window expiration is not representable.');
  return Object.freeze({
    primitiveId: SONATA_DAMAGE_WINDOW_PRIMITIVE_ID, effectId, sonataSetId: effect.sonataSetId,
    pieces: effect.pieces, actorId: ownerId, statOrEffect: effect.statOrEffect, value: effect.value,
    startedAtSeconds: event.atSeconds, expiresAtSeconds,
  });
}

export type ActiveSonataDamageWindow = NonNullable<ReturnType<typeof activateSonataDamageWindow>>;

export function isSonataDamageWindowActive(window: ActiveSonataDamageWindow, query: ExplicitDamageWindowQuery): boolean {
  return isExplicitDamageWindowActive(window, query);
}
