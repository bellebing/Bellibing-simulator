// Public, character-free canonical reveals; analytical advice stays private.
import {VerifiedWuwaEchoRuntime} from './echoCoreRuntime.ts';
import {createRank5EchoAtLevel0} from './echoMainStats.ts';
import {checkpointIncrement} from './echoCoreRules.ts';
import {SeededRng} from './seededRng.ts';
import {readResourceInventory,ECHO_TUBES} from './resourceInventory.ts';
import {optimizeTubesToCheckpoint,tuneEligibleCheckpoint,checkpointEligibleAtEXP} from './echoExactTubeSpending.ts';
const clone=v=>structuredClone(v),identity=v=>JSON.stringify(v);
export function createInteractiveEchoSession({readContext,onChange=()=>{},requestAdvice,seedFactory=()=>crypto.randomUUID()}={}){
 const runtime=new VerifiedWuwaEchoRuntime();let binding=null,settings=null,session=null,rng=null,generation=0,controller=null,timer=null;
 const slots=new Map();let activeSlot=null;
 const totals=()=>{
  const result={echoes:0,tuners:0,tubes:Object.fromEntries(ECHO_TUBES.map(t=>[t.id,0])),returnedTubes:Object.fromEntries(ECHO_TUBES.map(t=>[t.id,0]))};
  for(const {session:s}of slots.values())if(s){result.echoes+=s.spent.echoes;result.tuners+=s.spent.tuners;for(const t of ECHO_TUBES){result.tubes[t.id]+=s.spent.tubes[t.id];result.returnedTubes[t.id]+=s.returned.tubes[t.id];}}
  return result;
 };
 const snapshot=()=>session?clone({...session,workspaceSpent:totals(),workspaceSlots:[...slots].map(([slot,entry])=>({slot,session:entry.session}))}):null,emit=()=>onChange(snapshot());
 function reset(){generation++;controller?.abort();clearTimeout(timer);session=null;rng=null;slots.clear();activeSlot=null;binding=null;settings=null;emit();}
 function sync(){
  const input=readContext(),{slot,...owner}=input.owner,next=identity(owner),changed=binding!==null&&binding!==next;
  if(changed){reset();}binding=next;
  if(activeSlot!==slot){
   if(activeSlot!==null)slots.set(activeSlot,{session,rng});
   generation++;controller?.abort();clearTimeout(timer);activeSlot=slot;
   const saved=slots.get(slot);session=saved?.session??null;rng=saved?.rng??null;settings=null;emit();
  }
  const nextSettings=identity({target:input.target,gate:input.gate,inventory:input.inventory,pending:input.pending,currentAdvice:input.currentAdvice});
  if(nextSettings!==settings){settings=nextSettings;if(session){session.advice=null;assess();}}
  return input;
 }
 function assess(){
  const input=readContext();if(!session)return;
  const token=++generation,expected=binding,context=settings;controller?.abort();clearTimeout(timer);session.advice=null;session.pending=input.pending??'CALCULATING';emit();
  if(input.pending)return;
  let body;try{body=input.currentAdvice?{target:clone(input.target),gate:input.gate,currentInput:clone(input.currentAdvice),slot:input.owner.slot,
   candidate:clone(session.candidate),inventory:remaining(input),progress:clone(session.progress),metric:'TEAM_DPS',seed:session.id,samples:8}
   :{target:clone(input.target),gate:input.gate,rolls:clone(session.candidate.substats)};
  }catch{session.pending='INSUFFICIENT_SESSION_BUDGET';emit();return;}
  timer=setTimeout(async()=>{try{controller=new AbortController();const reply=await requestAdvice(body,controller.signal);sync();
   if(token!==generation||expected!==binding||context!==settings||!session)return;
   if(reply.protocol!=='BELLIBING_ECHO_ADVICE_V1'||!reply.result)throw Error();
   const a=reply.result;if(['VERIFIED','BEFORE_GATE','TARGET_SUCCESS'].includes(a.status)){if(a.certificate?.exactFixedPoint!==true||a.checkpoint!==body.rolls.length*5||a.gate!==body.gate)throw Error();for(const side of [a.continue,a.discard]){if(!side)throw Error();if(side.chance&&(!Number.isFinite(side.chance.approximate)||side.chance.approximate<0||side.chance.approximate>1))throw Error();if(side.tuners&&(!Number.isFinite(side.tuners.approximate)||side.tuners.approximate<0))throw Error();}}
   session.advice=reply.result;session.pending=null;emit();
  }catch{if(token===generation&&session){session.pending='ADVICE_UNAVAILABLE';emit();}}},100);
 }
 function remaining(input){
  const inventory=readResourceInventory(input.inventory),spent=totals();
  const after=(q,n,r=0)=>{if(q.kind==='UNLIMITED')return clone(q);const count=q.count-n+r;if(!Number.isSafeInteger(count)||count<0)throw Error('INSUFFICIENT_SESSION_BUDGET');return {kind:'FINITE',count};};
  return {...inventory,echoes:after(inventory.echoes,spent?.echoes??0),tuners:after(inventory.tuners,spent?.tuners??0),
   tubes:Object.fromEntries(ECHO_TUBES.map(t=>[t.id,after(inventory.tubes[t.id],spent.tubes[t.id],spent.returnedTubes[t.id])]))};
 }
 function canPay(input,newEcho){
  const from=newEcho?0:session.candidate.level,tuners=checkpointIncrement(from,from+5).tuners;
  let state={revision:session?.revision??0,inventory:remaining(input),progress:newEcho?{cumulativeEchoEXP:0,tunedThrough:0}:clone(session.progress)},tubeLedger=null;
  for(const [key,extra]of [['tuners',tuners],['echoes',newEcho?1:0]]){const q=state.inventory[key];if(q.kind==='FINITE'&&extra>q.count)throw Error('INSUFFICIENT_'+key.toUpperCase());}
  if(checkpointEligibleAtEXP(state.progress.cumulativeEchoEXP)<from+5){
   const path=optimizeTubesToCheckpoint(state,from+5,state.revision)[0];if(!path)throw Error('INSUFFICIENT_TUBES');
   state=path.transaction.state;tubeLedger=clone(path.transaction.ledger);
  }
  state=tuneEligibleCheckpoint(state,state.revision);
  return {state,tubeLedger};
 }
 function advance(discard=false){
  const input=sync();if(input.pending)throw Error(input.pending);if(session?.aborted)throw Error('Reset aborted session');
  if(!discard&&session?.candidate.level===25)return snapshot();
  const freshTemplate=createRank5EchoAtLevel0({id:'validate-only',cost:input.template.cost,primaryMainStat:input.template.mainStatName});
  const resource=canPay(input,discard||!session);
  if(!session){const seed=seedFactory(),tubes=()=>Object.fromEntries(ECHO_TUBES.map(t=>[t.id,0]));session={id:'interactive:'+seed+':slot:'+activeSlot,revision:0,candidate:null,spent:{tuners:0,echoes:0,tubes:tubes()},returned:{tubes:tubes()},progress:{cumulativeEchoEXP:0,tunedThrough:0},history:[],advice:null,pending:null};}
  if(discard||!session.candidate){
   if(session.candidate)session.history.push({kind:'DISCARD',card:clone(session.candidate),recommended:session.advice?.winner??null});
   const seed=seedFactory(),template={...freshTemplate,id:session.id+':'+session.spent.echoes};rng=new SeededRng(seed);
   session.candidate={...runtime.acquireFresh(template,rng).echo,echoId:input.template.echoId,speciesId:input.template.echoId,selectedSonataSetId:input.template.selectedSonataSetId};session.spent.echoes++;
  }
  const step=runtime.rollNext(session.candidate,rng);session.candidate=step.echo;session.spent.tuners+=step.cost.tuners;session.revision++;
  session.progress=clone(resource.state.progress);
  if(resource.tubeLedger)for(const t of ECHO_TUBES){session.spent.tubes[t.id]+=resource.tubeLedger.spent[t.id];session.returned.tubes[t.id]+=resource.tubeLedger.returned[t.id];}
  slots.set(activeSlot,{session,rng});session.inventory=remaining(input);
  session.history.push({kind:'ROLL',card:clone(step.echo),tuners:step.cost.tuners,tubeLedger:resource.tubeLedger,progress:clone(session.progress)});assess();return snapshot();
 }
 return {sync,reset,snapshot,abort(){controller?.abort();generation++;clearTimeout(timer);if(session){session.aborted=true;session.pending='ABORTED';emit();}},advance:()=>advance(false),discard:()=>advance(true),refresh:assess};
}
