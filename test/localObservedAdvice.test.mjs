import test from 'node:test';
import assert from 'node:assert/strict';
import {localObservedAdvice} from '../docs/ui-lab/v1.1/modules/local-improve-advice.js';
import {localAdviceSummary} from '../docs/ui-lab/v1.1/modules/improve-decision-view.js';
import {statPreference,rollPresentation} from '../docs/ui-lab/v1.1/modules/stat-guidance.js';
import {createStatTargetCost} from '../docs/ui-lab/v1.1/modules/stat-target-cost.js';
import {manualTargetExpectedCost} from '../docs/ui-lab/v1.1/modules/improve-feedback.js';
import {improveProductEchoDefault} from '../src/improveProductEchoDefaults.mjs';
import {ECHO_SETTING_STATS} from '../docs/ui-lab/v1.1/modules/settings-catalog.js';
const input=()=>({slot:2,candidate:{level:25,substats:[{name:'CRIT Rate',value:.093}]},gate:5,target:{},currentInput:{mode:'IMPROVE'}});
const targetAdvice=async()=>({result:{status:'VERIFIED',winner:'DISCARD',goal:{},continue:{tuners:{approximate:100}},discard:{tuners:{approximate:90}}}});
const capture=async input=>({status:'CAPTURED',payload:{current:{},candidate:input.candidates[2],slots:[2]}});
test('completed target failure stays independent of a positive DPS comparison',async()=>{
 const body=input(),before=structuredClone(body);
 const result=await localObservedAdvice(body,{targetAdvice,capture,teamReview:async()=>({result:{status:'EXPERIMENTAL',delta:{teamTotal:50},current:{teamTotal:1000},candidate:{teamTotal:1050}}})});
 assert.equal(result.goalStatus,'NOT_MET');assert.equal(result.winner,null);assert.equal(result.decision,'Start new Echo');
 assert.equal(result.scope,'MANUAL_ECHO_TARGETS_ONLY');assert.deepEqual(body,before);
});
test('partial rolls retain goal advice without inventing future DPS or replacement cost',async()=>{
 let reviews=0;const body=input();body.candidate.level=5;
 const result=await localObservedAdvice(body,{targetAdvice,capture,teamReview:async()=>{reviews++;}});
 assert.equal(reviews,0);assert.equal(result.scope,'MANUAL_ECHO_TARGETS_ONLY');assert.equal(result.decision,'Start new Echo');
 assert.equal(result.winner,null);assert.match(localAdviceSummary(result),/gross Tuners/);
});
test('unavailable DPS never authorizes retaining a model upgrade',async()=>{
 const result=await localObservedAdvice(input(),{targetAdvice,capture,teamReview:async()=>({result:{status:'PENDING',reason:'WHOLE_TEAM_ENERGY_REQUIREMENT_NOT_MET',delta:null}})});
 assert.equal(result.winner,null);assert.equal(result.status,'TARGET_GUIDANCE');
});
test('target-service failure does not invoke or depend on the independent DPS service',async()=>{
 const result=await localObservedAdvice(input(),{targetAdvice:async()=>{throw Error('LOCAL_REVIEW_UNAVAILABLE');},capture,teamReview:async()=>({result:{status:'EXPERIMENTAL',delta:{teamTotal:20}}})});
 assert.equal(result.winner,null);assert.equal(result.decision,'Target advice unavailable');
 assert.deepEqual(result.targetGuidance,{status:'PENDING',reason:'LOCAL_REVIEW_UNAVAILABLE'});
 assert.match(localAdviceSummary(result),/Target calculator:.*local Echo calculator.*LOCAL_REVIEW_UNAVAILABLE/);
});
test('Chisa reuses reviewed priorities and canonical high-roll presentation',()=>{
 assert.match(statPreference('chisa','CRIT DMG'),/wb-stat-priority/);
 assert.equal(statPreference('chisa','Flat DEF'),'');
 assert.match(rollPresentation('CRIT DMG',.21,'21%'),/wb-roll-upper/);
 assert.equal(rollPresentation('CRIT DMG',.211,'21.1%'),'21.1%');
});

// Exact live product target at the public/private boundary. The stub below is
// explicitly a transport fixture, not a certified private calculation.
test('Yangyang Xuanling +5 forwards current canonical Hard/Flex and Gate unchanged',async()=>{
 const choice=improveProductEchoDefault('yangyang-xuanling');
 assert.deepEqual(choice.hard,['CRIT Rate','CRIT DMG']);
 assert.deepEqual(choice.flex,['Heavy Attack DMG','ATK%','Flat ATK']);
 assert.equal(choice.flexCount,1);
 const rows=names=>names.map(name=>({name,minimum:ECHO_SETTING_STATS.find(r=>r.id===name).tiers[0]}));
 const target={hard:rows(choice.hard),flex:rows(choice.flex),flexCount:choice.flexCount};
 const body={slot:0,target,gate:5,candidate:{level:5,substats:[{name:'CRIT Rate',value:.063}]}};
 const fixture={status:'VERIFIED',winner:'CONTINUE',certificate:{exactFixedPoint:true},targetChance:{approximate:.25},continue:{tuners:{approximate:70}},discard:{tuners:{approximate:100}}};
 const result=await localObservedAdvice(body,{targetAdvice:async request=>{
  assert.deepEqual(request,{target,gate:5,rolls:body.candidate.substats});
  return {result:fixture};
 }});
 assert.equal(result.decision,'Continue');
 assert.equal(manualTargetExpectedCost({targetGuidance:result.targetGuidance}).tuners,70);
});
test('fresh Expected Tuners preserves verified and SEARCH_LIMIT answers separately',async()=>{
 const target={hard:[{name:'CRIT Rate',minimum:.063}],flex:[],flexCount:0};
 const context={owner:{characterId:'yangyang-xuanling'},dpsPlan:{dpsEnabled:false},statTargets:[target],gate:5};
 let reply={result:{status:'BEFORE_GATE',certificate:{exactFixedPoint:true},continue:{tuners:{approximate:48}},discard:{tuners:{approximate:60}}}};
 const costs=createStatTargetCost({request:async()=>reply});
 costs.sync(context);await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(costs.read(context,0).tuners,48);
 reply={result:{status:'PENDING',reason:'SEARCH_LIMIT'}};
 const later={...context,gate:10};costs.sync(later);await new Promise(resolve=>setTimeout(resolve,0));
 const unavailable=costs.read(later,0);
 assert.equal(unavailable.status,'PENDING');assert.equal(unavailable.reasonCode,'SEARCH_LIMIT');
 assert.match(unavailable.reason,/exceeds the local calculator limit/);
 assert.equal(unavailable.tuners,undefined);
});
