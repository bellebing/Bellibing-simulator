import { compilePublicBrowserModules } from './public-web-boundary.mjs';
import { verifyPublicArtifact } from './verify-public-artifact.mjs';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
mkdirSync('dist/ui-preview', { recursive: true });

const weaponBrowserDataCheck = spawnSync(process.execPath, [
  '--experimental-strip-types', 'scripts/export-ui-weapon-browser-data.ts', '--check',
], { stdio: 'inherit' });
if (weaponBrowserDataCheck.status !== 0) process.exit(weaponBrowserDataCheck.status ?? 1);

const echoBrowserDataCheck = spawnSync(process.execPath, [
  '--experimental-strip-types', 'scripts/export-ui-echo-browser-data.ts', '--check',
], { stdio: 'inherit' });
if (echoBrowserDataCheck.status !== 0) process.exit(echoBrowserDataCheck.status ?? 1);

const characterBuilderSequenceDataCheck = spawnSync(process.execPath, [
  '--experimental-strip-types', 'scripts/export-ui-character-builder-runtime.ts', '--check',
], { stdio: 'inherit' });
if (characterBuilderSequenceDataCheck.status !== 0) process.exit(characterBuilderSequenceDataCheck.status ?? 1);

const characterBuilderSkillsDataCheck = spawnSync(process.execPath, [
  '--experimental-strip-types', 'scripts/export-ui-skills-runtime.ts', '--check',
], { stdio: 'inherit' });
if (characterBuilderSkillsDataCheck.status !== 0) process.exit(characterBuilderSkillsDataCheck.status ?? 1);

const buildStatsRuntimeCheck = spawnSync(process.execPath, [
  '--experimental-strip-types', 'scripts/export-ui-build-stats-runtime.ts', '--check',
], { stdio: 'inherit' });
if (buildStatsRuntimeCheck.status !== 0) process.exit(buildStatsRuntimeCheck.status ?? 1);

const characterHeroArtRuntimeCheck = spawnSync(process.execPath, [
  '--experimental-strip-types', 'scripts/export-ui-character-hero-art-runtime.ts', '--check',
], { stdio: 'inherit' });
if (characterHeroArtRuntimeCheck.status !== 0) process.exit(characterHeroArtRuntimeCheck.status ?? 1);

const improveSettingsCheck = spawnSync(process.execPath, [
  '--experimental-strip-types', 'scripts/export-ui-improve-settings.ts', '--check',
], { stdio: 'inherit' });
if (improveSettingsCheck.status !== 0) process.exit(improveSettingsCheck.status ?? 1);

const resourceIconsCheck = spawnSync(process.execPath, ['scripts/audit-ui-resource-icons.mjs'], { stdio: 'inherit' });
if (resourceIconsCheck.status !== 0) process.exit(resourceIconsCheck.status ?? 1);

const tsc = spawnSync('tsc', ['-p', 'tsconfig.web.json'], { stdio: 'inherit', shell: true });
if (tsc.status !== 0) process.exit(tsc.status ?? 1);
compilePublicBrowserModules('dist/assets');

const characterExport = spawnSync(process.execPath, [
  '--experimental-strip-types', 'scripts/export-character-database.ts',
  '--output', 'dist/data/character-database.json',
], { stdio: 'inherit' });
if (characterExport.status !== 0) process.exit(characterExport.status ?? 1);

cpSync('web/index.html', 'dist/index.html');
cpSync('web/alpha-entry.css', 'dist/alpha-entry.css');
cpSync('web/echo-lab.html', 'dist/echo-lab.html');
cpSync('web/styles.css', 'dist/styles.css');
cpSync('web/echo-lab.css', 'dist/echo-lab.css');
cpSync('web/roll-assistant.html', 'dist/roll-assistant.html');
cpSync('web/roll-assistant.css', 'dist/roll-assistant.css');
cpSync('web/START_BELLIBING_TEST.bat', 'dist/START_BELLIBING_TEST.bat');
cpSync('web/serve.ps1', 'dist/serve.ps1');
cpSync('web/START_UI_PREVIEW.bat', 'dist/START_UI_PREVIEW.bat');
const revision = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
if (revision.status !== 0) throw new Error('Cannot identify the review build revision');
const changes = spawnSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' });
if (changes.status !== 0) throw new Error('Cannot identify review build working tree');
writeFileSync('dist/review-build.json', JSON.stringify({ headSha: revision.stdout.trim(), workingTreeDirty: !!changes.stdout.trim(), entrypoint: '/ui-preview/' }, null, 2)+'\n');
writeFileSync('dist/REVIEW_UI_PREVIEW.txt', 'Extract the whole artifact, then run START_UI_PREVIEW.bat.\nThe server opens /ui-preview/ with all built runtime modules and assets.\nReview Home > Improve (empty) > Home > Build > Augusta > Add to Account > Home > Improve > Augusta.\nUse a fresh Chrome profile for an empty account. review-build.json identifies the source head.\nFor macOS/Linux: python3 -m http.server 8765 --bind 127.0.0.1, then open http://127.0.0.1:8765/ui-preview/.\nThe optional ?improve-layout-preview=1 is supplemental layout evidence only.\n');
cpSync('docs/ui-prototypes/v34-functional.html', 'dist/ui-preview/index.html');
cpSync('docs/ui-prototypes/assets/v34', 'dist/ui-preview/assets/v34', { recursive: true });
cpSync('docs/ui-prototypes/assets/characters', 'dist/ui-preview/assets/characters', { recursive: true });
cpSync('docs/ui-prototypes/assets/echoes', 'dist/ui-preview/assets/echoes', { recursive: true });
cpSync('docs/ui-prototypes/assets/weapons', 'dist/ui-preview/assets/weapons', { recursive: true });
cpSync('docs/ui-prototypes/assets/resource-icons', 'dist/ui-preview/assets/resource-icons', { recursive: true });
cpSync('docs/ui-prototypes/assets/builder-icons', 'dist/ui-preview/assets/builder-icons', { recursive: true });
cpSync('docs/ui-prototypes/assets/sequence-runtime.json', 'dist/ui-preview/assets/sequence-runtime.json');
cpSync('docs/ui-prototypes/assets/build-stats', 'dist/ui-preview/assets/build-stats', { recursive: true });
cpSync('docs/ui-prototypes/assets/skills-runtime.json', 'dist/ui-preview/assets/skills-runtime.json');

cpSync('docs/ui-prototypes/assets/forte-ui.mjs', 'dist/ui-preview/assets/forte-ui.mjs');
for (const asset of ['character-build-card.js', 'character-build-card.css', 'echo-simulator.js', 'echo-simulator.css']) cpSync('docs/ui-prototypes/assets/' + asset, 'dist/ui-preview/assets/' + asset);
for (const asset of ['improve-settings.js', 'improve-settings.css', 'character-target-presentation.js', 'echo-policy-presentation.mjs', 'resource-scrubber.mjs', 'improve-settings']) cpSync('docs/ui-prototypes/assets/' + asset, 'dist/ui-preview/assets/' + asset, { recursive: true });

verifyPublicArtifact();
