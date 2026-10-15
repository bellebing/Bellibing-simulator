import { CHARACTER_CATALOG } from './catalog.js';
import { DEMO_ACCOUNT_IDS, DEMO_FEATURED_IDS, previewSnapshot } from './lab-state.js';
import { $, assetURL, escapeHtml } from './util.js';

export function mountCarousel({ selectedId, onSelect }) {
  const ribbon = $('#characterCarousel');
  const catalog = new Map(CHARACTER_CATALOG.map(person => [person.id, person]));
  const ordered = [...DEMO_FEATURED_IDS, ...CHARACTER_CATALOG.map(person => person.id).filter(id => !DEMO_FEATURED_IDS.includes(id))];
  const pageSize = 9;
  let selected = selectedId;
  let focused = selectedId;
  let filter = 'all';
  let start = 0;
  let pinned = false;
  let closeTimer, hoverTimer;
  let touchStart = null;
  let lastPointerType = 'mouse';
  let suppressFocus = false;

  const filtered = () => ordered.filter(id => filter === 'all' || DEMO_ACCOUNT_IDS.includes(id));
  const windowIds = () => filtered().slice(start, start + pageSize);
  const isOpen = () => ribbon.classList.contains('expanded');

  function align() {
    const workshop = $('.workshop').getBoundingClientRect();
    const heading = $('.page-heading').getBoundingClientRect();
    const anchor = $('#carouselAnchor');
    anchor.style.left = `${workshop.left + scrollX + 1}px`;
    anchor.style.top = `${heading.top + scrollY + 18}px`;
    anchor.style.width = `${workshop.width - 2}px`;
    paint();
  }

  function renderWindow() {
    const ids = windowIds();
    const all = filtered();
    $('#portraits').innerHTML = ids.map(id => {
      const person = catalog.get(id);
      return `<button class="portrait ${id === selected ? 'selected' : ''} ${DEMO_ACCOUNT_IDS.includes(id) ? '' : 'catalog'}" data-person="${id}" aria-label="${escapeHtml(person.name)}, ${DEMO_ACCOUNT_IDS.includes(id) ? 'on demo account' : 'not on demo account'}, ${all.indexOf(id) + 1} of ${all.length}" aria-pressed="${id === selected}" tabindex="${id === focused ? '0' : '-1'}"><img src="${assetURL(person.face)}" alt="${escapeHtml(person.name)}" draggable="false"></button>`;
    }).join('');
    $('#galleryArt').innerHTML = ids.map(id => {
      const person = catalog.get(id);
      return `<button class="art-hit" data-art="${id}" aria-label="Select ${escapeHtml(person.name)}" tabindex="-1"><span class="art-figure ${person.artStatus === 'PORTRAIT_FALLBACK' ? 'portrait-fallback' : ''}"><img src="${assetURL(person.art)}" alt="${escapeHtml(person.name)}" draggable="false"></span></button>`;
    }).join('') + '<div id="neighborLabels" class="neighbor-labels"></div>';
    $('#portraitPrevious').disabled = start === 0;
    $('#portraitNext').disabled = start + pageSize >= all.length;
    paint();
  }

  function paint() {
    const ids = windowIds();
    const focusIndex = ids.indexOf(focused);
    const count = ids.length;
    const area = $('#galleryArt').clientWidth;
    const step = Math.min(112, (area - 270) / Math.max(count - 1, 1));
    const midpoint = (count - 1) / 2;
    $('#portraits').querySelectorAll('[data-person]').forEach(button => {
      button.classList.toggle('selected', button.dataset.person === selected);
      button.setAttribute('aria-pressed', button.dataset.person === selected);
      button.tabIndex = button.dataset.person === focused ? 0 : -1;
    });
    $('#galleryArt').querySelectorAll('[data-art]').forEach((hit, index) => {
      const distance = index - focusIndex;
      const absolute = Math.abs(distance);
      const scale = absolute === 0 ? 1 : absolute === 1 ? .84 : absolute === 2 ? .68 : absolute === 3 ? .55 : .46;
      hit.style.left = `calc(50% + ${(index - midpoint) * step}px)`;
      hit.style.zIndex = String(30 - absolute);
      hit.classList.toggle('is-focus', hit.dataset.art === focused);
      hit.querySelector('.art-figure').style.transform = `translateX(-50%) translateY(${absolute === 0 ? -4 : 0}px) rotateY(${distance === 0 ? 0 : distance > 0 ? -9 : 9}deg) scale(${scale})`;
      hit.querySelector('.art-figure').style.opacity = absolute > 3 ? .43 : absolute === 3 ? .58 : absolute === 2 ? .76 : 1;
    });
    const labels = $('#neighborLabels');
    if (labels) labels.innerHTML = ids.map((id, index) => {
      const distance = Math.abs(index - focusIndex);
      return distance > 0 && distance <= 2 ? `<span style="left:calc(50% + ${(index - midpoint) * step}px)">${id === selected ? '<b>◆</b> ' : ''}${escapeHtml(catalog.get(id).name)}</span>` : '';
    }).join('');
    const person = catalog.get(focused);
    if (!person) return;
    const preview = previewSnapshot(focused);
    const info = $('#focusedInfo');
    info.style.left = `${Math.max(200, Math.min(area - 200, area / 2 + (focusIndex - midpoint) * step)) + 20}px`;
    info.classList.toggle('no-data', !preview.hasBuild);
    info.innerHTML = `<div class="focus-caption">${focused === selected ? 'SELECTED CHARACTER' : 'PREVIEW'}${person.artStatus === 'PORTRAIT_FALLBACK' ? ' · HERO ART PENDING' : ''}</div>
      <div class="focus-name">${escapeHtml(person.name)}${!preview.onAccount ? '<span class="membership">CATALOG · NOT ON DEMO ACCOUNT</span>' : ''}</div>
      <div class="focus-meta">${preview.hasBuild ? `${escapeHtml(preview.weapon)} <i>·</i> ${Array.from({ length: 5 }, (_, index) => `<span class="socket ${index >= preview.slots ? 'empty' : ''}"></span>`).join('')} ${preview.slots}/5 Echoes` : 'No saved demo build'}</div>
      <div class="focus-stats">${['ATK', 'CRIT RATE', 'CRIT DMG'].map((label, index) => `<div><strong>${escapeHtml(preview.stats[index])}</strong><span>${label}</span></div>`).join('')}</div>`;
    $('.current-name strong').textContent = catalog.get(selected).name;
    $('#galleryPosition').textContent = `${filtered().indexOf(focused) + 1} / ${filtered().length} · DEMONSTRATION BUILDS`;
  }

  function open() {
    clearTimeout(closeTimer);
    ribbon.classList.add('expanded');
    $('#characterGallery').inert = false;
    $('#openGallery').setAttribute('aria-expanded', 'true');
    paint();
  }

  function close({ returnFocus = false } = {}) {
    clearTimeout(hoverTimer);
    ribbon.classList.remove('expanded');
    $('#characterGallery').inert = true;
    $('#openGallery').setAttribute('aria-expanded', 'false');
    if (returnFocus) $('#openGallery').focus({ preventScroll: true });
  }

  function ensureVisible(id) {
    const index = filtered().indexOf(id);
    if (index < start || index >= start + pageSize) {
      start = Math.max(0, Math.min(filtered().length - pageSize, index - 4));
      renderWindow();
    }
  }

  function preview(id) {
    if (!filtered().includes(id)) return;
    focused = id;
    ensureVisible(id);
    open();
  }

  function select(id) {
    selected = id;
    focused = id;
    pinned = false;
    onSelect(id);
    paint();
    suppressFocus = true;
    ribbon.querySelector(`[data-person="${id}"]`)?.focus({ preventScroll: true });
    suppressFocus = false;
    close();
  }

  function moveFocus(direction) {
    const ids = filtered();
    const index = ids.indexOf(focused);
    preview(ids[Math.max(0, Math.min(ids.length - 1, index + direction))]);
    suppressFocus = true;
    ribbon.querySelector(`[data-person="${focused}"]`)?.focus({ preventScroll: true });
    suppressFocus = false;
  }

  function page(direction) {
    const ids = filtered();
    start = Math.max(0, Math.min(Math.max(0, ids.length - pageSize), start + direction * 5));
    focused = ids[Math.min(start + 4, ids.length - 1)];
    renderWindow();
    pinned = true;
    open();
  }

  ribbon.addEventListener('pointerdown', event => {
    lastPointerType = event.pointerType;
    if (event.pointerType === 'touch') touchStart = { open: isOpen(), focused };
  }, true);
  ribbon.addEventListener('keydown', () => { lastPointerType = 'keyboard'; });
  $('#portraits').addEventListener('pointerover', event => {
    const button = event.target.closest('[data-person]');
    if (!button || event.pointerType === 'touch') return;
    clearTimeout(hoverTimer);
    if (isOpen()) preview(button.dataset.person);
    else hoverTimer = setTimeout(() => preview(button.dataset.person), 120);
  });
  $('#portraits').addEventListener('pointerout', event => {
    if (!event.relatedTarget?.closest?.('[data-person]')) clearTimeout(hoverTimer);
  });
  $('#portraits').addEventListener('focusin', event => {
    const button = event.target.closest('[data-person]');
    if (button && !suppressFocus && lastPointerType !== 'touch') preview(button.dataset.person);
  });
  $('#portraits').addEventListener('click', event => {
    const button = event.target.closest('[data-person]');
    if (!button) return;
    const id = button.dataset.person;
    if (event.pointerType === 'touch' && touchStart && (!touchStart.open || touchStart.focused !== id)) {
      pinned = true;
      preview(id);
    } else select(id);
  });
  $('#galleryArt').addEventListener('pointermove', event => {
    const button = event.target.closest('[data-art]');
    if (button && event.pointerType !== 'touch' && button.dataset.art !== focused) preview(button.dataset.art);
  });
  $('#galleryArt').addEventListener('click', event => {
    const button = event.target.closest('[data-art]');
    if (!button) return;
    if (event.pointerType === 'touch' && touchStart?.focused !== button.dataset.art) preview(button.dataset.art);
    else select(button.dataset.art);
  });
  ribbon.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  ribbon.addEventListener('pointerleave', () => {
    clearTimeout(hoverTimer);
    if (!pinned) closeTimer = setTimeout(() => close(), 420);
  });
  ribbon.addEventListener('focusout', () => queueMicrotask(() => {
    if (!ribbon.contains(document.activeElement) && !pinned) close();
  }));
  ribbon.addEventListener('keydown', event => {
    const browsing = event.target.closest('[data-person], [data-art], #openGallery');
    if (browsing && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Home' || event.key === 'End') {
        const ids = filtered();
        preview(event.key === 'Home' ? ids[0] : ids.at(-1));
        suppressFocus = true;
        ribbon.querySelector(`[data-person="${focused}"]`)?.focus({ preventScroll: true });
        suppressFocus = false;
      } else moveFocus(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      pinned = false;
      close({ returnFocus: true });
    } else if (event.key === 'Enter' && event.target.closest('[data-person], [data-art]')) {
      event.preventDefault();
      select(focused);
    }
  });
  document.addEventListener('pointerdown', event => {
    if (isOpen() && !ribbon.contains(event.target)) { pinned = false; close(); }
  });
  $('#openGallery').onclick = () => { if (isOpen()) { pinned = false; close(); } else { pinned = true; open(); } };
  $('#closeGallery').onclick = () => { pinned = false; close({ returnFocus: true }); };
  $('#portraitPrevious').onclick = () => page(-1);
  $('#portraitNext').onclick = () => page(1);
  $('.filter').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filter = button.dataset.filter;
    start = 0;
    if (!filtered().includes(focused)) focused = filtered().includes(selected) ? selected : filtered()[0];
    ensureVisible(focused);
    ribbon.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', item === button);
    });
    renderWindow();
  });
  new ResizeObserver(align).observe($('.workshop'));
  window.addEventListener('resize', align);
  document.fonts?.ready.then(align);
  renderWindow();
  align();
  return { refresh: paint, close: () => { pinned = false; close(); } };
}
