import test from 'node:test';
import assert from 'node:assert/strict';

import { IMPERMANENCE_HERON_TRANSFER_DISPOSITION } from '../src/combat/echoTransferWindowAdapter.ts';
import { SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT } from '../src/combat/sonataOutroTransferAdapter.ts';
import { WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT } from '../src/combat/weaponCastWindowAdapter.ts';
import {
  buildProfileExecutionWorkQueue,
  EXECUTION_SEMANTIC_REVIEWS,
  validateExecutionSemanticReviews,
} from '../src/profileExecutionWorkQueue.ts';

test('semantic execution review catalog is derived from reviewed implementation artifacts', () => {
  assert.deepEqual(validateExecutionSemanticReviews(), []);
  assert.equal(EXECUTION_SEMANTIC_REVIEWS.length, 9);

  for (const pendingExecutionId of WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.castWindowPendingExecutionIds) {
    const review = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === pendingExecutionId);
    assert.equal(review?.status, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
    assert.equal(review?.primitiveId, 'weapon-cast-timed-self-window-v1');
  }

  for (const pendingExecutionId of SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT.directOutroPendingExecutionIds) {
    const review = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === pendingExecutionId);
    assert.equal(review?.status, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
    assert.equal(review?.primitiveId, 'sonata-outro-incoming-transfer-v1');
  }

  const heron = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === IMPERMANENCE_HERON_TRANSFER_DISPOSITION.pendingExecutionId);
  assert.equal(heron?.status, 'BLOCKED_SOURCE_CONFLICT');
  assert.equal(heron?.blockerId, 'BUG-008');

  const woodland = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === 'weapon:woodland-aria:WA-AERO:trigger-uptime-adapter');
  assert.equal(woodland?.status, 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING');
  assert.equal(woodland?.actionKey, 'weapon:aero-erosion-application-state');
});

test('current 78-edge matrix is partitioned into actionable, covered, blocked and profile-specific work without authorizing execution', () => {
  const queue = buildProfileExecutionWorkQueue();
  assert.equal(queue.authorizesExecution, false);
  assert.deepEqual(queue.summary, {
    totalEdges: 78,
    unreviewedEdges: 46,
    semanticallyReviewedImplementationPendingEdges: 1,
    primitiveAvailableRequiresTimelineEdges: 9,
    blockedSourceConflictEdges: 5,
    profileSpecificExecutionEdges: 17,
    actionableSharedEdges: 47,
  });
  assert.equal(
    queue.summary.unreviewedEdges
      + queue.summary.semanticallyReviewedImplementationPendingEdges
      + queue.summary.primitiveAvailableRequiresTimelineEdges
      + queue.summary.blockedSourceConflictEdges
      + queue.summary.profileSpecificExecutionEdges,
    queue.summary.totalEdges,
  );
});

test('actionable queue removes already-covered and source-blocked high-fanout families', () => {
  const queue = buildProfileExecutionWorkQueue();
  const actionableIds = new Set(queue.actionableSharedQueue.flatMap((row) => row.pendingExecutionIds));

  for (const id of WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.castWindowPendingExecutionIds) assert.equal(actionableIds.has(id), false);
  for (const id of SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT.directOutroPendingExecutionIds) assert.equal(actionableIds.has(id), false);
  assert.equal(actionableIds.has(IMPERMANENCE_HERON_TRANSFER_DISPOSITION.pendingExecutionId), false);

  const woodland = queue.actionableSharedQueue.find((row) => row.actionKey === 'weapon:aero-erosion-application-state');
  assert.ok(woodland);
  assert.equal(woodland.semanticStatus, 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING');
  assert.equal(woodland.profileCount, 1);
  assert.equal(woodland.dependencyCount, 1);
});

test('remaining shared fanout is machine-ranked so the next semantic slices do not require manual 78-edge triage', () => {
  const queue = buildProfileExecutionWorkQueue();
  for (let index = 1; index < queue.actionableSharedQueue.length; index += 1) {
    assert.ok(queue.actionableSharedQueue[index - 1].profileCount >= queue.actionableSharedQueue[index].profileCount);
  }

  const expectedTwoProfileFamilies = [
    'sonata:trigger-stack-adapter',
    'sonata:trigger-uptime-adapter',
    'weapon:target-state-adapter',
  ];
  for (const actionKey of expectedTwoProfileFamilies) {
    const row = queue.actionableSharedQueue.find((candidate) => candidate.actionKey === actionKey);
    assert.ok(row, `missing actionable work group ${actionKey}`);
    assert.equal(row.profileCount, 2);
    assert.equal(row.characterCount, 2);
  }
});

test('covered, blocked and profile-specific queues remain separate and retain exact fanout', () => {
  const queue = buildProfileExecutionWorkQueue();

  const weaponCast = queue.primitiveAvailableRequiresTimeline.find((row) => row.actionKey === 'weapon:cast-timed-self-window');
  assert.ok(weaponCast);
  assert.equal(weaponCast.dependencyCount, 5);
  assert.equal(weaponCast.profileCount, 4);

  const sonataTransfer = queue.primitiveAvailableRequiresTimeline.find((row) => row.actionKey === 'sonata:direct-outro-incoming-transfer');
  assert.ok(sonataTransfer);
  assert.equal(sonataTransfer.dependencyCount, 4);
  assert.equal(sonataTransfer.profileCount, 4);

  const heron = queue.blockedSourceConflicts.find((row) => row.actionKey === 'echo:impermanence-heron-transfer');
  assert.ok(heron);
  assert.equal(heron.dependencyCount, 5);
  assert.equal(heron.profileCount, 5);
  assert.deepEqual(heron.blockerIds, ['BUG-008']);

  assert.equal(queue.profileSpecificExecution.length, 1);
  assert.equal(queue.profileSpecificExecution[0].actionKey, 'rotation:engine-model');
  assert.equal(queue.profileSpecificExecution[0].dependencyCount, 17);
  assert.equal(queue.profileSpecificExecution[0].profileCount, 17);
});

test('semantic review validation rejects duplicate and non-canonical review rows', () => {
  const duplicate = [EXECUTION_SEMANTIC_REVIEWS[0], EXECUTION_SEMANTIC_REVIEWS[0]];
  assert.ok(validateExecutionSemanticReviews(undefined, duplicate).some((issue) => issue.includes('duplicate semantic review')));

  const unknown = [{
    pendingExecutionId: 'weapon:not-canonical:TEST:adapter',
    status: 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING' as const,
    actionKey: 'weapon:test',
    reviewedAt: '2026-08-30',
    notes: ['test'],
  }];
  assert.ok(validateExecutionSemanticReviews(undefined, unknown).some((issue) => issue.includes('non-canonical pending id')));
});
