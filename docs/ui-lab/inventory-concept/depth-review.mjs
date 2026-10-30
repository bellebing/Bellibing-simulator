// Focused visual-method acceptance evidence on the actual standalone delivery.
// Structural checks do not certify subjective depth, Character art or gameplay.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const file=process.env.CONCEPT_PORTABLE_HTML??'/workspace/shared/bellibing-hero-team-concept.html';
const out=resolve(process.env.HERO_REVIEW_OUT??'/tmp/bellibing-depth-study/review');await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.UI_LAB_CHROME_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
await context.addInitScript(()=>{localStorage.setItem('bellibing-ui-checkpoint-v34','unchanged-account');localStorage.setItem('bellibing-resource-policy','unchanged-resources')});
const page=await context.newPage(),errors=[],requests=[],checks=[],url='http://127.0.0.1:4177/depth-review';
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
await page.route(url,async r=>r.fulfill({contentType:'text/html',body:await readFile(file,'utf8')}));
const ready=()=>page.waitForFunction(()=>[...document.images].every(e=>e.complete&&e.naturalWidth>0));
const shot=async n=>{await ready();await page.screenshot({path:resolve(out,n+'.png'),fullPage:true})};
const transform=s=>page.locator(s).evaluate(e=>{const m=new DOMMatrix(getComputedStyle(e).transform);return{x:m.m41,y:m.m42,a:m.a,b:m.b,c:m.c,d:m.d}});
try{
 await page.goto(url+'#build');await page.waitForSelector('.rendered-room');await ready();await context.setOffline(true);
 assert.equal(await page.locator('.stage-floor,.stage-column,.arch-ring,.distant-door').count(),0);
 for(const s of ['.rendered-room','.rendered-subject','.rendered-foreground'])assert.deepEqual(await page.locator(s).evaluate(e=>({w:e.naturalWidth,h:e.naturalHeight,embedded:e.src.startsWith('data:')})),{w:1440,h:810,embedded:true});
 assert.match(await page.locator('.hero-identity').innerText(),/ORIGINAL FIGURE · NOT CHARACTER ART/);assert.equal(await page.locator('.hero-figure').isVisible(),false);assert.equal(await page.locator('.identity-tags').innerText(),'Augusta example cards');
 checks.push('Three embedded camera-matched 3D renders replace CSS geometry; original stand-in is explicitly not Character art and receives no Character level/Sequence identity');
 await shot('rendered-cards-still-1440');
 const layout=await page.locator('.hero-stage').boundingBox();await page.locator('[data-hero-cards]').click();assert.equal(await page.locator('.hero-info').isVisible(),false);assert.deepEqual(await page.locator('.hero-stage').boundingBox(),layout);await shot('rendered-scene-still-1440');
 await page.mouse.move(1100,530);await page.waitForTimeout(150);assert.equal((await transform('.rendered-subject')).x,0);
 checks.push('Still study and actual-card variant share an unchanged scene crop; Still has no pointer displacement');
 await page.locator('[data-hero-cards]').click();
 const cards=await page.locator('.bellibing-card,.hero-echo').evaluateAll(es=>es.map(e=>{let r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}}));
 const sources=await page.locator('.environment-layer').evaluateAll(es=>es.map(e=>e.src));
 await page.locator('[data-hero-variant=parallax]').click();await page.mouse.move(1180,530);await page.waitForTimeout(1300);
 const near=await transform('.rendered-foreground'),subject=await transform('.rendered-subject'),far=await transform('.rendered-room');
 assert.ok(subject.x>.5&&subject.x<=2.01);assert.ok(near.x>subject.x&&near.x<=6.01);assert.ok(subject.x*far.x<0);
 assert.deepEqual(await page.locator('.bellibing-card,.hero-echo').evaluateAll(es=>es.map(e=>{let r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})),cards);
 assert.deepEqual(await page.locator('.environment-layer').evaluateAll(es=>es.map(e=>e.src)),sources);
 assert.deepEqual({a:subject.a,b:subject.b,c:subject.c,d:subject.d},{a:1,b:0,c:0,d:1});await shot('rendered-cards-parallax-1440');
 await page.locator('[data-hero-cards]').click();await page.mouse.move(1180,530);await page.waitForTimeout(1300);await shot('rendered-scene-parallax-1440');
 checks.push('Physical pointer moves room, subject/support and foreground in bounded different depths; rigid image translation has no face/body warp; all actual cards remain pixel-stable');
 await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(1000,400);assert.equal((await transform('.rendered-subject')).x,0);assert.equal((await transform('.rendered-room')).x,0);assert.deepEqual(await page.locator('.environment-layer').evaluateAll(es=>es.map(e=>e.src)),sources);await shot('rendered-reduced-motion-1440');
 checks.push('Reduced motion immediately disables displacement while keeping the same rendered perspective, light, support and shadows');
 await page.locator('[data-hero-cards]').click();await page.locator('[data-hero-subject=character]').click();assert.equal(await page.locator('.rendered-subject').isVisible(),false);assert.equal(await page.locator('.hero-figure').isVisible(),true);assert.equal(await page.locator('[data-hero-name]').innerText(),'Augusta');assert.match(await page.locator('.scene-study-controls').innerText(),/full-body artwork pending/);await shot('rendered-augusta-source-limit-1440');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.mouse.move(1050,450);await page.waitForTimeout(1300);const actual=await transform('.hero-figure');assert.deepEqual({a:actual.a,b:actual.b,c:actual.c,d:actual.d},{a:1,b:0,c:0,d:1});
 assert.equal(await page.locator('.forte-core img').count(),5);await page.locator('[data-hero-node=skill]').click();assert.match(await page.locator('.skill-selected').innerText(),/Warrior's Blade/);await page.locator('[data-hero-skills]').click();assert.equal(await page.locator('.skill-lines').isVisible(),true);
 checks.push('Actual Augusta art is an unchanged, rigid upper-body source with explicit full-body blocker; real Skill identities/icons/details remain available');
 for(const [width,height] of [[1920,1080],[2560,1440]]){await page.setViewportSize({width,height});await page.locator('[data-hero-subject=study]').click();await page.locator('[data-hero-variant=still]').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(Math.round((await page.locator('.hero-stage').boundingBox()).width),width);await shot('rendered-cards-'+width)}
 await page.setViewportSize({width:1440,height:900});
 for(const selector of ['[data-hero-cards]','[data-hero-subject=study]','[data-hero-subject=character]']){let r=await page.locator(selector).boundingBox();assert.ok(r.y>80&&r.y+r.height<861)}
 checks.push('1440×900 and two wider desktop crops stay full-width without overflow; study controls stay clear of the footer and figure support');
 await page.locator('header [data-nav=inventory]').click();await page.waitForSelector('.collection');await page.locator('header [data-nav=teams]').click();await page.waitForSelector('.saved-team');await page.locator('[data-team-mode=endgame]').click();await page.locator('[data-example-plan]').click();assert.match(await page.locator('.planning-summary').innerText(),/42,800/);await page.locator('header [data-nav=build]').click();await page.waitForSelector('.rendered-room');
 assert.equal(await page.evaluate(()=>localStorage.getItem('bellibing-ui-checkpoint-v34')),'unchanged-account');assert.equal(await page.evaluate(()=>localStorage.getItem('bellibing-resource-policy')),'unchanged-resources');
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[url]);
 checks.push('Inventory/Teams/Endgame remain reachable offline; account/resource sentinel bytes unchanged; no external images, private APIs, evaluator or runtime 3D engine requested');
}catch(error){errors.push(error.message);await page.screenshot({path:resolve(out,'depth-failure.png'),fullPage:true});throw error}
finally{await writeFile(resolve(out,'depth-review.json'),JSON.stringify({status:errors.length?'FAIL':'PASS',checks,errors,requests,scope:'Original rendered environment technique study. User references visually inspected but not reused. Full-body Character integration and subjective visual acceptance remain pending. Native file:// not certified.'},null,2));await browser.close()}
console.log('Rendered Hero depth study PASS',checks.length);
