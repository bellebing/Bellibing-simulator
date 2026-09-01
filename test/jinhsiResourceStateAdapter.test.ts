import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateJinhsiTemporalBender,
  applyJinhsiIlluminousEpiphanyForUnison,
  applyJinhsiPartyDamageEvent,
  consumeJinhsiIncandescenceForIlluminous,
  consumeJinhsiUnisonOnSwitch,
  createKnownJinhsiResourceState,
  JINHSI_RESOURCE_EXECUTION_SEMANTIC_REVIEW,
} from '../src/combat/jinhsiResourceStateAdapter.ts';

function knownState() {
  return createKnownJinhsiResourceState({
    incandescence: 0,
    lastAttributeDamageTriggerAtSeconds: { Spectro: null },
    lastCoordinatedAttackTriggerAtSeconds: { Spectro: null },
    temporalBenderExpiresAtSeconds: null,
    unisonAvailable: false,
    unisonNextGrantReadyAtSeconds: 0,
  });
}

test('Eras in Unity keeps Attribute and Coordinated Attack gains independent on explicit cadence state', () => {
  const first = applyJinhsiPartyDamageEvent(knownState(), {
    kind: 'PARTY_ATTRIBUTE_DAMAGE',
    attribute: 'Spectro',
    coordinatedAttack: true,
    atSeconds: 1,
  });
  assert.equal(first.attributeDamageGain, 1);
  assert.equal(first.coordinatedAttackGain, 2);
  assert.equal(first.actualGain, 3);
  assert.equal(first.state.incandescence, 3);

  const tooSoon = applyJinhsiPartyDamageEvent(first.state, {
    kind: 'PARTY_ATTRIBUTE_DAMAGE',
    attribute: 'Spectro',
    coordinatedAttack: true,
    atSeconds: 3.999,
  });
  assert.equal(tooSoon.actualGain, 0);

  const ready = applyJinhsiPartyDamageEvent(tooSoon.state, {
    kind: 'PARTY_ATTRIBUTE_DAMAGE',
    attribute: 'Spectro',
    coordinatedAttack: true,
    atSeconds: 4,
  });
  assert.equal(ready.actualGain, 3);
  assert.equal(ready.state.incandescence, 6);
});

test('Temporal Bender changes same-Attribute cadence to one second only during its explicit 20s window', () => {
  const first = applyJinhsiPartyDamageEvent(knownState(), {
    kind: 'PARTY_ATTRIBUTE_DAMAGE',
    attribute: 'Spectro',
    coordinatedAttack: false,
    atSeconds: 2,
  });
  const accelerated = activateJinhsiTemporalBender(first.state, 2.5);

  const oneSecondLater = applyJinhsiPartyDamageEvent(accelerated, {
    kind: 'PARTY_ATTRIBUTE_DAMAGE',
    attribute: 'Spectro',
    coordinatedAttack: false,
    atSeconds: 3,
  });
  assert.equal(oneSecondLater.actualGain, 1);

  const beforeOneSecond = applyJinhsiPartyDamageEvent(oneSecondLater.state, {
    kind: 'PARTY_ATTRIBUTE_DAMAGE',
    attribute: 'Spectro',
    coordinatedAttack: false,
    atSeconds: 3.999,
  });
  assert.equal(beforeOneSecond.actualGain, 0);

  const atOneSecond = applyJinhsiPartyDamageEvent(beforeOneSecond.state, {
    kind: 'PARTY_ATTRIBUTE_DAMAGE',
    attribute: 'Spectro',
    coordinatedAttack: false,
    atSeconds: 4,
  });
  assert.equal(atOneSecond.actualGain, 1);
});

test('Incandescence consumption uses the actual known amount and exact per-point Forte curve', () => {
  const state = createKnownJinhsiResourceState({
    incandescence: 17,
    lastAttributeDamageTriggerAtSeconds: { Spectro: null },
    lastCoordinatedAttackTriggerAtSeconds: { Spectro: null },
    temporalBenderExpiresAtSeconds: null,
    unisonAvailable: false,
    unisonNextGrantReadyAtSeconds: 0,
  });
  const consumed = consumeJinhsiIncandescenceForIlluminous(state, 10);
  assert.equal(consumed.consumedIncandescence, 17);
  assert.equal(consumed.perPointMotionValue, 0.4454);
  assert.ok(Math.abs(consumed.additionalStellaGlamorMotionValue - 7.5718) < 1e-12);
  assert.equal(consumed.state.incandescence, 0);
});

test('Unison gain respects the explicit 25s cadence and switching consumes only Unison path state', () => {
  const gained = applyJinhsiIlluminousEpiphanyForUnison(knownState(), 10);
  assert.equal(gained.granted, true);
  assert.equal(gained.state.unisonAvailable, true);
  assert.equal(gained.state.unisonNextGrantReadyAtSeconds, 35);

  const held = applyJinhsiIlluminousEpiphanyForUnison(gained.state, 40);
  assert.equal(held.granted, false);
  assert.strictEqual(held.state, gained.state);
  assert.equal(held.state.unisonNextGrantReadyAtSeconds, 35);

  const switched = consumeJinhsiUnisonOnSwitch({
    state: gained.state,
    outgoingActorId: 'jinhsi',
    incomingActorId: 'zhezhi',
    atSeconds: 10.1,
  });
  assert.equal(switched.consumedUnison, true);
  assert.equal(switched.triggersJinhsiOutro, true);
  assert.equal(switched.triggersIncomingIntro, true);
  assert.equal(switched.concertoConsumptionAuthorizedByThisPrimitive, false);
  assert.equal(switched.state.unisonAvailable, false);

  const tooSoon = applyJinhsiIlluminousEpiphanyForUnison(switched.state, 34.999);
  assert.equal(tooSoon.granted, false);
  const ready = applyJinhsiIlluminousEpiphanyForUnison(tooSoon.state, 35);
  assert.equal(ready.granted, true);
});

test('resource primitive fails closed when predecessor Attribute cadence is unknown', () => {
  assert.throws(() => applyJinhsiPartyDamageEvent(knownState(), {
    kind: 'PARTY_ATTRIBUTE_DAMAGE',
    attribute: 'Glacio',
    coordinatedAttack: false,
    atSeconds: 1,
  }), /predecessor cadence for Glacio is unresolved/);

  assert.deepEqual(JINHSI_RESOURCE_EXECUTION_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
  assert.equal(JINHSI_RESOURCE_EXECUTION_SEMANTIC_REVIEW.requiresKnownPredecessorState, true);
});
