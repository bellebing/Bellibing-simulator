import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertCharacterDpsReady,
  assertProfileReadinessAudit,
  auditProfileReadiness,
} from '../src/profileReadinessRegistry.ts';
import {
  PROFILE_FREEZE_APPROVALS,
  validateProfileFreezeAdapterClosure,
  type ProfileFreezeApproval,
} from '../src/data/profileFreezeReview.ts';
import { PROFILE_BUILD_CONTEXT_ADAPTER_ID } from '../src/profileBuildContext.ts';

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

const STILL_PENDING_FREEZE = [
  ['cartethyia', 'cartethyia-aero-erosion'],
  ['rover-aero', 'rover-aero-cartethyia-ciaccona'],
  ['iuno', 'iuno-augusta-hybrid'],
  ['the-shorekeeper', 'shorekeeper-augusta-support'],
  ...NEW_SOURCE_BATCH,
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
  assert.deepEqual(summary.intrinsicDpsBlockedCharacterIds, []);

  const qingxiao = summary.characters.find((row) => row.characterId === 'qingxiao');
  assert.ok(qingxiao);
  assert.deepEqual(qingxiao.rawDpsBlockers, ['level90.maxEnergy']);

  const mornye = summary.characters.find((row) => row.characterId === 'mornye');
  assert.ok(mornye);
  assert.equal(mornye.intrinsicDpsBlocked, false);
});

test('Augusta and Ciaccona are explicitly frozen DPS-ready profiles with adapter evidence', () => {
  const summary = assertProfileReadinessAudit();
  assert.deepEqual(summary.dpsReadyIds, ['augusta', 'ciaccona']);

  const augusta = assertCharacterDpsReady('augusta');
  assert.equal(augusta.disposition, 'DPS_READY');
  assert.deepEqual(augusta.presetIds, ['augusta-standard']);
  assert.deepEqual(augusta.verifiedPresetIds, ['augusta-standard']);
  assert.deepEqual(augusta.freezeApprovalPresetIds, ['augusta-standard']);

  const ciaccona = assertCharacterDpsReady('ciaccona');
  assert.equal(ciaccona.disposition, 'DPS_READY');
  assert.deepEqual(ciaccona.presetIds, ['ciaccona-cartethyia-aero']);
  assert.deepEqual(ciaccona.verifiedPresetIds, ['ciaccona-cartethyia-aero']);
  assert.deepEqual(ciaccona.freezeApprovalPresetIds, ['ciaccona-cartethyia-aero']);

  assert.equal(PROFILE_FREEZE_APPROVALS.length, 2);
  const augustaApproval = PROFILE_FREEZE_APPROVALS.find((row) => row.presetId === 'augusta-standard');
  const ciacconaApproval = PROFILE_FREEZE_APPROVALS.find((row) => row.presetId === 'ciaccona-cartethyia-aero');
  assert.ok(augustaApproval && ciacconaApproval);
  assert.deepEqual(augustaApproval.requiredAdapterIds, [PROFILE_BUILD_CONTEXT_ADAPTER_ID]);
  assert.deepEqual(augustaApproval.verifiedAdapterIds, [PROFILE_BUILD_CONTEXT_ADAPTER_ID]);
  assert.equal(augustaApproval.backwardImpactReview, 'PROFILE-IMPACT-AUGUSTA-2026-08-29-01');
  assert.deepEqual(ciacconaApproval.requiredAdapterIds, [
    PROFILE_BUILD_CONTEXT_ADAPTER_ID,
    'aero-erosion-weapon-target-state-v1',
    'CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1',
  ]);
  assert.deepEqual(ciacconaApproval.verifiedAdapterIds, ciacconaApproval.requiredAdapterIds);
  assert.equal(ciacconaApproval.backwardImpactReview, 'PROFILE-IMPACT-CIACCONA-2026-08-29-01');
});

test('other verified source profile packages are not silently promoted to DPS-ready', () => {
  const summary = assertProfileReadinessAudit();
  for (const [characterId, presetId] of STILL_PENDING_FREEZE) {
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
    checkedAt: '2026-08-30',
    patch: '3.6',
    backwardImpactReview: 'PROFILE-IMPACT-CARTETHYIA-2026-08-29-01',
    requiredAdapterIds: [],
    verifiedAdapterIds: [],
    notes: ['test-only invalid approval before executable rotation exists'],
  };

  const summary = auditProfileReadiness([invalidApproval]);
  assert.ok(summary.issues.some((issue) => issue.includes('SOURCE_SEQUENCE_ONLY') && issue.includes('not executable for DPS freeze')));
  assert.ok(summary.issues.some((issue) => issue.includes('backward-impact review still has pending execution')));
  assert.ok(summary.issues.some((issue) => issue.includes('pending execution id(s)')));
});

test('a Character Mechanics source blocker cannot be freeze-approved for DPS', () => {
  const invalidApproval: ProfileFreezeApproval = {
    characterId: 'buling',
    presetId: 'augusta-standard',
    status: 'DPS_READY',
    checkedAt: '2026-08-30',
    patch: '3.6',
    backwardImpactReview: 'PROFILE-IMPACT-AUGUSTA-2026-08-29-01',
    requiredAdapterIds: [],
    verifiedAdapterIds: [],
    notes: ['test-only invalid approval'],
  };

  const summary = auditProfileReadiness([invalidApproval]);
  assert.ok(summary.issues.some((issue) => issue.includes('Character Mechanics is source-blocked')));
  assert.ok(summary.issues.some((issue) => issue.includes('preset belongs to augusta')));
  assert.ok(summary.issues.some((issue) => issue.includes('backward-impact review belongs to augusta')));
});

test('freeze approval adapter evidence is enforced inside readiness audit', () => {
  const invalidApproval: ProfileFreezeApproval = {
    characterId: 'augusta',
    presetId: 'augusta-standard',
    status: 'DPS_READY',
    checkedAt: '2026-08-30',
    patch: '3.6',
    backwardImpactReview: 'PROFILE-IMPACT-AUGUSTA-2026-08-29-01',
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

test('freeze approval cannot cite an invented backward-impact review', () => {
  const invalidApproval: ProfileFreezeApproval = {
    ...PROFILE_FREEZE_APPROVALS[0],
    backwardImpactReview: 'PROFILE-IMPACT-NOT-REAL',
  };
  const summary = auditProfileReadiness([invalidApproval]);
  assert.ok(summary.issues.some((issue) => issue.includes('unknown backward-impact review PROFILE-IMPACT-NOT-REAL')));
});