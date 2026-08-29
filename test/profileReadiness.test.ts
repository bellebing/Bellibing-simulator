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

const NEW_SOURCE_BATCH = [
  ['aemeath', 'aemeath-standard'],
  ['camellya', 'camellya-standard'],
  ['galbrena', 'galbrena-standard'],
  ['hiyuki', 'hiyuki-standard'],
  ['jinhsi', 'jinhsi-standard-opener'],
  ['luuk-herssen', 'luuk-herssen-standard'],
  ['lynae', 'lynae-standard'],
  ['sigrika', 'sigrika-standard'],
  ['yangyang-xuanling', 'yangyang-xuanling-standard'],
  ['zani', 'zani-standard'],
] as const;

test('released roster is structurally classified without a copied readiness-count snapshot', () => {
  const summary = assertProfileReadinessAudit();
  const dispositionTotal =
    summary.profileCompletePendingFreezeCount
    + summary.characterMechanicsSourceBlockedCount
    + summary.profileSourcePendingCount
    + summary.dpsReadyCount;

  assert.equal(dispositionTotal, summary.releasedCharacterCount);
  assert.equal(summary.characters.length, summary.releasedCharacterCount);
  assert.deepEqual(summary.characterMechanicsSourceBlockedIds, ['buling', 'danjin', 'xiangli-yao']);
  assert.equal(summary.preDpsFreezeReady, false);
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
    ...NEW_SOURCE_BATCH,
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

test('the promoted roster batch leaves no candidate-only or unverified package in canonical registries', () => {
  const summary = assertProfileReadinessAudit();
  for (const [characterId] of NEW_SOURCE_BATCH) {
    assert.ok(!summary.profileSourcePendingIds.includes(characterId));
    const row = summary.characters.find((entry) => entry.characterId === characterId);
    assert.ok(row);
    assert.equal(row.verifiedPresetIds.length, 1);
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

test('freeze approval adapter evidence is enforced inside readiness audit', () => {
  const invalidApproval: ProfileFreezeApproval = {
    characterId: 'augusta',
    presetId: 'augusta-standard',
    status: 'DPS_READY',
    checkedAt: '2026-08-29',
    patch: '3.6',
    backwardImpactReview: 'test-only',
    requiredAdapterIds: ['profile-engine-bridge'],
    verifiedAdapterIds: [],
    notes: ['test-only'],
  };
  const summary = auditProfileReadiness([invalidApproval]);
  assert.ok(summary.issues.some((issue) => issue.includes('required adapter profile-engine-bridge is not verified')));
  assert.deepEqual(
    validateProfileFreezeAdapterClosure(invalidApproval),
    ['required adapter profile-engine-bridge is not verified'],
  );
});
