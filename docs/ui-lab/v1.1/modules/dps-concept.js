import {rotationGateMarkup} from './rotation-acceptance.js';
import {observedEchoComparisonMarkup} from './observed-echo-comparison.js';
import {CHARACTER_CATALOG} from './catalog.js';
import {characterContext} from './character-context.js';
import {sourceTeamRoles} from './team-selection.js';
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
export function dpsConceptMarkup({characterId='augusta',contextId=null,expertMode=false,evaluationContext=null,dps=null,view=null,comparisonSlot=null,comparisonMode='SANDBOX',memberOrder=null,selection=null,roleChoices=null}={}){
 const context=selection??characterContext(characterId,contextId,memberOrder);
 if(!context)return '';
 const {character,options,team}=context;
 const roles=selection?.roles??sourceTeamRoles(team);
 const memberIds=selection?.memberIds??(roles?[roles.main,roles.partner,roles.third]:context.memberIds);
 const labels=['Main DPS','Sub DPS / partner',roles?.thirdRole??'Third member'];
 const keys=['main','partner','third'];
 const headers=memberIds.map((id,slot)=>{
  const person=CHARACTER_CATALOG.find(c=>c.id===id),choices=roleChoices?.[keys[slot]]??[];
  const editable=!!selection&&(choices.length>0||slot===2&&selection.pendingSupport);
  const portrait=person?`<img class="dps-portrait" alt="" src="${assetURL(person.face)}"><span>${escapeHtml(person.name)}</span>`:'<span class="team-empty-slot">Choose a teammate</span>';
  return `<th scope="col" class="dps-contribution"><span class="team-role-label">${escapeHtml(labels[slot])}</span><button type="button" class="team-member${!person?' is-empty':''}" data-team-role="${keys[slot]}" aria-label="${editable?'Change':'Selected'} ${escapeHtml(labels[slot])}: ${person?escapeHtml(person.name):'Pending'}" ${editable?'aria-haspopup="dialog"':'disabled'}>${portrait}${editable?'<small>Change ▾</small>':''}</button></th>`;
 }).join('');
 const active=selection?.selectedTeam??team;
 const pending=selection?.pendingSupport??false;
 const actualContext=team;
 const relation=actualContext?.relationship==='SOURCE_BIS_REFERENCE'?'Source BiS reference':actualContext?.relationship==='SOURCE_RECOMMENDED_CORE_VARIANT'?'Reviewed core variant':'Reviewed alternative';
 const provenance=actualContext?.evidenceBasis==='REVIEWED_GUIDE_TRIO'?'Explicit source trio':'Reviewed guide-slot synthesis';
 const modeLabel=Object.entries(actualContext?.modeRequirements??{}).map(([id,mode])=>`${name(id)}: ${mode}`).join(' · ');
 const conditions=actualContext?.conditionsSv??[];
 const source=actualContext?.sourceRefs?.find(r=>/^https:\/\//.test(r.url));
 const sourceLink=source?`<a class="team-source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">Source ↗</a>`:'';
 const conditionMarkup=conditions.length?`<details class="team-conditions"><summary>Team conditions (${conditions.length})</summary><ul>${conditions.map(c=>`<li>${escapeHtml(c)}</li>`).join('')}</ul></details>`:'';
 const controls=selection?`<div class="team-source-controls"><button type="button" data-team-context-menu>Team options (${options.length}) ▾</button><button type="button" data-team-default${!selection.activeContextId||selection.activeContextId===character.defaultContextId?' disabled':''}>Standard team</button><button type="button" data-team-mode${!selection.modeOptions?.length?' disabled':''}>Mode / preset ▾</button></div><p class="team-source-summary" data-active-context-id="${escapeHtml(selection.activeContextId??'')}" data-draft-context-id="${escapeHtml(pending?team?.id??'':'')}">${pending?'Support Pending · no complete team selected':active?.id===character.defaultContextId?'Standard team':'Selected reviewed team'} · ${escapeHtml(relation)} · ${escapeHtml(provenance)}${modeLabel?' · '+escapeHtml(modeLabel):''} ${sourceLink}</p>${pending?'<p class="team-support-pending" role="status">Support slot cleared: previous Support is not validated for this core and mode. Choose one of the reviewed options. Missing combinations remain Pending, not impossible.</p>':''}${conditionMarkup}`:'';
 const reasons={Recommended:'Pending: a numerically complete approved reference build and qualified team provider are required.',Expected:'Pending: no qualified statistical team-DPS expectation model for the selected settings.',Simulated:'Pending: actual generated loadout, legal rotation, buffs, equipment and qualified team execution are required.'};
 const comparison=teamDpsComparison({mode:comparisonMode,context:{version:TEAM_COMPARISON_VERSION,selectedCharacterId:characterId,teamContextId:team?.id??null,characterIds:memberIds.filter(Boolean),sourceRevision:character.defaultBasis?.sourceLinesSha256??null}});
 const rows=comparison.rows.map(row=>{const scenario=row.scenario[0]+row.scenario.slice(1).toLowerCase(),reason=reasons[scenario]??'Pending: comparable qualified equipped/candidate team runs are required.';return `<tr data-dps-scenario="${row.scenario}"><th scope="row">${scenario}</th>${Array.from({length:4},(_,i)=>`<td${i===3?' class="team-total"':''} title="${reason}" aria-label="${scenario} ${escapeHtml(i===3?'Team Total':name(memberIds[i]))}: Pending">—</td>`).join('')}</tr>`;}).join('');


 const pilotTrio=!pending&&!!active&&['augusta','iuno','the-shorekeeper'].every(id=>active.characterIds.includes(id));
 const pilot=pilotTrio&&!expertMode&&['augusta','iuno','the-shorekeeper'].includes(characterId)&&dps?.characterId===characterId&&dps.context?.id===expertContext.id?`<details class="dps-experimental" open><summary>Experimental Simulated · fixed reference trio</summary><p>${[characterId,...['augusta','iuno','the-shorekeeper'].filter(id=>id!==characterId)].map(name).map(escapeHtml).join(' / ')}. Two non-selected members use fixed reference builds. Separate from the source team above; no qualified live-DPS claim. Expected DPS: Pending.</p>${rotationGateMarkup(characterId,dps)}${observedEchoComparisonMarkup({dps,view,characterId,selectedSlot:comparisonSlot})}</details>`:'';
 const expert=expertValues(characterId,evaluationContext,dps,expertMode);
 const review=pilotTrio&&expertMode&&['augusta','iuno','the-shorekeeper'].includes(characterId)?`<details class="dps-expert"><summary>Expert review · synthetic reference scenario</summary><p>The two non-selected members use fixed synthetic reference builds. Experimental bounded rotation; no verified live-DPS or upgrade claim. Independent of the source team selection above.</p><label><input type="checkbox" class="sandbox-dps-context"${expert.selected?' checked':''}> Enable Augusta / Iuno / Shorekeeper reference</label><p class="dps-expert-result" data-status="${expert.ready?'EXPERIMENTAL':'PENDING'}">${expert.ready?'EXPERIMENTAL':'Pending'} · ${[characterId,...['augusta','iuno','the-shorekeeper'].filter(id=>id!==characterId)].map(name).concat('Team Total').map((label,i)=>`${label}: ${fmt(expert.values[i])}`).join(' · ')}</p>${expert.selected?rotationGateMarkup(characterId,dps)+observedEchoComparisonMarkup({dps,view,characterId,selectedSlot:comparisonSlot}):''}</details>`:'';
 return `<section class="sandbox-dps" aria-label="Team DPS" data-status="PENDING" data-context-status="${context.status}"><div class="dps-concept-heading"><h3>Team DPS</h3><small>PENDING</small></div>${controls}<table class="team-dps-table" aria-label="Team DPS comparison"><thead><tr><th scope="col"><span class="carousel-announcement">Build scenario</span></th>${headers}<th scope="col" class="dps-contribution team-total"><span>Team Total</span></th></tr></thead><tbody>${rows}</tbody></table>${pilot}${review}</section>`;
}
