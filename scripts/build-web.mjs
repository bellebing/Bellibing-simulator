import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
mkdirSync('dist/ui-preview', { recursive: true });

const weaponBrowserDataCheck = spawnSync(process.execPath, [
  '--experimental-strip-types', 'scripts/export-ui-weapon-browser-data.ts', '--check',
], { stdio: 'inherit' });
if (weaponBrowserDataCheck.status !== 0) process.exit(weaponBrowserDataCheck.status ?? 1);

const characterBuilderSequenceDataCheck = spawnSync(process.execPath, [
  '--experimental-strip-types', 'scripts/export-ui-character-builder-runtime.ts', '--check',
], { stdio: 'inherit' });
if (characterBuilderSequenceDataCheck.status !== 0) process.exit(characterBuilderSequenceDataCheck.status ?? 1);

const tsc = spawnSync('tsc', ['-p', 'tsconfig.web.json'], { stdio: 'inherit', shell: true });
if (tsc.status !== 0) process.exit(tsc.status ?? 1);

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
cpSync('docs/ui-prototypes/v34-functional.html', 'dist/ui-preview/index.html');
cpSync('docs/ui-prototypes/assets/v34', 'dist/ui-preview/assets/v34', { recursive: true });
cpSync('docs/ui-prototypes/assets/characters', 'dist/ui-preview/assets/characters', { recursive: true });
cpSync('docs/ui-prototypes/assets/echoes', 'dist/ui-preview/assets/echoes', { recursive: true });
cpSync('docs/ui-prototypes/assets/weapons', 'dist/ui-preview/assets/weapons', { recursive: true });
cpSync('docs/ui-prototypes/assets/builder-icons', 'dist/ui-preview/assets/builder-icons', { recursive: true });
cpSync('docs/ui-prototypes/assets/sequence-runtime.json', 'dist/ui-preview/assets/sequence-runtime.json');
