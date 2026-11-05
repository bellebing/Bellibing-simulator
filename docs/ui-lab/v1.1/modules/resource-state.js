import { emptyResourceInventory, readResourceInventory, parseInventoryQuantity, updateResourceInventory } from '../../../assets/resourceInventory.js';

// One instance belongs to the page, outside all Character/reset/simulation state.
// Account callers supply their durable save; Sandbox remains memory-only.
export function createLabResourceInventory(initial=emptyResourceInventory(),{onSave}={}) {
  let inventory = readResourceInventory(initial);
  let revision = 0;
  let saves=Promise.resolve();
  const finiteCounts = new Map();
  const quantity = resource => inventory[resource] ?? inventory.tubes[resource];
  return {
    toggleUnlimited(resource) {
      const current = quantity(resource);
      if (!current) throw new RangeError('Unknown resource.');
      return this.set(resource, current.kind === 'UNLIMITED' ? String(finiteCounts.get(resource) ?? 0) : '∞');
    },
    revision() { return revision; },
    read() { return readResourceInventory(inventory); },
    set(resource, text) {
      const parsed=parseInventoryQuantity(text);
      // Validate immediately, then compose queued edits against the last commit.
      updateResourceInventory(inventory,resource,parsed);
      const change=()=>{
       const next=updateResourceInventory(inventory,resource,parsed),previous=quantity(resource);
       const apply=()=>{
        if (previous.kind === 'FINITE') finiteCounts.set(resource, previous.count);
        if(JSON.stringify(inventory)!==JSON.stringify(next))revision++;
        inventory = next;
        if (quantity(resource).kind === 'FINITE') finiteCounts.set(resource, quantity(resource).count);
        return readResourceInventory(inventory);
       };
       return onSave?Promise.resolve(onSave(next)).then(apply):apply();
      };
      if(!onSave)return change();
      const result=saves.catch(()=>{}).then(change);saves=result;return result;
    },
  };
}
