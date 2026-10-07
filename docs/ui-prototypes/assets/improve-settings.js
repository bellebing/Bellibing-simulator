import { ECHO_TUBES, emptyResourceInventory, parseInventoryQuantity, formatInventoryQuantity, updateResourceInventory } from '../../assets/resourceInventory.js';
import { publicSettingsView } from '../../assets/publicSettingsView.js';
import { createImprovePolicyState, loadImprovePolicyStorage, readImprovePolicyState, resolveImprovePolicyState,
  updateImprovePolicyState, persistImprovePolicyState, persistResourceInventory } from '../../assets/improvePolicyState.js';
import { pendingImprovePolicySource, IMPROVE_TARGET_METRICS, improveTargetInput, parseImproveTarget,
  editImproveTarget } from '../../assets/improvePolicyPresentation.js';
import { echoPolicyPresentation, editEchoPolicy, reorderFlexStats, resetEchoPolicy, echoRollControl, editEchoRollMinimum } from './echo-policy-presentation.mjs';
import { recommendedCharacterStatsPresentation } from './character-target-presentation.js';

const root = document.getElementById('improveSettings');
let store, storageError = null;
try { store = loadImprovePolicyStorage(localStorage); } catch { storageError = 'Saved policy could not be read. Recovery data has been retained.'; }
let inventory = store?.resourceInventory ?? emptyResourceInventory();
let characterId = null, source, sources = [], legacySources = [], loaded = false, expanded = false, settings = null, resolved = null;
let settingsOpener = 'target';
let drag = null, selectedMetric = null, otherExpanded = false, canonicalStats = [];
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
  resources.replaceChildren(element('strong', 'Resources', 'improve-resources-title'));
  function field(parent, id, label, accessibleName, quantity) {
    const owner = element('label', undefined, 'improve-resource'); owner.dataset.resource = id;
    owner.append(element('span', label));
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
  field(resources, 'echoes', 'Echoes', 'Echoes', inventory.echoes);
  field(resources, 'tuners', 'Tuners', 'Tuners', inventory.tuners);
  const tubes = element('div', undefined, 'improve-resource-tubes'); tubes.setAttribute('role', 'group'); tubes.setAttribute('aria-label', 'Tubes');
  tubes.append(element('span', 'Tubes', 'improve-resource-family'));
  for (const tube of ECHO_TUBES) field(tubes, tube.id, tube.color, tube.name, inventory.tubes[tube.id]);
  resources.append(tubes);
}
function quantityAt(id) { return id === 'echoes' || id === 'tuners' ? inventory[id] : inventory.tubes[id]; }
const note = text => element('p', text, 'improve-setting-note');
function button(label, callback, key, selected) {
  const node = element('button', label, 'improve-setting-choice'); node.type = 'button'; node.dataset.focusKey = key;
  if (selected !== undefined) node.setAttribute('aria-pressed', String(selected));
  node.onclick = callback; return node;
}
function save() {
  if (!store || storageError) { saveNote.textContent = storageError; saveNote.hidden = false; return; }
  try { store = persistImprovePolicyState(store, settings, localStorage); saveNote.hidden = true; }
  catch { saveNote.textContent = 'Settings could not be saved on this device.'; saveNote.hidden = false; }
}
function commit(change, focusKey, refresh = true) {
  try { settings = typeof change === 'function' ? change(settings) : updateImprovePolicyState(settings, change, source); }
  catch (error) { saveNote.textContent = error.message; saveNote.hidden = false; return; }
  save();
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
for (const [id, label] of [['target', 'Character Target'], ['gate', 'Gate'], ['every', 'Every Echo'], ['flex', 'Flex Stats']]) {
  const host = element('section', undefined, 'improve-setting'); host.dataset.setting = id;
  const trigger = element('button', undefined, 'improve-setting-trigger'); trigger.type = 'button'; trigger.id = 'improve-setting-' + id;
  const labelNode = element('label', label, 'improve-setting-label'); labelNode.htmlFor = trigger.id; labelNode.id = trigger.id + '-label';
  const summary = element('strong', undefined, 'improve-setting-summary');
  const caret = element('span', '⌄', 'improve-setting-caret'); caret.setAttribute('aria-hidden', 'true'); trigger.append(summary, caret);
  const panel = element('div', undefined, 'improve-setting-expansion'); panel.id = trigger.id + '-choices'; panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', labelNode.id);
  trigger.setAttribute('aria-label', label); trigger.setAttribute('aria-controls', 'improve-setting-target-choices improve-setting-gate-choices improve-setting-every-choices improve-setting-flex-choices');
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
  targets.append(element('h3', settings.mode === 'MANUAL' ? 'Character Stats' : 'Recommended Character Stats'));
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
  const view = echoPolicyPresentation(settings, source, canonicalStats);
  const editable = settings.mode === 'MANUAL' && source.applicability && resolved.compatibility.context === 'MATCH'
    && !storageError && !resolved.compatibility.suspendedSections.some(key => ['echoRequirements', 'echoPreferences'].includes(key));
  groups.get('every').summary.textContent = Object.hasOwn(settings.overrides, 'echoRequirements') ? 'Custom' : 'Recommended';
  groups.get('flex').summary.textContent = Object.hasOwn(settings.overrides, 'echoPreferences') ? 'Custom' : 'Recommended';
  const buildNeed = element('section', undefined, 'improve-policy-section improve-build-need');
  buildNeed.append(element('h3', 'Build Need'), note('Pending')); groups.get('flex').content.append(buildNeed);
  const flexSection = element('section', undefined, 'improve-policy-section');
  flexSection.append(element('h3', 'Flex Stats')); groups.get('flex').content.append(flexSection);
  function row(parent, name, list) {
    const hard = view.required.includes(name), active = list === 'every' ? hard : view.flex.includes(name);
    const item = element('div', undefined, 'improve-echo-row' + (active ? ' is-active' : '') + (list === 'flex' && hard ? ' is-required' : ''));
    item.dataset.statName = name;
    const toggle = button(name, () => commit(state => editEchoPolicy(state, source, canonicalStats, list, name), list + ':' + name), list + ':' + name, active);
    toggle.className = 'improve-echo-toggle'; toggle.disabled = !editable || list === 'flex' && hard;
    toggle.setAttribute('aria-label', (list === 'every' ? 'Every Echo: ' : 'Flex stat: ') + name + (list === 'flex' && hard ? ', Required' : ''));
    if (list === 'flex' && hard) toggle.append(element('span', 'Required', 'improve-echo-required'));
    if (list === 'flex' && active && editable) {
      const handle = element('span', '≡', 'improve-policy-handle'); handle.setAttribute('aria-hidden', 'true'); item.append(handle);
      const index = view.flex.indexOf(name);
      item.draggable = true;
      item.ondragstart = event => { drag = { characterId, name }; event.dataTransfer.setData('text/plain', name); event.dataTransfer.effectAllowed = 'move'; item.classList.add('is-dragging'); };
      item.ondragend = () => { drag = null; item.classList.remove('is-dragging'); };
      item.ondragover = event => { if (drag?.characterId === characterId) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } };
      item.ondrop = event => { if (drag?.characterId !== characterId) return; event.preventDefault(); const moved = drag.name; drag = null; commit(state => reorderFlexStats(state, source, canonicalStats, moved, index), 'flex:' + moved); };
      toggle.onkeydown = event => {
        if (event.altKey && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
          event.preventDefault(); commit(state => reorderFlexStats(state, source, canonicalStats, name, index + (event.key === 'ArrowUp' ? -1 : 1)), 'flex:' + name);
        }
      };
      toggle.setAttribute('aria-describedby', 'improve-flex-keyboard-help');
      item.append(toggle);
      for (const [offset, symbol] of [[-1, '↑'], [1, '↓']]) {
        const move = button(symbol, () => commit(state => reorderFlexStats(state, source, canonicalStats, name, index + offset), 'move:' + name + ':' + offset), 'move:' + name + ':' + offset);
        move.className = 'improve-flex-move'; move.setAttribute('aria-label', 'Move ' + name + (offset < 0 ? ' up' : ' down'));
        move.disabled = index + offset < 0 || index + offset >= view.flex.length; item.append(move);
      }
    } else item.append(toggle);
    const pendingControl = settings.mode === 'RECOMMENDED' && !active;
    if (active || pendingControl) {
      const control = echoRollControl(view, source, list, name);
      const slider = element('input', undefined, 'improve-roll-slider'); slider.type = 'range';
      slider.min = '0'; slider.max = String(control.values.length - 1); slider.step = '1';
      slider.value = String(Math.max(0, control.index)); slider.disabled = !editable || control.index < 0 || pendingControl;
      if (pendingControl) slider.dataset.status = 'PENDING';
      slider.dataset.focusKey = 'roll:' + list + ':' + name;
      slider.setAttribute('aria-label', (list === 'every' ? 'Every Echo ' : 'Flex ') + name + ' minimum roll');
      const value = element('output', control.text, 'improve-roll-value');
      const show = () => {
        const text = pendingControl ? 'Pending' : echoRollControl(echoPolicyPresentation(settings, source, canonicalStats), source, list, name).text;
        value.textContent = text; slider.setAttribute('aria-valuetext', text);
        slider.style.setProperty('--roll-position', (Number(slider.value) / Number(slider.max) * 100) + '%');
      };
      slider.oninput = () => {
        commit(state => editEchoRollMinimum(state, source, canonicalStats, list, name, Number(slider.value)), slider.dataset.focusKey, false);
        show(); groups.get(list).summary.textContent = 'Custom';
      };
      slider.onchange = () => commit(state => state, slider.dataset.focusKey);
      // Range dragging owns the pointer; row dragging remains available elsewhere.
      if (item.draggable) {
        slider.onpointerdown = () => { item.draggable = false; };
        slider.onpointerup = slider.onblur = () => { item.draggable = true; };
      }
      item.append(slider, value); show();
    }
    parent.append(item);
  }
  const every = groups.get('every').content;
  for (const name of view.relevant) row(every, name, 'every');
  if (!view.relevant.length) every.append(note('Pending'));
  // Recommended uses neutral source order. Customize puts active choices in explicit user order.
  const names = [...view.flex, ...view.relevant.filter(name => !view.flex.includes(name))];
  for (const name of names) row(flexSection, name, 'flex');
  if (!names.length) flexSection.append(note('Pending'));
  const help = element('span', 'Reorder with Alt + Arrow Up or Arrow Down, or the Move up and Move down buttons.', 'improve-visually-hidden');
  help.id = 'improve-flex-keyboard-help'; flexSection.append(help);
  const other = element('details', undefined, 'improve-other-stats'); other.open = otherExpanded;
  other.append(element('summary', 'Show other stats'));
  other.ontoggle = () => { otherExpanded = other.open; };
  // Active other stats already live in the ordered Customize list; keep identities unique.
  for (const name of view.other.filter(name => !names.includes(name))) row(other, name, 'flex');
  groups.get('flex').content.append(other);
  // User-selected other Every Echo stats remain visible without redefining source relevance.
  for (const name of view.required.filter(name => !view.relevant.includes(name))) row(every, name, 'every');
  if (Object.hasOwn(settings.overrides, 'echoRequirements') || Object.hasOwn(settings.overrides, 'echoPreferences') || settings.migration) {
    groups.get('flex').content.append(button('Reset to Recommended', () => commit(state => resetEchoPolicy(state, source), 'reset:echo'), 'reset:echo'));
  }
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
  if (characterId !== id) { setExpanded(false); drag = null; selectedMetric = null; otherExpanded = false; }
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
    canonicalStats = statsResult.status === 'fulfilled' ? statsResult.value.statEditor.substats.map(row => row.name) : [];
    const policies = policyResult.status === 'fulfilled' ? policyResult.value : null, legacy = legacyResult.status === 'fulfilled' ? legacyResult.value : null;
    sources = policies?.schemaVersion === 1 && Array.isArray(policies.characters) ? policies.characters : [];
    legacySources = legacy?.schemaVersion === 1 && Array.isArray(legacy.characters) ? legacy.characters : [];
    loaded = true; setCharacter(characterId);
  })
  .catch(() => { loaded = true; sources = []; legacySources = []; setCharacter(characterId); });
