import test from 'node:test';
import assert from 'node:assert/strict';

import {
  activateLingyangShorekeeperTeamState,
  activateLingyangZhezhiIncomingState,
  isLingyangShorekeeperTeamAmplificationActive,
  isLingyangZhezhiIncomingAmplificationActive,
  LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT,
  LINGYANG_TEAM_INCOMING_STATE_SEMANTIC_REVIEW,
  LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT,
  validateLingyangTeamIncomingStateContracts,
} from '../src/combat/lingyangTeamIncomingStateAdapter.ts';

test('Lingyang teammate state contracts preserve exact Zhezhi and Shorekeeper raw facts without closing execution', () => {
  assert.deepEqual(validateLingyangTeamIncomingStateContracts(), []);
  assert.equal(LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.flourishFactId, 'zhezhi-inherent-flourish');
  assert.equal(LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.carveAndDrawFactId, 'zhezhi-outro-carve-and-draw');
  assert.equal(LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.durationSeconds, 14);
  assert.equal(LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.resonanceEnergyRestoreAmount, 15);
  assert.equal(LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.glacioDamageAmplification, 0.20);
  assert.equal(LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.resonanceSkillDamageAmplification, 0.25);
  assert.equal(LINGYANG_ZHEZHI_INCOMING_STATE_CONTRACT.endsOnIncomingSwitchOut, true);

  assert.equal(LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.sourceFactId, 'the-shorekeeper-outro-binary-butterfly');
  assert.equal(LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.durationSeconds, 30);
  assert.equal(LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.damageAmplification, 0.15);
  assert.equal(LINGYANG_SHOREKEEPER_TEAM_STATE_CONTRACT.requiresNearbyPartyMember, true);

  assert.equal(LINGYANG_TEAM_INCOMING_STATE_SEMANTIC_REVIEW.status, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.deepEqual(LINGYANG_TEAM_INCOMING_STATE_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
  assert.deepEqual(LINGYANG_TEAM_INCOMING_STATE_SEMANTIC_REVIEW.contributesToPendingExecutionIds, [
    'team:lingyang-standard:zhezhi-incoming-state-adapter',
    'team:lingyang-standard:shorekeeper-incoming-state-adapter',
    'rotation:lingyang-standard-rotation:engine-model',
  ]);
});

test('explicit Zhezhi Outro to Lingyang exposes one instant Energy restore plus the source timed amplifications', () => {
  const state = activateLingyangZhezhiIncomingState({
    kind: 'OUTRO_SWITCH',
    actorId: 'zhezhi',
    incomingResonatorId: 'lingyang',
    atSeconds: 6,
  });
  assert.ok(state);
  assert.equal(state.adapterId, 'lingyang-zhezhi-explicit-outro-incoming-state-v1');
  assert.equal(state.resonanceEnergyRestoreAmount, 15);
  assert.equal(state.glacioDamageAmplification, 0.20);
  assert.equal(state.resonanceSkillDamageAmplification, 0.25);
  assert.equal(state.startedAtSeconds, 6);
  assert.equal(state.expiresAtSeconds, 20);
  assert.equal(state.endsOnIncomingSwitchOut, true);

  assert.equal(isLingyangZhezhiIncomingAmplificationActive(state, { atSeconds: 6, incomingHasNotSwitchedOut: true }), true);
  assert.equal(isLingyangZhezhiIncomingAmplificationActive(state, { atSeconds: 19.999, incomingHasNotSwitchedOut: true }), true);
  assert.equal(isLingyangZhezhiIncomingAmplificationActive(state, { atSeconds: 20, incomingHasNotSwitchedOut: true }), false);
});

test('Zhezhi amplification ends as soon as caller evidence says the incoming Lingyang switched out', () => {
  const state = activateLingyangZhezhiIncomingState({
    kind: 'OUTRO_SWITCH',
    actorId: 'zhezhi',
    incomingResonatorId: 'lingyang',
    atSeconds: 2,
  });
  assert.ok(state);
  assert.equal(isLingyangZhezhiIncomingAmplificationActive(state, { atSeconds: 3, incomingHasNotSwitchedOut: false }), false);
});

test('Zhezhi primitive rejects wrong source/incoming identity and malformed runtime evidence instead of guessing', () => {
  assert.equal(activateLingyangZhezhiIncomingState({
    kind: 'OUTRO_SWITCH',
    actorId: 'the-shorekeeper',
    incomingResonatorId: 'lingyang',
    atSeconds: 1,
  }), null);
  assert.equal(activateLingyangZhezhiIncomingState({
    kind: 'OUTRO_SWITCH',
    actorId: 'zhezhi',
    incomingResonatorId: 'carlotta',
    atSeconds: 1,
  }), null);
  assert.throws(() => activateLingyangZhezhiIncomingState({
    kind: 'FAKE_EVENT' as never,
    actorId: 'zhezhi',
    incomingResonatorId: 'lingyang',
    atSeconds: 1,
  }), /unsupported Zhezhi incoming-state event kind/);
  assert.throws(() => activateLingyangZhezhiIncomingState({
    kind: 'OUTRO_SWITCH',
    actorId: 'zhezhi',
    incomingResonatorId: 'lingyang',
    atSeconds: Number.NaN,
  }), /finite non-negative/);
});

test('explicit Shorekeeper Binary Butterfly exposes only the source 30s nearby-team amplification', () => {
  const state = activateLingyangShorekeeperTeamState({
    kind: 'OUTRO_SKILL_CAST',
    actorId: 'the-shorekeeper',
    atSeconds: 4,
    sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
  });
  assert.ok(state);
  assert.equal(state.adapterId, 'lingyang-shorekeeper-explicit-outro-team-state-v1');
  assert.equal(state.beneficiaryId, 'lingyang');
  assert.equal(state.damageAmplification, 0.15);
  assert.equal(state.startedAtSeconds, 4);
  assert.equal(state.expiresAtSeconds, 34);
  assert.equal(state.requiresNearbyPartyMember, true);

  assert.equal(isLingyangShorekeeperTeamAmplificationActive(state, { atSeconds: 4, lingyangIsNearbyPartyMember: true }), true);
  assert.equal(isLingyangShorekeeperTeamAmplificationActive(state, { atSeconds: 33.999, lingyangIsNearbyPartyMember: true }), true);
  assert.equal(isLingyangShorekeeperTeamAmplificationActive(state, { atSeconds: 34, lingyangIsNearbyPartyMember: true }), false);
  assert.equal(isLingyangShorekeeperTeamAmplificationActive(state, { atSeconds: 5, lingyangIsNearbyPartyMember: false }), false);
});

test('Shorekeeper primitive rejects wrong ownership, source-fact drift and invalid times', () => {
  assert.equal(activateLingyangShorekeeperTeamState({
    kind: 'OUTRO_SKILL_CAST',
    actorId: 'zhezhi',
    atSeconds: 1,
    sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
  }), null);
  assert.throws(() => activateLingyangShorekeeperTeamState({
    kind: 'OUTRO_SKILL_CAST',
    actorId: 'the-shorekeeper',
    atSeconds: 1,
    sourceFactId: 'wrong-fact' as never,
  }), /source fact drift/);
  assert.throws(() => activateLingyangShorekeeperTeamState({
    kind: 'FAKE_EVENT' as never,
    actorId: 'the-shorekeeper',
    atSeconds: 1,
    sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
  }), /unsupported Shorekeeper team-state event kind/);
  assert.throws(() => activateLingyangShorekeeperTeamState({
    kind: 'OUTRO_SKILL_CAST',
    actorId: 'the-shorekeeper',
    atSeconds: -0.01,
    sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
  }), /finite non-negative/);
});
