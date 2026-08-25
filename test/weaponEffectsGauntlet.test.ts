import assert from 'node:assert/strict';
import test from 'node:test';

import { getWeaponEffect, getWeaponEffects } from '../src/effectRegistry.ts';

test('Abyss Surges keeps permanent ER separate from reciprocal Basic/Skill windows', () => {
  const rows = getWeaponEffects('abyss-surges');
  assert.deepEqual(rows.map((row) => row.effectId), ['AS-ER', 'AS-BASIC', 'AS-SKILL']);
  assert.deepEqual(rows[0]?.rankValues, [.128, .16, .192, .224, .256]);
  assert.equal(rows[0]?.effectType, 'PERMANENT');
  for (const effect of rows.slice(1)) {
    assert.deepEqual(effect.rankValues, [.10, .125, .15, .175, .20]);
    assert.equal(effect.durationSeconds, 8);
    assert.equal(effect.simulatorMode, 'MANUAL');
  }
});

test('Blazing Justice preserves verified magnitudes while disputed trigger semantics stay pending-model', () => {
  const rows = getWeaponEffects('blazing-justice');
  assert.deepEqual(rows.map((row) => row.effectId), ['BJ-ATK', 'BJ-DEF', 'BJ-FRAZZLE']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.equal(rows[0]?.effectType, 'PERMANENT');
  assert.deepEqual(rows[1]?.rankValues, [.08, .10, .12, .14, .16]);
  assert.deepEqual(rows[2]?.rankValues, [.50, .625, .75, .875, 1]);
  for (const effect of rows.slice(1)) {
    assert.equal(effect.durationSeconds, 6);
    assert.equal(effect.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
    assert.equal(effect.simulatorMode, 'MANUAL');
    assert.match(effect.trigger, /unresolved/i);
    assert.ok(effect.conditions.some((condition) => /Basic Attack vs Resonance Liberation/i.test(condition)));
  }
});

test("Daybreaker's Spine separates Spectro, Basic amplification and Basic-only DEF ignore", () => {
  const rows = getWeaponEffects('daybreakers-spine');
  assert.deepEqual(rows.map((row) => row.effectId), ['DBS-ATK', 'DBS-SPECTRO', 'DBS-BASIC-AMP', 'DBS-BASIC-DEF']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.deepEqual(rows[1]?.rankValues, [.20, .25, .30, .35, .40]);
  assert.equal(rows[1]?.durationSeconds, 4);
  assert.deepEqual(rows[2]?.rankValues, [.20, .25, .30, .35, .40]);
  assert.equal(rows[2]?.durationSeconds, 6);
  assert.deepEqual(rows[3]?.rankValues, [.10, .125, .15, .175, .20]);
  assert.equal(rows[3]?.durationSeconds, 6);
  assert.deepEqual(rows[3]?.conditions, ['Damage is Basic Attack DMG']);
});

test("Moongazer's Sigil keeps Shield stacks explicit and max-stack mutation pending-model", () => {
  const rows = getWeaponEffects('moongazers-sigil');
  assert.deepEqual(rows.map((row) => row.effectId), ['MGS-ATK', 'MGS-LIB', 'MGS-DEF', 'MGS-MAX-STACK']);
  assert.deepEqual(rows[1]?.rankValues, [.20, .25, .30, .35, .40]);
  assert.equal(rows[1]?.durationSeconds, 15);
  assert.deepEqual(rows[2]?.rankValues, [.072, .084, .096, .108, .12]);
  assert.equal(rows[2]?.effectType, 'STACKING');
  assert.equal(rows[2]?.maxStacks, 5);
  assert.equal(rows[2]?.durationSeconds, 7);
  assert.equal(rows[2]?.triggerCooldownSeconds, .5);
  assert.equal(rows[2]?.stackIntervalSeconds, .5);
  assert.equal(rows[3]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(rows[3]?.rankValues, [5, 5, 5, 5, 5]);
  assert.equal(rows[3]?.durationSeconds, 3);
  assert.equal(rows[3]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
});

test('Pulsation Bracer locks current rank series and keeps the live Wutheringlab conflict in provenance', () => {
  const rows = getWeaponEffects('pulsation-bracer');
  assert.deepEqual(rows.map((row) => row.effectId), ['PB-ATK', 'PB-BASIC']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.deepEqual(rows[1]?.rankValues, [.06, .067, .075, .082, .09]);
  assert.equal(rows[1]?.maxStacks, 4);
  assert.equal(rows[1]?.durationSeconds, 3);
  assert.equal(rows[1]?.triggerCooldownSeconds, .5);
  assert.equal(rows[1]?.stackIntervalSeconds, .5);
  assert.match(rows[1]?.provenance.notes?.join(' ') ?? '', /Wutheringlab.*6\/6\.7\/7\.4\/8\.1\/8\.8/i);
});

test('Solsworn Ciphers separates permanent ATK, Echo amplification and Aero-only DEF ignore', () => {
  const rows = getWeaponEffects('solsworn-ciphers');
  assert.deepEqual(rows.map((row) => row.effectId), ['SCIP-ATK', 'SCIP-ECHO-AMP', 'SCIP-AERO-DEF']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.deepEqual(rows[1]?.rankValues, [.32, .40, .48, .56, .64]);
  assert.equal(rows[1]?.durationSeconds, 15);
  assert.deepEqual(rows[2]?.rankValues, [.10, .125, .15, .175, .20]);
  assert.equal(rows[2]?.durationSeconds, 6);
  assert.deepEqual(rows[2]?.conditions, ['Damage is Aero DMG']);
});

test('Tragicomedy keeps its short Heavy window conditional', () => {
  const rows = getWeaponEffects('tragicomedy');
  assert.deepEqual(rows.map((row) => row.effectId), ['TC-ATK', 'TC-HEAVY']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.deepEqual(rows[1]?.rankValues, [.48, .60, .72, .84, .96]);
  assert.equal(rows[1]?.durationSeconds, 3);
  assert.equal(rows[1]?.simulatorMode, 'MANUAL');
});

test("Verity's Handle stores duration extension as raw cross-effect mutation", () => {
  const rows = getWeaponEffects('veritys-handle');
  assert.deepEqual(rows.map((row) => row.effectId), ['VH-ATTR', 'VH-LIB', 'VH-EXTEND']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.deepEqual(rows[1]?.rankValues, [.48, .60, .72, .84, .96]);
  assert.equal(rows[1]?.durationSeconds, 8);
  assert.equal(rows[2]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(rows[2]?.rankValues, [5, 5, 5, 5, 5]);
  assert.equal(rows[2]?.maxStacks, 3);
  assert.equal(rows[2]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
});

test('Aether Strike preserves weapon-facing rounded values while recording precision presentation', () => {
  const rows = getWeaponEffects('aether-strike');
  assert.deepEqual(rows.map((row) => row.effectId), ['AETH-ATK', 'AETH-LIB']);
  assert.deepEqual(rows[0]?.rankValues, [.072, .111, .151, .19, .23]);
  assert.deepEqual(rows[1]?.rankValues, [.108, .167, .226, .286, .345]);
  for (const effect of rows) assert.equal(effect.durationSeconds, 15);
  assert.match(rows[0]?.provenance.notes?.join(' ') ?? '', /11\.16.*15\.12.*19\.08.*23\.04/i);
});

test('Celestial Spiral separates flat Resonance Energy from timed ATK', () => {
  const rows = getWeaponEffects('celestial-spiral');
  assert.deepEqual(rows.map((row) => row.effectId), ['CS-ENERGY', 'CS-ATK']);
  assert.equal(rows[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(rows[0]?.rankValues, [6, 7, 8, 9, 10]);
  assert.equal(rows[0]?.triggerCooldownSeconds, 20);
  assert.deepEqual(rows[1]?.rankValues, [.10, .125, .15, .175, .20]);
  assert.equal(rows[1]?.durationSeconds, 16);
  assert.equal(rows[1]?.triggerCooldownSeconds, 20);
});

test('Gauntlets#21D keeps dash window and Dodge Counter healing independent', () => {
  const rows = getWeaponEffects('gauntlets-21d');
  assert.deepEqual(rows.map((row) => row.effectId), ['G21D-ATK', 'G21D-COUNTER', 'G21D-HEAL']);
  assert.deepEqual(rows[0]?.rankValues, [.08, .10, .12, .14, .16]);
  assert.deepEqual(rows[1]?.rankValues, [.50, .625, .75, .875, 1]);
  assert.equal(rows[0]?.durationSeconds, 8);
  assert.equal(rows[1]?.durationSeconds, 8);
  assert.deepEqual(rows[2]?.rankValues, [.05, .0625, .075, .0875, .10]);
  assert.equal(rows[2]?.triggerCooldownSeconds, 6);
});

test('Hollow Mirage represents durationless stack state and explicit pending mutations', () => {
  const rows = getWeaponEffects('hollow-mirage');
  assert.deepEqual(rows.map((row) => row.effectId), ['HM-ATK', 'HM-DEF', 'HM-GAIN', 'HM-LOSS']);
  for (const effect of rows.slice(0, 2)) {
    assert.deepEqual(effect.rankValues, [.03, .035, .04, .045, .05]);
    assert.equal(effect.effectType, 'STATE_CONDITIONAL');
    assert.equal(effect.durationSeconds, null);
    assert.equal(effect.maxStacks, 3);
    assert.equal(effect.simulatorMode, 'MANUAL');
  }
  assert.equal(rows[2]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(rows[2]?.rankValues, [3, 3, 3, 3, 3]);
  assert.equal(rows[2]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
  assert.equal(rows[3]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(rows[3]?.rankValues, [1, 1, 1, 1, 1]);
  assert.equal(rows[3]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
});

test('remaining 4-star Gauntlets preserve raw event and stack mechanics', () => {
  const amity = getWeaponEffect('AA-LIB');
  assert.ok(amity);
  assert.deepEqual(amity.rankValues, [.20, .25, .30, .35, .40]);
  assert.equal(amity.durationSeconds, 15);

  const legend = getWeaponEffect('LDH-ATK');
  assert.ok(legend);
  assert.deepEqual(legend.rankValues, [.04, .05, .06, .07, .08]);
  assert.equal(legend.maxStacks, 4);
  assert.equal(legend.durationSeconds, 10);
  assert.equal(legend.triggerCooldownSeconds, 1);
  assert.equal(legend.stackIntervalSeconds, 1);

  const marcato = getWeaponEffect('MAR-CONCERTO');
  assert.ok(marcato);
  assert.equal(marcato.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(marcato.rankValues, [8, 10, 12, 14, 16]);
  assert.equal(marcato.triggerCooldownSeconds, 20);

  const stonard = getWeaponEffect('ST-LIB');
  assert.ok(stonard);
  assert.deepEqual(stonard.rankValues, [.18, .27, .36, .45, .54]);
  assert.equal(stonard.durationSeconds, 15);
});

test('low-rarity Gauntlets keep current trigger consensus and exact resource/heal facts', () => {
  const night = getWeaponEffect('GON-ATK');
  assert.ok(night);
  assert.equal(night.trigger, 'Cast Intro Skill');
  assert.deepEqual(night.rankValues, [.08, .10, .12, .14, .16]);
  assert.equal(night.durationSeconds, 10);
  assert.match(night.provenance.notes?.join(' ') ?? '', /Slyraf.*Outro/i);

  const voyager = getWeaponEffect('GOV-ENERGY');
  assert.ok(voyager);
  assert.equal(voyager.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(voyager.rankValues, [8, 9, 10, 11, 12]);
  assert.equal(voyager.triggerCooldownSeconds, 20);

  const guardian = getWeaponEffect('GG-LIB');
  assert.ok(guardian);
  assert.deepEqual(guardian.rankValues, [.12, .15, .18, .21, .24]);
  assert.equal(guardian.effectType, 'PERMANENT');

  const originite = getWeaponEffect('O4-HEAL');
  assert.ok(originite);
  assert.deepEqual(originite.rankValues, [.005, .0065, .008, .0095, .011]);
  assert.equal(originite.triggerCooldownSeconds, 3);

  const tyro = getWeaponEffect('TYRO-G-ATK');
  const training = getWeaponEffect('TRAIN-G-ATK');
  assert.ok(tyro && training);
  assert.deepEqual(tyro.rankValues, [.05, .0625, .075, .0875, .10]);
  assert.deepEqual(training.rankValues, [.04, .05, .06, .07, .08]);
});
