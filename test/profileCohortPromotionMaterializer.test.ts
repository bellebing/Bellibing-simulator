import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

import { applyProfileModeContextRefresh } from '../scripts/lib/profile-cohort-mode-context-refresh.mjs';
import { applyProfileWeaponRefresh } from '../scripts/lib/profile-cohort-weapon-refresh.mjs';
import { applyProfileEchoSonataRefresh } from '../scripts/lib/profile-cohort-echo-sonata-refresh.mjs';
import { applyProfileStatsErRefresh } from '../scripts/lib/profile-cohort-stats-er-refresh.mjs';
import { applyProfileSourceRotationRefresh } from '../scripts/lib/profile-cohort-source-rotation-refresh.mjs';
import { materializeApprovedProfileModes } from '../scripts/lib/profile-cohort-promotion-materializer.mjs';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_CATALOG } from '../src/data/sonatas.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import {
  PROFILE_COHORT_01_GREEN_LANE_ECHOES,
  PROFILE_COHORT_01_GREEN_LANE_PRESETS,
  PROFILE_COHORT_01_GREEN_LANE_ROTATIONS,
  PROFILE_COHORT_01_GREEN_LANE_STATS,
  PROFILE_COHORT_01_GREEN_LANE_TEAMS,
  PROFILE_COHORT_01_GREEN_LANE_WEAPONS,
} from '../src/data/profileCohort01GreenLane20260830.ts';

async function loadJson(relativePath: string) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));
}

async function materializedFromReviewedSourceChain() {
  const base = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const mode = await loadJson('../data/research/profile-cohort-01-mode-context-refresh-2026-08-30.json');
  const weapon = await loadJson('../data/research/profile-cohort-01-weapon-refresh-2026-08-30.json');
  const echo = await loadJson('../data/research/profile-cohort-01-echo-sonata-refresh-2026-08-30.json');
  const stats = await loadJson('../data/research/profile-cohort-01-stats-er-refresh-2026-08-30.json');
  const rotation = await loadJson('../data/research/profile-cohort-01-source-rotation-refresh-2026-08-30.json');
  const semantic = await loadJson('../data/research/profile-cohort-01-semantic-promotion-review-2026-08-30.json');

  const appliedMode = applyProfileModeContextRefresh(base, mode);
  const appliedWeapon = applyProfileWeaponRefresh(appliedMode.input, weapon);
  const appliedEcho = applyProfileEchoSonataRefresh(appliedWeapon.input, echo);
  const appliedStats = applyProfileStatsErRefresh(appliedEcho.input, stats);
  const appliedRotation = applyProfileSourceRotationRefresh(appliedStats.input, rotation);

  return materializeApprovedProfileModes(appliedRotation.input, semantic, {
    characters: CHARACTER_CATALOG,
    weapons: WEAPON_CATALOG,
    echoes: ECHO_CATALOG,
    sonatas: SONATA_CATALOG,
  });
}

function coreWeapon(row) {
  return [row.id, row.characterId, row.defaultWeaponId, row.options.map((option) => [option.weaponId, option.rank])];
}

function coreEcho(row) {
  return [
    row.id,
    row.characterId,
    row.sonataSetIds,
    row.mainEchoId,
    row.slots.map((slot) => [slot.cost, slot.primaryMainStats.map((stat) => [stat.stat, stat.priority])]),
  ];
}

function coreStats(row) {
  return [
    row.id,
    row.characterId,
    row.targetRules.map((rule) => [rule.stat, rule.priority]),
    row.gates.map((gate) => [gate.stat, gate.minimum, gate.preferred ?? null]),
  ];
}

function coreTeam(row) {
  return [row.id, row.members.map((member) => [member.characterId, member.role])];
}

function coreRotation(row) {
  return [
    row.id,
    row.characterId,
    row.teamProfileId,
    row.executionStatus,
    row.sourceSequence,
    row.variantKey,
    row.modeledMechanicFactIds,
    row.assumedMechanicFactIds,
  ];
}

function corePreset(row) {
  return [
    row.id,
    row.characterId,
    row.modeKey,
    row.isDefault,
    row.uiSelectable,
    row.weaponRecommendationProfileId,
    row.echoLoadoutProfileId,
    row.statTargetProfileId,
    row.teamProfileId,
    row.rotationProfileId,
  ];
}

test('promotion automation reproduces the canonical seven-profile core from reviewed source data', async () => {
  const generated = await materializedFromReviewedSourceChain();
  assert.equal(generated.meta.approvedModeCount, 7);
  assert.equal(generated.meta.approvedCharacterCount, 7);
  assert.equal(generated.meta.automationApprovedSemanticTruth, false);
  assert.equal(generated.meta.rotationsRemainSourceSequenceOnly, true);

  assert.deepEqual(generated.weaponRecommendations.map(coreWeapon), PROFILE_COHORT_01_GREEN_LANE_WEAPONS.map(coreWeapon));
  assert.deepEqual(generated.echoLoadouts.map(coreEcho), PROFILE_COHORT_01_GREEN_LANE_ECHOES.map(coreEcho));
  assert.deepEqual(generated.statTargets.map(coreStats), PROFILE_COHORT_01_GREEN_LANE_STATS.map(coreStats));
  assert.deepEqual(generated.teams.map(coreTeam), PROFILE_COHORT_01_GREEN_LANE_TEAMS.map(coreTeam));
  assert.deepEqual(generated.rotations.map(coreRotation), PROFILE_COHORT_01_GREEN_LANE_ROTATIONS.map(coreRotation));
  assert.deepEqual(generated.presets.map(corePreset), PROFILE_COHORT_01_GREEN_LANE_PRESETS.map(corePreset));
});

test('promotion materializer refuses to approve truth or executable timing by automation', async () => {
  const base = await loadJson('../data/research/profile-source-roster-2026-08-29.json');
  const semantic = await loadJson('../data/research/profile-cohort-01-semantic-promotion-review-2026-08-30.json');
  const catalogs = {characters: CHARACTER_CATALOG, weapons: WEAPON_CATALOG, echoes: ECHO_CATALOG, sonatas: SONATA_CATALOG};

  assert.throws(
    () => materializeApprovedProfileModes(base, {...semantic, automationMayApproveSemanticTruth: true}, catalogs),
    /explicitly forbid automation from approving truth/,
  );

  const invalidSemantic = structuredClone(semantic);
  const lumi = invalidSemantic.entries.find((entry) => entry.characterId === 'lumi' && entry.modeKey === 'hybrid');
  lumi.blockers = ['invented'];
  assert.throws(
    () => materializeApprovedProfileModes(base, invalidSemantic, catalogs),
    /approved modes require sourceComplete=true, explicit isDefault, and zero blockers/,
  );
});
