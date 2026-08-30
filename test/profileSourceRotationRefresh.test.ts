import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { buildProfileCandidateReview } from '../scripts/lib/profile-candidate-review.mjs';
import { applyProfileModeContextRefresh } from '../scripts/lib/profile-cohort-mode-context-refresh.mjs';
import { applyProfileWeaponRefresh } from '../scripts/lib/profile-cohort-weapon-refresh.mjs';
import { applyProfileEchoSonataRefresh, buildEchoSonataCohortManifest } from '../scripts/lib/profile-cohort-echo-sonata-refresh.mjs';
import { applyProfileStatsErRefresh, buildStatsErCohortManifest } from '../scripts/lib/profile-cohort-stats-er-refresh.mjs';
import { applyProfileSourceRotationRefresh, buildSourceRotationCohortManifest } from '../scripts/lib/profile-cohort-source-rotation-refresh.mjs';
import { buildProfileHorizontalCohort } from '../scripts/lib/profile-horizontal-cohort.mjs';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

async function loadJson(relativePath: string) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));
}

async function buildAppliedRotationRefresh() {
  const baseInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const modeRefresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
  const weaponRefresh = await loadJson('../data/research/profile-cohort-01-weapon-refresh-2026-08-30.json');
  const echoRefresh = await loadJson('../data/research/profile-cohort-01-echo-sonata-refresh-2026-08-30.json');
  const statsRefresh = await loadJson('../data/research/profile-cohort-01-stats-er-refresh-2026-08-30.json');
  const rotationRefresh = await loadJson('../data/research/profile-cohort-01-source-rotation-refresh-2026-08-30.json');
  const weaponManifest = await loadJson('../data/research/profile-horizontal-cohort-01-weapon-refresh-2026-08-30.json');

  const appliedMode = applyProfileModeContextRefresh(baseInput, modeRefresh);
  const appliedWeapon = applyProfileWeaponRefresh(appliedMode.input, weaponRefresh);
  const appliedEcho = applyProfileEchoSonataRefresh(appliedWeapon.input, echoRefresh);
  const echoManifest = buildEchoSonataCohortManifest(weaponManifest, echoRefresh, 'data/research/profile-cohort-01-echo-sonata-refresh-2026-08-30.json');
  const appliedStats = applyProfileStatsErRefresh(appliedEcho.input, statsRefresh);
  const statsManifest = buildStatsErCohortManifest(echoManifest, statsRefresh, 'data/research/profile-cohort-01-stats-er-refresh-2026-08-30.json');
  const appliedRotation = applyProfileSourceRotationRefresh(appliedStats.input, rotationRefresh);
  const manifest = buildSourceRotationCohortManifest(statsManifest, rotationRefresh, 'data/research/profile-cohort-01-source-rotation-refresh-2026-08-30.json');
  return {appliedStats, appliedRotation, rotationRefresh, statsManifest, manifest};
}

test('Cohort 01 Source Rotation refresh closes source extraction for the ten green-lane modes', async () => {
  const {appliedRotation, manifest} = await buildAppliedRotationRefresh();
  assert.deepEqual(appliedRotation.summary, {entryCount: 20, reviewed: 10, blocked: 10, stagedRotations: 10});
  assert.deepEqual(manifest.autoParkMissingSourcePhases, []);
  assert.equal(appliedRotation.verificationStatus, 'NOT_VERIFIED');
  assert.equal(appliedRotation.canonicalWriteAllowed, false);

  const candidateReview = buildProfileCandidateReview(appliedRotation.input);
  const readiness = auditProfileReadiness();
  const cohort = buildProfileHorizontalCohort(candidateReview, manifest, readiness.profileSourcePendingIds);
  assert.deepEqual(cohort.phaseCounts.SOURCE_ROTATION, {
    sourceFieldsPresent: 10,
    sourceFieldsMissing: 10,
    reviewed: 10,
    blocked: 10,
    pendingReview: 0,
  });

  const greenKeys = new Set([
    'lucilla:glacio-chafe', 'lucilla:echo-skill', 'lumi:hybrid', 'rover-havoc:quickswap', 'yinlin:moonlit',
    'calcharo:standard', 'cantarella:standard', 'carlotta:standard', 'changli:standard', 'chisa:standard',
  ]);
  for (const character of cohort.characters) {
    for (const mode of character.modes) {
      const key = `${character.characterId}:${mode.modeKey}`;
      if (greenKeys.has(key)) {
        assert.equal(mode.phases.SOURCE_ROTATION.reviewState, 'REVIEWED');
        assert.equal(mode.phases.SOURCE_ROTATION.data.executionStatus, 'SOURCE_SEQUENCE_ONLY');
        assert.ok(mode.phases.SOURCE_ROTATION.data.sequence.length > 0);
        assert.equal(mode.materializationCandidate.materializationStatus, 'DRAFT_READY_FOR_SEMANTIC_REVIEW');
      } else {
        assert.equal(mode.phases.SOURCE_ROTATION.reviewState, 'BLOCKED');
        assert.equal(mode.materializationCandidate.materializationStatus, 'BLOCKED_BY_MISSING_SOURCE_FIELDS');
      }
    }
  }

  const lucillaEcho = cohort.characters.find((row) => row.characterId === 'lucilla')?.modes.find((row) => row.modeKey === 'echo-skill');
  assert.ok(lucillaEcho?.phases.SOURCE_ROTATION.data.sequence.some((step) => step.includes('Impermanence Heron')));
  const rover = cohort.characters.find((row) => row.characterId === 'rover-havoc')?.modes.find((row) => row.modeKey === 'quickswap');
  assert.equal(rover?.phases.STATS_ER.data.erBand, null);
  assert.ok(rover?.phases.SOURCE_ROTATION.data.sequence.some((step) => step.includes('Dreamless')));
  const chisa = cohort.characters.find((row) => row.characterId === 'chisa')?.modes.find((row) => row.modeKey === 'standard');
  assert.ok(chisa?.phases.SOURCE_ROTATION.data.sequence.some((step) => step.includes('Fallacy')));
});

test('Source Rotation refresh never stages executable timing or engine ownership', async () => {
  const {appliedRotation} = await buildAppliedRotationRefresh();
  for (const character of appliedRotation.input.characters) {
    for (const mode of character.modes) {
      if (!mode.rotation) continue;
      assert.equal(mode.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
      assert.equal(mode.rotation.rotationSeconds, undefined);
      assert.equal(mode.rotation.uptime, undefined);
      assert.equal(mode.rotation.engineModelId, undefined);
    }
  }
});

test('Source Rotation refresh rejects overwrite, executable claims and partial blocked rows', async () => {
  const {appliedStats, rotationRefresh} = await buildAppliedRotationRefresh();

  const overwrite = structuredClone(appliedStats.input);
  overwrite.characters.find((character) => character.characterId === 'lucilla').modes.find((mode) => mode.key === 'glacio-chafe').rotation = {sequence: ['Intro']};
  assert.throws(() => applyProfileSourceRotationRefresh(overwrite, rotationRefresh), /base mode already has rotation data/);

  const executable = structuredClone(rotationRefresh);
  executable.entries.find((entry) => entry.characterId === 'lucilla').rotation.executionStatus = 'ENGINE_MODELED';
  assert.throws(() => applyProfileSourceRotationRefresh(appliedStats.input, executable), /must remain SOURCE_SEQUENCE_ONLY/);

  const timing = structuredClone(rotationRefresh);
  timing.entries.find((entry) => entry.characterId === 'lumi' && entry.modeKey === 'hybrid').rotation.rotationSeconds = 20;
  assert.throws(() => applyProfileSourceRotationRefresh(appliedStats.input, timing), /may not stage executable timing/);

  const partialBlocked = structuredClone(rotationRefresh);
  partialBlocked.entries.find((entry) => entry.characterId === 'brant').rotation = structuredClone(rotationRefresh.entries.find((entry) => entry.characterId === 'lucilla').rotation);
  assert.throws(() => applyProfileSourceRotationRefresh(appliedStats.input, partialBlocked), /BLOCKED must not stage a partial rotation/);
});
