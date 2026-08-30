import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { buildProfileCandidateReview } from '../scripts/lib/profile-candidate-review.mjs';
import { applyProfileModeContextRefresh } from '../scripts/lib/profile-cohort-mode-context-refresh.mjs';
import { applyProfileWeaponRefresh } from '../scripts/lib/profile-cohort-weapon-refresh.mjs';
import { buildProfileHorizontalCohort } from '../scripts/lib/profile-horizontal-cohort.mjs';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

async function loadJson(relativePath: string) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));
}

test('Cohort 01 weapon refresh advances 18 of 20 modes without changing prior mode/context review', async () => {
  const baseInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const modeRefresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
  const weaponRefresh = await loadJson('../data/research/profile-cohort-01-weapon-refresh-2026-08-30.json');
  const manifest = await loadJson('../data/research/profile-horizontal-cohort-01-weapon-refresh-2026-08-30.json');

  const appliedMode = applyProfileModeContextRefresh(baseInput, modeRefresh);
  const appliedWeapon = applyProfileWeaponRefresh(appliedMode.input, weaponRefresh);
  assert.deepEqual(appliedWeapon.summary, {
    entryCount: 20,
    reviewed: 18,
    blocked: 2,
    stagedWeapons: 18,
  });
  assert.equal(appliedWeapon.verificationStatus, 'NOT_VERIFIED');
  assert.equal(appliedWeapon.canonicalWriteAllowed, false);

  const candidateReview = buildProfileCandidateReview(appliedWeapon.input);
  const readiness = auditProfileReadiness();
  const cohort = buildProfileHorizontalCohort(candidateReview, manifest, readiness.profileSourcePendingIds);

  assert.deepEqual(cohort.phaseCounts.MODE_TEAM_CONTEXT, {
    sourceFieldsPresent: 10,
    sourceFieldsMissing: 10,
    reviewed: 10,
    blocked: 10,
    pendingReview: 0,
  });
  assert.deepEqual(cohort.phaseCounts.WEAPON, {
    sourceFieldsPresent: 18,
    sourceFieldsMissing: 2,
    reviewed: 18,
    blocked: 2,
    pendingReview: 0,
  });
  for (const phaseName of ['ECHO_SONATA', 'STATS_ER', 'SOURCE_ROTATION']) {
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
  assert.equal(cohort.verificationStatus, 'NOT_VERIFIED');
  assert.equal(cohort.canonicalWriteAllowed, false);
  assert.ok(cohort.materializationCandidates.every((candidate) => candidate.verificationStatus === 'NOT_VERIFIED'));
  assert.ok(cohort.materializationCandidates.every((candidate) => candidate.canonicalWriteAllowed === false));

  const lucillaChafe = cohort.characters.find((row) => row.characterId === 'lucilla')?.modes.find((mode) => mode.modeKey === 'glacio-chafe');
  const lucillaEcho = cohort.characters.find((row) => row.characterId === 'lucilla')?.modes.find((mode) => mode.modeKey === 'echo-skill');
  const yangyangSupport = cohort.characters.find((row) => row.characterId === 'yangyang')?.modes.find((mode) => mode.modeKey === 'support');
  const yangyangDamage = cohort.characters.find((row) => row.characterId === 'yangyang')?.modes.find((mode) => mode.modeKey === 'damage');
  const jianxin = cohort.characters.find((row) => row.characterId === 'jianxin')?.modes.find((mode) => mode.modeKey === 'standard');
  assert.ok(lucillaChafe && lucillaEcho && yangyangSupport && yangyangDamage && jianxin);

  assert.equal(lucillaChafe.phases.WEAPON.data.name, 'Freeze Frame');
  assert.equal(lucillaEcho.phases.WEAPON.data.name, 'Freeze Frame');
  assert.equal(yangyangSupport.phases.WEAPON.data, null);
  assert.equal(yangyangSupport.phases.WEAPON.reviewState, 'BLOCKED');
  assert.equal(yangyangDamage.phases.WEAPON.data.name, 'Blazing Brilliance');
  assert.equal(yangyangDamage.phases.WEAPON.reviewState, 'REVIEWED');
  assert.equal(jianxin.phases.WEAPON.data, null);
  assert.equal(jianxin.phases.WEAPON.reviewState, 'BLOCKED');

  for (const character of cohort.characters) {
    for (const mode of character.modes) {
      assert.equal(mode.phases.MODE_TEAM_CONTEXT.data.defaultCandidate, null);
      assert.equal(mode.materializationCandidate.sourceData.defaultCandidate, null);
    }
  }
});

test('weapon refresh cannot overwrite existing weapon data or write canonical truth', async () => {
  const baseInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const modeRefresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
  const weaponRefresh = await loadJson('../data/research/profile-cohort-01-weapon-refresh-2026-08-30.json');
  const appliedMode = applyProfileModeContextRefresh(baseInput, modeRefresh);

  const withWeapon = structuredClone(appliedMode.input);
  withWeapon.characters.find((character) => character.characterId === 'lucilla').modes.find((mode) => mode.key === 'glacio-chafe').weapon = {
    name: 'Existing Weapon', rank: 'R1', context: 'existing',
  };
  assert.throws(() => applyProfileWeaponRefresh(withWeapon, weaponRefresh), /base mode already has weapon data/);

  assert.throws(() => applyProfileWeaponRefresh(appliedMode.input, {
    ...weaponRefresh,
    canonicalWriteAllowed: true,
  }), /canonicalWriteAllowed=false/);
});

test('REVIEWED weapon refresh requires an exact weapon and BLOCKED requires blockers', async () => {
  const baseInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const modeRefresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
  const weaponRefresh = await loadJson('../data/research/profile-cohort-01-weapon-refresh-2026-08-30.json');
  const appliedMode = applyProfileModeContextRefresh(baseInput, modeRefresh);

  const missingWeapon = structuredClone(weaponRefresh);
  const reviewed = missingWeapon.entries.find((entry) => entry.reviewState === 'REVIEWED');
  reviewed.weapon = null;
  assert.throws(() => applyProfileWeaponRefresh(appliedMode.input, missingWeapon), /REVIEWED requires an exact weapon recommendation/);

  const missingBlocker = structuredClone(weaponRefresh);
  const blocked = missingBlocker.entries.find((entry) => entry.reviewState === 'BLOCKED');
  blocked.blockers = [];
  assert.throws(() => applyProfileWeaponRefresh(appliedMode.input, missingBlocker), /BLOCKED requires at least one blocker/);
});
