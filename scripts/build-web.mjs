import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

const tsc = spawnSync('tsc', ['-p', 'tsconfig.web.json'], { stdio: 'inherit', shell: true });
if (tsc.status !== 0) process.exit(tsc.status ?? 1);

cpSync('web/index.html', 'dist/index.html');
cpSync('web/styles.css', 'dist/styles.css');
cpSync('web/echo-lab.css', 'dist/echo-lab.css');
cpSync('web/roll-assistant.html', 'dist/roll-assistant.html');
cpSync('web/roll-assistant.css', 'dist/roll-assistant.css');
cpSync('web/START_BELLIBING_TEST.bat', 'dist/START_BELLIBING_TEST.bat');
cpSync('web/serve.ps1', 'dist/serve.ps1');
