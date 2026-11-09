// Presentation motion only. Adapted from production FreewheelCarousel's bounded
// projection/settling pattern; no production layout or build state is imported.
export function clampPosition(position, maximum) {
  return Math.max(0, Math.min(maximum, position));
}
export function snapTarget(position, velocity, maximum, reduced = false) {
  const carry = reduced ? 0 : Math.max(-6, Math.min(6, velocity * 320));
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
  function jump(value, directInput = false) {
    stop();
    position = target = clampPosition(value, maximum());
    paint(position, directInput);
  }
  function animate(value) {
    stop();
    target = clampPosition(value, maximum());
    if (reduced() || Math.abs(position - target) < .001) { jump(target); return; }
    const from = position;
    const destination = target;
    const duration = Math.min(680, 300 + Math.abs(destination - from) * 60);
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      position = from + (destination - from) * (1 - (1 - progress) ** 3);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else { position = target = destination; frame = 0; }
      paint(position, !!frame);
    }
    frame = requestAnimationFrame(tick);
    paint(position, true);
  }
  function release(velocity) {
    const destination = snapTarget(position, velocity, maximum(), reduced());
    if (reduced() || Math.abs(velocity) < .0004) { animate(destination); return; }
    stop();
    const from = position;
    const speed = Math.max(-6 / 320, Math.min(6 / 320, velocity));
    const start = performance.now();
    target = destination;
    function tick(now) {
      const elapsed = now - start;
      const decay = Math.exp(-elapsed / 320);
      const projected = from + speed * 320 * (1 - decay);
      position = clampPosition(projected, maximum());
      if (Math.abs(speed * decay) < .0004 || elapsed >= 1500 || position !== projected) {
        animate(destination);
        return;
      }
      frame = requestAnimationFrame(tick);
      paint(position, true);
    }
    frame = requestAnimationFrame(tick);
    paint(position, true);
  }
  return {
    stop, jump, animate, release,
    get position() { return position; },
    get target() { return target; },
    get busy() { return !!frame; },
  };
}
