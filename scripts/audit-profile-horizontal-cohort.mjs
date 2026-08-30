import { readFile } from 'node:fs/promises';
import { buildProfileCandidateReview } from './lib/profile-candidate-review.mjs';
import { applyProfileModeContextRefresh } from './lib/profile-cohort-mode-context-refresh.mjs';
import { buildProfileHorizontalCohort } from './lib/profile-horizontal-cohort.mjs';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

async function loadJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));
}

const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
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

const refresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
const refreshManifest = await loadJson('../data/research/profile-horizontal-cohort-01-mode-context-refresh-2026-08-30.json');
const appliedRefresh = applyProfileModeContextRefresh(sourceInput, refresh);
const refreshedCandidateReview = buildProfileCandidateReview(appliedRefresh.input);
const refreshedCohort = buildProfileHorizontalCohort(refreshedCandidateReview, refreshManifest, readiness.profileSourcePendingIds);

if (JSON.stringify(appliedRefresh.summary) !== JSON.stringify({ entryCount: 20, reviewed: 10, blocked: 10, defaultSelections: 0 })) {
  throw new Error(`Cohort 01 mode/context refresh summary mismatch: ${JSON.stringify(appliedRefresh.summary)}.`);
}
const refreshedModeContext = refreshedCohort.phaseCounts.MODE_TEAM_CONTEXT;
if (
  refreshedModeContext.sourceFieldsPresent !== 10
  || refreshedModeContext.sourceFieldsMissing !== 10
  || refreshedModeContext.reviewed !== 10
  || refreshedModeContext.blocked !== 10
  || refreshedModeContext.pendingReview !== 0
) {
  throw new Error(`Cohort 01 refreshed MODE_TEAM_CONTEXT must be 10 reviewed / 10 blocked: ${JSON.stringify(refreshedModeContext)}.`);
}
if (refreshedCohort.characters.some((character) => character.modes.some((mode) => mode.phases.MODE_TEAM_CONTEXT.data.defaultCandidate !== null))) {
  throw new Error('Cohort 01 mode/context refresh must not select a universal default for any mode.');
}
if (refreshedCohort.verificationStatus !== 'NOT_VERIFIED' || refreshedCohort.canonicalWriteAllowed !== false) {
  throw new Error('Refreshed Cohort 01 must remain NOT_VERIFIED and non-canonical.');
}
if (refreshedCohort.materializationCandidates.some((candidate) => candidate.canonicalWriteAllowed !== false || candidate.verificationStatus !== 'NOT_VERIFIED')) {
  throw new Error('Refreshed Cohort 01 materialization candidates must remain fail-closed.');
}
for (const phaseName of expectedAutoPark) {
  const counts = refreshedCohort.phaseCounts[phaseName];
  if (counts.blocked !== 20 || counts.reviewed !== 0 || counts.pendingReview !== 0) {
    throw new Error(`Refreshed Cohort 01 ${phaseName} must remain mechanically parked pending its own source refresh: ${JSON.stringify(counts)}.`);
  }
}
for (const phaseName of ['EXECUTION_ADAPTERS', 'PROMOTION_FREEZE']) {
  const counts = refreshedCohort.phaseCounts[phaseName];
  if (counts.pendingReview !== 20 || counts.reviewed !== 0 || counts.blocked !== 0) {
    throw new Error(`Refreshed Cohort 01 ${phaseName} must remain pending: ${JSON.stringify(counts)}.`);
  }
}

console.log(`Horizontal profile cohort base checkpoint: ${cohort.characterCount} Characters / ${cohort.modeCount} modes`);
console.log(`Base parked blockers: ${cohort.parkedBlockerCount}`);
for (const [phase, counts] of Object.entries(cohort.phaseCounts)) {
  console.log(`BASE ${phase}: present=${counts.sourceFieldsPresent}, missing=${counts.sourceFieldsMissing}, reviewed=${counts.reviewed}, blocked=${counts.blocked}, pending=${counts.pendingReview}`);
}
console.log(`Mode/context refresh: reviewed=${appliedRefresh.summary.reviewed}, blocked=${appliedRefresh.summary.blocked}`);
console.log(`REFRESH MODE_TEAM_CONTEXT: present=${refreshedModeContext.sourceFieldsPresent}, missing=${refreshedModeContext.sourceFieldsMissing}, reviewed=${refreshedModeContext.reviewed}, blocked=${refreshedModeContext.blocked}, pending=${refreshedModeContext.pendingReview}`);
