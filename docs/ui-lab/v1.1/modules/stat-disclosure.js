import priorities from './source-priorities.json' with {type:'json'};
import {escapeHtml} from './util.js';
import {STATIC_STAT_FIELDS} from '../../../../src/sandboxStaticStats.mjs';

const metrics={'ATK%':1,'Flat ATK':1,'HP%':0,'Flat HP':0,'DEF%':2,'Flat DEF':2,'Energy Regen':3,'CRIT Rate':4,'CRIT DMG':5,'Basic Attack DMG':7,'Heavy Attack DMG':8,'Skill DMG':9,'Liberation DMG':10,'Healing Bonus':11};
export function relevantStatIndices(characterId){const p=priorities.characters.find(p=>p.characterId===characterId);return new Set([...(p?.orderedStats??[]).map(s=>metrics[s]).filter(Number.isInteger),6]);}
export function statDisclosure(model,saved,{open=[],compact=false,all=false}={}){
 const account=!!saved.accountProjection,relevant=relevantStatIndices(saved.id);
 const rows=indices=>indices.map(index=>{const [label,value]=model.stats[index],key=STATIC_STAT_FIELDS[index][1],delta=saved.accountProjection?.delta[key],whole=STATIC_STAT_FIELDS[index][2];
  const difference=Number.isFinite(delta)?`${delta>0?'+':''}${whole?Math.round(delta).toLocaleString('en-US'):Number((delta*100).toFixed(1))}${whole?'':' pp'}`:'';
  return `<tr data-stat-key="${key}"><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(value==='—'?'Pending':value)}</td>${account?`<td>${escapeHtml(saved.accountProjection.candidateValues[STATIC_STAT_FIELDS[index][0]==='ELEMENT_DMG_BONUS'?model.person.identityElement.toUpperCase()+'_DMG_BONUS':STATIC_STAT_FIELDS[index][0]]??'Pending')}<small class="stat-delta" title="Static stat change; usefulness and DPS are not inferred">${escapeHtml(difference)}</small></td>`:''}</tr>`;}).join('');
 if(compact){
  const indices=all?model.stats.map((_,i)=>i):[...relevant].sort((a,b)=>a-b);
  return `<div class="stats-heading compact-stats-heading"><h3>Character Stats</h3><button type="button" data-stat-view aria-pressed="${all}" aria-label="${all?'Show relevant stats':'Show all stats'}">${all?'Relevant stats':'All stats'} <span aria-hidden="true">⇄</span></button></div><div class="compact-stat-table" title="Static stats only; missing observed Echoes and conditional combat effects remain Pending"><table aria-label="${account?'Current and Candidate':'Character'} ${all?'all':'relevant'} stats">${account?'<thead><tr><th>Stat</th><th>Current</th><th>Candidate</th></tr></thead>':''}<tbody id="characterStats" data-stat-view="${all?'all':'relevant'}">${rows(indices)}</tbody></table></div>`;
 }
 const section=(id,title,indices)=>`<details class="character-stat-section" data-stat-section="${id}"${open.includes(id)?' open':''}><summary>${title}<span class="chevron" aria-hidden="true">›</span></summary><table aria-label="${account?'Current and Candidate':'Character'} ${title.toLowerCase()}">${account?'<thead><tr><th>Stat</th><th>Current</th><th>Candidate</th></tr></thead>':''}<tbody${id==='all'?' id="characterStats"':''}>${rows(indices)}</tbody></table></details>`;
 return `<div class="stats-heading"><h3>Character Stats</h3><small class="stat-scope" title="Static stats only; conditional effects and full combat totals remain Pending">${account?(saved.accountProjection.reason==='CANDIDATE_LOADOUT_COST_EXCEEDED'?'Candidate > 12 Cost':saved.accountProjection.current?'Current | Candidate':'Build Pending'):saved.sandboxStatProjection?.observed?.status==='SOURCE_BACKED_STATIC_COMPONENT'?'Observed Echoes':'Echoes Pending'}</small></div>${section('relevant','Relevant stats',[...relevant].sort((a,b)=>a-b))}${section('all','All stats',model.stats.map((_,i)=>i))}`;
}
