import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  auditCharacterForteRulesCoverage,
  renderCharacterForteRulesCoverageReport,
} from '../src/data/characterForteRulesCoverageAudit.ts';

const outputPath = resolve('docs/CHARACTER_FORTE_RULES_COVERAGE.md');
const report = renderCharacterForteRulesCoverageReport(auditCharacterForteRulesCoverage());
const check = process.argv.includes('--check');

if (check) {
  const current = await readFile(outputPath, 'utf8');
  if (current !== report) {
    console.error('Character FORTE_RULES coverage report is stale. Run npm run report:character-forte-rules.');
    process.exitCode = 1;
  } else {
    console.log('Character FORTE_RULES coverage report is current.');
  }
} else {
  await writeFile(outputPath, report, 'utf8');
  console.log(`Wrote ${outputPath}`);
}
