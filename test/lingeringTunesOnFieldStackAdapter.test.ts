import assert from 'node:assert/strict';
import test from 'node:test';

import {
  advanceLingeringTunesKnownOnField,
  createLingeringTunesKnownOnFieldState,
  leaveLingeringTunesField,
  LINGERING_TUNES_ON_FIELD_SEMANTIC_REVIEW,
  resolveLingeringTunesKnownOnFieldBonus,
  resolveLingeringTunesOutroBonus,
  validateLingeringTunesOnFieldContract,
} from '../src/combat/lingeringTunesOnFieldStackAdapter.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';

test('Lingering Tunes contract locks source-exact cadence/cap/outro facts', () => {
  assert.deepEqual(validateLingeringTunesOnFieldContract(), []);
  assert.equal(LINGERING_TUNES_ON_FIELD_SEMANTIC_REVIEW.status, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(LINGERING_TUNES_ON_FIELD_SEMANTIC_REVIEW.blockerId, 'BUG-017');
  assert.equal(LINGERING_TUNES_ON_FIELD_SEMANTIC_REVIEW.primitiveId, 'lingering-tunes-known-on-field-stack-v1');
  assert.deepEqual(LINGERING_TUNES_ON_FIELD_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
  assert.ok(LINGERING_TUNES_ON_FIELD_SEMANTIC_REVIEW.unresolvedSemantics.some((note) => note.includes('leaving')));

  const outro = resolveLingeringTunesOutroBonus();
  assert.deepEqual(outro, {
    effectId: 'S09_5PC_OUTRO_DMG',
    statOrEffect: 'Outro Skill DMG Bonus',
    value: 0.60,
  });
});

test('known continuous on-field time advances one stack every 1.5 seconds and caps at four', () => {
  const start = createLingeringTunesKnownOnFieldState({
    ownerId: 'lingyang',
    stackCount: 0,
    secondsTowardNextStack: 0,
  });

  const beforeFirst = advanceLingeringTunesKnownOnField(start, 1.49);
  assert.equal(beforeFirst.stackCount, 0);
  assert.ok(Math.abs(beforeFirst.secondsTowardNextStack - 1.49) < 1e-12);

  const first = advanceLingeringTunesKnownOnField(beforeFirst, 0.01);
  assert.equal(first.stackCount, 1);
  assert.ok(Math.abs(first.secondsTowardNextStack) < 1e-12);

  const thirdWithRemainder = advanceLingeringTunesKnownOnField(first, 3.25);
  assert.equal(thirdWithRemainder.stackCount, 3);
  assert.ok(Math.abs(thirdWithRemainder.secondsTowardNextStack - 0.25) < 1e-12);

  const capped = advanceLingeringTunesKnownOnField(thirdWithRemainder, 10);
  assert.equal(capped.stackCount, 4);
  assert.equal(capped.secondsTowardNextStack, 0);
  assert.deepEqual(resolveLingeringTunesKnownOnFieldBonus(capped), {
    effectId: 'S09_5PC_FIELD_ATK',
    statOrEffect: 'ATK%',
    stackCount: 4,
    valuePerStack: 0.05,
    totalValue: 0.20,
  });
});

test('caller-supplied entering state is required; the adapter never assumes zero/full stacks', () => {
  const supplied = createLingeringTunesKnownOnFieldState({
    ownerId: 'lingyang',
    stackCount: 2,
    secondsTowardNextStack: 0.75,
  });
  const advanced = advanceLingeringTunesKnownOnField(supplied, 0.75);
  assert.equal(advanced.stackCount, 3);
  assert.ok(Math.abs(advanced.secondsTowardNextStack) < 1e-12);

  assert.throws(
    () => createLingeringTunesKnownOnFieldState({ ownerId: 'lingyang', stackCount: 5, secondsTowardNextStack: 0 }),
    /stackCount/,
  );
  assert.throws(
    () => createLingeringTunesKnownOnFieldState({ ownerId: 'lingyang', stackCount: 1, secondsTowardNextStack: 1.5 }),
    /cadence phase/,
  );
  assert.throws(
    () => createLingeringTunesKnownOnFieldState({ ownerId: 'lingyang', stackCount: 4, secondsTowardNextStack: 0.1 }),
    /capped state/,
  );
  assert.throws(() => advanceLingeringTunesKnownOnField(supplied, -0.01), /non-negative/);
});

test('leaving field ends executable state because post-field lifetime/refresh semantics are unresolved', () => {
  const known = createLingeringTunesKnownOnFieldState({
    ownerId: 'lingyang',
    stackCount: 3,
    secondsTowardNextStack: 0.4,
  });
  const boundary = leaveLingeringTunesField(known);
  assert.equal(boundary.status, 'SOURCE_LIFECYCLE_UNRESOLVED');
  assert.equal(boundary.previousKnownState, known);
  assert.ok(boundary.unresolvedSemantics.some((note) => note.includes('resets')));
  assert.ok(boundary.unresolvedSemantics.some((note) => note.includes('cadence phase')));
});

test('Lingering Tunes contract validation fails closed on source-fact drift', () => {
  const drifted = SONATA_EFFECT_MODELS.map((effect) =>
    effect.effectId === 'S09_5PC_FIELD_ATK'
      ? { ...effect, stackIntervalSeconds: 2 }
      : effect,
  );
  const issues = validateLingeringTunesOnFieldContract(drifted);
  assert.ok(issues.some((issue) => issue.includes('cadence drift')));
});
