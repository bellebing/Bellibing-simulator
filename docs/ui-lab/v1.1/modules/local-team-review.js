import {DPS_REASON_LABELS as labels} from './dps-status.js';
import {sameDpsModelBasis,expectedMatchesAccountTeam,dpsComparisonWinner,dpsValueDirection} from './improve-comparison-basis.js';
import {temporaryTeamReview} from './temporary-team-review.js';
import {captureLocalTeamBuilds} from '../../../../src/localTeamBuildCapture.mjs';
import {sourceTeamRoles} from './team-selection.js';
import {createServerTransport} from './server-transport.js';
import {CHARACTER_CATALOG} from './catalog.js';
import {assetURL,escapeHtml} from './util.js';
const path='/local-review/team-dps',headers={'Content-Type':'application/json','X-Bellibing-Review':'1'};
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Math.abs(n)<.5?0:n):'—';

export function hasCompleteTeamBuilds(input){
 const {team,records}=input??{};
 return team?.characterIds?.length===3&&team.characterIds.every(id=>{const r=records?.find(r=>r.characterId===id),b=r?.buildState;return r?.status==='OBSERVED_PRODUCTION_BUILD_RECORD'&&b?.echoSets?.sets?.[b.echoSets.activeSetId]?.slots?.length===5&&b.echoSets.sets[b.echoSets.activeSetId].slots.every(c=>c===null||c?.rank===5&&Number.isInteger(c.level)&&c.level>=0&&c.level<=25&&c.level%5===0&&c.substats?.length===c.level/5);});
}
export function createLocalTeamReview({readInput,readSearch=()=>null,autoReference=false,onAvailable=()=>{},onResult=()=>{},onReferenceInvestmentChange=()=>{},fetchImpl=fetch}={}){
 let available=false,enabled=false,binding=null,generation=0,result=null,message='Select Lv90 / R1 reference',timer=null,container=null,pendingController=null,service=null;
 let expectedCache=null,referenceChoice=null;
 const snapshot=()=>{try{return readInput();}catch{return null;}};
 const identity=()=>JSON.stringify(snapshot());
 const expectedIdentity=input=>{if(input?.mode!=='SANDBOX')return null;const {erTarget,...settings}=input.scope?.context?.settings??{};return JSON.stringify({character:input.selectedCharacterId,team:input.team,build:input.scope?.buildContext,settings,slots:input.scope?.slots?.map(s=>({active:s.active,configuration:s.configuration}))});};
 const post=async(value,signal)=>{if(service)return service.request('team',undefined,undefined,value,signal);const options={method:'POST',headers,body:JSON.stringify(value),credentials:'same-origin',cache:'no-store',signal};for(let attempt=0;attempt<8;attempt++){signal?.throwIfAborted();const response=await fetchImpl(path,options);if(response.status===429){await new Promise(resolve=>setTimeout(resolve,Math.min(4000,500*2**attempt)));continue;}if(!response.ok)throw Error('LOCAL_REVIEW_UNAVAILABLE');return response.json();}throw Error('LOCAL_REVIEW_BUSY');};
 function draw(){
  if(!container?.isConnected)return;
  // A redraw may be triggered by another service before the polling refresh.
  // Retire the old Current/Candidate immediately, not just the Expected row.
  if(binding!==null&&identity()!==binding){refresh();return;}
  const input=snapshot(),sandbox=input?.mode==='SANDBOX',team=input?.team,roles=sourceTeamRoles(team),ids=roles?[roles.main,roles.partner,roles.third]:[],names=input?.names??{};
  const activeIds=sandbox||enabled?ids:ids.filter(id=>input?.records?.some(r=>r.characterId===id&&r.status==='OBSERVED_PRODUCTION_BUILD_RECORD'));
  for(const [index,button] of [...(container.querySelectorAll?.('[data-team-role]')??[])].entries()){
   const id=ids[index],person=CHARACTER_CATALOG.find(c=>c.id===id),shown=activeIds.includes(id)&&person;
   button.classList.toggle('is-empty',!shown);
   button.innerHTML=(shown?'<img class="dps-portrait" alt="" src="'+assetURL(person.face)+'"><span>'+escapeHtml(person.name)+'</span>':'<span class="team-empty-slot">Empty slot</span>')+(button.disabled?'':'<small>Change \u25be</small>');
  }
  const valid=(r,conditional=false)=>(r?.status==='EXPERIMENTAL'||conditional&&r?.status==='CONDITIONAL'&&r.basis==='PLANNED_ROTATION_ASSUMING_ENERGY_AVAILABLE')&&r.verification==='EXPERIMENTAL_FIXED_REFERENCE'&&r.teamDpsReady===false&&r.authorizesCharacterUpgrade===false&&typeof r.contextIdentity==='string'&&/^[a-f0-9]{64}$/.test(r.contextIdentity)&&(!Object.hasOwn(r,'comparisonIdentity')||typeof r.comparisonIdentity==='string'&&/^[a-f0-9]{64}$/.test(r.comparisonIdentity))&&typeof r.provider?.sourceBinding==='string'&&/^[a-f0-9]{64}$/.test(r.provider.sourceBinding)&&(r.rotationAcceptance?.status==='MET'||conditional&&r.rotationAcceptance?.status==='NOT_MET')&&Number.isFinite(r.teamTotal)&&r.teamTotal>=0&&Array.isArray(r.characterContributions)&&r.characterContributions.length===activeIds.length&&activeIds.every(id=>r.characterContributions.filter(m=>m.characterId===id&&Number.isFinite(m.dps)&&m.dps>=0).length===1)&&Math.abs(r.characterContributions.reduce((n,m)=>n+m.dps,0)-r.teamTotal)<1e-6*Math.max(1,r.teamTotal);
  const baseline=sandbox?result?.expected?.statisticalBasis==='DPS_AT_EXPECTED_STATS_NOT_EXPECTED_DPS'?result.expected:null:result?.current;
  let dpsWinner=null;
  const row=(label,r)=>{
   const planned=r?.conditionalDps,conditional=valid(planned,true);const shown=conditional?planned:r;
   const erFailed=r?.reason==='WHOLE_TEAM_ENERGY_REQUIREMENT_NOT_MET'&&r.rotationAcceptance?.status==='NOT_MET',requirements=r?.rotationAcceptance?.requirements??[];
   const detail=requirements.filter(v=>Number.isFinite(v.actual)&&Number.isFinite(v.required)&&v.actual+1e-9<v.required).map(v=>`${names[v.characterId]??v.characterId}: ${(v.actual*100).toFixed(1)}% / ${(v.required*100).toFixed(1)}% required`).join('; ');
   const cell=id=>!activeIds.includes(id)?'\u2014':valid(shown,conditional)?fmt(shown.characterContributions.find(m=>m.characterId===id).dps):erFailed&&requirements.some(v=>v.characterId===id&&v.actual+1e-9<v.required)?'ER not met':'—';
   const rowId=label==='Current'?'current':label==='New Echo'?'new':null;
   const direction=id=>{
    if(!rowId||!comparable||!valid(shown,conditional))return 'equal';
    const other=rowId==='current'?comparisonCandidate:comparisonBaseline;
    return dpsValueDirection(id===null?shown.teamTotal:shown.characterContributions.find(m=>m.characterId===id)?.dps,id===null?other.teamTotal:other.characterContributions.find(m=>m.characterId===id)?.dps);
   };
   return `<tr${rowId?' data-dps-row="'+rowId+'"':''}${rowId&&dpsWinner===rowId?' data-dps-winner="'+rowId+'"':''}${rowId&&dpsWinner&&dpsWinner!==rowId?' data-dps-loser="'+rowId+'"':''}${label==='Expected build'?' title="Model DPS at expected Hard/Flex build stats; total-ER conditioning and mean DPS across RNG outcomes are not included. Teammates use fixed reference profiles."':''}><th>${label}${conditional?' *':''}</th>${ids.map(id=>`<td data-dps-change="${direction(id)}"${erFailed?` title="${escapeHtml(detail)}"`:''}>${cell(id)}</td>`).join('')}<td class="team-total" data-dps-change="${direction(null)}"${erFailed?` title="${escapeHtml(detail)}"`:''}>${valid(shown,conditional)?fmt(shown.teamTotal):erFailed?'ER not met':'—'}</td></tr>`;
  };
  const comparisonBaseline=valid(baseline?.conditionalDps,true)?baseline.conditionalDps:baseline;
  const comparisonCandidate=valid(result?.candidate?.conditionalDps,true)?result.candidate.conditionalDps:result?.candidate;
  const comparable=valid(comparisonBaseline,comparisonBaseline?.status==='CONDITIONAL')&&(!sandbox||baseline.statisticalBasis==='DPS_AT_EXPECTED_STATS_NOT_EXPECTED_DPS')&&valid(comparisonCandidate,comparisonCandidate?.status==='CONDITIONAL')&&sameDpsModelBasis(comparisonBaseline,comparisonCandidate);
  dpsWinner=!sandbox&&comparable?dpsComparisonWinner(comparisonBaseline,comparisonCandidate):null;
  const delta=comparable?ids.map(id=>comparisonCandidate.characterContributions.find(m=>m.characterId===id)?.dps-comparisonBaseline.characterContributions.find(m=>m.characterId===id)?.dps).concat(comparisonCandidate.teamTotal-comparisonBaseline.teamTotal):null;
  const changeCell=(value,index)=>{
   if(!delta||!Number.isFinite(value))return '<td>—</td>';
   const shown=Math.abs(value)<.5?0:value;
   const base=index===ids.length?comparisonBaseline.teamTotal:comparisonBaseline.characterContributions.find(m=>m.characterId===ids[index]).dps,percent=base>0?value/base*100:null;
   const relative=Number.isFinite(percent)&&(shown!==0||value===0)?`<small class="local-team-relative">${percent>0?'+':''}${new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(percent)}%</small>`:'';
   return `<td data-change="${dpsValueDirection(base+value,base)}">${shown>0?'+':''}${fmt(shown)}${relative}</td>`;
  };
  const complete=sandbox||enabled||activeIds.includes(input?.selectedCharacterId);
  const shownCandidate=valid(result?.candidate?.conditionalDps,true)||valid(baseline?.conditionalDps,true)&&valid(result?.candidate)||comparable||sandbox&&(result?.candidate?.reason==='WHOLE_TEAM_ENERGY_REQUIREMENT_NOT_MET'||result?.expected?.status==='PENDING'&&valid(result?.candidate))?result.candidate:null;
  const estimate=readSearch();
  const expectedRow=!sandbox&&expectedMatchesAccountTeam(estimate,input,enabled)&&sameDpsModelBasis(baseline?.conditionalDps??baseline,estimate.current?.conditionalDps??estimate.current)&&estimate.selected?.expected?`<tr title="Sampled mean of successful single-slot replacements, four equipped Echoes unchanged"><th>Expected</th>${ids.map(id=>`<td>${fmt(estimate.selected.expected.characterContributions.find(m=>m.characterId===id)?.dps)}</td>`).join('')}<td class="team-total">${fmt(estimate.selected.expected.teamDps)}</td></tr>`:'';
  const rows=complete?row(sandbox?'Expected build':'Current',baseline)+expectedRow+row(sandbox?'Simulated':'New Echo',shownCandidate)+`<tr class="local-team-delta"><th>Change</th>${Array.from({length:ids.length+1},(_,i)=>changeCell(delta?.[i],i)).join('')}</tr>`:`<tr><td colspan="5" class="team-next-action">${team?'<a href="../build/">Complete your team in Build</a>':''}</td></tr>`;
  const currentReady=valid(baseline),status=currentReady?'EXPERIMENTAL':'PENDING';
  container.dataset.status=status;
  container.querySelector('[data-team-status]').textContent=valid(baseline?.conditionalDps,true)?'Planned DPS *':currentReady?'Model estimate':message==='Calculating…'?'Calculating…':'DPS not supported';
  container.querySelector('[data-team-dps-body]').innerHTML=team?rows:'';
  const table=container.querySelector('.team-dps-table');table.dataset.status=comparable?'EXPERIMENTAL':'PENDING';
  container.querySelector('.local-team-status').textContent=team?(complete&&!['Calculating…','Select Lv90 / R1 reference','DPS calculation not supported'].includes(message)&&!message.startsWith('Experimental')?message:''):input?.pendingSelection==='VARIANT'?'':'Choose a teammate';
  if(valid(baseline?.conditionalDps,true)||valid(result?.candidate?.conditionalDps,true))container.querySelector('.local-team-status').textContent='* Planned rotation; ER not met';
  if(currentReady&&team?.compositionBasis==='EXPERIMENTAL_MEMBER_MODULES')container.querySelector('.local-team-status').textContent='Model composition · first slot is Main DPS';
  container.querySelector('[data-team-reference]').innerHTML=sandbox?'':`<label class="local-team-enable" title="Temporary source team with reference levels, Skills and R1. Uses your selected Character’s Echoes and weapon identity. Nothing is saved to your account."><input type="checkbox" data-local-team-enable ${enabled?'checked':''}> Use recommended team · temporary</label>${enabled?'<small class="local-team-reference-note">Reference levels / Skills / R1; your Sequence</small>':''}`;

  if(!sandbox)container.querySelector('[data-local-team-enable]').onchange=e=>{referenceChoice=e.target.checked;enabled=referenceChoice;binding=null;refresh();onReferenceInvestmentChange(enabled);};
 }
 function refresh(){
  if(!available)return;
  // Borrowed partners require an explicit choice; incomplete accounts remain usable.

  const next=identity();if(next===binding)return;
  binding=next;const token=++generation,key=expectedIdentity(snapshot());result=key&&expectedCache?.key===key?{status:'EXPERIMENTAL',expected:expectedCache.value,current:null,candidate:null}:null;clearTimeout(timer);pendingController?.abort();pendingController=null;
  const active=snapshot()?.mode==='SANDBOX'||Boolean(snapshot()?.actualInvestments)||enabled;
  message=active?'Calculating…':'Select temporary recommended team';onResult(null);draw();
  if(!active)return;
  timer=setTimeout(async()=>{
   try{
    const raw=snapshot();if(!raw||identity()!==next)return;
    pendingController=new AbortController();
    let nextResult;
    if(enabled&&raw.mode==='IMPROVE'){
     nextResult=await temporaryTeamReview(raw,post,pendingController.signal);
    }else{
     const captured=await captureLocalTeamBuilds({...raw,acceptReferenceInvestment:false});
     if(token!==generation||identity()!==next)return;
     if(captured.status!=='CAPTURED'){message=labels[captured.reason]??'DPS calculation not supported';draw();return;}
     const reply=await post(captured.payload,pendingController.signal);
     if(reply.protocol!=='BELLIBING_LOCAL_TEAM_REVIEW_V1')throw Error('PROTOCOL');
     nextResult=reply.result;
    }
    if(token!==generation||identity()!==next)return;
    result=nextResult;
    onResult(result);
    if(raw.mode==='SANDBOX')expectedCache=result?.expected?.status==='EXPERIMENTAL'&&result.expected.statisticalBasis==='DPS_AT_EXPECTED_STATS_NOT_EXPECTED_DPS'?{key:expectedIdentity(raw),value:structuredClone(result.expected)}:null;
    const reason=raw.mode==='SANDBOX'&&result?.expected?.status==='PENDING'?result.expected.reason:result?.current?.status==='PENDING'?result.current.reason:result?.candidate?.status==='PENDING'?result.candidate.reason:result?.status==='PENDING'?result.reason:null;
    message=reason?(labels[reason]??'DPS calculation not supported'):(result?.current?.provider?.id==='RILEY_PINNED_SOURCE_CALCULATOR'?'Experimental · Riley source model':'Experimental · selected builds');draw();
   }catch{if(token===generation&&identity()===next){result=null;message='Local review unavailable';draw();}}
  },200);
 }
 (async()=>{
  if(['127.0.0.1','localhost'].includes(globalThis.location?.hostname))try{const value=await post({action:'status'});if(value.protocol==='BELLIBING_LOCAL_TEAM_REVIEW_V1'&&value.status==='LOCAL_REVIEW_ONLY'){available=true;onAvailable();return;}}catch{}
  try{const response=await fetchImpl(new URL('./engine-release.json',import.meta.url),{cache:'no-store'}),manifest=await response.json();
   if(manifest.status!=='SERVER_RUNTIME_V1'||manifest.version!==1||manifest.files?.length!==0||!manifest.review)return;
   service=createServerTransport({endpoint:manifest.endpoint,fetchImpl});available=true;onAvailable();
  }catch{}
 })();
 return {redraw:draw,referenceInvestmentAccepted:()=>enabled,mount(panel){if(!available)return;container=panel.querySelector('.sandbox-dps');if(!container)return;container.classList.add('local-team-review');container.dataset.kind=snapshot()?.mode==='SANDBOX'?'SANDBOX_BUILD':'ACCOUNT_BUILD';refresh();draw();},checkFresh:refresh};
}
