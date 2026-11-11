// Presentation freshness only. Model evaluation and upgrade policy stay private.
export function accountTeamBasis(input){
 return JSON.stringify({mode:input?.mode,selectedCharacterId:input?.selectedCharacterId,team:input?.team,
  records:[...(input?.records??[])].sort((a,b)=>a.characterId.localeCompare(b.characterId)).map(r=>({characterId:r.characterId,status:r.status,buildState:r.buildState})),
  investments:input?.actualInvestments,scope:input?.scope});
}
export function sameDpsModelBasis(a,b){
 const aKey=a?.comparisonIdentity??a?.contextIdentity,bKey=b?.comparisonIdentity??b?.contextIdentity;
 return typeof aKey==='string'&&/^[a-f0-9]{64}$/.test(aKey)&&aKey===bKey&&
  typeof a?.provider?.sourceBinding==='string'&&/^[a-f0-9]{64}$/.test(a.provider.sourceBinding)&&a.provider.sourceBinding===b?.provider?.sourceBinding;
}
// Display comparison only; never used by the stat-target policy or Equip.
export function dpsComparisonWinner(current,candidate){
 const valid=r=>r?.status==='EXPERIMENTAL'&&r.rotationAcceptance?.status==='MET'||r?.status==='CONDITIONAL'&&r.basis==='PLANNED_ROTATION_ASSUMING_ENERGY_AVAILABLE'&&r.rotationAcceptance?.status==='NOT_MET';
 if(!valid(current)||!valid(candidate)||!sameDpsModelBasis(current,candidate)||![current.teamTotal,candidate.teamTotal].every(n=>Number.isFinite(n)&&n>=0))return null;
 const delta=candidate.teamTotal-current.teamTotal,tolerance=1e-9*Math.max(1,current.teamTotal,candidate.teamTotal);
 return Math.abs(delta)<=tolerance?null:delta>0?'new':'current';
}
export function expectedMatchesAccountTeam(estimate,input,useReference){
 return estimate?.status==='ESTIMATED'&&estimate.characterId===input?.selectedCharacterId&&
  estimate.teamBuildIdentity===accountTeamBasis(input)&&Boolean(estimate.useReference)===Boolean(useReference);
}

export function dpsValueDirection(value,other){
 if(![value,other].every(n=>Number.isFinite(n)&&n>=0))return 'equal';
 const delta=value-other,tolerance=1e-9*Math.max(1,value,other);
 return Math.abs(delta)<=tolerance?'equal':delta>0?'up':'down';
}
