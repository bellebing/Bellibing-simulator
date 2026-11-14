import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {isInside} from '../scripts/local-paths.mjs';
import {chromium} from '@playwright/test';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan} from '../src/inventoryAccount.mjs';

test('built product saves resources and Gate in the Inventory owner and retains them on reload',async()=>{
 const root=resolve('dist'),server=createServer(async(req,res)=>{try{
  let path=new URL(req.url,'http://local').pathname;if(path.endsWith('/'))path+='index.html';
  const file=resolve(root,'.'+decodeURIComponent(path));if(!isInside(root,file))throw Error();
  res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.webp':'image/webp','.png':'image/png'})[extname(file)]??'application/octet-stream');res.end(await readFile(file));
 }catch{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox']});try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.stack));
  await page.goto(url+'/inventory/?profile=foundation-test');
  const input=saveReviewedScan(emptyAccount(),scan('augusta'),catalog,{reviewed:true,assign:true});
  await page.evaluate(async input=>{const {accountSession}=await import('/inventory/account-session.js'),owner=await accountSession();await owner.store.commit(input);},input);
  await page.goto(url+'/improve/?character=augusta&profile=foundation-test');
  const showSettings=async()=>{if(await page.locator('#settingsToggle').getAttribute('aria-expanded')!=='true')await page.locator('#settingsToggle').click();};
  await showSettings();
  const tuners=page.locator('[data-resource="tuners"] input');await tuners.waitFor();
  await tuners.fill('321');await tuners.press('Enter');
  await page.waitForFunction(()=>{const a=window.bellibingAccountSession?.store.snapshot();return a?.userData.storage['bellibing.improve.policy.v3']?.includes('321');});
  await page.locator('.gate-options button').filter({hasText:'+10'}).click();
  await page.waitForFunction(()=>window.bellibingAccountSession?.store.snapshot()?.userData.workspaceSettings?.augusta?.gate==='+10');
  const before=await page.evaluate(()=>window.bellibingAccountSession.store.snapshot());
  await page.reload();await showSettings();await tuners.waitFor();assert.equal(await tuners.inputValue(),'321');
  await page.waitForFunction(()=>document.querySelector('.compact-gate')?.textContent==='+10');
  const after=await page.evaluate(()=>window.bellibingAccountSession.store.snapshot());assert.deepEqual(after,before);
  // Real current ownership must retain IndexedDB identity through the new reader.
  const current=await page.evaluate(()=>window.bellibingLabConfiguration?.productionEvidence());
  assert.equal(current.ownerRecord.accountId,before.id);assert.equal(current.revisions.build,before.characters.augusta.revision);
  await mkdir('artifacts/foundation',{recursive:true});await page.screenshot({path:'artifacts/foundation/improve-persistence-1440.png'});
  await page.goto(url+'/inventory/?profile=foundation-test');await page.locator('[data-iv-kind=character]').click();await page.locator('[data-iv-item=augusta]').waitFor();await page.locator('[data-iv-kind=echo]').click();
  assert.equal(await page.locator('[data-iv-item]').count(),5);await page.locator('[data-iv-kind="weapon"]').click();assert.equal(await page.locator('[data-iv-item]').count(),1);
  await page.setViewportSize({width:1920,height:1080});await page.goto(url+'/improve/?character=augusta&profile=foundation-test');
  await showSettings();await page.waitForFunction(()=>document.querySelector('.compact-gate')?.textContent==='+10');await page.screenshot({path:'artifacts/foundation/improve-persistence-1920.png'});
  const future=await page.evaluate(async()=>{
   const owner=window.bellibingAccountSession,value=owner.store.snapshot();value.schemaVersion=999;value.futureNote='preserve every field';owner.store.close();
   const db=await new Promise(resolve=>{const r=indexedDB.open('bellibing-owned-inventory');r.onsuccess=()=>resolve(r.result);});
   await new Promise((resolve,reject)=>{const tx=db.transaction('accounts','readwrite');tx.objectStore('accounts').put(value,'foundation-test');tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});db.close();return value;
  });
  await page.goto(url+'/inventory/?profile=foundation-test');await page.locator('[data-raw-recovery]').waitFor();
  const downloading=page.waitForEvent('download');await page.locator('[data-raw-recovery]').click();const download=await downloading;
  const raw=JSON.parse(await readFile(await download.path(),'utf8'));assert.deepEqual(raw.account,future);
  assert.equal(await page.evaluate(()=>window.bellibingAccountSession.store.status().writable),false);assert.deepEqual(errors,[]);
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
});
