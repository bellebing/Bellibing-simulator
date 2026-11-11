import {dpsReasonLabel} from './dps-status.js';
import {ECHO_TUBES} from '../../../assets/resourceInventory.js';
import {escapeHtml as esc} from './util.js';
const probability=value=>Number.isFinite(value)&&value>=0&&value<=1?value:null;
const percent=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(value*100)+'%';

// Presentation only. Manual-target probability never establishes build utility.
export function improveFeedback(advice,{level=0,pending=false,erRequirement=null}={}){
 const raw=advice?.targetGuidance;
 if(pending||!raw||raw.certificate?.exactFixedPoint!==true)return {scope:'PENDING',tone:'neutral',reason:pending?'Updating advice':'Record the next roll',chance:null};
 const chance=probability(raw.targetChance?.approximate);
 const complete=level===25;
 const secured=!complete&&chance===1;
 const erElsewhere=['NEEDS_OTHER_SLOTS_OR_MAIN_STAT','PROGRESS_TOWARD_BUILD'].includes(erRequirement?.status);
 const title=erElsewhere&&(secured||complete&&raw.status==='TARGET_SUCCESS')?'Stat targets met; ER remains':secured?'Finish to +25':complete?(raw.status==='TARGET_SUCCESS'?'Targets met':'Targets not met'):advice.decision;
 const reason=erElsewhere?(erRequirement.status==='PROGRESS_TOWARD_BUILD'?'Positive ER step; build goal remains':'ER needs another slot or main stat'):secured?'Stat targets already secured':complete?'Configured stat targets':chance===0?'Targets no longer reachable':raw.status==='BEFORE_GATE'?'Before your chosen Gate':raw.winner==='DISCARD'?'Restart costs fewer Tuners':raw.winner==='CONTINUE'?'Continue costs fewer Tuners':'No resolved cost comparison';
 return {alternatives:{continue:{chance:probability(raw.continue?.chance?.approximate),tuners:raw.continue?.tuners?.approximate??null},restart:{chance:probability(raw.discard?.chance?.approximate),tuners:raw.discard?.tuners?.approximate??null}},scope:'STAT_TARGETS',tone:erElsewhere?'caution':secured||raw.status==='TARGET_SUCCESS'?'achieved':raw.winner==='CONTINUE'?'positive':raw.winner==='DISCARD'?'negative':'caution',title,reason,chance};
}
export function feedbackMarkup(value){
 if(value.scope==='DPS_SEARCH'){
  const s=value.search,row=s?.selected;
  if(s?.status!=='ESTIMATED')return '<p class="improve-short-reason">'+esc(value.reason)+'</p>';
  const format=n=>Number.isFinite(n)?new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n):'—';
  const chance=p=>!p?'—':p.successes===0&&p.samples>1?'Not resolved':percent(p.estimate);
  const suggestion=s.recommendation,canUse=s.repairingEnergy&&suggestion?.slot===row.slot&&suggestion.mainStatName!==s.selectedTemplate?.mainStat?.name;
  const action=canUse?'<button type="button" class="improve-use-suggestion" data-use-improve-suggestion>Use '+esc(suggestion.mainStatName)+' main stat</button>':'';
  return '<p class="improve-short-reason">'+esc(value.reason)+'</p>'+action+'<div class="improve-paths"><div class="improve-path"><strong>Start new</strong><b>'+chance(row.restartProbability??s.slots[row.slot]?.probability)+'</b><span>≈ '+format(row.restartCost?.tuners)+' Tuners</span></div><div class="improve-path"><strong>Continue</strong><b>'+chance(row.probability)+'</b><span>≈ '+format(row.continueCost?.tuners)+' Tuners</span></div></div>';

 }

 if(value.scope==='DPS_OBJECTIVE')return `<p class="improve-short-reason">${esc(value.reason)}</p><strong class="improve-model-gain">Target ≥ ${value.target===null?esc(value.minimumPercent)+'% of reference':new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value.target)+' team DPS'}</strong>${value.actual!==null?'<p>Candidate '+new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value.actual)+'</p>':''}`;
 if(value.scope==='DPS_COMPARISON')return `<p class="improve-short-reason">${esc(value.reason)}</p><strong class="improve-model-gain">${value.gain>0?'+':''}${new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(value.gain)} team DPS</strong><small>Model estimate</small>`;
 const known=value.chance!==null;
 const options=value.alternatives;
 const option=(label,key)=>{const row=options[key];return `<div class="improve-path"><strong>${label}</strong><b>${row.chance===null?'—':percent(row.chance)}</b><small>success this attempt</small><span>${Number.isFinite(row.tuners)?'≈ '+new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(row.tuners):'—'} Tuners</span></div>`;};
 const comparison=options?`<div class="improve-paths" aria-label="Restart versus Continue">${option('Start new','restart')}${option('Continue','continue')}</div><small class="improve-path-scope">Gross cost until targets · includes restarts</small>`:'';
 return `${comparison?'':'<p class="improve-short-reason">'+esc(value.reason)+'</p>'}${comparison}<div class="improve-odds" data-odds-scope="${value.scope}"><span>Chance to meet targets</span><div class="improve-chance-bar" ${known?'role="meter" aria-label="Chance to meet configured stat targets at +25" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+(value.chance*100)+'"':'aria-label="Chance unavailable"'} style="--success:${known?value.chance*100:0}%"><span></span></div><div class="improve-odds-labels"><span>Success <b>${known?percent(value.chance):'—'}</b></span><span>Miss <b>${known?percent(1-value.chance):'—'}</b></span></div><small>Stat targets</small></div>`;
}
export function manualTargetExpectedCost(advice){
 const raw=advice?.targetGuidance;
 if(raw?.certificate?.exactFixedPoint!==true)return null;
 const cost=raw.status==='TARGET_SUCCESS'?0:raw.status==='BEFORE_GATE'||raw.winner==='CONTINUE'?raw.continue?.tuners?.approximate:raw.discard?.tuners?.approximate;
 const resources=raw.resources?.optimal,echoes=resources?.echoes?.approximate,exp=resources?.exp?.approximate;
 const premium=ECHO_TUBES.find(t=>t.id==='premium');
 const tubes=Number.isFinite(exp)&&exp>=0?Object.fromEntries(ECHO_TUBES.map(t=>[t.id,t.id==='premium'?exp/premium.echoExp:0])):null;
 return Number.isFinite(cost)&&cost>=0?{status:'VERIFIED',basis:'MANUAL_TARGET_GROSS_FROM_NOW',tuners:cost,echoes:Number.isFinite(echoes)&&echoes>=0?echoes:null,tubes,tubeReference:Boolean(tubes)}:null;
}

export function dpsObjectiveFeedback(plan,review,candidate){
 const reference=review?.reference;
 const referenceReady=reference?.status==='EXPERIMENTAL'&&Number.isFinite(reference.teamTotal)&&reference.teamTotal>0&&reference.rotationAcceptance?.status==='MET';
 const target=referenceReady?reference.teamTotal*plan.minimumDpsPercent/100:null;
 const result=review?.candidate;
 const ready=candidate?.level===25&&referenceReady&&result?.status==='EXPERIMENTAL'&&result.rotationAcceptance?.status==='MET'&&result.contextIdentity===reference.contextIdentity&&Number.isFinite(result.teamTotal);
 return {scope:'DPS_OBJECTIVE',tone:ready?(result.teamTotal>=target?'achieved':'caution'):'neutral',title:ready?(result.teamTotal>=target?'DPS target met':'Below DPS target'):'DPS optimisation pending',reason:target===null?'Reference DPS needed':'Roll-cost optimisation pending',chance:null,target,actual:ready?result.teamTotal:null,minimumPercent:plan.minimumDpsPercent};
}

export function sampledDpsFeedback(search){
 if(search?.status!=='ESTIMATED')return {scope:'DPS_SEARCH',tone:'neutral',title:search?.status==='CALCULATING'?'Comparing Echoes…':'DPS comparison unavailable',reason:search?.status==='CALCULATING'?'Comparing supported replacements':search?.reason?dpsReasonLabel(search.reason):'Choose DPS optimisation to compare Echoes',chance:null,search};
 const selected=search.selected,p=selected.probability?.estimate??null;
 return {scope:'DPS_SEARCH',tone:['New Echo wins','ER restored'].includes(selected.decision)?'achieved':selected.decision==='Continue'?'positive':selected.decision==='Start new Echo'?'negative':'neutral',title:selected.observedRollCount===0?(search.recommendedSlot===selected.slot?'Roll your new Echo':search.recommendedSlot!==null?'Start with Echo '+(search.recommendedSlot+1):'Choose a new Echo'):selected.decision==='More samples needed'?'Comparison unresolved':selected.decision,reason:search.plannedRotationComparison&&search.energyStatus==='NOT_MET'?'Planned rotation; ER not met':selected.decision==='ER restored'?'Candidate meets ER':search.repairingEnergy?'More ER needed':search.basis==='TEMPORARY_REFERENCE_TEAM'?'Temporary reference team':'Your account team',chance:p,search};
}
export function sampledDpsCost(search){
 const value=search?.status==='ESTIMATED'?search.selected?.expectedCost:null;
 return value?{status:'ESTIMATED',basis:'DPS_SAMPLED_POLICY_GROSS',echoes:value.echoes,tuners:value.tuners,tubes:{premium:value.exp/ECHO_TUBES.find(t=>t.id==='premium').echoExp,advanced:0,medium:0,basic:0}}:null;
}
