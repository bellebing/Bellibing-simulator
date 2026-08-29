import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { buildProfileCandidateReview } from '../scripts/lib/profile-candidate-review.mjs';
import { buildProfileHorizontalCohort, PROFILE_HORIZONTAL_PHASES } from '../scripts/lib/profile-horizontal-cohort.mjs';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

async function loadJson(relativePath: string) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));
}

test('cohort 01 stages 15 current source-pending Characters horizontally without auto-verification', async () => {
  const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
  const candidateReview = buildProfileCandidateReview(sourceInput);
  const readiness = auditProfileReadiness();
  const cohort = buildProfileHorizontalCohort(candidateReview, manifest, readiness.profileSourcePendingIds);

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
  assert.deepEqual(cohort.phaseCounts.MODE_TEAM_CONTEXT, {
    sourceFieldsPresent: 0,
    sourceFieldsMissing: 20,
    reviewed: 0,
    blocked: 20,
    pendingReview: 0,
  });

  for (const phaseName of PROFILE_HORIZONTAL_PHASES.filter((phase) => phase !== 'MODE_TEAM_CONTEXT')) {
    assert.equal(cohort.phaseCounts[phaseName].blocked, 0);
    assert.equal(cohort.phaseCounts[phaseName].reviewed, 0);
    assert.equal(cohort.phaseCounts[phaseName].pendingReview, 20);
  }

  for (const character of cohort.characters) {
    assert.ok(readiness.profileSourcePendingIds.includes(character.characterId));
    assert.equal(character.verificationStatus, 'NOT_VERIFIED');
    assert.equal(character.canonicalWriteAllowed, false);
    for (const mode of character.modes) {
      assert.equal(mode.verificationStatus, 'NOT_VERIFIED');
      assert.equal(mode.canonicalWriteAllowed, false);
      assert.deepEqual(Object.keys(mode.phases), PROFILE_HORIZONTAL_PHASES);
      assert.equal(mode.phases.MODE_TEAM_CONTEXT.reviewState, 'BLOCKED');
      assert.equal(mode.phases.MODE_TEAM_CONTEXT.data.defaultCandidate, null);
      assert.equal(mode.materializationCandidate.sourceData.defaultCandidate, null);
      assert.ok(PROFILE_HORIZONTAL_PHASES
        .filter((phase) => phase !== 'MODE_TEAM_CONTEXT')
        .every((phase) => mode.phases[phase].reviewState === 'PENDING_REVIEW'));
      assert.equal(mode.phases.PROMOTION_FREEZE.data.verificationStatus, 'NOT_VERIFIED');
      assert.equal(mode.phases.PROMOTION_FREEZE.data.canonicalWriteAllowed, false);
      if (mode.phases.SOURCE_ROTATION.data) {
        assert.equal(mode.phases.SOURCE_ROTATION.data.executionStatus, 'SOURCE_SEQUENCE_ONLY');
      }
      assert.equal(mode.materializationCandidate.verificationStatus, 'NOT_VERIFIED');
      assert.equal(mode.materializationCandidate.canonicalWriteAllowed, false);
    }
  }
});

test('mode/team/context review preserves roles where staged and parks exact missing fields', async () => {
  const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
  const candidateReview = buildProfileCandidateReview(sourceInput);
  const readiness = auditProfileReadiness();
  const cohort = buildProfileHorizontalCohort(candidateReview, manifest, readiness.profileSourcePendingIds);

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
  assert.equal(baizhi.modes[0]?.materializationCandidate.materializationStatus, 'BLOCKED_BY_MISSING_SOURCE_FIELDS');
  assert.equal(cohort.characterCount, 15);
});

test('cohort review cannot mark a phase REVIEWED while required source fields are missing', async () => {
  const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
  const candidateReview = buildProfileCandidateReview(sourceInput);
  const readiness = auditProfileReadiness();

  assert.throws(() => buildProfileHorizontalCohort(candidateReview, {
    ...manifest,
    phaseReviews: {
      ...manifest.phaseReviews,
      'lucilla:glacio-chafe:MODE_TEAM_CONTEXT': {
        reviewState: 'REVIEWED',
        notes: ['This must fail because team is still missing.'],
      },
    },
  }, readiness.profileSourcePendingIds), /cannot be REVIEWED while source fields are missing: team/);
});

test('cohort input fails closed if a promoted Character is accidentally carried forward', async () => {
  const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
  const candidateReview = buildProfileCandidateReview(sourceInput);
  const readiness = auditProfileReadiness();

  assert.throws(() => buildProfileHorizontalCohort(candidateReview, {
    ...manifest,
    characterIds: ['denia', ...manifest.characterIds.slice(1)],
  }, readiness.profileSourcePendingIds), /no longer PROFILE_SOURCE_PENDING/);
});
