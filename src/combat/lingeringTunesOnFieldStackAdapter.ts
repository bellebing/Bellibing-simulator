import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import type { SonataEffectModel } from '../sonataEffectDomain.ts';

export interface LingeringTunesOnFieldContract {
  readonly pendingExecutionId: 'sonata:sonata-9:S09_5PC_FIELD_ATK:on-field-stack-state-adapter';
  readonly effectId: 'S09_5PC_FIELD_ATK';
  readonly outroEffectId: 'S09_5PC_OUTRO_DMG';
  readonly expectedSonataSetId: 'sonata-9';
  readonly expectedPieces: 5;
  readonly expectedStatOrEffect: 'ATK%';
  readonly expectedValuePerStack: 0.05;
  readonly expectedStackIntervalSeconds: 1.5;
  readonly expectedMaxStacks: 4;
  readonly expectedOutroStatOrEffect: 'Outro Skill DMG Bonus';
  readonly expectedOutroValue: 0.60;
}

export interface LingeringTunesKnownOnFieldState {
  readonly adapterId: 'lingering-tunes-known-on-field-stack-v1';
  readonly effectId: 'S09_5PC_FIELD_ATK';
  readonly ownerId: string;
  readonly stackCount: number;
  readonly secondsTowardNextStack: number;
}

export interface LingeringTunesKnownOnFieldBonus {
  readonly effectId: 'S09_5PC_FIELD_ATK';
  readonly statOrEffect: 'ATK%';
  readonly stackCount: number;
  readonly valuePerStack: 0.05;
  readonly totalValue: number;
}

export interface LingeringTunesOutroBonus {
  readonly effectId: 'S09_5PC_OUTRO_DMG';
  readonly statOrEffect: 'Outro Skill DMG Bonus';
  readonly value: 0.60;
}

export interface LingeringTunesPostFieldBoundary {
  readonly status: 'SOURCE_LIFECYCLE_UNRESOLVED';
  readonly previousKnownState: LingeringTunesKnownOnFieldState;
  readonly unresolvedSemantics: readonly string[];
}

export const LINGERING_TUNES_ON_FIELD_CONTRACT: LingeringTunesOnFieldContract = {
  pendingExecutionId: 'sonata:sonata-9:S09_5PC_FIELD_ATK:on-field-stack-state-adapter',
  effectId: 'S09_5PC_FIELD_ATK',
  outroEffectId: 'S09_5PC_OUTRO_DMG',
  expectedSonataSetId: 'sonata-9',
  expectedPieces: 5,
  expectedStatOrEffect: 'ATK%',
  expectedValuePerStack: 0.05,
  expectedStackIntervalSeconds: 1.5,
  expectedMaxStacks: 4,
  expectedOutroStatOrEffect: 'Outro Skill DMG Bonus',
  expectedOutroValue: 0.60,
};

/**
 * Semantic split for Lingering Tunes 5-piece.
 *
 * Source truth is sufficient to execute stack cadence inside one explicitly
 * continuous on-field segment when the caller already knows the entering stack
 * count and cadence phase. The source does not establish what happens to those
 * stacks/cadence after leaving the field, so this primitive deliberately cannot
 * create or infer a post-field/re-entry state.
 */
export const LINGERING_TUNES_ON_FIELD_SEMANTIC_REVIEW = {
  status: 'BLOCKED_SOURCE_SEMANTICS',
  blockerId: 'BUG-017',
  reviewedAt: '2026-09-01',
  primitiveId: 'lingering-tunes-known-on-field-stack-v1',
  pendingExecutionId: LINGERING_TUNES_ON_FIELD_CONTRACT.pendingExecutionId,
  actionKey: 'sonata:lingering-tunes-on-field-stack-lifecycle',
  sourceEstablished: [
    'Lingering Tunes 5-piece grants 5% ATK every 1.5 seconds while the wearer is on field, up to 4 stacks.',
    'The 5-piece Outro Skill DMG Bonus is a separate unconditional SELF effect worth 60%.',
  ],
  unresolvedSemantics: [
    'The current source does not establish stack lifetime after leaving the field.',
    'The current source does not establish whether leaving/re-entering resets, preserves, expires, or refreshes stacks.',
    'The current source does not establish whether cadence phase resets or carries across an off-field transition.',
  ],
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'The primitive advances only a caller-supplied known continuous on-field state; it never assumes zero stacks on entry or full stacks during the Burst Combo.',
    'Crossing off field returns an explicit unresolved lifecycle boundary instead of manufacturing the next state.',
    'The existing pending execution ID remains open and Lingyang remains SOURCE_SEQUENCE_ONLY until the lifecycle and profile timeline are independently closed.',
  ],
} as const;

function uniqueEffectById(catalog: readonly SonataEffectModel[], effectId: string): SonataEffectModel | null {
  const matches = catalog.filter((effect) => effect.effectId === effectId);
  if (matches.length === 0) return null;
  if (matches.length > 1) throw new Error(`Duplicate Sonata effect id ${effectId}`);
  return matches[0];
}

export function validateLingeringTunesOnFieldContract(
  catalog: readonly SonataEffectModel[] = SONATA_EFFECT_MODELS,
): readonly string[] {
  const issues: string[] = [];
  const field = uniqueEffectById(catalog, LINGERING_TUNES_ON_FIELD_CONTRACT.effectId);
  const outro = uniqueEffectById(catalog, LINGERING_TUNES_ON_FIELD_CONTRACT.outroEffectId);

  if (!field) {
    issues.push(`missing Sonata effect ${LINGERING_TUNES_ON_FIELD_CONTRACT.effectId}`);
  } else {
    if (field.sonataSetId !== LINGERING_TUNES_ON_FIELD_CONTRACT.expectedSonataSetId) issues.push('Lingering Tunes field Sonata set drift');
    if (field.pieces !== LINGERING_TUNES_ON_FIELD_CONTRACT.expectedPieces) issues.push('Lingering Tunes field piece-count drift');
    if (field.statOrEffect !== LINGERING_TUNES_ON_FIELD_CONTRACT.expectedStatOrEffect) issues.push('Lingering Tunes field stat drift');
    if (field.value !== LINGERING_TUNES_ON_FIELD_CONTRACT.expectedValuePerStack) issues.push('Lingering Tunes field value drift');
    if (field.valueMode !== 'PER_STACK') issues.push('Lingering Tunes field value mode must remain PER_STACK');
    if (field.effectType !== 'STACKING') issues.push('Lingering Tunes field effect type must remain STACKING');
    if (field.trigger !== 'While on field') issues.push('Lingering Tunes field trigger drift');
    if (field.durationSeconds !== null) issues.push('Lingering Tunes field duration must remain source-unresolved/null');
    if (field.stackIntervalSeconds !== LINGERING_TUNES_ON_FIELD_CONTRACT.expectedStackIntervalSeconds) issues.push('Lingering Tunes field cadence drift');
    if (field.maxStacks !== LINGERING_TUNES_ON_FIELD_CONTRACT.expectedMaxStacks) issues.push('Lingering Tunes field max-stack drift');
    if (field.appliesTo !== 'SELF') issues.push('Lingering Tunes field scope must remain SELF');
    if (field.mechanicsStatus !== 'VERIFIED_CONDITIONAL') issues.push('Lingering Tunes field mechanics status must remain VERIFIED_CONDITIONAL');
  }

  if (!outro) {
    issues.push(`missing Sonata effect ${LINGERING_TUNES_ON_FIELD_CONTRACT.outroEffectId}`);
  } else {
    if (outro.sonataSetId !== LINGERING_TUNES_ON_FIELD_CONTRACT.expectedSonataSetId) issues.push('Lingering Tunes Outro Sonata set drift');
    if (outro.pieces !== LINGERING_TUNES_ON_FIELD_CONTRACT.expectedPieces) issues.push('Lingering Tunes Outro piece-count drift');
    if (outro.statOrEffect !== LINGERING_TUNES_ON_FIELD_CONTRACT.expectedOutroStatOrEffect) issues.push('Lingering Tunes Outro stat drift');
    if (outro.value !== LINGERING_TUNES_ON_FIELD_CONTRACT.expectedOutroValue) issues.push('Lingering Tunes Outro value drift');
    if (outro.valueMode !== 'FLAT') issues.push('Lingering Tunes Outro value mode must remain FLAT');
    if (outro.effectType !== 'PERMANENT') issues.push('Lingering Tunes Outro effect type must remain PERMANENT');
    if (outro.appliesTo !== 'SELF') issues.push('Lingering Tunes Outro scope must remain SELF');
    if (outro.mechanicsStatus !== 'VERIFIED_MODELED') issues.push('Lingering Tunes Outro mechanics status must remain VERIFIED_MODELED');
  }

  if (LINGERING_TUNES_ON_FIELD_SEMANTIC_REVIEW.unresolvedSemantics.length === 0) {
    issues.push('Lingering Tunes on-field review must retain explicit unresolved lifecycle semantics');
  }
  return issues;
}

const CONTRACT_ISSUES = validateLingeringTunesOnFieldContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Lingering Tunes on-field contract: ${CONTRACT_ISSUES.join('; ')}`);
}

export function createLingeringTunesKnownOnFieldState(params: {
  readonly ownerId: string;
  readonly stackCount: number;
  readonly secondsTowardNextStack: number;
}): LingeringTunesKnownOnFieldState {
  const { ownerId, stackCount, secondsTowardNextStack } = params;
  if (!ownerId.trim()) throw new Error('Lingering Tunes ownerId must be non-blank');
  if (!Number.isInteger(stackCount) || stackCount < 0 || stackCount > LINGERING_TUNES_ON_FIELD_CONTRACT.expectedMaxStacks) {
    throw new Error(`Lingering Tunes stackCount must be an integer from 0 through ${LINGERING_TUNES_ON_FIELD_CONTRACT.expectedMaxStacks}: ${stackCount}`);
  }
  if (!Number.isFinite(secondsTowardNextStack) || secondsTowardNextStack < 0 || secondsTowardNextStack >= LINGERING_TUNES_ON_FIELD_CONTRACT.expectedStackIntervalSeconds) {
    throw new Error(`Lingering Tunes cadence phase must be finite and within [0, ${LINGERING_TUNES_ON_FIELD_CONTRACT.expectedStackIntervalSeconds}): ${secondsTowardNextStack}`);
  }
  if (stackCount === LINGERING_TUNES_ON_FIELD_CONTRACT.expectedMaxStacks && secondsTowardNextStack !== 0) {
    throw new Error('Lingering Tunes capped state must use cadence phase 0 because further cadence is not executable/relevant');
  }
  return {
    adapterId: 'lingering-tunes-known-on-field-stack-v1',
    effectId: 'S09_5PC_FIELD_ATK',
    ownerId,
    stackCount,
    secondsTowardNextStack,
  };
}

export function advanceLingeringTunesKnownOnField(
  state: LingeringTunesKnownOnFieldState,
  elapsedOnFieldSeconds: number,
): LingeringTunesKnownOnFieldState {
  if (!Number.isFinite(elapsedOnFieldSeconds) || elapsedOnFieldSeconds < 0) {
    throw new Error(`Lingering Tunes on-field elapsed time must be a finite non-negative number: ${elapsedOnFieldSeconds}`);
  }
  if (state.stackCount === LINGERING_TUNES_ON_FIELD_CONTRACT.expectedMaxStacks || elapsedOnFieldSeconds === 0) return state;

  const interval = LINGERING_TUNES_ON_FIELD_CONTRACT.expectedStackIntervalSeconds;
  const elapsedWithPhase = state.secondsTowardNextStack + elapsedOnFieldSeconds;
  const cadenceAwards = Math.floor(elapsedWithPhase / interval);
  const nextStackCount = Math.min(
    LINGERING_TUNES_ON_FIELD_CONTRACT.expectedMaxStacks,
    state.stackCount + cadenceAwards,
  );

  return {
    ...state,
    stackCount: nextStackCount,
    secondsTowardNextStack: nextStackCount === LINGERING_TUNES_ON_FIELD_CONTRACT.expectedMaxStacks
      ? 0
      : elapsedWithPhase - cadenceAwards * interval,
  };
}

export function resolveLingeringTunesKnownOnFieldBonus(
  state: LingeringTunesKnownOnFieldState,
): LingeringTunesKnownOnFieldBonus {
  return {
    effectId: 'S09_5PC_FIELD_ATK',
    statOrEffect: 'ATK%',
    stackCount: state.stackCount,
    valuePerStack: LINGERING_TUNES_ON_FIELD_CONTRACT.expectedValuePerStack,
    totalValue: state.stackCount * LINGERING_TUNES_ON_FIELD_CONTRACT.expectedValuePerStack,
  };
}

export function resolveLingeringTunesOutroBonus(): LingeringTunesOutroBonus {
  return {
    effectId: 'S09_5PC_OUTRO_DMG',
    statOrEffect: 'Outro Skill DMG Bonus',
    value: LINGERING_TUNES_ON_FIELD_CONTRACT.expectedOutroValue,
  };
}

export function leaveLingeringTunesField(
  state: LingeringTunesKnownOnFieldState,
): LingeringTunesPostFieldBoundary {
  return {
    status: 'SOURCE_LIFECYCLE_UNRESOLVED',
    previousKnownState: state,
    unresolvedSemantics: LINGERING_TUNES_ON_FIELD_SEMANTIC_REVIEW.unresolvedSemantics,
  };
}
