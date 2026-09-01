import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW,
  LINGYANG_STANDARD_SOURCE_SEQUENCE,
  resolveLingyangBurstComboStep,
  validateLingyangBurstComboActionMapping,
} from '../src/combat/lingyangBurstComboActionMapping.ts';
import { LINGYANG_ACTION_FACTS } from '../src/data/characterMechanics/lingyangRawFacts.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';

test('Lingyang Burst Combo map locks the canonical sequence and keeps the mapping dependency open', () => {
  assert.deepEqual(validateLingyangBurstComboActionMapping(), []);
  assert.equal(LINGYANG_STANDARD_SOURCE_SEQUENCE.length, 15);
  assert.deepEqual(LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.exactMappedStepIndexes, [0, 1, 2, 3, 5, 7, 9, 11, 12, 13, 14]);
  assert.deepEqual(LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.ambiguousStepIndexes, [4, 6, 8, 10]);
  assert.deepEqual(LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.closesPendingExecutionIds, []);

  const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'lingyang-standard')!;
  assert.ok(review.pendingExecutionIds.includes(LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.pendingExecutionId));
  assert.ok(review.notes.some((note) => note.includes('partial Burst Combo action mapper') && note.includes('four generic Basic: Feral Gyrate')));
});

test('unique source steps resolve to exact canonical Lingyang action facts', () => {
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

test('all generic Feral Gyrate source steps remain Stage 1/Stage 2 ambiguous', () => {
  for (const index of [4, 6, 8, 10]) {
    assert.deepEqual(resolveLingyangBurstComboStep(index), {
      status: 'AMBIGUOUS_CHARACTER_ACTION',
      sourceStep: 'Basic: Feral Gyrate',
      candidateActionFactIds: [
        'lingyang-forte-feral-gyrate-1',
        'lingyang-forte-feral-gyrate-2',
      ],
      reason: 'SOURCE_STEP_DOES_NOT_IDENTIFY_STAGE',
    });
  }
});

test('Stormy Kicks and Tail Strike keep canonical Basic Attack damage class despite Skill source labels', () => {
  const stormy = LINGYANG_ACTION_FACTS.find((fact) => fact.factId === 'lingyang-forte-stormy-kicks')!;
  const tail = LINGYANG_ACTION_FACTS.find((fact) => fact.factId === 'lingyang-forte-tail-strike')!;
  assert.equal(LINGYANG_STANDARD_SOURCE_SEQUENCE[12], 'Skill: Stormy Kicks');
  assert.equal(LINGYANG_STANDARD_SOURCE_SEQUENCE[13], 'Skill: Tail Strike');
  assert.equal(stormy.damageClass, 'BASIC');
  assert.equal(tail.damageClass, 'BASIC');
});

test('Burst Combo resolver rejects invalid indexes rather than guessing', () => {
  assert.throws(() => resolveLingyangBurstComboStep(-1), /integer from 0 through 14/);
  assert.throws(() => resolveLingyangBurstComboStep(15), /integer from 0 through 14/);
  assert.throws(() => resolveLingyangBurstComboStep(1.5), /integer from 0 through 14/);
});
