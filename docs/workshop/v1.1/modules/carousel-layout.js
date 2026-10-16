// Presentation geometry only. Preserve the approved scale hierarchy while
// spacing each interval by the visible widths of its two neighboring figures.
const scales = [1, .84, .68, .55, .46];
export function artworkScale(distance) {
  const absolute = Math.abs(distance), level = Math.min(4, Math.floor(absolute));
  const fraction = Math.min(4, absolute) - level;
  return level < 4 ? scales[level] + (scales[level + 1] - scales[level]) * fraction : Math.max(.3, .46 - (absolute - 4) * .06);
}
export function artworkOffset(distance, width) {
  const absolute = Math.abs(distance), whole = Math.floor(absolute);
  const overlaps = [.27, .18, .08, .025];
  const air = Math.max(0, Math.min(4, (width - 960) / 160));
  const interval = index => {
    const near = 252 * artworkScale(index), far = 252 * artworkScale(index + 1);
    return (near + far) / 2 - far * (overlaps[index] ?? 0) + air;
  };
  let offset = 0;
  for (let index = 0; index < whole; index++) offset += interval(index);
  offset += interval(whole) * (absolute - whole);
  return Math.sign(distance) * offset;
}
