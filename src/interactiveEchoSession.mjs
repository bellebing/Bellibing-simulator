// Public, character-free canonical reveals; analytical advice stays private.
import {VerifiedWuwaEchoRuntime} from './echoCoreRuntime.ts';
import {createRank5EchoAtLevel0,withRank5MainStatsAtLevel} from './echoMainStats.ts';
import {checkpointIncrement,assertExactRank5SubstatRoll} from './echoCoreRules.ts';
import {SeededRng} from './seededRng.ts';
import {readResourceInventory,ECHO_TUBES} from './resourceInventory.ts';
import {optimizeTubesToCheckpoint,tuneEligibleCheckpoint,checkpointEligibleAtEXP} from './echoExactTubeSpending.ts';
const clone=v=>structuredClone(v),identity=v=>JSON.stringify(v);
export function createInteractiveEchoSession({readContext,onChange=()=>{},requestAdvice,requestRecovery,seedFactory=()=>crypto.randomUUID(),mode='OBSERVED'}={}){
 if(!['OBSERVED','SIMULATOR'].includes(mode))throw Error('EXPLICIT_INTERACTIVE_MODE_REQUIRED');
 const runtime=new VerifiedWuwaEchoRuntime();let binding=null,settings=null,session=null,rng=null,generation=0,controller=null,timer=null;
 const slots=new Map();let activeSlot=null,ownerCharacter=null;
 const totals=()=>{
  const result={echoes:0,tuners:0,returnedTuners:0,tubes:Object.fromEntries(ECHO_TUBES.map(t=>[t.id,0])),returnedTubes:Object.fromEntries(ECHO_TUBES.map(t=>[t.id,0]))};
  for(const {session:s}of slots.values())if(s){result.echoes+=s.spent.echoes;result.tuners+=s.spent.tuners;result.returnedTuners+=s.returned.tuners;for(const t of ECHO_TUBES){result.tubes[t.id]+=s.spent.tubes[t.id];result.returnedTubes[t.id]+=s.returned.tubes[t.id];}}
  return result;
 };
 const comparisonCandidates=()=>Array.from({length:5},(_,slot)=>{const s=slots.get(slot)?.session;return clone(s?.candidate?.level===25&&s.advice?.winner==='KEEP_TEMPORARY'?s.candidate:s?.incumbent?.card??null);});
 const snapshot=()=>session?clone({...session,workspaceSpent:totals(),workspaceSlots:[...slots].map(([slot,entry])=>({slot,session:entry.session}))}):null,emit=()=>onChange(snapshot());
 function checkpoint(){
  if(mode!=='OBSERVED')throw Error('OBSERVED_CHECKPOINT_ONLY');
  return {version:1,kind:'OBSERVED_IMPROVE_CHECKPOINT',characterId:ownerCharacter,
   slots:[...slots].filter(([,entry])=>entry.session).map(([slot,entry])=>{
    const {advice,pending,inventory,recoveryPending,...facts}=clone(entry.session);return {slot,session:facts};
   })};
 }
 function resume(value){
  if(mode!=='OBSERVED'||value?.version!==1||value.kind!=='OBSERVED_IMPROVE_CHECKPOINT'||value.characterId!==readContext().owner.characterId||!Array.isArray(value.slots)||value.slots.length>5)throw Error('INVALID_OBSERVED_CHECKPOINT');
  const restored=new Map(),integer=n=>Number.isSafeInteger(n)&&n>=0;
  const card=echo=>{
   if(!echo||typeof echo.id!=='string'||![0,5,10,15,20,25].includes(echo.level)||echo.rank!==5||!Array.isArray(echo.substats)||echo.substats.length!==echo.level/5)throw Error('INVALID_OBSERVED_CARD');
   const expected=withRank5MainStatsAtLevel(createRank5EchoAtLevel0({id:echo.id,cost:echo.cost,primaryMainStat:echo.mainStat?.name}),echo.level);
   if(identity(expected.mainStat)!==identity(echo.mainStat)||identity(expected.secondaryMainStat)!==identity(echo.secondaryMainStat))throw Error('INVALID_OBSERVED_MAIN_STATS');
   const seen=new Set();for(const roll of echo.substats){assertExactRank5SubstatRoll(roll);if(seen.has(roll.name))throw Error('DUPLICATE_OBSERVED_STAT');seen.add(roll.name);}
  };
  for(const row of value.slots){
   const s=clone(row.session);if(!Number.isInteger(row.slot)||row.slot<0||row.slot>4||restored.has(row.slot)||typeof s?.id!=='string'||!integer(s.revision)||!Array.isArray(s.history))throw Error('INVALID_OBSERVED_SLOT');
   card(s.candidate);let previous=null,tuners=0,echoes=1,returnedTuners=0;
   const spentTubes=Object.fromEntries(ECHO_TUBES.map(t=>[t.id,0])),returnedTubes={...spentTubes};
   for(const event of s.history){
    card(event.card);
    if(event.kind==='OBSERVATION'){
     const prefix=previous?.substats??[];
     if(event.card.level!==(previous?.level??0)+5||identity(event.card.substats.slice(0,-1))!==identity(prefix)||previous&&event.card.id!==previous.id||event.tuners!==checkpointIncrement(event.card.level-5,event.card.level).tuners)throw Error('INVALID_OBSERVATION_HISTORY');
     tuners+=event.tuners;previous=event.card;
     if(event.tubeLedger)for(const t of ECHO_TUBES){const spent=event.tubeLedger.spent?.[t.id],returned=event.tubeLedger.returned?.[t.id];if(!integer(spent)||!integer(returned))throw Error('INVALID_OBSERVED_RECEIPT');spentTubes[t.id]+=spent;returnedTubes[t.id]+=returned;}
    }else if(['KEEP','DISCARD'].includes(event.kind)){
     if(!previous||identity(previous)!==identity(event.card))throw Error('INVALID_RESTART_HISTORY');
     if(event.recovery){const returns=event.recovery.ledger?.returned;if(!integer(returns?.tuners))throw Error('INVALID_RECOVERY_RECEIPT');returnedTuners+=returns.tuners;for(const t of ECHO_TUBES){if(!integer(returns.tubes?.[t.id]))throw Error('INVALID_RECOVERY_RECEIPT');returnedTubes[t.id]+=returns.tubes[t.id];}}
     previous=null;echoes++;
    }else throw Error('INVALID_OBSERVED_EVENT');
   }
   if(previous?identity(previous)!==identity(s.candidate):s.candidate.level!==0)throw Error('OBSERVED_PREFIX_MISMATCH');
   if(s.spent?.tuners!==tuners||s.spent.echoes!==echoes||s.returned?.tuners!==returnedTuners||ECHO_TUBES.some(t=>s.spent.tubes?.[t.id]!==spentTubes[t.id]||s.returned.tubes?.[t.id]!==returnedTubes[t.id]))throw Error('OBSERVED_LEDGER_MISMATCH');
   if(!integer(s.progress?.cumulativeEchoEXP)||s.progress.tunedThrough!==s.candidate.level)throw Error('INVALID_OBSERVED_PROGRESS');
   restored.set(row.slot,{session:{...s,advice:null,pending:'CALCULATING',recoveryPending:false},rng:null});
  }
  generation++;controller?.abort();clearTimeout(timer);slots.clear();for(const [slot,entry]of restored)slots.set(slot,entry);
  const input=readContext(),{slot,...owner}=input.owner;binding=identity(owner);ownerCharacter=owner.characterId;activeSlot=slot;session=slots.get(slot)?.session??null;rng=null;settings=null;
  sync();emit();return snapshot();
 }
 function resetSlot(){
  sync();generation++;controller?.abort();clearTimeout(timer);
  slots.delete(activeSlot);session=null;rng=null;settings=null;emit();return snapshot();
 }
 function reset(){generation++;controller?.abort();clearTimeout(timer);session=null;rng=null;slots.clear();activeSlot=null;binding=null;settings=null;emit();}
 function sync(){
  const input=readContext(),{slot,...owner}=input.owner,next=identity(owner),changed=binding!==null&&binding!==next;
  if(changed){if(mode==='OBSERVED'&&owner.characterId===ownerCharacter){generation++;controller?.abort();clearTimeout(timer);for(const entry of slots.values())if(entry.session){entry.session.advice=null;entry.session.pending='CALCULATING';}if(session){session.advice=null;session.pending='CALCULATING';}settings=null;}else reset();}binding=next;ownerCharacter=owner.characterId;
  if(activeSlot!==slot){
   if(activeSlot!==null)slots.set(activeSlot,{session,rng});
   generation++;controller?.abort();clearTimeout(timer);activeSlot=slot;
   const saved=slots.get(slot);session=saved?.session??null;rng=saved?.rng??null;settings=null;emit();
  }
  const nextSettings=identity({template:input.template,target:input.target,gate:input.gate,inventory:input.inventory,pending:input.pending,currentAdvice:input.currentAdvice});
  if(nextSettings!==settings){settings=nextSettings;if(session){session.advice=null;assess();}}
  return input;
 }
 function assess(){
  const input=readContext();if(!session)return;
  if(session.aborted){session.pending='ABORTED';emit();return;}
  const token=++generation,expected=binding,context=settings;controller?.abort();clearTimeout(timer);session.advice=null;session.pending=input.pending??'CALCULATING';emit();
  if(input.pending)return;
  if(mode==='OBSERVED'&&session.candidate.level===0){session.pending=null;emit();return;}
  let body;try{body=input.currentAdvice?{target:clone(input.target),gate:input.gate,currentInput:clone(input.currentAdvice),slot:input.owner.slot,
   candidate:clone(session.candidate),retainedCandidates:Array(5).fill(null),inventory:remaining(input),progress:clone(session.progress),metric:'TEAM_DPS',seed:session.id,samples:8}
   :{target:clone(input.target),gate:input.gate,rolls:clone(session.candidate.substats)};
  }catch{session.pending='INSUFFICIENT_SESSION_BUDGET';emit();return;}
  timer=setTimeout(async()=>{try{controller=new AbortController();const reply=await requestAdvice(body,controller.signal);sync();
   if(token!==generation||expected!==binding||context!==settings||!session)return;
   if(reply.protocol!=='BELLIBING_ECHO_ADVICE_V1'||!reply.result)throw Error();
   const a=reply.result;if(['VERIFIED','BEFORE_GATE','TARGET_SUCCESS'].includes(a.status)){if(a.certificate?.exactFixedPoint!==true||a.checkpoint!==body.rolls.length*5||a.gate!==body.gate)throw Error();for(const side of [a.continue,a.discard]){if(!side)throw Error();if(side.chance&&(!Number.isFinite(side.chance.approximate)||side.chance.approximate<0||side.chance.approximate>1))throw Error();if(side.tuners&&(!Number.isFinite(side.tuners.approximate)||side.tuners.approximate<0))throw Error();}}
   session.advice=reply.result;session.pending=null;emit();
  }catch{if(token===generation&&session){session.pending='ADVICE_UNAVAILABLE';emit();}}},100);
 }
 // Correct recorded values without spending resources or changing the account.
 // Every observation in this candidate's history retains the same prefix.
 function correctRolls(rolls){
  sync();
  if(mode!=='OBSERVED'||!session?.candidate||session.aborted||session.recoveryPending)throw Error('OBSERVED_CANDIDATE_REQUIRED');
  if(!Array.isArray(rolls)||rolls.length!==session.candidate.substats.length)throw Error('OBSERVED_PREFIX_LENGTH_MISMATCH');
  const seen=new Set();for(const roll of rolls){assertExactRank5SubstatRoll(roll);if(seen.has(roll.name))throw Error('DUPLICATE_OBSERVED_STAT');seen.add(roll.name);}
  const next=clone(session);
  next.candidate.substats=clone(rolls);
  for(const event of next.history)if(event.kind==='OBSERVATION'&&event.card.id===next.candidate.id)event.card.substats=clone(rolls.slice(0,event.card.level/5));
  next.revision++;next.advice=null;next.pending='CALCULATING';session=next;
  slots.set(activeSlot,{session,rng});assess();return snapshot();
 }
 function remaining(input){
  const inventory=readResourceInventory(input.inventory),spent=totals();
  const after=(q,n,r=0)=>{if(q.kind==='UNLIMITED')return clone(q);const count=q.count-n+r;if(!Number.isSafeInteger(count)||count<0)throw Error('INSUFFICIENT_SESSION_BUDGET');return {kind:'FINITE',count};};
  return {...inventory,echoes:after(inventory.echoes,spent?.echoes??0),tuners:after(inventory.tuners,spent?.tuners??0,spent.returnedTuners),
   tubes:Object.fromEntries(ECHO_TUBES.map(t=>[t.id,after(inventory.tubes[t.id],spent.tubes[t.id],spent.returnedTubes[t.id])]))};
 }
 function canPay(input,newEcho,proposed=null,acquireOnly=false){
  const from=newEcho?0:session.candidate.level,tuners=checkpointIncrement(from,from+5).tuners;
  let state=proposed?clone(proposed):{revision:session?.revision??0,inventory:remaining(input),progress:newEcho?{cumulativeEchoEXP:0,tunedThrough:0}:clone(session.progress)},tubeLedger=null;
  if(acquireOnly){const q=state.inventory.echoes;if(q.kind==='FINITE'&&q.count<1)throw Error('INSUFFICIENT_ECHOES');return {state,tubeLedger};}
  for(const [key,extra]of [['tuners',tuners],['echoes',newEcho?1:0]]){const q=state.inventory[key];if(q.kind==='FINITE'&&extra>q.count)throw Error('INSUFFICIENT_'+key.toUpperCase());}
  if(checkpointEligibleAtEXP(state.progress.cumulativeEchoEXP)<from+5){
   const path=optimizeTubesToCheckpoint(state,from+5,state.revision)[0];if(!path)throw Error('INSUFFICIENT_TUBES');
   state=path.transaction.state;tubeLedger=clone(path.transaction.ledger);
  }
  state=tuneEligibleCheckpoint(state,state.revision);
  return {state,tubeLedger};
 }
 function advance(discard=false,staged=null,observation=null){
  const input=sync();if(input.pending)throw Error(input.pending);if(session?.aborted)throw Error('Reset aborted session');
  if(!discard&&session?.candidate.level===25)return snapshot();
  const freshTemplate=createRank5EchoAtLevel0({id:'validate-only',cost:input.template.cost,primaryMainStat:input.template.mainStatName});
  if(session?.recoveryPending&&!staged)throw Error('RECOVERY_IN_PROGRESS');
  const observed=mode==='OBSERVED';
  if(observed&&!discard){assertExactRank5SubstatRoll(observation);if(session?.candidate.substats.some(r=>r.name===observation.name))throw Error('DUPLICATE_OBSERVED_STAT');}
  const resource=staged?.resource??canPay(input,discard||!session);
  if(!session){const seed=seedFactory(),tubes=()=>Object.fromEntries(ECHO_TUBES.map(t=>[t.id,0]));session={id:'interactive:'+seed+':slot:'+activeSlot,revision:0,candidate:null,spent:{tuners:0,echoes:0,tubes:tubes()},returned:{tuners:0,tubes:tubes()},progress:{cumulativeEchoEXP:0,tunedThrough:0},history:[],advice:null,pending:null};}
  if(discard||!session.candidate){
   if(session.candidate){session.history.push({kind:staged?.keep?'KEEP':'DISCARD',card:clone(session.candidate),recommended:session.advice?.winner??null,recovery:clone(staged?.recovery??null)});
    if(staged?.keep&&session.candidate.level===25)session.incumbent={card:clone(session.candidate),progress:clone(session.progress)};
   }
   if(staged?.recovery){const returned=staged.recovery.ledger.returned;session.returned.tuners+=returned.tuners;for(const t of ECHO_TUBES)session.returned.tubes[t.id]+=returned.tubes[t.id];}
   const seed=seedFactory(),template={...freshTemplate,id:session.id+':'+session.spent.echoes};rng=new SeededRng(seed);
   session.candidate={...runtime.acquireFresh(template,rng).echo,echoId:input.template.echoId,speciesId:input.template.echoId,selectedSonataSetId:input.template.selectedSonataSetId};session.spent.echoes++;
  }
  if(observed&&discard){session.revision++;session.progress=clone(resource.state.progress);session.inventory=remaining(input);slots.set(activeSlot,{session,rng});assess();return snapshot();}
  const step=observed?{echo:{...withRank5MainStatsAtLevel(session.candidate,session.candidate.level+5),substats:[...session.candidate.substats,clone(observation)]},cost:checkpointIncrement(session.candidate.level,session.candidate.level+5)}:runtime.rollNext(session.candidate,rng);session.candidate=step.echo;session.spent.tuners+=step.cost.tuners;session.revision++;
  session.progress=clone(resource.state.progress);
  if(resource.tubeLedger)for(const t of ECHO_TUBES){session.spent.tubes[t.id]+=resource.tubeLedger.spent[t.id];session.returned.tubes[t.id]+=resource.tubeLedger.returned[t.id];}
  slots.set(activeSlot,{session,rng});session.inventory=remaining(input);
  session.history.push({kind:observed?'OBSERVATION':'ROLL',card:clone(step.echo),tuners:step.cost.tuners,tubeLedger:resource.tubeLedger,progress:clone(session.progress)});assess();return snapshot();
 }
 async function discard(){
  const input=sync();if(!session)throw Error('OBSERVE_FIRST_CHECKPOINT');if(session.recoveryPending)throw Error('RECOVERY_IN_PROGRESS');
  if(session.advice?.winner==='KEEP_TEMPORARY')return advance(true,{resource:canPay(input,true,null,mode==='OBSERVED'),keep:true});
  if(session.candidate.level===0)throw Error('OBSERVE_FIRST_CHECKPOINT');
  if(typeof requestRecovery!=='function')throw Error('RECOVERY_SERVICE_REQUIRED');
  const captured=session,candidateId=session.candidate.id,revision=session.revision,owner=binding,settingsKey=settings,budget=remaining(input),workspace=identity(totals()),
   method=session.advice?.recoveryMethod??'DATA_RECOVERY',destinationId=session.id+':'+session.spent.echoes+':fresh';
  session.recoveryPending=true;emit();
  try{
   const reply=await requestRecovery({recovery:{method,inventory:budget,progress:clone(session.progress),revision,donorId:candidateId,
    ...(method==='FEED'?{destinationId,destination:{cumulativeEchoEXP:0,tunedThrough:0}}:{})}});
   sync();if(session!==captured||session.revision!==revision||binding!==owner||settings!==settingsKey||identity(totals())!==workspace||session.aborted)throw Error('STALE_RECOVERY_REPLY');
   const result=reply?.result;
   if(reply.protocol!=='BELLIBING_ECHO_ADVICE_V1'||result?.status!=='RECOVERY_PROPOSAL'||result.donorId!==candidateId||result.method!==method
    ||method==='FEED'&&result.destinationId!==destinationId
    ||identity(readResourceInventory(result.ledger.before))!==identity(budget)||result.state.progress.tunedThrough!==0)throw Error('INVALID_RECOVERY_REPLY');
   readResourceInventory(result.state.inventory);
   const returned=result.ledger.returned;
   if(!Number.isSafeInteger(returned?.tuners)||returned.tuners<0||ECHO_TUBES.some(t=>!Number.isSafeInteger(returned?.tubes?.[t.id])||returned.tubes[t.id]<0))throw Error('INVALID_RECOVERY_RETURNS');
   const balances=(before,after,amount)=>before.kind===after.kind&&(before.kind==='UNLIMITED'||after.count===before.count+amount);
   if(returned.echoes!==0||result.state.revision!==revision+1||identity(result.ledger.after)!==identity(result.state.inventory)
    ||!balances(budget.echoes,result.state.inventory.echoes,0)||!balances(budget.tuners,result.state.inventory.tuners,returned.tuners)
    ||ECHO_TUBES.some(t=>!balances(budget.tubes[t.id],result.state.inventory.tubes[t.id],returned.tubes[t.id])))throw Error('RECOVERY_BALANCE_MISMATCH');
   const resource=canPay(input,true,result.state,mode==='OBSERVED');session.recoveryPending=false;
   return advance(true,{resource,recovery:result});
  }finally{if(captured.recoveryPending){captured.recoveryPending=false;if(session===captured)emit();}}
 }
 // Preserve recorded candidates and receipts when selecting a different fresh Echo.
 function startCandidate(){
  if(mode!=='OBSERVED')throw Error('OBSERVED_CANDIDATE_REQUIRED');
  const input=sync();
  if(!session?.candidate)return snapshot();
  if(session.recoveryPending||session.aborted)throw Error('CANDIDATE_NOT_EDITABLE');
  return advance(true,{resource:canPay(input,true,null,true),keep:true});
 }
 return {sync,reset,resetSlot,snapshot,checkpoint,resume,correctRolls,startCandidate,remainingInventory:()=>remaining(readContext()),comparisonCandidates,abort(){controller?.abort();generation++;clearTimeout(timer);if(session){session.aborted=true;session.pending='ABORTED';emit();}},advance:observation=>advance(false,null,observation),discard,refresh:assess};
}
