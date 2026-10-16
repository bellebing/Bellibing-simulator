import { reviewResources } from './review-resources.mjs';
import { reviewSettings } from './review-settings.mjs';
import { reviewResults } from './review-results.mjs';
import { reviewHero } from './review-hero.mjs';
import { reviewCharacterCard } from './review-character-card.mjs';
import assert from 'node:assert/strict';
import { reviewCarousel } from './review-carousel.mjs';
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
const approvedRevision = '66d72f339e3c1aa363a1794ff243128d63bc3f28';
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
  assert.ok(await page.evaluate(() => { const track = document.querySelector('#portraits').getBoundingClientRect(), workshop = document.querySelector('.workshop').getBoundingClientRect(); return Math.abs(track.x + track.width / 2 - workshop.x - workshop.width / 2) < 1; }), `${label}: compact portrait collection is not centered on Workshop`);
  assert.deepEqual(data.slotRows, [5, 5, 5, 5, 5], `${label}: hidden stat structure`);
  assert.ok(await page.locator('.echo-card .substats').evaluateAll(groups => groups.every(group => group.children.length === 5)), `${label}: every card variant needs five rows`);
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
    if (title.right > name.left && title.top < name.bottom && name.top < title.bottom) problems.push('Page title / current Character');

    return problems;
  });
  assert.deepEqual(collisions, [], `${label}: stat label/value overlap or wrapped Character label`);
  checks.push({ label, width, ...data, collisions });
}

async function carouselSettled(page, id) {
  await page.waitForFunction(expected => {
    const carousel = document.querySelector('#characterCarousel');
    return carousel.dataset.motion === 'settled' && (!expected || carousel.dataset.focusedCharacter === expected);
  }, id);
}
async function browseCharacter(page, id) {
  if (await page.locator('#openGallery').getAttribute('aria-expanded') !== 'true') await page.locator('.portrait[tabindex="0"]').click();
  const index = await page.locator('.portrait').evaluateAll((buttons, id) => buttons.findIndex(button => button.dataset.person === id), id);
  assert.ok(index >= 0, `Character ${id} is in the active filter`);
  await page.locator('#galleryArt').focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < index; i++) await page.keyboard.press('ArrowRight');
  await carouselSettled(page, id);
}
async function selectCharacter(page, id) {
  await browseCharacter(page, id);
  await page.locator(`[data-art="${id}"]`).click();
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
  const activeFill = await page.locator('#fullSet').evaluate(node => getComputedStyle(node).backgroundImage);
  await page.locator('[data-scope="slot"]').hover();
  const hoverFill = await page.locator('[data-scope="slot"]').evaluate(node => getComputedStyle(node).backgroundImage);
  assert.notEqual(activeFill, hoverFill, 'Active and hover scope states must differ');
  await page.locator('[data-scope="slot"]').click();
  assert.equal(await page.locator('[data-scope="slot"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('#consumption').isVisible(), false, 'Ready must omit unused materials');
  assert.equal(await page.locator('#materialRows .material-row').count(), 0);
  assert.equal(await page.locator('.settings h3', { hasText: 'Resources' }).innerText(), 'Resources');
  assert.equal(await page.locator('#slots .slot-number[aria-hidden="true"]').count(), 5, 'Preserve approved card spacing with silent headers');
  assert.equal(await page.locator('#slots .slot-number > *').count(), 0, 'No visible numbers or passive status labels');
  assert.equal(await page.locator('#slots .selected-slot[aria-pressed="true"]').count(), 1, 'Selected slot remains accessible');
  assert.match(await page.locator('#slots .selected-slot').getAttribute('aria-label'), /^Select Echo slot 1(?:,|$)/);
  const originalStats = await page.locator('#characterStats').innerText();
  await page.locator('[data-person="iuno"]').hover();
  await page.locator('[data-person="iuno"]').click();
  await carouselSettled(page, 'iuno');
  await settle(page);
  assert.equal(await selectedName(page), 'Augusta', 'Hover must never select');
  assert.equal(await page.locator('#focusedInfo .focus-name').innerText(), 'Iuno');
  assert.equal((await geometry(page))['.workshop'].y, originalGeometry['.workshop'].y + 482, 'Gallery must occupy layout space');
  assert.equal(await page.locator('#characterStats').innerText(), originalStats);
  await selectCharacter(page, 'iuno');
  assert.equal(await selectedName(page), 'Iuno', 'Click must select the real Lab workspace');
  assert.equal(await page.locator('#consumption').isVisible(), false);
  assert.equal(await page.locator('.slot .empty-echo').count(), 2);
  assert.match(await page.locator('#characterStats').innerText(), /1,940/);
  await page.locator('#settingsToggle').click();
  if (await page.locator('#settingsToggle').getAttribute('aria-expanded') !== 'true') await page.locator('#settingsToggle').click();
  await page.locator('.gate-options button', { hasText: '+15' }).click();
  await page.locator('[data-slot="2"]').click();
  assert.equal(await page.locator('#slotLabel').innerText(), '03');
  await selectCharacter(page, 'augusta');
  assert.equal(await page.locator('#gateLabel').innerText(), '+5', 'Settings leaked between Characters');
  assert.equal(await page.locator('#slotLabel').innerText(), '01');
  await selectCharacter(page, 'iuno');
  assert.equal(await page.locator('#gateLabel').innerText(), '+15', 'Session settings were lost on return');
  assert.equal(await page.locator('#slotLabel').innerText(), '03');
  await selectCharacter(page, 'augusta');
  await browseCharacter(page, 'augusta');
  await page.locator('[data-filter="account"]').click();
  assert.equal(await page.locator('.portrait').count(), 6);
  assert.equal(await page.locator('[data-person="jinhsi"]').count(), 0);
  await page.locator('[data-filter="all"]').click();
  await browseCharacter(page, 'jinhsi');
  await settle(page);
  assert.match(await page.locator('.focus-meta').innerText(), /No saved demo build/);
  assert.deepEqual(await page.locator('.focus-stats strong').allInnerTexts(), ['—', '—', '—']);
  assert.equal(await selectedName(page), 'Augusta');
  await selectCharacter(page, 'jinhsi');
  assert.equal(await selectedName(page), 'Jinhsi');
  assert.equal(await page.locator('.slot .empty-echo').count(), 5);
  await selectCharacter(page, 'augusta');
  await page.locator('[data-person="augusta"]').focus();
  await page.keyboard.press('ArrowRight');
  await carouselSettled(page, 'iuno');
  assert.equal(await page.locator('.focus-name').innerText(), 'Iuno');
  assert.equal(await selectedName(page), 'Augusta');
  await page.keyboard.press('Enter');
  assert.equal(await selectedName(page), 'Iuno');
  await selectCharacter(page, 'augusta');
  await page.locator('[data-slot="3"]').click();
  assert.equal(await page.locator('#slotLabel').innerText(), '04');
  const workingBeforeHistory = await page.locator('.working-area').innerText();
  const statsBeforeHistory = await page.locator('#characterStats').innerText();
  await page.locator('[data-pile="0"]').click();
  await settle(page);
  assert.equal(await page.locator('#inspection').isVisible(), true);
  assert.match(await page.locator('#inspectedCard').innerText(), /DISCARDED/);
  assert.match(await page.locator('#inspectedCard').innerText(), /DISCARDED AT \+15/);
  assert.equal(await page.locator('#inspectedCard .substat.empty').count(), 2);
  assert.equal(await page.locator('#checkpoints .checkpoint').count(), 3);
  const inspectionSizes = await page.locator('#inspectedCard').evaluate(node => ['.main-stat strong', '.secondary-stat', '.substat'].map(selector => parseFloat(getComputedStyle(node.querySelector(selector)).fontSize)));
  assert.ok(inspectionSizes[0] > inspectionSizes[1] && inspectionSizes[1] > inspectionSizes[2]);
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
  const workingCard = await page.locator('#currentCard').innerHTML();
  const candidateCard = await page.locator('#newCard').innerHTML();
  const comparison = await page.locator('#characterStats').innerText();
  await page.locator('#simulate').click();
  assert.equal(await page.locator('#currentCard').innerHTML(), workingCard);
  assert.equal(await page.locator('#newCard').innerHTML(), candidateCard);
  assert.equal(await page.locator('#characterStats').innerText(), comparison);
  assert.equal(await page.locator('#consumption h3').innerText(), 'Materials Used');
  assert.equal(await page.locator('#materialRows .material-row').count(), 3);
  assert.match(await page.locator('#toast').innerText(), /not connected/);
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), [], 'Lab wrote persistent data');
  await checkLayout(page, width, `${prefix}: interactions complete`);
}

async function chooseScenario(page, value) {
  if (!await page.locator('.demo-note').evaluate(node => node.open)) await page.locator('.demo-note summary').click();
  await page.locator('#reviewScenario').selectOption(value);
  await page.locator('.demo-note summary').click();
}

async function exerciseFeedback(page, width, prefix) {
  await page.locator('#reset').click();
  await page.evaluate(() => scrollTo(0, 0));
  const stable = await geometry(page);
  const buttonBounds = () => page.locator('#simulate').evaluate(node => { const r = node.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; });
  const actionPosition = await buttonBounds();
  async function captureState(name) {
    await settle(page); // Measure after existing button-hover and layout transitions.
    assert.deepEqual(await buttonBounds(), actionPosition, `${name}: primary action moved`);
    assert.deepEqual(await geometry(page), stable, `${name}: Workshop/slots resized`);
    await checkLayout(page, width, `${prefix}: ${name}`);
  }
  assert.equal(await page.locator('#feedbackTitle').innerText(), 'Ready to Simulate');
  assert.equal(await page.locator('#consumption').isVisible(), false);
  assert.equal(await page.locator('.sonata-count').count(), 2);
  assert.deepEqual(await page.locator('.sonata-count').allInnerTexts(), ['×3', '×2']);
  assert.equal(await page.locator('#simulate').isEnabled(), true);
  await captureState('ready');
  for (const group of ['.mode-switch', '.setting-mode', '.interaction-options']) {
    const selected = page.locator(`${group} button.selected`);
    assert.equal(await selected.getAttribute('aria-pressed'), 'true');
    assert.match(await selected.evaluate(node => getComputedStyle(node).backgroundImage), /linear-gradient/);
  }
  await page.locator('.mode-switch button', { hasText: 'Current' }).click();
  assert.match(await page.locator('#toast').innerText(), /isolated Simulate fixtures/);
  assert.equal(await page.locator('.mode-switch .selected').innerText(), 'Simulate');
  const settingsWasExpanded = await page.locator('#settingsToggle').getAttribute('aria-expanded') === 'true';
  const characterWasExpanded = await page.locator('#characterToggle').getAttribute('aria-expanded') === 'true';
  if (!settingsWasExpanded) await page.locator('#settingsToggle').click();
  await page.locator('.setting-mode button', { hasText: 'Customize' }).click();
  assert.equal(await page.locator('.setting-mode .selected').innerText(), 'Customize');
  await page.locator('.setting-mode button', { hasText: 'Recommended' }).click();
  if (!settingsWasExpanded) await page.locator('#settingsToggle').click();
  if (characterWasExpanded && await page.locator('#characterToggle').getAttribute('aria-expanded') !== 'true') await page.locator('#characterToggle').click();
  await chooseScenario(page, 'warning');
  assert.equal(await page.locator('#feedbackTitle').innerText(), 'Sonata Target Not Met');
  assert.equal(await page.locator('#simulate').isEnabled(), true);
  assert.equal(await page.locator('#consumption').isVisible(), false);
  assert.deepEqual(await page.locator('.sonata-count').allInnerTexts(), ['×2', '×2']);
  await captureState('warning');
  await page.locator('#howToFix').focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('#workshopExplanation').isVisible(), true);
  assert.equal(await page.locator('.feedback-affected').count(), 3);
  assert.equal(await page.locator('#closeExplanation').evaluate(node => node === document.activeElement), true);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#workshopExplanation').matches(':popover-open'));
  assert.equal(await page.locator('.feedback-affected').count(), 0);
  assert.equal(await page.locator('#howToFix').evaluate(node => node === document.activeElement), true);
  const warningEquipment = await page.locator('#slots .echo-card').evaluateAll(cards => cards.map(card => card.outerHTML));
  const comparison = await page.locator('#characterStats').innerText();
  await page.locator('#simulate').click();
  assert.deepEqual(await page.locator('#slots .echo-card').evaluateAll(cards => cards.map(card => card.outerHTML)), warningEquipment, 'Run record must not auto-fix warning');
  assert.equal(await page.locator('#characterStats').innerText(), comparison);
  assert.equal(await page.locator('#materialRows .material-row').count(), 3);
  const recorded = await page.locator('#materialRows').innerHTML();
  await chooseScenario(page, 'error');
  assert.equal(await page.locator('#feedbackTitle').innerText(), 'Cost Limit Exceeded');
  assert.equal(await page.locator('#simulate').isDisabled(), true);
  assert.equal(await page.locator('#materialRows').innerHTML(), recorded, 'Blocker erased recorded spending');
  await captureState('error');
  await page.locator('#howToFix').click();
  assert.equal(await page.locator('.feedback-affected').count(), 1);
  assert.equal(await page.locator('[data-slot="4"]').getAttribute('data-feedback-severity'), 'error');
  assert.match(await page.locator('#explanationFacts').innerText(), /15/);
  assert.match(await page.locator('#explanationFacts').innerText(), /12/);
  const noMotion = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (noMotion) assert.equal(await page.locator('.feedback-affected .echo-card').evaluate(node => getComputedStyle(node).animationName), 'none');
  await settle(page);
  await page.locator('#closeExplanation').click();
  assert.equal(await page.locator('.feedback-affected').count(), 0);
  await page.locator('#howToFix').click();
  await page.locator('[data-slot="1"]').click();
  assert.equal(await page.locator('.feedback-affected').count(), 0, 'Outside/slot selection must clear highlights');
  assert.equal(await page.locator('#workshopExplanation').isVisible(), false);
  await page.locator('[data-slot="0"]').click();
  await chooseScenario(page, 'result');
  assert.equal(await page.locator('#feedbackTitle').innerText(), 'Run Record');
  assert.equal(await page.locator('#simulate').isEnabled(), true);
  assert.equal(await page.locator('#materialRows .material-row').count(), 3);
  await captureState('result');
  await chooseScenario(page, 'combination');
  assert.match(await page.locator('#feedbackTitle').innerText(), /Pending/);
  assert.equal(await page.locator('#simulate').isEnabled(), true);
  await page.locator('#howToFix').click();
  assert.equal(await page.locator('.feedback-affected').count(), 0);
  await page.keyboard.press('Escape');
  await page.locator('#reset').click();
  assert.equal(await page.locator('#consumption').isVisible(), false);
  // Shared anatomy: primary value > secondary label/value > ordinary substats.
  const hierarchy = await page.evaluate(() => [...document.querySelectorAll('.echo-card')].map(card => {
    const size = selector => parseFloat(getComputedStyle(card.querySelector(selector)).fontSize);
    return { main: size('.main-stat strong'), secondary: size('.secondary-stat'), substat: size('.substat') };
  }));
  hierarchy.forEach(level => assert.ok(level.main > level.secondary && level.secondary > level.substat));
  checks.push({ label: `${prefix}: contextual feedback, highlighting, permission and recorded-consumption boundaries`, width, reducedMotion: noMotion, hierarchy });
}

try {
  for (const width of [1440, 1920, 2560]) {
    const height = width === 1440 ? 900 : width === 1920 ? 1080 : 1440;
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    console.log(`Reviewing source at ${width}px`);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}${selector}?settings=expanded`, { waitUntil: 'networkidle' });
    await wait(page);
    await page.evaluate(() => document.fonts.ready);
    await checkLayout(page, width, 'repository source');
    const current = await geometry(page);
    const baseline = await context.newPage();
    await baseline.goto(`${origin}/docs/ui-lab/v1/?settings=expanded`, { waitUntil: 'networkidle' });
    await baseline.evaluate(() => document.fonts.ready);
    const approved = await geometry(baseline);
    for (const selector of ['.workshop', '.working-area', '.slots']) {
      for (const key of ['y','height']) assert.ok(Math.abs(current[selector][key] - approved[selector][key]) < 2, `${width}: approved ${selector} ${key} changed`);
    }
    checks.push({ label: 'Preserved V1 vertical composition; authorized shared-panel width adaptation', width, approved, current });
    await baseline.close();
    if (width === 1920) {
      const before = await context.newPage();
      await before.goto(`${origin}/__approved__${selector}?settings=expanded`, { waitUntil: 'networkidle' });
      await wait(before); await before.evaluate(() => document.fonts.ready);
      const primaryPosition = target => target.locator('#simulate').evaluate(node => { const r = node.getBoundingClientRect(); return [r.x + scrollX, r.y + scrollY, r.width, r.height]; });
      const beforeAction = await primaryPosition(before), currentAction = await primaryPosition(page);
      beforeAction.forEach((value, index) => { if (index !== 0) assert.ok(Math.abs(value - currentAction[index]) < 2, 'Approved primary action size/vertical placement changed'); });
      checks.push({ label: 'Approved primary action geometry', beforeRevision: approvedRevision, afterRevision: result.revision, workingTreeDirty: result.workingTreeDirty });
      await before.close();
    }
    await reviewCharacterCard(page, { width, checks });
    await reviewCarousel(page, { width, checks });
    await exerciseFeedback(page, width, 'source');
    await exercise(page, width, 'source');
    if (await page.locator('#characterToggle').getAttribute('aria-expanded') !== 'true') await page.locator('#characterToggle').click();
    await checkLayout(page, width, 'expanded Character Card');
    await page.goto(`${origin}${selector}?compact=true`, { waitUntil: 'networkidle' });
    await wait(page);
    await checkLayout(page, width, 'compact panels');
    await exerciseFeedback(page, width, 'compact');
    if (width === 1920) {
      const queryPage = await context.newPage();
      await queryPage.goto(`${origin}${selector}?feedback=error&recorded=true&compact=true`, { waitUntil: 'networkidle' });
      await wait(queryPage);
      assert.equal(await queryPage.locator('#simulate').isDisabled(), true);
      assert.equal(await queryPage.locator('#materialRows .material-row').count(), 3);
      assert.match(await queryPage.locator('.loadout-heading .small-muted').innerText(), /15 \/ 12 Cost/);
      checks.push({ label: 'Review query parameters: blocked fixture plus preserved spending', width });
      await queryPage.close();
      await page.locator('[data-person="augusta"]').focus();
      await page.keyboard.press('End');
      assert.equal(await selectedName(page), 'Augusta');
      await page.keyboard.press('Enter');
      assert.equal(await selectedName(page), 'Zhezhi', 'End must keep keyboard focus for selection');
      await page.keyboard.press('Home');
      await page.keyboard.press('Enter');
      assert.equal(await selectedName(page), 'Changli', 'Home must keep keyboard focus for selection');
      const seen = new Set();
      await page.locator('#galleryArt').focus(); await page.keyboard.press('Home');
      await carouselSettled(page);
      while (true) {
        seen.add(await page.locator('#characterCarousel').getAttribute('data-focused-character'));
        if (Number(await page.locator('#characterCarousel').getAttribute('data-position')) === 58) break;
        await page.keyboard.press('ArrowRight'); await carouselSettled(page);
      }
      assert.equal(seen.size, 59, 'All 59 Characters must be reachable without page boundaries');
      checks.push({ label: 'Full continuous catalog reachable one position at a time', count: seen.size });
    }
    await context.close();
    const wheelContext = await browser.newContext({ viewport: { width, height } });
    const wheelPage = await wheelContext.newPage();
    wheelPage.on('pageerror', error => errors.push(error.message));
    await wheelPage.goto(`${origin}${selector}?settings=expanded`, { waitUntil: 'networkidle' }); await wait(wheelPage);
    await reviewCarousel(wheelPage, { width, checks });
    await wheelContext.close();
    for (const variant of ['elegant','cinematic']) {
      const heroContext = await browser.newContext({ viewport:{width,height}, reducedMotion:'reduce' });
      const heroPage = await heroContext.newPage();
      heroPage.on('pageerror', error => errors.push(error.message));
      await heroPage.goto(`${origin}${selector}?hero=${variant}`,{waitUntil:'networkidle'});
      await reviewHero(heroPage,{width,variant,checks});
      await heroContext.close();
    }
  }

  // Pointer behavior is also exercised with ordinary motion; reduced motion above
  // keeps geometry comparisons deterministic rather than skipping an end state.
  const animated = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const motionPage = await animated.newPage();
  await motionPage.goto(`${origin}${selector}?settings=expanded`, { waitUntil: 'networkidle' });
  await wait(motionPage);
  await exerciseFeedback(motionPage, 1920, 'animated');
  await exercise(motionPage, 1920, 'animated');
  await animated.close();

  for (const width of [1440,1920,2560]) {
    const context = await browser.newContext({viewport:{width,height:width === 1440 ? 900 : 1440},reducedMotion:width === 1920 ? 'no-preference' : 'reduce'});
    const page = await context.newPage(); page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`${origin}${selector}`,{waitUntil:'networkidle'}); await wait(page);
    await reviewResults(page,{width,checks,animated:width===1920});
    await page.goto(`${origin}${selector}?settings=expanded`,{waitUntil:'networkidle'}); await wait(page);
    await reviewSettings(page,{width,checks});
    await page.goto(`${origin}${selector}?settings=expanded`,{waitUntil:'networkidle'}); await wait(page);
    await reviewResources(page,{width,checks});
    await context.close();
  }

  const touch = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true, reducedMotion: 'reduce' });
  const touchPage = await touch.newPage();
  await touchPage.goto(`${origin}${selector}`, { waitUntil: 'networkidle' });
  await wait(touchPage);
  await touchPage.locator('[data-person="iuno"]').tap();
  assert.equal(await selectedName(touchPage), 'Augusta', 'First touch must preview');
  await touchPage.locator('[data-art="iuno"]').tap();
  assert.equal(await selectedName(touchPage), 'Iuno', 'Second touch must select');
  checks.push({ label: 'Desktop touch-pointer preview then selection', passed: true });
  await touchPage.goto(`${origin}${selector}`, { waitUntil: 'networkidle' }); await wait(touchPage);
  await reviewCarousel(touchPage, { width: 1440, checks, touch: true });
  await touch.close();

  if (process.env.UI_LAB_PORTABLE_REVIEW === 'true') {
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
      await reviewCarousel(page, { width, checks });
      await exerciseFeedback(page, width, 'portable');
      await selectCharacter(page, 'iuno');
      assert.equal(await selectedName(page), 'Iuno');
      await page.locator('#simulate').click();
      assert.equal(await page.locator('#materialRows').innerText(), 'Consumption not recorded');
      await selectCharacter(page, 'augusta');
      await page.locator('[data-pile="0"]').click();
      assert.match(await page.locator('#inspectedCard').innerText(), /DISCARDED/);
      await page.locator('#closeInspection').click();
      assert.deepEqual(network, [], 'Portable artifact attempted a network request');
      checks.push({ label: 'Portable HTML offline interactive; zero HTTP requests', width, passed: true });
      await context.close();
    }
  }
  assert.deepEqual(errors, []);
  console.log(`UI Lab Chromium review passed: ${checks.length} checks; source ${result.revision}; dirty=${result.workingTreeDirty}`);
} catch (error) {
  result.failure = error.stack ?? String(error);
  // Keep the actual assertion/encoder error accessible through GitHub's check
  // API even when this executor cannot follow redirected Actions log downloads.
  if (process.env.GITHUB_ACTIONS === 'true') {
    const diagnostic = result.failure.slice(0, 12000).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
    console.error(`::error title=UI Lab Chromium review::${diagnostic}`);
  }
  throw error;
} finally {
  writeFileSync(resolve(output, 'verification.json'), JSON.stringify(result, null, 2) + '\n');
  await browser.close();
  await new Promise(resolveClosed => server.close(resolveClosed));
}
