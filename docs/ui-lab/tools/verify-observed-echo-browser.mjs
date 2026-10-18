// One focused public interaction with controlled HTTP aggregates, not a motor proof.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import echoData from '../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
import {observedScenarioFixture} from '../../../test/helpers/observedScenarioFixture.mjs';
const root=resolve(fileURLToPath(new URL('../../../',import.meta.url))),types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);res.setHeader('Content-Type',types[extname(path)]??'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.UI_LAB_CHROME_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/sandbox/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname,body=JSON.parse(route.request().postData()??'{}'),protocol='BELLIBING_SANDBOX_HTTP_V1';
  const send=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({protocol,...data})});
  if(path.endsWith('/guest'))return send({csrfToken:'unit-ui-token',expiresAt:Date.now()+100000});
  if(path.endsWith('/metrics'))return send({clientGeneration:body.clientGeneration,status:'READY',metrics:{}});
  if(path.endsWith('/runs')){
   const {dps,view}=observedScenarioFixture();
   for(const [i,slot]of view.slots.entries()){
    const t=body.context.slots[i].configuration;
    Object.assign(slot.current,{speciesId:t.echoId,selectedSonataSetId:t.selectedSonataSetId,cost:t.cost,rank:t.rank,
     mainStat:echoData.statEditor.mainStatsByCostAndLevel[t.cost]['25'].find(s=>s.name===t.mainStatName),secondaryMainStat:echoData.statEditor.secondaryMainStatsByCostAndLevel[t.cost]['25'],substats:echoData.statEditor.substats.slice(0,5).map(s=>({name:s.name,value:s.values[0]}))});
   }
   view.slots[0].trash[0].card={...structuredClone(view.slots[0].current),id:'unit-alternative'};
   return send({clientGeneration:body.clientGeneration,status:'GOAL_SUCCESS',runId:'unit-observed-run',serverRevision:0,view,metrics:{dps}});
  }
  if(path.endsWith('/reset'))return send({status:'RESET'});
  throw Error('Unexpected endpoint '+path);
 });
 await page.goto(`http://127.0.0.1:${server.address().port}/docs/ui-lab/v1.1/index.html?sandbox=true&review=expert&character=expanded`);
 await page.waitForFunction(()=>document.documentElement.dataset.uiLabReady==='true');
 if(await page.locator('#characterToggle').getAttribute('aria-expanded')!=='true')await page.locator('#characterToggle').click();
 await page.locator('.dps-expert summary').click();await page.locator('.sandbox-dps-context').check();
 await page.waitForFunction(()=>!document.querySelector('#simulate').disabled);await page.locator('#simulate').click();
 await page.waitForSelector('.observed-echo-comparison');
 assert.deepEqual(await page.locator('[data-observed-row="BASELINE"] td').allTextContents(),['1','2','3','6']);
 assert.deepEqual(await page.locator('[data-observed-row="ALTERNATIVE"] td').allTextContents(),['2','2','3','7']);
 assert.match(await page.locator('[data-observed-row="DELTA"] td').last().innerText(),/\+1.*\(\+16\.67%\)/s);
 assert.ok((await page.locator('[data-dps-scenario] td').allTextContents()).every(v=>v==='—'));
 await page.locator('.observed-echo-slot').selectOption('2');
 assert.ok((await page.locator('[data-observed-row="ALTERNATIVE"] td').allTextContents()).every(v=>v==='—'));
 assert.match(await page.locator('.observed-echo-comparison').innerText(),/No other complete/);
 await page.locator('.observed-echo-slot').selectOption('1');
 const overflow=await page.locator('.observed-echo-comparison').evaluate(n=>n.scrollWidth>n.clientWidth+1);assert.equal(overflow,false);
 if(process.env.OBSERVED_ECHO_SCREENSHOT)await page.locator('.dps-expert').screenshot({path:process.env.OBSERVED_ECHO_SCREENSHOT});
 await page.locator('#reset').click();await page.waitForFunction(()=>!document.querySelector('.observed-echo-comparison'));
 assert.deepEqual(errors,[]);console.log('Observed Echo Chromium PASS: opt-in expert, same-run rows/delta, Pending alternative, reset invalidation, 1440px fit; controlled HTTP only.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
