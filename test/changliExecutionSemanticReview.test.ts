import test from 'node:test';
import assert from 'node:assert/strict';

import { CHANGLI_STANDARD_ROTATION_EXECUTION_REVIEW_20260830 } from '../src/data/changliExecutionSemanticReview20260830.ts';

test('Changli Standard Rotation review preserves source sequence facts without inventing total timing', () => {
  const review = CHANGLI_STANDARD_ROTATION_EXECUTION_REVIEW_20260830;
  assert.equal(review.rotationId, 'changli-standard-rotation');
  assert.equal(review.disposition, 'SOURCE_SEMANTICS_BLOCKED');
  assert.equal(review.blockerId, 'BUG-014');
  assert.equal(review.rotationSeconds, null);
  assert.deepEqual(review.closesPendingExecutionIds, []);
  assert.ok(review.sourceEstablished.some((note) => note.includes('1.37 seconds')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('relative delta')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('DPS denominator')));
});
