import assert from 'node:assert/strict';
import test from 'node:test';

import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';
import { JINHSI_STANDARD_OPENER_ACTION_MAP, getJinhsiStandardOpenerStateSnapshots } from '../src/combat/jinhsiStandardOpenerState.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';
import { JINHSI_STANDARD_OPENER_EXECUTION_REVIEW_20260901 as review } from '../src/data/jinhsiStandardOpenerExecutionReview20260901.ts';
import { JINHSI_JUE_RANK5_ATTACK_20260901, JINHSI_JUE_REPEATED_SKILL_DAMAGE_20260901, JINHSI_JUE_SKILL_BONUS_20260901 } from '../src/data/jinhsiJueFacts20260901.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { totalMotionValue } from '../src/echoAttackDomain.ts';

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

test('Jinhsi opener state map preserves Incarnation gates without fabricating resources', () => {
  const snapshots = getJinhsiStandardOpenerStateSnapshots();
  assert.equal(snapshots.length, 12);
  assert.equal(snapshots[3]?.phaseAfter, 'OVERFLOWING_AVAILABLE');
  assert.equal(snapshots[4]?.phaseAfter, 'INCARNATION');
  assert.equal(snapshots[5]?.phaseAfter, 'INCARNATION');
  assert.equal(snapshots[9]?.phaseAfter, 'ORDINATION_GLOW');
  assert.equal(snapshots[10]?.phaseAfter, 'POST_ILLUMINOUS');
  assert.equal(snapshots[11]?.phaseAfter, 'OUTRO_REQUESTED');
  assert.ok(snapshots.every((row) => row.incandescence === 'UNRESOLVED_PREDECESSOR_STATE'));
  assert.ok(snapshots.every((row) => row.unisonAvailability === 'UNRESOLVED_PREDECESSOR_STATE'));
});

test('Ages of Harvest and Celestial Light facts stay event-bound', () => {
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
  assert.equal(review.celestialLight.fivePiece.canonicalTriggerPresent, false);
  assert.equal(review.weapon.introWindow.canonicalTriggerPresent, false);
});

test('Jué Rank-5 facts are exact but not automatically active in the opener', () => {
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
  assert.equal(review.jue.canonicalCastPresent, false);
  assert.equal(review.jue.runtimeContributionAuthorized, false);
});

test('opener-only denominator and ER gate remain explicitly unresolved', () => {
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
  assert.deepEqual(review.closesPendingExecutionIds, []);
});

test('seven reusable Jinhsi execution edges have primitives while all eight dependencies remain open', () => {
  const impact = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'jinhsi-standard-opener');
  assert.ok(impact);
  assert.equal(impact.pendingExecutionIds.length, 8);

  const queue = buildProfileExecutionWorkQueue();
  const jinhsiEdges = queue.edges.filter((edge) => edge.presetId === 'jinhsi-standard-opener');
  assert.equal(jinhsiEdges.length, 8);
  assert.equal(jinhsiEdges.filter((edge) => edge.semanticStatus === 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE').length, 7);
  assert.equal(jinhsiEdges.filter((edge) => edge.semanticStatus === 'PROFILE_SPECIFIC_EXECUTION').length, 1);
  assert.ok(
    jinhsiEdges
      .filter((edge) => edge.semanticStatus === 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE')
      .every((edge) => Boolean(edge.primitiveId)),
  );
  assert.equal(
    jinhsiEdges.find((edge) => edge.pendingExecutionId === 'rotation:jinhsi-standard-opener-source-sequence:engine-model')?.semanticStatus,
    'PROFILE_SPECIFIC_EXECUTION',
  );
  assert.deepEqual(review.closesPendingExecutionIds, []);
});

test('Jinhsi backward-impact review keeps execution blockers open and BuildContext fails closed', () => {
  const impact = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'jinhsi-standard-opener');
  assert.ok(impact);
  assert.equal(impact.result, 'REVIEWED_WITH_PENDING_EXECUTION');
  assert.ok(impact.pendingExecutionIds.includes('rotation:jinhsi-standard-opener-source-sequence:engine-model'));
  assert.ok(impact.pendingExecutionIds.includes('team:jinhsi-zhezhi-verina:incoming-state-adapter'));
  assert.equal(review.availableEventStatePrimitives.jinhsiResourceState, 'jinhsi-resource-state-v1');
  assert.equal(review.availableEventStatePrimitives.jueBlessingState, 'jue-blessing-state-v1');
  assert.equal(review.availableEventStatePrimitives.teamIncomingState, 'jinhsi-team-incoming-state-v1');
  assert.throws(
    () => buildContextFromVerifiedPreset('jinhsi-standard-opener', []),
    /not ENGINE_MODELED/,
  );
});
