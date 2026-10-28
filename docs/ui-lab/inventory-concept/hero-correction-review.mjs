// Render the actual packaged delivery, not an approximation of its DOM/CSS.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadHeroPresentation } from './hero-presentation.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const file = process.env.CONCEPT_PORTABLE_HTML ?? '/workspace/shared/bellibing-hero-team-concept.html';
const out = resolve(process.env.HERO_REVIEW_OUT ?? '/tmp/bellibing-hero-correction/review');
await mkdir(out, { recursive: true });
const html = await readFile(file, 'utf8'), checks = [], errors = [], requests = [];
const source = await loadHeroPresentation();
const browser = await chromium.launch({ executablePath: process.env.UI_LAB_CHROME_PATH ?? '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light', reducedMotion: 'no-preference' });
const page = await context.newPage(), url = 'http://127.0.0.1:4176/packaged-correction';
page.on('pageerror', e => errors.push(e.message));
page.on('request', r => { if (/^https?:/.test(r.url()))
    requests.push(r.url()); });
await page.route(url, r => r.fulfill({ contentType: 'text/html', body: html }));
const ready = () => page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
const capture = async (name) => { await ready(); await page.screenshot({ path: resolve(out, name + '.png'), fullPage: true }); };
const rgba = s => s.match(/[\d.]+/g).map(Number);
try {
    await page.goto(url + '#build');
    await page.waitForSelector('.hero-workspace');
    await ready();
    await context.setOffline(true);
    assert.equal(await page.locator('link[rel=stylesheet]').count(), 0);
    assert.equal(await page.locator('style[data-concept-style]').count(), 2);
    for (const [tag, path] of [['base', 'concept.css'], ['hero', 'hero-team.css']])
        assert.equal(await page.locator(`style[data-concept-style="${tag}"]`).textContent(), await readFile(new URL(path, import.meta.url), 'utf8'));
    const backgrounds = await page.evaluate(() => ['html', 'body', '#app'].map(s => ({ selector: s, background: getComputedStyle(document.querySelector(s)).backgroundColor, color: getComputedStyle(document.querySelector(s)).color })));
    for (const b of backgrounds) {
        assert.ok(rgba(b.background).slice(0, 3).every(n => n < 30));
        assert.ok(rgba(b.color).slice(0, 3).every(n => n > 200));
    }
    await capture('delivery-still-1440');
    checks.push('Actual portable HTML: both exact styles embedded; opaque dark html/body/app and light text even with OS light preference; zero stylesheet dependencies');
    const geometry = await page.evaluate(() => { const box = s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; }; return { stage: box('.hero-stage'), workspace: box('.hero-workspace'), stats: box('.hero-stats'), skills: box('.hero-skills'), echo: box('.hero-echoes'), border: getComputedStyle(document.querySelector('.hero-stage')).borderWidth }; });
    assert.equal(geometry.stage.width, 1440);
    assert.equal(geometry.stage.x, 0);
    assert.equal(geometry.stage.width, geometry.workspace.width);
    assert.equal(geometry.border, '0px');
    assert.ok(geometry.stats.x > geometry.stage.x);
    assert.ok(geometry.echo.right < geometry.stage.right);
    assert.ok(geometry.skills.bottom < 861);
    assert.equal(await page.locator('.hero-info>.bellibing-card').count(), 3);
    assert.ok(await page.locator('.hero-stats').evaluate(e => { let r = e.getBoundingClientRect(); return document.elementFromPoint(r.x + 12, r.y + 12)?.closest('.hero-stats') === e; }));
    checks.push('One borderless full-workspace environment extends behind three independent left cards and all five right cards; functional cards sit above scene layers');
    for (const id of ['augusta', 'jiyan']) {
        await page.locator(`[data-character="${id}"]`).click();
        await ready();
        const expected = source.characters.find(c => c.characterId === id);
        const rendered = await page.locator('.forte-core>button').evaluateAll(nodes => nodes.map(b => ({ role: b.dataset.heroNode, name: b.querySelector('img').alt, level: b.querySelector('strong').textContent, embedded: b.querySelector('img').src.startsWith('data:') })));
        assert.equal(rendered.length, 5);
        for (const n of rendered) {
            assert.equal(n.name, expected.nodes.find(x => x.role === n.role).name);
            assert.equal(n.level, 'Lv. 10');
            assert.ok(n.embedded);
        }
        assert.equal(await page.locator('.forte-minor').count(), expected.nodes.filter(n => n.row > 0).length);
        await page.locator('[data-hero-node="skill"]').click();
        assert.match(await page.locator('.skill-selected').innerText(), new RegExp(id === 'augusta' ? "Warrior's Blade" : 'Windqueller'));
    }
    await page.locator('[data-character="augusta"]').click();
    await page.locator('[data-hero-node="circuit"]').click();
    await page.locator('[data-hero-skills]').click();
    await capture('delivery-source-skills-1440');
    assert.ok((await page.locator('.skill-lines').innerText()).includes(source.characters.find(c => c.characterId === 'augusta').nodes.find(n => n.role === 'circuit').description));
    await page.locator('[data-hero-skills]').click();
    checks.push('Augusta/Jiyan Skill names, icon identities, five source-defined levels and prerequisite branch nodes match existing canonical projection; source details are interactive, no invented mechanics');
    await page.locator('[data-hero-variant="parallax"]').click();
    await page.mouse.move(950, 530);
    await page.waitForTimeout(350);
    await capture('delivery-parallax-1440');
    assert.ok(await page.locator('.hero-stage').evaluate(e => Math.abs(Number(e.style.getPropertyValue('--mx'))) > 0));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.mouse.move(1000, 500);
    await page.waitForTimeout(220);
    assert.equal(await page.locator('.hero-stage').evaluate(e => Number(e.style.getPropertyValue('--mx'))), 0);
    assert.match(await page.locator('.stage-floor').evaluate(e => getComputedStyle(e).transform), /^matrix3d/);
    await capture('delivery-reduced-motion-1440');
    checks.push('Actual packaged Still/Parallax variants work offline; physical pointer and reduced-motion retain the same static room/perspective');
    for (const [width, height] of [[1920, 1080], [2560, 1440]]) {
        await page.setViewportSize({ width, height });
        await page.locator('[data-hero-variant="still"]').click();
        assert.equal(Math.round((await page.locator('.hero-stage').boundingBox()).width), width);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));
        await capture('delivery-still-' + width);
    }
    checks.push('Packaged desktop composition captured at 1440×900, 1920×1080 and 2560×1440 with full-width environment and no horizontal overflow');
    assert.match(await page.locator('.stage-caption').innerText(), /Full-body artwork pending/);
    assert.match(await page.locator('.hero-figure img').getAttribute('alt'), /upper-body/);
    checks.push('Full-body asset blocker remains explicitly visible; upper-body source is not mislabelled as a completed standing/full-body Hero');
    // Critical paint fallback survives a stylesheet-loss simulation. This does not claim all design works without CSS.
    await page.evaluate(() => [...document.querySelectorAll('style')].forEach(e => e.disabled = true));
    for (const s of ['html', 'body', '#app'])
        assert.equal(await page.locator(s).evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(12, 16, 21)');
    checks.push('Opaque inline critical backgrounds prevent a white canvas even if embedded stylesheets are unavailable; full appearance still requires browser CSS/script support');
    assert.deepEqual(errors, []);
    assert.deepEqual(requests, [url]);
}
catch (error) {
    errors.push(error.message);
    await page.screenshot({ path: resolve(out, 'correction-failure.png'), fullPage: true });
    throw error;
}
finally {
    await writeFile(resolve(out, 'correction-review.json'), JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', checks, errors, requests, scope: 'Packaged visual/behavior evidence only. Full-body artwork source-blocked; no owner visual acceptance or native file:// claim.' }, null, 2));
    await browser.close();
}
console.log('Packaged Hero correction PASS', checks.length);
