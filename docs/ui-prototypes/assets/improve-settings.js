import { ECHO_TUBES, emptyResourceInventory, parseInventoryQuantity, formatInventoryQuantity, updateResourceInventory } from '../../assets/resourceInventory.js';
import { publicSettingsView } from '../../assets/publicSettingsView.js';
import { createImprovePolicyState, loadImprovePolicyStorage, readImprovePolicyState, resolveImprovePolicyState,
  updateImprovePolicyState, persistImprovePolicyState, persistResourceInventory } from '../../assets/improvePolicyState.js';
import { pendingImprovePolicySource, IMPROVE_TARGET_METRICS, improveTargetInput, parseImproveTarget,
  editImproveTarget, improveRollControl, canonicalImproveSubstats } from '../../assets/improvePolicyPresentation.js';
import { ECHO_CATEGORIES, echoCardPresentation, editEchoCard } from './echo-policy-presentation.mjs';
import { recommendedCharacterStatsPresentation } from './character-target-presentation.js';

const root = document.getElementById('improveSettings');
let store, storageError = null;
try { store = loadImprovePolicyStorage(localStorage); } catch { storageError = 'Saved policy could not be read. Recovery data has been retained.'; }
let inventory = store?.resourceInventory ?? emptyResourceInventory();
let characterId = null, source, sources = [], legacySources = [], loaded = false, expanded = false, settings = null, resolved = null;
let settingsOpener = 'target';
let selectedMetric = null, canonicalStats = [...canonicalImproveSubstats];
const groups = new Map();
const element = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
const heading = element('div', undefined, 'improve-settings-heading');
const title = element('h2', 'Improve Settings'); title.id = 'improveSettingsTitle';
const modes = element('div', undefined, 'improve-setting-chips'); modes.setAttribute('role', 'group'); modes.setAttribute('aria-label', 'Improve policy mode');
heading.append(title, modes);
const controls = element('div', undefined, 'improve-settings-controls');
const saveNote = element('p', undefined, 'improve-setting-note'); saveNote.setAttribute('role', 'status'); saveNote.hidden = true;
const reviewNote = element('p', undefined, 'improve-setting-note improve-policy-review'); reviewNote.setAttribute('role', 'status'); reviewNote.hidden = true;
const resources = element('div', undefined, 'improve-resources'); resources.setAttribute('role', 'group'); resources.setAttribute('aria-label', 'Resources');
const resourceSeparator = element('hr', undefined, 'improve-resources-separator');
root.append(heading, resources, resourceSeparator, reviewNote, controls, saveNote);
function renderResources() {
  resources.classList.toggle('is-expanded', expanded);
  resources.replaceChildren(element('h3', 'Resources', 'improve-resources-title'));
  const resourceControls = element('div', undefined, 'improve-resource-controls');
  resources.append(resourceControls);
  function field(parent, id, label, accessibleName, quantity) {
    const owner = element('label', undefined, 'improve-resource'); owner.dataset.resource = id;
    owner.title = accessibleName;
    const caption = element('span', label, 'improve-resource-label');
    owner.append(caption);
    if (id !== 'echoes') {
      const icon = element('img', undefined, 'improve-resource-icon');
      icon.src = new URL('./resource-icons/' + id + '.png', import.meta.url).href;
      icon.alt = ''; icon.setAttribute('aria-hidden', 'true'); icon.width = 52; icon.height = 52;
      owner.append(icon);
    } else owner.append(element('span', undefined, 'improve-resource-icon-space'));
    const summary = element('span', formatInventoryQuantity(quantity), 'improve-resource-value'); summary.hidden = expanded;
    const input = element('input'); input.type = 'text'; input.value = formatInventoryQuantity(quantity); input.hidden = !expanded;
    input.setAttribute('aria-label', accessibleName + ' available count'); input.title = accessibleName + ' · whole count or ∞ (unlimited)';
    input.disabled = !!storageError || !store; input.autocomplete = 'off'; input.spellcheck = false;
    input.oninput = () => { input.setCustomValidity(''); input.removeAttribute('aria-invalid'); };
    input.onchange = () => {
      try {
        const next = updateResourceInventory(inventory, id, parseInventoryQuantity(input.value));
        const nextStore = persistResourceInventory(store, next, localStorage);
        store = nextStore; inventory = next; input.value = formatInventoryQuantity(quantityAt(id)); summary.textContent = input.value;
        input.setCustomValidity(''); input.removeAttribute('aria-invalid'); saveNote.hidden = true;
      } catch (error) { input.setAttribute('aria-invalid', 'true'); input.setCustomValidity(error.message); input.reportValidity(); }
    };
    input.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); input.blur(); } };
    owner.append(summary, input); parent.append(owner);
  }
  for (const [id, label, accessibleName] of [['echoes', 'Echoes', 'Echoes'], ['tuners', 'Tuners', 'Premium Tuner']]) {
    const family = element('div', undefined, 'improve-resource-family');
    family.append(element('h4', label));
    field(family, id, label, accessibleName, inventory[id]);
    resourceControls.append(family);
  }
  const tubes = element('div', undefined, 'improve-resource-family improve-resource-tubes'); tubes.setAttribute('role', 'group'); tubes.setAttribute('aria-label', 'Tubes');
  tubes.append(element('h4', 'Tubes'));
  const denominations = element('div', undefined, 'improve-resource-denominations');
  for (const tube of ECHO_TUBES) field(denominations, tube.id, tube.color, tube.name, inventory.tubes[tube.id]);
  tubes.append(denominations); resourceControls.append(tubes);
}
function quantityAt(id) { return id === 'echoes' || id === 'tuners' ? inventory[id] : inventory.tubes[id]; }
const note = text => element('p', text, 'improve-setting-note');
function button(label, callback, key, selected) {
  const node = element('button', label, 'improve-setting-choice'); node.type = 'button'; node.dataset.focusKey = key;
  if (selected !== undefined) node.setAttribute('aria-pressed', String(selected));
  node.onclick = callback; return node;
}
function save() {
  if (!store || storageError) { saveNote.textContent = storageError; saveNote.hidden = false; return false; }
  try { store = persistImprovePolicyState(store, settings, localStorage); saveNote.hidden = true; return true; }
  catch { saveNote.textContent = 'Settings could not be saved on this device.'; saveNote.hidden = false; return false; }
}
function commit(change, focusKey, refresh = true) {
  const previous = settings;
  try { settings = typeof change === 'function' ? change(settings) : updateImprovePolicyState(settings, change, source); }
  catch (error) { saveNote.textContent = error.message; saveNote.hidden = false; return; }
  if (!save()) settings = previous;
  if (!refresh) { resolved = resolveImprovePolicyState(settings, source); return; }
  render();
  const target = [...root.querySelectorAll('[data-focus-key]')].find(node => node.dataset.focusKey === focusKey && !node.disabled);
  (target ?? groups.get(settingsOpener).trigger).focus({ preventScroll: true });
}
function setExpanded(next, restore = false) {
  expanded = !!next;
  renderResources();
  for (const group of groups.values()) {
    const open = expanded; group.host.classList.toggle('is-expanded', open);
    group.trigger.setAttribute('aria-expanded', String(open)); group.panel.inert = !open; group.panel.setAttribute('aria-hidden', String(!open));
  }
  if (restore) groups.get(settingsOpener).trigger.focus({ preventScroll: true });
}
for (const [id, label] of [['target', 'Target'], ['gate', 'Gate'], ['every', 'Hard Requirements'], ['flex', 'Any Of'], ['other', 'Not Important']]) {
  const host = element('section', undefined, 'improve-setting'); host.dataset.setting = id;
  const trigger = element('button', undefined, 'improve-setting-trigger'); trigger.type = 'button'; trigger.id = 'improve-setting-' + id;
  const labelNode = element('label', label, 'improve-setting-label'); labelNode.htmlFor = trigger.id; labelNode.id = trigger.id + '-label';
  const summary = element('strong', undefined, 'improve-setting-summary');
  const caret = element('span', '⌄', 'improve-setting-caret'); caret.setAttribute('aria-hidden', 'true'); trigger.append(summary, caret);
  const panel = element('div', undefined, 'improve-setting-expansion'); panel.id = trigger.id + '-choices'; panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', labelNode.id);
  trigger.setAttribute('aria-label', label); trigger.setAttribute('aria-controls', 'improve-setting-target-choices improve-setting-gate-choices improve-setting-every-choices improve-setting-flex-choices improve-setting-other-choices');
  trigger.onclick = () => { settingsOpener = id; setExpanded(!expanded); };
  const clip = element('div', undefined, 'improve-setting-clip'), content = element('div', undefined, 'improve-setting-options');
  clip.append(content); panel.append(clip); host.append(labelNode, trigger, panel); controls.append(host); groups.set(id, { host, trigger, summary, panel, content });
}
root.addEventListener('keydown', event => { if (event.key === 'Escape' && expanded) { event.preventDefault(); event.stopPropagation(); setExpanded(false, true); } });
function origin(section, key) {
  if (resolved.compatibility.suspendedSections.includes(key)) return resolved.compatibility.status === 'REVIEW_REQUIRED' ? 'Needs review' : 'Pending';
  if (section.status === 'PENDING') return 'Pending';
  if (section.status === 'USER_DEFINED') return 'Custom';
  return settings.mode === 'MANUAL' ? 'Recommended / inherited' : 'Recommended';
}
function renderTargets() {
  const group = groups.get('target'), policy = resolved.policy.characterTarget.numericTargets;
  group.summary.textContent = policy.status === 'USER_DEFINED' ? 'Custom' : 'Recommended';
  const targets = element('section', undefined, 'improve-policy-section'); targets.dataset.policySection = 'numericTargets';
  targets.append(element('h3', 'Character Stats'));
  group.content.append(targets);
  if (settings.mode === 'MANUAL') {
    // Display saved user-owned rows only; the canonical edit adapter still owns inheritance.
    for (const row of policy.status === 'USER_DEFINED' ? policy.value ?? [] : []) renderTargetEditor(targets, row.metric, row);
    if (policy.status === 'PENDING') targets.append(note(origin(policy, 'numericTargets') === 'Needs review' ? 'Needs review.' : 'Unavailable.'));
    if (Object.hasOwn(settings.overrides, 'numericTargets')) targets.append(button('Use Recommended', () => { selectedMetric = null; commit({ type: 'clear', section: 'numericTargets' }, 'clear:numericTargets'); }, 'clear:numericTargets'));
    const add = element('details', undefined, 'improve-target-add');
    add.append(element('summary', 'Add stat'));
    const metrics = element('div', undefined, 'improve-setting-chips'); metrics.setAttribute('role', 'group'); metrics.setAttribute('aria-label', 'Target metric');
    const defined = new Set((policy.status === 'USER_DEFINED' ? policy.value ?? [] : []).map(row => row.metric));
    for (const spec of IMPROVE_TARGET_METRICS.filter(row => !defined.has(row.metric))) metrics.append(button(spec.label, () => {
      selectedMetric = spec.metric; render(); root.querySelector('[data-editor-metric="' + spec.metric + '"] input').focus({ preventScroll: true });
    }, 'metric:' + spec.metric));
    if (metrics.children.length) { add.append(metrics); targets.append(add); }
    if (selectedMetric && !defined.has(selectedMetric)) renderTargetEditor(targets, selectedMetric);
    return;
  }
  const rows = recommendedCharacterStatsPresentation(characterId);
  if (!rows.length) targets.append(note('Pending'));
  const table = element('dl', undefined, 'improve-recommended-stats');
  for (const row of rows) {
    const ready = row.status === 'READY' && typeof row.displayValue === 'string' && row.displayValue.trim().length > 0;
    const item = element('div', undefined, 'improve-recommended-stat'); item.dataset.metric = row.metric;
    item.dataset.status = ready ? 'READY' : 'PENDING';
    const value = element('dd');
    value.append(element('span', ready ? row.displayValue : 'Pending'));
    item.append(element('dt', row.label), value);
    table.append(item);
  }
  targets.append(table);
}
function renderTargetEditor(parent, metric, existing) {
  const spec = IMPROVE_TARGET_METRICS.find(row => row.metric === metric);
  const editor = element('form', undefined, 'improve-target-editor'); editor.noValidate = true; editor.dataset.editorMetric = metric;
  editor.append(element('h4', spec.label));
  const fields = element('div', undefined, 'improve-target-fields');
  const input = (label, id, value) => {
    const holder = element('label', undefined, 'improve-target-field'); holder.append(element('span', label));
    const control = element('div', undefined, 'improve-target-input');
    const node = element('input'); node.type = 'text'; node.inputMode = 'decimal'; node.id = id; node.autocomplete = 'off'; node.value = value ?? ''; node.setAttribute('aria-label', label + ' ' + spec.label);
    control.append(node); if (spec.unit === 'RATIO') control.append(element('span', '%'));
    holder.append(control); fields.append(holder); return node;
  };
  const min = input('Minimum', 'improve-target-minimum-' + metric, existing ? improveTargetInput(existing, existing.minimum) : '');
  const pref = input('Preferred (optional)', 'improve-target-preferred-' + metric, existing?.preferred !== undefined ? improveTargetInput(existing, existing.preferred) : '');
  editor.append(fields);
  const error = note(''); error.setAttribute('role', 'alert'); error.id = 'improve-target-error-' + metric; error.hidden = true; min.setAttribute('aria-describedby', error.id); pref.setAttribute('aria-describedby', error.id);
  const actions = element('div', undefined, 'improve-setting-chips');
  const save = element('button', 'Save', 'improve-setting-choice'); save.type = 'submit'; save.dataset.focusKey = 'save-target:' + metric;
  save.disabled = resolved.compatibility.context !== 'MATCH' || source.applicability === null || resolved.compatibility.suspendedSections.includes('numericTargets') || !!storageError;
  actions.append(save);
  if (existing) {
    const remove = button('Remove', () => commit(state => editImproveTarget(state, source, metric, null), 'metric:' + metric), 'remove:' + metric);
    remove.disabled = save.disabled; actions.append(remove);
  }
  editor.append(actions, error);
  editor.onsubmit = event => {
    event.preventDefault();
    try { const target = parseImproveTarget(metric, min.value, pref.value); selectedMetric = null; commit(state => editImproveTarget(state, source, metric, target), 'save-target:' + metric); }
    catch (failure) { error.textContent = failure.message; error.hidden = false; min.setAttribute('aria-invalid', 'true'); pref.setAttribute('aria-invalid', 'true'); }
  };
  parent.append(editor);
}
function renderEcho() {
  const view = echoCardPresentation(settings, source, canonicalStats);
  const editable = view.editable && !storageError && loaded;
  const owners = { HARD: 'every', ANY: 'flex', NOT_IMPORTANT: 'other' };
  for (const [category, label] of ECHO_CATEGORIES) {
    const group = groups.get(owners[category]);
    const cards = view.cards.filter(row => row.category === category);
    group.summary.textContent = cards.length + (cards.length === 1 ? ' stat' : ' stats');
    const explanation = category === 'HARD' ? 'All required on each final Echo.' : category === 'ANY' ? 'Distinct alternatives meeting their minimums.' : 'Excluded from this Echo requirement.';
    group.content.append(note(explanation));
    if (category === 'NOT_IMPORTANT' && !view.recommendedReady) group.content.append(note('Recommended Echo requirements unsupported. These editable roll tiers are manual inputs.'));
    if (category === 'NOT_IMPORTANT' && view.needsReview) group.content.append(note('Saved Echo intent needs review. Reset to Recommended first; original settings are retained.'));
    if (category === 'ANY') {
      const countLabel = element('label', undefined, 'improve-any-count');
      const text = element('span', 'At least ' + view.anyOfMinimumCount + ' of ' + view.poolCount);
      const count = element('input', undefined, 'improve-roll-slider'); count.type = 'range'; count.min = '1';
      // Preserve invalid saved choices visibly; new choices are validated by the edit adapter.
      count.max = String(Math.max(1, view.maxCount, view.anyOfMinimumCount)); count.step = '1'; count.value = String(view.anyOfMinimumCount);
      count.disabled = !editable; count.dataset.focusKey = 'any-count'; count.setAttribute('aria-label', 'Any Of minimum distinct stat count');
      count.setAttribute('aria-valuetext', text.textContent); count.style.setProperty('--roll-position', ((view.anyOfMinimumCount - 1) / Math.max(1, Number(count.max) - 1) * 100) + '%');
      count.onchange = () => commit(state => editEchoCard(state, source, canonicalStats, { type: 'count', value: Number(count.value) }), 'any-count');
      countLabel.append(text, count); group.content.append(countLabel);
      for (const message of view.errors) { const error = note(message); error.setAttribute('role', 'alert'); group.content.append(error); }
    }
    for (const card of cards) {
      const item = element('div', undefined, 'improve-echo-row improve-stat-card' + (category !== 'NOT_IMPORTANT' ? ' is-active' : ''));
      item.dataset.statName = card.stat; item.dataset.category = category;
      item.append(element('strong', card.stat, 'improve-card-name'));
      const control = improveRollControl(card.stat, card.minimum);
      const slider = element('input', undefined, 'improve-roll-slider'); slider.type = 'range'; slider.min = '0';
      slider.max = String(control.values.length - 1); slider.step = '1'; slider.value = String(control.index); slider.disabled = !editable;
      slider.dataset.focusKey = 'roll:' + card.stat; slider.setAttribute('aria-label', card.stat + ' minimum roll');
      const value = element('output', control.text, 'improve-roll-value');
      const show = () => { const current = echoCardPresentation(settings, source, canonicalStats).cards.find(row => row.stat === card.stat);
        slider.value = String(improveRollControl(card.stat, current.minimum).index); value.textContent = improveRollControl(card.stat, current.minimum).text; slider.setAttribute('aria-valuetext', value.textContent);
        slider.style.setProperty('--roll-position', (Number(slider.value) / Number(slider.max) * 100) + '%'); };
      slider.oninput = () => { commit(state => editEchoCard(state, source, canonicalStats, { type: 'roll', stat: card.stat, value: Number(slider.value) }), slider.dataset.focusKey, false); show();
        for (const node of modes.children) node.setAttribute('aria-pressed', String(node.dataset.focusKey === 'mode:' + settings.mode)); };
      slider.onchange = () => commit(state => state, slider.dataset.focusKey);
      const move = element('select', undefined, 'improve-card-category'); move.dataset.focusKey = 'category:' + card.stat;
      move.setAttribute('aria-label', 'Category for ' + card.stat); move.disabled = !editable;
      for (const [id, label] of ECHO_CATEGORIES) { const option = element('option', label); option.value = id; move.append(option); }
      move.value = category; move.onchange = () => commit(state => editEchoCard(state, source, canonicalStats, { type: 'category', stat: card.stat, value: move.value }), move.dataset.focusKey);
      item.append(slider, value, move); group.content.append(item); show();
    }
  }
  const other = groups.get('other').content;
  const reset = button('Reset to Recommended', () => commit({ type: 'reset' }, 'reset:echo'), 'reset:echo'); reset.disabled = !!storageError;
  other.append(reset);
  const buildNeed = element('section', undefined, 'improve-policy-section improve-build-need');
  buildNeed.append(element('h3', 'Build Need'), note('Pending')); other.append(buildNeed);
}

function render() {
  renderResources();
  root.dataset.sourceStatus = loaded ? source?.applicability ? 'READY' : 'PENDING' : 'LOADING';
  modes.replaceChildren();
  for (const [value, label] of [['RECOMMENDED', 'Recommended'], ['MANUAL', 'Customize']]) {
    const node = button(label, () => commit({ type: 'mode', value }, 'mode:' + value), 'mode:' + value, settings?.mode === value); node.disabled = !characterId || !!storageError; modes.append(node);
  }
  for (const group of groups.values()) { group.content.replaceChildren(); group.trigger.disabled = !characterId; }
  if (!settings) { for (const group of groups.values()) group.summary.textContent = 'Select Character'; return; }
  resolved = resolveImprovePolicyState(settings, source);
  reviewNote.hidden = resolved.compatibility.status !== 'REVIEW_REQUIRED'; reviewNote.textContent = 'Needs review. Saved overrides are retained. Review the affected sections or choose Recommended to clear them.';
  renderTargets(); renderEcho();
  const gates = groups.get('gate'); gates.summary.textContent = '+' + settings.gate;
  const gateChoices = element('div', undefined, 'improve-setting-list'); for (const value of [5, 10, 15, 20, 25]) { const node = button('+' + value, () => commit({ type: 'gate', value }, 'gate:' + value), 'gate:' + value, value === settings.gate); node.dataset.settingValue = value; gateChoices.append(node); } gates.content.append(gateChoices);
}
function setCharacter(id) {
  if (characterId !== id) { setExpanded(false); selectedMetric = null; }
  characterId = id; source = sources.find(row => row.characterId === id) ?? pendingImprovePolicySource(id ?? '');
  if (!id) { settings = null; resolved = null; render(); return; }
  try { settings = store ? readImprovePolicyState(store, id, source, legacySources.find(row => row.characterId === id)) : createImprovePolicyState(id, source); }
  catch { storageError = 'Saved policy needs review. Recovery data has been retained.'; settings = createImprovePolicyState(id, source); }
  if (loaded) save(); render();
}
window.bellibingResourceInventory = { getState: () => structuredClone(inventory) };
window.bellibingImproveSettings = { setCharacter, getState: () => settings ? publicSettingsView(settings, resolved) : null };
setExpanded(false); render(); window.dispatchEvent(new Event('bellibing-improve-settings-ready'));
Promise.allSettled([fetch(new URL('./improve-settings/policies.json', import.meta.url), { cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Policy unavailable'); return response.json(); }),
  fetch(new URL('./improve-settings/sources.json', import.meta.url), { cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Legacy binding source unavailable'); return response.json(); }),
  fetch(new URL('./echoes/browser-data.json', import.meta.url)).then(response => { if (!response.ok) throw new Error('Echo stats unavailable'); return response.json(); })])
  .then(([policyResult, legacyResult, statsResult]) => {
    canonicalStats = [...canonicalImproveSubstats];
    const policies = policyResult.status === 'fulfilled' ? policyResult.value : null, legacy = legacyResult.status === 'fulfilled' ? legacyResult.value : null;
    sources = policies?.schemaVersion === 1 && Array.isArray(policies.characters) ? policies.characters : [];
    legacySources = legacy?.schemaVersion === 1 && Array.isArray(legacy.characters) ? legacy.characters : [];
    loaded = true; setCharacter(characterId);
  })
  .catch(() => { loaded = true; sources = []; legacySources = []; setCharacter(characterId); });
