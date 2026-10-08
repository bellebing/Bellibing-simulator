import test from 'node:test';
import assert from 'node:assert/strict';
import { SUBSTAT_TYPES, SUBSTAT_VALUE_TABLE } from '../src/echoCoreRules.ts';
import { projectRecommendedImprovePolicy } from '../src/improvePolicySources.ts';
import { initialImproveRollMinimum, improveRollControl, improveRelevantStats } from '../src/improvePolicyPresentation.ts';
import { createImprovePolicyState, updateImprovePolicyState, resolveImprovePolicyState, loadImprovePolicyStorage,
  readImprovePolicyState, persistImprovePolicyState, IMPROVE_POLICY_STORAGE_KEY } from '../src/improvePolicyState.ts';
import { echoPolicyPresentation, echoRollControl, editEchoRollMinimum, editEchoPolicy, reorderFlexStats,
  resetEchoPolicy } from '../docs/ui-prototypes/assets/echo-policy-presentation.mjs';
const source = await projectRecommendedImprovePolicy({ characterId: 'augusta' });
const initial = () => createImprovePolicyState('augusta', source);
const manual = () => updateImprovePolicyState(initial(), { type: 'mode', value: 'MANUAL' }, source);
const view = state => echoPolicyPresentation(state, source, SUBSTAT_TYPES);

test('legacy Flex preferences without minimum remain loadable; presentation initializes without writing intent', () => {
  const state = updateImprovePolicyState(manual(), { type: 'set', section: 'echoPreferences', value: [
    { stat: 'Energy Regen', priorityGroup: 1 }, { stat: 'Flat ATK', priorityGroup: 2 }] }, source);
  const original = structuredClone(state);
  assert.equal(echoRollControl(view(state), source, 'flex', 'Energy Regen').text, '6.8%');
  assert.equal(echoRollControl(view(state), source, 'flex', 'Flat ATK').text, '30');
  assert.deepEqual(state, original);
});

test('invalid saved Flex minimums fail closed without deleting original intent', () => {
  for (const minimum of [-1, Infinity, '0.064']) {
    const saved = { ...manual(), overrides: { echoPreferences: [{ stat: 'ATK%', priorityGroup: 1, minimum }] } };
    assert.equal(resolveImprovePolicyState(saved, source).compatibility.status, 'REVIEW_REQUIRED');
    assert.equal(saved.overrides.echoPreferences[0].minimum, minimum);
    assert.throws(() => updateImprovePolicyState(manual(), { type: 'set', section: 'echoPreferences', value: saved.overrides.echoPreferences }, source));
  }
});

test('Approved Augusta defaults and explicit user selections use only canonical game tiers', () => {
  const recommended = view(initial());
  assert.deepEqual(recommended.relevant, SUBSTAT_TYPES.filter(name => improveRelevantStats(source).includes(name)));
  assert.ok(recommended.relevant.length > 0);
  assert.deepEqual(recommended.required, ['CRIT Rate','CRIT DMG']); assert.deepEqual(recommended.flex, ['ATK%','Heavy Attack DMG','Energy Regen','Flat ATK']);
  assert.equal(recommended.policy.requirements.status, 'USER_DEFINED');
  assert.equal(source.echoPolicy.requirements.status, 'PENDING');
  let state = manual();
  for (const name of SUBSTAT_TYPES) {
    state = editEchoPolicy(state, source, SUBSTAT_TYPES, 'every', name);
    const control = echoRollControl(view(state), source, 'every', name);
    assert.equal(control.index, 0); assert.deepEqual(control.values, SUBSTAT_VALUE_TABLE[name]);
    for (let index = 0; index < control.values.length; index++) {
      state = editEchoRollMinimum(state, source, SUBSTAT_TYPES, 'every', name, index);
      assert.equal(state.overrides.echoRequirements!.requiredOnEveryEcho.find(row => row.stat === name)!.minimum, control.values[index]);
    }
    for (const index of [-1, .5, control.values.length, NaN]) {
      assert.throws(() => editEchoRollMinimum(state, source, SUBSTAT_TYPES, 'every', name, index));
    }
  }
  assert.deepEqual(state.overrides.echoPreferences, []);
  assert.deepEqual(source.echoPolicy.requirements.value, null);
  state = resetEchoPolicy(state, source);
  assert.deepEqual(view(state).required, ['CRIT Rate','CRIT DMG']);
  assert.deepEqual(view(state).flex, ['ATK%','Heavy Attack DMG','Energy Regen','Flat ATK']);
  assert.equal(view(state).defaulted, true);
});

test('explicit user minimums, sparse ownership and order survive reload and source/context failure', () => {
  let state = editEchoPolicy(manual(), source, SUBSTAT_TYPES, 'flex', 'Flat ATK');
  state = editEchoPolicy(state, source, SUBSTAT_TYPES, 'flex', 'HP%');
  state = editEchoRollMinimum(state, source, SUBSTAT_TYPES, 'flex', 'Flat ATK', SUBSTAT_VALUE_TABLE['Flat ATK']!.length - 1);
  state = reorderFlexStats(state, source, SUBSTAT_TYPES, 'HP%', 0);
  const original = structuredClone(state);
  const values = new Map<string,string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key,value) };
  persistImprovePolicyState(loadImprovePolicyStorage(storage), state, storage);
  const restored = readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', source);
  assert.deepEqual(restored, original);
  const outage = { ...source, applicability: null };
  assert.equal(resolveImprovePolicyState(restored, outage).policy.echoPolicy.preferences.status, 'PENDING');
  assert.deepEqual(restored.overrides, original.overrides);
  assert.equal(resolveImprovePolicyState(restored, source).policy.echoPolicy.preferences.status, 'USER_DEFINED');
  state = editEchoPolicy(restored, source, SUBSTAT_TYPES, 'every', 'Flat ATK');
  assert.ok(view(state).required.includes('Flat ATK')); assert.ok(!view(state).flex.includes('Flat ATK'));
  state = editEchoPolicy(state, source, SUBSTAT_TYPES, 'flex', 'Flat ATK');
  assert.ok(!view(state).required.includes('Flat ATK'));
  assert.equal(state.overrides.echoPreferences!.find(row => row.stat === 'Flat ATK')!.minimum, 60);
  assert.deepEqual(source.echoPolicy.requirements.value, null);
});
