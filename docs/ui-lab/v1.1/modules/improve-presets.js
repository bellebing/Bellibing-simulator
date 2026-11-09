const presets = {
  BUDGET: {label:'Budget', minimum:85},
  RECOMMENDED: {label:'Recommended', minimum:95},
  INSANE: {label:'Insane', minimum:115}
};

export function mountImprovePresets({getState, onSave, onManual}) {
  document.querySelector('.setting-mode').hidden = true;
  const host = document.createElement('section');
  host.className = 'improve-presets';
  host.innerHTML = `<div class="improve-preset-buttons" role="group" aria-label="DPS objective preset">${Object.entries(presets).map(([id,p])=>`<button type="button" data-preset="${id}">${p.label}</button>`).join('')}</div>
    <details class="improve-advanced"><summary>Show Advanced Settings</summary>
      <label class="improve-dps-enable"><input type="checkbox"> Use DPS optimisation</label>
      <label class="improve-dps-target">Minimum reference DPS <span><input type="number" min="1" step="1" aria-label="Minimum reference DPS percent"> %</span></label>
      <p class="improve-preset-description"></p>
      <p class="improve-preset-note">Whole-build Team DPS. Higher results accepted. Cost estimates compare sampled stopping policies from the selected Gate.</p>
    </details>
    <button type="button" class="improve-manual-targets">Edit stat targets</button>`;
  document.querySelector('#echoSettings').before(host);
  const advanced = host.querySelector('details');
  const enabled = host.querySelector('.improve-dps-enable input');
  const minimum = host.querySelector('.improve-dps-target input');
  const plan = () => {
    const value = getState().improvePlan ??= {preset:'RECOMMENDED', advancedOpen:false};
    value.dpsEnabled ??= true;
    value.minimumDpsPercent ??= presets[value.preset].minimum;
    return value;
  };
  function render() {
    const value = plan();
    for (const button of host.querySelectorAll('[data-preset]')) {
      const selected = button.dataset.preset === value.preset;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
    host.querySelector('.improve-preset-description').textContent = `Accept ≥ ${value.minimumDpsPercent}% of reference DPS`;
    advanced.open = value.advancedOpen;
    enabled.checked = value.dpsEnabled;
    if(document.activeElement !== minimum)minimum.value = value.minimumDpsPercent;
    host.querySelector('.improve-manual-targets').hidden = !getState().sourcePreferenceGuidance;
  }
  host.addEventListener('click', event => {
    const button = event.target.closest('[data-preset]');
    if (!button) return;
    plan().preset = button.dataset.preset;
    plan().dpsEnabled = true;
    plan().minimumDpsPercent = presets[button.dataset.preset].minimum;
    render();onSave();
  });
  enabled.onchange = () => {plan().dpsEnabled = enabled.checked;onSave();};
  minimum.onchange = () => {
    if(!minimum.checkValidity() || !Number.isFinite(minimum.valueAsNumber)){render();return;}
    plan().minimumDpsPercent = minimum.valueAsNumber;
    render();onSave();
  };
  advanced.addEventListener('toggle', () => {
    if (plan().advancedOpen === advanced.open) return;
    plan().advancedOpen = advanced.open;onSave();
  });
  host.querySelector('.improve-manual-targets').onclick = onManual;
  render();return {render};
}
