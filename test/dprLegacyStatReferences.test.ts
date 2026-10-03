import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {DPR_CHARACTER_STAT_EXTRACTION as modern} from '../src/data/dprCharacterStatReferences.ts';
import {DPR_LEGACY_STAT_EXTRACTION as legacy} from '../src/data/dprLegacyStatReferences.ts';
import {DPR_LEGACY_STAT_REFERENCE_REVIEW as review} from '../src/data/dprLegacyStatReferenceReview.ts';
import {extractDprLegacyStatReferences,parseLegacyRatioToken,captureDprLegacyNativeSource} from '../src/dprLegacyStatExtraction.ts';
import type {LegacyNativeSnapshot,DprLegacyExtraction} from '../src/dprLegacyStatExtraction.ts';
import {projectDprCalcScenarioReferences,projectDprAllCharacterStatReferences} from '../src/dprLegacyStatReferences.ts';
import {projectDprCharacterStatReferences} from '../src/dprCharacterStatReferences.ts';
import {projectRecommendedCharacterStats} from '../src/characterRecommendationSources.ts';
import {mapDprCharacterTab} from '../src/dprCharacterStatExtraction.ts';

const snapshot:LegacyNativeSnapshot=JSON.parse(readFileSync(new URL('../data/research/dpr-calc-legacy-native-source-snapshot-2026-10-03.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(snapshot) as any;
const cell=(s:any,r:number,c:number)=>s.cells.find((v:any)=>v.row===r&&v.column===c);
const withNewPin=(extraction:DprLegacyExtraction)=>({extraction,review:{...review,semanticSha256:extraction.semanticSha256}});

test('V2 adds a manifest and legacy family without changing accepted V1 modern values, hash or 25 profiles',async()=>{
  assert.equal(modern.semanticSha256,'d3ca38885f16cadf82aa86ea5e48318e205dd9f3a42e4e1037a8c341fdcb0a8d');
  assert.equal(modern.normalizationVersion,'DPR_NATIVE_SEMANTIC_V1');
  assert.equal(legacy.normalizationVersion,'DPR_NATIVE_SEMANTIC_V2');
  assert.deepEqual(legacy.modernSource,{normalizationVersion:modern.normalizationVersion,semanticSha256:modern.semanticSha256,
    artifact:'data/research/dpr-calc-character-stat-references-2026-10-03.json'});
  assert.equal(legacy.counts.modernProfileCount,modern.counts.characterVariantCount);
  assert.equal(legacy.counts.modernVerifiedRows,modern.counts.mappedNumericRows);
  assert.equal(legacy.counts.modernPendingRows,modern.counts.unavailableRows);
  const modernJson=JSON.parse(readFileSync(new URL('../data/research/dpr-calc-character-stat-references-2026-10-03.json',import.meta.url),'utf8'));
  assert.deepEqual(modern,modernJson);
  assert.equal((await projectDprCharacterStatReferences('augusta'))[0]!.sourceReviewStatus,'CURRENT');
});

test('every mapped Character tab has coverage and every tab without a modern block has a full-grid native snapshot',()=>{
  const expected=modern.sheetInventory.filter(s=>mapDprCharacterTab(s.sheetTitle));
  assert.deepEqual(legacy.coverage.map(s=>s.sheetId).sort((a,b)=>a-b),expected.map(s=>s.sheetId).sort((a,b)=>a-b));
  const missingModern=expected.filter(s=>!s.sectionHeaders.length);
  assert.deepEqual(snapshot.sheets.map(s=>s.sheetId).sort((a,b)=>a-b),missingModern.map(s=>s.sheetId).sort((a,b)=>a-b));
  for(const s of snapshot.sheets) assert.match(s.scanRange,/^A1:Z[0-9]+$/);
  assert.ok(snapshot.sheets.find(s=>s.sheetTitle==='Aerover')!.cells.some(c=>c.row>90));
  assert.ok(!legacy.coverage.some(s=>s.sheetTitle==='Readme'));
  const grid={spreadsheetId:snapshot.spreadsheetId,properties:{title:snapshot.spreadsheetTitle},
    sheets:snapshot.sheets.map(s=>({properties:{sheetId:s.sheetId,title:s.sheetTitle,hidden:s.hidden,
      gridProperties:{rowCount:Number(s.scanRange.match(/\d+$/)![0]),columnCount:26}},
      data:s.cells.map(c=>({startRow:c.row,startColumn:c.column,rowData:[{values:[c.data]}]}))}))};
  const metadata={...grid,sheets:snapshot.inventory.map(s=>({properties:{sheetId:s.sheetId,title:s.sheetTitle,
    hidden:s.hidden,gridProperties:{rowCount:1000,columnCount:26}}}))};
  assert.deepEqual(captureDprLegacyNativeSource(grid,metadata,snapshot.extractionDate),snapshot);
});

test('missing a full-grid capture fails closed instead of claiming a Character has no source',async()=>{
  const next=clone();next.sheets.pop();
  await assert.rejects(extractDprLegacyStatReferences(next,modern),/Missing or unexpected/);
});

test('Brant explicit tuple tables are discovered as 12 separate source scenarios with exact three-stat coverage',async()=>{
  const scenarios=await projectDprCalcScenarioReferences('brant');
  assert.equal(scenarios.length,12);assert.equal(new Set(scenarios.map(s=>s.scenarioKey)).size,12);
  assert.ok(scenarios.every(s=>s.rows.length===3&&s.sourceReviewStatus==='CURRENT'));
  assert.equal(scenarios.flatMap(s=>s.rows).length,36);
  assert.deepEqual([...new Set(scenarios.flatMap(s=>s.rows.map(r=>r.metric)))].sort(),
    ['TOTAL_CRIT_DAMAGE','TOTAL_CRIT_RATE','TOTAL_ENERGY_REGEN']);
  assert.ok(scenarios.flatMap(s=>s.rows).every(r=>r.status==='VERIFIED'&&r.sectionRole==='CALC_SCENARIO_REFERENCE'
    &&r.comparisonStatus==='PENDING'));
});

test('Brant source punctuation and exact values remain scenario references, never General or a winning target',async()=>{
  const scenarios=await projectDprCalcScenarioReferences('brant');
  for(const [setup,text,expected] of [
    ['A26','276.% | 73% | 225%',[2.76,.73,2.25]],
    ['A27','253.% | 66% | 225%',[2.53,.66,2.25]],
    ['A28','266% | 73% | 225 %',[2.66,.73,2.25]],
    ['A29','231.% | 66% | 225%',[2.31,.66,2.25]],
  ] as const) {
    const scenario=scenarios.find(s=>s.rows[0]!.setupCell===setup)!;
    assert.ok(scenario.rows.every(r=>r.originalValueText===text));
    assert.deepEqual(scenario.rows.map(r=>r.value!.reference),expected);
    assert.ok(scenario.rows.every(r=>r.value!.kind==='REFERENCE'&&!('preferred' in r.value!)&&!('minimum' in r.value!)));
  }
  const brant=await projectDprAllCharacterStatReferences('brant');
  assert.deepEqual(brant.modernProfiles,[]);
  assert.equal(brant.legacyScenarios.length,12);
  assert.equal(parseLegacyRatioToken('276.%'),2.76);
  assert.equal(parseLegacyRatioToken('225 %'),2.25);
  assert.equal(parseLegacyRatioToken('100% damage'),null);
});

test('identical Brant setup labels in different rotation/team tables never collapse',async()=>{
  const scenarios=await projectDprCalcScenarioReferences('brant');
  const same=scenarios.filter(s=>s.scenarioLabel==='TBC 43311 ER/ER');
  assert.equal(same.length,2);assert.notEqual(same[0]!.scenarioKey,same[1]!.scenarioKey);
  assert.notEqual(same[0]!.scenarioContext,same[1]!.scenarioContext);
  assert.match(same[0]!.scenarioContext,/2x forte/);assert.match(same[1]!.scenarioContext,/1x forte/);
  assert.ok(scenarios.every(s=>s.rows[0]!.sourceNotes.some(n=>n.cell==='A41')));
});

test('all five named Substat Value layouts are excluded even when their percentage resembles a total stat',async()=>{
  for(const title of ['Iuno','XLY','Carlotta','Camellya','Ciaconna']) {
    const coverage=legacy.coverage.find(s=>s.sheetTitle===title)!;
    assert.equal(coverage.status,'NO_CHARACTER_STAT_REFERENCES');
    assert.ok(coverage.excludedTables.some(t=>t.category==='SUBSTAT_VALUE'));
    assert.ok(!legacy.rows.some(r=>r.sheetId===coverage.sheetId));
    const next=clone(),source=next.sheets.find((s:any)=>s.sheetTitle===title);
    const label=source.cells.find((c:any)=>c.data.effectiveValue?.stringValue==='CR');
    const value=cell(source,label.row,label.column+1);
    value.data.effectiveValue.numberValue=.688;value.data.formattedValue='68.80%';
    assert.equal((await extractDprLegacyStatReferences(next,modern)).semanticSha256,legacy.semanticSha256);
  }
});

test('damage and comparison percentages are excluded, including Brant scenario ranking columns',async()=>{
  const next=clone(),brant=next.sheets.find((s:any)=>s.sheetTitle==='Brant');
  cell(brant,25,2).data.effectiveValue.numberValue=99999999; // C26 damage
  cell(brant,25,3).data.effectiveValue.numberValue=.688; // D26 comparison
  assert.equal((await extractDprLegacyStatReferences(next,modern)).semanticSha256,legacy.semanticSha256);
  assert.ok(legacy.coverage.find(s=>s.sheetTitle==='Brant')!.excludedTables.some(t=>t.category==='DAMAGE_OR_COMPARISON'));
});

test('team and rDPR cells do not become Character stat references or affect semantic stat pin',async()=>{
  const next=clone(),source=next.sheets.find((s:any)=>s.sheetTitle==='Lupa');
  cell(source,32,4).data.effectiveValue.numberValue=2222; // E33 team damage
  cell(source,40,1).data.effectiveValue.numberValue=.73; // B41 rDPR
  assert.equal((await extractDprLegacyStatReferences(next,modern)).semanticSha256,legacy.semanticSha256);
  assert.ok(legacy.coverage.find(s=>s.sheetTitle==='Lupa')!.excludedTables.some(t=>t.category==='TEAM_OR_RDPR'));
  assert.ok(!legacy.rows.some(r=>r.characterId==='lupa'));
});

test('Brant coordinates, complete source contexts and native import formulas are retained exactly',()=>{
  const row=legacy.rows.find(r=>r.setupCell==='A26')!;
  assert.equal(row.sourceRange,'A26:B26');assert.equal(row.sectionCell,'B25');assert.equal(row.contextCell,'A24');
  assert.equal(row.formula,null);
  assert.match(row.sourceOrigins.find(o=>o.cell==='A1')!.data.userEnteredValue!.formulaValue!,/Brant!A500:E600/);
  assert.equal(row.setupProvenance.effectiveValue!.stringValue,row.scenarioLabel);
  assert.equal(row.headerProvenance.effectiveValue!.stringValue,'ER / CR / CD');
});

function addSyntheticPhoebeInput(next:any) {
  const s=next.sheets.find((s:any)=>s.sheetTitle==='Phoebe');
  for(const [row,column,label,formula] of [
    [100,24,'Phoebe S0R1 named calc setup',null],[101,24,'Name',null],[101,25,'ER / CR / CD',null],
    [102,24,'Explicit partial scenario',null],[102,25,'125% | | 250%','="125% | | 250%"'],
  ] as const) s.cells.push({row,column,data:{effectiveValue:{stringValue:label},formattedValue:label,
    ...(formula?{userEnteredValue:{formulaValue:formula}}:{})}});
}
test('another explicit tuple/formula layout beyond the first 40 rows retains provenance and partial metrics',async()=>{
  const next=clone();addSyntheticPhoebeInput(next);
  const extracted=await extractDprLegacyStatReferences(next,modern);
  const [scenario]=await projectDprCalcScenarioReferences('phoebe',withNewPin(extracted));
  assert.equal(scenario!.rows.length,3);
  assert.equal(scenario!.rows.filter(r=>r.status==='VERIFIED').length,2);
  assert.equal(scenario!.rows.filter(r=>r.status==='PENDING').length,1);
  assert.ok(scenario!.rows.every(r=>r.sourceRange==='Y103:Z103'&&r.formula==='="125% | | 250%"'));
  assert.ok(!scenario!.rows.some(r=>['TOTAL_HP','TOTAL_ATK','TOTAL_DEF'].includes(r.metric)));
});

test('aliases remain deterministic and WIP source context never changes canonical release truth',()=>{
  for(const [title,id] of [['XLY','xiangli-yao'],['Aerover','rover-aero'],['Ciaconna','ciaccona']])
    assert.equal(legacy.coverage.find(s=>s.sheetTitle===title)!.characterId,id);
  assert.equal(legacy.coverage.find(s=>s.sheetTitle==='Buling (WIP)')!.status,'NO_CHARACTER_STAT_REFERENCES');
  assert.equal(legacy.coverage.find(s=>s.sheetTitle==='Qiuyuan MDPS(WIP EN TL)')!.variantKey,'MDPS_WIP_EN_TL');
  assert.ok(!('releaseStatus' in legacy.coverage[0]!));
});

test('Aerover ambiguous components are reported without poisoning Brant or modern profiles',async()=>{
  const aerover=legacy.coverage.find(s=>s.sheetTitle==='Aerover')!;
  assert.equal(aerover.status,'AMBIGUOUS_REVIEW_REQUIRED');assert.deepEqual(aerover.metrics,[]);
  assert.equal(aerover.legacyAvailable,false);assert.equal((await projectDprCalcScenarioReferences('rover-aero')).length,0);
  assert.ok(legacy.issues.some(i=>i.sheetTitle==='Aerover'&&i.sourceRange==='E8,F8,G8'));
  assert.ok((await projectDprCalcScenarioReferences('brant')).every(s=>s.sourceReviewStatus==='CURRENT'));
  assert.equal((await projectDprCharacterStatReferences('hsin'))[0]!.sourceReviewStatus,'CURRENT');
});

test('an ambiguous scenario fails closed for its sheet while an independently explicit legacy sheet remains usable',async()=>{
  const next=clone();addSyntheticPhoebeInput(next);
  const brant=next.sheets.find((s:any)=>s.sheetTitle==='Brant');
  cell(brant,25,1).data.effectiveValue.stringValue='276.% | probably 73% | 225%';
  const extracted=await extractDprLegacyStatReferences(next,modern);
  assert.ok(extracted.issues.some(i=>i.sheetTitle==='Brant'));
  assert.ok(!extracted.rows.some(r=>r.characterId==='brant'));
  assert.equal(extracted.coverage.find(s=>s.sheetTitle==='Brant')!.status,'AMBIGUOUS_REVIEW_REQUIRED');
  assert.equal((await projectDprCalcScenarioReferences('phoebe',withNewPin(extracted)))[0]!.rows.filter(r=>r.status==='VERIFIED').length,2);
});

test('V2 JSON/module/source extraction is deterministic under response ordering and excludes transport metadata',async()=>{
  assert.deepEqual(await extractDprLegacyStatReferences(snapshot,modern),legacy);
  const next=clone();next.sheets.reverse();next.inventory.reverse();for(const s of next.sheets)s.cells.reverse();
  next.transport={xlsxSha256:'different ZIP bytes'};next.extractionDate='2026-10-04';
  assert.equal((await extractDprLegacyStatReferences(next,modern)).semanticSha256,legacy.semanticSha256);
  assert.deepEqual(legacy,JSON.parse(readFileSync(new URL('../data/research/dpr-calc-legacy-stat-references-2026-10-03.json',import.meta.url),'utf8')));
  const parity=spawnSync(process.execPath,['--experimental-strip-types','scripts/generate-dpr-legacy-stat-references.ts','--check'],{encoding:'utf8'});
  assert.equal(parity.status,0,parity.stderr);
});

test('actual legacy stat/setup/context/formula drift invalidates review rather than silently updating it',async()=>{
  for(const field of ['value','setup','context','formula']) {
    const next=clone(),brant=next.sheets.find((s:any)=>s.sheetTitle==='Brant');
    if(field==='value')cell(brant,25,1).data.effectiveValue.stringValue='277% | 73% | 225%';
    if(field==='setup')cell(brant,25,0).data.effectiveValue.stringValue+=' changed setup';
    if(field==='context')cell(brant,23,0).data.effectiveValue.stringValue+=' changed team';
    if(field==='formula')cell(brant,0,0).data.userEnteredValue.formulaValue+=' ';
    const extracted=await extractDprLegacyStatReferences(next,modern);
    assert.notEqual(extracted.semanticSha256,legacy.semanticSha256);
    assert.ok((await projectDprCalcScenarioReferences('brant',{extraction:extracted})).every(s=>s.sourceReviewStatus==='REVIEW_REQUIRED'));
  }
});

test('canonical legacy outputs are detached and missing approval or source class cannot verify references',async()=>{
  for(const changed of [{...review,decision:'PENDING' as const},{...review,sourceClass:'EXTERNAL_SOURCE' as const}])
    assert.ok((await projectDprCalcScenarioReferences('brant',{review:changed})).flatMap(s=>s.rows).every(r=>r.value===null));
  const result=await projectDprCalcScenarioReferences('brant');
  (result[0]!.rows[0]!.sourceNotes as any[]).push({cell:'mutation'});
  assert.ok(!(await projectDprCalcScenarioReferences('brant'))[0]!.rows[0]!.sourceNotes.some(n=>n.cell==='mutation'));
});

test('Augusta sources stay independently CURRENT while legacy-only Character Targets remain Pending',async()=>{
  const prydwen=await projectRecommendedCharacterStats('augusta');
  assert.equal(prydwen.sourceReviewStatus,'CURRENT');assert.equal(prydwen.rows.filter(r=>r.status==='VERIFIED').length,7);
  const dpr=await projectDprAllCharacterStatReferences('augusta');
  assert.equal(dpr.modernProfiles[0]!.sourceReviewStatus,'CURRENT');assert.equal(dpr.modernProfiles[0]!.rows.length,10);
  assert.deepEqual(dpr.legacyScenarios,[]);
  const ui=await import('../docs/ui-prototypes/assets/character-target-presentation.js');
  for(const id of ['brant','rover-aero'])assert.deepEqual(ui.recommendedCharacterStatsPresentation(id),[]);
});
