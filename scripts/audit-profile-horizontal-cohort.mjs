import { readFile } from 'node:fs/promises';
import { buildProfileCandidateReview } from './lib/profile-candidate-review.mjs';
import { buildProfileHorizontalCohort } from './lib/profile-horizontal-cohort.mjs';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

const sourceInput = JSON.parse(await readFile(
  new URL('../data/research/profile-source-roster-2026-08-29.json', import.meta.url),
  'utf8',
));
const manifest = JSON.parse(await readFile(
  new URL('../data/research/profile-horizontal-cohort-01-2026-08-29.json', import.meta.url),
  'utf8',
));
const candidateReview = buildProfileCandidateReview(sourceInput);
const readiness = auditProfileReadiness();
const cohort = buildProfileHorizontalCohort(candidateReview, manifest, readiness.profileSourcePendingIds);

if (cohort.characterCount < 10 || cohort.characterCount > 20) {
  throw new Error(`Horizontal cohort must contain 10-20 Characters, found ${cohort.characterCount}.`);
}
if (cohort.verificationStatus !== 'NOT_VERIFIED' || cohort.canonicalWriteAllowed !== false) {
  throw new Error('Horizontal cohort must remain NOT_VERIFIED and fail-closed for canonical writes.');
}
if (cohort.characters.some((character) => !readiness.profileSourcePendingIds.includes(character.characterId))) {
  throw new Error('Horizontal cohort contains a Character that is no longer PROFILE_SOURCE_PENDING.');
}
if (cohort.materializationCandidates.some((candidate) => candidate.verificationStatus !== 'NOT_VERIFIED' || candidate.canonicalWriteAllowed !== false)) {
  throw new Error('Horizontal materialization candidates must remain NOT_VERIFIED and non-canonical.');
}

console.log(`Horizontal profile cohort: ${cohort.characterCount} Characters / ${cohort.modeCount} modes`);
console.log(`Parked blockers: ${cohort.parkedBlockerCount}`);
for (const [phase, counts] of Object.entries(cohort.phaseCounts)) {
  console.log(`${phase}: present=${counts.sourceFieldsPresent}, missing=${counts.sourceFieldsMissing}, reviewed=${counts.reviewed}, blocked=${counts.blocked}, pending=${counts.pendingReview}`);
}
