import { mountResourceInventory } from './resource-inventory.js';
import { mountResultsPanel } from './simulation-stats.js';
import { mountImproveSettings } from './improve-settings.js';
import { restoreRecommendedSettings } from './settings-state.js';
import { CHARACTER_CATALOG } from './catalog.js';
import { getDemoState, resetDemoState } from './lab-state.js';
import { applyFeedbackScenario, workshopFeedbackFixture } from './feedback-fixtures.js';
import { mountWorkshopFeedback } from './workshop-feedback.js';
import { sonataSummary } from './sonata-summary.js';
import { echoCard } from './echo-card.js';
import { mountCarousel } from './carousel.js';
import { $, assetURL, escapeHtml, notify } from './util.js';

mountResourceInventory($('#resourceInventory'));
const characterCard = mountResultsPanel($('.character-content'), {onReveal: () => { $('#character').classList.add('expanded'); layout('character'); }});
const improveSettings = mountImproveSettings($('#echoSettings'), {getState: () => state, onEdit: (action, source) => characterCard.edit(action, source), onSettle: () => characterCard.settle()});
const people = new Map(CHARACTER_CATALOG.map(person => [person.id, person]));
let selectedId = 'augusta';
let state = getDemoState(selectedId);
let carousel;
let inspection = null;
let inspectorSource = null;
let closingInspection = false;
const query = new URLSearchParams(location.search);
const feedback = mountWorkshopFeedback({
  highlightSlots: (slots, severity) => slots.forEach(index => {
    const slot = $(`[data-slot="${index}"]`);
    if (slot) { slot.classList.add('feedback-affected'); slot.dataset.feedbackSeverity = severity; }
  }),
  clearHighlights: () => document.querySelectorAll('.feedback-affected').forEach(slot => {
    slot.classList.remove('feedback-affected'); delete slot.dataset.feedbackSeverity;
  }),
});
applyFeedbackScenario(state, query.get('feedback'));
if (query.get('recorded') === 'true') {
  const scenario = state.feedbackScenario;
  applyFeedbackScenario(state, 'result');
  applyFeedbackScenario(state, scenario);
}
function renderFeedback() {
  feedback.render(workshopFeedbackFixture(state));
  $('#reviewScenario').value = state.feedbackScenario;
  $('#reviewScenario').disabled = selectedId !== 'augusta';
  $('#reviewScenario').title = selectedId === 'augusta' ? 'Isolated Augusta review fixtures' : 'Warning/error review fixtures are supplied for Augusta only';
}

function renderWorking() {
  const slot = state.selectedSlot;
  $('#currentCard').innerHTML = echoCard(state.echoes[slot], { footer: 'ACTIVE' });
  $('#newCard').innerHTML = echoCard(state.candidates[slot], { candidate: true, footer: 'UNFINISHED' });
  $('#slotLabel').textContent = String(slot + 1).padStart(2, '0');
  renderFeedback();
}

function renderSlots() {
  $('#slots').innerHTML = state.echoes.map((echo, index) => `<button class="slot ${index === state.selectedSlot ? 'selected-slot' : ''}" data-slot="${index}" aria-pressed="${index === state.selectedSlot}" aria-label="Select Echo slot ${index + 1}${echo ? `, ${escapeHtml(echo.name)}` : ', empty'}"><span class="slot-number"><span>0${index + 1}</span><span class="slot-selection">${index === state.selectedSlot ? 'SELECTED' : ''}</span><span class="slot-state">${echo ? 'ACTIVE' : 'EMPTY'}</span></span>${echoCard(echo)}</button>`).join('');
  $('.loadout-heading .small-muted').innerHTML = sonataSummary(state.echoes);
}

function renderPiles() {
  $('#piles').innerHTML = state.histories.map((history, index) => history.length
    ? `<button class="pile" data-pile="${index}" aria-label="Lift discarded card from Echo ${index + 1}, ${history.length} historical cards"><span class="pile-count"><span>ECHO 0${index + 1}</span><b>× ${history.length}</b></span>${echoCard(history.at(-1))}</button>`
    : `<div class="pile empty-pile" aria-label="Echo ${index + 1} Trash Pile, empty"><span class="pile-count"><span>ECHO 0${index + 1}</span><b>EMPTY</b></span>${echoCard(null)}</div>`).join('');
  $('#historyCount').textContent = `${state.histories.reduce((sum, history) => sum + history.length, 0)} cards`;
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
  document.querySelectorAll('[data-scope]').forEach(button => {
    const selected = button.dataset.scope === state.scope;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', selected);
  });
  $('.compact-gate').textContent = state.gate;
  document.querySelectorAll('.gate-options button').forEach(button => { button.classList.toggle('selected', button.textContent === state.gate); button.setAttribute('aria-pressed', button.textContent === state.gate); });
  improveSettings.render();
  const buttons = [...document.querySelectorAll('.setting-mode button')];
  buttons.forEach(button => { button.classList.toggle('selected', button.textContent === state.settingsMode); button.setAttribute('aria-pressed', button.textContent === state.settingsMode); });
  buttons[0].disabled = selectedId !== 'augusta';
  buttons[0].title = selectedId === 'augusta' ? 'Restore the approved Augusta demonstration defaults' : 'No recommended settings supplied for this demonstration Character';
  const target = $('.target');
  target.querySelector('p').textContent = selectedId === 'augusta' ? 'Augusta · DEFAULT Calc reference' : 'Character Target Pending in this visual study';
  target.querySelectorAll('div').forEach((row, index) => { row.querySelector('strong').textContent = selectedId === 'augusta' ? ['2,407', '84.7%', '225%'][index] : '—'; });
}

function renderWorkspace() {
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
  const history = state.histories[inspection.slot];
  const echo = history[inspection.index];
  $('#inspectedCard').innerHTML = echoCard(echo);
  $('#inspectionSlot').textContent = String(inspection.slot + 1).padStart(2, '0');
  $('#checkpoints').innerHTML = echo.stats.map(([name, value], index) => `<div class="checkpoint"><span>+${(index + 1) * 5}</span><div>${escapeHtml(name)}</div><strong>${escapeHtml(value)}</strong></div>`).join('');
  $('#historyPosition').textContent = `${inspection.index + 1} / ${history.length}`;
  $('#previousCard').disabled = inspection.index === 0;
  $('#nextCard').disabled = inspection.index === history.length - 1;
  $('.checkpoint-history p').textContent = `Discarded at +${echo.level} · rejection reason unavailable`;
}

function inspectPile(slot) {
  if (!state.histories[slot].length) return;
  carousel.close();
  inspection = { slot, index: state.histories[slot].length - 1 };
  inspectorSource = document.querySelector(`[data-pile="${slot}"]`);
  const origin = inspectorSource.querySelector('.echo-card').getBoundingClientRect();
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

$('#slots').addEventListener('click', event => {
  const button = event.target.closest('[data-slot]');
  if (!button) return;
  state.selectedSlot = Number(button.dataset.slot);
  renderWorking();
  renderSlots();
  $(`[data-slot="${state.selectedSlot}"]`).focus({ preventScroll: true });
});
$('#piles').addEventListener('click', event => {
  const button = event.target.closest('[data-pile]');
  if (button) inspectPile(Number(button.dataset.pile));
});
$('#closeInspection').onclick = () => closeInspection();
$('#inspection').addEventListener('cancel', event => { event.preventDefault(); closeInspection(); });
$('#inspection').addEventListener('click', event => { if (event.target === $('#inspection')) closeInspection(); });
$('#previousCard').onclick = () => { if (inspection.index > 0) { inspection.index--; renderInspection(); } };
$('#nextCard').onclick = () => { if (inspection.index < state.histories[inspection.slot].length - 1) { inspection.index++; renderInspection(); } };

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
  characterCard.edit({kind:'gate'},null);
});
$('.setting-mode').addEventListener('click', event => {
  if (event.target.tagName !== 'BUTTON') return;
  state.settingsMode = event.target.textContent;
  if (state.settingsMode === 'Recommended') {
    restoreRecommendedSettings(state);
  }
  renderSettings();
  characterCard.edit({kind:'settings-mode'},null);
});
$('#simulate').onclick = () => {
  if (!workshopFeedbackFixture(state).actionAllowed) return;
  applyFeedbackScenario(state, 'result');
  renderWorkspace();
  notify('Illustrative run record · live simulation is not connected');
};
$('#reviewScenario').onchange = event => {
  applyFeedbackScenario(state, event.target.value);
  renderWorkspace();
};
$('.interaction-options').addEventListener('click', event => {
  const button = event.target.closest('[data-scope]');
  if (!button) return;
  state.scope = button.dataset.scope;
  renderSettings();
});
$('.mode-switch').addEventListener('click', event => { if (event.target.tagName === 'BUTTON') notify('UI Lab uses isolated Simulate fixtures · no real account is connected'); });
document.querySelectorAll('.site-header nav button').forEach(button => { button.onclick = () => notify('Bellibing UI Lab · Improve review environment'); });
$('#reset').onclick = () => { state = resetDemoState(selectedId); renderWorkspace(); notify('This Character’s demonstration state restored'); };

$('#focusDemo').onchange = event => characterCard.setDemo(event.target.checked);
renderWorkspace();
layout();
carousel = mountCarousel({ selectedId, onSelect: id => {
  selectedId = id;
  state = getDemoState(id);
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
