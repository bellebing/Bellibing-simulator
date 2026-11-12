import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {scan} from './fixtures/inventory.mjs';

test('WebP stages unsaved Character for Add; later imported data cannot silently replace Current Build',async()=>{
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
  assert.equal(await page.locator('#bcAccount').textContent(),'Add Character');
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
  await page.locator('#bcAccount').click();await page.waitForFunction(()=>document.querySelector('#bcStatus').textContent.includes('Character added.'));
  state=await page.evaluate(()=>buildCandidateReview.snapshot());const before=structuredClone(state.account);
  assert.equal(Object.keys(before.items).length,6);assert.equal(Object.values(before.items).find(i=>i.kind==='weapon').data.refinement,null);
  assert.equal(before.characters.ciaccona.record.build.minorForteUnknown,true);
  // A later observation must not silently replace an owned Current Build.
  // Preserve the old imported facts as a separate recovery-only local draft.
  observation.sequence=1;
  const outcome=await page.evaluate(imported=>{
   try{globalThis.bellibingProductImport.stage(imported);return 'WRONG: changed Current';}
   catch(error){return error.message;}
  },observation);
  assert.match(outcome,/preserved for recovery/);
  assert.equal(await page.locator('#bcAccount').isHidden(),true,'no Update button');
  assert.deepEqual(await page.evaluate(()=>buildCandidateReview.snapshot().account),before);
  const recovery=await page.evaluate(()=>Object.keys(localStorage).filter(key=>key.includes(':pending-owned-import:')));
  assert.ok(recovery.length,'original imported draft is archived without updating Account');
  await page.reload();await page.waitForFunction(()=>!!globalThis.bellibingProductImport);
  state=await page.evaluate(()=>buildCandidateReview.snapshot());
  assert.deepEqual(state.account,before);
  assert.equal(state.drafts.ciaccona.sequence,before.characters.ciaccona.record.build.sequenceLevel);
  assert.deepEqual(errors,[]);
 }finally{await browser.close();await new Promise(ok=>server.close(ok));}
});
