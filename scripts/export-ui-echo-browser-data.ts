import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_CATALOG } from '../src/data/sonatas.ts';
import { projectVerifiedEchoWorkspaceLoadoutProfiles } from '../src/echoWorkspaceRecommendationProjection.ts';
import {
  ECHO_STATS_EDITOR_LEVELS,
  ECHO_STATS_EDITOR_MAX_SUBSTATS,
  ECHO_STATS_EDITOR_RANK,
  getEchoStatsEditorSecondaryMainStat,
  listEchoStatsEditorMainStatOptions,
  listEchoStatsEditorSubstatOptions,
} from '../src/echoStatEditor.ts';

const defaultOutput = 'docs/ui-prototypes/assets/echoes/browser-data.json';
const check = process.argv.includes('--check');
const outputArg = process.argv.indexOf('--output');
const output = resolve(outputArg >= 0 ? process.argv[outputArg + 1] : defaultOutput);

const releasedEchoes = ECHO_CATALOG.filter((echo) => echo.releaseStatus === 'RELEASED');
const loadoutProfiles = projectVerifiedEchoWorkspaceLoadoutProfiles();
const statEditor = {
  rank: ECHO_STATS_EDITOR_RANK,
  levels: [...ECHO_STATS_EDITOR_LEVELS],
  maxSubstats: ECHO_STATS_EDITOR_MAX_SUBSTATS,
  mainStatsByCostAndLevel: Object.fromEntries(
    ([1, 3, 4] as const).map((cost) => [
      String(cost),
      Object.fromEntries(ECHO_STATS_EDITOR_LEVELS.map((level) => [
        String(level),
        listEchoStatsEditorMainStatOptions(cost, level),
      ])),
    ]),
  ),
  secondaryMainStatsByCostAndLevel: Object.fromEntries(
    ([1, 3, 4] as const).map((cost) => [
      String(cost),
      Object.fromEntries(ECHO_STATS_EDITOR_LEVELS.map((level) => [
        String(level),
        getEchoStatsEditorSecondaryMainStat(cost, level),
      ])),
    ]),
  ),
  substats: listEchoStatsEditorSubstatOptions(),
};
const referencedSonataIds = new Set([
  ...releasedEchoes.flatMap((echo) => echo.sonataSetIds),
  ...loadoutProfiles.flatMap((profile) => profile.sonataSetIds),
]);

const builderIconManifest = JSON.parse(
  readFileSync(resolve('docs/ui-prototypes/assets/builder-icons/manifest.json'), 'utf8'),
) as {
  schemaVersion: number;
  sonataSets: { sonataId: string; sourceId: number; name: string; targetPath: string }[];
};
if (builderIconManifest.schemaVersion !== 1) throw new Error('Unsupported builder icon manifest schema.');
const sonataArtById = new Map(builderIconManifest.sonataSets.map((sonata) => [sonata.sonataId, sonata]));

const sonataSets = SONATA_CATALOG
  .filter((sonata) => sonata.releaseStatus === 'RELEASED' && referencedSonataIds.has(sonata.id))
  .map((sonata) => {
    const art = sonataArtById.get(sonata.id);
    if (!art || art.sourceId !== sonata.sourceId || art.name !== sonata.name) {
      throw new Error(`Canonical Sonata art identity mismatch: ${sonata.id}`);
    }
    return {
      id: sonata.id,
      name: sonata.name,
      releaseStatus: sonata.releaseStatus,
      artPath: art.targetPath,
    };
  });

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
    'src/data/echoLoadoutProfiles.ts#ECHO_LOADOUT_PROFILES',
    'docs/ui-prototypes/assets/builder-icons/manifest.json#sonataSets',
    'src/echoStatEditor.ts',
  ],
  loadoutProfiles,
  statEditor,
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
  console.log(`Canonical Echo browser data verified: ${payload.echoes.length} released Echoes / ${payload.sonataSets.length} referenced Sonata sets / ${payload.loadoutProfiles.length} verified loadout profiles / source-backed Rank-5 stat editor contract.`);
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, serialized);
  console.log(`Exported canonical Echo browser data: ${output}`);
}
