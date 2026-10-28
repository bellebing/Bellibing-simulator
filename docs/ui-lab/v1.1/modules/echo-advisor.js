import {escapeHtml} from './util.js';
import {captureObservedImproveCurrent} from '../../../../src/observedImproveCapture.mjs';
import {SUBSTAT_TYPES,SUBSTAT_VALUE_TABLE} from '../../../assets/echoCoreRules.js';
import {createServerTransport} from './server-transport.js';
import {IMPROVE_OBJECTIVE_OPTIONS,renderImproveOpportunities,renderCheckpointOptions,number} from './improve-decision-view.js';
const headers={'Content-Type':'application/json','X-Bellibing-Review':'1'},path='/local-review/echo-advisor';
export function mountEchoAdvisor({readContext,onCard,onRender=()=>{}}){
 let connected=false,available=false,service=null,session=null,message='',lastCard=null,analysis=null,analysisKey=null,analysisGeneration=0,analysisController=null,analysisTimer=null,metric='TEAM_DPS',objective='MIN_EXPECTED_NET_TUNERS';
 const investments={},host=document.createElement('section');host.className='echo-advisor';host.hidden=true;document.querySelector('#simulate').after(host);
 const opportunities=document.createElement('section');opportunities.className='improve-opportunities';opportunities.hidden=true;opportunities.setAttribute('aria-label','Improve decision comparison');document.querySelector('.working-area').before(opportunities);
 const resultView=()=>renderImproveOpportunities(analysis,{comparisonOpen:opportunities.querySelector('.improve-comparison')?.open??false});
 const context=()=>{const c=readContext(),ids=c.currentAdvice?.team?.characterIds??[],actual=Object.fromEntries(ids.map(id=>[id,investments[id]??{}]));return {...c,owner:{...c.owner,actualInvestments:actual,metric,objective},currentAdvice:c.currentAdvice?{...c.currentAdvice,actualInvestments:actual,acceptReferenceInvestment:false}:null};};
 const send=async(body,signal)=>{
  if(!connected&&body.action!=='status')throw Error('PRIVATE_SERVICE_UNAVAILABLE');
  if(service){const payload=body.improve?{improve:body.improve}:body.recovery?{recovery:body.recovery}:body.current?{advice:body}:{echoAdvice:body};return service.request('team',undefined,undefined,payload,signal);}
  const r=await fetch(path,{method:'POST',headers,body:JSON.stringify(body),signal});if(!r.ok){const error=await r.json().catch(()=>({}));throw Error(error.reason??'PRIVATE_SERVICE_UNAVAILABLE');}return r.json();
 };
 let requestQueue=Promise.resolve();
 const post=(body,signal)=>{const task=requestQueue.catch(()=>{}).then(()=>{if(signal?.aborted)throw Error('ABORTED');return send(body,signal);});requestQueue=task;return task;};
 async function estimate(input,signal,progress=()=>{}){
  let cursor=0,retries=0;for(let i=0;i<512;i++){
   if(signal?.aborted)throw Error('ABORTED');let reply;try{reply=await post({improve:{...input,cursor,...(cursor===0?{execution:'COMPLETE'}:{})}},signal);retries=0;}catch(error){if(['REVIEW_BUSY','RATE_LIMITED'].includes(error.message)&&retries++<5){await new Promise(resolve=>setTimeout(resolve,1000));continue;}throw error;}
   if(reply?.protocol!=='BELLIBING_ECHO_ADVICE_V1'||!reply.result)throw Error('INVALID_ADVICE_RESPONSE');
   if(reply.result.reason==='STALE_IMPROVE_CURSOR'&&cursor>0&&retries++<2){cursor=0;continue;}
   if(reply.result.status!=='CALCULATING')return reply.result;
   if(!Number.isSafeInteger(reply.result.cursor)||reply.result.cursor<=cursor)throw Error('STALE_ANALYSIS');cursor=reply.result.cursor;progress(reply.result);
   // Yield between bounded private jobs; quota/rate failures are visible Pending.
   await new Promise(resolve=>setTimeout(resolve,0));
  }throw Error('ANALYSIS_LIMIT');
 }
 const requestAdvice=async(body,signal)=>{
  if(!body.currentInput)return {protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'PENDING',reason:'ACTUAL_TEAM_REQUIRED'}};
  const requestedMetric=metric,requestedObjective=objective;
  const captureStart=performance.now(),captured=await captureObservedImproveCurrent(body.currentInput);performance.measure('bellibing-improve:capture',{start:captureStart,end:performance.now()});
  if(captured.status!=='CAPTURED')return {protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'PENDING',reason:captured.reason}};
  const result=await estimate({current:captured.payload.current,slot:body.slot,candidate:body.candidate,progress:body.progress,inventory:body.inventory,metric:requestedMetric,objective:requestedObjective},signal);
  return {protocol:'BELLIBING_ECHO_ADVICE_V1',result:result.advice?{...result.advice,provenance:result.provenance}:{kind:'CURRENT_BOUND_ECHO_ADVICE',status:'PENDING',reason:result.reason??'MODEL_PENDING'}};
 };
 function initialize(createInteractiveEchoSession){session=createInteractiveEchoSession({mode:'OBSERVED',readContext:context,requestAdvice,requestRecovery:post,onChange:value=>{if(value?.candidate){lastCard=value.candidate;onCard(value.candidate);}else{if(lastCard)onCard(null);lastCard=null;}draw();onRender();}});}
 function refreshAnalysis(){
  const c=context();try{c.inventory=session.remainingInventory();}catch{c.pending='INSUFFICIENT_SESSION_BUDGET';}const {slot,...owner}=c.owner;const key=JSON.stringify({owner,inventory:c.inventory,pending:c.pending});if(key===analysisKey)return;
  analysisKey=key;analysis=null;analysisController?.abort();clearTimeout(analysisTimer);const token=++analysisGeneration;draw(true);
  const captureStart=performance.now();analysisTimer=setTimeout(async()=>{try{
   if(c.pending)throw Error(c.pending);if(!c.currentAdvice)throw Error('ACTUAL_TEAM_REQUIRED');
   const captured=await captureObservedImproveCurrent(c.currentAdvice);performance.measure('bellibing-improve:capture',{start:captureStart,end:performance.now()});if(captured.status!=='CAPTURED')throw Error(captured.reason);
   if(token!==analysisGeneration)return;analysis={status:'CALCULATING'};draw();analysisController=new AbortController();
   const result=await estimate({current:captured.payload.current,inventory:c.inventory,metric:c.owner.metric,objective:c.owner.objective},analysisController.signal,value=>{if(token===analysisGeneration){analysis=value;draw();}});
   if(token===analysisGeneration){const renderStart=performance.now();analysis=result;draw();performance.measure('bellibing-improve:render',{start:renderStart,end:performance.now()});}
  }catch(error){if(token===analysisGeneration){analysis={status:'PENDING',reason:error.message};draw();}}},0);
 }
 async function act(restart=false,roll=null){message='';try{await (restart?session.discard():session.advance(roll));}catch(error){message=error.message;}draw(true);}
 function draw(force=false){
  const drawStart=performance.now();
  if(!available)return;
  if(!force&&(host.contains(document.activeElement)||opportunities.contains(document.activeElement))&&document.activeElement.matches('input,select')){const result=opportunities.querySelector('[data-improve-result]');if(result)result.innerHTML=resultView();performance.measure('bellibing-improve:dom',{start:drawStart,end:performance.now()});return;}const c=context(),s=session.snapshot(),a=s?.advice,done=s?.candidate.level===25,winner=a?.winner;
  document.body.classList.toggle('has-echo-advisor',true);document.body.classList.toggle('advisor-complete',done);
  const used=new Set(s?.candidate.substats.map(r=>r.name)??[]),names=SUBSTAT_TYPES.filter(n=>!used.has(n)),ids=c.currentAdvice?.team?.characterIds??[];
  const invest=ids.map(id=>`<fieldset><legend>${escapeHtml(c.currentAdvice.names?.[id]??id)}</legend>${[['characterLevel','Character level',90],['weaponLevel','Weapon level',90],['weaponRefinement','Weapon rank',5]].map(([key,label,max])=>`<label>${label}<input type="number" min="1" max="${max}" required data-investment="${key}" data-character="${escapeHtml(id)}" value="${investments[id]?.[key]??''}"></label>`).join('')}</fieldset>`).join('');
  opportunities.innerHTML=`<div class="improve-controls"><h2>Which Echo to improve next?</h2><label>Damage metric<select data-objective><option value="TEAM_DPS" ${metric==='TEAM_DPS'?'selected':''}>Team DPS</option><option value="SELECTED_CHARACTER_DPS" ${metric==='SELECTED_CHARACTER_DPS'?'selected':''}>Character DPS</option></select></label><label>Recommendation objective<select data-optimization-objective>${IMPROVE_OBJECTIVE_OPTIONS.map(([id,label])=>`<option value="${id}" ${id===objective?'selected':''}>${label}</option>`).join('')}</select></label></div>
   <details class="actual-investments" ${ids.some(id=>!investments[id]?.characterLevel||!investments[id]?.weaponLevel||!investments[id]?.weaponRefinement)?'open':''}><summary>Actual team levels and weapon ranks</summary>${invest}</details>
   <div data-improve-result>${resultView()}</div>`;
  host.innerHTML=`   <div class="advice-verdict" role="status" data-advice-checkpoint="${a?.checkpoint??''}"><strong>${escapeHtml(message||s?.pending||(winner==='KEEP_TEMPORARY'?'Keep for comparison · model upgrade':a?.decision??a?.reason??'Record the result from your game'))}</strong>${a?.uncertain?'<small>Uncertain comparison · continue while more improvement remains possible</small>':''}</div>
   ${a?.objective?`<p class="checkpoint-objective">Checkpoint goal: ${a.objective.kind==='MAX_STOCK_UPGRADE_PROBABILITY_THEN_MIN_FUTURE_NET_TUNERS'?'Highest chance within stock, then lowest future net Tuners':'Lowest future net Tuners to a strict upgrade'}</p>`:''}
   <div class="advice-options">${renderCheckpointOptions(a)}</div>
   ${!done?`<form data-observation><label>Observed +${(s?.candidate.level??0)+5} substat<select name="stat" required><option value="">Select observed substat</option>${names.map(n=>`<option>${escapeHtml(n)}</option>`).join('')}</select></label><label>Exact roll value<select name="value" required></select></label><button type="submit" ${c.pending||s?.aborted||s?.recoveryPending?'disabled':''}>Record observed roll</button></form>`:''}
   ${s?.candidate.substats.length?`<ol>${s.candidate.substats.map((r,i)=>`<li>+${(i+1)*5}: ${escapeHtml(r.name)} ${number(r.value*(r.value<1?100:1),3)}${r.value<1?'%':''}</li>`).join('')}</ol><button type="button" data-restart ${s.recoveryPending||s.aborted?'disabled':''}>${winner==='KEEP_TEMPORARY'?'Retain comparison and start another':'Restart candidate'}</button>`:''}
   <div class="advice-spent">${s?`${s.workspaceSpent.tuners} Tuners spent · ${s.workspaceSpent.returnedTuners} returned · ${s.workspaceSpent.echoes} Echoes used`:'Saved equipment and inventory are preserved'}</div>`;
  opportunities.querySelectorAll('[data-investment]').forEach(el=>el.onchange=()=>{investments[el.dataset.character]??={};investments[el.dataset.character][el.dataset.investment]=Number(el.value);analysisKey=null;session.sync();refreshAnalysis();});
  opportunities.querySelector('[data-objective]').onchange=e=>{metric=e.target.value;analysisKey=null;session.sync();refreshAnalysis();};
  opportunities.querySelector('[data-optimization-objective]').onchange=e=>{objective=e.target.value;analysisKey=null;session.sync();refreshAnalysis();};
  const form=host.querySelector('[data-observation]');if(form){const stat=form.elements.stat,value=form.elements.value;const values=()=>{value.innerHTML='<option value="">Select exact value</option>'+(SUBSTAT_VALUE_TABLE[stat.value]??[]).map(v=>`<option value="${v}">${number(v*(v<1?100:1),3)}${v<1?'%':''}</option>`).join('');};values();stat.onchange=values;form.onsubmit=e=>{e.preventDefault();act(false,{name:stat.value,value:Number(value.value)});};}
  const restart=host.querySelector('[data-restart]');if(restart)restart.onclick=()=>act(true);performance.measure('bellibing-improve:dom',{start:drawStart,end:performance.now()});
 }
 opportunities.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-improve-slot]');if(!button)return;
  document.querySelector(`[data-slot="${button.dataset.improveSlot}"]`)?.click();
  requestAnimationFrame(()=>{const form=host.querySelector('[data-observation]');
   form?.scrollIntoView({block:'center'});form?.querySelector('select[name="stat"]')?.focus({preventScroll:true});
  });
 });
 for(const root of [host,opportunities])root.addEventListener('focusout',()=>setTimeout(()=>draw(),0));
 (async()=>{
  let supported=false;if(['127.0.0.1','localhost'].includes(location.hostname))try{supported=(await post({action:'status'})).protocol==='BELLIBING_ECHO_ADVICE_V1';}catch{}
  if(!supported)try{const r=await fetch(new URL('./engine-release.json',import.meta.url),{cache:'no-store'}),m=await r.json();if(m.status==='SERVER_RUNTIME_V1'&&m.version===1&&m.files?.length===0&&m.review){service=createServerTransport({endpoint:m.endpoint});service.prepare().catch(()=>{});supported=true;}}catch{}
  connected=supported;const {createInteractiveEchoSession}=await import('../../../../src/interactiveEchoSession.mjs');initialize(createInteractiveEchoSession);available=true;host.hidden=false;opportunities.hidden=false;
  const heading=document.querySelector('.loadout-heading'),slots=document.querySelector('#slots'),details=document.createElement('details');details.className='advisor-equipment';details.innerHTML='<summary>Equipped Echoes</summary>';details.open=innerWidth>1000;heading.before(details);details.append(heading,slots);draw();refreshAnalysis();onRender();
 })().catch(()=>{});
 return {available:()=>available,sync(){if(available){session.sync();refreshAnalysis();}},start:()=>host.querySelector('[data-observation] select')?.focus(),reset:()=>session?.reset(),snapshot:()=>session?.snapshot()??null,comparisonCandidates:()=>session?.comparisonCandidates()??Array(5).fill(null),abort:()=>{session?.abort();analysisController?.abort();clearTimeout(analysisTimer);analysisGeneration++;analysis={status:'PENDING',reason:'ABORTED'};draw();},export:()=>({kind:'BELLIBING_OBSERVED_IMPROVE_V1',session:session?.snapshot()??null,analysis,accountMutation:false})};
}
