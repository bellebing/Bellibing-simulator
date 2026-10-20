import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import catalog from '../docs/ui-lab/v1.1/modules/character-contexts.json' with {type:'json'};
import {sourceTeamRoles} from '../docs/ui-lab/v1.1/modules/team-selection.js';

const out='artifacts/team-selection';mkdirSync(out,{recursive:true});
const teams=new Map(),errors=[],memberships=new Map(),rows=[];
for(const team of catalog.teams){
 if(teams.has(team.id))errors.push('Duplicate context '+team.id);
 teams.set(team.id,team);
 if(new Set(team.characterIds).size!==3||team.characterIds.length!==3)errors.push('Invalid trio '+team.id);
 if(!team.sourceRefs?.length||team.sourceRefs.some(r=>!r.url||!r.provider))errors.push('Source locator missing '+team.id);
 if(team.relationship==='UNRANKED_MODEL_CANDIDATE')errors.push('Unranked model promoted '+team.id);
 if(team.catalogEvidenceBasis==='PUBLISHED_MODEL_ROSTER_ONLY'&&!team.defaultSourceBindings?.every(b=>b.compositionReview==='APPROVED_GUIDE_PROSE_MATCH_TO_EXISTING_CATALOG_TRIO'))errors.push('Unapproved model '+team.id);
 const roles=sourceTeamRoles(team);
 if(!roles||[roles.main,roles.partner,roles.third].some(id=>!team.characterIds.includes(id))||new Set([roles.main,roles.partner,roles.third]).size!==3)errors.push('Role assignment invalid '+team.id);
 memberships.set(team.id,new Set());
}
for(const c of catalog.characters){
 const defaultTeam=teams.get(c.defaultContextId);
 if(!defaultTeam||!defaultTeam.characterIds.includes(c.characterId))errors.push('Missing default '+c.characterId);
 if(new Set(c.contextIds).size!==c.contextIds.length)errors.push('Duplicate Character options '+c.characterId);
 let modes=0,conditions=0;
 for(const id of c.contextIds){
  const t=teams.get(id);
  if(!t||!t.characterIds.includes(c.characterId)){errors.push('Invalid member context '+c.characterId+' / '+id);continue;}
  memberships.get(id).add(c.characterId);
  if(Object.keys(t.modeRequirements??{}).length)modes++;
  if(t.conditions?.length)conditions++;
 }
 for(const team of catalog.teams)if(team.characterIds.includes(c.characterId)&&!c.contextIds.includes(team.id))errors.push('Unreachable context '+c.characterId+' / '+team.id);
 rows.push({characterId:c.characterId,defaultContextId:c.defaultContextId,reviewedContexts:c.contextIds.length,modeScopedContexts:modes,conditionalContexts:conditions,sourceStatus:defaultTeam?'SOURCE_REVIEWED_DEFAULT':'PENDING_MISSING_DEFAULT',teamDps:'PENDING'});
}
for(const t of catalog.teams)if(memberships.get(t.id).size!==3)errors.push('Context inaccessible to some members '+t.id);
assert.equal(catalog.characters.length,59,'59 released identities are required');
assert.equal(catalog.teams.length,397,'397 source-bound canonical contexts required');
const report={version:'BELLIBING_TEAM_SELECTION_COVERAGE_V1',characters:rows.length,sourceBoundContexts:catalog.teams.length,missingOrBlocked:errors,rows};
writeFileSync(out+'/coverage.json',JSON.stringify(report,null,2)+'\n');
const md=['# Source team selection — 59 Character audit','','Browser projection: '+rows.length+' RELEASED Characters / '+catalog.teams.length+' source-bound contexts. Model-only discovery remains excluded.','A source-bound party is not a qualified DPS team; Team DPS is Pending.','','| Character | Default context ID | Reviewed options | Mode scoped | Conditional | Status |','| --- | --- | ---: | ---: | ---: | --- |',...rows.map(r=>`| ${r.characterId} | \`${r.defaultContextId??'Pending'}\` | ${r.reviewedContexts} | ${r.modeScopedContexts} | ${r.conditionalContexts} | ${r.sourceStatus} |`),'','## Gaps',...(errors.length?errors.map(s=>'- '+s):['No missing source-context access/default gaps found in the 59/397 projection. Unsupported hypothetical teams still remain Pending.'])];
writeFileSync(out+'/coverage.md',md.join('\n')+'\n');
if(errors.length)throw Error('Source team coverage gaps: '+errors.join('; '));
console.log('Reviewed Team Selection coverage PASS: '+rows.length+'/59 Characters, '+teams.size+'/397 contexts; all member references, defaults, source locators and role assignments reachable. Report: '+out+'/coverage.md');
