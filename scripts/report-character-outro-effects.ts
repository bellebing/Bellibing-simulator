import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  auditCharacterOutroEffectsCoverage,
  renderCharacterOutroEffectsCoverageReport,
} from './lib/character-outro-effects-audit.ts';

const outputPath = resolve('docs/CHARACTER_OUTRO_EFFECT_COVERAGE.md');
const report = renderCharacterOutroEffectsCoverageReport(auditCharacterOutroEffectsCoverage());
const check = process.argv.includes('--check');

if (check) {
  const current = await readFile(outputPath, 'utf8');
  if (current !== report) {
    console.error('Character OUTRO_EFFECT coverage report is stale. Run npm run report:character-outro-effects.');
    process.exitCode = 1;
  } else {
    console.log('Character OUTRO_EFFECT coverage report is current.');
  }
} else {
  await writeFile(outputPath, report, 'utf8');
  console.log(`Wrote ${outputPath}`);
}
