import {costScopeMarkup} from './cost-scope.js';
import { ECHO_TUBES } from '../../../assets/resourceInventory.js';
import { assetURL } from './util.js';

// Presentation boundary only. A caller must supply verified cost results, not
// inventory, illustrative Materials Used, or a recommendation/stat projection.
const amount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
export function resourceCostValues(record = null) {
  if (record?.status !== 'VERIFIED') return [null, null, null];
  const tubes = record.tubes;
  const complete = tubes && ECHO_TUBES.every(tube => amount(tubes[tube.id]) !== null);
  const goldExp = ECHO_TUBES.find(tube => tube.id === 'premium').echoExp;
  const gold = complete ? ECHO_TUBES.reduce((sum, tube) => sum + tubes[tube.id] * tube.echoExp, 0) / goldExp : null;
  return [amount(record.echoes), amount(record.tuners), amount(gold)];
}
const format = value => value === null ? '—' : new Intl.NumberFormat('en-US', {maximumFractionDigits: 6}).format(value);
export function mountResourceCost(host) {
  host.innerHTML = `<table class="cost-comparison" aria-label="Expected and Simulated resource cost"><colgroup><col><col><col></colgroup><thead><tr><th aria-label="Resource"></th><th scope="col">Expected</th><th scope="col">Simulated</th></tr></thead><tbody>${[['Echoes',null],['Tuners','tuners'],['Tubes','premium']].map(([name,icon]) => `<tr><th scope="row"><span class="cost-label">${icon ? `<img alt="" src="${assetURL(`../../ui-prototypes/assets/resource-icons/${icon}.png`)}">` : '<span class="cost-echo" aria-hidden="true">◇</span>'}${name}</span>${name === 'Tubes' ? '<small>Gold-equivalent</small>' : ''}</th><td data-cost-role="expected"></td><td data-cost-role="simulated"></td></tr>`).join('')}</tbody></table>`;
  host.insertAdjacentHTML('beforeend','<div data-cost-scope></div>');
  function present({expected = null, simulated = null,comparison=null} = {}) {
    host.querySelector('[data-cost-scope]').innerHTML=costScopeMarkup(comparison);
    for (const [role, record] of Object.entries({expected, simulated})) {
      const values = resourceCostValues(record);
      host.querySelectorAll(`[data-cost-role="${role}"]`).forEach((cell,index) => {
        const value=values[index],formatted=index<2&&value!==null?(role==='expected'?'≈ ':'')+new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(value):format(value);
        cell.textContent = formatted;
        cell.setAttribute('aria-label', `${role} ${['Echoes','Tuners','Tubes Gold-equivalent'][index]}: ${values[index] === null ? 'unavailable' : formatted}`);
      });
    }
  }
  present();
  return {present};
}
