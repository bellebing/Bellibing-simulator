import test from 'node:test';
import assert from 'node:assert/strict';
import {improveProductEchoDefault,CRIT_DPS_PRODUCT_SCOPE} from '../src/improveProductEchoDefaults.mjs';
import {CHARACTER_GUIDE_RECOMMENDATIONS} from '../src/data/characterEquipmentAssociations.ts';
import {initialSettings,restoreRecommendedSettings} from '../docs/ui-lab/v1.1/modules/settings-state.js';
import {restoreProductEchoDefaults} from '../docs/ui-lab/v1.1/modules/product-echo-defaults.js';
import {ECHO_SETTING_STATS} from '../docs/ui-lab/v1.1/modules/settings-catalog.js';
import {expectedTunerReason,createStatTargetCost} from '../docs/ui-lab/v1.1/modules/stat-target-cost.js';
import {clearOwnedImproveOverrides} from '../docs/ui-lab/v1.1/modules/account-settings.js';

const presets=CHARACTER_GUIDE_RECOMMENDATIONS.map(row=>row.characterId).filter(id=>improveProductEchoDefault(id));
const state=id=>({id,...initialSettings(id),accountProjection:{}});

test('bounded reviewed owner product coverage: 26 unambiguous CRIT DPS; 33 Pending including all special/supports',()=>{
 assert.equal(CHARACTER_GUIDE_RECOMMENDATIONS.length,59);
 assert.equal(CRIT_DPS_PRODUCT_SCOPE.length,26);
 assert.equal(presets.length,26);
 assert.deepEqual(new Set(presets),new Set(CRIT_DPS_PRODUCT_SCOPE));
 for(const id of ['baizhi','verina','the-shorekeeper','mornye','taoqi','yuanwu','cartethyia','jingran','suisui','hiyuki','brant','iuno','lupa','yinlin'])
  assert.equal(improveProductEchoDefault(id),null,id+' must not inherit generic CRIT Hard');
 assert.equal(improveProductEchoDefault('augusta'),null,'Augusta owns its separate prior user-approved configuration');
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
 assert.deepEqual(support.statSections.hard,[]);assert.equal(support.flexCount,null);
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
