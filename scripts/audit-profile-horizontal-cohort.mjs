import { readFile } from 'node:fs/promises';
import { buildProfileCandidateReview } from './lib/profile-candidate-review.mjs';
import { applyProfileModeContextRefresh } from './lib/profile-cohort-mode-context-refresh.mjs';
import { applyProfileWeaponRefresh } from './lib/profile-cohort-weapon-refresh.mjs';
import { applyProfileEchoSonataRefresh, buildEchoSonataCohortManifest } from './lib/profile-cohort-echo-sonata-refresh.mjs';
import { applyProfileStatsErRefresh, buildStatsErCohortManifest } from './lib/profile-cohort-stats-er-refresh.mjs';
import { applyProfileSourceRotationRefresh, buildSourceRotationCohortManifest } from './lib/profile-cohort-source-rotation-refresh.mjs';
import { buildProfileHorizontalCohort } from './lib/profile-horizontal-cohort.mjs';

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

function assertHistoricalFailClosed(cohort, label) {
  if (cohort.characterCount !== 15 || cohort.modeCount !== 20) {
    throw new Error(`${label} must replay the fixed 15-Character / 20-mode Cohort 01 snapshot.`);
  }
  if (cohort.verificationStatus !== 'NOT_VERIFIED' || cohort.canonicalWriteAllowed !== false) {
    throw new Error(`${label} must remain NOT_VERIFIED and fail-closed for canonical writes.`);
  }
  if (cohort.materializationCandidates.some((candidate) => candidate.verificationStatus !== 'NOT_VERIFIED' || candidate.canonicalWriteAllowed !== false)) {
    throw new Error(`${label} materialization candidates must remain NOT_VERIFIED and non-canonical.`);
  }
  assertPhase(cohort, 'EXECUTION_ADAPTERS', exactCounts(20, 0, 0, 0, 20), label);
  assertPhase(cohort, 'PROMOTION_FREEZE', exactCounts(0, 0, 0, 0, 20), label);
}

function buildCohort(input, manifest) {
  return buildProfileHorizontalCohort(buildProfileCandidateReview(input), manifest);
}

const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
const baseManifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
const modeRefresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
const modeManifest = await loadJson('../data/research/profile-horizontal-cohort-01-mode-context-refresh-2026-08-30.json');
const weaponRefresh = await loadJson('../data/research/profile-cohort-01-weapon-refresh-2026-08-30.json');
const weaponManifest = await loadJson('../data/research/profile-horizontal-cohort-01-weapon-refresh-2026-08-30.json');
const echoRefresh = await loadJson('../data/research/profile-cohort-01-echo-sonata-refresh-2026-08-30.json');
const statsRefresh = await loadJson('../data/research/profile-cohort-01-stats-er-refresh-2026-08-30.json');
const rotationRefresh = await loadJson('../data/research/profile-cohort-01-source-rotation-refresh-2026-08-30.json');

const baseCohort = buildCohort(sourceInput, baseManifest);
assertHistoricalFailClosed(baseCohort, 'Base Cohort 01');
for (const phaseName of ['MODE_TEAM_CONTEXT', 'WEAPON', 'ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION']) {
  assertPhase(baseCohort, phaseName, exactCounts(0, 20, 0, 20, 0), 'Base Cohort 01');
}

const appliedMode = applyProfileModeContextRefresh(sourceInput, modeRefresh);
if (JSON.stringify(appliedMode.summary) !== JSON.stringify({entryCount: 20, reviewed: 10, blocked: 10, defaultSelections: 0})) {
  throw new Error(`Cohort 01 mode/context refresh summary mismatch: ${JSON.stringify(appliedMode.summary)}.`);
}
const modeCohort = buildCohort(appliedMode.input, modeManifest);
assertHistoricalFailClosed(modeCohort, 'Mode-refreshed Cohort 01');
assertPhase(modeCohort, 'MODE_TEAM_CONTEXT', exactCounts(10, 10, 10, 10, 0), 'Mode-refreshed Cohort 01');
for (const phaseName of ['WEAPON', 'ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION']) {
  assertPhase(modeCohort, phaseName, exactCounts(0, 20, 0, 20, 0), 'Mode-refreshed Cohort 01');
}

const appliedWeapon = applyProfileWeaponRefresh(appliedMode.input, weaponRefresh);
if (JSON.stringify(appliedWeapon.summary) !== JSON.stringify({entryCount: 20, reviewed: 18, blocked: 2, stagedWeapons: 18})) {
  throw new Error(`Cohort 01 weapon refresh summary mismatch: ${JSON.stringify(appliedWeapon.summary)}.`);
}
const weaponCohort = buildCohort(appliedWeapon.input, weaponManifest);
assertHistoricalFailClosed(weaponCohort, 'Weapon-refreshed Cohort 01');
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
const echoCohort = buildCohort(appliedEcho.input, echoManifest);
assertHistoricalFailClosed(echoCohort, 'Echo-refreshed Cohort 01');
assertPhase(echoCohort, 'MODE_TEAM_CONTEXT', exactCounts(10, 10, 10, 10, 0), 'Echo-refreshed Cohort 01');
assertPhase(echoCohort, 'WEAPON', exactCounts(18, 2, 18, 2, 0), 'Echo-refreshed Cohort 01');
assertPhase(echoCohort, 'ECHO_SONATA', exactCounts(17, 3, 17, 3, 0), 'Echo-refreshed Cohort 01');
for (const phaseName of ['STATS_ER', 'SOURCE_ROTATION']) {
  assertPhase(echoCohort, phaseName, exactCounts(0, 20, 0, 20, 0), 'Echo-refreshed Cohort 01');
}

const appliedStats = applyProfileStatsErRefresh(appliedEcho.input, statsRefresh);
if (JSON.stringify(appliedStats.summary) !== JSON.stringify({entryCount: 20, reviewed: 10, blocked: 10, stagedStats: 10, numericErBands: 8})) {
  throw new Error(`Cohort 01 STATS_ER refresh summary mismatch: ${JSON.stringify(appliedStats.summary)}.`);
}
const statsManifest = buildStatsErCohortManifest(
  echoManifest,
  statsRefresh,
  'data/research/profile-cohort-01-stats-er-refresh-2026-08-30.json',
);
const statsCohort = buildCohort(appliedStats.input, statsManifest);
assertHistoricalFailClosed(statsCohort, 'STATS_ER-refreshed Cohort 01');
assertPhase(statsCohort, 'MODE_TEAM_CONTEXT', exactCounts(10, 10, 10, 10, 0), 'STATS_ER-refreshed Cohort 01');
assertPhase(statsCohort, 'WEAPON', exactCounts(18, 2, 18, 2, 0), 'STATS_ER-refreshed Cohort 01');
assertPhase(statsCohort, 'ECHO_SONATA', exactCounts(17, 3, 17, 3, 0), 'STATS_ER-refreshed Cohort 01');
assertPhase(statsCohort, 'STATS_ER', exactCounts(10, 10, 10, 10, 0), 'STATS_ER-refreshed Cohort 01');
assertPhase(statsCohort, 'SOURCE_ROTATION', exactCounts(0, 20, 0, 20, 0), 'STATS_ER-refreshed Cohort 01');

const appliedRotation = applyProfileSourceRotationRefresh(appliedStats.input, rotationRefresh);
if (JSON.stringify(appliedRotation.summary) !== JSON.stringify({entryCount: 20, reviewed: 10, blocked: 10, stagedRotations: 10})) {
  throw new Error(`Cohort 01 SOURCE_ROTATION refresh summary mismatch: ${JSON.stringify(appliedRotation.summary)}.`);
}
const rotationManifest = buildSourceRotationCohortManifest(
  statsManifest,
  rotationRefresh,
  'data/research/profile-cohort-01-source-rotation-refresh-2026-08-30.json',
);
const rotationCohort = buildCohort(appliedRotation.input, rotationManifest);
assertHistoricalFailClosed(rotationCohort, 'SOURCE_ROTATION-refreshed Cohort 01');
assertPhase(rotationCohort, 'MODE_TEAM_CONTEXT', exactCounts(10, 10, 10, 10, 0), 'SOURCE_ROTATION-refreshed Cohort 01');
assertPhase(rotationCohort, 'WEAPON', exactCounts(18, 2, 18, 2, 0), 'SOURCE_ROTATION-refreshed Cohort 01');
assertPhase(rotationCohort, 'ECHO_SONATA', exactCounts(17, 3, 17, 3, 0), 'SOURCE_ROTATION-refreshed Cohort 01');
assertPhase(rotationCohort, 'STATS_ER', exactCounts(10, 10, 10, 10, 0), 'SOURCE_ROTATION-refreshed Cohort 01');
assertPhase(rotationCohort, 'SOURCE_ROTATION', exactCounts(10, 10, 10, 10, 0), 'SOURCE_ROTATION-refreshed Cohort 01');
if (rotationCohort.autoParkMissingSourcePhases.length !== 0) {
  throw new Error(`SOURCE_ROTATION-refreshed Cohort 01 must have zero auto-parked source phases, found ${rotationCohort.autoParkMissingSourcePhases.join(', ')}.`);
}

const greenKeys = new Set([
  'lucilla:glacio-chafe',
  'lucilla:echo-skill',
  'lumi:hybrid',
  'rover-havoc:quickswap',
  'yinlin:moonlit',
  'calcharo:standard',
  'cantarella:standard',
  'carlotta:standard',
  'changli:standard',
  'chisa:standard',
]);
for (const character of rotationCohort.characters) {
  for (const mode of character.modes) {
    const key = `${character.characterId}:${mode.modeKey}`;
    if (greenKeys.has(key)) {
      if (mode.materializationCandidate.materializationStatus !== 'DRAFT_READY_FOR_SEMANTIC_REVIEW') {
        throw new Error(`${key} should be source-complete for semantic promotion review.`);
      }
      if (mode.phases.SOURCE_ROTATION.data?.executionStatus !== 'SOURCE_SEQUENCE_ONLY') {
        throw new Error(`${key} source rotation must remain SOURCE_SEQUENCE_ONLY.`);
      }
    } else if (mode.materializationCandidate.materializationStatus !== 'BLOCKED_BY_MISSING_SOURCE_FIELDS') {
      throw new Error(`${key} must retain its explicit source blocker.`);
    }
  }
}

const rover = rotationCohort.characters.find((row) => row.characterId === 'rover-havoc')?.modes.find((row) => row.modeKey === 'quickswap');
const cantarella = rotationCohort.characters.find((row) => row.characterId === 'cantarella')?.modes.find((row) => row.modeKey === 'standard');
const brant = rotationCohort.characters.find((row) => row.characterId === 'brant')?.modes.find((row) => row.modeKey === 'standard');
if (rover?.phases.STATS_ER.data.erBand !== null || cantarella?.phases.STATS_ER.data.erBand !== null) {
  throw new Error('Rover Havoc Quick Swap and Cantarella must retain null numeric ER rather than fabricated targets.');
}
if (brant?.phases.ECHO_SONATA.reviewState !== 'BLOCKED' || brant.phases.ECHO_SONATA.data !== null) {
  throw new Error('Brant must retain the conditional 250% Tidebreaking versus Molten fallback blocker.');
}

console.log(`Horizontal profile cohort: ${rotationCohort.characterCount} Characters / ${rotationCohort.modeCount} modes`);
console.log(`MODE_TEAM_CONTEXT: reviewed=${rotationCohort.phaseCounts.MODE_TEAM_CONTEXT.reviewed}, blocked=${rotationCohort.phaseCounts.MODE_TEAM_CONTEXT.blocked}`);
console.log(`WEAPON: reviewed=${rotationCohort.phaseCounts.WEAPON.reviewed}, blocked=${rotationCohort.phaseCounts.WEAPON.blocked}`);
console.log(`ECHO_SONATA: reviewed=${rotationCohort.phaseCounts.ECHO_SONATA.reviewed}, blocked=${rotationCohort.phaseCounts.ECHO_SONATA.blocked}`);
console.log(`STATS_ER: reviewed=${rotationCohort.phaseCounts.STATS_ER.reviewed}, blocked=${rotationCohort.phaseCounts.STATS_ER.blocked}`);
console.log(`SOURCE_ROTATION: reviewed=${rotationCohort.phaseCounts.SOURCE_ROTATION.reviewed}, blocked=${rotationCohort.phaseCounts.SOURCE_ROTATION.blocked}`);
