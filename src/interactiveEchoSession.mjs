// Public, character-free canonical reveals; analytical advice stays private.
import {VerifiedWuwaEchoRuntime} from './echoCoreRuntime.ts';
import {createRank5EchoAtLevel0} from './echoMainStats.ts';
import {checkpointIncrement} from './echoCoreRules.ts';
import {SeededRng} from './seededRng.ts';
const clone=v=>structuredClone(v),identity=v=>JSON.stringify(v);
export function createInteractiveEchoSession({readContext,onChange=()=>{},requestAdvice,seedFactory=()=>crypto.randomUUID()}={}){
 const runtime=new VerifiedWuwaEchoRuntime();let binding=null,settings=null,session=null,rng=null,generation=0,controller=null,timer=null;
 const snapshot=()=>clone(session),emit=()=>onChange(snapshot());
 function reset(){generation++;controller?.abort();clearTimeout(timer);session=null;rng=null;binding=null;settings=null;emit();}
 function sync(){
  const input=readContext(),next=identity(input.owner),changed=binding!==null&&binding!==next;
  if(changed){reset();}binding=next;
  const nextSettings=identity({target:input.target,gate:input.gate,inventory:input.inventory,pending:input.pending});
  if(nextSettings!==settings){settings=nextSettings;if(session){session.advice=null;assess();}}
  return input;
 }
 function assess(){
  const input=readContext();if(!session)return;
  const token=++generation,expected=binding,context=settings;controller?.abort();clearTimeout(timer);session.advice=null;session.pending=input.pending??'CALCULATING';emit();
  if(input.pending)return;
  const body={target:clone(input.target),gate:input.gate,rolls:clone(session.candidate.substats)};
  timer=setTimeout(async()=>{try{controller=new AbortController();const reply=await requestAdvice(body,controller.signal);sync();
   if(token!==generation||expected!==binding||context!==settings||!session)return;
   if(reply.protocol!=='BELLIBING_ECHO_ADVICE_V1'||!reply.result)throw Error();
   const a=reply.result;if(['VERIFIED','BEFORE_GATE','TARGET_SUCCESS'].includes(a.status)){if(a.certificate?.exactFixedPoint!==true||a.checkpoint!==body.rolls.length*5||a.gate!==body.gate)throw Error();for(const side of [a.continue,a.discard]){if(!side)throw Error();if(side.chance&&(!Number.isFinite(side.chance.approximate)||side.chance.approximate<0||side.chance.approximate>1))throw Error();if(side.tuners&&(!Number.isFinite(side.tuners.approximate)||side.tuners.approximate<0))throw Error();}}
   session.advice=reply.result;session.pending=null;emit();
  }catch{if(token===generation&&session){session.pending='ADVICE_UNAVAILABLE';emit();}}},100);
 }
 function canPay(input,newEcho){
  const from=newEcho?0:session.candidate.level,tuners=checkpointIncrement(from,from+5).tuners;
  for(const [key,extra]of [['tuners',tuners],['echoes',newEcho?1:0]]){const q=input.inventory?.[key];if(q?.kind==='FINITE'&&(session?.spent[key]??0)+extra>q.count)throw Error('INSUFFICIENT_'+key.toUpperCase());}
 }
 function advance(discard=false){
  const input=sync();if(input.pending)throw Error(input.pending);if(session?.aborted)throw Error('Reset aborted session');
  if(!discard&&session?.candidate.level===25)return snapshot();
  const freshTemplate=createRank5EchoAtLevel0({id:'validate-only',cost:input.template.cost,primaryMainStat:input.template.mainStatName});
  canPay(input,discard||!session);
  if(!session){const seed=seedFactory();session={id:'interactive:'+seed,revision:0,candidate:null,spent:{tuners:0,echoes:0},history:[],advice:null,pending:null};}
  if(discard||!session.candidate){
   if(session.candidate)session.history.push({kind:'DISCARD',card:clone(session.candidate),recommended:session.advice?.winner??null});
   const seed=seedFactory(),template={...freshTemplate,id:session.id+':'+session.spent.echoes};rng=new SeededRng(seed);
   session.candidate={...runtime.acquireFresh(template,rng).echo,echoId:input.template.echoId,speciesId:input.template.echoId,selectedSonataSetId:input.template.selectedSonataSetId};session.spent.echoes++;
  }
  const step=runtime.rollNext(session.candidate,rng);session.candidate=step.echo;session.spent.tuners+=step.cost.tuners;session.revision++;
  session.history.push({kind:'ROLL',card:clone(step.echo),tuners:step.cost.tuners});assess();return snapshot();
 }
 return {sync,reset,snapshot,abort(){controller?.abort();generation++;clearTimeout(timer);if(session){session.aborted=true;session.pending='ABORTED';emit();}},advance:()=>advance(false),discard:()=>advance(true),refresh:assess};
}
