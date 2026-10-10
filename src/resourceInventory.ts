import { ECHO_TUBE_SOURCE } from './data/echoTubeSource.ts';
export { ECHO_TUBE_PROVENANCE } from './data/echoTubeSource.ts';

export const ECHO_TUBES = Object.freeze(ECHO_TUBE_SOURCE.map(row => Object.freeze({ ...row })));
export type TubeId = typeof ECHO_TUBE_SOURCE[number]['id'];
export type InventoryQuantity = { readonly kind: 'FINITE'; readonly count: number } | { readonly kind: 'UNLIMITED' };
export interface ResourceInventory {
  readonly version: 2;
  readonly echoes: InventoryQuantity;
  readonly tuners: InventoryQuantity;
  readonly shellCredits: InventoryQuantity;
  readonly tubes: Readonly<Record<TubeId, InventoryQuantity>>;
}
export function inventoryQuantity(value: unknown): InventoryQuantity {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new RangeError('Enter a whole non-negative count or ∞.');
  const row = value as Record<string, unknown>;
  if (row.kind === 'UNLIMITED' && Object.keys(row).length === 1) return { kind: 'UNLIMITED' };
  if (row.kind === 'FINITE' && Object.keys(row).length === 2 && typeof row.count === 'number' && Number.isSafeInteger(row.count) && row.count >= 0) return { kind: 'FINITE', count: row.count };
  throw new RangeError('Enter a whole non-negative count or ∞.');
}
export function parseInventoryQuantity(text: string): InventoryQuantity {
  const input = text.trim();
  if (input === '∞' || input.toLowerCase() === 'unlimited') return { kind: 'UNLIMITED' };
  if (!/^\d+$/.test(input)) throw new RangeError('Enter a whole non-negative count or ∞.');
  return inventoryQuantity({ kind: 'FINITE', count: Number(input) });
}
export function formatInventoryQuantity(value: InventoryQuantity): string {
  const quantity = inventoryQuantity(value);
  return quantity.kind === 'UNLIMITED' ? '∞' : String(quantity.count);
}
/** Missing old inventory initializes an explicit zero budget, never inferred account holdings. */
export function emptyResourceInventory(): ResourceInventory {
  const zero = () => ({ kind: 'FINITE', count: 0 } as const);
  return { version: 2, echoes: zero(), tuners: zero(), shellCredits: zero(), tubes: { premium: zero(), advanced: zero(), medium: zero(), basic: zero() } };
}
export function readResourceInventory(value: unknown): ResourceInventory {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RangeError('Saved Resources need review.');
  const row = value as Record<string, unknown>;
  // Strict old-v1 migration; do not repair corrupt v2 data or change recovery bytes.
  const legacy = row.version === 1;
  const keys = legacy ? 'echoes,tubes,tuners,version' : 'echoes,shellCredits,tubes,tuners,version';
  if (!(legacy || row.version === 2) || Object.keys(row).sort().join() !== keys
    || !row.tubes || typeof row.tubes !== 'object' || Array.isArray(row.tubes)) throw new RangeError('Saved Resources need review.');
  const tubes = row.tubes as Record<string, unknown>;
  if (Object.keys(tubes).sort().join() !== 'advanced,basic,medium,premium') throw new RangeError('Saved Tubes need review.');
  return { version: 2, echoes: inventoryQuantity(row.echoes), tuners: inventoryQuantity(row.tuners),
    shellCredits: legacy ? { kind: 'FINITE', count: 0 } : inventoryQuantity(row.shellCredits),
    tubes: { premium: inventoryQuantity(tubes.premium), advanced: inventoryQuantity(tubes.advanced), medium: inventoryQuantity(tubes.medium), basic: inventoryQuantity(tubes.basic) } };
}
export function updateResourceInventory(current: ResourceInventory, resource: 'echoes' | 'tuners' | 'shellCredits' | TubeId, quantity: InventoryQuantity): ResourceInventory {
  const next = readResourceInventory(current), value = inventoryQuantity(quantity);
  if (resource === 'echoes' || resource === 'tuners' || resource === 'shellCredits') return { ...next, [resource]: value };
  if (!ECHO_TUBES.some(row => row.id === resource)) throw new RangeError('Unknown resource.');
  return { ...next, tubes: { ...next.tubes, [resource]: value } };
}
/** Denomination facts do not establish a spending algorithm. No fabricated cost/result. */
export const EXACT_TUBE_DEPLETION = Object.freeze({ status: 'PENDING', reason: 'Exact Tube selection, overfill and recovery denominations require reviewed semantics.' } as const);
