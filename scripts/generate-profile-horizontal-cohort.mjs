import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { buildProfileCandidateReview } from './lib/profile-candidate-review.mjs';
import { buildProfileHorizontalCohort } from './lib/profile-horizontal-cohort.mjs';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROSTER = 'data/research/profile-source-roster-2026-08-29.json';
const DEFAULT_COHORT = 'data/research/profile-horizontal-cohort-01-2026-08-29.json';
const DEFAULT_OUTPUT = 'data/generated/profile-horizontal-cohort-01.json';

function parseArgs(argv) {
  const args = { cohort: DEFAULT_COHORT, output: DEFAULT_OUTPUT };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--cohort') args.cohort = argv[++index] ?? null;
    else if (arg === '--output') args.output = argv[++index] ?? null;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.cohort || !args.output) throw new Error('cohort and output paths must be provided');
  return args;
}

const args = parseArgs(process.argv.slice(2));
const sourceInput = JSON.parse(await fs.readFile(path.resolve(ROOT, SOURCE_ROSTER), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.resolve(ROOT, args.cohort), 'utf8'));
const candidateReview = buildProfileCandidateReview(sourceInput);
const readiness = auditProfileReadiness();
const cohort = buildProfileHorizontalCohort(candidateReview, manifest, readiness.profileSourcePendingIds);

const outputPath = path.resolve(ROOT, args.output);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(cohort, null, 2)}\n`, 'utf8');

console.log(`Horizontal profile cohort: ${cohort.characterCount} Characters / ${cohort.modeCount} modes`);
console.log(`Parked blockers: ${cohort.parkedBlockerCount}`);
for (const [phase, counts] of Object.entries(cohort.phaseCounts)) {
  console.log(`${phase}: present=${counts.sourceFieldsPresent}, missing=${counts.sourceFieldsMissing}, reviewed=${counts.reviewed}, blocked=${counts.blocked}, pending=${counts.pendingReview}`);
}
console.log(`Wrote ${path.relative(ROOT, outputPath)}`);
