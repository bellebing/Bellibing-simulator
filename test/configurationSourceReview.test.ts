import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {verifyConfigurationSource} from '../docs/ui-lab/tools/verify-configuration-source.mjs';
import review from '../data/research/configuration-source-reviews/danjin-owner-interpretation.json' with {type:'json'};
const blob=(value:Buffer)=>createHash('sha1').update(`blob ${value.length}\0`).update(value).digest('hex');

test('owner interpretation is an explicit exact delta, preserving the original transport/engine source pin',()=>{
 const rows=review.changes.map(r=>`100644 blob ${r.before}\t${r.path}`);
 const untouched='src/unchanged.ts',bytes=Buffer.from('untouched');rows.push(`100644 blob ${blob(bytes)}\t${untouched}`);
 const read=(path:string)=>path===untouched?bytes:readFileSync(path);
 assert.deepEqual(verifyConfigurationSource(rows,read),{originalFiles:rows.length,reviewedChanges:review.changes.length,reviewedAdditions:1});
 for(const path of [untouched,review.changes[0].path,review.additions[0].path]){
  assert.throws(()=>verifyConfigurationSource(rows,(p:string)=>p===path?Buffer.from('unreviewed edit'):read(p)),/drift/);
 }
 assert.throws(()=>verifyConfigurationSource(rows.slice(1),read),/missing from source pin/);
 assert.throws(()=>verifyConfigurationSource(rows,read,{...review,baseSource:'unreviewed'}),/review drift/);
 assert.throws(()=>verifyConfigurationSource(rows,read,{...review,changes:[...review.changes,review.changes[0]]}),/Invalid reviewed/);
 const changedBase=[...rows];changedBase[0]=changedBase[0].replace(review.changes[0].before,'0'.repeat(40));
 assert.throws(()=>verifyConfigurationSource(changedBase,read),/original source blob drift/);
});
