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
  return {baseInput, appliedMode, appliedWeapon, appliedEcho, appliedStats, statsRefresh, echoManifest, manifest};
}

test('Cohort 01 stats/ER refresh advances 19 of 20 modes while preserving prior phase dispositions', async () => {
  const {appliedStats, manifest} = await buildAppliedStatsRefresh();
  assert.deepEqual(appliedStats.summary, {
    entryCount: 20,
    reviewed: 19,
    blocked: 1,
    stagedStats: 19,
    numericEr: 13,
    intentionallyNullEr: 6,
  });
  assert.equal(appliedStats.verificationStatus, 'NOT_VERIFIED');
  assert.equal(appliedStats.canonicalWriteAllowed, false);

  const candidateReview = buildProfileCandidateReview(appliedStats.input);
  const readiness = auditProfileReadiness();
  const cohort = buildProfileHorizontalCohort(candidateReview, manifest, readiness.profileSourcePendingIds);

  assert.deepEqual(cohort.phaseCounts.MODE_TEAM_CONTEXT, {sourceFieldsPresent:10,sourceFieldsMissing:10,reviewed:10,blocked:10,pendingReview:0});
  assert.deepEqual(cohort.phaseCounts.WEAPON, {sourceFieldsPresent:18,sourceFieldsMissing:2,reviewed:18,blocked:2,pendingReview:0});
  assert.deepEqual(cohort.phaseCounts.ECHO_SONATA, {sourceFieldsPresent:17,sourceFieldsMissing:3,reviewed:17,blocked:3,pendingReview:0});
  assert.deepEqual(cohort.phaseCounts.STATS_ER, {sourceFieldsPresent:19,sourceFieldsMissing:1,reviewed:19,blocked:1,pendingReview:0});
  assert.deepEqual(cohort.phaseCounts.SOURCE_ROTATION, {sourceFieldsPresent:0,sourceFieldsMissing:20,reviewed:0,blocked:20,pendingReview:0});
  assert.equal(cohort.phaseCounts.EXECUTION_ADAPTERS.pendingReview, 20);
  assert.equal(cohort.phaseCounts.PROMOTION_FREEZE.pendingReview, 20);
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
  const roverQuick = mode('rover-havoc', 'quickswap');
  const yangyangSupport = mode('yangyang', 'support');
  const yangyangDamage = mode('yangyang', 'damage');
  const yinlinMoonlit = mode('yinlin', 'moonlit');
  const yinlinEmpyrean = mode('yinlin', 'empyrean');
  const brant = mode('brant', 'standard');
  const encore = mode('encore', 'standard');
  const jianxin = mode('jianxin', 'standard');
  assert.ok(lucillaChafe && lucillaEcho && lumiHybrid && lumiMain && roverQuick && yangyangSupport && yangyangDamage && yinlinMoonlit && yinlinEmpyrean && brant && encore && jianxin);

  assert.deepEqual(lucillaChafe.phases.STATS_ER.data.erBand, {minimum:1,preferred:1,maximum:1,context:'Source endgame target is 100% Energy Regen; Lucilla does not prioritize ER substats.'});
  assert.ok(lucillaChafe.phases.STATS_ER.data.priority.includes('Basic DMG%'));
  assert.ok(!lucillaEcho.phases.STATS_ER.data.priority.includes('Basic DMG%'));
  assert.equal(lumiHybrid.phases.STATS_ER.data.erBand?.minimum, 1.42);
  assert.equal(lumiMain.phases.STATS_ER.data.erBand, null);
  assert.equal(roverQuick.phases.STATS_ER.data.erBand, null);
  assert.equal(yangyangSupport.phases.STATS_ER.data.erBand, null);
  assert.equal(yangyangDamage.phases.STATS_ER.data.erBand, null);
  assert.equal(yinlinMoonlit.phases.STATS_ER.data.erBand?.minimum, 1.28);
  assert.equal(yinlinEmpyrean.phases.STATS_ER.data.erBand, null);
  assert.deepEqual(brant.phases.STATS_ER.data.erBand, {minimum:2.5,preferred:null,maximum:2.8,context:'Source endgame recommendation is 250%-280%; ER is prioritized to 250%, then CRIT, with additional ER still valuable above 250%.'});
  assert.match(brant.phases.STATS_ER.data.notes.join(' '), /does not itself choose Tidebreaking Courage/);
  assert.equal(encore.phases.STATS_ER.data.erBand?.minimum, 1.05);
  assert.equal(encore.phases.STATS_ER.data.erBand?.maximum, 1.3);
  assert.equal(jianxin.phases.STATS_ER.data, null);
  assert.equal(jianxin.phases.STATS_ER.reviewState, 'BLOCKED');

  let numericEr = 0;
  let intentionallyNullEr = 0;
  for (const character of cohort.characters) {
    for (const stagedMode of character.modes) {
      assert.equal(stagedMode.phases.MODE_TEAM_CONTEXT.data.defaultCandidate, null);
      assert.equal(stagedMode.materializationCandidate.sourceData.defaultCandidate, null);
      assert.equal(stagedMode.phases.STATS_ER.data?.numericErInvented, false);
      if (stagedMode.phases.STATS_ER.reviewState === 'REVIEWED') {
        assert.ok(stagedMode.phases.STATS_ER.data.priority.length > 0);
        if (stagedMode.phases.STATS_ER.data.erBand == null) intentionallyNullEr += 1;
        else numericEr += 1;
      }
    }
  }
  assert.equal(numericEr, 13);
  assert.equal(intentionallyNullEr, 6);
});

test('stats/ER manifest is derived from Echo state without mutating the parent and leaves only rotation parked', async () => {
  const {echoManifest, manifest} = await buildAppliedStatsRefresh();
  assert.ok(echoManifest.autoParkMissingSourcePhases.includes('STATS_ER'));
  assert.deepEqual(manifest.autoParkMissingSourcePhases, ['SOURCE_ROTATION']);
  assert.equal(manifest.sourceCheckpoint.repoMain, '4a1b11937db48a41ffb2fc1419c85fe72fb302f3');
  assert.equal(manifest.sourceCheckpoint.statsErCheckedAt, '2026-08-30');
  assert.equal(manifest.phaseReviews['brant:standard:STATS_ER'].reviewState, 'REVIEWED');
  assert.equal(manifest.phaseReviews['jianxin:standard:STATS_ER'].reviewState, 'BLOCKED');
  assert.equal(echoManifest.phaseReviews['brant:standard:STATS_ER'], undefined);
});

test('stats/ER refresh cannot overwrite data, write canonical truth, or accept invalid ranges', async () => {
  const {appliedEcho, statsRefresh} = await buildAppliedStatsRefresh();

  const withStats = structuredClone(appliedEcho.input);
  withStats.characters.find((character) => character.characterId === 'lucilla').modes.find((mode) => mode.key === 'glacio-chafe').stats = {
    priority:['Existing'],relations:[],erBand:null,notes:[],
  };
  assert.throws(() => applyProfileStatsErRefresh(withStats, statsRefresh), /base mode already has stats data/);

  assert.throws(() => applyProfileStatsErRefresh(appliedEcho.input, {...statsRefresh, canonicalWriteAllowed:true}), /canonicalWriteAllowed=false/);

  const invalidRange = structuredClone(statsRefresh);
  const brant = invalidRange.entries.find((entry) => entry.characterId === 'brant');
  brant.stats.erBand.minimum = 3.0;
  assert.throws(() => applyProfileStatsErRefresh(appliedEcho.input, invalidRange), /minimum cannot exceed maximum/);
});

test('REVIEWED stats requires priority while BLOCKED requires blockers and no partial stats object', async () => {
  const {appliedEcho, statsRefresh} = await buildAppliedStatsRefresh();

  const missingPriority = structuredClone(statsRefresh);
  missingPriority.entries.find((entry) => entry.reviewState === 'REVIEWED').stats.priority = [];
  assert.throws(() => applyProfileStatsErRefresh(appliedEcho.input, missingPriority), /priority must contain at least one/);

  const missingBlocker = structuredClone(statsRefresh);
  missingBlocker.entries.find((entry) => entry.reviewState === 'BLOCKED').blockers = [];
  assert.throws(() => applyProfileStatsErRefresh(appliedEcho.input, missingBlocker), /BLOCKED requires at least one blocker/);

  const partialBlocked = structuredClone(statsRefresh);
  const blocked = partialBlocked.entries.find((entry) => entry.reviewState === 'BLOCKED');
  blocked.stats = structuredClone(statsRefresh.entries.find((entry) => entry.reviewState === 'REVIEWED').stats);
  assert.throws(() => applyProfileStatsErRefresh(appliedEcho.input, partialBlocked), /BLOCKED must not stage a partial stats recommendation/);
});
