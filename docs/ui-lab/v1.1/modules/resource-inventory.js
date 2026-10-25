import { ECHO_TUBES, formatInventoryQuantity } from '../../../assets/resourceInventory.js';
import { createLabResourceInventory } from './resource-state.js';
import { assetURL, escapeHtml } from './util.js';

export function mountResourceInventory(host, inventory = createLabResourceInventory(), {sandbox=false}={}) {
  const initial = inventory.read();
  const quantity = id => { const current = inventory.read(); return current[id] ?? current.tubes[id]; };
  function field(id, name, caption, icon = true, prominent = false) {
    const value = initial[id] ?? initial.tubes[id];
    return `<div class="resource-field${prominent ? ' resource-prominent' : ''}" data-resource="${id}" title="${escapeHtml(name)} · whole count or ∞ / Unlimited"><span class="resource-caption">${icon ? `<img src="${assetURL(`../../ui-prototypes/assets/resource-icons/${id}.png`)}" alt="">` : ''}<span>${escapeHtml(caption)}</span><button type="button" class="resource-unlimited" aria-label="Unlimited ${escapeHtml(name)}" aria-pressed="${value.kind === 'UNLIMITED'}" title="Unlimited ${escapeHtml(name)}">∞</button></span><input type="text" value="${formatInventoryQuantity(value)}" aria-label="${escapeHtml(name)} available count" aria-description="Whole non-negative count or ∞ / Unlimited" autocomplete="off" spellcheck="false"></div>`;
  }
  host.innerHTML = `<div class="resource-grid-headings" aria-hidden="true"><span>Echoes</span><span>Tuners</span><span>Tubes</span></div>
    <div class="resource-compact-grid">${field('echoes','Echoes','',false,true)}${field('tuners','Premium Tuner','',true,true)}${ECHO_TUBES.map(tube=>field(tube.id,tube.name,'',true)).join('')}</div>
    <p id="resourceError" class="resource-error" role="alert" hidden></p>`;
  if(sandbox){const button=document.createElement('button');button.type='button';button.className='sandbox-unlimited-resources';button.textContent='Unlimited for cost comparison';button.onclick=()=>{for(const id of ['echoes','tuners',...ECHO_TUBES.map(t=>t.id)])inventory.set(id,'∞');host.querySelectorAll('input').forEach(input=>{input.value='∞';sync(input);});host.dispatchEvent(new Event('change',{bubbles:true}));};host.append(button);}
  const error = host.querySelector('#resourceError');
  function sync(input) {
    const field = input.closest('[data-resource]'), active = quantity(field.dataset.resource).kind === 'UNLIMITED';
    field.classList.toggle('is-unlimited', active);
    field.querySelector('.resource-unlimited').setAttribute('aria-pressed', String(active));
  }
  host.querySelectorAll('input').forEach(sync);
  host.addEventListener('click', event => {
    const button = event.target.closest('.resource-unlimited');
    if (!button) return;
    const field = button.closest('[data-resource]'), input = field.querySelector('input');
    inventory.toggleUnlimited(field.dataset.resource);
    input.value = formatInventoryQuantity(quantity(field.dataset.resource));
    clear(input); sync(input);
  });
  function clear(input) {
    input.setCustomValidity('');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    if (error.dataset.resource === input.closest('[data-resource]').dataset.resource) {
      error.hidden = true; error.textContent = ''; delete error.dataset.resource;
    }
  }
  function commit(input) {
    const field = input.closest('[data-resource]'), id = field.dataset.resource;
    try {
      inventory.set(id, input.value);
      input.value = formatInventoryQuantity(quantity(id));
      clear(input); sync(input);
    } catch (failure) {
      // Roll back the visible draft as well as preserving the validated store.
      input.value = formatInventoryQuantity(quantity(id));
      const previous = error.dataset.resource;
      if (previous && previous !== id) clear(host.querySelector(`[data-resource="${previous}"] input`));
      input.setAttribute('aria-invalid','true');
      input.setAttribute('aria-describedby','resourceError');
      input.setCustomValidity(failure.message);
      error.dataset.resource = id;
      error.textContent = `${input.getAttribute('aria-label').replace(' available count','')}: entry rejected. ${failure.message}`;
      error.hidden = false;
    }
  }
  host.addEventListener('input', event => { if (event.target.matches('input')) clear(event.target); });
  host.addEventListener('change', event => { if (event.target.matches('input')) commit(event.target); });
  host.addEventListener('keydown', event => {
    if (!event.target.matches('input')) return;
    if (event.key === 'Enter') { event.preventDefault(); commit(event.target); }
    if (event.key === 'Escape') { event.preventDefault(); event.target.value = formatInventoryQuantity(quantity(event.target.closest('[data-resource]').dataset.resource)); clear(event.target); }
  });
  function showMissing(missing = []) {
    host.querySelectorAll('[data-resource]').forEach(field => {
      const affected = missing.includes(field.dataset.resource) || (missing.includes('xp') && ECHO_TUBES.some(tube => tube.id === field.dataset.resource));
      field.classList.toggle('resource-missing', affected);
      const input = field.querySelector('input');
      if (affected && input.getAttribute('aria-invalid') !== 'true') input.setAttribute('aria-describedby', 'feedbackTitle');
      else if (input.getAttribute('aria-describedby') === 'feedbackTitle') input.removeAttribute('aria-describedby');
    });
  }
  return { read: inventory.read, revision: inventory.revision, showMissing };
}
