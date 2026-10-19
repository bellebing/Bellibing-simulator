import {rotationGateMarkup} from './rotation-acceptance.js';
import {observedEchoComparisonMarkup} from './observed-echo-comparison.js';
import {CHARACTER_CATALOG} from './catalog.js';
import {characterContext,teamSlotAlternatives} from './character-context.js';
import {assetURL,escapeHtml} from './util.js';
import {teamDpsComparison,TEAM_COMPARISON_VERSION} from '../../../../src/teamDpsComparison.mjs';

const fmt=v=>Number.isFinite(v)?new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(v):'—';
const name=id=>CHARACTER_CATALOG.find(c=>c.id===id)?.name??'Pending';
const expertContext={kind:'SYNTHETIC_REFERENCE_TEAM',id:'AUGUSTA_IUNO_SHOREKEEPER_REFERENCE_V1',version:1};
function expertValues(characterId,evaluationContext,dps,expertMode){
 const party=['augusta','iuno','the-shorekeeper'],members=[characterId,...party.filter(id=>id!==characterId)];
 const selected=expertMode&&party.includes(characterId)&&Object.entries(expertContext).every(([k,v])=>evaluationContext?.[k]===v);
 const ready=selected&&dps?.characterId===characterId&&Object.entries(expertContext).every(([k,v])=>dps?.context?.[k]===v)&&dps?.status==='EXPERIMENTAL'&&dps.verification==='EXPERIMENTAL'&&dps.provider?.kind==='DPS'&&typeof dps.provider.sourceBinding==='string'&&Number.isFinite(dps.teamTotal)&&dps.teamTotal>=0&&Array.isArray(dps.characterContributions)&&dps.characterContributions.length===3&&members.every(id=>dps.characterContributions.filter(c=>c.characterId===id&&Number.isFinite(c.dps)&&c.dps>=0).length===1)&&Math.abs(dps.characterContributions.reduce((n,c)=>n+c.dps,0)-dps.teamTotal)<=1e-6*Math.max(1,dps.teamTotal);
 return {selected,ready,values:ready?[...members.map(id=>dps.characterContributions.find(c=>c.characterId===id).dps),dps.teamTotal]:Array(4).fill(null)};
}
// Source selection never qualifies runtime output. The current host has no
// qualified comparison producer; synthetic output has its own review surface.
export function dpsConceptMarkup({characterId='augusta',contextId=null,expertMode=false,evaluationContext=null,dps=null,view=null,comparisonSlot=null,comparisonMode='SANDBOX',memberOrder=null}={}){
 const context=characterContext(characterId,contextId,memberOrder);
 if(!context)return '';
 const {character,options,team,memberIds}=context;
 const headers=memberIds.map((id,slot)=>{const person=CHARACTER_CATALOG.find(c=>c.id===id),available=teamSlotAlternatives(context,slot);return `<th scope="col" class="dps-contribution">${person?`<button type="button" class="team-member" data-team-slot="${slot}" aria-label="${slot?'Change':'Selected'} team member ${slot+1}, ${escapeHtml(person.name)}"${slot&&available.length?' aria-haspopup="dialog"':' disabled'}><img class="dps-portrait" alt="" src="${assetURL(person.face)}"><span>${escapeHtml(person.name)}</span>${slot&&available.length?'<small>Change ▾</small>':''}</button>`:'<span>Teammate Pending</span>'}</th>`;}).join('');
 const reasons={Recommended:'Pending: a numerically complete approved reference build and qualified team provider are required.',Expected:'Pending: no qualified statistical team-DPS expectation model for the selected settings.',Simulated:'Pending: actual generated loadout, legal rotation, buffs, equipment and qualified team execution are required.'};
 const comparison=teamDpsComparison({mode:comparisonMode,context:{version:TEAM_COMPARISON_VERSION,selectedCharacterId:characterId,teamContextId:team?.id??null,characterIds:memberIds.filter(Boolean),sourceRevision:character.defaultBasis?.sourceLinesSha256??null}});
 const rows=comparison.rows.map(row=>{const scenario=row.scenario[0]+row.scenario.slice(1).toLowerCase(),reason=reasons[scenario]??'Pending: comparable qualified equipped/candidate team runs are required.';return `<tr data-dps-scenario="${row.scenario}"><th scope="row">${scenario}</th>${Array.from({length:4},(_,i)=>`<td${i===3?' class="team-total"':''} title="${reason}" aria-label="${scenario} ${escapeHtml(i===3?'Team Total':name(memberIds[i]))}: Pending">—</td>`).join('')}</tr>`;}).join('');


 const pilot=!expertMode&&['augusta','iuno','the-shorekeeper'].includes(characterId)&&dps?.characterId===characterId&&dps.context?.id===expertContext.id?`<details class="dps-experimental" open><summary>Experimental Simulated · fixed reference trio</summary><p>${[characterId,...['augusta','iuno','the-shorekeeper'].filter(id=>id!==characterId)].map(name).map(escapeHtml).join(' / ')}. Two non-selected members use fixed reference builds. Separate from the source team above; no qualified live-DPS claim. Expected DPS: Pending.</p>${rotationGateMarkup(characterId,dps)}${observedEchoComparisonMarkup({dps,view,characterId,selectedSlot:comparisonSlot})}</details>`:'';
 const expert=expertValues(characterId,evaluationContext,dps,expertMode);
 const review=expertMode&&['augusta','iuno','the-shorekeeper'].includes(characterId)?`<details class="dps-expert"><summary>Expert review · synthetic reference scenario</summary><p>The two non-selected members use fixed synthetic reference builds. Experimental bounded rotation; no verified live-DPS or upgrade claim. Independent of the source team selection above.</p><label><input type="checkbox" class="sandbox-dps-context"${expert.selected?' checked':''}> Enable Augusta / Iuno / Shorekeeper reference</label><p class="dps-expert-result" data-status="${expert.ready?'EXPERIMENTAL':'PENDING'}">${expert.ready?'EXPERIMENTAL':'Pending'} · ${[characterId,...['augusta','iuno','the-shorekeeper'].filter(id=>id!==characterId)].map(name).concat('Team Total').map((label,i)=>`${label}: ${fmt(expert.values[i])}`).join(' · ')}</p>${expert.selected?rotationGateMarkup(characterId,dps)+observedEchoComparisonMarkup({dps,view,characterId,selectedSlot:comparisonSlot}):''}</details>`:'';
 return `<section class="sandbox-dps" aria-label="Team DPS" data-status="PENDING" data-context-status="${context.status}"><div class="dps-concept-heading"><h3>Team DPS</h3><small>PENDING</small></div><table class="team-dps-table" aria-label="Team DPS comparison"><thead><tr><th scope="col"><span class="carousel-announcement">Build scenario</span></th>${headers}<th scope="col" class="dps-contribution team-total"><span>Team Total</span></th></tr></thead><tbody>${rows}</tbody></table>${pilot}${review}</section>`;
}
