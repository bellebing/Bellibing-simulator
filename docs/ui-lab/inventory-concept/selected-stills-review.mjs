// Focused still-image REVIEW. No animation, depth-map generation or gameplay changes.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { SELECTED_STILLS, selectedStillPath } from './selected-stills.mjs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const out = resolve(process.env.SELECTED_STILLS_REVIEW_OUT ?? '/tmp/bellibing-selected-stills-review');
await mkdir(out, { recursive: true });
const here = new URL('./', import.meta.url);
const html = await readFile(new URL('./preview.html', here), 'utf8');
const manifest = JSON.parse(await readFile(new URL('./selected-stills/manifest.json', here), 'utf8'));
const checks = [], errors = [], requests = [];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
assert.deepEqual(manifest.elements.map(e => e.id), SELECTED_STILLS.map(e => e.id));
for (const e of manifest.elements) {
    const png = await readFile(new URL('./selected-stills/' + e.source, here));
    const webp = await readFile(new URL('./selected-stills/' + e.preview, here));
    assert.equal(sha(png), e.sourceSha256);
    assert.equal(sha(webp), e.previewSha256);
    assert.equal(selectedStillPath(e.id), 'selected-stills/' + e.preview);
}
checks.push('Six uniquely named selected PNGs and lossless preview derivatives match their manifest hashes and element mappings');

const browser = await chromium.launch({ executablePath: process.env.UI_LAB_CHROME_PATH ?? '/usr/bin/chromium', args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
    localStorage.setItem('bellibing-ui-checkpoint-v34', 'selected-stills-account-sentinel');
    localStorage.setItem('bellibing-resource-policy', 'selected-stills-resource-sentinel');
});
const page = await context.newPage(), url = 'http://127.0.0.1:4179/selected-stills-review';
page.on('pageerror', error => errors.push(error.message));
page.on('request', r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
await page.route(url, r => r.fulfill({ contentType: 'text/html', body: html }));
const ready = async () => {
    await page.locator('.selected-still-stage').waitFor();
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
};
const view = async mode => { await page.locator(`.selected-still-controls [data-scene-view="${mode}"]`).click(); await ready(); };
const choose = async id => { await page.locator(`.selected-still-controls [data-selected-still="${id}"]`).click(); await ready(); };
const snapshot = () => page.locator('.hero-stats,.hero-weapon,.hero-echoes,.hero-identity').allTextContents();
const geometry = () => page.locator('.bellibing-card,.hero-echo').evaluateAll(es => es.map(e => {
    const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height];
}));
const shot = async name => { await page.evaluate(() => scrollTo(0, 0)); await page.screenshot({ path: resolve(out, name + '.jpg'), type: 'jpeg', quality: 90 }); };
try {
    await page.goto(url + '#build'); await ready(); await context.setOffline(true);
    assert.equal(await page.locator('.selected-still-stage').getAttribute('data-selected-still'), 'electro');
    assert.equal(await page.locator('.selected-still-controls [data-selected-still]').count(), 6);
    const build = await snapshot(), boxes = await geometry();
    for (const e of manifest.elements) {
        await choose(e.id);
        assert.deepEqual(await snapshot(), build);
        assert.deepEqual(await geometry(), boxes);
        const image = page.locator('.selected-still-image');
        const actual = await image.evaluate(i => ({ width: i.naturalWidth, height: i.naturalHeight, fit: getComputedStyle(i).objectFit, transform: getComputedStyle(i).transform, src: i.src }));
        assert.equal(actual.width, e.width); assert.equal(actual.height, e.height);
        assert.equal(actual.fit, 'contain'); assert.equal(actual.transform, 'none');
        assert.equal(sha(Buffer.from(actual.src.split(',')[1], 'base64')), e.previewSha256);
        assert.equal(await page.locator('.selected-still-stage canvas').count(), 0);
        assert.equal(await page.locator('[data-hero-variant]').count(), 0);
        await shot(e.id + '-cards-1440');
        await view('background'); assert.equal(await page.locator('.hero-figure').isVisible(), false); await shot(e.id + '-background-1440');
        await view('character'); assert.equal(await page.locator('.hero-figure').isVisible(), true); assert.equal(await page.locator('.hero-info').isVisible(), false);
        await view('cards'); assert.deepEqual(await geometry(), boxes);
    }
    checks.push('All six actual embedded images match their intended hashes; full frame uses contain without zoom, and Background / Character / Cards preserve demo data and card geometry');
    const scene = page.locator('.selected-still-stage'), image = page.locator('.selected-still-image');
    const initial = await image.boundingBox();
    for (const [x, y] of [[.05,.05],[.95,.95],[.95,.05],[.05,.95]]) {
        const r = await scene.boundingBox(); await page.mouse.move(r.x + r.width * x, r.y + r.height * y);
    }
    await page.waitForTimeout(300);
    assert.deepEqual(await image.boundingBox(), initial);
    assert.equal(await scene.evaluate(e => e.getAnimations({subtree:true}).length), 0);
    assert.equal(await page.locator('.elemental-canvas').count(), 0);
    checks.push('Physical pointer leaves selected stills fixed; no depth renderer, canvas, motion control or running animation is introduced');

    await page.locator('.selected-still-references summary').click();
    await page.locator('.selected-still-references [data-vista="login"]').click();
    await page.waitForSelector('.vista-stage[data-vista="login"]');
    assert.equal(await page.locator('.vista-stage').getAttribute('data-hero-mode'), 'still');
    for (const id of ['coast', 'terrace']) {
        await page.locator('.rejected-vistas summary').click();
        await page.locator(`.rejected-vistas [data-vista="${id}"]`).click();
        await page.waitForSelector(`.vista-stage[data-vista="${id}"]`);
    }
    const returnSelected = async () => {
        await page.locator('.selected-still-gallery summary').click();
        await page.locator('.selected-still-gallery [data-selected-still="electro"]').click(); await ready();
    };
    await returnSelected();
    for (const e of SELECTED_STILLS) {
        await page.locator('.selected-still-references summary').click();
        await page.locator(`.selected-still-references [data-environment="${e.id}"]`).click();
        await page.waitForSelector(`.elemental-stage[data-environment="${e.id}"]`);
        const src = await page.locator('.elemental-stage>.elemental-fallback').getAttribute('src');
        assert.equal(sha(Buffer.from(src.split(',')[1], 'base64')), sha(await readFile(new URL('./elemental-art/' + e.id + '.webp', here))));
        await returnSelected();
    }
    checks.push('All six previous element studies and three previous compositions remain selectable; returning to the selected stills restores static mode');

    await page.locator('.hero-roster [data-character="jiyan"]').click(); await ready();
    assert.match(await page.locator('[data-hero-name]').innerText(), /Jiyan/);
    assert.equal(await scene.getAttribute('data-selected-still'), 'electro');
    await page.locator('[data-hero-node="skill"]').click();
    await page.locator('[data-workspace="0"]').click(); await page.locator('.editor-inline').waitFor();
    await page.locator('[data-cancel-editor].subtle-action').click();
    await page.locator('[data-return-build]').click(); await ready();
    await page.locator('header [data-nav="inventory"]').click(); await page.locator('.collection').waitFor();
    await page.locator('header [data-nav="build"]').click(); await ready();
    await page.locator('header [data-nav="teams"]').click(); await page.locator('.team-layout').waitFor();
    await page.locator('header [data-nav="build"]').click(); await ready();
    checks.push('Character selection, Skills, Echo Workspace return and connected Inventory / Teams navigation remain functional');

    for (const [width, height] of [[1920,1080],[2560,1440]]) {
        await page.setViewportSize({width,height}); await choose('electro');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await shot('electro-cards-' + width);
    }
    await page.emulateMedia({reducedMotion:'reduce'}); await choose('glacio');
    assert.equal(await page.locator('.selected-still-stage canvas').count(), 0);
    assert.equal(await page.evaluate(() => localStorage.getItem('bellibing-ui-checkpoint-v34')), 'selected-stills-account-sentinel');
    assert.equal(await page.evaluate(() => localStorage.getItem('bellibing-resource-policy')), 'selected-stills-resource-sentinel');
    assert.deepEqual(requests, [url]); assert.deepEqual(errors, []);
    checks.push('1920/2560 desktop layouts, reduced motion, untouched account/resource sentinels and offline portable operation without HTTP subresources');

    if (process.env.CONCEPT_REVIEW_URL) {
        const source = await browser.newPage({ viewport: {width:1440,height:900} });
        source.on('pageerror', e => errors.push(e.message));
        await source.goto(process.env.CONCEPT_REVIEW_URL + '/#build');
        await source.waitForSelector('.selected-still-stage');
        for (const e of SELECTED_STILLS) {
            await source.locator(`.selected-still-controls [data-selected-still="${e.id}"]`).click();
            await source.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
            assert.equal(await source.locator('.selected-still-stage').getAttribute('data-selected-still'), e.id);
        }
        const forbidden = await source.request.get(process.env.CONCEPT_REVIEW_URL + '/selected-stills/source/bellibing-bg-fusion-v01.png');
        assert.equal(forbidden.status(), 404);
        await source.close(); assert.deepEqual(errors, []);
        checks.push('Multi-file source preview serves all six allowlisted still derivatives; original PNGs are not exposed by the local server');
    }
} catch (error) {
    errors.push(error.message); await page.screenshot({path:resolve(out,'failure.jpg')}); throw error;
} finally {
    await writeFile(resolve(out,'review.json'), JSON.stringify({status:errors.length?'FAIL':'PASS',checks,errors,requests,scope:'Owner-selected still backgrounds only. No new parallax or animation, production gameplay, persistence or FULL qualification.'}, null, 2) + '\n');
    await browser.close();
}
console.log('Selected stills REVIEW PASS', checks.length);
