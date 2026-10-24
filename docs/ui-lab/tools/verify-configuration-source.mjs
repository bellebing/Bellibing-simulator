import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {CANONICAL_CONFIGURATION_SOURCE} from '../../../src/simulationConfigurationBridge.mjs';
import ownerReview from '../../../data/research/configuration-source-reviews/danjin-owner-interpretation.json' with {type:'json'};
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:4*1024*1024}).trim();
export function verifyConfigurationSource(rows,read=readFileSync,review=ownerReview){
 if(review.schemaVersion!==1||review.baseSource!==CANONICAL_CONFIGURATION_SOURCE||review.authority!=='EXPLICIT_OWNER_DECISION'||review.issue!==348||review.scope!=='DANJIN_FULL_METER_TRANSLATION_ONLY_NO_TRANSPORT_OR_ENGINE_CHANGE')throw Error('Configuration source review drift');
 const changes=new Map(),additions=new Map(),seen=new Set();
 for(const [entries,map]of [[review.changes,changes],[review.additions,additions]])for(const entry of entries){
  if(!/^src\/data\/[A-Za-z0-9/]+\.ts$/.test(entry.path)||seen.has(entry.path)||!/^[a-f0-9]{40}$/.test(entry.after)||map===changes&&!/^[a-f0-9]{40}$/.test(entry.before))throw Error('Invalid reviewed configuration delta');
  seen.add(entry.path);map.set(entry.path,entry);
 }
 const hash=path=>{const bytes=read(path);return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');};
 const matched=new Set();
 for(const row of rows){
  const [info,path]=row.split('\t'),[mode,type,expected]=info.split(' ');
  if(type!=='blob'||!['100644','100755'].includes(mode))throw Error('Unsupported canonical source entry');
  if(additions.has(path))throw Error('Reviewed addition already exists in source pin');
  const delta=changes.get(path);
  if(delta){if(delta.before!==expected)throw Error('Reviewed original source blob drift: '+path);matched.add(path);}
  if(hash(path)!==(delta?.after??expected))throw Error('Configuration canonical source drift: '+path);
 }
 if(matched.size!==changes.size)throw Error('Reviewed delta missing from source pin');
 for(const entry of additions.values())if(hash(entry.path)!==entry.after)throw Error('Reviewed addition drift: '+entry.path);
 return {originalFiles:rows.length,reviewedChanges:matched.size,reviewedAdditions:additions.size};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const result=verifyConfigurationSource(git(['ls-tree','-r',CANONICAL_CONFIGURATION_SOURCE,'--','src']).split('\n'));
 console.log(`Configuration source parity: ${result.originalFiles} original files checked against unchanged ${CANONICAL_CONFIGURATION_SOURCE}; ${result.reviewedChanges} exact owner-reviewed Danjin blobs and ${result.reviewedAdditions} resolution record. No transport/private-engine pin upgrade.`);
}
