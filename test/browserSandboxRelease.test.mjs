import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {sandboxRelease,verifySandboxRelease} from '../scripts/sandbox-release.mjs';
import {createBrowserSandboxClient} from '../docs/ui-lab/v1.1/modules/browser-client.js';
test('unapproved release has no worker bytes and tampered local/approved records cannot enter public dist',()=>{
 const record=sandboxRelease();assert.equal(record.status,'PENDING_REVIEW');assert.deepEqual(record.files,[]);
 const dir=mkdtempSync(join(tmpdir(),'sandbox-release-'));try{mkdirSync(join(dir,'sandbox'));writeFileSync(join(dir,'sandbox/engine-release.json'),JSON.stringify(record));assert.deepEqual(verifySandboxRelease(dir),[]);for(const status of ['LOCAL_REVIEW_ONLY','APPROVED_FOR_PUBLICATION']){writeFileSync(join(dir,'sandbox/engine-release.json'),JSON.stringify({...record,status}));assert.throws(()=>verifySandboxRelease(dir),/release record mismatch/);}}finally{rmSync(dir,{recursive:true,force:true});}
});
test('browser adapter invalidation never preserves a previous run or account state',()=>{
 const context={characterId:'baizhi'},before=JSON.stringify(context),seen=[];const client=createBrowserSandboxClient({readContext:()=>context,onChange:r=>seen.push(r)});client.invalidate();assert.equal(client.snapshot(),null);assert.equal(client.isBusy(),false);assert.equal(JSON.stringify(context),before);assert.deepEqual(seen,[null]);
});

test('browser adapter refuses an unpublished release before fetching executable bytes',async()=>{
 const original=globalThis.fetch,calls=[];
 globalThis.fetch=async url=>{calls.push(String(url));return {json:async()=>({status:'PENDING_REVIEW',files:[]})};};
 try{const client=createBrowserSandboxClient({readContext:()=>({characterId:'baizhi'})});const response=await client.metrics();assert.equal(response.status,'PENDING');assert.deepEqual(response.reasons,['BROWSER_RUNTIME_RELEASE_PENDING']);assert.equal(calls.length,1);assert.ok(calls[0].endsWith('/engine-release.json'));assert.equal(client.snapshot(),null);}finally{globalThis.fetch=original;}
});

test('a worker computation limit clears export identity and exposes Pending rather than a completed run',async()=>{
 const originalFetch=globalThis.fetch,OriginalWorker=globalThis.Worker,bytes=new TextEncoder().encode('review worker'),digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');let terminated=0;
 globalThis.fetch=async url=>String(url).endsWith('.json')?{json:async()=>({status:'APPROVED_FOR_PUBLICATION',files:[{path:'sandbox-engine.worker.js',sha256:digest}]})}:{ok:true,arrayBuffer:async()=>bytes.buffer};
 globalThis.Worker=class{postMessage(){}terminate(){terminated++;}};
 try{const client=createBrowserSandboxClient({readContext:()=>({characterId:'baizhi'}),id:()=> 'test-id',timeoutMs:5});await assert.rejects(client.start(),/BROWSER_COMPUTATION_LIMIT_PENDING/);assert.equal(client.snapshot().status,'PENDING');assert.equal(client.snapshot().runId,null);assert.equal(client.isBusy(),false);await assert.rejects(client.export(),/SANDBOX_RUN_REQUIRED/);assert.ok(terminated>=1);}finally{globalThis.fetch=originalFetch;globalThis.Worker=OriginalWorker;}
});
