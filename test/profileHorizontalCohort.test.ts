import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { buildProfileCandidateReview } from '../scripts/lib/profile-candidate-review.mjs';
import {
  assertLiveProfileHorizontalCohortEligibility,
  buildProfileHorizontalCohort,
  PROFILE_HORIZONTAL_PHASES,
} from '../scripts/lib/profile-horizontal-cohort.mjs';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

async function loadJson(relativePath: string) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));
}

const BLOCKED_SOURCE_PHASES = [
  'MODE_TEAM_CONTEXT',
  'WEAPON',
  'ECHO_SONATA',
  'STATS_ER',
  'SOURCE_ROTATION',
];

const AUTO_PARK_SOURCE_PHASES = [
  'WEAPON',
  'ECHO_SONATA',
  'STATS_ER',
  'SOURCE_ROTATION',
];

test('cohort 01 replays its fixed 15-Character historical snapshot without auto-verification', async () => {
  const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
  const candidateReview = buildProfileCandidateReview(sourceInput);
  const cohort = buildProfileHorizontalCohort(candidateReview, manifest);

  assert.equal(cohort.characterCount, 15);
  assert.equal(cohort.modeCount, 20);
  assert.deepEqual(cohort.characters.map((character) => character.characterId), [
    'lucilla',
    'lumi',
    'rover-havoc',
    'yangyang',
    'yinlin',
    'baizhi',
    'brant',
    'calcharo',
    'cantarella',
    'carlotta',
    'changli',
    'chisa',
    'chixia',
    'encore',
    'jianxin',
  ]);
  assert.equal(cohort.characters.filter((row) => row.sourceDisposition === 'MULTI_MODE').length, 5);
  assert.equal(cohort.characters.filter((row) => row.sourceDisposition === 'MISSING_CONTEXT').length, 10);
  assert.equal(cohort.verificationStatus, 'NOT_VERIFIED');
  assert.equal(cohort.canonicalWriteAllowed, false);
  assert.ok(cohort.parkedBlockerCount > 0);
  assert.deepEqual(cohort.autoParkMissingSourcePhases, AUTO_PARK_SOURCE_PHASES);
  assert.ok(cohort.notes.some((note) => note.includes('historical manifest snapshot')));

  for (const phaseName of BLOCKED_SOURCE_PHASES) {
    assert.deepEqual(cohort.phaseCounts[phaseName], {
      sourceFieldsPresent: 0,
      sourceFieldsMissing: 20,
      reviewed: 0,
      blocked: 20,
      pendingReview: 0,
    });
  }

  for (const phaseName of ['EXECUTION_ADAPTERS', 'PROMOTION_FREEZE']) {
    assert.equal(cohort.phaseCounts[phaseName].blocked, 0);
    assert.equal(cohort.phaseCounts[phaseName].reviewed, 0);
    assert.equal(cohort.phaseCounts[phaseName].pendingReview, 20);
  }

  for (const character of cohort.characters) {
    assert.equal(character.verificationStatus, 'NOT_VERIFIED');
    assert.equal(character.canonicalWriteAllowed, false);
    for (const mode of character.modes) {
      assert.equal(mode.verificationStatus, 'NOT_VERIFIED');
      assert.equal(mode.canonicalWriteAllowed, false);
      assert.deepEqual(Object.keys(mode.phases), PROFILE_HORIZONTAL_PHASES);
      assert.ok(BLOCKED_SOURCE_PHASES.every((phase) => mode.phases[phase].reviewState === 'BLOCKED'));
      assert.ok(AUTO_PARK_SOURCE_PHASES.every((phase) => /Automatically parked.*not semantic approval/.test(mode.phases[phase].notes.join(' '))));
      assert.equal(mode.phases.MODE_TEAM_CONTEXT.data.defaultCandidate, null);
      assert.equal(mode.materializationCandidate.sourceData.defaultCandidate, null);
      assert.equal(mode.phases.STATS_ER.data.erBand, null);
      assert.equal(mode.phases.STATS_ER.data.numericErInvented, false);
      assert.equal(mode.phases.SOURCE_ROTATION.data, null);
      assert.equal(mode.phases.EXECUTION_ADAPTERS.reviewState, 'PENDING_REVIEW');
      assert.equal(mode.phases.PROMOTION_FREEZE.reviewState, 'PENDING_REVIEW');
      assert.equal(mode.phases.PROMOTION_FREEZE.data.verificationStatus, 'NOT_VERIFIED');
      assert.equal(mode.phases.PROMOTION_FREEZE.data.canonicalWriteAllowed, false);
      assert.equal(mode.materializationCandidate.verificationStatus, 'NOT_VERIFIED');
      assert.equal(mode.materializationCandidate.canonicalWriteAllowed, false);
    }
  }
});

test('mode/team/context review preserves roles where staged and parks exact missing fields', async () => {
  const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
  const cohort = buildProfileHorizontalCohort(buildProfileCandidateReview(sourceInput), manifest);

  const lucilla = cohort.characters.find((row) => row.characterId === 'lucilla');
  const baizhi = cohort.characters.find((row) => row.characterId === 'baizhi');
  const yinlin = cohort.characters.find((row) => row.characterId === 'yinlin');
  assert.ok(lucilla && baizhi && yinlin);

  assert.equal(lucilla.modes.length, 2);
  assert.equal(lucilla.modes[0]?.phases.MODE_TEAM_CONTEXT.data.role, 'HYBRID');
  assert.deepEqual(lucilla.modes[0]?.phases.MODE_TEAM_CONTEXT.blockers, ['team']);
  assert.equal(lucilla.modes[0]?.phases.MODE_TEAM_CONTEXT.reviewState, 'BLOCKED');

  assert.equal(yinlin.modes[0]?.phases.MODE_TEAM_CONTEXT.data.role, 'HYBRID');
  assert.deepEqual(yinlin.modes[0]?.phases.MODE_TEAM_CONTEXT.blockers, ['team']);
  assert.equal(yinlin.modes[0]?.phases.MODE_TEAM_CONTEXT.data.defaultCandidate, null);

  assert.equal(baizhi.modes[0]?.phases.MODE_TEAM_CONTEXT.data.role, null);
  assert.deepEqual(baizhi.modes[0]?.phases.MODE_TEAM_CONTEXT.blockers, ['role', 'team']);
  assert.equal(baizhi.modes[0]?.phases.MODE_TEAM_CONTEXT.reviewState, 'BLOCKED');
  assert.equal(baizhi.modes[0]?.phases.WEAPON.extractionState, 'SOURCE_FIELDS_MISSING');
  assert.equal(baizhi.modes[0]?.phases.WEAPON.reviewState, 'BLOCKED');
  assert.equal(baizhi.modes[0]?.materializationCandidate.materializationStatus, 'BLOCKED_BY_MISSING_SOURCE_FIELDS');
});

test('source blocker auto-parking can only target extraction phases and never upgrades review state', async () => {
  const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
  const candidateReview = buildProfileCandidateReview(sourceInput);

  assert.throws(() => buildProfileHorizontalCohort(candidateReview, {
    ...manifest,
    autoParkMissingSourcePhases: ['EXECUTION_ADAPTERS'],
  }), /may only contain source extraction phases/);

  const cohort = buildProfileHorizontalCohort(candidateReview, manifest);
  for (const phaseName of AUTO_PARK_SOURCE_PHASES) {
    assert.equal(cohort.phaseCounts[phaseName].reviewed, 0);
    assert.equal(cohort.phaseCounts[phaseName].blocked, 20);
  }
});

test('cohort review cannot mark a phase REVIEWED while required source fields are missing', async () => {
  const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
  const candidateReview = buildProfileCandidateReview(sourceInput);

  assert.throws(() => buildProfileHorizontalCohort(candidateReview, {
    ...manifest,
    phaseReviews: {
      ...manifest.phaseReviews,
      'lucilla:glacio-chafe:MODE_TEAM_CONTEXT': {
        reviewState: 'REVIEWED',
        notes: ['This must fail because team is still missing.'],
      },
    },
  }), /cannot be REVIEWED while source fields are missing: team/);
});

test('live eligibility is a separate guard and rejects historical Cohort 01 after real promotions', async () => {
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
  const readiness = auditProfileReadiness();

  for (const promoted of ['lumi', 'yinlin', 'calcharo', 'cantarella', 'carlotta', 'changli', 'chisa']) {
    assert.ok(!readiness.profileSourcePendingIds.includes(promoted));
  }
  assert.throws(
    () => assertLiveProfileHorizontalCohortEligibility(manifest, readiness.profileSourcePendingIds),
    /no longer PROFILE_SOURCE_PENDING/,
  );
});
