import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applySigrikaStandardRuneSourceEvent,
  createInitialSigrikaStandardRuneSourcePathState,
  SIGRIKA_STANDARD_RUNE_SOURCE_PATH,
  SIGRIKA_STANDARD_RUNE_SOURCE_PATH_ADAPTER_ID,
  SIGRIKA_STANDARD_RUNE_SOURCE_PATH_REVIEW,
  validateSigrikaStandardRuneSourcePathContract,
} from '../src/combat/sigrikaStandardRuneSourcePath.ts';
import { SIGRIKA_RESOURCE_STATE_CONTRACT } from '../src/combat/sigrikaResourceState.ts';

test('canonical Sigrika Rune source path resolves exact two-Rune checkpoints without timestamps', () => {
  assert.deepEqual(validateSigrikaStandardRuneSourcePathContract(), []);
  assert.equal(SIGRIKA_STANDARD_RUNE_SOURCE_PATH_ADAPTER_ID, 'sigrika-standard-rune-source-path-v1');
  assert.deepEqual(SIGRIKA_STANDARD_RUNE_SOURCE_PATH_REVIEW.closesPendingExecutionIds, [
    'character:sigrika:rune-lifecycle-adapter',
  ]);

  let state = createInitialSigrikaStandardRuneSourcePathState();
  state = applySigrikaStandardRuneSourceEvent(state, 'INTRO_CAST');
  state = applySigrikaStandardRuneSourceEvent(state, 'FIRST_ELUCIDATED_DIRECT_HIT');
  assert.deepEqual(state.runes, ['TRUST', 'TRUST']);
  assert.equal(state.fullStop, 0);

  state = applySigrikaStandardRuneSourceEvent(state, 'FIRST_SCHEMATA_CAST');
  assert.deepEqual(state.runes, []);
  assert.equal(state.fullStop, 50);
  assert.equal(state.firstRunicBranch, 'RUNIC_CHAIN_WHIP');

  state = applySigrikaStandardRuneSourceEvent(state, 'LIBERATION_CAST');
  state = applySigrikaStandardRuneSourceEvent(state, 'SECOND_ELUCIDATED_DIRECT_HIT');
  assert.deepEqual(state.runes, ['TRUST', 'ANSWER']);
  assert.equal(state.fullStop, 50);

  state = applySigrikaStandardRuneSourceEvent(state, 'SECOND_SCHEMATA_CAST');
  assert.deepEqual(state, SIGRIKA_STANDARD_RUNE_SOURCE_PATH);
  assert.deepEqual(state.runes, []);
  assert.equal(state.fullStop, 100);
  assert.equal(state.secondRunicBranch, 'RUNIC_OUTBURST');
  assert.equal(state.exactActionTimestampsAvailable, false);
  assert.equal(state.genericTimedStateSimulationUsed, false);
});

test('canonical Rune source path fails closed on skipped or reordered source events', () => {
  const initial = createInitialSigrikaStandardRuneSourcePathState();
  assert.throws(
    () => applySigrikaStandardRuneSourceEvent(initial, 'FIRST_ELUCIDATED_DIRECT_HIT'),
    /expected Intro/,
  );

  const afterIntro = applySigrikaStandardRuneSourceEvent(initial, 'INTRO_CAST');
  assert.throws(
    () => applySigrikaStandardRuneSourceEvent(afterIntro, 'FIRST_SCHEMATA_CAST'),
    /TRUST\+TRUST/,
  );
});

test('profile Rune closure does not relax generic timed or >2-Rune fail-closed semantics', () => {
  assert.equal(SIGRIKA_RESOURCE_STATE_CONTRACT.convergent.durationSeconds, 20);
  assert.equal(SIGRIKA_RESOURCE_STATE_CONTRACT.divergent.durationSeconds, 20);
  assert.equal(SIGRIKA_RESOURCE_STATE_CONTRACT.rune.selectionWhenMoreThanTwoRunes, 'UNMODELED_FAIL_CLOSED');
  assert.ok(SIGRIKA_STANDARD_RUNE_SOURCE_PATH_REVIEW.boundaries.some((note) => note.includes('does not replace sigrika-resource-state-v1')));
  assert.ok(SIGRIKA_STANDARD_RUNE_SOURCE_PATH_REVIEW.boundaries.some((note) => note.includes('>2-Rune')));
});
