import { SUBSTAT_TYPES } from '../../assets/echoCoreRules.js';
import { ECHO_TUBES, emptyResourceInventory, parseInventoryQuantity, formatInventoryQuantity, updateResourceInventory } from '../../assets/resourceInventory.js';
import { publicSettingsView } from '../../assets/publicSettingsView.js';
import { createImprovePolicyState, loadImprovePolicyStorage, readImprovePolicyState, resolveImprovePolicyState,
  updateImprovePolicyState, persistImprovePolicyState, persistResourceInventory,
  withExclusiveImprovePolicyStorage, IMPROVE_POLICY_STORAGE_KEY } from '../../assets/improvePolicyState.js';
import { pendingImprovePolicySource, IMPROVE_TARGET_METRICS, improveTargetInput, parseImproveTarget,
  editImproveTarget } from '../../assets/improvePolicyPresentation.js';
import { echoPolicyPresentation, moveEchoStat, resetEchoPolicy, echoRollControl, editEchoRollMinimum, editFlexCount, echoSelectionSummary } from './echo-policy-presentation.mjs';
import { readSonataChoices, sonataChoicesPresentation, toggleSonataSelection } from './improve-sonata-presentation.mjs';
import { recommendedCharacterStatsPresentation } from './character-target-presentation.js';

const root = document.getElementById('improveSettings');
let store, storageError = null, retiredEchoRecovery = false;
let writerQueue = Promise.resolve();
function coordinatedWrite(action) {
  const pending = writerQueue.then(() => withExclusiveImprovePolicyStorage(action));
  writerQueue = pending.then(() => {}, () => {});
  return pending;
}
try { store = loadImprovePolicyStorage(localStorage); } catch { storageError = 'Saved policy could not be read. Recovery data has been retained.'; }
let inventory = store?.resourceInventory ?? emptyResourceInventory();
let characterId = null, source, sources = [], legacySources = [], loaded = false, expanded = false, settings = null, resolved = null;
let settingsOpener = 'target';
let drag = null, otherExpanded = false, moreSetsExpanded = false, sonataChoices = { catalog: [], recommendations: {} }, canonicalStats = [...SUBSTAT_TYPES];
const groups = new Map();
const element = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
const heading = element('div', undefined, 'improve-settings-heading');
const title = element('h2', 'Improve Settings'); title.id = 'improveSettingsTitle';
heading.append(title);
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
    if (id === 'tuners' || ECHO_TUBES.some(tube => tube.id === id)) {
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
    input.onchange = async () => {
      try {
        const value = parseInventoryQuantity(input.value);
        await coordinatedWrite(() => {
          const next = updateResourceInventory(inventory, id, value);
          store = persistResourceInventory(store, next, localStorage);
          inventory = store.resourceInventory;
        });
        input.value = formatInventoryQuantity(quantityAt(id)); summary.textContent = input.value;
        input.setCustomValidity(''); input.removeAttribute('aria-invalid'); saveNote.hidden = true;
      } catch (error) { input.setAttribute('aria-invalid', 'true'); input.setCustomValidity(error.message); input.reportValidity(); }
    };
    input.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); input.blur(); } };
    owner.append(summary, input); parent.append(owner);
  }
  for (const [id, label, accessibleName] of [['echoes', 'Echoes', 'Echoes'], ['tuners', 'Tuners', 'Premium Tuner'], ['shellCredits', 'Shell Credits', 'Shell Credits']]) {
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
function quantityAt(id) { return id === 'echoes' || id === 'tuners' || id === 'shellCredits' ? inventory[id] : inventory.tubes[id]; }
const note = text => element('p', text, 'improve-setting-note');
function button(label, callback, key, selected) {
  const node = element('button', label, 'improve-setting-choice'); node.type = 'button'; node.dataset.focusKey = key;
  if (selected !== undefined) node.setAttribute('aria-pressed', String(selected));
  node.onclick = callback; return node;
}
async function save() {
  if (!store || storageError) { saveNote.textContent = storageError; saveNote.hidden = false; return false; }
  const candidate = settings, selected = characterId;
  try {
    await coordinatedWrite(() => {
      if (characterId !== selected) throw new Error('Character changed before settings save.');
      store = persistImprovePolicyState(store, candidate, localStorage);
    });
    saveNote.hidden = true; return true;
  } catch { saveNote.textContent = 'Settings could not be saved on this device.'; saveNote.hidden = false; return false; }
}
// Recovery is explicit; rejected bytes remain untouched until the existing reset is used.
async function resetRetiredEchoPolicy() {
  const selected = characterId;
  try {
    await coordinatedWrite(() => {
      if (selected !== characterId) throw new Error('Character changed before recovery.');
      const next = updateImprovePolicyState(settings, { type: 'reset' }, source);
      store = persistImprovePolicyState(store, next, localStorage);
      settings = next;
    });
    storageError = null; retiredEchoRecovery = false; saveNote.hidden = true;
    render(); groups.get('flex').trigger.focus({ preventScroll: true });
  } catch { saveNote.textContent = 'Settings could not be saved on this device. Recovery data has been retained.'; saveNote.hidden = false; }
}
async function commit(change, focusKey, refresh = true) {
  const selected = characterId;
  try {
    await coordinatedWrite(() => {
      if (characterId !== selected) throw new Error('Character changed before settings save.');
      const next = typeof change === 'function' ? change(settings) : updateImprovePolicyState(settings, change, source);
      store = persistImprovePolicyState(store, next, localStorage);
      settings = next;
    });
    saveNote.hidden = true;
  } catch (error) { saveNote.textContent = error.message; saveNote.hidden = false; return; }
  if (!refresh) { resolved = resolveImprovePolicyState(settings, source); return; }
  render();
  const target = [...root.querySelectorAll('[data-focus-key]')].find(node => node.dataset.focusKey === focusKey && !node.disabled);
  (target ?? groups.get(settingsOpener).trigger).focus({ preventScroll: true });
}
function setExpanded(next, restore = false) {
  expanded = !!next;
  controls.classList.toggle('is-expanded', expanded);
  renderResources();
  for (const group of groups.values()) {
    const open = expanded; group.host.classList.toggle('is-expanded', open);
    group.trigger.setAttribute('aria-expanded', String(open)); group.panel.inert = !open; group.panel.setAttribute('aria-hidden', String(!open));
  }
  if (restore) groups.get(settingsOpener).trigger.focus({ preventScroll: true });
}
for (const [id, label] of [['sonata', 'Sonata Sets'], ['gate', 'Gate'], ['every', 'Required Substats'], ['flex', 'Flex Substats'], ['target', 'Stats']]) {
  const host = element('section', undefined, 'improve-setting'); host.dataset.setting = id;
  const trigger = element('button', undefined, 'improve-setting-trigger'); trigger.type = 'button'; trigger.id = 'improve-setting-' + id;
  const labelNode = element('label', label, 'improve-setting-label'); labelNode.htmlFor = trigger.id; labelNode.id = trigger.id + '-label';
  const summary = element('strong', undefined, 'improve-setting-summary');
  const caret = element('span', '⌄', 'improve-setting-caret'); caret.setAttribute('aria-hidden', 'true'); trigger.append(summary); if (id !== 'sonata') trigger.append(caret);
  const panel = element('div', undefined, 'improve-setting-expansion'); panel.id = trigger.id + '-choices'; panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', labelNode.id);
  trigger.setAttribute('aria-label', label); trigger.setAttribute('aria-controls', 'improve-setting-sonata-choices improve-setting-target-choices improve-setting-gate-choices improve-setting-every-choices improve-setting-flex-choices');
  trigger.onclick = () => { settingsOpener = id; setExpanded(!expanded); };
  const clip = element('div', undefined, 'improve-setting-clip'), content = element('div', undefined, 'improve-setting-options');
  clip.append(content); panel.append(clip); host.append(labelNode, trigger, panel); controls.append(host); groups.set(id, { host, trigger, summary, panel, content });
}
setExpanded(false);
root.addEventListener('keydown', event => { if (event.key === 'Escape' && expanded) { event.preventDefault(); event.stopPropagation(); setExpanded(false, true); } });
function origin(section, key) {
  if (resolved.compatibility.suspendedSections.includes(key)) return resolved.compatibility.status === 'REVIEW_REQUIRED' ? 'Needs review' : 'Pending';
  if (section.status === 'PENDING') return 'Pending';
  if (section.status === 'USER_DEFINED') return 'Custom';
  return settings.mode === 'MANUAL' ? 'Recommended / inherited' : 'Recommended';
}
function updateSonataOverlap() {
  const summary = groups.get('sonata').summary, count = summary.children.length;
  summary.style.setProperty('--sonata-step', Math.min(12, Math.max(0, (summary.clientWidth - 24) / Math.max(1, count - 1))) + 'px');
}
new ResizeObserver(updateSonataOverlap).observe(groups.get('sonata').summary);
function renderSonatas() {
  const group = groups.get('sonata'), view = sonataChoicesPresentation(settings, sonataChoices);
  group.summary.replaceChildren(); group.summary.classList.add('improve-sonata-summary');
  group.trigger.setAttribute('aria-label', 'Sonata Sets' + (view.selected.length ? ': ' + view.selected.map(row => row.name).join(', ') : ''));
  function icon(sonata, accessible = false) {
    const image = element('img'); image.src = new URL(sonata.artPath.replace(/^docs\/ui-prototypes\/assets\//, './'), import.meta.url).href;
    image.alt = accessible ? sonata.name : ''; image.title = sonata.name; image.draggable = false; image.dataset.sonataId = sonata.id;
    return image;
  }
  for (const sonata of view.selected) group.summary.append(icon(sonata, true));
  updateSonataOverlap();
  function row(sonata, parent) {
    const selected = view.selected.some(value => value.id === sonata.id);
    const node = element('button', undefined, 'improve-sonata-row'); node.type = 'button';
    node.dataset.sonataId = sonata.id; node.dataset.focusKey = 'sonata:' + sonata.id;
    node.setAttribute('aria-pressed', String(selected));
    node.disabled = !!storageError || !store;
    node.append(icon(sonata), element('span', sonata.name));
    node.onclick = () => {
      const list = group.content.querySelector('.improve-sonata-list'), scroll = list?.scrollTop ?? 0;
      commit(state => updateImprovePolicyState(state, { type: 'sonatas', value: toggleSonataSelection(state, sonataChoices, sonata.id) }, source), 'sonata:' + sonata.id);
      const currentList = group.content.querySelector('.improve-sonata-list'); if (currentList) currentList.scrollTop = scroll;
    };
    parent.append(node);
  }
  const recommended = element('div', undefined, 'improve-sonata-recommended');
  for (const sonata of view.recommended) row(sonata, recommended);
  group.content.append(recommended);
  const more = element('details', undefined, 'improve-more-sonatas'); more.open = moreSetsExpanded;
  more.append(element('summary', 'More Sets')); more.ontoggle = () => { if (more.isConnected) moreSetsExpanded = more.open; };
  const list = element('div', undefined, 'improve-sonata-list');
  for (const sonata of view.other) row(sonata, list);
  more.append(list); group.content.append(more);
}
function renderTargets() {
  const group = groups.get('target'), policy = resolved.policy.characterTarget.numericTargets;
  group.summary.textContent = policy.status === 'USER_DEFINED' ? 'Custom' : 'Recommended';
  const targets = element('section', undefined, 'improve-policy-section'); targets.dataset.policySection = 'numericTargets';
  targets.append(element('h3', 'Character Stats'));
  group.content.append(targets);
  // Keep source-owned Recommended values separate from user targets and
  // neutral Expected placeholders until an actual calculation exists.
  const rows = recommendedCharacterStatsPresentation(characterId);
  if (!rows.length) targets.append(note('Pending'));
  const table = element('dl', undefined, 'improve-recommended-stats');
  const header = element('div', undefined, 'improve-recommended-header');
  header.append(element('span', ''), element('span', 'Recommended'), element('span', 'Expected'));
  table.append(header);
  for (const row of rows) {
    const ready = row.status === 'READY' && typeof row.displayValue === 'string' && row.displayValue.trim().length > 0;
    const item = element('div', undefined, 'improve-recommended-stat'); item.dataset.metric = row.metric;
    item.dataset.status = ready ? 'READY' : 'PENDING';
    const recommended = element('dd', ready ? row.displayValue : 'Pending', 'improve-recommended-value');
    const expected = element('dd', '—', 'improve-expected-value');
    expected.setAttribute('aria-label', row.label + ' expected: not calculated');
    item.append(element('dt', row.label), recommended, expected);
    table.append(item);
  }
  targets.append(table);
  if (policy.status === 'USER_DEFINED' || policy.origin === 'USER') {
    // Custom editors remain user-owned and never overwrite canonical values.
    for (const row of policy.status === 'USER_DEFINED' ? policy.value ?? [] : []) renderTargetEditor(targets, row.metric, row);
    if (policy.status === 'PENDING') targets.append(note(origin(policy, 'numericTargets') === 'Needs review' ? 'Needs review.' : 'Unavailable.'));
  }
  if (Object.hasOwn(settings.overrides, 'numericTargets')) targets.append(button('Use Recommended', () => { commit({ type: 'clear', section: 'numericTargets' }, 'clear:numericTargets'); }, 'clear:numericTargets'));
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
    try { const target = parseImproveTarget(metric, min.value, pref.value); commit(state => editImproveTarget(state, source, metric, target), 'save-target:' + metric); }
    catch (failure) { error.textContent = failure.message; error.hidden = false; min.setAttribute('aria-invalid', 'true'); pref.setAttribute('aria-invalid', 'true'); }
  };
  parent.append(editor);
}
function renderEcho() {
  const view = echoPolicyPresentation(settings, source, canonicalStats);
  const editable = source.applicability && resolved.compatibility.context === 'MATCH'
    && !storageError && !resolved.compatibility.suspendedSections.some(key => ['echoRequirements', 'echoPreferences'].includes(key));
  for (const [id, names] of [['every', view.layout.every], ['flex', view.layout.flex]]) {
    const group = groups.get(id), text = echoSelectionSummary(names);
    group.summary.textContent = text; group.summary.title = names.join(' · ');
    group.trigger.setAttribute('aria-label', (id === 'every' ? 'Required Substats' : 'Flex Substats') + (text ? ': ' + names.join(', ') : ''));
  }
  const flexSection = element('section', undefined, 'improve-policy-section');

  const countControl = element('label', undefined, 'improve-flex-count');
  const countText = element('output', view.flexCount.message); countText.id = 'improve-flex-count-description';
  const countSlider = element('input', undefined, 'improve-roll-slider'); countSlider.type = 'range';
  countSlider.min = view.flexCount.count === null ? '0' : '1';
  countSlider.max = String(Math.max(1, view.flexCount.maximum)); countSlider.step = '1';
  countSlider.value = String(Math.min(view.flexCount.count ?? 0, Math.max(1, view.flexCount.maximum)));
  countSlider.disabled = !source.applicability || resolved.compatibility.context !== 'MATCH' || !!storageError
    || view.flexCount.maximum === 0 || resolved.compatibility.suspendedSections.some(key => ['echoRequirements', 'echoPreferences'].includes(key));
  countSlider.dataset.focusKey = 'flex-count'; countSlider.setAttribute('aria-label', 'Required distinct Flex Stats');
  countSlider.setAttribute('aria-describedby', countText.id); countSlider.setAttribute('aria-valuetext', view.flexCount.message);
  countSlider.setAttribute('aria-invalid', String(!view.flexCount.valid));
  if (!view.flexCount.valid) countText.setAttribute('role', 'alert');
  countControl.append(countText, countSlider); groups.get('flex').content.append(countControl, flexSection);
  countSlider.oninput = () => {
    if (Number(countSlider.value) === 0) return;
    commit(state => editFlexCount(state, source, canonicalStats, Number(countSlider.value)), 'flex-count', false);
    const current = echoPolicyPresentation(settings, source, canonicalStats).flexCount;
    countText.textContent = current.message; countSlider.setAttribute('aria-valuetext', current.message);
    countSlider.setAttribute('aria-invalid', String(!current.valid));
  };
  countSlider.onchange = () => commit(state => state, 'flex-count');
  // An invalid saved count can lie beyond the feasible range. A deliberate
  // pointer/key selection of the clamped endpoint must still repair that intent.
  const repairCount = () => { if (!echoPolicyPresentation(settings, source, canonicalStats).flexCount.valid && !countSlider.disabled) { countSlider.oninput(); countSlider.onchange(); } };
  countSlider.onpointerup = repairCount;
  countSlider.onkeyup = event => { if (['Home','End','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) repairCount(); };

  const help = element('span', 'Move with Alt + Left or Right between Hard Requirements, Flex Stats and Show other stats; Alt + Up or Down reorders within the section.', 'improve-visually-hidden');
  help.id = 'improve-flex-keyboard-help'; flexSection.append(help);
  function move(name, list, index) {
    if (list === 'other') otherExpanded = true;
    commit(state => moveEchoStat(state, source, canonicalStats, name, list, index), 'handle:' + name);
  }
  function dropTarget(node, list, index) {
    node.ondragenter = node.ondragover = event => { if (drag?.characterId === characterId) { event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'move'; } };
    node.ondrop = event => {
      if (drag?.characterId !== characterId) return;
      event.preventDefault(); event.stopPropagation(); const name = drag.name; drag = null; move(name, list, index);
    };
  }
  function row(parent, name, list) {
    const active = list !== 'other';
    const item = element('div', undefined, 'improve-echo-row' + (active ? ' is-active' : '') + (view.relevant.includes(name) ? ' is-recommended' : ''));
    item.dataset.statName = name; item.dataset.section = list; item.draggable = true;
    const handle = element('button', '≡', 'improve-policy-handle'); handle.type = 'button'; handle.draggable = true; handle.dataset.focusKey = 'handle:' + name;
    handle.setAttribute('aria-label', 'Move ' + name); handle.setAttribute('aria-describedby', 'improve-flex-keyboard-help');
    handle.title = 'Drag to another section; Alt + Arrow keys to move';
    item.ondragstart = event => { drag = { characterId, name }; event.dataTransfer.setData('text/plain', name); event.dataTransfer.effectAllowed = 'move'; item.classList.add('is-dragging'); };
    item.ondragend = () => { drag = null; item.classList.remove('is-dragging'); };
    const index = view.layout[list].indexOf(name);
    dropTarget(item, list, index);
    handle.onkeydown = event => {
      if (!event.altKey || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        const to = index + (event.key === 'ArrowUp' ? -1 : 1);
        if (to >= 0 && to < view.layout[list].length) move(name, list, to);
      } else {
        const sections = ['every', 'flex', 'other'];
        const destination = sections[(sections.indexOf(list) + (event.key === 'ArrowLeft' ? 2 : 1)) % 3];
        move(name, destination);
      }
    };
    const label = element('span', name, 'improve-echo-toggle');
    label.style.boxSizing = 'border-box'; label.style.cursor = 'inherit';
    item.append(handle, label);
    if (active && list !== 'other') {
      const control = echoRollControl(view, source, list, name);
      const slider = element('input', undefined, 'improve-roll-slider'); slider.type = 'range';
      slider.min = '0'; slider.max = String(control.values.length - 1); slider.step = '1';
      slider.value = String(Math.max(0, control.index)); slider.disabled = !editable || control.index < 0;
      slider.dataset.focusKey = 'roll:' + list + ':' + name;
      slider.setAttribute('aria-label', (list === 'every' ? 'Every Echo ' : 'Flex ') + name + ' minimum roll');
      const value = element('output', control.text, 'improve-roll-value');
      const show = () => {
        const text = echoRollControl(echoPolicyPresentation(settings, source, canonicalStats), source, list, name).text;
        value.textContent = text; slider.setAttribute('aria-valuetext', text);
        slider.style.setProperty('--roll-position', (Number(slider.value) / Number(slider.max) * 100) + '%');
      };
      slider.oninput = () => {
        commit(state => editEchoRollMinimum(updateImprovePolicyState(state, { type: 'mode', value: 'MANUAL' }, source), source, canonicalStats, list, name, Number(slider.value)), slider.dataset.focusKey, false);
        show();
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
  every.dataset.echoSection = 'every'; flexSection.dataset.echoSection = 'flex';
  dropTarget(every, 'every'); dropTarget(flexSection, 'flex');
  for (const name of view.layout.every) row(every, name, 'every');
  for (const name of view.layout.flex) row(flexSection, name, 'flex');
  const other = element('details', undefined, 'improve-other-stats'); other.open = otherExpanded;
  other.dataset.echoSection = 'other'; other.append(element('summary', 'Show other stats'));
  other.ontoggle = () => { otherExpanded = other.open; };
  dropTarget(other, 'other');
  for (const name of view.layout.other) row(other, name, 'other');
  groups.get('flex').content.append(other);
  const staleBinding = source.applicability && (resolved.compatibility.context === 'MISMATCH' || settings.contextBinding === null && Object.keys(settings.overrides).length > 0);
  if (retiredEchoRecovery || staleBinding || Object.hasOwn(settings.overrides, 'echoRequirements') || Object.hasOwn(settings.overrides, 'echoPreferences') || settings.migration || settings.echoLayout) {
    groups.get('flex').content.append(button('Reset to Recommended', () => {
      if (retiredEchoRecovery) resetRetiredEchoPolicy();
      else commit(state => staleBinding ? updateImprovePolicyState(state, { type: 'reset' }, source) : resetEchoPolicy(state, source), 'reset:echo');
    }, 'reset:echo'));
  }
}

function render() {
  renderResources();
  root.dataset.sourceStatus = loaded ? source?.applicability ? 'READY' : 'PENDING' : 'LOADING';
  for (const group of groups.values()) { group.content.replaceChildren(); group.trigger.disabled = !characterId; }
  if (!settings) { for (const [id, group] of groups) group.summary.textContent = id === 'sonata' ? '' : 'Select Character'; return; }
  resolved = resolveImprovePolicyState(settings, source);
  reviewNote.hidden = resolved.compatibility.status !== 'REVIEW_REQUIRED'; reviewNote.textContent = 'Needs review. Saved overrides are retained. Review the affected sections or Reset to Recommended to clear them.';
  renderSonatas(); renderTargets(); renderEcho();
  const gates = groups.get('gate'); gates.summary.textContent = '+' + settings.gate;
  const gateChoices = element('div', undefined, 'improve-setting-list'); for (const value of [5, 10, 15, 20, 25]) { const node = button('+' + value, () => commit({ type: 'gate', value }, 'gate:' + value), 'gate:' + value, value === settings.gate); node.dataset.settingValue = value; gateChoices.append(node); } gates.content.append(gateChoices);
}
function setCharacter(id) {
  if (characterId !== id) {
    if (retiredEchoRecovery) { storageError = null; retiredEchoRecovery = false; saveNote.hidden = true; }
    setExpanded(false); drag = null; otherExpanded = false; moreSetsExpanded = false;
  }
  characterId = id; source = sources.find(row => row.characterId === id) ?? pendingImprovePolicySource(id ?? '');
  if (!id) { settings = null; resolved = null; render(); return; }
  try { settings = store ? readImprovePolicyState(store, id, source, legacySources.find(row => row.characterId === id)) : createImprovePolicyState(id, source); }
  catch (error) {
    retiredEchoRecovery = error.message.includes('Retired Echo card');
    storageError = retiredEchoRecovery ? 'Saved Echo card settings need review. Reset to Recommended to explicitly reset them. Recovery data has been retained.'
      : 'Saved policy needs review. Recovery data has been retained.';
    settings = createImprovePolicyState(id, source);
    if (retiredEchoRecovery) {
      settings = updateImprovePolicyState(settings, { type: 'gate', value: store.characters[id].gate }, source);
      settings = updateImprovePolicyState(settings, { type: 'quality', value: store.characters[id].rollQuality }, source);
      if (store.characters[id].selectedSonataSetIds !== undefined) {
        try { settings = updateImprovePolicyState(settings, { type: 'sonatas', value: store.characters[id].selectedSonataSetIds }, source); } catch { /* Retain rejected bytes until explicit recovery. */ }
      }
    }
  }
  if (loaded) save(); render();
}
window.addEventListener('storage', event => {
  if (event.key !== IMPROVE_POLICY_STORAGE_KEY || event.storageArea !== localStorage) return;
  try {
    const live = loadImprovePolicyStorage(localStorage);
    store = live; inventory = live.resourceInventory ?? emptyResourceInventory();
    if (characterId) settings = readImprovePolicyState(live, characterId, source, legacySources.find(row => row.characterId === characterId));
    if (!retiredEchoRecovery) storageError = null;
  } catch { storageError = 'Saved policy needs review. Recovery data has been retained.'; }
  render();
});
window.bellibingResourceInventory = { getState: () => structuredClone(inventory) };
window.bellibingImproveSettings = { setCharacter, getState: () => settings ? publicSettingsView(settings, resolved) : null };
setExpanded(false); render(); window.dispatchEvent(new Event('bellibing-improve-settings-ready'));
Promise.allSettled([fetch(new URL('./improve-settings/policies.json', import.meta.url), { cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Policy unavailable'); return response.json(); }),
  fetch(new URL('./improve-settings/sources.json', import.meta.url), { cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Legacy binding source unavailable'); return response.json(); }),
  fetch(new URL('./echoes/browser-data.json', import.meta.url), { cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Sonata catalog unavailable'); return response.json(); }).then(readSonataChoices)])
  .then(([policyResult, legacyResult, sonataResult]) => {
    const policies = policyResult.status === 'fulfilled' ? policyResult.value : null, legacy = legacyResult.status === 'fulfilled' ? legacyResult.value : null;
    sources = policies?.schemaVersion === 1 && Array.isArray(policies.characters) ? policies.characters : [];
    legacySources = legacy?.schemaVersion === 1 && Array.isArray(legacy.characters) ? legacy.characters : [];
    sonataChoices = sonataResult.status === 'fulfilled' ? sonataResult.value : { catalog: [], recommendations: {} };
    loaded = true; setCharacter(characterId);
  })
  .catch(() => { loaded = true; sources = []; legacySources = []; setCharacter(characterId); });
