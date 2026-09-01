import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW,
  LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE,
  LINGYANG_STANDARD_SOURCE_SEQUENCE,
  resolveLingyangBurstComboStep,
  resolveLingyangCurrentPrydwenBurstComboStep,
  validateLingyangBurstComboActionMapping,
} from '../src/combat/lingyangBurstComboActionMapping.ts';
import { LINGYANG_ACTION_FACTS } from '../src/data/characterMechanics/lingyangRawFacts.ts';
import { LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901 } from '../src/data/lingyangBurstComboSourceReview20260901.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';

test('Lingyang Burst Combo map preserves canonical truth while recording the current-source mismatch', () => {
  assert.deepEqual(validateLingyangBurstComboActionMapping(), []);
  assert.equal(LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.status, 'BLOCKED_CANONICAL_SOURCE_MISMATCH');
  assert.equal(LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.primitiveId, 'lingyang-burst-combo-source-mismatch-aware-action-map-v2');
  assert.equal(LINGYANG_STANDARD_SOURCE_SEQUENCE.length, 15);
  assert.equal(LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE.length, 16);
  assert.equal(LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.canonicalSequenceStepCount, 15);
  assert.equal(LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.currentSourceSequenceStepCount, 16);
  assert.deepEqual(
    LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.canonicalExactMappedStepIndexes,
    [0, 1, 2, 3, 5, 7, 9, 11, 12, 13, 14],
  );
  assert.deepEqual(LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.canonicalAmbiguousStepIndexes, [4, 6, 8, 10]);
  assert.deepEqual(
    LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.currentSourceExactMappedStepIndexes,
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  );
  assert.deepEqual(LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.closesPendingExecutionIds, []);

  const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'lingyang-standard')!;
  assert.ok(review.pendingExecutionIds.includes(LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.pendingExecutionId));
  assert.ok(review.notes.some((note) => note.includes('current Prydwen') && note.includes('16-step Burst Combo')));
  assert.ok(review.notes.some((note) => note.includes('canonical generated sequence') && note.includes('does not silently substitute')));
});

test('current-source review locks the observed mismatch without assigning an unproven historical cause', () => {
  assert.equal(LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.status, 'CURRENT_SOURCE_CANONICAL_MISMATCH_CONFIRMED');
  assert.equal(LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.sourcePageLastUpdated, '2026-08-20');
  assert.equal(LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.canonicalSemanticReviewCheckedAt, '2026-08-30');
  assert.ok(
    LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.observations.some(
      (note) => note.includes('historical cause is unresolved') && note.includes('does not classify it as reviewer transcription error'),
    ),
  );
  assert.ok(
    LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.correctionBoundary.some(
      (note) => note.includes('must not') || note.includes('without silently substituting'),
    ),
  );
});

test('unique canonical source steps resolve to exact Lingyang action facts', () => {
  const expected = new Map<number, string>([
    [1, 'lingyang-intro-lion-awakens'],
    [2, 'lingyang-liberation-strive-lions-vigor'],
    [3, 'lingyang-forte-glorious-plunge'],
    [5, 'lingyang-forte-mountain-roamer'],
    [7, 'lingyang-forte-mountain-roamer'],
    [9, 'lingyang-forte-mountain-roamer'],
    [11, 'lingyang-forte-mountain-roamer'],
    [12, 'lingyang-forte-stormy-kicks'],
    [13, 'lingyang-forte-tail-strike'],
    [14, 'lingyang-outro-frosty-marks'],
  ]);

  for (const [index, actionFactId] of expected) {
    assert.deepEqual(resolveLingyangBurstComboStep(index), {
      status: 'EXACT_CHARACTER_ACTION',
      sourceStep: LINGYANG_STANDARD_SOURCE_SEQUENCE[index],
      actionFactId,
    });
  }
  assert.deepEqual(resolveLingyangBurstComboStep(0), {
    status: 'EXACT_ECHO_EVENT',
    sourceStep: 'Echo: Mech Abomination',
    echoId: 'echo-60000485',
  });
});

test('generic canonical Feral Gyrate steps remain Stage 1/Stage 2 ambiguous', () => {
  for (const index of [4, 6, 8, 10]) {
    assert.deepEqual(resolveLingyangBurstComboStep(index), {
      status: 'AMBIGUOUS_CHARACTER_ACTION',
      sourceStep: 'Basic: Feral Gyrate',
      candidateActionFactIds: [
        'lingyang-forte-feral-gyrate-1',
        'lingyang-forte-feral-gyrate-2',
      ],
      reason: 'CANONICAL_SEQUENCE_DOES_NOT_IDENTIFY_STAGE',
    });
  }
});

test('current Prydwen source resolves explicit Feral stages and final action identities exactly', () => {
  const expected = new Map<number, string>([
    [1, 'lingyang-intro-lion-awakens'],
    [2, 'lingyang-liberation-strive-lions-vigor'],
    [3, 'lingyang-forte-glorious-plunge'],
    [4, 'lingyang-forte-feral-gyrate-1'],
    [5, 'lingyang-forte-mountain-roamer'],
    [6, 'lingyang-forte-feral-gyrate-2'],
    [7, 'lingyang-forte-mountain-roamer'],
    [8, 'lingyang-forte-feral-gyrate-1'],
    [9, 'lingyang-forte-mountain-roamer'],
    [10, 'lingyang-forte-feral-gyrate-2'],
    [11, 'lingyang-forte-mountain-roamer'],
    [12, 'lingyang-forte-feral-gyrate-1'],
    [13, 'lingyang-forte-stormy-kicks'],
    [14, 'lingyang-forte-tail-strike'],
    [15, 'lingyang-outro-frosty-marks'],
  ]);

  assert.deepEqual(resolveLingyangCurrentPrydwenBurstComboStep(0), {
    status: 'EXACT_ECHO_EVENT',
    sourceStep: 'Echo',
    echoId: 'echo-60000485',
  });
  for (const [index, actionFactId] of expected) {
    assert.deepEqual(resolveLingyangCurrentPrydwenBurstComboStep(index), {
      status: 'EXACT_CHARACTER_ACTION',
      sourceStep: LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE[index],
      actionFactId,
    });
  }

  assert.equal(LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE[4], 'Basic Attack: Feral Gyrate P1');
  assert.equal(LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE[6], 'Basic Attack: Feral Gyrate P2');
  assert.equal(LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE[8], 'Basic Attack: Feral Gyrate P1');
  assert.equal(LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE[10], 'Basic Attack: Feral Gyrate P2');
  assert.equal(LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE[12], 'Basic Attack: Feral Gyrate P1');
  assert.equal(LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE[13], 'Basic Attack: Stormy Kicks');
  assert.equal(LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE[14], 'Mid-Air Attack: Tail Strike');
});

test('Stormy Kicks and Tail Strike preserve raw Basic Attack damage class across both source labels', () => {
  const stormy = LINGYANG_ACTION_FACTS.find((fact) => fact.factId === 'lingyang-forte-stormy-kicks')!;
  const tail = LINGYANG_ACTION_FACTS.find((fact) => fact.factId === 'lingyang-forte-tail-strike')!;
  assert.equal(LINGYANG_STANDARD_SOURCE_SEQUENCE[12], 'Skill: Stormy Kicks');
  assert.equal(LINGYANG_STANDARD_SOURCE_SEQUENCE[13], 'Skill: Tail Strike');
  assert.equal(LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE[13], 'Basic Attack: Stormy Kicks');
  assert.equal(LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE[14], 'Mid-Air Attack: Tail Strike');
  assert.equal(stormy.damageClass, 'BASIC');
  assert.equal(tail.damageClass, 'BASIC');
});

test('canonical and current-source Burst Combo resolvers reject invalid indexes rather than guessing', () => {
  assert.throws(() => resolveLingyangBurstComboStep(-1), /canonical Burst Combo step index must be an integer from 0 through 14/);
  assert.throws(() => resolveLingyangBurstComboStep(15), /canonical Burst Combo step index must be an integer from 0 through 14/);
  assert.throws(() => resolveLingyangBurstComboStep(1.5), /canonical Burst Combo step index must be an integer from 0 through 14/);
  assert.throws(() => resolveLingyangCurrentPrydwenBurstComboStep(-1), /current-source Burst Combo step index must be an integer from 0 through 15/);
  assert.throws(() => resolveLingyangCurrentPrydwenBurstComboStep(16), /current-source Burst Combo step index must be an integer from 0 through 15/);
  assert.throws(() => resolveLingyangCurrentPrydwenBurstComboStep(1.5), /current-source Burst Combo step index must be an integer from 0 through 15/);
});
