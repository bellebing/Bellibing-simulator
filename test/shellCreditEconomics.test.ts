import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateBudgetPressure } from '../src/budgetView.ts';
import { compareContinueVsRestart } from '../src/pathComparison.ts';
import { addCost, subtractCost } from '../src/rollRuntime.ts';
import { summarizeUpgradeTrials } from '../src/upgradeEconomics.ts';

test('Shell Credits propagate through expected cost to one successful upgrade', () => {
  const result = summarizeUpgradeTrials([
    {
      success: true,
      cost: { echoes: 1, tuners: 10, exp: 4400, shellCredits: 2440 },
      dpsGainPct: 0.01,
    },
    {
      success: false,
      cost: { echoes: 1, tuners: 20, exp: 16500, shellCredits: 5650 },
    },
  ]);

  assert.equal(result.successProbability, 0.5);
  assert.deepEqual(result.expectedCostToSuccess, {
    echoes: 2,
    tuners: 30,
    exp: 20900,
    shellCredits: 8090,
  });
});

test('Shell Credits participate in Continue-vs-Restart Pareto dominance', () => {
  const shared = {
    successProbability: 0.25,
    expectedDpsGainOnSuccess: 0.02,
    tunersPerOnePercentDps: 50,
  };

  const continuation = {
    ...shared,
    expectedCostToSuccess: {
      echoes: 4,
      tuners: 100,
      exp: 50000,
      shellCredits: 12000,
    },
  };
  const restart = {
    ...shared,
    expectedCostToSuccess: {
      echoes: 4,
      tuners: 100,
      exp: 50000,
      shellCredits: 18000,
    },
  };

  assert.equal(compareContinueVsRestart(continuation, restart).decision, 'CONTINUE_DOMINATES');
});

test('Shell Credits can be the practical rolling-budget bottleneck', () => {
  const pressure = calculateBudgetPressure(
    {
      successProbability: 0.25,
      expectedCostToSuccess: {
        echoes: 10,
        tuners: 100,
        exp: 50000,
        shellCredits: 180000,
      },
      expectedDpsGainOnSuccess: 0.02,
      tunersPerOnePercentDps: 50,
    },
    {
      echoes: 100,
      tuners: 2000,
      exp: 1000000,
      shellCredits: 200000,
    },
  );

  assert.equal(pressure.limitingResource, 'shellCredits');
  assert.equal(pressure.fractions.shellCredits, 0.9);
});

test('generic cost arithmetic never drops populated Shell Credits', () => {
  const a = { echoes: 1, tuners: 10, exp: 4400, shellCredits: 2440 };
  const b = { echoes: 0, tuners: 10, exp: 12100, shellCredits: 3210 };

  assert.deepEqual(addCost(a, b), {
    echoes: 1,
    tuners: 20,
    exp: 16500,
    shellCredits: 5650,
  });
  assert.deepEqual(subtractCost(addCost(a, b), { echoes: 0, tuners: 6, exp: 12375, shellCredits: 0 }), {
    echoes: 1,
    tuners: 14,
    exp: 4125,
    shellCredits: 5650,
  });
});
