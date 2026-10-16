// Reused from PR #288. Deterministic whole-item funding, not economic evaluation.
import { ECHO_TUBES, readResourceInventory } from "./resourceInventory.js";
import { MAX_RANK5_ECHO_EXP } from "./echoExactTubeSpending.js";
const zero = () => ({ premium: 0, advanced: 0, medium: 0, basic: 0 });
export function simulatorTubeWitness(inventory, neededEXP = MAX_RANK5_ECHO_EXP) {
    if (!Number.isSafeInteger(neededEXP) || neededEXP < 0 || neededEXP > MAX_RANK5_ECHO_EXP)
        throw new Error('Invalid checkpoint EXP requirement.');
    if (neededEXP === 0)
        return zero();
    inventory = readResourceInventory(inventory);
    const unit = Math.min(...ECHO_TUBES.map(tube => tube.echoExp));
    const target = Math.ceil(neededEXP / unit);
    const bound = target + Math.max(...ECHO_TUBES.map(tube => tube.echoExp)) / unit - 1;
    const reachable = Array(bound + 1);
    reachable[0] = zero();
    for (const tube of ECHO_TUBES) {
        const weight = tube.echoExp / unit, quantity = inventory.tubes[tube.id];
        let remaining = Math.min(Math.floor(bound / weight), quantity.kind === 'UNLIMITED' ? Infinity : quantity.count);
        for (let size = 1; remaining > 0; size *= 2) {
            const count = Math.min(size, remaining);
            remaining -= count;
            for (let total = bound; total >= count * weight; total--) {
                const prior = reachable[total - count * weight];
                if (!reachable[total] && prior)
                    reachable[total] = { ...prior, [tube.id]: prior[tube.id] + count };
            }
        }
    }
    return reachable.slice(target).find(Boolean) ?? null;
}
