import catalog from './character-contexts.json' with {type:'json'};
import defaults from './sandbox-defaults.json' with {type:'json'};
export function characterContext(characterId,contextId=null,memberOrder=null){
 const character=catalog.characters.find(c=>c.characterId===characterId);
 if(!character)return null;
 const options=character.contextIds.map(id=>catalog.teams.find(t=>t.id===id));
 const id=contextId??character.defaultContextId;
 const team=options.find(t=>t.id===id)??null;
 const ordered=team&&Array.isArray(memberOrder)&&memberOrder[0]===characterId&&new Set(memberOrder).size===3&&memberOrder.every(id=>team.characterIds.includes(id))?memberOrder:null;
 return {character,options,team,memberIds:ordered??(team?[characterId,...team.characterIds.filter(id=>id!==characterId)]:[characterId,null,null]),
  status:team?(contextId?'USER_SELECTED_SOURCE_CONTEXT':character.defaultStatus):character.defaultStatus};
}
export function selectCharacterTeam(state,contextId){
 const context=characterContext(state.id,contextId);
 if(contextId&&!context?.options.some(t=>t.id===contextId))throw Error('TEAM_CONTEXT_NOT_AVAILABLE_FOR_CHARACTER');
 state.sandboxTeamContextId=contextId||null;
 state.sandboxTeamMemberOrder=null;
 // This source context is not an executable provider context. Always retire
 // any old expert run when the visible party changes.
 state.sandboxEvaluationContext=null;
 return characterContext(state.id,state.sandboxTeamContextId);
}
// A single portrait replaces one member only. Never construct a new combination.
export function teamSlotAlternatives(context,slot){
 if(!context?.team||![1,2].includes(slot))return [];
 const fixed=context.memberIds[slot===1?2:1],selected=context.memberIds[0];
 return context.options.filter(t=>t.characterIds.includes(fixed)).map(t=>({contextId:t.id,characterId:t.characterIds.find(id=>id!==selected&&id!==fixed),modeRequirements:t.modeRequirements})).filter(t=>t.characterId);
}
export function selectTeamSlot(state,slot,contextId){
 const current=characterContext(state.id,state.sandboxTeamContextId,state.sandboxTeamMemberOrder),option=teamSlotAlternatives(current,slot).find(t=>t.contextId===contextId);
 if(!option)throw Error('TEAM_SLOT_CONTEXT_NOT_AVAILABLE');
 const order=[...current.memberIds];order[slot]=option.characterId;
 selectCharacterTeam(state,contextId);state.sandboxTeamMemberOrder=order;
 return characterContext(state.id,contextId,order);
}
export function teamMemberStandards(context){
 return context.memberIds.map(id=>id?defaults.characters.find(c=>c.characterId===id)??null:null);
}
