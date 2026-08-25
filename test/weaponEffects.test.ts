import assert from 'node:assert/strict';
import test from 'node:test';

import { getWeaponEffectCoverageStatus } from '../src/data/weaponEffectAudit.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffects.ts';
import {
  WEAPON_EFFECT_CATALOG_META,
  getWeaponEffect,
  getWeaponEffects,
} from '../src/effectRegistry.ts';

test('Weapon Effect roster completion remains partial while released coverage is explicit', () => {
  assert.equal(WEAPON_EFFECT_CATALOG.length, 51);
  assert.equal(WEAPON_EFFECT_CATALOG_META.migratedEffectCount, 51);
  assert.equal(WEAPON_EFFECT_CATALOG_META.coveredWeaponCount, 28);
  assert.equal(WEAPON_EFFECT_CATALOG_META.totalWeaponCount, 122);
  assert.equal(WEAPON_EFFECT_CATALOG_META.releasedWeaponCount, 121);
  assert.equal(WEAPON_EFFECT_CATALOG_META.releasedExplicitCoverageCount, 121);
  assert.equal(WEAPON_EFFECT_CATALOG_META.pendingSourceAuditCount, 93);
  assert.equal(WEAPON_EFFECT_CATALOG_META.fullReleasedRosterComplete, false);
  assert.equal(WEAPON_EFFECT_CATALOG_META.completeness, 'PARTIAL');
  assert.equal(new Set(WEAPON_EFFECT_CATALOG.map((row) => row.effectId)).size, 51);
});

test('each effect carries source-backed rank values and explicit mechanics metadata', () => {
  for (const effect of WEAPON_EFFECT_CATALOG) {
    assert.equal(effect.rankValues.length, 5, effect.effectId);
    assert.ok(effect.rankValues.every((value) => Number.isFinite(value) && value >= 0), effect.effectId);
    assert.ok(effect.maxStacks >= 1, effect.effectId);
    assert.ok(effect.provenance.sourceLabels.length >= 1, effect.effectId);
    assert.ok(effect.provenance.sourceUrls.length >= 1, effect.effectId);
    assert.ok(effect.provenance.checkedAt.length > 0, effect.effectId);
    assert.ok(['DECIMAL_MULTIPLIER', 'FLAT_AMOUNT'].includes(effect.valueUnit), effect.effectId);
    assert.ok(Array.isArray(effect.conditions), effect.effectId);

    if (effect.effectType === 'PERMANENT') {
      assert.equal(effect.durationSeconds, null, effect.effectId);
      assert.equal(effect.trigger, 'Passive', effect.effectId);
      assert.equal(effect.triggerCooldownSeconds, null, effect.effectId);
    } else if (effect.effectType === 'INSTANT') {
      assert.equal(effect.durationSeconds, null, effect.effectId);
      assert.notEqual(effect.trigger, 'Passive', effect.effectId);
    } else {
      assert.ok((effect.durationSeconds ?? 0) > 0, effect.effectId);
    }
  }
});

test('effect records stay independent from character/team/build recommendation records', () => {
  for (const effect of WEAPON_EFFECT_CATALOG) {
    for (const forbidden of [
      'characterId',
      'recommendedCharacterId',
      'teamProfileId',
      'rotationProfileId',
      'isBestInSlot',
      'uiSelectable',
      'conditionalAudit',
    ]) {
      assert.equal(Object.hasOwn(effect, forbidden), false, `${effect.effectId}: leaked ${forbidden}`);
    }
  }
});

test('permanent and stack-dependent weapon effects can coexist under one weapon', () => {
  const stringmaster = getWeaponEffects('stringmaster');
  assert.deepEqual(stringmaster.map((row) => row.effectId), ['SM-ATTR', 'SM-ATK']);
  assert.equal(stringmaster[0]?.effectType, 'PERMANENT');
  assert.equal(stringmaster[1]?.effectType, 'STACKING');
  assert.equal(stringmaster[1]?.maxStacks, 2);
});

test('conditional team effects remain conditional data rather than automatic uptime', () => {
  const kumokiri = getWeaponEffect('KUMO-TEAM');
  const spectrum = getWeaponEffect('SB-TEAM');
  const starfield = getWeaponEffect('SC-TEAM-CD');
  assert.ok(kumokiri && spectrum && starfield);
  assert.equal(kumokiri.mechanicsStatus, 'VERIFIED_CONDITIONAL');
  assert.equal(spectrum.mechanicsStatus, 'VERIFIED_CONDITIONAL');
  assert.equal(starfield.mechanicsStatus, 'VERIFIED_CONDITIONAL');
  assert.equal(spectrum.maxStacks, 3);
  assert.deepEqual(spectrum.rankValues, [.08, .10, .12, .14, .16]);
});

test('Relativistic Jet separates instant flat Energy from the timed ATK window', () => {
  const rows = getWeaponEffects('relativistic-jet');
  assert.deepEqual(rows.map((row) => row.effectId), ['RJ-ENERGY', 'RJ-ATK']);

  const energy = rows[0];
  const atk = rows[1];
  assert.ok(energy && atk);

  assert.equal(energy.valueUnit, 'FLAT_AMOUNT');
  assert.equal(energy.effectType, 'INSTANT');
  assert.deepEqual(energy.rankValues, [6, 7, 8, 9, 10]);
  assert.equal(energy.durationSeconds, null);
  assert.equal(energy.triggerCooldownSeconds, 20);
  assert.equal(energy.appliesTo, 'SELF');

  assert.equal(atk.valueUnit, 'DECIMAL_MULTIPLIER');
  assert.equal(atk.effectType, 'TRIGGERED');
  assert.deepEqual(atk.rankValues, [.10, .125, .15, .175, .20]);
  assert.equal(atk.durationSeconds, 16);
  assert.equal(atk.triggerCooldownSeconds, 20);
  assert.equal(atk.simulatorMode, 'MANUAL');
});

test('Woodland Aria keeps self buffs separate from the target Aero RES debuff', () => {
  const rows = getWeaponEffects('woodland-aria');
  assert.deepEqual(rows.map((row) => row.effectId), ['WA-ATK', 'WA-AERO', 'WA-AERO-RES']);

  const permanentAtk = rows[0];
  const aero = rows[1];
  const res = rows[2];
  assert.ok(permanentAtk && aero && res);

  assert.equal(permanentAtk.effectType, 'PERMANENT');
  assert.deepEqual(permanentAtk.rankValues, [.12, .15, .18, .21, .24]);

  assert.equal(aero.effectType, 'TRIGGERED');
  assert.equal(aero.durationSeconds, 10);
  assert.equal(aero.appliesTo, 'SELF');
  assert.equal(aero.simulatorMode, 'MANUAL');

  assert.equal(res.appliesTo, 'TARGET');
  assert.equal(res.statOrEffect, 'Aero RES Reduction');
  assert.deepEqual(res.rankValues, [.10, .115, .13, .145, .16]);
  assert.equal(res.durationSeconds, 20);
  assert.deepEqual(res.conditions, ['Target is affected by Aero Erosion']);
  assert.equal(res.simulatorMode, 'MANUAL');
});

test('Pistol batch 2 preserves raw R1-R5 mechanics without assuming event uptime', () => {
  const expected = [
    ['cadenza', 'CAD-CONCERTO', [8, 10, 12, 14, 16], 'INSTANT', 'FLAT_AMOUNT', 1, 20],
    ['pistols-of-voyager', 'POV-ENERGY', [8, 9, 10, 11, 12], 'INSTANT', 'FLAT_AMOUNT', 1, 20],
    ['pistols-of-night', 'PON-ATK', [.08, .10, .12, .14, .16], 'TRIGGERED', 'DECIMAL_MULTIPLIER', 1, null],
    ['guardian-pistols', 'GP-SKILL', [.12, .15, .18, .21, .24], 'PERMANENT', 'DECIMAL_MULTIPLIER', 1, null],
    ['originite-type-iii', 'O3-HEAL', [.016, .02, .024, .028, .032], 'INSTANT', 'DECIMAL_MULTIPLIER', 1, 6],
    ['tyro-pistols', 'TYRO-P-ATK', [.05, .0625, .075, .0875, .10], 'PERMANENT', 'DECIMAL_MULTIPLIER', 1, null],
    ['training-pistols', 'TRAIN-P-ATK', [.04, .05, .06, .07, .08], 'PERMANENT', 'DECIMAL_MULTIPLIER', 1, null],
    ['undying-flame', 'UF-SKILL', [.20, .25, .30, .35, .40], 'TRIGGERED', 'DECIMAL_MULTIPLIER', 1, null],
    ['novaburst', 'NB-ATK', [.04, .05, .06, .07, .08], 'STACKING', 'DECIMAL_MULTIPLIER', 3, null],
    ['thunderbolt', 'TB-SKILL', [.07, .11, .15, .19, .23], 'STACKING', 'DECIMAL_MULTIPLIER', 3, 1],
  ] as const;

  for (const [weaponId, effectId, rankValues, effectType, valueUnit, maxStacks, triggerCooldownSeconds] of expected) {
    const rows = getWeaponEffects(weaponId);
    assert.equal(rows.length, 1, weaponId);
    const effect = rows[0];
    assert.ok(effect);
    assert.equal(effect.effectId, effectId);
    assert.deepEqual(effect.rankValues, rankValues);
    assert.equal(effect.effectType, effectType);
    assert.equal(effect.valueUnit, valueUnit);
    assert.equal(effect.maxStacks, maxStacks);
    assert.equal(effect.triggerCooldownSeconds, triggerCooldownSeconds);
    if (effectType === 'PERMANENT') {
      assert.equal(effect.simulatorMode, 'ALWAYS');
    } else {
      assert.equal(effect.simulatorMode, 'MANUAL');
      assert.equal(effect.mechanicsStatus, 'VERIFIED_CONDITIONAL');
    }
  }

  assert.equal(getWeaponEffect('PON-ATK')?.trigger, 'Cast Intro Skill');
  assert.equal(getWeaponEffect('PON-ATK')?.durationSeconds, 10);
  assert.equal(getWeaponEffect('O3-HEAL')?.statOrEffect, 'HP Restore (Max HP)');
  assert.equal(getWeaponEffect('NB-ATK')?.durationSeconds, 8);
  assert.equal(getWeaponEffect('TB-SKILL')?.durationSeconds, 10);
  assert.equal(getWeaponEffect('TB-SKILL')?.stackIntervalSeconds, 1);
});

test('pending effect audit is explicit and cannot be consumed as an empty passive', () => {
  assert.equal(getWeaponEffectCoverageStatus('thunderflare-dominion'), 'PENDING_SOURCE_AUDIT');
  assert.throws(
    () => getWeaponEffects('thunderflare-dominion'),
    /PENDING_SOURCE_AUDIT.*must not be interpreted as zero effect/,
  );
  assert.equal(getWeaponEffect('DOES-NOT-EXIST'), null);
});

test('upcoming weapon effect coverage stays outside the released gate instead of reading as zero', () => {
  assert.equal(getWeaponEffectCoverageStatus('thousandfold-deliverance'), 'NOT_RELEASED');
  assert.throws(
    () => getWeaponEffects('thousandfold-deliverance'),
    /NOT_RELEASED.*must not be interpreted as zero effect/,
  );
});
