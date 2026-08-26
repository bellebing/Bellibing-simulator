import assert from 'node:assert/strict';
import test from 'node:test';

import { SWORD_WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectsSword.ts';
import { getWeaponEffect, getWeaponEffects } from '../src/effectRegistry.ts';

const EXPECTED_SWORD_IDS = [
  'blazing-brilliance', 'bloodpacts-pledge', 'defiers-thorn', 'emerald-sentence', 'emerald-of-genesis',
  'everbright-polestar', 'frostburn', 'laser-shearer', 'red-spring', 'unflickering-valor', 'glint-of-clouds',
  'commando-of-conviction', 'endless-collapse', 'fables-of-wisdom', 'feather-edge', 'lumingloss',
  'lunar-cutter', 'overture', 'somnoire-anchor', 'sword-18', 'guardian-sword', 'originite-type-ii',
  'sword-of-night', 'sword-of-voyager', 'tyro-sword', 'training-sword',
] as const;

test('Sword source slice has explicit effect rows for all 26 previously pending released Swords', () => {
  assert.equal(SWORD_WEAPON_EFFECT_CATALOG.length, 56);
  const covered = [...new Set(SWORD_WEAPON_EFFECT_CATALOG.map((effect) => effect.weaponId))].sort();
  assert.deepEqual(covered, [...EXPECTED_SWORD_IDS].sort());
  for (const weaponId of EXPECTED_SWORD_IDS) assert.ok(getWeaponEffects(weaponId).length > 0, weaponId);
});

test('Blazing Brilliance preserves stack lifecycle and the 12-second source conflict explicitly', () => {
  const rows = getWeaponEffects('blazing-brilliance');
  assert.deepEqual(rows.map((row) => row.effectId), ['BBR-ATK', 'BBR-SKILL', 'BBR-SKILL-CAST-STACKS']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.deepEqual(rows[1]?.rankValues, [.04, .05, .06, .07, .08]);
  assert.equal(rows[1]?.maxStacks, 14);
  assert.equal(rows[1]?.durationSeconds, 12);
  assert.equal(rows[1]?.triggerCooldownSeconds, .5);
  assert.equal(rows[1]?.stackIntervalSeconds, .5);
  assert.equal(rows[1]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
  assert.equal(rows[2]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(rows[2]?.rankValues, [5, 5, 5, 5, 5]);
  assert.equal(rows[2]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
  assert.match(rows[1]?.provenance.notes?.join(' ') ?? '', /10 seconds/i);
});

test("Bloodpact's Pledge keeps healing self-buff separate from Rover Aero team amplification", () => {
  const rows = getWeaponEffects('bloodpacts-pledge');
  assert.deepEqual(rows.map((row) => row.effectId), ['BPP-SKILL', 'BPP-TEAM-AERO']);
  assert.deepEqual(rows[0]?.rankValues, [.10, .14, .18, .22, .26]);
  assert.equal(rows[0]?.durationSeconds, 6);
  assert.equal(rows[0]?.appliesTo, 'SELF');
  assert.deepEqual(rows[1]?.rankValues, [.10, .14, .18, .22, .26]);
  assert.equal(rows[1]?.durationSeconds, 30);
  assert.equal(rows[1]?.appliesTo, 'TEAM');
  assert.ok(rows[1]?.conditions.some((condition) => /Rover \(Aero\)/.test(condition)));
  assert.ok(rows[1]?.conditions.some((condition) => /Unbound Flow/.test(condition)));
});

test("Defier's Thorn keeps literal 15-second timing semantics pending-model", () => {
  const rows = getWeaponEffects('defiers-thorn');
  assert.deepEqual(rows.map((row) => row.effectId), ['DT-HP', 'DT-DEF', 'DT-AERO-AMP']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.equal(rows[1]?.effectType, 'STATE_CONDITIONAL');
  assert.equal(rows[1]?.durationSeconds, null);
  assert.equal(rows[1]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
  assert.ok(rows[1]?.conditions.some((condition) => /15s after/.test(condition)));
  assert.equal(rows[2]?.appliesTo, 'TARGET');
  assert.deepEqual(rows[2]?.rankValues, [.20, .25, .30, .35, .40]);
});

test('Emerald Sentence uses current 10-second prerequisite and 12-second Bamboo Cleaver semantics', () => {
  const rows = getWeaponEffects('emerald-sentence');
  assert.deepEqual(rows.map((row) => row.effectId), ['ES-ATK', 'ES-HEAVY', 'ES-TEAM-ECHO']);
  assert.deepEqual(rows[1]?.rankValues, [.30, .375, .45, .525, .60]);
  assert.equal(rows[1]?.durationSeconds, 12);
  assert.equal(rows[1]?.triggerCooldownSeconds, 10);
  assert.equal(rows[1]?.maxStacks, 2);
  assert.deepEqual(rows[2]?.rankValues, [.20, .25, .30, .35, .40]);
  assert.equal(rows[2]?.durationSeconds, 30);
  assert.equal(rows[2]?.appliesTo, 'TEAM');
  assert.match(rows[1]?.provenance.notes?.join(' ') ?? '', /Wutheringlab/i);
});

test('Emerald of Genesis separates permanent ER from two-stack Skill ATK', () => {
  const rows = getWeaponEffects('emerald-of-genesis');
  assert.deepEqual(rows.map((row) => row.effectId), ['EOG-ER', 'EOG-ATK']);
  assert.deepEqual(rows[0]?.rankValues, [.128, .16, .192, .224, .256]);
  assert.deepEqual(rows[1]?.rankValues, [.06, .075, .09, .105, .12]);
  assert.equal(rows[1]?.maxStacks, 2);
  assert.equal(rows[1]?.durationSeconds, 10);
});

test('Everbright Polestar retains current Fusion RES sequence and conflict provenance', () => {
  const rows = getWeaponEffects('everbright-polestar');
  assert.deepEqual(rows.map((row) => row.effectId), ['EP-ATTR', 'EP-LIB-DEF', 'EP-LIB-FUSION-RES']);
  assert.deepEqual(rows[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.deepEqual(rows[1]?.rankValues, [.32, .40, .48, .56, .64]);
  assert.deepEqual(rows[2]?.rankValues, [.10, .15, .20, .25, .30]);
  assert.equal(rows[1]?.durationSeconds, 8);
  assert.equal(rows[2]?.durationSeconds, 8);
  assert.match(rows[2]?.provenance.notes?.join(' ') ?? '', /11\.5/);
});

test('Frostburn does not invent durations for the Glacio Chafe state clauses', () => {
  const rows = getWeaponEffects('frostburn');
  assert.deepEqual(rows.map((row) => row.effectId), ['FB-ATK', 'FB-GLACIO', 'FB-LIB-DEF', 'FB-CHAFE-AMP']);
  assert.equal(rows[1]?.effectType, 'STATE_CONDITIONAL');
  assert.equal(rows[1]?.durationSeconds, null);
  assert.deepEqual(rows[1]?.rankValues, [.28, .35, .42, .49, .56]);
  assert.equal(rows[2]?.effectType, 'STATE_CONDITIONAL');
  assert.equal(rows[2]?.durationSeconds, null);
  assert.deepEqual(rows[2]?.rankValues, [.10, .125, .15, .175, .20]);
  assert.equal(rows[3]?.durationSeconds, 6);
  assert.equal(rows[3]?.triggerCooldownSeconds, .1);
});

test('Glint of Clouds keeps max-stack duration extension as cross-effect pending-model state', () => {
  const rows = getWeaponEffects('glint-of-clouds');
  assert.deepEqual(rows.map((row) => row.effectId), ['GOC-ATK', 'GOC-AERO', 'GOC-DURATION', 'GOC-DEF']);
  assert.deepEqual(rows[1]?.rankValues, [.112, .14, .168, .196, .224]);
  assert.equal(rows[1]?.durationSeconds, 2);
  assert.equal(rows[1]?.maxStacks, 5);
  assert.equal(rows[1]?.triggerCooldownSeconds, .5);
  assert.deepEqual(rows[2]?.rankValues, [30, 30, 30, 30, 30]);
  assert.equal(rows[2]?.valueUnit, 'FLAT_AMOUNT');
  assert.equal(rows[2]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
  assert.equal(rows[3]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
  assert.deepEqual(rows[3]?.rankValues, [.10, .125, .15, .175, .20]);
});

test('Laser Shearer, Red Spring and Unflickering Valor preserve independent timed windows', () => {
  const laser = getWeaponEffects('laser-shearer');
  assert.deepEqual(laser.map((row) => row.effectId), ['LS-ATK', 'LS-SKILL']);
  assert.deepEqual(laser[1]?.rankValues, [.24, .27, .30, .33, .36]);
  assert.equal(laser[1]?.durationSeconds, 3);

  const red = getWeaponEffects('red-spring');
  assert.deepEqual(red.map((row) => row.effectId), ['RS-ATK', 'RS-BASIC', 'RS-CONCERTO-BASIC']);
  assert.deepEqual(red[1]?.rankValues, [.10, .125, .15, .175, .20]);
  assert.equal(red[1]?.durationSeconds, 14);
  assert.equal(red[1]?.maxStacks, 3);
  assert.deepEqual(red[2]?.rankValues, [.40, .50, .60, .70, .80]);
  assert.equal(red[2]?.durationSeconds, 10);

  const valor = getWeaponEffects('unflickering-valor');
  assert.deepEqual(valor.map((row) => row.effectId), ['UV-CR', 'UV-LIB-BASIC', 'UV-BASIC-BASIC']);
  assert.deepEqual(valor[0]?.rankValues, [.08, .10, .12, .14, .16]);
  assert.equal(valor[1]?.durationSeconds, 10);
  assert.equal(valor[2]?.durationSeconds, 4);
});

test('4-star resource and damage windows remain mechanically separate', () => {
  const endless = getWeaponEffects('endless-collapse');
  assert.deepEqual(endless.map((row) => row.effectId), ['EC-ENERGY', 'EC-ATK']);
  assert.equal(endless[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(endless[0]?.rankValues, [6, 7, 8, 9, 10]);
  assert.equal(endless[0]?.triggerCooldownSeconds, 20);
  assert.deepEqual(endless[1]?.rankValues, [.10, .125, .15, .175, .20]);
  assert.equal(endless[1]?.durationSeconds, 16);

  const overture = getWeaponEffects('overture');
  assert.equal(overture[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(overture[0]?.rankValues, [8, 10, 12, 14, 16]);
  assert.equal(overture[0]?.triggerCooldownSeconds, 20);

  const voyager = getWeaponEffects('sword-of-voyager');
  assert.equal(voyager[0]?.valueUnit, 'FLAT_AMOUNT');
  assert.deepEqual(voyager[0]?.rankValues, [8, 9, 10, 11, 12]);
  assert.equal(voyager[0]?.triggerCooldownSeconds, 20);
});

test('Lunar Cutter and Somnoire Anchor preserve mutable stack state as pending-model where required', () => {
  const lunar = getWeaponEffects('lunar-cutter');
  assert.deepEqual(lunar.map((row) => row.effectId), ['LC-ATK', 'LC-ENTER', 'LC-DECAY', 'LC-DEFEAT']);
  assert.equal(lunar[0]?.effectType, 'STATE_CONDITIONAL');
  assert.equal(lunar[0]?.maxStacks, 6);
  assert.equal(lunar[0]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
  assert.deepEqual(lunar[0]?.rankValues, [.02, .025, .03, .035, .04]);
  for (const effect of lunar.slice(1)) {
    assert.equal(effect.valueUnit, 'FLAT_AMOUNT');
    assert.equal(effect.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
  }
  assert.equal(lunar[1]?.triggerCooldownSeconds, 12);
  assert.equal(lunar[2]?.triggerCooldownSeconds, 2);

  const somnoire = getWeaponEffects('somnoire-anchor');
  assert.deepEqual(somnoire.map((row) => row.effectId), ['SA-ATK', 'SA-CR', 'SA-CLEAR']);
  assert.equal(somnoire[0]?.maxStacks, 10);
  assert.equal(somnoire[0]?.durationSeconds, 3);
  assert.deepEqual(somnoire[1]?.rankValues, [.06, .075, .09, .105, .12]);
  assert.equal(somnoire[2]?.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
  assert.equal(somnoire[2]?.valueUnit, 'FLAT_AMOUNT');
});

test('Sword#18 preserves rank-dependent HP thresholds rather than collapsing them', () => {
  const rows = getWeaponEffects('sword-18');
  assert.deepEqual(rows.map((row) => row.effectId), ['S18-HEAVY', 'S18-HEAL']);
  for (const effect of rows) assert.ok(effect.conditions.some((condition) => /R1 40%.*R5 80%/.test(condition)));
  assert.deepEqual(rows[0]?.rankValues, [.18, .225, .27, .315, .36]);
  assert.deepEqual(rows[1]?.rankValues, [.05, .0625, .075, .0875, .10]);
  assert.equal(rows[1]?.triggerCooldownSeconds, 8);
});

test('Guardian Sword and low-rarity Sword effects keep verified identities and rank values', () => {
  const guardian = getWeaponEffects('guardian-sword');
  assert.deepEqual(guardian.map((row) => row.effectId), ['GS-SKILL']);
  assert.equal(guardian[0]?.statOrEffect, 'Resonance Skill DMG');
  assert.deepEqual(guardian[0]?.rankValues, [.12, .15, .18, .21, .24]);
  assert.match(guardian[0]?.notes ?? '', /Slyraf/i);

  const originite = getWeaponEffects('originite-type-ii');
  assert.deepEqual(originite[0]?.rankValues, [.05, .0625, .075, .0875, .10]);
  assert.equal(originite[0]?.triggerCooldownSeconds, 20);

  const night = getWeaponEffects('sword-of-night');
  assert.equal(night[0]?.trigger, 'Cast Intro Skill');
  assert.deepEqual(night[0]?.rankValues, [.08, .10, .12, .14, .16]);
  assert.equal(night[0]?.durationSeconds, 10);

  const tyro = getWeaponEffects('tyro-sword');
  const training = getWeaponEffects('training-sword');
  assert.deepEqual(tyro[0]?.rankValues, [.05, .0625, .075, .0875, .10]);
  assert.deepEqual(training[0]?.rankValues, [.04, .05, .06, .07, .08]);
  assert.equal(tyro[0]?.effectType, 'PERMANENT');
  assert.equal(training[0]?.effectType, 'PERMANENT');
});

test('Sword source completion does not erase raw pending-model mechanics', () => {
  const pendingModel = SWORD_WEAPON_EFFECT_CATALOG.filter((effect) => effect.mechanicsStatus === 'VERIFIED_RAW_PENDING_MODEL');
  assert.ok(pendingModel.length > 0);
  const ids = new Set(pendingModel.map((effect) => effect.effectId));
  for (const required of ['BBR-SKILL', 'BBR-SKILL-CAST-STACKS', 'DT-DEF', 'GOC-DURATION', 'GOC-DEF', 'LC-ATK', 'LC-ENTER', 'LC-DECAY', 'LC-DEFEAT', 'SA-CLEAR']) {
    assert.ok(ids.has(required), required);
  }

  const defiers = getWeaponEffect('DT-DEF');
  assert.equal(defiers?.durationSeconds, null);
});