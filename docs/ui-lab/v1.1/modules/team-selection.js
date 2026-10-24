import {characterContext,selectCharacterTeam} from './character-context.js';

// A source context owns the carry, partner, third-member role and mode.
// Never reinterpret the Character selected in the carousel as its carry.
export function sourceTeamRoles(team){
 if(!team)return null;
 const members=team.characterIds??[],used=new Set();
 const take=id=>{
  if(!id||!members.includes(id)||used.has(id))return null;
  used.add(id);return id;
 };
 const main=take(team.anchorCharacterId);
 const partner=take(team.roleAssignment?.partner);
 const third=take(team.roleAssignment?.support);
 const remaining=members.filter(id=>!used.has(id));
 // A source may give a third member no SUPPORT assignment: display FLEX,
 // not an invented healer/support fact.
 return {
  main:main??remaining.shift()??null,
  partner:partner??remaining.shift()??null,
  third:third??remaining.shift()??null,
  thirdRole:third?'Support':'Third member',
  sourceRoles:{main:team.anchorCharacterId??null,partner:team.roleAssignment?.partner??null,support:team.roleAssignment?.support??null}
 };
}
const modeSignature=team=>JSON.stringify(Object.entries(team?.modeRequirements??{}).sort(([a],[b])=>a.localeCompare(b)));
// Preserve modes of members who remain in the party. Requirements owned by
// a removed partner must not block a documented replacement core.
const compatibleSharedMode=(a,b)=>a.characterIds.filter(id=>b.characterIds.includes(id))
 .every(id=>(a.modeRequirements?.[id]??null)===(b.modeRequirements?.[id]??null));
const sameTrio=(a,b)=>a&&b&&a.characterIds.length===3&&b.characterIds.length===3&&a.characterIds.every(id=>b.characterIds.includes(id));

export function sourceTeamView(state){
 const source=characterContext(state.id,state.sandboxTeamContextId??null);
 if(!source)return null;
 const draft=state.sandboxTeamPendingCore??null,choice=state.sandboxTeamPendingChoice??null;
 const roles=sourceTeamRoles(source.team);
 const memberIds=choice?choice.memberIds:draft?[draft.main,draft.partner,null]:roles?[roles.main,roles.partner,roles.third]:[state.id,null,null];
 const pending=!!draft||!!choice;
 return {...source,roles:roles?{...roles,main:memberIds[0],partner:memberIds[1],third:memberIds[2],thirdRole:draft?.roleLabel??roles.thirdRole}:null,
  memberIds,pendingSupport:!!draft,pendingCore:draft,pendingChoice:choice,
  selectedTeam:pending?null:source.team,activeContextId:pending?null:source.team?.id??null,
  revision:state.sandboxTeamRevision??0};
}

export function sourceTeamChoices(state,role){
 const current=sourceTeamView(state),r=current?.roles;
 if(!r||current.pendingChoice)return [];
 const groups=new Map();
 for(const team of current.options){
  const n=sourceTeamRoles(team);
  if(!n||!team.sourceRefs?.length)continue;
  // A selected Character in the flex/third slot may lead an *existing* source
  // core with the former carry as partner. This unlocks Changli's reviewed
  // alternate without building a synthetic trio or silently keeping a third.
  const promoteSelectedThird=role==='main'&&!current.pendingCore&&r.third===state.id&&
   n.main===state.id&&n.partner===r.main;
  if(role==='main'&&n.partner!==r.partner&&!promoteSelectedThird||
     role==='partner'&&n.main!==r.main||
     role==='third'&&(n.main!==r.main||n.partner!==r.partner)||
     !['main','partner','third'].includes(role))continue;
  // A blank third slot retains its explicitly chosen core modes.
  if(current.pendingCore&&[r.main,r.partner].some(id=>(current.pendingCore.modeRequirements?.[id]??null)!==(team.modeRequirements?.[id]??null)))continue;
  const id=n[role];if(!id)continue;
  if(!groups.has(id))groups.set(id,{characterId:id,contexts:[]});
  groups.get(id).contexts.push(team);
 }
 return [...groups.values()].map(group=>({...group,contextId:group.contexts[0].id,team:group.contexts[0]}));
}
// Conditions are material too: identical modes with different source restrictions
// cannot be silently collapsed into one executable context.
const contextMeaning=t=>JSON.stringify({roles:sourceTeamRoles(t),modes:Object.entries(t.modeRequirements??{}).sort(),conditions:[...(t.conditions??[])].sort()});
export function sourceTeamVariantChoices(state){
 return (state.sandboxTeamPendingChoice?.contextIds??[]).map(id=>characterContext(state.id,id)?.team).filter(Boolean);
}
export function sourceTeamModeChoices(state){
 const current=sourceTeamView(state);
 if(current?.pendingSupport)return [];
 return current?.team?current.options.filter(t=>sameTrio(t,current.team)&&modeSignature(t)!==modeSignature(current.team)):[]; 
}

function changed(state){
 state.sandboxTeamRevision=(state.sandboxTeamRevision??0)+1;
 state.sandboxTeamMemberOrder=null;
 state.sandboxEvaluationContext=null;
}
export function chooseSourceTeam(state,contextId=null){
 // This remains the one canonical availability/membership check.
 selectCharacterTeam(state,contextId);
 state.sandboxTeamPendingCore=null;
 state.sandboxTeamPendingChoice=null;
 changed(state);
 return sourceTeamView(state);
}
function commitRole(state,team,keepThird){
 const next=sourceTeamRoles(team);
 selectCharacterTeam(state,team.id);
 state.sandboxTeamPendingChoice=null;
 state.sandboxTeamPendingCore=keepThird?null:{main:next.main,partner:next.partner,roleLabel:next.thirdRole,modeRequirements:{...team.modeRequirements}};
 changed(state);
 return sourceTeamView(state);
}
export function chooseSourceTeamRole(state,role,characterId){
 const view=sourceTeamView(state),choices=sourceTeamChoices(state,role);
 // Context IDs remain a checked compatibility input for existing integrations;
 // ordinary UI choices are Character IDs and never commit a full team directly.
 const exact=choices.flatMap(c=>c.contexts).find(t=>t.id===characterId);
 const option=choices.find(c=>c.characterId===characterId||c.contexts.some(t=>t.id===characterId));
 if(!view||!option)throw Error('TEAM_ROLE_CONTEXT_NOT_AVAILABLE');
 let candidates=exact?[exact]:option.contexts;
 const retaining=candidates.filter(t=>sourceTeamRoles(t).third===view.roles.third);
 const keepThird=role==='third'||retaining.length>0;
 if(role!=='third'&&retaining.length)candidates=retaining;
 if(option.characterId!==view.roles[role]){const compatible=candidates.filter(t=>compatibleSharedMode(view.team,t));if(compatible.length)candidates=compatible;}
 const meanings=new Map();for(const t of candidates){const n=sourceTeamRoles(t),meaning=keepThird?contextMeaning(t):JSON.stringify([n.main,n.partner].map(id=>[id,t.modeRequirements?.[id]??null]));if(!meanings.has(meaning))meanings.set(meaning,t);}
 candidates=[...meanings.values()];
 if(candidates.length===1)return commitRole(state,candidates[0],keepThird);
 const next=sourceTeamRoles(candidates[0]);
 // The seed supplies provenance only. Pending never owns a complete DPS context.
 selectCharacterTeam(state,candidates[0].id);state.sandboxTeamPendingCore=null;
 state.sandboxTeamPendingChoice={role,characterId:option.characterId,contextIds:candidates.map(t=>t.id),keepThird,memberIds:[next.main,next.partner,keepThird?next.third:null]};
 changed(state);return sourceTeamView(state);
}
export function chooseSourceTeamVariant(state,contextId){
 const pending=state.sandboxTeamPendingChoice,team=sourceTeamVariantChoices(state).find(t=>t.id===contextId);
 if(!pending||!team)throw Error('TEAM_VARIANT_CONTEXT_NOT_AVAILABLE');
 return commitRole(state,team,pending.keepThird);
}
