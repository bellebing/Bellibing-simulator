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

  assert.equal(coverage.releasedCount, 57);
  assert.equal(coverage.verifiedCharacterIds.length, 54);
  assert.deepEqual(coverage.partialCharacterIds, []);
  assert.deepEqual(coverage.unstartedCharacterIds, ['buling', 'danjin', 'xiangli-yao']);
  assert.equal(review.verifiedCharacterIds.length, 54);
  assert.deepEqual(review.sourceBlockedCharacterIds, ['buling', 'danjin', 'xiangli-yao']);
  assert.deepEqual(review.unreviewedCharacterIds, []);
  assert.equal(review.sourceReviewComplete, true);
  assert.deepEqual(review.issues, []);
});

test('source blockers preserve exact current-source reason instead of inferring missing mechanics', () => {
  assert.equal(CHARACTER_MECHANICS_SOURCE_BLOCKERS.length, 3);
  const byId = new Map(CHARACTER_MECHANICS_SOURCE_BLOCKERS.map((blocker) => [blocker.characterId, blocker]));

  const buling = byId.get('buling');
  assert.ok(buling);
  assert.equal(buling.kind, 'MISSING_DAMAGE_CLASSIFICATION');
  assert.match(buling.reason, /Five Thunders Spell Array Continuous DMG/i);
  assert.match(buling.reason, /must not be used to infer/i);
  assert.ok(buling.sourceEvidence.some((entry) => /1307031/.test(entry)));

  const danjin = byId.get('danjin');
  assert.ok(danjin);
  assert.equal(danjin.kind, 'CONTRADICTORY_RESOURCE_THRESHOLD');
  assert.match(danjin.reason, /over 120/i);
  assert.match(danjin.reason, /caps the resource at 120/i);
  assert.ok(danjin.sourceEvidence.some((entry) => /\[60, 120, 120, 120\]/.test(entry)));

  const xiangli = byId.get('xiangli-yao');
  assert.ok(xiangli);
  assert.equal(xiangli.kind, 'MISSING_DAMAGE_CLASSIFICATION');
  assert.match(xiangli.reason, /Pivot - Impale/i);
  assert.match(xiangli.reason, /must not be used to infer Resonance Liberation DMG/i);
  assert.ok(xiangli.sourceEvidence.some((entry) => /1305015-1305017/.test(entry)));

  for (const blocker of CHARACTER_MECHANICS_SOURCE_BLOCKERS) {
    assert.equal(blocker.checkedAt, '2026-08-29');
    assert.equal(blocker.upstreamCommit, '5fa70b11f1d84fb644e4dbed47873708da0fe66f');
  }
});
