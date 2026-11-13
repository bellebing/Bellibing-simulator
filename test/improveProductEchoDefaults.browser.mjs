// Real built Chromium Improve UI. HTTP advice is a bounded synthetic protocol
// fixture; this tests routing/presentation, NOT private mathematics or game accuracy.
import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {startPreview} from '../scripts/preview-simulator-v1.mjs';
import {emptyAccount,saveReviewedScan} from '../src/inventoryAccount.mjs';
import {catalog,scan} from './fixtures/inventory.mjs';

test('Chromium: Augusta, Qingxiao and support defaults, manual reload/reset, Pending Expected and account isolation',async()=>{
 let calls=[],status='VERIFIED';
 const handler=async(req,res)=>{
  if(req.url!=='/local-review/echo-advisor')return false;
  let data='';for await(const chunk of req)data+=chunk;
  const input=JSON.parse(data);
  calls.push(input);
  const reply=input.action==='status'?{status:'LOCAL_REVIEW_ONLY'}:
   (status==='VERIFIED'&&Array.isArray(input.target?.hard)&&input.target.hard.length===2&&input.target?.flexCount===1
    ?{status:'VERIFIED',certificate:{exactFixedPoint:true},winner:'DISCARD',continue:{tuners:{approximate:440}},discard:{tuners:{approximate:300}},resources:{optimal:{echoes:{approximate:10},exp:{approximate:2000}}}}
    :{status:'PENDING',reason:'UNSUPPORTED_ECHO_TARGET_OR_ROLLS'});
  res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
  res.end(JSON.stringify({protocol:'BELLIBING_ECHO_ADVICE_V1',result:reply}));
  return true;
 };
 const server=await startPreview({port:0,reviewHandler:handler});
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
 try{
  const profile='improve-hard-flex-e2e-'+Date.now(),page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.setDefaultTimeout(25000);
  let account=emptyAccount();
  for(const id of ['augusta','qingxiao','baizhi'])account=saveReviewedScan(account,scan(id),catalog,{reviewed:true,assign:true});
  await page.goto(base+'/inventory/?profile='+profile);
  await page.waitForFunction(()=>!!globalThis.bellibingAccountSession);
  await page.evaluate(async value=>{await bellibingAccountSession.store.commit(value);},account);
  const before=await page.evaluate(()=>JSON.stringify(bellibingAccountSession.store.snapshot().items));
  async function visit(id){
   await page.goto(base+'/improve/?profile='+profile+'&character='+id);
   await page.waitForFunction(()=>document.querySelector('#echoSettings [data-stat-section="hard"]')!==null);
   await page.waitForFunction(()=>document.querySelector('#settingsToggle')?.getAttribute('aria-expanded')!==null);
   if(await page.locator('#settingsToggle').getAttribute('aria-expanded')!=='true')await page.locator('#settingsToggle').click();
   await page.waitForFunction(()=>document.querySelector('#echoSettings [data-stat-section="flex"]')?.children.length!==undefined);
  }
  const names=async section=>page.locator('#echoSettings [data-stat-section="'+section+'"] [data-stat-id]').evaluateAll(els=>els.map(e=>e.dataset.statId));
  await visit('augusta');
  assert.deepEqual(await names('hard'),['CRIT Rate','CRIT DMG']);
  assert.deepEqual(await names('flex'),['ATK%','Heavy Attack DMG','Energy Regen','Flat ATK']);
  await visit('qingxiao');
  assert.deepEqual(await names('hard'),['CRIT Rate','CRIT DMG']);
  assert.deepEqual(await names('flex'),['ATK%','Flat ATK']);
  assert.match(await page.locator('#sourcePriorityStatus').innerText(),/product default/);
  assert.match(await page.locator('#flexCountLabel').innerText(),/At least 1 of 2/);
  await page.waitForFunction(()=>[...document.querySelectorAll('#slots .improve-upgrade-cost strong')].some(x=>/300/.test(x.textContent)));
  assert.ok(calls.some(x=>x.target?.hard?.map(y=>y.name).join(',')==='CRIT Rate,CRIT DMG'&&x.target.flexCount===1));
  const slider=page.getByRole('slider',{name:'ATK% minimum'});
  await slider.focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('#echoSettings [data-stat-id="ATK%"] input')?.value==='1');
  assert.equal(await page.locator('.setting-mode button').filter({hasText:'Customize'}).getAttribute('aria-pressed'),'true');
  // Persisted workspace writes are asynchronous. Read them from the true AccountStore.
  await page.waitForFunction(()=>bellibingAccountSession.store.snapshot()?.userData?.workspaceSettings?.qingxiao?.minima?.['ATK%']===1);
  await visit('baizhi');
  assert.deepEqual(await names('hard'),[],'support cannot inherit DPS CRIT requirements');
  assert.match(await page.locator('#sourcePriorityStatus').innerText(),/per-Echo Hard\/minimum\/count Pending/);
  await page.waitForFunction(()=>[...document.querySelectorAll('#slots .improve-upgrade-cost strong')].some(x=>x.textContent==='Pending'));
  await page.waitForFunction(()=>document.querySelector('#resourceCost [data-expected-reason]')?.hidden===false);
  assert.match(await page.locator('#resourceCost [data-expected-reason]').innerText(),/Expected Tuners pending/);
  await visit('qingxiao');
  assert.equal(await page.getByRole('slider',{name:'ATK% minimum'}).inputValue(),'1');
  assert.deepEqual(await names('hard'),['CRIT Rate','CRIT DMG']);
  await page.locator('.setting-mode button').filter({hasText:'Recommended'}).click();
  assert.equal(await page.getByRole('slider',{name:'ATK% minimum'}).inputValue(),'0');
  assert.deepEqual(await names('flex'),['ATK%','Flat ATK']);
  await page.waitForFunction(()=>bellibingAccountSession.store.snapshot()?.userData?.workspaceSettings?.qingxiao?.minima?.['ATK%']===0);
  await page.reload();await page.waitForFunction(()=>document.querySelector('#echoSettings [data-stat-id="ATK%"] input')!==null);
  assert.equal(await page.getByRole('slider',{name:'ATK% minimum'}).inputValue(),'0');
  await page.goto(base+'/inventory/?profile='+profile);
  await page.waitForFunction(()=>!!globalThis.bellibingAccountSession);
  assert.equal(await page.evaluate(()=>JSON.stringify(bellibingAccountSession.store.snapshot().items)),before,'Improve must never equip or create Echoes');
  assert.deepEqual(errors,[]);
 }finally{await browser.close();server.closeAllConnections();await new Promise(ok=>server.close(ok));}
});
