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
} from '../src/data/profileHorizontalGreenLane20260831/index.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';

const EXPECTED_APPROVED_CHARACTER_IDS = [
  'chixia',
  'encore',
  'lucilla',
  'mornye',
  'rover-havoc',
  'yangyang',
] as const;

const EXPECTED_PARKED_CHARACTER_IDS = [
  'baizhi',
  'brant',
  'jianxin',
  'phoebe',
  'verina',
  'yuanwu',
] as const;

async function loadReview() {
  return JSON.parse(await readFile(new URL('../data/research/profile-horizontal-semantic-review-2026-08-31.json', import.meta.url), 'utf8'));
}

test('2026-08-31 horizontal semantic review closes six profiles and parks six explicit semantic blockers', async () => {
  const review = await loadReview();
  const approved = review.entries.filter((entry) => entry.decision === 'APPROVED_FOR_CANONICAL_VERIFIED');
  const parked = review.entries.filter((entry) => entry.decision === 'PARKED_SEMANTIC_AMBIGUITY');

  assert.equal(review.semanticReviewRequired, true);
  assert.equal(review.automationMayApproveSemanticTruth, false);
  assert.equal(review.summary.reviewedCharacterCount, 12);
  assert.equal(approved.length, 6);
  assert.equal(parked.length, 6);
  assert.deepEqual(approved.map((entry) => entry.characterId).sort(), [...EXPECTED_APPROVED_CHARACTER_IDS].sort());
  assert.deepEqual(parked.map((entry) => entry.characterId).sort(), [...EXPECTED_PARKED_CHARACTER_IDS].sort());
  assert.ok(approved.every((entry) => entry.sourceComplete === true && entry.isDefault === true && entry.blockers.length === 0));
  assert.ok(parked.every((entry) => entry.sourceComplete === false && entry.isDefault === null && entry.candidateIds === null && entry.blockers.length > 0));
});

test('2026-08-31 canonical package preserves verified source-only contracts', () => {
  const catalogs = [
    PROFILE_HORIZONTAL_GREEN_LANE_WEAPONS,
    PROFILE_HORIZONTAL_GREEN_LANE_ECHOES,
    PROFILE_HORIZONTAL_GREEN_LANE_STATS,
    PROFILE_HORIZONTAL_GREEN_LANE_TEAMS,
    PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS,
    PROFILE_HORIZONTAL_GREEN_LANE_PRESETS,
  ];

  assert.equal(PROFILE_HORIZONTAL_GREEN_LANE_META.approvedModeCount, 6);
  assert.equal(PROFILE_HORIZONTAL_GREEN_LANE_META.approvedCharacterCount, 6);
  assert.equal(PROFILE_HORIZONTAL_GREEN_LANE_META.semanticReviewRequired, true);
  assert.equal(PROFILE_HORIZONTAL_GREEN_LANE_META.automationApprovedSemanticTruth, false);
  assert.equal(PROFILE_HORIZONTAL_GREEN_LANE_META.rotationsRemainSourceSequenceOnly, true);
  assert.ok(catalogs.every((rows) => rows.length === 6));
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
});

test('2026-08-31 horizontal presets resolve through the canonical registry with only Lucilla execution-overlaid', () => {
  for (const preset of PROFILE_HORIZONTAL_GREEN_LANE_PRESETS) {
    const resolved = resolveBuildPreset(PROFILE_REGISTRY, preset.id);
    assert.equal(resolved.preset.verificationStatus, 'VERIFIED');
    assert.equal(resolved.weaponRecommendation.verificationStatus, 'VERIFIED');
    assert.equal(resolved.echoLoadout.verificationStatus, 'VERIFIED');
    assert.equal(resolved.statTarget.verificationStatus, 'VERIFIED');
    assert.equal(resolved.team.verificationStatus, 'VERIFIED');
    assert.equal(resolved.rotation.verificationStatus, 'VERIFIED');

    if (preset.id === 'lucilla-standard') {
      assert.equal(resolved.rotation.executionStatus, 'ENGINE_MODELED');
      assert.equal(resolved.rotation.engineModelId, 'LUCILLA_STANDARD_GLACIO_CHAFE_V1');
      assert.equal(resolved.rotation.rotationSeconds, 7.34);
    } else {
      assert.equal(resolved.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
      assert.equal(Object.hasOwn(resolved.rotation, 'rotationSeconds'), false);
      assert.equal(Object.hasOwn(resolved.rotation, 'engineModelId'), false);
    }
  }
});
