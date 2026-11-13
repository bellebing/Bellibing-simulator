// Real Chromium acceptance: Build → Add Character source-debut sort and existing ownership/filter workflow.
import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {CHARACTER_CATALOG} from '../src/data/characters.ts';
import {sortCharactersByOriginalRelease} from '../src/characterOriginalRelease.mjs';

const launch=()=>chromium.launch({headless:true,...(process.env.CHROME_BIN||process.env.BELLIBING_CHROMIUM_PATH?{executablePath:process.env.CHROME_BIN||process.env.BELLIBING_CHROMIUM_PATH}:{})});
const released=CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED');
const expected=sortCharactersByOriginalRelease(released);
const ids=page=>page.locator('.wb-character-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.wbCharacterPreview));
const open=async page=>{await page.locator('[data-bc-open="character"]').first().click();await page.locator('.wb-character-catalog').waitFor();};

test('Chromium: latest 5-star above all 4-star, source chronology, filters, preview, Add/owned, persistence after reload',async()=>{
 const server=await startPreview({port:0});
 const browser=await launch();
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port,profile='release-sort-'+Date.now();
 try{
  await page.goto(base+'/build/?profile='+profile+'&character=augusta');
  await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  await open(page);
  assert.deepEqual(await ids(page),expected.map(c=>c.id),'unfiltered catalog must follow first release, not alphabetical');
  assert.equal((await ids(page))[0],'hsin','newest imported released 5-star appears first');
  assert.equal(await page.locator('.wb-character-card').first().getAttribute('data-rarity'),'5');
  assert.equal(await page.locator('[data-wb-character-build="hsin"]').count(),1,'default preview follows newest');
  assert.equal((await ids(page)).at(-1),expected.at(-1).id);

  await page.locator('[data-wb-character-rarity="4"]').click();
  assert.deepEqual(await ids(page),expected.filter(c=>c.rarity===4).map(c=>c.id));
  await page.locator('[data-wb-character-rarity="4"]').click();
  await page.locator('[data-wb-character-element="Electro"]').click();
  await page.locator('[data-wb-character-weapon="Pistols"]').click();
  assert.deepEqual(await ids(page),expected.filter(c=>c.element==='Electro'&&c.weaponType==='Pistols').map(c=>c.id));
  await page.locator('[data-wb-character-weapon="Pistols"]').click();
  await page.locator('[data-wb-character-element="Electro"]').click();
  await page.locator('#wbCharacterSearch').fill('hsin');
  assert.deepEqual(await ids(page),['hsin'],'case-insensitive Character search retained');
  await page.locator('#wbCharacterSearch').fill('');
  await page.locator('[data-wb-character-rarity="5"]').click();
  assert.deepEqual(await ids(page),expected.filter(c=>c.rarity===5).map(c=>c.id));
  await page.reload();await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  await open(page);
  assert.equal(await page.locator('[data-wb-character-rarity="5"]').getAttribute('aria-pressed'),'true','rarity filter persists reload');
  assert.deepEqual(await ids(page),expected.filter(c=>c.rarity===5).map(c=>c.id));
  await page.locator('[data-wb-character-rarity="5"]').click();
  await page.locator('#wbCharacterSearch').fill('hsin');
  await page.locator('[data-wb-character-preview="hsin"]').click();
  assert.equal(await page.locator('.wb-character-preview-identity').innerText(),'Hsin');
  assert.equal(await page.locator('[data-wb-character-build="hsin"]').isDisabled(),true,'pending Build details must not be bypassed by sorting');
  // Use a fully supported Character for the AccountStore/Current Build acceptance.
  await page.locator('#wbCharacterSearch').fill('jiyan');
  await page.locator('[data-wb-character-preview="jiyan"]').click();
  assert.equal(await page.locator('.wb-character-preview-identity').innerText(),'Jiyan');
  await page.locator('[data-wb-character-build="jiyan"]').click();
  await page.locator('#bcName').waitFor();
  assert.equal(await page.locator('#bcName').innerText(),'Jiyan','Character preview opens Build');
  assert.equal(await page.evaluate(()=>!!buildCandidateReview.snapshot().account.characters.jiyan?.owned),false,'preview does not implicitly own');
  await page.locator('#bcAccount').click();
  await page.waitForFunction(()=>!!buildCandidateReview.snapshot().account.characters.jiyan?.owned);
  await open(page);
  assert.deepEqual(await ids(page),[],'persisted search does not show owned Jiyan');
  assert.equal(await page.locator('#wbCharacterSearch').inputValue(),'jiyan','search persists after Add Character');
  await page.locator('#wbCharacterSearch').fill('');
  assert.deepEqual(await ids(page),expected.filter(c=>c.id!=='jiyan').map(c=>c.id));
  await page.reload();await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  await open(page);
  assert.deepEqual(await ids(page),expected.filter(c=>c.id!=='jiyan').map(c=>c.id),'owned excluded and order survives reload');
  assert.equal(await page.evaluate(()=>!!buildCandidateReview.snapshot().account.characters.jiyan?.owned),true);
  assert.deepEqual(errors,[],'no browser console errors');
 } finally {
  await browser.close();
  await new Promise(ok=>server.close(ok));
 }
});
