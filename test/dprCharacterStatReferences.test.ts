import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { DPR_CHARACTER_STAT_EXTRACTION as data } from '../src/data/dprCharacterStatReferences.ts';
import { DPR_CHARACTER_STAT_REFERENCE_REVIEW as review } from '../src/data/dprCharacterStatReferenceReview.ts';
import { extractDprCharacterStatReferences, dprSemanticBinding, mapDprCharacterTab, typeDprStatLabel } from '../src/dprCharacterStatExtraction.ts';
import type { NativeDprSnapshot, DprExtraction } from '../src/dprCharacterStatExtraction.ts';
import { captureDprNativeSource } from '../src/dprNativeSourceCapture.ts';
import { projectDprCharacterStatReferences } from '../src/dprCharacterStatReferences.ts';
import { projectRecommendedCharacterStats } from '../src/characterRecommendationSources.ts';

const snapshot: NativeDprSnapshot = JSON.parse(readFileSync(new URL('../data/research/dpr-calc-native-source-snapshot-2026-10-03.json',import.meta.url),'utf8'));
const clone = () => structuredClone(snapshot);

test('every captured current tab including hidden tabs is enumerated; explicit sections determine discovery', async () => {
  const extraction = await extractDprCharacterStatReferences(snapshot);
  assert.deepEqual(extraction.sheetInventory.map(s=>[s.sheetId,s.sheetTitle]).sort(),
    snapshot.sheets.map(s=>[s.sheetId,s.sheetTitle]).sort());
  assert.equal(extraction.counts.discoveredSheetCount,snapshot.sheets.length);
  assert.equal(extraction.counts.characterSourceSheetCount,snapshot.sheets.filter(s=>s.sections.length).length);
  assert.equal(extraction.sheetInventory.flatMap(s=>s.sectionHeaders).length,snapshot.sheets.flatMap(s=>s.sections).length);
  assert.ok(snapshot.sheets.every(s=>/^A1:[A-Z]+[0-9]+$/.test(s.scanRange)));
  assert.ok(snapshot.sheets.some(s=>s.hidden && s.sections.length));
  assert.ok(snapshot.sheets.some(s=>s.sheetTitle === 'Jinhsi (WIP)' && !s.sections.length));
  for(const s of snapshot.sheets.filter(s=>s.sections.length)) {
    assert.ok(mapDprCharacterTab(s.sheetTitle),s.sheetTitle);
    assert.ok(extraction.rows.some(r=>r.sheetId === s.sheetId),s.sheetTitle);
  }
  assert.deepEqual(extraction.issues,[]);
});

test('the entire reviewed mapped inventory projects numeric rows VERIFIED and blanks Pending without losing profiles', async () => {
  const characters=[...new Set(data.rows.map(r=>r.characterId))];
  const profiles=(await Promise.all(characters.map(id=>projectDprCharacterStatReferences(id)))).flat();
  const rows=profiles.flatMap(p=>p.rows);
  assert.equal(profiles.length,data.counts.characterVariantCount);
  assert.equal(rows.filter(r=>r.status === 'VERIFIED').length,data.counts.mappedNumericRows);
  assert.equal(rows.filter(r=>r.status === 'PENDING').length,data.counts.unavailableRows);
  assert.equal(rows.filter(r=>r.status === 'REVIEW_REQUIRED').length,0);
  assert.ok(profiles.every(p=>p.sourceFamily === 'DPR_CALC' && p.sourceClass === 'USER_APPROVED_PROJECT_SOURCE'));
  assert.ok(rows.every(r=>r.comparisonStatus === 'PENDING'));
});

test('full native capture discovers sections anywhere in the grid and never interprets helper numbers', async () => {
  const native = {spreadsheetId:snapshot.spreadsheetId,properties:{title:snapshot.spreadsheetTitle},sheets:[
    {properties:{sheetId:100,title:'Hsin (WIP)',hidden:true,gridProperties:{rowCount:900,columnCount:40}},
      data:[{startRow:600,startColumn:30,rowData:[
        {values:[{effectiveValue:{stringValue:'General Stat Recommendation'}}]},
        {values:[{effectiveValue:{stringValue:'Stat'}},{effectiveValue:{stringValue:'Value'}}]},
        {values:[{effectiveValue:{stringValue:'Crit Rate'}},{effectiveValue:{numberValue:.688},formattedValue:'68.80%'}]},
      ]}]},
    {properties:{sheetId:101,title:'Readme',gridProperties:{rowCount:30,columnCount:3}},
      data:[{rowData:[{values:[{effectiveValue:{numberValue:999}}]}]}]},
  ]};
  const extracted = await extractDprCharacterStatReferences(captureDprNativeSource(native,'2026-10-03'));
  assert.equal(extracted.counts.discoveredSheetCount,2);
  assert.equal(extracted.counts.characterSourceSheetCount,1);
  assert.equal(extracted.rows[0]!.valueCell,'AF603');
  assert.equal(extracted.rows[0]!.characterId,'hsin');
});

test('unmapped tabs fail closed individually without losing independently mapped references', async () => {
  const next = clone() as any;
  next.sheets.push({...structuredClone(next.sheets.find((s:any)=>s.sheetTitle === 'Hsin (WIP)')),sheetId:999,title:undefined,sheetTitle:'Unknown future MDPS'});
  const extraction = await extractDprCharacterStatReferences(next);
  assert.equal(extraction.issues.length,1);
  assert.match(extraction.issues[0]!.reason,/Unmapped Character/);
  assert.ok(!extraction.rows.some(r=>r.sheetId === 999));
  assert.equal(extraction.rows.length,data.rows.length);
});

test('General and Calc preserve separate exact Hsin numeric roles with no target/minimum/preferred inference', async () => {
  const [profile] = await projectDprCharacterStatReferences('hsin');
  assert.equal(profile!.sourceReviewStatus,'CURRENT');
  for (const [role,values] of [
    ['GENERAL_RECOMMENDATION',[.688,2.57,2311.166]],
    ['CALC_BENCHMARK',[.748,2.69,2481.552]],
  ] as const) {
    for (const [index,metric] of ['TOTAL_CRIT_RATE','TOTAL_CRIT_DAMAGE','TOTAL_ATK'].entries()) {
      const row = profile!.rows.find(r=>r.sectionRole === role && r.metric === metric)!;
      assert.deepEqual(row.value,{kind:'REFERENCE',role,reference:values[index]});
      assert.equal(row.status,'VERIFIED'); assert.equal(row.comparisonStatus,'PENDING');
      assert.ok(!('minimum' in row.value!)); assert.ok(!('preferred' in row.value!));
    }
  }
});

test('known aliases resolve against canonical roster; suffix context does not invent identities', () => {
  for(const [title,id] of Object.entries({Xuanling:'yangyang-xuanling',Luuk:'luuk-herssen',Cartethiya:'cartethyia',
    XLY:'xiangli-yao',Aerover:'rover-aero',Ciaconna:'ciaccona','Hsin (WIP)':'hsin'}))
    assert.deepEqual(mapDprCharacterTab(title),{characterId:id,variantKey:'DEFAULT'});
  assert.equal(mapDprCharacterTab('Hsin other unknown setup'),null);
});

test('mode and translation variants remain distinct even when only one variant currently has blocks', async () => {
  for(const [title,id,variant] of [
    ['Aemeath (Fusion Burst)','aemeath','FUSION_BURST'],['Aemeath (Rupture)','aemeath','RUPTURE'],
    ['Qiuyuan','qiuyuan','DEFAULT'],['Qiuyuan 2x Forte','qiuyuan','TWO_FORTE'],
    ['Qiuyuan MDPS(WIP EN TL)','qiuyuan','MDPS_WIP_EN_TL'],['Galbrena','galbrena','DEFAULT'],
    ['Galbrena (WIP EN TL)','galbrena','WIP_EN_TL'],['Iuno','iuno','DEFAULT'],['Iuno MDPS (WIP)','iuno','MDPS_WIP'],
  ]) assert.deepEqual(mapDprCharacterTab(title!),{characterId:id,variantKey:variant});
  assert.equal((await projectDprCharacterStatReferences('aemeath')).length,2);
  assert.equal((await projectDprCharacterStatReferences('galbrena')).length,2);
  assert.deepEqual((await projectDprCharacterStatReferences('qiuyuan')).map(p=>p.variantKey),['TWO_FORTE']);
});

test('blank native values remain unavailable/Pending without hiding source labels or metrics', async () => {
  const [profile] = await projectDprCharacterStatReferences('suoming');
  assert.equal(profile!.sourceReviewStatus,'PENDING');
  assert.ok(profile!.rows.length > 0);
  assert.ok(profile!.rows.every(r=>r.status === 'PENDING' && r.value === null && r.normalizedNumericValue === null));
  assert.ok(profile!.rows.every(r=>r.originalStatLabel && r.sourceRange && r.effectiveValue === null));
});

test('zero ER and values above 100 percent are preserved without source corrections', async () => {
  const [phrolova] = await projectDprCharacterStatReferences('phrolova');
  assert.ok(phrolova!.rows.filter(r=>r.metric === 'TOTAL_ENERGY_REGEN').every(r=>r.value?.reference === 0 && r.status === 'VERIFIED'));
  assert.ok(data.rows.some(r=>r.metric === 'TOTAL_CRIT_RATE' && r.normalizedNumericValue! > 1));
});

test('all observed metric labels are narrowly typed and parenthetical/original text remains intact', () => {
  for (const row of data.rows) {
    assert.equal(typeDprStatLabel(row.originalStatLabel).metric,row.metric);
    assert.equal(typeDprStatLabel(row.originalStatLabel).configurationContext,row.configurationContext);
  }
  assert.ok(data.rows.some(r=>r.originalStatLabel === 'BA DMG% '));
  assert.ok(data.rows.some(r=>r.configurationContext === '44111 CR/CD'));
  assert.ok(data.rows.some(r=>r.configurationContext === '3c ER'));
  assert.equal(typeDprStatLabel('Mystery stat').metric,null);
});

test('unknown metric labels and nonnumeric source values fail closed with reports', async () => {
  for(const mutation of ['label','value']) {
    const next = clone() as any;
    const row = next.sheets.find((s:any)=>s.sheetTitle === 'Hsin (WIP)').sections[0].rows[2];
    if(mutation === 'label') row.label.effectiveValue.stringValue='Unreviewed DMG%';
    else row.value.effectiveValue={stringValue:'Unknown'};
    const extraction = await extractDprCharacterStatReferences(next);
    assert.ok(extraction.issues.some(i=>i.sheetTitle === 'Hsin (WIP)'));
    const profiles = await projectDprCharacterStatReferences('hsin',{extraction});
    assert.equal(profiles[0]!.sourceReviewStatus,'REVIEW_REQUIRED');
    assert.ok(profiles[0]!.rows.every(r=>r.value === null));
  }
});

test('guidance stays source notes; native formulas, formatted/effective precision and import origin survive', async () => {
  assert.ok(data.rows.some(r=>r.sourceNotes.some(n=>n.text === 'Ignore BA DMG in Echo Mode')));
  assert.ok(data.rows.some(r=>r.sourceNotes.some(n=>n.text === 'Your goal is to get around 47000-50000 HP')));
  assert.ok(data.rows.every(r=>!r.originalStatLabel.startsWith('Your goal')));
  const hsin = data.rows.find(r=>r.characterId === 'hsin' && r.metric === 'RESONANCE_SKILL_DMG_BONUS')!;
  assert.equal(hsin.normalizedNumericValue,0.09299999999999999);
  assert.equal(hsin.formattedValue,'9.30%');
  assert.match(hsin.origin!.formula!,/^=IMPORTRANGE/);
  // Current reference cells are spilled IMPORTRANGE values; the formula is at A1.
  // A directly entered value formula must also survive when a source uses one.
  const next=clone() as any;
  const row=next.sheets.find((s:any)=>s.sheetTitle === 'Hsin (WIP)').sections[0].rows[2];
  row.value.userEnteredValue={formulaValue:'=0.688'};
  const extracted=await extractDprCharacterStatReferences(next);
  const formulaRow=extracted.rows.find(r=>r.characterId === 'hsin' && r.sectionRole === 'GENERAL_RECOMMENDATION' && r.metric === 'TOTAL_CRIT_RATE')!;
  assert.equal(formulaRow.formula,'=0.688');
  assert.equal(formulaRow.normalizedNumericValue,.688);
});

test('semantic hash and checked-in JSON/module reproduce deterministically including key/tab reorder', async () => {
  const regenerated = await extractDprCharacterStatReferences(snapshot);
  assert.deepEqual(regenerated,data);
  assert.deepEqual(regenerated,JSON.parse(readFileSync(new URL('../data/research/dpr-calc-character-stat-references-2026-10-03.json',import.meta.url),'utf8')));
  const next = clone() as any; next.sheets.reverse();
  assert.deepEqual(await extractDprCharacterStatReferences(next),data);
  const parity = spawnSync(process.execPath,['--experimental-strip-types','scripts/generate-dpr-character-stat-references.ts','--check'],{encoding:'utf8'});
  assert.equal(parity.status,0,parity.stderr);
});

test('changing relevant native cell precision, label, formula, notes, tab identity or context changes semantic hash', async () => {
  for(const field of ['number','label','formula','note','sheetId','title']) {
    const next = clone() as any; const s = next.sheets.find((s:any)=>s.sheetTitle === 'Hsin (WIP)');
    const r = s.sections[0].rows[2];
    if(field === 'number') r.value.effectiveValue.numberValue += 0.00000000001;
    if(field === 'label') r.label.effectiveValue.stringValue='Crit Rate (CR 4c)';
    if(field === 'formula') s.origin.userEnteredValue.formulaValue+=' ';
    if(field === 'note') r.value.note='New context';
    if(field === 'sheetId') s.sheetId=987;
    if(field === 'title') s.sheetTitle='Hsin';
    assert.notEqual((await extractDprCharacterStatReferences(next)).semanticSha256,data.semanticSha256,field);
  }
});

test('XLSX transport/archive metadata and historical raw hash are excluded from semantic source pin', async () => {
  const next = clone() as any;
  next.transport={xlsxSha256:'34bc7d94d03e15b85377b02827e707dcc5520ec3df41354d8622b77ea45620c2',zipTimestamp:'old'};
  const first = await extractDprCharacterStatReferences(next);
  next.transport.xlsxSha256='completely different archive bytes'; next.transport.zipTimestamp='new';
  next.extractionDate='2026-10-04';
  const second=await extractDprCharacterStatReferences(next);
  assert.equal(first.semanticSha256,second.semanticSha256);
  assert.equal(second.semanticSha256,data.semanticSha256);
});

test('review pin rejects actual drift, missing approval or any other source class', async () => {
  const extraction = structuredClone(data) as unknown as DprExtraction;
  (extraction.rows[0] as any).normalizedNumericValue=999;
  for(const dependencies of [
    {extraction}, {review:{...review,decision:'PENDING' as const}},
    {review:{...review,sourceClass:'EXTERNAL_SOURCE' as const}}, {review:{...review,semanticSha256:'stale'}},
  ]) {
    const profiles=await projectDprCharacterStatReferences(extraction.rows[0]!.characterId,dependencies);
    assert.ok(profiles.every(p=>p.sourceReviewStatus === 'REVIEW_REQUIRED'));
    assert.ok(profiles.flatMap(p=>p.rows).every(r=>r.value === null));
  }
  assert.equal(await dprSemanticBinding(data),review.semanticSha256);
});

test('Augusta Prydwen stays independently CURRENT with seven unchanged verified recommendations', async () => {
  const prydwen = await projectRecommendedCharacterStats('augusta');
  assert.equal(prydwen.sourceReviewStatus,'CURRENT'); assert.equal(prydwen.rows.length,7);
  assert.ok(prydwen.rows.every(r=>r.status === 'VERIFIED'));
  assert.equal((await projectDprCharacterStatReferences('augusta'))[0]!.rows.length,10);
  assert.deepEqual(prydwen.rows.find(r=>r.metric === 'TOTAL_ATK')!.value,{kind:'OPEN_ENDED_BAND',minimum:2000,upperReference:2800});
});

test('visible Character Target stays Pending; reference projections are detached and unknown Characters have no inferred rows', async () => {
  const ui = await import('../docs/ui-prototypes/assets/character-target-presentation.js');
  for(const id of ['augusta','hsin','galbrena'])
    assert.ok(ui.recommendedCharacterStatsPresentation(id).every((r:{status:string})=>r.status === 'PENDING'));
  const [profile] = await projectDprCharacterStatReferences('hsin');
  (profile!.rows[0]!.sourceNotes as any[]).push({text:'mutation'});
  assert.ok((await projectDprCharacterStatReferences('hsin'))[0]!.rows.every(r=>!r.sourceNotes.some(n=>n.text === 'mutation')));
  assert.deepEqual(await projectDprCharacterStatReferences('not-a-character'),[]);
});
