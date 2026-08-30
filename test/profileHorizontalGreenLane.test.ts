import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

import {
  PROFILE_HORIZONTAL_GREEN_LANE_ECHOES,
  PROFILE_HORIZONTAL_GREEN_LANE_META,
  PROFILE_HORIZONTAL_GREEN_LANE_PRESETS,
  PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS,
  PROFILE_HORIZONTAL_GREEN_LANE_STATS,
  PROFILE_HORIZONTAL_GREEN_LANE_TEAMS,
  PROFILE_HORIZONTAL_GREEN_LANE_WEAPONS,
} from '../src/data/profileHorizontalGreenLane20260830.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';

async function loadReview() {
  return JSON.parse(await readFile(new URL('../data/research/profile-horizontal-semantic-review-2026-08-30.json', import.meta.url), 'utf8'));
}

const EXPECTED_APPROVED_CHARACTER_IDS = [
  'jiyan',
  'lingyang',
  'lucy',
  'lupa',
  'mortefi',
  'phrolova',
  'qiuyuan',
  'rebecca',
  'roccia',
  'rover-spectro',
  'sanhua',
  'taoqi',
  'youhu',
] as const;

test('horizontal semantic review explicitly closes 13 profiles and parks 11 ambiguities', async () => {
  const review = await loadReview();
  const approved = review.entries.filter((entry) => entry.decision === 'APPROVED_FOR_CANONICAL_VERIFIED');
  const parked = review.entries.filter((entry) => entry.decision === 'PARKED_SEMANTIC_AMBIGUITY');

  assert.equal(review.semanticReviewRequired, true);
  assert.equal(review.automationMayApproveSemanticTruth, false);
  assert.equal(review.summary.reviewedCharacterCount, 24);
  assert.equal(approved.length, 13);
  assert.equal(parked.length, 11);
  assert.deepEqual(approved.map((entry) => entry.characterId).sort(), [...EXPECTED_APPROVED_CHARACTER_IDS].sort());
  assert.ok(approved.every((entry) => entry.sourceComplete === true && entry.isDefault === true && entry.blockers.length === 0));
  assert.ok(parked.every((entry) => entry.sourceComplete === false && entry.isDefault === null && entry.candidateIds === null && entry.blockers.length > 0));
});

test('horizontal canonical package preserves reviewed source-only contracts', () => {
  const catalogs = [
    PROFILE_HORIZONTAL_GREEN_LANE_WEAPONS,
    PROFILE_HORIZONTAL_GREEN_LANE_ECHOES,
    PROFILE_HORIZONTAL_GREEN_LANE_STATS,
    PROFILE_HORIZONTAL_GREEN_LANE_TEAMS,
    PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS,
    PROFILE_HORIZONTAL_GREEN_LANE_PRESETS,
  ];

  assert.equal(PROFILE_HORIZONTAL_GREEN_LANE_META.approvedModeCount, 13);
  assert.equal(PROFILE_HORIZONTAL_GREEN_LANE_META.approvedCharacterCount, 13);
  assert.equal(PROFILE_HORIZONTAL_GREEN_LANE_META.semanticReviewRequired, true);
  assert.equal(PROFILE_HORIZONTAL_GREEN_LANE_META.automationApprovedSemanticTruth, false);
  assert.equal(PROFILE_HORIZONTAL_GREEN_LANE_META.rotationsRemainSourceSequenceOnly, true);
  assert.ok(catalogs.every((rows) => rows.length === 13));
  assert.ok(catalogs.flat().every((row) => row.verificationStatus === 'VERIFIED'));

  assert.deepEqual(
    PROFILE_HORIZONTAL_GREEN_LANE_PRESETS.map((preset) => preset.characterId).sort(),
    [...EXPECTED_APPROVED_CHARACTER_IDS].sort(),
  );
  assert.ok(PROFILE_HORIZONTAL_GREEN_LANE_PRESETS.every((preset) => preset.isDefault && preset.uiSelectable));
  assert.ok(PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS.every((rotation) =>
    rotation.executionStatus === 'SOURCE_SEQUENCE_ONLY'
    && !Object.hasOwn(rotation, 'rotationSeconds')
    && !Object.hasOwn(rotation, 'engineModelId')
  ));

  const ranks = new Map(PROFILE_HORIZONTAL_GREEN_LANE_WEAPONS.map((profile) => [profile.characterId, profile.options[0]?.rank]));
  assert.equal(ranks.get('taoqi'), 5);
  assert.equal(ranks.get('youhu'), 5);
  for (const characterId of EXPECTED_APPROVED_CHARACTER_IDS.filter((id) => id !== 'taoqi' && id !== 'youhu')) {
    assert.equal(ranks.get(characterId), 1, `${characterId} source weapon rank drifted`);
  }

  const lingyangEcho = PROFILE_HORIZONTAL_GREEN_LANE_ECHOES.find((profile) => profile.characterId === 'lingyang');
  assert.deepEqual(lingyangEcho?.sonataSetIds, ['sonata-9']);
});

test('horizontal presets resolve through the canonical registry as fully verified packages', () => {
  for (const preset of PROFILE_HORIZONTAL_GREEN_LANE_PRESETS) {
    const resolved = resolveBuildPreset(PROFILE_REGISTRY, preset.id);
    assert.equal(resolved.preset.verificationStatus, 'VERIFIED');
    assert.equal(resolved.weaponRecommendation.verificationStatus, 'VERIFIED');
    assert.equal(resolved.echoLoadout.verificationStatus, 'VERIFIED');
    assert.equal(resolved.statTarget.verificationStatus, 'VERIFIED');
    assert.equal(resolved.team.verificationStatus, 'VERIFIED');
    assert.equal(resolved.rotation.verificationStatus, 'VERIFIED');
    assert.equal(resolved.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  }
});
