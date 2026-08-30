import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { buildProfileCandidateReview } from '../scripts/lib/profile-candidate-review.mjs';
import { applyProfileModeContextRefresh } from '../scripts/lib/profile-cohort-mode-context-refresh.mjs';
import { applyProfileWeaponRefresh } from '../scripts/lib/profile-cohort-weapon-refresh.mjs';
import { applyProfileEchoSonataRefresh, buildEchoSonataCohortManifest } from '../scripts/lib/profile-cohort-echo-sonata-refresh.mjs';
import { applyProfileStatsErRefresh, buildStatsErCohortManifest } from '../scripts/lib/profile-cohort-stats-er-refresh.mjs';
import { buildProfileHorizontalCohort } from '../scripts/lib/profile-horizontal-cohort.mjs';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

async function loadJson(relativePath: string) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));
}

async function buildAppliedStatsRefresh() {
  const baseInput = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const modeRefresh = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
  const weaponRefresh = await loadJson('../data/research/profile-cohort-01-weapon-refresh-2026-08-30.json');
  const echoRefresh = await loadJson('../data/research/profile-cohort-01-echo-sonata-refresh-2026-08-30.json');
  const statsRefresh = await loadJson('../data/research/profile-cohort-01-stats-er-refresh-2026-08-30.json');
  const weaponManifest = await loadJson('../data/research/profile-horizontal-cohort-01-weapon-refresh-2026-08-30.json');

  const appliedMode = applyProfileModeContextRefresh(baseInput, modeRefresh);
  const appliedWeapon = applyProfileWeaponRefresh(appliedMode.input, weaponRefresh);
  const appliedEcho = applyProfileEchoSonataRefresh(appliedWeapon.input, echoRefresh);
  const echoManifest = buildEchoSonataCohortManifest(
    weaponManifest,
    echoRefresh,
    'data/research/profile-cohort-01-echo-sonata-refresh-2026-08-30.json',
  );
  const appliedStats = applyProfileStatsErRefresh(appliedEcho.input, statsRefresh);
  const manifest = buildStatsErCohortManifest(
    echoManifest,
    statsRefresh,
    'data/research/profile-cohort-01-stats-er-refresh-2026-08-30.json',
  );
  return {appliedEcho, appliedStats, statsRefresh, echoManifest, manifest};
}

test('Cohort 01 Stats/ER refresh advances exactly the ten green-lane modes', async () => {
  const {appliedStats, manifest} = await buildAppliedStatsRefresh();
  assert.deepEqual(appliedStats.summary, {
    entryCount: 20,
    reviewed: 10,
    blocked: 10,
    stagedStats: 10,
    numericErBands: 8,
  });
  assert.equal(appliedStats.verificationStatus, 'NOT_VERIFIED');
  assert.equal(appliedStats.canonicalWriteAllowed, false);

  const candidateReview = buildProfileCandidateReview(appliedStats.input);
  const readiness = auditProfileReadiness();
  const cohort = buildProfileHorizontalCohort(candidateReview, manifest, readiness.profileSourcePendingIds);
  assert.deepEqual(cohort.phaseCounts.STATS_ER, {
    sourceFieldsPresent: 10,
    sourceFieldsMissing: 10,
    reviewed: 10,
    blocked: 10,
    pendingReview: 0,
  });
  assert.deepEqual(cohort.phaseCounts.SOURCE_ROTATION, {
    sourceFieldsPresent: 0,
    sourceFieldsMissing: 20,
    reviewed: 0,
    blocked: 20,
    pendingReview: 0,
  });
  assert.deepEqual(manifest.autoParkMissingSourcePhases, ['SOURCE_ROTATION']);
  assert.equal(manifest.phaseReviews['lucilla:glacio-chafe:STATS_ER'].reviewState, 'REVIEWED');
  assert.equal(manifest.phaseReviews['brant:standard:STATS_ER'].reviewState, 'BLOCKED');
  assert.equal(manifest.phaseReviews['chixia:standard:STATS_ER'].reviewState, 'BLOCKED');

  const mode = (characterId: string, modeKey: string) => cohort.characters
    .find((row) => row.characterId === characterId)?.modes.find((row) => row.modeKey === modeKey);
  assert.equal(mode('lucilla', 'glacio-chafe')?.phases.STATS_ER.data.erBand.minimum, 1);
  assert.equal(mode('lumi', 'hybrid')?.phases.STATS_ER.data.erBand.minimum, 1.42);
  assert.equal(mode('yinlin', 'moonlit')?.phases.STATS_ER.data.erBand.minimum, 1.28);
  assert.equal(mode('calcharo', 'standard')?.phases.STATS_ER.data.erBand.minimum, 1.2);
  assert.equal(mode('carlotta', 'standard')?.phases.STATS_ER.data.erBand.minimum, 1.08);
  assert.equal(mode('changli', 'standard')?.phases.STATS_ER.data.erBand.minimum, 1.08);
  assert.equal(mode('chisa', 'standard')?.phases.STATS_ER.data.erBand.minimum, 1.25);
  assert.equal(mode('rover-havoc', 'quickswap')?.phases.STATS_ER.data.erBand, null);
  assert.equal(mode('cantarella', 'standard')?.phases.STATS_ER.data.erBand, null);
  assert.equal(mode('brant', 'standard')?.phases.STATS_ER.data, null);

  for (const character of cohort.characters) {
    for (const stagedMode of character.modes) {
      assert.equal(stagedMode.phases.STATS_ER.data?.numericErInvented ?? false, false);
      assert.equal(stagedMode.phases.SOURCE_ROTATION.reviewState, 'BLOCKED');
    }
  }
});

test('Stats/ER refresh manifest derives from Echo/Sonata state without mutating its parent', async () => {
  const {echoManifest, manifest} = await buildAppliedStatsRefresh();
  assert.ok(echoManifest.autoParkMissingSourcePhases.includes('STATS_ER'));
  assert.deepEqual(manifest.autoParkMissingSourcePhases, ['SOURCE_ROTATION']);
  assert.equal(manifest.sourceCheckpoint.repoMain, '4a1b11937db48a41ffb2fc1419c85fe72fb302f3');
  assert.equal(manifest.sourceCheckpoint.statsErCheckedAt, '2026-08-30');
  assert.equal(echoManifest.phaseReviews['lucilla:glacio-chafe:STATS_ER'], undefined);
});

test('Stats/ER refresh rejects invented/invalid numeric ER, overwrites, and partial blocked rows', async () => {
  const {appliedEcho, statsRefresh} = await buildAppliedStatsRefresh();

  const withStats = structuredClone(appliedEcho.input);
  withStats.characters.find((character) => character.characterId === 'lucilla').modes.find((mode) => mode.key === 'glacio-chafe').stats = {
    priority: ['CRIT Rate'], relations: [], erBand: null, notes: [],
  };
  assert.throws(() => applyProfileStatsErRefresh(withStats, statsRefresh), /base mode already has Stats\/ER data/);

  const invalidEr = structuredClone(statsRefresh);
  invalidEr.entries.find((entry) => entry.characterId === 'lumi' && entry.modeKey === 'hybrid').stats.erBand.minimum = 0;
  assert.throws(() => applyProfileStatsErRefresh(appliedEcho.input, invalidEr), /ratios must be positive finite numbers/);

  const emptyEr = structuredClone(statsRefresh);
  emptyEr.entries.find((entry) => entry.characterId === 'lumi' && entry.modeKey === 'hybrid').stats.erBand = {
    minimum: null, preferred: null, maximum: null, context: 'not enough source evidence',
  };
  assert.throws(() => applyProfileStatsErRefresh(appliedEcho.input, emptyEr), /at least one source-backed numeric ER ratio/);

  const partialBlocked = structuredClone(statsRefresh);
  const blocked = partialBlocked.entries.find((entry) => entry.characterId === 'brant');
  blocked.stats = structuredClone(statsRefresh.entries.find((entry) => entry.characterId === 'lucilla').stats);
  assert.throws(() => applyProfileStatsErRefresh(appliedEcho.input, partialBlocked), /BLOCKED must not stage partial Stats\/ER data/);
});
