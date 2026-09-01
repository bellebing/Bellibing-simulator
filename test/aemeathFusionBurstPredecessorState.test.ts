import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AEMEATH_DENIA_FUSION_BURST_PREDECESSOR_CONTRACT_20260901,
  applyAemeathBetweenStarsEvent,
  createAemeathBetweenStarsState,
  createCanonicalAemeathBetweenStarsStateAfterDenia,
  validateAemeathDeniaFusionBurstPredecessorContract,
} from '../src/combat/aemeathFusionBurstPredecessorState.ts';

test('canonical Denia Fusion Burst predecessor contract is source-locked and seeds one timeless Between the Stars stack', () => {
  assert.deepEqual(validateAemeathDeniaFusionBurstPredecessorContract(), []);
  assert.equal(
    AEMEATH_DENIA_FUSION_BURST_PREDECESSOR_CONTRACT_20260901.closesPendingExecutionId,
    'incoming:denia:aemeath-fusion-burst-predecessor-state',
  );

  const state = createCanonicalAemeathBetweenStarsStateAfterDenia();
  assert.equal(state.mode, 'FUSION_BURST');
  assert.deepEqual(state.teamResonatorIds, ['aemeath', 'denia', 'chisa']);
  assert.deepEqual(state.triggeredResonatorIds, ['denia']);
  assert.equal(state.critDmgBonus, 0.30);
  assert.equal(state.finaleDmgAmplification, 0);
});

test('Between the Stars Fusion Burst branch counts each team Resonator once and caps at two unique triggers', () => {
  let state = createAemeathBetweenStarsState(['aemeath', 'denia', 'chisa']);
  state = applyAemeathBetweenStarsEvent(state, { kind: 'FUSION_BURST_INFLICTED', actorId: 'denia' });
  state = applyAemeathBetweenStarsEvent(state, { kind: 'FUSION_BURST_INFLICTED', actorId: 'denia' });
  assert.deepEqual(state.triggeredResonatorIds, ['denia']);
  assert.equal(state.critDmgBonus, 0.30);

  state = applyAemeathBetweenStarsEvent(state, { kind: 'FUSION_BURST_INFLICTED', actorId: 'aemeath' });
  assert.deepEqual(state.triggeredResonatorIds, ['denia', 'aemeath']);
  assert.equal(state.critDmgBonus, 0.60);
  assert.equal(state.finaleDmgAmplification, 0.25);

  state = applyAemeathBetweenStarsEvent(state, { kind: 'FUSION_BURST_INFLICTED', actorId: 'chisa' });
  assert.deepEqual(state.triggeredResonatorIds, ['denia', 'aemeath']);
  assert.equal(state.critDmgBonus, 0.60);
  assert.equal(state.finaleDmgAmplification, 0.25);
});

test('Between the Stars ignores non-team or wrong-mode Fusion Burst and resets on the two source-defined reset classes', () => {
  let state = createAemeathBetweenStarsState(['aemeath', 'denia', 'chisa']);
  state = applyAemeathBetweenStarsEvent(state, { kind: 'FUSION_BURST_INFLICTED', actorId: 'other' });
  assert.deepEqual(state.triggeredResonatorIds, []);

  state = applyAemeathBetweenStarsEvent(state, { kind: 'FUSION_BURST_INFLICTED', actorId: 'denia' });
  state = applyAemeathBetweenStarsEvent(state, { kind: 'RESONANCE_MODE_SWITCHED', nextMode: 'TUNE_RUPTURE' });
  assert.deepEqual(state.triggeredResonatorIds, []);
  assert.equal(state.critDmgBonus, 0);
  assert.equal(state.finaleDmgAmplification, 0);

  state = applyAemeathBetweenStarsEvent(state, { kind: 'FUSION_BURST_INFLICTED', actorId: 'denia' });
  assert.deepEqual(state.triggeredResonatorIds, []);

  state = applyAemeathBetweenStarsEvent(state, { kind: 'RESONANCE_MODE_SWITCHED', nextMode: 'FUSION_BURST' });
  state = applyAemeathBetweenStarsEvent(state, { kind: 'FUSION_BURST_INFLICTED', actorId: 'denia' });
  state = applyAemeathBetweenStarsEvent(state, { kind: 'TEAM_CHANGED', teamResonatorIds: ['aemeath', 'denia', 'chisa'] });
  assert.deepEqual(state.triggeredResonatorIds, []);
  assert.equal(state.critDmgBonus, 0);
  assert.equal(state.finaleDmgAmplification, 0);
});
