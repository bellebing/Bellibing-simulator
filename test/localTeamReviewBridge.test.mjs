import test from 'node:test';
import {request as httpRequest} from 'node:http';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {createLocalTeamDpsHandler} from '../scripts/local-team-dps.mjs';

test('abandoned persistent search releases the worker and cannot deliver its result to the next job',async()=>{
 const root=await mkdtemp(join(tmpdir(),'bellibing-cancel-')),site=join(root,'site'),engine=join(root,'private');
 for(const file of ['index.html','build/index.html','sandbox/index.html','improve/index.html','review-build.json']){await mkdir(join(site,file,'..'),{recursive:true});await writeFile(join(site,file),'{}');}
 await mkdir(engine,{recursive:true});
 await writeFile(join(engine,'stream.mjs'),`import {createInterface} from 'node:readline';import {writeFileSync} from 'node:fs';for await(const line of createInterface({input:process.stdin})){const input=JSON.parse(line);if(input.slow){writeFileSync('started','1');await new Promise(r=>setTimeout(r,4000));}process.stdout.write(JSON.stringify({protocol:'TEST_SEARCH',result:{id:input.id}})+'\\n');}`);
 const handler=createLocalTeamDpsHandler({engineDirectory:engine,entry:'stream.mjs',persistent:true,protocol:'TEST_SEARCH'}),server=await startPreview({directory:site,port:0,reviewHandler:handler}),origin=`http://127.0.0.1:${server.address().port}`;
 const controller=new AbortController(),post=(data,signal)=>fetch(origin+'/local-review/team-dps',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Bellibing-Review':'1'},body:JSON.stringify(data),signal});
 try{
  const abandoned=post({slow:true,id:'old'},controller.signal).catch(()=>null);
  for(let i=0;i<100;i++){try{await access(join(engine,'started'));break;}catch{await new Promise(r=>setTimeout(r,20));}}
  await access(join(engine,'started'));controller.abort();await abandoned;
  const started=performance.now();let response;
  for(let i=0;i<20;i++){response=await post({id:'new'});if(response.status!==429)break;await new Promise(r=>setTimeout(r,30));}
  assert.equal(response.status,200);assert.equal((await response.json()).result.id,'new');
  assert.ok(performance.now()-started<2000,'new job must not wait for the four-second abandoned search');
 }finally{controller.abort();handler.close();server.closeAllConnections();await new Promise(ok=>server.close(ok));await rm(root,{recursive:true,force:true});}
});
test('loopback review bridge enforces host/origin/JSON bounds and never serves engine files',async()=>{
 const root=await mkdtemp(join(tmpdir(),'bellibing-team-bridge-')),site=join(root,'site'),engine=join(root,'private');
 for(const file of ['index.html','build/index.html','sandbox/index.html','improve/index.html','review-build.json']){await mkdir(join(site,file,'..'),{recursive:true});await writeFile(join(site,file),'{}');}
 await mkdir(join(engine,'scripts/team-dps'),{recursive:true});
 await writeFile(join(engine,'scripts/team-dps/stdio.mjs'),"let input='';for await(const c of process.stdin)input+=c;process.stdout.write(JSON.stringify({protocol:'BELLIBING_LOCAL_TEAM_REVIEW_V1',result:{status:'PENDING',reason:'EXPLICIT_TEST_STUB'}}));");
 const server=await startPreview({directory:site,port:0,reviewHandler:createLocalTeamDpsHandler({engineDirectory:engine})}),origin=`http://127.0.0.1:${server.address().port}`,url=origin+'/local-review/team-dps';
 const headers={Origin:origin,'Content-Type':'application/json','X-Bellibing-Review':'1'},post=(body,extra={})=>fetch(url,{method:'POST',headers:{...headers,...extra},body});
 try{
  assert.equal((await post('{}',{Origin:'https://foreign.example'})).status,403);
  assert.equal((await post('{}',{'X-Bellibing-Review':''})).status,403);
  assert.equal((await post('{}',{'Content-Type':'text/plain'})).status,415);
  assert.equal((await post('invalid')).status,400);assert.equal((await post('x'.repeat(131073))).status,413);
  assert.equal((await fetch(url)).status,405);
  const hostStatus=await new Promise((ok,bad)=>{const r=httpRequest(url,{method:'POST',headers:{...headers,Host:'attacker.invalid'}},res=>{res.resume();ok(res.statusCode);});r.on('error',bad);r.end('{}');});assert.equal(hostStatus,403);
  assert.equal((await post('{"action":"status"}')).status,200);
  const result=await post('{}');assert.equal(result.status,200);assert.equal((await result.json()).result.reason,'EXPLICIT_TEST_STUB');assert.equal(result.headers.get('access-control-allow-origin'),null);
  assert.equal((await fetch(origin+'/private/scripts/team-dps/stdio.mjs')).status,404);
 }finally{server.closeAllConnections();await new Promise(ok=>server.close(ok));await rm(root,{recursive:true,force:true});}
});

test('persistent advisor bridge keeps private job state between bounded requests and retires its process',async()=>{
 const root=await mkdtemp(join(tmpdir(),'bellibing-advisor-stream-')),site=join(root,'site'),engine=join(root,'private');
 for(const file of ['index.html','build/index.html','sandbox/index.html','improve/index.html','review-build.json']){await mkdir(join(site,file,'..'),{recursive:true});await writeFile(join(site,file),'{}');}
 await mkdir(engine,{recursive:true});await writeFile(join(engine,'stream.mjs'),"import {createInterface} from 'node:readline';let n=0;for await(const line of createInterface({input:process.stdin}))process.stdout.write(JSON.stringify({protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'CALCULATING',cursor:++n}})+'\\n');");
 const handler=createLocalTeamDpsHandler({engineDirectory:engine,entry:'stream.mjs',persistent:true,protocol:'BELLIBING_ECHO_ADVICE_V1'}),server=await startPreview({directory:site,port:0,reviewHandler:handler}),origin=`http://127.0.0.1:${server.address().port}`;
 try{for(const cursor of [1,2,3]){const response=await fetch(origin+'/local-review/team-dps',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-Bellibing-Review':'1'},body:'{}'});assert.equal(response.status,200);assert.equal((await response.json()).result.cursor,cursor);}}
 finally{handler.close();server.closeAllConnections();await new Promise(ok=>server.close(ok));await rm(root,{recursive:true,force:true});}
});
