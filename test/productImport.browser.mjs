import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {scan} from './fixtures/inventory.mjs';

test('WebP enters normal Build as unsaved OCR draft; Add/Update preserves prior equipment and unknown facts',async()=>{
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.BELLIBING_CHROMIUM_PATH?{executablePath:process.env.BELLIBING_CHROMIUM_PATH}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/build/?profile=ocr-build');await page.waitForFunction(()=>!!globalThis.bellibingProductImport);
  await page.waitForSelector('[data-product-import][aria-controls]');
  const observation={kind:'bellibing-scanner-review',schemaVersion:1,...scan('ciaccona')};
  await page.evaluate(draft=>{
   globalThis.scannerInputs=[];
   globalThis.bellibingScannerPromise=Promise.resolve({scan:async file=>{const image=await createImageBitmap(file);scannerInputs.push({type:file.type,width:image.width,height:image.height});image.close();return {draft,elapsedMs:1};},validate:async()=>({issues:[]})});
  },observation);
  async function upload(type){
   await page.locator('[data-product-import]').click();
   await page.evaluate(async type=>{
    const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;
    const blob=await new Promise(ok=>canvas.toBlob(ok,type));const transfer=new DataTransfer();transfer.items.add(new File([blob],'card.'+type.split('/')[1],{type}));
    const input=document.querySelector('[data-card-upload]');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
   },type);
   await page.waitForFunction(()=>document.querySelector('#bcStatus').textContent.startsWith('Imported draft.'));
  }
  await upload('image/webp');
  assert.equal(await page.locator('#bcName').textContent(),'Ciaccona');
  assert.equal(await page.locator('#bcAccount').textContent(),'Add to Account');
  assert.equal(await page.locator('#character-import-review').isVisible(),false);
  assert.equal(await page.locator('[data-reviewed]').count(),0);
  assert.deepEqual(await page.evaluate(()=>scannerInputs),[{type:'image/png',width:1920,height:1080}]);
  let state=await page.evaluate(()=>buildCandidateReview.snapshot());
  assert.deepEqual(Object.keys(state.account.characters),[]);
  assert.equal(state.drafts.ciaccona.weaponRank,null);assert.equal(state.drafts.ciaccona.echoes[0].level,null);
  await page.reload();await page.waitForFunction(()=>!!globalThis.bellibingProductImport);
  assert.equal(await page.locator('#bcName').textContent(),'Ciaccona');
  await page.evaluate(()=>{globalThis.bellibingScannerPromise=Promise.resolve({validate:async()=>({issues:[{path:'echoes.0',message:'Review source conflict'}]})});});
  await page.locator('#bcAccount').click();await page.waitForFunction(()=>document.querySelector('#bcStatus').textContent.includes('Review source conflict'));
  assert.deepEqual(await page.evaluate(()=>Object.keys(buildCandidateReview.snapshot().account.characters)),[]);
  await page.evaluate(()=>{globalThis.bellibingScannerPromise=Promise.resolve({validate:async()=>({issues:[]})});});
  await page.locator('#bcAccount').click();await page.waitForFunction(()=>document.querySelector('#bcStatus').textContent==='Saved to account.');
  state=await page.evaluate(()=>buildCandidateReview.snapshot());const before=structuredClone(state.account);
  assert.equal(Object.keys(before.items).length,6);assert.equal(Object.values(before.items).find(i=>i.kind==='weapon').data.refinement,null);
  assert.equal(before.characters.ciaccona.record.build.minorForteUnknown,true);
  // A second observation stages replacement, retaining the account until Update.
  observation.sequence=1;
  await page.evaluate(draft=>{globalThis.bellibingScannerPromise=Promise.resolve({scan:async()=>({draft,elapsedMs:1}),validate:async()=>({issues:[]})});document.querySelector('#bcStatus').textContent='';},observation);
  await upload('image/jpeg');assert.equal(await page.locator('#bcAccount').textContent(),'Update');
  assert.deepEqual(await page.evaluate(()=>buildCandidateReview.snapshot().account),before);
  // Correct a substat using the actual Build workshop, with unknown Echo level.
  await page.evaluate(()=>buildCandidateReview.openEcho(0));
  await page.locator('[data-wb-roll="0"]').click();
  await page.locator('[data-bc-roll-value="0"]').first().click();
  await page.locator('[data-bc-equip="echo"]').click();
  await page.locator('#bcAccount').click();await page.waitForFunction(()=>document.querySelector('#bcStatus').textContent==='Saved to account.');
  state=await page.evaluate(()=>buildCandidateReview.snapshot());assert.equal(Object.keys(state.account.items).length,12);
  for(const [id,item]of Object.entries(before.items))assert.deepEqual(state.account.items[id],item);
  assert.equal(state.account.characters.ciaccona.record.build.sequenceLevel,1);
  assert.deepEqual(errors,[]);
 }finally{await browser.close();await new Promise(ok=>server.close(ok));}
});
