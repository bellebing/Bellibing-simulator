import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import {
  CHARACTER_HERO_ART_MANIFEST_PATH,
  createCharacterHeroArtResolver,
  toCharacterHeroArtRuntimeAssetPath,
} from '../src/characterHeroArt.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';

const MANIFEST_REPO_PATH = 'docs/ui-prototypes/assets/characters/hero-art/manifest.json';
const PUBLISHED_ROOT = 'docs/ui-prototypes';

function loadManifest(): any {
  return JSON.parse(readFileSync(MANIFEST_REPO_PATH, 'utf8'));
}

function gitBlobSha(bytes: Buffer): string {
  return createHash('sha1')
    .update(Buffer.from(`blob ${bytes.length}\0`))
    .update(bytes)
    .digest('hex');
}

function readWebpDimensions(bytes: Buffer): { width: number; height: number } {
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');

  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = bytes.subarray(offset, offset + 4).toString('ascii');
    const size = bytes.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (type === 'VP8X') {
      assert.ok(dataOffset + 10 <= bytes.length);
      return {
        width: 1 + bytes.readUIntLE(dataOffset + 4, 3),
        height: 1 + bytes.readUIntLE(dataOffset + 7, 3),
      };
    }

    if (type === 'VP8 ') {
      assert.ok(dataOffset + 10 <= bytes.length);
      return {
        width: bytes.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: bytes.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }

    if (type === 'VP8L') {
      assert.ok(dataOffset + 5 <= bytes.length);
      assert.equal(bytes[dataOffset], 0x2f);
      const b1 = bytes[dataOffset + 1]!;
      const b2 = bytes[dataOffset + 2]!;
      const b3 = bytes[dataOffset + 3]!;
      const b4 = bytes[dataOffset + 4]!;
      return {
        width: 1 + (((b2 & 0x3f) << 8) | b1),
        height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)),
      };
    }

    offset = dataOffset + size + (size % 2);
  }

  throw new Error('WEBP dimensions not found');
}

test('hero art resolver covers every released Character as READY or explicit PENDING', () => {
  const resolver = createCharacterHeroArtResolver(loadManifest());
  const expected = CHARACTER_CATALOG
    .filter((character) => character.releaseStatus === 'RELEASED')
    .map((character) => character.id);

  assert.equal(CHARACTER_HERO_ART_MANIFEST_PATH, 'assets/characters/hero-art/manifest.json');
  assert.deepEqual(resolver.listReleasedCharacterIds(), expected);
  assert.equal(resolver.listReleasedCharacterIds().length, 57);
  assert.equal(resolver.listReadyCharacterIds().length, 53);
  assert.deepEqual(resolver.listPendingCharacterIds(), [
    'rover-aero',
    'rover-electro',
    'rover-havoc',
    'rover-spectro',
  ]);

  assert.equal(resolver.status('hsin'), 'UNAVAILABLE');
  assert.equal(resolver.status('suoming'), 'UNAVAILABLE');
  assert.equal(resolver.status('jingran'), 'UNAVAILABLE');
  assert.equal(resolver.status('does-not-exist'), 'UNAVAILABLE');
});

test('all runtime-ready hero art is byte-identical to its pinned source Git blob and not selector-portrait sized', () => {
  const resolver = createCharacterHeroArtResolver(loadManifest());

  for (const characterId of resolver.listReadyCharacterIds()) {
    const art = resolver.resolve(characterId);
    assert.ok(art, characterId);
    assert.match(art.assetPath, new RegExp(`^assets/characters/hero-art/${characterId}\\.webp$`));
    assert.ok(!art.assetPath.includes('/portraits/'), `${characterId} points at a selector portrait`);

    const path = join(PUBLISHED_ROOT, art.assetPath);
    assert.equal(existsSync(path), true, `missing published hero art ${art.assetPath}`);
    const bytes = readFileSync(path);

    assert.equal(statSync(path).size, art.sourceBytes, `${characterId} sourceBytes drift`);
    assert.equal(gitBlobSha(bytes), art.sourceBlobSha, `${characterId} source Git blob SHA drift`);

    const { width, height } = readWebpDimensions(bytes);
    assert.ok(width > 256, `${characterId} hero width is only ${width}px`);
    assert.ok(height > 256, `${characterId} hero height is only ${height}px`);
  }
});

test('Augusta and diverse silhouette samples resolve source-backed hero art with explicit presentation state', () => {
  const resolver = createCharacterHeroArtResolver(loadManifest());
  const inspected = ['augusta', 'jiyan', 'iuno', 'cartethyia', 'calcharo', 'lupa', 'zani'];

  for (const characterId of inspected) {
    const art = resolver.resolve(characterId);
    assert.ok(art, characterId);
    assert.equal(art.presentation.safeFraming, 'CONTAIN');
    assert.equal(art.presentation.reviewStatus, 'SOURCE_ART_INSPECTED_BUILD_FRAME_PENDING');
    assert.equal(art.presentation.scale, null);
    assert.equal(art.presentation.offsetX, null);
    assert.equal(art.presentation.offsetY, null);
    assert.equal(art.presentation.focalAnchor, null);
    assert.match(art.sourceAssetPath, /^public\/assets\/UIResources\/Common\/Image\/IconRolePile\/.+\.webp$/);
  }

  assert.equal(
    resolver.resolve('augusta')?.sourceBlobSha,
    '812565b9798cf7980582fc57ce6733e6bcbe7379',
  );
});

test('Rover variants fail closed until gender identity is explicit', () => {
  const resolver = createCharacterHeroArtResolver(loadManifest());
  const expected = new Map<string, Array<[string, number]>>([
    ['rover-aero', [['M', 1406], ['F', 1408]]],
    ['rover-electro', [['M', 1309], ['F', 1310]]],
    ['rover-havoc', [['M', 1605], ['F', 1604]]],
    ['rover-spectro', [['M', 1501], ['F', 1502]]],
  ]);

  for (const [characterId, candidates] of expected) {
    assert.equal(resolver.status(characterId), 'PENDING');
    assert.equal(resolver.resolve(characterId), null);
    const pending = resolver.resolvePending(characterId);
    assert.ok(pending, characterId);
    assert.equal(pending.reasonCode, 'ROVER_VARIANT_IDENTITY_UNRESOLVED');
    assert.deepEqual(
      pending.candidates.map((candidate) => [candidate.gender, candidate.sourceCharacterId]),
      candidates,
    );
    assert.deepEqual(new Set(pending.candidates.map((candidate) => candidate.gender)), new Set(['M', 'F']));
    assert.equal(pending.candidates.length, 2);
  }
});

test('manifest excludes upcoming/WIP Characters instead of guessing hero art', () => {
  const manifest = loadManifest();
  const coveredIds = new Set([
    ...manifest.characters.map((row: any) => row.characterId),
    ...manifest.pending.map((row: any) => row.characterId),
  ]);

  assert.equal(coveredIds.has('jingran'), false);
  assert.equal(coveredIds.has('hsin'), false);
  assert.equal(coveredIds.has('suoming'), false);
});

test('resolver rejects duplicate Character IDs across ready and pending coverage', () => {
  const manifest = loadManifest();
  const duplicate = structuredClone(manifest.characters[0]);
  duplicate.characterId = 'rover-aero';
  duplicate.characterName = 'Rover (Aero)';
  duplicate.targetPath = 'docs/ui-prototypes/assets/characters/hero-art/rover-aero.webp';
  manifest.characters.push(duplicate);

  assert.throws(
    () => createCharacterHeroArtResolver(manifest),
    /duplicate characterId rover-aero/,
  );
});

test('resolver rejects missing released coverage and unreleased pending leakage', () => {
  const missing = loadManifest();
  missing.characters = missing.characters.filter((row: any) => row.characterId !== 'augusta');
  assert.throws(
    () => createCharacterHeroArtResolver(missing),
    /released Character missing hero-art coverage: augusta/,
  );

  const leaked = loadManifest();
  leaked.pending[0].characterId = 'hsin';
  leaked.pending[0].characterName = 'Hsin';
  assert.throws(
    () => createCharacterHeroArtResolver(leaked),
    /non-released Character leaked into pending hero art: hsin/,
  );
});

test('resolver rejects target-path identity drift and source path escape', () => {
  const wrongTarget = loadManifest();
  wrongTarget.characters.find((row: any) => row.characterId === 'augusta').targetPath =
    'docs/ui-prototypes/assets/characters/hero-art/jiyan.webp';
  assert.throws(
    () => createCharacterHeroArtResolver(wrongTarget),
    /augusta targetPath mismatch/,
  );

  const wrongSource = loadManifest();
  wrongSource.characters.find((row: any) => row.characterId === 'augusta').sourceAssetPath =
    'public/assets/UIResources/Common/Image/IconRoleHeadCircle256/T_IconRoleHeadCircle256_51_UI.webp';
  assert.throws(
    () => createCharacterHeroArtResolver(wrongSource),
    /sourceAssetPath is not an IconRolePile WebP/,
  );
});

test('resolver rejects malformed source provenance and fake reviewed presentation metadata', () => {
  const badSha = loadManifest();
  badSha.characters.find((row: any) => row.characterId === 'augusta').sourceBlobSha = 'not-a-sha';
  assert.throws(
    () => createCharacterHeroArtResolver(badSha),
    /sourceBlobSha must be a lowercase Git blob SHA/,
  );

  const fakeReviewed = loadManifest();
  fakeReviewed.characters.find((row: any) => row.characterId === 'augusta').presentation.reviewStatus = 'REVIEWED';
  assert.throws(
    () => createCharacterHeroArtResolver(fakeReviewed),
    /REVIEWED but presentation values are incomplete/,
  );
});

test('runtime hero paths cannot escape the published hero-art root', () => {
  assert.equal(
    toCharacterHeroArtRuntimeAssetPath(
      'docs/ui-prototypes/assets/characters/hero-art/augusta.webp',
    ),
    'assets/characters/hero-art/augusta.webp',
  );
  assert.throws(
    () => toCharacterHeroArtRuntimeAssetPath(
      'docs/ui-prototypes/assets/characters/portraits/augusta.png',
    ),
    /asset path escapes hero-art root/,
  );
});
