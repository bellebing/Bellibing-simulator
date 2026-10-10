import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SeededRng } from '../src/seededRng.ts';
import { emptyResourceInventory } from '../src/resourceInventory.ts';
import { beginSimulatorExecution, advanceSimulatorRun, initializeSimulatorResources, resumeSimulatorRun, stopSimulatorRun } from '../src/echoSimulatorRun.ts';
import { startEchoSimulator, selectSimulatorSlot, simulatedEchoSlots, simulatorEquipmentSlots, setSimulatorEchoActive, setSimulatorWeaponActive, resetEchoSimulator } from '../src/echoSimulatorSession.ts';
import type { SimulatorTemplate } from '../src/echoSimulatorRun.ts';
import { projectStaticBuildStats } from '../src/buildStatProjection.mjs';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { ECHO_LOADOUT_PROFILES } from '../src/data/echoLoadoutProfiles.ts';

const finite = (count: number) => ({kind:'FINITE' as const,count});
const unlimited = {kind:'UNLIMITED'} as const;
const budget = (echoes = 5) => ({...emptyResourceInventory(),echoes:finite(echoes),tuners:finite(250),tubes:{premium:finite(145),advanced:finite(0),medium:finite(0),basic:finite(0)}});
const profile = ECHO_LOADOUT_PROFILES.find(row=>row.id==='augusta-standard-echoes')!;
const used = new Set<string>();
const templates: SimulatorTemplate[] = profile.slots.map((slot,index)=>{
  const set=index<3?'sonata-20':'sonata-3';
  const item=ECHO_CATALOG.find(row=>row.id===profile.mainEchoId&&index===0)??ECHO_CATALOG.find(row=>row.cost===slot.cost&&row.sonataSetIds.includes(set)&&!used.has(row.id))!;
  used.add(item.id);
  assert.equal(item.cost,slot.cost);assert.ok(item.sonataSetIds.includes(set));assert.equal(item.releaseStatus,'RELEASED');
  return {echoId:item.id,selectedSonataSetId:set,cost:slot.cost,primaryMainStat:slot.primaryMainStats[0].stat as SimulatorTemplate['primaryMainStat']};
});
const noRequirements={requiredOnEveryEcho:[],groups:[]};
const real={weaponId:'owned',sequenceLevel:1,echoSets:{activeSetId:'real',sets:{real:{slots:Array(5).fill('owned')}}}};
const prepare=(inventory=budget())=>initializeSimulatorResources(startEchoSimulator('augusta',real,'set-test'),inventory);
const finish=(state:ReturnType<typeof prepare>,seed=21)=>{const rng=new SeededRng(seed);while(state.run?.status==='RUNNING')state=advanceSimulatorRun(state,rng,1);return state};

test('Full Set progressively activates exactly five canonical cards with one finite budget; parity with sequential one-slot execution',()=>{
  const input=prepare(),bytes=JSON.stringify(input.resources!.basis);let set=beginSimulatorExecution(input,templates,'FULL_SET',noRequirements,25);
  const rng=new SeededRng(21);
  for(let index=0;index<5;index++){
    set=advanceSimulatorRun(set,rng,1);
    assert.equal(simulatedEchoSlots(set).filter(Boolean).length,index+1);
    assert.deepEqual(set.run!.completedSlots,Array.from({length:index+1},(_,n)=>n+1));
    assert.equal(set.slots[index].candidate!.history.length,7);
    assert.equal(set.slots[index].accepted.length,1);
  }
  assert.equal(set.run!.status,'SUCCESS');assert.equal(set.rolling.attempts,5);assert.equal(set.rolling.tuners,250);
  assert.equal(JSON.stringify(set.resources!.basis),bytes);assert.deepEqual(set.source.build,real);
  let sequential=input;const sameRng=new SeededRng(21);
  for(let slot=1;slot<=5;slot++)sequential=advanceSimulatorRun(beginSimulatorExecution(selectSimulatorSlot(sequential,slot),templates,'ONE_SLOT',noRequirements,25),sameRng,1);
  assert.deepEqual(set.resources,sequential.resources);assert.deepEqual(simulatedEchoSlots(set),simulatedEchoSlots(sequential));
  assert.deepEqual(input.resources!.inventory,budget());assert.equal(input.rolling.attempts,0);
});

test('partial exhaustion retains finished equipment and checkpoints, actual spending and no recovery for incomplete slots',()=>{
  const result=finish(beginSimulatorExecution(prepare(budget(2)),templates,'FULL_SET',noRequirements,25));
  assert.equal(result.run!.status,'EXHAUSTED');assert.deepEqual(result.run!.completedSlots,[1,2]);
  assert.equal(result.selectedSlot,3);assert.equal(result.rolling.attempts,2);assert.equal(result.rolling.tuners,100);
  assert.equal(simulatorEquipmentSlots(result).filter(Boolean).length,2);assert.equal(result.slots[2].candidate,null);
  assert.equal(result.resources!.spent.premium,58);assert.equal(result.resources!.returned.advanced,2);
  assert.equal(result.resources!.returned.medium,0);assert.equal(result.slots[0].candidate!.history.at(-1)!.level,25);
  for(const inventory of [budget(0),{...budget(),tuners:finite(49)},{...budget(),tubes:emptyResourceInventory().tubes}]){
    const original=beginSimulatorExecution(prepare(inventory),templates,'FULL_SET',noRequirements,25);
    const blocked=advanceSimulatorRun(original,new SeededRng(1));assert.equal(blocked.run!.status,'EXHAUSTED');assert.deepEqual(blocked.resources,original.resources);assert.deepEqual(blocked.slots,original.slots);
  }
});

test('inactive equipment contributes zero through canonical projection; repeated Echo and Weapon toggles preserve cards and real equipment',()=>{
  const data=JSON.parse(readFileSync('docs/ui-prototypes/assets/echoes/browser-data.json','utf8'));
  const character={element:'Electro',level90:{hp:10300,atk:463,def:1112},baseCombat:{critRate:.05,critDamage:1.5,energyRegen:1}};
  const weapon={level90BaseAtk:587,secondary:{stat:'CRIT Rate',value:.243}};
  const project=(state:ReturnType<typeof prepare>)=>projectStaticBuildStats({character,weapon:state.weaponActive?weapon:null,echoSlots:simulatedEchoSlots(state),echoStatContract:data.statEditor});
  const input=prepare(),baseline=project(input);assert.throws(()=>setSimulatorEchoActive(input,1,true),/Generate/);
  let result=finish(beginSimulatorExecution(input,templates,'ONE_SLOT',noRequirements,25));const active=project(result),card=simulatorEquipmentSlots(result)[0];
  assert.notDeepEqual(active,baseline);
  const history=JSON.stringify(result.slots[0].accepted),resource=JSON.stringify(result.resources);
  for(let n=0;n<8;n++){
    result=setSimulatorEchoActive(result,1,false);assert.deepEqual(project(result),baseline);assert.deepEqual(simulatorEquipmentSlots(result)[0],card);
    result=setSimulatorEchoActive(result,1,true);assert.deepEqual(project(result),active);
  }
  result=setSimulatorEchoActive(result,1,false);result=setSimulatorWeaponActive(result,false);
  assert.equal(project(result).atk,463);assert.equal(project(result).critRate,.05);
  result=setSimulatorWeaponActive(result,true);assert.deepEqual(project(result),baseline);
  assert.equal(JSON.stringify(result.slots[0].accepted),history);assert.equal(JSON.stringify(result.resources),resource);assert.deepEqual(result.source.build,real);
  assert.deepEqual(simulatorEquipmentSlots(resetEchoSimulator(result,'reset')),Array(5).fill(null));
});

test('requirements failures, explicit unlimited, atomic RNG failure, cancel and resumable Full Set safety pause use the same driver',()=>{
  const allUnlimited={...budget(),echoes:unlimited,tuners:unlimited,tubes:{premium:unlimited,advanced:unlimited,medium:unlimited,basic:unlimited}};
  const req={requiredOnEveryEcho:[{stat:'CRIT Rate',minimum:.105}],groups:[]};
  const original=beginSimulatorExecution(prepare(allUnlimited),templates,'FULL_SET',req,25);
  let result=advanceSimulatorRun(original,{next:()=>0},2,2);assert.equal(result.run!.status,'PAUSED');assert.equal(result.rolling.attempts,2);assert.equal(result.slots[0].trash.length,2);
  result=advanceSimulatorRun(resumeSimulatorRun(result),{next:()=>0},1,2);assert.equal(result.rolling.attempts,3);
  const cancelled=stopSimulatorRun(result);assert.equal(cancelled.run!.status,'CANCELLED');assert.deepEqual(advanceSimulatorRun(cancelled,{next:()=>0}),cancelled);
  const invalid=advanceSimulatorRun(original,{next:()=>NaN});assert.equal(invalid.run!.status,'BLOCKED');assert.deepEqual(invalid.resources,original.resources);assert.deepEqual(invalid.slots,original.slots);
  const success=finish(beginSimulatorExecution(prepare(allUnlimited),templates,'FULL_SET',noRequirements,25));assert.equal(success.rolling.attempts,5);assert.deepEqual(success.resources!.inventory,allUnlimited);assert.ok(success.resources!.spent.premium>0);
});
