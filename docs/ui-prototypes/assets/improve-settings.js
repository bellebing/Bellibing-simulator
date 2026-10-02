import { SIMPLE_GATES, ROLL_QUALITY_PRESETS, normalizeSimpleSettings, updateSimpleSettings,
  loadSimpleSettingsStorage, savedCharacterSettings, persistSimpleSettings } from './improve-settings/state.mjs';

const root = document.getElementById('improveSettings');
const saved = loadSimpleSettingsStorage(localStorage);
let characterId = null, source = null, sources = [], loaded = false, expanded = null;
let settings = normalizeSimpleSettings(null, null);
let drag = null;
const groups = new Map();
const heading = document.createElement('div'); heading.className = 'improve-settings-heading';
const title = document.createElement('h2'); title.id = 'improveSettingsTitle'; title.textContent = 'Improve Settings';
const mode = document.createElement('span'); mode.textContent = 'Simple'; heading.append(title, mode);
const controls = document.createElement('div'); controls.className = 'improve-settings-controls';
const saveNote = document.createElement('p'); saveNote.className = 'improve-setting-note'; saveNote.hidden = true;
root.append(heading, controls, saveNote);

function button(label, action, selected) {
  const node = document.createElement('button'); node.type = 'button'; node.textContent = label;
  node.className = 'improve-setting-choice'; node.dataset.settingValue = String(action.value);
  node.setAttribute('aria-pressed', String(selected));
  node.onclick = () => commit(action, node.dataset.focusKey);
  node.dataset.focusKey = action.type + ':' + (action.value ?? '');
  return node;
}
function save() {
  try { persistSimpleSettings(saved, settings, localStorage); saveNote.hidden = true; }
  catch { saveNote.textContent = 'Settings could not be saved on this device.'; saveNote.hidden = false; }
}
function commit(action, focusKey) {
  settings = updateSimpleSettings(settings, action, source, characterId); save();
  if (['gate', 'quality'].includes(action.type)) {
    setExpanded(null); render(); groups.get(action.type).trigger.focus({ preventScroll: true });
  } else {
    render();
    const target = [...groups.get('valuable').content.querySelectorAll('[data-focus-key]')].find(node => node.dataset.focusKey === focusKey);
    const fallback = [...groups.get('valuable').content.querySelectorAll('[data-focus-key]')].find(node => node.dataset.focusKey === 'stat:' + action.value);
    (target && !target.disabled ? target : fallback ?? groups.get('valuable').trigger).focus({ preventScroll: true });
  }
}
function setExpanded(next, restoreFocus = false) {
  const previous = expanded; expanded = next;
  for (const [id, group] of groups) {
    const open = id === expanded;
    group.host.classList.toggle('is-expanded', open);
    group.trigger.setAttribute('aria-expanded', String(open));
    group.panel.inert = !open;
    group.panel.setAttribute('aria-hidden', String(!open));
  }
  if (restoreFocus && previous) groups.get(previous).trigger.focus({ preventScroll: true });
}
for (const [id, label] of [['gate', 'Gate'], ['valuable', 'Valuable Stats'], ['quality', 'Roll Quality']]) {
  const host = document.createElement('section'); host.className = 'improve-setting'; host.dataset.setting = id;
  const trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'improve-setting-trigger'; trigger.id = 'improve-setting-' + id;
  const name = document.createElement('span'); name.textContent = label;
  const summary = document.createElement('strong'); summary.className = 'improve-setting-summary';
  const caret = document.createElement('span'); caret.className = 'improve-setting-caret'; caret.textContent = '⌄'; caret.setAttribute('aria-hidden', 'true');
  trigger.append(name, summary, caret);
  const panel = document.createElement('div'); panel.className = 'improve-setting-expansion'; panel.id = trigger.id + '-choices'; panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', trigger.id);
  trigger.setAttribute('aria-controls', panel.id); trigger.onclick = () => setExpanded(expanded === id ? null : id);
  const clip = document.createElement('div'); clip.className = 'improve-setting-clip';
  const content = document.createElement('div'); content.className = 'improve-setting-options';
  clip.append(content); panel.append(clip); host.append(trigger, panel); controls.append(host);
  groups.set(id, { host, trigger, summary, panel, content });
}
root.addEventListener('keydown', event => { if (event.key === 'Escape' && expanded) { event.preventDefault(); event.stopPropagation(); setExpanded(null, true); } });
function note(text) { const node = document.createElement('p'); node.className = 'improve-setting-note'; node.textContent = text; return node; }
function choices(label) { const node = document.createElement('div'); node.className = 'improve-setting-chips'; node.setAttribute('role', 'group'); node.setAttribute('aria-label', label); return node; }
function render() {
  root.dataset.sourceStatus = loaded ? source?.status ?? 'PENDING' : 'LOADING';
  root.dataset.rollQualityMapping = settings.rollQualityMappingStatus;
  for (const group of groups.values()) { group.content.replaceChildren(); group.trigger.disabled = !characterId; }
  const gate = groups.get('gate'); gate.summary.textContent = '+' + settings.gate;
  const gates = choices('Gate'); SIMPLE_GATES.forEach(value => gates.append(button('+' + value, { type: 'gate', value }, value === settings.gate))); gate.content.append(gates);
  const quality = groups.get('quality'); quality.summary.textContent = settings.rollQuality;
  const presets = choices('Minimum Roll Quality'); ROLL_QUALITY_PRESETS.forEach(value => presets.append(button(value, { type: 'quality', value }, value === settings.rollQuality)));
  quality.content.append(presets, note('Threshold mapping pending.'));
  const valuable = groups.get('valuable'), config = settings.valuableStats;
  valuable.summary.textContent = !loaded ? 'Loading…' : config.status === 'PENDING' ? 'Pending' : config.activeStats.length + ' of ' + source.stats.length + ' selected';
  if (config.status === 'PENDING') { valuable.content.append(note(loaded ? 'Valuable stats pending for this Character.' : 'Loading Character profile…')); return; }
  const modes = choices('Valuable Stats ordering mode');
  for (const [value, label] of [['RECOMMENDED', 'Recommended'], ['MANUAL', 'Manual']]) modes.append(button(label, { type: 'mode', value }, config.orderingMode === value));
  valuable.content.append(modes, note('Recommended ranking pending. Available uses source order.'));
  for (const [label, names] of [['Active', config.activeStats], ['Available', config.availableStats]]) {
    const section = document.createElement('section'); section.className = 'improve-valuable-section';
    const heading = document.createElement('h3'); heading.textContent = label;
    const list = document.createElement('div'); list.className = 'improve-valuable-list'; list.setAttribute('role', 'list'); list.setAttribute('aria-label', label + ' valuable stats');
    names.forEach((name, index) => {
      const row = document.createElement('div'); row.className = 'improve-valuable-row'; row.dataset.statName = name; row.setAttribute('role', 'listitem');
      const select = button(name, { type: 'stat', value: name }, label === 'Active');
      select.setAttribute('aria-label', (label === 'Active' ? 'Deactivate ' : 'Activate ') + name);
      const stat = source.stats.find(stat => stat.name === name); if (stat.note) select.title = stat.note;
      if (label === 'Active') {
        const handle = document.createElement('span'); handle.className = 'improve-valuable-handle'; handle.textContent = '⠿'; handle.setAttribute('aria-hidden', 'true'); row.append(handle);
        row.draggable = config.orderingMode === 'MANUAL';
        row.addEventListener('dragstart', event => {
          drag = { characterId, name }; event.dataTransfer.setData('text/plain', name); event.dataTransfer.effectAllowed = 'move'; row.classList.add('is-dragging');
        });
        row.addEventListener('dragend', () => { drag = null; row.classList.remove('is-dragging'); });
        row.addEventListener('dragover', event => { if (drag?.characterId === characterId) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } });
        row.addEventListener('drop', event => {
          if (drag?.characterId !== characterId) return;
          event.preventDefault(); const name = drag.name; drag = null;
          commit({ type: 'reorder', value: name, to: index }, 'stat:' + name);
        });
      }
      row.append(select);
      if (label === 'Active') for (const [offset, text] of [[-1, '↑'], [1, '↓']]) {
        const move = button(text, { type: 'reorder', value: name, to: index + offset }, false);
        move.removeAttribute('aria-pressed'); move.setAttribute('aria-label', 'Move ' + name + (offset < 0 ? ' up' : ' down'));
        move.dataset.focusKey = 'reorder:' + name + ':' + offset;
        move.disabled = config.orderingMode !== 'MANUAL' || index + offset < 0 || index + offset >= names.length;
        row.append(move);
      }
      list.append(row);
    });
    section.append(heading, list); if (!names.length) section.append(note(label === 'Active' ? 'No active stats.' : 'All available stats are active.'));
    valuable.content.append(section);
  }
  const reset = button('Reset to Recommended', { type: 'reset' }, false); reset.removeAttribute('aria-pressed');
  valuable.content.append(reset, note(source.profileName));
}

function setCharacter(id) {
  if (characterId !== id) { setExpanded(null); drag = null; }
  characterId = id; source = sources.find(row => row.characterId === id) ?? null;
  settings = normalizeSimpleSettings(savedCharacterSettings(saved, id), source, id);
  if (id && loaded) save(); render();
}
// Detached snapshots are the future consumer boundary; no equipment or evaluator coupling.
window.bellibingImproveSettings = { setCharacter, getState: () => structuredClone(settings) };
setExpanded(null); render(); window.dispatchEvent(new Event('bellibing-improve-settings-ready'));
fetch(new URL('./improve-settings/sources.json', import.meta.url), { cache: 'no-store' })
  .then(response => { if (!response.ok) throw new Error('Improve profile source unavailable'); return response.json(); })
  .then(data => {
    if (data.schemaVersion !== 1 || !Array.isArray(data.characters) || !Number.isInteger(data.maxSubstats)) throw new Error('Unsupported Improve profile source');
    sources = data.characters; loaded = true; setCharacter(characterId);
  }).catch(() => { sources = []; loaded = true; setCharacter(characterId); });
