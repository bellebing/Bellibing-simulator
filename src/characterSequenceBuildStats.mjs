import { sequenceSourceText } from './characterSequenceUi.mjs';

export const SEQUENCE_BUILD_STAT_CLASSIFICATIONS=Object.freeze(['STATIC_BUILD_STAT','NON_STATIC_MECHANIC','PENDING']);
const CLASSIFICATIONS=new Set(SEQUENCE_BUILD_STAT_CLASSIFICATIONS);
const SUPPORTED_STATIC_STATS=new Set([
  'HP%','ATK%','DEF%','CRIT Rate','CRIT DMG','Energy Regen','Healing Bonus',
  'Aero DMG','Fusion DMG','Glacio DMG','Electro DMG','Spectro DMG','Havoc DMG',
  'Basic Attack DMG','Heavy Attack DMG','Skill DMG','Liberation DMG'
]);
const fail=message=>{throw Error('Sequence build-stat review: '+message)};

export function projectSequenceBuildStatReview(projected,source,review){
  if(!projected||!source||!review)fail('Missing projected/source/review Character');
  if(projected.characterId!==source.characterId||review.characterId!==source.characterId)fail('Character identity mismatch '+source.characterId);
  if(!Array.isArray(projected.chains)||!Array.isArray(source.chains)||!Array.isArray(review.chains)||projected.chains.length!==6||source.chains.length!==6||review.chains.length!==6)fail('Incomplete S1-S6 review '+source.characterId);
  const sourceById=new Map(source.chains.map(chain=>[chain.sourceChainId,chain]));
  const reviewById=new Map(review.chains.map(chain=>[chain.sourceChainId,chain]));
  if(sourceById.size!==6||reviewById.size!==6)fail('Duplicate sourceChainId '+source.characterId);
  return {
    ...projected,
    chains:projected.chains.map(chain=>{
      const raw=sourceById.get(chain.sourceChainId),row=reviewById.get(chain.sourceChainId);
      if(!raw||!row||raw.sequence!==chain.sequence||row.sequence!==chain.sequence)fail('Sequence identity mismatch '+source.characterId+' S'+chain.sequence);
      if(!CLASSIFICATIONS.has(row.classification))fail('Unknown classification '+source.characterId+' S'+chain.sequence);
      const facts=Array.isArray(row.staticBuildStats)?row.staticBuildStats:[];
      if(row.classification==='STATIC_BUILD_STAT'&&!facts.length)fail('Static Sequence missing facts '+source.characterId+' S'+chain.sequence);
      if(row.classification!=='STATIC_BUILD_STAT'&&facts.length)fail('Non-static Sequence carries static facts '+source.characterId+' S'+chain.sequence);
      const description=sequenceSourceText(raw.descriptionTemplate,raw.params);
      const staticBuildStats=facts.map(fact=>{
        if(!SUPPORTED_STATIC_STATS.has(fact?.stat)||typeof fact.value!=='number'||!Number.isFinite(fact.value))fail('Unsupported static fact '+source.characterId+' S'+chain.sequence);
        if(fact.sourceSequence?.characterId!==source.characterId||fact.sourceSequence?.sequence!==chain.sequence||fact.sourceSequence?.sourceChainId!==chain.sourceChainId)fail('Static fact source identity mismatch '+source.characterId+' S'+chain.sequence);
        if(!fact.provenance?.repository||!fact.provenance?.commit||!fact.provenance?.path||!fact.provenance?.gitBlobSha||!fact.provenance?.sourceText||!description?.includes(fact.provenance.sourceText))fail('Static fact provenance mismatch '+source.characterId+' S'+chain.sequence);
        return {
          stat:fact.stat,
          value:fact.value,
          sourceSequence:{...fact.sourceSequence},
          provenance:{...fact.provenance},
        };
      });
      return {...chain,buildStatClassification:row.classification,staticBuildStats};
    })
  };
}

export function activeSequenceBuildStats(character,level){
  const sequenceLevel=Number(level);
  if(!Number.isInteger(sequenceLevel)||sequenceLevel<0||sequenceLevel>6)fail('Invalid active Sequence level');
  if(!character||!Array.isArray(character.chains)||character.chains.length!==6)fail('Missing reviewed runtime Character');
  return character.chains
    .filter(chain=>chain.sequence<=sequenceLevel&&chain.buildStatClassification==='STATIC_BUILD_STAT')
    .flatMap(chain=>(chain.staticBuildStats??[]).map(fact=>({
      stat:fact.stat,
      value:fact.value,
      sourceSequence:{...fact.sourceSequence},
      provenance:{...fact.provenance},
    })));
}
