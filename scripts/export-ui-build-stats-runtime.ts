import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { CHARACTER_PRESENTATION_PENDING } from '../src/data/characterPresentationPending.ts';

const defaultOutput='docs/ui-prototypes/assets/build-stats/runtime-data.json';
const projectionOutput=resolve('docs/ui-prototypes/assets/build-stats/projection.mjs');
const projectionSource=resolve('src/buildStatProjection.mjs');
const manifestPath=resolve('docs/ui-prototypes/assets/builder-icons/manifest.json');
const check=process.argv.includes('--check');
const outputArg=process.argv.indexOf('--output');
const output=resolve(outputArg>=0?process.argv[outputArg+1]:defaultOutput);
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const toRuntimePath=targetPath=>{
  const prefix='docs/ui-prototypes/';
  if(typeof targetPath!=='string'||!targetPath.startsWith(prefix))throw new Error('Build stat asset path escapes ui-preview root: '+targetPath);
  return targetPath.slice(prefix.length);
};

const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
if(manifest.schemaVersion!==1||manifest.role!=='builder.icon-foundation'||!Array.isArray(manifest.stats))throw new Error('Unsupported builder stat icon manifest');
const statIconLabels=[
  'HP','ATK','DEF','Energy Regen','Crit Rate','Crit DMG',
  'Aero DMG','Electro DMG','Fusion DMG','Glacio DMG','Havoc DMG','Spectro DMG',
  'Healing Bonus','Basic Attack DMG Bonus','Heavy Attack DMG Bonus',
  'Resonance Skill DMG Bonus','Resonance Liberation DMG Bonus'
];
const iconByLabel=new Map(manifest.stats.map(row=>[row.label,row]));
const statIcons=Object.fromEntries(statIconLabels.map(label=>{
  const row=iconByLabel.get(label);
  if(!row)throw new Error('Missing canonical Build stat icon for '+label);
  return [label,toRuntimePath(row.targetPath)];
}));

const characters=CHARACTER_CATALOG.filter(character=>character.releaseStatus==='RELEASED'&&!CHARACTER_PRESENTATION_PENDING.some(id=>id===character.id)).map(character=>{
  if(!character.element||!finite(character.level90.hp)||!finite(character.level90.atk)||!finite(character.level90.def)
    ||!finite(character.baseCombat.critRate)||!finite(character.baseCombat.critDamage)||!finite(character.baseCombat.energyRegen)) {
    throw new Error('Released Character has unresolved Build stat inputs: '+character.id);
  }
  if(!Array.isArray(character.intrinsicStats)||!character.intrinsicStats.length)throw new Error('Released Character missing verified intrinsic stats: '+character.id);
  return {
    id:character.id,
    name:character.name,
    releaseStatus:character.releaseStatus,
    element:character.element,
    level90:{hp:character.level90.hp,atk:character.level90.atk,def:character.level90.def},
    baseCombat:{
      critRate:character.baseCombat.critRate,
      critDamage:character.baseCombat.critDamage,
      energyRegen:character.baseCombat.energyRegen
    },
    intrinsicStats:character.intrinsicStats.map(row=>({stat:row.stat,value:row.value}))
  };
});

const payload={
  schemaVersion:1,
  role:'character-builder.static-stats',
  generatedFrom:[
    'src/data/characters.ts#CHARACTER_CATALOG',
    'src/data/characterIntrinsicStats.ts#CHARACTER_INTRINSIC_PROFILES',
    'docs/ui-prototypes/assets/builder-icons/manifest.json#stats',
    'src/buildStatProjection.mjs'
  ],
  statIcons,
  characters
};
const serialized=JSON.stringify(payload,null,2)+'\n';
const projection=readFileSync(projectionSource,'utf8');

if(check){
  const existing=readFileSync(output,'utf8');
  const existingProjection=readFileSync(projectionOutput,'utf8');
  if(existing!==serialized){
    console.error('Build Stats runtime data is stale: '+output);
    console.error('Run: node --experimental-strip-types scripts/export-ui-build-stats-runtime.ts');
    process.exit(1);
  }
  if(existingProjection!==projection){
    console.error('Build Stats browser projection is stale: '+projectionOutput);
    console.error('Run: node --experimental-strip-types scripts/export-ui-build-stats-runtime.ts');
    process.exit(1);
  }
  console.log('Build Stats runtime verified: '+characters.length+' released Characters / '+Object.keys(statIcons).length+' canonical stat icon bindings.');
}else{
  mkdirSync(dirname(output),{recursive:true});
  writeFileSync(output,serialized);
  mkdirSync(dirname(projectionOutput),{recursive:true});
  writeFileSync(projectionOutput,projection);
  console.log('Exported Build Stats runtime: '+output+' + '+projectionOutput);
}
