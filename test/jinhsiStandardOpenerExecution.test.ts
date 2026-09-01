import assert from 'node:assert/strict';
import test from 'node:test';

import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';
import {
  JINHSI_STANDARD_OPENER_COMBAT_START_SOURCE_REVIEW,
} from '../src/combat/jinhsiStandardOpenerCombatStartState.ts';
import { JINHSI_STANDARD_OPENER_ACTION_MAP, getJinhsiStandardOpenerStateSnapshots } from '../src/combat/jinhsiStandardOpenerState.ts';
import { JINHSI_STANDARD_OPENER_UNISON_PENDING_EXECUTION_ID } from '../src/combat/jinhsiStandardOpenerUnisonAdapter.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';
import { JINHSI_STANDARD_OPENER_EXECUTION_REVIEW_20260901 as review } from '../src/data/jinhsiStandardOpenerExecutionReview20260901.ts';
import { JINHSI_JUE_RANK5_ATTACK_20260901, JINHSI_JUE_REPEATED_SKILL_DAMAGE_20260901, JINHSI_JUE_SKILL_BONUS_20260901 } from '../src/data/jinhsiJueFacts20260901.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { totalMotionValue } from '../src/echoAttackDomain.ts';

const AH_INTRO_PENDING_ID = 'weapon:ages-of-harvest:AH-INTRO:trigger-uptime-adapter';
const AH_SKILL_PENDING_ID = 'weapon:ages-of-harvest:AH-SKILL:trigger-uptime-adapter';
const CELESTIAL_INTRO_PENDING_ID = 'sonata:sonata-5:S05_5PC_SPECTRO:trigger-uptime-adapter';
const TEAM_INCOMING_PENDING_ID = 'team:jinhsi-zhezhi-verina:incoming-state-adapter';

test('Jinhsi canonical profile remains Standard Opener source sequence only', () => {
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, 'jinhsi-standard-opener');
  assert.equal(resolved.preset.modeKey, 'standard-opener');
  assert.equal(resolved.rotation.variantKey, 'standard-opener');
  assert.equal(resolved.weaponRecommendation.defaultWeaponId, 'ages-of-harvest');
  assert.equal(resolved.echoLoadout.mainEchoId, 'echo-60000595');
  assert.deepEqual(resolved.echoLoadout.sonataSetIds, ['sonata-5']);
  assert.equal(resolved.team.id, 'jinhsi-zhezhi-verina');
  assert.equal(resolved.rotation.id, 'jinhsi-standard-opener-source-sequence');
  if (resolved.rotation.executionStatus !== 'SOURCE_SEQUENCE_ONLY') {
    assert.fail(`expected SOURCE_SEQUENCE_ONLY, got ${resolved.rotation.executionStatus}`);
  }
  assert.equal(resolved.rotation.engineModelId, undefined);
  assert.deepEqual(
    resolved.rotation.sourceSequence,
    JINHSI_STANDARD_OPENER_ACTION_MAP.map((row) => row.sourceStep),
  );
});

test('Jinhsi opener state map preserves Incarnation gates, unresolved Incandescence and source-proven first Unison path', () => {
  const snapshots = getJinhsiStandardOpenerStateSnapshots();
  assert.equal(snapshots.length, 12);
  assert.equal(snapshots[3]?.phaseAfter, 'OVERFLOWING_AVAILABLE');
  assert.equal(snapshots[4]?.phaseAfter, 'INCARNATION');
  assert.equal(snapshots[5]?.phaseAfter, 'INCARNATION');
  assert.equal(snapshots[9]?.phaseAfter, 'ORDINATION_GLOW');
  assert.equal(snapshots[10]?.phaseAfter, 'POST_ILLUMINOUS');
  assert.equal(snapshots[11]?.phaseAfter, 'OUTRO_REQUESTED');
  assert.ok(snapshots.every((row) => row.incandescence === 'UNRESOLVED_PREDECESSOR_STATE'));
  assert.ok(snapshots.slice(0, 10).every((row) => row.unisonAvailability === 'NOT_YET_GRANTED_IN_COMBAT_START_OPENER'));
  assert.equal(snapshots[10]?.unisonAvailability, 'AVAILABLE_FROM_FIRST_ILLUMINOUS');
  assert.equal(snapshots[11]?.unisonAvailability, 'CONSUMED_BY_CANONICAL_UNISON_OUTRO');
});

test('Ages Intro, Celestial 5P and teammate incoming state are source-proven inactive in the combat-start opener', () => {
  const ages = WEAPON_EFFECT_CATALOG.filter((row) => row.weaponId === 'ages-of-harvest');
  assert.deepEqual(ages.map((row) => row.effectId), ['AH-ATTR', 'AH-INTRO', 'AH-SKILL']);
  assert.equal(ages.find((row) => row.effectId === 'AH-ATTR')?.rankValues[0], 0.12);
  assert.equal(ages.find((row) => row.effectId === 'AH-INTRO')?.rankValues[0], 0.24);
  assert.equal(ages.find((row) => row.effectId === 'AH-INTRO')?.durationSeconds, 12);
  assert.equal(ages.find((row) => row.effectId === 'AH-SKILL')?.rankValues[0], 0.24);
  assert.equal(ages.find((row) => row.effectId === 'AH-SKILL')?.durationSeconds, 12);

  const celestial2 = SONATA_EFFECT_MODELS.find((row) => row.effectId === 'S05_2PC_SPECTRO')!;
  const celestial5 = SONATA_EFFECT_MODELS.find((row) => row.effectId === 'S05_5PC_SPECTRO')!;
  assert.equal(celestial2.value, 0.1);
  assert.equal(celestial2.effectType, 'PERMANENT');
  assert.equal(celestial5.value, 0.3);
  assert.equal(celestial5.trigger, 'Cast Intro Skill');
  assert.equal(celestial5.durationSeconds, 15);
  assert.equal(review.weapon.introWindow.canonicalTriggerPresent, false);
  assert.equal(review.weapon.introWindow.canonicalState, 'SOURCE_PROVEN_INACTIVE_COMBAT_START_NO_INTRO');
  assert.equal(review.celestialLight.fivePiece.canonicalTriggerPresent, false);
  assert.equal(review.celestialLight.fivePiece.canonicalState, 'SOURCE_PROVEN_INACTIVE_COMBAT_START_NO_INTRO');
  assert.equal(review.incomingTeamState.openerTeamBuffState, 'SOURCE_PROVEN_PRE_TEAM_SETUP_NO_ACTIVE_INCOMING_WINDOW');
  assert.equal(review.incomingTeamState.dependencyClosed, true);
  assert.deepEqual(JINHSI_STANDARD_OPENER_COMBAT_START_SOURCE_REVIEW.closesPendingExecutionIds, [
    AH_INTRO_PENDING_ID,
    CELESTIAL_INTRO_PENDING_ID,
    TEAM_INCOMING_PENDING_ID,
  ]);
});

test('Jué Rank-5 facts are exact but current free-flow source does not pin cast presence or absence in the opener', () => {
  const active = JINHSI_JUE_RANK5_ATTACK_20260901.attacks[0]!;
  assert.equal(JINHSI_JUE_RANK5_ATTACK_20260901.echoId, 'echo-60000595');
  assert.equal(JINHSI_JUE_RANK5_ATTACK_20260901.cooldownSeconds, 20);
  assert.deepEqual(active.components, [
    { motionValuePerHit: 0.4864, hits: 1 },
    { motionValuePerHit: 0.1946, hits: 5 },
    { motionValuePerHit: 0.4864, hits: 2 },
  ]);
  assert.ok(Math.abs(totalMotionValue(active) - 2.4322) < 1e-12);
  assert.equal(JINHSI_JUE_SKILL_BONUS_20260901.value, 0.16);
  assert.equal(JINHSI_JUE_SKILL_BONUS_20260901.durationSeconds, 15);
  assert.equal(JINHSI_JUE_REPEATED_SKILL_DAMAGE_20260901.motionValuePerProc, 0.16);
  assert.equal(JINHSI_JUE_REPEATED_SKILL_DAMAGE_20260901.minimumProcIntervalSeconds, 1);
  assert.equal(review.jue.primitiveId, 'jue-blessing-state-v1');
  assert.equal(review.jue.canonicalCastPresent, null);
  assert.equal(review.jue.runtimeContributionAuthorized, false);
});

test('opener-only denominator and ER gate remain unresolved despite four narrow source closures', () => {
  assert.equal(review.rotationSeconds, null);
  assert.equal(review.outputContract.exactOpenerDamage, false);
  assert.equal(review.outputContract.exactOpenerDuration, false);
  assert.equal(review.outputContract.openerWindowDps, false);
  assert.equal(review.outputContract.sustainedLoopDps, false);
  assert.deepEqual(review.energyRegen.sourceRange, { minimum: 1, maximum: 1.25 });
  assert.equal(review.energyRegen.exactHardGate, null);
  assert.equal(review.engineModeled, false);
  assert.equal(review.dpsReady, false);
  assert.equal(review.product.personalRotationDpsAuthorized, false);
  assert.equal(review.product.rollAssistPolicyAuthorized, false);
  assert.deepEqual(review.closesPendingExecutionIds, [
    JINHSI_STANDARD_OPENER_UNISON_PENDING_EXECUTION_ID,
    AH_INTRO_PENDING_ID,
    CELESTIAL_INTRO_PENDING_ID,
    TEAM_INCOMING_PENDING_ID,
  ]);
  assert.equal(review.firstUnisonSourceClosure.firstIlluminousGrantReady, true);
  assert.equal(review.firstUnisonSourceClosure.canonicalOutroUsesUnison, true);
  assert.equal(review.firstUnisonSourceClosure.laterLoopTimingAuthorized, false);
  assert.equal(review.combatStartPrebuffSourceClosure.teamIncomingStateActiveInsideOpener, false);
  assert.equal(review.combatStartPrebuffSourceClosure.teamIncomingDependencyClosedForOpener, true);
  assert.equal(review.incomingTeamState.dependencyClosed, true);
});

test('only Incandescence remains timeline-covered while AH-SKILL and Jué are source-semantic blocked after four closures', () => {
  const impact = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'jinhsi-standard-opener');
  assert.ok(impact);
  assert.equal(impact.pendingExecutionIds.length, 4);
  for (const closedId of [
    JINHSI_STANDARD_OPENER_UNISON_PENDING_EXECUTION_ID,
    AH_INTRO_PENDING_ID,
    CELESTIAL_INTRO_PENDING_ID,
    TEAM_INCOMING_PENDING_ID,
  ]) {
    assert.equal(impact.pendingExecutionIds.includes(closedId), false);
  }

  const queue = buildProfileExecutionWorkQueue();
  const jinhsiEdges = queue.edges.filter((edge) => edge.presetId === 'jinhsi-standard-opener');
  assert.equal(jinhsiEdges.length, 4);
  assert.equal(jinhsiEdges.filter((edge) => edge.semanticStatus === 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE').length, 1);
  assert.equal(jinhsiEdges.filter((edge) => edge.semanticStatus === 'BLOCKED_SOURCE_SEMANTICS').length, 2);
  assert.equal(jinhsiEdges.filter((edge) => edge.semanticStatus === 'PROFILE_SPECIFIC_EXECUTION').length, 1);
  assert.ok(
    jinhsiEdges
      .filter((edge) => edge.semanticStatus === 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE')
      .every((edge) => Boolean(edge.primitiveId)),
  );
  const ahSkillEdge = jinhsiEdges.find((edge) => edge.pendingExecutionId === AH_SKILL_PENDING_ID);
  assert.equal(ahSkillEdge?.semanticStatus, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(ahSkillEdge?.blockerId, 'BUG-020');
  assert.equal(ahSkillEdge?.primitiveId, 'weapon-cast-timed-self-window-v1');
  const jueEdge = jinhsiEdges.find((edge) => edge.pendingExecutionId === 'echo:echo-60000595:jue-active-skill-and-blessing-adapter');
  assert.equal(jueEdge?.semanticStatus, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(jueEdge?.blockerId, 'BUG-020');
  assert.equal(jueEdge?.primitiveId, 'jue-blessing-state-v1');
  assert.equal(
    jinhsiEdges.find((edge) => edge.pendingExecutionId === 'rotation:jinhsi-standard-opener-source-sequence:engine-model')?.semanticStatus,
    'PROFILE_SPECIFIC_EXECUTION',
  );
});

test('Jinhsi backward-impact review keeps remaining execution blockers open and BuildContext fails closed', () => {
  const impact = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'jinhsi-standard-opener');
  assert.ok(impact);
  assert.equal(impact.result, 'REVIEWED_WITH_PENDING_EXECUTION');
  assert.deepEqual(impact.pendingExecutionIds, [
    'weapon:ages-of-harvest:AH-SKILL:trigger-uptime-adapter',
    'echo:echo-60000595:jue-active-skill-and-blessing-adapter',
    'character:jinhsi:jinhsi-forte-incandescence-damage-multiplier:resource-timeline-adapter',
    'rotation:jinhsi-standard-opener-source-sequence:engine-model',
  ]);
  assert.equal(review.availableEventStatePrimitives.jinhsiResourceState, 'jinhsi-resource-state-v1');
  assert.equal(review.availableEventStatePrimitives.combatStartPrebuff, 'jinhsi-standard-opener-combat-start-prebuff-v1');
  assert.equal(review.availableEventStatePrimitives.firstStandardOpenerUnison, 'jinhsi-standard-opener-first-unison-v1');
  assert.equal(review.availableEventStatePrimitives.jueBlessingState, 'jue-blessing-state-v1');
  assert.equal(review.availableEventStatePrimitives.teamIncomingState, 'jinhsi-team-incoming-state-v1');
  assert.throws(
    () => buildContextFromVerifiedPreset('jinhsi-standard-opener', []),
    /not ENGINE_MODELED/,
  );
});