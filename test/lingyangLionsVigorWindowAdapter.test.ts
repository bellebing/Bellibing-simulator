import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateLingyangLionsVigorWindow,
  isLingyangLionsVigorWindowActive,
  LINGYANG_LIONS_VIGOR_WINDOW_SEMANTIC_REVIEW,
  validateLingyangLionsVigorWindowContract,
} from '../src/combat/lingyangLionsVigorWindowAdapter.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';

test("Lion's Vigor contract locks the source-backed Liberation self window without closing profile execution", () => {
  assert.deepEqual(validateLingyangLionsVigorWindowContract(), []);
  assert.equal(LINGYANG_LIONS_VIGOR_WINDOW_SEMANTIC_REVIEW.status, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(LINGYANG_LIONS_VIGOR_WINDOW_SEMANTIC_REVIEW.blockerId, 'BUG-017');
  assert.deepEqual(LINGYANG_LIONS_VIGOR_WINDOW_SEMANTIC_REVIEW.closesPendingExecutionIds, []);

  const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'lingyang-standard')!;
  for (const id of LINGYANG_LIONS_VIGOR_WINDOW_SEMANTIC_REVIEW.contributesToPendingExecutionIds) {
    assert.ok(review.pendingExecutionIds.includes(id));
  }
});

test("explicit Lingyang Liberation cast creates a 14s +50% Glacio / 0.5x Spirit-consumption window", () => {
  const window = activateLingyangLionsVigorWindow({
    ownerId: 'lingyang',
    event: {
      kind: 'RESONANCE_LIBERATION_CAST',
      actorId: 'lingyang',
      atSeconds: 10,
      actionFactId: 'lingyang-liberation-strive-lions-vigor',
    },
  });

  assert.ok(window);
  assert.equal(window.startedAtSeconds, 10);
  assert.equal(window.expiresAtSeconds, 24);
  assert.equal(window.glacioDamageBonus, 0.5);
  assert.equal(window.lionsSpiritConsumptionMultiplierDuringStridingLion, 0.5);
  assert.equal(isLingyangLionsVigorWindowActive(window, 10), true);
  assert.equal(isLingyangLionsVigorWindowActive(window, 23.999), true);
  assert.equal(isLingyangLionsVigorWindowActive(window, 24), false);
});

test("another actor's Liberation does not activate Lingyang's Lion's Vigor", () => {
  const window = activateLingyangLionsVigorWindow({
    ownerId: 'lingyang',
    event: {
      kind: 'RESONANCE_LIBERATION_CAST',
      actorId: 'zhezhi',
      atSeconds: 3,
      actionFactId: 'lingyang-liberation-strive-lions-vigor',
    },
  });
  assert.equal(window, null);
});

test("Lion's Vigor window rejects invalid times and action-fact drift", () => {
  assert.throws(() => activateLingyangLionsVigorWindow({
    ownerId: 'lingyang',
    event: {
      kind: 'RESONANCE_LIBERATION_CAST',
      actorId: 'lingyang',
      atSeconds: -1,
      actionFactId: 'lingyang-liberation-strive-lions-vigor',
    },
  }), /finite non-negative/);

  assert.throws(() => activateLingyangLionsVigorWindow({
    ownerId: 'lingyang',
    event: {
      kind: 'RESONANCE_LIBERATION_CAST',
      actorId: 'lingyang',
      atSeconds: 1,
      actionFactId: 'wrong-action' as 'lingyang-liberation-strive-lions-vigor',
    },
  }), /trigger action drift/);
});
