import assert from 'node:assert/strict';
import test from 'node:test';

import { ECHO_EFFECT_MODELS } from '../src/data/echoEffects.ts';
import {
  createEchoEffectRegistry,
  getEchoEffects,
} from '../src/echoEffectRegistry.ts';

const registry = createEchoEffectRegistry(ECHO_EFFECT_MODELS);

test('Echo effect foundation is an explicit audited partial slice', () => {
  assert.equal(ECHO_EFFECT_MODELS.length, 8);
  assert.equal(new Set(ECHO_EFFECT_MODELS.map((row) => row.echoId)).size, 5);
  assert.equal(registry.byId.size, 8);
});

test('Fallacy stores wielder ER and team ATK once, independent of support character', () => {
  const effects = getEchoEffects(registry, 'echo-60000605');
  assert.deepEqual(effects.map((row) => [row.effectId, row.value, row.appliesTo]), [
    ['FALLACY_TEAM_ATK', 0.10, 'TEAM'],
    ['FALLACY_WIELDER_ER', 0.10, 'WIELDER'],
  ]);
  assert.ok(effects.every((row) => row.durationSeconds === 20));
});

test('Augusta main Echo passives are isolated from Crown of Valor and active damage', () => {
  const effects = getEchoEffects(registry, 'echo-60001215');
  assert.deepEqual(effects.map((row) => [row.effectId, row.value]), [
    ['FALSE_SOV_ELECTRO', 0.12],
    ['FALSE_SOV_HEAVY', 0.12],
  ]);
  assert.ok(effects.every((row) => row.activation === 'MAIN_SLOT_PASSIVE'));
  assert.ok(effects.every((row) => row.mechanicsStatus === 'ALREADY_MODELED_UPSTREAM'));
});

test('Thousand-Puppet Pavilion keeps its main-slot bonuses separate from Sonata bonuses', () => {
  const effects = getEchoEffects(registry, 'echo-60002185');
  assert.deepEqual(effects.map((row) => [row.effectId, row.value]), [
    ['TPP_HAVOC', 0.12],
    ['TPP_HEAVY', 0.12],
  ]);
  assert.ok(effects.every((row) => row.activation === 'MAIN_SLOT_PASSIVE'));
});

test('Denia and Hyvatia preserve transfer-window conditions instead of automatic uptime', () => {
  const denia = registry.byId.get('REMINISCENCE_DENIA_INCOMING_FUSION');
  assert.equal(denia?.value, 0.12);
  assert.equal(denia?.activationWindowSeconds, 15);
  assert.equal(denia?.durationSeconds, 15);
  assert.equal(denia?.mechanicsStatus, 'VERIFIED_CONDITIONAL');

  const hyvatia = registry.byId.get('HYVATIA_INCOMING_ALL_ATTRIBUTE');
  assert.equal(hyvatia?.value, 0.10);
  assert.equal(hyvatia?.activationWindowSeconds, 15);
  assert.equal(hyvatia?.requiresIncomingIntro, true);
  assert.equal(hyvatia?.mechanicsStatus, 'VERIFIED_CONDITIONAL');
});

test('Echo non-damage effects never embed active attack math or character recommendations', () => {
  for (const row of ECHO_EFFECT_MODELS) {
    for (const forbidden of [
      'motionValue',
      'damage',
      'hits',
      'characterId',
      'teamProfileId',
      'rotationProfileId',
      'recommendedFor',
    ]) {
      assert.equal(Object.hasOwn(row, forbidden), false, `${row.effectId} leaked ${forbidden}`);
    }
  }
});

test('missing Echo effect data means pending migration, not a fabricated no-effect record', () => {
  assert.deepEqual(getEchoEffects(registry, 'echo-60001915'), []); // Sigillum is not audited in V9.15 DPS Buffs yet.
});

test('registry rejects dangling Echo IDs and malformed transfer effects', () => {
  const base = ECHO_EFFECT_MODELS[0]!;
  assert.throws(
    () => createEchoEffectRegistry([{ ...base, effectId: 'BROKEN_ECHO', echoId: 'echo-missing' }]),
    /Unknown Echo id/,
  );

  const transfer = ECHO_EFFECT_MODELS.find((row) => row.effectId === 'REMINISCENCE_DENIA_INCOMING_FUSION')!;
  assert.throws(
    () => createEchoEffectRegistry([{ ...transfer, effectId: 'BROKEN_WINDOW', activationWindowSeconds: undefined }]),
    /requires activationWindowSeconds/,
  );
});
