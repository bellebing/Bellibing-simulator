import test from 'node:test';
import assert from 'node:assert/strict';

import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { buildProfileAdapterDependencyMatrix } from '../src/profileAdapterDependencyMatrix.ts';

test('profile adapter matrix preserves every canonical pendingExecutionId exactly once', () => {
  const matrix = buildProfileAdapterDependencyMatrix();
  const sourcePendingIds = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.flatMap((review) =>
    review.pendingExecutionIds.map((pendingExecutionId) => `${review.reviewId}|${pendingExecutionId}`),
  ).sort();
  const matrixPendingIds = matrix.edges.map((edge) => `${edge.reviewId}|${edge.pendingExecutionId}`).sort();

  assert.deepEqual(matrixPendingIds, sourcePendingIds);
  assert.equal(matrix.reviewCount, 11);
  assert.equal(matrix.profileCount, 11);
  assert.equal(matrix.pendingProfileCount, 10);
  assert.equal(matrix.dependencyCount, 46);
  assert.equal(matrix.authorizesExecution, false);
});

test('reusable adapter priority is fanout-based while rotation engine models stay profile-specific', () => {
  const matrix = buildProfileAdapterDependencyMatrix();
  const rotation = matrix.primitives.find((row) => row.syntacticPrimitiveKey === 'rotation:engine-model');
  assert.ok(rotation);
  assert.equal(rotation.implementationScope, 'PROFILE_SPECIFIC_EXECUTION');
  assert.equal(rotation.profileCount, 10);
  assert.equal(matrix.reusablePriorityQueue.includes(rotation), false);

  const heron = matrix.primitives.find((row) => row.syntacticPrimitiveKey === 'echo:impermanence-heron-active-transfer-adapter');
  assert.ok(heron);
  assert.equal(heron.implementationScope, 'REUSABLE_PRIMITIVE_CANDIDATE');
  assert.equal(heron.profileCount, 3);
  assert.deepEqual(heron.characterIds, ['aalto', 'iuno', 'zhezhi']);

  const targetState = matrix.primitives.find((row) => row.syntacticPrimitiveKey === 'weapon:target-state-adapter');
  assert.ok(targetState);
  assert.equal(targetState.profileCount, 2);
  assert.deepEqual(targetState.characterIds, ['cartethyia', 'ciaccona']);

  assert.equal(matrix.reusablePriorityQueue[0]?.syntacticPrimitiveKey, 'echo:impermanence-heron-active-transfer-adapter');
});

test('syntactic reuse grouping never claims semantic execution closure', () => {
  const matrix = buildProfileAdapterDependencyMatrix();
  assert.ok(matrix.notes.some((note) => /does not prove shared semantic behavior/.test(note)));
  assert.ok(matrix.notes.some((note) => /No dependency row authorizes ENGINE_MODELED or DPS_READY/.test(note)));
});
