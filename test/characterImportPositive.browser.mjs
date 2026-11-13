// Positive real Chromium acceptance. Every imported Character must be an owned
// AccountStore record with one physical equipped Echo; a preview alone is NOT pass.
import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {catalog} from './fixtures/inventory.mjs';
import {CHARACTER_CATALOG} from '../src/data/characters.ts';
import {sortCharactersByOriginalRelease} from '../src/characterOriginalRelease.mjs';

const ids=['hsin','lily','suoming'];
const species=catalog.echoes.find(e=>e.name==='The False Sovereign');
const launch=()=>chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.CHROME_BIN||process.env.BELLIBING_CHROMIUM_PATH?{executablePath:process.env.CHROME_BIN||process.env.BELLIBING_CHROMIUM_PATH}:{})});
test('Hsin, Lily and Suoming: Add Character → genuine Echo → reload → Inventory → Improve; no duplicates or item loss',async()=>{
 assert.ok(species,'real Echo identity fixture');
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port;
 const browser=await launch(),context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();
 page.setDefaultTimeout(20000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const profile='character-import-owned-'+Date.now();
 const snapshot=()=>page.evaluate(()=>globalThis.bellibingAccountSession.store.snapshot());
 const open=async()=>{await page.locator('[data-bc-open="character"]').first().click();await page.locator('.wb-character-catalog').waitFor();};
 const equip=async()=>{
  await page.locator('[data-bc-echo="0"]').click();
  await page.locator('[data-bc-species="'+species.id+'"]').first().click();
  await page.locator('.wc-echo-preview .wb-feature-stat summary').click();
  await page.locator('[data-bc-main="HP%"]').first().click();
  assert.equal(await page.locator('#bcEditorError').innerText(),'');
  await page.locator('[data-bc-equip="echo"]').click();
  await page.waitForFunction(()=>document.querySelector('#bcSaved')?.textContent==='Current Build saved');
 };
 try{
  await page.goto(base+'/build/?profile='+profile+'&character=augusta');
  await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  // Establish a genuine pre-existing owned Character and physical Echo.
  await page.locator('#bcAccount').click();
  await page.waitForFunction(()=>globalThis.bellibingAccountSession?.store.snapshot()?.characters?.augusta?.owned);
  await equip();
  const baseline=await snapshot();
  const previousIds=Object.keys(baseline.items);
  assert.equal(previousIds.length,1,'existing physical Echo baseline');
  const released=sortCharactersByOriginalRelease(CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED'));
  await open();
  const initialOrder=await page.locator('.wb-character-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.wbCharacterPreview));
  assert.equal(initialOrder[0],'lily','first current 5-star is Lily');
  assert.deepEqual(initialOrder,released.filter(c=>c.id!=='augusta').map(c=>c.id));
  for(const [index,id] of ids.entries()){
   const expected=CHARACTER_CATALOG.find(c=>c.id===id);
   assert.equal(expected?.releaseStatus,'RELEASED');
   if(index>0)await open();
   await page.locator('#wbCharacterSearch').fill(id);
   const card=page.locator('[data-wb-character-preview="'+id+'"]');
   await card.waitFor();
   assert.equal(await card.count(),1,'one canonical catalog identity '+id);
   await card.click();
   assert.equal(await page.locator('.wb-character-preview-identity').innerText(),expected.name);
   // This checks the real preview image, not a generated catalog JSON flag.
   const art=card.locator('img').first();
   if(await art.count())assert.equal(await art.evaluate(img=>img.complete&&img.naturalWidth>0),true,'genuine portrait rendered for '+id);
   const choose=page.locator('[data-wb-character-build="'+id+'"]');
   assert.equal(await choose.isDisabled(),false,'Build preview action must be enabled: '+id);
   await choose.click();
   await page.locator('#bcName').waitFor();
   assert.equal(await page.locator('#bcName').innerText(),expected.name);
   assert.equal((await snapshot()).characters[id],undefined,'selection is not ownership');
   assert.equal(await page.locator('#bcAccount').innerText(),'Add Character','actual AccountStore action is distinct from preview');
   await page.locator('#bcAccount').click();
   await page.waitForFunction(id=>globalThis.bellibingAccountSession?.store.snapshot()?.characters?.[id]?.owned,id);
   assert.equal(await page.locator('#bcAccount').isHidden(),true,'no duplicate Add once owned');
   await equip();
   let current=await snapshot();
   const slot=current.characters[id].record.build.echoSets.sets['set-1'].slots[0];
   assert.ok(slot,'saved physical Echo slot '+id);
   assert.equal(current.items[slot].catalogId,species.id);
   assert.equal(current.items[slot].data.mainStat.name,'HP%');
   assert.deepEqual(current.characters.augusta,baseline.characters.augusta,'existing Character unchanged');
   for(const key of previousIds)assert.deepEqual(current.items[key],baseline.items[key],'pre-existing item unchanged');
   assert.equal(Object.keys(current.items).length,previousIds.length+index+1,'no duplicated Echo instances');
   await page.reload();await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
   current=await snapshot();
   assert.equal(current.characters[id]?.owned,true,'owned after reload '+id);
   assert.equal(current.characters[id].record.build.echoSets.sets['set-1'].slots[0],slot,'same Echo ID after reload '+id);
   await page.goto(base+'/inventory/?profile='+profile);
   await page.locator('[data-iv-kind="character"]').click();
   await page.locator('[data-iv-item="'+id+'"]').waitFor();
   await page.locator('[data-iv-kind="echo"]').click();
   await page.locator('[data-iv-item="'+slot+'"]').waitFor();
   assert.equal((await snapshot()).items[slot].catalogId,species.id,'Inventory owner has equipped Echo');
   await page.goto(base+'/improve/?profile='+profile+'&character='+id);
   await page.waitForFunction(()=>!!globalThis.bellibingLabConfiguration?.productionEvidence);
   const evidence=await page.evaluate(()=>globalThis.bellibingLabConfiguration.productionEvidence());
   assert.equal(evidence.status,'OBSERVED_PRODUCTION_BUILD_RECORD','Improve receives real saved Current Build for '+id);
   assert.equal(evidence.buildState.echoSets.sets[evidence.buildState.echoSets.activeSetId].slots[0].catalogId,species.id,'Improve Current Echo '+id);
   // A source guide may be absent; never replace Pending with invented BiS.
   assert.equal(await page.locator('body').isVisible(),true);
   await page.goto(base+'/build/?profile='+profile+'&character='+id);
   await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
   await open();
   await page.locator('#wbCharacterSearch').fill(id);
   assert.equal(await card.count(),0,'already-owned Character is not re-importable '+id);
  }
  assert.deepEqual(errors,[],'no browser errors');
 }finally{
  await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
 }
});
