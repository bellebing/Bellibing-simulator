import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW,
  validateFallacyActiveDamageSemanticReview,
} from '../src/combat/fallacyActiveDamageSemanticReview.ts';
import { IMPERMANENCE_HERON_TRANSFER_DISPOSITION } from '../src/combat/echoTransferWindowAdapter.ts';
import { SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT } from '../src/combat/sonataOutroTransferAdapter.ts';
import { WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT } from '../src/combat/weaponCastWindowAdapter.ts';
import {
  validateWeaponSkillStackSemanticReview,
  WEAPON_SKILL_STACK_SEMANTIC_REVIEW,
} from '../src/combat/weaponSkillStackSemanticReview.ts';
import {
  buildProfileExecutionWorkQueue,
  EXECUTION_SEMANTIC_REVIEWS,
  validateExecutionSemanticReviews,
} from '../src/profileExecutionWorkQueue.ts';

test('semantic execution review catalog is derived from reviewed implementation/source artifacts', () => {
  assert.deepEqual(validateExecutionSemanticReviews(), []);
  assert.deepEqual(validateWeaponSkillStackSemanticReview(), []);
  assert.deepEqual(validateFallacyActiveDamageSemanticReview(), []);
  assert.equal(EXECUTION_SEMANTIC_REVIEWS.length, 12);

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

  for (const contract of WEAPON_SKILL_STACK_SEMANTIC_REVIEW.contracts) {
    const review = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === contract.pendingExecutionId);
    assert.equal(review?.status, 'BLOCKED_SOURCE_SEMANTICS');
    assert.equal(review?.actionKey, contract.actionKey);
    assert.equal(review?.blockerId, 'BUG-009');
  }

  const heron = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === IMPERMANENCE_HERON_TRANSFER_DISPOSITION.pendingExecutionId);
  assert.equal(heron?.status, 'BLOCKED_SOURCE_CONFLICT');
  assert.equal(heron?.blockerId, 'BUG-008');

  const fallacy = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.pendingExecutionId);
  assert.equal(fallacy?.status, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(fallacy?.actionKey, 'echo:fallacy-cast-variant-resolution');
  assert.equal(fallacy?.blockerId, 'BUG-010');

  const woodland = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === 'weapon:woodland-aria:WA-AERO:trigger-uptime-adapter');
  assert.equal(woodland?.status, 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING');
  assert.equal(woodland?.actionKey, 'weapon:aero-erosion-application-state');
});

test('skill-stack syntactic family is semantically split before runtime implementation', () => {
  assert.equal(WEAPON_SKILL_STACK_SEMANTIC_REVIEW.contracts.length, 2);
  const stringmaster = WEAPON_SKILL_STACK_SEMANTIC_REVIEW.contracts.find((row) => row.effectId === 'SM-ATK');
  const rime = WEAPON_SKILL_STACK_SEMANTIC_REVIEW.contracts.find((row) => row.effectId === 'RDS-BASIC-STACK');
  assert.ok(stringmaster);
  assert.ok(rime);
  assert.equal(stringmaster.triggerSemantic, 'RESONANCE_SKILL_DAMAGE');
  assert.equal(stringmaster.durationSeconds, 5);
  assert.equal(stringmaster.maxStacks, 2);
  assert.equal(rime.triggerSemantic, 'RESONANCE_SKILL_USE_WHILE_ON_FIELD');
  assert.equal(rime.durationSeconds, 6);
  assert.equal(rime.maxStacks, 3);
  assert.deepEqual(WEAPON_SKILL_STACK_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
  assert.ok(stringmaster.unresolvedSemantics.some((note) => note.includes('refresh')));
  assert.ok(rime.unresolvedSemantics.some((note) => note.includes('refresh')));
});

test('Fallacy exact attack coverage remains separate from supported-profile cast variant execution', () => {
  assert.equal(FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.status, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.blockerId, 'BUG-010');
  assert.equal(FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.implementedAttackId, 'FALLACY_INITIAL_BLAST');
  assert.deepEqual(FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
  assert.deepEqual([...FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.profileContexts].sort(), [
    'chisa-standard',
    'shorekeeper-augusta-support',
  ]);
  assert.ok(FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.unresolvedSemantics.some((note) => note.includes('Hold Echo Skill')));
  assert.ok(FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.unresolvedSemantics.some((note) => note.includes('normal tap/default variant')));
});

test('current 76-edge matrix is partitioned into actionable, covered, blocked and profile-specific work without authorizing execution', () => {
  const queue = buildProfileExecutionWorkQueue();
  assert.equal(queue.authorizesExecution, false);
  assert.deepEqual(queue.summary, {
    totalEdges: 76,
    unreviewedEdges: 39,
    semanticallyReviewedImplementationPendingEdges: 1,
    primitiveAvailableRequiresTimelineEdges: 9,
    blockedSourceConflictEdges: 5,
    blockedSourceSemanticsEdges: 5,
    profileSpecificExecutionEdges: 17,
    actionableSharedEdges: 40,
  });
  assert.equal(
    queue.summary.unreviewedEdges
      + queue.summary.semanticallyReviewedImplementationPendingEdges
      + queue.summary.primitiveAvailableRequiresTimelineEdges
      + queue.summary.blockedSourceConflictEdges
      + queue.summary.blockedSourceSemanticsEdges
      + queue.summary.profileSpecificExecutionEdges,
    queue.summary.totalEdges,
  );
});

test('actionable queue removes already-covered, closed and source-blocked high-fanout families', () => {
  const queue = buildProfileExecutionWorkQueue();
  const actionableIds = new Set(queue.actionableSharedQueue.flatMap((row) => row.pendingExecutionIds));

  for (const id of WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.castWindowPendingExecutionIds) assert.equal(actionableIds.has(id), false);
  for (const id of SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT.directOutroPendingExecutionIds) assert.equal(actionableIds.has(id), false);
  for (const contract of WEAPON_SKILL_STACK_SEMANTIC_REVIEW.contracts) assert.equal(actionableIds.has(contract.pendingExecutionId), false);
  assert.equal(actionableIds.has(IMPERMANENCE_HERON_TRANSFER_DISPOSITION.pendingExecutionId), false);
  assert.equal(actionableIds.has(FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.pendingExecutionId), false);
  assert.equal(actionableIds.has('echo:echo-60001065:fleurdelys-character-restriction-adapter'), false);
  assert.equal(queue.actionableSharedQueue.some((row) => row.actionKey === 'weapon:skill-stack-timing-adapter'), false);
  assert.equal(queue.actionableSharedQueue.some((row) => row.actionKey === 'echo:fallacy-active-skill-damage-adapter'), false);
  assert.equal(queue.actionableSharedQueue.some((row) => row.actionKey === 'echo:fleurdelys-character-restriction-adapter'), false);

  const woodland = queue.actionableSharedQueue.find((row) => row.actionKey === 'weapon:aero-erosion-application-state');
  assert.ok(woodland);
  assert.equal(woodland.semanticStatus, 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING');
  assert.equal(woodland.profileCount, 1);
  assert.equal(woodland.dependencyCount, 1);
});

test('remaining shared fanout is machine-ranked so the next semantic slices do not require manual 76-edge triage', () => {
  const queue = buildProfileExecutionWorkQueue();
  for (let index = 1; index < queue.actionableSharedQueue.length; index += 1) {
    assert.ok(queue.actionableSharedQueue[index - 1].profileCount >= queue.actionableSharedQueue[index].profileCount);
  }

  assert.equal(queue.actionableSharedQueue[0]?.actionKey, 'sonata:trigger-stack-adapter');

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

test('covered and blocked queues remain separate and retain exact fanout', () => {
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

  const stringmaster = queue.blockedSourceSemantics.find((row) => row.actionKey === 'weapon:stringmaster-skill-damage-stack-lifecycle');
  assert.ok(stringmaster);
  assert.equal(stringmaster.dependencyCount, 1);
  assert.equal(stringmaster.profileCount, 1);
  assert.deepEqual(stringmaster.blockerIds, ['BUG-009']);

  const rime = queue.blockedSourceSemantics.find((row) => row.actionKey === 'weapon:rime-on-field-skill-use-stack-lifecycle');
  assert.ok(rime);
  assert.equal(rime.dependencyCount, 2);
  assert.equal(rime.profileCount, 2);
  assert.equal(rime.characterCount, 1);
  assert.deepEqual(rime.blockerIds, ['BUG-009']);

  const fallacy = queue.blockedSourceSemantics.find((row) => row.actionKey === 'echo:fallacy-cast-variant-resolution');
  assert.ok(fallacy);
  assert.equal(fallacy.dependencyCount, 2);
  assert.equal(fallacy.profileCount, 2);
  assert.equal(fallacy.characterCount, 2);
  assert.deepEqual(fallacy.blockerIds, ['BUG-010']);

  assert.equal(queue.profileSpecificExecution.length, 1);
  assert.equal(queue.profileSpecificExecution[0].actionKey, 'rotation:engine-model');
  assert.equal(queue.profileSpecificExecution[0].dependencyCount, 17);
  assert.equal(queue.profileSpecificExecution[0].profileCount, 17);
});

test('semantic review validation rejects duplicate, non-canonical and untracked blocker rows', () => {
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

  const missingBlocker = [{
    pendingExecutionId: WEAPON_SKILL_STACK_SEMANTIC_REVIEW.contracts[0].pendingExecutionId,
    status: 'BLOCKED_SOURCE_SEMANTICS' as const,
    actionKey: 'weapon:test-blocked',
    reviewedAt: '2026-08-30',
    notes: ['test'],
  }];
  assert.ok(validateExecutionSemanticReviews(undefined, missingBlocker).some((issue) => issue.includes('requires blockerId')));
});
