// Real UI and local private services; isolated synthetic account only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {localProductEngine} from '../scripts/local-product-engine.mjs';
import {accountFromLegacy} from '../src/inventoryAccount.mjs';
import {catalog} from './fixtures/inventory.mjs';
import {uxAccountFixture} from './helpers/uxAccountFixture.mjs';
import {createSandboxState} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {captureWorkspaceSettings} from '../docs/ui-lab/v1.1/modules/account-settings.js';

test('stat-only Improve keeps real DPS comparison independent until explicit Equip', {skip:!process.env.BELLIBING_LOCAL_ENGINE,timeout:60000},async()=>{
 const engine=await localProductEngine(process.env.BELLIBING_LOCAL_ENGINE);
 let searchCalls=0,adviceCalls=0,dpsCalls=0;
 const server=await startPreview({port:0,reviewHandler:(req,res,context)=>{
  if(req.url.startsWith('/local-review/improve-search'))searchCalls++;
  if(req.url.startsWith('/local-review/echo-advisor')&&req.method==='POST')adviceCalls++;
  if(req.url.startsWith('/local-review/team-dps')&&req.method==='POST')dpsCalls++;
  return engine.handle(req,res,context);
 }});
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.BELLIBING_CHROMIUM_PATH?{executablePath:process.env.BELLIBING_CHROMIUM_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:'+server.address().port,fixture=uxAccountFixture();
  Object.assign(fixture.account.drafts.Augusta.build,{characterLevel:90,weaponLevel:90,weaponRefinement:1});
  const account=accountFromLegacy(fixture.account,catalog),state=createSandboxState('augusta');
  state.improvePlan={preset:'RECOMMENDED',advancedOpen:true,dpsEnabled:false,minimumDpsPercent:95};
  account.userData.workspaceSettings={augusta:captureWorkspaceSettings(state)};
  const unlimited={kind:'UNLIMITED'};
  account.userData.storage['bellibing.improve.policy.v3']=JSON.stringify({version:3,characters:{},pendingV2Characters:{},resourceInventory:{version:1,echoes:unlimited,tuners:unlimited,tubes:{premium:unlimited,advanced:{kind:'FINITE',count:0},medium:{kind:'FINITE',count:0},basic:{kind:'FINITE',count:0}}}});
  await page.goto(base+'/inventory/?profile=stage-one');
  await page.waitForFunction(()=>!!globalThis.bellibingAccountSession);
  await page.evaluate(a=>bellibingAccountSession.store.commit(a),account);
  await page.goto(base+'/improve/?profile=stage-one&character=augusta');
  await page.waitForSelector('.improve-dps-enable input',{state:'attached'});
  assert.equal(await page.locator('.improve-dps-enable input').isChecked(),false);
  await page.locator('[data-preset=BUDGET]').evaluate(el=>el.click());
  assert.equal(await page.locator('.improve-dps-enable input').isChecked(),false,'a preset must not silently switch optimisation on');
  await page.waitForFunction(()=>/\d/.test(document.querySelector('[data-dps-row=current] .team-total')?.textContent??''));
  const before=await page.evaluate(()=>JSON.stringify(bellibingAccountSession.store.snapshot().characters));
  for(const [index,name]of ['CRIT Rate','CRIT DMG','ATK%','Heavy Attack DMG','Energy Regen'].entries()){
   await page.locator('#newCard [data-wb-roll="'+index+'"]').click();
   await page.locator('#newCard [data-bc-roll-name="'+index+'"][data-value="'+name+'"]').click();
   await page.locator('#newCard [data-bc-roll-value="'+index+'"]').last().click();
   await page.waitForFunction(()=>!document.querySelector('#feedbackTitle')?.textContent.includes('Updating'));
   if(index===0){
    await page.waitForSelector('[data-dps-winner=current]');
    await page.waitForFunction(()=>[...document.querySelectorAll('#resourceCost [data-cost-role=expected]')].length===3&&[...document.querySelectorAll('#resourceCost [data-cost-role=expected]')].every(el=>/\d/.test(el.textContent)));
   }
  }
  await page.waitForSelector('[data-dps-winner]');
  assert.match(await page.locator('[data-dps-row=new] th').textContent(),/^New Echo(?: \*)?$/);
  const totals=await page.locator('[data-team-dps-body]').evaluate(el=>{
   const rows=[...el.querySelectorAll('[data-dps-row]')];
   return rows.map(r=>({id:r.dataset.dpsRow,value:Number(r.querySelector('.team-total').textContent.replace(/[^\d.-]/g,'')),winner:r.dataset.dpsWinner}));
  });
  assert.equal(totals.find(r=>r.winner)?.id,totals[1].value>totals[0].value?'new':'current');
  await page.waitForFunction(()=>document.querySelector('#feedbackTitle')?.textContent==='Targets met');
  assert.equal(await page.evaluate(()=>JSON.stringify(bellibingAccountSession.store.snapshot().characters)),before);
  assert.ok(adviceCalls>=5);assert.ok(dpsCalls>=2);assert.equal(searchCalls,0);
  await page.locator('#newCard [data-equip-observed]').click();
  await page.waitForFunction(before=>JSON.stringify(bellibingAccountSession.store.snapshot().characters)!==before,before);
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();engine.close();await new Promise(ok=>server.close(ok));}
});
