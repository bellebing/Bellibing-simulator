import assert from 'node:assert/strict';
import test from 'node:test';

import { ECHO_EFFECT_MODELS } from '../src/data/echoEffects.ts';
import {
  createEchoEffectRegistry,
  getEchoEffects,
  getEchoEffectsForWielder,
} from '../src/echoEffectRegistry.ts';

const registry = createEchoEffectRegistry(ECHO_EFFECT_MODELS);

test('Echo effect catalog contains the source-safe modeled roster slice', () => {
  assert.equal(ECHO_EFFECT_MODELS.length, 64);
  assert.equal(new Set(ECHO_EFFECT_MODELS.map((row) => row.echoId)).size, 38);
  assert.equal(registry.byId.size, 64);
});

test('Fallacy stores wielder ER and team ATK once, independent of support character', () => {
  const effects = getEchoEffects(registry, 'echo-60000605');
  assert.deepEqual(effects.map((row) => [row.effectId, row.value, row.appliesTo]), [
    ['FALLACY_TEAM_ATK', 0.10, 'TEAM'],
    ['FALLACY_WIELDER_ER', 0.10, 'WIELDER'],
  ]);
  assert.ok(effects.every((row) => row.durationSeconds === 20));
});

test('Mech Abomination stores its exact self ATK cast window without claiming uptime', () => {
  const effects = getEchoEffects(registry, 'echo-60000485');
  assert.deepEqual(effects.map((row) => [
    row.effectId,
    row.statOrEffect,
    row.value,
    row.activation,
    row.durationSeconds,
    row.appliesTo,
  ]), [
    ['MECH_ABOMINATION_WIELDER_ATK', 'ATK%', 0.12, 'ON_ECHO_CAST', 15, 'WIELDER'],
  ]);
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

test('source-safe rendered-text main-slot bonuses are modeled without trigger uptime', () => {
  assert.deepEqual(
    getEchoEffects(registry, 'echo-60000855').map((row) => [row.statOrEffect, row.value, row.durationSeconds]),
    [['Coordinated Attack DMG Bonus', 0.40, null]],
  );
  assert.deepEqual(
    getEchoEffects(registry, 'echo-60001925').map((row) => [row.statOrEffect, row.value]),
    [['Aero DMG Bonus', 0.12], ['Echo Skill DMG Bonus', 0.20]],
  );
});

test('Fleurdelys extra Aero bonus applies only to Rover Aero and Cartethyia', () => {
  const allFleurdelys = getEchoEffects(registry, 'echo-60001065');
  assert.equal(allFleurdelys.length, 2);

  for (const characterId of ['rover-aero', 'cartethyia']) {
    const effects = getEchoEffectsForWielder(registry, 'echo-60001065', characterId);
    assert.equal(effects.length, 2);
    assert.equal(
      effects.filter((row) => row.statOrEffect === 'Aero DMG Bonus').reduce((sum, row) => sum + row.value, 0),
      0.20,
    );
  }

  const ciaccona = getEchoEffectsForWielder(registry, 'echo-60001065', 'ciaccona');
  assert.deepEqual(ciaccona.map((row) => [row.effectId, row.value]), [
    ['ECHO_60001065_AERO_DMG', 0.10],
  ]);
  assert.throws(
    () => getEchoEffectsForWielder(registry, 'echo-60001065', 'not-a-character'),
    /Unknown Echo-effect wielder character id/,
  );
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

test('other character-restricted and loadout-replaced bonuses are not flattened into unconditional rows', () => {
  assert.deepEqual(getEchoEffects(registry, 'echo-60002015'), []); // Adam Smasher CR is Lucy/Rebecca-only.
  assert.deepEqual(getEchoEffects(registry, 'echo-60001915'), []); // Sigillum Liberation bonus is Aemeath-only.
  const collapsar = getEchoEffects(registry, 'echo-60001809');
  assert.deepEqual(collapsar.map((row) => [row.statOrEffect, row.value]), [['Basic Attack DMG Bonus', 0.12]]);
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

test('registry rejects dangling IDs, malformed restrictions and malformed transfer effects', () => {
  const base = ECHO_EFFECT_MODELS[0]!;
  assert.throws(
    () => createEchoEffectRegistry([{ ...base, effectId: 'BROKEN_ECHO', echoId: 'echo-missing' }]),
    /Unknown Echo id/,
  );

  const wielderBase = ECHO_EFFECT_MODELS.find((row) => row.appliesTo === 'WIELDER')!;
  assert.throws(
    () => createEchoEffectRegistry([{ ...wielderBase, effectId: 'BROKEN_CHARACTER', wielderCharacterIds: ['not-a-character'] }]),
    /unknown wielder character/,
  );
  assert.throws(
    () => createEchoEffectRegistry([{ ...wielderBase, effectId: 'DUPLICATE_CHARACTER', wielderCharacterIds: ['cartethyia', 'cartethyia'] }]),
    /duplicates wielder character/,
  );

  const transfer = ECHO_EFFECT_MODELS.find((row) => row.effectId === 'REMINISCENCE_DENIA_INCOMING_FUSION')!;
  assert.throws(
    () => createEchoEffectRegistry([{ ...transfer, effectId: 'BROKEN_WINDOW', activationWindowSeconds: undefined }]),
    /requires activationWindowSeconds/,
  );
});
