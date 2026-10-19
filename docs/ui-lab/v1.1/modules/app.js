import {mountWorkspaceHeader} from './workspace-navigation.js';
import {createImproveCandidateSession,improveCandidateContext,clearImproveCandidates,syncImproveCandidateContext} from './improve-candidate.js';
import {restoreOwnedSettings,readOwnedResourceBudget} from './account-settings.js';
import {createLabResourceInventory} from './resource-state.js';
import {accountProjection} from './account-projection.js';
import {openSelectionDialog} from './selection-dialog.js';
import {characterContext,teamSlotAlternatives,selectTeamSlot} from './character-context.js';
import {createBrowserSandboxClient} from './browser-client.js';
import {rotationAcceptanceText} from './rotation-acceptance.js';
import {dpsConceptMarkup} from './dps-concept.js';
import {sandboxStats} from './sandbox-stats.js';
import {CHARACTER_TARGETS} from './targets.js';
import {createSandboxClient} from './sandbox-client.js';
import {sandboxPendingCopy} from './sandbox-pending.js';
import {observedSlots,expectedResourceRecord,sandboxCostDetails} from './sandbox-presentation.js';
import {readProductionBuildRecord} from '../../../../src/productionBuildRecord.mjs';
import {createSandboxWorkspace,setSandboxWeapon,sandboxStandard,SANDBOX_WEAPONS} from './sandbox-state.js';
import {initializeCanonicalSettings} from './canonical-settings.js';
import {configuredCard} from './configured-card.js';
import {createConfigurationSession,configurationSnapshot,configurationLiveContext,resetSimulationResults,configuredSlotTitle,selectConfigurationSlot,settingsConfigurationChanged} from './simulation-configuration.js';
import {createWorkshopEditor} from './workshop-editor.js';
import {activeEchoSlots, activationMarkup, positionActivationMarks, setEchoActive, simulationRequest} from './echo-activation.js';
import { mountResourceCost } from './resource-cost.js';
import { mountResourceInventory } from './resource-inventory.js';
import { mountResultsPanel } from './simulation-stats.js';
import { mountImproveSettings } from './improve-settings.js';
import { mountSonataSelection } from './sonata-selection.js';
import { restoreRecommendedSettings } from './settings-state.js';
import { CHARACTER_CATALOG,WEAPON_CATALOG } from './catalog.js';
import { getDemoState, resetDemoState } from './lab-state.js';
import { applyFeedbackScenario, workshopFeedbackFixture } from './feedback-fixtures.js';
import { mountWorkshopFeedback } from './workshop-feedback.js';
import { sonataSummary } from './sonata-summary.js';
import { echoCard as renderEchoCard } from './echo-card.js';
import { mountCarousel } from './carousel.js';
import { $, assetURL, escapeHtml, notify } from './util.js';

function echoCard(echo,options={}){return renderEchoCard(echo,{...options,footer:compactReview&&accountMode&&!options.candidate?'EQUIPPED':options.footer,compactFooter:compactReview,rankPending:compactReview&&accountMode&&!options.candidate});}

const query = new URLSearchParams(location.search);
const compactReview=query.get('layout')!=='legacy'&&query.get('demonstration')!=='true'&&query.get('review')!=='configuration';
if(compactReview)document.body.classList.add('compact-review');
const sandbox=query.get('sandbox')==='true';
const browserBeta=sandbox&&query.get('execution')==='browser';
const expertMode=sandbox&&!browserBeta&&query.get('review')==='expert';
const sandboxWorkspace=sandbox?createSandboxWorkspace():null;
if(sandbox){
 document.body.classList.add('sandbox-preview');$('.sonata-section').remove();$('.settings-compact img')?.remove();
 $('.page-heading .eyebrow').textContent='CHARACTER SANDBOX';
 $('#demoDescription').textContent='Standalone Sandbox · source-bound standard templates. Detached simulation · no account connection or real resource spending. Requires the local Sandbox host.';
 if(browserBeta){document.body.classList.add('browser-beta');$('#demoDescription').textContent='Sandbox beta · hypothetical builds and resources · no account changes.';$('.study-label').textContent='SANDBOX BETA';$('.page-heading h1').textContent='Sandbox Simulator';document.title='Bellibing Sandbox';}
 $('#focusDemo').disabled=true;
 document.querySelector('[data-filter="account"]')?.setAttribute('hidden','');
}
const resources = mountResourceInventory($('#resourceInventory'),sandbox?undefined:createLabResourceInventory(readOwnedResourceBudget(localStorage)),{sandbox});
const resourceCost=mountResourceCost($('#resourceCost'));
if(sandbox)document.querySelectorAll('[data-cost-role]').forEach(cell=>{cell.title=cell.dataset.costRole==='expected'?'Pending: no matching verified Expected Cost producer':'Awaiting an actual Sandbox run';});
const characterCard = mountResultsPanel($('.character-content'), {onReveal: () => { $('#character').classList.add('expanded'); layout('character'); }});
const improveSettings = mountImproveSettings($('#echoSettings'), {getState: () => state, onEdit: (action, source) => {settingsConfigurationChanged(state);characterCard.edit(action, source);}, onSettle: () => characterCard.settle()});
const sonataSelection = sandbox?null:mountSonataSelection($('.sonata-section'), {getState: () => state,onEdit:()=>settingsConfigurationChanged(state)});
const people = new Map(CHARACTER_CATALOG.map(person => [person.id, person]));
let selectedId = CHARACTER_CATALOG.some(p=>p.id===query.get('character'))?query.get('character'):'augusta';
let uiContextRevision=0;
const demonstration = !sandbox&&query.get('demonstration') === 'true';
const configurationReview=!sandbox&&query.get('review')==='configuration';
const accountMode=!sandbox&&!demonstration&&!configurationReview;
if(demonstration||configurationReview){
 for(const selector of ['.demo-note','.target','.mode-switch'])$(selector).hidden=false;
 // Isolated historical fixtures retain their approved three-tab geometry.
 $('.site-header nav').innerHTML='<button>Build</button><button class="active">Improve</button><button>Teams <small>SOON</small></button>';
}
function characterState(id) {
  if(sandbox)return sandboxWorkspace.select(id);
  const value=getDemoState(id);
  if(configurationReview){if(!value.configurationSession){value.configurationSession=createConfigurationSession(id);initializeCanonicalSettings(value);if(id!=='augusta')value.sonataPool=[];}return value;}
  if(!demonstration&&!value.configurationSession){
    value.configurationSession=createConfigurationSession(id,{initializeDefaults:false});value.configurationSession.mode='current';initializeCanonicalSettings(value);value.echoes=Array(5).fill(null);value.candidates=Array(5).fill(null);value.histories=Array.from({length:5},()=>[]);value.stats=value.stats.map(()=>['—','—']);value.accountCandidates=Array(5).fill(null);value.echoActive=Array(5).fill(true);value.configurationSession.active=Array(5).fill(true);
    // The old two-row Sonata fixture is not a recommendation for other Characters.
    if(id!=='augusta')value.sonataPool=[];
  }
  return value;
}
let state = characterState(selectedId);
function accountView(){const record=readProductionBuildRecord(localStorage,people.get(selectedId));return {schemaVersion:1,kind:'ACCOUNT_BUILD',characterId:selectedId,selectedSlot:state.selectedSlot+1,ownerRecord:record.ownerRecord??null,build:record.buildState??null,buildId:null,modeId:null,revisions:null,capability:{status:'PENDING',reasons:['ACCOUNT_STAT_COMPARISON_ONLY']}};}
const workshopEditor=createWorkshopEditor({getState:()=>state,onCommit:error=>{renderWorkspace();if(error)notify(error.message);},onPreview:()=>{syncAccountState();renderWorking();renderCharacter();},readAccountBinding:()=>improveCandidateContext(readImproveOwner())});
window.bellibingLabConfiguration=Object.freeze({productionEvidence:()=>sandbox?{status:'NOT_APPLICABLE',kind:'SANDBOX_BUILD'}:readProductionBuildRecord(localStorage,people.get(selectedId)),readContext:()=>sandbox?sandboxWorkspace.readContext(resources.read(),resources.revision()):accountMode?accountView():configurationLiveContext(state,resources.read(),{inventoryRevision:resources.revision(),contextRevision:uiContextRevision}),snapshot:async()=>{
 if(accountMode)return accountView();
 const snapshot=await configurationSnapshot(state,resources.read(),{inventoryRevision:resources.revision(),contextRevision:uiContextRevision});
 if(sandbox){snapshot.context={...snapshot.context,kind:'SANDBOX_BUILD',buildId:state.sandboxBuild.id,buildStatus:'DETACHED_SANDBOX',modeId:state.sandboxBuild.presetId,modeStatus:'EXPLICIT_SANDBOX_CONTEXT',build:structuredClone(state.sandboxBuild)};snapshot.capability={status:'PENDING',reasons:['PRIVATE_SANDBOX_EXECUTION_NOT_CONNECTED']};}
 return snapshot;
}});
let sandboxRun=null,runSlots=null,runInspectionSlot=null,runLoop=false,preRunMetrics=null,metricsBinding=null,metricsTimer=null;
let hostStatus='CHECKING',hostProbeBinding=null;
let preflightStatus={status:'CHECKING',reasons:[]};
const sandboxClient=sandbox?(browserBeta?createBrowserSandboxClient:createSandboxClient)({readContext:()=>sandboxWorkspace.readContext(resources.read(),resources.revision()),readEvaluationContext:()=>state.sandboxEvaluationContext??(!expertMode&&['augusta','iuno','the-shorekeeper'].includes(state.id)?{kind:'SYNTHETIC_REFERENCE_TEAM',id:'AUGUSTA_IUNO_SHOREKEEPER_REFERENCE_V1',version:1}:null),onChange:run=>{sandboxRun=run;runSlots=run?observedSlots(run.view):null;if(!runSlots)runInspectionSlot=null;resourceCost.present({comparison:run?.metrics?.costComparison,expected:expectedResourceRecord(run?.metrics),simulated:run?.simulatedCost?{status:'VERIFIED',...run.simulatedCost.gross}:null});if(carousel)renderWorkspace();}}):null;
let candidateRun=null,candidatePreflight={status:'CHECKING',reasons:[]},candidateMetricsBinding=null,candidateMetricsTimer;
function readImproveOwner(){let policyStorage;try{policyStorage=['bellibing.improve.policy.v3','bellibing.improve.simple-settings.v2'].map(key=>localStorage.getItem(key));}catch{policyStorage='ACCOUNT_SETTINGS_UNREADABLE';}return {kind:'ACCOUNT_BUILD',policyStorage,record:readProductionBuildRecord(localStorage,people.get(selectedId)),inventory:resources.read(),inventoryRevision:resources.revision(),state:Object.fromEntries(['id','selectedSlot','statSections','minima','flexCount','settingsMode','gate','erTarget','sonataPool','canonicalSettingsSource','accountSettingsPending','accountPolicyBinding'].map(k=>[k,state[k]]).concat([['configurationSession',{active:[...state.configurationSession.active]}]]))};}
const candidateSession=accountMode?createImproveCandidateSession({readOwner:readImproveOwner,onChange:run=>{
 candidateRun=run;
 if(!run)clearImproveCandidates(state);
 if(run?.status==='PENDING')candidatePreflight={status:'PENDING',reasons:run.reasons};
 if(run?.view){
  const projected=observedSlots(run.view),chosen=run.view.selectedSlots??run.view.slots.map(s=>s.slot);
  for(const n of chosen){const i=n-1,slot=run.view.slots.find(s=>s.slot===n),card=slot?.candidate??slot?.current;
   if(card)state.accountCandidates[i]={echoId:card.speciesId,rank:card.rank,cost:card.cost,selectedSonataSetId:card.selectedSonataSetId,level:card.level,mainStat:structuredClone(card.mainStat),secondaryMainStat:structuredClone(card.secondaryMainStat),substats:structuredClone(card.substats)};
   state.configurationSession.histories[i]=projected[i].trash;
  }
 }
 resourceCost.present({simulated:run?.simulatedCost?{status:'VERIFIED',...run.simulatedCost.gross}:null});
 if(carousel)renderWorkspace();
}}):null;
if(sandbox||accountMode){
 const controls=document.createElement('div');controls.className='sandbox-run-controls';
 controls.innerHTML='<span id="sandboxRunStatus" role="status">Preview only</span><button id="sandboxAbort" type="button" disabled>Abort</button><button id="sandboxExport" type="button" disabled>Export JSON</button><details class="sandbox-diagnostics"><summary>Simulation details</summary><span id="sandboxHostStatus" role="status" data-status="CHECKING"></span><span id="sandboxQuality"></span></details>';
 $('.workshop-footer').removeAttribute('aria-hidden');$('.workshop-footer').append(controls);
 const costs=document.createElement('div');costs.id='sandboxCostDetails';controls.append(costs);
 if(sandbox){const teamPanel=document.createElement('div');teamPanel.id='sandboxTeamPanel';teamPanel.className='side-content';if(compactReview)$('.character-content').after(teamPanel);else $('.simulation-content').after(teamPanel);}

}

if(compactReview&&!sandbox){const panel=document.createElement('div');panel.id='compactAccountTeamPanel';panel.className='side-content';$('.character-content').after(panel);}

function displayedEchoes(){if(runSlots)return runSlots.map((s,i)=>s.current??configuredCard(state.configurationSession.configurations[i]));return state.configurationSession?.mode==='simulate'?state.configurationSession.current.map((card,index)=>card??configuredCard(state.configurationSession.configurations[index])):state.echoes;}
function displayedCandidates(){if(runSlots)return runSlots.map(s=>s.candidate);return state.configurationSession?state.configurationSession.candidates:state.candidates;}
function displayedHistories(){if(runSlots)return runSlots.map(s=>s.trash);return state.configurationSession?state.configurationSession.histories:state.histories;}
var carousel;
let inspection = null;
let inspectorSource = null;
let closingInspection = false;
const feedback = mountWorkshopFeedback({
  highlightSlots: (slots, severity) => slots.forEach(index => {
    const slot = $(`[data-slot="${index}"]`);
    if (slot) { slot.classList.add('feedback-affected'); slot.dataset.feedbackSeverity = severity; }
  }),
  clearHighlights: () => document.querySelectorAll('.feedback-affected').forEach(slot => {
    slot.classList.remove('feedback-affected'); delete slot.dataset.feedbackSeverity;
  }),
});
if(demonstration)applyFeedbackScenario(state, query.get('feedback'));
if (demonstration && query.get('recorded') === 'true') {
  const scenario = state.feedbackScenario;
  applyFeedbackScenario(state, 'result');
  applyFeedbackScenario(state, scenario);
}
function renderFeedback() {
  feedback.render(workshopFeedbackFixture(state));
  const request = simulationRequest(state);
  if (!request.slots.length || state.configurationSession?.mode==='current') $('#simulate').disabled = true;
  $('#simulate').dataset.status = request.status;
  if(sandbox)$('#simulate').disabled=hostStatus!=='CONNECTED'||preflightStatus.status!=='READY'||runLoop||!request.slots.length||state.configurationSession?.mode==='current';
  $('#simulate').title = sandbox?(hostStatus!=='CONNECTED'?(browserBeta?'Pending · browser simulation unavailable':'Preview only · local simulation host not connected'):preflightStatus.status==='PENDING'?'Pending · selected configuration is not yet executable':preflightStatus.status!=='READY'?'Checking selected configuration':(browserBeta?'Simulate hypothetical Echoes':'Run detached simulation through the local host')):request.slots.length ? 'Pending: multi-slot simulation is not connected' : 'Activate an Echo to configure a future simulation';
  if(sandbox){const hostLabels={CHECKING:'Checking local simulation host · Preview only',CONNECTED:'Local simulation host connected',UNAVAILABLE:'Local simulation host unavailable · Preview only',ERROR:'Local simulation host not ready · Preview only'};$('#sandboxHostStatus').dataset.status=hostStatus;$('#sandboxHostStatus').textContent=browserBeta?'Browser engine · hypothetical · no account changes':hostLabels[hostStatus];$('#sandboxCostDetails').innerHTML=sandboxCostDetails(sandboxRun?.metrics??preRunMetrics,sandboxRun?.simulatedCost);$('#sandboxAbort').disabled=!runLoop||!sandboxRun;$('#sandboxExport').disabled=!sandboxRun?.runId;const pending=sandboxRun?.status==='PENDING'?sandboxPendingCopy(sandboxRun.reasons):preflightStatus.status==='PENDING'?sandboxPendingCopy(preflightStatus.reasons):null;$('#sandboxRunStatus').dataset.runId=sandboxRun?.runId??'';$('#sandboxRunStatus').dataset.status=pending?'PENDING':preflightStatus.status;$('#sandboxRunStatus').textContent=pending?`Pending · ${pending.text}`:rotationAcceptanceText(sandboxRun)??(hostStatus!=='CONNECTED'?'Preview only · simulation unavailable':preflightStatus.status==='CHECKING'?'Preparing simulation':'Ready to simulate');$('#sandboxRunStatus').title=pending?.codes.length?`${browserBeta?'Simulation':'Server'} reason: ${pending.codes.join(', ')}`:'';const q=sandboxRun?.metrics?.dpr?.slots?.find(s=>s.slot===(runInspectionSlot??state.selectedSlot)+1)?.current;$('#sandboxQuality').textContent=expertMode&&q?.scores?`DPR · EXPERIMENTAL substat proxy: ${Object.entries(q.scores).map(([model,score])=>`${model} ${Number(score.approximate).toFixed(6)}`).join(' · ')} · Character upgrade Pending`:'';}
  if(accountMode){
   $('#simulate').disabled=!state.onAccount||candidatePreflight.status!=='READY'||runLoop;
   $('#simulate').title=candidatePreflight.reasons.join(', ');
   $('#sandboxRunStatus').textContent=runLoop?'RUNNING':candidateRun?.status==='ABORTED'?'ABORTED':candidatePreflight.status==='READY'?'Compare a Candidate':'Simulation Pending';
   $('#sandboxRunStatus').dataset.runId=candidateRun?.runId??'';$('#sandboxRunStatus').dataset.runState=candidateRun?.status??'';
   $('#sandboxAbort').disabled=!runLoop||!candidateRun;$('#sandboxExport').disabled=!candidateRun?.runId;
   $('#sandboxHostStatus').textContent='Browser engine · hypothetical · no account changes';$('#sandboxHostStatus').dataset.status=candidatePreflight.status;
   $('#sandboxCostDetails').innerHTML=sandboxCostDetails(null,candidateRun?.simulatedCost);
   document.body.classList.toggle('has-candidate-run',!!candidateRun?.view);
  }
  if(!demonstration&&!configurationReview){$('#feedbackTitle').textContent=sandbox?(runLoop?'Simulating…':preflightStatus.status==='READY'?'Ready to Simulate':preflightStatus.status==='PENDING'?'Simulation Pending':'Preparing simulation'):runLoop?'Simulating…':state.onAccount?(candidatePreflight.status==='PENDING'?'Simulation Pending':'Compare a Candidate'):'Choose an owned Character';if(!sandbox)$('#simulate').disabled=!state.onAccount||candidatePreflight.status!=='READY'||runLoop;}
  $('#reviewScenario').value = state.feedbackScenario;
  $('#reviewScenario').disabled = !demonstration || selectedId !== 'augusta';
  $('#reviewScenario').title = selectedId === 'augusta' ? 'Isolated Augusta review fixtures' : 'Warning/error review fixtures are supplied for Augusta only';
}

function renderWorking() {
  const slot = runInspectionSlot??state.selectedSlot;
  const shown=displayedEchoes()[slot];
  $('#currentCard').previousElementSibling.firstElementChild.textContent=shown?.configured?'CONFIGURED ECHO':runSlots?.[slot]?.current&&!runSlots[slot].complete?'TEMPORARY ECHO':'CURRENT ECHO';
  $('#currentCard').innerHTML = echoCard(shown, { footer:runSlots?.[slot]?.current&&!runSlots[slot].complete?'TEMPORARY':'ACTIVE' });
  $('#newCard').innerHTML = echoCard(displayedCandidates()[slot], { candidate: true, footer: 'UNFINISHED' });
  $('#slotLabel').textContent = String(slot + 1).padStart(2, '0');
  renderFeedback();
}

function renderSlots() {
  $('#slots').innerHTML = displayedEchoes().map((echo, index) => {
    const session=state.configurationSession, editable=!!session&&session.mode==='simulate';
    const active = session ? session.active[index] : state.echoActive[index];
    const available=true;
    return `<div class="activation-slot${active ? '' : ' is-inactive'}"><button class="slot ${index === (runInspectionSlot??state.selectedSlot) ? 'selected-slot' : ''}" data-slot="${index}" aria-pressed="${index === (runInspectionSlot??state.selectedSlot)}" aria-label="Select Echo slot ${index + 1}${echo ? `, ${escapeHtml(echo.name)}` : ', empty'}"><span class="slot-number" aria-hidden="true"></span>${echoCard(echo,{footer:session?.mode==='current'?'CURRENT':'SIMULATED'})}</button>${demonstration?'':'<div class="slot-controls">'}${activationMarkup(index,active,available,demonstration)}${session ? `<button type="button" class="echo-edit" data-edit-echo="${index}" aria-label="Edit Echo slot ${index+1}" title="${escapeHtml(configuredSlotTitle(state,index))}"${(editable||(accountMode&&state.onAccount))?'':' disabled'}>Edit</button>` : ''}${demonstration?'':'</div>'}</div>`;
  }).join('');
  positionActivationMarks($('#slots'));
  const session=state.configurationSession;
  if(state.accountProjection){const cards=state.accountProjection.slots??[];$('.loadout-heading .small-muted').textContent=`${cards.filter(Boolean).length} equipped · ${cards.reduce((n,c)=>n+(c?.cost??0),0)} / 12 Cost`;}else if(session?.mode==='simulate'){
    const chosen=session.configurations.filter((template,index)=>template&&session.active[index]);
    $('.loadout-heading .small-muted').textContent=`${chosen.length} configured · ${chosen.reduce((sum,template)=>sum+template.cost,0)} / 12 Cost`;
  }else $('.loadout-heading .small-muted').innerHTML = sonataSummary(activeEchoSlots(state));
}

function renderPiles() {
  $('#piles').innerHTML = displayedHistories().map((history, slot) => history.length
    ? `<div class="pile" data-pile="${slot}" aria-label="Echo ${slot + 1} Trash Pile, ${history.length} historical cards">
        <span class="pile-count"><span>ECHO 0${slot + 1}</span><b>× ${history.length}</b></span>
        <div class="pile-stack" style="--pile-extra:${(Math.min(history.length,5) - 1) * 16}px">
          ${history.slice(-5).map((echo, visibleIndex) => {
            const index=Math.max(0,history.length-5)+visibleIndex;
            const depth = Math.min(history.length,5) - visibleIndex - 1;
            const checkpoint = Number.isInteger(echo.level) ? `+${echo.level}` : 'checkpoint unknown';
            return `<button type="button" class="pile-card" data-history-index="${index}"
              style="--pile-offset:${depth * 16}px;--pile-lift:-${depth * 16 + 10}px;--pile-z:${index + 1}"
              aria-label="Inspect Echo ${slot + 1}, discarded card ${index + 1} of ${history.length}, ${escapeHtml(echo.name)}, discarded at ${checkpoint}">${echoCard(echo)}</button>`;
          }).join('')}
        </div>
      </div>`
    : `<div class="pile empty-pile" aria-label="Echo ${slot + 1} Trash Pile, empty"><span class="pile-count"><span>ECHO 0${slot + 1}</span><b>EMPTY</b></span>${echoCard(null)}</div>`).join('');
  $('#historyCount').textContent = `${displayedHistories().reduce((sum, history) => sum + history.length, 0)} cards`;
}

function renderCharacter() {
  const person = people.get(selectedId);
  if(sandbox)state.sandboxStatProjection=sandboxStats(state,sandboxRun);
  characterCard.render(person, state);
  if(compactReview)$('#character .side-title').textContent=person.name;
  if(compactReview&&!sandbox){const panel=$('#compactAccountTeamPanel');panel.innerHTML=dpsConceptMarkup({characterId:person.id});panel.querySelectorAll('button').forEach(button=>{button.disabled=true;button.querySelector('small')?.remove();});}
  if(sandbox){
    const panel=$('#sandboxTeamPanel');
    const open=[...panel.querySelectorAll('details[open]')].map(n=>n.className);
    panel.innerHTML=dpsConceptMarkup({characterId:person.id,contextId:state.sandboxTeamContextId??null,expertMode,evaluationContext:state.sandboxEvaluationContext??null,dps:sandboxRun?.metrics?.dps??preRunMetrics?.dps??null,view:sandboxRun?.view??null,comparisonSlot:state.sandboxComparisonSlot??null,memberOrder:state.sandboxTeamMemberOrder??null});
    panel.querySelectorAll('details').forEach(n=>{n.open=open.includes(n.className);});
    panel.querySelectorAll('[data-team-slot]').forEach(button=>{button.onclick=()=>{
     const slot=Number(button.dataset.teamSlot),context=characterContext(state.id,state.sandboxTeamContextId,state.sandboxTeamMemberOrder),options=teamSlotAlternatives(context,slot);
     const captured=state;
     openSelectionDialog({title:`Choose teammate`,trigger:button,selectedId:context.team?.id,choices:options.map(option=>{const p=people.get(option.characterId);return {id:option.contextId,name:p.name,art:p.face,note:Object.values(option.modeRequirements).join(' · ')};}),onChoose:id=>{if(state!==captured||id===context.team?.id)return;selectTeamSlot(state,slot,id);sandboxWorkspace.advanceContext();sandboxClient.invalidate();renderWorkspace();}});
    };});
    const comparisonSelector=panel.querySelector('.observed-echo-slot');
    if(comparisonSelector)comparisonSelector.onchange=()=>{state.sandboxComparisonSlot=Number(comparisonSelector.value);renderCharacter();};
    const dpsSelector=panel.querySelector('.sandbox-dps-context');
    if(dpsSelector)dpsSelector.onchange=()=>{state.sandboxEvaluationContext=dpsSelector.checked?{kind:'SYNTHETIC_REFERENCE_TEAM',id:'AUGUSTA_IUNO_SHOREKEEPER_REFERENCE_V1',version:1}:null;sandboxClient.invalidate();renderWorkspace();};

    const weaponButton=document.createElement('button');weaponButton.className=$('.character-content .weapon').className+' weapon-picker-trigger';weaponButton.type='button';weaponButton.setAttribute('aria-label','Choose Sandbox Weapon');weaponButton.setAttribute('aria-haspopup','dialog');weaponButton.innerHTML=$('.character-content .weapon').innerHTML;
    $('.character-content .weapon').replaceWith(weaponButton);
    weaponButton.onclick=()=>{const captured=state;
     const current=state.sandboxBuild.weaponId,defaultId=sandboxStandard(state.id)?.weapon?.weaponId;
     const choices=SANDBOX_WEAPONS.filter(w=>w.weaponType===person.weaponType).sort((a,b)=>((a.id===current?0:a.id===defaultId?1:2)-(b.id===current?0:b.id===defaultId?1:2))).map(w=>({id:w.id,name:w.name,art:WEAPON_CATALOG.find(c=>c.id===w.id)?.art,note:w.id===current?'Selected':w.id===defaultId?'Standard':''}));
     openSelectionDialog({title:'Choose Weapon',choices,selectedId:current,trigger:weaponButton,onChoose:id=>{if(state!==captured)return;workshopEditor.close();setSandboxWeapon(state,id);renderWorkspace();}});
    };
  }
  $('.character-compact img').src = assetURL(person.face);
  $('.character-compact img').alt = person.name;
  $('.character-compact .vertical-label').textContent = person.name.toUpperCase();
}

function renderSettings() {
  $('#gateLabel').value = state.gate;
  $('.compact-gate').textContent = state.gate;
  document.querySelectorAll('.gate-options button').forEach(button => { button.classList.toggle('selected', button.textContent === state.gate); button.setAttribute('aria-pressed', button.textContent === state.gate); });
  improveSettings.render();
  sonataSelection?.render();
  const buttons = [...document.querySelectorAll('.setting-mode button')];
  buttons.forEach(button => { button.classList.toggle('selected', button.textContent === state.settingsMode); button.setAttribute('aria-pressed', button.textContent === state.settingsMode); });
  buttons[0].disabled = !sandbox&&!accountMode&&selectedId !== 'augusta';
  buttons[0].title = sandbox ? 'Restore source priorities or approved Echo settings; missing thresholds remain Pending' : selectedId === 'augusta' ? 'Restore the approved Augusta demonstration defaults' : 'No recommended settings supplied for this demonstration Character';
  const target = $('.target');
  const reference=CHARACTER_TARGETS.find(r=>r.characterId===selectedId&&(sandbox||selectedId==='augusta'));
  target.querySelector('p').textContent = reference?.status==='READY'?`${people.get(selectedId).name} · DEFAULT Calc reference`:sandbox?'Character Target Pending':'Character Target Pending in this visual study';
  target.querySelectorAll('div').forEach((row,index)=>{row.querySelector('strong').textContent=reference?.rows.find(r=>r.metric===['TOTAL_ATK','TOTAL_CRIT_RATE','TOTAL_CRIT_DAMAGE'][index]&&r.status==='READY')?.displayValue??'—';});
}

// A valid metrics response proves reachability, not executable capability for every Character.
async function probeSandboxHost(binding){
 if(binding!==metricsBinding||hostProbeBinding===binding)return;
 hostProbeBinding=binding;
 try{
  const result=await sandboxClient.metrics();
  if(binding!==metricsBinding)return;
  if(result.status!=='READY'&&result.status!=='PENDING')throw Error('INVALID_SANDBOX_METRICS_STATUS');hostStatus='CONNECTED';preflightStatus={status:result.status,reasons:result.reasons??[]};preRunMetrics=result.status==='READY'?result.metrics:null;
  renderCharacter();
  $('#sandboxCostDetails').innerHTML=sandboxCostDetails(preRunMetrics,sandboxRun?.simulatedCost);
  resourceCost.present({comparison:sandboxRun?.metrics?.costComparison??preRunMetrics?.costComparison,expected:expectedResourceRecord(preRunMetrics),simulated:sandboxRun?.simulatedCost?{status:'VERIFIED',...sandboxRun.simulatedCost.gross}:null});
 }catch(error){
  if(binding!==metricsBinding||error.message==='STALE_SANDBOX_RESPONSE')return;
  hostStatus=error.message==='LOCAL_SANDBOX_SERVICE_UNAVAILABLE'||error instanceof TypeError?'UNAVAILABLE':'ERROR';
  preRunMetrics=null;preflightStatus={status:'CHECKING',reasons:[]}; // Never invent Expected values when the service is absent.
 }finally{
  if(hostProbeBinding===binding)hostProbeBinding=null;
  if(binding===metricsBinding)renderFeedback();
 }
}

function syncAccountState(){
 restoreOwnedSettings(state,localStorage);
 if(!state.accountSourcesInitialized){if(!state.accountHasSavedSettings)initializeCanonicalSettings(state);state.accountSourcesInitialized=true;}
 // Retire presentation before projecting, including manually observed Candidates.
 if(syncImproveCandidateContext(state,readImproveOwner())){
  workshopEditor.close();
  if(inspection)closeInspection({immediate:true});
 }
 const person=people.get(selectedId),projection=accountProjection(person,localStorage,{candidate:state.accountCandidates[state.selectedSlot],slot:state.selectedSlot});
 state.accountProjection=projection;
 state.weapon=projection.weapon?.name??'Weapon Pending';state.sequenceLevel=projection.build?.sequenceLevel??null;state.forte=projection.build?.forte??null;
 const present=card=>{if(!card)return null;try{return observedSlots({slots:[{slot:1,current:{...card,speciesId:card.echoId}}]})[0].current;}catch{return null;}};
 state.echoes=(projection.slots??Array(5).fill(null)).map(present);state.configurationSession.candidates=state.accountCandidates.map(present);state.onAccount=projection.record.status==='OBSERVED_PRODUCTION_BUILD_RECORD';
}
function renderWorkspace() {
  if(accountMode)syncAccountState();
  sandboxClient?.checkFresh();
  candidateSession?.checkFresh();
  if(accountMode){const b=improveCandidateContext(readImproveOwner());if(b!==candidateMetricsBinding){candidateMetricsBinding=b;candidatePreflight={status:'CHECKING',reasons:[]};clearTimeout(candidateMetricsTimer);candidateMetricsTimer=setTimeout(async()=>{const result=await candidateSession.metrics();if(b===improveCandidateContext(readImproveOwner())){candidatePreflight=result;renderFeedback();}},200);}}
  if(sandbox){const binding=JSON.stringify({context:sandboxWorkspace.readContext(resources.read(),resources.revision()),evaluationContext:state.sandboxEvaluationContext??null});if(binding!==metricsBinding){metricsBinding=binding;preRunMetrics=null;preflightStatus={status:'CHECKING',reasons:[]};resourceCost.present();if(hostStatus!=='CONNECTED')hostStatus='CHECKING';clearTimeout(metricsTimer);metricsTimer=setTimeout(()=>probeSandboxHost(binding),350);}}
  if(state.configurationSession)document.querySelectorAll('.mode-switch button').forEach(button=>{const selected=(button.textContent==='Current')===(state.configurationSession.mode==='current');button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',selected);});
  renderWorking();
  renderSlots();
  renderPiles();
  renderCharacter();
  renderSettings();
  carousel?.refresh();
}

function layout(last = 'character') {
  const shell = $('#composition');
  const settings = $('#settings');
  const character = $('#character');
  const available = shell.clientWidth;
  let expandedSettings = settings.classList.contains('expanded');
  let expandedCharacter = character.classList.contains('expanded');
  const characterWidth = available < 1550 ? 290 : Math.min(480, Math.floor(available * .24));
  const gaps = 2 * parseFloat(getComputedStyle(shell).columnGap);
  const workshopStyle = getComputedStyle($('.workshop'));
  const workshopMinimum = 1000 + parseFloat(workshopStyle.borderLeftWidth) + parseFloat(workshopStyle.borderRightWidth);
  const settingsWidth = Math.min(350, available - workshopMinimum - gaps - 58);
  if (settingsWidth < 300) expandedSettings = false;
  const required = workshopMinimum + gaps + (expandedSettings ? settingsWidth : 58) + (expandedCharacter ? characterWidth : 58);
  if (available < required) {
    if (last === 'settings') expandedCharacter = false;
    else expandedSettings = false;
  }
  settings.classList.toggle('expanded', expandedSettings);
  character.classList.toggle('expanded', expandedCharacter);
  shell.style.gridTemplateColumns = `${expandedSettings ? settingsWidth : 58}px minmax(${workshopMinimum}px,1fr) ${expandedCharacter ? characterWidth : 58}px`;
  $('#settingsToggle').setAttribute('aria-expanded', expandedSettings);
  $('#characterToggle').setAttribute('aria-expanded', expandedCharacter);
  $('#settingsToggle').title = `${expandedSettings ? 'Collapse' : 'Expand'} Improve Settings`;
  $('#characterToggle').title = `${expandedCharacter ? 'Collapse' : 'Expand'} Character Card`;
}

function liftTransform(source, target) {
  return `translate(${source.left - target.left}px,${source.top - target.top}px) scale(${source.width / target.width},${source.height / target.height})`;
}

function renderInspection() {
  const history = displayedHistories()[inspection.slot];
  const echo = history[inspection.index];
  $('#inspectedCard').innerHTML = echoCard(echo);
  $('#inspectionSlot').textContent = String(inspection.slot + 1).padStart(2, '0');
  $('#checkpoints').innerHTML = echo.stats.map(([name, value], index) => `<div class="checkpoint"><span>+${(index + 1) * 5}</span><div>${escapeHtml(name)}</div><strong>${escapeHtml(value)}</strong></div>`).join('');
  $('#historyPosition').textContent = `${inspection.index + 1} / ${history.length}`;
  $('#discardedEcho').innerHTML=history.map((card,index)=>`<option value="${index}"${index===inspection.index?' selected':''}>${index+1} / ${history.length} · ${escapeHtml(card.name)} · ${Number.isInteger(card.level)?'+'+card.level:'checkpoint unknown'}</option>`).join('');
  $('#previousCard').disabled = inspection.index === 0;
  $('#nextCard').disabled = inspection.index === history.length - 1;
  $('.checkpoint-history p').textContent = `${runSlots?'Observed simulation history · ':''}Discarded at +${echo.level} · ${echo.reason??'rejection reason unavailable'}`;
}

function inspectPile(slot, index, source) {
  if (!displayedHistories()[slot]?.[index] || !source) return;
  carousel.close();
  inspection = { slot, index };
  inspectorSource = source;
  const origin = source.querySelector('.echo-card').getBoundingClientRect();
  renderInspection();
  $('#inspection').showModal();
  const card = $('#inspectedCard');
  const destination = card.getBoundingClientRect();
  inspectorSource.classList.add('is-lifted');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) card.animate([{ transform: liftTransform(origin, destination), opacity: .7 }, { transform: 'none', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.16,.84,.24,1)' });
}

async function closeInspection({ immediate = false } = {}) {
  if (!inspection || closingInspection) return;
  closingInspection = true;
  const source = inspectorSource;
  try {
    if (!immediate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const card = $('#inspectedCard');
      const target = source.querySelector('.echo-card').getBoundingClientRect();
      await card.animate([{ transform: 'none', opacity: 1 }, { transform: liftTransform(target, card.getBoundingClientRect()), opacity: .6 }], { duration: 360, easing: 'cubic-bezier(.4,0,.7,1)' }).finished;
    }
  } finally {
    $('#inspection').close();
    source.classList.remove('is-lifted');
    source.focus({ preventScroll: true });
    inspection = null;
    inspectorSource = null;
    closingInspection = false;
  }
}

window.addEventListener('pagehide',()=>{runLoop=false;sandboxClient?.invalidate();candidateSession?.invalidate();workshopEditor.close();});
window.addEventListener('pageshow',()=>{if(accountMode)renderWorkspace();});
window.addEventListener('storage',event=>{if(accountMode&&['bellibing-ui-checkpoint-v34','bellibing.improve.policy.v3','bellibing.improve.simple-settings.v2'].includes(event.key)){workshopEditor.close();renderWorkspace();}});
window.addEventListener('resize', () => positionActivationMarks($('#slots')));
$('#slots').addEventListener('click', event => {
  const edit=event.target.closest('[data-edit-echo]');
  if(edit){const slot=Number(edit.dataset.editEcho);selectConfigurationSlot(state,slot);renderWorking();renderSlots();if(accountMode)workshopEditor.openObserved(slot,$(`[data-edit-echo="${slot}"]`));else workshopEditor.open(slot,$(`[data-edit-echo="${slot}"]`));return;}
  const toggle = event.target.closest('[data-activation]');
  if (toggle) {
    const index = Number(toggle.dataset.activation);
    setEchoActive(state,index,state.configurationSession ? !state.configurationSession.active[index] : !state.echoActive[index]);
    renderWorkspace();
    $(`[data-activation="${index}"]`).focus({preventScroll:true});
    return;
  }
  const button = event.target.closest('[data-slot]');
  if (!button) return;
  if(runSlots){runInspectionSlot=Number(button.dataset.slot);renderWorking();renderSlots();$(`[data-slot="${runInspectionSlot}"]`).focus({preventScroll:true});return;}
  selectConfigurationSlot(state,Number(button.dataset.slot));
  if(accountMode){renderWorkspace();}else{renderWorking();renderSlots();}
  $(`[data-slot="${state.selectedSlot}"]`).focus({ preventScroll: true });
});
$('#piles').addEventListener('click', event => {
  const button = event.target.closest('button.pile-card');
  if (button) inspectPile(Number(button.closest('[data-pile]').dataset.pile), Number(button.dataset.historyIndex), button);
});
$('#closeInspection').onclick = () => closeInspection();
$('#inspection').addEventListener('cancel', event => { event.preventDefault(); closeInspection(); });
$('#inspection').addEventListener('click', event => { if (event.target === $('#inspection')) closeInspection(); });
$('#discardedEcho').onchange=event=>{const index=Number(event.target.value);if(inspection&&Number.isInteger(index)&&displayedHistories()[inspection.slot]?.[index]){inspection.index=index;renderInspection();}};
$('#previousCard').onclick = () => { if (inspection.index > 0) { inspection.index--; renderInspection(); } };
$('#nextCard').onclick = () => { if (inspection.index < displayedHistories()[inspection.slot].length - 1) { inspection.index++; renderInspection(); } };

$('#settingsToggle').onclick = () => { $('#settings').classList.toggle('expanded'); layout('settings'); };
$('#characterToggle').onclick = () => { $('#character').classList.toggle('expanded'); layout('character'); };
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => layout(document.activeElement?.closest('#settings') ? 'settings' : 'character'), 120);
});
$('.gate-options').addEventListener('click', event => {
  if (event.target.tagName !== 'BUTTON') return;
  state.gate = event.target.textContent;
  renderSettings();
  settingsConfigurationChanged(state);characterCard.edit({kind:'gate'},null);
});
$('.setting-mode').addEventListener('click', event => {
  if (event.target.tagName !== 'BUTTON') return;
  if(event.target.textContent==='Recommended'){
    const restored=restoreRecommendedSettings(state);
    renderSettings();
    // Explicit Recommended restores source guidance. Unavailable guidance
    // cannot imply a reviewed executable policy or erase Custom state.
    if(!restored)return;
    if(accountMode)state.accountSettingsPending=null;
  }else{state.settingsMode='Customize';renderSettings();}
  settingsConfigurationChanged(state);characterCard.edit({kind:'settings-mode'},null);
});
$('#simulate').onclick = async () => {
  if ($('#simulate').disabled) return;
  if(accountMode){workshopEditor.close();candidateSession.invalidate();runLoop=true;renderFeedback();try{await candidateSession.start();while(runLoop&&candidateSession.checkFresh()&&candidateSession.snapshot()?.status==='RUNNING'){await candidateSession.step();await new Promise(r=>setTimeout(r,0));}}catch(error){if(!['STALE_ACCOUNT_CANDIDATE','STALE_SANDBOX_RESPONSE'].includes(error.message))candidatePreflight={status:'PENDING',reasons:[error.message]};}finally{runLoop=false;renderFeedback();}return;}
  if(!sandbox){const request=simulationRequest(state);notify(`Pending · multi-slot simulation is not connected (${request.slots.length} active slots)`);return;}
  runLoop=true;renderFeedback();
  try{await sandboxClient.start();while(runLoop&&sandboxClient.checkFresh()&&sandboxClient.snapshot()?.status==='RUNNING'){await sandboxClient.step();await new Promise(resolve=>setTimeout(resolve,browserBeta?0:30));}}catch(error){if(error.message==='LOCAL_SANDBOX_SERVICE_UNAVAILABLE'||error instanceof TypeError)hostStatus='UNAVAILABLE';if(error.name!=='AbortError'&&error.message!=='STALE_SANDBOX_RESPONSE')notify(error.message);}
  finally{runLoop=false;renderFeedback();}
};
$('#reviewScenario').onchange = event => {
  if(!demonstration)return;
  applyFeedbackScenario(state, event.target.value);
  renderWorkspace();
};
$('.mode-switch').addEventListener('click', event => {
  if(event.target.tagName!=='BUTTON')return;
  if(!state.configurationSession){notify('UI Lab uses isolated Simulate fixtures · no real account is connected');return;}
  workshopEditor.close();const mode=event.target.textContent==='Current'?'current':'simulate';
  if(state.configurationSession.mode!==mode)uiContextRevision++;
  if(sandbox&&state.configurationSession.mode!==mode)sandboxWorkspace.advanceContext();
  state.configurationSession.mode=mode;state.configurationSession.revision++;state.configurationSession.selectionRevision++;renderWorkspace();
});
document.querySelectorAll('.site-header nav button').forEach(button => { button.onclick = () => notify('Bellibing UI Lab · Improve review environment'); });
if(accountMode){$('#sandboxAbort').onclick=async()=>{runLoop=false;try{while(candidateSession.isBusy())await new Promise(r=>setTimeout(r,10));await candidateSession.abort();}catch(error){notify(error.message);}renderFeedback();};$('#sandboxExport').onclick=async()=>{try{const data=await candidateSession.export();data.staticComparison=structuredClone(state.accountProjection?.comparison??{status:'PENDING'});const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='Bellibing_Candidate_'+candidateRun.runId+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){notify(error.message);}};}
if(sandbox){$('#sandboxAbort').onclick=async()=>{runLoop=false;try{while(sandboxClient.isBusy())await new Promise(r=>setTimeout(r,10));await sandboxClient.abort();}catch(error){notify(error.message);}renderFeedback();};$('#sandboxExport').onclick=async()=>{try{const data=await sandboxClient.export(),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`Bellibing_Sandbox_${sandboxRun.runId}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){notify(error.message);}};}
$('#reset').onclick = () => {runLoop=false;workshopEditor.close();candidateSession?.reset();if(accountMode)state.accountCandidates=Array(5).fill(null);sandboxClient?.reset().catch(error=>notify(error.message));if(state.configurationSession)resetSimulationResults(state.configurationSession);else state=resetDemoState(selectedId);renderWorkspace();notify('Simulation reset'); };

if(!demonstration&&!configurationReview){
 document.title=sandbox?'Bellibing Sandbox':'Bellibing · Improve a Character';$('.page-heading h1').textContent=sandbox?'Sandbox Simulator':'Improve a Character';$('.study-label').textContent=sandbox?'SANDBOX BETA':'IMPROVE';$('#workshopFeedback').removeAttribute('aria-describedby');document.body.classList.add('product-workspace');document.body.classList.toggle('account-workspace',!sandbox);document.body.dataset.buildKind=sandbox?'SANDBOX_BUILD':'ACCOUNT_BUILD';
 $('.demo-note').hidden=true;$('.target').hidden=true;$('.mode-switch').hidden=true;$('.settings-compact img')?.remove();document.querySelector('.beta-boundary')?.remove();
 if(!sandbox){$('.sonata-section').hidden=true;$('.page-heading h1').textContent='Improve a Character';$('.page-heading .eyebrow').textContent='YOUR EQUIPPED BUILD';$('.loadout-heading .eyebrow').textContent='CURRENT LOADOUT';$('#simulate').querySelector('span:nth-child(2)').textContent='IMPROVE ECHO';$('.loadout-heading .small-muted').textContent='Equipped Echoes';}
 const routes=globalThis.BELLIBING_WORKSPACE_ROUTES;
 const href=mode=>{if(routes)return routes[mode];const url=new URL(location.href);url.searchParams.set('sandbox',String(mode==='sandbox'));url.searchParams.delete('demonstration');return url.pathname+url.search;};
 mountWorkspaceHeader($('.site-header'),{build:routes?.build??assetURL('../../ui-prototypes/v34-functional.html')+'?workspace=build',improve:href('improve'),sandbox:href('sandbox')},sandbox?'sandbox':'improve');
 const badge=document.createElement('p');badge.className='workspace-identity';badge.textContent=sandbox?'Sandbox · hypothetical · no account changes':'Improve · equipped Current + observed Candidate';$('.page-heading>div').append(badge);
}
if(accountMode)setInterval(()=>{candidateSession.checkFresh();const b=improveCandidateContext(readImproveOwner());if(b!==candidateMetricsBinding)renderWorkspace();},100);
$('#focusDemo').onchange = event => characterCard.setDemo(event.target.checked);
renderWorkspace();
layout();
carousel = mountCarousel({ selectedId, onSelect: id => {
  workshopEditor.close();if(accountMode)candidateSession.invalidate();
  uiContextRevision++;selectedId = id;
  state = characterState(id);
  renderWorkspace();
}, preview:sandbox?id=>sandboxWorkspace.preview(id):accountMode?id=>{const record=readProductionBuildRecord(localStorage,people.get(id));return {onAccount:record.status==='OBSERVED_PRODUCTION_BUILD_RECORD',hasBuild:record.status==='OBSERVED_PRODUCTION_BUILD_RECORD',slots:record.buildState?.echoSets?.sets?.[record.buildState.echoSets.activeSetId]?.slots?.filter(Boolean).length??0,weapon:WEAPON_CATALOG.find(w=>w.id===record.buildState?.weaponId)?.name??null,stats:['—','—','—']};}:undefined,standalone:sandbox,accountLabel:accountMode?'account':undefined });
if (query.get('settings') === 'expanded') { $('#settings').classList.add('expanded'); layout('settings'); }
if (query.get('compact') === 'true') { $('#settings').classList.remove('expanded'); $('#character').classList.remove('expanded'); layout(); }
if (globalThis.BELLIBING_LAB_REVIEW) {
  const review = globalThis.BELLIBING_LAB_REVIEW;
  $('.page-footer > span:last-child').textContent = `Visual Concept V1.1 · ${review.revision.slice(0, 12)}${review.workingTreeDirty ? ' · working copy' : ''}`;
  document.documentElement.dataset.reviewRevision = review.revision;
}
if(sandbox){
 setInterval(()=>{sandboxClient.checkFresh();if(metricsBinding!==JSON.stringify({context:sandboxWorkspace.readContext(resources.read(),resources.revision()),evaluationContext:state.sandboxEvaluationContext??null}))renderWorkspace();},100);
 // Retry only while disconnected, without a second fake backend or forced reload.
 setInterval(()=>{if(hostStatus!=='CONNECTED'&&metricsBinding)probeSandboxHost(metricsBinding);},5000);
}
document.documentElement.dataset.uiLabReady = 'true';
