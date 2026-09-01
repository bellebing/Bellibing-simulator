import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateLingyangDiligentPractice,
  LINGYANG_DILIGENT_PRACTICE_SEMANTIC_REVIEW,
  validateLingyangDiligentPracticeContract,
} from '../src/combat/lingyangDiligentPracticeAdapter.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';

test('Diligent Practice contract locks source facts without closing the canonical dependency', () => {
  assert.deepEqual(validateLingyangDiligentPracticeContract(), []);
  assert.equal(LINGYANG_DILIGENT_PRACTICE_SEMANTIC_REVIEW.status, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(LINGYANG_DILIGENT_PRACTICE_SEMANTIC_REVIEW.blockerId, 'BUG-017');
  assert.equal(LINGYANG_DILIGENT_PRACTICE_SEMANTIC_REVIEW.primitiveId, 'lingyang-diligent-practice-known-window-v1');
  assert.deepEqual(LINGYANG_DILIGENT_PRACTICE_SEMANTIC_REVIEW.closesPendingExecutionIds, []);

  const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'lingyang-standard')!;
  assert.ok(review.pendingExecutionIds.includes(LINGYANG_DILIGENT_PRACTICE_SEMANTIC_REVIEW.pendingExecutionId));
  assert.ok(review.notes.some((note) => note.includes('known-event primitive') && note.includes('exact 3.000s boundary fails closed')));
});

test('known events strictly below three seconds trigger 150% Mountain Roamer Skill-class damage', () => {
  const result = evaluateLingyangDiligentPractice({
    ownerId: 'lingyang',
    basic: {
      actorId: 'lingyang',
      atSeconds: 10,
      stridingLionActive: true,
      actionRole: 'BASIC_ATTACK_DURING_STRIDING_LION',
    },
    mountainRoamer: {
      actorId: 'lingyang',
      atSeconds: 12.999,
      stridingLionActive: true,
      actionFactId: 'lingyang-forte-mountain-roamer',
    },
  });

  assert.equal(result.status, 'TRIGGERED');
  assert.ok(Math.abs(result.deltaSeconds - 2.999) < 1e-12);
  assert.equal(result.additionalDamageRatioOfMountainRoamer, 1.5);
  assert.equal(result.additionalDamageClass, 'RESONANCE_SKILL');
});

test('exact three-second edge fails closed and greater-than-three misses', () => {
  const basic = {
    actorId: 'lingyang',
    atSeconds: 4,
    stridingLionActive: true,
    actionRole: 'BASIC_ATTACK_DURING_STRIDING_LION' as const,
  };

  const exact = evaluateLingyangDiligentPractice({
    ownerId: 'lingyang',
    basic,
    mountainRoamer: {
      actorId: 'lingyang',
      atSeconds: 7,
      stridingLionActive: true,
      actionFactId: 'lingyang-forte-mountain-roamer',
    },
  });
  assert.equal(exact.status, 'SOURCE_BOUNDARY_UNRESOLVED');
  assert.equal(exact.deltaSeconds, 3);
  assert.ok(exact.unresolvedSemantics.some((note) => note.includes('exactly 3.000 seconds')));

  const late = evaluateLingyangDiligentPractice({
    ownerId: 'lingyang',
    basic,
    mountainRoamer: {
      actorId: 'lingyang',
      atSeconds: 7.001,
      stridingLionActive: true,
      actionFactId: 'lingyang-forte-mountain-roamer',
    },
  });
  assert.equal(late.status, 'OUTSIDE_WINDOW');
  assert.ok(late.deltaSeconds > 3);
});

test('Diligent Practice requires caller-proven Striding Lion state and event ownership', () => {
  const notState = evaluateLingyangDiligentPractice({
    ownerId: 'lingyang',
    basic: {
      actorId: 'lingyang',
      atSeconds: 1,
      stridingLionActive: false,
      actionRole: 'BASIC_ATTACK_DURING_STRIDING_LION',
    },
    mountainRoamer: {
      actorId: 'lingyang',
      atSeconds: 2,
      stridingLionActive: true,
      actionFactId: 'lingyang-forte-mountain-roamer',
    },
  });
  assert.equal(notState.status, 'NOT_DURING_STRIDING_LION');

  const otherActor = evaluateLingyangDiligentPractice({
    ownerId: 'lingyang',
    basic: {
      actorId: 'zhezhi',
      atSeconds: 1,
      stridingLionActive: true,
      actionRole: 'BASIC_ATTACK_DURING_STRIDING_LION',
    },
    mountainRoamer: {
      actorId: 'lingyang',
      atSeconds: 2,
      stridingLionActive: true,
      actionFactId: 'lingyang-forte-mountain-roamer',
    },
  });
  assert.equal(otherActor.status, 'IGNORED_OTHER_ACTOR');
});

test('Mountain Roamer must occur after the Basic event and times must be valid', () => {
  const base = {
    actorId: 'lingyang',
    stridingLionActive: true,
  };

  const sameTime = evaluateLingyangDiligentPractice({
    ownerId: 'lingyang',
    basic: { ...base, atSeconds: 5, actionRole: 'BASIC_ATTACK_DURING_STRIDING_LION' },
    mountainRoamer: { ...base, atSeconds: 5, actionFactId: 'lingyang-forte-mountain-roamer' },
  });
  assert.equal(sameTime.status, 'MOUNTAIN_ROAMER_NOT_AFTER_BASIC');

  assert.throws(() => evaluateLingyangDiligentPractice({
    ownerId: 'lingyang',
    basic: { ...base, atSeconds: -1, actionRole: 'BASIC_ATTACK_DURING_STRIDING_LION' },
    mountainRoamer: { ...base, atSeconds: 1, actionFactId: 'lingyang-forte-mountain-roamer' },
  }), /finite non-negative/);
});
