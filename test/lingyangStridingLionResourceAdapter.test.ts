import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateLingyangStridingLionKnownSegment,
  LINGYANG_STRIDING_LION_RESOURCE_SEMANTIC_REVIEW,
  validateLingyangStridingLionResourceContract,
} from '../src/combat/lingyangStridingLionResourceAdapter.ts';

test('Striding Lion contract locks only source-proven continuous-consumption facts', () => {
  assert.deepEqual(validateLingyangStridingLionResourceContract(), []);
  assert.equal(LINGYANG_STRIDING_LION_RESOURCE_SEMANTIC_REVIEW.blockerId, 'BUG-017');
  assert.equal(LINGYANG_STRIDING_LION_RESOURCE_SEMANTIC_REVIEW.primitiveId, 'lingyang-striding-lion-known-segment-v1');
  assert.deepEqual(LINGYANG_STRIDING_LION_RESOURCE_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
});

test('proven no-Vigor segment consumes 20 Lion Spirit per second and depletes at five seconds', () => {
  const threshold = evaluateLingyangStridingLionKnownSegment({
    ownerId: 'lingyang',
    enteredAtSeconds: 10,
    atSeconds: 14.5,
    startingLionSpirit: 100,
    lionsVigorMode: 'PROVEN_INACTIVE_FOR_ENTIRE_SEGMENT',
    hasInterveningLionSpiritGainEvent: false,
  });
  assert.equal(threshold.status, 'ACTIVE');
  assert.equal(threshold.consumptionRateLionSpiritPerSecond, 20);
  assert.equal(threshold.remainingLionSpirit, 10);
  assert.equal(threshold.stormyKicksBelowTenEligible, false);

  const below = evaluateLingyangStridingLionKnownSegment({
    ownerId: 'lingyang',
    enteredAtSeconds: 10,
    atSeconds: 14.501,
    startingLionSpirit: 100,
    lionsVigorMode: 'PROVEN_INACTIVE_FOR_ENTIRE_SEGMENT',
    hasInterveningLionSpiritGainEvent: false,
  });
  assert.equal(below.status, 'ACTIVE');
  assert.ok(below.remainingLionSpirit < 10);
  assert.equal(below.stormyKicksBelowTenEligible, true);

  const depleted = evaluateLingyangStridingLionKnownSegment({
    ownerId: 'lingyang',
    enteredAtSeconds: 10,
    atSeconds: 15,
    startingLionSpirit: 100,
    lionsVigorMode: 'PROVEN_INACTIVE_FOR_ENTIRE_SEGMENT',
    hasInterveningLionSpiritGainEvent: false,
  });
  assert.equal(depleted.status, 'DEPLETED');
  assert.equal(depleted.remainingLionSpirit, 0);
});

test('proven full-segment Lion Vigor halves consumption and reaches the same threshold at nine seconds', () => {
  const threshold = evaluateLingyangStridingLionKnownSegment({
    ownerId: 'lingyang',
    enteredAtSeconds: 2,
    atSeconds: 11,
    startingLionSpirit: 100,
    lionsVigorMode: 'PROVEN_ACTIVE_FOR_ENTIRE_SEGMENT',
    hasInterveningLionSpiritGainEvent: false,
  });
  assert.equal(threshold.status, 'ACTIVE');
  assert.equal(threshold.consumptionRateLionSpiritPerSecond, 10);
  assert.equal(threshold.remainingLionSpirit, 10);
  assert.equal(threshold.stormyKicksBelowTenEligible, false);

  const below = evaluateLingyangStridingLionKnownSegment({
    ownerId: 'lingyang',
    enteredAtSeconds: 2,
    atSeconds: 11.001,
    startingLionSpirit: 100,
    lionsVigorMode: 'PROVEN_ACTIVE_FOR_ENTIRE_SEGMENT',
    hasInterveningLionSpiritGainEvent: false,
  });
  assert.ok(below.remainingLionSpirit < 10);
  assert.equal(below.stormyKicksBelowTenEligible, true);

  const depleted = evaluateLingyangStridingLionKnownSegment({
    ownerId: 'lingyang',
    enteredAtSeconds: 2,
    atSeconds: 12,
    startingLionSpirit: 100,
    lionsVigorMode: 'PROVEN_ACTIVE_FOR_ENTIRE_SEGMENT',
    hasInterveningLionSpiritGainEvent: false,
  });
  assert.equal(depleted.status, 'DEPLETED');
  assert.equal(depleted.remainingLionSpirit, 0);
});

test('state changes and resource gains stop the isolated resource primitive', () => {
  const unknownVigor = evaluateLingyangStridingLionKnownSegment({
    ownerId: 'lingyang',
    enteredAtSeconds: 0,
    atSeconds: 1,
    startingLionSpirit: 100,
    lionsVigorMode: 'UNKNOWN_OR_CHANGES_DURING_SEGMENT',
    hasInterveningLionSpiritGainEvent: false,
  });
  assert.deepEqual(unknownVigor, {
    status: 'SOURCE_SEGMENT_UNRESOLVED',
    reason: 'VIGOR_STATE_CHANGES_OR_UNKNOWN',
  });

  const gain = evaluateLingyangStridingLionKnownSegment({
    ownerId: 'lingyang',
    enteredAtSeconds: 0,
    atSeconds: 1,
    startingLionSpirit: 100,
    lionsVigorMode: 'PROVEN_ACTIVE_FOR_ENTIRE_SEGMENT',
    hasInterveningLionSpiritGainEvent: true,
  });
  assert.deepEqual(gain, {
    status: 'SOURCE_SEGMENT_UNRESOLVED',
    reason: 'INTERVENING_RESOURCE_GAIN',
  });
});

test('known-segment times must be monotonic and valid', () => {
  assert.throws(() => evaluateLingyangStridingLionKnownSegment({
    ownerId: 'lingyang',
    enteredAtSeconds: 3,
    atSeconds: 2,
    startingLionSpirit: 100,
    lionsVigorMode: 'PROVEN_ACTIVE_FOR_ENTIRE_SEGMENT',
    hasInterveningLionSpiritGainEvent: false,
  }), /cannot precede entry/);

  assert.throws(() => evaluateLingyangStridingLionKnownSegment({
    ownerId: '',
    enteredAtSeconds: 0,
    atSeconds: 0,
    startingLionSpirit: 100,
    lionsVigorMode: 'PROVEN_INACTIVE_FOR_ENTIRE_SEGMENT',
    hasInterveningLionSpiritGainEvent: false,
  }), /ownerId must be non-blank/);
});
