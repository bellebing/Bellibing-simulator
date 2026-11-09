// Reviewed compositions supply suggestions, never a fabricated DPS ranking.
export function suggestAccountTeams(ownedIds,contexts,excluded=[]){
 const remaining=new Set(ownedIds.filter(id=>!excluded.includes(id))),result=[];
 const reviewed=contexts.filter(row=>row.evidenceBasis!=='PUBLISHED_MODEL_ROSTER_ONLY'&&row.characterIds.length===3);
 while(remaining.size){
  const candidates=reviewed.map((context,index)=>({context,index,members:context.characterIds.filter(id=>remaining.has(id))}))
   .filter(row=>row.members.length&&!row.context.characterIds.some(id=>ownedIds.includes(id)&&!remaining.has(id)))
   .sort((a,b)=>b.members.length-a.members.length||a.index-b.index);
  const best=candidates[0],members=best?.members??[[...remaining][0]];
  result.push({characterIds:[...members,...Array(3-members.length).fill(null)],context:best?.context??null});
  members.forEach(id=>remaining.delete(id));
 }
 return result;
}
