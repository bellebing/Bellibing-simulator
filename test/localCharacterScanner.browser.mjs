// Real built Build/Inventory in Chromium, real HTTP boundary, synthetic scanner response.
// This is NOT a recognition-accuracy test; actual image OCR needs private original fixtures.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {startLocalCharacterScanner} from '../scripts/local-character-scanner.mjs';
import {scan} from './fixtures/inventory.mjs';

async function uploadCard(page){
 await page.locator('[data-product-import]').click();
 await page.evaluate(async()=>{
  const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;
  const blob=await new Promise(ok=>canvas.toBlob(ok,'image/png'));
  const transfer=new DataTransfer();transfer.items.add(new File([blob],'card.png',{type:'image/png'}));
  const input=document.querySelector('[data-card-upload]');
  input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
 });
}
test('real Chromium import uses same-origin scanner route: stage, explicit Add, Inventory and fail-closed errors',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'bellibing-scanner-browser-'));
 let scanner,server,browser;
 try{
  const script=join(dir,'scanner-mock.mjs'),draft={kind:'bellibing-scanner-review',schemaVersion:1,...scan('ciaccona')};
  await writeFile(script,`
   import {createServer} from 'node:http';
   let scans=0;
   const server=createServer(async(req,res)=>{
    res.setHeader('Content-Type','application/json');
    if(req.url==='/api/catalog'){res.end(JSON.stringify({characters:[],weapons:[]}));return;}
    for await(const ignored of req){}
    if(req.url==='/api/scan'){
     if(++scans===1){res.end(JSON.stringify({draft:${JSON.stringify(draft)},elapsedMs:100}));return;}
     res.statusCode=400;res.end(JSON.stringify({error:'Unreadable card. Use an original English Discord card.'}));return;
    }
    if(req.url==='/api/validate'){res.end(JSON.stringify({issues:[]}));return;}
    res.statusCode=404;res.end('{}');
   });server.listen(Number(process.argv.at(-1)),'127.0.0.1');
  `);
  scanner=await startLocalCharacterScanner({python:process.execPath,script});
  server=await startPreview({port:0,reviewHandler:scanner.handle});
  const base='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.setDefaultTimeout(20000);
  for(let i=0;i<50&&!scanner.status().ready;i++)await new Promise(ok=>setTimeout(ok,200));
  assert.equal(scanner.status().ready,true);
  const profile='scanner-http-review';
  await page.goto(base+'/build/?profile='+profile);
  await page.waitForFunction(()=>!!globalThis.bellibingProductImport);
  await uploadCard(page);
  await page.waitForFunction(()=>document.querySelector('#bcStatus')?.textContent.startsWith('Imported draft.'));
  assert.equal(await page.locator('#bcName').textContent(),'Ciaccona');
  assert.deepEqual(await page.evaluate(()=>Object.keys(buildCandidateReview.snapshot().account.characters)),[]);
  await page.locator('#bcAccount').click();
  await page.waitForFunction(()=>document.querySelector('#bcStatus')?.textContent.includes('Character added.'));
  const before=await page.evaluate(()=>structuredClone(buildCandidateReview.snapshot().account));
  assert.equal(Object.keys(before.items).length,6);
  await page.goto(base+'/inventory/?profile='+profile);
  await page.locator('[data-iv-kind="character"]').waitFor();
  await page.locator('[data-iv-kind="character"]').click();
  assert.equal(await page.locator('.iv-card').count(),1);
  await page.locator('[data-iv-kind="echo"]').click();
  assert.equal(await page.locator('.iv-card').count(),5);
  await page.goto(base+'/build/?profile='+profile);
  await page.waitForFunction(()=>!!globalThis.bellibingProductImport);
  await uploadCard(page);
  await page.locator('[data-owned-message]').filter({hasText:'Unreadable card'}).waitFor();
  assert.deepEqual(await page.evaluate(()=>buildCandidateReview.snapshot().account),before);
  scanner.close();
  await uploadCard(page);
  await page.locator('[data-owned-message]').filter({hasText:'account is unchanged'}).waitFor();
  assert.deepEqual(await page.evaluate(()=>buildCandidateReview.snapshot().account),before);
  for(const route of ['/build/','/inventory/','/improve/','/dps-lab/']){
   assert.equal((await fetch(base+route)).status,200,route);
  }
  assert.deepEqual(errors,[]);
 }finally{
  scanner?.close();if(browser)await browser.close();
  if(server){server.closeAllConnections();await new Promise(ok=>server.close(ok));}
  await rm(dir,{recursive:true,force:true});
 }
});
