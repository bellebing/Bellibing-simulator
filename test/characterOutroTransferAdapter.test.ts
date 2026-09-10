import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activateCharacterOutroTransfers, activeCharacterOutroAmplifications,
  listCharacterOutroTransferSupport, resolveCharacterOutroTransferContract,
} from '../src/combat/characterOutroTransferAdapter.ts';
import { getCharacterMechanicFact } from '../src/data/characterMechanics.ts';
import { evaluateCharacterDirectHit, listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';

const event = (actorId: string) => ({
  kind: 'OUTRO_SWITCH' as const, actorId, incomingResonatorId: 'jiyan',
  incomingEntry: 'DIRECT_SWITCH' as const, atSeconds: 2,
});

test('five model-ready Character Outros expose seven independent source amplification terms', () => {
  const support = listCharacterOutroTransferSupport().filter((row) => !row.stackPolicy);
  assert.deepEqual(support.map((row) => row.characterId), ['aalto', 'changli', 'mortefi', 'taoqi', 'yinlin']);
  assert.deepEqual(support.map((row) => [row.durationSeconds, row.amplifications.map((term) => [term.statOrEffect, term.value])]), [
    [14, [['Aero DMG Amplification', 0.23]]],
    [10, [['Fusion DMG Amplification', 0.20], ['Resonance Liberation DMG Amplification', 0.25]]],
    [14, [['Heavy Attack DMG Amplification', 0.38]]],
    [14, [['Resonance Skill DMG Amplification', 0.38]]],
    [14, [['Electro DMG Amplification', 0.20], ['Resonance Liberation DMG Amplification', 0.25]]],
  ]);
});

test('each source transfer binds the actual incoming recipient and exact expiry', () => {
  for (const support of listCharacterOutroTransferSupport().filter((row) => !row.stackPolicy)) {
    const windows = activateCharacterOutroTransfers({ factId: support.factId, event: event(support.characterId) });
    assert.equal(windows.length, support.amplifications.length);
    for (const window of windows) {
      assert.equal(window.sourceId, support.factId);
      assert.equal(window.sourceActorId, support.characterId);
      assert.equal(window.incomingResonatorId, 'jiyan');
      assert.equal(window.startedAtSeconds, 2);
      assert.equal(window.expiresAtSeconds, 2 + support.durationSeconds);
      assert.equal(window.endsOnIncomingSwitchOut, true);
    }
    assert.equal(activeCharacterOutroAmplifications(windows, 'jiyan', 2 + support.durationSeconds - 0.001, []).length, windows.length);
    assert.deepEqual(activeCharacterOutroAmplifications(windows, 'jiyan', 2 + support.durationSeconds, []), []);
    assert.deepEqual(activeCharacterOutroAmplifications(windows, 'augusta', 3, []), []);
    assert.deepEqual(activateCharacterOutroTransfers({ factId: support.factId, event: event('wrong-outgoing-actor') }), []);
  }
});

test('all terms end when their recipient switches out and do not reappear on return', () => {
  const windows = activateCharacterOutroTransfers({ factId: 'yinlin-outro-strategist', event: event('yinlin') });
  const history = [
    { kind: 'RESONATOR_SWITCH_OUT' as const, actorId: 'aalto', atSeconds: 4 },
    { kind: 'RESONATOR_SWITCH_OUT' as const, actorId: 'jiyan', atSeconds: 7 },
  ];
  assert.equal(activeCharacterOutroAmplifications(windows, 'jiyan', 6.999, history).length, 2);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'jiyan', 7, history), []);
  assert.deepEqual(activeCharacterOutroAmplifications(windows, 'jiyan', 8, history), []);
});

test('raw/pending Outros, periodic resources and a missing switch-out clause are not silently promoted', () => {
  for (const id of [
    'brant-outro-the-course-is-set',
    'sanhua-outro-silversnow', 'yangyang-outro-whispering-breeze', 'youhu-outro-timeless-classics',
  ]) {
    assert.equal(resolveCharacterOutroTransferContract(getCharacterMechanicFact(id)!), null, id);
    assert.throws(() => activateCharacterOutroTransfers({ factId: id, event: event('jiyan') }), /unsupported canonical/);
  }
});

test('source amounts are read from canonical text while scope/duration/trigger drift fails closed', () => {
  const source = getCharacterMechanicFact('mortefi-outro-rage-transposition')!;
  assert.equal(source.kind, 'PASSIVE');
  if (source.kind !== 'PASSIVE') throw new Error('Expected passive');
  assert.equal(resolveCharacterOutroTransferContract({ ...source, effectSummary: source.effectSummary.replace('38%', '39%') })?.amplifications[0].value, 0.39);
  assert.equal(resolveCharacterOutroTransferContract({ ...source, durationSeconds: 15 }), null);
  assert.equal(resolveCharacterOutroTransferContract({ ...source, maxStacks: 2 }), null);
  assert.equal(resolveCharacterOutroTransferContract({ ...source, maxStacks: null }), null);
  assert.equal(resolveCharacterOutroTransferContract({ ...source, scope: 'SELF' }), null);
  assert.equal(resolveCharacterOutroTransferContract({ ...source, triggerSummary: 'Unknown trigger' }), null);
  assert.equal(resolveCharacterOutroTransferContract({ ...source, modelingStatus: 'PENDING_INTERPRETATION' }), null);
  assert.equal(resolveCharacterOutroTransferContract({ ...source, effectSummary: source.effectSummary.replace(' or until they switch out', '') }), null);
});

test('Mortefi single-scope transfer composes with a caller-proven canonical Heavy hit', () => {
  const windows = activateCharacterOutroTransfers({ factId: 'mortefi-outro-rage-transposition', event: event('mortefi') });
  const support = listCharacterDirectHitSupport().find((row) => row.characterId === 'jiyan' && row.sourceDamageClass === 'HEAVY')!;
  assert.ok(support);
  const hit = (amplification: number) => evaluateCharacterDirectHit({
    characterId: support.characterId, factId: support.factId, sequence: 0, maxSkills: true,
    componentIndex: 0, landedHitCount: 1,
    snapshot: { damageClass: 'HEAVY', scalingStat: support.scalingStat, totalScalingStat: 1000,
      damageBonus: 0, amplification, critRate: 0, critDamage: 1.5,
      defenseMultiplier: 1, resistanceMultiplier: 1, damageReduction: 0 },
  });
  const terms = activeCharacterOutroAmplifications(windows, 'jiyan', 3, []);
  assert.equal(terms[0].statOrEffect, 'Heavy Attack DMG Amplification');
  assert.equal(hit(terms[0].value).expectedDamage, hit(0).expectedDamage * 1.38);
});

test('missing history and unresolved events cannot stand in for a known transfer lifecycle', () => {
  const factId = 'taoqi-outro-iron-will';
  const windows = activateCharacterOutroTransfers({ factId, event: event('taoqi') });
  assert.throws(() => activeCharacterOutroAmplifications(windows, 'jiyan', 3, undefined as never), /explicit recipient/);
  assert.throws(() => activateCharacterOutroTransfers({ factId, event: { ...event('taoqi'), kind: 'UNKNOWN' as never } }), /unsupported outgoing/);
  assert.throws(() => activateCharacterOutroTransfers({ factId, event: { ...event('taoqi'), atSeconds: Number.MAX_VALUE } }), /not representable/);
  assert.throws(() => activeCharacterOutroAmplifications(windows, 'jiyan', 3, [
    { kind: 'UNKNOWN' as never, actorId: 'jiyan', atSeconds: 3 },
  ]), /unsupported Resonator switch-out/);
});
