import assert from 'node:assert/strict';
import test from 'node:test';

import { createContentRegistry } from '../src/contentRegistry.ts';
import {
  CHARACTER_BY_ID,
  CHARACTER_CATALOG,
  getCharacterGameData,
} from '../src/data/characters.ts';

test('character catalog contains the complete 60-profile roster with stable unique IDs', () => {
  assert.equal(CHARACTER_CATALOG.length, 60);
  assert.equal(CHARACTER_BY_ID.size, 60);
  assert.equal(new Set(CHARACTER_CATALOG.map((character) => character.id)).size, 60);

  const registry = createContentRegistry(CHARACTER_CATALOG);
  assert.equal(registry.characters.size, 60);
  assert.equal(registry.weapons.size, 0);
  assert.equal(registry.echoSets.size, 0);
});

test('current release classification is explicit instead of inheriting stale sheet labels', () => {
  const released = CHARACTER_CATALOG.filter((character) => character.releaseStatus === 'RELEASED');
  const upcoming = CHARACTER_CATALOG.filter((character) => character.releaseStatus === 'CONFIRMED_UPCOMING');
  const wip = CHARACTER_CATALOG.filter((character) => character.releaseStatus === 'UNRELEASED_WIP');

  assert.equal(released.length, 57);
  assert.deepEqual(upcoming.map((character) => character.id), ['jingran']);
  assert.deepEqual(wip.map((character) => character.id).sort(), ['hsin', 'suoming']);

  for (const character of released) {
    assert.notEqual(character.element, null, `${character.id} released without element`);
    assert.notEqual(character.weaponType, null, `${character.id} released without weapon type`);
  }
});

test('raw character data never embeds product defaults or recommendation relationships', () => {
  const forbidden = [
    'defaultWeaponId',
    'signatureWeaponId',
    'recommendedWeaponId',
    'recommendedEchoProfileId',
    'defaultTeamProfileId',
    'defaultRotationProfileId',
    'sequenceBaseline',
    'skillLevel',
  ];

  for (const character of CHARACTER_CATALOG) {
    for (const field of forbidden) {
      assert.equal(
        Object.hasOwn(character, field),
        false,
        `${character.id} raw data leaked relationship/default field ${field}`,
      );
    }
    assert.equal(character.integrationStatus, 'DATA_ONLY');
  }
});

test('Augusta remains the verified golden raw-data reference', () => {
  const augusta = getCharacterGameData('augusta');
  assert.ok(augusta);
  assert.equal(augusta.verificationStatus, 'VERIFIED');
  assert.equal(augusta.element, 'Electro');
  assert.equal(augusta.weaponType, 'Broadblade');
  assert.deepEqual(augusta.level90, {
    hp: 10300,
    atk: 463,
    def: 1112,
    maxEnergy: 125,
  });
  assert.deepEqual(augusta.intrinsicStats, [
    { stat: 'CRIT Rate', value: 0.08 },
    { stat: 'ATK%', value: 0.12 },
  ]);
});

test('Qingxiao is current released Aero Sword data while disputed energy stays unresolved', () => {
  const qingxiao = getCharacterGameData('qingxiao');
  assert.ok(qingxiao);
  assert.equal(qingxiao.releaseStatus, 'RELEASED');
  assert.equal(qingxiao.element, 'Aero');
  assert.equal(qingxiao.weaponType, 'Sword');
  assert.deepEqual(qingxiao.level90, {
    hp: 10300,
    atk: 462,
    def: 1112,
    maxEnergy: null,
  });
  assert.equal(qingxiao.verificationStatus, 'PARTIALLY_VERIFIED');
  assert.match(qingxiao.provenance.notes?.join(' ') ?? '', /Energy field is intentionally null/);
});

test('known source conflicts remain visible instead of silently choosing a number', () => {
  const electroRover = getCharacterGameData('rover-electro');
  const suisui = getCharacterGameData('suisui');
  assert.ok(electroRover);
  assert.ok(suisui);

  assert.deepEqual(electroRover.level90, {
    hp: 10775,
    atk: null,
    def: null,
    maxEnergy: null,
  });
  assert.deepEqual(suisui.level90, {
    hp: null,
    atk: null,
    def: null,
    maxEnergy: null,
  });
  assert.match(electroRover.provenance.notes?.join(' ') ?? '', /disagree/i);
  assert.match(suisui.provenance.notes?.join(' ') ?? '', /disagree/i);
});

test('future identities do not invent data and confirmed Jingran stays separate from WIP', () => {
  const jingran = getCharacterGameData('jingran');
  const hsin = getCharacterGameData('hsin');
  const suoming = getCharacterGameData('suoming');
  assert.ok(jingran);
  assert.ok(hsin);
  assert.ok(suoming);

  assert.equal(jingran.releaseStatus, 'CONFIRMED_UPCOMING');
  assert.equal(jingran.element, 'Fusion');
  assert.equal(jingran.weaponType, 'Broadblade');
  assert.deepEqual(jingran.level90, { hp: null, atk: null, def: null, maxEnergy: null });

  for (const future of [hsin, suoming]) {
    assert.equal(future.releaseStatus, 'UNRELEASED_WIP');
    assert.equal(future.verificationStatus, 'PENDING');
    assert.equal(future.element, null);
    assert.equal(future.weaponType, null);
    assert.deepEqual(future.level90, { hp: null, atk: null, def: null, maxEnergy: null });
  }
});

test('lookup misses cleanly instead of fabricating unknown characters', () => {
  assert.equal(getCharacterGameData('does-not-exist'), null);
});
