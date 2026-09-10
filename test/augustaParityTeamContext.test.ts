import test from 'node:test';
import assert from 'node:assert/strict';
import { AUGUSTA_PARITY_TEAM_CONTEXT } from '../src/characters/augustaParityTeamContext.ts';
import { AUGUSTA_STD_V1, AUGUSTA_LIVE_CURRENT_2026_08_21,
  evaluateAugustaStandardRotation } from '../src/characters/augustaStandard.ts';
import { AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21,
  augustaStandardEchoDamageEvaluator } from '../src/characters/augustaEchoEvaluator.ts';
import { buildReferenceTeam01ExecutionContext } from '../src/data/referenceTeam01ExecutionContext.ts';

test('a retargeted or missing parity team cannot inherit the historical support scalars', () => {
  for (const parityTeam of [undefined, { ...AUGUSTA_PARITY_TEAM_CONTEXT, teamProfileId: 'replacement-team' },
    { ...AUGUSTA_PARITY_TEAM_CONTEXT, basis: 'CURRENT_RESOLVED_TEAM' }]) {
    assert.throws(() => evaluateAugustaStandardRotation(AUGUSTA_LIVE_CURRENT_2026_08_21,
      { ...AUGUSTA_STD_V1, parityTeam } as never), /explicit historical/);
  }
  const replacement = augustaStandardEchoDamageEvaluator.evaluate({
    ...AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21, teamId: 'replacement-team',
  });
  assert.equal(replacement.erGate, 'PENDING');
  assert.ok(Number.isNaN(replacement.personalRotationDps));
});

test('shared historical fixture cannot be mutated across evaluations and copied explicit input retains parity', () => {
  const baseline = evaluateAugustaStandardRotation(AUGUSTA_LIVE_CURRENT_2026_08_21);
  assert.throws(() => { (AUGUSTA_PARITY_TEAM_CONTEXT as unknown as { shorekeeperCritRate: number }).shorekeeperCritRate = 0; }, TypeError);
  assert.throws(() => { (AUGUSTA_STD_V1 as unknown as { parityTeam: unknown }).parityTeam = {}; }, TypeError);
  assert.deepEqual(evaluateAugustaStandardRotation(AUGUSTA_LIVE_CURRENT_2026_08_21,
    { ...AUGUSTA_STD_V1, parityTeam: { ...AUGUSTA_PARITY_TEAM_CONTEXT } }), baseline);
});

test('isolating the historical fixture does not resolve the current Reference Team package', () => {
  const reference = buildReferenceTeam01ExecutionContext();
  assert.equal(reference.dpsReady, false);
  assert.equal(reference.dependencyCoverageStatus, 'PARTIAL');
  assert.equal(reference.unresolvedDependencies.length, 6);
  assert.equal(AUGUSTA_PARITY_TEAM_CONTEXT.basis, 'HISTORICAL_V9_15_PARITY_ONLY');
});
