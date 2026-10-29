// Actual standalone comparison review; no production account, gameplay or subjective art approval.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {ELEMENTAL_DESIGNS} from './elemental-designs.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const file=process.env.CONCEPT_PORTABLE_HTML??'/workspace/shared/bellibing-elemental-environments.html';
const out=resolve(process.env.ELEMENTAL_REVIEW_OUT??'/tmp/bellibing-elemental-review');await mkdir(out,{recursive:true});
const html=await readFile(file,'utf8'),checks=[],errors=[],requests=[];
const browser=await chromium.launch({executablePath:process.env.UI_LAB_CHROME_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'light',reducedMotion:'no-preference'});
await context.addInitScript(()=>{localStorage.setItem('bellibing-ui-checkpoint-v34','{"sentinel":"unchanged-account"}');localStorage.setItem('bellibing-resource-policy','{"sentinel":"unchanged-resources"}');});
const page=await context.newPage(),url='http://127.0.0.1:4179/elemental-review';
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
await page.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
const ready=async()=>{await page.locator('.elemental-stage[data-renderer]').waitFor();await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));};
const shot=async name=>{await ready();await page.screenshot({path:resolve(out,name+'.jpg'),type:'jpeg',quality:92,fullPage:false});};
const theme=async id=>{await page.locator('.elemental-controls [data-environment='+id+']').click();await ready();assert.equal(await page.locator('.elemental-stage').getAttribute('data-environment'),id);};
const view=async mode=>{await page.locator('[data-scene-view='+mode+']').click();await ready();};
const sceneData=()=>page.locator('.elemental-stage').evaluate(e=>({renderer:e.dataset.renderer,frames:Number(e.dataset.frames),width:e.querySelector('canvas').width,height:e.querySelector('canvas').height}));
const actualBuild=()=>page.locator('.hero-stats,.hero-weapon,.hero-echoes,.hero-identity').allTextContents();
const geometry=()=>page.locator('.bellibing-card,.hero-echo').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}}));
try{
 await page.goto(url+'#build');await ready();await context.setOffline(true);
 assert.equal(await page.locator('.elemental-controls [data-environment]').count(),6);assert.equal(await page.locator('.hero-echo').count(),5);assert.equal(await page.locator('.forte-core img').count(),5);
 assert.equal(await page.locator('.rendered-room,.rendered-subject,.stage-floor,.stage-column').count(),0);assert.ok(!html.includes('environment-study/room.png'));assert.equal(await page.locator('link[rel=stylesheet]').count(),0);
 for(const [tag,path] of [['base','concept.css'],['hero','hero-team.css']])assert.equal(await page.locator('style[data-concept-style='+tag+']').textContent(),await readFile(new URL(path,import.meta.url),'utf8'));
 for(const selector of ['html','body','#app'])assert.equal(await page.locator(selector).evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(12, 16, 21)');
 checks.push('Actual standalone HTML embeds exact CSS, canonical icons and six art/depth pairs; dark canvas, five Echoes and real Skills retained; no chamber/mannequin asset loaded');
 const baseline=await actualBuild(),boxes=await geometry();
 for(const e of ELEMENTAL_DESIGNS){
  await theme(e.id);assert.equal((await sceneData()).renderer,'DEPTH');assert.deepEqual(await actualBuild(),baseline);assert.deepEqual(await geometry(),boxes);
  await shot(e.id+'-cards-1440');await view('character');assert.equal(await page.locator('.hero-info').isVisible(),false);assert.equal(await page.locator('.hero-figure').isVisible(),true);
  await view('background');assert.equal(await page.locator('.hero-figure').isVisible(),false);await shot(e.id+'-background-1440');await view('cards');
 }
 assert.equal(await page.evaluate(()=>performance.getEntriesByType('navigation').length),1);
 checks.push('All six environments switch without page reload or changes to actual demo Character identity, stats, equipment or card geometry; background/Character/cards comparison modes verified and captured');
 await theme('electro');await view('character');await shot('electro-character-still-1440');
 await page.waitForTimeout(200);const stillFrames=(await sceneData()).frames;await page.mouse.move(1000,470);await page.waitForTimeout(350);assert.equal((await sceneData()).frames,stillFrames);
 await view('background');const clip={x:820,y:310,width:240,height:90};const before=await page.screenshot({clip,type:'png'});
 await page.locator('[data-hero-variant=parallax]').click();await ready();await page.mouse.move(1100,470);await page.waitForTimeout(1350);assert.ok((await sceneData()).frames>4);const after=await page.screenshot({clip,type:'png'});assert.notDeepEqual(after,before,'Background pixels change in the upper field, outside the foreground mask and Character');
 const settled=(await sceneData()).frames;await page.waitForTimeout(400);assert.equal((await sceneData()).frames,settled,'No idle render loop after pointer settles');
 await view('character');await page.mouse.move(1000,470);await page.waitForTimeout(1350);await shot('electro-character-depth-motion-1440');
 const matrix=await page.locator('.hero-figure').evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return{a:m.a,b:m.b,c:m.c,d:m.d,x:m.m41,y:m.m42}});assert.deepEqual({a:matrix.a,b:matrix.b,c:matrix.c,d:matrix.d},{a:1,b:0,c:0,d:1});assert.ok(Math.abs(matrix.x)<=1.31&&Math.abs(matrix.y)<=.66);
 await view('cards');assert.deepEqual(await geometry(),boxes);
 checks.push('Electro depth motion changes background pixels rather than merely translating three flat layers; Character remains a rigid unchanged artwork layer, cards stay fixed, Still and settled pointer have no idle loop');
 for(const e of ELEMENTAL_DESIGNS){await theme(e.id);assert.equal((await sceneData()).renderer,'DEPTH');await page.mouse.move(1040,430);await page.waitForTimeout(1050);assert.ok((await sceneData()).frames>3)}
 checks.push('Shared bounded depth-motion path runs with every scene-specific depth map; all six support the same optional mode');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);const reducedFrames=(await sceneData()).frames;await page.mouse.move(950,520);await page.waitForTimeout(350);assert.equal((await sceneData()).frames,reducedFrames);assert.deepEqual(await page.locator('.hero-figure').evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return{a:m.a,b:m.b,c:m.c,d:m.d,x:m.m41,y:m.m42}}),{a:1,b:0,c:0,d:1,x:0,y:0});await shot('reduced-motion-1440');
 checks.push('Reduced-motion preference restores static presentation and disables pointer displacement while retaining painted depth');
 await page.locator('.elemental-reuse summary').click();await page.locator('[data-echo-theme]').selectOption({label:'Moonlit Clouds'});assert.equal(await page.locator('.elemental-reuse').getAttribute('open'),'');assert.equal(await page.locator('.echo-crop-preview').getAttribute('data-echo-background'),'neutral');
 await page.locator('[data-echo-theme]').selectOption({label:'Void Thunder'});assert.equal(await page.locator('.echo-crop-preview').getAttribute('data-echo-background'),'electro');await page.locator('[data-echo-theme]').selectOption({label:'Freezing Frost'});assert.equal(await page.locator('.echo-crop-preview').getAttribute('data-echo-background'),'glacio');await page.locator('.elemental-reuse').scrollIntoViewIfNeeded();await shot('compact-echo-source-association-1440');
 assert.deepEqual(await actualBuild(),baseline);await page.locator('.elemental-reuse summary').click();await page.evaluate(()=>scrollTo(0,0));
 checks.push('Compact Echo crop uses canonical reviewed set association: explicit Electro/Glacio work, Moonlit stays neutral; selection preserves open study and does not mutate Build or equipment');
 await page.locator('[data-hero-node=skill]').click();assert.match(await page.locator('.skill-selected').innerText(),/Warrior's Blade/);await page.locator('[data-hero-skills]').click();assert.equal(await page.locator('.skill-lines').isVisible(),true);await page.locator('[data-hero-skills]').click();
 await page.locator('[data-workspace="0"]').click();await page.locator('.editor-inline').waitFor();assert.match(await page.locator('.context-return').innerText(),/Augusta \/ Echo 1/);await page.locator('[data-cancel-editor].subtle-action').click();await page.locator('[data-return-build]').click();await ready();
 await page.locator('header [data-nav=inventory]').click();await page.locator('.collection').waitFor();await page.locator('header [data-nav=teams]').click();await page.locator('.saved-team').first().waitFor();await page.locator('[data-team-mode=endgame]').click();await page.locator('[data-example-plan]').click();assert.match(await page.locator('.planning-summary').innerText(),/42,800/);await page.locator('header [data-nav=build]').click();await ready();
 checks.push('Existing Skills, Echo Workspace, Inventory, Team and Endgame paths remain functional; no new editing/registration or gameplay implementation');
 for(const [width,height] of [[1920,1080],[2560,1440]]){await page.setViewportSize({width,height});await theme('electro');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const d=await sceneData();assert.ok(d.width<=1920&&d.height<=1080);await shot('electro-cards-'+width)}
 await page.setViewportSize({width:1440,height:900});await theme('electro');await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('[data-hero-variant=still]').click();await ready();
 checks.push('Desktop comparison retains layout at 1440×900 and wider sizes; raster dimensions remain bounded at 1920×1080 without DPR amplification');
 await page.locator('.elemental-canvas').evaluate(c=>c.getContext('webgl').getExtension('WEBGL_lose_context').loseContext());await page.waitForFunction(()=>document.querySelector('.elemental-stage').dataset.renderer==='STATIC');assert.equal(await page.locator('.elemental-canvas').isVisible(),false);assert.equal(await page.locator('[data-hero-variant=parallax]').isDisabled(),true);assert.equal(await page.locator('.elemental-fallback').evaluate(i=>i.complete&&i.naturalWidth>0),true);await shot('graphics-context-fallback-1440');
 checks.push('Actual graphics-context loss retires motion, preserves the valid static artwork and disables the unavailable mode');
 const preferences=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const r=await preferences.newPage();await r.route(url,route=>route.fulfill({contentType:'text/html',body:html}));await r.goto(url+'#build');await r.waitForSelector('.elemental-stage[data-renderer=DEPTH]');assert.match(await r.locator('.environment-readiness').innerText(),/Reduced motion/);await r.locator('[data-hero-variant=parallax]').click();await r.waitForSelector('.elemental-stage[data-renderer=DEPTH]');await r.mouse.move(1050,450);await r.waitForTimeout(400);assert.equal(await r.locator('.hero-figure').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).m41),0);await r.emulateMedia({reducedMotion:'no-preference'});await r.waitForFunction(()=>document.querySelector('.elemental-stage').dataset.motion==='depth');await r.mouse.move(980,490);await r.waitForTimeout(1300);assert.notEqual(await r.locator('.hero-figure').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).m41),0);await r.emulateMedia({reducedMotion:'reduce'});await r.waitForFunction(()=>document.querySelector('.elemental-stage').dataset.motion==='still');assert.equal(await r.locator('.hero-figure').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).m41),0);await preferences.close();
 checks.push('Independent reduced-motion browser context starts static; live opt-in enables actual motion and live reduction restores identity displacement');
 const fallback=await browser.newContext({viewport:{width:1440,height:900}});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'&&this.classList.contains('elemental-canvas'))return null;return original.call(this,type,...args)}});const f=await fallback.newPage();await f.route(url,r=>r.fulfill({contentType:'text/html',body:html}));await f.goto(url+'#build');await f.waitForSelector('.elemental-stage[data-renderer=STATIC]');assert.equal(await f.locator('[data-hero-variant=parallax]').isDisabled(),true);assert.equal(await f.locator('.hero-echo').count(),5);await fallback.close();
 checks.push('Browser without WebGL keeps six-scene static comparison and functional cards; no fabricated dimensional-motion readiness');
 assert.equal(await page.evaluate(()=>localStorage.getItem('bellibing-ui-checkpoint-v34')),'{"sentinel":"unchanged-account"}');assert.equal(await page.evaluate(()=>localStorage.getItem('bellibing-resource-policy')),'{"sentinel":"unchanged-resources"}');assert.deepEqual(errors,[]);assert.deepEqual(requests,[url]);
 checks.push('Account/resource sentinel bytes unchanged; exact portable document works offline with zero HTTP subresources, account/private APIs or page errors');
}catch(error){errors.push(error.message);await page.screenshot({path:resolve(out,'failure.jpg'),type:'jpeg',quality:92,fullPage:false});throw error}
finally{await writeFile(resolve(out,'review.json'),JSON.stringify({status:errors.length?'FAIL':'PASS',checks,errors,requests,scope:'Isolated elemental visual comparison only; artistic depth maps approximate, no full-body Character claim, production or owner visual approval. Native file:// is not certified.'},null,2));await browser.close()}
console.log('Elemental Chromium review PASS',checks.length);
