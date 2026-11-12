// Runs against the real built product, IndexedDB and a real Chromium profile.
import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {catalog} from './fixtures/inventory.mjs';

test('product Build Account Mode saves two same-species physical Echoes, Preview stays isolated, stale-tab edit fails visibly',async()=>{
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||process.env.BELLIBING_CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),inventory=await context.newPage(),other=await context.newPage();
 const errors=[];for(const p of [page,inventory,other])p.on('pageerror',error=>errors.push(error.message));
 try{
  const species=catalog.echoes.find(e=>e.name==='The False Sovereign');
  assert.ok(species);
  const profile='account-build-sync-chromium';
  await page.goto(base+'/build/?profile='+profile+'&character=augusta');
  await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  await page.locator('#bcAccount').click();
  await page.waitForFunction(()=>document.querySelector('#bcStatus')?.textContent==='Saved to account.');
  const original=await page.evaluate(()=>bellibingAccountSession.store.snapshot());
  assert.equal(Object.keys(original.items).length,0,'blank Augusta should have no physical items');

  await page.locator('[data-bc-echo="0"]').click();
  await page.locator('[data-bc-species="'+species.id+'"]').first().click();
  await page.locator('[data-bc-main="HP%"]').first().click();
  await page.locator('[data-bc-equip="echo"]').click();
  await page.locator('[data-bc-confirm="yes"]').click();
  await page.waitForFunction(()=>document.querySelector('#bcSaved')?.textContent==='Saved to Inventory');
  const withA=await page.evaluate(()=>bellibingAccountSession.store.snapshot());
  const idA=withA.characters.augusta.record.build.echoSets.sets['set-1'].slots[0];
  assert.ok(withA.items[idA]);assert.equal(withA.items[idA].data.mainStat.name,'HP%');

  await page.locator('[data-bc-new-echo]').click();
  await page.locator('[data-bc-main="CRIT DMG"]').first().click();
  await page.locator('[data-bc-equip="echo"]').click();
  await page.locator('[data-bc-confirm="yes"]').click();
  await page.waitForFunction(previous=>document.querySelector('#bcSaved')?.textContent==='Saved to Inventory'&&bellibingAccountSession.store.snapshot()?.characters.augusta.record.build.echoSets.sets['set-1'].slots[0]!==previous,idA);
  const withB=await page.evaluate(()=>bellibingAccountSession.store.snapshot());
  const idB=withB.characters.augusta.record.build.echoSets.sets['set-1'].slots[0];
  assert.notEqual(idA,idB);
  assert.ok(withB.items[idA]);assert.ok(withB.items[idB]);
  assert.equal(withB.items[idB].data.mainStat.name,'CRIT DMG');
  assert.equal(Object.values(withB.items).filter(e=>e.catalogId===species.id).length,2);

  await inventory.goto(base+'/inventory/?profile='+profile);
  await inventory.locator('[data-iv-kind="echo"]').click();
  assert.equal(await inventory.locator('.iv-card').count(),2,'Inventory shows both individual physical Echoes');
  assert.deepEqual(await inventory.evaluate(()=>bellibingAccountSession.store.snapshot().items),withB.items);
  await page.locator('#bcPreviewMode').click();
  assert.equal(await page.locator('#bcPreviewMode').getAttribute('aria-pressed'),'true');
  await page.locator('[data-bc-echo="0"]').click();
  await page.locator('[data-bc-new-echo]').click();
  await page.locator('[data-bc-equip="echo"]').click();
  assert.match(await page.locator('#bcSaved').innerText(),/Preview/);
  assert.deepEqual(await page.evaluate(()=>bellibingAccountSession.store.snapshot()),withB,'Preview must not write to AccountStore');
  await page.reload();await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  assert.equal(await page.locator('#bcPreviewMode').getAttribute('aria-pressed'),'true','Preview mode survives reload as a safety boundary');
  assert.deepEqual(await page.evaluate(()=>bellibingAccountSession.store.snapshot()),withB);
  await page.locator('#bcPreviewMode').click();
  assert.equal(await page.locator('#bcPreviewMode').getAttribute('aria-pressed'),'false');

  await other.goto(base+'/build/?profile='+profile+'&character=augusta');
  await other.waitForFunction(()=>!!globalThis.buildCandidateReview);
  await other.evaluate(async()=>bellibingAccountSession.store.saveUserData('bellibing.improve.policy.v3','{"version":3}'));
  await page.locator('[data-bc-echo="0"]').click();
  await page.locator('[data-bc-main="HP%"]').first().click();
  await page.locator('[data-bc-equip="echo"]').click();
  await page.waitForFunction(()=>document.querySelector('#bcSaved')?.textContent.includes('NOT SAVED'));
  assert.match(await page.locator('#bcStatus').innerText(),/Account changed|another tab|Reload/);
  const current=await other.evaluate(()=>bellibingAccountSession.store.snapshot());
  assert.equal(current.items[idB].data.mainStat.name,'CRIT DMG','failed stale save must not mutate physical item');
  assert.equal(current.characters.augusta.record.build.echoSets.sets['set-1'].slots[0],idB);
  assert.deepEqual(errors,[]);
 }finally{
  await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
 }
});
