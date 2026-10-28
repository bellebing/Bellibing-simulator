// Test the generated single HTML document through permitted HTTP, then offline.
// Native file:// launch remains blocked by managed Chromium policy.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const file = process.env.CONCEPT_PORTABLE_HTML ?? '/workspace/shared/bellibing-hero-team-concept.html';
const out = resolve(process.env.HERO_REVIEW_OUT ?? '/tmp/bellibing-hero-team-review');
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.UI_LAB_CHROME_PATH ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage(), requests = [], errors = [], url = 'http://127.0.0.1:4177/portable-review';
page.on('request', r => {
    if (/^https?:/.test(r.url()))
        requests.push(r.url());
});
page.on('pageerror', e => errors.push(e.message));
await page.route(url, async (route) => route.fulfill({ status: 200, contentType: 'text/html', body: await readFile(file, 'utf8') }));
const checks = [];
try {
    await page.goto(url + '#build');
    await page.waitForSelector('.hero-stage');
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
    await context.setOffline(true);
    assert.equal(await page.locator('.hero-echo').count(), 5);
    await page.locator('[data-hero-variant="parallax"]').click();
    await page.locator('[data-character="jiyan"]').click();
    await page.waitForFunction(() => document.querySelector('.hero-figure img').complete && document.querySelector('.hero-figure img').naturalWidth > 0);
    assert.match(await page.locator('[data-hero-name]').innerText(), /Jiyan/);
    checks.push('Portable document embeds reviewed Hero/portrait images, both styles and modules; Character/variant switching works offline');
    await page.locator('header [data-nav="inventory"]').click();
    await page.locator('[data-item="e7"]').click();
    await page.locator('[data-start-equip]').click();
    await page.locator('[data-confirm-equip]').click();
    assert.match(await page.locator('[data-item="e7"]').innerText(), /Jiyan/);
    await page.locator('[data-view-owner]').click();
    await page.waitForSelector('.hero-stage');
    checks.push('Shared Inventory/equip/return-to-Hero flow works in the portable document');
    await page.locator('header [data-nav="teams"]').click();
    await page.waitForSelector('.saved-team');
    await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
    await page.locator('[data-team-mode="endgame"]').click();
    await page.locator('[data-example-plan]').click();
    assert.match(await page.locator('.planning-summary').innerText(), /42,800/);
    await page.locator('[data-endgame-mode="tower"]').click();
    assert.match(await page.locator('.planning-summary').innerText(), /Vigor validation pending/);
    checks.push('My Teams, Matrix example allocation and Tower pending state work offline without a calculator');
    assert.deepEqual(requests, [url]);
    assert.deepEqual(errors, []);
    checks.push('Only the initial HTML document is requested; zero HTTP subresources, external requests or page errors');
    await page.screenshot({ path: resolve(out, 'portable-offline-1440.png'), fullPage: true });
    console.log('Portable Hero & Team Chromium PASS');
}
catch (error) {
    errors.push(error.message);
    throw error;
}
finally {
    await writeFile(resolve(out, 'portable-review.json'), JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', checks, errors, requests, fileLaunch: 'Not tested: managed browser blocks native file://; same HTML rendered via permitted HTTP and then offline.' }, null, 2));
    await browser.close();
}
