import { publicImproveSettingsSource } from '../src/publicImproveSettingsSource.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { projectRecommendedImprovePolicy, projectReleasedImprovePolicies } from '../src/improvePolicySources.ts';
import { createImprovePolicyState, resolveImprovePolicyState, updateImprovePolicyState } from '../src/improvePolicyState.ts';
import { IMPROVE_TARGET_METRICS, improveTargetInput, parseImproveTarget, improveRelevantStats,
  editImproveTarget, assignImproveEchoStat, reorderImprovePreferences } from '../src/improvePolicyPresentation.ts';
const source = await projectRecommendedImprovePolicy({ characterId: 'augusta' });
const generic = await projectRecommendedImprovePolicy({ characterId: 'chixia' });
const genericInitial = () => createImprovePolicyState('chixia', generic);
const initial = () => createImprovePolicyState('augusta', source);

test('browser reviewed policy export has exact source parity and legacy recovery modules remain intact', async () => {
  const file = JSON.parse(readFileSync('docs/ui-prototypes/assets/improve-settings/policies.json', 'utf8'));
  assert.equal(file.schemaVersion, 1); assert.deepEqual(file.characters, (await projectReleasedImprovePolicies()).map(publicImproveSettingsSource));
  assert.equal(readFileSync('docs/ui-prototypes/assets/improve-settings/state.mjs', 'utf8'), readFileSync('src/improveSimpleSettings.mjs', 'utf8'));
});
test('percentage and point targets round-trip as canonical values with user basis and Pending comparison', () => {
  for (const spec of IMPROVE_TARGET_METRICS) {
    const target = parseImproveTarget(spec.metric, spec.unit === 'RATIO' ? '116' : '1800', spec.unit === 'RATIO' ? '125' : '2000');
    assert.equal(target.minimum, spec.unit === 'RATIO' ? 1.16 : 1800);
    assert.equal(target.preferred, spec.unit === 'RATIO' ? 1.25 : 2000);
    assert.equal(target.basis.kind, 'USER_DEFINED'); assert.equal(target.basis.comparisonStatus, 'PENDING');
    assert.deepEqual(parseImproveTarget(spec.metric, improveTargetInput(target, target.minimum), improveTargetInput(target, target.preferred!)), target);
  }
  assert.equal(parseImproveTarget('TOTAL_CRIT_RATE', '9.3', '').minimum, .093);
  assert.equal(parseImproveTarget('TOTAL_HP', '0', '').minimum, 0);
  for (const [min, pref] of [['', ''], ['-1', ''], ['Infinity', ''], ['NaN', ''], ['116', '115'], ['1e309', ''], ['1abc', '']]) assert.throws(() => parseImproveTarget('TOTAL_ENERGY_REGEN', min, pref));
});
test('first numeric customization copies effective values as user-owned without mutating source', () => {
  const before = structuredClone(source), target = parseImproveTarget('TOTAL_ATK', '1800', '');
  const state = editImproveTarget(initial(), source, 'TOTAL_ATK', target);
  assert.equal(state.mode, 'MANUAL'); assert.equal(state.overrides.numericTargets?.length, 2);
  assert.ok(state.overrides.numericTargets?.every(row => row.basis.kind === 'USER_DEFINED'));
  assert.equal(resolveImprovePolicyState(state, source).policy.characterTarget.numericTargets.status, 'USER_DEFINED');
  assert.equal(source.characterTarget.numericTargets.value?.[0].basis.kind, 'SOURCE_DESCRIBED');
  assert.deepEqual(source, before); assert.equal(state.overrides.priorities, undefined);
});
test('source-described saved numeric overrides require review instead of being mislabeled Custom source data', () => {
  const saved = { ...initial(), mode: 'MANUAL', overrides: { numericTargets: source.characterTarget.numericTargets.value! } } as const;
  const result = resolveImprovePolicyState(saved, source);
  assert.equal(result.policy.characterTarget.numericTargets.status, 'PENDING'); assert.equal(result.compatibility.status, 'REVIEW_REQUIRED');
  assert.deepEqual(saved.overrides.numericTargets, source.characterTarget.numericTargets.value);
  assert.throws(() => updateImprovePolicyState(initial(), { type: 'set', section: 'numericTargets', value: source.characterTarget.numericTargets.value! }, source));
});
test('relevant pool contains reviewed Character stats only; priority-only policy never creates Echo requirements', async () => {
  assert.deepEqual(improveRelevantStats(source), ['Energy Regen', 'CRIT Rate', 'CRIT DMG', 'ATK%', 'Heavy Attack DMG']);
  assert.ok(!improveRelevantStats(source).includes('HP%'));
  const other = await projectRecommendedImprovePolicy({ characterId: 'chixia' });
  assert.ok(improveRelevantStats(other).length > 0); assert.equal(other.echoPolicy.requirements.status, 'PENDING');
  const pending = await projectRecommendedImprovePolicy({ characterId: 'baizhi' }); assert.deepEqual(improveRelevantStats(pending), []);
});
test('first requirement edit creates only user intent and adds no inferred minimum', () => {
  const original = structuredClone(generic);
  const state = assignImproveEchoStat(genericInitial(), generic, 'CRIT Rate', 'REQUIRED');
  assert.equal(state.mode, 'MANUAL'); assert.equal(state.overrides.echoPreferences, undefined);
  assert.deepEqual(state.overrides.echoRequirements?.groups, []);
  assert.deepEqual(state.overrides.echoRequirements?.requiredOnEveryEcho.at(-1), { stat: 'CRIT Rate' });
  assert.equal(state.overrides.numericTargets, undefined); assert.deepEqual(generic, original);
});
test('manual requirements with no reviewed base use explicit user requirements and no fabricated constraints', async () => {
  const other = await projectRecommendedImprovePolicy({ characterId: 'chixia' }), name = improveRelevantStats(other)[0]!;
  const state = assignImproveEchoStat(createImprovePolicyState('chixia', other), other, name, 'REQUIRED');
  assert.deepEqual(state.overrides.echoRequirements, { requiredOnEveryEcho: [{ stat: name }], groups: [] });
  assert.equal(resolveImprovePolicyState(state, other).policy.echoPolicy.requirements.status, 'USER_DEFINED');
});
test('preferences edit independently, moving a requirement preserves combination semantics and removing last is explicit empty', () => {
  let state = assignImproveEchoStat(genericInitial(), generic, 'ATK%', 'PREFERRED');
  assert.equal(state.overrides.echoRequirements, undefined);
  state = assignImproveEchoStat(state, generic, 'CRIT Rate', 'PREFERRED');
  assert.ok(!state.overrides.echoRequirements?.requiredOnEveryEcho.some(row => row.stat === 'CRIT Rate'));
  assert.equal(state.overrides.echoRequirements, undefined);
  state = assignImproveEchoStat(state, generic, 'ATK%', 'AVAILABLE'); state = assignImproveEchoStat(state, generic, 'CRIT Rate', 'AVAILABLE');
  assert.deepEqual(state.overrides.echoPreferences, []);
  assert.equal(resolveImprovePolicyState(state, generic).policy.echoPolicy.preferences.content, 'EXPLICITLY_EMPTY');
});
test('manual preference reorder gives explicit order only; clear restores inheritance and preserves unrelated settings', () => {
  let state = assignImproveEchoStat(genericInitial(), generic, 'ATK%', 'PREFERRED');
  state = assignImproveEchoStat(state, generic, 'Energy Regen', 'PREFERRED');
  state = reorderImprovePreferences(state, generic, 'Energy Regen', 0);
  assert.deepEqual(state.overrides.echoPreferences, [{ stat: 'Energy Regen', priorityGroup: 1 }, { stat: 'ATK%', priorityGroup: 2 }]);
  assert.equal(state.overrides.echoRequirements, undefined); assert.equal(state.overrides.priorities, undefined);
  const cleared = updateImprovePolicyState(state, { type: 'clear', section: 'echoPreferences' }, generic);
  assert.equal(resolveImprovePolicyState(cleared, generic).policy.echoPolicy.preferences.status, 'PENDING');
  assert.deepEqual(reorderImprovePreferences(state, generic, 'ATK%', 99), state);
});
test('out-of-pool assignment and suspended sections cannot overwrite retained intent', () => {
  assert.throws(() => assignImproveEchoStat(initial(), source, 'HP%', 'PREFERRED'), /pool/);
  const state = { ...initial(), mode: 'MANUAL', contextBinding: 'different', overrides: { echoPreferences: [{ stat: 'CRIT Rate', priorityGroup: 1 }] } } as const;
  const saved = structuredClone(state);
  assert.throws(() => assignImproveEchoStat(state, source, 'ATK%', 'PREFERRED'), /review/);
  assert.deepEqual(state, saved);
});
