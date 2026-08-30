import { readFile } from 'node:fs/promises';
import { buildProfileCandidateReview } from './lib/profile-candidate-review.mjs';
import { applyProfileModeContextRefresh } from './lib/profile-cohort-mode-context-refresh.mjs';
import { applyProfileWeaponRefresh } from './lib/profile-cohort-weapon-refresh.mjs';
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

const modeRefresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
const modeRefreshManifest = await loadJson('../data/research/profile-horizontal-cohort-01-mode-context-refresh-2026-08-30.json');
const appliedModeRefresh = applyProfileModeContextRefresh(sourceInput, modeRefresh);
const modeRefreshedCandidateReview = buildProfileCandidateReview(appliedModeRefresh.input);
const modeRefreshedCohort = buildProfileHorizontalCohort(modeRefreshedCandidateReview, modeRefreshManifest, readiness.profileSourcePendingIds);

if (JSON.stringify(appliedModeRefresh.summary) !== JSON.stringify({ entryCount: 20, reviewed: 10, blocked: 10, defaultSelections: 0 })) {
  throw new Error(`Cohort 01 mode/context refresh summary mismatch: ${JSON.stringify(appliedModeRefresh.summary)}.`);
}
const refreshedModeContext = modeRefreshedCohort.phaseCounts.MODE_TEAM_CONTEXT;
if (
  refreshedModeContext.sourceFieldsPresent !== 10
  || refreshedModeContext.sourceFieldsMissing !== 10
  || refreshedModeContext.reviewed !== 10
  || refreshedModeContext.blocked !== 10
  || refreshedModeContext.pendingReview !== 0
) {
  throw new Error(`Cohort 01 refreshed MODE_TEAM_CONTEXT must be 10 reviewed / 10 blocked: ${JSON.stringify(refreshedModeContext)}.`);
}
if (modeRefreshedCohort.characters.some((character) => character.modes.some((mode) => mode.phases.MODE_TEAM_CONTEXT.data.defaultCandidate !== null))) {
  throw new Error('Cohort 01 mode/context refresh must not select a universal default for any mode.');
}
if (modeRefreshedCohort.verificationStatus !== 'NOT_VERIFIED' || modeRefreshedCohort.canonicalWriteAllowed !== false) {
  throw new Error('Mode-refreshed Cohort 01 must remain NOT_VERIFIED and non-canonical.');
}
if (modeRefreshedCohort.materializationCandidates.some((candidate) => candidate.canonicalWriteAllowed !== false || candidate.verificationStatus !== 'NOT_VERIFIED')) {
  throw new Error('Mode-refreshed Cohort 01 materialization candidates must remain fail-closed.');
}
for (const phaseName of expectedAutoPark) {
  const counts = modeRefreshedCohort.phaseCounts[phaseName];
  if (counts.blocked !== 20 || counts.reviewed !== 0 || counts.pendingReview !== 0) {
    throw new Error(`Mode-refreshed Cohort 01 ${phaseName} must remain mechanically parked pending its own source refresh: ${JSON.stringify(counts)}.`);
  }
}
for (const phaseName of ['EXECUTION_ADAPTERS', 'PROMOTION_FREEZE']) {
  const counts = modeRefreshedCohort.phaseCounts[phaseName];
  if (counts.pendingReview !== 20 || counts.reviewed !== 0 || counts.blocked !== 0) {
    throw new Error(`Mode-refreshed Cohort 01 ${phaseName} must remain pending: ${JSON.stringify(counts)}.`);
  }
}

const weaponRefresh = await loadJson('../data/research/profile-cohort-01-weapon-refresh-2026-08-30.json');
const weaponRefreshManifest = await loadJson('../data/research/profile-horizontal-cohort-01-weapon-refresh-2026-08-30.json');
const appliedWeaponRefresh = applyProfileWeaponRefresh(appliedModeRefresh.input, weaponRefresh);
const weaponRefreshedCandidateReview = buildProfileCandidateReview(appliedWeaponRefresh.input);
const weaponRefreshedCohort = buildProfileHorizontalCohort(weaponRefreshedCandidateReview, weaponRefreshManifest, readiness.profileSourcePendingIds);

if (JSON.stringify(appliedWeaponRefresh.summary) !== JSON.stringify({ entryCount: 20, reviewed: 18, blocked: 2, stagedWeapons: 18 })) {
  throw new Error(`Cohort 01 weapon refresh summary mismatch: ${JSON.stringify(appliedWeaponRefresh.summary)}.`);
}
const weaponModeContext = weaponRefreshedCohort.phaseCounts.MODE_TEAM_CONTEXT;
if (JSON.stringify(weaponModeContext) !== JSON.stringify(refreshedModeContext)) {
  throw new Error(`WEAPON refresh changed MODE_TEAM_CONTEXT state: ${JSON.stringify(weaponModeContext)}.`);
}
const refreshedWeapon = weaponRefreshedCohort.phaseCounts.WEAPON;
if (
  refreshedWeapon.sourceFieldsPresent !== 18
  || refreshedWeapon.sourceFieldsMissing !== 2
  || refreshedWeapon.reviewed !== 18
  || refreshedWeapon.blocked !== 2
  || refreshedWeapon.pendingReview !== 0
) {
  throw new Error(`Cohort 01 refreshed WEAPON must be 18 reviewed / 2 blocked: ${JSON.stringify(refreshedWeapon)}.`);
}
if (weaponRefreshedCohort.verificationStatus !== 'NOT_VERIFIED' || weaponRefreshedCohort.canonicalWriteAllowed !== false) {
  throw new Error('Weapon-refreshed Cohort 01 must remain NOT_VERIFIED and non-canonical.');
}
if (weaponRefreshedCohort.materializationCandidates.some((candidate) => candidate.canonicalWriteAllowed !== false || candidate.verificationStatus !== 'NOT_VERIFIED')) {
  throw new Error('Weapon-refreshed Cohort 01 materialization candidates must remain fail-closed.');
}
if (weaponRefreshedCohort.characters.some((character) => character.modes.some((mode) => mode.phases.MODE_TEAM_CONTEXT.data.defaultCandidate !== null))) {
  throw new Error('WEAPON refresh must not introduce a mode/default selection.');
}
for (const phaseName of ['ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION']) {
  const counts = weaponRefreshedCohort.phaseCounts[phaseName];
  if (counts.blocked !== 20 || counts.reviewed !== 0 || counts.pendingReview !== 0) {
    throw new Error(`Weapon-refreshed Cohort 01 ${phaseName} must remain mechanically parked: ${JSON.stringify(counts)}.`);
  }
}
for (const phaseName of ['EXECUTION_ADAPTERS', 'PROMOTION_FREEZE']) {
  const counts = weaponRefreshedCohort.phaseCounts[phaseName];
  if (counts.pendingReview !== 20 || counts.reviewed !== 0 || counts.blocked !== 0) {
    throw new Error(`Weapon-refreshed Cohort 01 ${phaseName} must remain pending: ${JSON.stringify(counts)}.`);
  }
}

console.log(`Horizontal profile cohort base checkpoint: ${cohort.characterCount} Characters / ${cohort.modeCount} modes`);
console.log(`Base parked blockers: ${cohort.parkedBlockerCount}`);
for (const [phase, counts] of Object.entries(cohort.phaseCounts)) {
  console.log(`BASE ${phase}: present=${counts.sourceFieldsPresent}, missing=${counts.sourceFieldsMissing}, reviewed=${counts.reviewed}, blocked=${counts.blocked}, pending=${counts.pendingReview}`);
}
console.log(`Mode/context refresh: reviewed=${appliedModeRefresh.summary.reviewed}, blocked=${appliedModeRefresh.summary.blocked}`);
console.log(`REFRESH MODE_TEAM_CONTEXT: present=${refreshedModeContext.sourceFieldsPresent}, missing=${refreshedModeContext.sourceFieldsMissing}, reviewed=${refreshedModeContext.reviewed}, blocked=${refreshedModeContext.blocked}, pending=${refreshedModeContext.pendingReview}`);
console.log(`Weapon refresh: reviewed=${appliedWeaponRefresh.summary.reviewed}, blocked=${appliedWeaponRefresh.summary.blocked}`);
console.log(`REFRESH WEAPON: present=${refreshedWeapon.sourceFieldsPresent}, missing=${refreshedWeapon.sourceFieldsMissing}, reviewed=${refreshedWeapon.reviewed}, blocked=${refreshedWeapon.blocked}, pending=${refreshedWeapon.pendingReview}`);
