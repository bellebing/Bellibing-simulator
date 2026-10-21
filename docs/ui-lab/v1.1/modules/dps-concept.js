import {researchDpsMarkup} from './research-dps.js';
import {CHARACTER_CATALOG} from './catalog.js';
import {characterContext} from './character-context.js';
import {sourceTeamRoles} from './team-selection.js';
import {assetURL,escapeHtml} from './util.js';

export function dpsConceptMarkup({characterId='augusta',contextId=null,expertMode=false,evaluationContext=null,dps=null,view=null,comparisonSlot=null,comparisonMode='SANDBOX',memberOrder=null,selection=null,roleChoices=null,hasCurrentBuild=false}={}){
 if(expertMode)return researchDpsMarkup({characterId,contextId,expertMode,evaluationContext,dps,view,comparisonSlot,comparisonMode,memberOrder,selection,roleChoices,hasCurrentBuild});
 const context=selection??characterContext(characterId,contextId,memberOrder);
 if(!context)return '';
 const {character,options,team}=context;
 const roles=selection?.roles??sourceTeamRoles(team);
 const memberIds=selection?.memberIds??(roles?[roles.main,roles.partner,roles.third]:context.memberIds);
 const labels=['Main DPS','Partner',roles?.thirdRole??'Third member'];
 const keys=['main','partner','third'];
 const headers=memberIds.map((id,slot)=>{
  const person=CHARACTER_CATALOG.find(c=>c.id===id),choices=roleChoices?.[keys[slot]]??[];
  const editable=!!selection&&(choices.length>0||slot===2&&selection.pendingSupport);
  const portrait=person?`<img class="dps-portrait" alt="" src="${assetURL(person.face)}"><span>${escapeHtml(person.name)}</span>`:'<span class="team-empty-slot">Choose a teammate</span>';
  return `<th scope="col" class="dps-contribution"><span class="team-role-label">${escapeHtml(labels[slot])}</span><button type="button" class="team-member${!person?' is-empty':''}" data-team-role="${keys[slot]}" aria-label="${editable?'Change':'Selected'} ${escapeHtml(labels[slot])}: ${person?escapeHtml(person.name):'Pending'}" ${editable?'aria-haspopup="dialog"':'disabled'}>${portrait}${editable?'<small>Change ▾</small>':''}</button></th>`;
 }).join('');
 const pending=selection?.pendingSupport??false;
 const controls=`<div class="team-source-summary" data-active-context-id="${escapeHtml((selection?selection.activeContextId:team?.id)??'')}" data-draft-context-id="${escapeHtml(pending?team?.id??'':'')}">${selection?.pendingChoice?'<button type="button" data-team-variant>Choose variant</button>':''}</div>`;
 const labelsForRows=comparisonMode==='SANDBOX'?['Reference','Simulated']:['Current','Candidate'];
 const rows=[...labelsForRows,'Change'].map((label,i)=>`<tr${i<2?` data-dps-scenario="${comparisonMode==='SANDBOX'?['REFERENCE','SIMULATED'][i]:['CURRENT','CANDIDATE'][i]}"`:''}><th scope="row">${label}</th>${Array.from({length:4},(_,i)=>`<td${i===3?' class="team-total"':''}>—</td>`).join('')}</tr>`).join('');
 const body=comparisonMode==='SANDBOX'||hasCurrentBuild?rows:pending||selection?.pendingChoice?'':'<tr><td colspan="5" class="team-next-action"><a href="../build/">Complete your team in Build</a></td></tr>';
 return `<section class="sandbox-dps" aria-label="Team DPS" data-status="PENDING" data-context-status="${context.status}"><div class="dps-concept-heading"><h3>Team DPS</h3><small data-team-status>Local DPS unavailable</small></div>${controls}<div data-team-reference></div><table class="team-dps-table" aria-label="Team DPS comparison"><thead><tr><th scope="col"></th>${headers}<th scope="col" class="dps-contribution team-total"><span>Team Total</span></th></tr></thead><tbody data-team-dps-body>${body}</tbody></table><p class="local-team-status" role="status">${pending?'Choose a third teammate':''}</p></section>`;
}
