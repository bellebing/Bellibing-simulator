import test from 'node:test';
import { SUBSTAT_VALUE_TABLE } from '../src/echoCoreRules.ts';
import assert from 'node:assert/strict';
import { projectRecommendedImprovePolicy } from '../src/improvePolicySources.ts';
import { projectImproveSettingsSources } from '../src/improveSettingsProjection.ts';
import { normalizeSimpleSettings } from '../src/improveSimpleSettings.mjs';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import type { ResolvedImprovePolicy } from '../src/improvePolicyDomain.ts';
import {
  createImprovePolicyState, migrateV2ImprovePolicy, resolveImprovePolicyState, updateImprovePolicyState,
  loadImprovePolicyStorage, readImprovePolicyState, persistImprovePolicyState,
  IMPROVE_POLICY_STORAGE_KEY, IMPROVE_POLICY_V2_KEY,
} from '../src/improvePolicyState.ts';

const recommended = await projectRecommendedImprovePolicy({ characterId: 'augusta' });
const approved = { ...recommended, echoPolicy: { ...recommended.echoPolicy,
  requirements: { status: 'USER_DEFINED', origin: 'USER', content: 'PRESENT', value: { requiredOnEveryEcho:
    ['CRIT Rate', 'CRIT DMG'].map(stat => ({ stat, minimum: SUBSTAT_VALUE_TABLE[stat][0] })), groups: [{id:'selected-flex',minimumCount:1,members:['ATK%','Heavy Attack DMG','Energy Regen','Flat ATK'].map(stat=>({stat,minimum:SUBSTAT_VALUE_TABLE[stat][0]}))}] } },
  preferences: { status: 'USER_DEFINED', origin: 'USER', content: 'PRESENT', value:
    ['ATK%', 'Heavy Attack DMG', 'Energy Regen', 'Flat ATK'].map((stat,index) => ({ stat, priorityGroup:index+1, minimum:SUBSTAT_VALUE_TABLE[stat][0] })) } } };
const legacy = projectImproveSettingsSources().find(row => row.characterId === 'augusta')!;
const initial = () => createImprovePolicyState('augusta', recommended);
const preference = [{ stat: 'CRIT DMG', priorityGroup: 1 }, { stat: 'Energy Regen', priorityGroup: 2 }] as const;
const manual = () => updateImprovePolicyState(initial(), { type: 'set', section: 'echoPreferences', value: preference }, recommended);
const memory = () => {
  const values = new Map<string, string>(), writes: string[] = [];
  return { values, writes, getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { writes.push(key); values.set(key, value); } };
};
const oldManual = (activeStats: unknown = ['CRIT DMG', 'CRIT Rate', 'Energy Regen']) => {
  const old = normalizeSimpleSettings(null, legacy);
  old.gate = 20; old.rollQuality = 'High+'; old.valuableStats.orderingMode = 'MANUAL';
  old.valuableStats.activeStats = activeStats;
  return old;
};
const outage = await projectRecommendedImprovePolicy({ characterId: 'augusta', presetId: 'augusta-standard' },
  { registry: { ...PROFILE_REGISTRY, presets: new Map() } });

test('Recommended and selecting Manual alone inherit sections without fabricating overrides', () => {
  const state = initial();
  assert.deepEqual(state.overrides, {});
  assert.deepEqual(resolveImprovePolicyState(state, recommended).policy, approved);
  const next = updateImprovePolicyState(state, { type: 'mode', value: 'MANUAL' }, recommended);
  assert.equal(next.mode, 'MANUAL'); assert.deepEqual(next.overrides, {});
  const effective = resolveImprovePolicyState(next, recommended);
  assert.deepEqual(effective.policy.characterTarget, recommended.characterTarget);
  assert.deepEqual(effective.policy.echoPolicy, approved.echoPolicy);
  assert.equal(effective.compatibility.status, 'COMPATIBLE');
  assert.equal(effective.policy.echoPolicy.preferences.status, 'USER_DEFINED');
  assert.equal(recommended.echoPolicy.preferences.status, 'PENDING');
});

test('sparse overrides inherit independently and explicit empty is distinct from no override', () => {
  let state = manual();
  const effective = resolveImprovePolicyState(state, recommended).policy;
  assert.deepEqual(effective.characterTarget, recommended.characterTarget);
  assert.deepEqual(effective.echoPolicy.requirements, recommended.echoPolicy.requirements);
  assert.equal(effective.echoPolicy.preferences.status, 'USER_DEFINED');
  assert.deepEqual(effective.echoPolicy.preferences.value, preference);
  state = updateImprovePolicyState(state, { type: 'set', section: 'echoPreferences', value: [] }, recommended);
  assert.equal(resolveImprovePolicyState(state, recommended).policy.echoPolicy.preferences.content, 'EXPLICITLY_EMPTY');
  state = updateImprovePolicyState(state, { type: 'clear', section: 'echoPreferences' }, recommended);
  assert.equal(Object.hasOwn(state.overrides, 'echoPreferences'), false);
  assert.equal(state.mode, 'MANUAL');
  assert.deepEqual(resolveImprovePolicyState(state, recommended).policy.echoPolicy.preferences, approved.echoPolicy.preferences);
});

test('every override section supports set/clear and keeps unrelated source sections intact', () => {
  const targets = [{ metric: 'TOTAL_ATK', unit: 'POINTS', minimum: 1800,
    basis: { kind: 'USER_DEFINED', description: 'Explicit user intent', comparisonStatus: 'PENDING' } }] as const;
  const priorities = [{ stat: 'CRIT Rate', priorityGroup: 1, sourceNotes: null },
    { stat: 'CRIT DMG', priorityGroup: 1, sourceNotes: null }] as const;
  const requirements = { requiredOnEveryEcho: [], groups: [] };
  let state = updateImprovePolicyState(initial(), { type: 'set', section: 'numericTargets', value: targets }, recommended);
  state = updateImprovePolicyState(state, { type: 'set', section: 'priorities', value: priorities }, recommended);
  state = updateImprovePolicyState(state, { type: 'set', section: 'echoRequirements', value: requirements }, recommended);
  let effective = resolveImprovePolicyState(state, recommended).policy;
  assert.equal(effective.characterTarget.numericTargets.status, 'USER_DEFINED');
  assert.deepEqual(effective.characterTarget.priorities.value, priorities);
  assert.equal(effective.echoPolicy.requirements.status, 'USER_DEFINED');
  assert.equal(effective.echoPolicy.preferences.status, 'PENDING');
  for (const section of ['numericTargets', 'priorities', 'echoRequirements'] as const) {
    state = updateImprovePolicyState(state, { type: 'clear', section }, recommended);
  }
  effective = resolveImprovePolicyState(state, recommended).policy;
  assert.deepEqual(effective.characterTarget, recommended.characterTarget);
  assert.deepEqual(effective.echoPolicy, approved.echoPolicy);
  for (const section of ['numericTargets', 'priorities'] as const) {
    state = updateImprovePolicyState(state, { type: 'set', section, value: [] }, recommended);
    assert.equal(resolveImprovePolicyState(state, recommended).policy.characterTarget[section].content, 'EXPLICITLY_EMPTY');
  }
});

test('Manual to Recommended and reset clear only policy intent, preserving Gate/Quality and sources', () => {
  const original = structuredClone(recommended);
  let state = updateImprovePolicyState(manual(), { type: 'gate', value: 25 }, recommended);
  state = updateImprovePolicyState(state, { type: 'quality', value: 'Mid+' }, recommended);
  for (const action of [{ type: 'reset' }, { type: 'mode', value: 'RECOMMENDED' }] as const) {
    const reset = updateImprovePolicyState(state, action, recommended);
    assert.equal(reset.mode, 'RECOMMENDED'); assert.deepEqual(reset.overrides, {});
    assert.equal(reset.gate, 25); assert.equal(reset.rollQuality, 'Mid+');
    assert.equal(reset.migration, null);
    assert.deepEqual(resolveImprovePolicyState(reset, recommended).policy, approved);
  }
  assert.deepEqual(recommended, original);
  assert.deepEqual(state.overrides.echoPreferences, preference);
});

test('v2 Recommended ignores empty Active, preserves Gate/Quality and inherits only the approved default', () => {
  const old = normalizeSimpleSettings(null, legacy); old.gate = 15; old.rollQuality = 'Mid+';
  const state = migrateV2ImprovePolicy('augusta', old, recommended, legacy);
  assert.equal(state.mode, 'RECOMMENDED'); assert.deepEqual(state.overrides, {});
  assert.equal(state.gate, 15); assert.equal(state.rollQuality, 'Mid+');
  assert.deepEqual(resolveImprovePolicyState(state, recommended).policy, approved);
});

test('exact-bound v2 Manual order becomes ONLY explicit Echo preferences, never thresholds or requirements', () => {
  const old = oldManual(), before = structuredClone(old);
  const state = migrateV2ImprovePolicy('augusta', old, recommended, legacy);
  assert.equal(state.mode, 'MANUAL'); assert.equal(state.migration?.status, 'MIGRATED');
  assert.deepEqual(state.overrides, { echoPreferences: [
    { stat: 'CRIT DMG', priorityGroup: 1 }, { stat: 'CRIT Rate', priorityGroup: 2 }, { stat: 'Energy Regen', priorityGroup: 3 },
  ] });
  assert.equal(state.gate, 20); assert.equal(state.rollQuality, 'High+');
  for (const key of ['numericTargets', 'priorities', 'echoRequirements']) assert.equal(Object.hasOwn(state.overrides, key), false);
  assert.equal(JSON.stringify(state.overrides).includes('minimum'), false);
  assert.equal(JSON.stringify(state.overrides).includes('weight'), false);
  assert.deepEqual(old, before);
});

test('explicit empty Manual Active becomes explicit empty Echo preferences without source order inference', () => {
  const state = migrateV2ImprovePolicy('augusta', oldManual([]), recommended, legacy);
  assert.equal(state.mode, 'MANUAL'); assert.deepEqual(state.overrides, { echoPreferences: [] });
  assert.equal(resolveImprovePolicyState(state, recommended).policy.echoPolicy.preferences.content, 'EXPLICITLY_EMPTY');
  const malformed = migrateV2ImprovePolicy('augusta', oldManual(null), recommended, legacy);
  assert.equal(malformed.migration?.status, 'REVIEW_REQUIRED'); assert.deepEqual(malformed.overrides, {});
  assert.equal(resolveImprovePolicyState(malformed, recommended).policy.echoPolicy.preferences.status, 'PENDING');
});

test('invalid/duplicate v2 names excluded effectively while original migration order remains available for review', () => {
  const active = ['CRIT Rate', 'invented', 'Heavy Attack DMG%', 'CRIT DMG', 'CRIT Rate', 'HP%'];
  const state = migrateV2ImprovePolicy('augusta', oldManual(active), recommended, legacy);
  assert.deepEqual(state.overrides.echoPreferences, [{ stat: 'CRIT Rate', priorityGroup: 1 }, { stat: 'CRIT DMG', priorityGroup: 2 }]);
  assert.deepEqual(state.migration?.intent.activeStats, active);
  assert.equal(resolveImprovePolicyState(state, recommended).compatibility.status, 'REVIEW_REQUIRED');
});

test('v2 binding, identity, profile, provenance, pool and notes drift suspend original intent without losing labels', () => {
  const old = oldManual();
  const changes = [
    { ...old, characterId: 'cartethyia' }, { ...old, schemaVersion: 1 },
    ...['sourceBinding', 'presetId', 'profileId'].map(key => ({ ...old, valuableStats: { ...old.valuableStats, [key]: 'changed' } })),
  ];
  for (const saved of changes) {
    const state = migrateV2ImprovePolicy('augusta', saved, recommended, legacy);
    assert.equal(state.mode, 'MANUAL'); assert.deepEqual(state.overrides, {});
    assert.equal(state.gate, 20); assert.equal(state.rollQuality, 'High+');
    assert.equal(state.migration?.status, 'REVIEW_REQUIRED');
    assert.deepEqual(state.migration?.intent.activeStats, old.valuableStats.activeStats);
    assert.equal(resolveImprovePolicyState(state, recommended).policy.echoPolicy.preferences.origin, 'USER');
  }
  for (const source of [{ ...legacy, provenance: { ...legacy.provenance, checkedAt: 'changed' } },
    { ...legacy, stats: legacy.stats.slice(1) }, { ...legacy, stats: legacy.stats.map(row => ({ ...row, note: 'changed' })) }]) {
    const state = migrateV2ImprovePolicy('augusta', old, recommended, source);
    assert.deepEqual(state.overrides, {}); assert.equal(state.migration?.status, 'PENDING');
  }
});

test('Character-isolated intent, Gate/Quality and deferred migrations survive storage reload without touching v2', async () => {
  const storage = memory(), otherSource = projectImproveSettingsSources().find(row => row.characterId === 'chixia')!;
  const otherRecommended = await projectRecommendedImprovePolicy({ characterId: 'chixia' });
  const other = normalizeSimpleSettings(null, otherSource); other.gate = 10; other.rollQuality = 'Mid+';
  const v2 = JSON.stringify({ version: 2, characters: { augusta: oldManual(), chixia: other } });
  storage.setItem(IMPROVE_POLICY_V2_KEY, v2);
  let store = loadImprovePolicyStorage(storage);
  let first = readImprovePolicyState(store, 'augusta', recommended, legacy);
  store = persistImprovePolicyState(store, first, storage);
  assert.ok(store.pendingV2Characters.chixia);
  assert.equal(JSON.stringify(store).includes('availableStats'), false);
  store = loadImprovePolicyStorage(storage);
  const second = readImprovePolicyState(store, 'chixia', otherRecommended, otherSource);
  store = persistImprovePolicyState(store, second, storage);
  store = loadImprovePolicyStorage(storage);
  first = readImprovePolicyState(store, 'augusta', recommended, legacy);
  assert.equal(first.mode, 'MANUAL'); assert.equal(first.gate, 20); assert.equal(first.rollQuality, 'High+');
  assert.equal(second.mode, 'RECOMMENDED'); assert.equal(second.gate, 10); assert.equal(second.rollQuality, 'Mid+');
  assert.deepEqual(second.overrides, {});
  assert.deepEqual(first.overrides.echoPreferences?.map(row => row.stat), oldManual().valuableStats.activeStats);
  assert.equal(storage.getItem(IMPROVE_POLICY_V2_KEY), v2);
  assert.equal(storage.writes.filter(key => key === IMPROVE_POLICY_V2_KEY).length, 1);
  assert.equal(JSON.parse(storage.getItem(IMPROVE_POLICY_STORAGE_KEY)!).version, 3);
});

test('temporary context outage masks effective overrides but Gate/Quality edits persist original intent and recover', () => {
  const storage = memory(); let store = loadImprovePolicyStorage(storage);
  let state = manual(); store = persistImprovePolicyState(store, state, storage);
  state = readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', outage);
  const effective = resolveImprovePolicyState(state, outage);
  assert.equal(effective.compatibility.status, 'PENDING');
  assert.equal(effective.policy.echoPolicy.preferences.status, 'PENDING');
  assert.equal(effective.policy.characterTarget.numericTargets.status, 'PENDING');
  assert.deepEqual(state.overrides.echoPreferences, preference); assert.equal(state.mode, 'MANUAL');
  state = updateImprovePolicyState(state, { type: 'gate', value: 10 }, outage);
  state = updateImprovePolicyState(state, { type: 'quality', value: 'High+' }, outage);
  store = persistImprovePolicyState(store, state, storage);
  const recovered = readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', recommended);
  assert.deepEqual(recovered.overrides.echoPreferences, preference);
  assert.deepEqual(resolveImprovePolicyState(recovered, recommended).policy.echoPolicy.preferences.value, preference);
  assert.equal(recovered.gate, 10); assert.equal(recovered.rollQuality, 'High+');
});

test('deferred v2 migration survives outage/reload then validates exact binding on recovery', () => {
  const storage = memory(); storage.setItem(IMPROVE_POLICY_V2_KEY, JSON.stringify({ version: 2, characters: { augusta: oldManual() } }));
  let store = loadImprovePolicyStorage(storage);
  let state = readImprovePolicyState(store, 'augusta', outage);
  assert.equal(state.mode, 'MANUAL'); assert.equal(state.migration?.status, 'PENDING');
  state = updateImprovePolicyState(state, { type: 'gate', value: 25 }, outage);
  state = updateImprovePolicyState(state, { type: 'quality', value: 'Mid+' }, outage);
  store = persistImprovePolicyState(store, state, storage);
  state = readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', recommended, legacy);
  assert.equal(state.migration?.status, 'MIGRATED'); assert.equal(state.gate, 25); assert.equal(state.rollQuality, 'Mid+');
  assert.deepEqual(state.overrides.echoPreferences?.map(row => row.stat), oldManual().valuableStats.activeStats);
});

test('reset during pending migration never resurrects old Manual intent after recovery', () => {
  const storage = memory(); let store = loadImprovePolicyStorage(storage);
  let state = migrateV2ImprovePolicy('augusta', oldManual(), outage);
  state = updateImprovePolicyState(state, { type: 'reset' }, outage);
  store = persistImprovePolicyState(store, state, storage);
  state = readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', recommended, legacy);
  assert.equal(state.mode, 'RECOMMENDED'); assert.deepEqual(state.overrides, {}); assert.equal(state.migration, null);
  assert.equal(state.gate, 20); assert.equal(state.rollQuality, 'High+');
});

test('preset/context switching suspends bound overrides without retargeting and restores original context', async () => {
  const state = manual(), before = structuredClone(state);
  for (const changed of [
    { ...recommended, presetId: 'different', applicability: { ...recommended.applicability!, presetId: 'different' } },
    { ...recommended, applicability: { ...recommended.applicability!, contextBinding: 'new-reviewed-context' } },
    await projectRecommendedImprovePolicy({ characterId: 'chixia' }),
  ]) {
    const resolved = resolveImprovePolicyState(state, changed);
    assert.equal(resolved.compatibility.status, 'REVIEW_REQUIRED');
    assert.equal(resolved.policy.echoPolicy.preferences.status, 'PENDING');
    assert.throws(() => updateImprovePolicyState(state, { type: 'set', section: 'echoPreferences', value: preference }, changed));
    assert.deepEqual(state, before);
  }
  assert.deepEqual(resolveImprovePolicyState(state, recommended).policy.echoPolicy.preferences.value, preference);
});

test('source section drift leaves compatible manual intent effective and inherited sections Pending', async () => {
  const targets = new Map(PROFILE_REGISTRY.statTargets), original = targets.get(legacy.profileId!)!;
  targets.set(original.id, { ...original, provenance: { ...original.provenance, checkedAt: 'drift' } });
  const changed = await projectRecommendedImprovePolicy({ characterId: 'augusta' }, { registry: { ...PROFILE_REGISTRY, statTargets: targets } });
  assert.deepEqual(changed.applicability, recommended.applicability);
  const resolved = resolveImprovePolicyState(manual(), changed);
  assert.deepEqual(resolved.policy.echoPolicy.preferences.value, preference);
  assert.equal(resolved.policy.characterTarget.priorities.status, 'PENDING');
  assert.equal(resolved.policy.characterTarget.numericTargets.status, 'PENDING');
  const migrated = migrateV2ImprovePolicy('augusta', oldManual(), changed, legacy);
  assert.equal(migrated.migration?.status, 'PENDING'); assert.deepEqual(migrated.overrides, {});
});

test('invalid saved override names, ties or numeric shape fail closed without deleting saved original intent', () => {
  for (const bad of [[{ stat: 'Heavy Attack DMG%', priorityGroup: 1 }], [{ stat: 'CRIT Rate', priorityGroup: 0 }],
    [{ stat: 'CRIT Rate', priorityGroup: 1 }, { stat: 'CRIT Rate', priorityGroup: 2 }]]) {
    const state = { ...manual(), overrides: { echoPreferences: bad } };
    const storage = memory(); const store = persistImprovePolicyState(loadImprovePolicyStorage(storage), state, storage);
    const restored = readImprovePolicyState(store, 'augusta', recommended);
    const result = resolveImprovePolicyState(restored, recommended);
    assert.equal(result.policy.echoPolicy.preferences.status, 'PENDING');
    assert.equal(result.compatibility.status, 'REVIEW_REQUIRED');
    assert.deepEqual(restored.overrides.echoPreferences, bad);
    assert.throws(() => updateImprovePolicyState(initial(), { type: 'set', section: 'echoPreferences', value: bad }, recommended));
  }
  assert.throws(() => updateImprovePolicyState(initial(), { type: 'set', section: 'numericTargets', value: [
    { metric: 'TOTAL_ATK', unit: 'RATIO', minimum: -1, basis: { kind: 'SOURCE_DESCRIBED', description: null, comparisonStatus: 'PENDING' } },
  ] }, recommended));
  const requirements = { requiredOnEveryEcho: [], groups: [{ id: 'user', members: [{ stat: 'invalid' }] }] };
  assert.throws(() => updateImprovePolicyState(initial(), { type: 'set', section: 'echoRequirements', value: requirements }, recommended));
});

test('storage persists intent only, returns detached state, and failed writes never mark store committed', () => {
  const storage = memory(), store = loadImprovePolicyStorage(storage);
  const state = { ...manual(), buildTotals: { atk: 123 }, deficits: [1], policy: recommended, scoring: 99 };
  const next = persistImprovePolicyState(store, state, storage);
  assert.deepEqual(store.characters, {});
  const raw = storage.getItem(IMPROVE_POLICY_STORAGE_KEY)!;
  for (const derived of ['buildTotals', 'deficits', 'scoring', 'checkpointReference', 'characterTarget', 'sourceNotes']) assert.equal(raw.includes(derived), false);
  const read = readImprovePolicyState(next, 'augusta', recommended);
  read.overrides.echoPreferences[0].priorityGroup = 99;
  assert.equal(next.characters.augusta.overrides.echoPreferences?.[0].priorityGroup, 1);
  assert.throws(() => persistImprovePolicyState(store, manual(), { getItem: storage.getItem, setItem: () => { throw new Error('quota'); } }), /quota/);
  assert.deepEqual(store.characters, {});
});

test('unsupported/corrupt new storage fails closed and never overwrites or falls back to v2', () => {
  const storage = memory(); storage.setItem(IMPROVE_POLICY_STORAGE_KEY, JSON.stringify({ version: 99 }));
  assert.throws(() => loadImprovePolicyStorage(storage), /Unsupported/);
  storage.setItem(IMPROVE_POLICY_STORAGE_KEY, '{');
  assert.throws(() => loadImprovePolicyStorage(storage));
  storage.setItem(IMPROVE_POLICY_STORAGE_KEY, JSON.stringify({ version: 3, characters: { augusta: { ...manual(), characterId: 'chixia' } } }));
  assert.throws(() => readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', recommended), /identity/);
});

test('real context/provenance drift exposes review instead of outage and retains saved bound intent', async () => {
  const presets = new Map(PROFILE_REGISTRY.presets), original = presets.get('augusta-standard')!;
  presets.set(original.id, { ...original, sequence: 1 });
  const drift = await projectRecommendedImprovePolicy({ characterId: 'augusta' }, { registry: { ...PROFILE_REGISTRY, presets } });
  assert.equal(drift.applicability, null); assert.equal(drift.sourceReviewStatus, 'REVIEW_REQUIRED');
  const state = manual(), result = resolveImprovePolicyState(state, drift);
  assert.equal(result.compatibility.status, 'REVIEW_REQUIRED');
  assert.equal(result.policy.echoPolicy.preferences.status, 'PENDING');
  assert.deepEqual(state.overrides.echoPreferences, preference);
  assert.equal(state.presetId, 'augusta-standard'); assert.equal(state.contextBinding, recommended.applicability?.contextBinding);
  assert.deepEqual(resolveImprovePolicyState(state, recommended).policy.echoPolicy.preferences.value, preference);
});

test('clear deferred preferences explicitly returns inheritance, and unbound original overrides cannot be retargeted', () => {
  const pending = migrateV2ImprovePolicy('augusta', oldManual(), outage);
  const cleared = updateImprovePolicyState(pending, { type: 'clear', section: 'echoPreferences' }, outage);
  assert.equal(cleared.mode, 'MANUAL'); assert.equal(cleared.migration, null);
  assert.deepEqual(resolveImprovePolicyState(cleared, recommended).policy.echoPolicy.preferences, approved.echoPolicy.preferences);
  const unbound = { ...manual(), contextBinding: null };
  assert.equal(resolveImprovePolicyState(unbound, recommended).policy.echoPolicy.preferences.status, 'PENDING');
  assert.throws(() => updateImprovePolicyState(unbound, { type: 'set', section: 'echoPreferences', value: [] }, recommended), /context/);
});

test('all-invalid legacy Active is suspended rather than reinterpreted as user-defined empty', () => {
  const state = migrateV2ImprovePolicy('augusta', oldManual(['unknown', 'Heavy Attack DMG%']), recommended, legacy);
  assert.equal(state.mode, 'MANUAL'); assert.equal(state.migration?.status, 'REVIEW_REQUIRED');
  assert.deepEqual(state.overrides, {});
  assert.deepEqual(state.migration?.intent.activeStats, ['unknown', 'Heavy Attack DMG%']);
  assert.equal(resolveImprovePolicyState(state, recommended).policy.echoPolicy.preferences.status, 'PENDING');
});

test('nested Valuable Stats schema must be v2 before Manual Active receives new preference semantics', () => {
  const old = oldManual(); old.valuableStats.schemaVersion = 1;
  const state = migrateV2ImprovePolicy('augusta', old, recommended, legacy);
  assert.equal(state.migration?.status, 'REVIEW_REQUIRED'); assert.deepEqual(state.overrides, {});
  assert.equal(state.gate, 20); assert.equal(state.rollQuality, 'High+');
  assert.equal(resolveImprovePolicyState(state, recommended).policy.echoPolicy.preferences.status, 'PENDING');
});

test('deferred v1 records inside v2 carry labels forward without reinterpreting old selections or count', async () => {
  const storage = memory(), other = await projectRecommendedImprovePolicy({ characterId: 'chixia' });
  const v2 = JSON.stringify({ version: 2, characters: { augusta: oldManual() }, pendingV1Characters: {
    chixia: { gate: 15, rollQuality: 'Mid+', valuableStats: { selectedStats: ['CRIT Rate'], requiredCount: 2, orderingMode: 'MANUAL' } },
    augusta: { gate: 5, rollQuality: 'All Rolls' },
  } });
  storage.setItem(IMPROVE_POLICY_V2_KEY, v2);
  let store = loadImprovePolicyStorage(storage);
  const state = readImprovePolicyState(store, 'chixia', other);
  assert.equal(state.gate, 15); assert.equal(state.rollQuality, 'Mid+');
  assert.equal(state.mode, 'RECOMMENDED'); assert.deepEqual(state.overrides, {}); assert.equal(state.migration, null);
  store = persistImprovePolicyState(store, state, storage);
  const restored = readImprovePolicyState(loadImprovePolicyStorage(storage), 'chixia', other);
  assert.deepEqual(restored, state);
  assert.equal(readImprovePolicyState(store, 'augusta', recommended, legacy).gate, 20);
  assert.equal(storage.getItem(IMPROVE_POLICY_V2_KEY), v2);
  assert.equal(storage.getItem(IMPROVE_POLICY_STORAGE_KEY)!.includes('selectedStats'), false);
  assert.equal(storage.getItem(IMPROVE_POLICY_STORAGE_KEY)!.includes('requiredCount'), false);
});
