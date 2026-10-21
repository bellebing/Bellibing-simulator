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
export function dpsConceptMarkup({characterId='augusta',contextId=null,expertMode=false,evaluationContext=null,dps=null,view=null,comparisonSlot=null,comparisonMode='SANDBOX',memberOrder=null,selection=null,roleChoices=null,hasCurrentBuild=false}={}){
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
 const active=selection?selection.selectedTeam:team;
 const pending=selection?.pendingSupport??false;
 const actualContext=team;
 const relation=actualContext?.relationship==='SOURCE_BIS_REFERENCE'?'Source BiS reference':actualContext?.relationship==='SOURCE_RECOMMENDED_CORE_VARIANT'?'Reviewed core variant':actualContext?.relationship==='UNRANKED_MODEL_CANDIDATE'?'Unranked model identity · reviewed guide-prose binding':'Reviewed alternative';
 const provenance=actualContext?.catalogEvidenceBasis==='REVIEWED_GUIDE_TRIO'?'Explicit source trio':actualContext?.catalogEvidenceBasis==='PUBLISHED_MODEL_ROSTER_ONLY'?'Approved source-prose composition match':'Reviewed guide-slot synthesis';
 const modeLabel=Object.entries(actualContext?.modeRequirements??{}).map(([id,mode])=>`${name(id)}: ${mode}`).join(' · ');
 const conditions=actualContext?.conditions??[];
 const source=actualContext?.sourceRefs?.find(r=>/^https:\/\//.test(r.url));
 const sourceLink=source?`<a class="team-source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">Source ↗</a>`:'';
 const conditionMarkup=conditions.length?`<details class="team-conditions"><summary>Team conditions (${conditions.length})</summary><ul>${conditions.map(c=>`<li>${escapeHtml(c)}</li>`).join('')}</ul></details>`:'';
 const controls=`<div class="team-source-summary" data-active-context-id="${escapeHtml((selection?selection.activeContextId:team?.id)??'')}" data-draft-context-id="${escapeHtml(pending?team?.id??'':'')}">${selection?.pendingChoice?'<button type="button" data-team-variant>Choose variant</button>':pending?'<span class="team-support-pending" role="status">Choose a third teammate</span>':''}</div>`;
 const comparison=teamDpsComparison({mode:'IMPROVE',context:{version:TEAM_COMPARISON_VERSION,selectedCharacterId:characterId,teamContextId:selection?.activeContextId??null,characterIds:memberIds.filter(Boolean),sourceRevision:character.defaultBasis?.sourceLinesSha256??null}});
 const rows=[...comparison.rows.map(row=>`<tr data-dps-scenario="${row.scenario}"><th scope="row">${row.scenario==='CURRENT'?'Current':'Candidate'}</th>${Array.from({length:4},(_,i)=>`<td${i===3?' class="team-total"':''}>—</td>`).join('')}</tr>`),'<tr class="local-team-delta"><th scope="row">Change</th><td>—</td><td>—</td><td>—</td><td class="team-total">—</td></tr>'].join('');



 const pilotTrio=!pending&&!!active&&['augusta','iuno','the-shorekeeper'].every(id=>active.characterIds.includes(id));
 const pilot=pilotTrio&&!expertMode&&['augusta','iuno','the-shorekeeper'].includes(characterId)&&dps?.characterId===characterId&&dps.context?.id===expertContext.id?`<details class="dps-experimental" open><summary>Experimental Simulated · fixed reference trio</summary><p>${[characterId,...['augusta','iuno','the-shorekeeper'].filter(id=>id!==characterId)].map(name).map(escapeHtml).join(' / ')}. Two non-selected members use fixed reference builds. Separate from the source team above; no qualified live-DPS claim. Expected DPS: Pending.</p>${rotationGateMarkup(characterId,dps)}${observedEchoComparisonMarkup({dps,view,characterId,selectedSlot:comparisonSlot})}</details>`:'';
 const expert=expertValues(characterId,evaluationContext,dps,expertMode);
 const review=pilotTrio&&expertMode&&['augusta','iuno','the-shorekeeper'].includes(characterId)?`<details class="dps-expert"><summary>Expert review · synthetic reference scenario</summary><p>The two non-selected members use fixed synthetic reference builds. Experimental bounded rotation; no verified live-DPS or upgrade claim. Independent of the source team selection above.</p><label><input type="checkbox" class="sandbox-dps-context"${expert.selected?' checked':''}> Enable Augusta / Iuno / Shorekeeper reference</label><p class="dps-expert-result" data-status="${expert.ready?'EXPERIMENTAL':'PENDING'}">${expert.ready?'EXPERIMENTAL':'Pending'} · ${[characterId,...['augusta','iuno','the-shorekeeper'].filter(id=>id!==characterId)].map(name).concat('Team Total').map((label,i)=>`${label}: ${fmt(expert.values[i])}`).join(' · ')}</p>${expert.selected?rotationGateMarkup(characterId,dps)+observedEchoComparisonMarkup({dps,view,characterId,selectedSlot:comparisonSlot}):''}</details>`:'';
 return `<section class="sandbox-dps" aria-label="Team DPS" data-status="PENDING" data-context-status="${context.status}"><div class="dps-concept-heading"><h3>Team DPS</h3><small data-team-status>PENDING</small></div>${controls}<div data-team-reference></div><table class="team-dps-table" aria-label="Team DPS comparison"><thead><tr><th scope="col"></th>${headers}<th scope="col" class="dps-contribution team-total"><span>Team Total</span></th></tr></thead><tbody data-team-dps-body>${hasCurrentBuild?rows:'<tr><td colspan="5" class="team-next-action"><a href="../build/">Complete your team in Build</a></td></tr>'}</tbody></table><p class="local-team-status" role="status">${selection?.pendingChoice?'Choose a variant':pending?'Choose a third teammate':''}</p><details class="team-details"><summary>Details</summary><p>${escapeHtml(relation)} · ${escapeHtml(provenance)} ${sourceLink}</p>${modeLabel?'<p>'+escapeHtml(modeLabel)+'</p>':''}${conditionMarkup}<p>Current is the saved account team. Candidate replaces only the selected Echo slots. Account data is unchanged.</p><p>Qualified DPS and Expected DPS: Pending. Experimental references require explicit Lv90 / R1 and supported equipment, max skills, total ER and fixed rotation.</p>${pilot}${review}</details></section>`;
}
