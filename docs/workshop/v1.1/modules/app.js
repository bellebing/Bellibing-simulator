import { source, ACCOUNT_IDS } from './presentation-state.js';
import { CHARACTER_CATALOG } from './catalog.js';
import { CHARACTER_TARGETS } from './targets.js';
import { mountCarousel } from './carousel.js';
import { mountResultsPanel } from './simulation-stats.js';
import { mountImproveSettings } from './improve-settings.js';
import { mountResourceInventory } from './resource-inventory.js';
import { echoCard } from './echo-card.js';
import { $, assetURL, escapeHtml as html, notify } from './util.js';
import { startManualWorkshop, createWorkshopCandidate, rollWorkshopCheckpoint, workshopToken } from '../../../assets/echoManualWorkshop.js';
import { selectSimulatorSlot } from '../../../assets/echoSimulatorSession.js';
import { RANK5_PRIMARY_MAIN_STATS } from '../../../assets/echoMainStats.js';
import { ECHO_TUBES, formatInventoryQuantity } from '../../../assets/resourceInventory.js';

const people = new Map(CHARACTER_CATALOG.map(person => [person.id,person]));
const echoes = source.echoes(), sonatas = new Map(source.sonatas().map(set => [set.id,set]));
let selectedId = ACCOUNT_IDS[0] ?? CHARACTER_CATALOG[0].id;
let session = null, selectedSlot = 1, ui, carousel, error = '', inspectTrigger;
const rng = { next: () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296 };
const panel = mountResultsPanel($('.character-content'));
const settings = mountImproveSettings($('#echoSettings'), {getState:()=>ui,onEdit:editSettings,onSettle:()=>panel.settle()});
const inventory = mountResourceInventory($('#resourceInventory'), {
  read:()=>source.inventory(), set:(id,text)=>{source.setInventory(id,text);if(session)notify('Saved resources updated. Reset to start with the new budget.');},
});
function bind() {
  const saved=source.snapshot(selectedId);
  ui={...saved,...source.settings(selectedId), stats:saved.stats.map(value=>[value,null]), hasRecordedRun:false};
}
function displayCard(card) {
  if(!card)return null;
  const raw=typeof card==='string'?{echoId:card}:card;
  const item=echoes.find(row=>row.id===raw.echoId), set=sonatas.get(raw.selectedSonataSetId);
  if(!item)return null;
  return {name:item.name,cost:item.cost,art:item.artSrc,level:raw.level,setName:set?.name,setArt:set?.artSrc??'',
    main:raw.mainStat?.name??'Main Stat',value:raw.mainStat?source.formatStat(raw.mainStat.name,raw.mainStat.value):'—',
    secondary:raw.secondaryMainStat?.name??'Secondary',secondaryValue:raw.secondaryMainStat?source.formatStat(raw.secondaryMainStat.name,raw.secondaryMainStat.value):'—',
    stats:(raw.substats??[]).map(stat=>[stat.name,source.formatStat(stat.name,stat.value)])};
}
function candidate(){return session?.slots[selectedSlot-1].candidate;}
function render() {
  const person=people.get(selectedId),saved=source.snapshot(selectedId),current=candidate();
  const slots=session?session.simulatedBuild.echoSets.sets[session.source.activeSetId].slots:saved.slots;
  $('#currentCard').innerHTML=echoCard(displayCard(slots[selectedSlot-1]),{footer:session?'SIMULATED':'CURRENT'});
  $('#newCard').innerHTML=echoCard(displayCard(current?.card),{candidate:true,footer:current?.card.level===25?'COMPLETE · UNEQUIPPED':'CANDIDATE'});
  $('#inspectCandidate').hidden=!current;$('#inspectCandidate').disabled=!current;
  $('#slotLabel').textContent=String(selectedSlot).padStart(2,'0');
  $('#slots').innerHTML=slots.map((card,index)=>`<button class="slot ${index+1===selectedSlot?'selected-slot':''}" data-slot="${index+1}" aria-pressed="${index+1===selectedSlot}" aria-label="Select Echo slot ${index+1}"><span class="slot-number"><span>0${index+1}</span><span class="slot-selection">${index+1===selectedSlot?'SELECTED':''}</span><span class="slot-state">${card?'EQUIPPED':session?.slots[index].candidate?'CANDIDATE':'EMPTY'}</span></span>${echoCard(displayCard(card))}</button>`).join('');
  $('#piles').innerHTML=Array.from({length:5},(_,index)=>`<div class="pile empty-pile" aria-label="Echo ${index+1} Trash Pile, empty"><span class="pile-count"><span>ECHO 0${index+1}</span><b>EMPTY</b></span>${echoCard(null)}</div>`).join('');
  $('#historyCount').textContent='0 rejected cards';
  $('.loadout-heading .eyebrow').textContent=session?'SIMULATED LOADOUT':'CURRENT LOADOUT';
  $('.loadout-heading .small-muted').textContent=`${slots.filter(Boolean).length} Echoes · ${slots.reduce((sum,card)=>sum+(displayCard(card)?.cost??0),0)} / 12 Cost`;
  $('.current-name strong').textContent=person.name;
  $('.character-compact img').src=assetURL(person.face);$('.character-compact img').alt=person.name;
  $('.character-compact .vertical-label').textContent=person.name.toUpperCase();
  panel.render(person,ui);settings.render();
  $('#gateLabel').value=ui.gate;$('.compact-gate').textContent=ui.gate;
  document.querySelectorAll('.gate-options button').forEach(button=>{button.classList.toggle('selected',button.textContent===ui.gate);button.setAttribute('aria-pressed',button.textContent===ui.gate);button.title='Saved Gate · automatic decisions Pending';});
  document.querySelectorAll('.mode-switch button').forEach(button=>{const active=(button.dataset.mode==='simulate')===!!session;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',active);button.disabled=button.dataset.mode==='simulate'&&!saved.onAccount;});
  $('#reset').disabled=!session;$('#fullSet').disabled=true;$('#fullSet').title='Full Set automation Pending';
  $('#simulate').disabled=!session||current?.card.level===25;
  $('#simulateLabel').textContent=!session?'ENTER SIMULATE':!current?'NEW ECHO':current.card.level===25?'COMPLETE':`ROLL TO +${current.card.level+5}`;
  $('#feedbackTitle').textContent=error||(!saved.onAccount?'Add this Character in Build':!session?'Current equipment':!current?'Create an Echo':current.card.level===0?'Candidate ready':`+${current.card.level} · ${current.card.substats.at(-1)?.name}`);
  $('#feedbackText').hidden=false;$('#feedbackText').textContent=error?'Candidate and session budget unchanged.':!saved.onAccount?'Use Build to add a Character to your account.':!session?'Enter Simulate to start five empty slots.':current?.card.level===25?'Complete candidate · unequipped · evaluation Pending':'Manual rolling · evaluation Pending';
  $('#workshopFeedback').dataset.severity=error?'error':'ready';
  const target=CHARACTER_TARGETS.find(row=>row.characterId===selectedId);
  $('.target').innerHTML='<summary>Character Target <span>↗</span></summary><p>Verified DEFAULT Calc reference</p>'+(target?.rows.filter(row=>row.status==='READY').map(row=>`<div>${html(row.label)} <strong>${html(row.displayValue)}</strong></div>`).join('')||'<p>Pending</p>');
  $('#selectedSonata').textContent=current?sonatas.get(current.card.selectedSonataSetId)?.name??'Pending':'Choose with New Echo';
  $('#consumption').hidden=!session;
  if(session){
    const receipts=session.manual.receipts;
    const rows=[{id:'echoes',name:'Echoes',spent:receipts.reduce((n,r)=>n+r.echoes,0),returned:0},{id:'tuners',name:'Premium Tuners',spent:receipts.reduce((n,r)=>n+r.tuners,0),returned:0},...ECHO_TUBES.map(t=>({id:t.id,name:t.color+' Tubes',spent:receipts.reduce((n,r)=>n+(r.tubes?.spent[t.id]??0),0),returned:receipts.reduce((n,r)=>n+(r.tubes?.returned[t.id]??0),0)}))];
    $('#materialRows').innerHTML=rows.map(row=>`<div class="material-row"><span>${html(row.name)}</span><strong title="Spent / Returned / Remaining">${row.spent}${row.returned?' · +'+row.returned+' returned':''} <small> / ${formatInventoryQuantity(session.manual.inventory[row.id]??session.manual.inventory.tubes[row.id])} left</small></strong></div>`).join('');
  }
  carousel?.refresh();
}
function editSettings(action) {
  const local=ui;
  const section=Object.keys(ui.statSections).find(key=>ui.statSections[key].includes(action.statId));
  try{Object.assign(ui,source.editSettings(selectedId,{...action,section,index:ui.statSections[action.destination]?.indexOf(action.statId),count:ui.flexCount}));panel.edit(action,null);}
  catch(failure){notify(failure.message);Object.assign(ui,source.settings(selectedId));}
  ui.otherExpanded=local.otherExpanded;settings.render();
}
function layout(last='character') {
  const shell=$('#composition'),left=$('#settings'),right=$('#character'),available=shell.clientWidth;
  let l=left.classList.contains('expanded'),r=right.classList.contains('expanded');
  const rw=available<1550?290:Math.min(480,Math.floor(available*.24));
  const gaps=2*parseFloat(getComputedStyle(shell).columnGap),style=getComputedStyle($('.workshop'));
  const minimum=1000+parseFloat(style.borderLeftWidth)+parseFloat(style.borderRightWidth),lw=Math.min(350,available-minimum-gaps-58);
  if(lw<300)l=false;
  if(available<minimum+gaps+(l?lw:58)+(r?rw:58)){if(last==='settings')r=false;else l=false;}
  left.classList.toggle('expanded',l);right.classList.toggle('expanded',r);
  shell.style.gridTemplateColumns=`${l?lw:58}px minmax(${minimum}px,1fr) ${r?rw:58}px`;
  $('#settingsToggle').setAttribute('aria-expanded',l);$('#characterToggle').setAttribute('aria-expanded',r);
}
function start() { const saved=source.snapshot(selectedId);if(!saved.onAccount)throw Error('Select an account Character.');session=startManualWorkshop(selectedId,saved.build,crypto.randomUUID(),inventory.read());session=selectSimulatorSlot(session,selectedSlot);error=''; }
function perform(action) {try{action();error='';}catch(failure){error=failure.message;}render();}
function populateTemplate() {
  const item=echoes.find(row=>row.id===$('#candidateSpecies').value);
  $('#candidateSonata').innerHTML=item.sonataSetIds.map(id=>`<option value="${id}">${html(sonatas.get(id)?.name??id)}</option>`).join('');
  $('#candidateMain').innerHTML=RANK5_PRIMARY_MAIN_STATS[item.cost].map(stat=>`<option>${html(stat.name)}</option>`).join('');
}
$('#simulate').onclick=()=>{
  if(!session)return;
  if(!candidate()){
    $('#candidateSpecies').innerHTML=echoes.map(row=>`<option value="${row.id}">${html(row.name)} · COST ${row.cost}</option>`).join('');populateTemplate();$('#candidateSetup').showModal();
  }else perform(()=>{session=rollWorkshopCheckpoint(session,rng,workshopToken(session));});
};
$('#candidateSpecies').onchange=populateTemplate;
$('#candidateForm').onsubmit=event=>{event.preventDefault();perform(()=>{
  session=createWorkshopCandidate(session,{echoId:$('#candidateSpecies').value,selectedSonataSetId:$('#candidateSonata').value,primaryMainStat:$('#candidateMain').value},echoes,workshopToken(session));
  $('#candidateSetup').close();
});if(error)$('#candidateError').textContent=error;};
$('#cancelCandidate').onclick=()=>$('#candidateSetup').close();
$('#slots').onclick=event=>{const button=event.target.closest('[data-slot]');if(!button)return;selectedSlot=Number(button.dataset.slot);if(session)session=selectSimulatorSlot(session,selectedSlot);error='';render();$(`[data-slot="${selectedSlot}"]`).focus();};
$('.mode-switch').onclick=event=>{const mode=event.target.dataset.mode;if(!mode)return;perform(()=>{if(mode==='simulate'&&!session)start();else if(mode==='current')session=null;});};
$('#reset').onclick=()=>perform(start);
$('#settingsToggle').onclick=()=>{$('#settings').classList.toggle('expanded');layout('settings');};
$('#characterToggle').onclick=()=>{$('#character').classList.toggle('expanded');layout('character');};
window.addEventListener('resize',()=>layout(document.activeElement?.closest('#settings')?'settings':'character'));
$('.gate-options').onclick=event=>{if(event.target.tagName!=='BUTTON')return;editSettings({kind:'gate',value:Number(event.target.textContent.slice(1))});render();};
$('.setting-mode').onclick=event=>{if(event.target.tagName!=='BUTTON')return;editSettings(event.target.textContent==='Recommended'?{kind:'recommended'}:{kind:'mode',value:'MANUAL'});render();};
$('#inspectCandidate').onclick=()=>{
  const current=candidate();if(!current)return;inspectTrigger=$('#inspectCandidate');
  $('#inspectedCard').innerHTML=echoCard(displayCard(current.card),{footer:'CANDIDATE · UNEQUIPPED'});
  $('#inspectionSlot').textContent=String(selectedSlot).padStart(2,'0');
  $('#checkpoints').innerHTML=current.history.map(card=>{const stat=card.substats.at(-1);return `<div class="checkpoint"><span>+${card.level}</span><div>${html(stat?.name??'Created')}</div><strong>${stat?html(source.formatStat(stat.name,stat.value)):'—'}</strong></div>`;}).join('');
  $('#historyPosition').textContent=`${current.history.length-1} rolls`;
  $('#inspection').showModal();
};
$('#closeInspection').onclick=()=>$('#inspection').close();
$('#inspection').addEventListener('close',()=>inspectTrigger?.focus());
$('.site-header nav').onclick=event=>{if(event.target.dataset.navigate)source.navigate(event.target.dataset.navigate);};
$('.brand').onclick=event=>{event.preventDefault();source.navigate('improve');};
bind();render();layout();
carousel=mountCarousel({selectedId,onSelect:id=>{selectedId=id;session=null;selectedSlot=1;error='';bind();render();}});
// Read-only diagnostic projection for browser verification; never a second owner.
window.bellibingWorkshop=Object.freeze({snapshot:()=>structuredClone({selectedId,selectedSlot,session})});
document.documentElement.dataset.workshopReady='true';
