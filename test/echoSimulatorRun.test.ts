import test from 'node:test';
import assert from 'node:assert/strict';
import { SeededRng } from '../src/seededRng.ts';
import { startEchoSimulator, selectSimulatorSlot, simulatedEchoSlots } from '../src/echoSimulatorSession.ts';
import { placeSimulatorCandidate, rollSimulatorCandidate } from '../src/echoSimulatorRolling.ts';
import { advanceSimulatorRun, beginSimulatorRun, initializeSimulatorResources, resumeSimulatorRun, simulatorTubeWitness, stopSimulatorRun } from '../src/echoSimulatorRun.ts';
import { emptyResourceInventory, ECHO_TUBES } from '../src/resourceInventory.ts';
import { assessEchoRequirements } from '../src/echoRequirements.ts';
import { MAX_RANK5_ECHO_EXP } from '../src/echoExactTubeSpending.ts';
import type { EchoRequirements } from '../src/improvePolicyDomain.ts';
import { scrubResourceValue, attachResourceScrubber } from '../docs/ui-prototypes/assets/resource-scrubber.mjs';
import { projectVerifiedEchoWorkspaceLoadoutProfiles } from '../src/echoWorkspaceRecommendationProjection.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
const template = { echoId:'echo-60001215',selectedSonataSetId:'sonata-20',cost:4 as const,primaryMainStat:'CRIT Rate' as const };
const unlimited = {kind:'UNLIMITED'} as const, finite = (count:number) => ({kind:'FINITE' as const,count});
const budget = () => ({...emptyResourceInventory(),echoes:unlimited,tuners:unlimited,tubes:{premium:unlimited,advanced:unlimited,medium:unlimited,basic:unlimited}});
const requirements: EchoRequirements = {requiredOnEveryEcho:[{stat:'CRIT Rate',minimum:.063},{stat:'CRIT DMG',minimum:.126}],groups:[{id:'selected-flex',minimumCount:2,members:[{stat:'ATK%',minimum:.064},{stat:'Energy Regen',minimum:.068},{stat:'Heavy Attack DMG',minimum:.064}]}]};
const prepare = (inventory = budget(), req = requirements) => beginSimulatorRun(initializeSimulatorResources(startEchoSimulator('augusta',{weaponId:'real'},'run'),inventory),template,req,10);

test('multiple failures repeat, spend, and stop on first ALL Hard / N distinct Flex success',()=>{
  const original=prepare(), rng=new SeededRng(52);let session=original;
  const saved=JSON.stringify(original.resources!.basis);
  while(session.run!.status==='RUNNING') session=advanceSimulatorRun(session,rng,4,10000);
  assert.equal(session.run!.status,'SUCCESS');assert.ok(session.rolling.attempts>2);
  const candidate=session.slots[0].candidate!;
  assert.equal(assessEchoRequirements(requirements,{rank:5,level:25,substats:candidate.card.substats!}).status,'SATISFIED');
  assert.equal(session.slots[0].trash.length,session.rolling.attempts-1);
  for(const failed of session.slots[0].trash)assert.equal(assessEchoRequirements(requirements,{rank:5,level:25,substats:failed.card.substats!}).status,'IMPOSSIBLE');
  assert.equal(session.rolling.tuners,50*session.rolling.attempts);
  assert.deepEqual(candidate.history.slice(1).map(row=>row.level),[0,5,10,15,20,25]);
  assert.equal(JSON.stringify(session.resources!.basis),saved);
  assert.deepEqual(advanceSimulatorRun(session,rng),session);
  assert.equal(session.resources!.lastLedger!.expAfter,MAX_RANK5_ECHO_EXP);
  assert.ok(session.resources!.lastLedger!.unrepresentableEXP<500);
  assert.ok(session.resources!.lastLedger!.returned.basic===0);
  assert.equal(session.evaluator.status,'PENDING');
  assert.equal(original.rolling.attempts,0);
});

test('finite zero, insufficient full attempt, invalid/impossible intent and RNG are atomic',()=>{
  for(const inventory of [{...budget(),echoes:finite(0)},{...budget(),tuners:finite(0)},{...budget(),tuners:finite(49)},{...budget(),tubes:emptyResourceInventory().tubes}]){
    const session=prepare(inventory),next=advanceSimulatorRun(session,new SeededRng(1));
    assert.equal(next.run!.status,'EXHAUSTED');assert.deepEqual(next.resources,session.resources);assert.equal(next.rolling.attempts,0);assert.equal(next.slots[0].candidate,null);
  }
  for(const req of [{requiredOnEveryEcho:[{stat:'CRIT Rate',minimum:99}],groups:[]},{requiredOnEveryEcho:[],groups:[{id:'g',minimumCount:6,members:requirements.groups[0].members}]},{requiredOnEveryEcho:[{stat:'made up'}],groups:[]}]){
    const session=prepare(budget(),req), next=advanceSimulatorRun(session,new SeededRng(1));assert.equal(next.run!.status,'BLOCKED');assert.equal(next.rolling.attempts,0);
  }
  const session=prepare(),next=advanceSimulatorRun(session,{next:()=>NaN});assert.equal(next.run!.status,'BLOCKED');assert.deepEqual(next.resources,session.resources);assert.deepEqual(next.slots,session.slots);assert.deepEqual(next.rolling,session.rolling);
});

test('finite failed rolls deplete inventory without recovery; bounded pause, resume and cancel',()=>{
  const inventory={...budget(),echoes:finite(3),tuners:finite(150),tubes:{premium:finite(90),advanced:finite(0),medium:finite(0),basic:finite(0)}};
  // Deterministic canonical roll does not contain the two required CRIT types.
  let session=prepare(inventory);session=advanceSimulatorRun(session,{next:()=>0},4,2);
  assert.equal(session.run!.status,'PAUSED');assert.equal(session.rolling.attempts,2);
  assert.equal(session.resources!.inventory.echoes.kind,'FINITE');assert.equal((session.resources!.inventory.echoes as any).count,1);
  assert.equal(session.resources!.spent.premium,58);assert.equal(session.resources!.returned.advanced,2);
  const paused=structuredClone(session);assert.deepEqual(advanceSimulatorRun(session,{next:()=>0}),paused);
  session=advanceSimulatorRun(resumeSimulatorRun(session),{next:()=>0},4,2);
  assert.equal(session.run!.status,'EXHAUSTED');assert.equal(session.rolling.attempts,3);assert.equal(session.slots[0].trash.length,3);
  const cancelled=stopSimulatorRun(paused);assert.equal(cancelled.run!.status,'CANCELLED');assert.deepEqual(advanceSimulatorRun(cancelled,{next:()=>0}),cancelled);
});

test('five slots keep inspectable success, manual replacement and real build isolation',()=>{
  let session=initializeSimulatorResources(startEchoSimulator('augusta',{echoSets:{activeSetId:'s',sets:{s:{slots:Array(5).fill('real')}}}},'run'),budget());const source=JSON.stringify(session.source);
  for(const slot of [5,2,4,1,3]){
    session=selectSimulatorSlot(session,slot);session=advanceSimulatorRun(beginSimulatorRun(session,template,{requiredOnEveryEcho:[],groups:[]},25),new SeededRng(slot));assert.equal(session.run!.status,'SUCCESS');session=placeSimulatorCandidate(session);
  }
  assert.equal(simulatedEchoSlots(session).filter(Boolean).length,5);assert.equal(JSON.stringify(session.source),source);
  session=advanceSimulatorRun(beginSimulatorRun(session,template,{requiredOnEveryEcho:[],groups:[]},25),new SeededRng(999));assert.throws(()=>placeSimulatorCandidate(session),/confirmation/);session=placeSimulatorCandidate(session,true);assert.equal(session.slots[2].accepted.length,2);
});

test('bounded witness respects stock, exact minimum supplied EXP and denomination arithmetic',()=>{
  for(let seed=0;seed<40;seed++){
    const inventory={...budget(),tubes:{premium:finite(seed%4+29),advanced:finite(seed%7),medium:finite(seed%3),basic:finite(seed%5)}};
    const witness=simulatorTubeWitness(inventory);assert.ok(witness);
    const supplied=ECHO_TUBES.reduce((sum,tube)=>sum+witness[tube.id]*tube.echoExp,0);
    let minimum=Infinity;
    for(let p=0;p<=inventory.tubes.premium.count;p++)for(let a=0;a<=inventory.tubes.advanced.count;a++)for(let m=0;m<=inventory.tubes.medium.count;m++)for(let b=0;b<=inventory.tubes.basic.count;b++){const exp=p*5000+a*2000+m*1000+b*500;if(exp>=MAX_RANK5_ECHO_EXP)minimum=Math.min(minimum,exp)}
    assert.equal(supplied,minimum);
    for(const tube of ECHO_TUBES)assert.ok(witness[tube.id]<=inventory.tubes[tube.id].count);
  }
  const huge={...budget(),tubes:{premium:finite(Number.MAX_SAFE_INTEGER),advanced:unlimited,medium:finite(37),basic:finite(11)}};assert.ok(simulatorTubeWitness(huge));
});

test('scrubber every integer, finite soft detents, fractional motion, uneven and large values',()=>{
  for(let start=-1;start<150;start++)assert.equal(scrubResourceValue(start,0),start);
  for(let wanted=-1;wanted<150;wanted++)assert.ok(Array.from({length:4000},(_,n)=>scrubResourceValue(17,(n-2000)*.5)).includes(wanted));
  for(const detent of [-1,0,5,10,20]){assert.equal(scrubResourceValue(detent,1.1),detent);assert.ok(scrubResourceValue(detent,50)>detent);if(detent>0)assert.ok(scrubResourceValue(detent,-50)<detent)}
  assert.equal(scrubResourceValue(37,1.25),37);assert.equal(scrubResourceValue(37,6.25),38);assert.equal(scrubResourceValue(123456789,600),123456889);
  assert.equal(scrubResourceValue(Number.MAX_SAFE_INTEGER-2,6),Number.MAX_SAFE_INTEGER-1);assert.equal(scrubResourceValue(Number.MAX_SAFE_INTEGER,-6),Number.MAX_SAFE_INTEGER-1);
  assert.equal(scrubResourceValue(Number.MAX_SAFE_INTEGER,600),Number.MAX_SAFE_INTEGER);assert.equal(scrubResourceValue(7,-99999),-1);
});

test('Augusta reviewed main shell and main Echo are projected without invented remaining assignments',()=>{
  const profile=projectVerifiedEchoWorkspaceLoadoutProfiles().find(row=>row.characterId==='augusta')!;
  assert.deepEqual(profile.slotMainStats,['CRIT Rate','Electro DMG','Electro DMG','ATK%','ATK%']);assert.equal(profile.mainEchoId,template.echoId);assert.deepEqual(profile.sonataSetIds,['sonata-20','sonata-3']);
  const main=ECHO_CATALOG.find(row=>row.id===profile.mainEchoId)!;assert.equal(main.releaseStatus,'RELEASED');assert.equal(main.cost,profile.slotCosts[0]);assert.ok(main.sonataSetIds.some(id=>profile.sonataSetIds.includes(id)));assert.equal(Object.hasOwn(profile,'slotEchoIds'),false);
});


test('scrubber clicks, cancellation, lost capture and exact keyboard commits preserve domain intent',()=>{
  class Input extends EventTarget {
    value='37';disabled=false;captured=false;attrs=new Map<string,string>(); selected=false;
    classList={add(){},remove(){}};setAttribute(key:string,value:string){this.attrs.set(key,value)}removeAttribute(key:string){this.attrs.delete(key)}
    setPointerCapture(){this.captured=true}hasPointerCapture(){return this.captured}releasePointerCapture(){this.captured=false}focus(){}select(){this.selected=true}
  }
  const input=new Input();const saved:string[]=[];attachResourceScrubber(input,()=>saved.push(input.value));
  const fire=(type:string, x=0,extra={})=>{const event=new Event(type,{cancelable:true});Object.assign(event,{pointerId:1,clientX:x,button:0,...extra});input.dispatchEvent(event)};
  fire('pointerdown',100);fire('pointerup',100);assert.equal(input.value,'37');assert.equal(saved.length,0);assert.ok(input.selected);
  fire('pointerdown',100);fire('pointermove',100.5);assert.equal(input.value,'37');fire('pointermove',160);assert.equal(input.value,'47');fire('pointercancel',160);assert.equal(input.value,'37');assert.equal(saved.length,0);
  fire('pointerdown',100);fire('pointermove',700);fire('lostpointercapture');assert.equal(input.value,'37');assert.equal(saved.length,0);
  fire('pointerdown',100);fire('pointermove',160);fire('pointerup',160);assert.deepEqual(saved,['47']);
  input.value='0';fire('keydown',0,{key:'ArrowDown'});assert.equal(saved.at(-1),'∞');fire('keydown',0,{key:'ArrowUp'});assert.equal(saved.at(-1),'0');
  input.value='invalid';fire('pointerdown',100);fire('pointermove',160);fire('pointerup',160);assert.equal(input.value,'invalid');assert.equal(saved.length,3);
});
