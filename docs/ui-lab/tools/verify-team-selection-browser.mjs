// Real member-only UX on both product routes; catalog and source gates stay intact.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {startPreview} from '../../../scripts/preview-simulator-v1.mjs';
import catalog from '../v1.1/modules/character-contexts.json' with {type:'json'};
import {CHARACTER_CATALOG} from '../v1.1/modules/catalog.js';
import {screenshotTeamPanel} from './team-panel-screenshot.mjs';
import {verifyTeamPanelCaptureRace} from './team-panel-capture-check.mjs';
const out=resolve(process.env.BELLIBING_TEAM_REVIEW_OUT??'artifacts/team-selection');await mkdir(out,{recursive:true});
const server=await startPreview({directory:process.env.BELLIBING_TEAM_REVIEW_DIRECTORY??'dist',port:0});
const browser=await chromium.launch({headless:true,executablePath:process.env.UI_LAB_CHROME_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
const url=`http://127.0.0.1:${server.address().port}`,checks=[],errors=[],captureOnly=process.argv.includes('--capture-only');let captureRegression=null;
const people=new Map(CHARACTER_CATALOG.map(c=>[c.id,c]));
async function load(page,route,id){await page.goto(`${url}/${route}/?character=${id}`);await page.waitForFunction(()=>document.documentElement.dataset.uiLabReady==='true');if(await page.locator('#characterToggle').getAttribute('aria-expanded')!=='true')await page.locator('#characterToggle').click();await page.locator('.sandbox-dps').waitFor();}
const names=page=>page.locator('.team-member>span').allTextContents();
async function select(page,role,id){await page.locator(`[data-team-role="${role}"]`).click();const dialog=page.getByRole('dialog');const choices=dialog.locator('[data-choice]');const ids=await choices.evaluateAll(nodes=>nodes.map(n=>n.dataset.choice));assert.equal(new Set(ids).size,ids.length,'one Character per choice');for(const key of ids){const c=people.get(key);assert.ok(c,key);const choice=dialog.locator(`[data-choice="${key}"]`);assert.equal(await choice.locator('strong').textContent(),c.name);assert.ok((await choice.locator('img').getAttribute('src')).endsWith(c.face.split('/').pop()),'portrait belongs to candidate');}await dialog.locator(`[data-choice="${id}"]`).click();}
try{
 captureRegression=await verifyTeamPanelCaptureRace(browser);
 for(const width of [1440,390])for(const route of ['sandbox','improve']){
  const context=await browser.newContext({viewport:{width,height:width===1440?900:844},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  if(captureOnly)await context.route('https://**/*',route=>route.abort()); // Focused offline capture check only; no hosted backend traffic.
  await load(page,route,'augusta');assert.equal(await page.locator('[data-team-context-menu],[data-team-default],[data-team-mode]').count(),0);assert.equal(await page.locator('.sandbox-dps').count(),1);assert.equal(await page.locator('.team-dps-table').count(),1);
  await select(page,'partner','mortefi');assert.deepEqual(await names(page),['Augusta','Mortefi','The Shorekeeper']);assert.ok((await page.locator('.team-source-summary').getAttribute('data-active-context-id')).includes('mortefi-the-shorekeeper'));
  await page.screenshot({path:resolve(out,`${route}-augusta-${width}.png`),fullPage:true});await screenshotTeamPanel(page,route,{path:resolve(out,`${route}-team-panel-${width}.png`)});
  await select(page,'third','verina');assert.deepEqual(await names(page),['Augusta','Mortefi','Verina']);
  if(captureOnly){checks.push({route,width,captureOnly:true,selectedTeamPreserved:true});await context.close();continue;}
  // Changli's guide-backed numeric reference exists but its old default
  // treated Changli as a third member, trapping the member-only selector.
  await load(page,route,'changli');
  assert.deepEqual(await names(page),['Aemeath','Lupa','Changli']);
  await select(page,'main','changli');
  assert.deepEqual(await names(page),['Changli','Aemeath','Choose a teammate']);
  assert.equal(await page.locator('.team-source-summary').getAttribute('data-active-context-id'),'');
  await select(page,'third','the-shorekeeper');
  assert.deepEqual(await names(page),['Changli','Aemeath','The Shorekeeper']);
  assert.equal(await page.locator('.team-source-summary').getAttribute('data-active-context-id'),'guide-changli-aemeath-the-shorekeeper-changli-slots-10');
  assert.equal(await page.locator('.team-dps-table td').filter({hasText:/\d/}).count(),0,'a selected source context is not qualified DPS');
  await load(page,route,'qingxiao');await select(page,'partner','lynae');if((await names(page))[2]!=='The Shorekeeper')await select(page,'third','the-shorekeeper');
  await select(page,'partner','denia');assert.deepEqual(await names(page),['Qingxiao','Denia','Choose a teammate']);assert.equal(await page.locator('.team-next-action a').count(),0,'incomplete team asks for a member, not a Build edit');assert.equal(await page.locator('.team-source-summary').getAttribute('data-active-context-id'),'');
  await page.screenshot({path:resolve(out,`${route}-qingxiao-third-pending-${width}.png`),fullPage:true});await select(page,'third','mornye');assert.deepEqual(await names(page),['Qingxiao','Denia','Mornye']);assert.ok(await page.locator('.team-source-summary').getAttribute('data-active-context-id'));
  assert.equal(await page.locator('.team-details,.team-conditions,.selector-help,.cost-help,.advice-help').count(),0);
  assert.equal(await page.locator('.team-dps-table td').filter({hasText:/\d/}).count(),0,'selection never qualifies DPS');
  // Empty account gives an action, not several empty comparison rows.
  if(route==='improve'){assert.equal(await page.locator('.working-card:visible').count(),0);assert.equal(await page.locator('.empty-build-action').isVisible(),true);}
  await load(page,route,'ciaccona');assert.equal(await page.locator('[data-team-role="third"]').getAttribute('aria-label').then(v=>v.includes('Support')),false,'actual third role is not invented Support');
  await select(page,'main','phoebe');if(await page.locator('[data-team-variant]').count()){await page.locator('[data-team-variant]').click();await page.getByRole('dialog',{name:'Choose variant'}).locator('[data-choice]').first().click();}
  if((await names(page))[2]!=='Lynae')await select(page,'third','lynae');
  await select(page,'main','jiyan');const variants=page.getByRole('dialog',{name:'Choose variant'});await variants.waitFor();assert.equal(await page.locator('.team-source-summary').getAttribute('data-active-context-id'),'');assert.equal(await page.locator('.team-dps-table td').filter({hasText:/\d/}).count(),0);assert.equal(await variants.locator('[data-choice]').count(),2);assert.equal(await variants.locator('.item-choice small').count(),0);assert.equal(await variants.locator('.selector-help').count(),0);await variants.locator('[data-close]').click();assert.equal(await page.locator('.team-source-summary').getAttribute('data-active-context-id'),'');await page.locator('[data-team-variant]').click();await page.screenshot({path:resolve(out,`${route}-variant-${width}.png`),fullPage:true});await variants.locator('[data-choice]').first().click();assert.equal((await names(page))[2],'Choose a teammate','variant does not equip an unchosen third member');
  if(width===1440)for(const c of catalog.characters){await load(page,route,c.characterId);assert.equal(await page.locator('.team-source-summary').getAttribute('data-active-context-id'),c.defaultContextId,c.characterId);assert.equal((await names(page)).length,3);assert.equal(await page.locator('.team-dps-table').count(),1);}
  checks.push({route,width,deduplicated:true,ownPortraits:true,preservedThird:true,clearedThird:true,explicitThird:true,catalog:width===1440?59:2});await context.close();
 }
 assert.deepEqual(errors,[]);console.log('Member Team Selection Chromium PASS '+JSON.stringify(checks));
}finally{await writeFile(resolve(out,'verification.json'),JSON.stringify({checks,errors,captureRegression},null,2));await browser.close();await new Promise(r=>server.close(r));}
