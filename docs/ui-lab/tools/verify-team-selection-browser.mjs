// Native Chromium verification of the two public product routes.
// Source scenarios are selected by stable canonical context IDs, never text guesses.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import catalog from '../v1.1/modules/character-contexts.json' with {type:'json'};
import {sourceTeamRoles} from '../v1.1/modules/team-selection.js';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const dist=resolve(process.env.BELLIBING_TEAM_REVIEW_DIRECTORY??root+'/dist');
const out=resolve(process.env.BELLIBING_TEAM_REVIEW_OUT??root+'/artifacts/team-selection');
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{try{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path.endsWith('/'))path+='index.html';const file=resolve(dist,'.'+path);if(!file.startsWith(dist+'/'))throw Error('OUTSIDE_DIST');res.setHeader('Content-Type',types[extname(file)]??'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.UI_LAB_CHROME_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
const url=`http://127.0.0.1:${server.address().port}`,checks=[],errors=[];
const find=(main,partner,third)=>catalog.teams.find(t=>{const r=sourceTeamRoles(t);return r.main===main&&r.partner===partner&&r.third===third;});
const augusta=find('augusta','iuno','the-shorekeeper');
const mortefi=find('augusta','mortefi','the-shorekeeper');
const lynae=find('qingxiao','lynae','the-shorekeeper');
const denia=find('qingxiao','denia','mornye');
for(const t of [augusta,mortefi,lynae,denia])assert.ok(t?.id,'Required source team unavailable');
const sourceText=page=>page.locator('.team-member>span').allTextContents();
async function load(page,route,character){await page.goto(`${url}/${route}/?character=${character}`);await page.waitForFunction(()=>document.documentElement.dataset.uiLabReady==='true');await page.locator('[data-team-context-menu]').waitFor();}
async function pick(page,button,title,id){await page.locator(button).click();const dialog=page.getByRole('dialog',{name:title});await dialog.locator(`[data-choice="${id}"]`).click();}
async function ensureTeam(page,id){assert.equal(await page.locator('.team-source-summary').getAttribute('data-active-context-id'),id);assert.equal(await page.locator('.team-dps-table[data-missing]').count(),0);assert.ok((await page.locator('[data-dps-scenario]').count())>=2);assert.ok((await page.locator('.team-dps-table td').allTextContents()).every(v=>v==='—'));}
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  for(const route of ['sandbox','improve']){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage();
   page.on('pageerror',error=>errors.push({route,viewport,error:error.message}));
   const panel=route==='sandbox'?'#sandboxTeamPanel':'#compactAccountTeamPanel';
   await load(page,route,'augusta');
   await ensureTeam(page,augusta.id);
   assert.deepEqual(await sourceText(page),['Augusta','Iuno','The Shorekeeper']);
   await pick(page, `${panel} [data-team-role="partner"]`,'Choose Sub DPS / partner',mortefi.id);
   await ensureTeam(page,mortefi.id);
   assert.deepEqual(await sourceText(page),['Augusta','Mortefi','The Shorekeeper']);
   assert.equal(await page.locator('.team-support-pending').count(),0,'verified Shorekeeper must remain selected');
   await page.screenshot({path:resolve(out,`${route}-augusta-${viewport.width}.png`),fullPage:true});
   // Default is explicit and reversible, including the canonically bound context ID.
   await page.locator(`${panel} [data-team-default]`).click();
   await ensureTeam(page,augusta.id);
   await load(page,route,'qingxiao');
   await pick(page,`${panel} [data-team-context-menu]`,'Reviewed teams / contexts',lynae.id);
   await ensureTeam(page,lynae.id);
   await pick(page,`${panel} [data-team-role="partner"]`,'Choose Sub DPS / partner',denia.id);
   assert.equal(await page.locator('.team-source-summary').getAttribute('data-active-context-id'),'');
   assert.equal(await page.locator('.team-source-summary').getAttribute('data-draft-context-id'),denia.id);
   assert.deepEqual(await sourceText(page),['Qingxiao','Denia','Choose a teammate']);
   assert.equal(await page.locator('.team-support-pending').count(),1,'Unsupported Shorekeeper must be cleared');
   assert.equal(await page.locator('.team-source-summary').getAttribute('data-active-context-id'),'','No complete source context with empty Support');
   await page.screenshot({path:resolve(out,`${route}-qingxiao-support-pending-${viewport.width}.png`),fullPage:true});
   await pick(page,`${panel} [data-team-role="third"]`,'Choose Support',denia.id);
   await ensureTeam(page,denia.id);
   assert.deepEqual(await sourceText(page),['Qingxiao','Denia','Mornye']);
   assert.equal(await page.locator('.team-support-pending').count(),0);
   await page.screenshot({path:resolve(out,`${route}-qingxiao-mornye-${viewport.width}.png`),fullPage:true});
   await page.locator(`${panel} [data-team-default]`).click();
   assert.equal(await page.locator('.team-source-summary').getAttribute('data-active-context-id'),catalog.characters.find(c=>c.characterId==='qingxiao').defaultContextId);
   if(viewport.width===1440){
    // Every RELEASED Character has a visible 3-member default in both routes.
    for(const c of catalog.characters){
     await load(page,route,c.characterId);
     assert.equal(await page.locator('.team-source-summary').getAttribute('data-active-context-id'),c.defaultContextId,c.characterId);
     const selected=await sourceText(page);
     assert.equal(selected.length,3,c.characterId);
     assert.ok(selected.every(s=>s!=='Choose a teammate'),c.characterId);
     assert.equal(await page.locator('.team-dps-table td').count(),route==='sandbox'?12:8,c.characterId);
    }
   }
   checks.push({route,viewport:viewport.width,defaultCharacters:viewport.width===1440?catalog.characters.length:2,
     conditionalAugusta:true,clearedQingxiaoSupport:true,explicitMornye:true,allDpsPending:true});
   await context.close();
  }
 }
 assert.deepEqual(errors,[]);
 console.log('Native Team Selection Chromium PASS '+JSON.stringify(checks));
}finally{await writeFile(resolve(out,'verification.json'),JSON.stringify({checks,errors,sourceIds:{augusta:augusta.id,mortefi:mortefi.id,lynae:lynae.id,denia:denia.id}},null,2));await browser.close();await new Promise(r=>server.close(r));}
