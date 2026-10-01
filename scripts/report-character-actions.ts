import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  auditCharacterActionsCoverage,
  renderCharacterActionsCoverageReport,
} from '../src/data/characterActionsCoverageAudit.ts';

const outputPath = resolve('docs/CHARACTER_ACTIONS_COVERAGE.md');
const report = renderCharacterActionsCoverageReport(auditCharacterActionsCoverage());
const check = process.argv.includes('--check');

if (check) {
  const current = await readFile(outputPath, 'utf8');
  if (current !== report) {
    console.error('Character ACTIONS coverage report is stale. Run npm run report:character-actions.');
    process.exitCode = 1;
  } else {
    console.log('Character ACTIONS coverage report is current.');
  }
} else {
  await writeFile(outputPath, report, 'utf8');
  console.log(`Wrote ${outputPath}`);
}
