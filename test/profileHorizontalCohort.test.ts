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

  for (const character of cohort.characters) {
    assert.ok(readiness.profileSourcePendingIds.includes(character.characterId));
    assert.equal(character.verificationStatus, 'NOT_VERIFIED');
    assert.equal(character.canonicalWriteAllowed, false);
    for (const mode of character.modes) {
      assert.equal(mode.verificationStatus, 'NOT_VERIFIED');
      assert.equal(mode.canonicalWriteAllowed, false);
      assert.deepEqual(Object.keys(mode.phases), PROFILE_HORIZONTAL_PHASES);
      assert.ok(Object.values(mode.phases).every((phase) => phase.reviewState === 'PENDING_REVIEW'));
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

test('cohort staging parks missing fields per mode instead of aborting the batch', async () => {
  const sourceInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-2026-08-29.json');
  const candidateReview = buildProfileCandidateReview(sourceInput);
  const readiness = auditProfileReadiness();
  const cohort = buildProfileHorizontalCohort(candidateReview, manifest, readiness.profileSourcePendingIds);

  const lucilla = cohort.characters.find((row) => row.characterId === 'lucilla');
  const baizhi = cohort.characters.find((row) => row.characterId === 'baizhi');
  assert.ok(lucilla && baizhi);
  assert.equal(lucilla.modes.length, 2);
  assert.equal(lucilla.modes[0]?.phases.MODE_TEAM_CONTEXT.extractionState, 'SOURCE_FIELDS_MISSING');
  assert.deepEqual(lucilla.modes[0]?.phases.MODE_TEAM_CONTEXT.blockers, ['team']);
  assert.equal(baizhi.modes[0]?.phases.WEAPON.extractionState, 'SOURCE_FIELDS_MISSING');
  assert.equal(baizhi.modes[0]?.materializationCandidate.materializationStatus, 'BLOCKED_BY_MISSING_SOURCE_FIELDS');
  assert.equal(cohort.characterCount, 15);
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
