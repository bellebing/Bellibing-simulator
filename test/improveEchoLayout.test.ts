import test from 'node:test';
import assert from 'node:assert/strict';
import { SUBSTAT_TYPES, SUBSTAT_VALUE_TABLE } from '../src/echoCoreRules.ts';
import { projectRecommendedImprovePolicy, projectReleasedImprovePolicies } from '../src/improvePolicySources.ts';
import { createImprovePolicyState, updateImprovePolicyState, persistImprovePolicyState, loadImprovePolicyStorage,
  readImprovePolicyState, resolveImprovePolicyState, IMPROVE_POLICY_STORAGE_KEY } from '../src/improvePolicyState.ts';
import { echoPolicyPresentation, editEchoPolicy, editEchoRollMinimum, echoRollControl, moveEchoStat, resetEchoPolicy, editFlexCount } from '../docs/ui-prototypes/assets/echo-policy-presentation.mjs';
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
    assert.deepEqual([...view(state).layout.every].sort(), [...view(state).required].sort());
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


test('only Augusta/default receives the explicit user-approved initial configuration', async () => {
  const state = initial(), presented = view(state), resolved = resolveImprovePolicyState(state, source);
  assert.equal(state.mode, 'RECOMMENDED'); assert.deepEqual(state.overrides, {});
  assert.deepEqual(presented.layout.every, ['CRIT Rate', 'CRIT DMG']);
  assert.deepEqual(presented.layout.flex, ['ATK%', 'Heavy Attack DMG', 'Energy Regen', 'Flat ATK']);
  assert.equal(presented.layout.other.length, 7); uniqueRows(state);
  assert.equal(presented.relevant.includes('Flat ATK'), false);
  assert.equal(resolved.policy.echoPolicy.requirements.origin, 'USER');
  assert.equal(source.echoPolicy.requirements.status, 'PENDING'); assert.equal(source.echoPolicy.preferences.status, 'PENDING');
  assert.equal(resolved.policy.echoPolicy.requirements.value!.groups[0].minimumCount, 1);
  assert.deepEqual(resolved.policy.echoPolicy.requirements.value!.groups[0].members.map(row=>row.stat), presented.flex);
  for (const row of [...resolved.policy.echoPolicy.requirements.value!.requiredOnEveryEcho, ...resolved.policy.echoPolicy.preferences.value!])
    assert.equal(row.minimum, SUBSTAT_VALUE_TABLE[row.stat]![0]);
  for (const policy of await projectReleasedImprovePolicies()) if (policy.characterId !== 'augusta') {
    const other = resolveImprovePolicyState(createImprovePolicyState(policy.characterId, policy), policy);
    assert.equal(other.userApprovedEchoDefault, false, policy.characterId);
    assert.deepEqual(other.policy.echoPolicy, policy.echoPolicy, policy.characterId);
  }
  for (const policy of [{...source, presetId:'other'}, {...source, applicability:null}, {...source, sourceReviewStatus:'REVIEW_REQUIRED' as const}])
    assert.equal(resolveImprovePolicyState(state, policy).userApprovedEchoDefault, false);
});

test('first default edits freeze untouched defaults; reload/custom empties and reset preserve intent', () => {
  let state = editEchoRollMinimum(initial(), source, SUBSTAT_TYPES, 'every', 'CRIT Rate', SUBSTAT_VALUE_TABLE['CRIT Rate']!.length - 1);
  assert.equal(state.mode, 'MANUAL'); assert.equal(view(state).defaulted, false);
  assert.deepEqual(view(state).layout.flex, ['ATK%', 'Heavy Attack DMG', 'Energy Regen', 'Flat ATK']);
  state = updateImprovePolicyState(state, {type:'gate', value:20}, source);
  state = updateImprovePolicyState(state, {type:'set',section:'numericTargets',value:[]}, source);
  const data = new Map<string,string>(), storage = { getItem:key=>data.get(key)??null, setItem:(key,value)=>data.set(key,value) };
  persistImprovePolicyState(loadImprovePolicyStorage(storage), state, storage);
  assert.deepEqual(readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', source), state);
  const reset = resetEchoPolicy(state, source);
  assert.equal(view(reset).defaulted, true); assert.equal(reset.gate, 20); assert.deepEqual(reset.overrides.numericTargets, []);
  assert.equal(reset.overrides.echoRequirements, undefined);
  const moved = moveEchoStat(initial(), source, SUBSTAT_TYPES, 'Flat ATK', 'other');
  assert.deepEqual(view(moved).required, ['CRIT Rate','CRIT DMG']);
  assert.deepEqual(view(moved).flex, ['ATK%','Heavy Attack DMG','Energy Regen']);
  for (const section of ['echoRequirements','echoPreferences'] as const) {
    const empty = updateImprovePolicyState(initial(), {type:'set',section,value:section==='echoRequirements'?{requiredOnEveryEcho:[],groups:[]}:[]}, source);
    assert.equal(view(empty).defaulted, false); assert.deepEqual(view(empty).required, []); assert.deepEqual(view(empty).flex, []);
    persistImprovePolicyState(loadImprovePolicyStorage(storage), empty, storage);
    assert.deepEqual(readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', source), empty);
    assert.equal(view(updateImprovePolicyState(empty, {type:'reset'}, source)).defaulted, true);
  }
});


test('explicit Flex count and exact group minima survive moves, invalid pools, storage and reset', () => {
  let state = editFlexCount(initial(), source, SUBSTAT_TYPES, 2);
  const group = state => view(state).policy.requirements.value!.groups.find(row=>row.id==='selected-flex')!;
  assert.equal(group(state).minimumCount, 2);
  assert.throws(()=>editFlexCount(state, source, SUBSTAT_TYPES, 4), /capacity/);
  state = editEchoRollMinimum(state, source, SUBSTAT_TYPES, 'flex', 'ATK%', SUBSTAT_VALUE_TABLE['ATK%']!.length-1);
  assert.equal(group(state).members.find(row=>row.stat==='ATK%')!.minimum, .116);
  for (const name of ['Flat ATK','Energy Regen','Heavy Attack DMG']) state=moveEchoStat(state,source,SUBSTAT_TYPES,name,'other');
  assert.equal(group(state).minimumCount,2); assert.equal(view(state).flexCount.valid,false);
  assert.deepEqual(group(state).members,[{stat:'ATK%',minimum:.116}]);
  state=moveEchoStat(state,source,SUBSTAT_TYPES,'ATK%','other');
  assert.deepEqual(group(state).members,[]); assert.equal(view(state).flexCount.valid,false);
  assert.match(view(state).flexCount.message,/empty/); assert.ok(!view(state).flexCount.message.includes('of 0'));
  const data=new Map<string,string>(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  persistImprovePolicyState(loadImprovePolicyStorage(storage),state,storage);
  state=readImprovePolicyState(loadImprovePolicyStorage(storage),'augusta',source);
  assert.equal(group(state).minimumCount,2); assert.equal(view(state).flexCount.valid,false);
  state=moveEchoStat(state,source,SUBSTAT_TYPES,'ATK%','flex');
  assert.equal(group(state).members[0].minimum,.116);
  state=editFlexCount(state,source,SUBSTAT_TYPES,1); assert.equal(view(state).flexCount.valid,true);
  state=resetEchoPolicy(state,source); assert.equal(group(state).minimumCount,1); assert.equal(view(state).flex.length,4);
});
test('old preferences and count-less groups are not silently promoted by loading or dragging', () => {
  let state=updateImprovePolicyState(initial(),{type:'set',section:'echoPreferences',value:[{stat:'ATK%',priorityGroup:1,minimum:.116}]},source);
  assert.equal(view(state).flexCount.count,null);
  state=moveEchoStat(state,source,SUBSTAT_TYPES,'Energy Regen','flex');
  assert.equal(view(state).flexCount.count,null); assert.equal(state.overrides.echoRequirements,undefined);
  state=editFlexCount(state,source,SUBSTAT_TYPES,1);
  assert.deepEqual(view(state).policy.requirements.value!.requiredOnEveryEcho,[]);
  assert.equal(view(state).flexCount.count,1); assert.equal(view(state).flexCount.maximum,2);
});
