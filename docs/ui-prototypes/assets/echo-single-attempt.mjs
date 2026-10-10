// ONE +5 candidate attempt. Deterministic Tube choice; canonical mechanics and
// resource transaction are not Character evaluator or acquisition probabilities.
import { rollNewSubstat, assertExactRank5SubstatRoll, CHECKPOINT_CUMULATIVE_COST } from '../../assets/echoCoreRules.js';
import { readResourceInventory, updateResourceInventory } from '../../assets/resourceInventory.js';
import { selectExactOneCheckpointTubes } from '../../assets/echoCheckpointTubeSelection.js';
import { spendExactTubes, tuneEligibleCheckpoint } from '../../assets/echoExactTubeSpending.js';

export { selectExactOneCheckpointTubes } from '../../assets/echoCheckpointTubeSelection.js';
export function generateSingleEchoCandidate(inventoryInput, cardAtZero, rank5AtFive, rng) {
  const inventory = readResourceInventory(inventoryInput);
  if (!enough(inventory.echoes, 1)) throw new Error('No Echoes available. Set an explicit resource budget.');
  if (!enough(inventory.tuners, CHECKPOINT_CUMULATIVE_COST[5].tuners))
    throw new Error('Need 10 Tuners for the verified +5 checkpoint.');
  if (cardAtZero?.rank !== 5 || cardAtZero.level !== 0 || !cardAtZero.mainStat
    || !Array.isArray(cardAtZero.substats) || cardAtZero.substats.length !== 0)
    throw new Error('Only a source-backed Rank-5 +0 Echo template is supported.');
  if (!rank5AtFive?.mainStat || rank5AtFive.mainStat.name !== cardAtZero.mainStat.name
    || !rank5AtFive.secondaryMainStat || ![1, 3, 4].includes(cardAtZero.cost))
    throw new Error('Verified +5 main-stat progression is unavailable.');
  const selected = selectExactOneCheckpointTubes(inventory);
  if (!selected) throw new Error('Not enough whole Tubes to reach +5. Zero is not unlimited.');
  const input = { revision: 0, progress: { cumulativeEchoEXP: 0, tunedThrough: 0 }, inventory };
  const funded = spendExactTubes(input, selected, 0);
  const tuned = tuneEligibleCheckpoint(funded.state, funded.state.revision);
  const after = updateResourceInventory(tuned.inventory, 'echoes', inventory.echoes.kind === 'UNLIMITED'
    ? { kind: 'UNLIMITED' } : { kind: 'FINITE', count: inventory.echoes.count - 1 });
  const roll = rollNewSubstat([], rng);
  assertExactRank5SubstatRoll(roll);
  const candidate = { ...structuredClone(cardAtZero), level: 5,
    mainStat: { ...rank5AtFive.mainStat }, secondaryMainStat: { ...rank5AtFive.secondaryMainStat },
    substats: [roll] };
  return { initial: structuredClone(cardAtZero), candidate,
    after, ledger: funded.ledger,
    spent: { echoes: 1, tuners: CHECKPOINT_CUMULATIVE_COST[5].tuners, tubes: selected },
    progress: tuned.progress };
}
