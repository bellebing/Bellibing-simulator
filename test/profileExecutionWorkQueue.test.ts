import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW,
  validateBlazingBrillianceStackSemanticReview,
} from '../src/combat/blazingBrillianceStackSemanticReview.ts';
import {
  FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW,
  validateFallacyActiveDamageSemanticReview,
} from '../src/combat/fallacyActiveDamageSemanticReview.ts';
import { IMPERMANENCE_HERON_TRANSFER_DISPOSITION } from '../src/combat/echoTransferWindowAdapter.ts';
import {
  SONATA_CAST_WINDOW_SEMANTIC_SPLIT,
  validateSonataCastWindowContracts,
} from '../src/combat/sonataCastWindowAdapter.ts';
import { SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT } from '../src/combat/sonataOutroTransferAdapter.ts';
import { WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT } from '../src/combat/weaponCastWindowAdapter.ts';
import {
  validateWeaponSkillStackSemanticReview,
  WEAPON_SKILL_STACK_SEMANTIC_REVIEW,
} from '../src/combat/weaponSkillStackSemanticReview.ts';
import { ROVER_AERO_STANDARD_ROTATION_EXECUTION_REVIEW_20260830 } from '../src/data/profileExecutionSemanticReview20260830.ts';
import {
  ROVER_HAVOC_EXECUTION_PREFLIGHT_20260831,
  ROVER_HAVOC_EXECUTION_SOURCE_BLOCKER_ID,
  ROVER_HAVOC_PENDING_EXECUTION_IDS,
} from '../src/data/roverHavocExecutionPreflight20260831.ts';
import {
  buildProfileExecutionWorkQueue,
  EXECUTION_SEMANTIC_REVIEWS,
  validateExecutionSemanticReviews,
} from '../src/profileExecutionWorkQueue.ts';

test('semantic execution review catalog is derived from reviewed implementation/source artifacts', () => {
  assert.deepEqual(validateExecutionSemanticReviews(), []);
  assert.deepEqual(validateWeaponSkillStackSemanticReview(), []);
  assert.deepEqual(validateBlazingBrillianceStackSemanticReview(), []);
  assert.deepEqual(validateSonataCastWindowContracts(), []);
  assert.deepEqual(validateFallacyActiveDamageSemanticReview(), []);
  assert.equal(EXECUTION_SEMANTIC_REVIEWS.length, 24);

  for (const pendingExecutionId of WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.castWindowPendingExecutionIds) {
    const review = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === pendingExecutionId);
    assert.equal(review?.status, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
    assert.equal(review?.primitiveId, 'weapon-cast-timed-self-window-v1');
  }

  for (const pendingExecutionId of SONATA_CAST_WINDOW_SEMANTIC_SPLIT.pendingExecutionIds) {
    const review = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === pendingExecutionId);
    assert.equal(review?.status, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
    assert.equal(review?.primitiveId, 'sonata-cast-timed-self-window-v1');
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

  for (const contract of BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW.contracts) {
    const review = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === contract.pendingExecutionId);
    assert.equal(review?.status, 'BLOCKED_SOURCE_SEMANTICS');
    assert.equal(review?.actionKey, 'weapon:blazing-brilliance-searing-feather-state');
    assert.equal(review?.blockerId, 'BUG-013');
  }

  const heron = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === IMPERMANENCE_HERON_TRANSFER_DISPOSITION.pendingExecutionId);
  assert.equal(heron?.status, 'BLOCKED_SOURCE_CONFLICT');
  assert.equal(heron?.blockerId, 'BUG-008');

  const fallacy = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.pendingExecutionId);
  assert.equal(fallacy?.status, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(fallacy?.actionKey, 'echo:fallacy-cast-variant-resolution');
  assert.equal(fallacy?.blockerId, 'BUG-010');

  const woodland = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === 'weapon:woodland-aria:WA-AERO:trigger-uptime-adapter');
  assert.equal(woodland, undefined, 'closed Woodland Aria edge must not remain in the pending semantic-review catalog');

  const defiersThorn = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === 'weapon:defiers-thorn:DT-DEF:source-timing-adapter');
  assert.equal(defiersThorn?.status, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(defiersThorn?.actionKey, 'weapon:defiers-thorn-def-timing');
  assert.equal(defiersThorn?.blockerId, 'BUG-011');

  const roverHealing = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === 'weapon:bloodpacts-pledge:BPP-SKILL:healing-uptime-adapter');
  assert.equal(roverHealing?.status, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(roverHealing?.blockerId, 'BUG-012');

  const roverTeamAmp = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === 'weapon:bloodpacts-pledge:BPP-TEAM-AERO:unbound-flow-team-amplify-adapter');
  assert.equal(roverTeamAmp?.status, 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING');

  const fleurdelysActive = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === 'echo:echo-60001065:active-skill-damage-adapter');
  assert.equal(fleurdelysActive?.status, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(fleurdelysActive?.primitiveId, 'echo-active-damage-v1');

  const dreamlessActive = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === ROVER_HAVOC_PENDING_EXECUTION_IDS[3]);
  assert.equal(dreamlessActive?.status, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(dreamlessActive?.primitiveId, 'echo-active-damage-v1');

  const havocEclipse = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === ROVER_HAVOC_PENDING_EXECUTION_IDS[2]);
  assert.equal(havocEclipse?.status, 'BLOCKED_SOURCE_CONFLICT');
  assert.equal(havocEclipse?.blockerId, ROVER_HAVOC_EXECUTION_SOURCE_BLOCKER_ID);

  for (const pendingExecutionId of [
    ROVER_HAVOC_PENDING_EXECUTION_IDS[0],
    ROVER_HAVOC_PENDING_EXECUTION_IDS[1],
    ROVER_HAVOC_PENDING_EXECUTION_IDS[4],
    ROVER_HAVOC_PENDING_EXECUTION_IDS[5],
  ]) {
    const review = EXECUTION_SEMANTIC_REVIEWS.find((row) => row.pendingExecutionId === pendingExecutionId);
    assert.equal(review?.status, 'BLOCKED_SOURCE_SEMANTICS');
    assert.equal(review?.blockerId, ROVER_HAVOC_EXECUTION_SOURCE_BLOCKER_ID);
  }
});

test('Rover Aero source review parks exact timing instead of fabricating execution', () => {
  const review = ROVER_AERO_STANDARD_ROTATION_EXECUTION_REVIEW_20260830;
  assert.equal(review.disposition, 'SOURCE_SEMANTICS_BLOCKED');
  assert.equal(review.blockerId, 'BUG-012');
  assert.equal(review.rotationSeconds, null);
  assert.deepEqual(review.reviewedPendingExecutionIds, [
    'weapon:bloodpacts-pledge:BPP-SKILL:healing-uptime-adapter',
    'weapon:bloodpacts-pledge:BPP-TEAM-AERO:unbound-flow-team-amplify-adapter',
    'echo:echo-60001065:active-skill-damage-adapter',
    'rotation:rover-aero-cartethyia-ciaccona-standard:engine-model',
  ]);
  assert.deepEqual(review.closesPendingExecutionIds, []);
  assert.ok(review.sourceEstablished.some((note) => note.includes('Fleurdelys')));
  assert.ok(review.sourceEstablished.some((note) => note.includes('Unbound Flow P1')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('6-second BPP-SKILL')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('rotation duration')));
});

test('Rover Havoc preflight parks exact execution without inheriting Rover Aero BUG-012', () => {
  const review = ROVER_HAVOC_EXECUTION_PREFLIGHT_20260831;
  assert.equal(review.disposition, 'SOURCE_SEMANTICS_BLOCKED');
  assert.equal(review.sequence, 0);
  assert.equal(review.exactRotationDurationSeconds, null);
  assert.equal(review.exactEnergyRegenGate, null);
  assert.equal(review.sourceBackedEnergyRegenContext, 1.4);
  assert.equal(review.partialRollAssistPolicy, 'POLICY PENDING');
  assert.equal(review.dpsReadyCandidate, false);
  assert.equal(review.ownedBuildExecutable, false);
  assert.equal(review.alphaBindingAllowed, false);
  assert.deepEqual(review.pendingExecutionIds, ROVER_HAVOC_PENDING_EXECUTION_IDS);
  assert.equal(review.exactBlockers.some((note) => note.includes('BUG-012')), false);
  assert.ok(review.exactBlockers.some((note) => note.includes('total duration')));
  assert.ok(review.exactBlockers.some((note) => note.includes('140%+ ER')));
  assert.ok(review.sourceEstablished.some((note) => note.includes('Dreamless Rank-5')));
});

test('known stack families remain source-blocked when lifecycle semantics are incomplete', () => {
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

  assert.equal(BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW.contracts.length, 2);
  assert.deepEqual(BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
  assert.ok(BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW.contracts.every((row) => row.unresolvedSemantics.length > 0));
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

test('current 79-edge matrix is partitioned into actionable, covered, blocked and profile-specific work without authorizing execution', () => {
  const queue = buildProfileExecutionWorkQueue();
  assert.equal(queue.authorizesExecution, false);
  assert.deepEqual(queue.summary, {
    totalEdges: 79,
    unreviewedEdges: 30,
    semanticallyReviewedImplementationPendingEdges: 1,
    primitiveAvailableRequiresTimelineEdges: 12,
    blockedSourceConflictEdges: 6,
    blockedSourceSemanticsEdges: 13,
    profileSpecificExecutionEdges: 17,
    actionableSharedEdges: 31,
  });
  assert.equal(queue.reviewRecordCount, 24);
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

test('actionable queue removes already-covered, closed and source-blocked families including Rover Havoc', () => {
  const queue = buildProfileExecutionWorkQueue();
  const actionableIds = new Set(queue.actionableSharedQueue.flatMap((row) => row.pendingExecutionIds));

  for (const id of WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.castWindowPendingExecutionIds) assert.equal(actionableIds.has(id), false);
  for (const id of SONATA_CAST_WINDOW_SEMANTIC_SPLIT.pendingExecutionIds) assert.equal(actionableIds.has(id), false);
  for (const id of SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT.directOutroPendingExecutionIds) assert.equal(actionableIds.has(id), false);
  for (const contract of WEAPON_SKILL_STACK_SEMANTIC_REVIEW.contracts) assert.equal(actionableIds.has(contract.pendingExecutionId), false);
  for (const contract of BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW.contracts) assert.equal(actionableIds.has(contract.pendingExecutionId), false);
  for (const id of ROVER_HAVOC_PENDING_EXECUTION_IDS.slice(0, -1)) assert.equal(actionableIds.has(id), false);

  assert.equal(actionableIds.has(IMPERMANENCE_HERON_TRANSFER_DISPOSITION.pendingExecutionId), false);
  assert.equal(actionableIds.has(FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.pendingExecutionId), false);
  assert.equal(actionableIds.has('echo:echo-60001065:fleurdelys-character-restriction-adapter'), false);
  assert.equal(actionableIds.has('echo:echo-60001065:active-skill-damage-adapter'), false);
  assert.equal(actionableIds.has('weapon:bloodpacts-pledge:BPP-SKILL:healing-uptime-adapter'), false);
  assert.equal(actionableIds.has('weapon:bloodpacts-pledge:BPP-TEAM-AERO:unbound-flow-team-amplify-adapter'), true);
  assert.equal(actionableIds.has('weapon:woodland-aria:WA-AERO:trigger-uptime-adapter'), false);
  assert.equal(actionableIds.has('weapon:woodland-aria:WA-AERO-RES:target-state-adapter'), false);
  assert.equal(actionableIds.has('weapon:defiers-thorn:DT-AERO-AMP:target-state-adapter'), false);
  assert.equal(actionableIds.has('weapon:defiers-thorn:DT-DEF:source-timing-adapter'), false);
  assert.equal(actionableIds.has('sonata:sonata-2:S02_5PC_FUSION:trigger-uptime-adapter'), false);
  assert.equal(actionableIds.has('weapon:blazing-brilliance:BBR-SKILL:stack-lifecycle-adapter'), false);
  assert.equal(actionableIds.has('weapon:blazing-brilliance:BBR-SKILL-CAST-STACKS:cross-effect-stack-mutation-adapter'), false);
  assert.equal(queue.actionableSharedQueue.some((row) => row.actionKey === 'weapon:skill-stack-timing-adapter'), false);
  assert.equal(queue.actionableSharedQueue.some((row) => row.actionKey === 'echo:fallacy-active-skill-damage-adapter'), false);
  assert.equal(queue.actionableSharedQueue.some((row) => row.actionKey === 'echo:fleurdelys-character-restriction-adapter'), false);
  assert.equal(queue.actionableSharedQueue.some((row) => row.actionKey === 'weapon:aero-erosion-application-state'), false);
});

test('remaining shared fanout is machine-ranked after Changli triage', () => {
  const queue = buildProfileExecutionWorkQueue();
  for (let index = 1; index < queue.actionableSharedQueue.length; index += 1) {
    assert.ok(queue.actionableSharedQueue[index - 1].profileCount >= queue.actionableSharedQueue[index].profileCount);
  }

  assert.equal(queue.actionableSharedQueue[0]?.actionKey, 'sonata:trigger-stack-adapter');
  const triggerStack = queue.actionableSharedQueue.find((row) => row.actionKey === 'sonata:trigger-stack-adapter');
  assert.ok(triggerStack);
  assert.equal(triggerStack.profileCount, 2);
  assert.equal(triggerStack.characterCount, 2);

  const remainingTriggerUptime = queue.actionableSharedQueue.find((row) => row.actionKey === 'sonata:trigger-uptime-adapter');
  assert.ok(remainingTriggerUptime);
  assert.equal(remainingTriggerUptime.profileCount, 1);
  assert.equal(remainingTriggerUptime.characterCount, 1);
});

test('covered and blocked queues retain exact fanout after Rover Havoc semantic review', () => {
  const queue = buildProfileExecutionWorkQueue();

  const weaponCast = queue.primitiveAvailableRequiresTimeline.find((row) => row.actionKey === 'weapon:cast-timed-self-window');
  assert.ok(weaponCast);
  assert.equal(weaponCast.dependencyCount, 5);
  assert.equal(weaponCast.profileCount, 4);

  const sonataCast = queue.primitiveAvailableRequiresTimeline.find((row) => row.actionKey === 'sonata:cast-timed-self-window');
  assert.ok(sonataCast);
  assert.equal(sonataCast.dependencyCount, 1);
  assert.equal(sonataCast.profileCount, 1);
  assert.deepEqual(sonataCast.primitiveIds, ['sonata-cast-timed-self-window-v1']);

  const sonataTransfer = queue.primitiveAvailableRequiresTimeline.find((row) => row.actionKey === 'sonata:direct-outro-incoming-transfer');
  assert.ok(sonataTransfer);
  assert.equal(sonataTransfer.dependencyCount, 4);
  assert.equal(sonataTransfer.profileCount, 4);

  const fleurdelysActive = queue.primitiveAvailableRequiresTimeline.find((row) => row.actionKey === 'echo:active-cast-exact-damage');
  assert.ok(fleurdelysActive);
  assert.equal(fleurdelysActive.dependencyCount, 1);
  assert.equal(fleurdelysActive.profileCount, 1);
  assert.deepEqual(fleurdelysActive.primitiveIds, ['echo-active-damage-v1']);

  const dreamlessActive = queue.primitiveAvailableRequiresTimeline.find((row) => row.actionKey === 'echo:dreamless-active-cast-exact-damage');
  assert.ok(dreamlessActive);
  assert.equal(dreamlessActive.dependencyCount, 1);
  assert.equal(dreamlessActive.profileCount, 1);
  assert.deepEqual(dreamlessActive.primitiveIds, ['echo-active-damage-v1']);

  const heron = queue.blockedSourceConflicts.find((row) => row.actionKey === 'echo:impermanence-heron-transfer');
  assert.ok(heron);
  assert.equal(heron.dependencyCount, 5);
  assert.equal(heron.profileCount, 5);
  assert.deepEqual(heron.blockerIds, ['BUG-008']);

  const havocEclipse = queue.blockedSourceConflicts.find((row) => row.actionKey === 'sonata:havoc-eclipse-five-piece-stack-state');
  assert.ok(havocEclipse);
  assert.equal(havocEclipse.dependencyCount, 1);
  assert.deepEqual(havocEclipse.blockerIds, [ROVER_HAVOC_EXECUTION_SOURCE_BLOCKER_ID]);

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

  const blazing = queue.blockedSourceSemantics.find((row) => row.actionKey === 'weapon:blazing-brilliance-searing-feather-state');
  assert.ok(blazing);
  assert.equal(blazing.dependencyCount, 2);
  assert.equal(blazing.profileCount, 1);
  assert.equal(blazing.characterCount, 1);
  assert.deepEqual(blazing.blockerIds, ['BUG-013']);

  const fallacy = queue.blockedSourceSemantics.find((row) => row.actionKey === 'echo:fallacy-cast-variant-resolution');
  assert.ok(fallacy);
  assert.equal(fallacy.dependencyCount, 2);
  assert.equal(fallacy.profileCount, 2);
  assert.equal(fallacy.characterCount, 2);
  assert.deepEqual(fallacy.blockerIds, ['BUG-010']);

  const defiersThorn = queue.blockedSourceSemantics.find((row) => row.actionKey === 'weapon:defiers-thorn-def-timing');
  assert.ok(defiersThorn);
  assert.equal(defiersThorn.dependencyCount, 1);
  assert.equal(defiersThorn.profileCount, 1);
  assert.deepEqual(defiersThorn.blockerIds, ['BUG-011']);

  const roverHealing = queue.blockedSourceSemantics.find((row) => row.actionKey === 'weapon:bloodpacts-pledge-healing-window-overlap');
  assert.ok(roverHealing);
  assert.equal(roverHealing.dependencyCount, 1);
  assert.equal(roverHealing.profileCount, 1);
  assert.deepEqual(roverHealing.blockerIds, ['BUG-012']);

  const roverHavocTeam = queue.blockedSourceSemantics.find((row) => row.actionKey === 'team:rover-havoc-roccia-shorekeeper-uptime');
  assert.ok(roverHavocTeam);
  assert.equal(roverHavocTeam.dependencyCount, 1);
  assert.deepEqual(roverHavocTeam.blockerIds, [ROVER_HAVOC_EXECUTION_SOURCE_BLOCKER_ID]);

  const roverTeamAmp = queue.actionableSharedQueue.find((row) => row.actionKey === 'weapon:bloodpacts-pledge-unbound-flow-team-amplify');
  assert.ok(roverTeamAmp);
  assert.equal(roverTeamAmp.semanticStatus, 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING');
  assert.equal(roverTeamAmp.dependencyCount, 1);

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
    pendingExecutionId: BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW.contracts[0].pendingExecutionId,
    status: 'BLOCKED_SOURCE_SEMANTICS' as const,
    actionKey: 'weapon:test-blocked',
    reviewedAt: '2026-08-30',
    notes: ['test'],
  }];
  assert.ok(validateExecutionSemanticReviews(undefined, missingBlocker).some((issue) => issue.includes('requires blockerId')));
});
