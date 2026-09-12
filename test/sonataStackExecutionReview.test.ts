import test from 'node:test';
import assert from 'node:assert/strict';
import { SONATA_STACK_EXECUTION_REVIEW_20260911 as review } from '../src/data/sonataStackExecutionReview20260911.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';

test('completed S03/S10 review leaves both profile dependencies pending and removes only their false actionable entries', () => {
  const queue = buildProfileExecutionWorkQueue();
  const originalIds = queue.edges.map(edge => edge.pendingExecutionId);
  const database = buildCharacterDatabase();
  assert.deepEqual(review.closesPendingExecutionIds, []);
  for (const contract of review.contracts) {
    const edge = queue.edges.find(edge => edge.pendingExecutionId === contract.pendingExecutionId);
    assert.ok(edge);
    assert.equal(edge.semanticStatus, 'BLOCKED_SOURCE_SEMANTICS');
    assert.equal(edge.primitiveId, null);
    assert.equal(edge.blockerId, contract.blockerId);
    assert.ok(!queue.actionableSharedQueue.some(group => group.pendingExecutionIds.includes(contract.pendingExecutionId)));
    const preset = database.profiles.presets.find(preset => preset.id === edge.presetId)!;
    const rotation = database.profiles.rotations.find(rotation => rotation.id === preset.rotationProfileId)!;
    assert.equal(rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
    assert.equal(rotation.rotationSeconds, undefined);
  }
  assert.equal(originalIds.length, 83);
  assert.equal(new Set(originalIds).size, 72);
  assert.equal(database.referenceTeam01.unresolvedDependencies.length, 6);
  assert.deepEqual(database.characters.filter(c => c.readiness?.disposition === 'DPS_READY').map(c => c.id).sort(), ['augusta', 'ciaccona']);
});
