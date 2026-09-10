import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { getCharacterMechanicFact } from '../src/data/characterMechanics.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';
import { activateCharacterOutroTransfers, activeCharacterOutroAmplifications, listCharacterOutroTransferSupport,
  resolveCharacterOutroSingleActivationContract, resolveCharacterOutroTransferContract } from '../src/combat/characterOutroTransferAdapter.ts';

const facts = ['zhezhi-outro-carve-and-draw', 'lumi-outro-escorting'];
const event = (actorId: string, atSeconds = 2, incomingResonatorId = 'carlotta') => ({ kind: 'OUTRO_SWITCH' as const,
  actorId, atSeconds, incomingResonatorId, incomingEntry: 'DIRECT_SWITCH' as const });
const ordering = { sameTimestampOrder: 'AFTER_TRIGGER' as const };
const activate = (factId: string, atSeconds = 2, recipient = 'carlotta') => activateCharacterOutroTransfers({ factId,
  event: event(getCharacterMechanicFact(factId)!.characterId, atSeconds, recipient), priorActivationState: 'NONE_ACTIVE' });

test('two reviewed canonical Outro facts retain RAW_ONLY and unknown maxStacks while exposing three independent terms', () => {
  const support = listCharacterOutroTransferSupport().filter((row) => row.stackPolicy);
  assert.equal(listCharacterOutroTransferSupport().length, 7);
  assert.deepEqual(support.map((row) => row.factId), [...facts].sort());
  assert.deepEqual(support.map((row) => [row.durationSeconds, row.amplifications]), [
    [10, [{ statOrEffect: 'Resonance Skill DMG Amplification', value: .38 }]],
    [14, [{ statOrEffect: 'Glacio DMG Amplification', value: .20 }, { statOrEffect: 'Resonance Skill DMG Amplification', value: .25 }]],
  ]);
  for (const row of support) {
    const fact = getCharacterMechanicFact(row.factId)!;
    assert.equal(fact.kind, 'PASSIVE');
    if (fact.kind !== 'PASSIVE') throw Error('Expected passive');
    assert.equal(fact.modelingStatus, 'RAW_ONLY');
    assert.equal(fact.maxStacks, null);
    assert.equal(row.durationSeconds, fact.durationSeconds);
    assert.equal(row.stackPolicy, 'UNKNOWN_SINGLE_ACTIVATION_ONLY');
    assert.equal(resolveCharacterOutroTransferContract(fact), null, 'legacy stack-reviewed family must not be broadened');
    assert.ok(resolveCharacterOutroSingleActivationContract(fact));
  }
});

test('canonical transfer ownership duration and incoming-recipient lifecycle hold for both bindings', () => {
  for (const id of facts) {
    const windows = activate(id);
    const source = getCharacterMechanicFact(id)!;
    assert.equal(source.kind, 'PASSIVE');
    if (source.kind !== 'PASSIVE') throw Error('Expected passive');
    for (const window of windows) {
      assert.equal(window.sourceId, id);
      assert.equal(window.sourceActorId, source.characterId);
      assert.equal(window.incomingResonatorId, 'carlotta');
      assert.equal(window.expiresAtSeconds, 2 + source.durationSeconds!);
      assert.equal(window.endsOnIncomingSwitchOut, true);
    }
    assert.equal(activeCharacterOutroAmplifications(windows, 'carlotta', 3, [], ordering).length, windows.length);
    assert.deepEqual(activeCharacterOutroAmplifications(windows, 'jinhsi', 3, [], ordering), []);
    assert.deepEqual(activeCharacterOutroAmplifications(windows, 'carlotta', windows[0].expiresAtSeconds, [], ordering), []);
    const history = [{ kind: 'RESONATOR_SWITCH_OUT' as const, actorId: 'carlotta', atSeconds: 4 }];
    assert.deepEqual(activeCharacterOutroAmplifications(windows, 'carlotta', 5, history, ordering), []);
    assert.deepEqual(activeCharacterOutroAmplifications(windows, 'carlotta', 6, history, ordering), []);
    assert.deepEqual(activateCharacterOutroTransfers({ factId: id, event: event('wrong-owner'), priorActivationState: 'NONE_ACTIVE' }), []);
    assert.deepEqual(activateCharacterOutroTransfers({ factId: id, event: event(source.characterId, 2, source.characterId), priorActivationState: 'NONE_ACTIVE' }), []);
  }
});

test('unknown prior activation cannot be replaced by an inferred single stack or refresh', () => {
  for (const id of facts) {
    const owner = getCharacterMechanicFact(id)!.characterId;
    for (const priorActivationState of [undefined, 'UNKNOWN' as const]) {
      assert.throws(() => activateCharacterOutroTransfers({ factId: id, event: event(owner), priorActivationState }), /earlier active Outro/);
    }
    const first = activate(id), later = activate(id, 3, 'jinhsi');
    assert.throws(() => activeCharacterOutroAmplifications([...first, ...later], 'carlotta', 4, [], ordering), /one independent activation/);
    assert.throws(() => activeCharacterOutroAmplifications([...first, ...first], 'carlotta', 4, [], ordering), /one independent activation/);
    assert.equal(first[0].startedAtSeconds, 2);
    assert.equal(later[0].startedAtSeconds, 3);
  }
});

test('same-timestamp activation and recipient switch-out queries require explicit separate order', () => {
  const windows = activate(facts[0]);
  assert.throws(() => activeCharacterOutroAmplifications(windows, 'carlotta', 3, []), /ordering is required/);
  assert.throws(() => activeCharacterOutroAmplifications(windows, 'carlotta', 2, [], { sameTimestampOrder: 'UNKNOWN' }), /ordering is unresolved/);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'carlotta', 2, [], { sameTimestampOrder: 'BEFORE_TRIGGER' }), []);
  assert.equal(activeCharacterOutroAmplifications(windows, 'carlotta', 2, [], ordering).length, 2);
  const history = [{ kind: 'RESONATOR_SWITCH_OUT' as const, actorId: 'carlotta', atSeconds: 4 }];
  assert.throws(() => activeCharacterOutroAmplifications(windows, 'carlotta', 4, history, ordering), /recipient switch\/query ordering/);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'carlotta', 4, history, { ...ordering, sameTimestampSwitchOutOrder: 'BEFORE_QUERY' }), []);
  assert.equal(activeCharacterOutroAmplifications(windows, 'carlotta', 4, history, { ...ordering, sameTimestampSwitchOutOrder: 'AFTER_QUERY' }).length, 2);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'carlotta', 5, history, ordering), []);
});

test('source ownership status provenance and semantic-shape drift cannot grant a binding', () => {
  for (const id of facts) {
    const source = getCharacterMechanicFact(id)!;
    for (const patch of [{ characterId: 'sanhua' }, { factId: 'other' }, { scope: 'TEAM' }, { triggerSummary: 'Cast Skill' },
      { effectSummary: source.effectSummary + ' Stacks up to twice.' }, { modelingStatus: 'MODEL_READY' },
      { maxStacks: 1 }, { maxStacks: undefined }, { durationSeconds: null }, { durationSeconds: Number.NaN },
      { verificationStatus: 'PENDING' }, { provenance: { ...source.provenance, checkedAt: 'CHANGED' } },
      { provenance: { ...source.provenance, sourceUrls: [] } }]) {
      assert.equal(resolveCharacterOutroSingleActivationContract({ ...source, ...patch } as never), null, JSON.stringify(patch));
    }
    assert.throws(() => activateCharacterOutroTransfers({ factId: id, event: { ...event(source.characterId), kind: 'CAST' as never }, priorActivationState: 'NONE_ACTIVE' }), /unsupported outgoing/);
  }
});

test('source amounts are selected from canonical representations rather than a second adapter value table', () => {
  const lumi = getCharacterMechanicFact(facts[1])!;
  assert.equal(lumi.kind, 'PASSIVE');
  if (lumi.kind !== 'PASSIVE') throw Error('Expected passive');
  assert.equal(resolveCharacterOutroSingleActivationContract({ ...lumi, effectSummary: lumi.effectSummary.replace('38%', '39%') })?.amplifications[0].value, .39);
  assert.equal(resolveCharacterOutroSingleActivationContract({ ...lumi, durationSeconds: 11 }), null, 'duration/text must agree');
  assert.equal(resolveCharacterOutroSingleActivationContract(getCharacterMechanicFact('sanhua-outro-silversnow')!), null);
});

test('six current presets across five Characters discover one canonical binding per outgoing teammate without readiness changes', () => {
  const db = buildCharacterDatabase();
  const bindings = db.outroTransferSupport.filter((row) => row.stackPolicy);
  const owners = new Set(bindings.map((row) => row.characterId));
  const consumers = db.profiles.presets.filter((p) => db.profiles.teams.find((t) => t.id === p.teamProfileId)!.members.some((m) => owners.has(m.characterId)));
  assert.deepEqual(consumers.map((p) => p.id).sort(), ['carlotta-standard', 'jinhsi-standard-opener', 'lingyang-standard', 'lumi-hybrid', 'zhezhi-empyrean-endgame', 'zhezhi-moonlit-fallback']);
  assert.equal(new Set(consumers.map((p) => p.characterId)).size, 5);
  for (const preset of consumers) {
    const members = db.profiles.teams.find((t) => t.id === preset.teamProfileId)!.members;
    assert.ok(bindings.some((binding) => members.some((member) => member.characterId === binding.characterId)));
    assert.equal(db.profiles.rotations.find((r) => r.id === preset.rotationProfileId)!.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  }
  assert.deepEqual(db.characters.filter((c) => c.readiness?.disposition === 'DPS_READY').map((c) => c.id), ['augusta', 'ciaccona']);
  assert.equal(buildProfileExecutionWorkQueue().summary.totalEdges, 83);
  assert.equal(db.referenceTeam01.unresolvedDependencies.length, 6);
});
