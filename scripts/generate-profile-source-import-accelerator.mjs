import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { assertProfileReadinessAudit } from '../src/profileReadinessRegistry.ts';
import { buildProfileCandidateReview } from './lib/profile-candidate-review.mjs';
import { buildProfileSourceImportAccelerator } from './lib/profile-source-import-accelerator.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const args = {
    input: 'data/research/profile-source-roster-2026-08-29.json',
    snapshot: null,
    output: 'data/generated/profile-source-import-accelerator.json',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--input') args.input = argv[++index] ?? args.input;
    else if (arg === '--snapshot') args.snapshot = argv[++index] ?? null;
    else if (arg === '--output') args.output = argv[++index] ?? args.output;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const input = JSON.parse(await fs.readFile(path.resolve(ROOT, args.input), 'utf8'));
const candidateReview = buildProfileCandidateReview(input);
const readiness = assertProfileReadinessAudit();
const sourceSnapshot = args.snapshot
  ? JSON.parse(await fs.readFile(path.resolve(ROOT, args.snapshot), 'utf8'))
  : null;
const review = buildProfileSourceImportAccelerator({ readiness, candidateReview, sourceSnapshot });
const outputPath = path.resolve(ROOT, args.output);
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(review, null, 2)}\n`, 'utf8');

console.log(`Profile source accelerator: ${review.profileSourcePendingCount} registry-derived pending profiles.`);
console.log(`Primary dispositions: ${Object.entries(review.dispositionCounts).map(([key, value]) => `${key}=${value}`).join(', ')}`);
console.log(`Automatic source-field coverage: ${review.manualTranscription.automaticallyCoveredFieldCount}/${review.manualTranscription.possibleFieldCount}.`);
console.log(`Wrote ${path.relative(ROOT, outputPath)}`);
