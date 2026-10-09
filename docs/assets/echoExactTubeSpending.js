import { CHECKPOINT_CUMULATIVE_COST } from "./echoCoreRules.js";
import { ECHO_TUBES, readResourceInventory } from "./resourceInventory.js";
const LEVELS = [0, 5, 10, 15, 20, 25];
const IDS = ['premium', 'advanced', 'medium', 'basic'];
const VALUES = Object.fromEntries(ECHO_TUBES.map(row => [row.id, row.echoExp]));
export const MAX_RANK5_ECHO_EXP = CHECKPOINT_CUMULATIVE_COST[25].exp;
const zeroCounts = () => ({ premium: 0, advanced: 0, medium: 0, basic: 0 });
function whole(value, name) {
    if (!Number.isSafeInteger(value) || value < 0)
        throw new RangeError(name + ' must be a whole non-negative safe integer');
}
function addSafe(a, b) {
    const sum = a + b;
    if (!Number.isSafeInteger(sum))
        throw new RangeError('Resource arithmetic exceeded safe integer range');
    return sum;
}
function counts(value) {
    if (!value || IDS.some(id => !(id in value)))
        throw new RangeError('Four Tube counts required');
    const result = zeroCounts();
    for (const id of IDS) {
        whole(value[id], id);
        result[id] = value[id];
    }
    return result;
}
export function checkpointEligibleAtEXP(exp) {
    whole(exp, 'EXP');
    if (exp > MAX_RANK5_ECHO_EXP)
        throw new RangeError('EXP exceeds +25 cap');
    return LEVELS.filter(level => CHECKPOINT_CUMULATIVE_COST[level].exp <= exp).at(-1);
}
export function validateExactResourceState(state) {
    whole(state.revision, 'revision');
    const exp = state.progress.cumulativeEchoEXP;
    const eligible = checkpointEligibleAtEXP(exp);
    if (!LEVELS.includes(state.progress.tunedThrough) || state.progress.tunedThrough > eligible) {
        throw new RangeError('Tuned checkpoint cannot exceed EXP eligibility');
    }
    readResourceInventory(state.inventory);
}
/** General overflow return, also valid for future non-500 EXP sources. */
export function decomposeMaxOverflow(overflow) {
    whole(overflow, 'overflow');
    let remaining = overflow;
    const returned = zeroCounts();
    for (const id of IDS) {
        returned[id] = Math.floor(remaining / VALUES[id]);
        remaining %= VALUES[id];
    }
    return { returned, unrepresentableEXP: remaining };
}
function mutateQuantity(quantity, spent, returned) {
    if (quantity.kind === 'UNLIMITED')
        return { kind: 'UNLIMITED' };
    if (spent > quantity.count)
        throw new RangeError('Insufficient finite Tubes');
    return { kind: 'FINITE', count: addSafe(quantity.count - spent, returned) };
}
export function spendExactTubes(state, selected, expectedRevision) {
    validateExactResourceState(state);
    whole(expectedRevision, 'expectedRevision');
    if (expectedRevision !== state.revision)
        throw new Error('Stale resource revision');
    const inventory = readResourceInventory(state.inventory);
    const spent = counts(selected);
    const expBefore = state.progress.cumulativeEchoEXP;
    if (expBefore >= MAX_RANK5_ECHO_EXP)
        throw new RangeError('Echo is already at +25 cap');
    let suppliedEXP = 0;
    for (const id of IDS) {
        const available = inventory.tubes[id];
        if (available.kind === 'FINITE' && spent[id] > available.count) {
            throw new RangeError('Insufficient finite Tubes: ' + id);
        }
        suppliedEXP = addSafe(suppliedEXP, spent[id] * VALUES[id]);
    }
    if (suppliedEXP === 0)
        throw new RangeError('Tube spend must advance EXP');
    const raw = addSafe(expBefore, suppliedEXP);
    const expAfter = Math.min(MAX_RANK5_ECHO_EXP, raw);
    const overflowEXP = Math.max(0, raw - MAX_RANK5_ECHO_EXP);
    const { returned, unrepresentableEXP } = decomposeMaxOverflow(overflowEXP);
    const after = {
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
export function tuneEligibleCheckpoint(state, expectedRevision) {
    validateExactResourceState(state);
    whole(expectedRevision, 'expectedRevision');
    if (expectedRevision !== state.revision)
        throw new Error('Stale resource revision');
    const next = LEVELS[LEVELS.indexOf(state.progress.tunedThrough) + 1];
    if (next === undefined || checkpointEligibleAtEXP(state.progress.cumulativeEchoEXP) < next) {
        throw new RangeError('Next tuning checkpoint not EXP-eligible');
    }
    const inventory = readResourceInventory(state.inventory);
    const tuners = mutateQuantity(inventory.tuners, 10, 0);
    return { revision: addSafe(state.revision, 1), progress: { ...state.progress, tunedThrough: next },
        inventory: { ...inventory, tuners } };
}
/** No partial frontier is returned on failure. An empty array means infeasible. */
export class TubeSearchError extends Error {
    code;
    constructor(code) {
        super(code === 'UNBOUNDED_FRONTIER'
            ? 'Unlimited smaller Tubes can return unbounded finite Gold; specify maxSuppliedEXP'
            : 'Exact Tube search exceeded its work budget; no complete frontier available');
        this.name = 'TubeSearchError';
        this.code = code;
    }
}
function searchBudget(options) {
    if (options.maxSuppliedEXP !== undefined)
        whole(options.maxSuppliedEXP, 'maxSuppliedEXP');
    const limit = options.maxSearchWork ?? 250_000;
    whole(limit, 'maxSearchWork');
    if (limit === 0)
        throw new RangeError('maxSearchWork must be positive');
    let work = 0;
    return () => { if (++work > limit)
        throw new TubeSearchError('SEARCH_LIMIT'); };
}
function quantityAtLeast(a, b) {
    return a.kind === 'UNLIMITED' || (b.kind === 'FINITE' && a.count >= b.count);
}
function allTubesUnlimited(state) {
    return IDS.every(id => state.inventory.tubes[id].kind === 'UNLIMITED');
}
/**
 * Equal exact EXP permits identical future spends and identical cap returns.
 * Greater EXP alone does not: largest-first returns can lose a denomination.
 * Unlimited affects feasibility, never the cost of reaching a state.
 * Tuners, Echoes and tunedThrough remain future-relevant; revision is an owner
 * token, not a resource objective. This is an inventory-only relation; path
 * dominance additionally requires no greater ledger/cumulative supplied EXP.
 */
export function resourceStateDominates(a, b) {
    if (a.progress.tunedThrough !== b.progress.tunedThrough)
        return false;
    if (a.progress.cumulativeEchoEXP !== b.progress.cumulativeEchoEXP)
        return false;
    return quantityAtLeast(a.inventory.echoes, b.inventory.echoes) &&
        quantityAtLeast(a.inventory.tuners, b.inventory.tuners) &&
        IDS.every(id => quantityAtLeast(a.inventory.tubes[id], b.inventory.tubes[id]));
}
function stateKey(state) {
    const q = (quantity) => quantity.kind === 'UNLIMITED' ? 'U' : quantity.count;
    return JSON.stringify([state.progress.cumulativeEchoEXP, state.progress.tunedThrough,
        q(state.inventory.echoes), q(state.inventory.tuners), ...IDS.map(id => q(state.inventory.tubes[id]))]);
}
function retainFrontier(candidates, getState, getCost, work) {
    // Cheapest witness first: symbolic inventory must not erase spend history.
    // Equal canonical supplied EXP and future state share one witness.
    const ordered = [...candidates].sort((a, b) => getCost(a) - getCost(b));
    // Inventory dominance is conservative and compares only equal exact EXP.
    const groups = new Map();
    const seen = new Set();
    for (const candidate of ordered) {
        work();
        const state = getState(candidate), key = stateKey(state);
        if (seen.has(key))
            continue;
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
        const bucket = state.progress.cumulativeEchoEXP;
        const group = groups.get(bucket) ?? [];
        if (group.some(other => { work(); return getCost(other) <= getCost(candidate) && resourceStateDominates(getState(other), state); }))
            continue;
        groups.set(bucket, group.filter(other => { work(); return !(getCost(candidate) <= getCost(other) && resourceStateDominates(state, getState(other))); }).concat(candidate));
    }
    return [...groups.values()].flat();
}
/**
 * Enumerate multisets, including deliberate carry and cap denomination changes.
 * Finite/mixed inventories have no immediate-target/removable-item pruning.
 * All-unlimited uses deferrable-spend checkpoint witnesses (see contract).
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
export function optimizeTubesToCheckpoint(state, target, expectedRevision, options = {}) {
    return optimizeCheckpoint(state, target, expectedRevision, options, searchBudget(options));
}
function optimizeCheckpoint(state, target, expectedRevision, options, work) {
    validateExactResourceState(state);
    whole(expectedRevision, 'expectedRevision');
    if (!LEVELS.includes(target) || target === 0)
        throw new RangeError('Target must be a tuning checkpoint');
    if (expectedRevision !== state.revision)
        throw new Error('Stale resource revision');
    const need = Math.max(0, CHECKPOINT_CUMULATIVE_COST[target].exp - state.progress.cumulativeEchoEXP);
    // This API advances to an unmet checkpoint; already-eligible is a no-op.
    if (need === 0)
        return [];
    const capNeed = MAX_RANK5_ECHO_EXP - state.progress.cumulativeEchoEXP;
    if (allTubesUnlimited(state)) {
        // A removable Tube buys no finite stock: defer it until after observation.
        // Minimal multisets have total < need + largest Tube. For each reachable
        // total keep one exact denomination witness; canonical Tube EXP is the
        // cost dimension, with no exchange rate to Tuners or Echoes.
        const paths = [];
        const upper = Math.min(need + VALUES.premium - 1, Math.ceil(capNeed / VALUES.basic) * VALUES.basic, options.maxSuppliedEXP ?? Infinity);
        for (let total = Math.ceil(need / VALUES.basic) * VALUES.basic; total <= upper; total += VALUES.basic) {
            const excess = total - need;
            const spent = zeroCounts();
            const impossible = new Set();
            function witness(index, remaining) {
                work();
                if (index === IDS.length)
                    return remaining === 0;
                const key = `${index}:${remaining}`;
                if (impossible.has(key))
                    return false;
                const id = IDS[index], value = VALUES[id];
                // Every spent item must be necessary to reach this opportunity.
                const max = value > excess ? Math.floor(remaining / value) : 0;
                for (let n = max; n >= 0; n--) {
                    spent[id] = n;
                    if (witness(index + 1, remaining - n * value))
                        return true;
                }
                spent[id] = 0;
                impossible.add(key);
                return false;
            }
            if (witness(0, total))
                paths.push({ spent, transaction: spendExactTubes(state, spent, expectedRevision) });
        }
        return retainFrontier(paths, path => path.transaction.state, path => path.transaction.ledger.suppliedEXP, work);
    }
    const goldUnlimited = state.inventory.tubes.premium.kind === 'UNLIMITED';
    if (!goldUnlimited && options.maxSuppliedEXP === undefined &&
        IDS.some(id => id !== 'premium' && state.inventory.tubes[id].kind === 'UNLIMITED')) {
        throw new TubeSearchError('UNBOUNDED_FRONTIER');
    }
    const blocks = { premium: 1, advanced: 5, medium: 5, basic: 10 };
    const upper = IDS.map(id => {
        const quantity = state.inventory.tubes[id];
        let bound = quantity.kind === 'FINITE' ? quantity.count : Infinity;
        if (id === 'premium')
            bound = Math.min(bound, Math.ceil(capNeed / VALUES[id]));
        else if (goldUnlimited)
            bound = Math.min(bound, Math.ceil(capNeed / VALUES[id]) + blocks[id] - 1);
        if (options.maxSuppliedEXP !== undefined)
            bound = Math.min(bound, Math.floor(options.maxSuppliedEXP / VALUES[id]));
        return bound;
    });
    const found = [];
    const current = zeroCounts();
    function visit(index, total) {
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
            if (options.maxSuppliedEXP !== undefined && nextTotal > options.maxSuppliedEXP)
                break;
            current[id] = n;
            visit(index + 1, nextTotal);
        }
        current[id] = 0;
    }
    visit(0, 0);
    return retainFrontier(found, path => path.transaction.state, path => path.transaction.ledger.suppliedEXP, work);
}
/**
 * Increasing checkpoint opportunities on one Echo. This is resource reachability,
 * not a min-max decision policy or evaluator. Each step may cross later EXP
 * thresholds without tuning them. Equal future states share one witness; search
 * work is bounded across the entire horizon, not reset at every branch.
 */
export function optimizeTubeCheckpointHorizon(state, targets, expectedRevision, options = {}) {
    const work = searchBudget(options);
    validateExactResourceState(state);
    whole(expectedRevision, 'expectedRevision');
    if (!targets.length || targets.some((target, index) => target === 0 || !LEVELS.includes(target) || (index > 0 && target <= targets[index - 1]))) {
        throw new RangeError('Horizon must contain increasing tuning checkpoints');
    }
    if (expectedRevision !== state.revision)
        throw new Error('Stale resource revision');
    let paths = [{ steps: [], state, cumulativeSuppliedEXP: 0 }];
    for (const target of targets) {
        const next = [];
        for (const path of paths) {
            work();
            if (CHECKPOINT_CUMULATIVE_COST[target].exp <= path.state.progress.cumulativeEchoEXP) {
                next.push(path);
                continue;
            }
            for (const step of optimizeCheckpoint(path.state, target, path.state.revision, options, work)) {
                next.push({ steps: [...path.steps, step], state: step.transaction.state,
                    cumulativeSuppliedEXP: addSafe(path.cumulativeSuppliedEXP, step.transaction.ledger.suppliedEXP) });
            }
        }
        paths = retainFrontier(next, path => path.state, path => path.cumulativeSuppliedEXP, work);
        if (paths.length === 0)
            return [];
    }
    return paths;
}
