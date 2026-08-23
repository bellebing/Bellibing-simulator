import assert from 'node:assert/strict';
import test from 'node:test';

import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffects.ts';
import {
  WEAPON_EFFECT_CATALOG_META,
  getWeaponEffect,
  getWeaponEffects,
} from '../src/effectRegistry.ts';

test('V9.15 weapon effect migration is explicit and partial', () => {
  assert.equal(WEAPON_EFFECT_CATALOG.length, 36);
  assert.equal(WEAPON_EFFECT_CATALOG_META.migratedEffectCount, 36);
  assert.equal(WEAPON_EFFECT_CATALOG_META.coveredWeaponCount, 16);
  assert.equal(WEAPON_EFFECT_CATALOG_META.totalWeaponCount, 122);
  assert.equal(WEAPON_EFFECT_CATALOG_META.completeness, 'PARTIAL');
  assert.equal(new Set(WEAPON_EFFECT_CATALOG.map((row) => row.effectId)).size, 36);
});

test('each effect carries five source-backed rank values and valid mechanics metadata', () => {
  for (const effect of WEAPON_EFFECT_CATALOG) {
    assert.equal(effect.rankValues.length, 5, effect.effectId);
    assert.ok(effect.rankValues.every((value) => Number.isFinite(value) && value >= 0), effect.effectId);
    assert.ok(effect.maxStacks >= 1, effect.effectId);
    assert.ok(effect.provenance.sourceLabels.includes('V9.15 Weapon Effects'), effect.effectId);
    if (effect.effectType === 'PERMANENT') {
      assert.equal(effect.durationSeconds, null, effect.effectId);
      assert.equal(effect.trigger, 'Passive', effect.effectId);
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

test('missing migrated effect data means pending migration, not a fabricated empty passive', () => {
  assert.deepEqual(getWeaponEffects('thunderflare-dominion'), []);
  assert.equal(getWeaponEffect('DOES-NOT-EXIST'), null);
});
