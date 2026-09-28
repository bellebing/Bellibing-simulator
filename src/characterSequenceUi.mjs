const fail=message=>{throw Error('Sequence source: '+message)};

export function sequenceSourceText(template,params=[]){
  if(typeof template!=='string'||!template.trim())return null;
  let missing=false;
  const result=template.replace(/\{(\d+)\}/g,(_,index)=>{
    const value=params[Number(index)];
    if(value===undefined){missing=true;return ''}
    return String(value);
  });
  return missing?null:result.replace(/<[^>]*>/g,'');
}

export function projectSequenceCharacter(source,assets){
  if(!assets)fail('Missing released Character assets');
  if(source&&source.characterId!==assets.characterId)fail('Character identity mismatch '+assets.characterId);
  const rows=Array.isArray(source?.chains)?source.chains:[];
  const ids=new Set();
  for(const row of rows){
    if(!Number.isInteger(row?.sourceChainId)||ids.has(row.sourceChainId))fail('Duplicate/invalid sourceChainId '+assets.characterId);
    ids.add(row.sourceChainId);
  }
  const chains=assets.chains.map(asset=>{
    const row=rows.find(candidate=>candidate.sourceChainId===asset.sourceChainId);
    if(row&&row.sequence!==asset.sequence)fail('Sequence identity mismatch '+assets.characterId+' S'+asset.sequence);
    const name=sequenceSourceText(row?.name,[]);
    const description=sequenceSourceText(row?.descriptionTemplate,row?.params);
    return {
      sequence:asset.sequence,
      sourceChainId:asset.sourceChainId,
      assetId:asset.assetId,
      assetPath:asset.assetPath,
      contentStatus:name&&description?'SOURCE_BACKED':'PENDING',
      name,
      description,
    };
  });
  return {
    characterId:assets.characterId,
    characterName:assets.characterName,
    releaseStatus:assets.releaseStatus,
    status:chains.every(chain=>chain.contentStatus==='SOURCE_BACKED')?'SOURCE_BACKED':'PARTIAL',
    chains,
  };
}
