import { CHARACTER_CATALOG } from './catalog.js';
import { DEMO_ACCOUNT_IDS, DEMO_FEATURED_IDS, previewSnapshot } from './lab-state.js';
import { createCarouselMotion, clampPosition } from './carousel-motion.js';
import { $, assetURL, escapeHtml } from './util.js';

export function mountCarousel({ selectedId, onSelect }) {
  const ribbon = $('#characterCarousel');
  const art = $('#galleryArt');
  const portraits = $('#portraits');
  const catalog = new Map(CHARACTER_CATALOG.map(person => [person.id, person]));
  const ordered = [...DEMO_FEATURED_IDS, ...CHARACTER_CATALOG.map(person => person.id).filter(id => !DEMO_FEATURED_IDS.includes(id))];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let ids = ordered;
  let selected = selectedId;
  let focused = selectedId;
  let filter = 'all';
  let records = [];
  let pinned = false;
  let drag = null;
  let suppressUntil = 0;
  let closeTimer, hoverTimer, wheelTimer;
  let lastInfoId = null;
  const isOpen = () => ribbon.classList.contains('expanded');
  const step = () => Math.min(112, Math.max(88, (art.clientWidth - 270) / 8));
  const portraitStep = 52;
  const motion = createCarouselMotion({ initial: ids.indexOf(selected), maximum: () => ids.length - 1, paint, reduced: () => reduced.matches });

  function updateInformation(force = false) {
    if (focused === lastInfoId && !force) return;
    lastInfoId = focused;
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
    const spacing = step();
    const portraitRange = portraits.clientWidth / 2 + 20;
    records.forEach((record, index) => {
      const distance = index - position;
      const absolute = Math.abs(distance);
      const level = Math.min(4, Math.floor(absolute)), fraction = Math.min(4, absolute) - level;
      const scales = [1, .84, .68, .55, .46], opacities = [1, 1, .76, .58, .43];
      const scale = level < 4 ? scales[level] + (scales[level + 1] - scales[level]) * fraction : Math.max(.3, .46 - (absolute - 4) * .06);
      const opacity = level < 4 ? opacities[level] + (opacities[level + 1] - opacities[level]) * fraction : Math.max(.25, .43 - (absolute - 4) * .06);
      const artVisible = absolute * spacing < art.clientWidth / 2 + 145;
      record.hit.style.left = `calc(50% + ${distance * spacing}px)`;
      record.hit.style.zIndex = String(40 - Math.round(absolute * 5));
      record.hit.style.visibility = artVisible ? 'visible' : 'hidden';
      record.hit.style.pointerEvents = artVisible ? '' : 'none';
      record.hit.classList.toggle('is-focus', record.id === focused);
      record.hit.classList.toggle('is-selected', record.id === selected);
      record.hit.setAttribute('aria-label', `${record.id === focused ? 'Select' : 'Center'} ${record.name}, ${index + 1} of ${ids.length}`);
      record.hit.setAttribute('aria-pressed', record.id === selected);
      record.figure.style.transform = `translateX(-50%) translateY(${-4 * Math.max(0, 1 - absolute)}px) rotateY(${Math.max(-9, Math.min(9, -distance * 9))}deg) scale(${scale})`;
      record.figure.style.opacity = String(opacity);
      record.figure.style.setProperty('--compact-dx', `${distance * (portraitStep - spacing)}px`);
      record.portrait.style.left = `calc(50% + ${distance * portraitStep}px)`;
      record.portrait.style.visibility = Math.abs(distance * portraitStep) < portraitRange ? 'visible' : 'hidden';
      record.portrait.classList.toggle('selected', record.id === selected);
      record.portrait.classList.toggle('is-preview', record.id === focused && record.id !== selected);
      record.portrait.setAttribute('aria-pressed', record.id === selected);
      record.portrait.tabIndex = record.id === focused ? 0 : -1;
      record.label.style.left = `calc(50% + ${distance * spacing}px)`;
      record.label.hidden = absolute < .7 || absolute > 2.7;
    });
    $('#portraitPrevious').disabled = position <= .001;
    $('#portraitNext').disabled = position >= ids.length - 1 - .001;
    ribbon.classList.toggle('is-moving', !!drag?.active || moving);
    ribbon.dataset.focusedCharacter = focused;
    ribbon.dataset.position = position.toFixed(4);
    ribbon.dataset.motion = drag?.active ? 'dragging' : moving ? 'settling' : 'settled';
    const name = catalog.get(selected).name;
    if ($('.current-name strong').textContent !== name) $('.current-name strong').textContent = name;
    const status = `WORKING ON ${name.toUpperCase()}${focused !== selected ? ' · PREVIEW ONLY' : ''}`;
    if ($('#galleryStatus').textContent !== status) $('#galleryStatus').textContent = status;
    const positionLabel = `${ids.indexOf(focused) + 1} / ${ids.length} · DEMONSTRATION BUILDS`;
    if ($('#galleryPosition').textContent !== positionLabel) $('#galleryPosition').textContent = positionLabel;
    updateInformation();
    if (!moving && !drag?.active) {
      const announcement = `${focused === selected ? 'Selected' : 'Preview'} ${catalog.get(focused).name}, ${ids.indexOf(focused) + 1} of ${ids.length}. Working on ${name}.`;
      if ($('#carouselAnnouncement').textContent !== announcement) $('#carouselAnnouncement').textContent = announcement;
    }
  }

  function renderCatalog() {
    portraits.innerHTML = ids.map((id, index) => {
      const person = catalog.get(id);
      return `<button class="portrait ${DEMO_ACCOUNT_IDS.includes(id) ? '' : 'catalog'}" data-person="${id}" aria-label="Browse ${escapeHtml(person.name)}, ${DEMO_ACCOUNT_IDS.includes(id) ? 'on demo account' : 'not on demo account'}, ${index + 1} of ${ids.length}" tabindex="-1"><img src="${assetURL(person.face)}" alt="${escapeHtml(person.name)}" draggable="false"></button>`;
    }).join('');
    art.innerHTML = ids.map(id => {
      const person = catalog.get(id);
      return `<button class="art-hit" data-art="${id}" tabindex="-1"><span class="art-figure ${person.artStatus === 'PORTRAIT_FALLBACK' ? 'portrait-fallback' : ''}"><img src="${assetURL(person.art)}" alt="${escapeHtml(person.name)}" draggable="false"></span></button>`;
    }).join('') + `<div class="neighbor-labels">${ids.map(id => `<span data-label="${id}" hidden>${id === selected ? '<b>◆</b> ' : ''}${escapeHtml(catalog.get(id).name)}</span>`).join('')}</div>`;
    records = ids.map(id => ({ id, name: catalog.get(id).name, hit: art.querySelector(`[data-art="${id}"]`), figure: art.querySelector(`[data-art="${id}"] .art-figure`), portrait: portraits.querySelector(`[data-person="${id}"]`), label: art.querySelector(`[data-label="${id}"]`) }));
    lastInfoId = null;
  }

  function align() {
    const workshop = $('.workshop').getBoundingClientRect();
    const heading = $('.page-heading').getBoundingClientRect();
    const anchor = $('#carouselAnchor');
    anchor.style.left = `${workshop.left + scrollX + 1}px`;
    anchor.style.top = `${heading.top + scrollY + 18}px`;
    anchor.style.width = `${workshop.width - 2}px`;
    const right = Math.min(workshop.right - 1, $('.demo-note').getBoundingClientRect().left - 18);
    const inset = Math.max(0, workshop.right - 1 - right);
    const center = workshop.left + workshop.width / 2;
    const filterLeft = right - 34 - $('.filter').offsetWidth;
    const titleRight = $('h1').getBoundingClientRect().right;
    const span = Math.max(272, Math.min(420, 2 * (filterLeft - center - 52), 2 * (center - titleRight - 70)));
    ribbon.style.setProperty('--controls-inset', `${inset}px`);
    ribbon.style.setProperty('--portrait-span', `${span}px`);
    paint();
  }
  function open({ pin = false } = {}) {
    clearTimeout(closeTimer);
    if (pin) pinned = true;
    ribbon.classList.add('expanded');
    $('#characterGallery').inert = false;
    $('#openGallery').setAttribute('aria-expanded', 'true');
  }
  function close({ returnFocus = false } = {}) {
    clearTimeout(hoverTimer); clearTimeout(closeTimer); clearTimeout(wheelTimer);
    cancelDrag();
    motion.jump(Math.round(motion.position));
    pinned = false;
    ribbon.classList.remove('expanded');
    $('#characterGallery').inert = true;
    $('#openGallery').setAttribute('aria-expanded', 'false');
    if (returnFocus || $('#characterGallery').contains(document.activeElement)) $('#openGallery').focus({ preventScroll: true });
  }
  function browse(index, { keyboard = false } = {}) {
    open({ pin: true });
    motion.animate(index);
    if (keyboard) art.focus({ preventScroll: true });
  }
  function activate(id) {
    if (performance.now() < suppressUntil || drag?.active) return;
    const index = ids.indexOf(id);
    if (!isOpen()) { open({ pin: true }); motion.animate(index); return; }
    if (motion.busy || Math.abs(motion.position - index) > .02) { browse(index); return; }
    selected = id;
    onSelect(id); // The only browsing path permitted to commit a Character.
    records.forEach(record => { record.label.innerHTML = `${record.id === selected ? '<b>◆</b> ' : ''}${escapeHtml(record.name)}`; });
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
  ribbon.addEventListener('pointerdown', event => {
    const element = event.target.closest('#galleryArt, #portraits');
    if (!element || !event.isPrimary || event.button !== 0 || drag) return;
    motion.stop();
    drag = { id: event.pointerId, element, x: event.clientX, y: event.clientY, lastX: event.clientX, lastTime: performance.now(), active: false, vertical: false, velocity: 0 };
  });
  ribbon.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id || drag.vertical) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag.vertical = true; return; }
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      drag.active = true;
      drag.element.setPointerCapture(event.pointerId);
      ribbon.classList.add('is-dragging');
      open({ pin: true });
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
  ribbon.addEventListener('pointerup', endDrag);
  ribbon.addEventListener('pointercancel', endDrag);
  // Touch transfers implicit capture from the pressed button to this viewport.
  // Losing the old button capture is not the end of our captured gesture.
  ribbon.addEventListener('lostpointercapture', event => { if (drag?.id === event.pointerId && event.target === drag.element) { cancelDrag(); motion.release(0); } });
  ribbon.addEventListener('click', event => {
    const character = event.target.closest('[data-art], [data-person]');
    if (!character) return;
    if (performance.now() < suppressUntil) { event.preventDefault(); event.stopPropagation(); return; }
    activate(character.dataset.art ?? character.dataset.person);
  });
  portraits.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || isOpen()) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => open(), 140);
  });
  portraits.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
  // Hovering gallery artwork never moves focus; the collection responds to intent.
  ribbon.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  ribbon.addEventListener('pointerleave', () => {
    clearTimeout(hoverTimer);
    if (!pinned && !drag) closeTimer = setTimeout(() => close(), 480);
  });
  ribbon.addEventListener('focusout', event => {
    const next = event.relatedTarget;
    if (next && next !== document.body && !ribbon.contains(next)) queueMicrotask(() => {
      if (isOpen() && document.activeElement === next) close();
    });
  });
  ribbon.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen()) { event.preventDefault(); close({ returnFocus: true }); return; }
    if (!event.target.closest('[data-person], [data-art], #galleryArt, #openGallery, .ribbon-arrow')) return;
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? ids.length - 1 : Math.round(motion.target) + (event.key === 'ArrowRight' ? 1 : -1);
      browse(target, { keyboard: true });
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (event.target === art) { event.preventDefault(); if (!motion.busy) activate(focused); }
    }
  });
  ribbon.addEventListener('wheel', event => {
    if (!event.target.closest('#galleryArt, #portraits')) return;
    const delta = event.shiftKey ? event.deltaY : event.deltaX;
    if (Math.abs(delta) < 2 || !event.shiftKey && Math.abs(event.deltaY) > Math.abs(delta)) return;
    event.preventDefault();
    open({ pin: true });
    motion.jump(motion.position + delta / (event.deltaMode === 1 ? 8 : step()));
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => motion.release(0), 100);
  }, { passive: false });
  document.addEventListener('pointerdown', event => { if (isOpen() && !ribbon.contains(event.target)) close(); });
  window.addEventListener('blur', () => { if (drag) { cancelDrag(); motion.release(0); } });
  reduced.addEventListener('change', () => { cancelDrag(); motion.jump(Math.round(motion.target)); });
  $('#openGallery').onclick = () => isOpen() ? close({ returnFocus: true }) : open({ pin: true });
  $('#closeGallery').onclick = () => close({ returnFocus: true });
  $('#portraitPrevious').onclick = () => browse(Math.round(motion.target) - 1);
  $('#portraitNext').onclick = () => browse(Math.round(motion.target) + 1);
  $('.filter').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    cancelDrag(); motion.stop(); clearTimeout(wheelTimer);
    filter = button.dataset.filter;
    ids = ordered.filter(id => filter === 'all' || DEMO_ACCOUNT_IDS.includes(id));
    const next = ids.includes(focused) ? focused : ids.includes(selected) ? selected : ids[0];
    ribbon.querySelectorAll('[data-filter]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', item === button); });
    renderCatalog();
    motion.jump(ids.indexOf(next));
  });
  renderCatalog();
  motion.jump(ids.indexOf(selected));
  new ResizeObserver(align).observe($('.workshop'));
  // Panel intent changes grid columns in one task; align before the next paint.
  new MutationObserver(align).observe($('#composition'), { attributes: true, attributeFilter: ['style'] });
  window.addEventListener('resize', align);
  document.fonts?.ready.then(align);
  align();
  return { refresh: () => { updateInformation(true); paint(); }, close };
}
