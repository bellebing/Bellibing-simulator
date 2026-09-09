import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import { SONATA_EFFECT_SOURCE_REVIEWS } from '../data/sonataEffectSourceReview.ts';
import type { SonataEffectModel } from '../sonataEffectDomain.ts';
import { isExplicitDamageWindowActive, type ExplicitDamageWindowQuery } from './qualifiedDamageEvent.ts';
import { ZANI_SPECTRO_FRAZZLE_TARGET_STATE_REVIEW_20260831 as ZANI_REVIEW,
  type ZaniEternalRadianceTargetView } from './zaniSpectroFrazzleTargetState.ts';

export const SONATA_TARGET_WINDOW_PRIMITIVE_ID = 'sonata-explicit-target-attack-window-v1';
const CONTRACTS = [
  { effectId: 'S11_5PC_SPECTRO', sonataSetId: 'sonata-11', pieces: 5, statOrEffect: 'Spectro DMG Bonus',
    trigger: 'Attack enemy with 10 Spectro Frazzle stacks', eventKind: 'ATTACK_ENEMY', condition: 'ETERNAL_RADIANCE_STACKS' },
  { effectId: 'S17_5PC_CR', sonataSetId: 'sonata-17', pieces: 5, statOrEffect: 'CRIT Rate',
    trigger: 'Hit target affected by Aero Erosion', eventKind: 'HIT_TARGET', condition: 'AERO_EROSION' },
  { effectId: 'S17_5PC_AERO', sonataSetId: 'sonata-17', pieces: 5, statOrEffect: 'Aero DMG Bonus',
    trigger: 'Hit target affected by Aero Erosion', eventKind: 'HIT_TARGET', condition: 'AERO_EROSION' },
] as const;

function resolveFact(effectId: string, catalog: readonly SonataEffectModel[]) {
  const contract = CONTRACTS.find((row) => row.effectId === effectId);
  if (!contract) throw new Error(`No reviewed target-attack contract for ${effectId}.`);
  const matches = catalog.filter((row) => row.effectId === effectId);
  const row = matches[0];
  const review = SONATA_EFFECT_SOURCE_REVIEWS.find((item) => item.sonataSetId === contract.sonataSetId && item.pieces === contract.pieces);
  if (matches.length !== 1 || review?.status !== 'MODELED' || row.sonataSetId !== contract.sonataSetId
    || row.pieces !== contract.pieces || row.statOrEffect !== contract.statOrEffect || row.trigger !== contract.trigger
    || row.effectType !== 'TRIGGERED' || row.valueMode !== 'FLAT' || row.appliesTo !== 'SELF'
    || row.mechanicsStatus !== 'VERIFIED_CONDITIONAL' || row.maxStacks !== undefined || row.capValue !== undefined
    || row.stackIntervalSeconds !== undefined || !Number.isFinite(row.value) || row.value < 0
    || row.durationSeconds === null || !Number.isFinite(row.durationSeconds) || row.durationSeconds <= 0) {
    throw new Error(`${effectId} reviewed target-attack source contract drift.`);
  }
  return { contract, row };
}

export function listSonataTargetWindowSupport() {
  return CONTRACTS.map(({ effectId }) => ({ ...resolveFact(effectId, SONATA_EFFECT_MODELS).contract,
    primitiveId: SONATA_TARGET_WINDOW_PRIMITIVE_ID, scope: 'EXPLICIT_PRE_ATTACK_TARGET_ONLY' as const }));
}

/** A timestamp alone cannot prove whether application/conversion happened before this attack. */
export type ExplicitPreAttackTarget = {
  readonly targetId: string;
  readonly observedAtSeconds: number;
  readonly observationOrder: 'BEFORE_TRIGGER' | 'UNKNOWN';
} & (
  | { readonly kind: 'SPECTRO_FRAZZLE'; readonly stacks: number }
  | { readonly kind: 'AERO_EROSION'; readonly affected: boolean }
  | { readonly kind: 'ZANI_ETERNAL_RADIANCE'; readonly view: ZaniEternalRadianceTargetView }
);

function targetConditionMet(condition: typeof CONTRACTS[number]['condition'], ownerId: string, target: ExplicitPreAttackTarget): boolean {
  if (condition === 'AERO_EROSION') {
    if (target.kind !== 'AERO_EROSION' || typeof target.affected !== 'boolean') throw new Error('Explicit Aero Erosion state is required.');
    return target.affected;
  }
  let stacks: number;
  if (target.kind === 'SPECTRO_FRAZZLE') {
    stacks = target.stacks;
  } else if (target.kind === 'ZANI_ETERNAL_RADIANCE') {
    const view = target.view;
    stacks = view.effectiveFrazzleStacksForEternalRadiance;
    if (ownerId !== 'zani' || view.targetId !== target.targetId || view.spectroFrazzleStacks !== 0
      || view.heliacalEmberStacks !== stacks || stacks > ZANI_REVIEW.heliacalEmberMaxStacks
      || view.attackTenStackConditionMet !== (stacks >= ZANI_REVIEW.eternalRadianceAttackThresholdStacks)
      || view.provesInflictSpectroFrazzleTrigger !== false) {
      throw new Error('Exact Zani Eternal Radiance stack view is required; equivalence cannot prove infliction.');
    }
  } else {
    throw new Error('Explicit Spectro Frazzle count or reviewed Zani equivalence is required.');
  }
  if (!Number.isSafeInteger(stacks) || stacks < 0) throw new Error('Exact non-negative target stack count is required.');
  return stacks >= ZANI_REVIEW.eternalRadianceAttackThresholdStacks;
}

/** One independent SELF window. No application, hit occurrence, refresh or same-hit benefit is inferred. */
export function activateSonataTargetWindow(params: {
  readonly effectId: string;
  readonly ownerId: string;
  readonly selectedSet: { readonly id: string; readonly pieces: number };
  readonly event: { readonly kind: 'ATTACK_ENEMY' | 'HIT_TARGET'; readonly actorId: string; readonly targetId: string;
    readonly sourceFactId: string; readonly atSeconds: number; readonly sourceTriggerQualification: 'VERIFIED_SOURCE_TRIGGER' | 'UNKNOWN' };
  readonly target: ExplicitPreAttackTarget;
  readonly catalog?: readonly SonataEffectModel[];
}) {
  const { ownerId, selectedSet, event, target } = params;
  const { contract, row } = resolveFact(params.effectId, params.catalog ?? SONATA_EFFECT_MODELS);
  if (selectedSet.id !== row.sonataSetId) throw new Error('Exact selected Sonata set is required.');
  if (!Number.isInteger(selectedSet.pieces) || selectedSet.pieces < 0 || selectedSet.pieces > 5) throw new Error('Explicit equipped piece count from 0 through 5 is required.');
  if (![ownerId, event.actorId, event.targetId, event.sourceFactId, target.targetId].every((id) => id.trim())) throw new Error('Exact owner, attack fact and target identities are required.');
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) throw new Error('Finite non-negative attack time is required.');
  if (event.sourceTriggerQualification !== 'VERIFIED_SOURCE_TRIGGER' || event.kind !== contract.eventKind) throw new Error('Exact source-qualified attack/hit trigger is required.');
  if (target.targetId !== event.targetId || target.observedAtSeconds !== event.atSeconds || target.observationOrder !== 'BEFORE_TRIGGER') {
    throw new Error('Target state must be observed for this target/time explicitly before the trigger.');
  }
  const conditionMet = targetConditionMet(contract.condition, ownerId, target);
  if (event.actorId !== ownerId || selectedSet.pieces < row.pieces || !conditionMet) return null;
  const expiresAtSeconds = event.atSeconds + row.durationSeconds!;
  if (!Number.isFinite(expiresAtSeconds) || expiresAtSeconds <= event.atSeconds) throw new Error('Target-attack window expiration is not representable.');
  return Object.freeze({ primitiveId: SONATA_TARGET_WINDOW_PRIMITIVE_ID, effectId: row.effectId,
    sonataSetId: row.sonataSetId, pieces: row.pieces, actorId: ownerId, statOrEffect: row.statOrEffect, value: row.value,
    startedAtSeconds: event.atSeconds, expiresAtSeconds });
}

export function isSonataTargetWindowActive(window: NonNullable<ReturnType<typeof activateSonataTargetWindow>>, query: ExplicitDamageWindowQuery): boolean {
  return isExplicitDamageWindowActive(window, query);
}
