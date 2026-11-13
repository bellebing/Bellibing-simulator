// Deterministic original-game source evidence extractor.
// Never add default gameplay values; never write to canonical or DPS owners.
const expectOne=(rows,key,value)=>{
 const found=(rows??[]).filter(row=>row?.[key]===value);
 if(found.length!==1)throw Error('Source identity mismatch: '+key+'='+value+' ('+found.length+' rows).');
 return found[0];
};
const select=(object,keys)=>Object.fromEntries(keys.map(key=>[key,object?.[key]??null]));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function captureCharacterSourceEvidence(review, input, provenance) {
 if(review?.kind!=='EXTERNAL_RELEASE_IDENTITY_EVIDENCE_ONLY' ||
   !/^[a-z][a-z0-9-]*$/.test(review.characterId) || !Number.isInteger(review.sourceCapture?.sourceRoleId))
   throw Error('Explicit published source identity/role mapping is required.');
 const id=review.sourceCapture.sourceRoleId;
 const role=expectOne(input.roles,'Id',id);
 if(role.IsTrial===true || role.PropertyId!==id || role.SkillTreeGroupId!==id || role.ResonantChainGroupId!==id ||
    role.Name!==review.sourceCapture.originalRoleNameKey)
   throw Error('Role source identity/properties do not match the reviewed mapping.');
 const provider=expectOne(input.characters,'id',id);
 if(provider.name?.en!==review.name || provider.element?.name?.en!==review.identity.element ||
   provider.weapon?.name?.en!==review.identity.weaponType || provider.rarity?.id!==review.identity.rarity ||
   provider.weapon?.id!==role.WeaponType || provider.element?.id!==role.ElementId || provider.rarity?.id!==role.QualityId)
   throw Error('Original-game identity and provider translation disagree. Human review required.');
 const base=expectOne(input.base,'Id',role.PropertyId);
 if(!equal([base.LifeMax,base.Atk,base.Def],[provider.stats.life,provider.stats.atk,provider.stats.def]))
   throw Error('Core Lv1 source stats conflict with pinned structured provider.');
 if(!Number.isInteger(base.EnergyMax) || base.EnergyMax<=0 ||
   !Number.isInteger(base.Crit) || !Number.isInteger(base.CritDamage) || !Number.isInteger(base.EnergyEfficiency))
   throw Error('Invalid original base combat/energy source.');
 const level90=expectOne(input.growth,'Id',96);
 if(level90.Level!==90 || level90.BreachLevel!==6 ||
   ![level90.LifeMaxRatio,level90.AtkRatio,level90.DefRatio].every(Number.isFinite))
   throw Error('Missing explicitly identified Lv90 / last-ascension source growth.');
 const tree=input.tree.filter(node=>node.NodeGroup===role.SkillTreeGroupId);
 if(tree.length!==17 || new Set(tree.map(node=>node.NodeIndex)).size!==17)
   throw Error('Original Forte tree incomplete/duplicated.');
 const statNodes=tree.filter(node=>node.NodeType===4);
 if(statNodes.length!==8 || provider.skillTrees?.length!==8 ||
   statNodes.some(node=>!provider.skillTrees.some(candidate=>candidate.id===node.Id &&
     candidate.value?.[0]?.id===node.Property?.[0]?.Id)))
   throw Error('Forte nodes are not source-correlated; no fabricated intrinsics.');
 const chains=input.chains.filter(chain=>chain.GroupId===role.ResonantChainGroupId)
   .sort((a,b)=>a.GroupIndex-b.GroupIndex);
 if(chains.length!==6 || provider.chains?.length!==6 ||
   chains.some((chain,i)=>chain.GroupIndex!==i+1 || chain.Id!==provider.chains[i]?.id))
   throw Error('Sequence source chains do not match provider IDs/order.');
 const skills=provider.moves??[];
 if(!Array.isArray(skills) || skills.length<8 || skills.some(move=>!Number.isInteger(move.id) || !move.name?.en))
   throw Error('Missing source-backed skill names/levels.');
 const mapped=statNodes.map(node=>({
   nodeIndex:node.NodeIndex,nodeId:node.Id,sourceProperty:node.Property,
   sourceParams:node.PropertyNodeParam,
   displayName:provider.skillTrees.find(s=>s.id===node.Id).name,
   reviewedDisplayValues:provider.skillTrees.find(s=>s.id===node.Id).valueText,
 }));
 return {
  schemaVersion:1,role:'character-import.original-structured-source-evidence',canonicalAuthority:false,
  promotionPolicy:'INDEPENDENT_FIELD_AND_MECHANIC_REVIEW_REQUIRED',
  characterId:review.characterId,characterName:review.name,releasePatch:review.originalPatch,originalReleaseDate:review.originalDate,
  sourceRoleId:id,sourceIdentity:select(role,['Id','Name','QualityId','WeaponType','ElementId','PropertyId','SkillTreeGroupId','ResonantChainGroupId','SkillId','MaxLevel','FormationRoleCard']),
  level1:select(base,['Id','Lv','LifeMax','Atk','Def','EnergyMax','Crit','CritDamage','EnergyEfficiency','ElementEnergyMax']),
  level90GrowthSource:select(level90,['Id','Level','BreachLevel','LifeMaxRatio','AtkRatio','DefRatio']),
  intrinsicSourceNodes:mapped,
  forteTree:tree,
  sequences:provider.chains.map((chain,index)=>({
    sequence:index+1,sourceChainId:chain.id,name:chain.name.en,
    descriptionTemplate:chain.description?.en??null,params:chain.param??[],sourceIcon:chain.icon,
  })),
  skills:skills.map(move=>({
    sourceSkillId:move.id,sourceSkillType:move.type,sourceSort:move.sort,
    name:move.name.en,descriptionTemplate:move.description?.en??null,
    descriptionParams:move.descriptionParams,maxLevel:move.maxLevel,
    values:(move.values??[]).map(value=>({sourceId:value.id,name:value.name?.en??null,levels:value.values})),
  })),
  sourceIcons:provider.skillIcons,
  sourceArt:{portrait:provider.icon?.iconRound??null,hero:provider.icon?.banner??null},
  provenance,
  notes:['Source-backed Lv1 and growth ratios are retained separately. Do NOT infer published Lv90 integer rounding.','EnergyMax is raw client capacity, not Resonance Liberation cost or a Forte gauge.','Descriptions, levels, Sequences and intrinsic source IDs are evidence; mechanics remain RAW_ONLY/PENDING until reviewed and modeled.','Pinned source image paths are not imported asset files or approved UI framing.'],
 };
}
