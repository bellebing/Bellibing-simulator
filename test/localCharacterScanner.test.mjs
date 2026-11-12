import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {startLocalCharacterScanner} from '../scripts/local-character-scanner.mjs';

async function site(){
 const dir=await mkdtemp(join(tmpdir(),'bellibing-character-scanner-'));
 for(const file of ['index.html','build/index.html','sandbox/index.html','improve/index.html','review-build.json']){
  await mkdir(dirname(join(dir,file)),{recursive:true});await writeFile(join(dir,file),file);
 }
 return dir;
}
async function stub(dir){
 const script=join(dir,'fake-scanner.mjs');
 await writeFile(script,`
  import {createServer} from 'node:http';
  const port=Number(process.argv.at(-1));
  const server=createServer(async(req,res)=>{
   res.setHeader('Content-Type','application/json');
   if(req.method==='GET'&&req.url==='/api/catalog'){res.end(JSON.stringify({characters:[],weapons:[]}));return;}
   if(req.method==='POST'&&['/api/scan','/api/validate'].includes(req.url)){
    const bytes=[];for await(const chunk of req)bytes.push(chunk);
    if(req.url==='/api/validate'){res.end(JSON.stringify({issues:[]}));return;}
    if(Buffer.concat(bytes).toString()==='bad'){res.statusCode=400;res.end(JSON.stringify({error:'Unreadable card. Use an original English Discord card.'}));return;}
    res.end(JSON.stringify({draft:{character:{id:'lupa'}},elapsedMs:50}));return;
   }
   res.statusCode=404;res.end(JSON.stringify({error:'Unknown'}));
  });
  server.listen(port,'127.0.0.1');
 `);
 return script;
}
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));
async function ready(scanner){
 for(let i=0;i<40;i++){if(scanner.status().ready)return;await sleep(200);}
 assert.fail('Scanner mock did not become ready: '+JSON.stringify(scanner.status()));
}
const send=async(base,path,options={})=>{const r=await fetch(base+path,options);return {status:r.status,body:await r.text(),type:r.headers.get('content-type')};};

test('private-backed preview routes real same-origin HTTP scan/validate to its child and rejects unsafe requests',async()=>{
 const dir=await site();let scanner,server;
 try{
  scanner=await startLocalCharacterScanner({python:process.execPath,script:await stub(dir)});
  server=await startPreview({directory:dir,port:0,reviewHandler:scanner.handle});
  const base='http://127.0.0.1:'+server.address().port;
  await ready(scanner);
  assert.equal((await send(base,'/build/')).status,200);
  assert.equal((await send(base,'/improve/')).status,200);
  assert.equal((await send(base,'/sandbox/')).status,200);
  const input={method:'POST',headers:{'Content-Type':'image/png'},body:'image'};
  const scanned=await send(base,'/local-import/scan',input);
  assert.equal(scanned.status,200);assert.match(scanned.type,/application\/json/);
  assert.equal(JSON.parse(scanned.body).draft.character.id,'lupa');
  const validated=await send(base,'/local-import/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  assert.deepEqual(JSON.parse(validated.body),{issues:[]});
  const rejected=await send(base,'/local-import/scan',{...input,body:'bad'});
  assert.equal(rejected.status,400);assert.match(JSON.parse(rejected.body).error,/Unreadable card/);
  const foreign=await send(base,'/local-import/scan',{...input,headers:{...input.headers,Origin:'http://attacker.invalid'}});
  assert.equal(foreign.status,403);assert.ok(JSON.parse(foreign.body).error);
  assert.equal((await send(base,'/local-import/scan',{...input,headers:{'Content-Type':'text/plain'}})).status,415);
  assert.equal((await send(base,'/local-import/scan',{method:'GET'})).status,405);
  const oversized=await send(base,'/local-import/scan',{...input,body:Buffer.alloc(5*1024*1024+1)});
  assert.equal(oversized.status,413);
  scanner.close();
  const down=await send(base,'/local-import/scan',input);
  assert.equal(down.status,503);assert.match(JSON.parse(down.body).error,/unchanged/);
 }finally{
  scanner?.close();if(server){server.closeAllConnections();await new Promise(ok=>server.close(ok));}
  await rm(dir,{recursive:true,force:true});
 }
});

test('missing scanner executable produces an explicit JSON error without disabling Build',async()=>{
 const dir=await site();let scanner,server;
 try{
  scanner=await startLocalCharacterScanner({python:join(dir,'missing-python'),script:await stub(dir)});
  server=await startPreview({directory:dir,port:0,reviewHandler:scanner.handle});
  const base='http://127.0.0.1:'+server.address().port;
  for(let i=0;i<20&&!scanner.status().failed;i++)await sleep(50);
  assert.equal((await send(base,'/build/')).status,200);
  const response=await send(base,'/local-import/scan',{method:'POST',headers:{'Content-Type':'image/png'},body:'image'});
  assert.equal(response.status,503);
  assert.match(JSON.parse(response.body).error,/Python\/Tesseract prerequisites/);
 }finally{
  scanner?.close();if(server){server.closeAllConnections();await new Promise(ok=>server.close(ok));}
  await rm(dir,{recursive:true,force:true});
 }
});
