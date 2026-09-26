import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_CATALOG } from '../src/data/sonatas.ts';

const defaultOutput = 'docs/ui-prototypes/assets/echoes/browser-data.json';
const check = process.argv.includes('--check');
const outputArg = process.argv.indexOf('--output');
const output = resolve(outputArg >= 0 ? process.argv[outputArg + 1] : defaultOutput);

const releasedEchoes = ECHO_CATALOG.filter((echo) => echo.releaseStatus === 'RELEASED');
const referencedSonataIds = new Set(releasedEchoes.flatMap((echo) => echo.sonataSetIds));
const sonataSets = SONATA_CATALOG
  .filter((sonata) => sonata.releaseStatus === 'RELEASED' && referencedSonataIds.has(sonata.id))
  .map((sonata) => ({
    id: sonata.id,
    name: sonata.name,
    releaseStatus: sonata.releaseStatus,
  }));

const resolvedSonataIds = new Set(sonataSets.map((sonata) => sonata.id));
const unresolvedSonataIds = [...referencedSonataIds].filter((id) => !resolvedSonataIds.has(id));
if (unresolvedSonataIds.length) {
  throw new Error(`Released Echoes reference unresolved Sonata sets: ${unresolvedSonataIds.join(', ')}`);
}

const payload = {
  schemaVersion: 1,
  generatedFrom: [
    'src/data/echoes.ts#ECHO_CATALOG',
    'src/data/sonatas.ts#SONATA_CATALOG',
  ],
  echoes: releasedEchoes.map((echo) => ({
    id: echo.id,
    name: echo.name,
    releaseStatus: echo.releaseStatus,
    cost: echo.cost,
    sonataSetIds: [...echo.sonataSetIds],
  })),
  sonataSets,
};

const serialized = `${JSON.stringify(payload, null, 2)}\n`;

if (check) {
  const existing = JSON.parse(readFileSync(output, 'utf8'));
  if (JSON.stringify(existing) !== JSON.stringify(payload)) {
    console.error(`Canonical Echo browser data is stale: ${output}`);
    console.error('Run: node --experimental-strip-types scripts/export-ui-echo-browser-data.ts');
    process.exit(1);
  }
  console.log(`Canonical Echo browser data verified: ${payload.echoes.length} released Echoes / ${payload.sonataSets.length} referenced Sonata sets.`);
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, serialized);
  console.log(`Exported canonical Echo browser data: ${output}`);
}
