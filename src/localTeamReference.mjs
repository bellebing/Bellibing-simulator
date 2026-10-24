// Public scenario labels/transport only. No calculator or gameplay execution.
// A published reference chooses its enemy context, never execution readiness.
// Private source/profile/mode guards remain the sole authority for actual DPS.
import contexts from '../docs/ui-lab/v1.1/modules/character-contexts.json' with {type:'json'};
import extensions from '../data/research/local-team-source-extensions.json' with {type:'json'};
const sourceTeams=new Set(contexts.teams.filter(t=>{
 const pilot=['augusta','the-shorekeeper'].every(id=>t.characterIds.includes(id))&&['iuno','mortefi'].some(id=>t.characterIds.includes(id));
 return !pilot&&t.rotation?.variants?.some(v=>(/^(published-\d+|composed-.+)$/.test(v.id))&&v.status==='DECLARED_MODEL_VARIANT_AVAILABLE');
}).map(t=>t.id));
for(const extension of extensions.contexts){
 const team=contexts.teams.find(t=>t.id===extension.teamContextId);
 if(!team?.sourceRefs?.length||extension.reference!=='EXISTING_NATIVE_SOURCE_ENEMY'||team.characterIds.length!==3||!team.characterIds.every(id=>extension.characterIds.includes(id)))throw Error('LOCAL_REFERENCE_EXTENSION_CONTEXT_DRIFT');
 sourceTeams.add(team.id);
}
export function localTeamReference(teamContextId){
 const source=sourceTeams.has(teamContextId);
 return {label:source?'Riley source model':'fixed reference',defense:source?1592:1520,resistance:source?0.2:0.1,
  enemy:{defense:source?1592:1520,resistanceByElement:Object.fromEntries(['Aero','Electro','Fusion','Glacio','Spectro','Havoc','Physical'].map(e=>[e,source?0.2:0.1])),damageReduction:0}};
}
