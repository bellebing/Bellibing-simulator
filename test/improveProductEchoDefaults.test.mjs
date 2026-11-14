import test from 'node:test';
import assert from 'node:assert/strict';
import {improveProductEchoDefault,CRIT_DPS_PRODUCT_SCOPE,ADDITIONAL_PRODUCT_DEFAULT_IDS} from '../src/improveProductEchoDefaults.mjs';
import {IMPROVE_DPR_SUBSTAT_SENSITIVITIES} from '../src/data/improveDprSubstatSensitivities.mjs';
import {initializeCanonicalSettings} from '../docs/ui-lab/v1.1/modules/canonical-settings.js';
import {settingsSnapshot} from '../docs/ui-lab/v1.1/modules/simulation-configuration.js';
import {CHARACTER_GUIDE_RECOMMENDATIONS} from '../src/data/characterEquipmentAssociations.ts';
import {initialSettings,restoreRecommendedSettings} from '../docs/ui-lab/v1.1/modules/settings-state.js';
import {restoreProductEchoDefaults} from '../docs/ui-lab/v1.1/modules/product-echo-defaults.js';
import {ECHO_SETTING_STATS} from '../docs/ui-lab/v1.1/modules/settings-catalog.js';
import {expectedTunerReason,createStatTargetCost} from '../docs/ui-lab/v1.1/modules/stat-target-cost.js';
import {clearOwnedImproveOverrides} from '../docs/ui-lab/v1.1/modules/account-settings.js';

const presets=CHARACTER_GUIDE_RECOMMENDATIONS.map(row=>row.characterId).filter(id=>improveProductEchoDefault(id));
const state=id=>({id,gate:'+5',...initialSettings(id),accountProjection:{}});

test('complete 59/59 Improve product standards: 26 unchanged Prydwen DPS, 13 DPR, 19 guide fallbacks, Augusta canonical',()=>{
 assert.equal(CHARACTER_GUIDE_RECOMMENDATIONS.length,59);
 assert.equal(CRIT_DPS_PRODUCT_SCOPE.length,26);
 assert.equal(ADDITIONAL_PRODUCT_DEFAULT_IDS.length,32);
 assert.equal(new Set(ADDITIONAL_PRODUCT_DEFAULT_IDS).size,32);
 assert.equal(Object.keys(IMPROVE_DPR_SUBSTAT_SENSITIVITIES).length,13);
 assert.equal(presets.length,58);
 assert.deepEqual(new Set(presets),new Set([...CRIT_DPS_PRODUCT_SCOPE,...ADDITIONAL_PRODUCT_DEFAULT_IDS]));
 const origins={DPR_SUBSTAT_VALUE:0,PRYDWEN_GUIDE_PRIORITY:0};
 const all=new Set();
 for(const row of CHARACTER_GUIDE_RECOMMENDATIONS){
  const id=row.characterId,one=state(id);
  assert.equal(initializeCanonicalSettings(one,{productDefaults:true}),true,id);
  const actual=settingsSnapshot(one);
  assert.equal(actual.mode,'Recommended',id);
  assert.equal(actual.hard.length>0||actual.flex.length>0,true,id);
  assert.equal(actual.flexCount,1,id);
  assert.ok(actual.hard.length+actual.flexCount<=5,id+' impossible fifth substat');
  assert.equal(new Set([...actual.hard,...actual.flex].map(x=>x.stat)).size,actual.hard.length+actual.flex.length,id);
  for(const requirement of [...actual.hard,...actual.flex])
   assert.equal(requirement.minimum,ECHO_SETTING_STATS.find(x=>x.id===requirement.stat)?.tiers[0],id+' '+requirement.stat);
  if(id==='augusta'){
   assert.deepEqual(one.statSections.hard,['CRIT Rate','CRIT DMG']);
   assert.deepEqual(one.statSections.flex,['ATK%','Heavy Attack DMG','Energy Regen','Flat ATK']);
  }else{
   const preset=improveProductEchoDefault(id);
   assert.ok(preset?.sourceUrl,id+' missing source');
   assert.deepEqual(one.statSections.hard,preset.hard,id);
   assert.deepEqual(one.statSections.flex,preset.flex,id);
   assert.ok(!preset.flex.includes('Energy Regen'),id+' whole-build ER in per-Echo pool');
   assert.equal(preset.meaning,'OWNER_PRODUCT_DEFAULT_NOT_SOURCE_VERIFIED_PER_ECHO_REQUIREMENT',id);
   origins[preset.sourceKind??'PRYDWEN_GUIDE_PRIORITY']++;
  }
  all.add(id);
 }
 assert.equal(all.size,59);
 assert.deepEqual(origins,{DPR_SUBSTAT_VALUE:13,PRYDWEN_GUIDE_PRIORITY:45});
 assert.equal(improveProductEchoDefault('augusta'),null,'owner-approved canonical Augusta remains separate');
});
test('source snapshot exact DPR percentages drive numeric order, not General Stat Recommendation totals',()=>{
 const values=IMPROVE_DPR_SUBSTAT_SENSITIVITIES;
 assert.deepEqual([values.iuno.valuePercent['CRIT DMG'],values.iuno.valuePercent['CRIT Rate'],values.iuno.valuePercent['ATK%']],[6.29,5.40,2.99]);
 assert.deepEqual([values.cartethyia.valuePercent['CRIT Rate'],values.cartethyia.valuePercent['HP%'],values.cartethyia.valuePercent['Basic Attack DMG']],[5.20,2.42,1.70]);
 assert.deepEqual([values.hiyuki.valuePercent['CRIT DMG'],values.hiyuki.valuePercent['CRIT Rate'],values.hiyuki.valuePercent['ATK%']],[4.79,4.42,2.38]);
 assert.deepEqual([values.sigrika.valuePercent['CRIT Rate'],values.sigrika.valuePercent['CRIT DMG'],values.sigrika.valuePercent['ATK%']],[5.42,4.57,2.46]);
 assert.deepEqual([values.mornye.valuePercent['Liberation DMG'],values.mornye.valuePercent['CRIT DMG'],values.mornye.valuePercent['Energy Regen']],[3.88,3.79,3.52]);
 const examples={
  iuno:{hard:['CRIT Rate','CRIT DMG'],flex:['ATK%','Liberation DMG','Flat ATK']},
  cartethyia:{hard:['CRIT Rate'],flex:['HP%','Basic Attack DMG','CRIT DMG']},
  hiyuki:{hard:['CRIT Rate','CRIT DMG'],flex:['ATK%','Liberation DMG','Flat ATK']},
  mornye:{hard:[],flex:['Liberation DMG','CRIT DMG','DEF%']},
  sigrika:{hard:['CRIT Rate','CRIT DMG'],flex:['ATK%','Flat ATK']},
  suisui:{hard:['CRIT DMG'],flex:['CRIT Rate','HP%','Basic Attack DMG']},
  'yangyang-xuanling':{hard:['CRIT Rate','CRIT DMG'],flex:['Heavy Attack DMG','ATK%','Flat ATK']}
 };
 for(const [id,expected]of Object.entries(examples)){
  const p=improveProductEchoDefault(id);
  assert.deepEqual(p.hard,expected.hard,id);
  assert.deepEqual(p.flex,expected.flex,id);
  assert.equal(p.sourceKind,'DPR_SUBSTAT_VALUE');
  assert.ok(p.sourceRange&&p.sourceUrl.includes('gid='),id);
  assert.equal(p.flexCount,1,id);
 }
 assert.equal(values.buling.reviewStatus,'WIP_SCENARIO');
 assert.ok(!improveProductEchoDefault('mornye').flex.includes('Energy Regen'),'3.52% DPR ER is not per-Echo Hard requirement');
 assert.equal(values.sigrika.valuePercent['Energy Regen'],2.23,'positive ER remains source evidence despite whole-build exclusion');
});
test('guide-only support/hybrid defaults use reviewed relative ordering and never force CRIT',()=>{
 const selected={
  baizhi:{hard:[],flex:['HP%','Flat HP']},
  'the-shorekeeper':{hard:[],flex:['CRIT DMG','Liberation DMG','HP%']},
  verina:{hard:[],flex:['ATK%','Flat ATK']},
  taoqi:{hard:[],flex:['DEF%','Flat DEF']},
  yuanwu:{hard:[],flex:['DEF%','Flat DEF']},
  brant:{hard:['CRIT Rate','CRIT DMG'],flex:['Basic Attack DMG','ATK%','Flat ATK']},
  yinlin:{hard:['CRIT Rate','CRIT DMG'],flex:['ATK%','Flat ATK','Skill DMG']}
 };
 for(const [id,expected]of Object.entries(selected)){
  const p=improveProductEchoDefault(id);assert.equal(p.sourceKind,'PRYDWEN_GUIDE_PRIORITY',id);
  assert.deepEqual(p.hard,expected.hard,id);assert.deepEqual(p.flex,expected.flex,id);
  assert.ok(p.sourceLinesSha256?.length>=40,id);
 }
});
test('Qingxiao uses verified guide substat priorities, but product-owned lowest tiers and Flex1',()=>{
 const q=improveProductEchoDefault('qingxiao'),s=state('qingxiao');
 assert.deepEqual(q.hard,['CRIT Rate','CRIT DMG']);
 assert.deepEqual(q.flex,['ATK%','Flat ATK'],'three-way Heavy/Liberation/Basic tied group must not gain fabricated priority');
 assert.equal(q.flexCount,1);
 assert.equal(q.meaning,'OWNER_PRODUCT_DEFAULT_NOT_SOURCE_VERIFIED_PER_ECHO_REQUIREMENT');
 assert.ok(q.sourceLinesSha256);
 assert.equal(restoreProductEchoDefaults(s),true);
 assert.deepEqual(s.statSections.hard,q.hard);assert.deepEqual(s.statSections.flex,q.flex);
 assert.equal(s.flexCount,1);assert.equal(s.settingsMode,'Recommended');
 assert.equal(s.minima['CRIT Rate'],0);assert.equal(s.minima['CRIT DMG'],0);
 assert.equal(s.minima['ATK%'],0);
 assert.equal(ECHO_SETTING_STATS.find(x=>x.id==='CRIT Rate').tiers[s.minima['CRIT Rate']],.063);
 assert.equal(ECHO_SETTING_STATS.find(x=>x.id==='CRIT DMG').tiers[s.minima['CRIT DMG']],.126);
 assert.equal(ECHO_SETTING_STATS.find(x=>x.id==='ATK%').tiers[s.minima['ATK%']],.064);
});

test('the explicit Recommended reset does not claim source proof and retains ER/Sonata choices',()=>{
 const s=state('qingxiao');
 assert.equal(restoreProductEchoDefaults(s),true);
 s.settingsMode='Customize';s.statSections.flex=['Skill DMG'];s.statSections.other.push('ATK%');
 s.minima['ATK%']=2;s.erTarget={enabled:true,valuePercent:118};s.sonataPool=['manual'];
 assert.equal(restoreRecommendedSettings(s,{productDefaults:true}),true);
 assert.deepEqual(s.statSections.hard,['CRIT Rate','CRIT DMG']);
 assert.deepEqual(s.statSections.flex,['ATK%','Flat ATK']);
 assert.equal(s.minima['ATK%'],0);assert.equal(s.erTarget.valuePercent,118);
 assert.deepEqual(s.sonataPool,['manual']);
 const support=state('baizhi');
 assert.equal(restoreRecommendedSettings(support,{productDefaults:true}),true);
 assert.deepEqual(support.statSections.hard,[]);assert.deepEqual(support.statSections.flex,['HP%','Flat HP']);assert.equal(support.flexCount,1);
});

test('Expected-Tuner status adapter preserves exact certificate and explicit unavailable reasons',async()=>{
 const c={owner:{characterId:'qingxiao'},statTargets:[{hard:[{name:'CRIT Rate',minimum:.063}],flex:[{name:'ATK%',minimum:.064}],flexCount:1}],gate:5};
 let replies=0;const onChange=()=>replies++;
 const bridge=createStatTargetCost({request:async()=>({result:{status:'VERIFIED',certificate:{exactFixedPoint:true},winner:'DISCARD',continue:{tuners:{approximate:123}},discard:{tuners:{approximate:100}},resources:{optimal:{echoes:{approximate:7},exp:{approximate:1000}}}}}),onChange});
 bridge.sync(c);assert.equal(bridge.read(c,0).status,'PENDING');
 for(let i=0;i<10&&!replies;i++)await new Promise(r=>setTimeout(r,0));
 assert.equal(bridge.read(c,0).tuners,100);
 assert.equal(bridge.read(c,0).status,'VERIFIED');
 const pending=createStatTargetCost({request:async()=>({result:{status:'PENDING',reason:'UNSUPPORTED_ECHO_TARGET_OR_ROLLS'}})});
 pending.sync(c);await new Promise(r=>setTimeout(r,0));
 assert.equal(pending.read(c,0).status,'PENDING');
 assert.match(pending.read(c,0).reason,/combination/);
 const limit=createStatTargetCost({request:async()=>{throw Error('SEARCH_LIMIT')}});
 limit.sync(c);await new Promise(r=>setTimeout(r,0));
 assert.match(limit.read(c,0).reason,/limit/);
 assert.match(expectedTunerReason('TARGET_HAS_NO_FINITE_EXPECTATION'),/finite/);
});

test('explicit Recommended clears only selected Character V3 override through AccountStore, not another Character or budget',async()=>{
 const saved={version:3,characters:{qingxiao:{schemaVersion:3,characterId:'qingxiao',mode:'MANUAL',overrides:{echoRequirements:{requiredOnEveryEcho:[],groups:[]}}},augusta:{schemaVersion:3,characterId:'augusta',mode:'MANUAL',overrides:{}}},pendingV2Characters:{}};
 const data=new Map([['bellibing.improve.policy.v3',JSON.stringify(saved)]]);
 const storage={getItem:key=>data.get(key)??null};
 const store={saveUserData:async(key,value)=>data.set(key,value)};
 assert.equal(await clearOwnedImproveOverrides('qingxiao',storage,store),true);
 const after=JSON.parse(data.get('bellibing.improve.policy.v3'));
 assert.equal(after.characters.qingxiao,undefined);
 assert.deepEqual(after.characters.augusta,saved.characters.augusta);
 assert.equal(await clearOwnedImproveOverrides('qingxiao',storage,store),false);
 const pending={...after,pendingV2Characters:{qingxiao:{original:'retained'}}};
 data.set('bellibing.improve.policy.v3',JSON.stringify(pending));
 await assert.rejects(clearOwnedImproveOverrides('qingxiao',storage,store),/Legacy Improve settings require review/);
 assert.deepEqual(JSON.parse(data.get('bellibing.improve.policy.v3')),pending);
});

test('Recommended reset uses latest owned policy bytes rather than a stale browser mirror',async()=>{
 const original={version:3,characters:{qingxiao:{schemaVersion:3,characterId:'qingxiao',mode:'MANUAL',overrides:{}},augusta:{keep:'old'}},pendingV2Characters:{}};
 const latest={...original,characters:{...original.characters,augusta:{keep:'latest'}},extension:{futureCompatibleData:'keep'}};
 const storage={getItem:key=>key==='bellibing.improve.policy.v3'?JSON.stringify(original):null};
 let saved=null;
 const store={snapshot:()=>({userData:{storage:{'bellibing.improve.policy.v3':JSON.stringify(latest)}}}),saveUserData:async(key,value)=>{assert.equal(key,'bellibing.improve.policy.v3');saved=JSON.parse(value);}};
 assert.equal(await clearOwnedImproveOverrides('qingxiao',storage,store),true);
 assert.equal(saved.characters.qingxiao,undefined);
 assert.deepEqual(saved.characters.augusta,{keep:'latest'});
 assert.deepEqual(saved.extension,latest.extension);
});
