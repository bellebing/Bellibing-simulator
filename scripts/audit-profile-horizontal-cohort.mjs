import { readFile } from 'node:fs/promises';
import { buildProfileCandidateReview } from './lib/profile-candidate-review.mjs';
import { applyProfileModeContextRefresh } from './lib/profile-cohort-mode-context-refresh.mjs';
import { applyProfileWeaponRefresh } from './lib/profile-cohort-weapon-refresh.mjs';
import { applyProfileEchoSonataRefresh, buildEchoSonataCohortManifest } from './lib/profile-cohort-echo-sonata-refresh.mjs';
import { applyProfileStatsErRefresh, buildStatsErCohortManifest } from './lib/profile-cohort-stats-er-refresh.mjs';
import { buildProfileHorizontalCohort } from './lib/profile-horizontal-cohort.mjs';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

async function loadJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));
}

function exactCounts(present, missing, reviewed, blocked, pendingReview) {
  return {sourceFieldsPresent: present, sourceFieldsMissing: missing, reviewed, blocked, pendingReview};
}

function assertPhase(cohort, phaseName, expected, label) {
  const actual = cohort.phaseCounts[phaseName];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} ${phaseName} mismatch: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}.`);
  }
}

function assertSafety(cohort, readiness, label, {statsReviewed = false} = {}) {
  if (cohort.characterCount !== 15 || cohort.modeCount !== 20) {
    throw new Error(`${label} must contain the fixed 15-Character / 20-mode horizontal cohort.`);
  }
  if (cohort.verificationStatus !== 'NOT_VERIFIED' || cohort.canonicalWriteAllowed !== false) {
    throw new Error(`${label} must remain NOT_VERIFIED and fail-closed for canonical writes.`);
  }
  if (cohort.characters.some((character) => !readiness.profileSourcePendingIds.includes(character.characterId))) {
    throw new Error(`${label} contains a Character that is no longer PROFILE_SOURCE_PENDING.`);
  }
  if (cohort.materializationCandidates.some((candidate) => candidate.verificationStatus !== 'NOT_VERIFIED' || candidate.canonicalWriteAllowed !== false)) {
    throw new Error(`${label} materialization candidates must remain NOT_VERIFIED and non-canonical.`);
  }
  if (cohort.characters.some((character) => character.modes.some((mode) => mode.phases.MODE_TEAM_CONTEXT.data.defaultCandidate !== null))) {
    throw new Error(`${label} must not introduce a defaultCandidate selection.`);
  }
  if (cohort.characters.some((character) => character.modes.some((mode) => mode.phases.STATS_ER.data.numericErInvented !== false))) {
    throw new Error(`${label} must keep numericErInvented=false for every staged mode.`);
  }
  if (!statsReviewed && cohort.characters.some((character) => character.modes.some((mode) => mode.phases.STATS_ER.data.erBand !== null))) {
    throw new Error(`${label} must not stage numeric ER before the fresh STATS_ER review.`);
  }
  if (cohort.characters.some((character) => character.modes.some((mode) => mode.phases.SOURCE_ROTATION.data !== null))) {
    throw new Error(`${label} SOURCE_ROTATION must remain null before its fresh review.`);
  }
  assertPhase(cohort, 'EXECUTION_ADAPTERS', exactCounts(20, 0, 0, 0, 20), label);
  assertPhase(cohort, 'PROMOTION_FREEZE', exactCounts(0, 0, 0, 0, 20), label);
}

function buildCohort(input, manifest, readiness) {
  const candidateReview = buildProfileCandidateReview(input);
  return buildProfileHorizontalCohort(candidateReview, manifest, readiness.profileSourcePendingIds);
}

const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
const baseManifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
const modeRefresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
const modeManifest = await loadJson('../data/research/profile-horizontal-cohort-01-mode-context-refresh-2026-08-30.json');
const weaponRefresh = await loadJson('../data/research/profile-cohort-01-weapon-refresh-2026-08-30.json');
const weaponManifest = await loadJson('../data/research/profile-horizontal-cohort-01-weapon-refresh-2026-08-30.json');
const echoRefresh = await loadJson('../data/research/profile-cohort-01-echo-sonata-refresh-2026-08-30.json');
const statsRefresh = await loadJson('../data/research/profile-cohort-01-stats-er-refresh-2026-08-30.json');
const readiness = auditProfileReadiness();

const baseCohort = buildCohort(sourceInput, baseManifest, readiness);
assertSafety(baseCohort, readiness, 'Base Cohort 01');
for (const phaseName of ['MODE_TEAM_CONTEXT', 'WEAPON', 'ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION']) {
  assertPhase(baseCohort, phaseName, exactCounts(0, 20, 0, 20, 0), 'Base Cohort 01');
}

const appliedMode = applyProfileModeContextRefresh(sourceInput, modeRefresh);
if (JSON.stringify(appliedMode.summary) !== JSON.stringify({entryCount:20,reviewed:10,blocked:10,defaultSelections:0})) {
  throw new Error(`Cohort 01 mode/context refresh summary mismatch: ${JSON.stringify(appliedMode.summary)}.`);
}
const modeCohort = buildCohort(appliedMode.input, modeManifest, readiness);
assertSafety(modeCohort, readiness, 'Mode-refreshed Cohort 01');
assertPhase(modeCohort, 'MODE_TEAM_CONTEXT', exactCounts(10, 10, 10, 10, 0), 'Mode-refreshed Cohort 01');
for (const phaseName of ['WEAPON', 'ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION']) {
  assertPhase(modeCohort, phaseName, exactCounts(0, 20, 0, 20, 0), 'Mode-refreshed Cohort 01');
}

const appliedWeapon = applyProfileWeaponRefresh(appliedMode.input, weaponRefresh);
if (JSON.stringify(appliedWeapon.summary) !== JSON.stringify({entryCount:20,reviewed:18,blocked:2,stagedWeapons:18})) {
  throw new Error(`Cohort 01 weapon refresh summary mismatch: ${JSON.stringify(appliedWeapon.summary)}.`);
}
const weaponCohort = buildCohort(appliedWeapon.input, weaponManifest, readiness);
assertSafety(weaponCohort, readiness, 'Weapon-refreshed Cohort 01');
assertPhase(weaponCohort, 'MODE_TEAM_CONTEXT', exactCounts(10, 10, 10, 10, 0), 'Weapon-refreshed Cohort 01');
assertPhase(weaponCohort, 'WEAPON', exactCounts(18, 2, 18, 2, 0), 'Weapon-refreshed Cohort 01');
for (const phaseName of ['ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION']) {
  assertPhase(weaponCohort, phaseName, exactCounts(0, 20, 0, 20, 0), 'Weapon-refreshed Cohort 01');
}

const appliedEcho = applyProfileEchoSonataRefresh(appliedWeapon.input, echoRefresh);
if (JSON.stringify(appliedEcho.summary) !== JSON.stringify({entryCount:20,reviewed:17,blocked:3,stagedEchoes:17})) {
  throw new Error(`Cohort 01 Echo/Sonata refresh summary mismatch: ${JSON.stringify(appliedEcho.summary)}.`);
}
const echoManifest = buildEchoSonataCohortManifest(
  weaponManifest,
  echoRefresh,
  'data/research/profile-cohort-01-echo-sonata-refresh-2026-08-30.json',
);
const echoCohort = buildCohort(appliedEcho.input, echoManifest, readiness);
assertSafety(echoCohort, readiness, 'Echo-refreshed Cohort 01');
assertPhase(echoCohort, 'MODE_TEAM_CONTEXT', exactCounts(10, 10, 10, 10, 0), 'Echo-refreshed Cohort 01');
assertPhase(echoCohort, 'WEAPON', exactCounts(18, 2, 18, 2, 0), 'Echo-refreshed Cohort 01');
assertPhase(echoCohort, 'ECHO_SONATA', exactCounts(17, 3, 17, 3, 0), 'Echo-refreshed Cohort 01');
for (const phaseName of ['STATS_ER', 'SOURCE_ROTATION']) {
  assertPhase(echoCohort, phaseName, exactCounts(0, 20, 0, 20, 0), 'Echo-refreshed Cohort 01');
}

const appliedStats = applyProfileStatsErRefresh(appliedEcho.input, statsRefresh);
const expectedStatsSummary = {entryCount:20,reviewed:19,blocked:1,stagedStats:19,numericEr:13,intentionallyNullEr:6};
if (JSON.stringify(appliedStats.summary) !== JSON.stringify(expectedStatsSummary)) {
  throw new Error(`Cohort 01 stats/ER refresh summary mismatch: ${JSON.stringify(appliedStats.summary)}.`);
}
const statsManifest = buildStatsErCohortManifest(
  echoManifest,
  statsRefresh,
  'data/research/profile-cohort-01-stats-er-refresh-2026-08-30.json',
);
if (JSON.stringify(statsManifest.autoParkMissingSourcePhases) !== JSON.stringify(['SOURCE_ROTATION'])) {
  throw new Error(`Stats/ER manifest must only leave SOURCE_ROTATION auto-parked: ${JSON.stringify(statsManifest.autoParkMissingSourcePhases)}.`);
}
const statsCohort = buildCohort(appliedStats.input, statsManifest, readiness);
assertSafety(statsCohort, readiness, 'Stats-refreshed Cohort 01', {statsReviewed:true});
assertPhase(statsCohort, 'MODE_TEAM_CONTEXT', exactCounts(10, 10, 10, 10, 0), 'Stats-refreshed Cohort 01');
assertPhase(statsCohort, 'WEAPON', exactCounts(18, 2, 18, 2, 0), 'Stats-refreshed Cohort 01');
assertPhase(statsCohort, 'ECHO_SONATA', exactCounts(17, 3, 17, 3, 0), 'Stats-refreshed Cohort 01');
assertPhase(statsCohort, 'STATS_ER', exactCounts(19, 1, 19, 1, 0), 'Stats-refreshed Cohort 01');
assertPhase(statsCohort, 'SOURCE_ROTATION', exactCounts(0, 20, 0, 20, 0), 'Stats-refreshed Cohort 01');

const blockedEchoKeys = new Set(['brant:standard', 'encore:standard', 'jianxin:standard']);
let numericEr = 0;
let intentionallyNullEr = 0;
for (const character of statsCohort.characters) {
  for (const mode of character.modes) {
    const key = `${character.characterId}:${mode.modeKey}`;
    const echo = mode.phases.ECHO_SONATA.data;
    if (blockedEchoKeys.has(key)) {
      if (mode.phases.ECHO_SONATA.reviewState !== 'BLOCKED' || echo !== null) {
        throw new Error(`${key} must preserve the Echo/Sonata blocker after stats review.`);
      }
    } else if (mode.phases.ECHO_SONATA.reviewState !== 'REVIEWED' || echo == null) {
      throw new Error(`${key} must preserve reviewed Echo/Sonata data after stats review.`);
    }

    const stats = mode.phases.STATS_ER.data;
    if (key === 'jianxin:standard') {
      if (mode.phases.STATS_ER.reviewState !== 'BLOCKED' || stats.stats !== null || stats.erBand !== null) {
        throw new Error('jianxin:standard must remain STATS_ER BLOCKED without partial stats data.');
      }
      continue;
    }
    if (mode.phases.STATS_ER.reviewState !== 'REVIEWED' || stats.stats?.priority.length === 0) {
      throw new Error(`${key} must have a reviewed non-empty stat priority.`);
    }
    if (stats.numericErInvented !== false) throw new Error(`${key} numericErInvented must remain false.`);
    if (stats.erBand == null) intentionallyNullEr += 1;
    else numericEr += 1;
  }
}
if (numericEr !== 13 || intentionallyNullEr !== 6) {
  throw new Error(`Stats/ER numeric disposition mismatch: numeric=${numericEr}, intentionallyNull=${intentionallyNullEr}.`);
}

const brant = statsCohort.characters.find((character) => character.characterId === 'brant')?.modes.find((mode) => mode.modeKey === 'standard');
if (!brant || brant.phases.STATS_ER.data.erBand?.minimum !== 2.5 || brant.phases.STATS_ER.data.erBand?.maximum !== 2.8) {
  throw new Error('Brant must preserve the source-backed 250%-280% ER range.');
}
if (!brant.phases.STATS_ER.data.stats.relations.some((relation) => relation.includes('250% Energy Regen'))) {
  throw new Error('Brant must preserve the 250% Tidebreaking threshold as a first-class stats relation.');
}
if (brant.phases.ECHO_SONATA.reviewState !== 'BLOCKED') {
  throw new Error('Brant stats review must not silently resolve the separate conditional Echo blocker.');
}

console.log(`Horizontal profile cohort: ${statsCohort.characterCount} Characters / ${statsCohort.modeCount} modes`);
console.log(`MODE_TEAM_CONTEXT: reviewed=${statsCohort.phaseCounts.MODE_TEAM_CONTEXT.reviewed}, blocked=${statsCohort.phaseCounts.MODE_TEAM_CONTEXT.blocked}`);
console.log(`WEAPON: reviewed=${statsCohort.phaseCounts.WEAPON.reviewed}, blocked=${statsCohort.phaseCounts.WEAPON.blocked}`);
console.log(`ECHO_SONATA: reviewed=${statsCohort.phaseCounts.ECHO_SONATA.reviewed}, blocked=${statsCohort.phaseCounts.ECHO_SONATA.blocked}`);
console.log(`STATS_ER: reviewed=${statsCohort.phaseCounts.STATS_ER.reviewed}, blocked=${statsCohort.phaseCounts.STATS_ER.blocked}, numeric=${numericEr}, null-er=${intentionallyNullEr}`);
console.log(`SOURCE_ROTATION parked: ${statsCohort.phaseCounts.SOURCE_ROTATION.blocked}`);
