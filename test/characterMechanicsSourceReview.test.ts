import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CHARACTER_MECHANICS_SOURCE_BLOCKERS,
  auditCharacterMechanicsSourceReview,
} from '../src/data/characterMechanicsSourceReview.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';

test('roster-wide Character Mechanics source review distinguishes verified, source-blocked and unreviewed characters', () => {
  const coverage = auditCharacterMechanicsCoverage();
  const review = auditCharacterMechanicsSourceReview();

  assert.equal(coverage.releasedCount, 59);
  assert.equal(coverage.verifiedCharacterIds.length, 58);
  assert.deepEqual(coverage.partialCharacterIds, ['danjin']);
  assert.deepEqual(coverage.unstartedCharacterIds, []);
  assert.equal(review.verifiedCharacterIds.length, 58);
  assert.deepEqual(review.sourceBlockedCharacterIds, ['danjin']);
  assert.deepEqual(review.unreviewedCharacterIds, []);
  assert.equal(review.sourceReviewComplete, true);
  assert.deepEqual(review.issues, []);
});

test('source blockers preserve exact current-source reason instead of inferring missing mechanics', () => {
  assert.equal(CHARACTER_MECHANICS_SOURCE_BLOCKERS.length, 1);
  const byId = new Map(CHARACTER_MECHANICS_SOURCE_BLOCKERS.map((blocker) => [blocker.characterId, blocker]));

  const danjin = byId.get('danjin');
  assert.ok(danjin);
  assert.equal(danjin.kind, 'CONTRADICTORY_RESOURCE_THRESHOLD');
  assert.match(danjin.reason, /over 120/i);
  assert.match(danjin.reason, /caps the resource at 120/i);
  assert.ok(danjin.sourceEvidence.some((entry) => /\[60, 120, 120, 120\]/.test(entry)));

  for (const blocker of CHARACTER_MECHANICS_SOURCE_BLOCKERS) {
    assert.equal(blocker.checkedAt, ['hsin', 'jingran'].includes(blocker.characterId) ? '2026-10-06' : '2026-08-29');
    assert.equal(blocker.upstreamCommit, '5fa70b11f1d84fb644e4dbed47873708da0fe66f');
  }
});
