// Public presentation only. Values, ordering and recommendations come from the
// private allowlisted result; this module performs no DPS or decision calculation.
import {escapeHtml as html} from './util.js';
import {expectedTunerReason} from './stat-target-cost.js';
export const IMPROVE_OBJECTIVE_OPTIONS=Object.freeze([
 ['MIN_EXPECTED_NET_TUNERS','Lowest net Tuners'],['MIN_EXPECTED_NET_EXP','Lowest net EXP'],
 ['MIN_EXPECTED_ECHO_ATTEMPTS','Fewest Echo attempts'],['MAX_UPGRADE_PROBABILITY','Highest upgrade chance'],
 ['MAX_STOCK_SUCCESS_PROBABILITY','Highest chance within stock'],['MAX_EXPECTED_RETAINED_DPS','Largest expected DPS per attempt'],
 ['MAX_DPS_PER_TUNER','Best DPS per Tuner'],['MAX_DPS_PER_EXP','Best DPS per EXP'],['MAX_DPS_PER_ECHO','Best DPS per Echo'],
]);
export const number=(n,d=1)=>Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:d}):'—';
export function renderObservedCheckpointOptions(advice){
 const choices=advice?.choices??[];
 return ['CONTINUE','RESTART'].map(action=>{
  const choice=choices.find(c=>action==='CONTINUE'?c.action==='CONTINUE':c.action==='RESTART_DATA_RECOVERY')??(action==='RESTART'?choices.find(c=>c.action==='RESTART_FEED'):null);
  const title=action==='CONTINUE'?'Continue':'Start new Echo';
  return `<button type="button" class="advice-option" data-checkpoint-action="${action}" ${!choice||choice.status==='RESOURCE_BLOCKED'?'disabled':''}><strong>${title}</strong><span>${number(choice?.expectedFutureNetCost?.tuners)} Tuners</span><small>Expected future net cost</small><span>${interval(choice?.chance,true)}</span></button>`;
 }).join('');
}
// Production uses the existing selected-slot workspace. The original detailed
// renderer remains available for preserved review/tests, outside that route.
export function renderSelectedImproveOpportunity(analysis,selectedSlot){
 if(analysis?.reason==='REPLACEMENT_COST_SEARCH_PENDING')return `<p>Slot ranking and replacement cost Pending.</p>${Number.isFinite(analysis.current?.teamTotal)?`<p>Current team · ${number(analysis.current.teamTotal,0)} model DPS</p>`:''}<p>Completed candidates are compared with this actual build. Future-roll DPS decisions are not available yet.</p>`;
 if(!known(analysis))return `<p role="status">${analysis?.status==='CALCULATING'?'Calculating…':'Pending · '+html(analysis?.reason??'Actual supported team required')}</p>`;
 const d=analysis.decisionEvidence,row=analysis.slots?.find(s=>s.slot===selectedSlot);
 const next=Number.isInteger(d.recommendedSlot)&&d.recommendedSlot>=0&&d.recommendedSlot<5?`<button type="button" data-improve-slot="${d.recommendedSlot}">Work on Echo ${d.recommendedSlot+1}</button>`:'Pending';
 if(!row)return next;
 return `${next}<dl><dt>Echo ${selectedSlot+1} upgrade chance</dt><dd>${interval(row.probability,true)}</dd><dt>Expected net cost</dt><dd>${resource(row.expectedNetCost)}</dd><dt>Expected attempts</dt><dd>${interval(row.attempts)}</dd></dl>${row.potentiallyNotWorthwhile?'<p>Potentially not worthwhile · private estimate</p>':''}`;
}
const slot=n=>Number.isInteger(n)&&n>=0&&n<5?`Echo ${n+1}`:'Unavailable';
const signed=(n,d=2)=>Number.isFinite(n)?`${n>0?'+':''}${number(n,d)}`:'—';
export function interval(p,percent=false){
 if(!p)return '—';const f=v=>Number.isFinite(v)?number(v*(percent?100:1),percent?2:1):'—';
 return `${f(p.estimate)}${percent?'%':''} (${f(p.lower)}–${f(p.upper)}${percent?'%':''})`;
}
const tubes=v=>['premium','advanced','medium','basic'].map(id=>`${number(v?.[id],2)} ${id}`).join(' · ');
const resource=v=>`${number(v?.tuners)} Tuners · ${number(v?.exp,0)} EXP · ${number(v?.echoes)} Echoes`;
const boundKind=e=>e?.kind==='EXACT_WITHIN_MODEL'?'Exact within model':`Estimated · ${number(e?.confidence*100,0)}% bounds`;
const stock=s=>!s?'Unavailable':s.status==='UNLIMITED'?'Unlimited stock':s.status==='RESOURCE_BLOCKED'?'Stock cannot complete an attempt':`${s.status==='AT_LEAST'?'At least ':''}${number(s.attempts,0)} attempts · ${interval(s.probability,true)}`;
const known=(analysis)=>analysis?.provenance?.contract==='BELLIBING_FULL_BUILD_DPS_V1'&&analysis.provenance.context?.validity==='VALID'&&analysis.decisionEvidence?.version===1;
function contribution(v){
 if(v?.status!=='AVAILABLE'||!v.reference?.id||!v.reference?.label||!Number.isFinite(v.delta))return 'UNAVAILABLE · no accepted legal, comparable reference';
 return `${signed(v.delta)} DPS relative to ${html(v.reference.label)} (${html(v.reference.id)}). Current ${number(v.currentDps)} / reference ${number(v.referenceDps)} DPS; reference ${number(v.reference.cost,0)} Cost, ${html(v.reference.mainStat??'')}. Reference-dependent; not an intrinsic Echo score.`;
}
function differences(comparison){
 if(!comparison)return '<p>No resolved feasible comparison slot is available.</p>';
 const values=[['Upgrade chance',comparison.probability?.estimate,'pp',true],['Echo attempts',comparison.attempts?.estimate,''],['Net Tuners',comparison.netCost?.tuners?.estimate,''],['Net EXP',comparison.netCost?.exp?.estimate,''],['Net Echoes',comparison.netCost?.echoes?.estimate,''],['DPS on success',comparison.gain?.conditional?.estimate,'DPS'],['DPS per attempt',comparison.gain?.retained?.estimate,'DPS'],['DPS/Tuner',comparison.benefitPerResource?.tuners?.estimate,'']];
 return `<dl class="improve-differences">${values.map(([label,v,unit,percent])=>`<div><dt>${label}</dt><dd>${signed(Number.isFinite(v)&&percent?v*100:v)} ${unit}</dd></div>`).join('')}</dl><details><summary>Comparison bounds and Tube differences</summary><p>Signed differences are recommended minus alternative.</p><p>Objective difference ${signed(comparison.objectiveDifference?.estimate)}; bounds ${signed(comparison.objectiveDifference?.lower)} to ${signed(comparison.objectiveDifference?.upper)}. Relative to alternative: ${Number.isFinite(comparison.objectiveDifference?.relativeToAlternative)?signed(comparison.objectiveDifference.relativeToAlternative*100)+'%':'Unavailable'}.</p><p>Net Tubes: ${['premium','advanced','medium','basic'].map(id=>`${signed(comparison.netCost?.tubes?.[id]?.estimate)} ${id}`).join(' · ')}</p><p>Gain uncertainty: empirical standard error, not a certified gain bound.</p></details>`;
}
export function renderImproveOpportunities(analysis,{comparisonOpen=false}={}){
 if(analysis?.status==='CALCULATING')return `<p role="status" data-analysis-status="CALCULATING">Analyzing five Echoes${analysis.progress?.total?': '+number(analysis.progress.completed/analysis.progress.total*100,0)+'%':'…'}</p>`;
 if(!known(analysis))return `<p role="status" data-analysis-status="PENDING">PENDING · ${html(analysis?.reason??(analysis?.status==='EXPERIMENTAL'?'Versioned decision evidence unavailable from this service':'Enter your actual team investments to analyze this build'))}</p>`;
 const d=analysis.decisionEvidence,p=analysis.provenance,r=analysis.ranking,comparison=d.alternatives?.find(a=>a.alternativeSlot===d.runnerUpSlot),recommended=Number.isInteger(d.recommendedSlot)?d.recommendedSlot:null;
 const confidence=d.status==='CONFIDENCE_SUPPORTED_RECOMMENDATION'?`Recommendation supported by stated ${number(d.confidence*100,0)}% bounds`:'Estimated recommendation · ordering not established by confidence bounds';
 return `<div class="improve-current"><strong>Current · Character ${number(analysis.current?.characterDps,0)} DPS · Team ${number(analysis.current?.teamDps,0)} DPS</strong><span data-model-readiness>${html(p.readiness)} · ${html(p.provider?.id??'')} v${html(p.provider?.version??'')}</span></div>
 <div class="improve-recommendation" data-decision-status="${html(d.status)}" data-recommended-slot="${recommended??''}"><div class="improve-recommendation-heading"><strong>${recommended===null?'PENDING · no resolved feasible opportunity':`${slot(recommended)} recommended`}</strong>${recommended===null?'':`<button type="button" class="improve-next" data-improve-slot="${recommended}">Work on ${slot(recommended)} <span class="button-arrow" aria-hidden="true"></span></button>`}</div><span>${html(d.objective?.label??'')} · ${d.objective?.metric==='TEAM_DPS'?'Team DPS':'Character DPS'}</span><small data-recommendation-confidence>${recommended===null?'Unresolved':confidence}</small>
 <details class="improve-comparison"${comparisonOpen?' open':''}><summary>${recommended===null?'Why no recommendation?':`${slot(recommended)} vs ${slot(d.runnerUpSlot)} · why this choice`}</summary><p data-decision-rationale>${html(d.rationale?.summary??'No comparable recommendation is available.')}</p>${recommended===null?'':differences(comparison)}</details></div>
 <p class="improve-rankings">Highest chance: ${slot(r?.easiest?.[0])} · Cheapest Tuners: ${slot(r?.cheapest?.tuners?.[0])} · Best DPS/Tuner: ${slot(r?.bestBenefitPerResource?.tuners?.[0])}</p>
 <div class="improve-table-scroll"><table aria-label="Five equipped Echo opportunities"><thead><tr><th>Equipped Echo</th><th>Strict upgrade chance</th><th>Echo attempts</th><th>Expected net cost</th><th>Expected DPS gain</th><th>DPS per net resource</th><th>Available stock</th></tr></thead><tbody>${(analysis.slots??[]).map(v=>`<tr data-opportunity-slot="${v.slot}" ${v.slot===recommended?'aria-current="true"':''}><th scope="row"><button type="button" data-improve-slot="${v.slot}">${slot(v.slot)}${v.slot===recommended?' · Recommended':''}</button></th><td>${interval(v.probability,true)}<small>${boundKind(v.estimation)}</small></td><td>${interval(v.attempts)}${v.estimation?.precision==='RARE_EVENT_UNRESOLVED'?'<small>Rare event unresolved</small>':''}${v.potentiallyNotWorthwhile?'<small>Potentially not worthwhile</small>':''}</td><td>${number(v.expectedNetCost?.tuners)} Tuners<small>${number(v.expectedNetCost?.exp,0)} EXP · ${number(v.expectedNetCost?.echoes)} Echoes</small><details><summary>Tubes & bounds</summary><p>${tubes(v.expectedNetCost?.tubes)}</p><p>Tuners ${number(v.costBounds?.lower?.tuners)}–${number(v.costBounds?.upper?.tuners)} · EXP ${number(v.costBounds?.lower?.exp,0)}–${number(v.costBounds?.upper?.exp,0)}</p></details></td><td>${number(v.gain?.conditionalOnImprovement)} on success<small>${number(v.gain?.expectedRetained)} per attempt · SE ${number(v.gain?.standardError,3)}</small><details><summary>Gain & contribution</summary><p>Largest observed/model outcome: ${number(v.gain?.maximumObserved)} DPS. Statistical gain error is not a certified bound.</p><p data-contribution-slot="${v.slot}">${contribution(v.currentContribution)}</p></details></td><td>${number(v.benefitPerResource?.tuners,3)} / Tuner<small>${number(v.benefitPerResource?.exp,5)} / EXP · ${number(v.benefitPerResource?.echoes,3)} / Echo</small></td><td>${stock(v.finiteStock)}<details><summary>Stock details</summary><p>Mean net spend: ${resource(v.finiteStock?.modeledMeanNetSpend)}. Tubes: ${tubes(v.finiteStock?.modeledMeanNetSpend?.tubes)}.</p><p>Cost conditional on success within evaluated stock: ${resource(v.finiteStock?.expectedNetCostConditionalOnSuccess)}.</p><p>${html(v.finiteStock?.costScope??v.finiteStock?.status??'Unavailable')}</p></details></td></tr>`).join('')}</tbody></table></div>
 <details class="improve-model-details"><summary>Source, model and comparison scope</summary><p>Provider ${html(p.provider?.id??'')} v${html(p.provider?.version??'')} · source ${html(p.provider?.sourceBinding??'')}. Context ${html(p.context?.id??'')} · ${html(p.context?.validity??'')}.</p><p>Other four equipped Echoes stay fixed against the same actual Current. Costs use the complete-to-25, recover-failures reference and unlimited Tube denominations; available-stock costs are separate. Estimates do not establish a globally optimal adaptive strategy or live-game qualification.</p><p>Cheapest EXP: ${slot(r?.cheapest?.exp?.[0])} · Best DPS/EXP: ${slot(r?.bestBenefitPerResource?.exp?.[0])} · Best DPS/Echo: ${slot(r?.bestBenefitPerResource?.echoes?.[0])}</p>${(d.exclusions??[]).map(e=>`<p>${slot(e.slot)} excluded from this recommendation: ${html(e.reason)}</p>`).join('')}</details>`;
}
const qualifiedQuality=q=>q?.status==='AVAILABLE'&&q.kind==='FIVE_CONTEXT_QUALIFIED_TYPES'&&Number.isFinite(q.probability)&&q.probability>=0&&q.probability<=1&&Array.isArray(q.statNames)&&q.statNames.length===5&&q.statNames.every(s=>typeof s==='string')&&new Set(q.statNames).size===5;
const neutralStates=new Set(['SIMILAR_TUNER_COST','UNCERTAIN']);
const actionLabels={CONTINUE:'Continue',RESTART_DATA_RECOVERY:'Start new Echo',RESTART_FEED:'Start new Echo'};
const benefitLabels={LESS_NEW_ECHOES:'Less Echoes needed',HIGHER_CHANCE_THIS_ATTEMPT:'Higher chance this attempt',HIGHER_FIVE_STAT_CHANCE:'Chance for 5/5 stats'};
export function localAdviceSummary(advice){
 if(advice?.kind!=='CURRENT_BOUND_ECHO_ADVICE'||!advice.buildComparison)return '';
 const comparison=advice.buildComparison,gain=comparison?.delta?.teamTotal;
 const goal=advice.goalStatus==='MET'?'Manual targets met':advice.goalStatus==='NOT_MET'?'Manual targets not met':'Manual Echo targets';
 if(comparison?.status==='EXPERIMENTAL'&&Number.isFinite(gain))return `<span class="advice-build-gain">${signed(gain,0)} team DPS · experimental</span><small>${goal}</small><details><summary>Build comparison</summary><p>Current ${number(comparison.current?.teamTotal,0)} → candidate ${number(comparison.candidate?.teamTotal,0)} model DPS. Other four Echoes, team and rotation are fixed.</p><p>Replacement cost and future-roll policy Pending.</p></details>`;
 const raw=advice.targetGuidance??{};
 const continued=raw.continue?.tuners?.approximate,restarted=raw.discard?.tuners?.approximate;
 const calculatorReason=raw.status==='PENDING'?'<p>Target calculator: '+html(expectedTunerReason(raw.reason))+' ('+html(raw.reason??'UNAVAILABLE')+')</p>':'';
 return `<small>${goal}</small><details><summary>Decision scope</summary>${calculatorReason}${Number.isFinite(continued)&&Number.isFinite(restarted)?`<p>Until manual targets · Continue ${number(continued,0)} / Restart ${number(restarted,0)} gross Tuners.</p>`:''}<p>${comparison?.reason==='COMPLETE_CANDIDATE_REQUIRED'?'Record the remaining rolls for a full-build DPS comparison.':'Actual supported team and complete investment data are needed for DPS comparison.'}</p><p>Manual-target advice excludes DPS value and resource recovery.</p></details>`;
}
export function checkpointVerdict(advice){
 if(!advice)return 'Record the result from your game';
 if(advice.buildComparison?.current?.rotationAcceptance?.status==='NOT_MET'||advice.buildComparison?.candidate?.rotationAcceptance?.status==='NOT_MET')return 'ER not met · DPS comparison unavailable';
 if(advice.winner==='KEEP_TEMPORARY')return 'Keep for comparison · model upgrade';
 if(advice.status==='RESOURCE_BLOCKED')return 'Not enough resources';
 if(advice.comparison?.version===1){
  if(advice.comparison.status==='SIMILAR_TUNER_COST')return 'Similar Tuner cost · your choice';
  if(advice.comparison.status==='UNCERTAIN')return 'No clear recommendation';
  if(advice.comparison.status==='UNAVAILABLE')return 'Comparison unavailable';
 }
 if(advice.uncertain)return 'No clear recommendation';
 return advice.decision==='CONTINUE'?'Continue':advice.decision==='RESTART'?'Start new Echo':advice.decision??advice.reason??'Comparison unavailable';
}
export function renderCheckpointOptions(advice){
 if(!advice)return '';
 // Older services retain all supplied alternatives; never calculate a ranking.
 if(!advice.comparison&&(!advice.continue&&!advice.discard)){
  const labels={CONTINUE:'CONTINUE',RESTART_DATA_RECOVERY:'RESTART · Data Recovery',RESTART_FEED:'RESTART · Direct feed'};
  return (advice.choices??[]).map(c=>`<div><strong>${labels[c.action]??'Alternative'}</strong><div>${resource(c.expectedFutureNetCost)} until improvement</div>${c.status==='RESOURCE_BLOCKED'?'<small>Stock cannot complete this alternative</small>':''}</div>`).join('');
 }
 const comparison=advice.comparison?.version===1?advice.comparison:null;
 const neutral=advice.uncertain||neutralStates.has(comparison?.status);
 const choices=[advice.discard,advice.continue].filter(Boolean);
 const headline='<p class="checkpoint-scope">Expected future net Tuners until improvement</p>';
 const cards=choices.map(c=>{
  const supplied=comparison?.options?.find(o=>o.action===c.action),advantage=neutral?(supplied?.advantages??[]).find(code=>benefitLabels[code]&&(code!=='HIGHER_FIVE_STAT_CHANCE'||qualifiedQuality(supplied.fiveStatQuality))):null;
  const disabled=advice.status==='RESOURCE_BLOCKED'||c.status!=='EXPERIMENTAL';
  const recommended=!neutral&&!disabled&&comparison?.recommendedAction===c.action;
  return `<article class="checkpoint-choice${recommended?' is-recommended':''}${disabled?' is-blocked':''}"><button type="button" data-checkpoint-action="${html(c.action)}" ${disabled?'disabled':''}><strong>${actionLabels[c.action]??'Alternative'}</strong><span class="checkpoint-cost">${Number.isFinite(c.expectedFutureNetCost?.tuners)?`≈${number(c.expectedFutureNetCost.tuners,0)} Tuners`:'Unavailable'}</span><small>${disabled?'Cannot complete with this stock':advantage?benefitLabels[advantage]:'&nbsp;'}</small></button></article>`;
 }).join('');
 const details=`<details class="checkpoint-details"><summary>Details</summary>${choices.map(c=>{
  const suppliedQuality=comparison?.options?.find(o=>o.action===c.action)?.fiveStatQuality;
  const q=qualifiedQuality(suppliedQuality)?suppliedQuality:null;
  return `<section><strong>${actionLabels[c.action]??'Alternative'}</strong><p>${interval(c.chance,true)} chance this attempt · ${resource(c.expectedFutureNetCost)}</p><p>Tuner bounds ${number(c.costBounds?.lower?.tuners)}–${number(c.costBounds?.upper?.tuners)}. ${stock(c.finiteStock)}</p>${q?`<p>5/5 priority stats: ${number(q.probability*100,3)}% · ${q.statNames.map(html).join(', ')}. Stat types only; not a guaranteed DPS upgrade.</p>`:''}</section>`;
 }).join('')}${(advice.choices??[]).length>choices.length?`<p>Recovery alternatives: ${(advice.choices??[]).filter(c=>c.action!=='CONTINUE').map(c=>`${c.action==='RESTART_FEED'?'Direct feed':'Data Recovery'}: ${resource(c.expectedFutureNetCost)}`).join(' · ')}</p>`:''}</details>`;
 return headline+cards+details;
}
