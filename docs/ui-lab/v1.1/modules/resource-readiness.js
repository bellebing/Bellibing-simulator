import {CHECKPOINT_CUMULATIVE_COST} from '../../../assets/echoCoreRules.js';
import {ECHO_TUBES} from '../../../assets/resourceInventory.js';

// Can a fresh detached search begin? This does not promise enough resources
// to finish the goal, spend inventory, or replace the runtime's exact receipts.
export function resourceReadiness(inventory) {
  const first = CHECKPOINT_CUMULATIVE_COST[5];
  const enough = (quantity, count) => quantity.kind === 'UNLIMITED' || quantity.count >= count;
  const missing = [];
  if (!enough(inventory.echoes, 1)) missing.push('echoes');
  if (!enough(inventory.tuners, first.tuners)) missing.push('tuners');
  const unlimitedXP = ECHO_TUBES.some(tube => inventory.tubes[tube.id].kind === 'UNLIMITED');
  const xp = unlimitedXP ? Infinity : ECHO_TUBES.reduce((sum, tube) => sum + inventory.tubes[tube.id].count * tube.echoExp, 0);
  if (xp < first.exp) missing.push('xp');
  const names = {echoes: 'Echoes', tuners: 'Tuners', xp: 'Echo XP'};
  return {missing, text: missing.length === 1 ? `Missing ${names[missing[0]]}` : missing.length ? 'Missing resources' : null};
}
