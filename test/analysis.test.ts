import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeEchoCandidate } from '../src/analysis.ts';
import { summarizeUpgradeTrials } from '../src/upgradeEconomics.ts';
import type { BuildContext, DamageEvaluator, Echo, StatRoll } from '../src/domain.ts';

const baseEcho = (id: string, substats: StatRoll[] = []): Echo => ({
  id,
  cost: 1,
  mainStat: { name: 'ATK%', value: 0.18 },
  level: 25,
  substats,
});

const build: BuildContext = {
  characterId: 'TEST_CHARACTER',
  sequence: 0,
  weapon: { id: 'TEST_WEAPON', rank: 1 },
  teamId: 'TEST_TEAM',
  maxSkills: true,
  rotationProfileId: 'TEST_ROTATION_V1',
  echoes: [baseEcho('incumbent')],
};

const evaluator: DamageEvaluator = {
  evaluate(input) {
    const stats = input.echoes[0].substats;
    let dps = 1000;
    let er = 1.2;
    for (const stat of stats) {
      if (stat.name === 'CRIT Rate') dps += stat.value * 1000;
      if (stat.name === 'CRIT DMG') dps += stat.value * 450;
      if (stat.name === 'ATK%') dps += stat.value * 700;
      if (stat.name === 'Heavy Attack DMG') dps += stat.value * 1600;
      if (stat.name === 'Energy Regen') er += stat.value;
    }
    return {
      personalRotationDps: dps,
      energyRegen: er,
      erGate: er >= 1.16 ? 'PASS' : 'FAIL',
    };
  },
};

test('a non-obvious damage stat can make an Echo a real upgrade', () => {
  const candidate = baseEcho('heavy', [
    { name: 'Heavy Attack DMG', value: 0.10 },
  ]);
  const result = analyzeEchoCandidate(build, 0, candidate, evaluator);
  assert.equal(result.verdict, 'UPGRADE');
  assert.ok((result.dpsDelta ?? 0) > 0);
  assert.ok((result.statContributions[0].dpsLostIfRemoved ?? 0) > 0);
});

test('ER gate blocks a raw-DPS upgrade', () => {
  const erSensitiveEvaluator: DamageEvaluator = {
    evaluate(input) {
      const stats = input.echoes[0].substats;
      const hasER = stats.some((s) => s.name === 'Energy Regen');
      const heavy = stats.find((s) => s.name === 'Heavy Attack DMG')?.value ?? 0;
      return {
        personalRotationDps: 1000 + heavy * 3000,
        energyRegen: hasER ? 1.18 : 1.10,
        erGate: hasER ? 'PASS' : 'FAIL',
      };
    },
  };
  const buildWithER = {
    ...build,
    echoes: [baseEcho('incumbent-er', [{ name: 'Energy Regen', value: 0.08 }])],
  };
  const candidate = baseEcho('raw-dps', [{ name: 'Heavy Attack DMG', value: 0.20 }]);
  const result = analyzeEchoCandidate(buildWithER, 0, candidate, erSensitiveEvaluator);
  assert.equal(result.verdict, 'INVALID_ER');
  assert.ok((result.dpsDelta ?? 0) > 0);
});

test('upgrade economics stays separate from weakest-Echo scoring', () => {
  const summary = summarizeUpgradeTrials([
    { success: true, cost: { echoes: 10, tuners: 200, exp: 100000 }, dpsGainPct: 0.02 },
    { success: false, cost: { echoes: 5, tuners: 80, exp: 40000 } },
    { success: true, cost: { echoes: 20, tuners: 400, exp: 200000 }, dpsGainPct: 0.04 },
    { success: false, cost: { echoes: 8, tuners: 120, exp: 60000 } },
  ]);
  assert.equal(summary.successProbability, 0.5);
  assert.deepEqual(summary.expectedCostToSuccess, { echoes: 21.5, tuners: 400, exp: 200000 });
  assert.equal(summary.expectedDpsGainOnSuccess, 0.03);
  assert.equal(summary.tunersPerOnePercentDps, 400 / 3);
});

import { compareContinueVsRestart } from '../src/pathComparison.ts';

test('continue can objectively dominate restarting without a made-up resource score', () => {
  const continuation = {
    successProbability: 0.40,
    expectedCostToSuccess: { echoes: 3, tuners: 80, exp: 50000 },
    expectedDpsGainOnSuccess: 0.025,
    tunersPerOnePercentDps: 32,
  };
  const restart = {
    successProbability: 0.20,
    expectedCostToSuccess: { echoes: 12, tuners: 220, exp: 150000 },
    expectedDpsGainOnSuccess: 0.020,
    tunersPerOnePercentDps: 110,
  };
  assert.equal(compareContinueVsRestart(continuation, restart).decision, 'CONTINUE_DOMINATES');
});

test('mixed resource outcomes stay a tradeoff until a validated budget policy resolves them', () => {
  const continuation = {
    successProbability: 0.35,
    expectedCostToSuccess: { echoes: 2, tuners: 250, exp: 40000 },
    expectedDpsGainOnSuccess: 0.025,
    tunersPerOnePercentDps: 100,
  };
  const restart = {
    successProbability: 0.30,
    expectedCostToSuccess: { echoes: 10, tuners: 150, exp: 100000 },
    expectedDpsGainOnSuccess: 0.025,
    tunersPerOnePercentDps: 60,
  };
  assert.equal(compareContinueVsRestart(continuation, restart).decision, 'TRADEOFF');
});
