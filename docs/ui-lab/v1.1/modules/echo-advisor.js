import {escapeHtml} from './util.js';
import {captureLocalTeamBuilds} from '../../../../src/localTeamBuildCapture.mjs';
import {SUBSTAT_TYPES,SUBSTAT_VALUE_TABLE} from '../../../assets/echoCoreRules.js';
import {createServerTransport} from './server-transport.js';
const headers={'Content-Type':'application/json','X-Bellibing-Review':'1'},path='/local-review/echo-advisor';
const number=(n,d=1)=>Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:d}):'—';
const interval=(p,percent=false)=>{if(!p)return '—';const f=v=>Number.isFinite(v)?number(v*(percent?100:1),percent?2:1):'—';return `${f(p.estimate)}${percent?'%':''} (${f(p.lower)}–${p.upper===null?'∞':f(p.upper)}${percent?'%':''})`;};
export function mountEchoAdvisor({readContext,onCard,onRender=()=>{}}){
 let connected=false,available=false,service=null,session=null,message='',lastCard=null,analysis=null,analysisKey=null,analysisGeneration=0,analysisController=null,analysisTimer=null,metric='TEAM_DPS';
 const investments={},host=document.createElement('section');host.className='echo-advisor';host.hidden=true;document.querySelector('#simulate').after(host);
 const context=()=>{const c=readContext(),ids=c.currentAdvice?.team?.characterIds??[],actual=Object.fromEntries(ids.map(id=>[id,investments[id]??{}]));return {...c,owner:{...c.owner,actualInvestments:actual,metric},currentAdvice:c.currentAdvice?{...c.currentAdvice,actualInvestments:actual,acceptReferenceInvestment:false}:null};};
 const send=async(body,signal)=>{
  if(!connected&&body.action!=='status')throw Error('PRIVATE_SERVICE_UNAVAILABLE');
  if(service){const payload=body.improve?{improve:body.improve}:body.recovery?{recovery:body.recovery}:body.current?{advice:body}:{echoAdvice:body};return service.request('team',undefined,undefined,payload,signal);}
  const r=await fetch(path,{method:'POST',headers,body:JSON.stringify(body),signal});if(!r.ok){const error=await r.json().catch(()=>({}));throw Error(error.reason??'PRIVATE_SERVICE_UNAVAILABLE');}return r.json();
 };
 let requestQueue=Promise.resolve();
 const post=(body,signal)=>{const task=requestQueue.catch(()=>{}).then(()=>{if(signal?.aborted)throw Error('ABORTED');return send(body,signal);});requestQueue=task;return task;};
 async function estimate(input,signal,progress=()=>{}){
  let cursor=0,retries=0;for(let i=0;i<512;i++){
   if(signal?.aborted)throw Error('ABORTED');let reply;try{reply=await post({improve:{...input,cursor}},signal);retries=0;}catch(error){if(['REVIEW_BUSY','RATE_LIMITED'].includes(error.message)&&retries++<5){await new Promise(resolve=>setTimeout(resolve,1000));continue;}throw error;}
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
  const captured=await captureLocalTeamBuilds({...body.currentInput,candidates:Array(5).fill(null)});
  if(captured.status!=='CAPTURED')return {protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'PENDING',reason:captured.reason}};
  const result=await estimate({current:captured.payload.current,slot:body.slot,candidate:body.candidate,progress:body.progress,inventory:body.inventory,metric},signal);
  return {protocol:'BELLIBING_ECHO_ADVICE_V1',result:result.advice??{kind:'CURRENT_BOUND_ECHO_ADVICE',status:'PENDING',reason:result.reason??'MODEL_PENDING'}};
 };
 function initialize(createInteractiveEchoSession){session=createInteractiveEchoSession({mode:'OBSERVED',readContext:context,requestAdvice,requestRecovery:post,onChange:value=>{if(value?.candidate){lastCard=value.candidate;onCard(value.candidate);}else{if(lastCard)onCard(null);lastCard=null;}draw();onRender();}});}
 function refreshAnalysis(){
  const c=context();try{c.inventory=session.remainingInventory();}catch{c.pending='INSUFFICIENT_SESSION_BUDGET';}const key=JSON.stringify({owner:c.owner,inventory:c.inventory,pending:c.pending});if(key===analysisKey)return;
  analysisKey=key;analysis=null;analysisController?.abort();clearTimeout(analysisTimer);const token=++analysisGeneration;draw();
  analysisTimer=setTimeout(async()=>{try{
   if(c.pending)throw Error(c.pending);if(!c.currentAdvice)throw Error('ACTUAL_TEAM_REQUIRED');
   const captured=await captureLocalTeamBuilds({...c.currentAdvice,candidates:Array(5).fill(null)});if(captured.status!=='CAPTURED')throw Error(captured.reason);
   if(token!==analysisGeneration)return;analysisController=new AbortController();
   const result=await estimate({current:captured.payload.current,inventory:c.inventory,metric},analysisController.signal,value=>{if(token===analysisGeneration){analysis=value;draw();}});
   if(token===analysisGeneration){analysis=result;draw();}
  }catch(error){if(token===analysisGeneration){analysis={status:'PENDING',reason:error.message};draw();}}},250);
 }
 async function act(restart=false,roll=null){message='';try{await (restart?session.discard():session.advance(roll));}catch(error){message=error.message;}draw(true);}
 function draw(force=false){
  if(!available)return;
  if(!force&&host.contains(document.activeElement)&&document.activeElement.matches('input,select'))return;const c=context(),s=session.snapshot(),a=s?.advice,done=s?.candidate.level===25,winner=a?.winner;
  document.body.classList.toggle('has-echo-advisor',true);document.body.classList.toggle('advisor-complete',done);
  const used=new Set(s?.candidate.substats.map(r=>r.name)??[]),names=SUBSTAT_TYPES.filter(n=>!used.has(n)),ids=c.currentAdvice?.team?.characterIds??[];
  const invest=ids.map(id=>`<fieldset><legend>${escapeHtml(c.currentAdvice.names?.[id]??id)}</legend>${[['characterLevel','Character level',90],['weaponLevel','Weapon level',90],['weaponRefinement','Weapon rank',5]].map(([key,label,max])=>`<label>${label}<input type="number" min="1" max="${max}" required data-investment="${key}" data-character="${escapeHtml(id)}" value="${investments[id]?.[key]??''}"></label>`).join('')}</fieldset>`).join('');
  const rows=(analysis?.slots??[]).map(r=>`<tr><th>Echo ${r.slot+1}</th><td>${interval(r.probability,true)}</td><td>${interval(r.attempts)}${r.potentiallyNotWorthwhile?' · May not be worthwhile':''}</td><td>${number(r.expectedNetCost?.tuners)} / ${number(r.expectedNetCost?.exp,0)} / ${number(r.expectedNetCost?.echoes)}</td><td>+${number(r.gain.conditionalOnImprovement)} DPS</td><td>${number(r.benefitPerResource?.tuners,3)} DPS/Tuner</td><td>${r.finiteStock.status==='UNLIMITED'?'Unlimited':`${r.finiteStock.status==='AT_LEAST'?'≥':''}${r.finiteStock.attempts} attempts · ${interval(r.finiteStock.probability,true)}`}</td></tr>`).join('');
  const ranking=analysis?.ranking,slotLabel=i=>Number.isInteger(i)?'Echo '+(i+1):'Pending';
  const summary=ranking?`Easiest: ${slotLabel(ranking.easiest[0])} · Cheapest (Tuners): ${slotLabel(ranking.cheapest.tuners[0])} · Best DPS/Tuner: ${slotLabel(ranking.bestBenefitPerResource.tuners[0])}`:analysis?.status==='CALCULATING'?`Analyzing five Echoes: ${number(analysis.progress.completed/analysis.progress.total*100,0)}%`:analysis?.reason??'Preparing actual build analysis';
  const option=(data,label)=>data?`<div><strong>${label}</strong><div>${interval(data.chance,true)} chance this attempt</div><div>${number(data.expectedFutureNetCost?.tuners)} future net Tuners · ${number(data.expectedFutureNetCost?.exp,0)} EXP · ${number(data.expectedFutureNetCost?.echoes)} Echoes until improvement</div><small>Net Tuner range ${number(data.costBounds?.lower?.tuners)}–${number(data.costBounds?.upper?.tuners)} · ${data.status==='RESOURCE_BLOCKED'?'Stock cannot complete next attempt':data.finiteStock?.status==='UNLIMITED'?'Unlimited stock':interval(data.finiteStock?.probability,true)+' with stock'}</small></div>`:'';
  host.innerHTML=`<details class="actual-investments" ${ids.some(id=>!investments[id]?.characterLevel||!investments[id]?.weaponLevel||!investments[id]?.weaponRefinement)?'open':''}><summary>Actual team levels and weapon ranks</summary>${invest}<label>Optimize <select data-objective><option value="TEAM_DPS" ${metric==='TEAM_DPS'?'selected':''}>Team DPS</option><option value="SELECTED_CHARACTER_DPS" ${metric==='SELECTED_CHARACTER_DPS'?'selected':''}>Character DPS</option></select></label></details>
   <div class="improve-opportunities">${analysis?.current?`<p>Current · Character ${number(analysis.current.characterDps,0)} DPS · Team ${number(analysis.current.teamDps,0)} DPS</p>`:''}<p role="status">${escapeHtml(summary)}</p>${rows?`<div style="overflow-x:auto"><table><thead><tr><th>Slot</th><th>Strict upgrade chance (99% bounds)</th><th>Expected attempts (bounds)</th><th>Net Tuners / EXP / Echoes</th><th>Mean gain on success</th><th>Benefit/resource</th><th>Finite stock availability</th></tr></thead><tbody>${rows}</tbody></table></div><details><summary>Cost and estimation details</summary><p>Cheapest EXP: ${slotLabel(ranking?.cheapest.exp[0])} · Best DPS/EXP: ${slotLabel(ranking?.bestBenefitPerResource.exp[0])}</p><p>Model estimate · other four equipped Echoes fixed. Complete to +25 and recover failures. Expected cost uses unlimited reference Tube denominations; finite stock is evaluated separately. Rankings are estimates with uncertainty.</p>${analysis.slots.map(r=>`<p>Echo ${r.slot+1}: ${escapeHtml(JSON.stringify(r.expectedNetCost?.tubes??{}))} Tubes · Finite-stock mean spend: ${number(r.finiteStock.modeledMeanNetSpend?.tuners)} Tuners / ${number(r.finiteStock.modeledMeanNetSpend?.exp,0)} EXP. Cost conditional on success within stock: ${number(r.finiteStock.expectedNetCostConditionalOnSuccess?.tuners)} Tuners. ${r.estimation.samples} outcomes · ${escapeHtml(r.estimation.precision)} · mean retained gain +${number(r.gain.expectedRetained)} ± ${number(r.gain.standardError)} DPS (standard error)</p>`).join('')}</details>`:''}</div>
   <div class="advice-verdict" role="status" data-advice-checkpoint="${a?.checkpoint??''}"><strong>${escapeHtml(message||s?.pending||(winner==='KEEP_TEMPORARY'?'Keep for comparison · model upgrade':a?.decision??a?.reason??'Record the result from your game'))}</strong>${a?.uncertain?'<small>Uncertain comparison · continue while more improvement remains possible</small>':''}</div>
   <div class="advice-options">${option(a?.continue,'CONTINUE')}${option(a?.discard,'RESTART')}</div>
   ${!done?`<form data-observation><label>Observed +${(s?.candidate.level??0)+5} substat<select name="stat" required><option value="">Select observed substat</option>${names.map(n=>`<option>${escapeHtml(n)}</option>`).join('')}</select></label><label>Exact roll value<select name="value" required></select></label><button type="submit" ${c.pending||s?.aborted||s?.recoveryPending?'disabled':''}>Record observed roll</button></form>`:''}
   ${s?.candidate.substats.length?`<ol>${s.candidate.substats.map((r,i)=>`<li>+${(i+1)*5}: ${escapeHtml(r.name)} ${number(r.value*(r.value<1?100:1),3)}${r.value<1?'%':''}</li>`).join('')}</ol><button type="button" data-restart ${s.recoveryPending||s.aborted?'disabled':''}>${winner==='KEEP_TEMPORARY'?'Retain comparison and start another':'Restart candidate'}</button>`:''}
   <div class="advice-spent">${s?`${s.workspaceSpent.tuners} Tuners spent · ${s.workspaceSpent.returnedTuners} returned · ${s.workspaceSpent.echoes} Echoes used`:'Saved equipment and inventory are preserved'}</div>`;
  host.querySelectorAll('[data-investment]').forEach(el=>el.onchange=()=>{investments[el.dataset.character]??={};investments[el.dataset.character][el.dataset.investment]=Number(el.value);analysisKey=null;session.sync();refreshAnalysis();});
  host.querySelector('[data-objective]').onchange=e=>{metric=e.target.value;analysisKey=null;session.sync();refreshAnalysis();};
  const form=host.querySelector('[data-observation]');if(form){const stat=form.elements.stat,value=form.elements.value;const values=()=>{value.innerHTML='<option value="">Select exact value</option>'+(SUBSTAT_VALUE_TABLE[stat.value]??[]).map(v=>`<option value="${v}">${number(v*(v<1?100:1),3)}${v<1?'%':''}</option>`).join('');};values();stat.onchange=values;form.onsubmit=e=>{e.preventDefault();act(false,{name:stat.value,value:Number(value.value)});};}
  const restart=host.querySelector('[data-restart]');if(restart)restart.onclick=()=>act(true);
 }
 host.addEventListener('focusout',()=>setTimeout(()=>draw(),0));
 (async()=>{
  let supported=false;if(['127.0.0.1','localhost'].includes(location.hostname))try{supported=(await post({action:'status'})).protocol==='BELLIBING_ECHO_ADVICE_V1';}catch{}
  if(!supported)try{const r=await fetch(new URL('./engine-release.json',import.meta.url),{cache:'no-store'}),m=await r.json();if(m.status==='SERVER_RUNTIME_V1'&&m.version===1&&m.files?.length===0&&m.review){service=createServerTransport({endpoint:m.endpoint});supported=true;}}catch{}
  connected=supported;const {createInteractiveEchoSession}=await import('../../../../src/interactiveEchoSession.mjs');initialize(createInteractiveEchoSession);available=true;host.hidden=false;
  const heading=document.querySelector('.loadout-heading'),slots=document.querySelector('#slots'),details=document.createElement('details');details.className='advisor-equipment';details.innerHTML='<summary>Equipped Echoes</summary>';details.open=innerWidth>1000;heading.before(details);details.append(heading,slots);draw();refreshAnalysis();onRender();
 })().catch(()=>{});
 return {available:()=>available,sync(){if(available){session.sync();refreshAnalysis();}},start:()=>host.querySelector('[data-observation] select')?.focus(),reset:()=>session?.reset(),snapshot:()=>session?.snapshot()??null,comparisonCandidates:()=>session?.comparisonCandidates()??Array(5).fill(null),abort:()=>{session?.abort();analysisController?.abort();clearTimeout(analysisTimer);analysisGeneration++;analysis={status:'PENDING',reason:'ABORTED'};draw();},export:()=>({kind:'BELLIBING_OBSERVED_IMPROVE_V1',session:session?.snapshot()??null,analysis,accountMutation:false})};
}
