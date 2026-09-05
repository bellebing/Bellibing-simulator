import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildFactoryEvidenceReportFromSnapshots,
  renderFactoryEvidenceReportJson,
  renderFactoryEvidenceReportMarkdown,
} from '../src/factory/reporting.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const EVIDENCE_DIR = join(ROOT, 'data/factory/evidence');
const JSON_OUTPUT = join(ROOT, 'data/generated/factory-evidence-report.json');
const MARKDOWN_OUTPUT = join(ROOT, 'docs/generated/FACTORY_EVIDENCE_REPORT.md');
const CHECK = process.argv.includes('--check');

function loadSnapshots(): readonly unknown[] {
  const filenames = readdirSync(EVIDENCE_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort();

  if (filenames.length === 0) throw new Error('Factory evidence report: no evidence snapshots found');

  return filenames.map((filename) => {
    const path = join(EVIDENCE_DIR, filename);
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as unknown;
    } catch (error) {
      throw new Error(`Factory evidence report: failed to parse ${filename}: ${String(error)}`);
    }
  });
}

function assertCurrent(path: string, expected: string): void {
  if (!existsSync(path)) throw new Error(`Factory evidence report: generated artifact missing: ${path}`);
  const actual = readFileSync(path, 'utf8');
  if (actual !== expected) throw new Error(`Factory evidence report: generated artifact drift: ${path}`);
}

const report = buildFactoryEvidenceReportFromSnapshots(loadSnapshots());
const json = renderFactoryEvidenceReportJson(report);
const markdown = renderFactoryEvidenceReportMarkdown(report);

if (CHECK) {
  assertCurrent(JSON_OUTPUT, json);
  assertCurrent(MARKDOWN_OUTPUT, markdown);
  console.log(`Factory evidence report current: ${report.summary.totalReconciliations} reconciliations, ${report.summary.exceptionQueue} exceptions`);
} else {
  mkdirSync(dirname(JSON_OUTPUT), { recursive: true });
  mkdirSync(dirname(MARKDOWN_OUTPUT), { recursive: true });
  writeFileSync(JSON_OUTPUT, json);
  writeFileSync(MARKDOWN_OUTPUT, markdown);
  console.log(`Factory evidence report written: ${report.summary.totalReconciliations} reconciliations, ${report.summary.exceptionQueue} exceptions`);
}
