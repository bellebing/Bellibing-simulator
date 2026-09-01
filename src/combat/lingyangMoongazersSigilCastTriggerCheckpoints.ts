import {
  LINGYANG_STANDARD_SOURCE_SEQUENCE,
  resolveLingyangBurstComboStep,
} from './lingyangBurstComboActionMapping.ts';
import {
  WEAPON_CAST_WINDOW_CONTRACTS,
  WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT,
  type WeaponCastEventKind,
  type WeaponCastWindowContract,
} from './weaponCastWindowAdapter.ts';

export const LINGYANG_MOONGAZERS_SIGIL_PENDING_EXECUTION_ID =
  'weapon:moongazers-sigil:MGS-LIB:trigger-uptime-adapter' as const;

export interface LingyangMoongazersSigilCastTriggerCheckpoint {
  readonly sourceStepIndex: 1 | 2;
  readonly sourceStep: 'Intro' | 'Ultimate';
  readonly actionFactId:
    | 'lingyang-intro-lion-awakens'
    | 'lingyang-liberation-strive-lions-vigor';
  readonly eventKind: WeaponCastEventKind;
}

/**
 * Profile-specific trigger identity only.
 *
 * The canonical sequence proves which actions can trigger MGS-LIB, but it does
 * not provide executable timestamps or source-backed multi-trigger refresh /
 * overlap semantics. These checkpoints therefore must never be promoted into
 * timed weapon windows without a caller-owned executable timeline.
 */
export const LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_CHECKPOINTS = [
  {
    sourceStepIndex: 1,
    sourceStep: 'Intro',
    actionFactId: 'lingyang-intro-lion-awakens',
    eventKind: 'INTRO_SKILL_CAST',
  },
  {
    sourceStepIndex: 2,
    sourceStep: 'Ultimate',
    actionFactId: 'lingyang-liberation-strive-lions-vigor',
    eventKind: 'RESONANCE_LIBERATION_CAST',
  },
] as const satisfies readonly LingyangMoongazersSigilCastTriggerCheckpoint[];

export const LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_REVIEW = {
  reviewId: 'LINGYANG-MOONGAZERS-SIGIL-CAST-TRIGGER-REVIEW-2026-09-01-01',
  reviewedAt: '2026-09-01',
  effectId: 'MGS-LIB',
  pendingExecutionId: LINGYANG_MOONGAZERS_SIGIL_PENDING_EXECUTION_ID,
  status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
  primitiveId: WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.adapterId,
  canonicalTriggerStepIndexes: [1, 2] as const,
  requiresExactTimestamps: true,
  requiresMultiTriggerLifecycle: true,
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'The MGS-LIB source contract triggers on Cast Intro Skill or Resonance Liberation.',
    'The canonical Lingyang sequence identifies both source trigger actions exactly: Intro at step index 1 and Ultimate / Strive: Lion’s Vigor at step index 2.',
    'This review proves trigger identity only. SOURCE_SEQUENCE_ONLY order does not provide either action timestamp.',
    'Because two qualifying casts occur in the canonical sequence, executable uptime also requires a source-safe same-effect retrigger / refresh / overlap policy rather than assuming that the second cast simply resets or extends the first window.',
    'The canonical pending ID remains open; no weapon window is instantiated from sequence adjacency.',
  ],
} as const;

export function validateLingyangMoongazersSigilCastTriggerCheckpoints(params: {
  readonly sourceSequence?: readonly string[];
  readonly contracts?: readonly WeaponCastWindowContract[];
} = {}): readonly string[] {
  const sourceSequence = params.sourceSequence ?? LINGYANG_STANDARD_SOURCE_SEQUENCE;
  const contracts = params.contracts ?? WEAPON_CAST_WINDOW_CONTRACTS;
  const issues: string[] = [];

  const contractMatches = contracts.filter((contract) => contract.effectId === 'MGS-LIB');
  if (contractMatches.length !== 1) {
    issues.push(`expected exactly one MGS-LIB cast-window contract, got ${contractMatches.length}`);
    return issues;
  }

  const contract = contractMatches[0];
  if (contract.expectedSourceTrigger !== 'Cast Intro Skill or Resonance Liberation') {
    issues.push(`MGS-LIB source trigger drift: ${contract.expectedSourceTrigger}`);
  }
  const expectedEventKinds: readonly WeaponCastEventKind[] = [
    'INTRO_SKILL_CAST',
    'RESONANCE_LIBERATION_CAST',
  ];
  if (
    contract.triggerEvents.length !== expectedEventKinds.length
    || expectedEventKinds.some((kind, index) => contract.triggerEvents[index] !== kind)
  ) {
    issues.push(`MGS-LIB trigger event mapping drift: ${contract.triggerEvents.join(',')}`);
  }

  for (const checkpoint of LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_CHECKPOINTS) {
    if (sourceSequence[checkpoint.sourceStepIndex] !== checkpoint.sourceStep) {
      issues.push(
        `Lingyang MGS-LIB source step ${checkpoint.sourceStepIndex} drift: expected "${checkpoint.sourceStep}", got "${sourceSequence[checkpoint.sourceStepIndex]}"`,
      );
      continue;
    }

    const mapping = resolveLingyangBurstComboStep(checkpoint.sourceStepIndex);
    if (mapping.status !== 'EXACT_CHARACTER_ACTION') {
      issues.push(`Lingyang MGS-LIB step ${checkpoint.sourceStepIndex} is no longer an exact character action`);
      continue;
    }
    if (mapping.actionFactId !== checkpoint.actionFactId) {
      issues.push(
        `Lingyang MGS-LIB action identity drift at step ${checkpoint.sourceStepIndex}: expected ${checkpoint.actionFactId}, got ${mapping.actionFactId}`,
      );
    }
  }

  return issues;
}

const REVIEW_ISSUES = validateLingyangMoongazersSigilCastTriggerCheckpoints();
if (REVIEW_ISSUES.length > 0) {
  throw new Error(`Invalid Lingyang Moongazer cast-trigger review: ${REVIEW_ISSUES.join('; ')}`);
}

export function getLingyangMoongazersSigilCastTriggerCheckpointForStep(
  sourceStepIndex: number,
): LingyangMoongazersSigilCastTriggerCheckpoint | null {
  if (
    !Number.isInteger(sourceStepIndex)
    || sourceStepIndex < 0
    || sourceStepIndex >= LINGYANG_STANDARD_SOURCE_SEQUENCE.length
  ) {
    throw new Error(
      `Lingyang canonical source step index must be an integer from 0 through ${LINGYANG_STANDARD_SOURCE_SEQUENCE.length - 1}: ${sourceStepIndex}`,
    );
  }

  return LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_CHECKPOINTS.find(
    (checkpoint) => checkpoint.sourceStepIndex === sourceStepIndex,
  ) ?? null;
}
