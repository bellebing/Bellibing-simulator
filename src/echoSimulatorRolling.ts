import type { EchoCost, RandomSource } from './echoCoreDomain.ts';
import type { PrimaryMainStatName } from './echoMainStats.ts';
import { createRank5EchoAtLevel0, withRank5MainStatsAtLevel } from './echoMainStats.ts';
import { VerifiedWuwaEchoRuntime } from './echoCoreRuntime.ts';
import { assessEchoRequirements } from './echoRequirements.ts';
import type { EchoSimulatorSession, SimulatorEchoCard } from './echoSimulatorSession.ts';
import { recordSimulatorCheckpoint } from './echoSimulatorSession.ts';

/** Already-eligible, explicitly selected template; no farming or Character prescription. */
export function rollSimulatorCandidate(session: EchoSimulatorSession, template: {
  echoId: string; selectedSonataSetId: string; cost: EchoCost; primaryMainStat: PrimaryMainStatName;
}, rng: RandomSource): EchoSimulatorSession {
  const candidate = session.slots[session.selectedSlot - 1]?.candidate;
  if (!candidate || candidate.card.echoId !== template.echoId
    || candidate.card.selectedSonataSetId !== template.selectedSonataSetId || !template.selectedSonataSetId)
    throw new Error('Select an eligible Echo and its assigned Sonata first.');
  if (candidate.card.level !== undefined) throw new Error('Place or clear the rolled candidate before rolling another.');
  if (![1, 3, 4].includes(template.cost)) throw new Error('Unsupported Echo cost.');
  const runtime = new VerifiedWuwaEchoRuntime();
  const initial = createRank5EchoAtLevel0({ id: candidate.id, cost: template.cost, primaryMainStat: template.primaryMainStat });
  const fresh = runtime.acquireFresh(initial, rng);
  const card = (echo: typeof initial): SimulatorEchoCard => ({ ...echo, echoId: template.echoId, selectedSonataSetId: template.selectedSonataSetId });
  let next = recordSimulatorCheckpoint(session, card(fresh.echo)), echo = fresh.echo;
  next.rolling.attempts += fresh.cost.echoes;
  for (let step = runtime.rollNext(echo, rng); step; step = runtime.rollNext(echo, rng)) {
    echo = step.echo;
    next = recordSimulatorCheckpoint(next, card(echo));
    next.rolling.checkpoints++;
    next.rolling.tuners += step.cost.tuners;
    next.rolling.exp += step.cost.exp;
  }
  return next;
}

/** Manual ownership transition, independent of public requirements and private usefulness. */
export function placeSimulatorCandidate(session: EchoSimulatorSession, replace = false): EchoSimulatorSession {
  const index = session.selectedSlot - 1, candidate = session.slots[index]?.candidate;
  const card = candidate?.card;
  if (!card || card.rank !== 5 || card.level !== 25 || !card.mainStat || !card.secondaryMainStat)
    throw new Error('Roll a complete Rank-5 +25 candidate first.');
  if (assessEchoRequirements({ requiredOnEveryEcho: [], groups: [] }, {
    rank: 5, level: 25, substats: card.substats ?? [],
  }).status !== 'SATISFIED') throw new Error('Invalid candidate substats.');
  const initial = createRank5EchoAtLevel0({ id: candidate.id, cost: card.cost as EchoCost, primaryMainStat: card.mainStat.name as PrimaryMainStatName });
  const expected = withRank5MainStatsAtLevel(initial, 25);
  if (JSON.stringify(card.mainStat) !== JSON.stringify(expected.mainStat)
    || JSON.stringify(card.secondaryMainStat) !== JSON.stringify(expected.secondaryMainStat)) throw new Error('Invalid candidate main stats.');
  const slots = session.simulatedBuild.echoSets!.sets[session.source.activeSetId].slots;
  if (slots[index] && !replace) throw new Error('Explicit replacement confirmation required.');
  const next = structuredClone(session);
  next.simulatedBuild.echoSets!.sets[next.source.activeSetId].slots[index] = structuredClone(card);
  next.slots[index].accepted.push({ ...structuredClone(candidate), disposition: 'placed', reason: 'Manually placed; Character improvement remains Pending.' });
  next.slots[index].candidate = null;
  next.buildRevision++;
  next.inspected = null;
  return next;
}

/** Explicit user action; retained history, no rejection policy and no refunds. */
export function clearSimulatorCandidate(session: EchoSimulatorSession): EchoSimulatorSession {
  const next = structuredClone(session), slot = next.slots[next.selectedSlot - 1];
  if (slot.candidate) slot.unplaced.push(slot.candidate);
  slot.candidate = null;
  return next;
}
