import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';

const launch=()=>chromium.launch({headless:true,...(process.env.BELLIBING_CHROMIUM_PATH?{executablePath:process.env.BELLIBING_CHROMIUM_PATH}:{})});
const costs=async page=>page.locator('.wb-cost-buttons [aria-pressed=true]').getAttribute('data-bc-cost');
const selectedSets=async page=>page.locator('.wb-sonata-filter [data-bc-set-filter][aria-pressed=true]').evaluateAll(nodes=>nodes.map(node=>node.dataset.bcSetFilter));
const inventoryCount=page=>page.evaluate(()=>Object.keys(buildCandidateReview.snapshot().account.items).length);
const openSlot=async(page,slot)=>{await page.evaluate(index=>buildCandidateReview.openEcho(index),slot);await page.locator('.wb-cost-buttons').waitFor();};
const openBuild=async(page,base,profile,character)=>{
 await page.goto(base+'/build/?profile='+profile+'&character='+character);
 await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
};
test('Chromium: character-source Echo presets, five slot Cost, manual filters and same-account isolation survive equip, navigation, reload',async()=>{
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port,browser=await launch();
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const profile='source-filter-acceptance-'+Date.now();
  await openBuild(page,base,profile,'augusta');
  await page.locator('#bcAccount').click();
  await page.waitForFunction(()=>!!globalThis.buildCandidateReview?.snapshot().account.characters.augusta?.owned);
  assert.equal(await page.locator('#bcSaved').innerText(),'Current Build · saved');
  for(const [slot,cost] of [4,3,3,1,1].entries()){
   await openSlot(page,slot);assert.equal(await costs(page),String(cost),'Augusta slot '+(slot+1));
   assert.match(await page.locator('.wb-slot-guidance').innerText(),new RegExp('Cost '+cost));
  }
  await openSlot(page,1);
  const countBefore=await inventoryCount(page);
  const allSets=await selectedSets(page);
  assert.ok(allSets.includes('sonata-20')&&allSets.includes('sonata-3'),'Augusta source primary and companion presets');
  const setFilter=async(id)=>{
   if(!await page.locator('.wb-sonata-filter').evaluate(node=>node.open)) await page.locator('.wb-sonata-filter summary').click();
   await page.locator('[data-bc-set-filter="'+id+'"]').click();
  };
  await setFilter('all');
  await setFilter('sonata-20');
  await setFilter('sonata-3');
  assert.deepEqual((await selectedSets(page)).sort(),['sonata-20','sonata-3']);
  assert.equal(await inventoryCount(page),countBefore,'filter selection must not create physical inventory');
  // The Sonata details dropdown overlays the Echo grid: close it before choosing a card.
  if(await page.locator('.wb-sonata-filter').evaluate(node=>node.open))await page.locator('.wb-sonata-filter summary').click();
  const species=page.locator('[data-bc-species]').first();
  assert.ok(await species.count()>0,'source-backed Cost 3 + Sonata options must offer Echoes');
  await species.click();
  await page.locator('[data-bc-equip="echo"]').click();
  await page.waitForFunction(()=>document.querySelector('#bcSaved')?.textContent==='Current Build saved'&&!!buildCandidateReview.snapshot().drafts.augusta.echoes[1]);
  const afterEquip=await inventoryCount(page);
  assert.equal(afterEquip,countBefore+1,'Equip Echo creates exactly one physical inventory item');
  await openSlot(page,2);
  assert.equal(await costs(page),'3','Augusta slot 3 defaults Cost 3');
  assert.deepEqual((await selectedSets(page)).sort(),['sonata-20','sonata-3']);
  await page.locator('[data-bc-cost="1"]').click();
  assert.equal(await costs(page),'1');
  await setFilter('all');
  assert.deepEqual(await selectedSets(page),['all']);
  await page.locator('#bcEchoSearch').fill('Echo-that-does-not-exist');
  await openSlot(page,4);
  assert.equal(await costs(page),'1');
  assert.equal(await page.locator('#bcEchoSearch').inputValue(),'Echo-that-does-not-exist');
  await openSlot(page,2);
  assert.equal(await costs(page),'1','manual slot Cost wins over source');
  assert.deepEqual(await selectedSets(page),['all'],'explicit manual All wins over source sets');
  await page.reload();await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  await openSlot(page,2);
  assert.equal(await costs(page),'1','slot override survives reload');
  assert.deepEqual(await selectedSets(page),['all']);
  assert.equal(await page.locator('#bcEchoSearch').inputValue(),'Echo-that-does-not-exist');
  assert.equal(await inventoryCount(page),afterEquip,'filters must not touch physical Inventory');
  await page.evaluate(()=>{buildCandidateReview.selectCharacter('cartethyia');});
  await page.waitForFunction(()=>document.querySelector('#bcName')?.textContent==='Cartethyia');
  for(const [slot,cost] of [4,4,1,1,1].entries()){
   await openSlot(page,slot);
   assert.equal(await costs(page),String(cost),'Cartethyia slot '+(slot+1));
  }
  await page.evaluate(()=>{buildCandidateReview.selectCharacter('augusta');});
  await page.waitForFunction(()=>document.querySelector('#bcName')?.textContent==='Augusta');
  await openSlot(page,2);
  assert.equal(await costs(page),'1','Augusta manual slot choice survives character switch');
  assert.deepEqual(await selectedSets(page),['all']);
  assert.equal(await page.locator('#bcEchoSearch').inputValue(),'Echo-that-does-not-exist');
  await page.evaluate(()=>buildCandidateReview.openWeapon());
  await page.locator('#bcWeaponSearch').fill('Thunder');
  await page.locator('[data-bc-close]').click();
  await page.evaluate(()=>buildCandidateReview.openWeapon());
  assert.equal(await page.locator('#bcWeaponSearch').inputValue(),'Thunder');
  await page.reload();await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  await page.evaluate(()=>buildCandidateReview.openWeapon());
  assert.equal(await page.locator('#bcWeaponSearch').inputValue(),'Thunder');
  await page.locator('[data-bc-close]').click();
  await page.locator('[data-bc-open="character"]').first().click();
  await page.locator('#wbCharacterSearch').fill('cart');
  await page.locator('[data-bc-close]').click();
  await page.locator('[data-bc-open="character"]').first().click();
  assert.equal(await page.locator('#wbCharacterSearch').inputValue(),'cart');
  await page.reload();await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  await page.locator('[data-bc-open="character"]').first().click();
  assert.equal(await page.locator('#wbCharacterSearch').inputValue(),'cart');
  assert.deepEqual(errors,[]);
 }finally{await browser.close();await new Promise(ok=>server.close(ok));}
});

test('Chromium: Inventory search/category and detached Sandbox disclosures persist without an Account write',async()=>{
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port,browser=await launch();
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const profile='independent-panels-'+Date.now();
  await page.goto(base+'/inventory/?profile='+profile);
  await page.locator('#ivSearch').waitFor();
  await page.locator('#ivSearch').fill('keep-my-search');
  await page.locator('[data-iv-kind="weapon"]').click();
  await page.reload();
  await page.locator('#ivSearch').waitFor();
  assert.equal(await page.locator('#ivSearch').inputValue(),'keep-my-search');
  assert.equal(await page.locator('[data-iv-kind="weapon"]').getAttribute('aria-pressed'),'true');
  await page.goto(base+'/sandbox/?profile='+profile);
  await page.locator('#settingsToggle').waitFor();
  const initialSettings=await page.locator('#settingsToggle').getAttribute('aria-expanded');
  const initialCharacter=await page.locator('#characterToggle').getAttribute('aria-expanded');
  await page.locator('#settingsToggle').click();
  await page.locator('#characterToggle').click();
  const newSettings=await page.locator('#settingsToggle').getAttribute('aria-expanded');
  const newCharacter=await page.locator('#characterToggle').getAttribute('aria-expanded');
  assert.notEqual(newSettings,initialSettings);
  assert.notEqual(newCharacter,initialCharacter);
  await page.reload();
  await page.locator('#settingsToggle').waitFor();
  await page.waitForFunction(()=>document.querySelector('#characterToggle')?.getAttribute('aria-expanded')!==null);
  assert.equal(await page.locator('#settingsToggle').getAttribute('aria-expanded'),newSettings);
  assert.equal(await page.locator('#characterToggle').getAttribute('aria-expanded'),newCharacter);
  assert.deepEqual(errors,[]);
 }finally{await browser.close();await new Promise(ok=>server.close(ok));}
});
