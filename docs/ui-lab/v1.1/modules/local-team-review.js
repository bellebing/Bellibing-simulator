import {temporaryTeamReview} from './temporary-team-review.js';
import {captureLocalTeamBuilds} from '../../../../src/localTeamBuildCapture.mjs';
import {sourceTeamRoles} from './team-selection.js';
import {createServerTransport} from './server-transport.js';
import {escapeHtml} from './util.js';
const path='/local-review/team-dps',headers={'Content-Type':'application/json','X-Bellibing-Review':'1'};
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Math.abs(n)<.5?0:n):'—';
const labels={MAIN_ECHO_REQUIRED_FOR_ROTATION:'Choose a main Echo for this rotation',WHOLE_BUILD_ER_EXPECTATION_PENDING:'Expected build with total ER target is not available yet',EXPECTED_BUILD_PENDING:'Expected build is not available for these settings',SANDBOX_REFERENCE_SOURCE_PENDING:'DPS calculation not supported',FIVE_COMPLETED_SANDBOX_ECHOES_REQUIRED:'Simulate all five Echoes',SANDBOX_REFERENCE_INPUT_PENDING:'DPS calculation not supported',SOURCE_CALCULATOR_PROFILE_PENDING:'Equipment not supported',SOURCE_BUILD_STAT_REQUIREMENT_UNMET:'Rotation stat requirement not met',SOURCE_REFERENCE_ROTATION_PENDING:'Rotation not supported',SOURCE_CALCULATOR_DEPENDENCY_PENDING:'Local source model unavailable',SOURCE_CALCULATOR_ENEMY_CONTEXT_PENDING:'Reference enemy mismatch',CHANGED_REFERENCE_ROTATION_SCHEDULE_PENDING:'Changed rotation Pending',SOURCE_ROTATION_CAST_REQUIREMENTS_UNMET:'Rotation requirements not met',CONFIRM_REFERENCE_INVESTMENT:'Select Lv90 / R1 reference',ENTER_ACTUAL_TEAM_INVESTMENTS:'Complete team levels and weapon ranks in Build',ACTUAL_FORTE_OBSERVATIONS_REQUIRED:'Confirm Skills in Build',COMPLETE_ACCOUNT_TEAM_REQUIRED:'Complete the team in Build',FIVE_COMPLETE_ACCOUNT_ECHOES_REQUIRED:'Five complete Echoes per teammate required',WHOLE_TEAM_ENERGY_REQUIREMENT_NOT_MET:'ER requirement not met',CHANGED_SEQUENCE_STATE_SCHEDULE_PENDING:'Sequence rotation Pending',SOURCE_SCHEDULE_REQUIRES_MORTEFI_S6:'S0–S2 rotation Pending',SOURCE_DAMAGE_SCHEDULE_PENDING:'Team rotation Pending',CHANGED_WEAPON_ROTATION_CONTEXT_PENDING:'Weapon rotation Pending',CHANGED_EQUIPMENT_ROTATION_CONTEXT_PENDING:'Echo / Sonata rotation Pending',CANONICAL_BUILD_VALIDATION_PENDING:'Complete legal Echo observations required',CHARACTER_INVESTMENT_CONTEXT_PENDING:'Max skills required',FIXED_COMPARISON_CONTEXT_MISMATCH:'Changed reference context',NO_ACTIVE_OBSERVED_SANDBOX_CARDS:'Simulate an active Echo first'};
export function hasCompleteTeamBuilds(input){
 const {team,records}=input??{};
 return team?.characterIds?.length===3&&team.characterIds.every(id=>{const r=records?.find(r=>r.characterId===id),b=r?.buildState;return r?.status==='OBSERVED_PRODUCTION_BUILD_RECORD'&&b?.echoSets?.sets?.[b.echoSets.activeSetId]?.slots?.length===5&&b.echoSets.sets[b.echoSets.activeSetId].slots.every(c=>c===null||c?.rank===5&&Number.isInteger(c.level)&&c.level>=0&&c.level<=25&&c.level%5===0&&c.substats?.length===c.level/5);});
}
export function createLocalTeamReview({readInput,readSearch=()=>null,autoReference=false,onAvailable=()=>{},onResult=()=>{},onReferenceInvestmentChange=()=>{},fetchImpl=fetch}={}){
 let available=false,enabled=autoReference?null:false,binding=null,generation=0,result=null,message='Select Lv90 / R1 reference',timer=null,container=null,pendingController=null,service=null;
 let expectedCache=null,referenceChoice=null;
 const snapshot=()=>{try{return readInput();}catch{return null;}};
 const identity=()=>JSON.stringify(snapshot());
 const expectedIdentity=input=>{if(input?.mode!=='SANDBOX')return null;const {erTarget,...settings}=input.scope?.context?.settings??{};return JSON.stringify({character:input.selectedCharacterId,team:input.team,build:input.scope?.buildContext,settings,slots:input.scope?.slots?.map(s=>({active:s.active,configuration:s.configuration}))});};
 const post=async(value,signal)=>{if(service)return service.request('team',undefined,undefined,value,signal);const options={method:'POST',headers,body:JSON.stringify(value),credentials:'same-origin',cache:'no-store',signal};for(let attempt=0;attempt<8;attempt++){signal?.throwIfAborted();const response=await fetchImpl(path,options);if(response.status===429){await new Promise(resolve=>setTimeout(resolve,Math.min(4000,500*2**attempt)));continue;}if(!response.ok)throw Error('LOCAL_REVIEW_UNAVAILABLE');return response.json();}throw Error('LOCAL_REVIEW_BUSY');};
 function draw(){
  if(!container?.isConnected)return;
  const input=snapshot(),sandbox=input?.mode==='SANDBOX',team=input?.team,roles=sourceTeamRoles(team),ids=roles?[roles.main,roles.partner,roles.third]:[],names=input?.names??{};
  const valid=r=>r?.status==='EXPERIMENTAL'&&r.verification==='EXPERIMENTAL_FIXED_REFERENCE'&&r.teamDpsReady===false&&r.authorizesCharacterUpgrade===false&&typeof r.contextIdentity==='string'&&/^[a-f0-9]{64}$/.test(r.contextIdentity)&&typeof r.provider?.sourceBinding==='string'&&/^[a-f0-9]{64}$/.test(r.provider.sourceBinding)&&r.rotationAcceptance?.status==='MET'&&Number.isFinite(r.teamTotal)&&r.teamTotal>=0&&Array.isArray(r.characterContributions)&&r.characterContributions.length===3&&ids.every(id=>r.characterContributions.filter(m=>m.characterId===id&&Number.isFinite(m.dps)&&m.dps>=0).length===1)&&Math.abs(r.characterContributions.reduce((n,m)=>n+m.dps,0)-r.teamTotal)<1e-6*Math.max(1,r.teamTotal);
  const baseline=sandbox?result?.expected?.statisticalBasis==='DPS_AT_EXPECTED_STATS_NOT_EXPECTED_DPS'?result.expected:null:result?.current;
  const row=(label,r)=>{
   const erFailed=r?.reason==='WHOLE_TEAM_ENERGY_REQUIREMENT_NOT_MET'&&r.rotationAcceptance?.status==='NOT_MET',requirements=r?.rotationAcceptance?.requirements??[];
   const detail=requirements.filter(v=>Number.isFinite(v.actual)&&Number.isFinite(v.required)&&v.actual+1e-9<v.required).map(v=>`${names[v.characterId]??v.characterId}: ${(v.actual*100).toFixed(1)}% / ${(v.required*100).toFixed(1)}% required`).join('; ');
   const cell=id=>valid(r)?fmt(r.characterContributions.find(m=>m.characterId===id).dps):erFailed&&requirements.some(v=>v.characterId===id&&v.actual+1e-9<v.required)?'ER not met':'—';
   return `<tr${label==='Expected build'?' title="Model DPS at expected Hard/Flex build stats; total-ER conditioning and mean DPS across RNG outcomes are not included. Teammates use fixed reference profiles."':''}><th>${label}</th>${ids.map(id=>`<td${erFailed?` title="${escapeHtml(detail)}"`:''}>${cell(id)}</td>`).join('')}<td class="team-total"${erFailed?` title="${escapeHtml(detail)}"`:''}>${valid(r)?fmt(r.teamTotal):erFailed?'ER not met':'—'}</td></tr>`;
  };
  const comparable=result?.status==='EXPERIMENTAL'&&valid(baseline)&&(!sandbox||baseline.statisticalBasis==='DPS_AT_EXPECTED_STATS_NOT_EXPECTED_DPS')&&valid(result.candidate)&&baseline.contextIdentity===result.candidate.contextIdentity&&baseline.provider.sourceBinding===result.candidate.provider.sourceBinding;
  const delta=comparable?ids.map(id=>result.candidate.characterContributions.find(m=>m.characterId===id).dps-baseline.characterContributions.find(m=>m.characterId===id).dps).concat(result.candidate.teamTotal-baseline.teamTotal):null;
  const changeCell=(value,index)=>{
   if(!delta)return '<td>—</td>';
   const shown=Math.abs(value)<.5?0:value;
   const base=index===ids.length?baseline.teamTotal:baseline.characterContributions.find(m=>m.characterId===ids[index]).dps,percent=base>0?value/base*100:null;
   const relative=Number.isFinite(percent)&&(shown!==0||value===0)?`<small class="local-team-relative">${percent>0?'+':''}${new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(percent)}%</small>`:'';
   return `<td data-change="${shown>0?'up':shown<0?'down':'equal'}">${shown>0?'+':''}${fmt(shown)}${relative}</td>`;
  };
  const complete=sandbox||enabled||hasCompleteTeamBuilds(input);
  const shownCandidate=comparable||sandbox&&(result?.candidate?.reason==='WHOLE_TEAM_ENERGY_REQUIREMENT_NOT_MET'||result?.expected?.status==='PENDING'&&valid(result?.candidate))?result.candidate:null;
  const estimate=readSearch();
  const expectedRow=!sandbox&&estimate?.characterId===input.selectedCharacterId&&estimate.accountBuildIdentity===JSON.stringify(input.records?.find(r=>r.characterId===input.selectedCharacterId)?.buildState)&&estimate.teamIdentity===JSON.stringify(input.team)&&Boolean(estimate.useReference)===Boolean(enabled)&&estimate?.status==='ESTIMATED'&&estimate.selected?.expected?`<tr title="Sampled mean of successful single-slot replacements, four equipped Echoes unchanged"><th>Expected</th>${ids.map(id=>`<td>${fmt(estimate.selected.expected.characterContributions.find(m=>m.characterId===id)?.dps)}</td>`).join('')}<td class="team-total">${fmt(estimate.selected.expected.teamDps)}</td></tr>`:'';
  const rows=complete?row(sandbox?'Expected build':'Current',baseline)+expectedRow+row(sandbox?'Simulated':input?.candidateLabel==='Observed'?'Observed':'Candidate',shownCandidate)+`<tr class="local-team-delta"><th>Change</th>${Array.from({length:ids.length+1},(_,i)=>changeCell(delta?.[i],i)).join('')}</tr>`:`<tr><td colspan="5" class="team-next-action">${team?'<a href="../build/">Complete your team in Build</a>':''}</td></tr>`;
  const currentReady=valid(baseline),status=currentReady?'EXPERIMENTAL':'PENDING';
  container.dataset.status=status;
  container.querySelector('[data-team-status]').textContent=currentReady?'Model estimate':message==='Calculating…'?'Calculating…':'DPS not supported';
  container.querySelector('[data-team-dps-body]').innerHTML=team?rows:'';
  const table=container.querySelector('.team-dps-table');table.dataset.status=comparable?'EXPERIMENTAL':'PENDING';
  container.querySelector('.local-team-status').textContent=team?(complete&&!['Calculating…','Select Lv90 / R1 reference','DPS calculation not supported'].includes(message)&&!message.startsWith('Experimental')?message:''):input?.pendingSelection==='VARIANT'?'':'Choose a teammate';
  container.querySelector('[data-team-reference]').innerHTML=sandbox?'':`<label class="local-team-enable" title="Temporary source team with reference levels, Skills and R1. Uses your selected Character’s Echoes and weapon identity. Nothing is saved to your account."><input type="checkbox" data-local-team-enable ${enabled?'checked':''}> Use recommended team · temporary</label>${enabled?'<small class="local-team-reference-note">Reference levels / Skills / R1; your Sequence</small>':''}`;

  if(!sandbox)container.querySelector('[data-local-team-enable]').onchange=e=>{referenceChoice=e.target.checked;enabled=referenceChoice;binding=null;refresh();onReferenceInvestmentChange(enabled);};
 }
 function refresh(){
  if(!available)return;
  if(autoReference&&referenceChoice===null){const nextReference=snapshot()?.mode==='IMPROVE'&&!hasCompleteTeamBuilds(snapshot());if(nextReference!==enabled){enabled=nextReference;binding=null;}}else if(enabled===null)enabled=false;
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
