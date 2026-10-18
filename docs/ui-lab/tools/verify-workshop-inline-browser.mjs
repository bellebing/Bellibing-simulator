import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {reviewBrowserContext} from './review-browser-context.mjs';
const root=resolve(fileURLToPath(new URL('../../../',import.meta.url))),out='/tmp/bellibing-workshop-inline-review';await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png'};
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',types[extname(p)]??'application/octet-stream');res.end(await readFile(p));}catch{res.statusCode=404;res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),errors=[];
try{const context=await reviewBrowserContext(browser,{viewport:{width:1440,height:900},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/docs/ui-prototypes/v34-functional.html`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.documentElement.dataset.echoCatalogReady==='true'&&document.documentElement.dataset.weaponCatalogReady==='true'&&releasedCharacters.length===59);
 await page.evaluate(()=>{show('build');buildPicker.reset();buildPicker.render();buildPicker.select('Augusta');});
 await page.locator('.echo[data-echo-slot="0"]').click();await page.waitForFunction(()=>echoUi.open);
 await page.evaluate(()=>echoUi.select(echoCatalog.find(e=>e.cost===4).id));
 const initialStorage=await page.evaluate(()=>localStorage.getItem('bellibing-ui-checkpoint-v34'));
 async function choose(id,index){const trigger=page.locator('#'+id+'-trigger'),details=trigger.locator('xpath=ancestor::details');if(await details.count()&&!(await details.evaluate(el=>el.open)))await details.locator('summary').click();await trigger.click();await page.locator('#'+id+'-option-'+index).click();}
 for(let i=0;i<5;i++){await choose(`echoSubstat${i}Name`,i+1);assert.equal(await page.locator('#echoEquip').isDisabled(),true);await choose(`echoSubstat${i}Value`,1);assert.equal(await page.evaluate(()=>echoUi.editorDraft.level),(i+1)*5);if(i<4)assert.equal(await page.locator('.echo-roll-checkpoint[open]').count(),1);}
 const original=await page.evaluate(()=>structuredClone(echoUi.editorSubstatRows));
 await choose('echoSubstat0Name',2);assert.equal(await page.locator('#dialogTitle').innerText(),'Swap observed roll pairs?');await page.locator('#cancelSwitch').click();assert.deepEqual(await page.evaluate(()=>echoUi.editorSubstatRows),original);
 await choose('echoSubstat0Name',2);await page.locator('#confirmSwitch').click();const swapped=await page.evaluate(()=>echoUi.editorSubstatRows);assert.deepEqual(swapped[0],original[1]);assert.deepEqual(swapped[1],original[0]);
 await page.getByRole('button',{name:'Undo last roll edit'}).click();assert.deepEqual(await page.evaluate(()=>echoUi.editorSubstatRows),original);
 assert.equal(await page.evaluate(()=>localStorage.getItem('bellibing-ui-checkpoint-v34')),initialStorage);
 await page.screenshot({path:resolve(out,'workshop-inline-1440.png'),fullPage:true});
 await page.locator('#echoClose').click();await page.waitForFunction(()=>!echoUi.open);assert.equal(await page.evaluate(()=>localStorage.getItem('bellibing-ui-checkpoint-v34')),initialStorage);assert.deepEqual(errors,[]);
 await writeFile(resolve(out,'results.json'),JSON.stringify({viewport:'1440x900',canonicalFiveRows:true,autoAdvance:true,incompleteCommitBlocked:true,explicitSwapCancelConfirmUndo:true,valuesPreserved:true,cancelNoWrite:true,errors},null,2));console.log('Workshop inline browser checks passed: '+out);
}finally{await browser.close();await new Promise(r=>server.close(r));}
