import assert from 'node:assert/strict';
import test from 'node:test';

import type { ProfileFreezeApproval } from '../src/data/profileFreezeReview.ts';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';

test('readiness freeze lookup consumes sliced Zhezhi backward-impact reviews', () => {
  const invalidEarlyFreeze: ProfileFreezeApproval = {
    characterId: 'zhezhi',
    presetId: 'zhezhi-empyrean-endgame',
    status: 'DPS_READY',
    checkedAt: '2026-08-29',
    patch: '3.6',
    backwardImpactReview: 'PROFILE-IMPACT-ZHEZHI-EMPYREAN-2026-08-29-01',
    requiredAdapterIds: [],
    verifiedAdapterIds: [],
    notes: ['test-only early freeze before execution gaps are closed'],
  };

  const summary = auditProfileReadiness([invalidEarlyFreeze]);
  assert.equal(
    summary.issues.some((issue) => issue.includes('unknown backward-impact review')),
    false,
    'the sliced review must be visible to the canonical readiness gate',
  );
  assert.ok(summary.issues.some((issue) => issue.includes('backward-impact review still has pending execution')));
  assert.ok(summary.issues.some((issue) => issue.includes('pending execution id(s)')));
  assert.ok(summary.issues.some((issue) => issue.includes('SOURCE_SEQUENCE_ONLY') && issue.includes('not executable for DPS freeze')));
});
