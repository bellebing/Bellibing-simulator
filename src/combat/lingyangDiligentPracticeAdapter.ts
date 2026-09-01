import { LINGYANG_PASSIVE_FACTS } from '../data/characterMechanics/lingyangRawFacts.ts';

export const LINGYANG_DILIGENT_PRACTICE_CONTRACT = {
  pendingExecutionId: 'character:lingyang:diligent-practice-three-second-window-adapter',
  factId: 'lingyang-inherent-diligent-practice',
  mountainRoamerFactId: 'lingyang-forte-mountain-roamer',
  windowSeconds: 3,
  additionalDamageRatioOfMountainRoamer: 1.5,
  additionalDamageClass: 'RESONANCE_SKILL',
} as const;

export interface LingyangDiligentBasicEvent {
  readonly actorId: string;
  readonly atSeconds: number;
  /**
   * Caller-established state. This adapter does not infer Striding Lion from the
   * canonical source sequence or from the Feral Gyrate label.
   */
  readonly stridingLionActive: boolean;
  readonly actionRole: 'BASIC_ATTACK_DURING_STRIDING_LION';
}

export interface LingyangDiligentMountainRoamerEvent {
  readonly actorId: string;
  readonly atSeconds: number;
  readonly stridingLionActive: boolean;
  readonly actionFactId: 'lingyang-forte-mountain-roamer';
}

export type LingyangDiligentPracticeResult =
  | { readonly status: 'IGNORED_OTHER_ACTOR' }
  | { readonly status: 'NOT_DURING_STRIDING_LION' }
  | { readonly status: 'MOUNTAIN_ROAMER_NOT_AFTER_BASIC' }
  | { readonly status: 'OUTSIDE_WINDOW'; readonly deltaSeconds: number }
  | {
      readonly status: 'SOURCE_BOUNDARY_UNRESOLVED';
      readonly deltaSeconds: 3;
      readonly unresolvedSemantics: readonly string[];
    }
  | {
      readonly status: 'TRIGGERED';
      readonly deltaSeconds: number;
      readonly additionalDamageRatioOfMountainRoamer: 1.5;
      readonly additionalDamageClass: 'RESONANCE_SKILL';
    };

export const LINGYANG_DILIGENT_PRACTICE_SEMANTIC_REVIEW = {
  status: 'BLOCKED_SOURCE_SEMANTICS',
  blockerId: 'BUG-017',
  reviewedAt: '2026-09-01',
  primitiveId: 'lingyang-diligent-practice-known-window-v1',
  pendingExecutionId: LINGYANG_DILIGENT_PRACTICE_CONTRACT.pendingExecutionId,
  sourceEstablished: [
    'During Striding Lion, a Basic Attack followed by Mountain Roamer within 3s triggers additional damage.',
    'The additional damage equals 150% of Mountain Roamer DMG and is considered Resonance Skill DMG.',
  ],
  unresolvedSemantics: [
    'The current source wording does not independently establish whether an event exactly 3.000 seconds after the Basic Attack is inside or outside the trigger boundary.',
    'The canonical Lingyang source sequence has action order but no exact timestamps, so it cannot prove the Diligent Practice window for any Burst Combo pair.',
    'The source rotation names generic Feral Gyrate while canonical mechanics have Stage 1 and Stage 2 facts; this primitive deliberately requires only a caller-established Basic Attack during Striding Lion and does not select a Feral Gyrate stage.',
  ],
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'For source-safe execution, deltas strictly below three seconds trigger and deltas strictly above three seconds miss; the exact three-second boundary fails closed.',
    'Both events must carry caller-established Striding Lion state. The adapter never derives state from sequence adjacency or action labels.',
    'The canonical pending execution ID remains open until the boundary and profile timestamps/state are independently source-closed.',
  ],
} as const;

function assertFiniteNonNegative(label: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number: ${value}`);
  }
}

export function validateLingyangDiligentPracticeContract(): readonly string[] {
  const issues: string[] = [];
  const matches = LINGYANG_PASSIVE_FACTS.filter((fact) => fact.factId === LINGYANG_DILIGENT_PRACTICE_CONTRACT.factId);
  if (matches.length !== 1) {
    issues.push(`expected exactly one ${LINGYANG_DILIGENT_PRACTICE_CONTRACT.factId} fact, got ${matches.length}`);
    return issues;
  }

  const fact = matches[0];
  if (fact.durationSeconds !== LINGYANG_DILIGENT_PRACTICE_CONTRACT.windowSeconds) issues.push(`Diligent Practice duration drift: ${String(fact.durationSeconds)}`);
  if (fact.scope !== 'SELF') issues.push(`Diligent Practice scope drift: ${String(fact.scope)}`);
  if (!fact.conditional) issues.push('Diligent Practice must remain conditional');
  if (fact.modelingStatus !== 'PENDING_INTERPRETATION') issues.push(`Diligent Practice modeling status drift: ${fact.modelingStatus}`);
  if (!fact.triggerSummary.includes('Basic Attack') || !fact.triggerSummary.includes('Mountain Roamer') || !fact.triggerSummary.includes('within 3s')) {
    issues.push('Diligent Practice trigger summary drift');
  }
  if (!fact.effectSummary.includes('150% of Mountain Roamer DMG') || !fact.effectSummary.includes('Resonance Skill DMG')) {
    issues.push('Diligent Practice effect summary drift');
  }

  const unresolved: readonly string[] = LINGYANG_DILIGENT_PRACTICE_SEMANTIC_REVIEW.unresolvedSemantics;
  if (unresolved.length === 0) issues.push('Diligent Practice review must retain explicit unresolved semantics');
  return issues;
}

const CONTRACT_ISSUES = validateLingyangDiligentPracticeContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Lingyang Diligent Practice contract: ${CONTRACT_ISSUES.join('; ')}`);
}

export function evaluateLingyangDiligentPractice(params: {
  readonly ownerId: string;
  readonly basic: LingyangDiligentBasicEvent;
  readonly mountainRoamer: LingyangDiligentMountainRoamerEvent;
}): LingyangDiligentPracticeResult {
  const { ownerId, basic, mountainRoamer } = params;
  if (!ownerId.trim()) throw new Error('Diligent Practice ownerId must be non-blank');
  if (!basic.actorId.trim() || !mountainRoamer.actorId.trim()) throw new Error('Diligent Practice event actorId must be non-blank');
  assertFiniteNonNegative('Diligent Practice Basic time', basic.atSeconds);
  assertFiniteNonNegative('Diligent Practice Mountain Roamer time', mountainRoamer.atSeconds);

  if (basic.actorId !== ownerId || mountainRoamer.actorId !== ownerId) return { status: 'IGNORED_OTHER_ACTOR' };
  if (!basic.stridingLionActive || !mountainRoamer.stridingLionActive) return { status: 'NOT_DURING_STRIDING_LION' };
  if (mountainRoamer.actionFactId !== LINGYANG_DILIGENT_PRACTICE_CONTRACT.mountainRoamerFactId) {
    throw new Error(`Diligent Practice Mountain Roamer fact drift: ${mountainRoamer.actionFactId}`);
  }

  const deltaSeconds = mountainRoamer.atSeconds - basic.atSeconds;
  if (deltaSeconds <= 0) return { status: 'MOUNTAIN_ROAMER_NOT_AFTER_BASIC' };
  if (deltaSeconds < LINGYANG_DILIGENT_PRACTICE_CONTRACT.windowSeconds) {
    return {
      status: 'TRIGGERED',
      deltaSeconds,
      additionalDamageRatioOfMountainRoamer: LINGYANG_DILIGENT_PRACTICE_CONTRACT.additionalDamageRatioOfMountainRoamer,
      additionalDamageClass: LINGYANG_DILIGENT_PRACTICE_CONTRACT.additionalDamageClass,
    };
  }
  if (deltaSeconds > LINGYANG_DILIGENT_PRACTICE_CONTRACT.windowSeconds) return { status: 'OUTSIDE_WINDOW', deltaSeconds };
  return {
    status: 'SOURCE_BOUNDARY_UNRESOLVED',
    deltaSeconds: 3,
    unresolvedSemantics: LINGYANG_DILIGENT_PRACTICE_SEMANTIC_REVIEW.unresolvedSemantics,
  };
}
