import assert from 'node:assert/strict';
import test from 'node:test';
import type { UpgradeEconomics } from '../src/domain.ts';
import { buildNextRollAdvice } from '../src/nextRollAdvice.ts';
import { calculateBudgetPressure } from '../src/budgetView.ts';

function econ(
  p: number,
  echoes: number,
  tuners: number,
  exp: number,
  gain: number,
): UpgradeEconomics {
  return {
    successProbability: p,
    expectedCostToSuccess: { echoes, tuners, exp },
    expectedDpsGainOnSuccess: gain,
    tunersPerOnePercentDps: tuners / (gain * 100),
  };
}

test('next-roll advice is conditional on modeled future value, not the stat label', () => {
  const restart = econ(0.2, 10, 200, 1000, 0.03);
  const advice = buildNextRollAdvice([
    {
      nextRoll: { name: 'CRIT Rate', value: 0.081 },
      continuePath: econ(0.3, 6, 140, 800, 0.035),
      restartPath: restart,
    },
    {
      nextRoll: { name: 'HP%', value: 0.086 },
      continuePath: econ(0.1, 14, 260, 1300, 0.02),
      restartPath: restart,
    },
  ]);

  assert.deepEqual(advice.continueOn.map((x) => x.nextRoll.name), ['CRIT Rate']);
  assert.deepEqual(advice.discardOn.map((x) => x.nextRoll.name), ['HP%']);
});

test('the same HP label can become a continue roll when the actual model values it', () => {
  const advice = buildNextRollAdvice([
    {
      nextRoll: { name: 'HP%', value: 0.086 },
      continuePath: econ(0.35, 5, 120, 700, 0.04),
      restartPath: econ(0.2, 10, 200, 1000, 0.03),
    },
  ]);

  assert.equal(advice.continueOn[0]?.nextRoll.name, 'HP%');
  assert.equal(advice.discardOn.length, 0);
});

test('budget pressure identifies a bottleneck without inventing cross-resource exchange rates', () => {
  const pressure = calculateBudgetPressure(
    econ(0.4, 20, 300, 4000, 0.03),
    { echoes: 100, tuners: 1000, exp: 10000 },
  );

  assert.equal(pressure.limitingResource, 'exp');
  assert.equal(pressure.fractions.echoes, 0.2);
  assert.equal(pressure.fractions.tuners, 0.3);
  assert.equal(pressure.fractions.exp, 0.4);
});
