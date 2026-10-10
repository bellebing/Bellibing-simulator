import type { SimulatorResources, SimulatorRun } from './echoSimulatorRun.ts';
import type { EchoLevel, StatRoll } from './echoCoreDomain.ts';
import type { SimulatorContext, SimulatorDispositionReceipt } from './echoSimulatorBoundary.ts';
import { matchesSimulatorReceipt, SIMULATOR_EVALUATOR_PENDING } from './echoSimulatorBoundary.ts';

/** Existing equipment card contract; mechanics remain in Echo Core. Identity-only candidates are valid. */
export interface SimulatorEchoCard {
  echoId: string;
  selectedSonataSetId?: string;
  level?: EchoLevel;
  mainStat?: StatRoll;
  substats?: StatRoll[];
  [key: string]: unknown;
}
export type SimulatorSlotCard = SimulatorEchoCard | string | null;
export interface SimulatorBuild {
  echoSets?: {
    activeSetId: string;
    sets: Record<string, { slots: SimulatorSlotCard[]; [key: string]: unknown }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
export interface SimulatorCandidate {
  id: string;
  revision: number;
  card: SimulatorEchoCard;
  /** Detached actual card snapshots, including initial identity and observed checkpoints. */
  history: SimulatorEchoCard[];
}
export interface SimulatorHistoryCard extends SimulatorCandidate {
  disposition: 'accepted' | 'rejected' | 'placed';
  reason: string;
}
export interface SimulatorSlotHistory {
  /** Generated equipment is moved here while inactive, never destroyed. */
  inactiveCard: SimulatorEchoCard | null;
  candidate: SimulatorCandidate | null;
  unplaced: SimulatorCandidate[];
  accepted: SimulatorHistoryCard[];
  trash: SimulatorHistoryCard[];
}
export interface EchoSimulatorSession {
  id: string;
  source: { characterId: string; activeSetId: string; build: SimulatorBuild };
  simulatedBuild: SimulatorBuild;
  buildRevision: number;
  weaponActive: boolean;
  selectedSlot: number;
  slots: SimulatorSlotHistory[];
  inspected: { slot: number; candidateId: string } | null;
  nextCandidate: number;
  /** Gross mechanics only, never inventory transactions or recovery receipts. EXP stays internal. */
  rolling: { attempts: number; checkpoints: number; tuners: number; exp: number };
  resources?: SimulatorResources;
  run?: SimulatorRun;
  evaluator: typeof SIMULATOR_EVALUATOR_PENDING;
}
const detached = <T>(value: T): T => structuredClone(value);
function slotIndex(slot: number): number {
  if (!Number.isInteger(slot) || slot < 1 || slot > 5) throw new Error('Simulator slot must be 1–5');
  return slot - 1;
}

/** Memory-only ownership. No storage, real-build writer, acquisition or evaluator dependency. */
export function startEchoSimulator(characterId: string, realBuild: SimulatorBuild, sessionId: string): EchoSimulatorSession {
  if (!characterId || !sessionId) throw new Error('Simulator source identity required');
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
export function simulatedEchoSlots(session: EchoSimulatorSession): SimulatorSlotCard[] {
  return detached(session.simulatedBuild.echoSets!.sets[session.source.activeSetId].slots);
}
export function selectSimulatorSlot(session: EchoSimulatorSession, slot: number): EchoSimulatorSession {
  slotIndex(slot);
  return { ...session, selectedSlot: slot, inspected: null };
}
export function startSimulatorCandidate(session: EchoSimulatorSession, card: SimulatorEchoCard): EchoSimulatorSession {
  if (!card.echoId) throw new Error('Candidate identity required');
  const next = detached(session), index = slotIndex(session.selectedSlot);
  if (next.slots[index].candidate) throw new Error('Active candidate already exists');
  next.slots[index].candidate = { id: session.id + ':' + session.nextCandidate, revision: 0, card: detached(card), history: [detached(card)] };
  next.nextCandidate++;
  return next;
}
/** Record observed mechanics, without deciding whether the outcome is useful. */
export function recordSimulatorCheckpoint(session: EchoSimulatorSession, card: SimulatorEchoCard): EchoSimulatorSession {
  const next = detached(session), candidate = next.slots[slotIndex(session.selectedSlot)].candidate;
  if (!candidate || candidate.card.echoId !== card.echoId || candidate.card.selectedSonataSetId !== card.selectedSonataSetId) throw new Error('Checkpoint candidate mismatch');
  candidate.card = detached(card); candidate.revision++; candidate.history.push(detached(card));
  return next;
}
export function simulatorCandidateContext(session: EchoSimulatorSession): SimulatorContext | null {
  const candidate = session.slots[slotIndex(session.selectedSlot)].candidate;
  return candidate ? { sessionId: session.id, characterId: session.source.characterId, buildRevision: session.buildRevision,
    slot: session.selectedSlot, candidateId: candidate.id, candidateRevision: candidate.revision } : null;
}
/** Injected historical result only; production has no adapter calling this transition. */
export function applySimulatorDisposition(session: EchoSimulatorSession, receipt: SimulatorDispositionReceipt): EchoSimulatorSession {
  const context = simulatorCandidateContext(session);
  if (!context || !matchesSimulatorReceipt(context, receipt)) throw new Error('Stale or invalid simulator receipt');
  const next = detached(session), index = slotIndex(receipt.slot), candidate = next.slots[index].candidate!;
  const history: SimulatorHistoryCard = { ...candidate, disposition: receipt.disposition, reason: receipt.reason };
  if (receipt.disposition === 'accepted') {
    if (candidate.card.level === undefined || !candidate.card.mainStat) throw new Error('Cannot accept an identity-only candidate');
    next.simulatedBuild.echoSets!.sets[next.source.activeSetId].slots[index] = detached(candidate.card);
    next.slots[index].inactiveCard = null;
    next.slots[index].accepted.push(history); next.buildRevision++;
  } else next.slots[index].trash.push(history);
  next.slots[index].candidate = null; next.inspected = null;
  return next;
}
export function inspectSimulatorTrash(session: EchoSimulatorSession, slot: number, candidateId: string | null): EchoSimulatorSession {
  const index = slotIndex(slot);
  if (candidateId && !session.slots[index].trash.some(card => card.id === candidateId)) throw new Error('Trash card belongs to another slot');
  return { ...session, inspected: candidateId ? { slot, candidateId } : null };
}
export function resetEchoSimulator(session: EchoSimulatorSession, sessionId: string): EchoSimulatorSession {
  if (sessionId === session.id) throw new Error('Reset requires a fresh session identity');
  return startEchoSimulator(session.source.characterId, session.source.build, sessionId);
}
export function closeEchoSimulator(_session: EchoSimulatorSession): null { return null; }

/** Display ownership includes inactive generated equipment; stat projection does not. */
export function simulatorEquipmentSlots(session: EchoSimulatorSession): SimulatorSlotCard[] {
  return simulatedEchoSlots(session).map((card, index) => card ?? detached(session.slots[index].inactiveCard));
}
export function setSimulatorEchoActive(session: EchoSimulatorSession, slot: number, active: boolean): EchoSimulatorSession {
  const index = slotIndex(slot), next = detached(session);
  const slots = next.simulatedBuild.echoSets!.sets[next.source.activeSetId].slots;
  const card = slots[index] ?? next.slots[index].inactiveCard;
  if (!card || typeof card === 'string' || card.level === undefined || !card.mainStat) throw new Error('Generate an Echo before activation.');
  const wasActive = slots[index] !== null;
  if (wasActive === active) return next;
  slots[index] = active ? detached(card) : null;
  next.slots[index].inactiveCard = active ? null : detached(card);
  next.buildRevision++;
  return next;
}
export function setSimulatorWeaponActive(session: EchoSimulatorSession, active: boolean): EchoSimulatorSession {
  if (!session.source.build.weaponId) throw new Error('No source Weapon available.');
  const next = detached(session);
  if (next.weaponActive === active) return next;
  next.weaponActive = active;
  next.simulatedBuild.weaponId = active ? next.source.build.weaponId : null;
  next.buildRevision++;
  return next;
}
