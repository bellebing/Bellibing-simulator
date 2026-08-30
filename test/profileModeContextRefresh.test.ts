import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { buildProfileCandidateReview } from '../scripts/lib/profile-candidate-review.mjs';
import { applyProfileModeContextRefresh } from '../scripts/lib/profile-cohort-mode-context-refresh.mjs';
import { buildProfileHorizontalCohort } from '../scripts/lib/profile-horizontal-cohort.mjs';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

async function loadJson(relativePath: string) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));
}

test('Cohort 01 mode/context refresh advances 10 of 20 modes without canonical writes or default guesses', async () => {
  const baseInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const refresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-mode-context-refresh-2026-08-30.json');
  const applied = applyProfileModeContextRefresh(baseInput, refresh);

  assert.deepEqual(applied.summary, {
    entryCount: 20,
    reviewed: 10,
    blocked: 10,
    defaultSelections: 0,
  });
  assert.equal(applied.verificationStatus, 'NOT_VERIFIED');
  assert.equal(applied.canonicalWriteAllowed, false);
  assert.ok(applied.entries.every((entry) => entry.defaultCandidate === null));

  const candidateReview = buildProfileCandidateReview(applied.input);
  const readiness = auditProfileReadiness();
  const cohort = buildProfileHorizontalCohort(candidateReview, manifest, readiness.profileSourcePendingIds);

  assert.equal(cohort.characterCount, 15);
  assert.equal(cohort.modeCount, 20);
  assert.deepEqual(cohort.phaseCounts.MODE_TEAM_CONTEXT, {
    sourceFieldsPresent: 10,
    sourceFieldsMissing: 10,
    reviewed: 10,
    blocked: 10,
    pendingReview: 0,
  });
  assert.equal(cohort.verificationStatus, 'NOT_VERIFIED');
  assert.equal(cohort.canonicalWriteAllowed, false);
  assert.ok(cohort.materializationCandidates.every((candidate) => candidate.canonicalWriteAllowed === false));
  assert.ok(cohort.materializationCandidates.every((candidate) => candidate.verificationStatus === 'NOT_VERIFIED'));

  for (const phaseName of ['WEAPON', 'ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION']) {
    assert.deepEqual(cohort.phaseCounts[phaseName], {
      sourceFieldsPresent: 0,
      sourceFieldsMissing: 20,
      reviewed: 0,
      blocked: 20,
      pendingReview: 0,
    });
  }
  for (const phaseName of ['EXECUTION_ADAPTERS', 'PROMOTION_FREEZE']) {
    assert.equal(cohort.phaseCounts[phaseName].reviewed, 0);
    assert.equal(cohort.phaseCounts[phaseName].blocked, 0);
    assert.equal(cohort.phaseCounts[phaseName].pendingReview, 20);
  }

  const lucillaGlacio = cohort.characters.find((row) => row.characterId === 'lucilla')?.modes.find((mode) => mode.modeKey === 'glacio-chafe');
  const brant = cohort.characters.find((row) => row.characterId === 'brant')?.modes.find((mode) => mode.modeKey === 'standard');
  const encore = cohort.characters.find((row) => row.characterId === 'encore')?.modes.find((mode) => mode.modeKey === 'standard');
  assert.ok(lucillaGlacio && brant && encore);
  assert.equal(lucillaGlacio.phases.MODE_TEAM_CONTEXT.reviewState, 'REVIEWED');
  assert.deepEqual(lucillaGlacio.phases.MODE_TEAM_CONTEXT.data.team.members, ['lucilla', 'hiyuki', 'chisa']);
  assert.equal(brant.phases.MODE_TEAM_CONTEXT.reviewState, 'BLOCKED');
  assert.deepEqual(brant.phases.MODE_TEAM_CONTEXT.blockers, ['role']);
  assert.deepEqual(brant.phases.MODE_TEAM_CONTEXT.data.team.members, ['brant', 'lupa', 'galbrena']);
  assert.equal(encore.phases.MODE_TEAM_CONTEXT.reviewState, 'BLOCKED');
  assert.deepEqual(encore.phases.MODE_TEAM_CONTEXT.blockers, ['team']);

  for (const character of cohort.characters) {
    for (const mode of character.modes) {
      assert.equal(mode.phases.MODE_TEAM_CONTEXT.data.defaultCandidate, null);
      assert.equal(mode.materializationCandidate.sourceData.defaultCandidate, null);
    }
  }
});

test('mode/context refresh cannot overwrite already captured roles or write canonical truth', async () => {
  const baseInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const refresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');

  const mutatedRole = structuredClone(refresh);
  mutatedRole.entries.find((entry) => entry.characterId === 'lucilla' && entry.modeKey === 'glacio-chafe').role = 'MAIN_DPS';
  assert.throws(() => applyProfileModeContextRefresh(baseInput, mutatedRole), /cannot overwrite reviewed role HYBRID/);

  const canonical = { ...refresh, canonicalWriteAllowed: true };
  assert.throws(() => applyProfileModeContextRefresh(baseInput, canonical), /canonicalWriteAllowed=false/);

  const guessedDefault = structuredClone(refresh);
  guessedDefault.entries[0].defaultCandidate = true;
  assert.throws(() => applyProfileModeContextRefresh(baseInput, guessedDefault), /defaultCandidate must remain null/);
});

test('REVIEWED mode/context refresh requires exact role and three-member team', async () => {
  const baseInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const refresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
  const invalid = structuredClone(refresh);
  invalid.entries.find((entry) => entry.reviewState === 'REVIEWED').team = null;
  assert.throws(() => applyProfileModeContextRefresh(baseInput, invalid), /REVIEWED requires role \+ exact three-member team/);
});
