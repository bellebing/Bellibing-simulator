// Focused REVIEW of the single reference-informed Electro concept, not visual approval.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const out=resolve(process.env.LOGIN_REVIEW_OUT ?? '/tmp/bellibing-login-review');await mkdir(out,{recursive:true});
const html=await readFile(new URL('./preview.html',import.meta.url),'utf8');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:900}});
await context.addInitScript(()=>{localStorage.setItem('bellibing-ui-checkpoint-v34','account-sentinel');localStorage.setItem('bellibing-resource-policy','resource-sentinel');});
const page=await context.newPage(),url='http://127.0.0.1:4179/login-review',checks=[],errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
await page.route(url,r=>r.fulfill({contentType:'text/html',body:html}));
const openReference=async target=>{await target.locator('.hero-stage').waitFor();if(await target.locator('.selected-still-stage').count()){await target.locator('.selected-still-references summary').click();await target.locator('.selected-still-references [data-vista=login]').click();await target.evaluate(()=>scrollTo(0,0));}};
const ready=async()=>{await page.locator('.vista-stage[data-renderer]').waitFor();await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));};
const shot=async name=>{await ready();await page.screenshot({path:resolve(out,name+'.jpg'),type:'jpeg',quality:90});};
const stage=()=>page.locator('.vista-stage');
const geometry=()=>page.locator('.bellibing-card,.hero-echo').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}));
const settled=async()=>{let last=-1,stable=0;for(let i=0;i<40&&stable<3;i++){await page.waitForTimeout(150);const n=Number(await stage().getAttribute('data-frames'));stable=n===last?stable+1:0;last=n;}assert.equal(stable,3);return last;};
try{
await page.goto(url+'#build');await openReference(page);await ready();await context.setOffline(true);
assert.equal(await stage().getAttribute('data-vista'),'login');assert.equal(await page.locator('.vista-controls [data-vista]').count(),1);assert.equal(await page.locator('.hero-echo').count(),5);assert.equal(await page.locator('[data-vista-ambient]').count(),0);
const source=await page.locator('.subject-art-reference').getAttribute('src');assert.ok(source.startsWith('data:image/'));assert.ok((await page.locator('.hero-subject-area').boundingBox()).height>550);assert.match(await page.locator('.hero-subject-area').innerText(),/full-body rendering pending/);
const boxes=await geometry();
for(const [view,name] of [['background','background'],['character','hero-area'],['cards','cards']]){await page.locator('[data-scene-view='+view+']').click();await ready();assert.deepEqual(await geometry(),boxes);await shot(name+'-1440');}
checks.push('One primary Electro composition; authentic partial Character art, explicit full-height area and unfinished lower-body region; fixed functional cards across all three review views at 1440×900');
await page.locator('[data-hero-variant=parallax]').click();await ready();await page.mouse.move(1050,450);await settled();
const pose=await page.locator('.vista-anchor').evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return [m.a,m.b,m.c,m.d,m.m41,m.m42];});assert.deepEqual(pose.slice(0,4),[1,0,0,1]);assert.ok(Math.abs(pose[4])>.1&&Math.abs(pose[4])<3&&Math.abs(pose[5])<3);assert.deepEqual(await geometry(),boxes);await shot('depth-motion-1440');const frames=await settled();await page.waitForTimeout(350);assert.equal(Number(await stage().getAttribute('data-frames')),frames);
checks.push('Physical pointer exercises bounded rigid subject displacement through existing depth renderer; cards stay fixed and rendering settles without an idle animation loop');
await page.locator('.login-reference summary').click();assert.match(await page.locator('.login-reference a').first().getAttribute('href'),/tapimg/);assert.ok((await page.locator('.login-reference img').getAttribute('src')).startsWith('data:image/svg+xml;'));await page.locator('.login-reference summary').click();
await page.locator('.rejected-vistas summary').click();for(const id of ['coast','terrace']){await page.locator((id==='coast'?'.rejected-vistas ':'.vista-controls ')+'[data-vista='+id+']').click();await ready();assert.equal(await stage().getAttribute('data-vista'),id);assert.match(await page.locator('.vista-controls').innerText(),/rejected/i);}
await page.locator('.vista-controls [data-vista=login]').click();await ready();
await page.locator('.legacy-environments summary').click();await page.locator('.legacy-environments [data-environment=electro]').click();await page.waitForSelector('.elemental-stage[data-environment=electro][data-renderer]');await page.locator('.vista-return [data-vista=login]').click();await ready();await page.evaluate(()=>scrollTo(0,0));
checks.push('Linked original 3.5 reference and embedded original schematic; both rejected vistas and earlier Electro remain accessible, with return to the new primary study');
await page.locator('.hero-roster [data-character=jiyan]').click();await ready();assert.match(await page.locator('[data-hero-name]').innerText(),/Jiyan/);assert.notEqual(await page.locator('.subject-art-reference').getAttribute('src'),source);await page.locator('.hero-roster [data-character=augusta]').click();await ready();assert.equal(await page.locator('.subject-art-reference').getAttribute('src'),source);
await page.locator('[data-hero-node=skill]').click();assert.match(await page.locator('.skill-selected').innerText(),/Warrior's Blade/);
await page.locator('[data-workspace="0"]').click();await page.locator('.editor-inline').waitFor();await page.locator('[data-cancel-editor].subtle-action').click();await page.locator('[data-return-build]').click();await ready();
checks.push('Character selection retains actual existing art and selected environment; source-backed Skills and Echo Workspace return remain functional');
await page.locator('[data-hero-variant=still]').click();await ready();for(const [width,height]of [[1920,1080],[2560,1440]]){await page.setViewportSize({width,height});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shot('cards-'+width);}await page.setViewportSize({width:1440,height:900});
checks.push('Cards and larger subject area reviewed at 1920×1080 and 2560×1440 without horizontal overflow');
await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-hero-variant=parallax]').click();await ready();const rf=await settled();await page.mouse.move(1100,480);await page.waitForTimeout(350);assert.equal(Number(await stage().getAttribute('data-frames')),rf);assert.equal(await stage().getAttribute('data-ambient'),'off');assert.equal(await page.locator('.vista-anchor').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).m41),0);
await stage().locator('canvas').evaluate(c=>c.getContext('webgl').getExtension('WEBGL_lose_context').loseContext());await page.waitForSelector('.vista-stage[data-renderer=STATIC]');assert.ok(await stage().locator('.elemental-fallback').evaluate(i=>i.complete&&i.naturalWidth>0));await shot('static-fallback-1440');
const fallback=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='webgl'?null:original.call(this,kind,...args);};});const f=await fallback.newPage();await f.route(url,r=>r.fulfill({contentType:'text/html',body:html}));await f.goto(url+'#build');await openReference(f);await f.waitForSelector('.vista-stage[data-renderer=STATIC]');assert.equal(await f.locator('.hero-echo').count(),5);assert.ok((await f.locator('.hero-subject-area').boundingBox()).height>550);await fallback.close();
checks.push('Reduced motion suppresses pointer displacement; actual context loss and absent WebGL retain static Electro art, intended Hero area and functional cards');
assert.equal(await page.evaluate(()=>localStorage.getItem('bellibing-ui-checkpoint-v34')),'account-sentinel');assert.equal(await page.evaluate(()=>localStorage.getItem('bellibing-resource-policy')),'resource-sentinel');assert.deepEqual(requests,[url]);assert.deepEqual(errors,[]);
checks.push('Account/resource sentinels unchanged; exact portable HTML runs offline with zero HTTP subresources and no page errors');
}catch(e){errors.push(e.message);await page.screenshot({path:resolve(out,'failure.jpg')});throw e;}finally{await writeFile(resolve(out,'review.json'),JSON.stringify({status:errors.length?'FAIL':'PASS',checks,errors,requests,scope:'One original Electro visual study informed by the inspected 3.5 broadcast preview; approximate depth and partial authentic Character art. No finished full-body contact, owner approval, live-client inspection, production or FULL verification claim.'},null,2)+'\n');await browser.close();}
console.log('Electro login Chromium review PASS',checks.length);
