import { CHECKPOINT_CUMULATIVE_COST } from "./echoCoreRules.js";
import { startSimulatorCandidate } from "./echoSimulatorSession.js";
import { rollSimulatorCandidate, clearSimulatorCandidate, placeSimulatorCandidate } from "./echoSimulatorRolling.js";
import { assessEchoRequirements } from "./echoRequirements.js";
import { ECHO_TUBES, readResourceInventory, updateResourceInventory } from "./resourceInventory.js";
import { MAX_RANK5_ECHO_EXP, spendExactTubes, tuneEligibleCheckpoint } from "./echoExactTubeSpending.js";
const zero = () => ({ premium: 0, advanced: 0, medium: 0, basic: 0 });
export function initializeSimulatorResources(session, inventory) {
    const next = structuredClone(session), basis = readResourceInventory(inventory);
    next.resources = { inventory: structuredClone(basis), basis, spent: zero(), returned: zero(), lastLedger: null };
    return next;
}
/** New total sandbox budget, minus all committed spending in this session.
 * Retains equipment/history/counters; never spends the saved user inventory. */
export function applySimulatorBudget(session, inventory) {
    if (!session.resources || session.run?.status === 'RUNNING')
        throw new Error('Stop the simulation before applying a budget.');
    const basis = readResourceInventory(inventory);
    let working = structuredClone(basis);
    const used = { echoes: session.rolling.attempts, tuners: session.rolling.tuners,
        ...Object.fromEntries(ECHO_TUBES.map(tube => [tube.id, session.resources.spent[tube.id] - session.resources.returned[tube.id]])) };
    for (const id of ['echoes', 'tuners', ...ECHO_TUBES.map(tube => tube.id)]) {
        const quantity = id === 'echoes' || id === 'tuners' ? working[id] : working.tubes[id];
        if (quantity.kind === 'UNLIMITED')
            continue;
        const remaining = quantity.count - used[id];
        if (!Number.isSafeInteger(remaining) || remaining < 0)
            throw new Error('New total budget is below this session’s used ' + id + '. Increase it or Reset.');
        working = updateResourceInventory(working, id, { kind: 'FINITE', count: remaining });
    }
    const next = stopSimulatorRun(session, 'New total budget applied; history retained');
    next.resources.basis = basis;
    next.resources.inventory = working;
    return next;
}
/** Bounded whole-item witness, not a finite-budget economic optimizer. The explicit
 * V1 policy selects the smallest supplied EXP reaching +25; equivalent witnesses
 * follow canonical catalog order. All spending/carry/cap returns remain engine-owned.
 * Binary decomposition caps work independently of arbitrarily large inventories. */
export function simulatorTubeWitness(inventory, neededEXP = MAX_RANK5_ECHO_EXP) {
    if (!Number.isSafeInteger(neededEXP) || neededEXP < 0 || neededEXP > MAX_RANK5_ECHO_EXP)
        throw new Error('Invalid checkpoint EXP requirement.');
    if (neededEXP === 0)
        return zero();
    inventory = readResourceInventory(inventory);
    const unit = Math.min(...ECHO_TUBES.map(tube => tube.echoExp));
    const target = Math.ceil(neededEXP / unit);
    const bound = target + Math.max(...ECHO_TUBES.map(tube => tube.echoExp)) / unit - 1;
    const reachable = Array(bound + 1);
    reachable[0] = zero();
    for (const tube of ECHO_TUBES) {
        const weight = tube.echoExp / unit, quantity = inventory.tubes[tube.id];
        let remaining = Math.min(Math.floor(bound / weight), quantity.kind === 'UNLIMITED' ? Infinity : quantity.count);
        for (let size = 1; remaining > 0; size *= 2) {
            const count = Math.min(size, remaining);
            remaining -= count;
            for (let total = bound; total >= count * weight; total--) {
                const prior = reachable[total - count * weight];
                if (!reachable[total] && prior)
                    reachable[total] = { ...prior, [tube.id]: prior[tube.id] + count };
            }
        }
    }
    return reachable.slice(target).find(Boolean) ?? null;
}
export function beginSimulatorRun(session, template, requirements, gate) {
    if (!session.resources)
        throw new Error('Resources unavailable. Reset the simulation.');
    const next = structuredClone(session);
    next.run = { status: 'RUNNING', reason: 'Running', slot: session.selectedSlot, template: structuredClone(template), requirements: structuredClone(requirements), gate, sincePause: 0 };
    try {
        const result = assessEchoRequirements(requirements, { rank: 5, level: 0, substats: [] });
        if (['INVALID', 'IMPOSSIBLE', 'PENDING'].includes(result.status))
            throw new Error(result.reason);
        if (![5, 10, 15, 20, 25].includes(gate))
            throw new Error('Invalid Gate setting.');
    }
    catch (error) {
        next.run.status = 'BLOCKED';
        next.run.reason = String(error.message);
    }
    return next;
}
/** Same transaction driver, with five snapshotted templates and one working budget. */
export function beginSimulatorExecution(session, templates, mode, requirements, gate) {
    if (!['ONE_SLOT', 'FULL_SET'].includes(mode) || templates.length !== 5 || (mode === 'FULL_SET' ? templates.some(template => !template) : !templates[session.selectedSlot - 1]))
        throw new Error('Prepare all five eligible slot templates.');
    const prepared = structuredClone(session);
    if (mode === 'FULL_SET')
        prepared.selectedSlot = 1;
    const next = beginSimulatorRun(prepared, templates[prepared.selectedSlot - 1], requirements, gate);
    next.run.mode = mode;
    next.run.templates = structuredClone(templates);
    next.run.completedSlots = [];
    next.run.autoActivate = true;
    return next;
}
export function stopSimulatorRun(session, reason = 'Cancelled') {
    const next = structuredClone(session);
    if (next.run && (['RUNNING', 'PAUSED'].includes(next.run.status) || reason !== 'Cancelled')) {
        next.run.status = 'CANCELLED';
        next.run.reason = reason;
    }
    return next;
}
export function resumeSimulatorRun(session) {
    const next = structuredClone(session);
    if (next.run?.status === 'PAUSED') {
        next.run.status = 'RUNNING';
        next.run.reason = 'Running';
        next.run.sincePause = 0;
    }
    return next;
}
/** One bounded attempt is an atomic commit; callers yield between attempts.
 * At/after Gate, reject only mathematically impossible user requirements.
 * No economic usefulness, discard refunds or private acceptance are inferred.
 * Resource exhaustion retains a truthful partial card; invalid RNG rolls back. */
export function advanceSimulatorRun(session, rng, batchSize = 4, pauseAfter = 1000) {
    if (!Number.isSafeInteger(batchSize) || batchSize < 1 || batchSize > 20 || !Number.isSafeInteger(pauseAfter) || pauseAfter < 1)
        throw new Error('Invalid cooperative bounds.');
    let next = session;
    for (let step = 0; step < batchSize && next.run?.status === 'RUNNING'; step++) {
        const run = next.run, resources = next.resources;
        if (run.slot !== next.selectedSlot)
            return stopSimulatorRun(next, 'Slot changed');
        const unavailable = resources.inventory.echoes.kind === 'FINITE' && resources.inventory.echoes.count < 1 ? 'No Echoes available'
            : resources.inventory.tuners.kind === 'FINITE' && resources.inventory.tuners.count < 10 ? 'Not enough Tuners for +5' : null;
        if (unavailable || !simulatorTubeWitness(resources.inventory, CHECKPOINT_CUMULATIVE_COST[5].exp)) {
            next = structuredClone(next);
            next.run.status = 'EXHAUSTED';
            next.run.reason = unavailable ?? 'Not enough whole Tubes for +5';
            break;
        }
        try {
            let inventory = readResourceInventory(resources.inventory);
            if (inventory.echoes.kind === 'FINITE')
                inventory = updateResourceInventory(inventory, 'echoes', { kind: 'FINITE', count: inventory.echoes.count - 1 });
            let state = { revision: 0, progress: { cumulativeEchoEXP: 0, tunedThrough: 0 }, inventory };
            const spent = zero(), returned = zero();
            let lastLedger = null, exhausted = null;
            let attempt = clearSimulatorCandidate(next);
            // Identity-only configuration is replaced, never recorded as a rejected roll.
            const unplaced = attempt.slots[run.slot - 1].unplaced;
            if (unplaced.at(-1)?.card.level === undefined)
                unplaced.pop();
            attempt = startSimulatorCandidate(attempt, { echoId: run.template.echoId, selectedSonataSetId: run.template.selectedSonataSetId });
            attempt = rollSimulatorCandidate(attempt, run.template, rng, {
                before: (_echo, target) => {
                    const tuners = state.inventory.tuners;
                    if (tuners.kind === 'FINITE' && tuners.count < 10) {
                        exhausted = 'Not enough Tuners for +' + target;
                        return false;
                    }
                    const needed = Math.max(0, CHECKPOINT_CUMULATIVE_COST[target].exp - state.progress.cumulativeEchoEXP);
                    const witness = simulatorTubeWitness(state.inventory, needed);
                    if (!witness) {
                        exhausted = 'Not enough whole Tubes for +' + target;
                        return false;
                    }
                    if (needed > 0) {
                        const transaction = spendExactTubes(state, witness, state.revision);
                        state = transaction.state;
                        lastLedger = transaction.ledger;
                        for (const tube of ECHO_TUBES) {
                            spent[tube.id] += transaction.ledger.spent[tube.id];
                            returned[tube.id] += transaction.ledger.returned[tube.id];
                        }
                    }
                    state = tuneEligibleCheckpoint(state, state.revision);
                    return true;
                },
                after: echo => {
                    if (echo.level < run.gate)
                        return true;
                    const result = assessEchoRequirements(run.requirements, echo);
                    if (['INVALID', 'PENDING'].includes(result.status))
                        throw new Error(result.reason);
                    return result.status !== 'IMPOSSIBLE';
                },
            });
            const candidate = attempt.slots[run.slot - 1].candidate;
            const result = assessEchoRequirements(run.requirements, { rank: 5, level: candidate.card.level, substats: candidate.card.substats });
            attempt.resources.inventory = state.inventory;
            attempt.resources.lastLedger = lastLedger;
            for (const tube of ECHO_TUBES) {
                attempt.resources.spent[tube.id] += spent[tube.id];
                attempt.resources.returned[tube.id] += returned[tube.id];
            }
            if (exhausted) {
                attempt.run.status = 'EXHAUSTED';
                attempt.run.reason = exhausted + '; partial Echo retained';
                next = attempt;
                break;
            }
            if (candidate.card.level !== 25 && result.status !== 'IMPOSSIBLE')
                throw new Error('Unexpected partial requirement result.');
            attempt.run.sincePause++;
            if (result.status === 'SATISFIED' && candidate.card.level === 25) {
                if (run.autoActivate) {
                    const finished = structuredClone(candidate);
                    attempt = placeSimulatorCandidate(attempt, true);
                    attempt.slots[run.slot - 1].candidate = finished;
                    attempt.slots[run.slot - 1].accepted.at(-1).reason = 'Meets selected Echo requirements; activated in simulation.';
                    attempt.run.completedSlots.push(run.slot);
                }
                if (run.mode === 'FULL_SET' && run.slot < 5) {
                    attempt.selectedSlot = run.slot + 1;
                    attempt.run.slot = run.slot + 1;
                    attempt.run.template = structuredClone(run.templates[run.slot]);
                    attempt.run.reason = 'Running slot ' + attempt.selectedSlot + ' of 5';
                }
                else {
                    attempt.run.status = 'SUCCESS';
                    attempt.run.reason = run.mode === 'FULL_SET' ? 'All five slots meet selected Echo requirements' : 'Meets selected Echo requirements';
                }
            }
            else {
                attempt.slots[run.slot - 1].trash.push({ ...candidate, disposition: 'rejected', reason: result.reason });
                attempt.slots[run.slot - 1].candidate = null;
                if (attempt.run.sincePause >= pauseAfter) {
                    attempt.run.status = 'PAUSED';
                    attempt.run.reason = 'Safety pause — resume to keep trying';
                }
            }
            next = attempt;
        }
        catch (error) {
            next = structuredClone(next);
            next.run.status = 'BLOCKED';
            next.run.reason = String(error.message);
            break;
        }
    }
    return next;
}
