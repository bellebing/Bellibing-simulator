import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { assertProfileReadinessAudit } from '../src/profileReadinessRegistry.ts';
import { buildProfileCandidateReview } from './lib/profile-candidate-review.mjs';
import {
  buildProfileSourceImportAccelerator,
  PROFILE_SOURCE_IMPORT_DISPOSITIONS,
} from './lib/profile-source-import-accelerator.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const args = { input: 'data/research/profile-source-roster-2026-08-29.json', snapshot: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--input') args.input = argv[++index] ?? args.input;
    else if (arg === '--snapshot') args.snapshot = argv[++index] ?? null;
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

const expectedIds = [...readiness.profileSourcePendingIds].sort();
const actualIds = review.characters.map((row) => row.characterId).sort();
if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
  throw new Error(`Accelerator backlog drift: expected ${expectedIds.join(', ')}; got ${actualIds.join(', ')}`);
}
if (review.profileSourcePendingCount !== readiness.profileSourcePendingCount) {
  throw new Error(`Accelerator count drift: ${review.profileSourcePendingCount}/${readiness.profileSourcePendingCount}`);
}
if (review.canonicalWriteAllowed !== false || review.verificationStatus !== 'NOT_VERIFIED') {
  throw new Error('Accelerator must remain fail-closed and NOT_VERIFIED.');
}
if (review.characters.some((row) => row.canonicalWriteAllowed !== false || row.verificationStatus !== 'NOT_VERIFIED')) {
  throw new Error('Every accelerator row must remain review-only / NOT_VERIFIED.');
}
const classified = Object.values(review.dispositionCounts).reduce((sum, value) => sum + value, 0);
if (classified !== review.profileSourcePendingCount) {
  throw new Error(`Primary disposition coverage mismatch: ${classified}/${review.profileSourcePendingCount}`);
}
if (sourceSnapshot) {
  const snapshotIds = sourceSnapshot.characters.map((row) => row.characterId).sort();
  if (JSON.stringify(snapshotIds) !== JSON.stringify(expectedIds)) {
    throw new Error(`Source snapshot backlog drift: expected ${expectedIds.length} exact pending IDs, got ${snapshotIds.length}.`);
  }
}

console.log(`Profile source accelerator audit: ${review.profileSourcePendingCount} current PROFILE_SOURCE_PENDING rows classified.`);
for (const disposition of PROFILE_SOURCE_IMPORT_DISPOSITIONS) {
  const ids = review.dispositionCharacterIds[disposition];
  console.log(`${disposition}=${ids.length}${ids.length ? ` :: ${ids.join(', ')}` : ''}`);
}
console.log(`Automatic source-field coverage: ${review.manualTranscription.automaticallyCoveredFieldCount}/${review.manualTranscription.possibleFieldCount}; remaining=${review.manualTranscription.remainingFieldCount}.`);
