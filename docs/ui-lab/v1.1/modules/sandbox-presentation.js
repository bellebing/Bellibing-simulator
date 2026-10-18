import {escapeHtml} from './util.js';
import catalog from '../../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
import manifest from '../../../ui-prototypes/assets/echoes/manifest.json' with {type:'json'};
// Read-only projection of actual observed cards. Never create a public owner.
export function observedEcho(card,{discarded=false}={}){
 if(!card)return null;
 const species=card.speciesId??card.template?.echoId??card.echoSpeciesId;
 const echo=catalog.echoes.find(e=>e.id===species),icon=manifest.icons.find(e=>e.echoId===species);
 const sonata=catalog.sonataSets.find(s=>s.id===card.selectedSonataSetId);
 if(!echo||!icon||!sonata)throw Error('OBSERVED_ECHO_IDENTITY_UNAVAILABLE');
 const path=v=>'../../'+v.replace(/^docs\//,'');
 const format=s=>!s?'—':s.name.startsWith('Flat ')?String(s.value):`${Number((s.value*100).toFixed(2))}%`;
 return {id:card.id??card.echoId,name:echo.name,cost:card.cost,level:card.level,artURL:path(icon.targetPath),setName:sonata.name,setIconURL:path(sonata.artPath),
  main:card.mainStat?.name??'Main Stat',value:format(card.mainStat),secondary:card.secondaryMainStat?.name??'Secondary Stat',secondaryValue:format(card.secondaryMainStat),
  stats:(card.substats??[]).map(s=>[s.name,format(s)]),...(discarded?{disposition:'DISCARDED'}:{})};
}
export function observedSlots(view){
 if(!view||!Array.isArray(view.slots))return null;
 return Array.from({length:5},(_,i)=>{const s=view.slots.find(s=>s.slot===i+1);return {complete:s?.complete??false,current:observedEcho(s?.current),candidate:observedEcho(s?.candidate),trash:(s?.trash??[]).map(t=>({...observedEcho(t.card,{discarded:true}),reason:t.reason,observations:structuredClone(t.observations)}))};});
}
export function expectedResourceRecord(metrics){
 const set=metrics?.expectedCost?.selectedSet;if(!set)return null;
 const value=cell=>cell?.status==='VERIFIED'?cell.value?.approximate:null;
 return {status:'VERIFIED',echoes:value(set.echoes),tuners:value(set.tuners),tubes:null};
}
export function sandboxCostDetails(metrics,cost){
 const e=metrics?.expectedCost;
 const expected=e?`<details><summary>Expected · fresh-start scope and assumptions</summary><p>${escapeHtml(e.scope)} · live remaining: Pending</p><ul>${(e.assumptions??[]).map(a=>`<li>${escapeHtml(a)}</li>`).join('')}</ul><p>Echoes: ${escapeHtml(e.selectedSet?.echoes?.status??'PENDING')} · Tuners: ${escapeHtml(e.selectedSet?.tuners?.status??'PENDING')} · Tubes: ${escapeHtml(e.selectedSet?.tubes?.status??'PENDING')}</p></details>`:'';
 if(!cost)return expected;
 const amount=v=>v?.kind==='UNLIMITED'?'∞':typeof v==='object'&&v!==null&&'count' in v?String(v.count):typeof v==='number'?new Intl.NumberFormat('en-US',{maximumFractionDigits:6}).format(v):'—';
 const columns=['echoes','tuners','premium','advanced','medium','basic'];
 const rows=['gross','returned','net','remaining'].map(role=>{const r=cost[role];return `<tr><th>${role==='returned'?'Returns':role[0].toUpperCase()+role.slice(1)}</th>${columns.map(k=>`<td>${escapeHtml(amount(k==='echoes'||k==='tuners'?r?.[k]:r?.tubes?.[k]))}</td>`).join('')}<td>${escapeHtml(amount(cost.goldEquivalent?.[role]))}</td></tr>`;}).join('');
 return expected+`<details><summary>Observed receipts · gross / returns / net / remaining</summary><p>${escapeHtml(cost.scope)} · ${escapeHtml(cost.status)} · Recovery: ${escapeHtml(cost.recovery)}</p><div class="sandbox-receipt-scroll"><table aria-label="Actual simulated receipt accounting"><thead><tr><th>Basis</th><th>Echoes</th><th>Tuners</th><th>Gold</th><th>Purple</th><th>Blue</th><th>Green</th><th>Gold equivalent</th></tr></thead><tbody>${rows}</tbody></table></div><p>Denominations are retained. Remaining is inventory, not spent cost. Missing is —; unlimited is ∞.</p></details>`;
}
