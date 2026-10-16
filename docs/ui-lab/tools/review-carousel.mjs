import assert from 'node:assert/strict';

const flowSettled = page => page.waitForFunction(() => { const ribbon = document.querySelector('#characterCarousel'); return getComputedStyle(ribbon).height === (ribbon.classList.contains('expanded') ? '482px' : '0px'); });
const settle = page => page.waitForFunction(() => document.querySelector('#characterCarousel').dataset.motion === 'settled');
const focusId = page => page.locator('#characterCarousel').getAttribute('data-focused-character');
const selectedName = page => page.locator('.hero-copy h2').innerText();
const geometry = page => page.evaluate(() => Object.fromEntries(['.workshop', '.working-area', '.slots', '.trash-panel'].map(selector => { const r = document.querySelector(selector).getBoundingClientRect(); return [selector, [r.x + scrollX, r.y + scrollY, r.width, r.height]]; })));
const center = locator => locator.evaluate(node => { const r = node.getBoundingClientRect(); return r.x + r.width / 2; });

export async function reviewCarousel(page, { width, checks, touch = false }) {
  const activate = async locator => { const target = await locator.getAttribute('id') === 'openGallery' ? page.locator('.portrait[tabindex="0"]') : locator; return touch ? target.tap() : target.click(); };
  const original = await geometry(page);
  const panelTops = await page.locator('#settings,.workshop,#character').evaluateAll(items => items.map(item => item.getBoundingClientRect().top));
  assert.ok(panelTops.every(top => Math.abs(top - panelTops[0]) < 1), 'Collapsed panels must share their top edge');
  assert.equal(await page.locator('.page-heading #portraits').count(), 1);
  const sides = await page.locator('.side').evaluateAll(items => items.map(item => { const r = item.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }));
  const build = await page.locator('#currentCard').innerHTML();
  const stats = await page.locator('#characterStats').innerText();
  const middle = await center(page.locator('.workshop'));
  const pageMiddle = width / 2;
  assert.ok(Math.abs(await center(page.locator('.site-header nav .active')) - pageMiddle) < 1, 'Improve tab must be centered on the page');
  assert.ok(Math.abs(await center(page.locator('#portraits')) - pageMiddle) < 1, 'Portrait collection must be centered on the page');
  assert.ok(Math.abs(await center(page.locator('.portrait.selected')) - pageMiddle) < 1, 'Selected portrait must be on the page centerline');
  assert.equal(await page.locator('.workshop-header .current-name strong').innerText(), 'Augusta');
  assert.ok(await page.locator('.portrait.selected').evaluate(node => node.clientWidth) >= 48);
  assert.equal(await page.locator('.filter').isVisible(), false);
  await activate(page.locator('#openGallery')); await flowSettled(page);
  assert.equal(await page.locator('#portraits').isVisible(), false);
  const expanded = await geometry(page);
  assert.deepEqual(await page.locator('.side').evaluateAll(items => items.map(item => { const r = item.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })), sides, 'Gallery moved a side panel');
  for (const key of Object.keys(original)) {
    assert.equal(expanded[key][1], original[key][1] + 482, `${key} was not pushed down`);
    assert.deepEqual([expanded[key][0], ...expanded[key].slice(2)], [original[key][0], ...original[key].slice(2)]);
  }
  const gallery = await page.locator('#characterGallery').boundingBox();
  assert.ok(Math.abs(gallery.width - expanded['.workshop'][2]) < 1);
  assert.ok(gallery.y + gallery.height <= expanded['.workshop'][1]);
  async function assertCentered() {
    await settle(page); await page.waitForTimeout(50);
    assert.ok(Math.abs(await center(page.locator('.art-hit.is-focus')) - middle) < 1, 'Focused Character left the fixed center');
    assert.ok(Math.abs(await center(page.locator('#focusedInfo')) - middle) < 1, 'Information left the fixed center');
    const widths = await page.locator('.art-hit').evaluateAll(items => items.filter(item => getComputedStyle(item).visibility === 'visible').map(item => ({ focused: item.classList.contains('is-focus'), width: item.querySelector('.art-figure').getBoundingClientRect().width })));
    const focused = widths.find(item => item.focused).width;
    assert.ok(widths.every(item => item.focused || item.width < focused), `Focused artwork must be largest: ${JSON.stringify(widths)}`);
    assert.deepEqual(await geometry(page), expanded, 'Browsing shifted/resized expanded Workshop');
  }
  await assertCentered();
  const artwork = await page.locator('.art-hit.is-focus').evaluate(node => { const current = node.querySelector('.art-figure').getBoundingClientRect(); const next = node.nextElementSibling?.querySelector('.art-figure')?.getBoundingClientRect(); return { current: { left:current.left, right:current.right }, next: next && { left:next.left, width:next.width } }; });
  if (artwork.next) assert.ok((artwork.current.right - artwork.next.left) / artwork.next.width <= .31, 'Immediate neighbor is excessively hidden');
  const filters = await page.locator('#characterGallery').evaluate(node => [...node.querySelectorAll('.filter button,.element-filter button,#closeGallery')].map(button => { const r = button.getBoundingClientRect(); return [r.left, r.right]; }));
  assert.ok(filters.every(([left, right]) => left >= gallery.x && right <= gallery.x + gallery.width), 'Filters are clipped');
  const figures = await page.locator('.art-hit').evaluateAll(items => items.filter(item => getComputedStyle(item).visibility === 'visible').map(item => { const r = item.querySelector('.art-figure').getBoundingClientRect(); return { left:r.left, right:r.right }; }).sort((a,b) => a.left-b.left));
  for (let index = 1; index < figures.length; index++) assert.ok(figures[index].left - figures[index-1].right < 16, 'Scaled artwork has a disconnected gap');
  const initial = await focusId(page);
  const neighbor = page.locator('[data-art="iuno"]');
  if (!touch) { await neighbor.hover(); await page.waitForTimeout(220); assert.equal(await focusId(page), initial, 'Hover must not create a fisheye focus'); }
  await activate(neighbor); await assertCentered();
  assert.equal(await focusId(page), 'iuno');
  assert.equal(await selectedName(page), 'Augusta', 'Neighbor click must browse without selecting');
  assert.equal(await page.locator('#currentCard').innerHTML(), build);
  assert.equal(await page.locator('#characterStats').innerText(), stats);
  assert.equal(await page.locator('#characterGallery').innerText().then(text => /WORKING ON|Drag to spin|Enter Select|Esc Close|DEMONSTRATION BUILDS/.test(text)), false);
  assert.equal(await page.locator('#closeGallery .chevron').count(), 1);
  assert.equal(await page.locator('[data-element]:not([data-element="all"]) img').count(), 6);
  for (const element of ['Spectro', 'Havoc', 'Aero', 'Glacio', 'Fusion', 'Electro']) {
    const button = page.locator(`[data-element="${element}"]`);
    assert.equal(await button.getAttribute('title'), element);
    assert.equal(await button.getAttribute('aria-label'), element);
  }
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
  assert.ok(draggedPosition > 4.8, 'The drag did not actually move the collection');
  // A real quick flick finishes the gesture. Record release in the browser's
  // pointer-up event, so automation latency cannot be mistaken for no momentum.
  for (const distance of [235, 270]) {
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
  const expectedCatalog = await import('../v1.1/modules/catalog.js');
  for (const collection of ['account', 'all']) {
    await activate(page.locator(`[data-filter="${collection}"]`));
    for (const element of ['Spectro', 'Havoc', 'Aero', 'Glacio', 'Fusion', 'Electro', 'all']) {
      await activate(page.locator(`[data-element="${element}"]`));
      assert.equal(await page.locator(`[data-element="${element}"]`).getAttribute('aria-pressed'), 'true');
      assert.match(await page.locator(`[data-element="${element}"]`).evaluate(node => getComputedStyle(node).backgroundImage), /linear-gradient/);
      const account = ['changli', 'yinlin', 'the-shorekeeper', 'augusta', 'iuno', 'phrolova'];
      const expected = expectedCatalog.CHARACTER_CATALOG.filter(person => (collection === 'all' || account.includes(person.id)) && (element === 'all' || person.element === element)).map(person => person.id).sort();
      assert.deepEqual((await page.locator('[data-art]').evaluateAll(items => items.map(item => item.dataset.art))).sort(), expected);
      assert.equal(await selectedName(page), 'Augusta', 'Filtering selected a Character');
      assert.equal(await page.locator('#currentCard').innerHTML(), build);
      assert.equal(await page.locator('#characterStats').innerText(), stats);
      assert.equal(await page.locator('#emptyCatalog').isVisible(), expected.length === 0);
      if (element === 'Spectro') {
        await page.keyboard.press('Escape'); await flowSettled(page);
        assert.equal(await page.locator('.portrait.selected').isVisible(), true);
        assert.ok(Math.abs(await center(page.locator('.portrait.selected')) - pageMiddle) < 1);
        await activate(page.locator('#openGallery')); await flowSettled(page);
      }
      if (!expected.length) {
        await page.locator('#galleryArt').focus(); await page.keyboard.press('Enter');
        assert.equal(await selectedName(page), 'Augusta');
        await page.keyboard.press('Escape'); await flowSettled(page);
        assert.equal(await page.locator('.portrait.selected').isVisible(), true);
        await activate(page.locator('#openGallery')); await flowSettled(page);
      } else await assertCentered();
    }
  }
  await activate(page.locator('[data-filter="account"]'));
  await page.locator('#galleryArt').focus(); await page.keyboard.press('End'); await assertCentered();
  assert.equal(Number(await page.locator('#characterCarousel').getAttribute('data-position')), await page.locator('.portrait').count() - 1);
  await activate(page.locator('[data-filter="all"]')); await assertCentered();
  assert.equal(await page.locator('.portrait').count(), 59);
  await page.locator('#galleryArt').focus(); await page.keyboard.press('End'); await assertCentered();
  assert.equal(Number(await page.locator('#characterCarousel').getAttribute('data-position')), await page.locator('.portrait').count() - 1);
  assert.match(await page.locator('#carouselAnnouncement').textContent(), /59 of 59/);
  await page.keyboard.press('Home'); await assertCentered();
  assert.equal(Number(await page.locator('#characterCarousel').getAttribute('data-position')), 0);
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  await assertCentered(); assert.equal(await focusId(page), 'iuno');
  await activate(page.locator('.art-hit.is-focus'));
  assert.equal(await selectedName(page), 'Iuno', 'Centered activation did not select');
  assert.equal(await page.locator('.workshop-header .current-name strong').innerText(), 'Iuno');
  assert.equal(await page.locator('#openGallery').getAttribute('aria-expanded'), 'false');
  await activate(page.locator('#openGallery')); await page.locator('#galleryArt').focus();
  await page.keyboard.press('ArrowLeft'); await settle(page); await page.keyboard.press('Enter');
  assert.equal(await selectedName(page), 'Augusta');
  await activate(page.locator('#openGallery')); await page.locator('#galleryArt').focus();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#openGallery').evaluate(node => node === document.activeElement), true);
  assert.ok(Math.abs(await center(page.locator('#portraits')) - pageMiddle) < 1);
  if (!touch) {
    await page.keyboard.press('Enter'); await flowSettled(page);
    assert.equal(await page.locator('#galleryArt').evaluate(node => node === document.activeElement), true, 'Keyboard expansion must focus the wheel');
    await page.keyboard.press('Escape');
  }
  await flowSettled(page);
  assert.deepEqual(await geometry(page), original, 'Collapse must restore the collapsed layout');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
  if (session) await session.detach();
  checks.push({ label: 'Carousel V2: center, no hover focus, neighbor browse, physical drag, momentum/snap, endpoints, filters and explicit selection', width, touch, reducedMotion: reduced, releasePosition: released, snappedPosition: snapped });
}
