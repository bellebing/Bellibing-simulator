import { createImprovePolicyState, loadImprovePolicyStorage, readImprovePolicyState, resolveImprovePolicyState,
  updateImprovePolicyState, persistImprovePolicyState } from '../../assets/improvePolicyState.js';
import { pendingImprovePolicySource, IMPROVE_TARGET_METRICS, improveHumanNumber, improveTargetInput, parseImproveTarget,
  improveRelevantStats, editImproveTarget, assignImproveEchoStat, reorderImprovePreferences } from '../../assets/improvePolicyPresentation.js';
import { recommendedCharacterStatsPresentation } from './character-target-presentation.js';

const root = document.getElementById('improveSettings');
let store, storageError = null;
try { store = loadImprovePolicyStorage(localStorage); } catch { storageError = 'Saved policy could not be read. Recovery data has been retained.'; }
let characterId = null, source, sources = [], legacySources = [], loaded = false, expanded = false, settings = null, resolved = null;
let settingsOpener = 'target';
let drag = null, selectedMetric = null;
const groups = new Map();
const element = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
const heading = element('div', undefined, 'improve-settings-heading');
const title = element('h2', 'Improve Settings'); title.id = 'improveSettingsTitle';
const modes = element('div', undefined, 'improve-setting-chips'); modes.setAttribute('role', 'group'); modes.setAttribute('aria-label', 'Improve policy mode');
heading.append(title, modes);
const controls = element('div', undefined, 'improve-settings-controls');
const saveNote = element('p', undefined, 'improve-setting-note'); saveNote.setAttribute('role', 'status'); saveNote.hidden = true;
const reviewNote = element('p', undefined, 'improve-setting-note improve-policy-review'); reviewNote.setAttribute('role', 'status'); reviewNote.hidden = true;
root.append(heading, reviewNote, controls, saveNote);
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
function commit(change, focusKey) {
  try { settings = typeof change === 'function' ? change(settings) : updateImprovePolicyState(settings, change, source); }
  catch (error) { saveNote.textContent = error.message; saveNote.hidden = false; return; }
  save(); render();
  const target = [...root.querySelectorAll('[data-focus-key]')].find(node => node.dataset.focusKey === focusKey && !node.disabled);
  (target ?? groups.get(settingsOpener).trigger).focus({ preventScroll: true });
}
function setExpanded(next, restore = false) {
  expanded = !!next;
  for (const group of groups.values()) {
    const open = expanded; group.host.classList.toggle('is-expanded', open);
    group.trigger.setAttribute('aria-expanded', String(open)); group.panel.inert = !open; group.panel.setAttribute('aria-hidden', String(!open));
  }
  if (restore) groups.get(settingsOpener).trigger.focus({ preventScroll: true });
}
for (const [id, label] of [['target', 'Character Target'], ['gate', 'Gate'], ['echo', 'Echo Policy'], ['quality', 'Roll Quality']]) {
  const host = element('section', undefined, 'improve-setting'); host.dataset.setting = id;
  const trigger = element('button', undefined, 'improve-setting-trigger'); trigger.type = 'button'; trigger.id = 'improve-setting-' + id;
  const labelNode = element('label', label, 'improve-setting-label'); labelNode.htmlFor = trigger.id; labelNode.id = trigger.id + '-label';
  const summary = element('strong', undefined, 'improve-setting-summary');
  const caret = element('span', '⌄', 'improve-setting-caret'); caret.setAttribute('aria-hidden', 'true'); trigger.append(summary, caret);
  const panel = element('div', undefined, 'improve-setting-expansion'); panel.id = trigger.id + '-choices'; panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', labelNode.id);
  trigger.setAttribute('aria-label', label); trigger.setAttribute('aria-controls', 'improve-setting-target-choices improve-setting-gate-choices improve-setting-echo-choices improve-setting-quality-choices');
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
function section(label, policy, key, parent) {
  const node = element('section', undefined, 'improve-policy-section'); node.dataset.policySection = key;
  const h = element('div', undefined, 'improve-policy-section-heading'); h.append(element('h3', label), element('span', origin(policy, key), 'improve-policy-origin'));
  if (settings.mode === 'MANUAL' && (Object.hasOwn(settings.overrides, key) || key === 'echoPreferences' && settings.migration)) {
    h.append(button('Use Recommended', () => commit({ type: 'clear', section: key }, 'clear:' + key), 'clear:' + key));
  }
  node.append(h); parent.append(node); return node;
}
function empty(sectionNode, policy, label) {
  if (policy.status === 'PENDING') sectionNode.append(note(origin(policy, sectionNode.dataset.policySection) === 'Needs review' ? 'Needs review. Saved intent is retained; use Recommended to clear this override.' : label));
  else if (policy.content === 'EXPLICITLY_EMPTY') sectionNode.append(note('Explicitly empty policy.'));
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
    item.append(element('dt', row.label), element('dd', ready ? row.displayValue : 'Pending'));
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
const threshold = row => row.minimum === undefined ? 'No per-roll minimum' : '≥ ' + improveHumanNumber(row.minimum * (row.stat.startsWith('Flat ') ? 1 : 100)) + (row.stat.startsWith('Flat ') ? ' points' : '%');
function renderEcho() {
  const group = groups.get('echo'), policy = resolved.policy.echoPolicy, req = policy.requirements, pref = policy.preferences;
  group.summary.textContent = req.status === 'USER_DEFINED' || pref.status === 'USER_DEFINED' ? 'Custom' : 'Recommended';
  const editable = settings.mode === 'MANUAL' && source.applicability && resolved.compatibility.context === 'MATCH' && !storageError;
  const required = section('Required on Every Echo', req, 'echoRequirements', group.content);
  empty(required, req, 'Requirements for a finished candidate Echo are Pending source verification.');
  if (req.value && !req.value.requiredOnEveryEcho.length) required.append(note('No individually required stats.'));
  for (const row of req.value?.requiredOnEveryEcho ?? []) {
    const item = element('div', undefined, 'improve-policy-stat'); item.dataset.statName = row.stat; item.append(element('strong', row.stat), element('span', threshold(row)));
    if (editable) item.append(button('Remove', () => commit(state => assignImproveEchoStat(state, source, row.stat, 'AVAILABLE'), 'prefer:' + row.stat), 'remove-required:' + row.stat)); required.append(item);
  }
  const combinations = element('section', undefined, 'improve-policy-section'); combinations.dataset.policySection = 'combinations'; combinations.append(element('h3', 'Required combinations'));
  if (!req.value) combinations.append(note('Required combinations Pending.'));
  else if (!req.value.groups.length) combinations.append(note('No required combinations in this policy.'));
  for (const combo of req.value?.groups ?? []) {
    const item = element('div', undefined, 'improve-policy-combination'); item.dataset.groupId = combo.id; item.append(element('h4', 'At least ' + combo.minimumHits + ' of:'));
    for (const row of combo.members) { const member = element('div', undefined, 'improve-policy-stat'); member.append(element('strong', row.stat), element('span', threshold(row))); item.append(member); }
    combinations.append(item);
  }
  if (settings.mode === 'MANUAL') combinations.append(note('Existing combinations are preserved. Group construction/editing is not available in this slice.'));
  if (req.value?.acceptanceConstraints) combinations.append(note('Additional acceptance constraint: maximum ' + req.value.acceptanceConstraints.maximumDeadStats + ' dead stats.'));
  group.content.append(combinations);
  const preferences = section('Preferred stats', pref, 'echoPreferences', group.content);
  empty(preferences, pref, 'Recommended Echo preference ordering is Pending. Build priorities are not an Echo preference ranking.');
  const list = element('div', undefined, 'improve-policy-preferences'); list.setAttribute('role', 'list'); list.setAttribute('aria-label', 'Preferred Echo stats');
  for (const [index, row] of (pref.value ?? []).entries()) {
    const item = element('div', undefined, 'improve-policy-stat'); item.dataset.statName = row.stat; item.setAttribute('role', 'listitem');
    item.append(element('span', '⠿', 'improve-policy-handle'), element('strong', row.stat), element('span', 'Group ' + row.priorityGroup));
    if (editable) {
      item.draggable = true;
      item.ondragstart = event => { drag = { characterId, name: row.stat }; event.dataTransfer.setData('text/plain', row.stat); event.dataTransfer.effectAllowed = 'move'; item.classList.add('is-dragging'); };
      item.ondragend = () => { drag = null; item.classList.remove('is-dragging'); };
      item.ondragover = event => { if (drag?.characterId === characterId) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } };
      item.ondrop = event => { if (drag?.characterId !== characterId) return; event.preventDefault(); const name = drag.name; drag = null; commit(state => reorderImprovePreferences(state, source, name, index), 'remove-pref:' + name); };
      for (const [offset, symbol] of [[-1, '↑'], [1, '↓']]) {
        const move = button(symbol, () => commit(state => reorderImprovePreferences(state, source, row.stat, index + offset), 'remove-pref:' + row.stat), 'move:' + row.stat + ':' + offset);
        move.setAttribute('aria-label', 'Move ' + row.stat + (offset < 0 ? ' up' : ' down')); move.disabled = index + offset < 0 || index + offset >= pref.value.length; item.append(move);
      }
      item.append(button('Remove', () => commit(state => assignImproveEchoStat(state, source, row.stat, 'AVAILABLE'), 'prefer:' + row.stat), 'remove-pref:' + row.stat));
    }
    list.append(item);
  }
  preferences.append(list);
  if (settings.mode === 'MANUAL') {
    const available = element('section', undefined, 'improve-policy-section'); available.append(element('h3', 'Available / manual assignment'));
    const pool = improveRelevantStats(source), assigned = new Set([...(settings.overrides.echoRequirements?.requiredOnEveryEcho ?? []).map(row => row.stat), ...(settings.overrides.echoPreferences ?? []).map(row => row.stat)]);
    for (const name of pool.filter(name => !assigned.has(name))) {
      const item = element('div', undefined, 'improve-policy-stat'); item.dataset.availableStat = name; item.append(element('strong', name));
      for (const [destination, text] of [['REQUIRED', 'Require'], ['PREFERRED', 'Prefer']]) {
        const action = button(text, () => commit(state => assignImproveEchoStat(state, source, name, destination), (destination === 'REQUIRED' ? 'remove-required:' : 'remove-pref:') + name), (destination === 'REQUIRED' ? 'require:' : 'prefer:') + name);
        action.setAttribute('aria-label', text + ' ' + name); action.disabled = !editable || resolved.compatibility.suspendedSections.some(key => ['echoRequirements', 'echoPreferences'].includes(key)); item.append(action);
      }
      available.append(item);
    }
    if (!pool.length) available.append(note('Relevant stat pool Pending reviewed source data.'));
    available.append(note('Assignments are explicit user intent. New requirements have no inferred per-roll minimum.')); group.content.append(available);
  }
}
function render() {
  root.dataset.sourceStatus = loaded ? source?.applicability ? 'READY' : 'PENDING' : 'LOADING'; root.dataset.rollQualityMapping = 'PENDING';
  modes.replaceChildren();
  for (const [value, label] of [['RECOMMENDED', 'Recommended'], ['MANUAL', 'Manual']]) {
    const node = button(label, () => commit({ type: 'mode', value }, 'mode:' + value), 'mode:' + value, settings?.mode === value); node.disabled = !characterId || !!storageError; modes.append(node);
  }
  for (const group of groups.values()) { group.content.replaceChildren(); group.trigger.disabled = !characterId; }
  if (!settings) { for (const group of groups.values()) group.summary.textContent = 'Select Character'; return; }
  resolved = resolveImprovePolicyState(settings, source);
  reviewNote.hidden = resolved.compatibility.status !== 'REVIEW_REQUIRED'; reviewNote.textContent = 'Needs review. Saved overrides are retained. Review the affected sections or choose Recommended to clear them.';
  renderTargets(); renderEcho();
  const gates = groups.get('gate'); gates.summary.textContent = '+' + settings.gate;
  const gateChoices = element('div', undefined, 'improve-setting-list'); for (const value of [5, 10, 15, 20, 25]) { const node = button('+' + value, () => commit({ type: 'gate', value }, 'gate:' + value), 'gate:' + value, value === settings.gate); node.dataset.settingValue = value; gateChoices.append(node); } gates.content.append(gateChoices);
  const quality = groups.get('quality'); quality.summary.textContent = settings.rollQuality;
  const choices = element('div', undefined, 'improve-setting-list'); for (const value of ['All Rolls', 'Mid+', 'High+']) { const node = button(value, () => commit({ type: 'quality', value }, 'quality:' + value), 'quality:' + value, value === settings.rollQuality); node.dataset.settingValue = value; choices.append(node); } quality.content.append(choices, note('Threshold mapping Pending.'));
}
function setCharacter(id) {
  if (characterId !== id) { setExpanded(false); drag = null; selectedMetric = null; }
  characterId = id; source = sources.find(row => row.characterId === id) ?? pendingImprovePolicySource(id ?? '');
  if (!id) { settings = null; resolved = null; render(); return; }
  try { settings = store ? readImprovePolicyState(store, id, source, legacySources.find(row => row.characterId === id)) : createImprovePolicyState(id, source); }
  catch { storageError = 'Saved policy needs review. Recovery data has been retained.'; settings = createImprovePolicyState(id, source); }
  if (loaded) save(); render();
}
window.bellibingImproveSettings = { setCharacter, getState: () => settings ? structuredClone({ ...settings, effectivePolicy: resolved.policy,
  compatibility: resolved.compatibility, rollQualityMappingStatus: 'PENDING' }) : null };
setExpanded(false); render(); window.dispatchEvent(new Event('bellibing-improve-settings-ready'));
Promise.allSettled([fetch(new URL('./improve-settings/policies.json', import.meta.url), { cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Policy unavailable'); return response.json(); }),
  fetch(new URL('./improve-settings/sources.json', import.meta.url), { cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Legacy binding source unavailable'); return response.json(); })])
  .then(([policyResult, legacyResult]) => {
    const policies = policyResult.status === 'fulfilled' ? policyResult.value : null, legacy = legacyResult.status === 'fulfilled' ? legacyResult.value : null;
    sources = policies?.schemaVersion === 1 && Array.isArray(policies.characters) ? policies.characters : [];
    legacySources = legacy?.schemaVersion === 1 && Array.isArray(legacy.characters) ? legacy.characters : [];
    loaded = true; setCharacter(characterId);
  })
  .catch(() => { loaded = true; sources = []; legacySources = []; setCharacter(characterId); });
