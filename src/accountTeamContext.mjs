// Public transport/presentation only. A player-selected trio is not a guide
// recommendation or proof that its rotation can execute.
import contexts from '../docs/ui-lab/v1.1/modules/character-contexts.json' with {type:'json'};
const prefix='account-native:';
export function accountTeamContext(id){
 if(typeof id!=='string'||id.length>256||!id.startsWith(prefix))return null;
 const characterIds=id.slice(prefix.length).split(',');
 if(characterIds.length!==3||new Set(characterIds).size!==3||characterIds.some(id=>!contexts.characters.some(c=>c.characterId===id)))return null;
 const members=characterIds.map(id=>contexts.characters.find(c=>c.characterId===id));
 const modeRequirements=Object.fromEntries(members.flatMap(c=>c.defaultBasis?.modeRequirements?.[c.characterId]?[[c.characterId,c.defaultBasis.modeRequirements[c.characterId]]]:[]));
 return {id,anchorCharacterId:characterIds[0],characterIds,relationship:'PLAYER_SELECTED_TRIO',roleAssignment:{partner:characterIds[1]},modeRequirements,
  compositionBasis:'EXPERIMENTAL_MEMBER_MODULES',conditions:['First member is the model main damage dealer. Reviewed default member modes; compatible native opening and handoffs. Model estimate, not a guide-recommended team.'],
  sourceRefs:members.flatMap(c=>c.recommendations?.sourceUrl?[{provider:'MEMBER_SOURCE',url:c.recommendations.sourceUrl,locator:'Individual Character only; not evidence for the complete trio.'}]:[])};
}
export function accountTeamContextId(characterIds){
 if(!Array.isArray(characterIds))return null;
 const id=prefix+characterIds.join(',');return accountTeamContext(id)?id:null;
}
