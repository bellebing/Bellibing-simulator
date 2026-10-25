import {escapeHtml} from './util.js';
import {captureLocalTeamBuilds} from '../../../../src/localTeamBuildCapture.mjs';
import {createServerTransport} from './server-transport.js';
const headers={'Content-Type':'application/json','X-Bellibing-Review':'1'},path='/local-review/echo-advisor';
const number=(n,d=1)=>Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:d}):'—';
export function mountEchoAdvisor({readContext,onCard,onRender=()=>{}}){
 let available=false,host=document.createElement('section'),message='',lastCard=null;host.className='echo-advisor';host.hidden=true;
 document.querySelector('#simulate').after(host);
 let service=null;
 const post=async(body,signal)=>{
  if(service){const payload=body.recovery?{recovery:body.recovery}:body.current?{advice:{...body,samples:Math.min(4,body.samples??4)}}:{echoAdvice:body};
   return service.request('team',undefined,undefined,payload,signal);}
  const r=await fetch(path,{method:'POST',headers,body:JSON.stringify(body),signal});if(!r.ok)throw Error();return r.json();
 };
 let session=null;
 const requestAdvice=async(body,signal)=>{
  if(!body.currentInput)return post(body,signal);
  const {currentInput,retainedCandidates,...observed}=body,captured=await captureLocalTeamBuilds({...currentInput,candidates:retainedCandidates??currentInput.candidates});
  if(captured.status!=='CAPTURED')return {protocol:'BELLIBING_ECHO_ADVICE_V1',result:{kind:'CURRENT_BOUND_ECHO_ADVICE',status:'PENDING',reason:captured.reason,winner:null}};
  return post({...observed,current:captured.payload.candidate??captured.payload.current},signal);
 };
 function initialize(createInteractiveEchoSession){session=createInteractiveEchoSession({readContext,requestAdvice,requestRecovery:post,onChange:value=>{if(value?.candidate){lastCard=value.candidate;onCard(value.candidate);}else{if(lastCard)onCard(null);lastCard=null;}draw();onRender();}});}
 async function act(discard=false){message='';try{await (discard?session.discard():session.advance());}catch(error){message=error.message.startsWith('INSUFFICIENT_')?'Insufficient '+error.message.slice(13).toLowerCase():error.message;}draw();}
 function draw(){
  if(!available)return;const s=session.snapshot(),a=s?.advice,done=s?.candidate.level===25,winner=a?.winner;
  document.body.classList.toggle('has-echo-advisor',true);document.body.classList.toggle('advisor-complete',done);
  const currentBound=a?.kind==='CURRENT_BOUND_ECHO_ADVICE',valid=['VERIFIED','BEFORE_GATE','TARGET_SUCCESS'].includes(a?.status)||currentBound&&a?.status==='EXPERIMENTAL',label=message||(!s?'Single Echo':s.recoveryPending?'Recovering…':s.pending==='CALCULATING'?'Calculating…':s.pending?'Pending':winner==='KEEP_TEMPORARY'?'Model upgrade':a?.status==='TARGET_SUCCESS'?'TARGET MET':a?.status==='BEFORE_GATE'?'Gate +'+a.gate:winner??'Pending');
  const tile=(id,title)=>{const data=id==='CONTINUE'?a?.continue:a?.discard;return `<button type="button" data-echo-action="${id}" class="advice-option ${winner===id?'is-winner':''}" ${!s||s.aborted||s.recoveryPending||id==='CONTINUE'&&done?'disabled':''}><strong>${id==='DISCARD'&&winner==='KEEP_TEMPORARY'?'SEARCH BETTER':title}</strong><span>${valid&&Number.isFinite(data?.chance?.approximate)?number(data.chance.approximate*100,2)+'%':'—'}</span><small>${currentBound?'Completion upgrade chance':'Attempt chance'}</small><span>${valid&&Number.isFinite(data?.tuners?.approximate)?'≈ '+number(data.tuners.approximate,0)+(currentBound?' completion net Tuners':' Tuners'):'—'}</span></button>`;};
  host.innerHTML=`<div class="advice-options" style="--advantage:${Math.min(1,Math.max(0,a?.delta?.relativeSaving??0))}">${tile('DISCARD','DISCARD')}<div class="advice-verdict" data-ready="${!!winner}" role="status"><strong>${escapeHtml(label)}</strong><small>${s?'+'+s.candidate.level:'Checkpoints +5 → +25'}</small></div>${tile('CONTINUE','CONTINUE')}</div><div class="advice-margin">${valid&&a.delta&&a.delta.savedTuners!==null?`${a.delta.percentagePoints>=0?'Continue':'Discard'} +${number(Math.abs(a.delta.percentagePoints),2)} pp · ${a.delta.savedTuners===0?'Equal cost':`${winner?'Save':'Δ'} ${a.delta.savedTuners>0&&a.delta.savedTuners<0.01?'<0.01':number(a.delta.savedTuners,2)} Tuners`}`:'—'}</div><div class="advice-spent">${s?`${s.spent.tuners} Tuners spent · ${s.spent.echoes} Echo${s.spent.echoes===1?'':'es'}`:'Simulate an Echo to begin'}</div>${done?'<button type="button" class="advice-full-build">Full Build</button>':''}`;
  const buildButton=host.querySelector('.advice-full-build');if(buildButton)buildButton.onclick=()=>{const character=document.querySelector('#character');if(!character.classList.contains('expanded'))document.querySelector('#characterToggle').click();character.scrollIntoView({block:'start',behavior:'smooth'});};
  host.querySelectorAll('[data-echo-action]').forEach(b=>b.onclick=()=>act(b.dataset.echoAction==='DISCARD'));
 }
 (async()=>{
  let supported=false;
  if(['127.0.0.1','localhost'].includes(location.hostname))try{supported=(await post({action:'status'})).protocol==='BELLIBING_ECHO_ADVICE_V1';}catch{}
  if(!supported)try{const r=await fetch(new URL('./engine-release.json',import.meta.url),{cache:'no-store'}),m=await r.json();
   if(m.status==='SERVER_RUNTIME_V1'&&m.version===1&&m.files?.length===0&&m.review){service=createServerTransport({endpoint:m.endpoint});supported=true;}
  }catch{}
  if(!supported)return;
  const {createInteractiveEchoSession}=await import('../../../../src/interactiveEchoSession.mjs');initialize(createInteractiveEchoSession);available=true;host.hidden=false;
  const heading=document.querySelector('.loadout-heading'),slots=document.querySelector('#slots'),details=document.createElement('details');details.className='advisor-equipment';details.innerHTML='<summary>Equipped Echoes</summary>';details.open=innerWidth>1000;heading.before(details);details.append(heading,slots);draw();onRender();
 })().catch(()=>{});
 return {available:()=>available,sync(){if(available)session.sync();},start:()=>act(false),reset:()=>session?.reset(),snapshot:()=>session?.snapshot()??null,comparisonCandidates:()=>session?.comparisonCandidates()??Array(5).fill(null),abort:()=>session?.abort(),export:()=>({kind:'BELLIBING_INTERACTIVE_ECHO_REVIEW_V1',session:session?.snapshot()??null,context:readContext(),accountMutation:false})};
}
