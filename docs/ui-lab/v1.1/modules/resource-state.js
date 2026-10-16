import { emptyResourceInventory, readResourceInventory, parseInventoryQuantity, updateResourceInventory } from '../../../assets/resourceInventory.js';

// One instance belongs to the page, outside all Character/reset/simulation state.
// No persistence or consumption API is connected to this inventory.
export function createLabResourceInventory() {
  let inventory = emptyResourceInventory();
  return {
    read() { return readResourceInventory(inventory); },
    set(resource, text) {
      const next = updateResourceInventory(inventory, resource, parseInventoryQuantity(text));
      inventory = next;
      return readResourceInventory(inventory);
    },
  };
}
