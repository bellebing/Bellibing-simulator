import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

const tsc = spawnSync('tsc', ['-p', 'tsconfig.web.json'], { stdio: 'inherit', shell: true });
if (tsc.status !== 0) process.exit(tsc.status ?? 1);

cpSync('web/index.html', 'dist/index.html');
cpSync('web/styles.css', 'dist/styles.css');
