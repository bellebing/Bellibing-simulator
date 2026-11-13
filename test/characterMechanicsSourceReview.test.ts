import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CHARACTER_MECHANICS_SOURCE_BLOCKERS,
  DANJIN_RUBY_BLOSSOM_INTERPRETATION,
  auditCharacterMechanicsSourceReview,
} from '../src/data/characterMechanicsSourceReview.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';

test('roster-wide source review preserves 59 verified and explicitly marks Lily and Suoming unreviewed', () => {
  const coverage = auditCharacterMechanicsCoverage();
  const review = auditCharacterMechanicsSourceReview();

  assert.equal(coverage.releasedCount, 61);
  assert.equal(coverage.verifiedCharacterIds.length, 59);
  assert.deepEqual(coverage.partialCharacterIds, []);
  assert.deepEqual(coverage.unstartedCharacterIds, ['lily', 'suoming']);
  assert.equal(review.verifiedCharacterIds.length, 59);
  assert.deepEqual(review.sourceBlockedCharacterIds, []);
  assert.deepEqual(review.unreviewedCharacterIds, ['lily', 'suoming']);
  assert.equal(review.sourceReviewComplete, false);
  assert.deepEqual(review.issues, []);
});

test('owner-resolved full meter is retained separately from active source blockers', () => {
  assert.deepEqual(CHARACTER_MECHANICS_SOURCE_BLOCKERS, []);
  const resolution = DANJIN_RUBY_BLOSSOM_INTERPRETATION;
  assert.equal(resolution.authority, 'EXPLICIT_OWNER_DECISION');
  assert.equal(resolution.fullPowerThreshold, resolution.maximum);
  assert.equal(resolution.fullPowerThreshold, 120);
  assert.equal(resolution.fullPowerConsumption, 120);
  assert.match(resolution.translationIssue, /English.*over 120/);
  assert.match(resolution.translationIssue, /exactly 120 qualifies/);
});
