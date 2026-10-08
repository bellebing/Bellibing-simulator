import test from 'node:test';
import assert from 'node:assert/strict';
import { SUBSTAT_TYPES, SUBSTAT_VALUE_TABLE } from '../src/echoCoreRules.ts';
import { projectRecommendedImprovePolicy } from '../src/improvePolicySources.ts';
import { pendingImprovePolicySource } from '../src/improvePolicyPresentation.ts';
import { createImprovePolicyState, updateImprovePolicyState, resolveImprovePolicyState, persistImprovePolicyState,
  loadImprovePolicyStorage, readImprovePolicyState, IMPROVE_POLICY_STORAGE_KEY } from '../src/improvePolicyState.ts';
import { publicSettingsView } from '../src/publicSettingsView.ts';
import { echoCardPresentation, editEchoCard } from '../docs/ui-prototypes/assets/echo-policy-presentation.mjs';
const source = await projectRecommendedImprovePolicy({ characterId: 'augusta' });
const initial = () => createImprovePolicyState('augusta', source);
const view = state => echoCardPresentation(state, source, SUBSTAT_TYPES);
const edit = (state, type, stat, value) => editEchoCard(state, source, SUBSTAT_TYPES, { type, stat, value });

test('unsupported Recommended has every canonical stat once, with editable manual tiers and no fabricated requirements', () => {
  const state = initial(), cards = view(state);
  assert.equal(cards.recommendedReady, false); assert.equal(cards.editable, true);
  assert.deepEqual(cards.cards.map(row => row.stat), SUBSTAT_TYPES);
  assert.ok(cards.cards.every(row => row.category === 'NOT_IMPORTANT' && SUBSTAT_VALUE_TABLE[row.stat].includes(row.minimum)));
  assert.deepEqual(state.overrides, {});
  assert.equal(resolveImprovePolicyState(state, source).policy.echoPolicy.requirements.status, 'PENDING');
});

test('all tiers and all category moves preserve a single identity and the exact user minimum', () => {
  for (const stat of SUBSTAT_TYPES) {
    let state = initial();
    for (let index = 0; index < SUBSTAT_VALUE_TABLE[stat].length; index++) {
      state = edit(state, 'roll', stat, index);
      assert.equal(state.mode, 'MANUAL');
      for (const category of ['HARD', 'ANY', 'NOT_IMPORTANT', 'ANY', 'HARD', 'NOT_IMPORTANT']) {
        state = edit(state, 'category', stat, category);
        assert.equal(view(state).cards.filter(row => row.stat === stat).length, 1);
        assert.deepEqual(view(state).cards.find(row => row.stat === stat), { stat, category, minimum: SUBSTAT_VALUE_TABLE[stat][index] });
      }
    }
  }
});

test('Any Of count is explicit, survives pool changes and fails closed when impossible', () => {
  let state = initial();
  for (const stat of SUBSTAT_TYPES.slice(0, 3)) state = edit(state, 'category', stat, 'ANY');
  state = edit(state, 'count', null, 3);
  const inspect = publicSettingsView(state, resolveImprovePolicyState(state, source));
  assert.equal(inspect.presentation.echoPolicy.requirements.value.groups[0].minimumCount, 3);
  state = edit(state, 'category', SUBSTAT_TYPES[0], 'HARD');
  assert.equal(view(state).anyOfMinimumCount, 3); assert.equal(view(state).maxCount, 2);
  assert.ok(view(state).errors.length); assert.equal(resolveImprovePolicyState(state, source).policy.echoPolicy.requirements.status, 'PENDING');
  assert.throws(() => edit(state, 'count', null, 3));
  state = edit(state, 'count', null, 2); assert.deepEqual(view(state).errors, []);
  for (const stat of SUBSTAT_TYPES.slice(3, 7)) state = edit(state, 'category', stat, 'HARD');
  assert.equal(view(state).maxCount, 0); assert.ok(view(state).errors.length);
});

test('save/reload isolates Characters and inventory, retains invalid count, and writes before commit', () => {
  const values = new Map(); const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let state = edit(initial(), 'roll', 'CRIT Rate', 7);
  for (const stat of ['CRIT Rate', 'CRIT DMG']) state = edit(state, 'category', stat, 'ANY');
  state = edit(state, 'count', null, 2); state = edit(state, 'category', 'CRIT DMG', 'NOT_IMPORTANT');
  const store = persistImprovePolicyState(loadImprovePolicyStorage(storage), state, storage);
  const reload = readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', source);
  assert.deepEqual(reload, state); assert.equal(view(reload).anyOfMinimumCount, 2); assert.ok(view(reload).errors.length);
  assert.equal(readImprovePolicyState(store, 'chixia', pendingImprovePolicySource('chixia')).overrides.echoCards, undefined);
  const bytes = values.get(IMPROVE_POLICY_STORAGE_KEY);
  assert.throws(() => persistImprovePolicyState(store, initial(), { ...storage, setItem: () => { throw Error('quota'); } }));
  assert.equal(values.get(IMPROVE_POLICY_STORAGE_KEY), bytes); assert.deepEqual(store.characters.augusta, state);
});

test('legacy Flex intent stays retained and requires explicit reset; source/context drift suspends cards', () => {
  const old = updateImprovePolicyState(initial(), { type: 'set', section: 'echoPreferences', value: [{ stat: 'CRIT Rate', priorityGroup: 1 }] }, source);
  assert.ok(view(old).needsReview); assert.throws(() => edit(old, 'category', 'CRIT Rate', 'ANY'));
  const reset = updateImprovePolicyState(old, { type: 'reset' }, source); assert.equal(view(reset).needsReview, false);
  const state = edit(reset, 'category', 'CRIT Rate', 'HARD');
  const drift = { ...source, applicability: { ...source.applicability, contextBinding: 'changed' } };
  assert.ok(resolveImprovePolicyState(state, drift).compatibility.suspendedSections.includes('echoCards'));
  assert.equal(echoCardPresentation(state, drift, SUBSTAT_TYPES).editable, false);
  assert.equal(view(state).cards.find(row => row.stat === 'CRIT Rate').category, 'HARD');
});

test('fresh manual requirements work without reviewed source context; malformed saved tiers are suspended', () => {
  const missing = pendingImprovePolicySource('unknown');
  let state = createImprovePolicyState('unknown', missing);
  state = editEchoCard(state, missing, SUBSTAT_TYPES, { type: 'category', stat: 'CRIT Rate', value: 'HARD' });
  state = editEchoCard(state, missing, SUBSTAT_TYPES, { type: 'roll', stat: 'CRIT Rate', value: 4 });
  assert.equal(resolveImprovePolicyState(state, missing).policy.echoPolicy.requirements.status, 'USER_DEFINED');
  const corrupt = structuredClone(state); corrupt.overrides.echoCards.cards[0].minimum = 123456;
  assert.ok(resolveImprovePolicyState(corrupt, missing).compatibility.suspendedSections.includes('echoCards'));
});

test('verified explicit recommendations initialize cards, and reset restores only source-backed requirements', () => {
  const reviewed = { ...source, echoPolicy: { ...source.echoPolicy, requirements: { status: 'VERIFIED', origin: 'PROFILE',
    source: {}, value: { requiredOnEveryEcho: [{ stat: 'CRIT Rate', minimum: SUBSTAT_VALUE_TABLE['CRIT Rate'][3] }],
      groups: [{ id: 'reviewed', minimumCount: 1, members: [{ stat: 'CRIT DMG', minimum: SUBSTAT_VALUE_TABLE['CRIT DMG'][2] }] }] } } } };
  const start = createImprovePolicyState('augusta', reviewed);
  assert.equal(echoCardPresentation(start, reviewed, SUBSTAT_TYPES).recommendedReady, true);
  const changed = editEchoCard(start, reviewed, SUBSTAT_TYPES, { type: 'roll', stat: 'CRIT Rate', value: 7 });
  const reset = updateImprovePolicyState(changed, { type: 'reset' }, reviewed);
  assert.equal(echoCardPresentation(reset, reviewed, SUBSTAT_TYPES).cards.find(row => row.stat === 'CRIT Rate').minimum, SUBSTAT_VALUE_TABLE['CRIT Rate'][3]);
});


test('explicit reset during a source outage clears prior bindings and permits fresh manual input', () => {
  const bound = edit(initial(), 'category', 'CRIT Rate', 'HARD');
  const missing = pendingImprovePolicySource('augusta');
  assert.equal(echoCardPresentation(bound, missing, SUBSTAT_TYPES).editable, false);
  const reset = updateImprovePolicyState(bound, { type: 'reset' }, missing);
  const manual = editEchoCard(reset, missing, SUBSTAT_TYPES, { type: 'category', stat: 'CRIT DMG', value: 'ANY' });
  assert.equal(manual.contextBinding, null);
  assert.equal(resolveImprovePolicyState(manual, missing).policy.echoPolicy.requirements.status, 'USER_DEFINED');
});
