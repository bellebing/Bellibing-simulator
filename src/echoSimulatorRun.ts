import type { RandomSource } from './echoCoreDomain.ts';
import type { EchoRequirements } from './improvePolicyDomain.ts';
import type { EchoSimulatorSession } from './echoSimulatorSession.ts';
import { startSimulatorCandidate } from './echoSimulatorSession.ts';
import { rollSimulatorCandidate, clearSimulatorCandidate, placeSimulatorCandidate } from './echoSimulatorRolling.ts';
import { assessEchoRequirements } from './echoRequirements.ts';
import { ECHO_TUBES, readResourceInventory, updateResourceInventory } from './resourceInventory.ts';
import type { ResourceInventory } from './resourceInventory.ts';
import { MAX_RANK5_ECHO_EXP, spendExactTubes, tuneEligibleCheckpoint } from './echoExactTubeSpending.ts';
import type { TubeCounts, TubeLedger } from './echoExactTubeSpending.ts';

export type SimulatorTemplate = Parameters<typeof rollSimulatorCandidate>[1];
export interface SimulatorRun {
  status: 'RUNNING' | 'SUCCESS' | 'EXHAUSTED' | 'CANCELLED' | 'PAUSED' | 'BLOCKED';
  reason: string;
  slot: number;
  template: SimulatorTemplate;
  requirements: EchoRequirements;
  gate: number;
  sincePause: number;
  mode?: 'ONE_SLOT' | 'FULL_SET';
  templates?: SimulatorTemplate[];
  completedSlots?: number[];
  autoActivate?: boolean;
}
export interface SimulatorResources {
  inventory: ResourceInventory;
  basis: ResourceInventory;
  spent: Record<keyof TubeCounts, number>;
  returned: Record<keyof TubeCounts, number>;
  lastLedger: TubeLedger | null;
}
const zero = () => ({ premium: 0, advanced: 0, medium: 0, basic: 0 });
export function initializeSimulatorResources(session: EchoSimulatorSession, inventory: ResourceInventory): EchoSimulatorSession {
  const next = structuredClone(session), basis = readResourceInventory(inventory);
  next.resources = { inventory: structuredClone(basis), basis, spent: zero(), returned: zero(), lastLedger: null };
  return next;
}
/** Bounded whole-item witness, not a finite-budget economic optimizer. The explicit
 * V1 policy selects the smallest supplied EXP reaching +25; equivalent witnesses
 * follow canonical catalog order. All spending/carry/cap returns remain engine-owned.
 * Binary decomposition caps work independently of arbitrarily large inventories. */
export function simulatorTubeWitness(inventory: ResourceInventory): TubeCounts | null {
  inventory = readResourceInventory(inventory);
  const unit = Math.min(...ECHO_TUBES.map(tube => tube.echoExp));
  const target = Math.ceil(MAX_RANK5_ECHO_EXP / unit);
  const bound = target + Math.max(...ECHO_TUBES.map(tube => tube.echoExp)) / unit - 1;
  const reachable: (Record<keyof TubeCounts, number> | undefined)[] = Array(bound + 1);
  reachable[0] = zero();
  for (const tube of ECHO_TUBES) {
    const weight = tube.echoExp / unit, quantity = inventory.tubes[tube.id];
    let remaining = Math.min(Math.floor(bound / weight), quantity.kind === 'UNLIMITED' ? Infinity : quantity.count);
    for (let size = 1; remaining > 0; size *= 2) {
      const count = Math.min(size, remaining); remaining -= count;
      for (let total = bound; total >= count * weight; total--) {
        const prior = reachable[total - count * weight];
        if (!reachable[total] && prior) reachable[total] = { ...prior, [tube.id]: prior[tube.id] + count };
      }
    }
  }
  return reachable.slice(target).find(Boolean) ?? null;
}
export function beginSimulatorRun(session: EchoSimulatorSession, template: SimulatorTemplate, requirements: EchoRequirements, gate: number): EchoSimulatorSession {
  if (!session.resources) throw new Error('Resources unavailable. Reset the simulation.');
  const next = structuredClone(session);
  next.run = { status: 'RUNNING', reason: 'Running', slot: session.selectedSlot, template: structuredClone(template), requirements: structuredClone(requirements), gate, sincePause: 0 };
  try {
    const result = assessEchoRequirements(requirements, { rank: 5, level: 0, substats: [] });
    if (['INVALID', 'IMPOSSIBLE', 'PENDING'].includes(result.status)) throw new Error(result.reason);
    if (![5,10,15,20,25].includes(gate)) throw new Error('Invalid Gate setting.');
  } catch (error) { next.run.status = 'BLOCKED'; next.run.reason = String((error as Error).message); }
  return next;
}
/** Same transaction driver, with five snapshotted templates and one working budget. */
export function beginSimulatorExecution(session: EchoSimulatorSession, templates: SimulatorTemplate[], mode: 'ONE_SLOT' | 'FULL_SET', requirements: EchoRequirements, gate: number): EchoSimulatorSession {
  if (!['ONE_SLOT', 'FULL_SET'].includes(mode) || templates.length !== 5 || (mode === 'FULL_SET' ? templates.some(template => !template) : !templates[session.selectedSlot - 1])) throw new Error('Prepare all five eligible slot templates.');
  const prepared = structuredClone(session);
  if (mode === 'FULL_SET') prepared.selectedSlot = 1;
  const next = beginSimulatorRun(prepared, templates[prepared.selectedSlot - 1], requirements, gate);
  next.run!.mode = mode; next.run!.templates = structuredClone(templates);
  next.run!.completedSlots = []; next.run!.autoActivate = true;
  return next;
}
export function stopSimulatorRun(session: EchoSimulatorSession, reason = 'Cancelled'): EchoSimulatorSession {
  const next = structuredClone(session);
  if (next.run && (['RUNNING', 'PAUSED'].includes(next.run.status) || reason !== 'Cancelled')) { next.run.status = 'CANCELLED'; next.run.reason = reason; }
  return next;
}
export function resumeSimulatorRun(session: EchoSimulatorSession): EchoSimulatorSession {
  const next = structuredClone(session);
  if (next.run?.status === 'PAUSED') { next.run.status = 'RUNNING'; next.run.reason = 'Running'; next.run.sincePause = 0; }
  return next;
}
/** One complete Echo is an atomic commit; callers yield between attempts. No
 * early Gate rejection or recovery policy is inferred. Failed requirements spend
 * real resources; invalid mechanics/RNG leave candidate and inventory untouched. */
export function advanceSimulatorRun(session: EchoSimulatorSession, rng: RandomSource, batchSize = 4, pauseAfter = 1000): EchoSimulatorSession {
  if (!Number.isSafeInteger(batchSize) || batchSize < 1 || batchSize > 20 || !Number.isSafeInteger(pauseAfter) || pauseAfter < 1) throw new Error('Invalid cooperative bounds.');
  let next = session;
  for (let step = 0; step < batchSize && next.run?.status === 'RUNNING'; step++) {
    const run = next.run, resources = next.resources!;
    if (run.slot !== next.selectedSlot) return stopSimulatorRun(next, 'Slot changed');
    const unavailable = resources.inventory.echoes.kind === 'FINITE' && resources.inventory.echoes.count < 1 ? 'No Echoes available'
      : resources.inventory.tuners.kind === 'FINITE' && resources.inventory.tuners.count < 50 ? 'Not enough Tuners for +25' : null;
    const witness = unavailable ? null : simulatorTubeWitness(resources.inventory);
    if (unavailable || !witness) {
      next = structuredClone(next); next.run!.status = 'EXHAUSTED'; next.run!.reason = unavailable ?? 'Not enough whole EXP Tubes for +25'; break;
    }
    try {
      let inventory = readResourceInventory(resources.inventory);
      if (inventory.echoes.kind === 'FINITE') inventory = updateResourceInventory(inventory, 'echoes', { kind: 'FINITE', count: inventory.echoes.count - 1 });
      const transaction = spendExactTubes({ revision: 0, progress: { cumulativeEchoEXP: 0, tunedThrough: 0 }, inventory }, witness!, 0);
      let state = transaction.state;
      for (let checkpoint = 0; checkpoint < 5; checkpoint++) state = tuneEligibleCheckpoint(state, state.revision);
      let attempt = clearSimulatorCandidate(next);
      // Identity-only configuration is replaced, never recorded as a rejected roll.
      const unplaced = attempt.slots[run.slot - 1].unplaced;
      if (unplaced.at(-1)?.card.level === undefined) unplaced.pop();
      attempt = startSimulatorCandidate(attempt, { echoId: run.template.echoId, selectedSonataSetId: run.template.selectedSonataSetId });
      attempt = rollSimulatorCandidate(attempt, run.template, rng);
      const candidate = attempt.slots[run.slot - 1].candidate!;
      const result = assessEchoRequirements(run.requirements, { rank: 5, level: 25, substats: candidate.card.substats! });
      if (!['SATISFIED', 'IMPOSSIBLE'].includes(result.status)) throw new Error('Unsupported completed requirement result: ' + result.status);
      attempt.resources!.inventory = state.inventory;
      attempt.resources!.lastLedger = transaction.ledger;
      for (const tube of ECHO_TUBES) {
        attempt.resources!.spent[tube.id] += transaction.ledger.spent[tube.id];
        attempt.resources!.returned[tube.id] += transaction.ledger.returned[tube.id];
      }
      attempt.run!.sincePause++;
      if (result.status === 'SATISFIED') {
        if (run.autoActivate) {
          const finished = structuredClone(candidate);
          attempt = placeSimulatorCandidate(attempt, true);
          attempt.slots[run.slot - 1].candidate = finished;
          attempt.slots[run.slot - 1].accepted.at(-1)!.reason = 'Meets selected Echo requirements; activated in simulation.';
          attempt.run!.completedSlots!.push(run.slot);
        }
        if (run.mode === 'FULL_SET' && run.slot < 5) {
          attempt.selectedSlot = run.slot + 1;
          attempt.run!.slot = run.slot + 1;
          attempt.run!.template = structuredClone(run.templates![run.slot]);
          attempt.run!.reason = 'Running slot ' + attempt.selectedSlot + ' of 5';
        } else {
          attempt.run!.status = 'SUCCESS';
          attempt.run!.reason = run.mode === 'FULL_SET' ? 'All five slots meet selected Echo requirements' : 'Meets selected Echo requirements';
        }
      }
      else {
        attempt.slots[run.slot - 1].trash.push({ ...candidate, disposition: 'rejected', reason: result.reason });
        attempt.slots[run.slot - 1].candidate = null;
        if (attempt.run!.sincePause >= pauseAfter) { attempt.run!.status = 'PAUSED'; attempt.run!.reason = 'Safety pause — resume to keep trying'; }
      }
      next = attempt;
    } catch (error) { next = structuredClone(next); next.run!.status = 'BLOCKED'; next.run!.reason = String((error as Error).message); break; }
  }
  return next;
}
