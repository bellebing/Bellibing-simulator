import test from 'node:test';
import assert from 'node:assert/strict';
import {createSandboxClient,SANDBOX_HTTP_PROTOCOL as protocol} from '../docs/ui-lab/v1.1/modules/sandbox-client.js';
import {expectedResourceRecord,sandboxCostDetails} from '../docs/ui-lab/v1.1/modules/sandbox-presentation.js';
import {resourceCostValues} from '../docs/ui-lab/v1.1/modules/resource-cost.js';
import {dpsConceptMarkup} from '../docs/ui-lab/v1.1/modules/dps-concept.js';
test('experimental DPS requires explicit matching context and same-run member total',()=>{
 const evaluationContext={kind:'SYNTHETIC_REFERENCE_TEAM',id:'AUGUSTA_IUNO_SHOREKEEPER_REFERENCE_V1',version:1};
 // Contract-only numbers, no gameplay fixture or result.
 const dps={characterId:'augusta',context:evaluationContext,status:'EXPERIMENTAL',verification:'EXPERIMENTAL',provider:{kind:'DPS',sourceBinding:'UNIT_CONTRACT_ONLY'},teamTotal:6,characterContributions:[{characterId:'augusta',dps:1},{characterId:'iuno',dps:2},{characterId:'the-shorekeeper',dps:3}]};
 assert.match(dpsConceptMarkup({dps}),/data-status="PENDING"/);
 assert.match(dpsConceptMarkup({expertMode:true,evaluationContext,dps}),/class="dps-expert-result" data-status="EXPERIMENTAL"/);
 assert.doesNotMatch(dpsConceptMarkup({evaluationContext,dps}),/dps-expert-result/);
 assert.match(dpsConceptMarkup({expertMode:true,evaluationContext,dps:{...dps,teamTotal:7}}),/class="dps-expert-result" data-status="PENDING"/);
 for(const characterId of [undefined,'iuno'])assert.match(dpsConceptMarkup({expertMode:true,evaluationContext,dps:{...dps,characterId}}),/class="dps-expert-result" data-status="PENDING"/);
 assert.doesNotMatch(dpsConceptMarkup({characterId:'aalto'}),/Experimental reference team/);
});
test('evaluation context changes invalidate a pending metrics response',async()=>{
 let evaluationContext=null,finish;
 const fetcher=async(url)=>({ok:true,json:async()=>url.endsWith('/guest')?{protocol,csrfToken:'token',expiresAt:Date.now()+100000}:new Promise(r=>{finish=r;})});
 const client=createSandboxClient({readContext:()=>({}),readEvaluationContext:()=>evaluationContext,fetcher});const request=client.metrics();while(!finish)await new Promise(r=>setTimeout(r,0));evaluationContext={kind:'SYNTHETIC_REFERENCE_TEAM',id:'AUGUSTA_IUNO_SHOREKEEPER_REFERENCE_V1',version:1};finish({protocol,metrics:{}});await assert.rejects(request,/STALE_SANDBOX_RESPONSE/);
});
test('Expected cells retain independent verification and observed receipt bases stay distinct',()=>{
 const expected=expectedResourceRecord({expectedCost:{selectedSet:{echoes:{status:'VERIFIED',value:{approximate:12}},tuners:{status:'PENDING',value:null}}}});
 assert.deepEqual(resourceCostValues(expected),[12,null,null]);
 const markup=sandboxCostDetails(null,{scope:'ACTIVE_SET',status:'ABORTED',recovery:'NONE',gross:{echoes:2,tuners:10,tubes:{}},returned:{echoes:0,tuners:0,tubes:{}},net:{echoes:2,tuners:10,tubes:{}},remaining:{echoes:{kind:'UNLIMITED'},tuners:{kind:'FINITE',count:7},tubes:{}},goldEquivalent:{gross:4,returned:1,net:3}});
 for(const text of ['Gross','Returns','Net','Remaining','Gold equivalent','∞','7'])assert.ok(markup.includes(text));
});
test('HTTP client uses same-origin CSRF, revision CAS and generation without exposing owners',async()=>{
 let revision=0,n=0;const requests=[],context={characterId:'augusta',revisions:{settings:0}};
 const fetcher=async(url,options)=>{requests.push({url,options});const input=options.body?JSON.parse(options.body):null;
  return {ok:true,json:async()=>url.endsWith('/guest')?{protocol,csrfToken:'token',expiresAt:'2099-01-01T00:00:00Z'}:{protocol,runId:'run',serverRevision:revision++,clientGeneration:input.clientGeneration??'id1',status:'RUNNING',view:{slots:[]}}};};
 const client=createSandboxClient({readContext:()=>context,fetcher,id:()=>`id${++n}`});
 await client.start();await client.step();
 assert.equal(requests[0].options.credentials,'same-origin');assert.equal(requests[1].options.headers['X-CSRF-Token'],'token');
 assert.deepEqual(JSON.parse(requests[2].options.body),{expectedRevision:0});
 const copy=client.snapshot();copy.status='ALTERED';assert.equal(client.snapshot().status,'RUNNING');
 context.revisions.settings++;assert.equal(client.checkFresh(),false);assert.equal(client.snapshot(),null);
});
test('late result after a live owner edit never becomes a run',async()=>{
 let context={revision:0},finish;
 const fetcher=async(url)=>({ok:true,json:async()=>url.endsWith('/guest')?{protocol,csrfToken:'token',expiresAt:'2099-01-01T00:00:00Z'}:new Promise(r=>{finish=r;})});
 const client=createSandboxClient({readContext:()=>context,fetcher,id:()=> 'generation'});
 const pending=client.start();while(!finish)await new Promise(r=>setTimeout(r,0));context={revision:1};
 finish({protocol,runId:'old',serverRevision:0,clientGeneration:'generation'});
 await assert.rejects(pending,/STALE_SANDBOX_RESPONSE/);assert.equal(client.snapshot(),null);
});
test('a static preview reports unavailable service rather than fabricating a run',async()=>{
 const client=createSandboxClient({readContext:()=>({}),fetcher:async()=>({ok:false,json:async()=>{throw Error('HTML');}})});
 await assert.rejects(client.start(),/LOCAL_SANDBOX_SERVICE_UNAVAILABLE/);assert.equal(client.snapshot(),null);
});
test('a retry after an uncertain network failure retains its scoped idempotency key',async()=>{
 const keys=[];let failed=false;
 const fetcher=async(url,options)=>{if(url.endsWith('/guest'))return {ok:true,json:async()=>({protocol,csrfToken:'token',expiresAt:'2099-01-01T00:00:00Z'})};keys.push(options.headers['Idempotency-Key']);if(!failed){failed=true;throw TypeError('connection interrupted');}return {ok:true,json:async()=>({protocol,runId:'run',serverRevision:0,clientGeneration:'generation',view:{slots:[]},status:'RUNNING'})};};
 const client=createSandboxClient({readContext:()=>({}),fetcher,id:()=> 'generation'});await client.start();assert.equal(keys.length,2);assert.equal(keys[0],keys[1]);
});
test('metrics from an edited context cannot populate Expected cells',async()=>{
 let revision=0,finish;
 const fetcher=async(url)=>({ok:true,json:async()=>url.endsWith('/guest')?{protocol,csrfToken:'token',expiresAt:'2099-01-01T00:00:00Z'}:new Promise(r=>{finish=r;})});
 const client=createSandboxClient({readContext:()=>({revision}),fetcher});const task=client.metrics();while(!finish)await new Promise(r=>setTimeout(r,0));revision++;finish({protocol,metrics:{},status:'READY'});await assert.rejects(task,/STALE_SANDBOX_RESPONSE/);
});
test('numeric epoch expiration refreshes an expired server guest',async()=>{
 let guests=0;
 const fetcher=async(url,options)=>({ok:true,json:async()=>url.endsWith('/guest')?{protocol,csrfToken:'token',expiresAt:++guests===1?Date.now()-1:Date.now()+100000}:{protocol,clientGeneration:JSON.parse(options.body).clientGeneration,metrics:{}}});
 const client=createSandboxClient({readContext:()=>({}),fetcher});await client.metrics();await client.metrics();assert.equal(guests,2);
});

test('export rejects stale run identity/revision and invalid envelopes without losing a valid export',async()=>{
 const safe={schemaVersion:1,kind:'BELLIBING_SANDBOX_HTTP_EXPORT_V1',run:{kind:'BELLIBING_SANDBOX_RUN_EXPORT_V1'}};
 let runNumber=0,revision=0,release=null;
 const fetcher=async(url,options)=>({ok:true,json:async()=>{
  if(url.endsWith('/guest'))return {protocol,csrfToken:'token',expiresAt:'2099-01-01T00:00:00Z'};
  if(url.endsWith('/export'))return new Promise(resolve=>{release=resolve;});
  if(url.endsWith('/runs')){runNumber++;revision=0;}
  else if(url.endsWith('/step'))revision++;
  return {protocol,runId:`run-${runNumber}`,serverRevision:revision,clientGeneration:JSON.parse(options.body).clientGeneration??'generation',status:'RUNNING',view:{slots:[]}};
 }});
 const client=createSandboxClient({readContext:()=>({}),fetcher,id:()=> 'generation'});
 const complete=async value=>{while(!release)await new Promise(r=>setTimeout(r,0));const resolve=release;release=null;resolve(value);};
 await client.start();
 let pending=client.export();
 await client.start(); // Same context and generation, different server run.
 await complete(safe);
 await assert.rejects(pending,/STALE_SANDBOX_RESPONSE/);
 pending=client.export();
 await client.step(); // Same run, newer server revision.
 await complete(safe);
 await assert.rejects(pending,/STALE_SANDBOX_RESPONSE/);
 pending=client.export();
 await complete({...safe,kind:'WRONG_EXPORT_KIND'});
 await assert.rejects(pending,/INVALID_SANDBOX_EXPORT/);
 pending=client.export();
 await complete(safe);
 assert.deepEqual(await pending,safe);
});
