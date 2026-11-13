import {costScopeMarkup} from './cost-scope.js';
import { ECHO_TUBES } from '../../../assets/resourceInventory.js';
import { assetURL } from './util.js';

// Presentation boundary only. A caller must supply verified cost results, not
// inventory, illustrative Materials Used, or a recommendation/stat projection.
const amount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
export function resourceCostValues(record = null) {
  if (!['VERIFIED','ESTIMATED'].includes(record?.status)) return [null, null, null];
  const tubes = record.tubes;
  const complete = tubes && ECHO_TUBES.every(tube => record.basis==='OBSERVED_NET_RECEIPTS'?Number.isSafeInteger(tubes[tube.id]):amount(tubes[tube.id]) !== null);
  const goldExp = ECHO_TUBES.find(tube => tube.id === 'premium').echoExp;
  const gold = complete ? ECHO_TUBES.reduce((sum, tube) => sum + tubes[tube.id] * tube.echoExp, 0) / goldExp : null;
  return [amount(record.echoes), amount(record.tuners), amount(gold)];
}
const format = value => value === null ? '—' : new Intl.NumberFormat('en-US', {maximumFractionDigits: 1}).format(value);
export function mountResourceCost(host) {
  host.innerHTML = `<table class="cost-comparison" aria-label="Expected and Simulated resource cost"><colgroup><col><col><col></colgroup><thead><tr><th aria-label="Resource"></th><th scope="col">Expected</th><th scope="col">Simulated</th></tr></thead><tbody>${[['Echoes',null],['Tuners','tuners'],['Tubes','premium']].map(([name,icon]) => `<tr><th scope="row"><span class="cost-label">${icon ? `<img alt="" src="${assetURL(`../../ui-prototypes/assets/resource-icons/${icon}.png`)}">` : '<span class="cost-echo" aria-hidden="true">◇</span>'}${name}</span>${name === 'Tubes' ? '<small>Gold-equivalent</small><small data-tube-reference hidden>Unlimited reference</small>' : ''}</th><td data-cost-role="expected"></td><td data-cost-role="simulated"></td></tr>`).join('')}</tbody><tfoot><tr data-expected-odds hidden><th scope="row">Success per attempt</th><td colspan="2" data-expected-odds-value></td></tr></tfoot></table>`;
  host.insertAdjacentHTML('beforeend','<div data-cost-scope></div><p data-expected-reason role="status" hidden></p>');
  function present({expected = null, simulated = null,comparison=null,labels=null,expectedReason=null} = {}) {
    host.querySelector('thead th:nth-child(2)').textContent=labels?.expected??'Expected';
    host.querySelector('thead th:last-child').textContent=labels?.simulated??(simulated?.basis==='OBSERVED_NET_RECEIPTS'?'Simulated net':'Simulated');
    host.querySelector('[data-cost-scope]').innerHTML=comparison?.reason==='FINITE_BUDGET_EXPECTATION_PENDING'?'':costScopeMarkup(comparison);
    host.querySelector('table').title=comparison?.reason==='FINITE_BUDGET_EXPECTATION_PENDING'?'Expected costs use unlimited resources. Finite stock may stop the simulation.':'';
    const missing=resourceCostValues(expected)[1]===null;
    const note=host.querySelector('[data-expected-reason]');
    note.hidden=!missing||!expectedReason;
    note.textContent=note.hidden?'':`Expected Tuners pending · ${expectedReason}`;
    const probability=expected?.status==='VERIFIED'?expected.successProbability:null;
    const hasOdds=typeof probability==='number'&&Number.isFinite(probability)&&probability>=0&&probability<=1;
    const odds=host.querySelector('[data-expected-odds]');odds.hidden=!hasOdds;
    host.querySelector('[data-expected-odds-value]').textContent=hasOdds?(probability>0&&probability<.0001?'<0.01%':new Intl.NumberFormat('en-US',{style:'percent',maximumFractionDigits:2}).format(probability)):'';
    odds.title='Chance that one fresh, already eligible Echo meets the requirements at +25 under the selected Gate and stopping policy. Farming odds are excluded.';
    host.querySelector('[data-tube-reference]').hidden=!(expected?.tubeReference&&resourceCostValues(expected)[2]!==null);

    for (const [role, record] of Object.entries({expected, simulated})) {
      const values = resourceCostValues(record);
      host.querySelectorAll(`[data-cost-role="${role}"]`).forEach((cell,index) => {
        const value=values[index],formatted=index<2&&value!==null?(role==='expected'?'≈ ':'')+new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(value):(role==='expected'&&value!==null?'≈ ':'')+format(value);
        cell.textContent = formatted;
        cell.title = role==='expected'&&index===2&&value===null?'Expected Tube cost is unavailable from the engine. Simulated Tubes show the spending from this run.':'';
        cell.setAttribute('aria-label', `${role} ${['Echoes','Tuners','Tubes Gold-equivalent'][index]}: ${values[index] === null ? 'unavailable' : formatted}`);
      });
    }
  }
  present();
  return {present};
}
