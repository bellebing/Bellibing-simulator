import { SIMPLE_GATES, ROLL_QUALITY_PRESETS, normalizeSimpleSettings, updateSimpleSettings } from './improve-settings/state.mjs';

const KEY = 'bellibing.improve.simple-settings.v1';
const root = document.getElementById('improveSettings');
let saved = {};
try { const value = JSON.parse(localStorage.getItem(KEY)); if (value?.version === 1 && value.characters && typeof value.characters === 'object') saved = value.characters; } catch {}
let characterId = null, source = null, sources = [], maxSubstats = 0, loaded = false, expanded = null;
let settings = normalizeSimpleSettings(null, null, 0);
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
  node.onclick = () => {
    settings = updateSimpleSettings(settings, action, source, maxSubstats);
    // Unavailable source data must not erase a previously saved configuration.
    // getState() still exposes Pending until that source binding is verified again.
    saved[characterId] = source?.status !== 'READY' && saved[characterId]?.valuableStats
      ? { ...settings, valuableStats: saved[characterId].valuableStats } : settings;
    try { localStorage.setItem(KEY, JSON.stringify({ version: 1, characters: saved })); saveNote.hidden = true; }
    catch { saveNote.textContent = 'Settings could not be saved on this device.'; saveNote.hidden = false; }
    if (action.type === 'stat') {
      render(); groups.get('valuable').content.querySelectorAll('[data-setting-value]').forEach(item => { if (item.dataset.settingValue === action.value) item.focus({ preventScroll: true }); });
    } else { setExpanded(null); render(); groups.get(action.type === 'count' ? 'valuable' : action.type).trigger.focus({ preventScroll: true }); }
  };
  return node;
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
  valuable.summary.textContent = !loaded ? 'Loading…' : config.status === 'PENDING' ? 'Pending' : config.requiredCount === null ? 'Choose' : config.requiredCount + ' of ' + config.selectedStats.length;
  if (config.status === 'PENDING') { valuable.content.append(note(loaded ? 'Valuable stats pending for this Character.' : 'Loading Character profile…')); return; }
  valuable.content.append(note('Choose valuable stats, then how many are required.'));
  const stats = choices('Available valuable stats');
  source.stats.forEach(stat => {
    const chip = button(stat.name, { type: 'stat', value: stat.name }, config.selectedStats.includes(stat.name));
    if (stat.note) chip.title = stat.note; stats.append(chip);
  });
  valuable.content.append(stats, note(config.selectedStats.length + ' of ' + source.stats.length + ' available stats selected'));
  const counts = choices('Valuable Stats Required');
  for (let value = 1; value <= Math.min(maxSubstats, config.selectedStats.length); value++) counts.append(button(String(value), { type: 'count', value }, value === config.requiredCount));
  valuable.content.append(counts);
  if (!config.selectedStats.length) valuable.content.append(note('Select at least one stat.'));
  valuable.content.append(note(source.profileName));
}
function setCharacter(id) {
  if (characterId !== id) setExpanded(null);
  characterId = id; source = sources.find(row => row.characterId === id) ?? null;
  settings = normalizeSimpleSettings(saved[id], source, maxSubstats); render();
}
// Detached snapshots are the future consumer boundary; no equipment or evaluator coupling.
window.bellibingImproveSettings = { setCharacter, getState: () => structuredClone({ characterId, ...settings }) };
setExpanded(null); render(); window.dispatchEvent(new Event('bellibing-improve-settings-ready'));
fetch(new URL('./improve-settings/sources.json', import.meta.url), { cache: 'no-store' })
  .then(response => { if (!response.ok) throw new Error('Improve profile source unavailable'); return response.json(); })
  .then(data => {
    if (data.schemaVersion !== 1 || !Array.isArray(data.characters) || !Number.isInteger(data.maxSubstats)) throw new Error('Unsupported Improve profile source');
    sources = data.characters; maxSubstats = data.maxSubstats; loaded = true; setCharacter(characterId);
  }).catch(() => { sources = []; loaded = true; setCharacter(characterId); });
