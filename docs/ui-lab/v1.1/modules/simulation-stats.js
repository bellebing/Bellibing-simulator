import { mountCharacterCard } from './character-card.js';
import { simulationModel, changedResults } from './simulation-model.js';
import { focusFixture } from './result-fixtures.js';
import { augustaExpected } from './expected-projection.js';
import { assetURL, escapeHtml } from './util.js';

const roles = ['recommended','expected','simulated'];
const title = role => role[0].toUpperCase() + role.slice(1);
export function mountResultsPanel(host, {onReveal = () => {}} = {}) {
  const compact=document.body.classList.contains('compact-review');
  const card = mountCharacterCard(host);
  const control = document.createElement('div');
  control.className = 'result-modes side-content segmented';
  control.setAttribute('role','group'); control.setAttribute('aria-label','Right panel mode');
  control.innerHTML = '<button data-result-mode="character" class="selected" aria-pressed="true">Character Stats</button><button data-result-mode="simulation" aria-pressed="false">Simulation Stats</button>';
  host.before(control);
  const view = document.createElement('div');
  view.className = 'side-content simulation-content'; view.hidden = true;
  view.innerHTML = '<header class="results-heading"><img class="results-art" alt=""><div class="results-identity"><h2></h2></div></header><span class="results-origin"></span><div class="results-key" aria-hidden="true"><span>Stat</span><span>Recommended</span><span>Expected</span><span>Simulated</span></div><div class="result-rows" role="list" aria-label="Recommended, Expected and Simulated Character results"></div><span class="result-announcement carousel-announcement" role="status" aria-live="polite"></span>';
  host.after(view);
  if(compact){control.hidden=true;const disclosure=document.createElement('details');disclosure.className='side-content simulation-disclosure';disclosure.innerHTML='<summary>Simulation Stats <span aria-hidden="true">⌄</span></summary>';view.before(disclosure);disclosure.append(view);view.hidden=false;}
  let mode = 'character', manual = false, revealed = false, person, saved, model;
  let demo = false, expected = {}, fadeTimer, announceTimer, settling = false;
  const animations = new Map();
  function clearFocus() {
    settling = false; clearTimeout(fadeTimer); clearTimeout(announceTimer); view.classList.remove('has-result-focus');
    view.querySelectorAll('.is-affected').forEach(node => node.classList.remove('is-affected'));
    document.querySelectorAll('#settings .is-active-setting').forEach(node => node.classList.remove('is-active-setting'));
  }
  function stopCounters() { animations.forEach(frame => cancelAnimationFrame(frame)); animations.clear(); }
  function setMode(next, explicit = false) {
    if(compact){host.hidden=false;view.hidden=false;document.querySelector('#character').dataset.resultMode='character';return;}
    mode = next; if (explicit) manual = true;
    host.hidden = mode !== 'character'; view.hidden = mode !== 'simulation';
    control.querySelectorAll('button').forEach(button => { const selected = button.dataset.resultMode === mode; button.classList.toggle('selected',selected); button.setAttribute('aria-pressed',selected); });
    document.querySelector('#character').dataset.resultMode = mode;
  }
  control.addEventListener('click',event => { const button = event.target.closest('[data-result-mode]'); if (button) setMode(button.dataset.resultMode,true); });
  control.addEventListener('keydown',event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault(); const next = ['ArrowLeft','Home'].includes(event.key) ? 'character' : 'simulation';
    setMode(next,true); control.querySelector(`[data-result-mode="${next}"]`).focus();
  });
  function renderResults() {
    view.querySelector('h2').textContent = person.name;
    const art = view.querySelector('.results-art');
    art.src = assetURL(person.art);
    art.classList.toggle('portrait-fallback', person.artStatus !== 'HERO');
    view.querySelector('.results-origin').textContent = model.scopeLabel ?? (model.pending ? 'Active-slot projection Pending' : demo ? 'Illustrative focus demo · not a forecast' : saved.hasRecordedRun ? 'Illustrative run record' : 'Awaiting a run');
    view.dataset.demo = String(demo);
    view.querySelector('.result-announcement').textContent = '';
    view.querySelector('.result-rows').innerHTML = model.rows.map(row => `<div class="result-row" role="listitem" data-result-id="${row.id}"><h3>${escapeHtml(row.label)}</h3><div class="result-values">${roles.map(role => `<div class="result-value" data-role="${role}"><span class="result-role">${title(role)}</span><strong class="${row[role] === null ? 'unavailable' : ''}" aria-label="${title(role)} ${escapeHtml(row.label)}: ${escapeHtml(row[role] ?? 'unavailable')}" title="${role === 'recommended' ? row.source ? 'Verified modern DEFAULT Calc reference' : 'No verified modern DEFAULT Calc reference' : role === 'expected' ? model.pending ? 'Pending: active-slot Character projection unavailable' : demo ? 'Illustrative keyframe; not calculated' : row[role] === null ? 'Expected unavailable for this Character or settings' : 'Exact accepted-Echo mean; verified static stats only, excluding Sonata and conditional effects' : model.pending ? 'Pending: active-slot Character projection unavailable' : saved.sandboxBuild?'Source-backed observed static component; conditional effects and full combat totals Pending':saved.hasRecordedRun ? 'Illustrative UI Lab run record' : 'No observed run record'}">${escapeHtml(row[role] ?? '—')}</strong></div>`).join('')}</div></div>`).join('');
  }
  function counter(node, from, to) {
    const prior = animations.get(node); if (prior) cancelAnimationFrame(prior); animations.delete(node);
    const number = text => Number(text?.replace(/[,%]/g,''));
    const a = number(from), b = number(to);
    node.setAttribute('aria-label',node.getAttribute('aria-label').replace(/:.*$/,`: ${to}`));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !from || !Number.isFinite(a) || !Number.isFinite(b)) { node.textContent = to; return; }
    const start = performance.now();
    const frame = now => {
      const t = Math.min(1,(now-start)/160), value = a + (b-a)*(1-(1-t)**3);
      node.textContent = t === 1 ? to : value.toLocaleString('en-US',{minimumFractionDigits:to.includes('.') ? 1 : 0, maximumFractionDigits:to.includes('.') ? 1 : 0}) + (to.endsWith('%') ? '%' : '');
      if (t < 1) animations.set(node,requestAnimationFrame(frame)); else animations.delete(node);
    };
    animations.set(node,requestAnimationFrame(frame));
  }
  function apply(next, affected) {
    const changes = changedResults(model,next,affected);
    clearFocus();
    if (changes.length) view.classList.add('has-result-focus');
    next.rows.forEach(row => roles.forEach(role => {
      const previous = model.rows.find(item => item.id === row.id);
      if (!previous || previous[role] === row[role]) return;
      const rowNode = view.querySelector(`[data-result-id="${row.id}"]`);
      if (!rowNode) return;
      const cell = rowNode.querySelector(`[data-role="${role}"]`), node = cell.querySelector('strong');
      const focused = changes.some(item => item.id === row.id && item.role === role);
      node.classList.toggle('unavailable',row[role] === null);
      if (focused) {
        rowNode.classList.add('is-affected'); cell.classList.add('is-affected');
        counter(node,node.textContent,row[role]);
      } else {
        const frame = animations.get(node); if (frame) cancelAnimationFrame(frame);
        animations.delete(node); node.textContent = row[role] ?? '—';
        node.setAttribute('aria-label',`${title(role)} ${row.label}: ${row[role] ?? 'unavailable'}`);
      }
    }));
    model = next;
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { view.querySelector('.result-announcement').textContent = changes.map(({id,role}) => `${model.rows.find(row => row.id === id).label}, ${role}: ${model.rows.find(row => row.id === id)[role]}`).join('; '); },220);
  }
  return {
    render(nextPerson,nextSaved) {
      clearFocus(); stopCounters();
      if (person?.id !== nextPerson.id) expected = {};
      person = nextPerson; saved = nextSaved; card.render(person,saved);
      expected = saved.sandboxBuild ? {} : demo ? focusFixture(person.id,{kind:'minimum',metric:'TOTAL_CRIT_RATE',tier:saved.minima['CRIT Rate']})?.values ?? {} : augustaExpected(saved)?.values ?? {};
      model = simulationModel(person,saved,expected); renderResults(); setMode(mode);
    },
    setDemo(enabled) {
      clearFocus(); stopCounters(); demo = enabled; expected = {};
      expected = saved.sandboxBuild ? {} : demo ? focusFixture(person.id,{kind:'minimum',metric:'TOTAL_CRIT_RATE',tier:saved.minima['CRIT Rate']})?.values ?? {} : augustaExpected(saved)?.values ?? {};
      model = simulationModel(person,saved,expected); renderResults();
      if (enabled) { setMode('simulation'); onReveal(); }
    },
    edit(action, source) {
      // Reveal once on actual editing, never on focus alone; a manual choice wins
      // for the rest of this session, including subsequent Character changes.
      if (!manual && !revealed) { setMode('simulation'); revealed = true; }
      const fixture = demo ? focusFixture(person.id,action) : null;
      const nextExpected = saved.sandboxBuild ? {} : demo ? {...expected,...(fixture?.values ?? {})} : augustaExpected(saved)?.values ?? {};
      const nextModel = simulationModel(person,saved,nextExpected);
      const affected = demo ? fixture?.affected ?? [] : nextModel.rows.filter(row=>
        model.rows.some(previous=>previous.id===row.id && previous.expected!==row.expected)
        && row.expected!==null).map(row=>({id:row.id,role:'expected'}));
      apply(nextModel,affected); expected = nextExpected;
      if (view.classList.contains('has-result-focus')) source?.classList.add('is-active-setting');
    },
    settle() {
      if (!view.classList.contains('has-result-focus') || settling) return;
      settling = true;
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) view.querySelectorAll('.result-value.is-affected strong').forEach(node => node.animate([{transform:'translateY(-2px)'},{transform:'translateY(0)'}],{duration:180,easing:'ease-out'}));
      clearTimeout(fadeTimer); fadeTimer = setTimeout(clearFocus,950);
    },
    // Future domain adapters provide a complete presentation plus exact affected IDs.
    present(next, affected, {active = false} = {}) {
      if (next.characterId !== person.id) return;
      apply(next,affected);
      if (!active) this.settle();
    },
  };
}
