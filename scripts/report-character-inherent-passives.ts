import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  auditCharacterInherentPassivesCoverage,
  renderCharacterInherentPassivesCoverageReport,
} from './lib/character-inherent-passives-audit.ts';

const outputPath = resolve('docs/CHARACTER_INHERENT_PASSIVES_COVERAGE.md');
const report = renderCharacterInherentPassivesCoverageReport(auditCharacterInherentPassivesCoverage());
const check = process.argv.includes('--check');

if (check) {
  const current = await readFile(outputPath, 'utf8');
  if (current !== report) {
    console.error('Character INHERENT_PASSIVES coverage report is stale. Run npm run report:character-inherent-passives.');
    console.error('--- deterministic generated report ---');
    console.error(report);
    process.exitCode = 1;
  } else {
    console.log('Character INHERENT_PASSIVES coverage report is current.');
  }
} else {
  await writeFile(outputPath, report, 'utf8');
  console.log(`Wrote ${outputPath}`);
}
