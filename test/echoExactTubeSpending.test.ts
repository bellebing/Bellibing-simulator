import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyResourceInventory } from '../src/resourceInventory.ts';
import {
  checkpointEligibleAtEXP, decomposeMaxOverflow, spendExactTubes,
  tuneEligibleCheckpoint, optimizeTubesToCheckpoint, MAX_RANK5_ECHO_EXP,
} from '../src/echoExactTubeSpending.ts';
import type { ExactResourceState, TubeCounts } from '../src/echoExactTubeSpending.ts';
const tubes = (premium=0, advanced=0, medium=0, basic=0): TubeCounts =>
  ({ premium, advanced, medium, basic });
function fixture(exp = 0, stock = tubes(8, 8, 8, 8), unlimited = false): ExactResourceState {
  const inventory = emptyResourceInventory();
  const quantity = (count: number) => unlimited ? { kind: 'UNLIMITED' as const } : { kind: 'FINITE' as const, count };
  return { revision: 0, progress: { cumulativeEchoEXP: exp, tunedThrough: 0 },
    inventory: { ...inventory, tuners: quantity(50),
      tubes: { premium: quantity(stock.premium), advanced: quantity(stock.advanced),
        medium: quantity(stock.medium), basic: quantity(stock.basic) } } };
}
test('carry to +5 and exact continuation to +10', () => {
  const a = spendExactTubes(fixture(), tubes(0, 2, 0, 1), 0);
  assert.equal(a.state.progress.cumulativeEchoEXP, 4500);
  assert.deepEqual(a.ledger.crossed, [5]);
  assert.equal(a.ledger.eligibleThrough, 5);
  const b = spendExactTubes(a.state, tubes(2, 1), 1);
  assert.equal(b.state.progress.cumulativeEchoEXP, 16500);
  assert.deepEqual(b.ledger.crossed, [10]);
  assert.equal(a.state.progress.tunedThrough, 0);
  assert.throws(() => tuneEligibleCheckpoint(a.state, 0), /Stale/);
  const tuned = tuneEligibleCheckpoint(a.state, 1);
  assert.equal(tuned.progress.tunedThrough, 5);
  assert.equal(tuned.inventory.tuners.kind, 'FINITE');
  if (tuned.inventory.tuners.kind === 'FINITE') assert.equal(tuned.inventory.tuners.count, 40);
});
test('intermediate overshoot stays and changes later cost', () => {
  const a = spendExactTubes(fixture(16500), tubes(5), 0);
  assert.equal(a.state.progress.cumulativeEchoEXP, 41500);
  assert.equal(a.ledger.overflowEXP, 0);
  assert.equal(checkpointEligibleAtEXP(41500), 15);
  assert.equal(39600 - 4500, 35100);
  assert.equal(39600 - 4400, 35200);
});
test('finite zero rejects atomically; stale revision fails closed', () => {
  const s = fixture(0, tubes());
  assert.throws(() => spendExactTubes(s, tubes(1), 0), /Insufficient/);
  assert.equal(s.inventory.tubes.premium.kind, 'FINITE');
  const a = spendExactTubes(fixture(), tubes(1), 0);
  assert.throws(() => spendExactTubes(a.state, tubes(1), 0), /Stale/);
});
test('overflow decomposes generally, never applies 75 percent', () => {
  assert.deepEqual(decomposeMaxOverflow(8900), { returned: tubes(1, 1, 1, 1), unrepresentableEXP: 400 });
  const a = spendExactTubes(fixture(140000), tubes(1), 0);
  assert.equal(a.state.progress.cumulativeEchoEXP, MAX_RANK5_ECHO_EXP);
  assert.equal(a.ledger.overflowEXP, 2400);
  assert.deepEqual(a.ledger.returned, tubes(0, 1, 0, 0));
  assert.equal(a.ledger.unrepresentableEXP, 400);
  if (a.state.inventory.tubes.advanced.kind === 'FINITE') assert.equal(a.state.inventory.tubes.advanced.count, 9);
});
test('tube-only reachability is in multiples of 500', () => {
  assert.equal(MAX_RANK5_ECHO_EXP % 500, 100);
  assert.equal(Math.ceil(MAX_RANK5_ECHO_EXP / 500) * 500, 143000);
  const a = spendExactTubes(fixture(140000), tubes(0, 0, 3), 0);
  assert.equal(a.ledger.unrepresentableEXP, 400);
});
test('all unlimited stock stays symbolic and optimizer finds alternatives', () => {
  const state = fixture(0, tubes(), true);
  const paths = optimizeTubesToCheckpoint(state, 5, 0);
  assert.ok(paths.length > 0);
  assert.ok(paths.some(p => p.spent.premium === 1));
  assert.ok(paths.some(p => p.spent.advanced === 2 && p.spent.basic === 1));
  for (const p of paths) {
    assert.equal(p.transaction.state.inventory.tubes.premium.kind, 'UNLIMITED');
    assert.ok(p.transaction.state.progress.cumulativeEchoEXP >= 4400);
  }
});
test('tuner spending is separate and insufficient tuners fail', () => {
  const state = fixture(4500);
  const noTuners: ExactResourceState = { ...state, inventory: { ...state.inventory, tuners: { kind: 'FINITE', count: 9 } } };
  assert.throws(() => tuneEligibleCheckpoint(noTuners, 0), /Insufficient/);
  assert.equal(noTuners.progress.tunedThrough, 0);
});
