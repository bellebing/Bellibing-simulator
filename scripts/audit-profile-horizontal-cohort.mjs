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

const blockedSourcePhases = [
  'MODE_TEAM_CONTEXT',
  'WEAPON',
  'ECHO_SONATA',
  'STATS_ER',
  'SOURCE_ROTATION',
];
for (const phaseName of blockedSourcePhases) {
  const counts = cohort.phaseCounts[phaseName];
  if (counts.pendingReview !== 0 || counts.reviewed !== 0 || counts.blocked !== cohort.modeCount || counts.sourceFieldsMissing !== cohort.modeCount) {
    throw new Error(`Cohort 01 ${phaseName} must park missing checkpoint data without false review approval: ${JSON.stringify(counts)}.`);
  }
}

const expectedAutoPark = ['WEAPON', 'ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION'];
if (JSON.stringify(cohort.autoParkMissingSourcePhases) !== JSON.stringify(expectedAutoPark)) {
  throw new Error(`Cohort 01 autoParkMissingSourcePhases mismatch: ${JSON.stringify(cohort.autoParkMissingSourcePhases)}.`);
}
for (const phaseName of ['EXECUTION_ADAPTERS', 'PROMOTION_FREEZE']) {
  const counts = cohort.phaseCounts[phaseName];
  if (counts.pendingReview !== cohort.modeCount || counts.reviewed !== 0 || counts.blocked !== 0) {
    throw new Error(`Cohort 01 ${phaseName} must remain pending until source-profile blockers are resolved: ${JSON.stringify(counts)}.`);
  }
}
if (cohort.characters.some((character) => character.modes.some((mode) => mode.phases.MODE_TEAM_CONTEXT.data.defaultCandidate !== null))) {
  throw new Error('Cohort 01 has no source-backed default decision yet; defaultCandidate must remain null for every staged mode.');
}
if (cohort.characters.some((character) => character.modes.some((mode) => mode.phases.STATS_ER.data.erBand !== null || mode.phases.STATS_ER.data.numericErInvented !== false))) {
  throw new Error('Cohort 01 STATS_ER must not infer a numeric ER target from absent checkpoint data.');
}
if (cohort.characters.some((character) => character.modes.some((mode) => mode.phases.SOURCE_ROTATION.data !== null))) {
  throw new Error('Cohort 01 SOURCE_ROTATION must stay null when the checkpoint contains no source sequence.');
}

console.log(`Horizontal profile cohort: ${cohort.characterCount} Characters / ${cohort.modeCount} modes`);
console.log(`Parked blockers: ${cohort.parkedBlockerCount}`);
for (const [phase, counts] of Object.entries(cohort.phaseCounts)) {
  console.log(`${phase}: present=${counts.sourceFieldsPresent}, missing=${counts.sourceFieldsMissing}, reviewed=${counts.reviewed}, blocked=${counts.blocked}, pending=${counts.pendingReview}`);
}
