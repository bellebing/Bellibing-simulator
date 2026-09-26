import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createCharacterBuilderAssetResolver } from '../src/characterBuilderAssets.ts';

const manifestPath = resolve('docs/ui-prototypes/assets/builder-icons/manifest.json');
const defaultOutput = 'docs/ui-prototypes/assets/builder-icons/runtime-sequences.json';
const check = process.argv.includes('--check');
const outputArg = process.argv.indexOf('--output');
const output = resolve(outputArg >= 0 ? process.argv[outputArg + 1] : defaultOutput);

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const resolver = createCharacterBuilderAssetResolver(manifest);
const characters = [...resolver.listCharacterIds()].sort().map((characterId) => {
  const assets = resolver.resolve(characterId);
  if (!assets) throw new Error('Released Character failed builder resolver: ' + characterId);
  return {
    characterId: assets.characterId,
    characterName: assets.characterName,
    releaseStatus: assets.releaseStatus,
    chains: assets.chains.map((chain) => ({
      sequence: chain.sequence,
      sourceChainId: chain.sourceChainId,
      name: chain.name,
      assetId: chain.assetId,
      assetPath: chain.assetPath,
    })),
  };
});

const payload = {
  schemaVersion: 1,
  role: 'character-builder.runtime-sequences',
  generatedFrom: [
    'docs/ui-prototypes/assets/builder-icons/manifest.json',
    'src/characterBuilderAssets.ts#createCharacterBuilderAssetResolver',
  ],
  characters,
};
const serialized = JSON.stringify(payload, null, 2) + '\n';

if (check) {
  const existing = JSON.parse(readFileSync(output, 'utf8'));
  if (JSON.stringify(existing) !== JSON.stringify(payload)) {
    console.error('Character builder Sequence runtime data is stale: ' + output);
    console.error('Run: node --experimental-strip-types scripts/export-ui-character-builder-runtime.ts');
    process.exit(1);
  }
  console.log('Character builder Sequence runtime data verified: ' + characters.length + ' released Characters / ' + (characters.length * 6) + ' Sequence bindings.');
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, serialized);
  console.log('Exported Character builder Sequence runtime data: ' + output);
}
