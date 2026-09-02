import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ZANI_DIRECT_HELIACAL_APPLICATION_FACT_IDS,
  ZANI_SPECTRO_FRAZZLE_TARGET_STATE_ADAPTER_ID,
  ZaniSpectroFrazzleTargetState,
} from '../src/combat/zaniSpectroFrazzleTargetState.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import {
  PROFILE_ZANI_EXECUTION_IMPACT_REVIEWS,
  ZANI_EXECUTION_BLOCKER_ID,
  ZANI_EXECUTION_PREFLIGHT_20260831,
  ZANI_PENDING_EXECUTION_IDS,
} from '../src/data/profileZaniExecutionImpact20260831.ts';
import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';

const TARGETED_ACTION = 'zani-resonance-skill-restless-watch-targeted-action-dmg' as const;

test('Zani target state converts only an explicit incoming Frazzle application and keeps SELF Blaze separate', () => {
  const target = new ZaniSpectroFrazzleTargetState('enemy-1');
  const converted = target.applyIncomingSpectroFrazzle({
    atSeconds: 1,
    targetId: 'enemy-1',
    sourceActorId: 'phoebe',
    sourceFactId: 'phoebe-confession-starflash-explicit-test-event',
    frazzleStacksOnTargetAfterApplication: 5,
  });

  assert.equal(converted.consumedSpectroFrazzleStacks, 5);
  assert.equal(converted.createdHeliacalEmberStacks, 5);
  assert.equal(converted.heliacalEmberExpiresAtSeconds, 7);
  assert.equal(converted.triggersSpectroFrazzleDamageResolution, true);
  assert.equal(converted.zaniSelfBlazeDelta, 25);

  const view = target.eternalRadianceView(1);
  assert.equal(view.spectroFrazzleStacks, 0, 'Frazzle application is atomically consumed by Zani conversion');
  assert.equal(view.heliacalEmberStacks, 5);
  assert.equal(view.effectiveFrazzleStacksForEternalRadiance, 5);
  assert.equal(view.attackTenStackConditionMet, false);
  assert.equal(view.provesInflictSpectroFrazzleTrigger, false);
});

test('Heliacal Ember uses independent six-second expiries and only counts as Frazzle for Eternal Radiance read semantics', () => {
  const target = new ZaniSpectroFrazzleTargetState('enemy-1');
  target.applyIncomingSpectroFrazzle({
    atSeconds: 1,
    targetId: 'enemy-1',
    sourceActorId: 'phoebe',
    sourceFactId: 'phoebe-event-a',
    frazzleStacksOnTargetAfterApplication: 5,
  });
  target.applyIncomingSpectroFrazzle({
    atSeconds: 2,
    targetId: 'enemy-1',
    sourceActorId: 'phoebe',
    sourceFactId: 'phoebe-event-b',
    frazzleStacksOnTargetAfterApplication: 6,
  });

  const direct = target.applyDirectZaniHeliacalEmber(2.5, TARGETED_ACTION);
  assert.equal(direct.createdHeliacalEmberStacks, 1);
  assert.equal(direct.zaniSelfBlazeDelta, 10);
  assert.equal(target.eternalRadianceView(2.5).effectiveFrazzleStacksForEternalRadiance, 12);
  assert.equal(target.eternalRadianceView(2.5).attackTenStackConditionMet, true);
  assert.equal(target.eternalRadianceView(2.5).provesInflictSpectroFrazzleTrigger, false);

  const atFirstExpiry = target.snapshot(7);
  assert.equal(atFirstExpiry.heliacalEmberStacks, 7);
  assert.equal(atFirstExpiry.nextHeliacalExpirySeconds, 8);
  assert.equal(target.snapshot(8).heliacalEmberStacks, 1);
  assert.equal(target.snapshot(8.5).heliacalEmberStacks, 0);
});

test('Zani target state fails closed on cap overflow, unreviewed direct application and target/timeline drift', () => {
  const target = new ZaniSpectroFrazzleTargetState('enemy-1');
  target.applyIncomingSpectroFrazzle({
    atSeconds: 0,
    targetId: 'enemy-1',
    sourceActorId: 'phoebe',
    sourceFactId: 'explicit-sixty-stack-test-event',
    frazzleStacksOnTargetAfterApplication: 60,
  });

  assert.throws(() => target.applyDirectZaniHeliacalEmber(1, TARGETED_ACTION), /overflow\/refresh ordering is not source-proven/);
  assert.throws(() => target.applyDirectZaniHeliacalEmber(1, 'not-reviewed' as never), /not reviewed/);
  assert.throws(() => target.applyIncomingSpectroFrazzle({
    atSeconds: 1,
    targetId: 'other-enemy',
    sourceActorId: 'phoebe',
    sourceFactId: 'test',
    frazzleStacksOnTargetAfterApplication: 1,
  }), /bound to enemy-1/);
  assert.throws(() => target.snapshot(0.5), /events must be monotonic/);
});

test('Beacon For the Future explicitly consumes live Heliacal Ember without assigning its modifier to a generic amplification bucket', () => {
  const target = new ZaniSpectroFrazzleTargetState('enemy-1');
  target.applyIncomingSpectroFrazzle({
    atSeconds: 1,
    targetId: 'enemy-1',
    sourceActorId: 'phoebe',
    sourceFactId: 'phoebe-event',
    frazzleStacksOnTargetAfterApplication: 5,
  });

  const consumed = target.consumeHeliacalEmberForBeaconForTheFuture(2);
  assert.equal(consumed.consumedHeliacalEmberStacks, 5);
  assert.equal(consumed.sourceDeclaredDamageModifierPerStack, 0.10);
  assert.equal(consumed.sourceDeclaredTotalDamageModifier, 0.50);
  assert.equal(target.snapshot(2).heliacalEmberStacks, 0);
});

test('Zani preflight registers exact pending execution boundaries and stays non-DPS-ready', () => {
  assert.equal(ZANI_EXECUTION_BLOCKER_ID, 'BUG-015');
  assert.equal(ZANI_SPECTRO_FRAZZLE_TARGET_STATE_ADAPTER_ID, 'zani-spectro-frazzle-target-state-v1');
  assert.deepEqual(ZANI_DIRECT_HELIACAL_APPLICATION_FACT_IDS, [
    'zani-resonance-skill-restless-watch-targeted-action-dmg',
    'zani-resonance-skill-restless-watch-forcible-riposte-dmg',
  ]);
  assert.equal(ZANI_PENDING_EXECUTION_IDS.length, 11);
  assert.ok(ZANI_PENDING_EXECUTION_IDS.includes('rotation:zani-standard-source-sequence:engine-model'));
  assert.ok(ZANI_PENDING_EXECUTION_IDS.includes('team:zani-phoebe-rover-spectro:incoming-spectro-frazzle-timeline-adapter'));
  assert.ok(ZANI_PENDING_EXECUTION_IDS.includes('stat:zani-standard-build-stats:er-team-timeline-review'));

  assert.equal(ZANI_EXECUTION_PREFLIGHT_20260831.engineModeled.canonicalRotationEngineModeled, false);
  assert.equal(ZANI_EXECUTION_PREFLIGHT_20260831.engineModeled.rotationSeconds, null);
  assert.equal(ZANI_EXECUTION_PREFLIGHT_20260831.energyRegenReview.sourceTargetMinimumTotal, 1.15);
  assert.equal(ZANI_EXECUTION_PREFLIGHT_20260831.energyRegenReview.mandatoryCanonicalProductGateProven, false);
  assert.equal(ZANI_EXECUTION_PREFLIGHT_20260831.buildContextBoundary.canResolveCanonicalPresetNow, false);
  assert.equal(ZANI_EXECUTION_PREFLIGHT_20260831.freezeBoundary.dpsReady, false);
  assert.equal(ZANI_EXECUTION_PREFLIGHT_20260831.freezeBoundary.freezeApproved, false);
  assert.equal(ZANI_EXECUTION_PREFLIGHT_20260831.freezeBoundary.productSupported, false);
});

test('canonical backward-impact catalog now contains the fail-closed Zani review', () => {
  assert.equal(PROFILE_ZANI_EXECUTION_IMPACT_REVIEWS.length, 1);
  const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'zani-standard');
  assert.ok(review);
  assert.equal(review.reviewId, 'PROFILE-IMPACT-ZANI-2026-08-31-01');
  assert.equal(review.result, 'REVIEWED_WITH_PENDING_EXECUTION');
  assert.deepEqual(review.pendingExecutionIds, ZANI_PENDING_EXECUTION_IDS);
});

test('generic BuildContext bridge continues to reject Zani while its rotation is SOURCE_SEQUENCE_ONLY', () => {
  assert.throws(
    () => buildContextFromVerifiedPreset('zani-standard', []),
    /rotation zani-standard-source-sequence is not ENGINE_MODELED/,
  );
});
