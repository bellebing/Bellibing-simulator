import test from 'node:test';
import assert from 'node:assert/strict';
import {createImproveSearchClient} from '../docs/ui-lab/v1.1/modules/improve-search-client.js';
const pause=()=>new Promise(resolve=>setTimeout(resolve,400));
const input=()=>({useReference:true,teamInput:{selectedCharacterId:'augusta',team:{id:'reference'},records:[{characterId:'augusta',buildState:{sequenceLevel:3,weaponId:'weapon',echoSets:{activeSetId:'a',sets:{a:{slots:Array.from({length:5},(_,i)=>({echoId:'echo-'+i,cost:1,mainStat:{name:'ATK%'},substats:[]}))}}}}}]},slot:0,gate:15,plan:{dpsEnabled:true,minimumDpsPercent:95},erTarget:{enabled:true,valuePercent:120}});
test('Improve sends Gate and ER with the selected saved build without mutating it',async()=>{
 const raw=input(),before=structuredClone(raw),requests=[],results=[];
 const client=createImproveSearchClient({readInput:()=>raw,onResult:r=>results.push(r),fetchImpl:async(_,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({protocol:'BELLIBING_IMPROVE_SEARCH_V1',result:{status:'ESTIMATED'}})};}});
 await client.refresh();await pause();
 assert.equal(requests[0].current.baseline.sequenceLevel,3);assert.equal(requests[0].referenceScenario.baseline.sequenceLevel,3);
 assert.equal(requests[0].gate,15);assert.equal(requests[0].erTarget,120);
 assert.equal(results.at(-1).characterId,'augusta');assert.equal(results.at(-1).useReference,true);
 assert.deepEqual(raw,before);
});

test('preview template is separate from all five equipped ranking templates',async()=>{
 const raw=input(),requests=[];raw.template={echoId:'preview-species',cost:4,selectedSonataSetId:'preview-set',mainStatName:'CRIT DMG'};
 const before=structuredClone(raw);
 const client=createImproveSearchClient({readInput:()=>raw,onResult:()=>{},fetchImpl:async(_,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({protocol:'BELLIBING_IMPROVE_SEARCH_V1',result:{status:'ESTIMATED'}})};}});
 await client.refresh();await pause();
 assert.equal(requests[0].templates[0].cost,1);assert.equal(requests[0].templates[0].mainStat.name,'ATK%');
 assert.equal(requests[0].candidateTemplate.speciesId,'preview-species');assert.equal(requests[0].candidateTemplate.mainStat.name,'CRIT DMG');assert.deepEqual(raw,before);
});
test('disabled optimisation stops requests and rejects a late response',async()=>{
 let raw=input(),resolveReply;const results=[];
 const client=createImproveSearchClient({readInput:()=>raw,onResult:r=>results.push(r),fetchImpl:()=>new Promise(resolve=>{resolveReply=resolve;})});
 await client.refresh();await pause();
 raw={...raw,plan:{...raw.plan,dpsEnabled:false}};await client.refresh();
 resolveReply({ok:true,json:async()=>({protocol:'BELLIBING_IMPROVE_SEARCH_V1',result:{status:'ESTIMATED'}})});await pause();
 assert.equal(results.at(-1).status,'DISABLED');assert.equal(results.filter(r=>r.status==='ESTIMATED').length,0);
});


test('a busy private worker is retried instead of leaving the latest roll stuck',async()=>{
 const raw=input(),results=[];let calls=0;
 const client=createImproveSearchClient({readInput:()=>raw,onResult:r=>results.push(r),fetchImpl:async()=>++calls===1?{status:429}:{status:200,ok:true,json:async()=>({protocol:'BELLIBING_IMPROVE_SEARCH_V1',result:{status:'ESTIMATED'}})}});
 await client.refresh();await new Promise(resolve=>setTimeout(resolve,1000));
 assert.equal(calls,2);assert.equal(results.at(-1).status,'ESTIMATED');
});


test('empty owned slots stay empty in Current and use separate future replacement templates',async()=>{
 const raw=input();raw.teamInput.records[0].buildState.echoSets.sets.a.slots[4]=null;const before=structuredClone(raw),requests=[];
 const client=createImproveSearchClient({readInput:()=>raw,onResult:()=>{},fetchImpl:async(_,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({protocol:'BELLIBING_IMPROVE_SEARCH_V1',result:{status:'ESTIMATED'}})};}});
 await client.refresh();await pause();assert.equal(requests.length,1);assert.equal(requests[0].current.cards[4],null);assert.ok(requests[0].templates[4]?.mainStat.name);assert.deepEqual(raw,before);
});

test('own-team mode reports missing actual investments instead of silently using a reference team',async()=>{
 const {own,team}=await import('./helpers/localTeamFixture.mjs'),raw=input();raw.useReference=false;raw.teamInput={mode:'IMPROVE',selectedCharacterId:'augusta',team,records:own().records,scope:{},actualInvestments:{}};
 let requests=0;const results=[];
 const client=createImproveSearchClient({readInput:()=>raw,onResult:r=>results.push(r),fetchImpl:async()=>{requests++;throw Error('unexpected fallback');}});
 await client.refresh();await pause();assert.equal(requests,0);assert.equal(results.at(-1).reason,'ENTER_ACTUAL_TEAM_INVESTMENTS');
});
