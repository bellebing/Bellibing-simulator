// Focused presentation regression; controlled unavailable host, no gameplay fixtures.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=resolve(fileURLToPath(new URL('../../../',import.meta.url))),types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);res.setHeader('Content-Type',types[extname(path)]??'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.UI_LAB_CHROME_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/sandbox/v1/**',r=>r.fulfill({status:503,contentType:'application/json',body:'{}'}));
 await page.goto(`http://127.0.0.1:${server.address().port}/docs/ui-lab/v1.1/index.html?sandbox=true&character=expanded`);await page.waitForFunction(()=>document.documentElement.dataset.uiLabReady==='true');
 if(await page.locator('#characterToggle').getAttribute('aria-expanded')!=='true')await page.locator('#characterToggle').click();
 assert.equal(await page.locator('[data-dps-scenario]').count(),3);assert.equal(await page.locator('.team-dps-table td').count(),12);
 assert.equal(await page.locator('.sandbox-dps-context').count(),0);
 await page.getByRole('button',{name:'Simulation Stats',exact:true}).click();assert.equal(await page.locator('.sandbox-dps').isVisible(),true);
 await page.getByRole('button',{name:'Character Stats',exact:true}).click();assert.equal(await page.locator('.sandbox-dps').isVisible(),true);
 const select=page.getByRole('combobox',{name:'Source team context',exact:true});
 await select.selectOption('guide-augusta-mortefi-the-shorekeeper-augusta-slots-4');
 assert.deepEqual(await page.locator('.dps-contribution span').allTextContents(),['Augusta','Mortefi','The Shorekeeper','Team Total']);
 await page.locator('.portrait.selected').click();await page.locator('[data-filter="all"]').click();
 const index=await page.locator('[data-art]').evaluateAll(nodes=>nodes.findIndex(n=>n.dataset.art==='phrolova'));
 await page.locator('#galleryArt').focus();await page.keyboard.press('Home');for(let i=0;i<index;i++)await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('#characterCarousel').dataset.focusedCharacter==='phrolova'&&document.querySelector('#characterCarousel').dataset.motion==='settled');await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('.dps-contribution span')?.textContent==='Phrolova');
 if(await page.locator('#characterToggle').getAttribute('aria-expanded')!=='true')await page.locator('#characterToggle').click();
 assert.deepEqual(await page.locator('.dps-contribution span').allTextContents(),['Phrolova','Lucilla','Qiuyuan','Team Total']);
 if(await page.locator('#settingsToggle').getAttribute('aria-expanded')!=='true')await page.locator('#settingsToggle').click();
 await page.getByRole('button',{name:'Recommended',exact:true}).click();
 assert.match(await page.locator('.recommended-guidance').innerText(),/60%\+ \(before Echo set bonuses\)/);
 assert.match(await page.locator('.recommended-guidance').innerText(),/ER target Pending/);

 assert.deepEqual(errors,[]);console.log('Focused Chromium PASS: shared panel, 3 rows, source selection, Phrolova guidance; no private engine claim.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
