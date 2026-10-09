import { parseInventoryQuantity, formatInventoryQuantity } from '../../assets/resourceInventory.js';
const DETENTS = [-1, 0, 5, 10, 20];
const STEP = 6, SOFT = 5;
const coordinate = value => value * STEP + DETENTS.filter(detent => detent < value).length * SOFT;
/** Inverse piecewise coordinate: every integer stays reachable. Extra detent
 * width is finite, and fractional movement accumulates from the gesture anchor. */
export function scrubResourceValue(start, pixels) {
  if (!Number.isSafeInteger(start) || start < -1 || !Number.isFinite(pixels)) throw new RangeError('Invalid scrub coordinate');
  // Keep large anchors in integer space; multiplying a safe count by the
  // pixel step would lose individual integers near MAX_SAFE_INTEGER.
  const linear = start + Math.round(pixels / STEP);
  if(start > 1000 && linear > 1000) return Math.min(Number.MAX_SAFE_INTEGER, linear);
  const position = coordinate(start) + pixels;
  let extra = 0;
  for (const detent of DETENTS) {
    const point = detent * STEP + extra;
    if (position <= point + SOFT / 2) break;
    extra += SOFT;
  }
  return Math.max(-1, Math.min(Number.MAX_SAFE_INTEGER, Math.round((position - extra) / STEP)));
}
export function attachResourceScrubber(input, commit) {
  let gesture = null, suppressClick = false, listeners = null;
  input.classList.add('resource-scrubber');
  input.setAttribute('role', 'spinbutton'); input.setAttribute('aria-valuemin', '0');
  const accessible = () => {
    input.setAttribute('aria-valuetext', input.value === '∞' ? 'Unlimited' : input.value);
    try { const q = parseInventoryQuantity(input.value); if(q.kind === 'FINITE') input.setAttribute('aria-valuenow', String(q.count)); else input.removeAttribute('aria-valuenow'); } catch { input.removeAttribute('aria-valuenow'); }
  };
  input.addEventListener('dragstart', event => event.preventDefault());
  accessible(); input.addEventListener('input', accessible); input.addEventListener('change', accessible);
  input.addEventListener('pointerdown', event => {
    if (event.button !== 0 || input.disabled) return;
    let quantity; try { quantity = parseInventoryQuantity(input.value); } catch { return; }
    event.preventDefault(); input.focus({ preventScroll: true });
    gesture = { id: event.pointerId, x: event.clientX, start: quantity.kind === 'UNLIMITED' ? -1 : quantity.count, text: input.value, moved: false };
    input.setPointerCapture(event.pointerId);
    listeners = new AbortController(); const target = input.ownerDocument ?? input;
    target.addEventListener('pointermove', move, { signal: listeners.signal });
    target.addEventListener('pointerup', released, { signal: listeners.signal });
    target.addEventListener('pointercancel', cancelled, { signal: listeners.signal });
  });
  function move(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const pixels = event.clientX - gesture.x;
    if (!gesture.moved && Math.abs(pixels) < 4) return;
    gesture.moved = true; event.preventDefault(); input.classList.add('is-scrubbing');
    const value = scrubResourceValue(gesture.start, pixels);
    input.value = value === -1 ? '∞' : String(value); accessible();
  }
  function finish(event, cancelled) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const previous = gesture; gesture = null; listeners?.abort(); listeners = null; input.classList.remove('is-scrubbing');
    if (input.hasPointerCapture(event.pointerId)) input.releasePointerCapture(event.pointerId);
    if (cancelled) input.value = previous.text;
    else if (previous.moved) { suppressClick = true; commit(); }
    else input.select();
    accessible();
  }
  const released = event => finish(event, false), cancelled = event => finish(event, true);
  input.addEventListener('lostpointercapture', event => finish(event, true));
  input.addEventListener('click', event => { if (suppressClick) { suppressClick = false; event.preventDefault(); event.stopPropagation(); } });
  input.addEventListener('keydown', event => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    let quantity; try { quantity = parseInventoryQuantity(input.value); } catch { return; }
    event.preventDefault();
    const start = quantity.kind === 'UNLIMITED' ? -1 : quantity.count;
    const value = Math.max(-1, Math.min(Number.MAX_SAFE_INTEGER, start + (event.key === 'ArrowUp' ? 1 : -1)));
    input.value = formatInventoryQuantity(value < 0 ? { kind: 'UNLIMITED' } : { kind: 'FINITE', count: value }); commit(); accessible();
  });
}
