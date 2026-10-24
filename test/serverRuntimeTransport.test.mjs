import test from 'node:test';
import assert from 'node:assert/strict';
import {createServerTransport,RUNTIME_PROTOCOL} from '../docs/ui-lab/v1.1/modules/server-transport.js';
import {createBrowserSandboxClient} from '../docs/ui-lab/v1.1/modules/browser-client.js';
const endpoint='https://runtime.invalid/runtime/v1/';
const reply=value=>({ok:true,json:async()=>({protocol:RUNTIME_PROTOCOL,...value})});
test('server endpoint rejects insecure remote URLs, credentials and query-carried secrets',()=>{
 for(const endpoint of ['http://runtime.invalid/runtime/v1/','https://user:secret@runtime.invalid/runtime/v1/','https://runtime.invalid/runtime/v1/?token=secret','https://runtime.invalid/other/'])assert.throws(()=>createServerTransport({endpoint}),/INVALID_RUNTIME_ENDPOINT/);
});
test('network retry preserves the original request identity and expected revision',async()=>{
 const requests=[];let failed=false;
 const service=createServerTransport({endpoint,fetchImpl:async(url,init)=>{
  const value=JSON.parse(init.body);if(url.pathname.endsWith('/guest'))return reply({token:'guest-capability',expiresAt:Date.now()+100000});
  requests.push({value,auth:init.headers.Authorization});if(!failed){failed=true;throw new TypeError('response lost after commit');}
  return reply({id:value.id,revision:value.expectedRevision+1,result:{status:'RUNNING'}});
 }});
 assert.equal((await service.request('start',{owner:'detached'},{seed:'test',namespace:'test'})).status,'RUNNING');
 assert.equal(requests.length,2);assert.deepEqual(requests[0],requests[1]);assert.equal(requests[0].value.expectedRevision,0);
 await service.request('step');assert.equal(requests[2].value.expectedRevision,1);assert.equal(requests[2].auth,'Bearer guest-capability');service.terminate();
});
test('concurrent read-only requests share one guest authorization and never advance a run revision',async()=>{
 let guests=0;const seen=[];
 const service=createServerTransport({endpoint,fetchImpl:async(url,init)=>{
  if(url.pathname.endsWith('/guest')){guests++;await new Promise(r=>setTimeout(r,5));return reply({token:'guest-capability',expiresAt:Date.now()+100000});}
  const value=JSON.parse(init.body);seen.push(value);return reply({id:value.id,result:{status:'READY'}});
 }});
 await Promise.all([service.request('metrics',{}),service.request('team',undefined,undefined,{})]);
 assert.equal(guests,1);assert.ok(seen.every(q=>q.expectedRevision===0));service.terminate();
});
test('a retired transport rejects a delayed response and cannot create a later request',async()=>{
 let finish;const service=createServerTransport({endpoint,fetchImpl:async(url,init)=>{
  if(url.pathname.endsWith('/guest'))return reply({token:'guest-capability',expiresAt:Date.now()+100000});
  const value=JSON.parse(init.body);return new Promise(resolve=>{finish=()=>resolve(reply({id:value.id,result:{status:'READY'}}));});
 }});
 const pending=service.request('metrics',{});while(!finish)await new Promise(r=>setTimeout(r,0));service.terminate();finish();
 await assert.rejects(pending,/STALE_SANDBOX_RESPONSE/);await assert.rejects(service.request('step'),/STALE_SANDBOX_RESPONSE/);
});
test('browser facade uses server transport without fetching private executable bytes',async()=>{
 const original=globalThis.fetch,calls=[];let release;
 const context={characterId:'baizhi'};
 globalThis.fetch=async(url,init)=>{
  calls.push(String(url));if(String(url).endsWith('/engine-release.json'))return {json:async()=>({version:1,status:'SERVER_RUNTIME_V1',files:[],review:'reviewed-service',endpoint})};
  if(String(url).endsWith('/guest'))return reply({token:'guest-capability',expiresAt:Date.now()+100000});
  const value=JSON.parse(init.body);return new Promise(resolve=>{release=()=>resolve(reply({id:value.id,result:{status:'READY'}}));});
 };
 try{const client=createBrowserSandboxClient({readContext:()=>context});const pending=client.metrics();while(!release)await new Promise(r=>setTimeout(r,0));context.characterId='iuno';release();await assert.rejects(pending,/STALE_SANDBOX_RESPONSE/);assert.equal(client.snapshot(),null);assert.ok(!calls.some(url=>url.endsWith('.worker.js')));client.invalidate();}finally{globalThis.fetch=original;}
});
