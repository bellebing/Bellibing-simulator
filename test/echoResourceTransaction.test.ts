import assert from 'node:assert/strict';
import test from 'node:test';
import { CHECKPOINT_CUMULATIVE_COST } from '../src/echoCoreRules.ts';
import { emptyResourceInventory, updateResourceInventory, readResourceInventory } from '../src/resourceInventory.ts';
import { selectExactOneCheckpointTubes } from '../src/echoCheckpointTubeSelection.ts';
import { selectExactOneCheckpointTubes as browserSelect } from '../docs/assets/echoCheckpointTubeSelection.js';
import { commitRank5Plus5Resources, readRank5Plus5Snapshot } from '../src/echoResourceTransaction.ts';
import { IMPROVE_POLICY_STORAGE_KEY, IMPROVE_POLICY_V2_KEY, loadImprovePolicyStorage, persistImprovePolicyState,
  persistResourceInventory, createImprovePolicyState } from '../src/improvePolicyState.ts';
import { pendingImprovePolicySource } from '../src/improvePolicyPresentation.ts';

const memory = () => {
  const values = new Map<string, string>();
  let writes = 0, fail = false;
  return {
    values, getItem: (key: string) => values.get(key) ?? null,
    setItem(key: string, value: string) { if (fail) throw new Error('quota'); writes++; values.set(key, value); },
    get writes() { return writes; }, failWrites(value: boolean) { fail = value; },
  };
};
const finite = (count: number) => ({ kind: 'FINITE' as const, count });
function stock(tube: 'premium' | 'advanced' | 'medium' | 'basic' = 'basic', count = 9) {
  let input = emptyResourceInventory();
  for (const [id, n] of [['echoes',1],['tuners',10],['shellCredits',2440],[tube,count]] as const)
    input = updateResourceInventory(input, id, finite(n));
  return input;
}
const seed = (storage: ReturnType<typeof memory>, inventory: ReturnType<typeof stock>) =>
  storage.setItem(IMPROVE_POLICY_STORAGE_KEY, JSON.stringify({ version: 3,
    characters: { custom: { marker: 'unrelated original settings bytes' } },
    pendingV2Characters: { legacy: { gate: 10 } }, resourceInventory: inventory }));
const raw = (storage: ReturnType<typeof memory>) => storage.getItem(IMPROVE_POLICY_STORAGE_KEY);

test('verified +0→+5 costs and exact denomination receipt commit in ONE envelope write', () => {
  const storage = memory(); seed(storage, stock());
  const old = raw(storage)!, before = readRank5Plus5Snapshot(storage), writes = storage.writes;
  assert.deepEqual(before.inventory, stock());
  const result = commitRank5Plus5Resources(storage, before, 'attempt-1');
  assert.equal(storage.writes, writes + 1);
  assert.notEqual(raw(storage), old);
  assert.deepEqual(result.receipt.consumed, {
    echoes: 1, tuners: CHECKPOINT_CUMULATIVE_COST[5].tuners,
    shellCredits: CHECKPOINT_CUMULATIVE_COST[5].shellCredits,
    tubes: { premium: 0, advanced: 0, medium: 0, basic: 9 } });
  assert.equal(result.receipt.tubeLedger.suppliedEXP, 4500);
  assert.equal(result.receipt.tubeLedger.expAfter, 4500);
  assert.equal(result.receipt.progress.tunedThrough, 5);
  assert.deepEqual(result.receipt.before, before.inventory);
  assert.deepEqual(result.receipt.after, loadImprovePolicyStorage(storage).resourceInventory);
  const saved = JSON.parse(raw(storage)!);
  assert.deepEqual(saved.characters, JSON.parse(old).characters);
  assert.deepEqual(saved.pendingV2Characters, JSON.parse(old).pendingV2Characters);
  assert.deepEqual(saved.resourceTransactions, { revision: 1, consumedIds: ['attempt-1'] });
  for (const id of ['echoes', 'tuners', 'shellCredits'] as const)
    assert.deepEqual(result.receipt.after[id], finite(0));
  assert.deepEqual(result.receipt.after.tubes.basic, finite(0));
  assert.deepEqual(before.inventory, stock());
});

test('finite zero and short Echo/Tuner/Credit/Tube budgets all block without a write', () => {
  for (const [id, count] of [['echoes',0], ['tuners',9], ['shellCredits',2439], ['basic',8]] as const) {
    const storage = memory(), inventory = updateResourceInventory(stock(), id, finite(count));
    seed(storage, inventory);
    const snapshot = readRank5Plus5Snapshot(storage), old = raw(storage), writes = storage.writes;
    assert.throws(() => commitRank5Plus5Resources(storage, snapshot, 'short-'+id), /Insufficient/);
    assert.equal(raw(storage), old); assert.equal(storage.writes, writes);
  }
  const storage = memory(), snapshot = readRank5Plus5Snapshot(storage);
  assert.throws(() => commitRank5Plus5Resources(storage, snapshot, 'empty'), /Insufficient Echoes/);
  assert.equal(raw(storage), null);
});

test('unlimited resources remain unlimited while consumed counts stay actual', () => {
  const storage = memory();
  let inventory = emptyResourceInventory();
  for (const id of ['echoes','tuners','shellCredits','premium','advanced','medium','basic'] as const)
    inventory = updateResourceInventory(inventory, id, { kind: 'UNLIMITED' });
  seed(storage, inventory);
  const receipt = commitRank5Plus5Resources(storage, readRank5Plus5Snapshot(storage), 'unlimited').receipt;
  assert.deepEqual(receipt.after, inventory);
  assert.deepEqual(receipt.consumed, { echoes:1, tuners:10, shellCredits:2440,
    tubes: { premium: 0, advanced: 2, medium: 0, basic: 1 } });
  assert.equal(receipt.tubeLedger.suppliedEXP, 4500);
});

test('stale snapshots, retry, duplicate IDs and an earlier ID after subsequent commits reject', () => {
  const storage = memory();
  let supply = stock('premium', 4);
  supply = updateResourceInventory(supply, 'echoes', finite(3));
  supply = updateResourceInventory(supply, 'tuners', finite(30));
  supply = updateResourceInventory(supply, 'shellCredits', finite(7320));
  seed(storage, supply);
  const before = readRank5Plus5Snapshot(storage);
  commitRank5Plus5Resources(storage, before, 'same-id');
  const saved = raw(storage);
  const writes = storage.writes;
  assert.throws(() => commitRank5Plus5Resources(storage, before, 'same-id'), /Stale/);
  assert.throws(() => commitRank5Plus5Resources(storage, readRank5Plus5Snapshot(storage), 'same-id'), /Repeated/);
  commitRank5Plus5Resources(storage, readRank5Plus5Snapshot(storage), 'second-id');
  assert.throws(() => commitRank5Plus5Resources(storage, readRank5Plus5Snapshot(storage), 'same-id'), /Repeated/);
  assert.equal(storage.writes, writes + 1);
  assert.notEqual(raw(storage), saved);
});

test('quota failure preserves all bytes and ID; successful retry and reload recover', () => {
  const storage = memory(); seed(storage, stock());
  const snapshot = readRank5Plus5Snapshot(storage);
  const old = raw(storage), writes = storage.writes;
  storage.failWrites(true);
  assert.throws(() => commitRank5Plus5Resources(storage, snapshot, 'retryable'), /quota/);
  assert.equal(raw(storage), old); assert.equal(storage.writes, writes);
  storage.failWrites(false);
  commitRank5Plus5Resources(storage, snapshot, 'retryable');
  const loaded = loadImprovePolicyStorage(storage);
  assert.deepEqual(loaded.resourceInventory, readRank5Plus5Snapshot(storage).inventory);
  assert.deepEqual(loaded.resourceTransactions?.consumedIds, ['retryable']);
  assert.throws(() => commitRank5Plus5Resources(storage, readRank5Plus5Snapshot(storage), 'retryable'), /Repeated/);
});

test('strict legacy recovery, corrupt transaction history and untouched legacy v2 bytes', () => {
  const storage = memory();
  const legacy = JSON.stringify({ version: 2, characters: { augusta: { gate: 5 } } });
  storage.setItem(IMPROVE_POLICY_V2_KEY, legacy);
  const old = readRank5Plus5Snapshot(storage);
  assert.equal(old.inventory.shellCredits.kind, 'FINITE');
  assert.throws(() => commitRank5Plus5Resources(storage, old, 'legacy'), /Insufficient Echoes/);
  assert.equal(storage.getItem(IMPROVE_POLICY_V2_KEY), legacy);
  assert.equal(raw(storage), null);
  const invalid = JSON.stringify({ version: 3, characters: {}, pendingV2Characters: {},
    resourceInventory: stock(), resourceTransactions: { revision: 1, consumedIds: ['dup','dup'] } });
  storage.setItem(IMPROVE_POLICY_STORAGE_KEY, invalid);
  assert.throws(() => readRank5Plus5Snapshot(storage), /transaction history/);
  assert.equal(raw(storage), invalid);
  assert.equal(storage.getItem(IMPROVE_POLICY_V2_KEY), legacy);
});

test('settings save preserves committed resource receipt; stale user resource saves cannot undo it', () => {
  const storage = memory(); seed(storage, stock('premium', 3));
  const staleStore = loadImprovePolicyStorage(storage);
  const snapshot = readRank5Plus5Snapshot(storage);
  commitRank5Plus5Resources(storage, snapshot, 'preserved');
  const persisted = loadImprovePolicyStorage(storage).resourceInventory;
  assert.throws(() => persistResourceInventory(staleStore, stock('premium', 5), storage), /Stale/);
  const state = createImprovePolicyState('augusta', pendingImprovePolicySource('augusta'));
  const updated = persistImprovePolicyState(staleStore, state, storage);
  assert.deepEqual(updated.resourceInventory, persisted);
  assert.deepEqual(loadImprovePolicyStorage(storage).resourceTransactions?.consumedIds, ['preserved']);
  assert.deepEqual(loadImprovePolicyStorage(storage).resourceInventory, persisted);
});

test('selection uses original canonical fixed Tube mix with browser parity', () => {
  for (const budget of [stock(), stock('premium',1), stock('advanced',3), stock('medium',5), stock('basic',8)]) {
    assert.deepEqual(selectExactOneCheckpointTubes(budget), browserSelect(budget));
  }
  assert.deepEqual(selectExactOneCheckpointTubes(stock()), { premium:0, advanced:0, medium:0, basic:9 });
});
