import { readFile } from 'node:fs/promises';
import { buildProfileCandidateReview } from './lib/profile-candidate-review.mjs';
import { applyProfileModeContextRefresh } from './lib/profile-cohort-mode-context-refresh.mjs';
import { applyProfileWeaponRefresh } from './lib/profile-cohort-weapon-refresh.mjs';
import { applyProfileEchoSonataRefresh, buildEchoSonataCohortManifest } from './lib/profile-cohort-echo-sonata-refresh.mjs';
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

function assertFailClosed(cohort, readiness, label) {
  if (cohort.characterCount < 10 || cohort.characterCount > 20 || cohort.modeCount !== 20) {
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
  if (cohort.characters.some((character) => character.modes.some((mode) => mode.phases.STATS_ER.data.erBand !== null || mode.phases.STATS_ER.data.numericErInvented !== false))) {
    throw new Error(`${label} STATS_ER must not infer numeric ER before its fresh review.`);
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
const readiness = auditProfileReadiness();

const baseCohort = buildCohort(sourceInput, baseManifest, readiness);
assertFailClosed(baseCohort, readiness, 'Base Cohort 01');
for (const phaseName of ['MODE_TEAM_CONTEXT', 'WEAPON', 'ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION']) {
  assertPhase(baseCohort, phaseName, exactCounts(0, 20, 0, 20, 0), 'Base Cohort 01');
}
if (JSON.stringify(baseCohort.autoParkMissingSourcePhases) !== JSON.stringify(['WEAPON', 'ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION'])) {
  throw new Error(`Base Cohort 01 autoParkMissingSourcePhases mismatch: ${JSON.stringify(baseCohort.autoParkMissingSourcePhases)}.`);
}

const appliedMode = applyProfileModeContextRefresh(sourceInput, modeRefresh);
if (JSON.stringify(appliedMode.summary) !== JSON.stringify({entryCount: 20, reviewed: 10, blocked: 10, defaultSelections: 0})) {
  throw new Error(`Cohort 01 mode/context refresh summary mismatch: ${JSON.stringify(appliedMode.summary)}.`);
}
const modeCohort = buildCohort(appliedMode.input, modeManifest, readiness);
assertFailClosed(modeCohort, readiness, 'Mode-refreshed Cohort 01');
assertPhase(modeCohort, 'MODE_TEAM_CONTEXT', exactCounts(10, 10, 10, 10, 0), 'Mode-refreshed Cohort 01');
for (const phaseName of ['WEAPON', 'ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION']) {
  assertPhase(modeCohort, phaseName, exactCounts(0, 20, 0, 20, 0), 'Mode-refreshed Cohort 01');
}

const appliedWeapon = applyProfileWeaponRefresh(appliedMode.input, weaponRefresh);
if (JSON.stringify(appliedWeapon.summary) !== JSON.stringify({entryCount: 20, reviewed: 18, blocked: 2, stagedWeapons: 18})) {
  throw new Error(`Cohort 01 weapon refresh summary mismatch: ${JSON.stringify(appliedWeapon.summary)}.`);
}
const weaponCohort = buildCohort(appliedWeapon.input, weaponManifest, readiness);
assertFailClosed(weaponCohort, readiness, 'Weapon-refreshed Cohort 01');
assertPhase(weaponCohort, 'MODE_TEAM_CONTEXT', exactCounts(10, 10, 10, 10, 0), 'Weapon-refreshed Cohort 01');
assertPhase(weaponCohort, 'WEAPON', exactCounts(18, 2, 18, 2, 0), 'Weapon-refreshed Cohort 01');
for (const phaseName of ['ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION']) {
  assertPhase(weaponCohort, phaseName, exactCounts(0, 20, 0, 20, 0), 'Weapon-refreshed Cohort 01');
}

const appliedEcho = applyProfileEchoSonataRefresh(appliedWeapon.input, echoRefresh);
if (JSON.stringify(appliedEcho.summary) !== JSON.stringify({entryCount: 20, reviewed: 17, blocked: 3, stagedEchoes: 17})) {
  throw new Error(`Cohort 01 Echo/Sonata refresh summary mismatch: ${JSON.stringify(appliedEcho.summary)}.`);
}
const echoManifest = buildEchoSonataCohortManifest(
  weaponManifest,
  echoRefresh,
  'data/research/profile-cohort-01-echo-sonata-refresh-2026-08-30.json',
);
if (JSON.stringify(echoManifest.autoParkMissingSourcePhases) !== JSON.stringify(['STATS_ER', 'SOURCE_ROTATION'])) {
  throw new Error(`Echo/Sonata manifest must only leave STATS_ER and SOURCE_ROTATION auto-parked: ${JSON.stringify(echoManifest.autoParkMissingSourcePhases)}.`);
}
const echoCohort = buildCohort(appliedEcho.input, echoManifest, readiness);
assertFailClosed(echoCohort, readiness, 'Echo-refreshed Cohort 01');
assertPhase(echoCohort, 'MODE_TEAM_CONTEXT', exactCounts(10, 10, 10, 10, 0), 'Echo-refreshed Cohort 01');
assertPhase(echoCohort, 'WEAPON', exactCounts(18, 2, 18, 2, 0), 'Echo-refreshed Cohort 01');
assertPhase(echoCohort, 'ECHO_SONATA', exactCounts(17, 3, 17, 3, 0), 'Echo-refreshed Cohort 01');
for (const phaseName of ['STATS_ER', 'SOURCE_ROTATION']) {
  assertPhase(echoCohort, phaseName, exactCounts(0, 20, 0, 20, 0), 'Echo-refreshed Cohort 01');
}

const blockedEchoKeys = new Set(['brant:standard', 'encore:standard', 'jianxin:standard']);
for (const character of echoCohort.characters) {
  for (const mode of character.modes) {
    const key = `${character.characterId}:${mode.modeKey}`;
    const echo = mode.phases.ECHO_SONATA.data;
    if (blockedEchoKeys.has(key)) {
      if (mode.phases.ECHO_SONATA.reviewState !== 'BLOCKED' || echo !== null) {
        throw new Error(`${key} must remain Echo/Sonata BLOCKED with null data.`);
      }
      continue;
    }
    if (mode.phases.ECHO_SONATA.reviewState !== 'REVIEWED' || echo == null) {
      throw new Error(`${key} must have reviewed Echo/Sonata data.`);
    }
    if (echo.costLayout.length !== 5 || echo.costLayout.reduce((sum, value) => sum + value, 0) !== 12 || echo.mainStats.length !== 5) {
      throw new Error(`${key} has an invalid staged five-Echo COST-12 recommendation.`);
    }
  }
}

console.log(`Horizontal profile cohort: ${echoCohort.characterCount} Characters / ${echoCohort.modeCount} modes`);
console.log(`MODE_TEAM_CONTEXT refresh: reviewed=${echoCohort.phaseCounts.MODE_TEAM_CONTEXT.reviewed}, blocked=${echoCohort.phaseCounts.MODE_TEAM_CONTEXT.blocked}`);
console.log(`WEAPON refresh: reviewed=${echoCohort.phaseCounts.WEAPON.reviewed}, blocked=${echoCohort.phaseCounts.WEAPON.blocked}`);
console.log(`ECHO_SONATA refresh: reviewed=${echoCohort.phaseCounts.ECHO_SONATA.reviewed}, blocked=${echoCohort.phaseCounts.ECHO_SONATA.blocked}`);
console.log(`STATS_ER parked: ${echoCohort.phaseCounts.STATS_ER.blocked}`);
console.log(`SOURCE_ROTATION parked: ${echoCohort.phaseCounts.SOURCE_ROTATION.blocked}`);
