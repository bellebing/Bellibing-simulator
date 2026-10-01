import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { createCharacterHeroArtResolver } from '../src/characterHeroArt.ts';

const manifestPath = resolve('docs/ui-prototypes/assets/characters/hero-art/manifest.json');
const defaultOutput = 'docs/ui-prototypes/assets/characters/hero-art/runtime-data.json';
const check = process.argv.includes('--check');
const outputArg = process.argv.indexOf('--output');
const output = resolve(outputArg >= 0 ? process.argv[outputArg + 1] : defaultOutput);

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const resolver = createCharacterHeroArtResolver(manifest);
const characters = [...resolver.listReleasedCharacterIds()].sort().map((characterId) => {
  const status = resolver.status(characterId);
  if (status === 'READY') {
    const art = resolver.resolve(characterId);
    if (!art) throw new Error('READY hero art failed resolver: ' + characterId);
    return {
      characterId: art.characterId,
      characterName: art.characterName,
      status,
      assetPath: art.assetPath,
      presentation: art.presentation,
    };
  }
  if (status === 'PENDING') {
    const pending = resolver.resolvePending(characterId);
    if (!pending) throw new Error('PENDING hero art failed resolver: ' + characterId);
    return {
      characterId: pending.characterId,
      characterName: pending.characterName,
      status,
      reasonCode: pending.reasonCode,
      reason: pending.reason,
    };
  }
  throw new Error('Released Character escaped hero-art resolver: ' + characterId);
});

const payload = {
  schemaVersion: 1,
  role: 'character.hero-art.runtime',
  generatedFrom: [
    'docs/ui-prototypes/assets/characters/hero-art/manifest.json',
    'src/characterHeroArt.ts#createCharacterHeroArtResolver',
  ],
  summary: {
    releasedCharacters: characters.length,
    ready: characters.filter((row) => row.status === 'READY').length,
    pending: characters.filter((row) => row.status === 'PENDING').length,
  },
  characters,
};
const serialized = JSON.stringify(payload, null, 2) + '\n';

if (check) {
  const existing = JSON.parse(readFileSync(output, 'utf8'));
  if (JSON.stringify(existing) !== JSON.stringify(payload)) {
    console.error('Character Hero Art runtime data is stale: ' + output);
    console.error('Run: node --experimental-strip-types scripts/export-ui-character-hero-art-runtime.ts');
    process.exit(1);
  }
  console.log('Character Hero Art runtime data verified: ' + payload.summary.ready + ' READY / ' + payload.summary.pending + ' PENDING.');
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, serialized);
  console.log('Exported Character Hero Art runtime data: ' + output);
}
