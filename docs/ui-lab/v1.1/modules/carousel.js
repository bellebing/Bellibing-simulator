import { CHARACTER_CATALOG } from './catalog.js';
import { DEMO_ACCOUNT_IDS, DEMO_FEATURED_IDS, previewSnapshot } from './lab-state.js';
import { artworkOffset, artworkScale } from './carousel-layout.js';
import { createCarouselMotion, clampPosition } from './carousel-motion.js';
import { $, assetURL, escapeHtml } from './util.js';

export function mountCarousel({ selectedId, onSelect }) {
  const ribbon = $('#characterCarousel');
  const art = $('#galleryArt');
  const portraits = $('#portraits');
  const compact = $('.ribbon-rest');
  const contains = node => ribbon.contains(node) || compact.contains(node);
  const listen = (type, handler, options) => [ribbon, compact].forEach(surface => surface.addEventListener(type, handler, options));
  const catalog = new Map(CHARACTER_CATALOG.map(person => [person.id, person]));
  const ordered = [...DEMO_FEATURED_IDS, ...CHARACTER_CATALOG.map(person => person.id).filter(id => !DEMO_FEATURED_IDS.includes(id))];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let ids = ordered;
  let selected = selectedId;
  let focused = selectedId;
  let filter = 'all';
  let element = 'all';
  let records = [];
  let compactRecords = [];
  let drag = null;
  let suppressUntil = 0;
  let wheelTimer;
  let lastInfoId = null;
  const isOpen = () => ribbon.classList.contains('expanded');
  const step = () => artworkOffset(1, art.clientWidth);
  const portraitStep = 52;
  const motion = createCarouselMotion({ initial: ids.indexOf(selected), maximum: () => Math.max(0, ids.length - 1), paint, reduced: () => reduced.matches });

  function updateInformation(force = false) {
    if (focused === lastInfoId && !force) return;
    lastInfoId = focused;
    if (!focused) { $('#focusedInfo').hidden = true; return; }
    $('#focusedInfo').hidden = false;
    const person = catalog.get(focused);
    const preview = previewSnapshot(focused);
    const info = $('#focusedInfo');
    info.classList.toggle('no-data', !preview.hasBuild);
    info.innerHTML = `<div class="focus-caption">${focused === selected ? 'SELECTED CHARACTER' : 'PREVIEW'}${!preview.onAccount ? ' · CATALOG' : ''}${person.artStatus === 'PORTRAIT_FALLBACK' ? ' · HERO ART PENDING' : ''}</div>
      <div class="focus-name">${escapeHtml(person.name)}</div>
      <div class="focus-meta">${preview.hasBuild ? `${escapeHtml(preview.weapon)} <i>·</i> ${Array.from({ length: 5 }, (_, index) => `<span class="socket ${index >= preview.slots ? 'empty' : ''}"></span>`).join('')} ${preview.slots}/5 Echoes` : 'No saved demo build'}</div>
      <div class="focus-stats">${['ATK', 'CRIT RATE', 'CRIT DMG'].map((label, index) => `<div><strong>${escapeHtml(preview.stats[index])}</strong><span>${label}</span></div>`).join('')}</div>`;
  }

  function paint(position = motion.position, moving = motion.busy) {
    focused = ids[Math.round(clampPosition(position, ids.length - 1))];

    const portraitRange = portraits.clientWidth / 2 + 20;
    records.forEach((record, index) => {
      const distance = index - position;
      const absolute = Math.abs(distance);
      const level = Math.min(4, Math.floor(absolute)), fraction = Math.min(4, absolute) - level;
      const opacities = [1, 1, .76, .58, .43];
      const scale = artworkScale(distance);
      const offset = artworkOffset(distance, art.clientWidth);
      const opacity = level < 4 ? opacities[level] + (opacities[level + 1] - opacities[level]) * fraction : Math.max(.25, .43 - (absolute - 4) * .06);
      const artVisible = Math.abs(offset) < art.clientWidth / 2 + 145;
      record.hit.style.left = `calc(50% + ${offset}px)`;
      record.hit.style.zIndex = String(40 - Math.round(absolute * 5));
      record.hit.style.visibility = artVisible ? 'visible' : 'hidden';
      record.hit.style.pointerEvents = artVisible ? '' : 'none';
      record.hit.classList.toggle('is-focus', record.id === focused);
      record.hit.classList.toggle('is-selected', record.id === selected);
      record.hit.setAttribute('aria-label', `${record.id === focused ? 'Select' : 'Center'} ${record.name}, ${index + 1} of ${ids.length}`);
      record.hit.setAttribute('aria-pressed', record.id === selected);
      record.figure.style.transform = `translateX(-50%) translateY(${-4 * Math.max(0, 1 - absolute)}px) rotateY(${Math.max(-9, Math.min(9, -distance * 9))}deg) scale(${scale})`;
      record.figure.style.opacity = String(opacity);
      record.figure.style.setProperty('--compact-dx', `${distance * portraitStep - offset}px`);
      record.label.style.left = `calc(50% + ${offset}px)`;
      record.label.hidden = absolute < .7 || absolute > 2.7;
    });

    const selectedIndex = compactRecords.findIndex(record => record.id === selected);
    compactRecords.forEach((record, index) => {
      const offset = (index - selectedIndex) * portraitStep;
      record.node.style.left = `calc(50% + ${offset}px)`;
      record.node.style.visibility = Math.abs(offset) < portraitRange ? 'visible' : 'hidden';
      record.node.classList.toggle('selected', record.id === selected);
      record.node.setAttribute('aria-pressed', record.id === selected);
      record.node.tabIndex = record.id === selected ? 0 : -1;
    });

    ribbon.classList.toggle('is-moving', !!drag?.active || moving);
    ribbon.dataset.focusedCharacter = focused;
    ribbon.dataset.position = position.toFixed(4);
    ribbon.dataset.motion = drag?.active ? 'dragging' : moving ? 'settling' : 'settled';
    const name = catalog.get(selected).name;
    if ($('.current-name strong').textContent !== name) $('.current-name strong').textContent = name;
    updateInformation();
    if (!moving && !drag?.active) {
      const announcement = `${focused === selected ? 'Selected' : 'Preview'} ${catalog.get(focused)?.name ?? 'No matching Characters'}, ${ids.indexOf(focused) + 1} of ${ids.length}. Working on ${name}.`;
      if ($('#carouselAnnouncement').textContent !== announcement) $('#carouselAnnouncement').textContent = announcement;
    }
  }

  function renderCatalog() {
    ribbon.classList.add('is-rebuilding');
    // The compact state always retains the actual selected Character, including
    // when the expanded filters exclude it. Preview focus belongs to the wheel.
    const compactIds = ordered.filter(id => id === selected || ids.includes(id));
    portraits.innerHTML = compactIds.map((id, index) => {
      const person = catalog.get(id);
      return `<button class="portrait ${DEMO_ACCOUNT_IDS.includes(id) ? '' : 'catalog'}" data-person="${id}" aria-label="Browse ${escapeHtml(person.name)}, ${DEMO_ACCOUNT_IDS.includes(id) ? 'on demo account' : 'not on demo account'}, ${index + 1} of ${compactIds.length}" tabindex="-1"><img src="${assetURL(person.face)}" alt="${escapeHtml(person.name)}" draggable="false"></button>`;
    }).join('');
    art.innerHTML = ids.map(id => {
      const person = catalog.get(id);
      return `<button class="art-hit" data-art="${id}" tabindex="-1"><span class="art-figure ${person.artStatus === 'PORTRAIT_FALLBACK' ? 'portrait-fallback' : ''}"><img src="${assetURL(person.art)}" alt="${escapeHtml(person.name)}" draggable="false"></span></button>`;
    }).join('') + `<div class="neighbor-labels">${ids.map(id => `<span data-label="${id}" hidden>${id === selected ? '<b>◆</b> ' : ''}${escapeHtml(catalog.get(id).name)}</span>`).join('')}</div>`;
    records = ids.map(id => ({ id, name: catalog.get(id).name, hit: art.querySelector(`[data-art="${id}"]`), figure: art.querySelector(`[data-art="${id}"] .art-figure`), label: art.querySelector(`[data-label="${id}"]`) }));
    compactRecords = compactIds.map(id => ({ id, node: portraits.querySelector(`[data-person="${id}"]`) }));
    lastInfoId = null;
  }

  function finishCatalog(index) {
    motion.jump(index);
    // Commit initial poses without tweening every newly mounted artwork from
    // its full-size CSS default; only expansion/motion should animate them.
    void art.offsetWidth;
    ribbon.classList.remove('is-rebuilding');
  }

  function align() {
    // Compact Characters now belong to the page heading's fixed center column,
    // not the dynamically resized three-column Workshop composition.
    compact.style.setProperty('--portrait-span', `${Math.min(420, $('.heading-carousel').clientWidth)}px`);
    paint();
  }
  function open() {
    const compactFocus = $('.ribbon-rest').contains(document.activeElement);
    ribbon.classList.add('expanded');
    $('#characterGallery').inert = false;
    compact.inert = true;
    compact.classList.add('is-hidden');
    $('#openGallery').setAttribute('aria-expanded', 'true');
    if (compactFocus) art.focus({ preventScroll: true });
  }
  function close({ returnFocus = false } = {}) {
    clearTimeout(wheelTimer);
    cancelDrag();
    motion.jump(ids.includes(selected) ? ids.indexOf(selected) : Math.round(motion.position));
    ribbon.classList.remove('expanded');
    $('#characterGallery').inert = true;
    compact.inert = false;
    compact.classList.remove('is-hidden');
    $('#openGallery').setAttribute('aria-expanded', 'false');
    if (returnFocus || $('#characterGallery').contains(document.activeElement)) $('#openGallery').focus({ preventScroll: true });
  }
  function browse(index, { keyboard = false } = {}) {
    if (!ids.length) return;
    open();
    motion.animate(index);
    if (keyboard) art.focus({ preventScroll: true });
  }
  function activate(id) {
    if (!id || performance.now() < suppressUntil || drag?.active) return;
    const index = ids.indexOf(id);
    if (!isOpen()) { open(); motion.animate(index); return; }
    if (!ids.length) return;
    if (motion.busy || Math.abs(motion.position - index) > .02) { browse(index); return; }
    selected = id;
    onSelect(id); // The only browsing path permitted to commit a Character.
    renderCatalog();
    finishCatalog(index);
    updateInformation(true);
    paint();
    close({ returnFocus: true });
  }

  function cancelDrag() {
    if (!drag) return;
    const previous = drag;
    if (previous.active) suppressUntil = performance.now() + 280;
    drag = null;
    if (previous.element.hasPointerCapture(previous.id)) previous.element.releasePointerCapture(previous.id);
    ribbon.classList.remove('is-dragging');
  }
  listen('pointerdown', event => {
    const element = event.target.closest('#galleryArt, #portraits');
    if (!element || !event.isPrimary || event.button !== 0 || drag) return;
    // Suppress the click produced by the previous drag, not a new intentional
    // gesture (for example reopening immediately after changing filters).
    suppressUntil = 0;
    if (!ids.length) return;
    motion.stop();
    drag = { id: event.pointerId, element, x: event.clientX, y: event.clientY, lastX: event.clientX, lastTime: performance.now(), active: false, vertical: false, velocity: 0 };
  });
  listen('pointermove', event => {
    if (!drag || event.pointerId !== drag.id || drag.vertical) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag.vertical = true; return; }
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      drag.active = true;
      drag.element.setPointerCapture(event.pointerId);
      ribbon.classList.add('is-dragging');
      open();
    }
    event.preventDefault();
    const now = performance.now(), dt = Math.max(8, now - drag.lastTime);
    const delta = -(event.clientX - drag.lastX) / (drag.element === portraits ? portraitStep : step());
    drag.velocity = drag.velocity * .68 + delta / dt * .32;
    drag.lastX = event.clientX; drag.lastTime = now;
    motion.jump(motion.position + delta);
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const active = drag.active;
    const velocity = event.type === 'pointercancel' || performance.now() - drag.lastTime > 90 ? 0 : drag.velocity;
    cancelDrag();
    if (active) { suppressUntil = performance.now() + 280; motion.release(velocity); }
    else motion.release(0);
  }
  listen('pointerup', endDrag);
  listen('pointercancel', endDrag);
  // Touch transfers implicit capture from the pressed button to this viewport.
  // Losing the old button capture is not the end of our captured gesture.
  listen('lostpointercapture', event => { if (drag?.id === event.pointerId && event.target === drag.element) { cancelDrag(); motion.release(0); } });
  listen('click', event => {
    const character = event.target.closest('[data-art], [data-person]');
    if (!character) return;
    if (performance.now() < suppressUntil) { event.preventDefault(); event.stopPropagation(); return; }
    activate(character.dataset.art ?? character.dataset.person);
  });
  listen('focusout', event => {
    const next = event.relatedTarget;
    if (next && next !== document.body && !contains(next)) queueMicrotask(() => {
      if (isOpen() && document.activeElement === next) close();
    });
  });
  listen('keydown', event => {
    if (event.key === 'Escape' && isOpen()) { event.preventDefault(); close({ returnFocus: true }); return; }
    if (!event.target.closest('[data-person], [data-art], #galleryArt, #openGallery')) return;
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? ids.length - 1 : Math.round(motion.target) + (event.key === 'ArrowRight' ? 1 : -1);
      browse(target, { keyboard: true });
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (event.target === art) { event.preventDefault(); if (!motion.busy) activate(focused); }
    }
  });
  listen('wheel', event => {
    if (!ids.length || !event.target.closest('#galleryArt, #portraits')) return;
    const delta = event.shiftKey ? event.deltaY : event.deltaX;
    if (Math.abs(delta) < 2 || !event.shiftKey && Math.abs(event.deltaY) > Math.abs(delta)) return;
    event.preventDefault();
    open();
    motion.jump(motion.position + delta / (event.deltaMode === 1 ? 8 : step()));
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => motion.release(0), 100);
  }, { passive: false });
  document.addEventListener('pointerdown', event => { if (isOpen() && !contains(event.target)) close(); });
  window.addEventListener('blur', () => { if (drag) { cancelDrag(); motion.release(0); } });
  reduced.addEventListener('change', () => { cancelDrag(); motion.jump(Math.round(motion.target)); });
  $('#openGallery').onclick = () => isOpen() ? close({ returnFocus: true }) : open();
  $('#closeGallery').onclick = () => close({ returnFocus: true });
  $('#characterGallery').addEventListener('click', event => {
    const button = event.target.closest('[data-filter], [data-element]');
    if (!button) return;
    cancelDrag(); motion.stop(); clearTimeout(wheelTimer);
    if (button.dataset.filter) filter = button.dataset.filter;
    if (button.dataset.element) element = button.dataset.element;
    ids = ordered.filter(id => (filter === 'all' || DEMO_ACCOUNT_IDS.includes(id)) && (element === 'all' || catalog.get(id).element === element));
    const next = ids.includes(focused) ? focused : ids.includes(selected) ? selected : ids[0];
    ribbon.querySelectorAll('[data-filter]').forEach(item => { item.classList.toggle('active', item.dataset.filter === filter); item.classList.toggle('selected', item.dataset.filter === filter); item.setAttribute('aria-pressed', item.dataset.filter === filter); });
    ribbon.querySelectorAll('[data-element]').forEach(item => { item.classList.toggle('selected', item.dataset.element === element); item.setAttribute('aria-pressed', item.dataset.element === element); });
    $('#emptyCatalog').hidden = ids.length > 0;
    renderCatalog();
    finishCatalog(ids.indexOf(next));
  });
  renderCatalog();
  finishCatalog(ids.indexOf(selected));
  new ResizeObserver(align).observe($('.heading-carousel'));
  window.addEventListener('resize', align);
  document.fonts?.ready.then(align);
  align();
  return { refresh: () => { updateInformation(true); paint(); }, close };
}
