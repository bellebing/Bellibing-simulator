import { projectCharacterTargetPresentations } from '../../../src/characterTargetPresentation.ts';
import { readFileSync, writeFileSync } from 'node:fs';
const path = new URL('../v1.1/modules/targets.js', import.meta.url);
const output = '// Generated exclusively through the canonical modern DEFAULT Calc presenter. No cross-source fallback.\nexport const CHARACTER_TARGETS = ' + JSON.stringify(await projectCharacterTargetPresentations(), null, 2) + ';\n';
if (process.argv.includes('--check')) {
  if (readFileSync(path, 'utf8') !== output) throw Error('UI Lab targets stale');
  console.log('Canonical DEFAULT Calc target parity passed.');
} else writeFileSync(path, output);
