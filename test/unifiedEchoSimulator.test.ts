import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createEchoStatsEditorSelection} from '../src/echoStatEditor.ts';
import {startEchoSimulator,simulatedEchoSlots,simulatorEquipmentSlots,setSimulatorPreparedCard,setSimulatorEchoActive} from '../src/echoSimulatorSession.ts';
import {initializeSimulatorResources,beginSimulatorExecution,advanceSimulatorRun} from '../src/echoSimulatorRun.ts';
import {emptyResourceInventory,updateResourceInventory} from '../src/resourceInventory.ts';
import {SeededRng} from '../src/seededRng.ts';
const original={weaponId:'weapon',echoSets:{activeSetId:'owned',sets:{owned:{slots:['real',null,null,null,null]}}}};
const prepare=()=>initializeSimulatorResources(startEchoSimulator('augusta',original,'unified'),emptyResourceInventory());
const card=(cost:1|3|4=4)=>({...createEchoStatsEditorSelection(cost),substats:[],echoId:'echo',selectedSonataSetId:'sonata',rank:5});
test('prepared equipment uses the same slots without fabrication of paid outcomes or real writes',()=>{
 const current=prepare(),bytes=JSON.stringify(current),next=setSimulatorPreparedCard(current,1,card());
 assert.equal(simulatedEchoSlots(next)[0]!.prepared,true);assert.equal(next.slots[0].accepted.length,0);assert.equal(next.rolling.attempts,0);
 assert.deepEqual(next.resources,current.resources);assert.deepEqual(next.source.build,original);assert.equal(JSON.stringify(current),bytes);
 const inactive=setSimulatorEchoActive(next,1,false),edited=setSimulatorPreparedCard(inactive,1,card());
 assert.equal(simulatedEchoSlots(edited)[0],null);assert.ok(simulatorEquipmentSlots(edited)[0]);assert.ok(simulatedEchoSlots(setSimulatorEchoActive(edited,1,true))[0]);
});
test('invalid/manual COST and stat cards fail before changing the session',()=>{
 const current=prepare();assert.throws(()=>setSimulatorPreparedCard(current,1,{...card(),mainStat:{name:'ATK%',value:999}}),/Invalid/);
 let next=current;for(let slot=1;slot<=3;slot++)next=setSimulatorPreparedCard(next,slot,card());
 const bytes=JSON.stringify(next);assert.throws(()=>setSimulatorPreparedCard(next,4,card()),/COST limit/);assert.equal(JSON.stringify(next),bytes);
 assert.throws(()=>setSimulatorPreparedCard(current,0,card()),/1–5/);
});
test('Full Set replaces prepared cards with actual generated history on one detached budget',()=>{
 let inventory=emptyResourceInventory();for(const id of ['echoes','tuners','premium','advanced','medium','basic'] as const)inventory=updateResourceInventory(inventory,id,{kind:'UNLIMITED'});
 let next=initializeSimulatorResources(setSimulatorPreparedCard(prepare(),1,card()),inventory);
 const templates=([4,3,3,1,1] as const).map(cost=>({echoId:'echo',selectedSonataSetId:'sonata',cost,primaryMainStat:'ATK%' as const}));
 next=beginSimulatorExecution(next,templates,'FULL_SET',{requiredOnEveryEcho:[],groups:[]},25);
 assert.throws(()=>setSimulatorPreparedCard(next,1,card()),/Stop simulation/);
 const rng=new SeededRng(5);while(next.run?.status==='RUNNING')next=advanceSimulatorRun(next,rng,1);
 assert.equal(next.run!.status,'SUCCESS');assert.equal(next.rolling.attempts,5);assert.ok(simulatedEchoSlots(next).every(c=>c?.level===25));
 assert.ok(next.slots.every(s=>s.accepted.length===1));assert.deepEqual(next.resources!.basis,inventory);assert.deepEqual(next.source.build,original);
});
