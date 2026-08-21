import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SeededRng,
  VerifiedWuwaEchoRuntime,
  createRank5EchoAtLevel0,
  simulateDesiredSubstatStrategy,
  type DesiredSubstatStrategy,
} from '../src/echoCore.ts';

const template = createRank5EchoAtLevel0({
  id: 'strategy-cost1-atk',
  cost: 1,
  primaryMainStat: 'ATK%',
});

function approx(actual: number, expected: number, tolerance: number): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} was not within ${tolerance} of ${expected}`,
  );
}

test('full +25 strategy reproduces the published one-desired-substat economy', () => {
  const strategy: DesiredSubstatStrategy = {
    id: 'one-desired-full-plus25',
    desiredStats: ['CRIT Rate'],
    finalMinimumDesired: 1,
  };

  const result = simulateDesiredSubstatStrategy({
    template,
    strategy,
    trials: 50000,
    runtime: new VerifiedWuwaEchoRuntime(),
    rng: new SeededRng('published-one-hit-parity'),
  });

  // With 5 unique substats drawn from 13 equally likely types, one named desired
  // stat appears on a finished Echo with probability 5/13.
  approx(result.successProbability, 5 / 13, 0.008);
  assert.ok(result.expectedNetCostPerSuccess);
  approx(result.expectedNetCostPerSuccess.echoes, 2.6, 0.07);
  // Published strategy reference is ~106 Tuners per successful Echo.
  approx(result.expectedNetCostPerSuccess.tuners, 106, 3);
  assert.equal(result.scope, 'ELIGIBLE_CANDIDATE_ONLY');
});

test('+5 gate exposes the Echo-vs-resource tradeoff without character scoring', () => {
  const full: DesiredSubstatStrategy = {
    id: 'full',
    desiredStats: ['CRIT Rate'],
    finalMinimumDesired: 1,
  };
  const earlyGate: DesiredSubstatStrategy = {
    id: 'plus5-gate',
    desiredStats: ['CRIT Rate'],
    minimumDesiredAtCheckpoint: { 5: 1 },
    finalMinimumDesired: 1,
  };

  const fullResult = simulateDesiredSubstatStrategy({
    template,
    strategy: full,
    trials: 30000,
    runtime: new VerifiedWuwaEchoRuntime(),
    rng: new SeededRng('full-path'),
  });
  const gatedResult = simulateDesiredSubstatStrategy({
    template,
    strategy: earlyGate,
    trials: 30000,
    runtime: new VerifiedWuwaEchoRuntime(),
    rng: new SeededRng('gate-path'),
  });

  assert.ok(fullResult.expectedNetCostPerSuccess);
  assert.ok(gatedResult.expectedNetCostPerSuccess);
  assert.ok(gatedResult.successProbability < fullResult.successProbability);
  assert.ok(gatedResult.expectedNetCostPerSuccess.echoes > fullResult.expectedNetCostPerSuccess.echoes);
  assert.ok((gatedResult.discardedAt[5] ?? 0) > 25000);
});

test('strategy output is exactly reproducible from the same seed', () => {
  const strategy: DesiredSubstatStrategy = {
    id: 'repro-strategy',
    desiredStats: ['CRIT Rate', 'CRIT DMG', 'ATK%'],
    minimumDesiredAtCheckpoint: { 10: 1, 20: 2 },
    finalMinimumDesired: 2,
  };

  const run = () => simulateDesiredSubstatStrategy({
    template,
    strategy,
    trials: 5000,
    runtime: new VerifiedWuwaEchoRuntime(),
    rng: new SeededRng('same-strategy-seed'),
  });

  assert.deepEqual(run(), run());
});

test('impossible desired-stat gates are rejected before simulation', () => {
  assert.throws(
    () => simulateDesiredSubstatStrategy({
      template,
      strategy: {
        id: 'impossible',
        desiredStats: ['CRIT Rate'],
        minimumDesiredAtCheckpoint: { 5: 2 },
        finalMinimumDesired: 1,
      },
      trials: 10,
      runtime: new VerifiedWuwaEchoRuntime(),
      rng: new SeededRng('bad'),
    }),
    /Checkpoint \+5 minimum must be between 0 and 1/,
  );
});
