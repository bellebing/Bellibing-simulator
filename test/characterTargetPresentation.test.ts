import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { characterTargetPresentation, formatCharacterReference, projectCharacterTargetPresentation,
  projectCharacterTargetPresentations } from '../src/characterTargetPresentation.ts';
import { projectRecommendedCharacterStats } from '../src/characterRecommendationSources.ts';
import { projectDprCharacterStatReferences } from '../src/dprCharacterStatReferences.ts';
import type { DprCharacterReferenceProfile } from '../src/dprCharacterStatReferences.ts';
import { projectDprCalcScenarioReferences } from '../src/dprLegacyStatReferences.ts';

const pending = (characterId: string) => ({ characterId, sourceReviewStatus: 'PENDING' as const, rows: [] });
const augusta = await projectCharacterTargetPresentation('augusta');
const hsin = await projectDprCharacterStatReferences('hsin');
const row = (metric: string) => augusta.rows.find(row => row.metric === metric)!;

test('Augusta canonical primary preserves all seven original reviewed wordings and source semantics', () => {
  assert.deepEqual(augusta.rows.slice(0, 7).map(row => row.displayValue),
    ['14500+', '1100+', '2000-2800+', '65-80%+', '210-260%+', '116%-125%', '40-70%+']);
  assert.ok(augusta.rows.slice(0, 7).every(row => row.primary?.family === 'CANONICAL'));
  assert.deepEqual(row('TOTAL_ATK').primary?.value, { kind: 'OPEN_ENDED_BAND', minimum: 2000, upperReference: 2800 });
});

test('Augusta overlapping DPR General/Calc are supplemental independent references, never averaged', () => {
  assert.equal(row('TOTAL_CRIT_RATE').secondaryDisplay, 'DPR 78.7% · Calc 84.7%');
  assert.equal(row('TOTAL_ATK').secondaryDisplay, 'DPR 2,269 · Calc 2,407');
  assert.equal(row('TOTAL_ATK').dprGeneral, 2268.6679999999997);
  assert.equal(row('TOTAL_ATK').dprCalc, 2406.536);
  assert.equal(row('TOTAL_HP').secondaryDisplay, null);
  assert.equal(row('TOTAL_DEF').dprGeneral, null);
});

test('Augusta gains DPR-only Heavy Attack DMG without changing Customize metric truth', () => {
  assert.equal(augusta.rows.length, 8);
  assert.equal(row('HEAVY_ATTACK_DMG_BONUS').displayValue, '21.3%');
  assert.equal(row('HEAVY_ATTACK_DMG_BONUS').secondaryDisplay, 'Calc 29.2%');
  assert.deepEqual(row('HEAVY_ATTACK_DMG_BONUS').primary,
    { family: 'DPR_GENERAL', value: { kind: 'REFERENCE', role: 'GENERAL_RECOMMENDATION', reference: .21299999999999997 } });
});

test('DPR points round for display while exact values and original projections remain unchanged', () => {
  const before = JSON.stringify(hsin);
  const view = characterTargetPresentation('hsin', pending('hsin'), hsin);
  const atk = view.rows.find(row => row.metric === 'TOTAL_ATK')!;
  assert.equal(atk.displayValue, '2,311'); assert.equal(atk.secondaryDisplay, 'Calc 2,482');
  assert.equal(atk.dprGeneral, 2311.166); assert.equal(atk.dprCalc, 2481.552);
  assert.equal(JSON.stringify(hsin), before);
});

test('ratio formatting uses percent, no meaningless trailing zeros, and suppresses float artifacts', () => {
  for (const [number, display] of [[.688, '68.8%'], [2.57, '257%'], [1.08, '108%'],
    [0, '0%'], [.09299999999999999, '9.3%']] as const) assert.equal(formatCharacterReference(number, 'RATIO'), display);
});

test('only exactly one DEFAULT profile can automatically feed DPR presentation', () => {
  for (const profiles of [[], hsin.map(profile => ({ ...profile, variantKey: 'VARIANT' })), [...hsin, ...hsin]]) {
    assert.deepEqual(characterTargetPresentation('hsin', pending('hsin'), profiles).rows, []);
  }
  assert.equal(characterTargetPresentation('hsin', pending('hsin'), hsin).status, 'READY');
});

for (const id of ['aemeath', 'qiuyuan', 'iuno']) test(id + ' variant-only modern references remain overall Pending', async () => {
  assert.ok((await projectDprCharacterStatReferences(id)).length > 0);
  assert.deepEqual(await projectCharacterTargetPresentation(id), { characterId: id, status: 'PENDING', rows: [] });
});

test('Galbrena uses DEFAULT even with the WIP profile first', async () => {
  const profiles = await projectDprCharacterStatReferences('galbrena');
  assert.equal(profiles.length, 2);
  assert.deepEqual(characterTargetPresentation('galbrena', pending('galbrena'), profiles.toReversed()),
    characterTargetPresentation('galbrena', pending('galbrena'), profiles.filter(p => p.variantKey === 'DEFAULT')));
});

test('Brant legacy scenarios never become automatic recommendations', async () => {
  assert.equal((await projectDprCalcScenarioReferences('brant')).length, 12);
  assert.deepEqual((await projectCharacterTargetPresentation('brant')).rows, []);
});

test('Suoming explicit blank General rows remain source-backed Pending with no invented Calc', async () => {
  const view = await projectCharacterTargetPresentation('suoming');
  assert.equal(view.status, 'PENDING'); assert.equal(view.rows.length, 5);
  assert.ok(view.rows.every(row => row.displayValue === 'Pending' && row.primary === null && row.secondaryDisplay === null));
});

test('no-source Characters have no fabricated universal rows', async () => {
  for (const id of ['chixia', 'rover-aero', 'not-a-character'])
    assert.deepEqual(await projectCharacterTargetPresentation(id), { characterId: id, status: 'PENDING', rows: [] });
});

function editHsin(change: (profile: DprCharacterReferenceProfile) => DprCharacterReferenceProfile) {
  return characterTargetPresentation('hsin', pending('hsin'), hsin.map(change));
}

test('Calc alone never creates a primary; blank General cannot promote verified Calc', () => {
  const calcOnly = editHsin(profile => ({ ...profile, rows: profile.rows.filter(row => row.sectionRole === 'CALC_BENCHMARK') }));
  assert.deepEqual(calcOnly.rows, []);
  const blank = editHsin(profile => ({ ...profile, rows: profile.rows.map(row => row.sectionRole === 'GENERAL_RECOMMENDATION'
    ? { ...row, status: 'PENDING', value: null } : row) }));
  assert.ok(blank.rows.every(row => row.status === 'PENDING' && row.secondaryDisplay === null && row.dprCalc === null));
});

test('verified General without Calc remains primary and rows pair by metric independent of source order', () => {
  const general = editHsin(profile => ({ ...profile, rows: profile.rows.filter(row => row.sectionRole === 'GENERAL_RECOMMENDATION') }));
  assert.ok(general.rows.every(row => row.status === 'READY' && row.secondaryDisplay === null));
  assert.deepEqual(editHsin(profile => ({ ...profile, rows: profile.rows.toReversed() })),
    characterTargetPresentation('hsin', pending('hsin'), hsin));
});

test('duplicate or mismatched DPR role/unit/identity rows fail closed for their pairing', () => {
  const original = hsin[0]!.rows[0]!;
  for (const changed of [{ ...original, unit: 'POINTS' as const }, { ...original, characterId: 'wrong' },
    { ...original, value: { kind: 'REFERENCE' as const, role: 'CALC_BENCHMARK' as const, reference: 999 } }]) {
    const view = editHsin(profile => ({ ...profile, rows: profile.rows.map(row => row === original ? changed : row) }));
    const affected = view.rows.find(row => row.metric === original.metric)!;
    assert.equal(affected.status, 'PENDING'); assert.equal(affected.secondaryDisplay, null);
  }
  const duplicate = editHsin(profile => ({ ...profile, rows: [...profile.rows, original] }));
  assert.equal(duplicate.rows.find(row => row.metric === original.metric)!.status, 'PENDING');
});

test('drifted canonical source and DPR profile cannot display unreviewed values', async () => {
  const canonical = await projectRecommendedCharacterStats('augusta');
  assert.deepEqual(characterTargetPresentation('augusta', { ...canonical, sourceReviewStatus: 'REVIEW_REQUIRED' }, []).rows, []);
  assert.deepEqual(editHsin(profile => ({ ...profile, sourceReviewStatus: 'REVIEW_REQUIRED' })).rows, []);
});

test('generated browser data has strict source parity and detached UI output', async () => {
  const { CHARACTER_TARGET_PRESENTATIONS } = await import('../docs/ui-prototypes/assets/improve-settings/character-targets.mjs');
  assert.deepEqual(CHARACTER_TARGET_PRESENTATIONS, await projectCharacterTargetPresentations());
  const { recommendedCharacterStatsPresentation } = await import('../docs/ui-prototypes/assets/character-target-presentation.js');
  assert.deepEqual(recommendedCharacterStatsPresentation('augusta'), augusta.rows);
  const copy = recommendedCharacterStatsPresentation('augusta'); copy[0].displayValue = 'mutation';
  assert.equal(recommendedCharacterStatsPresentation('augusta')[0].displayValue, '14500+');
});
