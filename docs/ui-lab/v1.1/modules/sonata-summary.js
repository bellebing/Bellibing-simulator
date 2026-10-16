import { baseAsset, escapeHtml } from './util.js';

// Identity mapping only, reviewed against src/data/sonatas.ts. No activation
// thresholds or combat logic are inferred from the approved Lab's assignments.
export const LAB_SONATAS = {
  crown: { id: 'sonata-20', name: 'Crown of Valor', icon: 'crown.webp' },
  thunder: { id: 'sonata-3', name: 'Void Thunder', icon: 'thunder.webp' },
};
export function loadoutComposition(echoes) {
  const equipped = echoes.filter(Boolean);
  const counts = new Map();
  equipped.forEach(echo => counts.set(echo.set, (counts.get(echo.set) ?? 0) + 1));
  return { count: equipped.length, cost: equipped.reduce((sum, echo) => sum + echo.cost, 0), sets: [...counts].map(([key, count]) => ({ key, count, ...LAB_SONATAS[key] })) };
}
export function sonataSummary(echoes) {
  const composition = loadoutComposition(echoes);
  const separator = '<span class="summary-separator" aria-hidden="true">·</span>';
  const sets = composition.sets.map(set => `<span class="sonata-count" title="${escapeHtml(set.name ?? 'Unresolved Sonata')}: ${set.count} equipped Echoes. Composition only; bonus state not evaluated." aria-label="${escapeHtml(set.name ?? 'Unresolved Sonata')}: ${set.count} equipped Echoes; composition only">${set.icon ? `<img src="${baseAsset(set.icon)}" alt="">` : ''}<span>×${set.count}</span></span>`);
  return [`<span>${composition.count} Echoes</span>`, ...sets, `<span>${composition.cost} / 12 Cost</span>`].join(separator);
}
