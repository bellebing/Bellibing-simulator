import type { Echo, EchoCost, RandomSource } from './echoCoreDomain.ts';
import { nextCheckpoint, CHECKPOINT_CUMULATIVE_COST } from './echoCoreRules.ts';
import { createRank5EchoAtLevel0, type PrimaryMainStatName } from './echoMainStats.ts';
import { VerifiedWuwaEchoRuntime } from './echoCoreRuntime.ts';
import { startEchoSimulator, startSimulatorCandidate, recordSimulatorCheckpoint } from './echoSimulatorSession.ts';
import type { EchoSimulatorSession, SimulatorBuild, SimulatorEchoCard } from './echoSimulatorSession.ts';
import { readResourceInventory, updateResourceInventory } from './resourceInventory.ts';
import type { ResourceInventory } from './resourceInventory.ts';
import { spendExactTubes, tuneEligibleCheckpoint } from './echoExactTubeSpending.ts';
import type { ExactEchoProgress, TubeLedger } from './echoExactTubeSpending.ts';
import { simulatorTubeWitness } from './echoSimulatorTubeSelection.ts';

export interface WorkshopTemplate { echoId: string; selectedSonataSetId: string; primaryMainStat: PrimaryMainStatName }
export interface WorkshopSpecies { id: string; cost: EchoCost; sonataSetIds: readonly string[]; releaseStatus: string }
export interface WorkshopReceipt {
  candidateId: string; slot: number; level: number; echoes: number; tuners: number; tubes: TubeLedger | null;
}
export interface ManualWorkshopSession extends EchoSimulatorSession {
  manual: {
    revision: number; basis: ResourceInventory; inventory: ResourceInventory;
    progress: Record<string, ExactEchoProgress>; receipts: WorkshopReceipt[];
  };
}
export interface WorkshopToken { sessionId: string; slot: number; revision: number; candidateId: string | null; candidateRevision: number | null }
export function workshopToken(session: ManualWorkshopSession): WorkshopToken {
  const candidate = session.slots[session.selectedSlot - 1].candidate;
  return { sessionId: session.id, slot: session.selectedSlot, revision: session.manual.revision,
    candidateId: candidate?.id ?? null, candidateRevision: candidate?.revision ?? null };
}
function assertToken(session: ManualWorkshopSession, token: WorkshopToken) {
  const current = workshopToken(session);
  if (Object.keys(current).some(key => current[key as keyof WorkshopToken] !== token[key as keyof WorkshopToken]))
    throw new Error('This action is stale. Select the current candidate again.');
}
export function startManualWorkshop(characterId: string, build: SimulatorBuild, id: string, inventory: ResourceInventory): ManualWorkshopSession {
  return { ...startEchoSimulator(characterId, build, id), manual: {
    revision: 0, basis: readResourceInventory(inventory), inventory: readResourceInventory(inventory), progress: {}, receipts: [],
  } };
}
/** One explicitly selected eligible candidate. No farming probability or account writes. */
export function createWorkshopCandidate(session: ManualWorkshopSession, template: WorkshopTemplate,
  catalog: readonly WorkshopSpecies[], token: WorkshopToken): ManualWorkshopSession {
  assertToken(session, token);
  if (session.slots[session.selectedSlot - 1].candidate) throw new Error('This slot already has a candidate. Inspect it or reset the sandbox.');
  const species = catalog.find(row => row.id === template.echoId && row.releaseStatus === 'RELEASED');
  if (!species || !species.sonataSetIds.includes(template.selectedSonataSetId)) throw new Error('Choose a released Echo and a valid assigned Sonata.');
  const inventory = readResourceInventory(session.manual.inventory);
  if (inventory.echoes.kind === 'FINITE' && inventory.echoes.count === 0) throw new Error('No Echoes in the session budget. Edit Resources and reset the sandbox.');
  const initial = createRank5EchoAtLevel0({ id: session.id + ':' + session.nextCandidate, cost: species.cost, primaryMainStat: template.primaryMainStat });
  const acquired = new VerifiedWuwaEchoRuntime().acquireFresh(initial, { next() { throw new Error('Acquisition must not roll substats.'); } });
  const card: SimulatorEchoCard = { ...acquired.echo, echoId: species.id, selectedSonataSetId: template.selectedSonataSetId };
  const next = startSimulatorCandidate(session, card) as ManualWorkshopSession;
  if (inventory.echoes.kind === 'FINITE') next.manual.inventory = updateResourceInventory(inventory, 'echoes', { kind: 'FINITE', count: inventory.echoes.count - acquired.cost.echoes });
  const candidate = next.slots[next.selectedSlot - 1].candidate!;
  next.manual.progress[candidate.id] = { cumulativeEchoEXP: 0, tunedThrough: 0 };
  next.manual.receipts.push({ candidateId: candidate.id, slot: next.selectedSlot, level: 0, echoes: acquired.cost.echoes, tuners: 0, tubes: null });
  next.manual.revision++;
  return next;
}
/** Funding, tuning, RNG and the observed checkpoint commit together, or not at all.
 * Progress belongs to the existing slot candidate; all slots share one detached budget.
 * This adapter deliberately never calls requirement acceptance or disposition policy. */
export function rollWorkshopCheckpoint(session: ManualWorkshopSession, rng: RandomSource, token: WorkshopToken): ManualWorkshopSession {
  assertToken(session, token);
  const candidate = session.slots[session.selectedSlot - 1].candidate;
  if (!candidate || candidate.card.level === undefined) throw new Error('Create a candidate first.');
  const target = nextCheckpoint(candidate.card.level);
  if (target === null) throw new Error('This Echo is already +25.');
  const progress = session.manual.progress[candidate.id];
  if (!progress || progress.tunedThrough !== candidate.card.level) throw new Error('Candidate progress is unavailable.');
  let resource = { revision: session.manual.revision, progress, inventory: readResourceInventory(session.manual.inventory) };
  const tuners = resource.inventory.tuners;
  const tunerCost = CHECKPOINT_CUMULATIVE_COST[target].tuners - CHECKPOINT_CUMULATIVE_COST[candidate.card.level].tuners;
  if (tuners.kind === 'FINITE' && tuners.count < tunerCost) throw new Error('Not enough Premium Tuners for +' + target + '.');
  const needed = Math.max(0, CHECKPOINT_CUMULATIVE_COST[target].exp - progress.cumulativeEchoEXP);
  let ledger: TubeLedger | null = null;
  if (needed > 0) {
    const witness = simulatorTubeWitness(resource.inventory, needed);
    if (!witness) throw new Error('Not enough whole Sealed Tubes for +' + target + '.');
    const funded = spendExactTubes(resource, witness, resource.revision);
    resource = funded.state; ledger = funded.ledger;
  }
  resource = tuneEligibleCheckpoint(resource, resource.revision);
  const rolled = new VerifiedWuwaEchoRuntime().rollNext(candidate.card as unknown as Echo, rng)!;
  const next = recordSimulatorCheckpoint(session, { ...candidate.card, ...rolled.echo }) as ManualWorkshopSession;
  next.manual.inventory = resource.inventory;
  next.manual.progress[candidate.id] = resource.progress;
  next.manual.receipts.push({ candidateId: candidate.id, slot: session.selectedSlot, level: target, echoes: 0, tuners: rolled.cost.tuners, tubes: ledger });
  next.manual.revision = resource.revision;
  return next;
}
