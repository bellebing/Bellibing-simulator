import test from 'node:test';
import assert from 'node:assert/strict';
import {localObservedAdvice} from '../docs/ui-lab/v1.1/modules/local-improve-advice.js';
import {localAdviceSummary} from '../docs/ui-lab/v1.1/modules/improve-decision-view.js';
import {statPreference,rollPresentation} from '../docs/ui-lab/v1.1/modules/stat-guidance.js';
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
 const result=await localObservedAdvice(input(),{targetAdvice:async()=>{throw Error('unavailable');},capture,teamReview:async()=>({result:{status:'EXPERIMENTAL',delta:{teamTotal:20}}})});
 assert.equal(result.winner,null);assert.equal(result.decision,'Target advice unavailable');
});
test('Chisa reuses reviewed priorities and canonical high-roll presentation',()=>{
 assert.match(statPreference('chisa','CRIT DMG'),/wb-stat-priority/);
 assert.equal(statPreference('chisa','Flat DEF'),'');
 assert.match(rollPresentation('CRIT DMG',.21,'21%'),/wb-roll-upper/);
 assert.equal(rollPresentation('CRIT DMG',.211,'21.1%'),'21.1%');
});
