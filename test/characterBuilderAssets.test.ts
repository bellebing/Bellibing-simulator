import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import {
  CHARACTER_BUILDER_ASSET_MANIFEST_PATH,
  createCharacterBuilderAssetResolver,
  toCharacterBuilderRuntimeAssetPath,
} from '../src/characterBuilderAssets.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';

const MANIFEST_REPO_PATH = 'docs/ui-prototypes/assets/builder-icons/manifest.json';
const PUBLISHED_ROOT = 'docs/ui-prototypes';

function loadManifest(): any {
  return JSON.parse(readFileSync(MANIFEST_REPO_PATH, 'utf8'));
}

function assertPublishedAssetExists(assetPath: string): void {
  assert.equal(
    existsSync(join(PUBLISHED_ROOT, assetPath)),
    true,
    `missing published builder asset ${assetPath}`,
  );
}

test('builder asset resolver exposes all and only released Characters', () => {
  const resolver = createCharacterBuilderAssetResolver(loadManifest());
  const expected = CHARACTER_CATALOG
    .filter((character) => character.releaseStatus === 'RELEASED')
    .map((character) => character.id);

  assert.equal(CHARACTER_BUILDER_ASSET_MANIFEST_PATH, 'assets/builder-icons/manifest.json');
  assert.equal(resolver.listCharacterIds().length, 57);
  assert.deepEqual(resolver.listCharacterIds(), expected);

  assert.equal(resolver.resolve('jingran'), null);
  assert.equal(resolver.resolve('hsin'), null);
  assert.equal(resolver.resolve('suoming'), null);
  assert.equal(resolver.resolve('does-not-exist'), null);
});

test('Chisa, Aemeath, Augusta, Shorekeeper and Sanhua resolve complete source-backed builder assets', () => {
  const resolver = createCharacterBuilderAssetResolver(loadManifest());
  const ids = ['chisa', 'aemeath', 'augusta', 'the-shorekeeper', 'sanhua'];

  for (const characterId of ids) {
    const assets = resolver.resolve(characterId);
    assert.ok(assets, characterId);
    assert.equal(assets.characterId, characterId);
    assert.equal(assets.releaseStatus, 'RELEASED');
    assert.deepEqual(assets.chains.map((chain) => chain.sequence), [1, 2, 3, 4, 5, 6]);

    for (const chain of assets.chains) {
      assert.ok(chain.name.length > 0, `${characterId} S${chain.sequence} missing source-backed name`);
      assert.match(chain.assetPath, new RegExp(`^assets/builder-icons/chains/${characterId}/s${chain.sequence}\\.webp$`));
      assertPublishedAssetExists(chain.assetPath);
    }

    for (const role of ['normal-attack', 'skill', 'liberation', 'intro', 'circuit', 'outro'] as const) {
      assert.equal(assets.skills[role].role, role);
      assertPublishedAssetExists(assets.skills[role].assetPath);
    }

    for (const role of ['inherent-1', 'inherent-2'] as const) {
      const inherent = assets.skills[role];
      if (inherent) assertPublishedAssetExists(inherent.assetPath);
    }

    assertPublishedAssetExists(assets.element.assetPath);
  }

  assert.equal(
    resolver.resolve('chisa')?.chains[0]?.name,
    'Wandering Through the Desolate Corridors',
  );
  assert.equal(resolver.resolve('aemeath')?.element.element, 'Fusion');
  assert.equal(resolver.resolve('augusta')?.element.element, 'Electro');
  assert.equal(resolver.resolve('the-shorekeeper')?.characterName, 'The Shorekeeper');
  assert.equal(resolver.resolve('sanhua')?.element.element, 'Glacio');
});

test('every released runtime asset path resolves to a physical published file', () => {
  const resolver = createCharacterBuilderAssetResolver(loadManifest());

  for (const characterId of resolver.listCharacterIds()) {
    const assets = resolver.resolve(characterId);
    assert.ok(assets, characterId);

    assertPublishedAssetExists(assets.element.assetPath);
    for (const chain of assets.chains) assertPublishedAssetExists(chain.assetPath);
    for (const skill of Object.values(assets.skills)) {
      if (skill) assertPublishedAssetExists(skill.assetPath);
    }
  }
});

test('resolver rejects duplicate Character IDs', () => {
  const manifest = loadManifest();
  manifest.characters.push(structuredClone(manifest.characters[0]));
  assert.throws(
    () => createCharacterBuilderAssetResolver(manifest),
    /duplicate characterId aalto/,
  );
});

test('resolver rejects missing, extra or out-of-order S1-S6 coverage', () => {
  const missing = loadManifest();
  missing.characters.find((row: any) => row.characterId === 'chisa').chains.pop();
  assert.throws(
    () => createCharacterBuilderAssetResolver(missing),
    /chisa must declare exactly six chains/,
  );

  const wrongOrder = loadManifest();
  wrongOrder.characters.find((row: any) => row.characterId === 'chisa').chains[1].sequence = 3;
  assert.throws(
    () => createCharacterBuilderAssetResolver(wrongOrder),
    /chisa chain order mismatch/,
  );
});

test('resolver rejects skill and chain mappings whose asset records are missing', () => {
  const skillMissing = loadManifest();
  const chisa = skillMissing.characters.find((row: any) => row.characterId === 'chisa');
  const skillPath = chisa.skills.skill.targetPath;
  skillMissing.assets = skillMissing.assets.filter((asset: any) => asset.targetPath !== skillPath);
  assert.throws(
    () => createCharacterBuilderAssetResolver(skillMissing),
    /chisa skill skill points at an undeclared asset/,
  );

  const chainMissing = loadManifest();
  const chisaChain = chainMissing.characters.find((row: any) => row.characterId === 'chisa').chains[0];
  chainMissing.assets = chainMissing.assets.filter((asset: any) => asset.targetPath !== chisaChain.targetPath);
  assert.throws(
    () => createCharacterBuilderAssetResolver(chainMissing),
    /chisa S1 points at an undeclared asset/,
  );
});

test('resolver rejects chain paths that do not match the declared Character folder identity', () => {
  const manifest = loadManifest();
  const chain = manifest.characters.find((row: any) => row.characterId === 'chisa').chains[0];
  chain.targetPath = 'docs/ui-prototypes/assets/builder-icons/chains/sanhua/s1.webp';

  assert.throws(
    () => createCharacterBuilderAssetResolver(manifest),
    /chisa S1 asset folder\/path mismatch/,
  );
});

test('released-only runtime contract rejects pending Character leakage even if a row is injected', () => {
  const manifest = loadManifest();
  const leaked = structuredClone(manifest.characters[0]);
  leaked.characterId = 'hsin';
  leaked.characterName = 'Hsin';
  leaked.releaseStatus = 'UNRELEASED_WIP';
  manifest.characters.push(leaked);

  assert.throws(
    () => createCharacterBuilderAssetResolver(manifest),
    /pending Character leaked into builder manifest: hsin/,
  );
});

test('runtime paths cannot escape the published builder asset root', () => {
  assert.equal(
    toCharacterBuilderRuntimeAssetPath(
      'docs/ui-prototypes/assets/builder-icons/chains/chisa/s1.webp',
    ),
    'assets/builder-icons/chains/chisa/s1.webp',
  );
  assert.throws(
    () => toCharacterBuilderRuntimeAssetPath('docs/ui-prototypes/assets/characters/chisa.png'),
    /asset path escapes builder root/,
  );
});
