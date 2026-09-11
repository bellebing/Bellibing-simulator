import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { getCharacterMechanicFact } from '../src/data/characterMechanics.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';
import { evaluateCharacterBasicHit, listCharacterBasicHitSupport } from '../src/combat/characterBasicHitAdapter.ts';
import { evaluateEchoActiveHit } from '../src/combat/echoActiveHitAdapter.ts';
import { activateCharacterOutroTransfers, activeCharacterOutroAmplifications,
  resolveCharacterOutroSingleActivationContract } from '../src/combat/characterOutroTransferAdapter.ts';

const lupaId = 'lupa-outro-stand-by-me-warrior';
const qiuyuanId = 'qiuyuan-outro-strike-before-ready-amplification';
const event = (actorId = 'lupa', atSeconds = 2, incomingResonatorId = 'encore') => ({
  kind: 'OUTRO_SWITCH' as const, actorId, atSeconds, incomingResonatorId, incomingEntry: 'DIRECT_SWITCH' as const,
});
const activate = () => activateCharacterOutroTransfers({ factId: lupaId, event: event(), priorActivationState: 'NONE_ACTIVE' });
const order = { sameTimestampOrder: 'AFTER_TRIGGER' as const };

test('Lupa reuses canonical isolated Outro values and keeps Fusion and Basic terms separate', () => {
  const source = getCharacterMechanicFact(lupaId)!;
  if (source.kind !== 'PASSIVE') throw Error('Expected passive');
  assert.equal(source.modelingStatus, 'RAW_ONLY');
  assert.equal(source.maxStacks, null);
  const contract = resolveCharacterOutroSingleActivationContract(source)!;
  assert.equal(contract.durationSeconds, source.durationSeconds);
  assert.equal(contract.stackPolicy, 'UNKNOWN_SINGLE_ACTIVATION_ONLY');
  assert.deepEqual(contract.amplifications, [
    { statOrEffect: 'Fusion DMG Amplification', value: .2 },
    { statOrEffect: 'Basic Attack DMG Amplification', value: .25 },
  ]);
  assert.equal(resolveCharacterOutroSingleActivationContract({ ...source,
    effectSummary: source.effectSummary.replace('20%', '21%') })?.amplifications[0].value, .21);
  for (const patch of [{ characterId: 'changli' }, { factId: 'other' }, { scope: 'TEAM' }, { conditional: true },
    { triggerSummary: 'Cast Liberation.' }, { durationSeconds: 15 }, { durationSeconds: null }, { maxStacks: 1 },
    { verificationStatus: 'PENDING' }, { modelingStatus: 'MODEL_READY' },
    { effectSummary: source.effectSummary.replace('Fusion', 'Havoc') },
    { effectSummary: source.effectSummary.replace('Basic Attack', 'Resonance Liberation') },
    { effectSummary: source.effectSummary + ' Gain Pack Hunt.' },
    { provenance: { ...source.provenance, checkedAt: 'CHANGED' } },
    { provenance: { ...source.provenance, sourceUrls: [] } }]) {
    assert.equal(resolveCharacterOutroSingleActivationContract({ ...source, ...patch } as never), null);
  }
});

test('Lupa requires real owner/recipient/prior-state evidence and unresolved repeats fail closed', () => {
  for (const priorActivationState of [undefined, 'UNKNOWN' as const]) {
    assert.throws(() => activateCharacterOutroTransfers({ factId: lupaId, event: event(), priorActivationState }), /earlier active Outro/);
  }
  assert.deepEqual(activateCharacterOutroTransfers({ factId: lupaId, event: event('changli'), priorActivationState: 'NONE_ACTIVE' }), []);
  assert.deepEqual(activateCharacterOutroTransfers({ factId: lupaId, event: event('lupa', 2, 'lupa'), priorActivationState: 'NONE_ACTIVE' }), []);
  assert.throws(() => activateCharacterOutroTransfers({ factId: lupaId, event: { ...event(), kind: 'CAST' as never }, priorActivationState: 'NONE_ACTIVE' }), /unsupported outgoing/);
  const windows = activate();
  assert.throws(() => activeCharacterOutroAmplifications([...windows, ...activate()], 'encore', 3, [], order), /one independent activation/);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'changli', 3, [], order), []);
  assert.equal(activeCharacterOutroAmplifications(windows, 'encore', 3, [], order).length, 2);
});

test('Lupa isolated terms obey explicit event order, exclusive expiry and permanent switch-out termination', () => {
  const windows = activate();
  assert.throws(() => activeCharacterOutroAmplifications(windows, 'encore', 2, [], { sameTimestampOrder: 'UNKNOWN' }), /ordering is unresolved/);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'encore', 2, [], { sameTimestampOrder: 'BEFORE_TRIGGER' }), []);
  assert.equal(activeCharacterOutroAmplifications(windows, 'encore', 2, [], order).length, 2);
  assert.equal(activeCharacterOutroAmplifications(windows, 'encore', 15.999, [], order).length, 2);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'encore', 16, [], order), []);
  const history = [{ kind: 'RESONATOR_SWITCH_OUT' as const, actorId: 'encore', atSeconds: 4 }];
  assert.throws(() => activeCharacterOutroAmplifications(windows, 'encore', 4, history, order), /recipient switch\/query ordering/);
  assert.equal(activeCharacterOutroAmplifications(windows, 'encore', 4, history, { ...order, sameTimestampSwitchOutOrder: 'AFTER_QUERY' }).length, 2);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'encore', 4, history, { ...order, sameTimestampSwitchOutOrder: 'BEFORE_QUERY' }), []);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'encore', 5, history, order), []);
});

test('Lupa Basic term feeds an explicit Encore hit without selecting or aggregating the Fusion term', () => {
  const support = listCharacterBasicHitSupport().find(s => s.characterId === 'encore')!;
  assert.ok(support);
  const terms = activeCharacterOutroAmplifications(activate(), 'encore', 3, [], order);
  const hit = (amplification: number) => evaluateCharacterBasicHit({ characterId: 'encore', factId: support.factId,
    sequence: 0, maxSkills: true, componentIndex: 0, landedHitCount: 1,
    snapshot: { totalAttack: 1000, damageBonus: 0, amplification, critRate: 0, critDamage: 1.5,
      defenseMultiplier: 1, resistanceMultiplier: 1, damageReduction: 0 } });
  const basic = terms.find(t => t.statOrEffect === 'Basic Attack DMG Amplification')!;
  assert.equal(hit(basic.value).expectedDamage, hit(0).expectedDamage * (1 + basic.value));
  assert.equal(terms.find(t => t.statOrEffect === 'Fusion DMG Amplification')?.value, .2);
});

test('Lupa is discoverable through five existing canonical teams without granting profile execution', () => {
  const db = buildCharacterDatabase();
  assert.equal(db.outroTransferSupport.filter(s => s.factId === lupaId).length, 1);
  const consumers = db.profiles.presets.filter(p => db.profiles.teams.find(t => t.id === p.teamProfileId)!.members.some(m => m.characterId === 'lupa'));
  assert.deepEqual(consumers.map(p => p.id), ['changli-standard', 'chixia-standard', 'encore-standard', 'lupa-standard', 'mortefi-standard']);
  for (const p of consumers) {
    const rotation = db.profiles.rotations.find(r => r.id === p.rotationProfileId)!;
    assert.equal(rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
    assert.equal(rotation.rotationSeconds, undefined);
  }
  assert.equal(buildProfileExecutionWorkQueue().summary.totalEdges, 83);
  assert.equal(db.referenceTeam01.unresolvedDependencies.length, 6);
  assert.deepEqual(db.characters.filter(c => c.readiness?.disposition === 'DPS_READY').map(c => c.id), ['augusta', 'ciaccona']);
});

test('Qiuyuan exposes only the canonical incoming Echo amplification and retains unknown repeated-activation semantics', () => {
  const source = getCharacterMechanicFact(qiuyuanId)!;
  if (source.kind !== 'PASSIVE') throw Error('Expected passive');
  assert.equal(source.modelingStatus, 'RAW_ONLY');
  assert.equal(source.maxStacks, null);
  const contract = resolveCharacterOutroSingleActivationContract(source)!;
  assert.equal(contract.durationSeconds, source.durationSeconds);
  assert.deepEqual(contract.amplifications, [{ statOrEffect: 'Echo Skill DMG Amplification', value: .5 }]);
  assert.equal(contract.stackPolicy, 'UNKNOWN_SINGLE_ACTIVATION_ONLY');
  for (const patch of [{ characterId: 'phrolova' }, { factId: 'qiuyuan-other' }, { scope: 'TEAM' }, { conditional: false },
    { triggerSummary: 'Casting Echo Skill.' }, { durationSeconds: 15 }, { maxStacks: 1 }, { modelingStatus: 'MODELED' },
    { verificationStatus: 'PENDING' }, { effectSummary: source.effectSummary.replace('Echo Skill', 'Heavy Attack') },
    { effectSummary: source.effectSummary.replace('source-fixed ECHO', 'equipped Echo') },
    { effectSummary: source.effectSummary + ' Trigger Hecate.' },
    { provenance: { ...source.provenance, checkedAt: '2026-08-28' } },
    { provenance: { ...source.provenance, sourceUrls: [] } }]) {
    assert.equal(resolveCharacterOutroSingleActivationContract({ ...source, ...patch } as never), null);
  }
  assert.equal(resolveCharacterOutroSingleActivationContract({ ...source,
    effectSummary: source.effectSummary.replace('50%', '51%') })?.amplifications[0].value, .51);
});

test('Qiuyuan transfer rejects missing prior state, false owner, mixed activations and unresolved query order', () => {
  const incoming = event('qiuyuan', 2, 'cantarella');
  const args = { factId: qiuyuanId, event: incoming, priorActivationState: 'NONE_ACTIVE' as const };
  assert.throws(() => activateCharacterOutroTransfers({ ...args, priorActivationState: undefined }), /earlier active Outro/);
  assert.throws(() => activateCharacterOutroTransfers({ ...args, priorActivationState: 'UNKNOWN' }), /earlier active Outro/);
  assert.deepEqual(activateCharacterOutroTransfers({ ...args, event: event('lupa') }), []);
  assert.deepEqual(activateCharacterOutroTransfers({ ...args, event: event('qiuyuan', 2, 'qiuyuan') }), []);
  const windows = activateCharacterOutroTransfers(args);
  assert.equal(windows.length, 1);
  assert.throws(() => activeCharacterOutroAmplifications(windows, 'cantarella', 3, []), /ordering is required/);
  assert.throws(() => activeCharacterOutroAmplifications(windows, 'cantarella', 2, [], { sameTimestampOrder: 'UNKNOWN' }), /ordering is unresolved/);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'cantarella', 2, [], { sameTimestampOrder: 'BEFORE_TRIGGER' }), []);
  assert.throws(() => activeCharacterOutroAmplifications([...windows, ...windows], 'cantarella', 3, [], order), /one independent activation/);
  assert.throws(() => activeCharacterOutroAmplifications([...windows, ...activate()], 'cantarella', 3, [], order), /one independent activation/);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'qiuyuan', 3, [], order), []);
  assert.equal(activeCharacterOutroAmplifications(windows, 'cantarella', 15.999, [], order).length, 1);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'cantarella', 16, [], order), []);
  const history = [{ kind: 'RESONATOR_SWITCH_OUT' as const, actorId: 'cantarella', atSeconds: 4 }];
  assert.throws(() => activeCharacterOutroAmplifications(windows, 'cantarella', 4, history, order), /recipient switch\/query ordering/);
  assert.equal(activeCharacterOutroAmplifications(windows, 'cantarella', 4, history, { ...order, sameTimestampSwitchOutOrder: 'AFTER_QUERY' }).length, 1);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'cantarella', 4, history, { ...order, sameTimestampSwitchOutOrder: 'BEFORE_QUERY' }), []);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'cantarella', 5, history, order), []);
});

test('Qiuyuan Echo term composes with explicitly proven Lorelei hits without creating a cast or Character Outro attack', () => {
  const windows = activateCharacterOutroTransfers({ factId: qiuyuanId, event: event('qiuyuan', 2, 'cantarella'), priorActivationState: 'NONE_ACTIVE' });
  const term = activeCharacterOutroAmplifications(windows, 'cantarella', 3, [], order)[0];
  const input = { echoId: 'echo-60000825', attackId: 'LORELEI_ACTIVE_STRIKE', rank: 5, componentIndex: 0, landedHitCount: 1,
    snapshot: { damageClass: 'ECHO' as const, element: 'Havoc' as const, scalingStat: 'ATK' as const, totalScalingStat: 1000,
      damageBonus: 0, amplification: term.value, critRate: 0, critDamage: 1.5, defenseMultiplier: 1, resistanceMultiplier: 1, damageReduction: 0 } };
  const base = evaluateEchoActiveHit({ ...input, snapshot: { ...input.snapshot, amplification: 0 } });
  assert.equal(evaluateEchoActiveHit(input).expectedDamage, base.expectedDamage * (1 + term.value));
  assert.equal(evaluateEchoActiveHit({ ...input, landedHitCount: 0 }).expectedDamage, 0);
  assert.throws(() => evaluateEchoActiveHit({ ...input, landedHitCount: undefined as never }), /must be explicit/);
  assert.throws(() => evaluateEchoActiveHit({ ...input, echoId: 'qiuyuan', attackId: qiuyuanId }), /No exact Echo attack profile/);
  assert.equal(Object.hasOwn(term, 'attackId'), false);
});

test('Qiuyuan binding is exported for five existing team consumers with unchanged execution/readiness', () => {
  const db = buildCharacterDatabase();
  assert.equal(db.outroTransferSupport.filter(s => s.factId === qiuyuanId).length, 1);
  const consumers = db.profiles.presets.filter(p => db.profiles.teams.find(t => t.id === p.teamProfileId)!.members.some(m => m.characterId === 'qiuyuan'));
  assert.deepEqual(consumers.map(p => p.id), ['cantarella-standard', 'galbrena-standard', 'phrolova-standard', 'qiuyuan-standard', 'sigrika-standard']);
  for (const p of consumers) {
    const rotation = db.profiles.rotations.find(r => r.id === p.rotationProfileId)!;
    assert.equal(rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
    assert.equal(rotation.rotationSeconds, undefined);
  }
  const exported = db.outroTransferSupport.find(s => s.factId === qiuyuanId)!;
  (exported.amplifications[0] as { value: number }).value = 99;
  assert.equal(buildCharacterDatabase().outroTransferSupport.find(s => s.factId === qiuyuanId)!.amplifications[0].value, .5);
  assert.equal(buildProfileExecutionWorkQueue().summary.totalEdges, 83);
  assert.equal(db.referenceTeam01.unresolvedDependencies.length, 6);
  assert.deepEqual(db.characters.filter(c => c.readiness?.disposition === 'DPS_READY').map(c => c.id), ['augusta', 'ciaccona']);
});
