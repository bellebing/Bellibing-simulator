import assert from 'node:assert/strict';
import { resolve } from 'node:path';

const settle = page => page.waitForFunction(() => document.querySelector('#characterCarousel').dataset.motion === 'settled');
const focusId = page => page.locator('#characterCarousel').getAttribute('data-focused-character');
const selectedName = page => page.locator('.hero-copy h2').innerText();
const geometry = page => page.evaluate(() => Object.fromEntries(['.workshop', '.working-area', '.slots', '.trash-panel'].map(selector => { const r = document.querySelector(selector).getBoundingClientRect(); return [selector, [r.x + scrollX, r.y + scrollY, r.width, r.height]]; })));
const center = locator => locator.evaluate(node => { const r = node.getBoundingClientRect(); return r.x + r.width / 2; });

export async function reviewCarousel(page, { width, output, checks, touch = false, capture = true }) {
  const activate = locator => touch ? locator.tap() : locator.click();
  const original = await geometry(page);
  const build = await page.locator('#currentCard').innerHTML();
  const stats = await page.locator('#characterStats').innerText();
  const middle = await center(page.locator('.workshop'));
  assert.ok(Math.abs(await center(page.locator('#portraits')) - middle) < 1, 'Portrait collection must be centered on Workshop');
  assert.equal(await page.locator('.workshop-header .current-name strong').innerText(), 'Augusta');
  assert.ok(await page.locator('.portrait.selected').evaluate(node => node.clientWidth) >= 48);
  await activate(page.locator('#openGallery')); await page.waitForTimeout(450);
  async function assertCentered() {
    await settle(page); await page.waitForTimeout(50);
    assert.ok(Math.abs(await center(page.locator('.art-hit.is-focus')) - middle) < 1, 'Focused Character left the fixed center');
    assert.ok(Math.abs(await center(page.locator('#focusedInfo')) - middle) < 1, 'Information left the fixed center');
    const widths = await page.locator('.art-hit').evaluateAll(items => items.filter(item => getComputedStyle(item).visibility === 'visible').map(item => ({ focused: item.classList.contains('is-focus'), width: item.querySelector('.art-figure').getBoundingClientRect().width })));
    const focused = widths.find(item => item.focused).width;
    assert.ok(widths.every(item => item.focused || item.width < focused), `Focused artwork must be largest: ${JSON.stringify(widths)}`);
    assert.deepEqual(await geometry(page), original, 'Browsing shifted/resized Workshop');
  }
  await assertCentered();
  if (capture) await page.screenshot({ path: resolve(output, `carousel-center-${width}.png`) });
  const initial = await focusId(page);
  const neighbor = page.locator('[data-art="iuno"]');
  if (!touch) { await neighbor.hover(); await page.waitForTimeout(220); assert.equal(await focusId(page), initial, 'Hover must not create a fisheye focus'); }
  await activate(neighbor); await assertCentered();
  assert.equal(await focusId(page), 'iuno');
  assert.equal(await selectedName(page), 'Augusta', 'Neighbor click must browse without selecting');
  assert.equal(await page.locator('#currentCard').innerHTML(), build);
  assert.equal(await page.locator('#characterStats').innerText(), stats);
  assert.match(await page.locator('#galleryStatus').innerText(), /AUGUSTA.*PREVIEW ONLY/);
  // Return to Augusta using the wheel's own arrow, then physically drag it.
  await page.locator('#galleryArt').focus(); await page.keyboard.press('ArrowLeft'); await assertCentered();
  const area = await page.locator('#galleryArt').boundingBox();
  const x = area.x + area.width / 2, y = area.y + 120;
  const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  await page.evaluate(() => {
    document.querySelector('#characterCarousel').addEventListener('pointerup', () => {
      globalThis.__carouselReleasePosition = Number(document.querySelector('#characterCarousel').dataset.position);
    }, { capture: true, once: true });
  });
  let session;
  if (touch) {
    session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  } else { await page.mouse.move(x, y); await page.mouse.down(); }
  for (let index = 1; index <= 12; index++) {
    const next = x - index * 16;
    if (touch) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: next, y }] });
    else await page.mouse.move(next, y);
    assert.ok(Math.abs(await center(page.locator('#focusedInfo')) - middle) < 1, 'Information followed the drag horizontally');
    await page.waitForTimeout(12);
  }
  assert.equal(await page.locator('#characterCarousel').getAttribute('data-motion'), 'dragging', 'Pointer capture was lost during the real gesture');
  const draggedPosition = Number(await page.locator('#characterCarousel').getAttribute('data-position'));
  assert.ok(draggedPosition > 5, 'The drag did not actually move the collection');
  // A real quick flick finishes the gesture. Record release in the browser's
  // pointer-up event, so automation latency cannot be mistaken for no momentum.
  for (const distance of [210, 224]) {
    if (touch) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - distance, y }] });
    else await page.mouse.move(x - distance, y);
  }
  if (touch) await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  else await page.mouse.up();
  const released = await page.evaluate(() => globalThis.__carouselReleasePosition);
  await assertCentered();
  const snapped = Number(await page.locator('#characterCarousel').getAttribute('data-position'));
  assert.equal(snapped, Math.round(snapped), 'Release did not magnetically snap');
  if (reduced) assert.equal(snapped, Math.round(released), 'Reduced motion should omit the fling');
  else assert.ok(snapped > released + .1, `Momentum did not carry beyond release: ${released} → ${snapped}`);
  assert.equal(await selectedName(page), 'Augusta', 'Drag accidentally selected a Character');
  if (capture) await page.screenshot({ path: resolve(output, `carousel-drag-snap-${width}.png`) });
  if (touch) {
    // Cancel an actual captured swipe; then verify vertical touch remains scrolling.
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 45, y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await settle(page);
    assert.equal(await page.locator('.is-dragging').count(), 0);
    assert.equal(await selectedName(page), 'Augusta');
    const horizontalPosition = await page.locator('#characterCarousel').getAttribute('data-position');
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 1, y: y - 80 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await settle(page);
    assert.equal(await page.locator('#characterCarousel').getAttribute('data-position'), horizontalPosition, 'Vertical touch browsed the horizontal collection');
    assert.equal(await selectedName(page), 'Augusta');
    await page.evaluate(() => scrollTo(0, 0));
  }
  // Account filtering and endpoint padding keep the focus at the same center.
  await activate(page.locator('[data-filter="account"]')); await assertCentered();
  assert.equal(await page.locator('.portrait').count(), 6);
  assert.equal(await selectedName(page), 'Augusta');
  await page.locator('#galleryArt').focus(); await page.keyboard.press('End'); await assertCentered();
  assert.equal(await page.locator('#portraitNext').isDisabled(), true);
  await activate(page.locator('[data-filter="all"]')); await assertCentered();
  assert.equal(await page.locator('.portrait').count(), 59);
  await page.locator('#galleryArt').focus(); await page.keyboard.press('End'); await assertCentered();
  assert.equal(await page.locator('#portraitNext').isDisabled(), true);
  assert.equal(await page.locator('#galleryPosition').innerText(), '59 / 59 · DEMONSTRATION BUILDS');
  if (capture) await page.screenshot({ path: resolve(output, `carousel-last-${width}.png`) });
  await page.keyboard.press('Home'); await assertCentered();
  assert.equal(await page.locator('#portraitPrevious').isDisabled(), true);
  if (capture) await page.screenshot({ path: resolve(output, `carousel-first-${width}.png`) });
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  await assertCentered(); assert.equal(await focusId(page), 'iuno');
  await activate(page.locator('.art-hit.is-focus'));
  assert.equal(await selectedName(page), 'Iuno', 'Centered activation did not select');
  assert.equal(await page.locator('.workshop-header .current-name strong').innerText(), 'Iuno');
  assert.equal(await page.locator('#openGallery').getAttribute('aria-expanded'), 'false');
  if (capture) await page.screenshot({ path: resolve(output, `carousel-selected-${width}.png`) });
  await activate(page.locator('#openGallery')); await page.locator('#galleryArt').focus();
  await page.keyboard.press('ArrowLeft'); await settle(page); await page.keyboard.press('Enter');
  assert.equal(await selectedName(page), 'Augusta');
  await activate(page.locator('#openGallery')); await page.locator('#galleryArt').focus();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#openGallery').evaluate(node => node === document.activeElement), true);
  assert.ok(Math.abs(await center(page.locator('#portraits')) - middle) < 1);
  if (session) await session.detach();
  checks.push({ label: 'Carousel V2: center, no hover focus, neighbor browse, physical drag, momentum/snap, endpoints, filters and explicit selection', width, touch, reducedMotion: reduced, releasePosition: released, snappedPosition: snapped });
}
