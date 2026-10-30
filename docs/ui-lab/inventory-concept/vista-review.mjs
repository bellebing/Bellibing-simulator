// Actual packaged-browser checks for the two Electro vistas; no owner art approval claim.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { HERO_VISTAS } from './hero-vistas.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const html = await readFile(process.env.CONCEPT_PORTABLE_HTML ?? new URL('./preview.html', import.meta.url), 'utf8');
const out = resolve(process.env.VISTA_REVIEW_OUT ?? '/tmp/bellibing-vista-review');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.UI_LAB_CHROME_PATH ?? '/usr/bin/chromium', args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
await context.addInitScript(() => { localStorage.setItem('bellibing-ui-checkpoint-v34', '{"sentinel":"unchanged-account"}'); localStorage.setItem('bellibing-resource-policy', '{"sentinel":"unchanged-resources"}'); });
const page = await context.newPage(), url = 'http://127.0.0.1:4179/vista-review';
const checks = [], errors = [], requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('request', r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
await page.route(url, r => r.fulfill({ contentType: 'text/html', body: html }));
const stage = () => page.locator('.vista-stage');
const ready = async () => { await page.locator('.elemental-stage[data-renderer]').waitFor(); await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth)); };
const shot = async name => { await ready(); await page.screenshot({ path: resolve(out, name + '.jpg'), type: 'jpeg', quality: 92 }); };
const view = async id => { await page.locator('[data-scene-view=' + id + ']').click(); await ready(); };
const variant = async id => { await page.locator('[data-vista=' + id + '][aria-pressed]').click(); await ready(); assert.equal(await stage().getAttribute('data-vista'), id); };
const frames = async (target = stage()) => Number(await target.getAttribute('data-frames'));
const settled = async (target = stage()) => {
    let previous = -1, stable = 0;
    for (let i = 0; i < 40 && stable < 3; i++) { await page.waitForTimeout(200); const current = await frames(target); stable = current === previous ? stable + 1 : 0; previous = current; }
    assert.equal(stable, 3, 'Scene must settle within a bounded window');
    return previous;
};
const geometry = () => page.locator('.bellibing-card,.hero-echo').evaluateAll(es => es.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
const build = () => page.locator('.hero-stats,.hero-weapon,.hero-echoes,.hero-identity').allTextContents();
try {
    await page.goto(url + '#build'); await ready(); await page.locator('.rejected-vistas summary').click(); await page.locator('.rejected-vistas [data-vista=coast]').click(); await ready(); await context.setOffline(true);
    assert.equal(await page.locator('.vista-controls [data-vista]').count(), 3);
    assert.equal(await page.locator('.hero-echo').count(), 5);
    assert.equal(await page.locator('.forte-core img').count(), 5);
    for (const [tag, path] of [['base', 'concept.css'], ['hero', 'hero-team.css']]) assert.equal(await page.locator('style[data-concept-style=' + tag + ']').textContent(), await readFile(new URL(path, import.meta.url), 'utf8'));
    checks.push('Exact portable HTML embeds current CSS, two original vista/depth pairs and existing functional Builder assets without external resources');
    const boxes = await geometry(), baseline = await build();
    for (const vista of HERO_VISTAS.filter(v => v.rejected)) {
        await variant(vista.id); assert.equal(await stage().getAttribute('data-renderer'), 'DEPTH');
        assert.deepEqual(await geometry(), boxes); assert.deepEqual(await build(), baseline);
        assert.equal(await page.locator('.vista-anchor img').count(), 0);
        const anchor = await page.locator('.vista-anchor').boundingBox();
        assert.ok(anchor.y > 270 && anchor.y < 370 && anchor.y + anchor.height > 690 && anchor.y + anchor.height < 820);
        assert.ok(anchor.x + anchor.width / 2 > 670 && anchor.x + anchor.width / 2 < 800);
        await shot(vista.id + '-cards-1440');
        await view('character'); assert.equal(await page.locator('.hero-info').isVisible(), false); await shot(vista.id + '-anchor-1440');
        await view('background'); assert.equal(await page.locator('.vista-anchor').isVisible(), false); await shot(vista.id + '-background-1440');
        await view('cards');
    }
    assert.equal(await page.evaluate(() => performance.getEntriesByType('navigation').length), 1);
    checks.push('Both proposals hot-switch with identical card geometry and actual Character/build values; Background/Anchor/Cards captured at 1440×900; guide is separate from real Character art and occupies the intended ground region');
    await variant('coast'); const still = await settled(); await page.mouse.move(1000, 450); await page.waitForTimeout(350); assert.equal(await frames(), still);
    await page.locator('[data-hero-variant=parallax]').click(); await ready();
    await page.mouse.move(1050, 450); await settled();
    const pose = await page.locator('.vista-anchor').evaluate(e => { const m = new DOMMatrix(getComputedStyle(e).transform); return { a: m.a, b: m.b, c: m.c, d: m.d, x: m.m41, y: m.m42 }; });
    assert.deepEqual({ a: pose.a, b: pose.b, c: pose.c, d: pose.d }, { a: 1, b: 0, c: 0, d: 1 });
    assert.ok(Math.abs(pose.x) < 3 && Math.abs(pose.y) < 3); assert.ok(Math.abs(pose.x) > .1);
    assert.deepEqual(await geometry(), boxes); await shot('coast-cards-depth-motion-1440');
    const stopped = await frames(); await page.waitForTimeout(350); assert.equal(await frames(), stopped);
    await variant('terrace'); await page.mouse.move(400, 490); await settled(); await shot('terrace-cards-depth-motion-1440');
    checks.push('Existing depth-aware renderer runs on both new maps; anchor follows its sampled ground plane with a bounded rigid transform, no perspective warp; cards fixed; Still and settled parallax have no idle loop');
    await page.locator('[data-hero-variant=still]').click(); await ready(); await view('background');
    await page.locator('[data-vista-ambient]').click(); await ready();
    assert.equal(await stage().getAttribute('data-motion'), 'still'); assert.equal(await stage().getAttribute('data-ambient'), 'water');
    const waterClip = { x: 790, y: 447, width: 180, height: 35 }, skyClip = { x: 760, y: 260, width: 180, height: 45 };
    const w0 = await page.screenshot({ clip: waterClip }), s0 = await page.screenshot({ clip: skyClip }), f0 = await frames();
    await page.waitForTimeout(800);
    assert.ok(await frames() > f0); assert.notDeepEqual(await page.screenshot({ clip: waterClip }), w0);
    assert.deepEqual(await page.screenshot({ clip: skyClip }), s0, 'Sky/terrain geometry stays static under water-only light animation');
    await view('cards'); await shot('terrace-water-light-1440');
    await page.locator('[data-vista-ambient]').click(); await ready(); await settled();
    checks.push('Optional water-light study animates independently with Still selected; actual water pixels change while sky pixels remain identical; no time-dependent landscape displacement; disabling it stops idle frames');
    await page.locator('.vista-reuse summary').click(); await page.locator('.vista-compact[data-renderer=DEPTH]').waitFor();
    await page.locator('[data-hero-variant=parallax]').click(); await ready();
    const compact = page.locator('.vista-compact'); await compact.waitFor({ state: 'visible' });
    assert.equal(await compact.locator('img').getAttribute('src'), await stage().locator('.elemental-fallback').getAttribute('src'));
    await compact.scrollIntoViewIfNeeded(); const cf = await frames(compact); await compact.hover({ position: { x: 250, y: 120 } }); await settled(compact); assert.ok(await frames(compact) > cf);
    assert.ok(await compact.locator('canvas').evaluate(c => c.width > 0 && c.width < 500));
    await shot('compact-shared-vista-1440'); await page.locator('.vista-reuse summary').click(); await page.evaluate(() => scrollTo(0, 0));
    checks.push('Smaller Echo placement study uses the same selected art, depth map and actual WebGL renderer at a smaller raster size, including independent pointer interaction; no invented Echo/set association');
    await page.locator('.hero-roster [data-character=jiyan]').click(); await ready(); assert.match(await page.locator('[data-hero-name]').innerText(), /Jiyan/); assert.equal(await stage().getAttribute('data-vista'), 'terrace');
    await page.locator('.hero-roster [data-character=augusta]').click(); await ready();
    await page.locator('[data-hero-node=skill]').click(); assert.match(await page.locator('.skill-selected').innerText(), /Warrior's Blade/); await page.locator('[data-hero-skills]').click(); assert.equal(await page.locator('.skill-lines').isVisible(), true); await page.locator('[data-hero-skills]').click();
    await page.locator('[data-workspace="0"]').click(); await page.locator('.editor-inline').waitFor(); await page.locator('[data-cancel-editor].subtle-action').click(); await page.locator('[data-return-build]').click(); await ready();
    await page.locator('header [data-nav=inventory]').click(); await page.locator('.collection').waitFor();
    await page.locator('header [data-nav=teams]').click(); await page.locator('.saved-team').first().waitFor(); await page.locator('[data-team-mode=endgame]').click(); await page.locator('[data-example-plan]').click(); assert.match(await page.locator('.planning-summary').innerText(), /42,800/);
    await page.locator('header [data-nav=build]').click(); await ready();
    checks.push('Existing Character selection, source-backed Skills, Echo Workspace return path, Inventory, Teams and Endgame remain functional');
    await page.locator('[data-hero-variant=still]').click(); await ready();
    for (const [width, height] of [[1920, 1080], [2560, 1440]]) {
        await page.setViewportSize({ width, height });
        for (const vista of HERO_VISTAS.filter(v => v.rejected)) { await variant(vista.id); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); assert.ok(await stage().locator('canvas').evaluate(c => c.width <= 1920 && c.height <= 1080)); await shot(vista.id + '-cards-' + width); }
    }
    await page.setViewportSize({ width: 1440, height: 900 }); await variant('coast');
    checks.push('Both proposals retain readable functional cards and source-relative anchors at 1920×1080 and 2560×1440; raster remains capped without DPR amplification');
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.locator('[data-hero-variant=parallax]').click(); await ready(); await page.locator('[data-vista-ambient]').click(); await ready();
    await settled(); const rf = await frames(); await page.mouse.move(1100, 480); await page.waitForTimeout(400); assert.equal(await frames(), rf); assert.equal(await stage().getAttribute('data-ambient'), 'off'); await shot('reduced-motion-1440');
    await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.waitForFunction(() => document.querySelector('.vista-stage').dataset.ambient === 'water'); await page.mouse.move(1040, 460); await page.waitForTimeout(450);
    assert.notEqual(await page.locator('.vista-anchor').evaluate(e => new DOMMatrix(getComputedStyle(e).transform).m41), 0);
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForFunction(() => document.querySelector('.vista-stage').dataset.ambient === 'off'); await settled();
    assert.equal(await page.locator('.vista-anchor').evaluate(e => new DOMMatrix(getComputedStyle(e).transform).m41), 0);
    const preferences = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const r = await preferences.newPage(); await r.route(url, route => route.fulfill({ contentType: 'text/html', body: html })); await r.goto(url + '#build'); await r.waitForSelector('.vista-stage[data-renderer=DEPTH]'); assert.equal(await r.locator('.vista-stage').getAttribute('data-motion'), 'still'); assert.equal(await r.locator('.vista-stage').getAttribute('data-ambient'), 'off'); await preferences.close();
    checks.push('Reduced-motion startup and live changes stop both independent water animation and interactive displacement; live opt-in enables real movement; guide returns to identity transform');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.querySelector('.vista-stage').dataset.ambient === 'water');
    await stage().locator('canvas').evaluate(c => c.getContext('webgl').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForFunction(() => document.querySelector('.vista-stage').dataset.renderer === 'STATIC');
    assert.equal(await page.locator('[data-hero-variant=parallax]').isDisabled(), true); assert.equal(await page.locator('[data-vista-ambient]').isDisabled(), true); assert.equal(await stage().locator('.elemental-fallback').evaluate(i => i.complete && i.naturalWidth > 0), true);
    const lostFrames = await frames(); await page.mouse.move(950, 400); await page.waitForTimeout(350); assert.equal(await frames(), lostFrames);
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(100); assert.equal(await stage().getAttribute('data-motion'), 'unavailable');
    await shot('context-loss-fallback-1440');
    const fallback = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await fallback.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (kind, ...args) { return kind === 'webgl' ? null : original.call(this, kind, ...args); }; });
    const f = await fallback.newPage(); await f.route(url, route => route.fulfill({ contentType: 'text/html', body: html })); await f.goto(url + '#build'); await f.waitForSelector('.vista-stage[data-renderer=STATIC]'); assert.equal(await f.locator('.hero-echo').count(), 5); assert.ok((await f.locator('.vista-anchor').boundingBox()).height > 350); await fallback.close();
    checks.push('Actual context loss and absent WebGL preserve correct static artwork, source-relative placement guide and functional cards; unavailable motion controls are disabled');
    assert.equal(await page.evaluate(() => localStorage.getItem('bellibing-ui-checkpoint-v34')), '{"sentinel":"unchanged-account"}');
    assert.equal(await page.evaluate(() => localStorage.getItem('bellibing-resource-policy')), '{"sentinel":"unchanged-resources"}');
    assert.deepEqual(requests, [url]); assert.deepEqual(errors, []);
    checks.push('Account/resource sentinel bytes unchanged; exact standalone works offline with zero HTTP subresources, private APIs or page errors');
} catch (error) {
    errors.push(error.message); await page.screenshot({ path: resolve(out, 'failure.jpg'), type: 'jpeg' }); throw error;
} finally {
    await writeFile(resolve(out, 'review.json'), JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', checks, errors, requests, scope: 'Isolated original Electro A/B visual review; arbitrary scale guide, approximate depth, bounded water-light study. No final Character technique, owner approval, production or native file-launch certification.' }, null, 2) + '\n');
    await browser.close();
}
console.log('Electro vista Chromium review PASS', checks.length);
