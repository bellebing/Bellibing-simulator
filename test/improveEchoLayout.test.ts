import test from 'node:test';
import assert from 'node:assert/strict';
import { SUBSTAT_TYPES, SUBSTAT_VALUE_TABLE } from '../src/echoCoreRules.ts';
import { projectRecommendedImprovePolicy } from '../src/improvePolicySources.ts';
import { createImprovePolicyState, updateImprovePolicyState, persistImprovePolicyState, loadImprovePolicyStorage,
  readImprovePolicyState, resolveImprovePolicyState, IMPROVE_POLICY_STORAGE_KEY } from '../src/improvePolicyState.ts';
import { echoPolicyPresentation, editEchoPolicy, editEchoRollMinimum, echoRollControl, moveEchoStat } from '../docs/ui-prototypes/assets/echo-policy-presentation.mjs';
const source = await projectRecommendedImprovePolicy({ characterId: 'augusta' });
const view = state => echoPolicyPresentation(state, source, SUBSTAT_TYPES);
const initial = () => createImprovePolicyState('augusta', source);
const uniqueRows = state => {
  const names = ['every', 'flex', 'other'].flatMap(list => view(state).layout[list]);
  assert.equal(names.length, 13); assert.equal(new Set(names).size, 13);
  assert.deepEqual([...names].sort(), [...SUBSTAT_TYPES].sort());
};

test('all 13 inactive rows activate by destination membership without changing Augusta guidance', () => {
  let state = initial();
  assert.deepEqual(view(state).relevant, SUBSTAT_TYPES.filter(name => ['CRIT Rate', 'CRIT DMG', 'Energy Regen', 'ATK%', 'Heavy Attack DMG'].includes(name)));
  const highlighted = view(state).relevant;
  for (const stat of SUBSTAT_TYPES) for (const section of ['every', 'flex', 'other']) {
    state = moveEchoStat(state, source, SUBSTAT_TYPES, stat, section, 0);
    uniqueRows(state); assert.ok(view(state).layout[section].includes(stat));
    assert.equal(view(state).required.includes(stat), section === 'every');
    assert.equal(view(state).flex.includes(stat), section === 'flex');
    assert.deepEqual(view(state).relevant, highlighted);
    assert.deepEqual(view(state).layout.every, view(state).required);
    assert.deepEqual(view(state).layout.flex, view(state).flex);
  }
});

test('minimum and active ownership survive every/flex/other round trips and reload', async () => {
  const data = new Map<string,string>();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  let store = loadImprovePolicyStorage(storage);
  let state = updateImprovePolicyState(initial(), { type: 'mode', value: 'MANUAL' }, source);
  for (const name of SUBSTAT_TYPES) {
    state = editEchoPolicy(state, source, SUBSTAT_TYPES, 'every', name);
    const index = SUBSTAT_VALUE_TABLE[name]!.length - 1, minimum = SUBSTAT_VALUE_TABLE[name]![index];
    state = editEchoRollMinimum(state, source, SUBSTAT_TYPES, 'every', name, index);
    state = moveEchoStat(state, source, SUBSTAT_TYPES, name, 'flex');
    assert.ok(view(state).flex.includes(name)); assert.ok(!view(state).required.includes(name));
    assert.equal(echoRollControl(view(state), source, 'flex', name).text, echoRollControl(view(state), source, 'every', name).text);
    assert.equal(state.overrides.echoPreferences!.find(row => row.stat === name)!.minimum, minimum);
    state = moveEchoStat(state, source, SUBSTAT_TYPES, name, 'other');
    assert.ok(!view(state).required.includes(name) && !view(state).flex.includes(name));
    assert.equal(state.echoLayout!.minimums[name], minimum);
    state = moveEchoStat(state, source, SUBSTAT_TYPES, name, 'every');
    assert.ok(view(state).required.includes(name)); // moving from other immediately reactivates it
    assert.equal(state.overrides.echoRequirements!.requiredOnEveryEcho.find(row => row.stat === name)!.minimum, minimum);
    state = moveEchoStat(state, source, SUBSTAT_TYPES, name, 'other');
    state = moveEchoStat(state, source, SUBSTAT_TYPES, name, 'every');
    assert.equal(state.overrides.echoRequirements!.requiredOnEveryEcho.find(row => row.stat === name)!.minimum, minimum);
    uniqueRows(state);
  }
  store = persistImprovePolicyState(store, state, storage);
  assert.deepEqual(readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', source), state);
  const chixia = await projectRecommendedImprovePolicy({ characterId: 'chixia' });
  assert.deepEqual(readImprovePolicyState(store, 'chixia', chixia).overrides, {});
  assert.equal(readImprovePolicyState(store, 'chixia', chixia).echoLayout, undefined);
  const prior = data.get(IMPROVE_POLICY_STORAGE_KEY);
  assert.throws(() => persistImprovePolicyState(store, state, { ...storage, setItem: () => { throw Error('quota'); } }));
  assert.equal(data.get(IMPROVE_POLICY_STORAGE_KEY), prior);
});

test('main v3 preferences retain values/order, groups remain intact, rejected card intent is retained for review', () => {
  let state = updateImprovePolicyState(initial(), { type: 'set', section: 'echoPreferences', value: [
    { stat: 'Flat ATK', priorityGroup: 1, minimum: 60 }, { stat: 'Energy Regen', priorityGroup: 2, minimum: .116 }] }, source);
  state = updateImprovePolicyState(state, { type: 'set', section: 'echoRequirements', value: {
    requiredOnEveryEcho: [{ stat: 'CRIT Rate', minimum: .105 }], groups: [{ id: 'old', members: [{ stat: 'HP%', minimum: .064 }] }] } }, source);
  const envelope = { version: 3 as const, characters: { augusta: state }, pendingV2Characters: {} };
  assert.deepEqual(readImprovePolicyState(envelope, 'augusta', source), state);
  assert.deepEqual(view(state).layout.flex, ['Flat ATK', 'Energy Regen']); uniqueRows(state);
  state = moveEchoStat(state, source, SUBSTAT_TYPES, 'CRIT Rate', 'flex', 0);
  assert.deepEqual(state.overrides.echoPreferences!.map(row => row.stat), ['CRIT Rate', 'Flat ATK', 'Energy Regen']);
  assert.deepEqual(view(state).layout.flex, ['CRIT Rate', 'Flat ATK', 'Energy Regen']);
  assert.deepEqual(state.overrides.echoRequirements!.groups, envelope.characters.augusta.overrides.echoRequirements!.groups);
  const rejected = { ...envelope, characters: { augusta: { ...state, overrides: { ...state.overrides, echoCards: { minimumCount: 2 } } } } };
  assert.throws(() => readImprovePolicyState(rejected, 'augusta', source), /Retired Echo card/);
  assert.equal(rejected.characters.augusta.overrides.echoCards.minimumCount, 2);
  const broken = { ...envelope, characters: { augusta: { ...state, echoLayout: { ...state.echoLayout!, other: ['CRIT Rate'] } } } };
  assert.throws(() => readImprovePolicyState(broken, 'augusta', source), /Invalid saved Echo row/);
});


test('layout edits cannot bind suspended or unbound existing user policy to a new context', () => {
  const state = updateImprovePolicyState(initial(), { type: 'set', section: 'numericTargets', value: [] }, source);
  for (const contextBinding of [null, 'changed-context']) {
    const suspended = { ...state, contextBinding };
    assert.throws(() => moveEchoStat(suspended, source, SUBSTAT_TYPES, 'Flat HP', 'flex'), /context/);
    assert.deepEqual(suspended.overrides, state.overrides);
  }
  assert.throws(() => moveEchoStat(state, { ...source, applicability: null }, SUBSTAT_TYPES, 'Flat HP', 'flex'), /context/);
});


test('previous inactive Hard/Flex placements preserve settings without becoming new acceptance requirements', () => {
  const state = { ...initial(), mode: 'MANUAL' as const, echoLayout: {
    every: ['CRIT Rate'], flex: ['ATK%'], other: SUBSTAT_TYPES.filter(name => !['CRIT Rate','ATK%'].includes(name)), minimums: { 'CRIT Rate': .105, 'ATK%': .116 } } };
  const original = structuredClone(state);
  assert.deepEqual(view(state).layout.every, []); assert.deepEqual(view(state).layout.flex, []);
  assert.equal(view(state).layout.other.length, 13); assert.deepEqual(state, original);
  const activated = moveEchoStat(state, source, SUBSTAT_TYPES, 'ATK%', 'flex');
  assert.deepEqual(activated.overrides.echoPreferences, [{ stat: 'ATK%', priorityGroup: 1, minimum: .116 }]);
  assert.deepEqual(activated.overrides.echoRequirements, undefined);
});
