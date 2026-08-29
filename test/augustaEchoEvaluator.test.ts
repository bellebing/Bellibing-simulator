import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeEchoCandidate } from '../src/analysis.ts';
import {
  AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21,
  AUGUSTA_LIVE_CURRENT_ECHOES_2026_08_21,
  augustaInputsFromEchoes,
  augustaStandardEchoDamageEvaluator,
} from '../src/characters/augustaEchoEvaluator.ts';
import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';

const closeTo = (actual: number, expected: number, tolerance = 1e-8) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
};

test('owned Echo cards reconstruct the exact live Augusta upstream stats', () => {
  const stats = augustaInputsFromEchoes(AUGUSTA_LIVE_CURRENT_ECHOES_2026_08_21);
  closeTo(stats.upstreamAtk, 2299.806, 1e-10);
  closeTo(stats.upstreamCritRate, 0.7085, 1e-12);
  closeTo(stats.upstreamCritDamage, 1.998, 1e-12);
  closeTo(stats.upstreamHeavyDamage, 0.387, 1e-12);
  closeTo(stats.upstreamElectroDamage, 0.72, 1e-12);
  closeTo(stats.skillDamage, 0.079, 1e-12);
  closeTo(stats.energyRegen, 1.184, 1e-12);
});

test('canonical Augusta preset reaches exact live Personal Rotation DPS', () => {
  const build = buildContextFromVerifiedPreset('augusta-standard', AUGUSTA_LIVE_CURRENT_ECHOES_2026_08_21);
  const result = augustaStandardEchoDamageEvaluator.evaluate(build);
  closeTo(result.personalRotationDps, 85896.92052214989, 1e-8);
  assert.equal(result.erGate, 'PASS');
});

test('removing a real Heavy roll from one Echo is measured as actual DPS loss', () => {
  const incumbent = AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21.echoes[2];
  const candidate = {
    ...incumbent,
    id: 'ECHO_3_NO_HEAVY',
    substats: incumbent.substats.filter((stat) => stat.name !== 'Heavy Attack DMG'),
  };
  const result = analyzeEchoCandidate(
    AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21,
    2,
    candidate,
    augustaStandardEchoDamageEvaluator,
  );
  assert.equal(result.verdict, 'NO_UPGRADE');
  assert.ok((result.dpsDelta ?? 0) < 0);
});

test('an unsupported sequence stays pending instead of silently using S0 math', () => {
  const result = augustaStandardEchoDamageEvaluator.evaluate({
    ...AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21,
    sequence: 1,
  });
  assert.equal(result.erGate, 'PENDING');
  assert.ok(Number.isNaN(result.personalRotationDps));
});
