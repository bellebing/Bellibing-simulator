let dispose = () => {};

export function clearPreviewScroll() {
 dispose();
 dispose = () => {};
}

export function installPreviewScroll(preview) {
 clearPreviewScroll();
 if (!preview) return;
 const root = preview.closest('#bcEditor');
 const cleanups = [attachScroll(preview, 'wb-preview-frame', 'Scroll preview', {anchor: root, edge: 'right'})];
 for (const catalog of root.querySelectorAll('.wc-catalog')) cleanups.push(attachScroll(catalog, 'wb-catalog-frame', 'Scroll catalogue', {anchor: preview, edge: 'left'}));
 for (const list of root.querySelectorAll('.wc-sequence-list')) cleanups.push(attachScroll(list, 'wb-list-frame', 'Scroll Sequences'));
 for (const menu of root.querySelectorAll('.wb-sonata-filter > .bc-options')) cleanups.push(attachScroll(menu, 'wb-menu-frame', 'Scroll Sonata Sets'));
 dispose = () => cleanups.forEach(cleanup => cleanup());
}

function attachScroll(preview, className, label, {anchor = null, edge = 'right'} = {}) {
 const frame = document.createElement('div');
 frame.className = 'wb-scroll-frame ' + className;
 preview.before(frame);
 frame.append(preview);
 const control = document.createElement('input');
 control.type = 'range';
 control.min = '0';
 control.step = '1';
 control.className = 'wb-edge-scroll';
 control.setAttribute('aria-label', label);
 frame.append(control);

 const events = new AbortController();
 let scheduled = 0;
 const update = () => {
  const border = (anchor ?? frame).getBoundingClientRect();
  const frameBounds = frame.getBoundingClientRect();
  const edgePosition = edge === 'left' ? border.left : border.right;
  const scale = frameBounds.width / frame.offsetWidth || 1;
  control.style.left = ((edgePosition - frameBounds.left) / scale - 6.5) + 'px';
  control.style.right = 'auto';
  const maximum = Math.max(0, preview.scrollHeight - preview.clientHeight);
  control.hidden = maximum < 2;
  control.max = String(maximum);
  control.value = String(preview.scrollTop);
  control.setAttribute('aria-valuetext', maximum ? Math.round(preview.scrollTop / maximum * 100) + '%' : '0%');
 };
 const schedule = () => {
  cancelAnimationFrame(scheduled);
  scheduled = requestAnimationFrame(update);
 };
 preview.addEventListener('scroll', update, {signal: events.signal, passive: true});
 window.addEventListener('resize', schedule, {signal: events.signal});
 if (anchor) anchor.addEventListener('animationend', schedule, {signal: events.signal});
 control.addEventListener('input', () => { preview.scrollTop = Number(control.value); }, {signal: events.signal});
 const resize = new ResizeObserver(schedule);
 resize.observe(preview);
 if (anchor) resize.observe(anchor);
 for (const child of preview.children) resize.observe(child);
 const changes = new MutationObserver(schedule);
 changes.observe(preview, {subtree: true, attributes: true, childList: true, characterData: true});
 const cleanup = () => {
  events.abort();
  resize.disconnect();
  changes.disconnect();
  cancelAnimationFrame(scheduled);
 };
 update();
 return cleanup;
}

export function installFixedScroll(port, className, label, options) {
 const cleanup = attachScroll(port, className, label, options);
 const release = () => {
  window.removeEventListener("pagehide", release);
  cleanup();
 };
 window.addEventListener("pagehide", release, {once: true});
 return release;
}

