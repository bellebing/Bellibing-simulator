import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveSigrikaStandardSourceCheckpoints,
  SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE,
  SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW,
  SIGRIKA_STANDARD_SOURCE_CHECKPOINTS,
  validateSigrikaStandardSourceCheckpointContract,
} from '../src/combat/sigrikaStandardSourceCheckpoints.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { SIGRIKA_EXECUTION_DEPENDENCY_CLOSURES_20260901 } from '../src/data/sigrikaExecutionClosures20260901.ts';
import {
  SIGRIKA_STANDARD_BACKWARD_IMPACT_REVIEW,
  SIGRIKA_STANDARD_INITIAL_PENDING_EXECUTION_IDS,
  SIGRIKA_STANDARD_PENDING_EXECUTION_IDS,
} from '../src/data/sigrikaExecutionPreflight20260901.ts';

test('canonical Sigrika source sequence proves only the named action checkpoints', () => {
  assert.deepEqual(validateSigrikaStandardSourceCheckpointContract(), []);
  assert.deepEqual(SIGRIKA_STANDARD_SOURCE_CHECKPOINTS, {
    adapterId: 'sigrika-standard-source-checkpoints-v1',
    rotationId: 'sigrika-standard-source-sequence',
    scope: 'SOURCE_SEQUENCE_ELIGIBILITY_AND_BRANCH_IDENTITY_ONLY',
    elucidatedStepIndexes: [4, 10],
    chainWhipStepIndex: 5,
    outburstStepIndex: 11,
    learnMyTrueNameStepIndex: 12,
    numericRuneTimelineAvailable: false,
    numericFullStopTimelineAvailable: false,
    exactActionTimestampsAvailable: false,
    cancelFrameTimingAvailable: false,
  });
  assert.deepEqual(SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW.closesPendingExecutionIds, [
    'character:sigrika:decipher-elucidated-eligibility-adapter',
    'character:sigrika:runic-heavy-branch-selection-adapter',
    'character:sigrika:learn-my-true-name-full-stop-adapter',
  ]);
});

test('Sigrika source checkpoint resolver fails closed on any sequence drift', () => {
  const drifted = [...SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE];
  drifted[11] = 'Heavy: Chain Whip';
  assert.throws(
    () => resolveSigrikaStandardSourceCheckpoints(drifted),
    /step 12 drifted/,
  );
  assert.throws(
    () => resolveSigrikaStandardSourceCheckpoints(SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE.slice(0, -1)),
    /expected 14 canonical steps, got 13/,
  );
});

test('Sigrika impact snapshot stays historical while five explicit closures yield ten live dependencies', () => {
  assert.equal(SIGRIKA_STANDARD_INITIAL_PENDING_EXECUTION_IDS.length, 15);
  assert.equal(SIGRIKA_STANDARD_PENDING_EXECUTION_IDS.length, 10);
  assert.deepEqual(
    SIGRIKA_STANDARD_BACKWARD_IMPACT_REVIEW.pendingExecutionIds,
    SIGRIKA_STANDARD_INITIAL_PENDING_EXECUTION_IDS,
  );

  assert.equal(SIGRIKA_EXECUTION_DEPENDENCY_CLOSURES_20260901.length, 5);
  assert.deepEqual(
    SIGRIKA_EXECUTION_DEPENDENCY_CLOSURES_20260901.map((row) => row.pendingExecutionId),
    [
      'profile:sigrika-standard:energy-regen-hard-gate-adapter',
      'character:sigrika:decipher-elucidated-eligibility-adapter',
      'character:sigrika:runic-heavy-branch-selection-adapter',
      'character:sigrika:learn-my-true-name-full-stop-adapter',
      'team:ciaccona:solo-concert-aero-bonus-incoming-state-adapter',
    ],
  );

  const liveReview = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'sigrika-standard');
  assert.ok(liveReview);
  assert.deepEqual(liveReview.pendingExecutionIds, SIGRIKA_STANDARD_PENDING_EXECUTION_IDS);
  for (const closedId of SIGRIKA_EXECUTION_DEPENDENCY_CLOSURES_20260901.map((row) => row.pendingExecutionId)) {
    assert.equal(liveReview.pendingExecutionIds.includes(closedId), false, closedId);
  }
  assert.equal(liveReview.pendingExecutionIds.includes('team:qiuyuan:outro-echo-skill-amplification-incoming-state-adapter'), true);
});
