// Public scenario labels/transport only. No calculator or gameplay execution.
// Documented source contexts use the declared native enemy scenario.
// Eligibility and execution readiness are decided by the private evaluator.
// Private source/profile/mode guards remain the sole authority for actual DPS.
import contexts from '../docs/ui-lab/v1.1/modules/character-contexts.json' with {type:'json'};
import {accountTeamContext} from './accountTeamContext.mjs';
import extensions from '../data/research/local-team-source-extensions.json' with {type:'json'};
// Product review uses the shared whole-team model even for trios that also
// have a historical fixed pilot. Do not switch enemy/model after an Echo swap.
const sourceTeams=new Set(contexts.teams.filter(t=>t.sourceRefs?.length>0).map(t=>t.id));
for(const extension of extensions.contexts){
 const team=contexts.teams.find(t=>t.id===extension.teamContextId);
 if(!team?.sourceRefs?.length||extension.reference!=='EXISTING_NATIVE_SOURCE_ENEMY'||team.characterIds.length!==3||!team.characterIds.every(id=>extension.characterIds.includes(id)))throw Error('LOCAL_REFERENCE_EXTENSION_CONTEXT_DRIFT');
 sourceTeams.add(team.id);
}
export function localTeamReference(teamContextId){
 const source=sourceTeams.has(teamContextId)||Boolean(accountTeamContext(teamContextId));
 return {label:source?'Riley source model':'fixed reference',defense:source?1592:1520,resistance:source?0.2:0.1,
  enemy:{defense:source?1592:1520,resistanceByElement:Object.fromEntries(['Aero','Electro','Fusion','Glacio','Spectro','Havoc','Physical'].map(e=>[e,source?0.2:0.1])),damageReduction:0}};
}
