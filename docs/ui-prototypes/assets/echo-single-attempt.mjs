// ONE +5 candidate attempt. Deterministic Tube choice; canonical mechanics and
// resource transaction are not Character evaluator or acquisition probabilities.
import { rollNewSubstat, assertExactRank5SubstatRoll, CHECKPOINT_CUMULATIVE_COST } from '../../assets/echoCoreRules.js';
import { readResourceInventory, updateResourceInventory, ECHO_TUBES } from '../../assets/resourceInventory.js';
import { spendExactTubes, tuneEligibleCheckpoint } from '../../assets/echoExactTubeSpending.js';

const tubes = ['premium', 'advanced', 'medium', 'basic'];
const values = Object.fromEntries(ECHO_TUBES.map(row => [row.id, row.echoExp]));
const enough = (quantity, amount) => quantity.kind === 'UNLIMITED' || quantity.count >= amount;
const available = (quantity, maximum) => quantity.kind === 'UNLIMITED' ? maximum : Math.min(maximum, quantity.count);
export function selectExactOneCheckpointTubes(inventory) {
  const budget = readResourceInventory(inventory);
  const target = CHECKPOINT_CUMULATIVE_COST[5].exp;
  const limit = target + Math.max(...Object.values(values)) - 1;
  const bounds = tubes.map(id => available(budget.tubes[id], Math.ceil(limit / values[id])));
  let best = null, score = null;
  for (let a = 0; a <= bounds[0]; a++)
  for (let b = 0; b <= bounds[1]; b++)
  for (let c = 0; c <= bounds[2]; c++)
  for (let d = 0; d <= bounds[3]; d++) {
    const counts = [a,b,c,d], total = counts.reduce((sum,n,i) => sum + n * values[tubes[i]], 0);
    if (total < target || total > limit) continue;
    const current = [total - target, counts.reduce((sum,n) => sum+n, 0), ...counts];
    if (!score || current.some((v,i) => v < score[i] && current.slice(0,i).every((x,j) => x === score[j]))) {
      score = current; best = Object.fromEntries(tubes.map((id,i) => [id, counts[i]]));
    }
  }
  return best;
}
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
