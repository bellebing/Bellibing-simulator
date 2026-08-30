import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { buildProfileCandidateReview } from '../scripts/lib/profile-candidate-review.mjs';
import { applyProfileModeContextRefresh } from '../scripts/lib/profile-cohort-mode-context-refresh.mjs';
import { applyProfileWeaponRefresh } from '../scripts/lib/profile-cohort-weapon-refresh.mjs';
import { applyProfileEchoSonataRefresh, buildEchoSonataCohortManifest } from '../scripts/lib/profile-cohort-echo-sonata-refresh.mjs';
import { buildProfileHorizontalCohort } from '../scripts/lib/profile-horizontal-cohort.mjs';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

async function loadJson(relativePath: string) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));
}

async function buildAppliedEchoRefresh() {
  const baseInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const modeRefresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
  const weaponRefresh = await loadJson('../data/research/profile-cohort-01-weapon-refresh-2026-08-30.json');
  const echoRefresh = await loadJson('../data/research/profile-cohort-01-echo-sonata-refresh-2026-08-30.json');
  const weaponManifest = await loadJson('../data/research/profile-horizontal-cohort-01-weapon-refresh-2026-08-30.json');

  const appliedMode = applyProfileModeContextRefresh(baseInput, modeRefresh);
  const appliedWeapon = applyProfileWeaponRefresh(appliedMode.input, weaponRefresh);
  const appliedEcho = applyProfileEchoSonataRefresh(appliedWeapon.input, echoRefresh);
  const manifest = buildEchoSonataCohortManifest(
    weaponManifest,
    echoRefresh,
    'data/research/profile-cohort-01-echo-sonata-refresh-2026-08-30.json',
  );
  return {baseInput, appliedMode, appliedWeapon, appliedEcho, echoRefresh, weaponManifest, manifest};
}

test('Cohort 01 Echo/Sonata refresh advances 17 of 20 modes without changing prior phase review', async () => {
  const {appliedEcho, manifest} = await buildAppliedEchoRefresh();
  assert.deepEqual(appliedEcho.summary, {
    entryCount: 20,
    reviewed: 17,
    blocked: 3,
    stagedEchoes: 17,
  });
  assert.equal(appliedEcho.verificationStatus, 'NOT_VERIFIED');
  assert.equal(appliedEcho.canonicalWriteAllowed, false);

  const candidateReview = buildProfileCandidateReview(appliedEcho.input);
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
  assert.deepEqual(cohort.phaseCounts.ECHO_SONATA, {
    sourceFieldsPresent: 17,
    sourceFieldsMissing: 3,
    reviewed: 17,
    blocked: 3,
    pendingReview: 0,
  });
  for (const phaseName of ['STATS_ER', 'SOURCE_ROTATION']) {
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

  const mode = (characterId: string, modeKey: string) => cohort.characters
    .find((row) => row.characterId === characterId)?.modes.find((row) => row.modeKey === modeKey);
  const lucillaChafe = mode('lucilla', 'glacio-chafe');
  const lucillaEcho = mode('lucilla', 'echo-skill');
  const lumiHybrid = mode('lumi', 'hybrid');
  const lumiMain = mode('lumi', 'main-dps');
  const yangyangSupport = mode('yangyang', 'support');
  const yangyangDamage = mode('yangyang', 'damage');
  const yinlinMoonlit = mode('yinlin', 'moonlit');
  const yinlinEmpyrean = mode('yinlin', 'empyrean');
  const brant = mode('brant', 'standard');
  const encore = mode('encore', 'standard');
  const jianxin = mode('jianxin', 'standard');
  assert.ok(lucillaChafe && lucillaEcho && lumiHybrid && lumiMain && yangyangSupport && yangyangDamage && yinlinMoonlit && yinlinEmpyrean && brant && encore && jianxin);

  assert.equal(lucillaChafe.phases.ECHO_SONATA.data.sonataSet, 'Wishes of Quiet Snowfall');
  assert.equal(lucillaChafe.phases.ECHO_SONATA.data.mainEcho, 'Glommoth');
  assert.equal(lucillaEcho.phases.ECHO_SONATA.data.sonataSet, 'Moonlit Clouds');
  assert.equal(lucillaEcho.phases.ECHO_SONATA.data.mainEcho, 'Impermanence Heron');
  assert.equal(lumiHybrid.phases.ECHO_SONATA.data.sonataSet, 'Moonlit Clouds');
  assert.equal(lumiMain.phases.ECHO_SONATA.data.sonataSet, 'Void Thunder');
  assert.equal(yangyangSupport.phases.ECHO_SONATA.data.sonataSet, 'Moonlit Clouds');
  assert.equal(yangyangDamage.phases.ECHO_SONATA.data.sonataSet, 'Sierra Gale');
  assert.equal(yinlinMoonlit.phases.ECHO_SONATA.data.sonataSet, 'Moonlit Clouds');
  assert.equal(yinlinEmpyrean.phases.ECHO_SONATA.data.sonataSet, 'Empyrean Anthem');

  for (const blocked of [brant, encore, jianxin]) {
    assert.equal(blocked.phases.ECHO_SONATA.data, null);
    assert.equal(blocked.phases.ECHO_SONATA.reviewState, 'BLOCKED');
  }

  for (const character of cohort.characters) {
    for (const stagedMode of character.modes) {
      assert.equal(stagedMode.phases.MODE_TEAM_CONTEXT.data.defaultCandidate, null);
      assert.equal(stagedMode.materializationCandidate.sourceData.defaultCandidate, null);
      const echo = stagedMode.phases.ECHO_SONATA.data;
      if (echo) {
        assert.equal(echo.costLayout.length, 5);
        assert.equal(echo.costLayout.reduce((sum: number, value: number) => sum + value, 0), 12);
        assert.equal(echo.mainStats.length, 5);
      }
    }
  }
});

test('Echo/Sonata refresh manifest is derived from weapon state without mutating its parent', async () => {
  const {weaponManifest, manifest} = await buildAppliedEchoRefresh();
  assert.ok(weaponManifest.autoParkMissingSourcePhases.includes('ECHO_SONATA'));
  assert.ok(!manifest.autoParkMissingSourcePhases.includes('ECHO_SONATA'));
  assert.deepEqual(manifest.autoParkMissingSourcePhases, ['STATS_ER', 'SOURCE_ROTATION']);
  assert.equal(manifest.sourceCheckpoint.repoMain, '219b35d256702f8d06ab164ac0d9227b5e58d9f9');
  assert.equal(manifest.sourceCheckpoint.echoSonataCheckedAt, '2026-08-30');
  assert.equal(manifest.phaseReviews['lucilla:glacio-chafe:ECHO_SONATA'].reviewState, 'REVIEWED');
  assert.equal(manifest.phaseReviews['brant:standard:ECHO_SONATA'].reviewState, 'BLOCKED');
  assert.equal(weaponManifest.phaseReviews['lucilla:glacio-chafe:ECHO_SONATA'], undefined);
});

test('Echo/Sonata refresh cannot overwrite data, write canonical truth, or accept invalid COST layouts', async () => {
  const {appliedWeapon, echoRefresh} = await buildAppliedEchoRefresh();

  const withEcho = structuredClone(appliedWeapon.input);
  withEcho.characters.find((character) => character.characterId === 'lucilla').modes.find((mode) => mode.key === 'glacio-chafe').echo = {
    sonataSet: 'Existing Set', mainEcho: 'Existing Echo', costLayout: [4, 3, 3, 1, 1], mainStats: ['A', 'B', 'C', 'D', 'E'], context: 'existing',
  };
  assert.throws(() => applyProfileEchoSonataRefresh(withEcho, echoRefresh), /base mode already has Echo\/Sonata data/);

  assert.throws(() => applyProfileEchoSonataRefresh(appliedWeapon.input, {
    ...echoRefresh,
    canonicalWriteAllowed: true,
  }), /canonicalWriteAllowed=false/);

  const invalidCost = structuredClone(echoRefresh);
  const reviewed = invalidCost.entries.find((entry) => entry.reviewState === 'REVIEWED');
  reviewed.echo.costLayout = [4, 4, 3, 1, 1];
  assert.throws(() => applyProfileEchoSonataRefresh(appliedWeapon.input, invalidCost), /must total COST 12/);
});

test('REVIEWED Echo/Sonata requires exact data and BLOCKED requires blockers with no partial staging', async () => {
  const {appliedWeapon, echoRefresh} = await buildAppliedEchoRefresh();

  const missingEcho = structuredClone(echoRefresh);
  missingEcho.entries.find((entry) => entry.reviewState === 'REVIEWED').echo = null;
  assert.throws(() => applyProfileEchoSonataRefresh(appliedWeapon.input, missingEcho), /REVIEWED requires exact Echo\/Sonata data/);

  const missingBlocker = structuredClone(echoRefresh);
  missingBlocker.entries.find((entry) => entry.reviewState === 'BLOCKED').blockers = [];
  assert.throws(() => applyProfileEchoSonataRefresh(appliedWeapon.input, missingBlocker), /BLOCKED requires at least one blocker/);

  const partialBlocked = structuredClone(echoRefresh);
  const blocked = partialBlocked.entries.find((entry) => entry.reviewState === 'BLOCKED');
  blocked.echo = structuredClone(echoRefresh.entries.find((entry) => entry.reviewState === 'REVIEWED').echo);
  assert.throws(() => applyProfileEchoSonataRefresh(appliedWeapon.input, partialBlocked), /BLOCKED must not stage a partial Echo\/Sonata recommendation/);
});
