import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveExactEchoActiveDamage } from '../src/combat/echoActiveDamageAdapter.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS } from '../src/data/profileHorizontalGreenLane20260830.ts';
import {
  JIYAN_STANDARD_EXECUTION_REVIEW_20260831,
  JIYAN_STANDARD_PENDING_EXECUTION_IDS,
} from '../src/data/jiyanExecutionClosure20260831.ts';
import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';

test('Nightmare Kelpie active strike uses the existing exact active-cast primitive without timing inference', () => {
  const resolved = resolveExactEchoActiveDamage('echo-60001135', 'NIGHTMARE_KELPIE_ACTIVE_STRIKE');
  assert.equal(resolved.echoId, 'echo-60001135');
  assert.equal(resolved.attackId, 'NIGHTMARE_KELPIE_ACTIVE_STRIKE');
  assert.equal(resolved.element, 'Glacio');
  assert.equal(resolved.scalingStat, 'ATK');
  assert.equal(resolved.motionValue, 4.05);
  assert.equal(Object.hasOwn(resolved, 'timestamp'), false);
  assert.equal(Object.hasOwn(resolved, 'uptime'), false);
});

test('Nightmare Kelpie Outro auto-summon is exact attack data but is not reinterpreted as ACTIVE_CAST', () => {
  assert.throws(
    () => resolveExactEchoActiveDamage('echo-60001135', 'NIGHTMARE_KELPIE_OUTRO_SUMMON'),
    /not an ACTIVE_CAST attack/,
  );
});

test('Jiyan backward-impact review exposes the exact pending execution boundary', () => {
  const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'jiyan-standard');
  assert.ok(review);
  assert.equal(review.reviewId, 'PROFILE-IMPACT-JIYAN-STANDARD-2026-08-31-01');
  assert.equal(review.result, 'REVIEWED_WITH_PENDING_EXECUTION');
  assert.deepEqual(review.pendingExecutionIds, JIYAN_STANDARD_PENDING_EXECUTION_IDS);
  assert.deepEqual(review.reviewedWeaponEffectIds, ['VS-ATTR', 'VS-HEAVY']);
  assert.deepEqual(review.reviewedSonataSetIds, ['sonata-17']);
  assert.deepEqual(review.reviewedEchoIds, ['echo-60001135']);
});

test('Jiyan execution review parks source drift, timing, character state, teammate state and ER precision', () => {
  const review = JIYAN_STANDARD_EXECUTION_REVIEW_20260831;
  assert.equal(review.disposition, 'SOURCE_SEMANTICS_BLOCKED');
  assert.equal(review.blockerId, 'BUG-016');
  assert.equal(review.rotationSeconds, null);
  assert.deepEqual(review.reviewedPendingExecutionIds, JIYAN_STANDARD_PENDING_EXECUTION_IDS);
  assert.deepEqual(review.closesPendingExecutionIds, []);
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('Transform Active Skill is not used')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('eight source-defined P1 hits')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('starting Resolve')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('Iuno -> Jiyan')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('Ciaccona -> Jiyan')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('around 117% Energy Regen')));
});

test('jiyan-standard remains SOURCE_SEQUENCE_ONLY and cannot cross the BuildContext gate', () => {
  const rotation = PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS.find((row) => row.id === 'jiyan-standard-rotation');
  assert.ok(rotation);
  assert.equal(rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(Object.hasOwn(rotation, 'rotationSeconds'), false);
  assert.equal(Object.hasOwn(rotation, 'engineModelId'), false);
  assert.throws(
    () => buildContextFromVerifiedPreset('jiyan-standard', []),
    /rotation jiyan-standard-rotation is not ENGINE_MODELED/,
  );
});
