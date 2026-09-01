import {
  LINGYANG_PASSIVE_FACTS,
  LINGYANG_RESOURCE_FACTS,
} from '../data/characterMechanics/lingyangRawFacts.ts';

export const LINGYANG_STRIDING_LION_RESOURCE_CONTRACT = {
  pendingExecutionId: 'character:lingyang:striding-lion-resource-state-adapter',
  resourceFactId: 'lingyang-resource-lions-spirit',
  stridingLionFactId: 'lingyang-forte-striding-lion',
  lionsVigorFactId: 'lingyang-liberation-lions-vigor',
  fullLionSpirit: 100,
  baseDepletionSeconds: 5,
  lionsVigorConsumptionMultiplier: 0.5,
  lionsVigorDepletionSeconds: 10,
  stormyKicksBelowLionSpirit: 10,
} as const;

export type LingyangKnownVigorMode =
  | 'PROVEN_ACTIVE_FOR_ENTIRE_SEGMENT'
  | 'PROVEN_INACTIVE_FOR_ENTIRE_SEGMENT'
  | 'UNKNOWN_OR_CHANGES_DURING_SEGMENT';

export interface LingyangStridingLionSegmentInput {
  readonly ownerId: string;
  readonly enteredAtSeconds: number;
  readonly atSeconds: number;
  /**
   * Striding Lion entry is source-listed only while Lion's Spirit is full.
   * This adapter deliberately rejects a partial-resource start rather than
   * inventing how the five-/ten-second wording scales from another value.
   */
  readonly startingLionSpirit: 100;
  /**
   * Caller-proven state for the whole evaluated interval. If Lion's Vigor
   * starts or expires inside the interval, this primitive stops instead of
   * synthesizing a cross-state timeline.
   */
  readonly lionsVigorMode: LingyangKnownVigorMode;
  /**
   * Any intervening Lion's Spirit restoration is outside this isolated
   * continuous-consumption primitive and must be handled by a richer state
   * engine before profile execution can close.
   */
  readonly hasInterveningLionSpiritGainEvent: boolean;
}

export type LingyangStridingLionSegmentResult =
  | {
      readonly status: 'SOURCE_SEGMENT_UNRESOLVED';
      readonly reason: 'VIGOR_STATE_CHANGES_OR_UNKNOWN' | 'INTERVENING_RESOURCE_GAIN';
    }
  | {
      readonly status: 'ACTIVE' | 'DEPLETED';
      readonly elapsedSeconds: number;
      readonly consumptionRateLionSpiritPerSecond: number;
      readonly remainingLionSpirit: number;
      readonly stormyKicksBelowTenEligible: boolean;
    };

export const LINGYANG_STRIDING_LION_RESOURCE_SEMANTIC_REVIEW = {
  status: 'BLOCKED_PROFILE_TIMELINE',
  blockerId: 'BUG-017',
  reviewedAt: '2026-09-01',
  primitiveId: 'lingyang-striding-lion-known-segment-v1',
  pendingExecutionId: LINGYANG_STRIDING_LION_RESOURCE_CONTRACT.pendingExecutionId,
  sourceEstablished: [
    "Lion's Spirit maximum is 100.",
    "Striding Lion continuously consumes Lion's Spirit and normally runs it out in 5s.",
    "While Lion's Vigor is active, consumption speed is reduced by 50%, extending Striding Lion up to 10s.",
    "When Lion's Spirit is below 10 during Striding Lion, Basic Attack performs Stormy Kicks.",
  ],
  unresolvedSemantics: [
    'The canonical Lingyang source sequence has no exact action timestamps, so it does not establish how much Lion’s Spirit remains at any Burst Combo action.',
    "The current profile does not provide a fully executable Lion's Vigor start/end timeline relative to Striding Lion entry.",
    "This isolated primitive does not resolve Lion's Spirit restoration events during Striding Lion, action/cancel/airborne timing, or the exact action-ID mapping for generic Feral Gyrate.",
  ],
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'The primitive derives only the source-implied constant rates for a caller-proven homogeneous segment: 100 / 5s = 20 Lion’s Spirit/s, or 50% of that rate under Lion’s Vigor = 10/s.',
    'A segment whose Lion’s Vigor state changes or is unknown fails closed instead of integrating an unproven profile timeline.',
    'Stormy Kicks eligibility is exposed only as the source predicate remaining Lion’s Spirit < 10; the adapter does not execute Stormy Kicks or Tail Strike.',
    'The canonical resource-state pending execution ID remains open until profile timestamps, state transitions and action mapping are independently closed.',
  ],
} as const;

function assertFiniteNonNegative(label: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number: ${value}`);
  }
}

export function validateLingyangStridingLionResourceContract(): readonly string[] {
  const issues: string[] = [];
  const resourceMatches = LINGYANG_RESOURCE_FACTS.filter((fact) => fact.factId === LINGYANG_STRIDING_LION_RESOURCE_CONTRACT.resourceFactId);
  const stridingMatches = LINGYANG_PASSIVE_FACTS.filter((fact) => fact.factId === LINGYANG_STRIDING_LION_RESOURCE_CONTRACT.stridingLionFactId);
  const vigorMatches = LINGYANG_PASSIVE_FACTS.filter((fact) => fact.factId === LINGYANG_STRIDING_LION_RESOURCE_CONTRACT.lionsVigorFactId);

  if (resourceMatches.length !== 1) issues.push(`expected one Lion's Spirit fact, got ${resourceMatches.length}`);
  if (stridingMatches.length !== 1) issues.push(`expected one Striding Lion fact, got ${stridingMatches.length}`);
  if (vigorMatches.length !== 1) issues.push(`expected one Lion's Vigor fact, got ${vigorMatches.length}`);
  if (issues.length > 0) return issues;

  const resource = resourceMatches[0];
  const striding = stridingMatches[0];
  const vigor = vigorMatches[0];

  if (resource.maxValue !== LINGYANG_STRIDING_LION_RESOURCE_CONTRACT.fullLionSpirit) {
    issues.push(`Lion's Spirit max drift: ${String(resource.maxValue)}`);
  }
  if (!resource.ruleSummary.includes('continuously consumes')) issues.push("Lion's Spirit continuous-consumption wording drift");
  if (!striding.effectSummary.includes('5s')) issues.push('Striding Lion base depletion wording drift');
  if (!striding.effectSummary.includes('50%')) issues.push('Striding Lion Vigor reduction wording drift');
  if (!striding.effectSummary.includes('10s')) issues.push('Striding Lion extended duration wording drift');
  if (!striding.effectSummary.includes('below 10')) issues.push('Striding Lion Stormy Kicks threshold wording drift');
  if (!striding.triggerSummary.includes("Lion's Spirit is full")) issues.push('Striding Lion full-resource entry wording drift');
  if (striding.modelingStatus !== 'PENDING_INTERPRETATION') issues.push(`Striding Lion modeling status drift: ${striding.modelingStatus}`);
  if (vigor.durationSeconds !== 14) issues.push(`Lion's Vigor duration drift: ${String(vigor.durationSeconds)}`);
  if (!vigor.effectSummary.includes('reduced by 50%')) issues.push("Lion's Vigor consumption wording drift");

  return issues;
}

const CONTRACT_ISSUES = validateLingyangStridingLionResourceContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Lingyang Striding Lion resource contract: ${CONTRACT_ISSUES.join('; ')}`);
}

export function evaluateLingyangStridingLionKnownSegment(
  input: LingyangStridingLionSegmentInput,
): LingyangStridingLionSegmentResult {
  if (!input.ownerId.trim()) throw new Error('Striding Lion ownerId must be non-blank');
  assertFiniteNonNegative('Striding Lion entry time', input.enteredAtSeconds);
  assertFiniteNonNegative('Striding Lion evaluation time', input.atSeconds);
  if (input.atSeconds < input.enteredAtSeconds) throw new Error('Striding Lion evaluation time cannot precede entry');
  if (input.startingLionSpirit !== LINGYANG_STRIDING_LION_RESOURCE_CONTRACT.fullLionSpirit) {
    throw new Error(`Striding Lion known-segment primitive requires full Lion's Spirit at entry: ${input.startingLionSpirit}`);
  }
  if (input.hasInterveningLionSpiritGainEvent) {
    return { status: 'SOURCE_SEGMENT_UNRESOLVED', reason: 'INTERVENING_RESOURCE_GAIN' };
  }
  if (input.lionsVigorMode === 'UNKNOWN_OR_CHANGES_DURING_SEGMENT') {
    return { status: 'SOURCE_SEGMENT_UNRESOLVED', reason: 'VIGOR_STATE_CHANGES_OR_UNKNOWN' };
  }

  const elapsedSeconds = input.atSeconds - input.enteredAtSeconds;
  const baseRate = LINGYANG_STRIDING_LION_RESOURCE_CONTRACT.fullLionSpirit
    / LINGYANG_STRIDING_LION_RESOURCE_CONTRACT.baseDepletionSeconds;
  const consumptionRateLionSpiritPerSecond = input.lionsVigorMode === 'PROVEN_ACTIVE_FOR_ENTIRE_SEGMENT'
    ? baseRate * LINGYANG_STRIDING_LION_RESOURCE_CONTRACT.lionsVigorConsumptionMultiplier
    : baseRate;
  const remainingLionSpirit = Math.max(
    0,
    LINGYANG_STRIDING_LION_RESOURCE_CONTRACT.fullLionSpirit - (consumptionRateLionSpiritPerSecond * elapsedSeconds),
  );

  return {
    status: remainingLionSpirit > 0 ? 'ACTIVE' : 'DEPLETED',
    elapsedSeconds,
    consumptionRateLionSpiritPerSecond,
    remainingLionSpirit,
    stormyKicksBelowTenEligible: remainingLionSpirit < LINGYANG_STRIDING_LION_RESOURCE_CONTRACT.stormyKicksBelowLionSpirit,
  };
}
