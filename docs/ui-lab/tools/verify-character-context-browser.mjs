// Focused UI contract regression. Canonical card fixtures are controlled HTTP
// observations for presentation checks, not private-engine rolling evidence.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import echoData from '../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
const root=resolve(fileURLToPath(new URL('../../../',import.meta.url))),types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);res.setHeader('Content-Type',types[extname(path)]??'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.UI_LAB_CHROME_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let online=false;
 await page.route('**/sandbox/v1/**',async route=>{
  if(!online)return route.fulfill({status:503,contentType:'application/json',body:'{}'});
  const path=new URL(route.request().url()).pathname,body=JSON.parse(route.request().postData()??'{}'),protocol='BELLIBING_SANDBOX_HTTP_V1';
  const send=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({protocol,...data})});
  if(path.endsWith('/guest'))return send({csrfToken:'unit-ui-token',expiresAt:Date.now()+100000});
  if(path.endsWith('/metrics'))return send({clientGeneration:body.clientGeneration,status:'READY',metrics:{}});
  if(path.endsWith('/runs')){
   const slots=body.context.slots.map((s,i)=>{const t=s.configuration;return {slot:i+1,complete:true,current:{id:'ui-contract-'+i,speciesId:t.echoId,selectedSonataSetId:t.selectedSonataSetId,cost:t.cost,rank:t.rank,level:25,
    mainStat:echoData.statEditor.mainStatsByCostAndLevel[t.cost]['25'].find(s=>s.name===t.mainStatName),secondaryMainStat:echoData.statEditor.secondaryMainStatsByCostAndLevel[t.cost]['25'],substats:echoData.statEditor.substats.slice(0,5).map(s=>({name:s.name,value:s.values[0]}))},candidate:null,trash:[]};});
   return send({clientGeneration:body.clientGeneration,status:'GOAL_SUCCESS',runId:'ui-contract-run',serverRevision:0,view:{slots},metrics:{}});
  }
  throw Error('Unexpected contract endpoint: '+path);
 });
 await page.goto(`http://127.0.0.1:${server.address().port}/docs/ui-lab/v1.1/index.html?sandbox=true&layout=legacy&character=expanded`);await page.waitForFunction(()=>document.documentElement.dataset.uiLabReady==='true');
 // These host/result scenarios require a funded search; resource blockers are not their subject.
 await page.locator('.sandbox-unlimited-resources').evaluate(button=>button.click());
 if(await page.locator('#characterToggle').getAttribute('aria-expanded')!=='true')await page.locator('#characterToggle').click();
 assert.equal(await page.locator('.team-dps-table').count(),1);assert.equal(await page.locator('.team-next-action').count(),0);assert.deepEqual(await page.locator('.team-dps-table tbody th').allTextContents(),['Reference','Simulated','Change']);
 assert.equal(await page.locator('.sandbox-dps-context').count(),0);
 assert.ok((await page.locator('#characterStats td:last-child').allTextContents()).every(v=>v!=='—'));
 assert.match(await page.locator('.stat-scope').innerText(),/Echoes Pending/);
 await page.getByRole('button',{name:'Simulation Stats',exact:true}).click();assert.equal(await page.locator('.sandbox-dps').isVisible(),true);
 await page.getByRole('button',{name:'Character Stats',exact:true}).click();assert.equal(await page.locator('.sandbox-dps').isVisible(),true);
 assert.ok((await page.locator('[data-role="simulated"] strong').allTextContents()).every(v=>v==='—'));
 online=true;
 await page.locator('[data-team-role="partner"]').click();await page.getByRole('dialog',{name:'Choose Sub DPS / partner'}).locator('[data-choice="mortefi"]').click();
 assert.deepEqual(await page.locator('.team-member>span').allTextContents(),['Augusta','Mortefi','The Shorekeeper']);
 await page.waitForFunction(()=>!document.querySelector('#simulate').disabled);await page.locator('#simulate').click();
 await page.waitForFunction(()=>document.querySelector('.stat-scope').textContent==='Observed Echoes');
 await page.getByRole('button',{name:'Simulation Stats',exact:true}).click();
 assert.equal(await page.locator('[data-result-id="ELECTRO_DMG_BONUS"] [data-role="simulated"] strong').innerText(),'70%');
 assert.equal(await page.locator('.team-dps-table td').filter({hasText:/\d/}).count(),0);
 await page.locator('.portrait.selected').click();await page.locator('[data-filter="all"]').click();
 const index=await page.locator('[data-art]').evaluateAll(nodes=>nodes.findIndex(n=>n.dataset.art==='phrolova'));
 await page.locator('#galleryArt').focus();await page.keyboard.press('Home');for(let i=0;i<index;i++)await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('#characterCarousel').dataset.focusedCharacter==='phrolova'&&document.querySelector('#characterCarousel').dataset.motion==='settled');await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('.team-member>span')?.textContent==='Phrolova');
 if(await page.locator('#characterToggle').getAttribute('aria-expanded')!=='true')await page.locator('#characterToggle').click();
 assert.deepEqual(await page.locator('.team-member>span').allTextContents(),['Phrolova','Lucilla','Qiuyuan']);
 if(await page.locator('#settingsToggle').getAttribute('aria-expanded')!=='true')await page.locator('#settingsToggle').click();
 await page.getByRole('button',{name:'Recommended',exact:true}).click();
 assert.equal(await page.locator('.recommended-guidance').count(),0);assert.equal(await page.getByRole('link',{name:'Character guide'}).count(),0);assert.equal(await page.locator('.target').isVisible(),false);
 assert.deepEqual(await page.locator('#flexRows [data-stat-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.statId)),['CRIT Rate','CRIT DMG','ATK%','Skill DMG','Flat ATK']);
 assert.equal(await page.locator('#hardRows [data-stat-id]').count(),0);assert.equal(await page.locator('#flexCount').isVisible(),false);
 await page.getByRole('button',{name:'Customize',exact:true}).click();
 assert.equal(await page.locator('#flexRows [data-stat-id="CRIT Rate"] input[type="range"]').count(),1);
 assert.equal(await page.locator('#flexCount').isVisible(),true);
 assert.ok((await page.locator('[data-role="simulated"] strong').allTextContents()).every(v=>v==='—'),'Character switch clears observed stats');

 assert.deepEqual(errors,[]);console.log('Focused Chromium PASS: static baseline/observed slots, stale Character clearing, source priorities/Customize, shared DPS Pending; controlled HTTP only.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
