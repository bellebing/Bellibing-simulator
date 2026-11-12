// Real built-product Chromium flow; isolated synthetic canonical inventory only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan,saveOwnedTeam} from '../src/inventoryAccount.mjs';

test('product Inventory JSON export, empty restore, rejected imports and guarded replacement in Chromium',async()=>{
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:900}});
 const page=await context.newPage(),restored=await context.newPage(),errors=[];
 for(const p of [page,restored])p.on('pageerror',error=>errors.push(error.stack));
 try{
  let seeded=emptyAccount();
  for(const id of ['augusta','iuno','the-shorekeeper'])seeded=saveReviewedScan(seeded,scan(id),catalog,{reviewed:true,assign:true});
  seeded=saveOwnedTeam(seeded,{name:'Owned trio',characterIds:['augusta','iuno','the-shorekeeper']},catalog);
  seeded.userData.workspaceSettings={augusta:{gate:'+10'}};
  seeded.userData.storage['bellibing.improve.policy.v3']='{"version":3,"resourceInventory":{"tuners":{"kind":"FINITE","count":456}}}';
  await page.goto(base+'/inventory/?profile=portable-account-donor');
  await page.locator('[data-iv-kind="character"]').waitFor();
  await page.evaluate(async data=>{await bellibingAccountSession.store.commit(data);},seeded);
  await page.reload();await page.locator('[data-iv-kind="character"]').click();
  assert.equal(await page.locator('.iv-card').count(),3);
  for(const category of ['character','weapon','echo']){
   await page.locator('[data-iv-kind="'+category+'"]').click();
   assert.equal(await page.locator('[data-backup]').isVisible(),true,category);
   assert.equal(await page.locator('[data-import-account]').isVisible(),true,category);
  }
  const before=await page.evaluate(()=>bellibingAccountSession.store.snapshot());
  const download=page.waitForEvent('download');
  await page.locator('[data-backup]').click();
  const file=await download,backup=JSON.parse(await readFile(await file.path(),'utf8'));
  assert.deepEqual(backup.account,before);
  await restored.goto(base+'/inventory/?profile=portable-account-empty');
  await restored.locator('[data-iv-kind="character"]').waitFor();
  await restored.locator('[data-restore]').setInputFiles({name:'saved-account.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  assert.match(await restored.locator('[data-restore-summary]').innerText(),/3 owned Characters, 3 Weapons, 15 Echoes/);
  assert.equal(await restored.locator('[data-confirm-restore]').isDisabled(),true);
  await restored.locator('[data-approve-restore]').check();
  const firstReload=restored.waitForEvent('load');
  await restored.locator('[data-confirm-restore]').click();
  await firstReload;
  await restored.waitForFunction(id=>globalThis.bellibingAccountSession?.store.snapshot()?.id===id,backup.account.id);
  assert.deepEqual(await restored.evaluate(()=>bellibingAccountSession.store.snapshot()),backup.account);
  await restored.locator('[data-iv-kind="weapon"]').click();assert.equal(await restored.locator('.iv-card').count(),3);
  await restored.locator('[data-iv-kind="echo"]').click();assert.equal(await restored.locator('.iv-card').count(),15);
  for(const bad of ['{broken',JSON.stringify({...backup,schemaVersion:999})]){
   await restored.locator('[data-restore]').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(bad)});
   await restored.waitForFunction(()=>document.querySelector('[data-account-status]')?.textContent.includes('Import rejected'));
   assert.deepEqual(await restored.evaluate(()=>bellibingAccountSession.store.snapshot()),backup.account);
  }
  // Replacement is blocked until the old account was downloaded and approved.
  await restored.locator('[data-restore]').setInputFiles({name:'saved-account.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await restored.locator('[data-approve-restore]').check();
  assert.equal(await restored.locator('[data-confirm-restore]').isDisabled(),true);
  const safetyDownload=restored.waitForEvent('download');
  await restored.locator('[data-backup-before-restore]').click();
  const safetyFile=await safetyDownload;
  assert.deepEqual(JSON.parse(await readFile(await safetyFile.path(),'utf8')).account,backup.account);
  assert.equal(await restored.locator('[data-confirm-restore]').isEnabled(),true);
  const secondReload=restored.waitForEvent('load');
  await restored.locator('[data-confirm-restore]').click();
  await secondReload;
  await restored.waitForFunction(revision=>globalThis.bellibingAccountSession?.store.snapshot()?.revision>revision,backup.account.revision);
  const replaced=await restored.evaluate(()=>bellibingAccountSession.store.snapshot());
  assert.deepEqual(replaced.items,before.items);
  assert.deepEqual(replaced.characters,before.characters);
  const recoveries=await restored.evaluate(()=>bellibingAccountSession.store.recovery());
  assert.deepEqual(recoveries.find(row=>row.reason==='EXPLICIT_JSON_RESTORE'&&row.previous)?.previous,backup.account);
  assert.deepEqual(errors,[]);
 }finally{
  await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
 }
});


test('retained legacy Inventory tools restore the same complete JSON and reject unsafe versions in Chromium',async()=>{
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({acceptDownloads:true}),donor=await context.newPage(),receiver=await context.newPage(),errors=[];
 for(const page of [donor,receiver])page.on('pageerror',error=>errors.push(error.stack));
 try{
  let account=emptyAccount();
  for(const id of ['augusta','iuno','the-shorekeeper'])account=saveReviewedScan(account,scan(id),catalog,{reviewed:true,assign:true});
  account=saveOwnedTeam(account,{name:'Saved owned trio',characterIds:['augusta','iuno','the-shorekeeper']},catalog);
  await donor.goto(base+'/inventory/legacy.html?profile=portable-legacy-donor');
  await donor.locator('[data-backup]').waitFor();
  await donor.evaluate(async input=>{await bellibingAccountSession.store.commit(input);},account);
  const dl=donor.waitForEvent('download');await donor.locator('[data-backup]').click();
  const file=await dl,backup=JSON.parse(await readFile(await file.path(),'utf8'));
  await receiver.goto(base+'/inventory/legacy.html?profile=portable-legacy-target');
  await receiver.locator('[data-import-account]').click();
  await receiver.locator('[data-restore]').setInputFiles({name:'portable.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  assert.match(await receiver.locator('[data-restore-summary]').innerText(),/3 owned Characters, 3 Weapons and 15 Echoes/);
  assert.equal(await receiver.locator('[data-confirm-restore]').isDisabled(),true);
  await receiver.locator('[data-approve-restore]').check();
  await receiver.locator('[data-confirm-restore]').click();
  await receiver.waitForFunction(id=>bellibingAccountSession?.store.snapshot()?.id===id,backup.account.id);
  assert.deepEqual(await receiver.evaluate(()=>bellibingAccountSession.store.snapshot()),backup.account);
  for(const malformed of ['{broken',JSON.stringify({...backup,schemaVersion:999})]){
   await receiver.locator('[data-restore]').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from(malformed)});
   await receiver.waitForFunction(()=>document.querySelector('[data-owned-message]')?.textContent.includes('Import rejected'));
   assert.deepEqual(await receiver.evaluate(()=>bellibingAccountSession.store.snapshot()),backup.account);
  }
  assert.deepEqual(errors,[]);
 }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
});
