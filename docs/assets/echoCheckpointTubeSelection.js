import { CHECKPOINT_CUMULATIVE_COST } from './echoCoreRules.js';
import { ECHO_TUBES, readResourceInventory } from './resourceInventory.js';
/** Bounded, deterministic one-opportunity choice. This is not the horizon optimizer. */
export function selectExactOneCheckpointTubes(input) {
    const budget = readResourceInventory(input);
    const ids = ['premium', 'advanced', 'medium', 'basic'];
    const values = Object.fromEntries(ECHO_TUBES.map(row => [row.id, row.echoExp]));
    const target = CHECKPOINT_CUMULATIVE_COST[5].exp;
    const limit = target + Math.max(...Object.values(values)) - 1;
    const bounds = ids.map(id => {
        const quantity = budget.tubes[id];
        const cap = Math.ceil(limit / values[id]);
        return quantity.kind === 'UNLIMITED' ? cap : Math.min(cap, quantity.count);
    });
    let best = null;
    let score = null;
    for (let a = 0; a <= bounds[0]; a++)
        for (let b = 0; b <= bounds[1]; b++)
            for (let c = 0; c <= bounds[2]; c++)
                for (let d = 0; d <= bounds[3]; d++) {
                    const amounts = [a, b, c, d];
                    const total = amounts.reduce((sum, count, index) => sum + count * values[ids[index]], 0);
                    if (total < target || total > limit)
                        continue;
                    const candidate = [total - target, a + b + c + d, ...amounts];
                    if (!score || candidate.some((value, index) => value < score[index]
                        && candidate.slice(0, index).every((earlier, j) => earlier === score[j]))) {
                        score = candidate;
                        best = { premium: a, advanced: b, medium: c, basic: d };
                    }
                }
    return best;
}
