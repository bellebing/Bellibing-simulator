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
export function expectedMatchesAccountTeam(estimate,input,useReference){
 return estimate?.status==='ESTIMATED'&&estimate.characterId===input?.selectedCharacterId&&
  estimate.teamBuildIdentity===accountTeamBasis(input)&&Boolean(estimate.useReference)===Boolean(useReference);
}
