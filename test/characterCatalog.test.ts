import assert from 'node:assert/strict';
import test from 'node:test';

import { createContentRegistry } from '../src/contentRegistry.ts';
import {
  auditReleasedCharacterRawCompleteness,
  RELEASED_CHARACTER_RAW_PENDING,
} from '../src/data/characterRawAudit.ts';
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

  assert.equal(released.length, 59);
  assert.deepEqual(upcoming.map((character) => character.id), ['suoming']);
  assert.deepEqual(wip.map((character) => character.id).sort(), []);

  for (const character of released) {
    assert.notEqual(character.element, null, `${character.id} released without element`);
    assert.notEqual(character.weaponType, null, `${character.id} released without weapon type`);
  }
});

test('released raw required fields can only be null through the explicit pending manifest', () => {
  const audit = auditReleasedCharacterRawCompleteness();
  assert.equal(audit.releasedCount, 59);
  assert.deepEqual(audit.unexpectedMissing, []);
  assert.deepEqual(audit.stalePending, []);
  assert.deepEqual(audit.unknownPendingCharacters, []);
  assert.deepEqual(
    RELEASED_CHARACTER_RAW_PENDING.map((entry) => [entry.characterId, [...entry.fields]]),
    [
      ['hsin', ['maxEnergy']],
      ['jingran', ['def', 'maxEnergy']],
      ['qingxiao', ['maxEnergy']],
      ['rover-electro', ['maxEnergy']],
      ['suisui', ['maxEnergy']],
    ],
  );
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

test('Qingxiao is current released Aero Sword data while disputed Max Energy stays unresolved', () => {
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
  assert.match(qingxiao.provenance.notes?.join(' ') ?? '', /Max Energy remains null/);
});

test('Rover Electro and Suisui core Lv90 stats are resolved while only Max Energy remains pending', () => {
  const electroRover = getCharacterGameData('rover-electro');
  const suisui = getCharacterGameData('suisui');
  assert.ok(electroRover);
  assert.ok(suisui);

  assert.deepEqual(electroRover.level90, {
    hp: 10775,
    atk: 438,
    def: 1136,
    maxEnergy: null,
  });
  assert.deepEqual(suisui.level90, {
    hp: 16713,
    atk: 288,
    def: 1100,
    maxEnergy: null,
  });
  assert.match(electroRover.provenance.notes?.join(' ') ?? '', /Max Energy remains null/);
  assert.match(suisui.provenance.notes?.join(' ') ?? '', /Max Energy remains null/);
});

test('fresh released Hsin/Jingran preserve only source-unresolved Lv90 fields, released provenance and readiness', () => {
  const reviewed = [
    { id:'hsin', element:'Electro', weaponType:'Rectifier',
      level90:{hp:10300,atk:463,def:1112,maxEnergy:null} },
    { id:'jingran', element:'Fusion', weaponType:'Broadblade',
      level90:{hp:15375,atk:313,def:null,maxEnergy:null} },
  ] as const;
  for (const {id,element,weaponType,level90} of reviewed) {
    const c = getCharacterGameData(id)!;
    assert.equal(c.releaseStatus,'RELEASED',id);
    assert.equal(c.rarity,5,id);
    assert.equal(c.element,element,id);
    assert.equal(c.weaponType,weaponType,id);
    assert.equal(c.verificationStatus,'PARTIALLY_VERIFIED',id);
    assert.equal(c.integrationStatus,'DATA_ONLY',id);
    assert.deepEqual(c.level90,level90,id);
    assert.deepEqual(c.baseCombat,{critRate:.05,critDamage:1.5,energyRegen:1},id);
    assert.equal(c.provenance.checkedAt,'2026-10-11',id);
    assert.ok(c.provenance.sourceUrls?.includes(
      id === 'hsin' ? 'https://wuwa.wiki/en/codex/resonators/1311'
        : 'https://wuwa.wiki/en/codex/resonators/1212'),id);
    assert.ok(c.provenance.notes?.some(note=>note.includes('Max Energy remains null')),id);
  }
  const suoming=getCharacterGameData('suoming')!;
  assert.equal(suoming.releaseStatus,'CONFIRMED_UPCOMING');
  assert.deepEqual(suoming.level90,{hp:null,atk:null,def:null,maxEnergy:null});
  assert.equal(suoming.verificationStatus,'PARTIALLY_VERIFIED');
  assert.equal(suoming.provenance.checkedAt,'2026-10-06');
  assert.deepEqual(suoming.baseCombat,{critRate:null,critDamage:null,energyRegen:null});
});

test('Batch 1 raw sign-off verifies four exact roster records and keeps other identities Pending', () => {
  const reviewed = [
    { id:'cartethyia', element:'Aero', weaponType:'Sword', hp:14800, atk:313, def:611,
      intrinsics:[{stat:'CRIT Rate',value:.08},{stat:'HP%',value:.12}] },
    { id:'chisa', element:'Havoc', weaponType:'Broadblade', hp:10775, atk:438, def:1136,
      intrinsics:[{stat:'CRIT Rate',value:.08},{stat:'ATK%',value:.12}] },
    { id:'ciaccona', element:'Aero', weaponType:'Pistols', hp:12238, atk:375, def:1198,
      intrinsics:[{stat:'CRIT DMG',value:.16},{stat:'ATK%',value:.12}] },
    { id:'iuno', element:'Aero', weaponType:'Gauntlets', hp:10525, atk:450, def:1124,
      intrinsics:[{stat:'CRIT Rate',value:.08},{stat:'ATK%',value:.12}] },
  ];
  const reviewedIds = new Set(reviewed.map(c => c.id));
  assert.equal(CHARACTER_CATALOG.filter(c => reviewedIds.has(c.id) && c.verificationStatus === 'VERIFIED').length, 4);
  for (const item of reviewed) {
    const c = getCharacterGameData(item.id)!;
    assert.equal(c.verificationStatus, 'VERIFIED');
    assert.equal(c.integrationStatus, 'DATA_ONLY');
    assert.equal(c.releaseStatus, 'RELEASED');
    assert.equal(c.rarity, 5);
    assert.equal(c.element, item.element);
    assert.equal(c.weaponType, item.weaponType);
    assert.deepEqual(c.level90, {hp:item.hp,atk:item.atk,def:item.def,maxEnergy:125});
    assert.deepEqual(c.baseCombat, {critRate:.05,critDamage:1.5,energyRegen:1});
    assert.deepEqual(c.intrinsicStats, item.intrinsics);
    assert.equal(c.provenance.checkedAt, '2026-10-11');
    assert.ok(c.provenance.sourceUrls?.includes('https://www.prydwen.gg/wuthering-waves/stats'));
    assert.ok(c.provenance.sourceUrls?.some(url => url.startsWith('https://wuwa.wiki/en/codex/resonators/')));
  }
  for (const id of ['denia', 'hsin', 'jingran', 'qingxiao', 'rover-electro', 'suisui']) {
    assert.equal(getCharacterGameData(id)?.verificationStatus, 'PARTIALLY_VERIFIED');
  }
});

test('Batch 2 signs off exactly four reviewed Character raw records without inventing gameplay readiness', () => {
  const reviewed = [
    { id: 'baizhi', rarity: 4, element: 'Glacio', weaponType: 'Rectifier',
      hp: 12813, atk: 213, def: 1002, maxEnergy: 175,
      intrinsicStats: [{ stat: 'HP%', value: 0.12 }, { stat: 'Healing Bonus', value: 0.12 }] },
    { id: 'sanhua', rarity: 4, element: 'Glacio', weaponType: 'Sword',
      hp: 10063, atk: 275, def: 941, maxEnergy: 100,
      intrinsicStats: [{ stat: 'Glacio DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }] },
    { id: 'verina', rarity: 5, element: 'Spectro', weaponType: 'Rectifier',
      hp: 14238, atk: 338, def: 1100, maxEnergy: 175,
      intrinsicStats: [{ stat: 'ATK%', value: 0.12 }, { stat: 'Healing Bonus', value: 0.12 }] },
    { id: 'yangyang', rarity: 4, element: 'Aero', weaponType: 'Sword',
      hp: 10200, atk: 250, def: 1100, maxEnergy: 100,
      intrinsicStats: [{ stat: 'Aero DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }] },
  ];
  const reviewedIds = new Set(reviewed.map(row => row.id));
  assert.equal(CHARACTER_CATALOG.filter(row => reviewedIds.has(row.id)).length, 4);
  for (const expected of reviewed) {
    const character = getCharacterGameData(expected.id)!;
    assert.equal(character.verificationStatus, 'VERIFIED', expected.id);
    assert.equal(character.integrationStatus, 'DATA_ONLY', expected.id);
    assert.equal(character.releaseStatus, 'RELEASED', expected.id);
    assert.equal(character.rarity, expected.rarity, expected.id);
    assert.equal(character.element, expected.element, expected.id);
    assert.equal(character.weaponType, expected.weaponType, expected.id);
    assert.deepEqual(character.level90,
      {hp:expected.hp,atk:expected.atk,def:expected.def,maxEnergy:expected.maxEnergy});
    assert.deepEqual(character.baseCombat, {critRate:0.05,critDamage:1.5,energyRegen:1});
    assert.deepEqual(character.intrinsicStats, expected.intrinsicStats, expected.id);
    assert.equal(character.provenance.checkedAt, '2026-10-11');
    assert.ok(character.provenance.sourceUrls?.includes('https://www.prydwen.gg/wuthering-waves/stats'));
    assert.ok(character.provenance.sourceUrls?.some(url => url.startsWith('https://wuwa.wiki/en/codex/resonators/')));
  }
  for (const id of ['denia','hsin','jingran','qingxiao','rover-electro','suisui']) {
    assert.equal(getCharacterGameData(id)?.verificationStatus, 'PARTIALLY_VERIFIED', id);
  }
});

test('Batch 3 signs off only four individually reviewed Character raw records with independent Minor Fortes', () => {
  const reviewed = [
    { id: 'encore', rarity: 5, element: 'Fusion', weaponType: 'Rectifier',
      hp: 10513, atk: 425, def: 1246, maxEnergy: 125,
      intrinsicStats: [{ stat: 'Fusion DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }] },
    { id: 'mortefi', rarity: 4, element: 'Fusion', weaponType: 'Pistols',
      hp: 10025, atk: 250, def: 1136, maxEnergy: 125,
      intrinsicStats: [{ stat: 'Fusion DMG', value: 0.12 }, { stat: 'ATK%', value: 0.12 }] },
    { id: 'taoqi', rarity: 4, element: 'Havoc', weaponType: 'Broadblade',
      hp: 8950, atk: 225, def: 1564, maxEnergy: 125,
      intrinsicStats: [{ stat: 'Havoc DMG', value: 0.12 }, { stat: 'DEF%', value: 0.152 }] },
    { id: 'zhezhi', rarity: 5, element: 'Glacio', weaponType: 'Rectifier',
      hp: 12250, atk: 375, def: 1198, maxEnergy: 125,
      intrinsicStats: [{ stat: 'CRIT Rate', value: 0.08 }, { stat: 'ATK%', value: 0.12 }] },
  ];
  assert.equal(new Set(reviewed.map(row => row.id)).size, reviewed.length);
  for (const expected of reviewed) {
    const character = getCharacterGameData(expected.id)!;
    assert.equal(character.verificationStatus, 'VERIFIED', expected.id);
    assert.equal(character.integrationStatus, 'DATA_ONLY', expected.id);
    assert.equal(character.releaseStatus, 'RELEASED', expected.id);
    assert.equal(character.rarity, expected.rarity, expected.id);
    assert.equal(character.element, expected.element, expected.id);
    assert.equal(character.weaponType, expected.weaponType, expected.id);
    assert.deepEqual(character.level90,
      { hp: expected.hp, atk: expected.atk, def: expected.def, maxEnergy: expected.maxEnergy });
    assert.deepEqual(character.baseCombat, { critRate: 0.05, critDamage: 1.5, energyRegen: 1 });
    assert.deepEqual(character.intrinsicStats, expected.intrinsicStats, expected.id);
    assert.equal(character.provenance.checkedAt, '2026-10-11');
    assert.ok(character.provenance.sourceUrls?.includes('https://www.prydwen.gg/wuthering-waves/stats'));
    assert.ok(character.provenance.sourceUrls?.includes(
      `https://www.prydwen.gg/wuthering-waves/characters/${expected.id}`));
    assert.ok(character.provenance.sourceUrls?.some(url => url.includes('wuwa.wiki/')));
    assert.ok(character.provenance.notes?.some(note => note.includes('Max Energy')));
  }
  // Do not lock a global VERIFIED count: Batch 1 and Batch 2 are independent PRs.
  for (const id of ['denia', 'hsin', 'jingran', 'qingxiao', 'rover-electro', 'suisui']) {
    assert.equal(getCharacterGameData(id)?.verificationStatus, 'PARTIALLY_VERIFIED', id);
  }
  const audit = auditReleasedCharacterRawCompleteness();
  assert.deepEqual(audit.unexpectedMissing, []);
  assert.deepEqual(audit.stalePending, []);
  assert.deepEqual(audit.unknownPendingCharacters, []);
});

test('lookup misses cleanly instead of fabricating unknown characters', () => {
  assert.equal(getCharacterGameData('does-not-exist'), null);
});
