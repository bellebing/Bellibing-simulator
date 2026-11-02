import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,extname} from 'node:path';
import {tmpdir} from 'node:os';
import {chromium,firefox} from '@playwright/test';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan} from '../src/inventoryAccount.mjs';

// Serve the actual preceding PR modules and the changed modules on one origin.
// Synthetic builds only; no owner images or private engine inputs.
for(const [name,engine]of Object.entries({chromium,firefox}))test(name+': actual browser process restart and v1 database upgrade',async()=>{
 const root=resolve('.'),old=Object.fromEntries(['inventoryAccount.mjs','inventoryAccountStore.mjs'].map(file=>[file,readFileSync('test/fixtures/foundation-v0/'+file,'utf8')]));
 const manifest=JSON.parse(readFileSync('test/fixtures/foundation-v0/manifest.json'));for(const [file,content]of Object.entries(old))assert.equal(createHash('sha256').update(content).digest('hex'),manifest.files[file]);
 const server=createServer(async(req,res)=>{try{
  const path=new URL(req.url,'http://local').pathname;
  if(path==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Foundation persistence verification</title>');return;}
  const previous=path.match(/^\/previous\/(inventoryAccount(?:Store)?\.mjs)$/);
  if(previous){res.setHeader('Content-Type','text/javascript');res.end(old[previous[1]]);return;}
  const file=resolve(root,'.'+decodeURIComponent(path));if(!file.startsWith(root+'/'))throw Error();
  res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png'})[extname(file)]??'application/octet-stream');res.end(await readFile(file));
 }catch{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port,profile=await mkdtemp(resolve(tmpdir(),'bellibing-foundation-'));
 let context;try{
  const launch=()=>engine.launchPersistentContext(profile,{headless:true,timeout:20000,env:{...process.env,XDG_CACHE_HOME:profile+'/cache',MOZ_DISABLE_CONTENT_SANDBOX:'1'},args:name==='chromium'?['--no-sandbox']:[]});
  context=await launch();let page=context.pages()[0];await page.goto(url);
  const a=saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true});delete a.userData;
  const first=await page.evaluate(async({a,catalog})=>{const {openAccountStore}=await import('/previous/inventoryAccountStore.mjs');const store=await openAccountStore({catalog});const saved=await store.commit(a);store.close();return saved;},{a,catalog});
  await context.close();context=await launch();page=context.pages()[0];await page.goto(url);
  const result=await page.evaluate(async({catalog})=>{
   const {openAccountStore}=await import('/src/inventoryAccountStore.mjs'),{withUserData,exportAccount,parseBackup}=await import('/src/inventoryAccount.mjs');
   const store=await openAccountStore({catalog}),before=store.snapshot();
   const next=withUserData(before,{storage:{'bellibing.improve.policy.v3':'{"version":3,"note":"retained"}'}});
   await store.commit(next);const saved=store.snapshot(),backup=exportAccount(saved,catalog),restored=parseBackup(JSON.stringify(backup),{...catalog,sourceBinding:'NEW_CATALOG'}),points=await store.recovery();
   const outbox=await store.pendingSync();store.close();return {before,saved,restored,points,outbox};
  },{catalog});
  assert.deepEqual(result.before,first);assert.deepEqual(result.saved.items,first.items);assert.deepEqual(result.restored,result.saved);
  assert.deepEqual(result.outbox.account,result.saved);assert.deepEqual(result.points.find(p=>p.protected).previous,first);
  await context.close();context=await launch();page=context.pages()[0];await page.goto(url);
  const reopened=await page.evaluate(async({catalog})=>{const {openAccountStore}=await import('/src/inventoryAccountStore.mjs');const s=await openAccountStore({catalog});const value=s.snapshot();s.close();return value;},{catalog});
  assert.deepEqual(reopened,result.saved);
 }finally{await context?.close();await new Promise(resolve=>server.close(resolve));await rm(profile,{recursive:true,force:true});}
});
