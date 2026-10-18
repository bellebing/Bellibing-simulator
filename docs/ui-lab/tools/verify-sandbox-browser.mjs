import assert from 'node:assert/strict';
import {reviewBrowserContext} from './review-browser-context.mjs';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {chromium} from 'playwright';
import coverage from '../v1.1/modules/sandbox-defaults.json' with {type:'json'};
import echoCatalog from '../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
const root=resolve(fileURLToPath(new URL('../../../',import.meta.url))),out=process.env.UI_LAB_SANDBOX_REVIEW_OUT??resolve(tmpdir(),'bellibing-sandbox-review');
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',types[extname(path)]??'application/octet-stream');res.end(await readFile(path));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.UI_LAB_CHROME_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const checks=[],errors=[];
const snapshot=page=>page.evaluate(()=>window.bellibingLabConfiguration.snapshot());
async function selectCharacter(page,id){
 await page.locator('.portrait.selected').click();await page.locator('[data-filter="all"]').click();await page.locator('#galleryArt').focus();
 const index=await page.locator('[data-art]').evaluateAll((nodes,id)=>nodes.findIndex(n=>n.dataset.art===id),id);assert.ok(index>=0);
 await page.keyboard.press('Home');for(let n=0;n<index;n++)await page.keyboard.press('ArrowRight');
 await page.waitForFunction(id=>document.querySelector('#characterCarousel').dataset.focusedCharacter===id&&document.querySelector('#characterCarousel').dataset.motion==='settled',id);
 await page.keyboard.press('Enter');await page.waitForFunction(id=>window.bellibingLabConfiguration.readContext().characterId===id,id);
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('#characterCarousel')).height==='0px');
}
async function openEditor(page,slot){await page.locator(`[data-edit-echo="${slot}"]`).focus();await page.keyboard.press('Enter');const f=page.frameLocator('.workshop-editor-host iframe');await f.locator('#echoOverlay.open').waitFor();return f;}
try{
 for(const width of (process.env.SANDBOX_REVIEW_WIDTHS??'1440,1920,2560').split(',').map(Number)){
  const context=await reviewBrowserContext(browser,{viewport:{width,height:width===1440?900:width===1920?1080:1440},reducedMotion:'reduce'});
  await context.addInitScript(()=>{if(window.top===window){localStorage.setItem('bellibing-ui-checkpoint-v34','{"sentinel":"real-account-unchanged"}');localStorage.setItem('sandbox-test-inventory','{"sentinel":"real-inventory-unchanged"}');}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/docs/ui-lab/v1.1/index.html?sandbox=true&settings=expanded`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.documentElement.dataset.uiLabReady==='true');
  assert.equal(await page.locator('.sonata-section').count(),0);assert.equal(await page.locator('[data-filter="account"]').isVisible(),false);
  let state=await snapshot(page);assert.equal(state.context.kind,'SANDBOX_BUILD');assert.equal(state.slots.filter(s=>s.configuration).length,5);assert.ok(state.slots.every(s=>s.simulatedCurrent===null));
  const initial=await page.locator('.workshop').boundingBox();
  if(await page.locator('#characterToggle').getAttribute('aria-expanded')!=='true')await page.locator('#characterToggle').click();
  assert.equal(await page.locator('.dps-contribution').count(),4);assert.ok((await page.locator('.sandbox-dps').innerText()).includes('PENDING'));
  const rects=await page.locator('.dps-contribution').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,right:r.right};}));
  assert.ok(rects.every(r=>Math.abs(r.y-rects[0].y)<1&&Math.abs(r.width-rects[0].width)<1));assert.ok(rects[3].right<=width);
  assert.deepEqual(await page.locator('[data-cost-role="simulated"]').allTextContents(),['—','—','—']);
  await page.screenshot({path:resolve(out,`sandbox-dps-${width}.png`),fullPage:true});
  // Keep the existing responsive model; expansion can deliberately compact the
  // other side panel, while the Workshop always remains usable.
  if(await page.locator('#settingsToggle').getAttribute('aria-expanded')!=='true')await page.locator('#settingsToggle').click();
  const inventory=page.getByRole('textbox',{name:'Echoes available count',exact:true});await inventory.fill('27');await inventory.press('Enter');
  await page.getByRole('button',{name:'Unlimited Echoes',exact:true}).click();assert.equal(await inventory.inputValue(),'∞');await page.getByRole('button',{name:'Unlimited Echoes',exact:true}).click();assert.equal(await inventory.inputValue(),'27');
  for(let slot=0;slot<5;slot++){
   const before=await snapshot(page),frame=await openEditor(page,slot);
   assert.equal(await frame.locator('#echoSonataAll').count(),1);
   const choice=before.slots[slot].configuration;
   assert.equal(await frame.locator('#echoPreviewName').textContent(),echoCatalog.echoes.find(e=>e.id===choice.echoId).name);
   assert.ok((await frame.getByRole('combobox',{name:'Main Stat name',exact:true}).textContent()).includes(choice.mainStatName));
   assert.equal(await frame.locator(`#echoPreviewSonataChoices [data-sonata-id="${choice.selectedSonataSetId}"]`).getAttribute('aria-pressed'),'true');
   // Use Echo commits the already configured default, including its exact Main/Sonata.
   await frame.getByRole('button',{name:'Use Echo',exact:true}).click();await page.locator('.workshop-editor-host').waitFor({state:'detached'});
   assert.deepEqual((await snapshot(page)).slots[slot].configuration,before.slots[slot].configuration);
  }
  const frame=await openEditor(page,1);await frame.getByRole('combobox',{name:'Main Stat name',exact:true}).click();await frame.getByRole('option',{name:'ATK%',exact:true}).click();
  await frame.getByRole('button',{name:'Use Echo',exact:true}).click();await page.locator('.workshop-editor-host').waitFor({state:'detached'});assert.equal((await snapshot(page)).slots[1].configuration.mainStatName,'ATK%');
  const saved=await snapshot(page);const cancel=await openEditor(page,1);await cancel.getByRole('combobox',{name:'Main Stat name',exact:true}).click();await cancel.getByRole('option',{name:'HP%',exact:true}).click();await page.keyboard.press('Escape');await page.locator('.workshop-editor-host').waitFor({state:'detached'});assert.deepEqual((await snapshot(page)).slots[1].configuration,saved.slots[1].configuration);
  await page.locator('[data-activation="1"]').click();assert.equal((await snapshot(page)).slots[1].active,false);assert.ok((await snapshot(page)).slots[1].configuration);
  if(await page.locator('#characterToggle').getAttribute('aria-expanded')!=='true')await page.locator('#characterToggle').click();
  await page.getByRole('combobox',{name:'Sandbox Weapon',exact:true}).selectOption('verdant-summit');assert.equal((await snapshot(page)).context.build.weaponId,'verdant-summit');
  const beforeGallery=await page.locator('.workshop').boundingBox();await page.locator('.portrait.selected').click();const expanded=await page.locator('.workshop').boundingBox();for(const key of ['x','width','height'])assert.equal(expanded[key],beforeGallery[key]);await page.keyboard.press('Escape');
  for(const id of width===1440?coverage.characters.map(c=>c.characterId):['hsin','iuno','cartethyia','jingran']){
   await selectCharacter(page,id);const actual=await snapshot(page),expected=coverage.characters.find(c=>c.characterId===id);assert.equal(actual.characterId,id);assert.equal(actual.slots.filter(s=>s.configuration).length,5);
   if(id!=='augusta')assert.deepEqual(actual.slots.map(s=>s.configuration.echoId),expected.slots.map(s=>s.configuration.echoId));
   assert.equal(actual.resourceInventory.echoes.count,27);assert.ok(actual.slots.every(s=>s.simulatedCurrent===null));
  }
  await selectCharacter(page,'augusta');state=await snapshot(page);assert.equal(state.context.build.weaponId,'verdant-summit');assert.equal(state.slots[1].configuration.mainStatName,'ATK%');assert.equal(state.slots[1].active,false);
  await page.locator('#reset').click();const reset=await snapshot(page);assert.deepEqual(reset.slots.map(s=>s.configuration),state.slots.map(s=>s.configuration));assert.equal(reset.resourceInventory.echoes.count,27);assert.ok(reset.revisions.session>state.revisions.session);
  await page.getByRole('button',{name:'Current',exact:true}).click();assert.ok((await snapshot(page)).slots.every(s=>s.simulatedCurrent===null));await page.getByRole('button',{name:'Simulate',exact:true}).click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('bellibing-ui-checkpoint-v34')),'{"sentinel":"real-account-unchanged"}');
  assert.equal(await page.evaluate(()=>localStorage.getItem('sandbox-test-inventory')),'{"sentinel":"real-inventory-unchanged"}');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  checks.push({width,allReleasedSelected:width===1440?59:4,defaultPrefill:5,manualMainCancelActivationWeaponResetResources:true,dpsEqualColumns:true,accountUnchanged:true,initialWorkshopWidth:initial.width});await context.close();
 }
 assert.deepEqual(errors,[]);console.log('Sandbox Chromium PASS',JSON.stringify(checks));
}finally{await writeFile(resolve(out,'verification.json'),JSON.stringify({checks,errors},null,2));await browser.close();await new Promise(r=>server.close(r));}

// Focused host-availability UI check is also runnable independently.
await import('./verify-sandbox-host-browser.mjs');

// Small export-race Chromium regression is also runnable independently.
await import('./verify-sandbox-export-browser.mjs');

await import('./verify-character-context-browser.mjs');

await import('./verify-observed-echo-browser.mjs');
