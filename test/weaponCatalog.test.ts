import assert from 'node:assert/strict';
import test from 'node:test';

import { createContentRegistry } from '../src/contentRegistry.ts';
import {
  WEAPON_BY_ID,
  WEAPON_CATALOG,
  getWeaponGameData,
} from '../src/data/weapons.ts';

test('weapon catalog contains V9.15 audited roster plus the two Version 3.6 weapons', () => {
  assert.equal(WEAPON_CATALOG.length, 122);
  assert.equal(WEAPON_BY_ID.size, 122);
  assert.equal(new Set(WEAPON_CATALOG.map((weapon) => weapon.id)).size, 122);

  const registry = createContentRegistry(WEAPON_CATALOG);
  assert.equal(registry.weapons.size, 122);
  assert.equal(registry.characters.size, 0);
  assert.equal(registry.echoSets.size, 0);
});

test('rarity coverage preserves the full game catalog instead of UI selectability', () => {
  const counts = new Map<number, number>();
  for (const weapon of WEAPON_CATALOG) {
    counts.set(weapon.rarity, (counts.get(weapon.rarity) ?? 0) + 1);
  }

  assert.deepEqual(Object.fromEntries([...counts.entries()].sort(([a], [b]) => a - b)), {
    1: 5,
    2: 5,
    3: 21,
    4: 43,
    5: 48,
  });
});

test('raw weapons never embed character recommendations, signatures or UI filtering', () => {
  const forbidden = [
    'characterId',
    'signatureForCharacterId',
    'recommendedForCharacterIds',
    'selectable',
    'priority',
    'recommendationTier',
    'defaultForCharacterId',
  ];

  for (const weapon of WEAPON_CATALOG) {
    for (const field of forbidden) {
      assert.equal(
        Object.hasOwn(weapon, field),
        false,
        `${weapon.id} raw weapon leaked relationship/product field ${field}`,
      );
    }
    assert.equal(weapon.integrationStatus, 'DATA_ONLY');
  }
});

test('Glint of Clouds is a released 3.6 core-stat record independent of Qingxiao', () => {
  const weapon = getWeaponGameData('glint-of-clouds');
  assert.ok(weapon);
  assert.equal(weapon.releaseStatus, 'RELEASED');
  assert.equal(weapon.verificationStatus, 'VERIFIED');
  assert.equal(weapon.weaponType, 'Sword');
  assert.equal(weapon.rarity, 5);
  assert.equal(weapon.level90BaseAtk, 500);
  assert.deepEqual(weapon.secondary, { stat: 'CRIT Rate', value: 0.36 });
  assert.deepEqual(weapon.effectIds, []);
  assert.equal(Object.hasOwn(weapon, 'characterId'), false);
});

test('Thousandfold Deliverance stays confirmed-upcoming and partially verified before phase 2', () => {
  const weapon = getWeaponGameData('thousandfold-deliverance');
  assert.ok(weapon);
  assert.equal(weapon.releaseStatus, 'CONFIRMED_UPCOMING');
  assert.equal(weapon.verificationStatus, 'PARTIALLY_VERIFIED');
  assert.equal(weapon.weaponType, 'Broadblade');
  assert.equal(weapon.rarity, 5);
  assert.equal(weapon.level90BaseAtk, 413);
  assert.deepEqual(weapon.secondary, { stat: 'HP%', value: 0.722 });
  assert.match(weapon.provenance.notes?.join(' ') ?? '', /until the weapon is live/i);
});

test('known V9.15 stale-profile corrections survive migration', () => {
  const spectrum = getWeaponGameData('spectrum-blaster');
  const azure = getWeaponGameData('azure-oath');
  assert.ok(spectrum);
  assert.ok(azure);

  assert.equal(spectrum.level90BaseAtk, 587);
  assert.deepEqual(spectrum.secondary, { stat: 'CRIT Rate', value: 0.243 });
  assert.match(spectrum.provenance.notes?.join(' ') ?? '', /stale/i);

  assert.equal(azure.level90BaseAtk, 588);
  assert.deepEqual(azure.secondary, { stat: 'CRIT Rate', value: 0.243 });
  assert.match(azure.provenance.notes?.join(' ') ?? '', /outdated/i);
});

test('effect mechanics remain a separate migration layer', () => {
  assert.ok(WEAPON_CATALOG.every((weapon) => weapon.effectIds.length === 0));
});

test('unknown weapon lookup returns null instead of fabricating data', () => {
  assert.equal(getWeaponGameData('not-a-weapon'), null);
});
