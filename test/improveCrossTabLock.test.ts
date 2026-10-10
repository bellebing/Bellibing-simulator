import assert from 'node:assert/strict';
import test from 'node:test';
import { withExclusiveImprovePolicyStorage, persistResourceInventory, loadImprovePolicyStorage,
  IMPROVE_POLICY_STORAGE_KEY } from '../src/improvePolicyState.ts';
import { emptyResourceInventory, updateResourceInventory } from '../src/resourceInventory.ts';
import { readRank5Plus5Snapshot, commitRank5Plus5Resources } from '../src/echoResourceTransaction.ts';

const finite = (count: number) => ({ kind: 'FINITE' as const, count });
function memory() {
  const data = new Map<string, string>();
  return { data, getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); } };
}
function funded() {
  let inventory = emptyResourceInventory();
  for (const [id, count] of [['echoes', 1], ['tuners', 10], ['shellCredits', 2440], ['basic', 9]] as const)
    inventory = updateResourceInventory(inventory, id, finite(count));
  return inventory;
}
test('Web Locks unavailable or failing: no fallback write; recovery retains receipt', async () => {
  const storage = memory();
  storage.setItem(IMPROVE_POLICY_STORAGE_KEY, JSON.stringify({ version: 3, characters: {},
    pendingV2Characters: {}, resourceInventory: funded() }));
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  try {
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
    const before = storage.getItem(IMPROVE_POLICY_STORAGE_KEY), snapshot = readRank5Plus5Snapshot(storage);
    await assert.rejects(withExclusiveImprovePolicyStorage(() =>
      commitRank5Plus5Resources(storage, snapshot, 'blocked')), /coordination unavailable/);
    assert.equal(storage.getItem(IMPROVE_POLICY_STORAGE_KEY), before);
    Object.defineProperty(globalThis, 'navigator', { configurable: true,
      value: { locks: { request: () => Promise.reject(new Error('lock failure')) } } });
    await assert.rejects(withExclusiveImprovePolicyStorage(() =>
      commitRank5Plus5Resources(storage, snapshot, 'blocked')), /lock failure/);
    assert.equal(storage.getItem(IMPROVE_POLICY_STORAGE_KEY), before);
    let held = false;
    Object.defineProperty(globalThis, 'navigator', { configurable: true,
      value: { locks: { request: async (_name: string, opts: {mode: string}, callback: (lock: object) => unknown) => {
        assert.equal(opts.mode, 'exclusive'); assert.equal(held, false); held = true;
        try { return callback({}); } finally { held = false; }
      } } } });
    const receipt = await withExclusiveImprovePolicyStorage(() => commitRank5Plus5Resources(storage, snapshot, 'blocked'));
    assert.deepEqual(receipt.store.resourceTransactions?.consumedIds, ['blocked']);
    assert.equal(loadImprovePolicyStorage(storage).resourceInventory?.echoes.kind, 'FINITE');
    assert.equal((loadImprovePolicyStorage(storage).resourceInventory?.echoes as {count: number}).count, 0);
  } finally {
    if (original) Object.defineProperty(globalThis, 'navigator', original);
    else delete (globalThis as { navigator?: unknown }).navigator;
  }
});
test('stale resource snapshots cannot replace committed receipts', () => {
  const storage = memory();
  storage.setItem(IMPROVE_POLICY_STORAGE_KEY, JSON.stringify({ version: 3, characters: {},
    pendingV2Characters: {}, resourceInventory: funded() }));
  const staleStore = loadImprovePolicyStorage(storage);
  const snap = readRank5Plus5Snapshot(storage);
  commitRank5Plus5Resources(storage, snap, 'once');
  assert.throws(() => persistResourceInventory(staleStore, funded(), storage), /Stale/);
  assert.deepEqual(loadImprovePolicyStorage(storage).resourceTransactions?.consumedIds, ['once']);
});
