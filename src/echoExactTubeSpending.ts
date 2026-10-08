import { CHECKPOINT_CUMULATIVE_COST } from './echoCoreRules.ts';
import { ECHO_TUBES, readResourceInventory } from './resourceInventory.ts';
import type { EchoLevel } from './echoCoreDomain.ts';
import type { ResourceInventory, TubeId, InventoryQuantity } from './resourceInventory.ts';

/**
 * Pure Rank-5 Tube economy. EXP and tuned checkpoints are independent:
 * reaching an EXP threshold makes tuning eligible; it never tunes implicitly.
 */
export interface ExactEchoProgress {
  readonly cumulativeEchoEXP: number;
  readonly tunedThrough: EchoLevel;
}
export interface ExactResourceState {
  readonly revision: number;
  readonly progress: ExactEchoProgress;
  readonly inventory: ResourceInventory;
}
export type TubeCounts = Readonly<Record<TubeId, number>>;
export interface TubeLedger {
  readonly before: ResourceInventory;
  readonly spent: TubeCounts;
  readonly returned: TubeCounts;
  readonly after: ResourceInventory;
  readonly expBefore: number;
  readonly suppliedEXP: number;
  readonly expAfter: number;
  readonly overflowEXP: number;
  readonly unrepresentableEXP: number;
  readonly crossed: readonly EchoLevel[];
  readonly eligibleThrough: EchoLevel;
}
export interface TubeTransaction {
  readonly state: ExactResourceState;
  readonly ledger: TubeLedger;
}
const LEVELS: readonly EchoLevel[] = [0, 5, 10, 15, 20, 25];
const IDS: readonly TubeId[] = ['premium', 'advanced', 'medium', 'basic'];
const VALUES: Readonly<Record<TubeId, number>> = Object.fromEntries(
  ECHO_TUBES.map(row => [row.id, row.echoExp]),
) as Record<TubeId, number>;
export const MAX_RANK5_ECHO_EXP = CHECKPOINT_CUMULATIVE_COST[25].exp;
const zeroCounts = (): Record<TubeId, number> =>
  ({ premium: 0, advanced: 0, medium: 0, basic: 0 });
function whole(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(name + ' must be a whole non-negative safe integer');
}
function addSafe(a: number, b: number): number {
  const sum = a + b;
  if (!Number.isSafeInteger(sum)) throw new RangeError('Resource arithmetic exceeded safe integer range');
  return sum;
}
function counts(value: TubeCounts): TubeCounts {
  if (!value || IDS.some(id => !(id in value))) throw new RangeError('Four Tube counts required');
  const result = zeroCounts();
  for (const id of IDS) { whole(value[id], id); result[id] = value[id]; }
  return result;
}
export function checkpointEligibleAtEXP(exp: number): EchoLevel {
  whole(exp, 'EXP');
  if (exp > MAX_RANK5_ECHO_EXP) throw new RangeError('EXP exceeds +25 cap');
  return LEVELS.filter(level => CHECKPOINT_CUMULATIVE_COST[level].exp <= exp).at(-1)!;
}
export function validateExactResourceState(state: ExactResourceState): void {
  whole(state.revision, 'revision');
  const exp = state.progress.cumulativeEchoEXP;
  const eligible = checkpointEligibleAtEXP(exp);
  if (!LEVELS.includes(state.progress.tunedThrough) || state.progress.tunedThrough > eligible) {
    throw new RangeError('Tuned checkpoint cannot exceed EXP eligibility');
  }
  readResourceInventory(state.inventory);
}
/** General overflow return, also valid for future non-500 EXP sources. */
export function decomposeMaxOverflow(overflow: number): { returned: TubeCounts; unrepresentableEXP: number } {
  whole(overflow, 'overflow');
  let remaining = overflow;
  const returned = zeroCounts();
  for (const id of IDS) {
    returned[id] = Math.floor(remaining / VALUES[id]);
    remaining %= VALUES[id];
  }
  return { returned, unrepresentableEXP: remaining };
}
function mutateQuantity(quantity: InventoryQuantity, spent: number, returned: number): InventoryQuantity {
  if (quantity.kind === 'UNLIMITED') return quantity;
  if (spent > quantity.count) throw new RangeError('Insufficient finite Tubes');
  return { kind: 'FINITE', count: addSafe(quantity.count - spent, returned) };
}
export function spendExactTubes(
  state: ExactResourceState,
  selected: TubeCounts,
  expectedRevision: number,
): TubeTransaction {
  validateExactResourceState(state);
  whole(expectedRevision, 'expectedRevision');
  if (expectedRevision !== state.revision) throw new Error('Stale resource revision');
  const spent = counts(selected);
  const expBefore = state.progress.cumulativeEchoEXP;
  if (expBefore >= MAX_RANK5_ECHO_EXP) throw new RangeError('Echo is already at +25 cap');
  let suppliedEXP = 0;
  for (const id of IDS) {
    const available = state.inventory.tubes[id];
    if (available.kind === 'FINITE' && spent[id] > available.count) {
      throw new RangeError('Insufficient finite Tubes: ' + id);
    }
    suppliedEXP = addSafe(suppliedEXP, spent[id] * VALUES[id]);
  }
  if (suppliedEXP === 0) throw new RangeError('Tube spend must advance EXP');
  const raw = addSafe(expBefore, suppliedEXP);
  const expAfter = Math.min(MAX_RANK5_ECHO_EXP, raw);
  const overflowEXP = Math.max(0, raw - MAX_RANK5_ECHO_EXP);
  const { returned, unrepresentableEXP } = decomposeMaxOverflow(overflowEXP);
  const after: ResourceInventory = {
    ...state.inventory,
    tubes: {
      premium: mutateQuantity(state.inventory.tubes.premium, spent.premium, returned.premium),
      advanced: mutateQuantity(state.inventory.tubes.advanced, spent.advanced, returned.advanced),
      medium: mutateQuantity(state.inventory.tubes.medium, spent.medium, returned.medium),
      basic: mutateQuantity(state.inventory.tubes.basic, spent.basic, returned.basic),
    },
  };
  const crossed = LEVELS.filter(level => level > 0
    && CHECKPOINT_CUMULATIVE_COST[level].exp > expBefore
    && CHECKPOINT_CUMULATIVE_COST[level].exp <= expAfter);
  return {
    state: { revision: addSafe(state.revision, 1), progress: { ...state.progress, cumulativeEchoEXP: expAfter }, inventory: after },
    ledger: { before: state.inventory, spent, returned, after, expBefore, suppliedEXP,
      expAfter, overflowEXP, unrepresentableEXP, crossed, eligibleThrough: checkpointEligibleAtEXP(expAfter) },
  };
}
/**
 * Tuner spending is an explicit separate transaction. No implicit tuning,
 * EXP spending, recovery, or Character evaluator action.
 */
export function tuneEligibleCheckpoint(state: ExactResourceState, expectedRevision: number): ExactResourceState {
  validateExactResourceState(state);
  if (expectedRevision !== state.revision) throw new Error('Stale resource revision');
  const next = LEVELS[LEVELS.indexOf(state.progress.tunedThrough) + 1];
  if (next === undefined || checkpointEligibleAtEXP(state.progress.cumulativeEchoEXP) < next) {
    throw new RangeError('Next tuning checkpoint not EXP-eligible');
  }
  const tuners = mutateQuantity(state.inventory.tuners, 10, 0);
  return { revision: addSafe(state.revision, 1), progress: { ...state.progress, tunedThrough: next },
    inventory: { ...state.inventory, tuners } };
}
export interface TubePath {
  readonly spent: TubeCounts;
  readonly transaction: TubeTransaction;
}
/**
 * Candidate paths to a given EXP checkpoint. Each item multiset is considered
 * once. Pareto comparison is by remaining individual denomination inventory,
 * not an invented exchange rate. Finite/unlimited holdings stay symbolic.
 *
 * At most one overshooting item need be considered: the previous total below
 * target plus one item always suffices, and adding further Tubes cannot improve
 * a resource outcome. Compare overcap returns through the actual transaction.
 */
export function optimizeTubesToCheckpoint(
  state: ExactResourceState, target: EchoLevel, expectedRevision: number,
): TubePath[] {
  validateExactResourceState(state);
  if (!LEVELS.includes(target) || target === 0) throw new RangeError('Target must be a tuning checkpoint');
  if (expectedRevision !== state.revision) throw new Error('Stale resource revision');
  const need = Math.max(0, CHECKPOINT_CUMULATIVE_COST[target].exp - state.progress.cumulativeEchoEXP);
  if (need === 0) return [];
  const maxUseful = need + Math.max(...IDS.map(id => VALUES[id])) - 1;
  const upper = IDS.map(id => Math.min(
    Math.ceil(maxUseful / VALUES[id]),
    state.inventory.tubes[id].kind === 'UNLIMITED' ? Infinity : state.inventory.tubes[id].count,
  ));
  const found: TubePath[] = [];
  const current = zeroCounts();
  function visit(index: number, total: number): void {
    if (total >= need) {
      // Prune strict redundant spends: if any selected item can be removed
      // while still reaching target, this multiset cannot be Pareto-optimal.
      if (IDS.some(id => current[id] > 0 && total - VALUES[id] >= need)) return;
      const transaction = spendExactTubes(state, current, expectedRevision);
      found.push({ spent: { ...current }, transaction });
      return;
    }
    if (index === IDS.length) return;
    const id = IDS[index];
    for (let n = 0; n <= upper[index] && total + n * VALUES[id] <= maxUseful; n++) {
      current[id] = n;
      visit(index + 1, total + n * VALUES[id]);
    }
    current[id] = 0;
  }
  visit(0, 0);
  const dominates = (a: TubePath, b: TubePath): boolean => {
    let strict = false;
    for (const id of IDS) {
      const x = a.transaction.state.inventory.tubes[id];
      const y = b.transaction.state.inventory.tubes[id];
      if (x.kind === 'UNLIMITED' && y.kind === 'UNLIMITED') continue;
      if (x.kind === 'UNLIMITED' || y.kind === 'UNLIMITED') {
        if (x.kind !== 'UNLIMITED') return false;
        strict = true;
      } else {
        if (x.count < y.count) return false;
        if (x.count > y.count) strict = true;
      }
    }
    return strict;
  };
  return found.filter((path, i) => !found.some((other, j) => i !== j && dominates(other, path)));
}
