import { performance } from 'node:perf_hooks';
import { emptyResourceInventory } from '../src/resourceInventory.ts';
import { optimizeTubesToCheckpoint, optimizeTubeCheckpointHorizon, TubeSearchError } from '../src/echoExactTubeSpending.ts';
import type { ExactResourceState } from '../src/echoExactTubeSpending.ts';
const ids = ['premium', 'advanced', 'medium', 'basic'] as const;
function state(exp: number, stock: (number | 'U')[]): ExactResourceState {
  return { revision: 0, progress: { cumulativeEchoEXP: exp, tunedThrough: 0 }, inventory: {
    ...emptyResourceInventory(), tubes: Object.fromEntries(ids.map((id, i) => [id, stock[i] === 'U'
      ? { kind: 'UNLIMITED' } : { kind: 'FINITE', count: stock[i] }])) as ExactResourceState['inventory']['tubes'],
  } };
}
const cases = [
  ['small +5', () => optimizeTubesToCheckpoint(state(0, [8, 8, 8, 8]), 5, 0)],
  ['realistic +25', () => optimizeTubesToCheckpoint(state(0, [30, 8, 8, 8]), 25, 0)],
  ['large mixed finite', () => optimizeTubesToCheckpoint(state(0, [30, 20, 20, 20]), 25, 0)],
  ['large mixed explicit 1m work', () => optimizeTubesToCheckpoint(state(0, [30, 20, 20, 20]), 25, 0, { maxSearchWork: 1000000 })],
  ['adversarial safe-integer inventory', () => optimizeTubesToCheckpoint(state(0, ids.map(() => Number.MAX_SAFE_INTEGER)), 25, 0)],
  ['one unlimited Gold', () => optimizeTubesToCheckpoint(state(140000, ['U', 8, 8, 8]), 25, 0)],
  ['one unlimited Blue with finite Gold', () => optimizeTubesToCheckpoint(state(140000, [8, 8, 'U', 8]), 25, 0)],
  ['bounded unlimited Blue', () => optimizeTubesToCheckpoint(state(140000, [8, 8, 'U', 8]), 25, 0, { maxSuppliedEXP: 21000 })],
  ['several unlimited', () => optimizeTubesToCheckpoint(state(140000, ['U', 'U', 'U', 8]), 25, 0)],
  ...([5, 10, 15, 20, 25] as const).map(target => [`all-unlimited +${target}`, () => optimizeTubesToCheckpoint(state(0, ['U', 'U', 'U', 'U']), target, 0)] as const),
  ['all-unlimited horizon', () => optimizeTubeCheckpointHorizon(state(0, ['U', 'U', 'U', 'U']), [5, 10, 15, 20, 25], 0)],
  ['finite horizon', () => optimizeTubeCheckpointHorizon(state(0, [3, 3, 3, 3]), [5, 10], 0)],
] as const;
for (const [name, run] of cases) {
  const started = performance.now();
  let outcome;
  try { const paths = run(); outcome = { status: 'COMPLETE', frontier: paths.length }; }
  catch (e) { if (e instanceof TubeSearchError) outcome = { status: e.code }; else if (e instanceof RangeError) outcome = { status: 'SAFE_INTEGER_REJECTED', reason: e.message }; else throw e; }
  console.log(JSON.stringify({ name, ...outcome, ms: +(performance.now() - started).toFixed(2) }));
}
