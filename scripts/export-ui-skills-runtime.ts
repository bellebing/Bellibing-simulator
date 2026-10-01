import { readFileSync,writeFileSync } from 'node:fs';
import { createCharacterBuilderAssetResolver } from '../src/characterBuilderAssets.ts';
import { projectForteCharacter } from '../src/characterForteUi.mjs';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';

const manifest=JSON.parse(readFileSync('docs/ui-prototypes/assets/builder-icons/manifest.json','utf8'));
const source=JSON.parse(readFileSync('data/source/character-forte-ui.json','utf8'));
const resolver=createCharacterBuilderAssetResolver(manifest);
const characters=resolver.listCharacterIds().map(id=>projectForteCharacter(source.characters.find(c=>c.characterId===id),resolver.resolve(id),manifest));
const payload={schemaVersion:2,role:'character-builder.runtime-skills',provenance:source.provenance,characters};

const totals=rows=>{
  const out={};
  for(const row of rows??[])out[row.stat]=(out[row.stat]??0)+row.value;
  return out;
};
const rounded=value=>Number(value.toFixed(10));
const mismatches=(a,b)=>[...new Set([...Object.keys(a),...Object.keys(b)])]
  .filter(stat=>Math.abs((a[stat]??0)-(b[stat]??0))>1e-10)
  .map(stat=>({stat,forte:rounded(a[stat]??0),intrinsic:rounded(b[stat]??0)}));
let reconciled=0;
const explicitConflicts=[];
for(const tree of characters){
  const character=CHARACTER_CATALOG.find(candidate=>candidate.id===tree.characterId&&candidate.releaseStatus==='RELEASED');
  if(!character)throw Error('Missing released Character for Forte intrinsic reconciliation: '+tree.characterId);
  const forteTotals=totals(tree.nodes.filter(node=>node.kind==='stat').map(node=>node.stat));
  const intrinsicTotals=totals(character.intrinsicStats);
  const drift=mismatches(forteTotals,intrinsicTotals);
  if(!drift.length){reconciled++;continue}
  if(tree.characterId==='mornye'&&drift.length===1&&drift[0].stat==='Healing Bonus'&&drift[0].forte===0.12&&drift[0].intrinsic===0.1){
    explicitConflicts.push({characterId:tree.characterId,...drift[0]});
    continue;
  }
  throw Error('Unexpected Forte/intrinsic stat reconciliation mismatch for '+tree.characterId+': '+JSON.stringify(drift));
}
if(reconciled!==characters.length-1||explicitConflicts.length!==1)throw Error('Unexpected Forte intrinsic reconciliation coverage');

for(const [path,text] of [
  ['docs/ui-prototypes/assets/skills-runtime.json',JSON.stringify(payload,null,2)+'\n'],
  ['docs/ui-prototypes/assets/forte-ui.mjs',readFileSync('src/characterForteUi.mjs','utf8')],
]){
  if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==text)throw Error('Stale Forte runtime: '+path)}
  else writeFileSync(path,text);
}
console.log(`Verified Forte UI projection: ${characters.length} Characters / ${reconciled} intrinsic totals agree / Mornye Healing Bonus explicit conflict 12% Forte vs 10% intrinsic.`);
