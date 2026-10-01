import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { projectImproveSettingsSources } from '../src/improveSettingsProjection.ts';
import { ECHO_STATS_EDITOR_MAX_SUBSTATS } from '../src/echoStatEditor.ts';

const directory = 'docs/ui-prototypes/assets/improve-settings';
const files = new Map([
  [directory + '/sources.json', JSON.stringify({
    schemaVersion: 1,
    generatedFrom: ['src/data/profileCatalogs.ts#PROFILE_REGISTRY', 'src/echoCoreRules.ts#SUBSTAT_TYPES'],
    maxSubstats: ECHO_STATS_EDITOR_MAX_SUBSTATS,
    rollQualityMappingStatus: 'PENDING',
    characters: projectImproveSettingsSources(),
  }, null, 2) + '\n'],
  [directory + '/state.mjs', readFileSync('src/improveSimpleSettings.mjs', 'utf8')],
]);
if (!process.argv.includes('--check')) mkdirSync(directory, { recursive: true });
for (const [path, content] of files) {
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8').replace(/\r\n/g, '\n') !== content.replace(/\r\n/g, '\n')) throw new Error('Stale Improve Settings export: ' + path);
  } else writeFileSync(path, content);
}
console.log('Improve Settings source/state export verified; roll-quality threshold mapping PENDING.');
