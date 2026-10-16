import { nextCheckpoint, CHECKPOINT_CUMULATIVE_COST } from "./echoCoreRules.js";
import { createRank5EchoAtLevel0 } from "./echoMainStats.js";
import { VerifiedWuwaEchoRuntime } from "./echoCoreRuntime.js";
import { startEchoSimulator, startSimulatorCandidate, recordSimulatorCheckpoint } from "./echoSimulatorSession.js";
import { readResourceInventory, updateResourceInventory } from "./resourceInventory.js";
import { spendExactTubes, tuneEligibleCheckpoint } from "./echoExactTubeSpending.js";
import { simulatorTubeWitness } from "./echoSimulatorTubeSelection.js";
export function workshopToken(session) {
    const candidate = session.slots[session.selectedSlot - 1].candidate;
    return { sessionId: session.id, slot: session.selectedSlot, revision: session.manual.revision,
        candidateId: candidate?.id ?? null, candidateRevision: candidate?.revision ?? null };
}
function assertToken(session, token) {
    const current = workshopToken(session);
    if (Object.keys(current).some(key => current[key] !== token[key]))
        throw new Error('This action is stale. Select the current candidate again.');
}
export function startManualWorkshop(characterId, build, id, inventory) {
    return { ...startEchoSimulator(characterId, build, id), manual: {
            revision: 0, basis: readResourceInventory(inventory), inventory: readResourceInventory(inventory), progress: {}, receipts: [],
        } };
}
/** One explicitly selected eligible candidate. No farming probability or account writes. */
export function createWorkshopCandidate(session, template, catalog, token) {
    assertToken(session, token);
    if (session.slots[session.selectedSlot - 1].candidate)
        throw new Error('This slot already has a candidate. Inspect it or reset the sandbox.');
    const species = catalog.find(row => row.id === template.echoId && row.releaseStatus === 'RELEASED');
    if (!species || !species.sonataSetIds.includes(template.selectedSonataSetId))
        throw new Error('Choose a released Echo and a valid assigned Sonata.');
    const inventory = readResourceInventory(session.manual.inventory);
    if (inventory.echoes.kind === 'FINITE' && inventory.echoes.count === 0)
        throw new Error('No Echoes in the session budget. Edit Resources and reset the sandbox.');
    const initial = createRank5EchoAtLevel0({ id: session.id + ':' + session.nextCandidate, cost: species.cost, primaryMainStat: template.primaryMainStat });
    const acquired = new VerifiedWuwaEchoRuntime().acquireFresh(initial, { next() { throw new Error('Acquisition must not roll substats.'); } });
    const card = { ...acquired.echo, echoId: species.id, selectedSonataSetId: template.selectedSonataSetId };
    const next = startSimulatorCandidate(session, card);
    if (inventory.echoes.kind === 'FINITE')
        next.manual.inventory = updateResourceInventory(inventory, 'echoes', { kind: 'FINITE', count: inventory.echoes.count - acquired.cost.echoes });
    const candidate = next.slots[next.selectedSlot - 1].candidate;
    next.manual.progress[candidate.id] = { cumulativeEchoEXP: 0, tunedThrough: 0 };
    next.manual.receipts.push({ candidateId: candidate.id, slot: next.selectedSlot, level: 0, echoes: acquired.cost.echoes, tuners: 0, tubes: null });
    next.manual.revision++;
    return next;
}
/** Funding, tuning, RNG and the observed checkpoint commit together, or not at all.
 * Progress belongs to the existing slot candidate; all slots share one detached budget.
 * This adapter deliberately never calls requirement acceptance or disposition policy. */
export function rollWorkshopCheckpoint(session, rng, token) {
    assertToken(session, token);
    const candidate = session.slots[session.selectedSlot - 1].candidate;
    if (!candidate || candidate.card.level === undefined)
        throw new Error('Create a candidate first.');
    const target = nextCheckpoint(candidate.card.level);
    if (target === null)
        throw new Error('This Echo is already +25.');
    const progress = session.manual.progress[candidate.id];
    if (!progress || progress.tunedThrough !== candidate.card.level)
        throw new Error('Candidate progress is unavailable.');
    let resource = { revision: session.manual.revision, progress, inventory: readResourceInventory(session.manual.inventory) };
    const tuners = resource.inventory.tuners;
    const tunerCost = CHECKPOINT_CUMULATIVE_COST[target].tuners - CHECKPOINT_CUMULATIVE_COST[candidate.card.level].tuners;
    if (tuners.kind === 'FINITE' && tuners.count < tunerCost)
        throw new Error('Not enough Premium Tuners for +' + target + '.');
    const needed = Math.max(0, CHECKPOINT_CUMULATIVE_COST[target].exp - progress.cumulativeEchoEXP);
    let ledger = null;
    if (needed > 0) {
        const witness = simulatorTubeWitness(resource.inventory, needed);
        if (!witness)
            throw new Error('Not enough whole Sealed Tubes for +' + target + '.');
        const funded = spendExactTubes(resource, witness, resource.revision);
        resource = funded.state;
        ledger = funded.ledger;
    }
    resource = tuneEligibleCheckpoint(resource, resource.revision);
    const rolled = new VerifiedWuwaEchoRuntime().rollNext(candidate.card, rng);
    const next = recordSimulatorCheckpoint(session, { ...candidate.card, ...rolled.echo });
    next.manual.inventory = resource.inventory;
    next.manual.progress[candidate.id] = resource.progress;
    next.manual.receipts.push({ candidateId: candidate.id, slot: session.selectedSlot, level: target, echoes: 0, tuners: rolled.cost.tuners, tubes: ledger });
    next.manual.revision++;
    return next;
}
