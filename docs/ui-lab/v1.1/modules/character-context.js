import catalog from './character-contexts.json' with {type:'json'};
import defaults from './sandbox-defaults.json' with {type:'json'};
export function characterContext(characterId,contextId=null){
 const character=catalog.characters.find(c=>c.characterId===characterId);
 if(!character)return null;
 const options=character.contextIds.map(id=>catalog.teams.find(t=>t.id===id));
 const id=contextId??character.defaultContextId;
 const team=options.find(t=>t.id===id)??null;
 return {character,options,team,memberIds:team?[characterId,...team.characterIds.filter(id=>id!==characterId)]:[characterId,null,null],
  status:team?(contextId?'USER_SELECTED_SOURCE_CONTEXT':character.defaultStatus):character.defaultStatus};
}
export function selectCharacterTeam(state,contextId){
 const context=characterContext(state.id,contextId);
 if(contextId&&!context?.options.some(t=>t.id===contextId))throw Error('TEAM_CONTEXT_NOT_AVAILABLE_FOR_CHARACTER');
 state.sandboxTeamContextId=contextId||null;
 // This source context is not an executable provider context. Always retire
 // any old expert run when the visible party changes.
 state.sandboxEvaluationContext=null;
 return characterContext(state.id,state.sandboxTeamContextId);
}
export function teamMemberStandards(context){
 return context.memberIds.map(id=>id?defaults.characters.find(c=>c.characterId===id)??null:null);
}
