import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateMechAbominationCastState,
  isMechAbominationAtkWindowActive,
  isMechAbominationCastReady,
  MECH_ABOMINATION_CAST_STATE_REVIEW,
  validateMechAbominationCastStateContract,
} from '../src/combat/mechAbominationCastStateAdapter.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';

test('Mech cast-state contract preserves exact effect/cooldown facts without closing timeline dependency', () => {
  assert.deepEqual(validateMechAbominationCastStateContract(), []);
  assert.equal(MECH_ABOMINATION_CAST_STATE_REVIEW.status, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(MECH_ABOMINATION_CAST_STATE_REVIEW.blockerId, 'BUG-017');
  assert.deepEqual(MECH_ABOMINATION_CAST_STATE_REVIEW.closesPendingExecutionIds, []);

  const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'lingyang-standard')!;
  assert.ok(review.pendingExecutionIds.includes(MECH_ABOMINATION_CAST_STATE_REVIEW.pendingExecutionId));
});

test('explicit Mech cast creates 15s wielder ATK window and 20s cooldown readiness', () => {
  const state = activateMechAbominationCastState({
    wielderId: 'lingyang',
    event: {
      kind: 'ECHO_ACTIVE_CAST',
      actorId: 'lingyang',
      echoId: 'echo-60000485',
      atSeconds: 4,
    },
  });
  assert.ok(state);
  assert.equal(state.wielderAtkBonus, 0.12);
  assert.equal(state.atkWindowExpiresAtSeconds, 19);
  assert.equal(state.nextCastReadyAtSeconds, 24);
  assert.deepEqual(state.unscheduledExactAttackIds, [
    'MECH_ABOMINATION_FRONT_STRIKE',
    'MECH_ABOMINATION_WASTE',
  ]);
  assert.equal(isMechAbominationAtkWindowActive(state, 4), true);
  assert.equal(isMechAbominationAtkWindowActive(state, 18.999), true);
  assert.equal(isMechAbominationAtkWindowActive(state, 19), false);
  assert.equal(isMechAbominationCastReady(state, 23.999), false);
  assert.equal(isMechAbominationCastReady(state, 24), true);
});

test('wrong actor does not activate Mech cast state and invalid times fail closed', () => {
  assert.equal(activateMechAbominationCastState({
    wielderId: 'lingyang',
    event: {
      kind: 'ECHO_ACTIVE_CAST',
      actorId: 'zhezhi',
      echoId: 'echo-60000485',
      atSeconds: 1,
    },
  }), null);

  assert.throws(() => activateMechAbominationCastState({
    wielderId: 'lingyang',
    event: {
      kind: 'ECHO_ACTIVE_CAST',
      actorId: 'lingyang',
      echoId: 'echo-60000485',
      atSeconds: -1,
    },
  }), /finite non-negative/);
});

test('Mech exact attacks remain intentionally unscheduled by cast state', () => {
  const state = activateMechAbominationCastState({
    wielderId: 'lingyang',
    event: {
      kind: 'ECHO_ACTIVE_CAST',
      actorId: 'lingyang',
      echoId: 'echo-60000485',
      atSeconds: 0,
    },
  });
  assert.ok(state);
  assert.equal('frontStrikeAtSeconds' in state, false);
  assert.equal('wasteHitAtSeconds' in state, false);
  assert.equal('wasteExplosionAtSeconds' in state, false);
  assert.ok(MECH_ABOMINATION_CAST_STATE_REVIEW.unresolvedSemantics.some((note) => note.includes('exact delay timestamps')));
});
