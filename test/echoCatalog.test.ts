import assert from 'node:assert/strict';
import test from 'node:test';

import { ECHO_CATALOG_META } from '../src/data/echoCatalogMeta.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_CATALOG } from '../src/data/sonatas.ts';

test('3.6 Echo snapshot has stable unique identities and expected catalog size', () => {
  assert.equal(ECHO_CATALOG.length, 181);
  assert.equal(ECHO_CATALOG_META.echoCount, ECHO_CATALOG.length);
  assert.match(ECHO_CATALOG_META.sourceCommit, /^[0-9a-f]{40}$/);
  assert.equal(ECHO_CATALOG_META.freshnessGate, 'Calamity Effigy');

  assert.equal(new Set(ECHO_CATALOG.map((echo) => echo.id)).size, ECHO_CATALOG.length);
  assert.equal(new Set(ECHO_CATALOG.map((echo) => echo.sourceId)).size, ECHO_CATALOG.length);
});

test('Echo identity layer contains only supported COST classes and conservative threat classes', () => {
  for (const echo of ECHO_CATALOG) {
    assert.ok(echo.cost === 1 || echo.cost === 3 || echo.cost === 4, `${echo.name}: invalid COST`);
    if (echo.cost === 1) assert.equal(echo.threatClass, 'COMMON', echo.name);
    if (echo.cost === 3) assert.equal(echo.threatClass, 'ELITE', echo.name);
    if (echo.cost === 4) assert.equal(echo.threatClass, null, `${echo.name}: COST 4 class must not be guessed`);
  }
});

test('raw Echo records never contain build recommendations or modeled skill payloads', () => {
  const forbidden = [
    'recommendedFor',
    'defaultCharacter',
    'recommendedMainStat',
    'mainStat',
    'substats',
    'buildSlot',
    'skill',
    'skillDescription',
  ];

  for (const echo of ECHO_CATALOG) {
    for (const key of forbidden) {
      assert.equal(Object.hasOwn(echo, key), false, `${echo.name}: raw Echo leaked ${key}`);
    }
  }
});

test('all Echo Sonata references resolve to independent Sonata records', () => {
  assert.equal(SONATA_CATALOG.length, 34);
  assert.equal(ECHO_CATALOG_META.sonataCount, SONATA_CATALOG.length);
  assert.equal(new Set(SONATA_CATALOG.map((set) => set.id)).size, SONATA_CATALOG.length);
  assert.equal(new Set(SONATA_CATALOG.map((set) => set.sourceId)).size, SONATA_CATALOG.length);

  const setIds = new Set(SONATA_CATALOG.map((set) => set.id));
  for (const echo of ECHO_CATALOG) {
    assert.ok(echo.sonataSetIds.length > 0, `${echo.name}: no Sonata membership`);
    for (const setId of echo.sonataSetIds) {
      assert.ok(setIds.has(setId), `${echo.name}: missing ${setId}`);
    }
  }
});

test('Sonata model supports both classic 2/5-piece and newer 3-piece activation shapes', () => {
  assert.ok(SONATA_CATALOG.some((set) => set.activationPieces.join(',') === '2,5'));
  assert.ok(SONATA_CATALOG.some((set) => set.activationPieces.join(',') === '3'));

  for (const set of SONATA_CATALOG) {
    assert.ok(set.activationPieces.length > 0, `${set.name}: no activation threshold`);
    assert.deepEqual(
      [...set.activationPieces].sort((a, b) => a - b),
      [...new Set(set.activationPieces)].sort((a, b) => a - b),
      `${set.name}: duplicate activation threshold`,
    );
    assert.equal(set.effectModelId, undefined, `${set.name}: raw text must not masquerade as modeled mechanics`);
  }
});

test('Version 3.6 Calamity Effigy is present with its current raw Sonata memberships', () => {
  const calamity = ECHO_CATALOG.find((echo) => echo.name === 'Calamity Effigy');
  assert.ok(calamity);
  assert.equal(calamity.sourceId, 60002215);
  assert.equal(calamity.cost, 4);
  assert.equal(calamity.releaseStatus, 'RELEASED');
  assert.equal(calamity.threatClass, null);
  assert.deepEqual(calamity.sonataSetIds, ['sonata-34', 'sonata-35']);

  const heart = SONATA_CATALOG.find((set) => set.id === 'sonata-34');
  const lamp = SONATA_CATALOG.find((set) => set.id === 'sonata-35');
  assert.equal(heart?.name, "Heart of Evil's Purge");
  assert.equal(lamp?.name, 'Lamp of Nether Road');
});
