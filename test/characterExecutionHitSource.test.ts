import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BAIZHI_ACTION_FACTS} from '../src/data/characterMechanics/baizhiRawFacts.ts';
const source=JSON.parse(readFileSync('data/source/character-execution-hits-2026-10-22.json','utf8'));
test('captured original hit families preserve explicit raw identity and never promote healing or dummy rows',()=>{
 assert.equal(source.source.commit,'9218d612ad815e398e064e577e42aaf878899968');
 assert.equal(source.source.blob,'6bcd76d3f7f855b47ad2f5325848f99803ae821a');
 assert.equal(source.source.path,'BinData/damage/damage.json');
 assert.deepEqual(source.characters.map((c:{characterId:string})=>c.characterId).sort(),['aalto','baizhi','calcharo','chixia','jianxin','lingyang','lumi','taoqi','youhu','yuanwu']);
 const rows=source.characters.flatMap((c:{rows:{Id:number}[]})=>c.rows);
 assert.equal(rows.length,414);assert.equal(new Set(rows.map((r:{Id:number})=>r.Id)).size,414);
 assert.ok(source.role.includes('NOT_AUTOMATIC_EXECUTION_ADMISSION'));
});
test('Baizhi original hit/HP/ATK/resource rows independently join existing canonical action curves',()=>{
 const rows=source.characters.find((c:{characterId:string})=>c.characterId==='baizhi').rows;
 const cases=[['baizhi-basic-destined-promise-1',1103100101,0,7],['baizhi-basic-destined-promise-2',1103100201,0,7],['baizhi-basic-destined-promise-3',1103100301,0,7],['baizhi-basic-destined-promise-4',1103100401,0,7],['baizhi-skill-emergency-plan-damage',1103200012,4,2],['baizhi-liberation-remnant-entities-damage',1103130001,2,2],['baizhi-intro-overflowing-frost-damage',1103160001,3,7]] as const;
 for(const [id,rawId,type,scaling]of cases){
  const fact=BAIZHI_ACTION_FACTS.find(f=>f.factId===id)!;const raw=rows.find((r:{Id:number})=>r.Id===rawId);
  assert.ok(raw);assert.equal(raw.Element,1);assert.equal(raw.Type,type);assert.equal(raw.RelatedProperty,scaling);
  assert.deepEqual(raw.RateLv.slice(0,10),fact.motionValueCurve!.map(n=>Math.round(n*10000)));
 }
 const first=rows.find((r:{Id:number})=>r.Id===1103100101);
 assert.deepEqual(first.Energy,[102]);assert.deepEqual(first.ElementPower,[385]);
 assert.deepEqual(rows.find((r:{Id:number})=>r.Id===1103200012).Energy,[700]);
 assert.deepEqual(rows.find((r:{Id:number})=>r.Id===1103130001).Energy,[0]);
});
