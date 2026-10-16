import { emptyResourceInventory, readResourceInventory, parseInventoryQuantity, updateResourceInventory } from '../../../assets/resourceInventory.js';

// One instance belongs to the page, outside all Character/reset/simulation state.
// No persistence or consumption API is connected to this inventory.
export function createLabResourceInventory() {
  let inventory = emptyResourceInventory();
  const finiteCounts = new Map();
  const quantity = resource => inventory[resource] ?? inventory.tubes[resource];
  return {
    toggleUnlimited(resource) {
      const current = quantity(resource);
      if (!current) throw new RangeError('Unknown resource.');
      return this.set(resource, current.kind === 'UNLIMITED' ? String(finiteCounts.get(resource) ?? 0) : '∞');
    },
    read() { return readResourceInventory(inventory); },
    set(resource, text) {
      const next = updateResourceInventory(inventory, resource, parseInventoryQuantity(text));
      const previous = quantity(resource);
      if (previous.kind === 'FINITE') finiteCounts.set(resource, previous.count);
      inventory = next;
      if (quantity(resource).kind === 'FINITE') finiteCounts.set(resource, quantity(resource).count);
      return readResourceInventory(inventory);
    },
  };
}
