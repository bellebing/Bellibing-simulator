import { readFileSync,writeFileSync } from 'node:fs';
import { createCharacterBuilderAssetResolver } from '../src/characterBuilderAssets.ts';
import { projectForteCharacter } from '../src/characterForteUi.mjs';
const manifest=JSON.parse(readFileSync('docs/ui-prototypes/assets/builder-icons/manifest.json','utf8'));
const source=JSON.parse(readFileSync('data/source/character-forte-ui.json','utf8'));
const resolver=createCharacterBuilderAssetResolver(manifest);
const characters=resolver.listCharacterIds().map(id=>projectForteCharacter(source.characters.find(c=>c.characterId===id),resolver.resolve(id),manifest));
const payload={schemaVersion:2,role:'character-builder.runtime-skills',provenance:source.provenance,characters};
for(const [path,text] of [
  ['docs/ui-prototypes/assets/skills-runtime.json',JSON.stringify(payload,null,2)+'\n'],
  ['docs/ui-prototypes/assets/forte-ui.mjs',readFileSync('src/characterForteUi.mjs','utf8')],
]){
  if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==text)throw Error('Stale Forte runtime: '+path)}
  else writeFileSync(path,text);
}
console.log(`Verified Forte UI projection: ${characters.length} Characters.`);
