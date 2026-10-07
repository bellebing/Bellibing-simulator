import test from 'node:test';
import assert from 'node:assert/strict';
import { ECHO_TUBES, ECHO_TUBE_PROVENANCE, emptyResourceInventory, inventoryQuantity, parseInventoryQuantity, formatInventoryQuantity, readResourceInventory, updateResourceInventory, EXACT_TUBE_DEPLETION } from '../src/resourceInventory.ts';
import { loadImprovePolicyStorage, persistResourceInventory, persistImprovePolicyState, createImprovePolicyState, IMPROVE_POLICY_STORAGE_KEY, IMPROVE_POLICY_V2_KEY } from '../src/improvePolicyState.ts';
import { pendingImprovePolicySource } from '../src/improvePolicyPresentation.ts';
const memory = () => {
  const values = new Map<string, string>();
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
};
test('exact four canonical Tube identities and bounded provenance', () => {
  assert.deepEqual(ECHO_TUBES.map(t => [t.id, t.name, t.rarity, t.color, t.echoExp]), [
    ['premium', 'Premium Sealed Tube', 5, 'Gold', 5000], ['advanced', 'Advanced Sealed Tube', 4, 'Purple', 2000],
    ['medium', 'Medium Sealed Tube', 3, 'Blue', 1000], ['basic', 'Basic Sealed Tube', 2, 'Green', 500],
  ]);
  assert.equal(ECHO_TUBE_PROVENANCE.status, 'VERIFIED_EXTERNAL');
  assert.ok(ECHO_TUBE_PROVENANCE.sources.every(s => s.locator.startsWith('https://') && s.checkedAt === '2026-10-07'));
  assert.equal(EXACT_TUBE_DEPLETION.status, 'PENDING');
  assert.deepEqual(Object.keys(EXACT_TUBE_DEPLETION).sort(), ['reason', 'status']);
});
test('finite quantities are safe whole counts; zero differs from explicit unlimited', () => {
  for (const count of [0, 1, 99999, Number.MAX_SAFE_INTEGER]) assert.deepEqual(inventoryQuantity({ kind: 'FINITE', count }), { kind: 'FINITE', count });
  for (const count of [-1, .5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1']) assert.throws(() => inventoryQuantity({ kind: 'FINITE', count }));
  for (const text of ['', '-1', '1.5', '1e3', 'Infinity', '9007199254740992']) assert.throws(() => parseInventoryQuantity(text));
  assert.deepEqual(parseInventoryQuantity('0'), { kind: 'FINITE', count: 0 });
  assert.deepEqual(parseInventoryQuantity('∞'), { kind: 'UNLIMITED' });
  assert.equal(formatInventoryQuantity(parseInventoryQuantity('unlimited')), '∞');
});
test('six independent quantities support unlimited; no EXP or Credits inventory', () => {
  const initial = emptyResourceInventory();
  for (const id of ['echoes', 'tuners', ...ECHO_TUBES.map(t => t.id)] as const) {
    const changed = updateResourceInventory(initial, id, { kind: 'UNLIMITED' });
    const value = id === 'echoes' || id === 'tuners' ? changed[id] : changed.tubes[id];
    assert.deepEqual(value, { kind: 'UNLIMITED' });
    assert.equal(JSON.stringify(initial).includes('UNLIMITED'), false);
  }
  const mixed = ECHO_TUBES.reduce((state, tube, index) => updateResourceInventory(state, tube.id, { kind: 'FINITE', count: index + 1 }), initial);
  assert.deepEqual(Object.values(mixed.tubes).map(v => v.kind === 'FINITE' ? v.count : null), [1, 2, 3, 4]);
  assert.deepEqual(Object.keys(mixed), ['version', 'echoes', 'tuners', 'tubes']);
  assert.throws(() => readResourceInventory({ ...mixed, exp: 5000 }));
  assert.throws(() => readResourceInventory({ ...mixed, tubes: { ...mixed.tubes, fifth: { kind: 'FINITE', count: 1 } } }));
});
test('shared inventory survives Character saves/reloads without changing policy or legacy recovery', () => {
  const storage = memory();
  storage.setItem(IMPROVE_POLICY_V2_KEY, JSON.stringify({ version: 2, characters: { augusta: { gate: 10 } } }));
  const legacyBytes = storage.getItem(IMPROVE_POLICY_V2_KEY);
  const loaded = loadImprovePolicyStorage(storage);
  const inventory = updateResourceInventory(emptyResourceInventory(), 'premium', { kind: 'UNLIMITED' });
  let store = persistResourceInventory(loaded, inventory, storage);
  assert.deepEqual(store.characters, loaded.characters);
  assert.deepEqual(store.pendingV2Characters, loaded.pendingV2Characters);
  for (const id of ['augusta', 'chixia', 'augusta']) {
    store = persistImprovePolicyState(store, createImprovePolicyState(id, pendingImprovePolicySource(id)), storage);
    assert.deepEqual(loadImprovePolicyStorage(storage).resourceInventory, inventory);
  }
  assert.equal(storage.getItem(IMPROVE_POLICY_V2_KEY), legacyBytes);
  assert.ok(!JSON.stringify(store.characters).includes('resourceInventory'));
});
test('corrupt inventory and unavailable storage retain recovery bytes and committed state', () => {
  const storage = memory(), store = loadImprovePolicyStorage(storage);
  assert.equal(store.resourceInventory, undefined);
  const broken = JSON.stringify({ version: 3, characters: {}, resourceInventory: { version: 999 } });
  storage.setItem(IMPROVE_POLICY_STORAGE_KEY, broken);
  assert.throws(() => loadImprovePolicyStorage(storage));
  assert.equal(storage.getItem(IMPROVE_POLICY_STORAGE_KEY), broken);
  assert.throws(() => persistResourceInventory(store, emptyResourceInventory(), { ...storage, setItem() { throw new Error('quota'); } }));
  assert.equal(store.resourceInventory, undefined);
});
