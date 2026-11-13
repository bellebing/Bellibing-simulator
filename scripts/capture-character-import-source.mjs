#!/usr/bin/env node
// Capture a source-proven Character kit without promoting canonical readiness.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {captureCharacterSourceEvidence} from '../src/characterImportSourceCapture.mjs';
const id=process.argv[2];
const outputArg=process.argv.indexOf('--output');
const output=outputArg>=0?process.argv[outputArg+1]:'data/research/character-import/'+id+'-captured.json';
if(!/^[a-z][a-z0-9-]*$/.test(id??''))throw Error('Usage: node scripts/capture-character-import-source.mjs <canonical-id> [--output path]');
if(!output || output.startsWith('--'))throw Error('--output requires a path.');
const review=JSON.parse(readFileSync('data/research/character-import/'+id+'.json','utf8'));
const pinPath=review.sourceCapture?.sourceSnapshot;
if(!pinPath?.startsWith('data/research/character-import/source-pins/'))throw Error('Source snapshot pin missing.');
const pins=JSON.parse(readFileSync(pinPath,'utf8'));
if(pins.schemaVersion!==1 || pins.patch!==review.sourceCapture.patch)throw Error('Source patch/snapshot mismatch.');
const input={},provenance={};
for(const [label,group] of Object.entries(pins.sources)){
 if(!/^[a-f0-9]{40}$/.test(group.commit) || !/^[\w-]+\/[\w-]+$/.test(group.repository))throw Error('Invalid immutable source repo/commit.');
 for(const [name,blob] of Object.entries(group.blobs)){
  if(!/^[a-f0-9]{40}$/.test(blob.sha) || !/^(BinData|public\/Data)\//.test(blob.path))throw Error('Invalid pinned source blob.');
  const url='https://raw.githubusercontent.com/'+group.repository+'/'+group.commit+'/'+blob.path;
  const response=await fetch(url);
  if(!response.ok)throw Error('Pinned source unavailable: '+response.status+' '+url);
  const bytes=Buffer.from(await response.arrayBuffer());
  const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  if(sha!==blob.sha)throw Error('Pinned source Git blob mismatch: '+url);
  input[name]=JSON.parse(bytes.toString('utf8'));
  provenance[name]={repository:group.repository,commit:group.commit,path:blob.path,gitBlobSha:sha,sourceBytes:bytes.length,url};
 }
}
const candidate=captureCharacterSourceEvidence(review,input,provenance);
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(candidate,null,2)+'\n');
console.log('Captured '+candidate.characterName+' ('+candidate.sourceRoleId+') from immutable original source and correlated provider. Canonical/DPS stay Pending: '+output);
