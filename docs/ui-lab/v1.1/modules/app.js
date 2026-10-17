import {configuredCard} from './configured-card.js';
import {createConfigurationSession,configurationSnapshot,resetSimulationResults,configuredSlotTitle,selectConfigurationSlot,settingsConfigurationChanged} from './simulation-configuration.js';
import {createWorkshopEditor} from './workshop-editor.js';
import {activeEchoSlots, activationMarkup, positionActivationMarks, setEchoActive, simulationRequest} from './echo-activation.js';
import { mountResourceCost } from './resource-cost.js';
import { mountResourceInventory } from './resource-inventory.js';
import { mountResultsPanel } from './simulation-stats.js';
import { mountImproveSettings } from './improve-settings.js';
import { mountSonataSelection } from './sonata-selection.js';
import { restoreRecommendedSettings } from './settings-state.js';
import { CHARACTER_CATALOG } from './catalog.js';
import { getDemoState, resetDemoState } from './lab-state.js';
import { applyFeedbackScenario, workshopFeedbackFixture } from './feedback-fixtures.js';
import { mountWorkshopFeedback } from './workshop-feedback.js';
import { sonataSummary } from './sonata-summary.js';
import { echoCard } from './echo-card.js';
import { mountCarousel } from './carousel.js';
import { $, assetURL, escapeHtml, notify } from './util.js';

const resources = mountResourceInventory($('#resourceInventory'));
mountResourceCost($('#resourceCost')); // No verified cost producer is connected yet.
const characterCard = mountResultsPanel($('.character-content'), {onReveal: () => { $('#character').classList.add('expanded'); layout('character'); }});
const improveSettings = mountImproveSettings($('#echoSettings'), {getState: () => state, onEdit: (action, source) => {settingsConfigurationChanged(state);characterCard.edit(action, source);}, onSettle: () => characterCard.settle()});
const sonataSelection = mountSonataSelection($('.sonata-section'), {getState: () => state,onEdit:()=>settingsConfigurationChanged(state)});
const people = new Map(CHARACTER_CATALOG.map(person => [person.id, person]));
let selectedId = 'augusta';
const query = new URLSearchParams(location.search);
const demonstration = query.get('demonstration') === 'true';
function characterState(id) {
  const value=getDemoState(id);
  if(!demonstration&&!value.configurationSession){
    value.configurationSession=createConfigurationSession(id);
    // The old two-row Sonata fixture is not a recommendation for other Characters.
    if(id!=='augusta')value.sonataPool=[];
  }
  return value;
}
let state = characterState(selectedId);
const workshopEditor=createWorkshopEditor({getState:()=>state,onCommit:error=>{renderWorkspace();if(error)notify(error.message);}});
window.bellibingLabConfiguration=Object.freeze({snapshot:()=>configurationSnapshot(state,resources.read(),{inventoryRevision:resources.revision()})});
function displayedEchoes(){return state.configurationSession?.mode==='simulate'?state.configurationSession.current.map((card,index)=>card??configuredCard(state.configurationSession.configurations[index])):state.echoes;}
function displayedCandidates(){return state.configurationSession?state.configurationSession.candidates:state.candidates;}
function displayedHistories(){return state.configurationSession?state.configurationSession.histories:state.histories;}
let carousel;
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
  $('#simulate').title = request.slots.length ? 'Pending: multi-slot simulation is not connected' : 'Activate an Echo to configure a future simulation';
  $('#reviewScenario').value = state.feedbackScenario;
  $('#reviewScenario').disabled = !demonstration || selectedId !== 'augusta';
  $('#reviewScenario').title = selectedId === 'augusta' ? 'Isolated Augusta review fixtures' : 'Warning/error review fixtures are supplied for Augusta only';
}

function renderWorking() {
  const slot = state.selectedSlot;
  $('#currentCard').innerHTML = echoCard(displayedEchoes()[slot], { footer: 'ACTIVE' });
  $('#newCard').innerHTML = echoCard(displayedCandidates()[slot], { candidate: true, footer: 'UNFINISHED' });
  $('#slotLabel').textContent = String(slot + 1).padStart(2, '0');
  renderFeedback();
}

function renderSlots() {
  $('#slots').innerHTML = displayedEchoes().map((echo, index) => {
    const session=state.configurationSession, editable=!!session&&session.mode==='simulate';
    const active = session ? session.active[index] : !!echo && state.echoActive[index];
    const available=session ? editable&&!!session.configurations[index] : !!echo;
    return `<div class="activation-slot${active ? '' : ' is-inactive'}"><button class="slot ${index === state.selectedSlot ? 'selected-slot' : ''}" data-slot="${index}" aria-pressed="${index === state.selectedSlot}" aria-label="Select Echo slot ${index + 1}${echo ? `, ${escapeHtml(echo.name)}` : ', empty'}"><span class="slot-number" aria-hidden="true"></span>${echoCard(echo,{footer:session?.mode==='current'?'CURRENT':'SIMULATED'})}</button>${activationMarkup(index,active,available)}${session ? `<button type="button" class="echo-edit" data-edit-echo="${index}" aria-label="Edit Echo slot ${index+1}" title="${escapeHtml(configuredSlotTitle(state,index))}"${editable?'':' disabled'}>Edit Echo</button>` : ''}</div>`;
  }).join('');
  positionActivationMarks($('#slots'));
  $('.loadout-heading .small-muted').innerHTML = sonataSummary(activeEchoSlots(state));
}

function renderPiles() {
  $('#piles').innerHTML = displayedHistories().map((history, slot) => history.length
    ? `<div class="pile" data-pile="${slot}" aria-label="Echo ${slot + 1} Trash Pile, ${history.length} historical cards">
        <span class="pile-count"><span>ECHO 0${slot + 1}</span><b>× ${history.length}</b></span>
        <div class="pile-stack" style="--pile-extra:${(history.length - 1) * 16}px">
          ${history.map((echo, index) => {
            const depth = history.length - index - 1;
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
  characterCard.render(person, state);
  $('.character-compact img').src = assetURL(person.face);
  $('.character-compact img').alt = person.name;
  $('.character-compact .vertical-label').textContent = person.name.toUpperCase();
}

function renderSettings() {
  $('#gateLabel').value = state.gate;
  $('.compact-gate').textContent = state.gate;
  document.querySelectorAll('.gate-options button').forEach(button => { button.classList.toggle('selected', button.textContent === state.gate); button.setAttribute('aria-pressed', button.textContent === state.gate); });
  improveSettings.render();
  sonataSelection.render();
  const buttons = [...document.querySelectorAll('.setting-mode button')];
  buttons.forEach(button => { button.classList.toggle('selected', button.textContent === state.settingsMode); button.setAttribute('aria-pressed', button.textContent === state.settingsMode); });
  buttons[0].disabled = selectedId !== 'augusta';
  buttons[0].title = selectedId === 'augusta' ? 'Restore the approved Augusta demonstration defaults' : 'No recommended settings supplied for this demonstration Character';
  const target = $('.target');
  target.querySelector('p').textContent = selectedId === 'augusta' ? 'Augusta · DEFAULT Calc reference' : 'Character Target Pending in this visual study';
  target.querySelectorAll('div').forEach((row, index) => { row.querySelector('strong').textContent = selectedId === 'augusta' ? ['2,407', '84.7%', '225%'][index] : '—'; });
}

function renderWorkspace() {
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
  $('#previousCard').disabled = inspection.index === 0;
  $('#nextCard').disabled = inspection.index === history.length - 1;
  $('.checkpoint-history p').textContent = `Discarded at +${echo.level} · rejection reason unavailable`;
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

window.addEventListener('resize', () => positionActivationMarks($('#slots')));
$('#slots').addEventListener('click', event => {
  const edit=event.target.closest('[data-edit-echo]');
  if(edit){const slot=Number(edit.dataset.editEcho);selectConfigurationSlot(state,slot);renderWorking();renderSlots();workshopEditor.open(slot,$(`[data-edit-echo="${slot}"]`));return;}
  const toggle = event.target.closest('[data-activation]');
  if (toggle) {
    const index = Number(toggle.dataset.activation);
    setEchoActive(state,index,state.configurationSession ? !state.configurationSession.active[index] : !state.echoActive[index]);
    renderSlots();renderCharacter();renderFeedback();
    $(`[data-activation="${index}"]`).focus({preventScroll:true});
    return;
  }
  const button = event.target.closest('[data-slot]');
  if (!button) return;
  selectConfigurationSlot(state,Number(button.dataset.slot));
  renderWorking();
  renderSlots();
  $(`[data-slot="${state.selectedSlot}"]`).focus({ preventScroll: true });
});
$('#piles').addEventListener('click', event => {
  const button = event.target.closest('button.pile-card');
  if (button) inspectPile(Number(button.closest('[data-pile]').dataset.pile), Number(button.dataset.historyIndex), button);
});
$('#closeInspection').onclick = () => closeInspection();
$('#inspection').addEventListener('cancel', event => { event.preventDefault(); closeInspection(); });
$('#inspection').addEventListener('click', event => { if (event.target === $('#inspection')) closeInspection(); });
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
  state.settingsMode = event.target.textContent;
  if (state.settingsMode === 'Recommended') {
    restoreRecommendedSettings(state);
  }
  renderSettings();
  settingsConfigurationChanged(state);characterCard.edit({kind:'settings-mode'},null);
});
$('#simulate').onclick = () => {
  if ($('#simulate').disabled) return;
  const request = simulationRequest(state);
  notify(`Pending · multi-slot simulation is not connected (${request.slots.length} active slots)`);
};
$('#reviewScenario').onchange = event => {
  if(!demonstration)return;
  applyFeedbackScenario(state, event.target.value);
  renderWorkspace();
};
$('.mode-switch').addEventListener('click', event => {
  if(event.target.tagName!=='BUTTON')return;
  if(!state.configurationSession){notify('UI Lab uses isolated Simulate fixtures · no real account is connected');return;}
  workshopEditor.close();state.configurationSession.mode=event.target.textContent==='Current'?'current':'simulate';state.configurationSession.revision++;state.configurationSession.selectionRevision++;renderWorkspace();
});
document.querySelectorAll('.site-header nav button').forEach(button => { button.onclick = () => notify('Bellibing UI Lab · Improve review environment'); });
$('#reset').onclick = () => { workshopEditor.close();if(state.configurationSession)resetSimulationResults(state.configurationSession);else state=resetDemoState(selectedId);renderWorkspace();notify('Simulation reset'); };

$('#focusDemo').onchange = event => characterCard.setDemo(event.target.checked);
renderWorkspace();
layout();
carousel = mountCarousel({ selectedId, onSelect: id => {
  selectedId = id;
  workshopEditor.close();state = characterState(id);
  renderWorkspace();
} });
if (query.get('settings') === 'expanded') { $('#settings').classList.add('expanded'); layout('settings'); }
if (query.get('compact') === 'true') { $('#settings').classList.remove('expanded'); $('#character').classList.remove('expanded'); layout(); }
if (globalThis.BELLIBING_LAB_REVIEW) {
  const review = globalThis.BELLIBING_LAB_REVIEW;
  $('.page-footer > span:last-child').textContent = `Visual Concept V1.1 · ${review.revision.slice(0, 12)}${review.workingTreeDirty ? ' · working copy' : ''}`;
  document.documentElement.dataset.reviewRevision = review.revision;
}
document.documentElement.dataset.uiLabReady = 'true';
