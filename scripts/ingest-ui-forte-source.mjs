import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Immutable sources. Updating either pin requires reviewing tree/text drift.
const sources = {
  characters: ['DommyMM/wuwabuild', '2b57a127b26b062ab58d272cd6735338507de1cd', 'public/Data/Characters.json'],
  tree: ['Arikatsu/WutheringWaves_Data', '353f2eaed119bc9f680eab92807d20ac75a79b40', 'BinData/skillTree/skilltree.json'],
  text: ['Arikatsu/WutheringWaves_Data', '353f2eaed119bc9f680eab92807d20ac75a79b40', 'Textmaps/en/multi_text/MultiText.json'],
};
const local = process.argv.includes('--local');
const localNames = { characters:'upstream-characters', tree:'skilltree', text:'multitext' };
const provenance = {}, inputs = {};
for (const [key,[repository,commit,path]] of Object.entries(sources)) {
  const url = `https://raw.githubusercontent.com/${repository}/${commit}/${path}`;
  const bytes = local ? readFileSync(`work/${localNames[key]}.json`) : Buffer.from(await (await fetch(url).then(r=>{if(!r.ok)throw Error(`${r.status}: ${url}`);return r})).arrayBuffer());
  provenance[key] = { repository, commit, path, url, sha256:createHash('sha256').update(bytes).digest('hex') };
  inputs[key] = JSON.parse(bytes);
}
const manifest = JSON.parse(readFileSync('docs/ui-prototypes/assets/builder-icons/manifest.json','utf8'));
const text = new Map(inputs.text.map(row=>[row.Id,row.Content]));
const characters = manifest.characters.filter(c=>c.releaseStatus==='RELEASED').map(c=>{
  const upstream = inputs.characters.find(row=>row.id===c.sourceId);
  if(!upstream)throw Error(`Missing source Character ${c.characterId}`);
  const tree = inputs.tree.filter(row=>row.NodeGroup===c.sourceId);
  return {
    characterId:c.characterId, sourceId:c.sourceId, sourceName:upstream.name.en,
    tree,
    statNodes:upstream.skillTrees,
    skillIcons:upstream.skillIcons,
    moves:upstream.moves.map(m=>({id:m.id,type:m.type,sort:m.sort,name:m.name.en,description:m.description.en,descriptionParams:m.descriptionParams,maxLevel:m.maxLevel,values:m.values.map(v=>({id:v.id,name:v.name.en,values:v.values}))})),
    text:Object.fromEntries(tree.flatMap(n=>[n.PropertyNodeTitle,n.PropertyNodeDescribe]).filter(Boolean).map(key=>[key,text.get(key)??null])),
  };
});
mkdirSync('data/source',{recursive:true});
writeFileSync('data/source/character-forte-ui.json',JSON.stringify({schemaVersion:1,provenance,characters},null,2)+'\n');
console.log(`Ingested explicit Forte records for ${characters.length} released Characters.`);
