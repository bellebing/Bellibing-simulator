import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan} from '../src/inventoryAccount.mjs';
const launch=()=>chromium.launch({headless:true,...(process.env.BELLIBING_CHROMIUM_PATH?{executablePath:process.env.BELLIBING_CHROMIUM_PATH}:{})});
test('product UI shares saved Characters and Teams, preserves imported accounts on read, rejects stale saves',async()=>{
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port,browser=await launch();
 try{
  const context=await browser.newContext({viewport:{width:1920,height:1080}}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));const profile='product-journey';
  for(const id of ['augusta','iuno','the-shorekeeper']){
   await page.goto(base+'/build/?profile='+profile+'&character='+id);await page.waitForFunction(()=>!!globalThis.buildCandidateReview);await page.locator('#bcAccount').click();await page.waitForFunction(id=>globalThis.bellibingAccountSession?.store.snapshot()?.characters?.[id]?.owned===true,id);
  }
  await page.goto(base+'/inventory/?profile='+profile);await page.locator('[data-iv-kind=character]').click();assert.equal(await page.locator('.iv-card').count(),3);
  await page.locator('[data-iv-item=augusta]').click();await page.locator('[data-iv-build=augusta]').click();await page.waitForURL('**/build/**');assert.equal(await page.locator('#bcName').textContent(),'Augusta');
  await page.goto(base+'/teams/?profile='+profile);await page.waitForSelector('#tcSave');
  for(const [slot,id]of ['augusta','iuno','the-shorekeeper'].entries()){
   await page.locator('[data-choose="'+slot+'"]').first().click();await page.waitForTimeout(600);await page.locator('[data-art="'+id+'"]').click({force:true});await page.waitForTimeout(300);
  }
  await page.locator('#tcNameInput').fill('Saved account trio');await page.locator('#tcSave').click();await page.waitForFunction(()=>document.querySelector('#tcMessage').textContent==='Team saved.');await page.reload();await page.waitForSelector('#tcSave');assert.deepEqual(await page.locator('#tcMembers .tc-member h3').allTextContents(),['Augusta','Iuno','The Shorekeeper']);assert.equal(await page.locator('#tcTeamName').textContent(),'Saved account trio');await page.locator('#tcNameInput').fill('Unsaved name');await page.locator('#tcCancelChanges').click();assert.equal(await page.locator('#tcNameInput').inputValue(),'Saved account trio');assert.equal(await page.locator('.tc-open-build').count(),3);
  await page.goto(base+'/build/?profile='+profile+'&character=jiyan');await page.waitForSelector('#bcAccount');
  const other=await context.newPage();await other.goto(base+'/build/?profile='+profile+'&character=mortefi');await other.waitForFunction(()=>!!globalThis.buildCandidateReview);await other.locator('#bcAccount').click();await other.waitForFunction(()=>globalThis.bellibingAccountSession?.store.snapshot()?.characters?.mortefi?.owned===true);await page.waitForTimeout(300);await page.locator('#bcAccount').click();await page.waitForFunction(()=>/changed|Reload/i.test(document.querySelector('#bcStatus').textContent));await other.close();
  const imported=saveReviewedScan(emptyAccount(),scan('augusta'),catalog,{reviewed:true,assign:true});imported.userData.observations.keep={value:'retained'};
  await page.evaluate(async account=>{const db=await new Promise(ok=>{const r=indexedDB.open('bellibing-owned-inventory',3);r.onsuccess=()=>ok(r.result);});await new Promise((ok,fail)=>{const tx=db.transaction('accounts','readwrite');tx.objectStore('accounts').put(account,'imported-product');tx.oncomplete=ok;tx.onerror=()=>fail(tx.error);});db.close();},imported);
  for(const route of ['build','inventory','teams','improve']){
   await page.goto(base+'/'+route+'/?profile=imported-product');await page.waitForTimeout(700);
   const account=await page.evaluate(async()=>{const db=await new Promise(ok=>{const r=indexedDB.open('bellibing-owned-inventory',3);r.onsuccess=()=>ok(r.result);});const account=await new Promise(ok=>{const r=db.transaction('accounts').objectStore('accounts').get('imported-product');r.onsuccess=()=>ok(r.result);});db.close();return account;});assert.deepEqual(account,imported,route+' must not mutate imported data');
  }
  assert.deepEqual(errors,[]);await context.close();
 }finally{await browser.close();await new Promise(ok=>server.close(ok));}
});

test('shared product header stays identical across workspaces at desktop widths',async()=>{
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port,browser=await launch();
 try{const page=await browser.newPage();
  for(const width of [1920,1440]){await page.setViewportSize({width,height:1080});let baseline;
   for(const route of ['build','inventory','teams','improve','sandbox']){
    await page.goto(base+'/'+route+'/?profile=header-consistency');await page.waitForSelector('#productNavigation');
    const layout=await page.locator('#productNavigation').evaluate(el=>({height:el.getBoundingClientRect().height,background:getComputedStyle(el).backgroundColor,brand:getComputedStyle(el.querySelector('strong')).fontSize,links:[...el.querySelectorAll(':scope > nav > a')].map(a=>({label:a.textContent,x:a.getBoundingClientRect().x,y:a.getBoundingClientRect().y,h:a.getBoundingClientRect().height,opacity:getComputedStyle(a).opacity,after:getComputedStyle(a,'::after').content})),legacy:el.querySelectorAll('[href*="legacy"]').length,actions:el.querySelector('.bc-header-actions').textContent}));
    assert.equal(layout.legacy,0);assert.equal(layout.actions,'ImportLogga in');if(!baseline)baseline=layout;else assert.deepEqual(layout,baseline,route+' header at '+width);
   }
  }
 }finally{await browser.close();await new Promise(ok=>server.close(ok));}
});
