import {createStatTargetCost} from './stat-target-cost.js';
import {installTransientChoiceDismissal} from './choice-dismissal.js';
import {createRank5EchoAtLevel0} from '../../../../src/echoMainStats.ts';
import {sampledDpsFeedback,sampledDpsCost} from './improve-feedback.js';
import {dpsObjectiveFeedback} from './improve-feedback.js';
import {improveFeedback,feedbackMarkup,manualTargetExpectedCost} from './improve-feedback.js';
import {equipObservedEcho} from '../../../../src/inventoryAccount.mjs';
import {substatEditorMarkup} from './substat-editor.js';
import {configuredCard} from './configured-card.js';
import {escapeHtml} from './util.js';
import {captureObservedImproveCurrent} from '../../../../src/observedImproveCapture.mjs';
import {SUBSTAT_TYPES,SUBSTAT_VALUE_TABLE} from '../../../assets/echoCoreRules.js';
import {localObservedAdvice} from './local-improve-advice.js';
import {localAdviceSummary} from './improve-decision-view.js';
import {createServerTransport} from './server-transport.js';
import {IMPROVE_OBJECTIVE_OPTIONS,renderSelectedImproveOpportunity,renderObservedCheckpointOptions,checkpointVerdict,number} from './improve-decision-view.js';
const headers={'Content-Type':'application/json','X-Bellibing-Review':'1'},path='/local-review/echo-advisor';
export function mountEchoAdvisor({readContext,onCard,onRender=()=>{}}){
 let connected=false,available=false,service=null,session=null,message='',lastCard=null,analysis=null,analysisKey=null,analysisGeneration=0,analysisController=null,analysisTimer=null,metric='TEAM_DPS',objective='MAX_DPS_PER_TUNER';
 let equipping=false;
 let rollDraft=null,rollDraftKey=null,rollEditor=null,rollMove=null,allowAutoExpand=false;
 const investmentBindings={},investments={},host=document.createElement('section');host.className='echo-advisor';host.hidden=true;document.querySelector('.workshop-footer').prepend(host);
 const opportunities=document.createElement('details');opportunities.className='improve-advice-details';opportunities.hidden=true;opportunities.setAttribute('aria-label','Improve decision details');host.after(opportunities);
 const pendingCopy=reason=>({ENTER_ACTUAL_TEAM_INVESTMENTS:'Complete team investments in Build',ACTUAL_FORTE_OBSERVATIONS_REQUIRED:'Confirm Skills in Build',COMPLETE_ACCOUNT_TEAM_REQUIRED:'Complete your team in Build',ACTUAL_TEAM_REQUIRED:'Complete your team in Build',INSUFFICIENT_ECHOES:'Not enough Echoes',INSUFFICIENT_TUNERS:'Not enough Tuners',INSUFFICIENT_TUBES:'Not enough Tubes',INSUFFICIENT_SESSION_BUDGET:'Not enough resources',ADVICE_UNAVAILABLE:'Advice service unavailable',PRIVATE_SERVICE_UNAVAILABLE:'Advice service unavailable',ABORTED:'Observation paused',CALCULATING:'Calculating…'})[reason]??'Advice Pending';
 const resultView=()=>renderSelectedImproveOpportunity(analysis,context().owner.slot);
 const teamReview=async(body,signal)=>{
  const r=await fetch('/local-review/team-dps',{method:'POST',headers,body:JSON.stringify(body),signal});
  if(!r.ok)throw Error('TEAM_COMPARISON_UNAVAILABLE');
  const reply=await r.json();if(reply.protocol!=='BELLIBING_LOCAL_TEAM_REVIEW_V1')throw Error('INVALID_TEAM_RESPONSE');return reply;
 };
 const context=()=>{const c=readContext(),ids=c.currentAdvice?.team?.characterIds??[];for(const record of c.currentAdvice?.records??[]){if(record.status!=='OBSERVED_PRODUCTION_BUILD_RECORD')continue;const b=record.buildState,key=JSON.stringify([record.buildId,record.revisions,b.characterLevel,b.weaponLevel,b.weaponRefinement]);if(investmentBindings[record.characterId]!==key){investmentBindings[record.characterId]=key;investments[record.characterId]={characterLevel:b.characterLevel??null,weaponLevel:b.weaponLevel??null,weaponRefinement:b.weaponRefinement??null};}}const actual=Object.fromEntries(ids.map(id=>[id,investments[id]??{}]));return {...c,owner:{...c.owner,actualInvestments:actual,metric,objective},currentAdvice:c.currentAdvice?{...c.currentAdvice,actualInvestments:actual,acceptReferenceInvestment:false}:null};};
 const send=async(body,signal)=>{
  if(!connected&&body.action!=='status')throw Error('PRIVATE_SERVICE_UNAVAILABLE');
  if(service){const payload=body.improve?{improve:body.improve}:body.recovery?{recovery:body.recovery}:body.current?{advice:body}:{echoAdvice:body};return service.request('team',undefined,undefined,payload,signal);}
  const r=await fetch(path,{method:'POST',headers,body:JSON.stringify(body),signal});if(!r.ok){const error=await r.json().catch(()=>({}));throw Error(error.reason??'PRIVATE_SERVICE_UNAVAILABLE');}return r.json();
 };
 let requestQueue=Promise.resolve();
 const post=(body,signal)=>{const task=requestQueue.catch(()=>{}).then(()=>{if(signal?.aborted)throw Error('ABORTED');return send(body,signal);});requestQueue=task;return task;};
 const statCosts=createStatTargetCost({request:body=>post(body),onChange:onRender});
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
  if(!context().dpsPlan?.dpsEnabled||!service){const input={...body,candidate:body.candidate??session.snapshot()?.candidate,slot:body.slot??context().owner.slot};return {protocol:'BELLIBING_ECHO_ADVICE_V1',result:await localObservedAdvice(input,{targetAdvice:input=>post(input,signal)})};}
  if(!body.currentInput)return {protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'PENDING',reason:'ACTUAL_TEAM_REQUIRED'}};
  const requestedMetric=metric,requestedObjective=objective;
  const captureStart=performance.now(),captured=await captureObservedImproveCurrent(body.currentInput);performance.measure('bellibing-improve:capture',{start:captureStart,end:performance.now()});
  if(captured.status!=='CAPTURED')return {protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'PENDING',reason:captured.reason}};
  const result=await estimate({current:captured.payload.current,slot:body.slot,candidate:body.candidate,progress:body.progress,inventory:body.inventory,metric:requestedMetric,objective:requestedObjective},signal);
  return {protocol:'BELLIBING_ECHO_ADVICE_V1',result:result.advice?{...result.advice,provenance:result.provenance}:{kind:'CURRENT_BOUND_ECHO_ADVICE',status:'PENDING',reason:result.reason??'MODEL_PENDING'}};
 };
 let observedCharacter=null,restoring=false,saveQueue=Promise.resolve();const savedBindings=new Map(),blockedObserved=new Set();
 function saveObserved(){
  const owner=globalThis.bellibingAccountSession;if(!owner||restoring||!session)return;
  const value=session.checkpoint(),id=context().owner.characterId;
  if(value.characterId!==id||blockedObserved.has(id)||!owner.store.snapshot()?.characters[id]?.owned)return;
  const binding=JSON.stringify(value);if(savedBindings.get(id)===binding)return;savedBindings.set(id,binding);
  saveQueue=saveQueue.catch(()=>{}).then(()=>owner.store.saveObservations(id,value)).catch(()=>{savedBindings.delete(id);message='Observed rolls are kept on this page; local saving failed. Export before leaving.';draw();});
 }
 function restoreObserved(){
  const id=context().owner.characterId;if(restoring||observedCharacter===id)return;
  allowAutoExpand=false;rollEditor=null;rollMove=null;
  restoring=true;try{session.sync();const value=globalThis.bellibingAccountSession?.store.snapshot()?.userData?.observations?.[id];
   if(value){session.resume(value);savedBindings.set(id,JSON.stringify(value));}observedCharacter=id;
  }catch(error){blockedObserved.add(id);message='Saved observations need review: '+error.message;observedCharacter=id;}finally{restoring=false;}
 }
 function initialize(createInteractiveEchoSession){session=createInteractiveEchoSession({mode:'OBSERVED',readContext:context,requestAdvice,requestRecovery:post,onChange:value=>{if(value?.candidate){lastCard=value.candidate;onCard(value.candidate);}else{if(lastCard)onCard(null);lastCard=null;}saveObserved();draw();onRender();}});restoreObserved();}
 function refreshAnalysis(){
  if(!service||!context().dpsPlan?.dpsEnabled){analysisController?.abort();clearTimeout(analysisTimer);analysisGeneration++;analysis=null;analysisKey=null;return;}
  const c=context();try{c.inventory=session.remainingInventory();}catch{c.pending='INSUFFICIENT_SESSION_BUDGET';}const {slot,...owner}=c.owner;const key=JSON.stringify({owner,inventory:c.inventory,pending:c.pending});if(key===analysisKey)return;
  analysisKey=key;analysis=null;analysisController?.abort();clearTimeout(analysisTimer);const token=++analysisGeneration;draw(true);
  const captureStart=performance.now();analysisTimer=setTimeout(async()=>{try{
   if(c.pending)throw Error(c.pending);if(!c.currentAdvice)throw Error('ACTUAL_TEAM_REQUIRED');
   const captured=await captureObservedImproveCurrent(c.currentAdvice);performance.measure('bellibing-improve:capture',{start:captureStart,end:performance.now()});if(captured.status!=='CAPTURED')throw Error(captured.reason);
   if(token!==analysisGeneration)return;analysis={status:'CALCULATING'};draw();analysisController=new AbortController();
   const result=service?await estimate({current:captured.payload.current,inventory:c.inventory,metric:c.owner.metric,objective:c.owner.objective},analysisController.signal,value=>{if(token===analysisGeneration){analysis=value;draw();}}):{...(await teamReview(captured.payload,analysisController.signal)).result,reason:'REPLACEMENT_COST_SEARCH_PENDING'};
   if(token===analysisGeneration){const renderStart=performance.now();analysis=result;draw();performance.measure('bellibing-improve:render',{start:renderStart,end:performance.now()});}
  }catch(error){if(token===analysisGeneration){analysis={status:'PENDING',reason:error.message};draw();}}},0);
 }
 async function act(restart=false,roll=null){message='';try{await (restart?session.discard():session.advance(roll));}catch(error){message=error.message;}draw(true);}
 function draw(force=false){
  const drawStart=performance.now();
  if(!available)return;
  if(!force&&(host.contains(document.activeElement)||opportunities.contains(document.activeElement))&&document.activeElement.matches('input,select')){const result=opportunities.querySelector('[data-improve-result]');if(result)result.innerHTML=resultView();performance.measure('bellibing-improve:dom',{start:drawStart,end:performance.now()});return;}const c=context(),s=session.snapshot(),a=s?.advice,done=s?.candidate.level===25,winner=a?.winner;
  host.hidden=!!c.pending;opportunities.hidden=!!c.pending;document.body.classList.toggle('has-echo-advisor',!c.pending);document.body.classList.toggle('advisor-complete',done);
  const used=new Set(s?.candidate.substats.map(r=>r.name)??[]),names=SUBSTAT_TYPES.filter(n=>!used.has(n)),ids=c.currentAdvice?.team?.characterIds??[];
  const invest=ids.map(id=>`<fieldset><legend>${escapeHtml(c.currentAdvice.names?.[id]??id)}</legend>${[['characterLevel','Character level',90],['weaponLevel','Weapon level',90],['weaponRefinement','Weapon rank',5]].map(([key,label,max])=>`<label>${label}<input type="number" min="1" max="${max}" required data-investment="${key}" data-character="${escapeHtml(id)}" value="${investments[id]?.[key]??''}"></label>`).join('')}</fieldset>`).join('');
  const detailsOpen=opportunities.open;opportunities.innerHTML=`<summary>Advice details</summary><div class="improve-controls" ${service?'':'hidden'}><label>Damage metric<select data-objective><option value="TEAM_DPS" ${metric==='TEAM_DPS'?'selected':''}>Team DPS</option><option value="SELECTED_CHARACTER_DPS" ${metric==='SELECTED_CHARACTER_DPS'?'selected':''}>Character DPS</option></select></label><label>Recommendation objective<select data-optimization-objective>${IMPROVE_OBJECTIVE_OPTIONS.map(([id,label])=>`<option value="${id}" ${id===objective?'selected':''}>${label}</option>`).join('')}</select></label></div>
   <details class="actual-investments" ${ids.some(id=>!investments[id]?.characterLevel||!investments[id]?.weaponLevel||!investments[id]?.weaponRefinement)?'open':''}><summary>Actual team levels and weapon ranks</summary>${invest}</details>
   <div data-improve-result>${resultView()}</div>${localAdviceSummary(a)}`;opportunities.open=detailsOpen;
  host.innerHTML=`
   <div class="advice-options is-compact">${s&&a?.choices?.length?renderObservedCheckpointOptions(a):''}</div>
   ${s?.candidate.substats.length?`<button type="button" data-restart ${s.recoveryPending||s.aborted?'disabled':''}>${winner==='KEEP_TEMPORARY'?'Retain comparison and start another':'Restart candidate'}</button>`:''}
   <div class="advice-spent">${s?`${s.workspaceSpent.tuners} Tuners spent · ${s.workspaceSpent.returnedTuners} returned · ${s.workspaceSpent.echoes} Echoes used`:'Saved equipment and inventory are preserved'}</div>`;
  opportunities.querySelectorAll('[data-investment]').forEach(el=>el.onchange=()=>{investments[el.dataset.character]??={};investments[el.dataset.character][el.dataset.investment]=Number(el.value);analysisKey=null;session.sync();refreshAnalysis();});
  opportunities.querySelector('[data-objective]').onchange=e=>{metric=e.target.value;analysisKey=null;session.sync();refreshAnalysis();};
  opportunities.querySelector('[data-optimization-objective]').onchange=e=>{objective=e.target.value;analysisKey=null;session.sync();refreshAnalysis();};
  const restart=host.querySelector('[data-restart]');if(restart)restart.onclick=()=>act(true);
  host.querySelectorAll('[data-checkpoint-action]').forEach(button=>button.onclick=()=>{
   if(button.disabled)return;
   if(button.dataset.checkpointAction==='CONTINUE'){rollEditor=s?.candidate.substats.length??0;onRender();document.querySelector('#newCard [data-wb-roll="'+rollEditor+'"]')?.focus();}
   else restart?.click();
  });performance.measure('bellibing-improve:dom',{start:drawStart,end:performance.now()});
 }
 opportunities.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-improve-slot]');if(!button)return;
  document.querySelector(`[data-slot="${button.dataset.improveSlot}"]`)?.click();
  requestAnimationFrame(()=>document.querySelector('#newCard [data-wb-roll]')?.focus({preventScroll:true}));
 });
 for(const root of [host,opportunities])root.addEventListener('focusout',()=>setTimeout(()=>draw(),0));
 installTransientChoiceDismissal(document,{selector:'#newCard .wb-substats',isOpen:()=>rollEditor!==null,onClose:()=>{rollEditor=null;rollMove=null;onRender();}});
 window.addEventListener('pagehide',()=>{allowAutoExpand=false;rollEditor=null;rollMove=null;});
 window.addEventListener('pageshow',()=>{allowAutoExpand=false;rollEditor=null;rollMove=null;if(available)onRender();});
 (async()=>{
  let supported=false;if(['127.0.0.1','localhost'].includes(location.hostname))try{supported=(await post({action:'status'})).protocol==='BELLIBING_ECHO_ADVICE_V1';}catch{}
  if(!supported)try{const r=await fetch(new URL('./engine-release.json',import.meta.url),{cache:'no-store'}),m=await r.json();if(m.status==='SERVER_RUNTIME_V1'&&m.version===1&&m.files?.length===0&&m.review){service=createServerTransport({endpoint:m.endpoint});service.prepare().catch(()=>{});supported=true;}}catch{}
  connected=supported;const {createInteractiveEchoSession}=await import('../../../../src/interactiveEchoSession.mjs');initialize(createInteractiveEchoSession);available=true;host.hidden=false;opportunities.hidden=false;
  draw();refreshAnalysis();onRender();
 })().catch(()=>{});
 function editorState(){
  const c=context(),current=session?.snapshot()?.candidate,n=current?.substats.length??0;
  const key=JSON.stringify([c.owner.characterId,c.owner.slot,c.template,current?.id,current?.substats]);
  if(key!==rollDraftKey){rollMove=null;rollDraftKey=key;rollDraft=Array.from({length:5},(_,i)=>structuredClone(current?.substats[i]??null));rollEditor=null;}
  return {c,current,n};
 }
 function incompleteEdit(){
  if(!rollDraft)return false;
  const current=session?.snapshot()?.candidate,rows=current?.substats??[];
  return rows.some((row,i)=>JSON.stringify(row)!==JSON.stringify(rollDraft[i]))||!!rollDraft[rows.length];
 }
 function candidateCard(){
  const {c,current}=editorState();
  return current?null:c.template?{...configuredCard(c.template),configured:false,level:0}:null;
 }
 function editorMarkup(){
  const {c,n}=editorState();if(c.pending||!c.template)return null;
  const format=(name,value)=>Number.isFinite(value)?number(name.startsWith('Flat ')?value:value*100,2)+(name.startsWith('Flat ')?'':'%'):'—';
  return substatEditorMarkup({substats:rollDraft},{activeRow:rollEditor,characterId:c.owner.characterId,substats:SUBSTAT_TYPES.map(name=>({name,values:SUBSTAT_VALUE_TABLE[name]})),statValue:format,statMarkup:format,pendingMove:rollMove,editableCount:Math.min(5,n+1)});
 }
 async function editCard(event){
  const button=event.target.closest('button');if(!button||button.disabled)return;
  const a=button.dataset;if(equipping)return;editorState();allowAutoExpand=true;
  if(a.resetObserved!==undefined){if(!equipping){allowAutoExpand=false;message='';rollMove=null;session.resetSlot();rollDraftKey=null;onRender();}return;}
  if(a.equipObserved!==undefined){await equipCandidate();return;}
  if(a.wbRoll!==undefined){const index=Number(a.wbRoll);rollMove=null;rollEditor=rollEditor===index?null:index;onRender();return;}
  if(a.bcMoveCancel!==undefined){rollMove=null;onRender();return;}
  if(a.bcMoveConfirm!==undefined){
   if(!rollMove)return;
   const {index,from,name}=rollMove;
   if(rollDraft[from]?.name===name){rollDraft[index]=rollDraft[from];rollDraft[from]=null;}
   rollMove=null;rollEditor=index;onRender();return;
  }
  if(a.bcRollName!==undefined){
   const index=Number(a.bcRollName),other=rollDraft.findIndex((r,i)=>i!==index&&r?.name===a.value);
   if(other>=0){rollMove={index,from:other,name:a.value};onRender();return;}
   rollMove=null;
   if(rollDraft[index]?.name!==a.value)rollDraft[index]={name:a.value,value:null};
   rollEditor=index;onRender();return;
  }
  if(a.bcRollValue!==undefined){
   const index=Number(a.bcRollValue);if(rollMove)return;if(!rollDraft[index])rollDraft[index]={name:a.statName,value:null};
   rollDraft[index].value=Number(a.value);
   const prefix=structuredClone(rollDraft),n=session.snapshot()?.candidate.substats.length??0;
   const complete=rows=>rows.every(r=>r?.name&&Number.isFinite(r.value));
   try{
    message='';
    if(complete(prefix.slice(0,n))){
     if(n&&JSON.stringify(prefix.slice(0,n))!==JSON.stringify(session.snapshot().candidate.substats))session.correctRolls(prefix.slice(0,n));
     if(n<5&&prefix[n]&&complete([prefix[n]]))session.advance(prefix[n]);
    }
    rollEditor=null;
   }catch(error){message=error.message;}
   draw(true);onRender();
  }
 }
 async function equipCandidate(){
  if(equipping)return;
  const owner=globalThis.bellibingAccountSession,c=context(),observed=structuredClone(session?.snapshot()?.candidate??null);
  const card=observed??(c.template?{...createRank5EchoAtLevel0({id:crypto.randomUUID(),cost:c.template.cost,primaryMainStat:c.template.mainStatName}),speciesId:c.template.echoId,selectedSonataSetId:c.template.selectedSonataSetId}:null);
  if(!owner||incompleteEdit()||!card||![0,5,10,15,20,25].includes(card.level))return;
  const original=owner.store.snapshot(),record=JSON.stringify(original?.characters[c.owner.characterId]?.record);
  equipping=true;onRender();
  try{
   await saveQueue;
   const latest=owner.store.snapshot(),now=context();
   if(latest.id!==original.id||JSON.stringify(latest.characters[c.owner.characterId]?.record)!==record||now.owner.characterId!==c.owner.characterId||now.owner.slot!==c.owner.slot||JSON.stringify(session.snapshot()?.candidate??null)!==JSON.stringify(observed))throw Error('Build changed. Review before equipping.');
   const build=latest.characters[c.owner.characterId].record.build;
   const expectedItemId=build.echoSets.sets[build.echoSets.activeSetId].slots[c.owner.slot];
   const next=equipObservedEcho(latest,c.owner.characterId,c.owner.slot,card,owner.catalog,{expectedItemId});
   await owner.store.commit(next,{expectedRevision:latest.revision,expectedAccountId:latest.id,reason:'EXPLICIT_IMPROVE_EQUIP'});
   message='';if(context().owner.characterId===c.owner.characterId&&context().owner.slot===c.owner.slot&&(session.snapshot()?.candidate?.id===card.id||!observed)){session.resetSlot();rollDraftKey=null;}
  }catch(error){message=error.message;}
  finally{equipping=false;draw(true);onRender();}
 }
 function cardActions(){
  const card=session?.snapshot()?.candidate;
  return `${message?'<span class="observed-edit-error" role="status">'+escapeHtml(verdict())+'</span>':''}<button type="button" data-reset-observed ${equipping?'disabled':''}>Reset</button><button type="button" data-equip-observed ${equipping||incompleteEdit()||(!card&&!context().template)||(card&&![0,5,10,15,20,25].includes(card.level))?'disabled':''}>${equipping?'Equipping…':'Equip Echo'}</button>`;
 }
 const verdict=()=>message?({ADVICE_UNAVAILABLE:'Advice service unavailable',INSUFFICIENT_ECHOES:'Not enough Echoes',INSUFFICIENT_TUNERS:'Not enough Tuners',INSUFFICIENT_TUBES:'Not enough Tubes'}[message]??message):incompleteEdit()?'Complete the selected roll':session?.snapshot()?.pending?pendingCopy(session.snapshot().pending):checkpointVerdict(session?.snapshot()?.advice);
 return {feedback(){const current=session?.snapshot(),c=context();if(c.dpsPlan?.dpsEnabled)return sampledDpsFeedback(c.dpsSearch);return improveFeedback(current?.advice,{level:current?.candidate.level??0,pending:!!current?.pending||incompleteEdit(),erRequirement:c.erRequirement});},feedbackMarkup,expectedCost(){if(context().dpsPlan?.dpsEnabled)return sampledDpsCost(context().dpsSearch);return incompleteEdit()||session?.snapshot()?.pending?null:manualTargetExpectedCost(session?.snapshot()?.advice);},statTargetCost:slot=>statCosts.read(context(),slot),cardActions,replaceCandidate(){if(equipping)throw Error('Wait for Equip Echo to finish');if(!session)throw Error('Echo editor is loading');if(session.snapshot()?.candidate)session.startCandidate();else session.sync();rollDraftKey=null;onRender();},candidateCard,editorMarkup,editCard,verdict,incompleteEdit,available:()=>available,sync(){if(available){statCosts.sync(context());restoreObserved();session.sync();refreshAnalysis();}},start:()=>{editorState();rollEditor=session.snapshot()?.candidate.substats.length??0;onRender();},reset:()=>session?.reset(),snapshot:()=>session?.snapshot()??null,comparisonCandidates:slot=>{const cards=session?.comparisonCandidates()??Array(5).fill(null);cards[slot]=incompleteEdit()?null:session?.snapshot()?.candidate??cards[slot];return cards;},abort:()=>{session?.abort();analysisController?.abort();clearTimeout(analysisTimer);analysisGeneration++;analysis={status:'PENDING',reason:'ABORTED'};draw();},export:()=>({kind:'BELLIBING_OBSERVED_IMPROVE_V1',session:session?.snapshot()??null,analysis,accountMutation:false})};
}
