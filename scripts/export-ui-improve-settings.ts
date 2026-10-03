import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { projectImproveSettingsSources } from '../src/improveSettingsProjection.ts';
import { projectReleasedImprovePolicies } from '../src/improvePolicySources.ts';
import { ECHO_STATS_EDITOR_MAX_SUBSTATS } from '../src/echoStatEditor.ts';

const directory = 'docs/ui-prototypes/assets/improve-settings';
const browserDirectory = 'docs/assets';
const browserModules = ['echoCoreRules.js', 'improvePolicyState.js', 'improvePolicyPresentation.js'] as const;
const check = process.argv.includes('--check');
let compiledDirectory = 'dist/assets';
let temporaryDirectory: string | null = null;

if (!browserModules.every((name) => existsSync(join(compiledDirectory, name)))) {
  temporaryDirectory = mkdtempSync(join(tmpdir(), 'bellibing-improve-settings-'));
  compiledDirectory = join(temporaryDirectory, 'assets');
  const compile = spawnSync('tsc', ['-p', 'tsconfig.web.json', '--outDir', compiledDirectory], {
    stdio: 'inherit',
    shell: true,
  });
  if (compile.status !== 0) {
    rmSync(temporaryDirectory, { recursive: true, force: true });
    process.exit(compile.status ?? 1);
  }
}

try {
  const files = new Map<string, string>([
    [directory + '/policies.json', JSON.stringify({ schemaVersion: 1, characters: await projectReleasedImprovePolicies() }, null, 2) + '\n'],
    [directory + '/sources.json', JSON.stringify({
      schemaVersion: 1,
      generatedFrom: ['src/data/profileCatalogs.ts#PROFILE_REGISTRY', 'src/echoCoreRules.ts#SUBSTAT_TYPES'],
      maxSubstats: ECHO_STATS_EDITOR_MAX_SUBSTATS,
      rollQualityMappingStatus: 'PENDING',
      characters: projectImproveSettingsSources(),
    }, null, 2) + '\n'],
    [directory + '/state.mjs', readFileSync('src/improveSimpleSettings.mjs', 'utf8')],
    ...browserModules.map((name) => [join(browserDirectory, name), readFileSync(join(compiledDirectory, name), 'utf8')] as const),
  ]);

  if (!check) {
    mkdirSync(directory, { recursive: true });
    mkdirSync(browserDirectory, { recursive: true });
  }

  for (const [path, generated] of files) {
    if (check) {
      if (!existsSync(path) || readFileSync(path, 'utf8').replace(/\r\n/g, '\n') !== generated.replace(/\r\n/g, '\n')) {
        throw new Error('Stale Improve Settings export: ' + path);
      }
    } else {
      writeFileSync(path, generated);
    }
  }
} finally {
  if (temporaryDirectory) rmSync(temporaryDirectory, { recursive: true, force: true });
}

console.log('Improve Settings source/state/browser export verified; roll-quality threshold mapping PENDING.');
