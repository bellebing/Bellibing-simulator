import { createRank5EchoAtLevel0, withRank5MainStatsAtLevel } from "./echoMainStats.js";
import { VerifiedWuwaEchoRuntime } from "./echoCoreRuntime.js";
import { assessEchoRequirements } from "./echoRequirements.js";
/** Already-eligible, explicitly selected template; no farming or Character prescription. */
export function rollSimulatorCandidate(session, template, rng) {
    const candidate = session.slots[session.selectedSlot - 1]?.candidate;
    if (!candidate || candidate.card.echoId !== template.echoId
        || candidate.card.selectedSonataSetId !== template.selectedSonataSetId || !template.selectedSonataSetId)
        throw new Error('Select an eligible Echo and its assigned Sonata first.');
    if (candidate.card.level !== undefined)
        throw new Error('Place or clear the rolled candidate before rolling another.');
    if (![1, 3, 4].includes(template.cost))
        throw new Error('Unsupported Echo cost.');
    const runtime = new VerifiedWuwaEchoRuntime();
    const initial = createRank5EchoAtLevel0({ id: candidate.id, cost: template.cost, primaryMainStat: template.primaryMainStat });
    const fresh = runtime.acquireFresh(initial, rng);
    const card = (echo) => ({ ...echo, echoId: template.echoId, selectedSonataSetId: template.selectedSonataSetId });
    // Stage one detached complete attempt, rather than cloning all older histories
    // at every checkpoint. Unsupported RNG still cannot commit a partial Echo.
    const next = structuredClone(session), observed = next.slots[next.selectedSlot - 1].candidate;
    const record = (echo) => {
        observed.card = structuredClone(card(echo));
        observed.revision++;
        observed.history.push(structuredClone(card(echo)));
    };
    let echo = fresh.echo;
    record(echo);
    next.rolling.attempts += fresh.cost.echoes;
    for (let step = runtime.rollNext(echo, rng); step; step = runtime.rollNext(echo, rng)) {
        echo = step.echo;
        record(echo);
        next.rolling.checkpoints++;
        next.rolling.tuners += step.cost.tuners;
        next.rolling.exp += step.cost.exp;
    }
    return next;
}
/** Manual ownership transition, independent of public requirements and private usefulness. */
export function placeSimulatorCandidate(session, replace = false) {
    const index = session.selectedSlot - 1, candidate = session.slots[index]?.candidate;
    const card = candidate?.card;
    if (!card || card.rank !== 5 || card.level !== 25 || !card.mainStat || !card.secondaryMainStat)
        throw new Error('Roll a complete Rank-5 +25 candidate first.');
    if (assessEchoRequirements({ requiredOnEveryEcho: [], groups: [] }, {
        rank: 5, level: 25, substats: card.substats ?? [],
    }).status !== 'SATISFIED')
        throw new Error('Invalid candidate substats.');
    const initial = createRank5EchoAtLevel0({ id: candidate.id, cost: card.cost, primaryMainStat: card.mainStat.name });
    const expected = withRank5MainStatsAtLevel(initial, 25);
    if (JSON.stringify(card.mainStat) !== JSON.stringify(expected.mainStat)
        || JSON.stringify(card.secondaryMainStat) !== JSON.stringify(expected.secondaryMainStat))
        throw new Error('Invalid candidate main stats.');
    const slots = session.simulatedBuild.echoSets.sets[session.source.activeSetId].slots;
    if (slots[index] && !replace)
        throw new Error('Explicit replacement confirmation required.');
    const next = structuredClone(session);
    next.simulatedBuild.echoSets.sets[next.source.activeSetId].slots[index] = structuredClone(card);
    next.slots[index].inactiveCard = null;
    next.slots[index].accepted.push({ ...structuredClone(candidate), disposition: 'placed', reason: 'Manually placed; Character improvement remains Pending.' });
    next.slots[index].candidate = null;
    next.buildRevision++;
    next.inspected = null;
    return next;
}
/** Explicit user action; retained history, no rejection policy and no refunds. */
export function clearSimulatorCandidate(session) {
    const next = structuredClone(session), slot = next.slots[next.selectedSlot - 1];
    if (slot.candidate && !slot.accepted.some(card => card.id === slot.candidate.id))
        slot.unplaced.push(slot.candidate);
    slot.candidate = null;
    return next;
}
