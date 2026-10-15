import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const output = resolve(process.env.UI_LAB_ARTIFACTS ?? resolve(root, 'artifacts/ui-lab-review'));
mkdirSync(output, { recursive: true });
const executablePath = process.env.UI_LAB_CHROME_PATH ?? ['/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
if (!executablePath) throw new Error('Set UI_LAB_CHROME_PATH to an installed Chromium/Chrome executable');
const errors = [];
const checks = [];
const result = {
  revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  workingTreeDirty: !!execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: root, encoding: 'utf8' }).trim(),
  chromium: null, checks, errors,
};
const approvedRevision = '46691a0c04380c10d2108964f7bae3141d8700ea';
const approvedFiles = new Map();
const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer((request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const before = pathname.startsWith('/__approved__/');
    if (before) pathname = pathname.slice('/__approved__'.length);
    const path = resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    if (!path.startsWith(root + '/')) { response.writeHead(403).end(); return; }
    let body;
    if (before && /\.(html|css|js)$/.test(path)) {
      const file = path.slice(root.length + 1);
      if (!approvedFiles.has(file)) approvedFiles.set(file, execFileSync('git', ['show', `${approvedRevision}:${file}`], { cwd: root, maxBuffer: 8 * 1024 * 1024 }));
      body = approvedFiles.get(file);
    } else body = readFileSync(path);
    response.writeHead(200, { 'Content-Type': contentTypes[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(body);
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolveReady => server.listen(0, '127.0.0.1', resolveReady));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
result.chromium = browser.version();
const selector = '/docs/ui-lab/v1.1/';
const wait = page => page.waitForFunction(() => document.documentElement.dataset.uiLabReady === 'true');
const selectedName = page => page.locator('.hero-copy h2').innerText();
const geometry = page => page.evaluate(() => Object.fromEntries(['.workshop', '.working-area', '.slots', '.trash-panel'].map(selector => {
  const { x, y, width, height } = document.querySelector(selector).getBoundingClientRect();
  return [selector, { x: x + scrollX, y: y + scrollY, width, height }];
})));
const settle = page => page.waitForTimeout(520);

async function checkLayout(page, width, label) {
  const data = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth, viewport: innerWidth,
    workshopWidth: document.querySelector('.workshop').clientWidth,
    slotRows: [...document.querySelectorAll('.slot')].map(slot => slot.querySelectorAll('.substat').length),
    brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.getAttribute('src')?.slice(0, 100)),
    font: [...document.fonts].map(font => ({ family: font.family, status: font.status })),
  }));
  assert.equal(data.pageWidth, width, `${label}: horizontal overflow`);
  assert.ok(data.workshopWidth >= 1000, `${label}: Workshop was squeezed`);
  assert.deepEqual(data.slotRows, [5, 5, 5, 5, 5], `${label}: hidden stat structure`);
  assert.deepEqual(data.brokenImages, [], `${label}: missing art`);
  // Verify labels against their sibling values, not just page overflow.
  const collisions = await page.evaluate(() => {
    const problems = [];
    for (const row of document.querySelectorAll('.main-stat,.secondary-stat,.substat')) {
      const label = row.firstElementChild.getBoundingClientRect();
      const value = row.lastElementChild.getBoundingClientRect();
      if (label.right > value.left + .5) problems.push(row.textContent);
    }
    for (const row of document.querySelectorAll('.character td:first-child')) {
      if (!row.getBoundingClientRect().height) continue;
      const range = document.createRange(); range.selectNodeContents(row);
      if (range.getClientRects().length !== 1 || row.scrollWidth > row.clientWidth) problems.push(row.textContent);
    }
    const title = document.querySelector('h1').getBoundingClientRect();
    const name = document.querySelector('.current-name').getBoundingClientRect();
    const filterEnd = document.querySelector('.expand-gallery').getBoundingClientRect();
    const notice = document.querySelector('.demo-note').getBoundingClientRect();
    if (title.right > name.left) problems.push('Page title / current Character');
    if (filterEnd.right > notice.left) problems.push('Character controls / demonstration disclosure');
    return problems;
  });
  assert.deepEqual(collisions, [], `${label}: stat label/value overlap or wrapped Character label`);
  checks.push({ label, width, ...data, collisions });
}

async function exercise(page, width, prefix) {
  await page.evaluate(() => scrollTo(0, 0));
  const originalGeometry = await geometry(page);
  const candidate = await page.locator('#newCard').innerHTML();
  await page.locator('#fullSet').focus();
  await page.keyboard.press('Space');
  assert.equal(await page.locator('#fullSet').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('[data-scope="slot"]').getAttribute('aria-pressed'), 'false');
  assert.equal(await page.locator('#newCard').innerHTML(), candidate, 'Scope must not fabricate results');
  const focusStyle = await page.locator('#fullSet').evaluate(node => getComputedStyle(node).outlineStyle);
  assert.equal(focusStyle, 'solid', 'Scope needs visible keyboard focus');
  const activeFill = await page.locator('#fullSet').evaluate(node => getComputedStyle(node).backgroundColor);
  await page.locator('[data-scope="slot"]').hover();
  const hoverFill = await page.locator('[data-scope="slot"]').evaluate(node => getComputedStyle(node).backgroundColor);
  assert.notEqual(activeFill, hoverFill, 'Active and hover scope states must differ');
  await page.locator('[data-scope="slot"]').click();
  assert.equal(await page.locator('[data-scope="slot"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('#consumption h3').innerText(), 'Materials Used');
  assert.equal(await page.locator('#materialRows .material-row').count(), 3);
  assert.equal(await page.locator('.settings h3', { hasText: 'Resources' }).innerText(), 'Resources');
  assert.equal(await page.locator('.selected-slot .slot-selection').innerText(), 'SELECTED');
  assert.equal(await page.locator('.selected-slot .slot-state').innerText(), 'ACTIVE');
  const originalStats = await page.locator('#characterStats').innerText();
  await page.locator('[data-person="iuno"]').hover();
  await settle(page);
  assert.equal(await selectedName(page), 'Augusta', 'Hover must never select');
  assert.equal(await page.locator('#focusedInfo .focus-name').innerText(), 'Iuno');
  assert.deepEqual(await geometry(page), originalGeometry, 'Carousel expansion shifted the Workshop');
  assert.equal(await page.locator('#characterStats').innerText(), originalStats);
  await page.screenshot({ path: resolve(output, `${prefix}-gallery-${width}.png`) });
  await page.locator('[data-person="iuno"]').click();
  assert.equal(await selectedName(page), 'Iuno', 'Click must select the real Lab workspace');
  assert.equal(await page.locator('#materialRows').innerText(), 'Not recorded');
  assert.equal(await page.locator('.slot .empty-echo').count(), 2);
  assert.match(await page.locator('#characterStats').innerText(), /1,940/);
  await page.locator('#settingsToggle').click();
  if (await page.locator('#settingsToggle').getAttribute('aria-expanded') !== 'true') await page.locator('#settingsToggle').click();
  await page.locator('.gate-options button', { hasText: '+15' }).click();
  await page.locator('[data-slot="2"]').click();
  assert.equal(await page.locator('#slotLabel').innerText(), '03');
  await page.locator('[data-person="augusta"]').click();
  assert.equal(await page.locator('#gateLabel').innerText(), '+5', 'Settings leaked between Characters');
  assert.equal(await page.locator('#slotLabel').innerText(), '01');
  await page.locator('[data-person="iuno"]').click();
  assert.equal(await page.locator('#gateLabel').innerText(), '+15', 'Session settings were lost on return');
  assert.equal(await page.locator('#slotLabel').innerText(), '03');
  await page.locator('[data-person="augusta"]').click();
  await page.locator('[data-filter="account"]').click();
  assert.equal(await page.locator('.portrait').count(), 6);
  assert.equal(await page.locator('[data-person="jinhsi"]').count(), 0);
  await page.locator('[data-filter="all"]').click();
  await page.locator('[data-person="jinhsi"]').hover();
  await settle(page);
  assert.match(await page.locator('.focus-meta').innerText(), /No saved demo build/);
  assert.deepEqual(await page.locator('.focus-stats strong').allInnerTexts(), ['—', '—', '—']);
  assert.equal(await selectedName(page), 'Augusta');
  await page.locator('[data-person="jinhsi"]').click();
  assert.equal(await selectedName(page), 'Jinhsi');
  assert.equal(await page.locator('.slot .empty-echo').count(), 5);
  await page.locator('[data-person="augusta"]').click();
  await page.locator('[data-person="augusta"]').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.focus-name').innerText(), 'Iuno');
  assert.equal(await selectedName(page), 'Augusta');
  await page.keyboard.press('Enter');
  assert.equal(await selectedName(page), 'Iuno');
  await page.locator('[data-person="augusta"]').click();
  await page.locator('[data-slot="3"]').click();
  assert.equal(await page.locator('#slotLabel').innerText(), '04');
  const workingBeforeHistory = await page.locator('.working-area').innerText();
  const statsBeforeHistory = await page.locator('#characterStats').innerText();
  await page.locator('[data-pile="0"]').click();
  await settle(page);
  assert.equal(await page.locator('#inspection').isVisible(), true);
  assert.match(await page.locator('#inspectedCard').innerText(), /DISCARDED/);
  assert.match(await page.locator('#inspectedCard').innerText(), /STOPPED AT \+15/);
  assert.equal(await page.locator('#inspectedCard .substat.empty').count(), 2);
  assert.equal(await page.locator('#checkpoints .checkpoint').count(), 3);
  await page.screenshot({ path: resolve(output, `${prefix}-history-${width}.png`) });
  await page.locator('#previousCard').click();
  assert.equal(await page.locator('#historyPosition').innerText(), '4 / 5');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#inspection').open);
  assert.equal(await page.locator('.is-lifted').count(), 0);
  assert.equal(await page.locator('.working-area').innerText(), workingBeforeHistory);
  assert.equal(await page.locator('#characterStats').innerText(), statsBeforeHistory);
  await page.locator('#characterToggle').click();
  if (await page.locator('#characterToggle').getAttribute('aria-expanded') !== 'true') await page.locator('#characterToggle').click();
  assert.equal(await page.locator('#characterToggle').getAttribute('aria-expanded'), 'true');
  await page.locator('#settingsToggle').click();
  if (await page.locator('#settingsToggle').getAttribute('aria-expanded') !== 'true') await page.locator('#settingsToggle').click();
  assert.equal(await page.locator('#settingsToggle').getAttribute('aria-expanded'), 'true');
  await page.locator('[data-slot="0"]').click();
  await page.locator('#simulate').click();
  assert.match(await page.locator('#toast').innerText(), /not connected/);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), [], 'Lab wrote persistent data');
  await checkLayout(page, width, `${prefix}: interactions complete`);
}

try {
  for (const width of [1440, 1920, 2560]) {
    const height = width === 1440 ? 900 : width === 1920 ? 1080 : 1440;
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}${selector}?settings=expanded`, { waitUntil: 'networkidle' });
    await wait(page);
    await page.evaluate(() => document.fonts.ready);
    await checkLayout(page, width, 'repository source');
    const current = await geometry(page);
    await page.screenshot({ path: resolve(output, `source-expanded-${width}.png`), fullPage: true });
    const baseline = await context.newPage();
    await baseline.goto(`${origin}/docs/ui-lab/v1/?settings=expanded`, { waitUntil: 'networkidle' });
    await baseline.evaluate(() => document.fonts.ready);
    const approved = await geometry(baseline);
    for (const selector of ['.workshop', '.working-area', '.slots']) {
      for (const key of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(current[selector][key] - approved[selector][key]) < 2, `${width}: approved ${selector} ${key} changed`);
    }
    checks.push({ label: 'V1 composition parity', width, approved, current });
    await baseline.close();
    if (width === 1920) {
      const before = await context.newPage();
      await before.goto(`${origin}/__approved__${selector}?settings=expanded`, { waitUntil: 'networkidle' });
      await wait(before); await before.evaluate(() => document.fonts.ready);
      const regions = { workshop: '.working-area', loadout: '.slots', settings: '#settings', character: '#character', trash: '.trash-panel' };
      for (const [name, selector] of Object.entries(regions)) {
        await before.locator(selector).screenshot({ path: resolve(output, `before-${name}-1920.png`) });
        await page.locator(selector).screenshot({ path: resolve(output, `after-${name}-1920.png`) });
      }
      checks.push({ label: 'Before/after captures', beforeRevision: approvedRevision, afterRevision: result.revision, workingTreeDirty: result.workingTreeDirty });
      await before.close();
    }
    await exercise(page, width, 'source');
    if (await page.locator('#characterToggle').getAttribute('aria-expanded') !== 'true') await page.locator('#characterToggle').click();
    await checkLayout(page, width, 'expanded Character Card');
    await page.waitForTimeout(3700); // Let the tested boundary toast dismiss before the review capture.
    await page.screenshot({ path: resolve(output, `source-character-${width}.png`), fullPage: true });
    await page.goto(`${origin}${selector}?compact=true`, { waitUntil: 'networkidle' });
    await wait(page);
    await checkLayout(page, width, 'compact panels');
    await page.screenshot({ path: resolve(output, `source-compact-${width}.png`), fullPage: true });
    if (width === 1920) {
      await page.locator('[data-person="augusta"]').focus();
      await page.keyboard.press('End');
      assert.equal(await selectedName(page), 'Augusta');
      await page.keyboard.press('Enter');
      assert.equal(await selectedName(page), 'Zhezhi', 'End must keep keyboard focus for selection');
      await page.keyboard.press('Home');
      await page.keyboard.press('Enter');
      assert.equal(await selectedName(page), 'Changli', 'Home must keep keyboard focus for selection');
      const seen = new Set();
      while (true) {
        for (const id of await page.locator('.portrait').evaluateAll(items => items.map(item => item.dataset.person))) seen.add(id);
        if (await page.locator('#portraitNext').isDisabled()) break;
        await page.locator('#portraitNext').click();
      }
      assert.equal(seen.size, 59, 'All Characters is not the complete released catalog');
      checks.push({ label: 'Full catalog reachable with paging', count: seen.size });
    }
    await context.close();
  }

  // Pointer behavior is also exercised with ordinary motion; reduced motion above
  // keeps geometry comparisons deterministic rather than skipping an end state.
  const animated = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const motionPage = await animated.newPage();
  await motionPage.goto(`${origin}${selector}?settings=expanded`, { waitUntil: 'networkidle' });
  await wait(motionPage);
  await exercise(motionPage, 1920, 'animated');
  await animated.close();

  const touch = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true, reducedMotion: 'reduce' });
  const touchPage = await touch.newPage();
  await touchPage.goto(`${origin}${selector}`, { waitUntil: 'networkidle' });
  await wait(touchPage);
  await touchPage.locator('[data-person="iuno"]').tap();
  assert.equal(await selectedName(touchPage), 'Augusta', 'First touch must preview');
  await touchPage.locator('[data-person="iuno"]').tap();
  assert.equal(await selectedName(touchPage), 'Iuno', 'Second touch must select');
  checks.push({ label: 'Desktop touch-pointer preview then selection', passed: true });
  await touch.close();

  const portable = readFileSync(resolve(output, 'Bellibing-UI-Lab-V1.1.html'), 'utf8');
  for (const width of [1440, 1920, 2560]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 900 : width === 1920 ? 1080 : 1440 }, offline: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const network = [];
    page.on('request', request => { if (/^https?:/.test(request.url())) network.push(request.url()); });
    page.on('pageerror', error => errors.push(error.message));
    // Opaque-origin document import exercises the self-contained file without a
    // server or file-origin privileges. This executor administratively blocks
    // browser file:// navigation; no such permission is needed by the artifact.
    await page.setContent(portable, { waitUntil: 'load' });
    await wait(page);
    await page.evaluate(() => document.fonts.ready);
    await checkLayout(page, width, 'portable HTML with networking disabled');
    await page.locator('[data-person="iuno"]').click();
    assert.equal(await selectedName(page), 'Iuno');
    await page.locator('[data-person="augusta"]').click();
    await page.locator('[data-pile="0"]').click();
    assert.match(await page.locator('#inspectedCard').innerText(), /DISCARDED/);
    await page.locator('#closeInspection').click();
    assert.deepEqual(network, [], 'Portable artifact attempted a network request');
    checks.push({ label: 'Portable HTML offline interactive; zero HTTP requests', width, passed: true });
    await page.screenshot({ path: resolve(output, `portable-${width}.png`), fullPage: true });
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(`UI Lab Chromium review passed: ${checks.length} checks; source ${result.revision}; dirty=${result.workingTreeDirty}`);
} finally {
  writeFileSync(resolve(output, 'verification.json'), JSON.stringify(result, null, 2) + '\n');
  await browser.close();
  await new Promise(resolveClosed => server.close(resolveClosed));
}
