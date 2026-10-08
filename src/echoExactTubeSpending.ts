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
/** Detached calculation input, never a second persisted inventory owner.
 * revision is supplied by the caller's authoritative resource/progress owner.
 * Applying a result requires compare-and-swap there; pure replay is not a commit.
 */
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
  if (quantity.kind === 'UNLIMITED') return { kind: 'UNLIMITED' };
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
  const inventory = readResourceInventory(state.inventory);
  const spent = counts(selected);
  const expBefore = state.progress.cumulativeEchoEXP;
  if (expBefore >= MAX_RANK5_ECHO_EXP) throw new RangeError('Echo is already at +25 cap');
  let suppliedEXP = 0;
  for (const id of IDS) {
    const available = inventory.tubes[id];
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
    ...inventory,
    tubes: {
      premium: mutateQuantity(inventory.tubes.premium, spent.premium, returned.premium),
      advanced: mutateQuantity(inventory.tubes.advanced, spent.advanced, returned.advanced),
      medium: mutateQuantity(inventory.tubes.medium, spent.medium, returned.medium),
      basic: mutateQuantity(inventory.tubes.basic, spent.basic, returned.basic),
    },
  };
  const crossed = LEVELS.filter(level => level > 0
    && CHECKPOINT_CUMULATIVE_COST[level].exp > expBefore
    && CHECKPOINT_CUMULATIVE_COST[level].exp <= expAfter);
  return {
    state: { revision: addSafe(state.revision, 1), progress: { ...state.progress, cumulativeEchoEXP: expAfter }, inventory: readResourceInventory(after) },
    ledger: { before: inventory, spent, returned, after: readResourceInventory(after), expBefore, suppliedEXP,
      expAfter, overflowEXP, unrepresentableEXP, crossed, eligibleThrough: checkpointEligibleAtEXP(expAfter) },
  };
}
/**
 * Tuner spending is an explicit separate transaction. No implicit tuning,
 * EXP spending, recovery, or Character evaluator action.
 */
export function tuneEligibleCheckpoint(state: ExactResourceState, expectedRevision: number): ExactResourceState {
  validateExactResourceState(state);
  whole(expectedRevision, 'expectedRevision');
  if (expectedRevision !== state.revision) throw new Error('Stale resource revision');
  const next = LEVELS[LEVELS.indexOf(state.progress.tunedThrough) + 1];
  if (next === undefined || checkpointEligibleAtEXP(state.progress.cumulativeEchoEXP) < next) {
    throw new RangeError('Next tuning checkpoint not EXP-eligible');
  }
  const inventory = readResourceInventory(state.inventory);
  const tuners = mutateQuantity(inventory.tuners, 10, 0);
  return { revision: addSafe(state.revision, 1), progress: { ...state.progress, tunedThrough: next },
    inventory: { ...inventory, tuners } };
}
export interface TubePath {
  readonly spent: TubeCounts;
  readonly transaction: TubeTransaction;
}
/** Bounds are per transaction, not an invented value for unlimited stock. */
export interface TubeSearchOptions {
  readonly maxSuppliedEXP?: number;
  readonly maxSearchWork?: number;
}
/** No partial frontier is returned on failure. An empty array means infeasible. */
export class TubeSearchError extends Error {
  readonly code: 'UNBOUNDED_FRONTIER' | 'SEARCH_LIMIT';
  constructor(code: 'UNBOUNDED_FRONTIER' | 'SEARCH_LIMIT') {
    super(code === 'UNBOUNDED_FRONTIER'
      ? 'Unlimited smaller Tubes can return unbounded finite Gold; specify maxSuppliedEXP'
      : 'Exact Tube search exceeded its work budget; no complete frontier available');
    this.name = 'TubeSearchError';
    this.code = code;
  }
}
function searchBudget(options: TubeSearchOptions): () => void {
  if (options.maxSuppliedEXP !== undefined) whole(options.maxSuppliedEXP, 'maxSuppliedEXP');
  const limit = options.maxSearchWork ?? 250_000;
  whole(limit, 'maxSearchWork');
  if (limit === 0) throw new RangeError('maxSearchWork must be positive');
  let work = 0;
  return () => { if (++work > limit) throw new TubeSearchError('SEARCH_LIMIT'); };
}
function quantityAtLeast(a: InventoryQuantity, b: InventoryQuantity): boolean {
  return a.kind === 'UNLIMITED' || (b.kind === 'FINITE' && a.count >= b.count);
}
function allTubesUnlimited(state: ExactResourceState): boolean {
  return IDS.every(id => state.inventory.tubes[id].kind === 'UNLIMITED');
}
/**
 * Equal exact EXP permits identical future spends and identical cap returns.
 * Greater EXP alone does not: largest-first returns can lose a denomination.
 * Only when both Tube inventories are all unlimited is greater EXP safe.
 * Tuners, Echoes and tunedThrough remain future-relevant; revision is an owner
 * token, not a resource objective. Equal outcomes retain one executable witness.
 */
export function resourceStateDominates(a: ExactResourceState, b: ExactResourceState): boolean {
  if (a.progress.tunedThrough !== b.progress.tunedThrough) return false;
  if (a.progress.cumulativeEchoEXP !== b.progress.cumulativeEchoEXP &&
    !(allTubesUnlimited(a) && allTubesUnlimited(b) &&
      a.progress.cumulativeEchoEXP >= b.progress.cumulativeEchoEXP)) return false;
  return quantityAtLeast(a.inventory.echoes, b.inventory.echoes) &&
    quantityAtLeast(a.inventory.tuners, b.inventory.tuners) &&
    IDS.every(id => quantityAtLeast(a.inventory.tubes[id], b.inventory.tubes[id]));
}
function stateKey(state: ExactResourceState): string {
  const q = (quantity: InventoryQuantity) => quantity.kind === 'UNLIMITED' ? 'U' : quantity.count;
  return JSON.stringify([state.progress.cumulativeEchoEXP, state.progress.tunedThrough,
    q(state.inventory.echoes), q(state.inventory.tuners), ...IDS.map(id => q(state.inventory.tubes[id]))]);
}
function retainFrontier<T>(candidates: readonly T[], getState: (value: T) => ExactResourceState,
  work: () => void): T[] {
  // Bucket by exact EXP; only all-unlimited permits comparison across buckets.
  const groups = new Map<number, T[]>();
  const seen = new Set<string>();
  for (const candidate of candidates) {
    work();
    const state = getState(candidate), key = stateKey(state);
    if (seen.has(key)) continue;
    seen.add(key);
    // All candidates originate from one inventory. With all finite Tubes,
    // equal EXP has equal remaining inventory EXP value: supplied totals are
    // multiples of 500, so cap loss has one fixed residue. A strict component
    // superset is impossible. Deduplication alone is sufficient in this case.
    if (IDS.every(id => state.inventory.tubes[id].kind === 'FINITE')) {
      const group = groups.get(state.progress.cumulativeEchoEXP) ?? [];
      group.push(candidate);
      groups.set(state.progress.cumulativeEchoEXP, group);
      continue;
    }
    const bucket = allTubesUnlimited(state) ? -1 : state.progress.cumulativeEchoEXP;
    const group = groups.get(bucket) ?? [];
    if (group.some(other => { work(); return resourceStateDominates(getState(other), state); })) continue;
    groups.set(bucket, group.filter(other => { work(); return !resourceStateDominates(state, getState(other)); }).concat(candidate));
  }
  return [...groups.values()].flat();
}
/**
 * Enumerate multisets, including deliberate carry and cap denomination changes.
 * No immediate-target bound or removable-item pruning is valid here.
 *
 * Finite smaller denominations use their actual stock. Extra Gold beyond
 * ceil((cap - EXP)/5000) always returns that same Gold, so one witness suffices.
 * With unlimited Gold, smaller denomination blocks of 5000 EXP (10000 for
 * Purple) can be removed after cap: Gold return is irrelevant and the restored
 * smaller inventory weakly improves. This bounds each count by
 * ceil((cap - EXP)/value) + blockCount - 1. See the contract proof and oracle tests.
 * Unlimited smaller stock with finite Gold needs an explicit transaction bound:
 * its cap-return frontier is unbounded. Work exhaustion throws, never truncates.
 */
export function optimizeTubesToCheckpoint(
  state: ExactResourceState, target: EchoLevel, expectedRevision: number,
  options: TubeSearchOptions = {},
): TubePath[] {
  return optimizeCheckpoint(state, target, expectedRevision, options, searchBudget(options));
}
function optimizeCheckpoint(state: ExactResourceState, target: EchoLevel, expectedRevision: number,
  options: TubeSearchOptions, work: () => void): TubePath[] {
  validateExactResourceState(state);
  whole(expectedRevision, 'expectedRevision');
  if (!LEVELS.includes(target) || target === 0) throw new RangeError('Target must be a tuning checkpoint');
  if (expectedRevision !== state.revision) throw new Error('Stale resource revision');
  const need = Math.max(0, CHECKPOINT_CUMULATIVE_COST[target].exp - state.progress.cumulativeEchoEXP);
  // This API advances to an unmet checkpoint; already-eligible is a no-op.
  if (need === 0) return [];
  const capNeed = MAX_RANK5_ECHO_EXP - state.progress.cumulativeEchoEXP;
  if (allTubesUnlimited(state)) {
    work();
    const supplied = Math.min(Math.ceil(capNeed / 500) * 500,
      Math.floor((options.maxSuppliedEXP ?? MAX_RANK5_ECHO_EXP + 500) / 500) * 500);
    if (supplied < need) return [];
    const spent = decomposeMaxOverflow(supplied).returned;
    return [{ spent, transaction: spendExactTubes(state, spent, expectedRevision) }];
  }
  const goldUnlimited = state.inventory.tubes.premium.kind === 'UNLIMITED';
  if (!goldUnlimited && options.maxSuppliedEXP === undefined &&
    IDS.some(id => id !== 'premium' && state.inventory.tubes[id].kind === 'UNLIMITED')) {
    throw new TubeSearchError('UNBOUNDED_FRONTIER');
  }
  const blocks: Record<TubeId, number> = { premium: 1, advanced: 5, medium: 5, basic: 10 };
  const upper = IDS.map(id => {
    const quantity = state.inventory.tubes[id];
    let bound = quantity.kind === 'FINITE' ? quantity.count : Infinity;
    if (id === 'premium') bound = Math.min(bound, Math.ceil(capNeed / VALUES[id]));
    else if (goldUnlimited) bound = Math.min(bound, Math.ceil(capNeed / VALUES[id]) + blocks[id] - 1);
    if (options.maxSuppliedEXP !== undefined) bound = Math.min(bound, Math.floor(options.maxSuppliedEXP / VALUES[id]));
    return bound;
  });
  const found: TubePath[] = [];
  const current = zeroCounts();
  function visit(index: number, total: number): void {
    work();
    if (index === IDS.length) {
      if (total >= need) {
        const spent = { ...current };
        found.push({ spent, transaction: spendExactTubes(state, spent, expectedRevision) });
      }
      return;
    }
    const id = IDS[index];
    for (let n = 0; n <= upper[index]; n++) {
      const nextTotal = addSafe(total, n * VALUES[id]);
      if (options.maxSuppliedEXP !== undefined && nextTotal > options.maxSuppliedEXP) break;
      current[id] = n;
      visit(index + 1, nextTotal);
    }
    current[id] = 0;
  }
  visit(0, 0);
  return retainFrontier(found, path => path.transaction.state, work);
}

/** One witness per nondominated outcome, without tuning or evaluator policy. */
export interface TubeHorizonPath {
  readonly steps: readonly TubePath[];
  readonly state: ExactResourceState;
}
/**
 * Increasing checkpoint opportunities on one Echo. This is resource reachability,
 * not a min-max decision policy or evaluator. Each step may cross later EXP
 * thresholds without tuning them. Equal future states share one witness; search
 * work is bounded across the entire horizon, not reset at every branch.
 */
export function optimizeTubeCheckpointHorizon(
  state: ExactResourceState,
  targets: readonly EchoLevel[],
  expectedRevision: number,
  options: TubeSearchOptions = {},
): TubeHorizonPath[] {
  const work = searchBudget(options);
  validateExactResourceState(state);
  whole(expectedRevision, 'expectedRevision');
  if (!targets.length || targets.some((target, index) =>
    target === 0 || !LEVELS.includes(target) || (index > 0 && target <= targets[index - 1]!))) {
    throw new RangeError('Horizon must contain increasing tuning checkpoints');
  }
  if (expectedRevision !== state.revision) throw new Error('Stale resource revision');
  let paths: TubeHorizonPath[] = [{ steps: [], state }];
  for (const target of targets) {
    const next: TubeHorizonPath[] = [];
    for (const path of paths) {
      work();
      if (CHECKPOINT_CUMULATIVE_COST[target].exp <= path.state.progress.cumulativeEchoEXP) {
        next.push(path);
        continue;
      }
      for (const step of optimizeCheckpoint(path.state, target, path.state.revision, options, work)) {
        next.push({ steps: [...path.steps, step], state: step.transaction.state });
      }
    }
    paths = retainFrontier(next, path => path.state, work);
    if (paths.length === 0) return [];
  }
  return paths;
}
