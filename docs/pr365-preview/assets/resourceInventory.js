import { ECHO_TUBE_SOURCE } from "./data/echoTubeSource.js";
export { ECHO_TUBE_PROVENANCE } from "./data/echoTubeSource.js";
export const ECHO_TUBES = Object.freeze(ECHO_TUBE_SOURCE.map(row => Object.freeze({ ...row })));
export function inventoryQuantity(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        throw new RangeError('Enter a whole non-negative count or ∞.');
    const row = value;
    if (row.kind === 'UNLIMITED' && Object.keys(row).length === 1)
        return { kind: 'UNLIMITED' };
    if (row.kind === 'FINITE' && Object.keys(row).length === 2 && typeof row.count === 'number' && Number.isSafeInteger(row.count) && row.count >= 0)
        return { kind: 'FINITE', count: row.count };
    throw new RangeError('Enter a whole non-negative count or ∞.');
}
export function parseInventoryQuantity(text) {
    const input = text.trim();
    if (input === '∞' || input.toLowerCase() === 'unlimited')
        return { kind: 'UNLIMITED' };
    if (!/^\d+$/.test(input))
        throw new RangeError('Enter a whole non-negative count or ∞.');
    return inventoryQuantity({ kind: 'FINITE', count: Number(input) });
}
export function formatInventoryQuantity(value) {
    const quantity = inventoryQuantity(value);
    return quantity.kind === 'UNLIMITED' ? '∞' : String(quantity.count);
}
/** Missing old inventory initializes an explicit zero budget, never inferred account holdings. */
export function emptyResourceInventory() {
    const zero = () => ({ kind: 'FINITE', count: 0 });
    return { version: 1, echoes: zero(), tuners: zero(), tubes: { premium: zero(), advanced: zero(), medium: zero(), basic: zero() } };
}
export function readResourceInventory(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new RangeError('Saved Resources need review.');
    const row = value;
    if (row.version !== 1 || Object.keys(row).sort().join() !== 'echoes,tubes,tuners,version' || !row.tubes || typeof row.tubes !== 'object' || Array.isArray(row.tubes))
        throw new RangeError('Saved Resources need review.');
    const tubes = row.tubes;
    if (Object.keys(tubes).sort().join() !== 'advanced,basic,medium,premium')
        throw new RangeError('Saved Tubes need review.');
    return { version: 1, echoes: inventoryQuantity(row.echoes), tuners: inventoryQuantity(row.tuners),
        tubes: { premium: inventoryQuantity(tubes.premium), advanced: inventoryQuantity(tubes.advanced), medium: inventoryQuantity(tubes.medium), basic: inventoryQuantity(tubes.basic) } };
}
export function updateResourceInventory(current, resource, quantity) {
    const next = readResourceInventory(current), value = inventoryQuantity(quantity);
    if (resource === 'echoes' || resource === 'tuners')
        return { ...next, [resource]: value };
    if (!ECHO_TUBES.some(row => row.id === resource))
        throw new RangeError('Unknown resource.');
    return { ...next, tubes: { ...next.tubes, [resource]: value } };
}
/** Denomination facts do not establish a spending algorithm. No fabricated cost/result. */
export const EXACT_TUBE_DEPLETION = Object.freeze({ status: 'PENDING', reason: 'Exact Tube selection, overfill and recovery denominations require reviewed semantics.' });
