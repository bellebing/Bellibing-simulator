import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyResourceInventory } from '../src/resourceInventory.ts';
import {
  checkpointEligibleAtEXP, decomposeMaxOverflow, spendExactTubes,
  tuneEligibleCheckpoint, optimizeTubesToCheckpoint, optimizeTubeCheckpointHorizon, MAX_RANK5_ECHO_EXP,
  validateExactResourceState, resourceStateDominates, TubeSearchError,
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
test('all unlimited stock stays symbolic; equivalent multisets share a cap witness', () => {
  const state = fixture(0, tubes(), true);
  const paths = optimizeTubesToCheckpoint(state, 5, 0);
  assert.equal(paths.length, 1);
  assert.equal(paths[0].transaction.state.progress.cumulativeEchoEXP, MAX_RANK5_ECHO_EXP);
  assert.deepEqual(paths[0].spent, tubes(28, 1, 1));
  const bounded = optimizeTubesToCheckpoint(state, 5, 0, { maxSuppliedEXP: 4500 });
  assert.deepEqual(bounded[0].spent, tubes(0, 2, 0, 1));
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

test('finite inventory lookahead retains resource-sensitive paths and EXP carry', () => {
  const s = fixture(0, tubes(3, 2, 0, 1));
  const paths = optimizeTubeCheckpointHorizon(s, [5, 10], 0);
  assert.ok(paths.length > 0);
  assert.ok(paths.every(p => p.state.progress.cumulativeEchoEXP >= 16500));
  assert.ok(paths.every(p => p.steps.length >= 1 && p.steps.length <= 2));
  assert.ok(paths.some(p => p.steps[0]?.transaction.ledger.expAfter === 4500));
});

const ids = ['premium', 'advanced', 'medium', 'basic'] as const;
const values = [5000, 2000, 1000, 500] as const;
const expOf = (c: TubeCounts) => ids.reduce((sum, id, i) => sum + c[id] * values[i], 0);
const key = (s: ExactResourceState) => JSON.stringify([s.progress.cumulativeEchoEXP,
  ...ids.map(id => s.inventory.tubes[id].kind === 'FINITE' ? s.inventory.tubes[id].count : 'U')]);
function stockOf(s: ExactResourceState): number[] {
  return ids.map(id => {
    const q = s.inventory.tubes[id];
    assert.equal(q.kind, 'FINITE');
    return q.kind === 'FINITE' ? q.count : 0;
  });
}
// Independent exhaustive small-stock oracle: no production transaction,
// enumeration bound, dominance function or overflow decomposition is reused.
function oracle(exp: number, stock: TubeCounts, threshold: number, maxEXP = Infinity): string[] {
  const outcomes = new Map<string, number[]>();
  for (let g = 0; g <= stock.premium; g++)
    for (let p = 0; p <= stock.advanced; p++)
      for (let b = 0; b <= stock.medium; b++)
        for (let r = 0; r <= stock.basic; r++) {
          const spent = [g, p, b, r];
          const supplied = spent.reduce((sum, n, i) => sum + n * values[i], 0);
          if (!supplied || supplied > maxEXP || exp + supplied < threshold) continue;
          const afterEXP = Math.min(142600, exp + supplied);
          let excess = Math.max(0, exp + supplied - 142600);
          const after = ids.map((id, i) => {
            const returned = Math.floor(excess / values[i]);
            excess -= returned * values[i];
            return stock[id] - spent[i] + returned;
          });
          const row = [afterEXP, ...after];
          outcomes.set(JSON.stringify(row), row);
        }
  const rows = [...outcomes.values()];
  return rows.filter(a => !rows.some(b => a !== b && a[0] === b[0] &&
    b.slice(1).every((n, i) => n >= a[i + 1]) && b.slice(1).some((n, i) => n > a[i + 1])))
    .map(row => JSON.stringify(row)).sort();
}
test('exhaustive independent oracle preserves carry and cap denomination frontiers', () => {
  for (const exp of [0, 1, 4000, 16001, 140000, 141100, 142599]) {
    const target = exp < 4400 ? 5 : exp < 16500 ? 10 : 25;
    const threshold = target === 5 ? 4400 : target === 10 ? 16500 : 142600;
    for (let g = 0; g <= 2; g++) for (let p = 0; p <= 2; p++)
      for (let b = 0; b <= 2; b++) for (let r = 0; r <= 2; r++) {
        const stock = tubes(g, p, b, r), s = fixture(exp, stock);
        assert.deepEqual(optimizeTubesToCheckpoint(s, target, 0).map(p => key(p.transaction.state)).sort(),
          oracle(exp, stock, threshold), JSON.stringify({ exp, stock }));
      }
  }
});
test('deliberate multi-item overspend transforms Blue to Gold beyond the old bound', () => {
  const s = fixture(141600, tubes(0, 0, 11));
  const paths = optimizeTubesToCheckpoint(s, 25, 0);
  const transformed = paths.find(p => p.spent.medium === 11)!;
  assert.ok(transformed);
  assert.equal(transformed.transaction.ledger.suppliedEXP, 11000);
  assert.deepEqual(transformed.transaction.ledger.returned, tubes(2));
  assert.deepEqual(stockOf(transformed.transaction.state), [2, 0, 0, 0]);
  const minimal = spendExactTubes(s, tubes(0, 0, 1), 0).state;
  assert.deepEqual(stockOf(minimal), [0, 0, 10, 0]);
  assert.equal(resourceStateDominates(minimal, transformed.transaction.state), false);
  assert.equal(resourceStateDominates(transformed.transaction.state, minimal), false);
  // A later fresh Echo has different executable choices in these inventories.
  assert.equal(spendExactTubes({ ...fixture(), inventory: transformed.transaction.state.inventory }, tubes(1), 0)
    .state.progress.cumulativeEchoEXP, 5000);
  assert.throws(() => spendExactTubes({ ...fixture(), inventory: minimal.inventory }, tubes(1), 0), /Insufficient/);
  assert.deepEqual(paths.map(p => key(p.transaction.state)).sort(), oracle(141600, tubes(0, 0, 11), 142600));
});
test('higher exact EXP alone cannot dominate before denomination returns', () => {
  const a = fixture(141600, tubes(1)), b = fixture(141100, tubes(1));
  assert.equal(resourceStateDominates(a, b), false);
  const x = spendExactTubes(a, tubes(1), 0).state, y = spendExactTubes(b, tubes(1), 0).state;
  assert.deepEqual(stockOf(x), [0, 2, 0, 0]);
  assert.deepEqual(stockOf(y), [0, 1, 1, 1]);
  assert.equal(resourceStateDominates(x, y), false);
  assert.equal(resourceStateDominates(y, x), false);
});
test('dominance requires matching tuning and all future resource dimensions', () => {
  const s = fixture(5000), richer = fixture(5000, tubes(9, 8, 8, 8));
  assert.equal(resourceStateDominates(richer, s), true);
  assert.equal(resourceStateDominates(s, richer), false);
  assert.equal(resourceStateDominates({ ...richer, progress: { ...richer.progress, tunedThrough: 5 } }, s), false);
  for (const id of ['echoes', 'tuners'] as const) {
    const a = { ...richer, inventory: { ...richer.inventory, [id]: { kind: 'FINITE' as const, count: 0 } } };
    const b = { ...s, inventory: { ...s.inventory, [id]: { kind: 'FINITE' as const, count: 1 } } };
    assert.equal(resourceStateDominates(a, b), false);
  }
  const u = fixture(5000, tubes(), true);
  assert.equal(resourceStateDominates(u, s), true);
  assert.equal(resourceStateDominates(s, u), false);
});
test('same visible checkpoint retains distinct exact future requirements', () => {
  const stock = tubes(0, 0, 0, 24);
  assert.deepEqual(optimizeTubesToCheckpoint(fixture(4400, stock), 10, 0), []);
  assert.ok(optimizeTubesToCheckpoint(fixture(4500, stock), 10, 0).some(p => p.spent.basic === 24));
});
test('lookahead matches exhaustive final outcomes and defeats Gold-first greedy', () => {
  const stock = tubes(3, 3, 0, 1), s = fixture(0, stock);
  const paths = optimizeTubeCheckpointHorizon(s, [5, 10], 0);
  assert.deepEqual(paths.map(p => key(p.state)).sort(), oracle(0, stock, 16500));
  const planned = paths.find(p => p.state.progress.cumulativeEchoEXP === 16500)!;
  assert.ok(planned);
  assert.deepEqual(stockOf(planned.state), [1, 0, 0, 0]);
  const greedyFirst = spendExactTubes(s, tubes(1), 0);
  const greedyLast = spendExactTubes(greedyFirst.state, tubes(2, 1), 1);
  assert.equal(greedyLast.state.progress.cumulativeEchoEXP, 17000);
  assert.equal(greedyLast.state.inventory.tubes.premium.kind === 'FINITE' && greedyLast.state.inventory.tubes.premium.count, 0);
  assert.equal(resourceStateDominates(greedyLast.state, planned.state), false);
  // Every witness can be replayed against its own consecutive owner revision.
  for (const path of paths) {
    let replay = s;
    for (const step of path.steps) replay = spendExactTubes(replay, step.spent, replay.revision).state;
    assert.deepEqual(replay, path.state);
  }
});
test('unlimited smaller stock with finite Gold reports unbounded, or searches an explicit bound', () => {
  for (const id of ['advanced', 'medium', 'basic'] as const) {
    const s = fixture(141600, tubes());
    const mixed = { ...s, inventory: { ...s.inventory, tubes: { ...s.inventory.tubes, [id]: { kind: 'UNLIMITED' as const } } } };
    assert.throws(() => optimizeTubesToCheckpoint(mixed, 25, 0),
      (e: unknown) => e instanceof TubeSearchError && e.code === 'UNBOUNDED_FRONTIER');
    const paths = optimizeTubesToCheckpoint(mixed, 25, 0, { maxSuppliedEXP: 21000 });
    assert.ok(paths.length > 0);
    assert.ok(paths.every(p => p.transaction.ledger.suppliedEXP <= 21000));
    assert.ok(paths.every(p => p.transaction.state.inventory.tubes[id].kind === 'UNLIMITED'));
    const lower = spendExactTubes(mixed, { ...tubes(), [id]: 20 }, 0).state;
    const higher = spendExactTubes(mixed, { ...tubes(), [id]: 40 }, 0).state;
    assert.equal(resourceStateDominates(higher, lower), true);
  }
});
test('Gold cancellation bound agrees with full enumeration including excessive Gold', () => {
  const stock = tubes(8, 4, 3, 4), exp = 141600;
  assert.deepEqual(optimizeTubesToCheckpoint(fixture(exp, stock), 25, 0).map(p => key(p.transaction.state)).sort(),
    oracle(exp, stock, 142600));
});
test('unlimited Gold supports smaller denomination residues without a fake inventory count', () => {
  const s = fixture(140000, tubes(0, 3, 3, 3));
  const mixed = { ...s, inventory: { ...s.inventory, tubes: { ...s.inventory.tubes, premium: { kind: 'UNLIMITED' as const } } } };
  const actual = optimizeTubesToCheckpoint(mixed, 25, 0);
  // Enumerate well beyond the proven Gold bound, then ignore symbolic Gold.
  const exhaustive = new Map<string, ExactResourceState>();
  for (let g = 0; g <= 6; g++) for (let p = 0; p <= 3; p++)
    for (let b = 0; b <= 3; b++) for (let r = 0; r <= 3; r++) {
      const c = tubes(g, p, b, r);
      if (expOf(c) < 2600) continue;
      const outcome = spendExactTubes(mixed, c, 0).state;
      exhaustive.set(key(outcome), outcome);
    }
  const rows = [...exhaustive.values()];
  const expected = rows.filter(a => !rows.some(b => a !== b && resourceStateDominates(b, a))).map(key).sort();
  assert.deepEqual(actual.map(p => key(p.transaction.state)).sort(), expected);
});
test('work guards fail closed for huge finite inventories and share horizon budget', () => {
  assert.throws(() => optimizeTubesToCheckpoint(fixture(0, tubes(1e9, 1e9, 1e9, 1e9)), 25, 0, { maxSearchWork: 1000 }),
    (e: unknown) => e instanceof TubeSearchError && e.code === 'SEARCH_LIMIT');
  assert.throws(() => optimizeTubeCheckpointHorizon(fixture(0, tubes(3, 3, 3, 3)), [5, 10], 0, { maxSearchWork: 1000 }),
    (e: unknown) => e instanceof TubeSearchError && e.code === 'SEARCH_LIMIT');
  assert.deepEqual(optimizeTubesToCheckpoint(fixture(0, tubes()), 25, 0), []);
});
test('all-unlimited five-checkpoint horizon terminates with one symbolic cap witness', () => {
  const paths = optimizeTubeCheckpointHorizon(fixture(0, tubes(), true), [5, 10, 15, 20, 25], 0, { maxSearchWork: 20 });
  assert.equal(paths.length, 1);
  assert.equal(paths[0].steps.length, 1);
  assert.equal(paths[0].state.progress.cumulativeEchoEXP, 142600);
  assert.ok(ids.every(id => paths[0].state.inventory.tubes[id].kind === 'UNLIMITED'));
});
test('transaction conservation, exact deductions and general remainders over deterministic properties', () => {
  let seed = 15;
  const random = (max: number) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % max; };
  for (let n = 0; n < 400; n++) {
    const exp = random(142600), c = tubes(random(40), random(40), random(40), 1 + random(40));
    const s = fixture(exp, tubes(50, 50, 50, 50)), bytes = JSON.stringify(s);
    const { state, ledger } = spendExactTubes(s, c, 0);
    assert.equal(ledger.expBefore + ledger.suppliedEXP, ledger.expAfter + expOf(ledger.returned) + ledger.unrepresentableEXP);
    assert.equal(ledger.overflowEXP, expOf(ledger.returned) + ledger.unrepresentableEXP);
    assert.equal(ledger.suppliedEXP, expOf(c));
    assert.ok(ledger.unrepresentableEXP >= 0 && ledger.unrepresentableEXP < 500);
    assert.equal(ledger.unrepresentableEXP, ledger.overflowEXP % 500);
    for (const id of ids) {
      const after = state.inventory.tubes[id];
      assert.equal(after.kind === 'FINITE' && after.count, 50 - c[id] + ledger.returned[id]);
    }
    assert.equal(state.progress.tunedThrough, 0);
    assert.equal(state.revision, 1);
    assert.equal(JSON.stringify(s), bytes);
  }
  for (let overflow = 0; overflow < 20000; overflow += 37) {
    const d = decomposeMaxOverflow(overflow);
    assert.equal(expOf(d.returned) + d.unrepresentableEXP, overflow);
    assert.equal(d.unrepresentableEXP, overflow % 500);
  }
});
test('fresh Tube-only cap always loses 400, while general EXP states may lose other remainders', () => {
  for (const c of [tubes(29), tubes(0, 72), tubes(0, 0, 143), tubes(0, 0, 0, 286), tubes(35, 10, 7, 9)]) {
    const s = fixture(0, c);
    const tx = spendExactTubes(s, c, 0);
    assert.equal(tx.ledger.expAfter, 142600);
    assert.equal(tx.ledger.unrepresentableEXP, 400);
  }
  const tx = spendExactTubes(fixture(142599), tubes(0, 0, 0, 1), 0);
  assert.equal(tx.ledger.unrepresentableEXP, 499);
});
test('validation and failed transactions preserve state and enforce separate successive tuning', () => {
  const s = fixture(16500), bytes = JSON.stringify(s);
  assert.throws(() => validateExactResourceState({ ...s, progress: { cumulativeEchoEXP: 4400, tunedThrough: 10 } }));
  for (const invalid of [-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => spendExactTubes(s, tubes(invalid), 0));
    assert.throws(() => tuneEligibleCheckpoint(s, invalid));
    assert.throws(() => optimizeTubesToCheckpoint(s, 25, invalid));
  }
  assert.throws(() => spendExactTubes(s, tubes(1, 99), 0), /Insufficient/);
  assert.throws(() => spendExactTubes(s, tubes(), 0), /advance/);
  assert.throws(() => spendExactTubes(fixture(142600), tubes(1), 0), /cap/);
  assert.equal(JSON.stringify(s), bytes);
  const first = tuneEligibleCheckpoint(s, 0), second = tuneEligibleCheckpoint(first, 1);
  assert.equal(first.progress.tunedThrough, 5);
  assert.equal(second.progress.tunedThrough, 10);
  assert.equal(second.inventory.tuners.kind === 'FINITE' && second.inventory.tuners.count, 30);
  assert.throws(() => tuneEligibleCheckpoint(second, 2), /eligible/);
  assert.throws(() => tuneEligibleCheckpoint(second, 1), /Stale/);
});
test('ledger, input inventory and resulting state are independent snapshots', () => {
  const s = fixture(), tx = spendExactTubes(s, tubes(1), 0);
  assert.notEqual(tx.ledger.before, s.inventory);
  assert.notEqual(tx.ledger.after, tx.state.inventory);
  const snapshot = JSON.stringify(tx.state);
  const mutableBefore = tx.ledger.before.tubes.premium as { kind: 'FINITE'; count: number };
  const mutableAfter = tx.ledger.after.tubes.premium as { kind: 'FINITE'; count: number };
  mutableBefore.count = 123;
  mutableAfter.count = 456;
  assert.equal(JSON.stringify(tx.state), snapshot);
  assert.equal(s.inventory.tubes.premium.kind === 'FINITE' && s.inventory.tubes.premium.count, 8);
});

test('several symbolic denominations with unlimited Gold match larger exhaustive search', () => {
  const s = fixture(141600, tubes(0, 0, 0, 2));
  const mixed = { ...s, inventory: { ...s.inventory, tubes: {
    premium: { kind: 'UNLIMITED' as const }, advanced: { kind: 'UNLIMITED' as const },
    medium: { kind: 'UNLIMITED' as const }, basic: s.inventory.tubes.basic,
  } } };
  const actual = optimizeTubesToCheckpoint(mixed, 25, 0);
  const exhaustive = new Map<string, ExactResourceState>();
  for (let g = 0; g <= 4; g++) for (let p = 0; p <= 15; p++)
    for (let b = 0; b <= 15; b++) for (let r = 0; r <= 2; r++) {
      const c = tubes(g, p, b, r);
      if (expOf(c) < 1000) continue;
      const outcome = spendExactTubes(mixed, c, 0).state;
      exhaustive.set(key(outcome), outcome);
    }
  const rows = [...exhaustive.values()];
  assert.deepEqual(actual.map(p => key(p.transaction.state)).sort(),
    rows.filter(a => !rows.some(b => a !== b && resourceStateDominates(b, a))).map(key).sort());
});
test('explicit transaction bounds match the independent oracle and distinguish infeasible from limited', () => {
  const stock = tubes(2, 3, 4, 5);
  for (const maxSuppliedEXP of [0, 999, 1000, 5999, 11000, 21000]) {
    assert.deepEqual(optimizeTubesToCheckpoint(fixture(141600, stock), 25, 0, { maxSuppliedEXP })
      .map(p => key(p.transaction.state)).sort(), oracle(141600, stock, 142600, maxSuppliedEXP));
  }
  for (const options of [{ maxSearchWork: 0 }, { maxSearchWork: -1 }, { maxSuppliedEXP: .5 }]) {
    assert.throws(() => optimizeTubesToCheckpoint(fixture(), 5, 0, options), RangeError);
  }
  assert.throws(() => optimizeTubeCheckpointHorizon(fixture(), [10, 5], 0));
  assert.throws(() => optimizeTubesToCheckpoint(fixture(), 5, 1), /Stale/);
  assert.throws(() => optimizeTubeCheckpointHorizon(fixture(), [5], 1), /Stale/);
});

test('safe-integer overflow fails closed without changing inventory or revision', () => {
  const s = fixture(141600, tubes(Number.MAX_SAFE_INTEGER, 0, 11));
  const bytes = JSON.stringify(s);
  assert.throws(() => spendExactTubes(s, tubes(0, 0, 11), 0), /safe integer/);
  assert.throws(() => optimizeTubesToCheckpoint(s, 25, 0), /safe integer/);
  assert.equal(JSON.stringify(s), bytes);
  assert.throws(() => spendExactTubes({ ...fixture(), revision: Number.MAX_SAFE_INTEGER }, tubes(1), Number.MAX_SAFE_INTEGER), /safe integer/);
});
