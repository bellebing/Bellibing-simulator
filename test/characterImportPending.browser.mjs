
import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
const launch=()=>chromium.launch({headless:true,...(process.env.CHROME_BIN||process.env.BELLIBING_CHROMIUM_PATH?{executablePath:process.env.CHROME_BIN||process.env.BELLIBING_CHROMIUM_PATH}:{})});
const ids=page=>page.locator('.wb-character-card').evaluateAll(rows=>rows.map(row=>row.dataset.wbCharacterPreview));
test('real Chrome: source-only Lily/Suoming stay out of Build; Hsin is pending; AccountStore unchanged',async()=>{
 const server=await startPreview({port:0});
 const browser=await launch();
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto('http://127.0.0.1:'+server.address().port+'/build/?profile=character-import-negative-'+Date.now()+'&character=augusta');
  await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  const before=await page.evaluate(()=>Object.entries(globalThis.buildCandidateReview.snapshot().account.characters).filter(([,v])=>v.owned).map(([k])=>k).sort());
  await page.locator('[data-bc-open="character"]').first().click();
  await page.locator('.wb-character-catalog').waitFor();
  const actual=await ids(page);
  assert.equal(actual.length,59);
  assert.ok(actual.includes('hsin'));
  assert.ok(!actual.includes('lily'),'research-only Lily must not be selectable');
  assert.ok(!actual.includes('suoming'),'past calendar date alone cannot promote Suoming');
  await page.locator('#wbCharacterSearch').fill('hsin');
  await page.locator('[data-wb-character-preview="hsin"]').click();
  assert.equal(await page.locator('.wb-character-preview-identity').innerText(),'Hsin');
  assert.equal(await page.locator('[data-wb-character-build="hsin"]').isDisabled(),true);
  await page.locator('#wbCharacterSearch').fill('lily');
  assert.deepEqual(await ids(page),[]);
  await page.locator('#wbCharacterSearch').fill('suoming');
  assert.deepEqual(await ids(page),[]);
  const after=await page.evaluate(()=>Object.entries(globalThis.buildCandidateReview.snapshot().account.characters).filter(([,v])=>v.owned).map(([k])=>k).sort());
  assert.deepEqual(after,before,'source capture does not own a new Character');
  assert.deepEqual(errors,[]);
 }finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
});
