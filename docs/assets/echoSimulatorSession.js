import { matchesSimulatorReceipt, SIMULATOR_EVALUATOR_PENDING } from "./echoSimulatorBoundary.js";
const detached = (value) => structuredClone(value);
function slotIndex(slot) {
    if (!Number.isInteger(slot) || slot < 1 || slot > 5)
        throw new Error('Simulator slot must be 1–5');
    return slot - 1;
}
/** Memory-only ownership. No storage, real-build writer, acquisition or evaluator dependency. */
export function startEchoSimulator(characterId, realBuild, sessionId) {
    if (!characterId || !sessionId)
        throw new Error('Simulator source identity required');
    const simulatedBuild = detached(realBuild);
    const raw = simulatedBuild.echoSets;
    const activeSetId = raw?.sets?.[raw.activeSetId] ? raw.activeSetId : 'set-1';
    // Retain non-Echo context only. Account sets are source evidence, never
    // hypothetical equipment; an alternate set cannot become a fallback baseline.
    simulatedBuild.echoSets = {
        activeSetId,
        sets: { [activeSetId]: { slots: Array.from({ length: 5 }, () => null) } },
    };
    return {
        id: sessionId, source: { characterId, activeSetId, build: detached(realBuild) }, simulatedBuild,
        buildRevision: 0, weaponActive: !!realBuild.weaponId, selectedSlot: 1, slots: Array.from({ length: 5 }, () => ({ inactiveCard: null, candidate: null, unplaced: [], accepted: [], trash: [] })),
        inspected: null, nextCandidate: 1, rolling: { attempts: 0, checkpoints: 0, tuners: 0, exp: 0 }, evaluator: SIMULATOR_EVALUATOR_PENDING,
    };
}
export function simulatedEchoSlots(session) {
    return detached(session.simulatedBuild.echoSets.sets[session.source.activeSetId].slots);
}
export function selectSimulatorSlot(session, slot) {
    slotIndex(slot);
    return { ...session, selectedSlot: slot, inspected: null };
}
export function startSimulatorCandidate(session, card) {
    if (!card.echoId)
        throw new Error('Candidate identity required');
    const next = detached(session), index = slotIndex(session.selectedSlot);
    if (next.slots[index].candidate)
        throw new Error('Active candidate already exists');
    next.slots[index].candidate = { id: session.id + ':' + session.nextCandidate, revision: 0, card: detached(card), history: [detached(card)] };
    next.nextCandidate++;
    return next;
}
/** Record observed mechanics, without deciding whether the outcome is useful. */
export function recordSimulatorCheckpoint(session, card) {
    const next = detached(session), candidate = next.slots[slotIndex(session.selectedSlot)].candidate;
    if (!candidate || candidate.card.echoId !== card.echoId || candidate.card.selectedSonataSetId !== card.selectedSonataSetId)
        throw new Error('Checkpoint candidate mismatch');
    candidate.card = detached(card);
    candidate.revision++;
    candidate.history.push(detached(card));
    return next;
}
export function simulatorCandidateContext(session) {
    const candidate = session.slots[slotIndex(session.selectedSlot)].candidate;
    return candidate ? { sessionId: session.id, characterId: session.source.characterId, buildRevision: session.buildRevision,
        slot: session.selectedSlot, candidateId: candidate.id, candidateRevision: candidate.revision } : null;
}
/** Injected historical result only; production has no adapter calling this transition. */
export function applySimulatorDisposition(session, receipt) {
    const context = simulatorCandidateContext(session);
    if (!context || !matchesSimulatorReceipt(context, receipt))
        throw new Error('Stale or invalid simulator receipt');
    const next = detached(session), index = slotIndex(receipt.slot), candidate = next.slots[index].candidate;
    const history = { ...candidate, disposition: receipt.disposition, reason: receipt.reason };
    if (receipt.disposition === 'accepted') {
        if (candidate.card.level === undefined || !candidate.card.mainStat)
            throw new Error('Cannot accept an identity-only candidate');
        next.simulatedBuild.echoSets.sets[next.source.activeSetId].slots[index] = detached(candidate.card);
        next.slots[index].inactiveCard = null;
        next.slots[index].accepted.push(history);
        next.buildRevision++;
    }
    else
        next.slots[index].trash.push(history);
    next.slots[index].candidate = null;
    next.inspected = null;
    return next;
}
export function inspectSimulatorTrash(session, slot, candidateId) {
    const index = slotIndex(slot);
    if (candidateId && !session.slots[index].trash.some(card => card.id === candidateId))
        throw new Error('Trash card belongs to another slot');
    return { ...session, inspected: candidateId ? { slot, candidateId } : null };
}
export function resetEchoSimulator(session, sessionId) {
    if (sessionId === session.id)
        throw new Error('Reset requires a fresh session identity');
    return startEchoSimulator(session.source.characterId, session.source.build, sessionId);
}
export function closeEchoSimulator(_session) { return null; }
/** Display ownership includes inactive generated equipment; stat projection does not. */
export function simulatorEquipmentSlots(session) {
    return simulatedEchoSlots(session).map((card, index) => card ?? detached(session.slots[index].inactiveCard));
}
export function setSimulatorEchoActive(session, slot, active) {
    const index = slotIndex(slot), next = detached(session);
    const slots = next.simulatedBuild.echoSets.sets[next.source.activeSetId].slots;
    const card = slots[index] ?? next.slots[index].inactiveCard;
    if (!card || typeof card === 'string' || card.level === undefined || !card.mainStat)
        throw new Error('Generate an Echo before activation.');
    const wasActive = slots[index] !== null;
    if (wasActive === active)
        return next;
    slots[index] = active ? detached(card) : null;
    next.slots[index].inactiveCard = active ? null : detached(card);
    next.buildRevision++;
    return next;
}
export function setSimulatorWeaponActive(session, active) {
    if (!session.source.build.weaponId)
        throw new Error('No source Weapon available.');
    const next = detached(session);
    if (next.weaponActive === active)
        return next;
    next.weaponActive = active;
    next.simulatedBuild.weaponId = active ? next.source.build.weaponId : null;
    next.buildRevision++;
    return next;
}
