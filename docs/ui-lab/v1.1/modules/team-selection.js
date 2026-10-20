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
  thirdRole:third?'Support':'Flex / third member',
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
 const draft=state.sandboxTeamPendingCore??null;
 const roles=sourceTeamRoles(source.team);
 const memberIds=draft?[draft.main,draft.partner,null]:roles?[roles.main,roles.partner,roles.third]:[state.id,null,null];
 return {...source,roles:roles?{...roles,main:memberIds[0],partner:memberIds[1],third:memberIds[2]}:null,
  memberIds,pendingSupport:!!draft,pendingCore:draft,
  // A candidate context only establishes what supports may be proposed.
  // It is NOT a selected complete team while the third slot is blank.
  selectedTeam:draft?null:source.team,
  activeContextId:draft?null:source.team?.id??null,
  revision:state.sandboxTeamRevision??0};
}

export function sourceTeamChoices(state,role){
 const current=sourceTeamView(state),r=current?.roles;
 if(!r)return [];
 const rows=current.options.filter(t=>{
  const n=sourceTeamRoles(t);
  if(!n||!t.sourceRefs?.length||!compatibleSharedMode(current.team,t))return false;
  if(role==='main')return n.partner===r.partner&&n.main!==r.main;
  if(role==='partner')return n.main===r.main&&n.partner!==r.partner;
  if(role==='third')return n.main===r.main&&n.partner===r.partner&&n.third!==r.third;
  return false;
 });
 // The returned unit is a reviewed, full context ID. Never independently
 // cross-product proposed partners and supports.
 return rows.map(t=>({contextId:t.id,characterId:sourceTeamRoles(t)[role],team:t,
  modeRequirements:t.modeRequirements,conditions:t.conditionsSv,sourceRefs:t.sourceRefs}));
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
 changed(state);
 return sourceTeamView(state);
}
export function chooseSourceTeamRole(state,role,contextId){
 const view=sourceTeamView(state),option=sourceTeamChoices(state,role).find(c=>c.contextId===contextId);
 if(!view||!option)throw Error('TEAM_ROLE_CONTEXT_NOT_AVAILABLE');
 const next=sourceTeamRoles(option.team),old=view.roles;
 // Choosing a new partner or carry may preserve the old third member ONLY
 // when the complete reviewed trio and exact mode prove it is supported.
 // Otherwise that slot is explicitly empty until the user chooses it.
 const keepThird=(role==='third')||next.third===old.third;
 selectCharacterTeam(state,option.contextId);
 state.sandboxTeamPendingCore=keepThird?null:{
  main:next.main,partner:next.partner,
  roleLabel:next.thirdRole,modeRequirements:{...option.team.modeRequirements}
 };
 changed(state);
 return sourceTeamView(state);
}
