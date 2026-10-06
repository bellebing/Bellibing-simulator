import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { createCharacterHeroArtResolver } from '../src/characterHeroArt.ts';

const MANIFEST_PATH = 'docs/ui-prototypes/assets/characters/hero-art/manifest.json';
const RUNTIME_PATH = 'docs/ui-prototypes/assets/characters/hero-art/runtime-data.json';

test('Hero Art browser projection is resolver-derived, released-only and fail-closed', () => {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const runtime = JSON.parse(readFileSync(RUNTIME_PATH, 'utf8'));
  const resolver = createCharacterHeroArtResolver(manifest);

  assert.equal(runtime.schemaVersion, 1);
  assert.equal(runtime.role, 'character.hero-art.runtime');
  assert.deepEqual(runtime.summary, { releasedCharacters: 59, ready: 53, pending: 6 });
  assert.equal(runtime.characters.length, 59);

  const expectedIds = [...resolver.listReleasedCharacterIds()].sort();
  assert.deepEqual(runtime.characters.map((row: any) => row.characterId), expectedIds);

  for (const row of runtime.characters) {
    const status = resolver.status(row.characterId);
    assert.equal(row.status, status, row.characterId);
    if (status === 'READY') {
      const art = resolver.resolve(row.characterId);
      assert.ok(art, row.characterId);
      assert.equal(row.assetPath, art.assetPath);
      assert.deepEqual(row.presentation, art.presentation);
      assert.equal(row.presentation.safeFraming, 'CONTAIN');
      assert.equal(typeof row.presentation.scale, 'number');
      assert.equal(typeof row.presentation.offsetX, 'number');
      assert.equal(typeof row.presentation.offsetY, 'number');
      assert.ok(row.presentation.focalAnchor);
      assert.equal('reasonCode' in row, false);
    } else {
      const pending = resolver.resolvePending(row.characterId);
      assert.ok(pending, row.characterId);
      assert.equal(row.reasonCode, pending.reasonCode);
      assert.equal(row.reason, pending.reason);
      assert.equal('assetPath' in row, false);
      assert.equal('presentation' in row, false);
    }
  }

  assert.deepEqual(
    runtime.characters.filter((row: any) => row.status === 'PENDING').map((row: any) => row.characterId),
    ['hsin', 'jingran', 'rover-aero', 'rover-electro', 'rover-havoc', 'rover-spectro'],
  );
  assert.equal(runtime.characters.some((row: any) => ['suoming'].includes(row.characterId)), false);
});
