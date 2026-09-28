import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createCharacterBuilderAssetResolver } from '../src/characterBuilderAssets.ts';
import { projectSequenceCharacter } from '../src/characterSequenceUi.mjs';

const manifestPath=resolve('docs/ui-prototypes/assets/builder-icons/manifest.json');
const sourcePath=resolve('data/source/character-sequence-ui.json');
const defaultOutput='docs/ui-prototypes/assets/sequence-runtime.json';
const check=process.argv.includes('--check');
const outputArg=process.argv.indexOf('--output');
const output=resolve(outputArg>=0?process.argv[outputArg+1]:defaultOutput);

const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
const source=JSON.parse(readFileSync(sourcePath,'utf8'));
if(source.schemaVersion!==1||source.role!=='character-builder.sequence-source'||!Array.isArray(source.characters))throw new Error('Unsupported Sequence source snapshot');
const resolver=createCharacterBuilderAssetResolver(manifest);
const sourceByCharacterId=new Map(source.characters.map(character=>[character.characterId,character]));
const characters=[...resolver.listCharacterIds()].sort().map(characterId=>{
  const assets=resolver.resolve(characterId);
  if(!assets)throw new Error('Released Character failed builder resolver: '+characterId);
  const projected=projectSequenceCharacter(sourceByCharacterId.get(characterId),assets);
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
const sourceBackedChains=characters.flatMap(character=>character.chains).filter(chain=>chain.contentStatus==='SOURCE_BACKED').length;
const pendingChains=characters.length*6-sourceBackedChains;
const payload={
  schemaVersion:2,
  role:'character-builder.runtime-sequences',
  generatedFrom:[
    'docs/ui-prototypes/assets/builder-icons/manifest.json',
    'data/source/character-sequence-ui.json',
    'src/characterBuilderAssets.ts#createCharacterBuilderAssetResolver',
    'src/characterSequenceUi.mjs#projectSequenceCharacter',
  ],
  provenance:source.provenance,
  summary:{releasedCharacters:characters.length,sourceBackedChains,pendingChains},
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
  console.log('Character builder Sequence runtime data verified: '+characters.length+' released Characters / '+sourceBackedChains+' source-backed Sequence details / '+pendingChains+' Pending.');
}else{
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,serialized);
  console.log('Exported Character builder Sequence runtime data: '+output);
}
