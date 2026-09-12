import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRoverWindstringsLedger as evaluate, type RoverWindstringsLedgerInput as Input } from '../src/combat/roverWindstringsLedger.ts';
import { listRoverWindstringsGainSupport, listRoverWindstringsSpendSupport } from '../src/combat/roverWindstringsGainAdapter.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';

const boundary = { onFieldThroughout: true, completeWindstringsEvents: true,
  eventOrderProven: true, evidenceId: 'synthetic-contract-fixture' } as const;
function gain(index: number, order: number): Input['events'][number] {
  const binding = listRoverWindstringsGainSupport()[index];
  return { kind: 'GAIN', order, eventId: `gain-${order}`, input: { ...binding, sequence: 0, maxSkills: true,
    event: { kind: binding.eventKind, actorId: 'rover-aero', atSeconds: order, sourceQualified: true,
      ...(binding.eventKind === 'CLOUDBURST_STAGE_HIT' ? { landedHitCount: 1, targetCount: 1, targetId: 'target' } : {}) },
    ...(index === 3 ? { teamProof: { memberCharacterIds: ['rover-aero', 'cartethyia', 'ciaccona'],
      sourceCharacterSequence: 0, activeSourceFactId: 'cartethyia-inherent-a-hearts-truest-wishes' } } : {}) } };
}
function spend(stage: 1 | 2, order: number, chainId = 'chain-a'): Input['events'][number] {
  return { kind: 'SPEND', order, eventId: `spend-${order}`, chainId, continuationQualified: true,
    input: { ...listRoverWindstringsSpendSupport()[stage - 1], maxSkills: true,
      event: { kind: 'UNBOUND_FLOW_STAGE_EXECUTED', stage, mode: 'UNBOUND_FLOW', actorId: 'rover-aero',
        atSeconds: order, sourceQualified: true } } };
}
function input(value: number, events: Input['events']): Input {
  return { presetId: 'rover-aero-cartethyia-ciaccona', boundary,
    initial: { status: 'PROVEN', value, atSeconds: 0, sourceQualified: true, evidenceId: 'synthetic-initial' }, events };
}

test('known non-overflow fragment reuses source gains and spends in caller order', () => {
  // Synthetic partial-hit scenario only, never a source claim about the standard rotation.
  const value = input(0, [gain(0, 1), gain(1, 2), gain(2, 3), gain(3, 4), gain(1, 5), spend(1, 6), spend(2, 7)]);
  const before = structuredClone(value), result = evaluate(value);
  assert.equal(result.status, 'EVALUATED_FRAGMENT');
  assert.equal(result.finalStored, 0);
  assert.deepEqual(result.steps.map(s => s.storedAfter), [20, 45, 70, 95, 120, 60, 0]);
  assert.equal(result.authorizesProfileExecution, false);
  assert.deepEqual(value, before);
  result.steps[0].storedAfter = -1;
  assert.equal(evaluate(value).steps[0].storedAfter, 20);
});

test('unknown initial state remains unknown and cannot become zero or full', () => {
  const value: Input = { ...input(0, [gain(0, 1)]), initial: { status: 'UNKNOWN' } };
  const result = evaluate(value);
  assert.equal(result.status, 'PENDING');
  if (result.status !== 'PENDING') throw new Error('pending');
  assert.equal(result.reason, 'INITIAL_WINDSTRINGS_UNKNOWN');
  assert.equal(result.finalStored, null);
  assert.equal(result.lastProvenStored, null);
  assert.deepEqual(result.steps, []);
  assert.throws(() => evaluate({ ...value, initial: { status: 'UNKNOWN', value: 0 } } as unknown as Input));
});

test('an all-landed synthetic standard gain prefix requires unproved overflow, never clipping', () => {
  const result = evaluate(input(0, [gain(0, 1), gain(1, 2), gain(2, 3), gain(3, 4), gain(1, 5), gain(2, 6)]));
  assert.equal(result.status, 'PENDING');
  if (result.status !== 'PENDING') throw new Error('pending');
  assert.equal(result.reason, 'OVERFLOW_SEMANTICS_REQUIRED');
  assert.equal(result.blockedEventId, 'gain-6');
  assert.equal(result.lastProvenStored, 120);
  assert.equal(result.finalStored, null);
  assert.equal(result.steps.length, 5);
});

test('Unbound Flow entry needs maximum and Stage2 requires the same explicit uninterrupted chain', () => {
  for (const [value, reason] of [
    [input(60, [spend(1, 1)]), 'UNBOUND_FLOW_REQUIRES_MAXIMUM'],
    [input(60, [spend(2, 1)]), 'UNBOUND_FLOW_CONTINUATION_REQUIRED'],
    [input(120, [spend(1, 1), spend(2, 2, 'other')]), 'UNBOUND_FLOW_CONTINUATION_REQUIRED'],
    [input(120, [spend(1, 1), gain(0, 2), spend(2, 3)]), 'UNBOUND_FLOW_CONTINUATION_REQUIRED'],
    [input(120, [spend(1, 1), spend(2, 2), spend(2, 3)]), 'UNBOUND_FLOW_CONTINUATION_REQUIRED'],
  ] as const) {
    const result = evaluate(value);
    assert.equal(result.status, 'PENDING');
    if (result.status !== 'PENDING') throw new Error('pending');
    assert.equal(result.reason, reason);
  }
});

test('malformed order, duplicate events, missing proofs and unsupported nominal events fail closed', () => {
  const value = input(0, [gain(0, 1), gain(1, 2)]);
  for (const altered of [
    { ...value, presetId: 'the-shorekeeper' },
    { ...value, boundary: { ...boundary, onFieldThroughout: false } },
    { ...value, boundary: { ...boundary, completeWindstringsEvents: false } },
    { ...value, boundary: { ...boundary, eventOrderProven: false } },
    { ...value, events: [value.events[0], value.events[0]] },
    { ...value, events: [...value.events].reverse() },
    { ...value, events: [value.events[0], { ...value.events[1], eventId: value.events[0].eventId }] },
  ]) assert.throws(() => evaluate(altered as Input));
  for (const n of [-1, 121, 0.5, NaN, Infinity]) assert.throws(() => evaluate(input(n, value.events)));
  const unsupported = { ...gain(0, 1), input: { ...gain(0, 1).input, actionFactId: 'unknown' } };
  assert.throws(() => evaluate({ ...value, initial: { status: 'UNKNOWN' }, events: [unsupported] } as Input));
});

test('partial state discovery joins the exact preset and canonical facts without readiness promotion', () => {
  const db = buildCharacterDatabase(), support = db.resourceStateSupport;
  assert.equal(support.length, 1);
  const row = support[0];
  assert.equal(row.presetId, 'rover-aero-cartethyia-ciaccona');
  assert.ok(db.profiles.presets.some(p => p.id === row.presetId && p.characterId === row.characterId));
  for (const factId of [row.resourceFactId, ...row.gainActionFactIds, ...row.spendActionFactIds]) {
    assert.ok(db.mechanicsFacts.some(f => f.factId === factId));
  }
  assert.equal(row.authorizesProfileExecution, false);
  assert.equal(Object.hasOwn(row, 'maximum'), false);
  row.spendActionFactIds.pop();
  assert.equal(buildCharacterDatabase().resourceStateSupport[0].spendActionFactIds.length, 2);
  assert.equal(buildProfileExecutionWorkQueue().summary.totalEdges, 83);
  assert.equal(db.referenceTeam01.unresolvedDependencies.length, 6);
  assert.deepEqual(db.characters.filter(c => c.readiness?.disposition === 'DPS_READY').map(c => c.id).sort(), ['augusta', 'ciaccona']);
});

function offField(): Input {
  const stage1 = spend(1, 1);
  if (stage1.kind !== 'SPEND') throw new Error('spend fixture');
  return { ...input(60, [spend(2, 3)]),
    initial: { status: 'PROVEN', value: 60, atSeconds: 2, sourceQualified: true, evidenceId: 'observed-after-swap' },
    boundary: { ...boundary, onFieldThroughout: false, followupProof: { stage1,
      swap: { eventId: 'swap', order: 2, atSeconds: 2, outgoingCharacterId: 'rover-aero',
        incomingCharacterId: 'cartethyia', sourceQualified: true } } } };
}

test('actual off-field Stage2 debits only a separately proven post-swap pool', () => {
  const value = offField(), result = evaluate(value);
  assert.equal(result.status, 'EVALUATED_FRAGMENT');
  assert.equal(result.finalStored, 0);
  assert.equal(result.steps.length, 1);
  assert.equal(result.steps[0].storedBefore, 60);
  assert.equal(result.steps[0].nominalAmount, 60);
  // No automatic carry of the hypothetical Stage1 remainder into an unknown snapshot.
  const unknown = evaluate({ ...value, initial: { status: 'UNKNOWN' } });
  assert.equal(unknown.status, 'PENDING');
  assert.equal(unknown.finalStored, null);
  const insufficient = evaluate({ ...value, initial: { ...value.initial, status: 'PROVEN', value: 10,
    atSeconds: 2, sourceQualified: true, evidenceId: 'observed-low' } });
  assert.equal(insufficient.status, 'PENDING');
  if (insufficient.status !== 'PENDING') throw new Error('pending');
  assert.equal(insufficient.reason, 'INSUFFICIENT_STORED_WINDSTRINGS');
});

test('off-field continuation cannot be invented from a stage name, recommended team or pre-swap pool', () => {
  const value = offField();
  if (value.boundary.onFieldThroughout) throw new Error('off-field fixture');
  const proof = value.boundary.followupProof;
  for (const swapChange of [
    { incomingCharacterId: 'unknown' }, { incomingCharacterId: 'rover-aero' },
    { incomingCharacterId: 'augusta' }, { outgoingCharacterId: 'ciaccona' }, { sourceQualified: false },
    { eventId: proof.stage1.eventId }, { eventId: value.events[0].eventId }, { order: 1 }, { order: 3 },
    { atSeconds: 0 }, { atSeconds: 4 }, { atSeconds: NaN },
  ]) assert.throws(() => evaluate({ ...value, boundary: { ...value.boundary,
    followupProof: { ...proof, swap: { ...proof.swap, ...swapChange } } } } as Input));
  assert.throws(() => evaluate({ ...value, initial: { status: 'PROVEN', value: 60, atSeconds: 1,
    sourceQualified: true, evidenceId: 'before-swap' } }));
  assert.throws(() => evaluate({ ...value, events: [spend(2, 3, 'other')] }));
  assert.throws(() => evaluate({ ...value, events: [spend(1, 3)] }));
  assert.throws(() => evaluate({ ...value, events: [spend(2, 3), spend(2, 4)] }));
  assert.throws(() => evaluate({ ...value, boundary: { ...value.boundary,
    followupProof: { ...proof, stage1: { ...proof.stage1, input: { ...proof.stage1.input, sequence: 1 } } } } }));
});

test('a valid nominal team award cannot be relabeled as a different selected profile team', () => {
  const event = gain(3, 1);
  if (event.kind !== 'GAIN' || !event.input.teamProof) throw new Error('Omega fixture');
  for (const memberCharacterIds of [
    ['rover-aero', 'cartethyia', 'augusta'], ['rover-aero', 'cartethyia'],
    ['rover-aero', 'cartethyia', 'ciaccona', 'augusta'],
  ]) {
    const altered = { ...event, input: { ...event.input, teamProof: { ...event.input.teamProof, memberCharacterIds } } };
    assert.throws(() => evaluate(input(0, [altered])), /selected profile/);
  }
  const reordered = { ...event, input: { ...event.input, teamProof: { ...event.input.teamProof,
    memberCharacterIds: ['ciaccona', 'rover-aero', 'cartethyia'] } } };
  assert.equal(evaluate(input(0, [reordered])).finalStored, 25);
});
