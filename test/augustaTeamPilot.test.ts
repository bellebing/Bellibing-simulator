import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SUBSTAT_VALUE_TABLE} from '../src/echoCore.ts';
import {expectedDamage,defenseMultiplier,resistanceMultiplier} from '../src/combat/damageKernel.ts';
import {evaluateAugustaTeamPilot,compareAugustaPilotTeams,compareAugustaPilotEcho,assembleAugustaPilotBuild} from '../src/combat/augustaTeamPilot.ts';
import {createAugustaPilotExampleBuilds,AUGUSTA_PILOT_EXAMPLE_ENEMY} from '../src/data/augustaPilotExampleBuilds.ts';
import {AUGUSTA_PILOT_HIT_MODELS,AUGUSTA_PILOT_HIT_SOURCE} from '../src/data/augustaPilotHitModels.ts';
import {hasRotationEngineModel} from '../src/rotationEngineRegistry.ts';
const input=(partnerId:'iuno'|'mortefi'='iuno')=>({partnerId,builds:createAugustaPilotExampleBuilds().filter(b=>b.characterId!==(partnerId==='iuno'?'mortefi':'iuno')),enemy:AUGUSTA_PILOT_EXAMPLE_ENEMY,cycleNumber:2 as const,acceptReferenceStateSchedule:true as const,heronTransfer:'PUBLISHED_DAMAGE_BONUS' as const});
const roll=(card:ReturnType<typeof createAugustaPilotExampleBuilds>[number]['echoes'][number],name:string,value:number)=>({...card,substats:card.substats.map(r=>r.name===name?{...r,value}:r)});
test('source/pilot bindings remain checksum pinned',()=>{
 const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
 assert.equal(hash(AUGUSTA_PILOT_HIT_SOURCE.artifact),AUGUSTA_PILOT_HIT_SOURCE.sha256);
 assert.equal(hash(AUGUSTA_PILOT_HIT_SOURCE.reviewPath),AUGUSTA_PILOT_HIT_SOURCE.reviewSha256);
 const raw=JSON.parse(readFileSync(AUGUSTA_PILOT_HIT_SOURCE.artifact,'utf8'));
 assert.equal(hash('scripts/capture-augusta-pilot-hits.mjs'),raw.captureSha256);
 assert.ok(raw.records.every((r:{hits:{avg?:unknown}[]})=>r.hits.every(h=>!Object.hasOwn(h,'avg'))),'production capture does not export provider damage');
});
test('independent provider kernel benchmark agrees within its documented final rounding',()=>{
 const data=JSON.parse(readFileSync('data/research/augusta-pilot-kernel-benchmark-2026-10-12.json','utf8'));
 for(const {enemyDefense,enemyResistance,providerExpectedDamage,partner,...snapshot} of data.records){
  const actual=expectedDamage({...snapshot,defenseMultiplier:defenseMultiplier({attackerLevel:90,enemyDefense}),resistanceMultiplier:resistanceMultiplier(enemyResistance)});
  assert.equal(Math.floor(actual+1e-9),providerExpectedDamage,partner);assert.ok(actual-providerExpectedDamage<1.00000001);
 }
});
test('both complete source cycles produce isolated actor damage and conserve the total',()=>{
 const comparison=compareAugustaPilotTeams({builds:createAugustaPilotExampleBuilds(),enemy:AUGUSTA_PILOT_EXAMPLE_ENEMY,cycleNumber:2,heronTransfer:'PUBLISHED_DAMAGE_BONUS'});
 for(const r of [comparison.iuno,comparison.mortefi]){assert.equal(r.status,'EXPERIMENTAL_REFERENCE_SCENARIO');if(r.status!=='EXPERIMENTAL_REFERENCE_SCENARIO')return;
  assert.ok(r.scenarioDps>0);assert.ok(Math.abs(r.members.reduce((s,m)=>s+m.damage,0)-r.scenarioDamage)<1e-7);assert.ok(Math.abs(r.members.reduce((s,m)=>s+m.share,0)-1)<1e-12);
  assert.ok(r.hits.every(h=>r.members.some(m=>m.characterId===h.characterId)));assert.equal(r.teamDpsReady,false);assert.equal(r.authorizesUpgradeVerdict,false);
 }
 assert.equal(comparison.iuno.status,'EXPERIMENTAL_REFERENCE_SCENARIO');assert.equal(comparison.mortefi.status,'EXPERIMENTAL_REFERENCE_SCENARIO');
 if(comparison.iuno.status==='EXPERIMENTAL_REFERENCE_SCENARIO'&&comparison.mortefi.status==='EXPERIMENTAL_REFERENCE_SCENARIO'){
  for(const id of ['augusta','the-shorekeeper'])assert.equal(comparison.iuno.builds.find(b=>b.characterId===id)!.echoStatKey,comparison.mortefi.builds.find(b=>b.characterId===id)!.echoStatKey);
  assert.ok(comparison.mortefi.hits.filter(h=>h.name.includes('Marcato')).every(h=>h.characterId==='mortefi'));
  assert.ok(!comparison.mortefi.hits.some(h=>h.characterId==='iuno'));
  assert.ok(!hasRotationEngineModel('augusta-team-pilot','augusta'));
 }
});
test('Augusta stat-card upgrade changes her damage without leaking into the other actors',()=>{
 const scenario=input(),card=scenario.builds.find(b=>b.characterId==='augusta')!.echoes[0];
 const r=compareAugustaPilotEcho({scenario,characterId:'augusta',slotIndex:0,candidate:roll(card,'CRIT DMG',SUBSTAT_VALUE_TABLE['CRIT DMG'].at(-1)!)});
 assert.ok(r.scenarioDpsDelta!>0);
 if(r.current.status==='EXPERIMENTAL_REFERENCE_SCENARIO'&&r.candidate.status==='EXPERIMENTAL_REFERENCE_SCENARIO')for(const id of ['iuno','the-shorekeeper'])assert.equal(r.current.members.find(m=>m.characterId===id)!.damage,r.candidate.members.find(m=>m.characterId===id)!.damage);
});
test('Mortefi owns both his coordinated damage and its build scaling',()=>{
 const scenario=input('mortefi'),card=scenario.builds.find(b=>b.characterId==='mortefi')!.echoes[0];
 const r=compareAugustaPilotEcho({scenario,characterId:'mortefi',slotIndex:0,candidate:roll(card,'CRIT DMG',SUBSTAT_VALUE_TABLE['CRIT DMG'].at(-1)!)});
 assert.ok(r.scenarioDpsDelta!>0);if(r.current.status==='EXPERIMENTAL_REFERENCE_SCENARIO'&&r.candidate.status==='EXPERIMENTAL_REFERENCE_SCENARIO')assert.equal(r.current.members.find(m=>m.characterId==='augusta')!.damage,r.candidate.members.find(m=>m.characterId==='augusta')!.damage);
});
test('crit over the cap has zero marginal damage value in an already capped build',()=>{
 const scenario=input();scenario.builds=scenario.builds.map(b=>b.characterId==='augusta'?{...b,echoes:b.echoes.map((e,i)=>i?roll(e,'CRIT Rate',SUBSTAT_VALUE_TABLE['CRIT Rate'].at(-1)!):e)}:b);
 const card=scenario.builds.find(b=>b.characterId==='augusta')!.echoes[0];const r=compareAugustaPilotEcho({scenario,characterId:'augusta',slotIndex:0,candidate:roll(card,'CRIT Rate',SUBSTAT_VALUE_TABLE['CRIT Rate'].at(-1)!)});
 assert.equal(r.scenarioDpsDelta,0);
});
test('insufficient Energy Regen prevents a repeated-cycle DPS claim',()=>{
 const scenario=input();scenario.builds=scenario.builds.map(b=>b.characterId==='augusta'?{...b,echoes:b.echoes.map(e=>({...e,substats:e.substats.map(r=>r.name==='Energy Regen'?{name:'Flat ATK' as const,value:SUBSTAT_VALUE_TABLE['Flat ATK'][2]}:r)}))}:b);
 const r=evaluateAugustaTeamPilot(scenario);assert.equal(r.status,'ENERGY_REQUIREMENT_NOT_MET');assert.equal(r.scenarioDps,null);
});
test('Illation is separated from its butterflies and Discernment is HP/guaranteed crit',()=>{
 const r=evaluateAugustaTeamPilot(input());assert.equal(r.status,'EXPERIMENTAL_REFERENCE_SCENARIO');if(r.status!=='EXPERIMENTAL_REFERENCE_SCENARIO')return;
 assert.ok(r.hits.some(h=>h.name==='Forte Heavy - Illation'&&h.damageClass==='HEAVY'));assert.ok(r.hits.some(h=>h.name==='Forte Heavy - Illation'&&h.damageClass==='BASIC'));
 assert.ok(r.hits.filter(h=>h.name==='Intro - Discernment').every(h=>h.damageClass==='LIBERATION'&&h.critRate===1));
});
test('same party, gear rank, sequence and actual canonical card values are mandatory',()=>{
 assert.throws(()=>evaluateAugustaTeamPilot({...input(),builds:[input().builds[0],input().builds[0],input().builds[2]]}),/exact pilot trio/);
 const build=createAugustaPilotExampleBuilds()[0];assert.throws(()=>assembleAugustaPilotBuild({...build,sequence:1}),/exact declared/);
 assert.throws(()=>assembleAugustaPilotBuild({...build,weapon:{...build.weapon,rank:5}}),/exact declared/);
 assert.throws(()=>assembleAugustaPilotBuild({...build,echoes:build.echoes.map((e,i)=>i?e:roll(e,'Energy Regen',0.086))}),/not an exact verified/);
 assert.equal(AUGUSTA_PILOT_HIT_MODELS.length,2);
});
test('Heron sensitivity is reported separately without silently closing source ambiguity',()=>{
 const scenario=input('mortefi'),on=evaluateAugustaTeamPilot(scenario),off=evaluateAugustaTeamPilot({...scenario,heronTransfer:'DISABLED_SENSITIVITY'});
 assert.ok(on.scenarioDps!>off.scenarioDps!);if(on.status==='EXPERIMENTAL_REFERENCE_SCENARIO')assert.ok(on.pending.some(s=>s.includes('Heron')));
});
test('multi-component Sword of Eternal Oath preserves all eight canonical hits',()=>{
 for(const model of AUGUSTA_PILOT_HIT_MODELS){const cycle=model.cycles[1],counts=new Map<number,number>();
  for(const h of model.hits.filter(h=>h.atFrame>=cycle.startFrame&&h.atFrame<cycle.endFrame&&h.name==='Liberation - Sword of Eternal Oath'))for(const b of h.bindings)counts.set(b.componentIndex,(counts.get(b.componentIndex)??0)+b.hitCount);
  assert.deepEqual([...counts.entries()].sort((a,b)=>a[0]-b[0]),[[0,2],[1,3],[2,2],[3,1]]);
 }
});
test('Shorekeeper ER below the crit cap respects the temporary Fallacy ER window',()=>{
 const scenario=input();scenario.builds=scenario.builds.map(b=>b.characterId==='the-shorekeeper'?{...b,echoes:b.echoes.map((e,i)=>i===1||i===2?{...e,mainStat:{name:'HP%' as const,value:0.3}}:e)}:b);
 const r=evaluateAugustaTeamPilot(scenario);assert.equal(r.status,'EXPERIMENTAL_REFERENCE_SCENARIO');if(r.status!=='EXPERIMENTAL_REFERENCE_SCENARIO')return;
 const crit=[...new Set(r.hits.filter(h=>h.characterId==='augusta').map(h=>h.critRate))].sort();
 assert.equal(crit.length,2);assert.ok(crit[1]<1);assert.ok(Math.abs(crit[1]-crit[0]-0.005)<1e-12);
});
