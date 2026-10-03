import test from 'node:test';
import assert from 'node:assert/strict';
import { SUBSTAT_TYPES, SUBSTAT_VALUE_TABLE } from '../src/echoCoreRules.ts';
import { projectRecommendedImprovePolicy } from '../src/improvePolicySources.ts';
import { initialImproveRollMinimum, improveRollControl } from '../src/improvePolicyPresentation.ts';
import { createImprovePolicyState, updateImprovePolicyState, resolveImprovePolicyState, loadImprovePolicyStorage,
  readImprovePolicyState, persistImprovePolicyState, IMPROVE_POLICY_STORAGE_KEY } from '../src/improvePolicyState.ts';
import { echoPolicyPresentation, echoRollControl, editEchoRollMinimum, editEchoPolicy, reorderFlexStats,
  resetEchoPolicy } from '../docs/ui-prototypes/assets/echo-policy-presentation.mjs';
const source = await projectRecommendedImprovePolicy({ characterId: 'augusta' });
const initial = () => createImprovePolicyState('augusta', source);
const manual = () => updateImprovePolicyState(initial(), { type: 'mode', value: 'MANUAL' }, source);
const view = state => echoPolicyPresentation(state, source, SUBSTAT_TYPES);

test('Recommended minimums come from reviewed requirements; every stat uses its canonical tiers and units', () => {
  for (const [list, name, expected, index] of [['every', 'CRIT Rate', '9.3%', 5], ['every', 'CRIT DMG', '21%', 7],
    ['flex', 'ATK%', '6.4%', 0], ['flex', 'Energy Regen', '6.8%', 0], ['flex', 'Heavy Attack DMG', '6.4%', 0]]) {
    const control = echoRollControl(view(initial()), source, list, name);
    assert.equal(control.text, expected); assert.equal(control.index, index);
    assert.deepEqual(control.values, SUBSTAT_VALUE_TABLE[name]);
  }
  for (const name of SUBSTAT_TYPES) assert.equal(improveRollControl(name, SUBSTAT_VALUE_TABLE[name]![0]!).index, 0);
  assert.equal(improveRollControl('Flat ATK', 40).text, '40');
  assert.equal(initialImproveRollMinimum(source, 'Flat ATK'), 30);
  assert.ok(!view(initial()).relevant.includes('Flat ATK'));
});

test('minimum editing is sparse user intent, exact-tier only, preserving reviewed groups and source truth', () => {
  const original = structuredClone(source);
  let state = manual();
  assert.deepEqual(state.overrides, {});
  state = editEchoRollMinimum(state, source, SUBSTAT_TYPES, 'every', 'CRIT Rate', 2);
  assert.equal(state.overrides.echoRequirements!.requiredOnEveryEcho.find(row => row.stat === 'CRIT Rate')!.minimum, .075);
  assert.deepEqual(state.overrides.echoRequirements!.groups, source.echoPolicy.requirements.value!.groups);
  assert.equal(state.overrides.echoPreferences, undefined);
  state = editEchoRollMinimum(state, source, SUBSTAT_TYPES, 'flex', 'Energy Regen', 3);
  assert.equal(state.overrides.echoPreferences!.find(row => row.stat === 'Energy Regen')!.minimum, .092);
  assert.equal(resolveImprovePolicyState(state, source).policy.echoPolicy.preferences.origin, 'USER');
  assert.deepEqual(source, original);
  for (const index of [-1, .5, 8, NaN]) assert.throws(() => editEchoRollMinimum(state, source, SUBSTAT_TYPES, 'every', 'CRIT Rate', index));
  assert.throws(() => editEchoRollMinimum(initial(), source, SUBSTAT_TYPES, 'every', 'CRIT Rate', 0));
  assert.throws(() => editEchoRollMinimum(state, source, SUBSTAT_TYPES, 'flex', 'Flat ATK', 0));
});

test('selection and reorder preserve other minimums; Every Echo and Flex have one active owner', () => {
  let state = editEchoRollMinimum(manual(), source, SUBSTAT_TYPES, 'flex', 'Energy Regen', 4);
  state = reorderFlexStats(state, source, SUBSTAT_TYPES, 'Energy Regen', 0);
  assert.equal(state.overrides.echoPreferences![0]!.minimum, .1);
  state = editEchoPolicy(state, source, SUBSTAT_TYPES, 'flex', 'Flat ATK');
  assert.equal(echoRollControl(view(state), source, 'flex', 'Flat ATK').text, '30');
  state = editEchoPolicy(state, source, SUBSTAT_TYPES, 'every', 'Energy Regen');
  assert.ok(view(state).required.includes('Energy Regen')); assert.ok(!view(state).flex.includes('Energy Regen'));
  assert.equal(echoRollControl(view(state), source, 'every', 'Energy Regen').text, '6.8%');
  assert.equal(editEchoPolicy(state, source, SUBSTAT_TYPES, 'flex', 'Energy Regen'), state);
  state = editEchoPolicy(state, source, SUBSTAT_TYPES, 'every', 'Energy Regen');
  assert.ok(!view(state).flex.includes('Energy Regen'));
  state = editEchoPolicy(state, source, SUBSTAT_TYPES, 'flex', 'Energy Regen');
  assert.equal(echoRollControl(view(state), source, 'flex', 'Energy Regen').text, '6.8%');
});

test('legacy Flex preferences without minimum remain loadable; presentation initializes without writing intent', () => {
  const state = updateImprovePolicyState(manual(), { type: 'set', section: 'echoPreferences', value: [
    { stat: 'Energy Regen', priorityGroup: 1 }, { stat: 'Flat ATK', priorityGroup: 2 }] }, source);
  const original = structuredClone(state);
  assert.equal(echoRollControl(view(state), source, 'flex', 'Energy Regen').text, '6.8%');
  assert.equal(echoRollControl(view(state), source, 'flex', 'Flat ATK').text, '30');
  assert.deepEqual(state, original);
});

test('custom minimums survive storage; source drift suspends retained intent; reset restores source values/order', () => {
  const values = new Map([['bellibing.improve.simple-settings.v2', '{"version":2,"characters":{}}'], ['bellibing.improve.simple-settings.v1', 'recovery']]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let state = editEchoRollMinimum(manual(), source, SUBSTAT_TYPES, 'every', 'CRIT DMG', 1);
  state = editEchoRollMinimum(state, source, SUBSTAT_TYPES, 'flex', 'ATK%', 6);
  persistImprovePolicyState(loadImprovePolicyStorage(storage), state, storage);
  const restored = readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', source);
  assert.deepEqual(restored.overrides, state.overrides);
  assert.equal(values.get('bellibing.improve.simple-settings.v1'), 'recovery');
  assert.equal(values.get('bellibing.improve.simple-settings.v2'), '{"version":2,"characters":{}}');
  const drift = { ...source, applicability: { ...source.applicability!, contextBinding: 'different' } };
  assert.equal(resolveImprovePolicyState(restored, drift).compatibility.status, 'REVIEW_REQUIRED');
  assert.deepEqual(restored.overrides, state.overrides);
  const reset = resetEchoPolicy(restored, source);
  assert.equal(echoRollControl(view(reset), source, 'every', 'CRIT DMG').text, '21%');
  assert.equal(echoRollControl(view(reset), source, 'flex', 'ATK%').text, '6.4%');
  assert.deepEqual(view(reset).flex, view(initial()).flex);
  assert.ok(values.has(IMPROVE_POLICY_STORAGE_KEY));
});

test('invalid saved Flex minimums fail closed without deleting original intent', () => {
  for (const minimum of [-1, Infinity, '0.064']) {
    const saved = { ...manual(), overrides: { echoPreferences: [{ stat: 'ATK%', priorityGroup: 1, minimum }] } };
    assert.equal(resolveImprovePolicyState(saved, source).compatibility.status, 'REVIEW_REQUIRED');
    assert.equal(saved.overrides.echoPreferences[0].minimum, minimum);
    assert.throws(() => updateImprovePolicyState(manual(), { type: 'set', section: 'echoPreferences', value: saved.overrides.echoPreferences }, source));
  }
});
