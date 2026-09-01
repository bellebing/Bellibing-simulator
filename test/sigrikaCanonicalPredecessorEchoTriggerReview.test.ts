import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901,
  validateSigrikaCanonicalPredecessorEchoTriggerReview,
} from '../src/data/sigrikaCanonicalPredecessorEchoTriggerReview20260901.ts';

test('canonical Sigrika predecessor Echo-trigger review proves only a 4-5 entry interval', () => {
  assert.deepEqual(validateSigrikaCanonicalPredecessorEchoTriggerReview(), []);

  const review = SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901;
  assert.equal(review.presetId, 'sigrika-standard');
  assert.equal(review.teamProfileId, 'sigrika-qiuyuan-ciaccona');
  assert.deepEqual(review.preSigrikaEntryBounds, {
    guaranteedDistinctTriggerCount: 4,
    maximumSourceDescribedTriggerCount: 5,
    soliskinVitalityMin: 40,
    soliskinVitalityMax: 50,
    blessingOfRunesStacksMin: 4,
    blessingOfRunesStacksMax: 5,
    firstSchemataHighVitalityPathGuaranteed: true,
    exactEntryGaugeStateKnown: false,
  });
  assert.deepEqual(review.closesPendingExecutionIds, []);
});

test('predecessor review guarantees first high-Vitality Schemata but refuses later Innate/Blessing certainty', () => {
  const review = SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901;

  assert.deepEqual(review.downstreamImplications, {
    firstSchemataConsumesAtLeast30Vitality: true,
    firstSchemataGainsInnateGiftStack: true,
    secondSchemataHighVitalityPathGuaranteed: false,
    exactInnateGiftStacksBeforeLearnKnown: false,
    exactBlessingStacksDuringSigrikaSequenceKnown: false,
  });
  assert.ok(review.boundaries.some((note) => note.includes('40–50 Vitality / 4–5 Blessing')));
  assert.ok(review.boundaries.some((note) => note.includes('flexible own Echo cast')));
  assert.ok(review.boundaries.some((note) => note.includes('closes no pendingExecutionId')));
});
