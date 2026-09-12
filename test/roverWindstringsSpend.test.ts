import test from 'node:test';
import assert from 'node:assert/strict';
import { getCharacterMechanicFact } from '../src/data/characterMechanics.ts';
import { evaluateRoverWindstringsSpend as evaluate, listRoverWindstringsSpendSupport,
  readRoverWindstringsResource, type RoverWindstringsSpendInput } from '../src/combat/roverWindstringsGainAdapter.ts';

function input(stage: 1 | 2): RoverWindstringsSpendInput {
  return { characterId: 'rover-aero', resourceFactId: 'rover-aero-resource-windstrings',
    actionFactId: listRoverWindstringsSpendSupport()[stage - 1].actionFactId, sequence: 0, maxSkills: true,
    event: { actorId: 'rover-aero', kind: 'UNBOUND_FLOW_STAGE_EXECUTED', stage, mode: 'UNBOUND_FLOW',
      atSeconds: 3, sourceQualified: true } };
}

test('each exact Unbound Flow attack consumes once irrespective of its damage representation', () => {
  for (const stage of [1, 2] as const) {
    const value = input(stage), before = structuredClone(value);
    const result = evaluate(value);
    assert.equal(result.nominalSpend, 60);
    assert.equal(result.ownerId, 'rover-aero');
    assert.equal(result.scope, 'NOMINAL_SPEND_ONLY');
    assert.equal(Object.hasOwn(result, 'storedAfter'), false);
    assert.deepEqual(value, before);
    for (const field of ['landedHitCount', 'targetCount', 'componentIndex', 'targetId']) {
      assert.throws(() => evaluate({ ...value, event: { ...value.event, [field]: 1 } }), /per performed attack/);
    }
  }
});

test('spend requires exact actor/action/stage/mode and caller-proven occurrence', () => {
  const value = input(1);
  for (const change of [
    { characterId: 'cartethyia' }, { resourceFactId: 'other' }, { actionFactId: 'unknown' },
    { actionFactId: input(2).actionFactId }, { sequence: 1 }, { maxSkills: false },
  ]) assert.throws(() => evaluate({ ...value, ...change }));
  for (const change of [
    { actorId: 'cartethyia' }, { kind: 'SKILL_CAST' }, { stage: 2 }, { mode: 'AWAKENING_GALE' },
    { sourceQualified: false }, { atSeconds: NaN }, { atSeconds: -1 },
  ]) assert.throws(() => evaluate({ ...value, event: { ...value.event, ...change } } as RoverWindstringsSpendInput));
});

test('resource maximum and cost reuse the exact canonical clause and fail on malformed source', () => {
  const fact = getCharacterMechanicFact('rover-aero-resource-windstrings')!;
  if (fact.kind !== 'RESOURCE') throw new Error('resource');
  const result = readRoverWindstringsResource(fact);
  assert.equal(result.maximum, 120);
  assert.equal(result.unboundFlowStageCost, 60);
  assert.equal(result.basicCounterNominalGain, 10);
  for (const ruleSummary of [fact.ruleSummary.replace('consumes 60', 'consumes unknown'),
    fact.ruleSummary.replace('consumes 60', 'consumes 0'), fact.ruleSummary.replace('consumes 60', 'consumes 121')]) {
    assert.throws(() => readRoverWindstringsResource({ ...fact, ruleSummary }));
  }
  result.maximum = -1;
  assert.equal(readRoverWindstringsResource(fact).maximum, 120);
});
