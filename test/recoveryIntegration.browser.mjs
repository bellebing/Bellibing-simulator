// Isolated canonical test account; no owner images or private runtime results.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {catalog,scan} from './fixtures/inventory.mjs';
import {accountFromLegacy,saveReviewedScan} from '../src/inventoryAccount.mjs';
import {uxAccountFixture} from './helpers/uxAccountFixture.mjs';

test('recovery routes preserve physical ownership, observations, saved teams and portable restore',async()=>{
 const server=await startPreview({port:0}),base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.stack));const out='artifacts/recovery-review';await mkdir(out,{recursive:true});
 let account=accountFromLegacy(uxAccountFixture().account,catalog);
 for(const id of ['iuno','the-shorekeeper']){const value=scan(id);for(const echo of value.echoes){echo.rank=5;echo.level=25;}account=saveReviewedScan(account,value,catalog,{reviewed:true,assign:true});}
 // Exercise retained advanced tools here; productIntegration.browser.mjs covers the new default routes.
 const goto=route=>page.goto(base+'/'+route+(['build','inventory','teams'].includes(route)?'/legacy.html':'/')+'?profile=recovery-browser&character=augusta');
 const snapshot=()=>page.evaluate(()=>bellibingAccountSession.store.snapshot());
 try{
  await goto('inventory');await page.waitForFunction(()=>globalThis.bellibingAccountSession);
  await page.evaluate(account=>bellibingAccountSession.store.commit(account),account);
  await goto('teams');await page.locator('[data-new-team]').click();
  for(const [index,id] of ['augusta','iuno','the-shorekeeper'].entries()){
   await page.locator(`[data-choose-member="${index}"]`).click();await page.locator(`[data-choice="${id}"]`).click();
  }
  await page.locator('[data-team-name]').fill('Saved owned trio');await page.locator('[data-save-team]').click();
  await page.waitForFunction(()=>bellibingAccountSession.store.snapshot()?.userData.teams?.length===1);
  const team=(await snapshot()).userData.teams[0];await page.reload();await page.locator('[data-edit-team]').waitFor();
  assert.equal((await snapshot()).userData.teams[0].id,team.id);assert.equal(await page.locator('.team-members .team-member').count(),3);
  const beforeBuild=await snapshot();await goto('build');const frame=page.frameLocator('iframe');
  // Legacy saved Build can open without a v34 picker selection. Use the
  // actual visible Character card first: do not force hidden Sequence controls
  // or mutate the account to satisfy this test.
  // Legacy v34 auto-selects Augusta after loading its Character source. Wait
  // for the settled iframe, not a carousel node hidden during navigation.
  await frame.locator('#buildShell.has-selection').waitFor({state:'visible'});
  assert.equal((await frame.locator('#buildName').textContent()).trim(),'Augusta');
  await frame.locator('.build-sequence-trigger').click();await frame.locator('[data-sequence="1"]').click();await frame.locator('#sequenceAction').click();
  await frame.getByRole('button',{name:'Close Sequences',exact:true}).click();await frame.locator('#saveOwnedBuild').click();
  await page.waitForFunction(()=>bellibingAccountSession.store.snapshot()?.characters.augusta.record.build.sequenceLevel===1);
  assert.deepEqual((await snapshot()).items,beforeBuild.items);
  await goto('improve');await page.locator('#settingsToggle').click();
  for(const resource of ['echoes','tuners','premium','advanced','medium','basic']){
   const input=page.locator(`[data-resource="${resource}"] input`);await input.fill(resource==='premium'?'10':['echoes','tuners'].includes(resource)?'100':'0');await input.press('Enter');
  }
  await page.locator('#settingsToggle').click();
  // Account Improve no longer exposes the synthetic Simulate button. Enter a
  // genuine +5 checkpoint through the same visible inline Echo roll editor the
  // user operates; only a complete observed stat + value commits a record.
  await page.locator('#newCard [data-wb-roll="0"]').click();
  await page.locator('#newCard [data-bc-roll-name="0"][data-value="CRIT Rate"]').click();
  const beforeRoll=await snapshot();
  await page.locator('#newCard [data-bc-roll-value="0"][data-value="0.063"]').click();
  await page.waitForFunction(()=>bellibingAccountSession.store.snapshot()?.userData.observations?.augusta?.slots?.some(s=>s.session.candidate.level===5));
  const afterRoll=await snapshot();assert.deepEqual(afterRoll.items,beforeRoll.items);assert.deepEqual(afterRoll.userData.storage,beforeRoll.userData.storage);
  await page.reload();await page.waitForFunction(()=>document.querySelector('#newCard')?.textContent.includes('6.3%'));
  await page.waitForFunction(()=>!document.querySelector('.advice-verdict')?.textContent.includes('ENTER_ACTUAL_TEAM_INVESTMENTS'));
  assert.equal(await page.locator('.workshop>.improve-opportunities').count(),0);assert.equal(await page.locator('#slots .echo-card').count(),5);
  const beforeSandbox=await snapshot();await goto('sandbox');await page.locator('#settingsToggle').waitFor();
  assert.equal(await page.evaluate(()=>!!globalThis.bellibingAccountSession),false);
  await goto('inventory');await page.waitForFunction(()=>globalThis.bellibingAccountSession);assert.deepEqual(await snapshot(),beforeSandbox);
  await page.locator('[data-inventory-kind="weapon"]').click();assert.equal(await page.locator('[data-item-id]').count(),3);
  await page.locator('[data-inventory-kind="echo"]').click();assert.equal(await page.locator('[data-item-id]').count(),15);
  const original=await snapshot(),donor=original.characters.augusta.record.build.echoSets.sets.owned.slots[0];
  await page.locator(`[data-item-id="${donor}"]`).click();await page.locator('[data-equip-character]').selectOption('iuno');await page.locator('[data-equip-slot]').selectOption('0');await page.locator('[data-equip]').click();
  await page.waitForFunction(donor=>bellibingAccountSession.store.snapshot().characters.iuno.record.build.echoSets.sets['set-1'].slots[0]===donor,donor);
  assert.equal(Object.keys((await snapshot()).items).length,18);
  const download=page.waitForEvent('download');await page.locator('[data-backup]').click();const file=await download,backup=JSON.parse(await readFile(await file.path(),'utf8'));
  const restored=await context.newPage();await restored.goto(base+'/inventory/legacy.html?profile=recovery-empty-restore');await restored.locator('[data-restore]').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await restored.locator('[data-approve-restore]').check();await restored.locator('[data-confirm-restore]').click();
  await restored.waitForFunction(()=>Object.keys(bellibingAccountSession.store.snapshot()?.items??{}).length===18);
  const secondDownload=restored.waitForEvent('download');await restored.locator('[data-backup]').click();const secondFile=await secondDownload,reexport=JSON.parse(await readFile(await secondFile.path(),'utf8'));
  assert.deepEqual(reexport.account,backup.account,'empty-profile browser restore must preserve all canonical account fields');
   const beforeInvalid=await restored.evaluate(()=>bellibingAccountSession.store.snapshot());
   await restored.locator('[data-restore]').setInputFiles({name:'corrupt.json',mimeType:'application/json',buffer:Buffer.from('{oops')});
   await restored.waitForFunction(()=>document.querySelector('[data-owned-message]')?.textContent.includes('Import rejected'));
   assert.deepEqual(await restored.evaluate(()=>bellibingAccountSession.store.snapshot()),beforeInvalid);
   await restored.locator('[data-restore]').setInputFiles({name:'future.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...backup,schemaVersion:999}))});
   await restored.waitForFunction(()=>document.querySelector('[data-owned-message]')?.textContent.includes('Import rejected'));
   assert.deepEqual(await restored.evaluate(()=>bellibingAccountSession.store.snapshot()),beforeInvalid);
   await restored.close();
  // Restore both original assignments explicitly before visual review.
  const equip=async(itemId,id)=>{await page.locator(`[data-item-id="${itemId}"]`).click();await page.locator('[data-equip-character]').selectOption(id);await page.locator('[data-equip-slot]').selectOption('0');await page.locator('[data-equip]').click();};
  await equip(donor,'augusta');await equip(original.characters.iuno.record.build.echoSets.sets['set-1'].slots[0],'iuno');
  assert.deepEqual((await snapshot()).items,original.items);
  for(const size of [{width:1440,height:900},{width:1920,height:1080}]){
   await page.setViewportSize(size);
   for(const route of ['build','improve','sandbox','teams','inventory']){
    await goto(route);await page.waitForTimeout(1200);await page.screenshot({path:`${out}/${route}-${size.width}.png`,fullPage:true});
    if(route==='build'){await page.locator('[data-open-import]').click();await page.screenshot({path:`${out}/import-${size.width}.png`});await page.keyboard.press('Escape');}
   }
  }
  assert.deepEqual(errors,[]);await writeFile(out+'/runtime.json',JSON.stringify({pageErrors:errors.length,physicalItems:18,savedTeams:1,restoreReexport:true,observedRollReload:true,sandboxIndependent:true,fixture:'Canonical isolated test owners; no user data or synthetic DPS',build:JSON.parse(await readFile('dist/review-build.json','utf8'))},null,2));
 }catch(error){await page.screenshot({path:out+'/failure.png',fullPage:true});await writeFile(out+'/failure.json',JSON.stringify({text:await page.locator('body').innerText(),errors,account:await page.evaluate(()=>globalThis.bellibingAccountSession?.store.snapshot())},null,2));throw error;
 }finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
});
