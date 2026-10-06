import test from 'node:test';
import assert from 'node:assert/strict';
import { characterTargetPresentation, formatCharacterReference, projectCharacterTargetPresentation,
  projectCharacterTargetPresentations } from '../src/characterTargetPresentation.ts';
import { projectRecommendedCharacterStats } from '../src/characterRecommendationSources.ts';
import { projectDprCharacterStatReferences } from '../src/dprCharacterStatReferences.ts';
import type { DprCharacterReferenceProfile } from '../src/dprCharacterStatReferences.ts';
import { projectDprCalcScenarioReferences } from '../src/dprLegacyStatReferences.ts';

const augusta = await projectCharacterTargetPresentation('augusta');
const hsin = await projectDprCharacterStatReferences('hsin');

test('Augusta contains exactly five Calc-basis rows, without Prydwen cross-fill', () => {
  assert.deepEqual(augusta.rows.map(row => row.metric), ['TOTAL_ATK', 'TOTAL_CRIT_RATE', 'TOTAL_CRIT_DAMAGE',
    'TOTAL_ENERGY_REGEN', 'HEAVY_ATTACK_DMG_BONUS']);
  assert.equal(augusta.status, 'READY');
  assert.ok(augusta.rows.every(row => row.sourceValue?.role === 'CALC_BENCHMARK'));
});

for (const [metric, reference, display] of [
  ['TOTAL_ATK', 2406.536, '2,407'], ['TOTAL_CRIT_RATE', .847, '84.7%'],
  ['TOTAL_CRIT_DAMAGE', 2.25, '225%'], ['TOTAL_ENERGY_REGEN', 1.2, '120%'],
  ['HEAVY_ATTACK_DMG_BONUS', .292, '29.2%'],
] as const) test('Augusta ' + metric + ' formats the exact Calc reference only', () => {
  const row = augusta.rows.find(row => row.metric === metric)!;
  assert.equal(row.displayValue, display);
  assert.deepEqual(row.sourceValue, { kind: 'REFERENCE', role: 'CALC_BENCHMARK', reference });
});

test('visible presentation has no canonical/General/secondary fields or source comparison text', () => {
  for (const row of augusta.rows) {
    assert.ok(!Object.hasOwn(row, 'primary') && !Object.hasOwn(row, 'dprGeneral') && !Object.hasOwn(row, 'secondaryDisplay'));
    assert.doesNotMatch(row.displayValue, /DPR|Calc|Prydwen|[+·]/);
  }
  assert.deepEqual(augusta.rows.map(row => row.displayValue), ['2,407', '84.7%', '225%', '120%', '29.2%']);
});

test('Prydwen and General remain unchanged reviewed source evidence underneath', async () => {
  const canonical = await projectRecommendedCharacterStats('augusta');
  const profiles = await projectDprCharacterStatReferences('augusta');
  const before = JSON.stringify(profiles);
  assert.equal(canonical.sourceReviewStatus, 'CURRENT');
  assert.equal(canonical.rows.length, 7); assert.ok(canonical.rows.every(row => row.status === 'VERIFIED'));
  assert.equal(canonical.rows.find(row => row.metric === 'TOTAL_HP')!.evidence[0]!.originalText, '14500+');
  assert.equal(profiles[0]!.rows.find(row => row.sectionRole === 'GENERAL_RECOMMENDATION' && row.metric === 'TOTAL_CRIT_RATE')!.value!.reference, .7869999999999999);
  assert.deepEqual(characterTargetPresentation('augusta', profiles), augusta);
  assert.equal(JSON.stringify(profiles), before);
});

test('DPR point display rounding never mutates exact Calc values or source projections', () => {
  const before = JSON.stringify(hsin);
  const view = characterTargetPresentation('hsin', hsin);
  const atk = view.rows.find(row => row.metric === 'TOTAL_ATK')!;
  assert.equal(atk.displayValue, '2,482'); assert.equal(atk.sourceValue!.reference, 2481.552);
  assert.equal(JSON.stringify(hsin), before);
});

test('ratio formatting uses percent without trailing zeros or binary float artifacts', () => {
  for (const [number, display] of [[.847, '84.7%'], [2.25, '225%'], [1.2, '120%'], [.292, '29.2%'],
    [0, '0%'], [.09299999999999999, '9.3%']] as const) assert.equal(formatCharacterReference(number, 'RATIO'), display);
});

test('exactly one DEFAULT is required; zero/multiple DEFAULT profiles fail closed', () => {
  for (const profiles of [[], hsin.map(profile => ({ ...profile, variantKey: 'VARIANT' })), [...hsin, ...hsin]]) {
    assert.deepEqual(characterTargetPresentation('hsin', profiles).rows, []);
  }
  assert.equal(characterTargetPresentation('hsin', hsin).status, 'READY');
});

for (const id of ['aemeath', 'qiuyuan', 'iuno']) test(id + ' variant-only modern references stay Pending', async () => {
  assert.ok((await projectDprCharacterStatReferences(id)).length > 0);
  assert.deepEqual(await projectCharacterTargetPresentation(id), { characterId: id, status: 'PENDING', rows: [] });
});

test('Galbrena uses DEFAULT Calc even with the WIP profile first', async () => {
  const profiles = await projectDprCharacterStatReferences('galbrena');
  assert.equal(profiles.length, 2);
  const view = characterTargetPresentation('galbrena', profiles.toReversed());
  const defaultCalc = profiles.find(p => p.variantKey === 'DEFAULT')!.rows.filter(row => row.sectionRole === 'CALC_BENCHMARK');
  assert.equal(view.rows.length, defaultCalc.length);
  for (const row of view.rows) assert.equal(row.sourceValue!.reference, defaultCalc.find(calc => calc.metric === row.metric)!.value!.reference);
});

test('Brant legacy scenarios remain preserved but do not feed automatic Character Target', async () => {
  assert.equal((await projectDprCalcScenarioReferences('brant')).length, 12);
  assert.deepEqual((await projectCharacterTargetPresentation('brant')).rows, []);
});

test('Suoming explicitly blank Calc rows remain Pending without invented values', async () => {
  const view = await projectCharacterTargetPresentation('suoming');
  assert.equal(view.status, 'PENDING'); assert.equal(view.rows.length, 5);
  assert.ok(view.rows.every(row => row.status === 'PENDING' && row.displayValue === 'Pending' && row.sourceValue === null));
});

test('no-modern-source Characters have no fabricated universal rows', async () => {
  for (const id of ['chixia', 'rover-aero', 'not-a-character'])
    assert.deepEqual(await projectCharacterTargetPresentation(id), { characterId: id, status: 'PENDING', rows: [] });
});

function editHsin(change: (profile: DprCharacterReferenceProfile) => DprCharacterReferenceProfile) {
  return characterTargetPresentation('hsin', hsin.map(change));
}

test('Calc supplies the visible basis independently of General availability', () => {
  const calcOnly = editHsin(profile => ({ ...profile, rows: profile.rows.filter(row => row.sectionRole === 'CALC_BENCHMARK') }));
  assert.deepEqual(calcOnly, characterTargetPresentation('hsin', hsin));
  const blankGeneral = editHsin(profile => ({ ...profile, rows: profile.rows.map(row => row.sectionRole === 'GENERAL_RECOMMENDATION'
    ? { ...row, status: 'PENDING', value: null } : row) }));
  assert.deepEqual(blankGeneral, calcOnly);
});

test('General-only source never fills absent Calc metrics; blank Calc never falls back to General', () => {
  const generalOnly = editHsin(profile => ({ ...profile, rows: profile.rows.filter(row => row.sectionRole === 'GENERAL_RECOMMENDATION') }));
  assert.deepEqual(generalOnly.rows, []);
  const blankCalc = editHsin(profile => ({ ...profile, rows: profile.rows.map(row => row.sectionRole === 'CALC_BENCHMARK'
    ? { ...row, status: 'PENDING', value: null } : row) }));
  assert.ok(blankCalc.rows.every(row => row.status === 'PENDING' && row.sourceValue === null));
});

test('missing Augusta Calc stat is absent rather than filled from preserved Prydwen or General', async () => {
  const profiles = await projectDprCharacterStatReferences('augusta');
  const view = characterTargetPresentation('augusta', profiles.map(profile => ({ ...profile,
    rows: profile.rows.filter(row => !(row.metric === 'TOTAL_ATK' && row.sectionRole === 'CALC_BENCHMARK')) })));
  assert.equal(view.rows.length, 4);
  assert.ok(!view.rows.some(row => row.metric === 'TOTAL_ATK'));
});

test('typed metric ordering ignores source row order', () => {
  assert.deepEqual(editHsin(profile => ({ ...profile, rows: profile.rows.toReversed() })), characterTargetPresentation('hsin', hsin));
});

test('duplicate or mismatched Calc role/unit/identity fails closed for the affected metric', () => {
  const original = hsin[0]!.rows.find(row => row.sectionRole === 'CALC_BENCHMARK')!;
  for (const changed of [{ ...original, unit: 'POINTS' as const }, { ...original, characterId: 'wrong' },
    { ...original, variantKey: 'VARIANT' }, { ...original, sheetId: -1 },
    { ...original, value: { kind: 'REFERENCE' as const, role: 'GENERAL_RECOMMENDATION' as const, reference: 999 } }]) {
    const view = editHsin(profile => ({ ...profile, rows: profile.rows.map(row => row === original ? changed : row) }));
    assert.equal(view.rows.find(row => row.metric === original.metric)!.status, 'PENDING');
  }
  const duplicate = editHsin(profile => ({ ...profile, rows: [...profile.rows, original] }));
  assert.equal(duplicate.rows.find(row => row.metric === original.metric)!.status, 'PENDING');
});

test('unverified or nonfinite Calc values and drifted source profile stay closed', () => {
  for (const status of ['PENDING', 'REVIEW_REQUIRED'] as const) {
    const view = editHsin(profile => ({ ...profile, rows: profile.rows.map(row => ({ ...row, status })) }));
    assert.ok(view.rows.every(row => row.status === 'PENDING' && row.sourceValue === null));
  }
  assert.deepEqual(editHsin(profile => ({ ...profile, sourceReviewStatus: 'REVIEW_REQUIRED' })).rows, []);
  const invalid = editHsin(profile => ({ ...profile, rows: profile.rows.map(row => row.value
    ? { ...row, value: { ...row.value, reference: Infinity } } : row) }));
  assert.ok(invalid.rows.every(row => row.status === 'PENDING'));
});

test('generated browser data exactly matches Calc-only source presentation and returns detached rows', async () => {
  const { CHARACTER_TARGET_PRESENTATIONS } = await import('../docs/ui-prototypes/assets/improve-settings/character-targets.mjs');
  assert.deepEqual(CHARACTER_TARGET_PRESENTATIONS, await projectCharacterTargetPresentations());
  const { recommendedCharacterStatsPresentation } = await import('../docs/ui-prototypes/assets/character-target-presentation.js');
  assert.deepEqual(recommendedCharacterStatsPresentation('augusta'), augusta.rows);
  const copy = recommendedCharacterStatsPresentation('augusta'); copy[0].displayValue = 'mutation'; copy[0].sourceValue.reference = 0;
  assert.equal(recommendedCharacterStatsPresentation('augusta')[0].displayValue, '2,407');
  assert.equal(recommendedCharacterStatsPresentation('augusta')[0].sourceValue.reference, 2406.536);
});

test('released Target coverage follows the same safe DEFAULT Calc source policy after catalog refresh', async () => {
  const { CHARACTER_CATALOG } = await import('../src/data/characters.ts');
  const views = await projectCharacterTargetPresentations();
  const readyIds = new Set(views.filter(view => view.status === 'READY').map(view => view.characterId));
  assert.equal(readyIds.size, 19);
  assert.equal(CHARACTER_CATALOG.filter(row => row.releaseStatus === 'RELEASED' && readyIds.has(row.id)).length, 19);
  for (const id of ['hsin', 'jingran']) {
    const view = await projectCharacterTargetPresentation(id);
    const profiles = await projectDprCharacterStatReferences(id);
    assert.equal(view.status, 'READY');
    assert.deepEqual(view, characterTargetPresentation(id, profiles));
    assert.ok(view.rows.every(row => row.sourceValue?.role === 'CALC_BENCHMARK'));
  }
});
