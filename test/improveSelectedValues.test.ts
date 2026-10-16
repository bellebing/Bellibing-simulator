import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ECHO_LOADOUT_PROFILES } from '../src/data/echoLoadoutProfiles.ts';
import { SUBSTAT_TYPES } from '../src/echoCoreRules.ts';
import { projectRecommendedImprovePolicy } from '../src/improvePolicySources.ts';
import { createImprovePolicyState, updateImprovePolicyState, persistImprovePolicyState, loadImprovePolicyStorage, readImprovePolicyState, resolveImprovePolicyState } from '../src/improvePolicyState.ts';
import { publicSettingsView } from '../src/publicSettingsView.ts';
import { readSonataChoices, sonataChoicesPresentation, toggleSonataSelection } from '../docs/ui-prototypes/assets/improve-sonata-presentation.mjs';
import { echoSelectionSummary, echoPolicyPresentation, moveEchoStat, resetEchoPolicy } from '../docs/ui-prototypes/assets/echo-policy-presentation.mjs';

const data = JSON.parse(readFileSync('docs/ui-prototypes/assets/echoes/browser-data.json', 'utf8'));
const choices = readSonataChoices(data);
const source = await projectRecommendedImprovePolicy({ characterId: 'augusta' });
const initial = () => createImprovePolicyState('augusta', source);
const select = (state, id) => updateImprovePolicyState(state, { type: 'sonatas', value: toggleSonataSelection(state, choices, id) }, source);

test('Sonata defaults come only from canonical reviewed profiles, without distribution/effects', () => {
  for (const profile of ECHO_LOADOUT_PROFILES.filter(row => row.verificationStatus === 'VERIFIED')) {
    assert.deepEqual(choices.recommendations[profile.characterId], profile.sonataSetIds);
  }
  assert.deepEqual(sonataChoicesPresentation(initial(), choices).selected.map(row => row.name), ['Crown of Valor', 'Void Thunder']);
  assert.deepEqual(sonataChoicesPresentation({ characterId: 'chixia' }, choices).recommended, []);
  assert.deepEqual(sonataChoicesPresentation({ characterId: 'chixia' }, choices).selected, []);
  assert.ok(choices.catalog.every(row => Object.keys(row).sort().join() === 'artPath,id,name,sourceId'));
  assert.throws(() => readSonataChoices({ ...data, loadoutProfiles: [...data.loadoutProfiles, data.loadoutProfiles[0]] }));
  assert.throws(() => readSonataChoices({ ...data, sonataSets: [{ ...data.sonataSets[0], artPath: 'invented.png' }] }));
});

test('multi-select toggles preserve fixed recommended/other rows and unrelated intent', () => {
  const base = initial(), before = resolveImprovePolicyState(base, source);
  let state = select(base, 'sonata-38');
  assert.equal(state.selectedSonataSetIds.length, 3);
  state = select(state, 'sonata-20');
  assert.deepEqual(state.selectedSonataSetIds, ['sonata-3', 'sonata-38']);
  const oldRows = sonataChoicesPresentation(base, choices), newRows = sonataChoicesPresentation(state, choices);
  assert.deepEqual(newRows.recommended, oldRows.recommended);
  assert.deepEqual(newRows.other, oldRows.other);
  assert.deepEqual(resolveImprovePolicyState(state, source), before);
  assert.equal(state.mode, base.mode); assert.equal(state.gate, base.gate);
  assert.throws(() => select(state, 'fabricated-set'));
  assert.throws(() => updateImprovePolicyState(state, { type: 'sonatas', value: ['sonata-20', 'sonata-20'] }, source));
});

test('explicit empty choices, unknown retained IDs, Character isolation and resets survive persistence', async () => {
  let raw = null;
  const storage = { getItem: () => raw, setItem: (_, value) => { raw = value; } };
  let state = select(select(initial(), 'sonata-20'), 'sonata-3');
  let store = persistImprovePolicyState(loadImprovePolicyStorage(storage), state, storage);
  const bytes = raw;
  assert.deepEqual(sonataChoicesPresentation(readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', source), choices).selected, []);
  assert.equal(raw, bytes);
  const otherSource = await projectRecommendedImprovePolicy({ characterId: 'chixia' });
  const other = readImprovePolicyState(store, 'chixia', otherSource);
  assert.equal(other.selectedSonataSetIds, undefined);
  state = updateImprovePolicyState(state, { type: 'sonatas', value: ['sonata-999', 'sonata-20'] }, source);
  store = persistImprovePolicyState(store, state, storage);
  const loaded = readImprovePolicyState(loadImprovePolicyStorage(storage), 'augusta', source);
  assert.deepEqual(loaded.selectedSonataSetIds, ['sonata-999', 'sonata-20']);
  assert.deepEqual(sonataChoicesPresentation(loaded, choices).selected.map(row => row.id), ['sonata-20']);
  assert.deepEqual(resetEchoPolicy(loaded, source).selectedSonataSetIds, loaded.selectedSonataSetIds);
  assert.deepEqual(updateImprovePolicyState(loaded, { type: 'reset' }, source).selectedSonataSetIds, loaded.selectedSonataSetIds);
  const exposed = publicSettingsView(loaded, resolveImprovePolicyState(loaded, source));
  exposed.selectedSonataSetIds.push('sonata-3');
  assert.deepEqual(loaded.selectedSonataSetIds, ['sonata-999', 'sonata-20']);
  const failure = { ...storage, setItem: () => { throw new Error('write blocked'); } };
  const original = raw;
  assert.throws(() => persistImprovePolicyState(store, select(loaded, 'sonata-3'), failure));
  assert.equal(raw, original);
});

test('summaries reflect effective ordered rows after moves without changing minima or count', () => {
  let state = initial();
  const view = () => echoPolicyPresentation(state, source, SUBSTAT_TYPES);
  assert.equal(echoSelectionSummary(view().layout.every), 'CR · CD');
  assert.equal(echoSelectionSummary(view().layout.flex), 'ATK% · HA DMG · ER · Flat ATK');
  const minimum = view().policy.requirements.value.requiredOnEveryEcho[0].minimum;
  const count = view().flexCount.count;
  state = moveEchoStat(state, source, SUBSTAT_TYPES, 'CRIT Rate', 'flex');
  assert.equal(echoSelectionSummary(view().layout.every), 'CD');
  assert.equal(echoSelectionSummary(view().layout.flex), 'ATK% · HA DMG · ER · Flat ATK · CR');
  assert.equal(view().policy.preferences.value.find(row => row.stat === 'CRIT Rate').minimum, minimum);
  assert.equal(view().flexCount.count, count);
  state = moveEchoStat(state, source, SUBSTAT_TYPES, 'Energy Regen', 'flex', 0);
  assert.ok(echoSelectionSummary(view().layout.flex).startsWith('ER · '));
  state = moveEchoStat(state, source, SUBSTAT_TYPES, 'CRIT Rate', 'other');
  assert.ok(!echoSelectionSummary(view().layout.flex).includes('CR'));
});
