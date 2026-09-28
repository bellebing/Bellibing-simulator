import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createCharacterBuilderAssetResolver } from '../src/characterBuilderAssets.ts';
import { projectSequenceCharacter } from '../src/characterSequenceUi.mjs';
import { projectSequenceBuildStatReview } from '../src/characterSequenceBuildStats.mjs';

const manifestPath=resolve('docs/ui-prototypes/assets/builder-icons/manifest.json');
const sourcePath=resolve('data/source/character-sequence-ui.json');
const reviewPath=resolve('data/source/character-sequence-build-stat-review.json');
const defaultOutput='docs/ui-prototypes/assets/sequence-runtime.json';
const check=process.argv.includes('--check');
const outputArg=process.argv.indexOf('--output');
const output=resolve(outputArg>=0?process.argv[outputArg+1]:defaultOutput);

const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
const source=JSON.parse(readFileSync(sourcePath,'utf8'));
const review=JSON.parse(readFileSync(reviewPath,'utf8'));
if(source.schemaVersion!==1||source.role!=='character-builder.sequence-source'||!Array.isArray(source.characters))throw new Error('Unsupported Sequence source snapshot');
if(review.schemaVersion!==1||review.role!=='character-builder.sequence-build-stat-review'||!Array.isArray(review.characters))throw new Error('Unsupported Sequence build-stat review');
if(review.provenance?.pinnedCharacters?.commit!==source.provenance?.characters?.commit||review.provenance?.pinnedCharacters?.gitBlobSha!==source.provenance?.characters?.gitBlobSha)throw new Error('Sequence build-stat review provenance drifted');
const resolver=createCharacterBuilderAssetResolver(manifest);
const sourceByCharacterId=new Map(source.characters.map(character=>[character.characterId,character]));
const reviewByCharacterId=new Map(review.characters.map(character=>[character.characterId,character]));
const characters=[...resolver.listCharacterIds()].sort().map(characterId=>{
  const assets=resolver.resolve(characterId);
  if(!assets)throw new Error('Released Character failed builder resolver: '+characterId);
  const sourceCharacter=sourceByCharacterId.get(characterId);
  const projected=projectSequenceBuildStatReview(projectSequenceCharacter(sourceCharacter,assets),sourceCharacter,reviewByCharacterId.get(characterId));
  const skills={};
  for(const [role,skill] of Object.entries(assets.skills)){
    if(!skill)continue;
    skills[role]={role,assetId:skill.assetId,assetPath:skill.assetPath};
  }
  return {
    characterId:projected.characterId,
    characterName:projected.characterName,
    releaseStatus:projected.releaseStatus,
    chains:projected.chains,
    skills,
  };
});
const chains=characters.flatMap(character=>character.chains);
const sourceBackedChains=chains.filter(chain=>chain.contentStatus==='SOURCE_BACKED').length;
const pendingChains=characters.length*6-sourceBackedChains;
const staticBuildStatSequences=chains.filter(chain=>chain.buildStatClassification==='STATIC_BUILD_STAT').length;
const nonStaticMechanicSequences=chains.filter(chain=>chain.buildStatClassification==='NON_STATIC_MECHANIC').length;
const pendingBuildStatReviewSequences=chains.filter(chain=>chain.buildStatClassification==='PENDING').length;
const payload={
  schemaVersion:3,
  role:'character-builder.runtime-sequences',
  generatedFrom:[
    'docs/ui-prototypes/assets/builder-icons/manifest.json',
    'data/source/character-sequence-ui.json',
    'data/source/character-sequence-build-stat-review.json',
    'src/characterBuilderAssets.ts#createCharacterBuilderAssetResolver',
    'src/characterSequenceUi.mjs#projectSequenceCharacter',
    'src/characterSequenceBuildStats.mjs#projectSequenceBuildStatReview',
  ],
  provenance:source.provenance,
  summary:{releasedCharacters:characters.length,sourceBackedChains,pendingChains,staticBuildStatSequences,nonStaticMechanicSequences,pendingBuildStatReviewSequences},
  characters,
};
const serialized=JSON.stringify(payload,null,2)+'\n';

if(check){
  const existing=JSON.parse(readFileSync(output,'utf8'));
  if(JSON.stringify(existing)!==JSON.stringify(payload)){
    console.error('Character builder Sequence runtime data is stale: '+output);
    console.error('Run: node --experimental-strip-types scripts/export-ui-character-builder-runtime.ts');
    process.exit(1);
  }
  console.log('Character builder Sequence runtime verified: '+characters.length+' released Characters / '+sourceBackedChains+' source-backed details / '+staticBuildStatSequences+' static Build-stat Sequences / '+pendingBuildStatReviewSequences+' Pending review.');
}else{
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,serialized);
  console.log('Exported Character builder Sequence runtime data: '+output);
}
