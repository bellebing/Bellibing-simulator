import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createCharacterBuilderAssetResolver } from '../src/characterBuilderAssets.ts';
import { readCharacterActionValues } from '../src/characterActionValues.ts';
import { CHARACTER_MECHANIC_FACTS } from '../src/data/characterMechanics.ts';

const manifestPath=resolve('docs/ui-prototypes/assets/builder-icons/manifest.json');
const defaultOutput='docs/ui-prototypes/assets/skills-runtime.json';
const check=process.argv.includes('--check');
const outputArg=process.argv.indexOf('--output');
const output=resolve(outputArg>=0?process.argv[outputArg+1]:defaultOutput);
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
const resolver=createCharacterBuilderAssetResolver(manifest);

const ROLE_SECTION={
  'normal-attack':'BASIC_ATTACK',
  skill:'RESONANCE_SKILL',
  circuit:'FORTE_CIRCUIT',
  liberation:'RESONANCE_LIBERATION',
  intro:'INTRO_SKILL',
  outro:'OUTRO_SKILL',
};
const MAIN_ROLES=['normal-attack','skill','circuit','liberation','intro','outro'];

function sourceFact(fact){
  const common={
    factId:fact.factId,
    name:fact.name,
    kind:fact.kind,
    section:fact.section,
    verificationStatus:fact.verificationStatus,
    modelingStatus:fact.modelingStatus,
    conditional:fact.conditional,
    notes:fact.notes??[],
  };
  if(fact.kind==='ACTION'){
    return{
      ...common,
      actionKind:fact.actionKind,
      actionRole:fact.actionRole,
      damageClass:fact.damageClass,
      damageClasses:fact.damageClasses??null,
      scalingStat:fact.scalingStat,
      skillLevel:Array.isArray(fact.motionValueCurve)||Array.isArray(fact.motionValueComponents)?10:null,
      sourceValue:readCharacterActionValues(fact,10),
    };
  }
  if(fact.kind==='PASSIVE'){
    return{
      ...common,
      scope:fact.scope,
      triggerSummary:fact.triggerSummary,
      effectSummary:fact.effectSummary,
      durationSeconds:fact.durationSeconds,
      maxStacks:fact.maxStacks,
    };
  }
  if(fact.kind==='RESOURCE'){
    return{
      ...common,
      resourceName:fact.resourceName,
      maxValue:fact.maxValue,
      ruleSummary:fact.ruleSummary,
    };
  }
  return common;
}

const characters=[...resolver.listCharacterIds()].sort().map(characterId=>{
  const assets=resolver.resolve(characterId);
  if(!assets)throw new Error('Released Character failed builder resolver: '+characterId);
  const verified=CHARACTER_MECHANIC_FACTS.filter(fact=>fact.characterId===characterId&&fact.verificationStatus==='VERIFIED'&&fact.kind!=='SEQUENCE');
  const roles={};
  for(const role of MAIN_ROLES){
    const facts=verified.filter(fact=>fact.section===ROLE_SECTION[role]).map(sourceFact);
    roles[role]={
      status:facts.length?'SOURCE_BACKED':'PENDING',
      pendingReason:facts.length?null:'No verified canonical Character mechanic fact is available for this skill yet.',
      facts,
    };
  }
  const inherentFacts=verified.filter(fact=>fact.section==='INHERENT_SKILL');
  const inherentSlots=['inherent-1','inherent-2'].filter(role=>assets.skills[role]);
  const exactSingle=inherentFacts.length===1&&inherentSlots.length===1;
  for(const role of inherentSlots){
    roles[role]=exactSingle?{
      status:'SOURCE_BACKED',
      pendingReason:null,
      facts:[sourceFact(inherentFacts[0])],
    }:{
      status:'PENDING',
      pendingReason:inherentFacts.length
        ?'Verified Inherent Skill facts exist, but the current canonical data does not explicitly bind the Inherent I / II icon slots to fact IDs. Bellibing leaves this node pending instead of guessing the mapping.'
        :'No verified canonical Inherent Skill mechanic is mapped for this Character yet.',
      facts:[],
    };
  }
  return{
    characterId,
    characterName:assets.characterName,
    roles,
    unmappedInherentFactIds:exactSingle?[]:inherentFacts.map(fact=>fact.factId),
  };
});

const payload={
  schemaVersion:1,
  role:'character-builder.runtime-skills',
  generatedFrom:[
    'src/data/characterMechanics.ts#CHARACTER_MECHANIC_FACTS',
    'src/characterActionValues.ts#readCharacterActionValues',
    'src/characterBuilderAssets.ts#createCharacterBuilderAssetResolver',
  ],
  skillLevelForExactCurves:10,
  characters,
};
const serialized=JSON.stringify(payload,null,2)+'\n';

if(check){
  const existing=JSON.parse(readFileSync(output,'utf8'));
  if(JSON.stringify(existing)!==JSON.stringify(payload)){
    console.error('Character builder Skills runtime data is stale: '+output);
    console.error('Run: node --experimental-strip-types scripts/export-ui-skills-runtime.ts');
    process.exit(1);
  }
  console.log('Character builder Skills runtime data verified: '+characters.length+' released Characters.');
}else{
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,serialized);
  console.log('Exported Character builder Skills runtime data: '+output);
}
