import {escapeHtml} from './util.js';
// A visual concept only. Numeric provider outputs are deliberately not accepted
// until S4 defines a verified same-team-run result/attribution validator.
export function dpsConceptMarkup({selectedTeam=['Augusta','Iuno','Shorekeeper'],characterContributions=null,teamTotal=null,unit='DMG/s',measurementWindow=null,provider=null,version=null,calculationStatus='PENDING',sourceContextIdentity=null}={}){
 if(selectedTeam.length!==3)throw Error('Three team labels required');
 return `<section class="sandbox-dps" aria-label="DPS presentation concept, results Pending" data-status="PENDING"><div class="dps-concept-heading"><h3>Team DPS</h3><small>CONCEPT · PENDING</small></div><div class="dps-columns">${[...selectedTeam,'Team Total'].map((name,i)=>`<div class="dps-contribution${i===3?' team-total':''}"><span>${escapeHtml(name)}</span><strong aria-label="${escapeHtml(name)} DPS Pending">—</strong><small>${escapeHtml(unit)}</small></div>`).join('')}</div></section>`;
}
