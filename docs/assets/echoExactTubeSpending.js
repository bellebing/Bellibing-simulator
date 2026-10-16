// Browser projection of the verified source contracts in src/echoExactTubeSpending.ts.
// This bounded V1 surface is regression-compared with the canonical TS domain.
import { CHECKPOINT_CUMULATIVE_COST } from './echoCoreRules.js';
import { ECHO_TUBES, readResourceInventory } from './resourceInventory.js';

const levels = [0, 5, 10, 15, 20, 25];
const ids = ['premium', 'advanced', 'medium', 'basic'];
const values = Object.fromEntries(ECHO_TUBES.map(row => [row.id, row.echoExp]));
const cap = CHECKPOINT_CUMULATIVE_COST[25].exp;
function whole(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(label + ' must be a whole non-negative safe integer');
}
function safeAdd(a, b) {
  const n = a + b;
  if (!Number.isSafeInteger(n)) throw new RangeError('Resource arithmetic exceeded safe integer range');
  return n;
}
function quantity(q, spent, returned = 0) {
  if (q.kind === 'UNLIMITED') return { kind: 'UNLIMITED' };
  if (spent > q.count) throw new RangeError('Insufficient finite resources');
  return { kind: 'FINITE', count: safeAdd(q.count - spent, returned) };
}
export function checkpointEligibleAtEXP(exp) {
  whole(exp, 'EXP');
  if (exp > cap) throw new RangeError('EXP exceeds +25 cap');
  return levels.filter(level => CHECKPOINT_CUMULATIVE_COST[level].exp <= exp).at(-1);
}
function validate(state) {
  whole(state.revision, 'revision');
  const eligible = checkpointEligibleAtEXP(state.progress.cumulativeEchoEXP);
  if (!levels.includes(state.progress.tunedThrough) || state.progress.tunedThrough > eligible)
    throw new RangeError('Tuned checkpoint cannot exceed EXP eligibility');
  readResourceInventory(state.inventory);
}
function decomposeMaxOverflow(overflow) {
  whole(overflow, 'overflow');
  let remainder = overflow;
  const returned = { premium: 0, advanced: 0, medium: 0, basic: 0 };
  for (const id of ids) {
    returned[id] = Math.floor(remainder / values[id]);
    remainder %= values[id];
  }
  return { returned, unrepresentableEXP: remainder };
}
export function spendExactTubes(state, selected, expectedRevision) {
  validate(state); whole(expectedRevision, 'expectedRevision');
  if (expectedRevision !== state.revision) throw new Error('Stale resource revision');
  const inventory = readResourceInventory(state.inventory);
  if (!selected || ids.some(id => !Object.hasOwn(selected, id))) throw new RangeError('Four Tube counts required');
  const spent = {};
  let suppliedEXP = 0;
  for (const id of ids) {
    whole(selected[id], id); spent[id] = selected[id];
    if (inventory.tubes[id].kind === 'FINITE' && spent[id] > inventory.tubes[id].count)
      throw new RangeError('Insufficient finite Tubes: ' + id);
    suppliedEXP = safeAdd(suppliedEXP, spent[id] * values[id]);
  }
  if (suppliedEXP === 0) throw new RangeError('Tube spend must advance EXP');
  const expBefore = state.progress.cumulativeEchoEXP;
  if (expBefore >= cap) throw new RangeError('Echo is already at +25 cap');
  const raw = safeAdd(expBefore, suppliedEXP), expAfter = Math.min(cap, raw);
  const overflowEXP = Math.max(0, raw - cap);
  const { returned, unrepresentableEXP } = decomposeMaxOverflow(overflowEXP);
  const after = readResourceInventory({ ...inventory, tubes: Object.fromEntries(ids.map(id =>
    [id, quantity(inventory.tubes[id], spent[id], returned[id])])) });
  const crossed = levels.filter(level => level > 0
    && CHECKPOINT_CUMULATIVE_COST[level].exp > expBefore
    && CHECKPOINT_CUMULATIVE_COST[level].exp <= expAfter);
  return {
    state: { revision: safeAdd(state.revision, 1), progress: { ...state.progress, cumulativeEchoEXP: expAfter }, inventory: after },
    ledger: { before: inventory, spent, returned, after, expBefore, suppliedEXP, expAfter,
      overflowEXP, unrepresentableEXP, crossed, eligibleThrough: checkpointEligibleAtEXP(expAfter) }
  };
}
export function tuneEligibleCheckpoint(state, expectedRevision) {
  validate(state); whole(expectedRevision, 'expectedRevision');
  if (expectedRevision !== state.revision) throw new Error('Stale resource revision');
  const next = levels[levels.indexOf(state.progress.tunedThrough) + 1];
  if (next === undefined || checkpointEligibleAtEXP(state.progress.cumulativeEchoEXP) < next)
    throw new RangeError('Next tuning checkpoint not EXP-eligible');
  const inventory = readResourceInventory(state.inventory);
  return { revision: safeAdd(state.revision, 1),
    progress: { ...state.progress, tunedThrough: next },
    inventory: { ...inventory, tuners: quantity(inventory.tuners, 10) } };
}
