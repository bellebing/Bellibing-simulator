import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

import {
  PROFILE_COHORT_01_GREEN_LANE_META,
  PROFILE_COHORT_01_GREEN_LANE_PRESETS,
  PROFILE_COHORT_01_GREEN_LANE_ROTATIONS,
} from '../src/data/profileCohort01GreenLane20260830.ts';
import { PROFILE_COHORT_01_GREEN_LANE_IMPACT_REVIEWS } from '../src/data/profileCohort01GreenLaneImpact20260830.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';
import { assertProfileReadinessAudit } from '../src/profileReadinessRegistry.ts';

async function loadJson(relativePath: string) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), 'utf8'));
}

const PROMOTED = [
  ['lumi', 'lumi-hybrid'],
  ['yinlin', 'yinlin-moonlit'],
  ['calcharo', 'calcharo-standard'],
  ['cantarella', 'cantarella-standard'],
  ['carlotta', 'carlotta-standard'],
  ['changli', 'changli-standard'],
  ['chisa', 'chisa-standard'],
] as const;

const PROMOTED_SEMANTIC_MODES = [
  ['lumi', 'hybrid'],
  ['yinlin', 'moonlit'],
  ['calcharo', 'standard'],
  ['cantarella', 'standard'],
  ['carlotta', 'standard'],
  ['changli', 'standard'],
  ['chisa', 'standard'],
] as const;

const SOURCE_COMPLETE_NOT_PROMOTED = [
  ['lucilla', 'glacio-chafe'],
  ['lucilla', 'echo-skill'],
  ['rover-havoc', 'quickswap'],
] as const;

test('semantic gate approves seven of ten source-complete modes and preserves three default blockers', async () => {
  const review = await loadJson('../data/research/profile-cohort-01-semantic-promotion-review-2026-08-30.json');
  assert.deepEqual(review.summary, {
    sourceCompleteModeCount: 10,
    approvedModeCount: 7,
    promotionBlockedModeCount: 3,
    approvedCharacterCount: 7,
  });
  assert.equal(review.automationMayApproveSemanticTruth, false);

  for (const [characterId, modeKey] of PROMOTED_SEMANTIC_MODES) {
    const row = review.entries.find((entry) => entry.characterId === characterId && entry.modeKey === modeKey);
    assert.ok(row, `${characterId}:${modeKey}`);
    assert.equal(row.sourceComplete, true);
    assert.equal(row.decision, 'APPROVED_FOR_CANONICAL_VERIFIED');
    assert.equal(row.isDefault, true);
    assert.deepEqual(row.blockers, []);
  }

  for (const [characterId, modeKey] of SOURCE_COMPLETE_NOT_PROMOTED) {
    const row = review.entries.find((entry) => entry.characterId === characterId && entry.modeKey === modeKey);
    assert.ok(row, `${characterId}:${modeKey}`);
    assert.equal(row.sourceComplete, true);
    assert.equal(row.decision, 'SOURCE_COMPLETE_PROMOTION_BLOCKED');
    assert.equal(row.isDefault, null);
    assert.ok(row.blockers.length > 0);
  }
});

test('bulk materialization produces seven canonical defaults while keeping every rotation SOURCE_SEQUENCE_ONLY', () => {
  assert.deepEqual(PROFILE_COHORT_01_GREEN_LANE_META, {
    cohortId: 'PROFILE-COHORT-01-2026-08-29',
    checkedAt: '2026-08-30',
    approvedModeCount: 7,
    approvedCharacterCount: 7,
    semanticReview: 'data/research/profile-cohort-01-semantic-promotion-review-2026-08-30.json',
    automationApprovedSemanticTruth: false,
    rotationsRemainSourceSequenceOnly: true,
  });
  assert.equal(PROFILE_COHORT_01_GREEN_LANE_PRESETS.length, 7);
  assert.equal(PROFILE_COHORT_01_GREEN_LANE_ROTATIONS.length, 7);

  for (const [characterId, presetId] of PROMOTED) {
    const preset = PROFILE_COHORT_01_GREEN_LANE_PRESETS.find((row) => row.id === presetId);
    assert.ok(preset, presetId);
    assert.equal(preset.characterId, characterId);
    assert.equal(preset.verificationStatus, 'VERIFIED');
    assert.equal(preset.isDefault, true);
    assert.equal(preset.uiSelectable, true);

    const resolved = resolveBuildPreset(PROFILE_REGISTRY, presetId);
    assert.equal(resolved.preset.id, presetId);
    assert.equal(resolved.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
    assert.equal(resolved.rotation.verificationStatus, 'VERIFIED');
  }

  assert.ok(PROFILE_COHORT_01_GREEN_LANE_ROTATIONS.every((row) => row.executionStatus === 'SOURCE_SEQUENCE_ONLY'));
  assert.ok(PROFILE_COHORT_01_GREEN_LANE_ROTATIONS.every((row) => row.modeledMechanicFactIds.length === 0));
  assert.ok(PROFILE_COHORT_01_GREEN_LANE_ROTATIONS.every((row) => row.assumedMechanicFactIds.length === 0));
});

test('all seven promoted profiles remain pending freeze with explicit backward-impact execution gaps', () => {
  const summary = assertProfileReadinessAudit();
  assert.equal(summary.releasedCharacterCount, 57);
  assert.equal(summary.profileCompletePendingFreezeCount, 24);
  assert.equal(summary.characterMechanicsSourceBlockedCount, 3);
  assert.equal(summary.profileSourcePendingCount, 28);
  assert.equal(summary.dpsReadyCount, 2);
  assert.equal(summary.issues.length, 0);

  for (const [characterId, presetId] of PROMOTED) {
    const row = summary.characters.find((entry) => entry.characterId === characterId);
    assert.ok(row, characterId);
    assert.equal(row.disposition, 'PROFILE_COMPLETE_PENDING_FREEZE');
    assert.deepEqual(row.presetIds, [presetId]);
    assert.deepEqual(row.verifiedPresetIds, [presetId]);
    assert.deepEqual(row.freezeApprovalPresetIds, []);
    assert.ok(!summary.profileSourcePendingIds.includes(characterId));

    const impact = PROFILE_COHORT_01_GREEN_LANE_IMPACT_REVIEWS.find((review) => review.presetId === presetId);
    assert.ok(impact, presetId);
    assert.equal(impact.result, 'REVIEWED_WITH_PENDING_EXECUTION');
    assert.ok(impact.pendingExecutionIds.includes(`rotation:${presetId}-rotation:engine-model`));
  }

  assert.ok(summary.profileSourcePendingIds.includes('lucilla'));
  assert.ok(summary.profileSourcePendingIds.includes('rover-havoc'));
});
