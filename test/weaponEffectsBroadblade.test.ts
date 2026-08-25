import assert from 'node:assert/strict';
import test from 'node:test';

import { getWeaponEffect, getWeaponEffects } from '../src/effectRegistry.ts';

test('Radiance Cleaver keeps permanent ATK separate from Tune Strain Liberation window', () => {
  const rows = getWeaponEffects('radiance-cleaver');
  assert.deepEqual(rows.map((row) => row.effectId), ['RC-ATK', 'RC-LIB']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.equal(rows[0]?.effectType, 'PERMANENT');
  assert.deepEqual(rows[1]?.rankValues, [.24, .27, .30, .33, .36]);
  assert.equal(rows[1]?.durationSeconds, 3);
  assert.deepEqual(rows[1]?.conditions, ['Damaged target is under Tune Strain - Interfered']);
  assert.equal(rows[1]?.simulatorMode, 'MANUAL');
});

test('Thunderflare Dominion preserves Heavy window and five-stack Shield DEF ignore', () => {
  const rows = getWeaponEffects('thunderflare-dominion');
  assert.deepEqual(rows.map((row) => row.effectId), ['TFD-ATK', 'TFD-HEAVY', 'TFD-DEF']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.deepEqual(rows[1]?.rankValues, [.20, .25, .30, .35, .40]);
  assert.equal(rows[1]?.durationSeconds, 15);
  assert.equal(rows[1]?.simulatorMode, 'MANUAL');
  assert.deepEqual(rows[2]?.rankValues, [.072, .084, .096, .108, .12]);
  assert.equal(rows[2]?.effectType, 'STACKING');
  assert.equal(rows[2]?.maxStacks, 5);
  assert.equal(rows[2]?.durationSeconds, 7);
  assert.equal(rows[2]?.triggerCooldownSeconds, .5);
  assert.equal(rows[2]?.stackIntervalSeconds, .5);
  assert.deepEqual(rows[2]?.conditions, ['Damage is Heavy Attack DMG']);
  assert.equal(rows[2]?.simulatorMode, 'MANUAL');
});

test('Aureate Zenith locks the current Heavy Attack consensus while keeping uptime manual', () => {
  const rows = getWeaponEffects('aureate-zenith');
  assert.deepEqual(rows.map((row) => row.effectId), ['AZ-ATK', 'AZ-HEAVY']);
  assert.deepEqual(rows[0]?.rankValues, [.072, .111, .151, .19, .23]);
  assert.deepEqual(rows[1]?.rankValues, [.108, .167, .226, .286, .345]);
  assert.equal(rows[1]?.statOrEffect, 'Heavy Attack DMG');
  assert.equal(rows[1]?.trigger, 'Cast Resonance Liberation');
  assert.equal(rows[1]?.durationSeconds, 15);
  assert.equal(rows[1]?.simulatorMode, 'MANUAL');
  assert.match(rows[1]?.provenance.notes?.join(' ') ?? '', /Wutheringlab.*Resonance Liberation/i);
});

test('Broadblade#41 preserves state-only ATK and rank-dependent healing thresholds', () => {
  const rows = getWeaponEffects('broadblade-41');
  assert.deepEqual(rows.map((row) => row.effectId), ['BB41-ATK', 'BB41-HEAL']);
  assert.equal(rows[0]?.effectType, 'STATE_CONDITIONAL');
  assert.equal(rows[0]?.durationSeconds, null);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.deepEqual(rows[0]?.conditions, ['Wielder HP is above 80%']);
  assert.deepEqual(rows[1]?.rankValues, [.05, .0625, .075, .0875, .10]);
  assert.equal(rows[1]?.triggerCooldownSeconds, 8);
  assert.match(rows[1]?.conditions.join(' ') ?? '', /R1 40%.*R2 50%.*R3 60%.*R4 70%.*R5 80%/);
});

test('Dauntless Evernight keeps Intro ATK and DEF as separate timed stats', () => {
  const rows = getWeaponEffects('dauntless-evernight');
  assert.deepEqual(rows.map((row) => row.effectId), ['DE-ATK', 'DE-DEF']);
  assert.deepEqual(rows[0]?.rankValues, [.08, .10, .12, .14, .16]);
  assert.deepEqual(rows[1]?.rankValues, [.15, .1875, .225, .2625, .30]);
  for (const effect of rows) {
    assert.equal(effect.trigger, 'Cast Intro Skill');
    assert.equal(effect.durationSeconds, 15);
    assert.equal(effect.simulatorMode, 'MANUAL');
  }
});

test('Discord and Waning Redshift keep flat resources separate from percentage buffs', () => {
  const discord = getWeaponEffects('discord');
  assert.deepEqual(discord.map((row) => row.effectId), ['DIS-CONCERTO']);
  assert.equal(discord[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(discord[0]?.rankValues, [8, 10, 12, 14, 16]);
  assert.equal(discord[0]?.triggerCooldownSeconds, 20);

  const waning = getWeaponEffects('waning-redshift');
  assert.deepEqual(waning.map((row) => row.effectId), ['WR-ENERGY', 'WR-ATK']);
  assert.equal(waning[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(waning[0]?.rankValues, [6, 7, 8, 9, 10]);
  assert.equal(waning[0]?.triggerCooldownSeconds, 20);
  assert.deepEqual(waning[1]?.rankValues, [.10, .125, .15, .175, .20]);
  assert.equal(waning[1]?.durationSeconds, 16);
  assert.equal(waning[1]?.triggerCooldownSeconds, 20);
});

test('Meditations on Mercy keeps Negative Status stacks conditional and timed', () => {
  const effect = getWeaponEffect('MOM-ATK');
  assert.ok(effect);
  assert.deepEqual(effect.rankValues, [.04, .05, .06, .07, .08]);
  assert.equal(effect.effectType, 'STACKING');
  assert.equal(effect.maxStacks, 4);
  assert.equal(effect.durationSeconds, 10);
  assert.equal(effect.triggerCooldownSeconds, 1);
  assert.equal(effect.stackIntervalSeconds, 1);
  assert.deepEqual(effect.conditions, ['Damaged enemy has a Negative Status']);
  assert.equal(effect.simulatorMode, 'MANUAL');
});

test('Beguiling Melody keeps Intro Concerto and Outro Resonance Energy distinct', () => {
  const rows = getWeaponEffects('beguiling-melody');
  assert.deepEqual(rows.map((row) => row.effectId), ['BM-CONCERTO', 'BM-ENERGY']);
  assert.equal(rows[0]?.statOrEffect, 'Concerto Energy');
  assert.equal(rows[0]?.trigger, 'Cast Intro Skill');
  assert.equal(rows[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(rows[0]?.rankValues, [4, 5, 6, 7, 8]);
  assert.equal(rows[1]?.statOrEffect, 'Resonance Energy');
  assert.equal(rows[1]?.trigger, 'Cast Outro Skill');
  assert.equal(rows[1]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(rows[1]?.rankValues, [4, 5, 6, 7, 8]);
});

test('Broadblade of Night locks Intro trigger consensus and Voyager stays flat Energy', () => {
  const night = getWeaponEffects('broadblade-of-night');
  assert.deepEqual(night.map((row) => row.effectId), ['BON-ATK']);
  assert.equal(night[0]?.trigger, 'Cast Intro Skill');
  assert.deepEqual(night[0]?.rankValues, [.08, .10, .12, .14, .16]);
  assert.equal(night[0]?.durationSeconds, 10);
  assert.match(night[0]?.provenance.notes?.join(' ') ?? '', /Slyraf.*Outro/i);

  const voyager = getWeaponEffects('broadblade-of-voyager');
  assert.deepEqual(voyager.map((row) => row.effectId), ['BOV-ENERGY']);
  assert.equal(voyager[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(voyager[0]?.rankValues, [8, 9, 10, 11, 12]);
  assert.equal(voyager[0]?.triggerCooldownSeconds, 20);
});

test('low-rarity Broadblade effects stay explicit and do not invent recommendation data', () => {
  const guardian = getWeaponEffects('guardian-broadblade');
  assert.deepEqual(guardian.map((row) => row.effectId), ['GB-BASIC', 'GB-HEAVY']);
  for (const effect of guardian) {
    assert.deepEqual(effect.rankValues, [.12, .15, .18, .21, .24]);
    assert.equal(effect.effectType, 'PERMANENT');
    assert.equal(effect.simulatorMode, 'ALWAYS');
  }

  const originite = getWeaponEffects('originite-type-i');
  assert.deepEqual(originite.map((row) => row.effectId), ['O1-HEAL']);
  assert.deepEqual(originite[0]?.rankValues, [.03, .0375, .045, .0525, .06]);
  assert.equal(originite[0]?.triggerCooldownSeconds, 12);
  assert.equal(originite[0]?.simulatorMode, 'MANUAL');

  const tyro = getWeaponEffects('tyro-broadblade');
  const training = getWeaponEffects('training-broadblade');
  assert.deepEqual(tyro[0]?.rankValues, [.05, .0625, .075, .0875, .10]);
  assert.deepEqual(training[0]?.rankValues, [.04, .05, .06, .07, .08]);
  assert.equal(tyro[0]?.effectType, 'PERMANENT');
  assert.equal(training[0]?.effectType, 'PERMANENT');
});
