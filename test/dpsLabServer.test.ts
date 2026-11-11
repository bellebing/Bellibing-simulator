import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {request} from 'node:http';
import {mkdtempSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';

test('DPS Lab starts as localhost-only, serves three static assets, and proxies no private code',async()=>{
 const engine=mkdtempSync(join(tmpdir(),'bellibing-dps-lab-'));
 const path=join(engine,'scripts/team-dps');
 mkdirSync(path,{recursive:true});
 writeFileSync(join(engine,'package.json'),JSON.stringify({name:'bellibing-engine-private'}));
 writeFileSync(join(path,'dps-lab-stdio.mjs'),[
  "let data='';",
  "for await(const chunk of process.stdin)data+=chunk.toString();",
  "const input=JSON.parse(data);",
  "process.stdout.write(JSON.stringify({protocol:'BELLIBING_DPS_LAB_V1',result:{status:'AVAILABLE',presets:[],action:input.action}}));"
 ].join('\n'));
 const child=spawn(process.execPath,['scripts/start-dps-lab.mjs','--engine-directory',engine,'--port','0'],{stdio:['ignore','pipe','pipe']});
 let stdout='',stderr='';child.stderr.on('data',c=>stderr+=c.toString());
 const address=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('PREVIEW_START_TIMEOUT: '+stderr)),12000);
  child.once('exit',code=>{clearTimeout(timer);reject(Error('PREVIEW_EXIT: '+code+' '+stderr));});
  child.stdout.on('data',chunk=>{
   stdout+=chunk.toString();
   const m=stdout.match(/http:\/\/127\.0\.0\.1:\d+\/dps-lab\//);
   if(m){clearTimeout(timer);resolve(m[0].slice(0,-'/dps-lab/'.length));}
  });
 }).catch(error=>{child.kill();throw error;});
 try{
  const ui=await fetch(address+'/dps-lab/');
  assert.equal(ui.status,200);
  assert.match(await ui.text(),/DPS Lab/);
  const js=await fetch(address+'/dps-lab/lab.js');
  assert.equal(js.status,200);assert.match(await js.text(),/normalizeDpsLab/);
  const forbidden=await fetch(address+'/package.json');
  assert.equal(forbidden.status,404);
  // fetch() normalizes forbidden Host overrides; raw HTTP verifies the guard.
  const badHost=await new Promise((done,reject)=>{
   const req=request(address+'/dps-lab/',{headers:{host:'another-site.invalid'}},res=>{res.resume();res.on('end',()=>done(res.statusCode));});
   req.on('error',reject);req.end();
  });
  assert.equal(badHost,403);
  const make=(origin)=>fetch(address+'/local-review/dps-lab',{method:'POST',headers:{'content-type':'application/json','x-bellibing-review':'1',origin},body:JSON.stringify({action:'list'})});
  assert.equal((await make('http://another-site.invalid')).status,403);
  const reply=await make(address);
  assert.equal(reply.status,200);
  const data=await reply.json();
  assert.equal(data.protocol,'BELLIBING_DPS_LAB_V1');
  assert.equal(data.result.action,'list');
 }finally{child.kill();rmSync(engine,{recursive:true,force:true});}
});
