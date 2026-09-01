import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AEMEATH_CHISA_NEGATIVE_STATUS_PREDECESSOR_CONTRACT_20260901,
  createCanonicalAemeathChisaNegativeStatusEntryState,
  validateAemeathChisaNegativeStatusPredecessorContract,
} from '../src/combat/aemeathChisaNegativeStatusPredecessorState.ts';

test('canonical Chisa predecessor contract locks the source-supported Chisa -> Denia -> Aemeath entry state', () => {
  assert.deepEqual(validateAemeathChisaNegativeStatusPredecessorContract(), []);
  assert.equal(
    AEMEATH_CHISA_NEGATIVE_STATUS_PREDECESSOR_CONTRACT_20260901.closesPendingExecutionId,
    'incoming:chisa:aemeath-negative-status-predecessor-state',
  );

  const state = createCanonicalAemeathChisaNegativeStatusEntryState();
  assert.deepEqual(state.handoffOrder, ['chisa', 'denia', 'aemeath']);
  assert.equal(state.resonantThreadOfClosureActiveAtAemeathEntry, true);
  assert.equal(state.resonantThreadOfClosureDurationSeconds, 20);
  assert.equal(state.exactRemainingClosureSecondsAtAemeathEntry, null);
  assert.equal(state.targetNegativeStatusStackCapIncreaseAvailableOnAemeathHit, true);
});

test('Chisa predecessor closure does not fabricate Aemeath Thread of Bane uptime or inherit Denia state', () => {
  const state = createCanonicalAemeathChisaNegativeStatusEntryState();
  assert.equal(state.aemeathThreadOfBaneActiveAtEntry, false);
  assert.equal(state.aemeathCanTriggerThreadOfBaneByOwnFusionBurst, true);
  assert.equal(state.threadOfBaneDurationSeconds, 15);
  assert.equal(state.exactThreadOfBaneFullRotationUptimeProven, false);
});

test('Chisa predecessor review records the exact current-source boundary instead of a timestamp claim', () => {
  const contract = AEMEATH_CHISA_NEGATIVE_STATUS_PREDECESSOR_CONTRACT_20260901;
  assert.equal(contract.reviewedSourceAssertions.some((row) => row.includes('first character in all her teams')), true);
  assert.equal(contract.reviewedSourceAssertions.some((row) => row.includes('20-second Fallacy team buff')), true);
  assert.equal(contract.reviewedSourceAssertions.some((row) => row.includes('Chisa -> Denia -> Aemeath')), true);
  assert.equal(contract.notes.some((row) => row.includes('exact number of closure seconds remaining') && row.includes('null')), true);
  assert.equal(contract.notes.some((row) => row.includes('blanket full-rotation uptime')), true);
});
