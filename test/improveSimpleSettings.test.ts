import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { getDefaultBuildPreset } from '../src/profileRegistry.ts';
import { projectImproveSettingsSources } from '../src/improveSettingsProjection.ts';
import { normalizeSimpleSettings, updateSimpleSettings, loadSimpleSettingsStorage, savedCharacterSettings, persistSimpleSettings, SETTINGS_KEY, LEGACY_SETTINGS_KEY } from '../src/improveSimpleSettings.mjs';

const sources = projectImproveSettingsSources();
const source = sources.find(row => row.characterId === 'augusta')!;
test('Improve pools exactly reuse verified default Character StatTargetProfiles and provenance', () => {
  assert.equal(sources.length, 59);
  for (const row of sources) {
    const resolved = getDefaultBuildPreset(PROFILE_REGISTRY, row.characterId);
    if (row.status === 'READY') {
      assert.equal(resolved?.preset.verificationStatus, 'VERIFIED');
      assert.equal(resolved?.statTarget.verificationStatus, 'VERIFIED');
      assert.equal(row.profileId, resolved!.statTarget.id);
      assert.deepEqual(row.stats, resolved!.statTarget.targetRules.map(rule => ({ name: rule.stat, note: rule.notes ?? null })));
      assert.deepEqual(row.provenance, resolved!.statTarget.provenance);
    } else {
      assert.deepEqual(row.stats, []);
      assert.equal(row.profileId, null);
    }
  }
  assert.ok(sources.some(row => row.status === 'PENDING'));
  assert.ok(sources.some(row => row.status === 'READY' && row.stats.some(stat => stat.name === 'HP%')));
});
test('checked-in Improve source/state exports match canonical code', () => {
  const exported = JSON.parse(readFileSync('docs/ui-prototypes/assets/improve-settings/sources.json', 'utf8'));
  assert.deepEqual(exported.characters, sources);
  assert.equal(exported.rollQualityMappingStatus, 'PENDING');
  assert.equal(readFileSync('docs/ui-prototypes/assets/improve-settings/state.mjs', 'utf8').replace(/\r\n/g, '\n'), readFileSync('src/improveSimpleSettings.mjs', 'utf8').replace(/\r\n/g, '\n'));
});
const initial = () => normalizeSimpleSettings(null, source);
const action = (state, type, value?, to?) => updateSimpleSettings(state, { type, value, to }, source);
const memory = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};
test('v2 defaults are 0-of-M Recommended with pending ranking and no required-count runtime field', () => {
  const state = initial();
  assert.equal(state.schemaVersion, 2); assert.equal(state.characterId, source.characterId);
  assert.deepEqual(state.valuableStats.activeStats, []);
  assert.deepEqual(state.valuableStats.availableStats, source.stats.map(stat => stat.name));
  assert.equal(state.valuableStats.orderingMode, 'RECOMMENDED');
  assert.equal(state.valuableStats.recommendedOrderStatus, 'PENDING');
  assert.ok(!JSON.stringify(state).includes('requiredCount'));
  for (const row of sources) {
    assert.equal(row.recommendedOrderStatus, 'PENDING'); assert.deepEqual(row.recommendedActiveStats, []);
  }
  for (const value of [5, 10, 15, 20, 25]) assert.equal(action(state, 'gate', value).gate, value);
  for (const value of ['All Rolls', 'Mid+', 'High+']) {
    const next = action(state, 'quality', value); assert.equal(next.rollQuality, value);
    assert.equal(next.rollQualityMappingStatus, 'PENDING'); assert.equal('thresholds' in next, false);
  }
});
test('activate appends, deactivate derives Available, every customization is Manual', () => {
  const pool = source.stats.map(stat => stat.name);
  let state = action(initial(), 'stat', pool[2]); state = action(state, 'stat', pool[0]);
  assert.deepEqual(state.valuableStats.activeStats, [pool[2], pool[0]]);
  assert.deepEqual(state.valuableStats.availableStats, pool.filter(name => ![pool[2], pool[0]].includes(name)));
  assert.equal(state.valuableStats.orderingMode, 'MANUAL');
  state = action(state, 'stat', pool[2]); state = action(state, 'stat', pool[2]);
  assert.deepEqual(state.valuableStats.activeStats, [pool[0], pool[2]]);
  assert.deepEqual(action(state, 'stat', 'invented'), state);
  assert.deepEqual(initial().valuableStats.activeStats, []);
});
test('drag/keyboard reorder action changes only explicit Active order, reset preserves Gate/Quality', () => {
  const pool = source.stats.map(stat => stat.name), original = structuredClone(source);
  let state = action(action(initial(), 'stat', pool[0]), 'stat', pool[1]);
  state = action(state, 'reorder', pool[1], 0);
  assert.deepEqual(state.valuableStats.activeStats, [pool[1], pool[0]]);
  assert.deepEqual(action(state, 'reorder', pool[1], -1), state);
  assert.deepEqual(action(state, 'reorder', 'invented', 0), state);
  state = action(action(state, 'gate', 25), 'quality', 'High+');
  const reset = action(state, 'reset');
  assert.equal(reset.gate, 25); assert.equal(reset.rollQuality, 'High+');
  assert.deepEqual(reset.valuableStats.activeStats, []); assert.equal(reset.valuableStats.orderingMode, 'RECOMMENDED');
  assert.deepEqual(source, original);
});
test('safe v1 migration preserves Gate/Quality but does not infer Active from old pool or count', () => {
  for (const requiredCount of [null, 1, 2, 5, 99]) {
    const legacy = { gate: 20, rollQuality: 'Mid+', valuableStats: {
      sourceBinding: JSON.stringify([source.presetId, source.profileId, source.stats.map(stat => stat.name)]),
      selectedStats: [source.stats[0].name], requiredCount,
    } };
    const next = normalizeSimpleSettings(legacy, source);
    assert.equal(next.gate, 20); assert.equal(next.rollQuality, 'Mid+');
    assert.deepEqual(next.valuableStats.activeStats, []); assert.equal(next.valuableStats.orderingMode, 'RECOMMENDED');
    assert.ok(!JSON.stringify(next).includes('requiredCount'));
  }
});
test('binding/profile/Character/provenance/note/pool drift fails closed while preserving other settings', () => {
  const saved = action(action(action(initial(), 'stat', source.stats[0].name), 'gate', 15), 'quality', 'High+');
  for (const changed of [null, { ...source, status: 'PENDING' }, { ...source, profileId: 'changed' },
    { ...source, presetId: 'changed' }, { ...source, provenance: { ...source.provenance, checkedAt: 'changed' } },
    { ...source, stats: source.stats.slice(1) }, { ...source, stats: source.stats.map(stat => ({ ...stat, note: 'changed' })) },
    sources.find(row => row.status === 'READY' && row.characterId !== source.characterId)]) {
    const state = normalizeSimpleSettings(saved, changed);
    assert.deepEqual(state.valuableStats.activeStats, []); assert.equal(state.gate, 15); assert.equal(state.rollQuality, 'High+');
  }
});
test('v2 strips invalid/duplicate names while preserving manual order and validates malformed labels', () => {
  const saved = initial(); saved.gate = 17; saved.rollQuality = '99%';
  saved.valuableStats.orderingMode = 'MANUAL';
  saved.valuableStats.activeStats = [source.stats[1].name, 'unknown', source.stats[0].name, source.stats[1].name];
  const state = normalizeSimpleSettings(saved, source);
  assert.deepEqual(state.valuableStats.activeStats, [source.stats[1].name, source.stats[0].name]);
  assert.equal(state.gate, 5); assert.equal(state.rollQuality, 'All Rolls');
});
test('v2 storage reload and Character switching preserve independent selections/order', () => {
  const storage = memory(), store = loadSimpleSettingsStorage(storage);
  const first = action(initial(), 'stat', source.stats[0].name);
  const other = sources.find(row => row.status === 'READY' && row.characterId !== source.characterId)!;
  const second = updateSimpleSettings(normalizeSimpleSettings(null, other), { type: 'stat', value: other.stats[1].name }, other);
  persistSimpleSettings(store, first, storage); persistSimpleSettings(store, second, storage);
  const reloaded = loadSimpleSettingsStorage(storage);
  assert.deepEqual(normalizeSimpleSettings(savedCharacterSettings(reloaded, source.characterId), source), first);
  assert.deepEqual(normalizeSimpleSettings(savedCharacterSettings(reloaded, other.characterId), other), second);
});
test('temporary v2 outage masks Active but retains saved binding/order through Gate and Quality edits', () => {
  const storage = memory(), store = loadSimpleSettingsStorage(storage);
  const saved = action(action(initial(), 'stat', source.stats[2].name), 'stat', source.stats[0].name);
  persistSimpleSettings(store, saved, storage);
  let pending = normalizeSimpleSettings(savedCharacterSettings(store, source.characterId), null, source.characterId);
  pending = updateSimpleSettings(pending, { type: 'gate', value: 10 }, null);
  pending = updateSimpleSettings(pending, { type: 'quality', value: 'Mid+' }, null);
  assert.deepEqual(pending.valuableStats.activeStats, []); assert.equal(pending.valuableStats.status, 'PENDING');
  persistSimpleSettings(store, pending, storage);
  const recovered = normalizeSimpleSettings(savedCharacterSettings(loadSimpleSettingsStorage(storage), source.characterId), source);
  assert.deepEqual(recovered.valuableStats, saved.valuableStats); assert.equal(recovered.gate, 10); assert.equal(recovered.rollQuality, 'Mid+');
});
test('v1 migration defers per Character during source failure, preserves edits, leaves legacy key untouched', () => {
  const storage = memory(), legacy = { version: 1, characters: { augusta: { gate: 20, rollQuality: 'High+', valuableStats: { requiredCount: 2, selectedStats: ['CRIT Rate'] } }, aalto: { gate: 15, rollQuality: 'Mid+' } } };
  storage.setItem(LEGACY_SETTINGS_KEY, JSON.stringify(legacy));
  let store = loadSimpleSettingsStorage(storage);
  let state = normalizeSimpleSettings(savedCharacterSettings(store, 'augusta'), null, 'augusta');
  state = updateSimpleSettings(state, { type: 'gate', value: 25 }, null); persistSimpleSettings(store, state, storage);
  store = loadSimpleSettingsStorage(storage);
  assert.equal(store.pendingV1Characters.augusta.gate, 25);
  state = normalizeSimpleSettings(savedCharacterSettings(store, 'augusta'), source); persistSimpleSettings(store, state, storage);
  assert.equal(store.characters.augusta.rollQuality, 'High+'); assert.deepEqual(state.valuableStats.activeStats, []);
  assert.equal(store.pendingV1Characters.augusta, undefined); assert.equal(store.pendingV1Characters.aalto.gate, 15);
  assert.equal(storage.getItem(LEGACY_SETTINGS_KEY), JSON.stringify(legacy));
  assert.equal(JSON.parse(storage.getItem(SETTINGS_KEY)).version, 2);
});
