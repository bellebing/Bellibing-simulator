import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  BuildContext,
  DamageEvaluator,
  Echo,
  ResourceCost,
} from '../src/domain.ts';
import {
  runCandidateAttempt,
  type CheckpointPolicy,
  type EchoRollRuntime,
  type RandomSource,
} from '../src/rollRuntime.ts';
import { explainEchoAnalysis } from '../src/explanations.ts';
import { analyzeEchoCandidate } from '../src/analysis.ts';

const zero: ResourceCost = { echoes: 0, tuners: 0, exp: 0 };
const rng: RandomSource = { next: () => 0.5 };

function echo(id: string, heavy = 0, er = 0): Echo {
  return {
    id,
    cost: 1,
    mainStat: { name: 'ATK%', value: 0.18 },
    level: 25,
    substats: [
      ...(heavy ? [{ name: 'Heavy Attack DMG', value: heavy }] : []),
      ...(er ? [{ name: 'Energy Regen', value: er }] : []),
    ],
  };
}

const build: BuildContext = {
  characterId: 'test-character',
  sequence: 0,
  weapon: { id: 'test-weapon', rank: 1 },
  teamId: 'test-team',
  echoes: [echo('incumbent', 0.05, 0.08)],
  maxSkills: true,
  rotationProfileId: 'test-rotation',
};

const evaluator: DamageEvaluator = {
  evaluate(input) {
    const e = input.echoes[0]!;
    const heavy = e.substats.find((s) => s.name === 'Heavy Attack DMG')?.value ?? 0;
    const er = e.substats.find((s) => s.name === 'Energy Regen')?.value ?? 0;
    return {
      personalRotationDps: 1000 * (1 + heavy * 2),
      energyRegen: 1 + er,
      erGate: er >= 0.06 ? 'PASS' : 'FAIL',
    };
  },
};

test('a +25 candidate is accepted only through the whole-build evaluator', () => {
  const candidate = echo('candidate', 0.09, 0.08);
  const runtime: EchoRollRuntime = {
    acquireFresh: () => ({ echo: candidate, cost: zero }),
    rollNext: () => null,
    refundOnDiscard: () => zero,
  };
  const policy: CheckpointPolicy = { decide: () => 'CONTINUE' };

  const result = runCandidateAttempt(build, 0, candidate, runtime, policy, evaluator, rng);
  assert.equal(result.accepted, true);
  assert.equal(result.analysis?.verdict, 'UPGRADE');
});

test('a conventional guide list cannot hide real Heavy DMG value', () => {
  const candidate = echo('candidate', 0.09, 0.08);
  const analysis = analyzeEchoCandidate(
    build,
    0,
    candidate,
    evaluator,
  );
  const explanation = explainEchoAnalysis(
    analysis,
    new Set(['CRIT Rate', 'CRIT DMG', 'ATK%']),
  );

  assert.equal(explanation.headline, 'UPGRADE');
  assert.equal(explanation.hiddenValueStats[0]?.stat, 'Heavy Attack DMG');
  assert.ok(explanation.hiddenValueStats[0]!.dpsContributionPct > 0);
});
