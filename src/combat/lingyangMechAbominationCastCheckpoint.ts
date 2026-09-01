import {
  LINGYANG_STANDARD_SOURCE_SEQUENCE,
  resolveLingyangBurstComboStep,
} from './lingyangBurstComboActionMapping.ts';
import {
  MECH_ABOMINATION_CAST_STATE_CONTRACT,
  MECH_ABOMINATION_CAST_STATE_REVIEW,
} from './mechAbominationCastStateAdapter.ts';

export const LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT = {
  sourceStepIndex: 0,
  sourceStep: 'Echo: Mech Abomination',
  eventKind: 'ECHO_ACTIVE_CAST',
  actorId: 'lingyang',
  echoId: 'echo-60000485',
} as const;

export const LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT_REVIEW = {
  reviewId: 'LINGYANG-MECH-ABOMINATION-CAST-CHECKPOINT-REVIEW-2026-09-01-01',
  reviewedAt: '2026-09-01',
  pendingExecutionId: MECH_ABOMINATION_CAST_STATE_REVIEW.pendingExecutionId,
  status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
  primitiveId: MECH_ABOMINATION_CAST_STATE_REVIEW.primitiveId,
  canonicalCastStepIndex: 0,
  requiresExactCastTimestamp: true,
  requiresExactHitTimeline: true,
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'The canonical Lingyang sequence identifies Mech Abomination as its first Echo action, and the reviewed action mapper resolves that step exactly to echo-60000485.',
    'This profile checkpoint proves Echo cast identity only. SOURCE_SEQUENCE_ONLY does not mean that the cast occurs at t=0.',
    'The existing Mech cast-state primitive still requires an explicit numeric cast timestamp before it may materialize the 15-second ATK window or 20-second cooldown state.',
    'The front strike, Mech Waste hit and Waste explosion remain unscheduled because source truth does not provide cast-to-hit delays.',
  ],
} as const;

export function validateLingyangMechAbominationCastCheckpoint(
  sourceSequence: readonly string[] = LINGYANG_STANDARD_SOURCE_SEQUENCE,
): readonly string[] {
  const issues: string[] = [];
  const checkpoint = LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT;

  if (sourceSequence[checkpoint.sourceStepIndex] !== checkpoint.sourceStep) {
    issues.push(
      `Lingyang Mech source step drift: expected "${checkpoint.sourceStep}", got "${sourceSequence[checkpoint.sourceStepIndex]}"`,
    );
    return issues;
  }

  const mapping = resolveLingyangBurstComboStep(checkpoint.sourceStepIndex);
  if (mapping.status !== 'EXACT_ECHO_EVENT') {
    issues.push(`Lingyang Mech checkpoint is no longer an exact Echo event: ${mapping.status}`);
  } else if (mapping.echoId !== checkpoint.echoId) {
    issues.push(`Lingyang Mech Echo identity drift: expected ${checkpoint.echoId}, got ${mapping.echoId}`);
  }

  if (MECH_ABOMINATION_CAST_STATE_CONTRACT.echoId !== checkpoint.echoId) {
    issues.push(`Mech cast-state contract Echo drift: ${MECH_ABOMINATION_CAST_STATE_CONTRACT.echoId}`);
  }
  if (MECH_ABOMINATION_CAST_STATE_REVIEW.status !== 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE') {
    issues.push(`Mech cast-state review status drift: ${MECH_ABOMINATION_CAST_STATE_REVIEW.status}`);
  }
  if (MECH_ABOMINATION_CAST_STATE_REVIEW.closesPendingExecutionIds.length !== 0) {
    issues.push('Mech cast-state review unexpectedly closes a canonical dependency');
  }

  return issues;
}

const REVIEW_ISSUES = validateLingyangMechAbominationCastCheckpoint();
if (REVIEW_ISSUES.length > 0) {
  throw new Error(`Invalid Lingyang Mech Abomination cast checkpoint: ${REVIEW_ISSUES.join('; ')}`);
}
