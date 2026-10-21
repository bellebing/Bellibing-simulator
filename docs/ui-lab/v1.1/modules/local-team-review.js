import {captureLocalTeamBuilds} from '../../../../src/localTeamBuildCapture.mjs';
import {sourceTeamRoles} from './team-selection.js';
const path='/local-review/team-dps',headers={'Content-Type':'application/json','X-Bellibing-Review':'1'};
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n):'—';
const labels={SANDBOX_REFERENCE_SOURCE_PENDING:'DPS calculation not supported',FIVE_COMPLETED_SANDBOX_ECHOES_REQUIRED:'Simulate all five Echoes',SANDBOX_REFERENCE_INPUT_PENDING:'DPS calculation not supported',SOURCE_CALCULATOR_PROFILE_PENDING:'Equipment not supported',SOURCE_BUILD_STAT_REQUIREMENT_UNMET:'Rotation stat requirement not met',SOURCE_REFERENCE_ROTATION_PENDING:'Rotation not supported',SOURCE_CALCULATOR_DEPENDENCY_PENDING:'Local source model unavailable',SOURCE_CALCULATOR_ENEMY_CONTEXT_PENDING:'Reference enemy mismatch',CHANGED_REFERENCE_ROTATION_SCHEDULE_PENDING:'Changed rotation Pending',SOURCE_ROTATION_CAST_REQUIREMENTS_UNMET:'Rotation requirements not met',CONFIRM_REFERENCE_INVESTMENT:'Select Lv90 / R1 reference',COMPLETE_ACCOUNT_TEAM_REQUIRED:'Complete the team in Build',FIVE_COMPLETE_ACCOUNT_ECHOES_REQUIRED:'Five complete Echoes per teammate required',WHOLE_TEAM_ENERGY_REQUIREMENT_NOT_MET:'ER requirement not met',CHANGED_SEQUENCE_STATE_SCHEDULE_PENDING:'Sequence rotation Pending',SOURCE_SCHEDULE_REQUIRES_MORTEFI_S6:'S0–S2 rotation Pending',SOURCE_DAMAGE_SCHEDULE_PENDING:'Team rotation Pending',CHANGED_WEAPON_ROTATION_CONTEXT_PENDING:'Weapon rotation Pending',CHANGED_EQUIPMENT_ROTATION_CONTEXT_PENDING:'Echo / Sonata rotation Pending',CANONICAL_BUILD_VALIDATION_PENDING:'Complete legal +25 Echoes required',CHARACTER_INVESTMENT_CONTEXT_PENDING:'Max skills required',FIXED_COMPARISON_CONTEXT_MISMATCH:'Changed reference context',NO_ACTIVE_OBSERVED_SANDBOX_CARDS:'Simulate an active Echo first'};
export function hasCompleteTeamBuilds(input){
 const {team,records}=input??{};
 return team?.characterIds?.length===3&&team.characterIds.every(id=>{const r=records?.find(r=>r.characterId===id),b=r?.buildState;return r?.status==='OBSERVED_PRODUCTION_BUILD_RECORD'&&b?.echoSets?.sets?.[b.echoSets.activeSetId]?.slots?.filter(c=>c?.level===25).length===5;});
}
export function createLocalTeamReview({readInput,onAvailable=()=>{},fetchImpl=fetch}={}){
 let available=false,enabled=false,binding=null,generation=0,result=null,message='Select Lv90 / R1 reference',timer=null,container=null,pendingController=null;
 const snapshot=()=>{try{return readInput();}catch{return null;}};
 const identity=()=>JSON.stringify(snapshot());
 const post=async(value,signal)=>{const response=await fetchImpl(path,{method:'POST',headers,body:JSON.stringify(value),credentials:'same-origin',cache:'no-store',signal});if(!response.ok)throw Error('LOCAL_REVIEW_UNAVAILABLE');return response.json();};
 function draw(){
  if(!container?.isConnected)return;
  const input=snapshot(),team=input?.team,roles=sourceTeamRoles(team),ids=roles?[roles.main,roles.partner,roles.third]:[],names=input?.names??{};
  const valid=r=>r?.status==='EXPERIMENTAL'&&r.verification==='EXPERIMENTAL_FIXED_REFERENCE'&&r.teamDpsReady===false&&r.authorizesCharacterUpgrade===false&&typeof r.contextIdentity==='string'&&/^[a-f0-9]{64}$/.test(r.contextIdentity)&&typeof r.provider?.sourceBinding==='string'&&/^[a-f0-9]{64}$/.test(r.provider.sourceBinding)&&r.rotationAcceptance?.status==='MET'&&Number.isFinite(r.teamTotal)&&r.teamTotal>=0&&Array.isArray(r.characterContributions)&&r.characterContributions.length===3&&ids.every(id=>r.characterContributions.filter(m=>m.characterId===id&&Number.isFinite(m.dps)&&m.dps>=0).length===1)&&Math.abs(r.characterContributions.reduce((n,m)=>n+m.dps,0)-r.teamTotal)<1e-6*Math.max(1,r.teamTotal);
  const row=(label,r)=>`<tr><th>${label}</th>${ids.map(id=>`<td>${valid(r)?fmt(r.characterContributions.find(m=>m.characterId===id).dps):'—'}</td>`).join('')}<td class="team-total">${valid(r)?fmt(r.teamTotal):'—'}</td></tr>`;
  const comparable=result?.status==='EXPERIMENTAL'&&valid(result.current)&&valid(result.candidate)&&result.current.contextIdentity===result.candidate.contextIdentity&&result.current.provider.sourceBinding===result.candidate.provider.sourceBinding;
  const delta=comparable?ids.map(id=>result.candidate.characterContributions.find(m=>m.characterId===id).dps-result.current.characterContributions.find(m=>m.characterId===id).dps).concat(result.candidate.teamTotal-result.current.teamTotal):null;
  const changeCell=(value,index)=>{if(!delta)return '<td>—</td>';const base=index===ids.length?result.current.teamTotal:result.current.characterContributions.find(m=>m.characterId===ids[index]).dps,percent=base>0?value/base*100:null;return `<td data-change="${value>0?'up':value<0?'down':'equal'}">${value>0?'+':''}${fmt(value)}${Number.isFinite(percent)?`<small class="local-team-relative">${percent>0?'+':''}${new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(percent)}%</small>`:''}</td>`;};
  const sandbox=input?.mode==='SANDBOX',complete=sandbox||hasCompleteTeamBuilds(input);
  const rows=complete?row(sandbox?'Reference':'Current',result?.current)+row(sandbox?'Simulated':'Candidate',comparable?result.candidate:null)+`<tr class="local-team-delta"><th>Change</th>${Array.from({length:ids.length+1},(_,i)=>changeCell(delta?.[i],i)).join('')}</tr>`:`<tr><td colspan="5" class="team-next-action">${team?'<a href="../build/">Complete your team in Build</a>':''}</td></tr>`;
  const currentReady=valid(result?.current),status=currentReady?'EXPERIMENTAL':'PENDING';
  container.dataset.status=status;
  container.querySelector('[data-team-status]').textContent=!sandbox&&!enabled?'':currentReady?'Model estimate':message==='Calculating…'?'Calculating…':'DPS not supported';
  container.querySelector('[data-team-dps-body]').innerHTML=team?rows:'';
  const table=container.querySelector('.team-dps-table');table.dataset.status=comparable?'EXPERIMENTAL':'PENDING';
  container.querySelector('.local-team-status').textContent=team?(complete&&!['Calculating…','Select Lv90 / R1 reference','DPS calculation not supported'].includes(message)&&!message.startsWith('Experimental')?message:''):input?.pendingSelection==='VARIANT'?'':'Choose a teammate';
  container.querySelector('[data-team-reference]').innerHTML=sandbox?'':`<label class="local-team-enable"><input type="checkbox" data-local-team-enable ${enabled?'checked':''}> Lv90 / R1 model</label>`;

  if(!sandbox)container.querySelector('[data-local-team-enable]').onchange=e=>{enabled=e.target.checked;binding=null;refresh();};
 }
 function refresh(){
  if(!available)return;
  const next=identity();if(next===binding)return;
  binding=next;const token=++generation;result=null;clearTimeout(timer);pendingController?.abort();pendingController=null;
  const active=snapshot()?.mode==='SANDBOX'||enabled;
  message=active?'Calculating…':'Select Lv90 / R1 reference';draw();
  if(!active)return;
  timer=setTimeout(async()=>{
   try{
    const raw=snapshot();if(!raw||identity()!==next)return;
    const captured=await captureLocalTeamBuilds({...raw,acceptReferenceInvestment:true});
    if(token!==generation||identity()!==next)return;
    if(captured.status!=='CAPTURED'){message=labels[captured.reason]??'DPS calculation not supported';draw();return;}
    pendingController=new AbortController();
    const reply=await post(captured.payload,pendingController.signal);
    if(token!==generation||identity()!==next)return;
    if(reply.protocol!=='BELLIBING_LOCAL_TEAM_REVIEW_V1')throw Error('PROTOCOL');
    result=reply.result;
    const reason=result?.current?.status==='PENDING'?result.current.reason:result?.candidate?.status==='PENDING'?result.candidate.reason:result?.status==='PENDING'?result.reason:null;
    message=reason?(labels[reason]??'DPS calculation not supported'):(result?.current?.provider?.id==='RILEY_PINNED_SOURCE_CALCULATOR'?'Experimental · Riley source model':'Experimental · selected builds');draw();
   }catch{if(token===generation&&identity()===next){result=null;message='Local review unavailable';draw();}}
  },200);
 }
 if(['127.0.0.1','localhost'].includes(globalThis.location?.hostname))post({action:'status'}).then(value=>{if(value.protocol==='BELLIBING_LOCAL_TEAM_REVIEW_V1'&&value.status==='LOCAL_REVIEW_ONLY'){available=true;onAvailable();}}).catch(()=>{});
 return {mount(panel){if(!available)return;container=panel.querySelector('.sandbox-dps');if(!container)return;container.classList.add('local-team-review');container.dataset.kind=snapshot()?.mode==='SANDBOX'?'SANDBOX_BUILD':'ACCOUNT_BUILD';refresh();draw();},checkFresh:refresh};
}
