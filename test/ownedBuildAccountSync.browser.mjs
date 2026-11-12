// Real Chromium acceptance of the single Current Character Build.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {catalog} from './fixtures/inventory.mjs';

test('Build auto-saves Sequence/Echo Main/Substats; Improve Current and JSON agree; stale writes fail',async()=>{
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||process.env.BELLIBING_CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:900}});
 const page=await context.newPage(),inventory=await context.newPage(),improve=await context.newPage(),restore=await context.newPage(),other=await context.newPage(),errors=[];
 for(const p of [page,inventory,improve,restore,other]){p.setDefaultTimeout(18000);p.on('pageerror',e=>errors.push(e.message));}
 const profile='single-current-augusta';
 const current=()=>page.evaluate(()=>bellibingAccountSession.store.snapshot());
 const chooseMain=async name=>{
  await page.locator('.wc-echo-preview .wb-feature-stat summary').click();
  await page.locator('[data-bc-main="'+name+'"]').first().click();
 };
 try{
  const species=catalog.echoes.find(e=>e.name==='The False Sovereign');assert.ok(species);
  await page.goto(base+'/build/?profile='+profile+'&character=augusta');
  await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  assert.equal(await page.locator('#bcAccount').innerText(),'Add Character');
  assert.equal(await page.locator('#bcPreviewMode').count(),0,'Build has no global Preview mode');
  assert.equal((await current())?.characters?.augusta,undefined,'not owned before explicit Add Character');
  await page.locator('#bcAccount').click();
  await page.waitForFunction(()=>document.querySelector('#bcStatus')?.textContent.includes('Character added.'));
  assert.equal(await page.locator('#bcAccount').isHidden(),true,'no Update/Save Build button for owned Character');
  const added=await current();assert.equal(added.characters.augusta.record.build.sequenceLevel,0);

  // Test A: S1 auto-commits and survives reopening Build.
  await page.locator('[data-bc-sequence="1"]').first().click();
  await page.locator('[data-wc-sequence-commit="1"]').click();
  await page.waitForFunction(rev=>bellibingAccountSession.store.snapshot()?.revision>rev,added.revision);
  const sequenceSaved=await current();assert.equal(sequenceSaved.characters.augusta.record.build.sequenceLevel,1);
  await page.reload();await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  assert.equal(await page.evaluate(()=>buildCandidateReview.snapshot().drafts.augusta.sequence),1);
  assert.equal(await page.locator('#bcAccount').isHidden(),true);

  // Test B: new Echo equips, then correcting the same species preserves ID.
  await page.locator('[data-bc-echo="0"]').click();
  await page.locator('[data-bc-species="'+species.id+'"]').first().click();
  await chooseMain('HP%');
  assert.equal(await page.locator('#bcEditorError').textContent(),'');
  await page.locator('[data-bc-equip="echo"]').click();
  await page.waitForFunction(()=>document.querySelector('#bcSaved')?.textContent==='Saved to Inventory');
  const withEcho=await current(),id=withEcho.characters.augusta.record.build.echoSets.sets['set-1'].slots[0];
  assert.ok(id);assert.equal(withEcho.items[id].data.mainStat.name,'HP%');
  await inventory.goto(base+'/inventory/?profile='+profile);
  await inventory.locator('[data-iv-kind="echo"]').click();
  assert.equal(await inventory.locator('.iv-card').count(),1);

  await chooseMain('CRIT DMG');
  await page.locator('[data-wb-roll="0"]').click();
  await page.locator('[data-bc-roll-name="0"][data-value="Flat HP"]').click();
  assert.equal(await page.locator('[data-bc-equip="echo"]').isDisabled(),true,'partial Echo edit cannot save');
  assert.deepEqual(await current(),withEcho,'unfinished substat never reaches AccountStore');
  await page.locator('[data-bc-roll-value="0"]').first().click();
  assert.equal(await page.locator('#bcEditorError').textContent(),'');
  await page.locator('[data-bc-equip="echo"]').click();
  await page.waitForFunction(rev=>bellibingAccountSession.store.snapshot().revision>rev,withEcho.revision);
  const corrected=await current();
  assert.equal(corrected.characters.augusta.record.build.echoSets.sets['set-1'].slots[0],id,'same physical Echo ID');
  assert.equal(corrected.items[id].data.mainStat.name,'CRIT DMG');
  assert.equal(corrected.items[id].data.substats[0].name,'Flat HP');
  assert.equal(Object.values(corrected.items).filter(e=>e.kind==='echo').length,1);
  await inventory.waitForFunction(id=>bellibingAccountSession.store.snapshot()?.items[id]?.data.mainStat.name==='CRIT DMG',id);
  await page.reload();await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  const reopened=await page.evaluate(()=>buildCandidateReview.snapshot().drafts.augusta);
  assert.equal(reopened.echoes[0].instanceId,id);
  assert.deepEqual(reopened.echoes[0].substats,corrected.items[id].data.substats);
  assert.equal(reopened.sequence,1);

  // Test C: Improve Current reads the exact saved Build. Changing an Improve
  // Candidate template cannot alter CharacterBuildState or the equipped ID.
  await improve.goto(base+'/improve/?profile='+profile+'&character=augusta');
  await improve.waitForFunction(()=>globalThis.bellibingLabConfiguration?.productionEvidence?.().status==='OBSERVED_PRODUCTION_BUILD_RECORD');
  const beforeCandidate=await improve.evaluate(()=>bellibingLabConfiguration.productionEvidence().buildState);
  assert.equal(beforeCandidate.sequenceLevel,1);
  assert.equal(beforeCandidate.echoSets.sets[beforeCandidate.echoSets.activeSetId].slots[0].mainStat.name,'CRIT DMG');
  assert.equal(beforeCandidate.echoSets.sets[beforeCandidate.echoSets.activeSetId].slots[0].substats[0].name,'Flat HP');
  await improve.locator('[data-change-echo]').first().click();
  await improve.locator('[data-picker-echo="'+species.id+'"]').first().click();
  await improve.locator('[data-picker-main-menu] summary').click();
  await improve.locator('[data-picker-main="HP%"]').first().click();
  await improve.locator('[data-picker-use]').click();
  assert.deepEqual(await improve.evaluate(()=>bellibingLabConfiguration.productionEvidence().buildState),beforeCandidate);
  assert.deepEqual(await current(),corrected,'Improve Candidate must not touch Current AccountStore');

  // Test D: portable Account JSON roundtrips to a separate empty profile.
  const download=inventory.waitForEvent('download');
  await inventory.locator('[data-backup]').click();
  const file=await download,backup=JSON.parse(await readFile(await file.path(),'utf8'));
  assert.deepEqual(backup.account,corrected);
  await restore.goto(base+'/inventory/?profile=single-current-restored');
  await restore.locator('[data-iv-kind="character"]').waitFor();
  await restore.locator('[data-restore]').setInputFiles({name:'current.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await restore.locator('[data-approve-restore]').check();
  const loaded=restore.waitForEvent('load');
  await restore.locator('[data-confirm-restore]').click();await loaded;
  await restore.waitForFunction(id=>globalThis.bellibingAccountSession?.store.snapshot()?.id===id,corrected.id);
  assert.deepEqual(await restore.evaluate(()=>bellibingAccountSession.store.snapshot()),corrected);

  // A second tab changing account revision must block the first tab's save.
  await other.goto(base+'/build/?profile='+profile+'&character=augusta');
  await other.waitForFunction(()=>!!globalThis.buildCandidateReview);
  await other.evaluate(()=>bellibingAccountSession.store.saveUserData('bellibing.improve.policy.v3','{"version":3}'));
  await page.locator('[data-bc-sequence="2"]').first().click();
  await page.locator('[data-wc-sequence-commit="2"]').click();
  await page.waitForFunction(()=>document.querySelector('#bcSaved')?.textContent.includes('NOT SAVED'));
  assert.match(await page.locator('#bcStatus').innerText(),/Account changed|another tab|Reload/);
  const accountAfterConflict=await other.evaluate(()=>bellibingAccountSession.store.snapshot());
  assert.equal(accountAfterConflict.characters.augusta.record.build.sequenceLevel,1);
  assert.equal(accountAfterConflict.items[id].data.mainStat.name,'CRIT DMG');
  assert.deepEqual(errors,[]);
 }finally{
  await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
 }
});

test('retired global Preview/local drafts survive as recovery, but owned Build loads only AccountStore Current',async()=>{
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||process.env.BELLIBING_CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext(),page=await context.newPage();page.setDefaultTimeout(18000);
 try{
  const profile='old-preview-recovery',key='bellibing.product.build-drafts.v1:'+profile;
  await page.goto(base+'/build/?profile='+profile+'&character=augusta');
  await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  await page.locator('#bcAccount').click();
  await page.waitForFunction(()=>document.querySelector('#bcStatus')?.textContent.includes('Character added.'));
  const before=await page.evaluate(()=>bellibingAccountSession.store.snapshot());
  assert.equal(before.characters.augusta.record.build.sequenceLevel,0);
  const oldBytes=await page.evaluate(key=>{
   const old=JSON.parse(localStorage.getItem(key));
   old.drafts.augusta.sequence=6;old.previewCharacters={augusta:true};
   const bytes=JSON.stringify(old);localStorage.setItem(key,bytes);
   return bytes;
  },key);
  await page.reload();await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  assert.equal(await page.evaluate(()=>buildCandidateReview.snapshot().drafts.augusta.sequence),0,'old unsaved Preview cannot become Current');
  assert.deepEqual(await page.evaluate(()=>bellibingAccountSession.store.snapshot()),before,'no silent migration or account write');
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),oldBytes,'raw old draft remains intact until first new action');
  assert.equal(await page.locator('#bcPreviewMode').count(),0);
  await page.locator('[data-bc-sequence="1"]').first().click();
  await page.locator('[data-wc-sequence-commit="1"]').click();
  await page.waitForFunction(rev=>bellibingAccountSession.store.snapshot().revision>rev,before.revision);
  const archived=await page.evaluate(key=>{
   const keys=Object.keys(localStorage).filter(k=>k.startsWith(key+':before-single-current-build:'));
   return {keys,bytes:keys.map(k=>localStorage.getItem(k))};
  },key);
  assert.equal(archived.keys.length,1);
  assert.equal(archived.bytes[0],oldBytes,'legacy unsaved draft and Preview intent remain recoverable byte-for-byte');
  await page.reload();await page.waitForFunction(()=>!!globalThis.buildCandidateReview);
  assert.equal(await page.evaluate(()=>buildCandidateReview.snapshot().drafts.augusta.sequence),1);
 }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
});
