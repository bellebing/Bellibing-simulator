import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertCharacterDpsReady,
  assertProfileReadinessAudit,
  auditProfileReadiness,
} from '../src/profileReadinessRegistry.ts';
import {
  validateProfileFreezeAdapterClosure,
  type ProfileFreezeApproval,
} from '../src/data/profileFreezeReview.ts';

test('current released roster is explicitly classified for profile/freeze readiness', () => {
  const summary = assertProfileReadinessAudit();

  assert.equal(summary.releasedCharacterCount, 57);
  assert.equal(summary.profileCompletePendingFreezeCount, 6);
  assert.equal(summary.characterMechanicsSourceBlockedCount, 3);
  assert.equal(summary.profileSourcePendingCount, 48);
  assert.equal(summary.dpsReadyCount, 0);
  assert.equal(summary.preDpsFreezeReady, false);

  assert.deepEqual(summary.profileCompletePendingFreezeIds, [
    'augusta',
    'cartethyia',
    'ciaccona',
    'iuno',
    'rover-aero',
    'the-shorekeeper',
  ]);
  assert.deepEqual(summary.characterMechanicsSourceBlockedIds, ['buling', 'danjin', 'xiangli-yao']);
  assert.equal(summary.profileSourcePendingIds.length, 48);
  assert.deepEqual(summary.dpsReadyIds, []);
  assert.equal(summary.issues.length, 0);
});

test('raw and intrinsic unresolved Character fields stay visible to DPS preflight', () => {
  const summary = assertProfileReadinessAudit();
  assert.deepEqual(summary.rawDpsBlockedCharacterIds, ['qingxiao', 'rover-electro', 'suisui']);
  assert.deepEqual(summary.intrinsicDpsBlockedCharacterIds, ['mornye']);

  const qingxiao = summary.characters.find((row) => row.characterId === 'qingxiao');
  assert.ok(qingxiao);
  assert.deepEqual(qingxiao.rawDpsBlockers, ['level90.maxEnergy']);

  const mornye = summary.characters.find((row) => row.characterId === 'mornye');
  assert.ok(mornye);
  assert.equal(mornye.intrinsicDpsBlocked, true);
});

test('verified source profile packages are not silently promoted to DPS-ready', () => {
  const summary = assertProfileReadinessAudit();
  for (const [characterId, presetId] of [
    ['augusta', 'augusta-standard'],
    ['cartethyia', 'cartethyia-aero-erosion'],
    ['ciaccona', 'ciaccona-cartethyia-aero'],
    ['rover-aero', 'rover-aero-cartethyia-ciaccona'],
    ['iuno', 'iuno-augusta-hybrid'],
    ['the-shorekeeper', 'shorekeeper-augusta-support'],
  ] as const) {
    const row = summary.characters.find((entry) => entry.characterId === characterId);
    assert.ok(row);
    assert.equal(row.disposition, 'PROFILE_COMPLETE_PENDING_FREEZE');
    assert.deepEqual(row.presetIds, [presetId]);
    assert.deepEqual(row.verifiedPresetIds, [presetId]);
    assert.deepEqual(row.freezeApprovalPresetIds, []);
    assert.throws(() => assertCharacterDpsReady(characterId), /PROFILE_COMPLETE_PENDING_FREEZE/);
  }
});

test('a SOURCE_SEQUENCE_ONLY profile cannot be freeze-approved for DPS', () => {
  const invalidApproval: ProfileFreezeApproval = {
    characterId: 'cartethyia',
    presetId: 'cartethyia-aero-erosion',
    status: 'DPS_READY',
    checkedAt: '2026-08-29',
    patch: '3.6',
    backwardImpactReview: 'test-only',
    requiredAdapterIds: [],
    verifiedAdapterIds: [],
    notes: ['test-only invalid approval before executable rotation exists'],
  };

  const summary = auditProfileReadiness([invalidApproval]);
  assert.ok(summary.issues.some((issue) => issue.includes('SOURCE_SEQUENCE_ONLY') && issue.includes('not executable for DPS freeze')));
});

test('a Character Mechanics source blocker cannot be freeze-approved for DPS', () => {
  const invalidApproval: ProfileFreezeApproval = {
    characterId: 'buling',
    presetId: 'augusta-standard',
    status: 'DPS_READY',
    checkedAt: '2026-08-29',
    patch: '3.6',
    backwardImpactReview: 'test-only',
    requiredAdapterIds: [],
    verifiedAdapterIds: [],
    notes: ['test-only invalid approval'],
  };

  const summary = auditProfileReadiness([invalidApproval]);
  assert.ok(summary.issues.some((issue) => issue.includes('Character Mechanics is source-blocked')));
  assert.ok(summary.issues.some((issue) => issue.includes('preset belongs to augusta')));
});

test('canonical freeze approval adapter evidence must close exactly', () => {
  const approval: ProfileFreezeApproval = {
    characterId: 'augusta',
    presetId: 'augusta-standard',
    status: 'DPS_READY',
    checkedAt: '2026-08-29',
    patch: '3.6',
    backwardImpactReview: 'test-only',
    requiredAdapterIds: ['sonata-midnight-veil-damage'],
    verifiedAdapterIds: [],
    notes: ['test-only'],
  };
  assert.deepEqual(
    validateProfileFreezeAdapterClosure(approval),
    ['required adapter sonata-midnight-veil-damage is not verified'],
  );
});
