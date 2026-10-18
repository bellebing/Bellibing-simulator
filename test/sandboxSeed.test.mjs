import test from 'node:test';
import assert from 'node:assert/strict';
import {createSandboxClient, SANDBOX_HTTP_PROTOCOL as protocol} from '../docs/ui-lab/v1.1/modules/sandbox-client.js';

test('each new run gets a fresh valid seed; explicit seeds replay and HTTP retries are identical',async()=>{
 let serial=0,runNumber=0,interrupted=false;
 const requests=[];
 const fetcher=async(url,options)=>{
  if(url.endsWith('/guest'))return {ok:true,json:async()=>({protocol,csrfToken:'token',expiresAt:'2099-01-01T00:00:00Z'})};
  if(!url.endsWith('/runs'))throw Error('Unexpected Sandbox action');
  requests.push({url,options,body:JSON.parse(options.body),key:options.headers['Idempotency-Key']});
  if(!interrupted){interrupted=true;throw TypeError('interrupted connection');}
  const body=JSON.parse(options.body);runNumber++;
  return {ok:true,json:async()=>({protocol,runId:`run-${runNumber}`,serverRevision:0,clientGeneration:body.clientGeneration,status:'RUNNING',view:{slots:[]}})};
 };
 const client=createSandboxClient({readContext:()=>({characterId:'augusta'}),fetcher,id:()=>`nonce-${++serial}`});
 await client.start(); // One uncertain network error must retry the exact request.
 await client.start(); // Same context, new simulation.
 await client.start({seed:'fixed-replay-seed'});
 await client.start({seed:'fixed-replay-seed'});
 await client.start(); // Explicit seed must not become the default for a later run.
 assert.equal(requests.length,6);
 const [first,retry,next,explicitA,explicitB,afterExplicit]=requests;
 assert.equal(first.url,'/sandbox/v1/runs');
 assert.equal(first.options.method,'POST');
 assert.equal(first.options.credentials,'same-origin');
 assert.equal(first.options.headers['X-CSRF-Token'],'token');
 assert.equal(first.options,retry.options,'Retry must reuse identical HTTP options object, not rebuild it');
 assert.deepEqual(first.body,retry.body,'Retry must retain the original seed, context and generation');
 assert.equal(first.key,retry.key,'Retry must retain the same Idempotency-Key');
 assert.equal(first.body.clientGeneration,next.body.clientGeneration,'New run may share the existing live context/generation');
 assert.notEqual(first.body.seed,next.body.seed,'A new SIMULATE must not replay the prior RNG seed');
 assert.notEqual(next.body.seed,afterExplicit.body.seed);
 for(const request of [first,next,afterExplicit]){
  assert.match(request.body.seed,/^nonce-\d+$/);
  assert.ok(request.body.seed.length<=128,'Compatible with private host identifier limit');
 }
 assert.equal(explicitA.body.seed,'fixed-replay-seed');
 assert.equal(explicitB.body.seed,'fixed-replay-seed');
 assert.notEqual(explicitA.key,explicitB.key,'Separate explicit-seed runs remain separate requests');
 assert.equal(requests.map(r=>r.key).length,new Set(requests.map(r=>r.key)).size+1,'Only the retry may duplicate a key');
 assert.deepEqual(client.snapshot().runId,'run-5');
});
