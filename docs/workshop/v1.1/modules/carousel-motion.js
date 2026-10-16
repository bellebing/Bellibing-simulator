// Presentation motion only. Adapted from production FreewheelCarousel's bounded
// projection/settling pattern; no production layout or build state is imported.
export function clampPosition(position, maximum) {
  return Math.max(0, Math.min(maximum, position));
}
export function snapTarget(position, velocity, maximum, reduced = false) {
  const carry = reduced ? 0 : Math.max(-1.5, Math.min(1.5, velocity * 170));
  return Math.round(clampPosition(position + carry, maximum));
}
export function createCarouselMotion({ initial, maximum, paint, reduced }) {
  let position = initial;
  let target = initial;
  let frame = 0;
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    target = position;
  }
  function jump(value) {
    stop();
    position = target = clampPosition(value, maximum());
    paint(position, false);
  }
  function animate(value) {
    stop();
    target = clampPosition(value, maximum());
    if (reduced() || Math.abs(position - target) < .001) { jump(target); return; }
    const from = position;
    const destination = target;
    const duration = Math.min(520, 280 + Math.abs(destination - from) * 55);
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      position = from + (destination - from) * (1 - (1 - progress) ** 4);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else { position = target = destination; frame = 0; }
      paint(position, !!frame);
    }
    frame = requestAnimationFrame(tick);
    paint(position, true);
  }
  return {
    stop, jump, animate,
    release(velocity) { animate(snapTarget(position, velocity, maximum(), reduced())); },
    get position() { return position; },
    get target() { return target; },
    get busy() { return !!frame; },
  };
}
