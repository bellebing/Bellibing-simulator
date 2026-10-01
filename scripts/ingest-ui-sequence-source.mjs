import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const SOURCE = {
  repository:'DommyMM/wuwabuild',
  commit:'2b57a127b26b062ab58d272cd6735338507de1cd',
  path:'public/Data/Characters.json',
  gitBlobSha:'56c16cbd579651d3b08cf9197f71fc705609f9a8',
  sourceBytes:9659340,
};
const local=process.argv.includes('--local');
const url=`https://raw.githubusercontent.com/${SOURCE.repository}/${SOURCE.commit}/${SOURCE.path}`;
const bytes=local?readFileSync('work/upstream-characters.json'):Buffer.from(await (await fetch(url).then(r=>{if(!r.ok)throw Error(`${r.status}: ${url}`);return r})).arrayBuffer());
const gitBlobSha=createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
if(bytes.length!==SOURCE.sourceBytes||gitBlobSha!==SOURCE.gitBlobSha)throw Error('Pinned Sequence source bytes/blob drifted');
const upstream=JSON.parse(bytes);
const manifest=JSON.parse(readFileSync('docs/ui-prototypes/assets/builder-icons/manifest.json','utf8'));
const characters=manifest.characters.filter(c=>c.releaseStatus==='RELEASED').map(c=>{
  const src=upstream.find(row=>row.id===c.sourceId);
  if(!src)throw Error('Missing provider Character '+c.characterId);
  const chains=c.chains.map(chain=>{
    const row=src.chains?.find(x=>x.id===chain.sourceChainId);
    if(!row)throw Error(`Missing ${c.characterId} S${chain.sequence} sourceChainId ${chain.sourceChainId}`);
    const asset=manifest.assets.find(a=>a.assetId===chain.assetId);
    const sourcePath=typeof row.icon==='string'&&row.icon.startsWith('/assets/')?'public'+row.icon:null;
    if(!asset||asset.sourceKey!=='wuwabuild'||asset.sourcePath!==sourcePath)throw Error(`Sequence icon source mismatch ${c.characterId} S${chain.sequence}`);
    return {
      sequence:chain.sequence,
      sourceChainId:chain.sourceChainId,
      name:typeof row.name?.en==='string'&&row.name.en?row.name.en:null,
      descriptionTemplate:typeof row.description?.en==='string'&&row.description.en?row.description.en:null,
      params:Array.isArray(row.param)?row.param.map(String):[],
      icon:row.icon??null,
    };
  });
  return {characterId:c.characterId,sourceId:c.sourceId,sourceName:src.name?.en??null,chains};
});
const payload={
  schemaVersion:1,
  role:'character-builder.sequence-source',
  provenance:{characters:{...SOURCE,url}},
  policy:{
    language:'en',
    identityJoin:'builder manifest sourceId + sourceChainId',
    formatting:'Substitute only source params and remove source markup tags; do not summarize, infer or rewrite mechanics.',
  },
  characters,
};
mkdirSync('data/source',{recursive:true});
writeFileSync('data/source/character-sequence-ui.json',JSON.stringify(payload,null,2)+'\n');
console.log(`Ingested source-backed Sequence content for ${characters.length} released Characters / ${characters.length*6} chains.`);
