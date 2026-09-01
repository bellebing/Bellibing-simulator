import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LINGYANG_STANDARD_SOURCE_SEQUENCE,
} from '../src/combat/lingyangBurstComboActionMapping.ts';
import {
  LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT,
  LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT_REVIEW,
  validateLingyangMechAbominationCastCheckpoint,
} from '../src/combat/lingyangMechAbominationCastCheckpoint.ts';

test('Lingyang Mech checkpoint binds canonical source step 0 to the exact Echo cast identity only', () => {
  assert.deepEqual(validateLingyangMechAbominationCastCheckpoint(), []);
  assert.deepEqual(LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT, {
    sourceStepIndex: 0,
    sourceStep: 'Echo: Mech Abomination',
    eventKind: 'ECHO_ACTIVE_CAST',
    actorId: 'lingyang',
    echoId: 'echo-60000485',
  });
});

test('Lingyang Mech checkpoint remains timeline-only and closes no canonical dependency', () => {
  assert.equal(LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT_REVIEW.status, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT_REVIEW.primitiveId, 'mech-abomination-explicit-cast-state-v1');
  assert.equal(LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT_REVIEW.requiresExactCastTimestamp, true);
  assert.equal(LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT_REVIEW.requiresExactHitTimeline, true);
  assert.deepEqual(LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT_REVIEW.closesPendingExecutionIds, []);
  assert.ok(LINGYANG_MECH_ABOMINATION_CAST_CHECKPOINT_REVIEW.notes.some((note) => note.includes('does not mean that the cast occurs at t=0')));
});

test('Lingyang Mech checkpoint fails closed if the canonical Echo step drifts', () => {
  const drifted = [...LINGYANG_STANDARD_SOURCE_SEQUENCE];
  drifted[0] = 'Echo: Other';
  const issues = validateLingyangMechAbominationCastCheckpoint(drifted);
  assert.ok(issues.some((issue) => issue.includes('source step drift')));
});
