// Focused real-Chromium UI verification. Simulated host replies exercise connection
// state only; no private policy, data, or gameplay result is supplied.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.jpg':'image/jpeg','.avif':'image/avif','.woff2':'font/woff2'};
const server=createServer(async(request,response)=>{
 try{
  const path=resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
  if(!path.startsWith(root+'/'))throw Error('path outside root');
  response.setHeader('Content-Type',types[extname(path)]??'application/octet-stream');
  response.end(await readFile(path));
 }catch{response.writeHead(404).end();}
});
await new Promise(resolveReady=>server.listen(0,'127.0.0.1',resolveReady));
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.UI_LAB_CHROME_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let hostOnline=false,guestCalls=0,metricCalls=0,runCalls=0,configPending=false;
 const protocol='BELLIBING_SANDBOX_HTTP_V1';
 await page.route('**/sandbox/v1/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;
  if(!hostOnline)return route.fulfill({status:404,contentType:'text/html',body:'Preview only'});
  if(path==='/sandbox/v1/guest'){
   guestCalls++;
   return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({protocol,csrfToken:'csrf',expiresAt:'2099-01-01T00:00:00Z'})});
  }
  assert.equal(req.headers()['x-csrf-token'],'csrf');
  const body=JSON.parse(req.postData());
  if(path==='/sandbox/v1/metrics'){
   metricCalls++;
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({protocol,clientGeneration:body.clientGeneration,status:configPending?'PENDING':'READY',...(configPending?{reasons:['CONFIGURATION_CAPABILITY_PENDING'],metrics:null}:{metrics:{}})})});
  }
  if(path==='/sandbox/v1/runs'){
   runCalls++;
   // A real host may say a context is Pending. Do not fabricate a simulated card.
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({protocol,clientGeneration:body.clientGeneration,status:'PENDING',runId:null,metrics:null,reasons:['PRIVATE_CAPABILITY_PENDING']})});
  }
  throw Error('Unexpected host endpoint '+path);
 });
 await page.goto(`http://127.0.0.1:${server.address().port}/docs/ui-lab/v1.1/index.html?sandbox=true`,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>document.documentElement.dataset.uiLabReady==='true');
 const host=page.locator('#sandboxHostStatus'),button=page.locator('#simulate');
 await page.locator('#sandboxHostStatus[data-status="UNAVAILABLE"]').waitFor({timeout:15000});
 assert.match(await host.innerText(),/Local simulation host unavailable.*Preview only/);
 assert.equal(await button.isDisabled(),true,'Offline SIMULATE must be disabled');
 assert.match(await button.getAttribute('title'),/Preview only/);
 assert.equal(runCalls,0,'Static preview may not fabricate or start a simulation');
 assert.ok((await page.evaluate(()=>window.bellibingLabConfiguration.snapshot())).slots.every(s=>s.simulatedCurrent===null));

 // The same page must recover after a separately started local host appears.
 hostOnline=true;
 await page.locator('#sandboxHostStatus[data-status="CONNECTED"]').waitFor({timeout:15000});
 assert.match(await host.innerText(),/Local simulation host connected/);
 assert.equal(await button.isEnabled(),true,'SIMULATE must recover without reload');
 assert.ok(guestCalls>=1&&metricCalls>=1,'Reachability requires real protocol-shaped metrics response');
 await button.click();
 await page.waitForFunction(()=>document.querySelector('#sandboxRunStatus')?.textContent.includes('cannot currently be executed'));
 assert.equal(await page.locator('#sandboxRunStatus').getAttribute('title'),'Server reason: PRIVATE_CAPABILITY_PENDING');
 assert.equal(runCalls,1,'Button calls the host instead of running fake results');
 assert.ok((await page.evaluate(()=>window.bellibingLabConfiguration.snapshot())).slots.every(s=>s.simulatedCurrent===null));
 assert.deepEqual(await page.locator('[data-cost-role="simulated"]').allTextContents(),['—','—','—']);

 // Host reachability alone must not enable SIMULATE for an unsupported context.
 configPending=true;
 await page.getByRole('combobox',{name:'Sandbox Weapon',exact:true}).selectOption('verdant-summit');
 await page.waitForFunction(()=>document.querySelector('#sandboxRunStatus')?.textContent.includes('Character, Weapon or Settings combination'));
 assert.equal(await button.isDisabled(),true);
 assert.equal(await page.locator('#sandboxRunStatus').getAttribute('title'),'Server reason: CONFIGURATION_CAPABILITY_PENDING');
 assert.equal(runCalls,1,'Pending preflight must not start a run');
 configPending=false;
 await page.getByRole('combobox',{name:'Sandbox Weapon',exact:true}).selectOption('thunderflare-dominion');
 await page.waitForFunction(()=>document.querySelector('#sandboxRunStatus')?.dataset.status==='READY');
 assert.equal(await button.isEnabled(),true);

 // Source-bound Characters stay selectable, but their execution is determined by the host.
 configPending=true;
 await page.locator('.portrait.selected').click();
 await page.locator('[data-filter="all"]').click();
 const index=await page.locator('[data-art]').evaluateAll((nodes,id)=>nodes.findIndex(n=>n.dataset.art===id),'iuno');
 assert.ok(index>=0,'Source-bound Iuno must remain selectable');
 await page.locator('#galleryArt').focus();
 await page.keyboard.press('Home');for(let i=0;i<index;i++)await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('#characterCarousel').dataset.focusedCharacter==='iuno'&&document.querySelector('#characterCarousel').dataset.motion==='settled');
 await page.keyboard.press('Enter');
 await page.waitForFunction(()=>window.bellibingLabConfiguration.readContext().characterId==='iuno');
 await page.waitForFunction(()=>document.querySelector('#sandboxRunStatus')?.textContent.includes('Character, Weapon or Settings combination'));
 assert.equal(await button.isDisabled(),true);
 assert.equal(runCalls,1);
 // Restore canonical source context.
 await page.locator('.portrait.selected').click();
 await page.locator('[data-filter="all"]').click();
 const augustaIndex=await page.locator('[data-art]').evaluateAll((nodes,id)=>nodes.findIndex(n=>n.dataset.art===id),'augusta');
 await page.locator('#galleryArt').focus();await page.keyboard.press('Home');
 for(let i=0;i<augustaIndex;i++)await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('#characterCarousel').dataset.focusedCharacter==='augusta'&&document.querySelector('#characterCarousel').dataset.motion==='settled');
 configPending=false;
 await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('#sandboxRunStatus')?.dataset.status==='READY');
 assert.equal(await button.isEnabled(),true);

 // A lost host on the next action must return to preview-only, then recover.
 hostOnline=false;
 await button.click();
 await page.locator('#sandboxHostStatus[data-status="UNAVAILABLE"]').waitFor({timeout:15000});
 assert.equal(await button.isDisabled(),true);
 hostOnline=true;
 await page.locator('#sandboxHostStatus[data-status="CONNECTED"]').waitFor({timeout:15000});
 assert.equal(await button.isEnabled(),true);
 assert.deepEqual(errors,[]);
 console.log('Sandbox host-status Chromium PASS',JSON.stringify({chromium:browser.version(),offlinePreview:true,reconnected:true,pendingNoFake:true,disconnectRecovered:true,guestCalls,metricCalls,runCalls}));
}finally{
 await browser?.close();
 await new Promise(done=>server.close(done));
}
