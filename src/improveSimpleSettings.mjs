// Improve-owned presentation state. No gameplay/evaluator imports or build writes.
export const SIMPLE_GATES = Object.freeze([5, 10, 15, 20, 25]);
export const ROLL_QUALITY_PRESETS = Object.freeze(['All Rolls', 'Mid+', 'High+']);
export const ROLL_QUALITY_MAPPING_STATUS = 'PENDING';

export function normalizeSimpleSettings(saved, source, maxSubstats) {
  const pool = source?.status === 'READY' ? source.stats.map(stat => stat.name) : [];
  const binding = pool.length ? JSON.stringify([source.presetId, source.profileId, pool]) : null;
  const sameSource = binding !== null && saved?.valuableStats?.sourceBinding === binding;
  const selected = sameSource && Array.isArray(saved.valuableStats.selectedStats)
    ? pool.filter(name => saved.valuableStats.selectedStats.includes(name)) : [...pool];
  const limit = Number.isInteger(maxSubstats) && maxSubstats > 0 ? Math.min(selected.length, maxSubstats) : 0;
  const count = sameSource ? saved.valuableStats.requiredCount : null;
  return {
    gate: SIMPLE_GATES.includes(saved?.gate) ? saved.gate : 5,
    valuableStats: {
      status: binding ? 'READY' : 'PENDING', sourceBinding: binding,
      profileId: binding ? source.profileId : null, selectedStats: selected,
      requiredCount: Number.isInteger(count) && count >= 1 && count <= limit ? count : null,
    },
    rollQuality: ROLL_QUALITY_PRESETS.includes(saved?.rollQuality) ? saved.rollQuality : 'All Rolls',
    rollQualityMappingStatus: ROLL_QUALITY_MAPPING_STATUS,
  };
}

export function updateSimpleSettings(current, action, source, maxSubstats) {
  const next = normalizeSimpleSettings(current, source, maxSubstats);
  if (action.type === 'gate' && SIMPLE_GATES.includes(action.value)) next.gate = action.value;
  if (action.type === 'quality' && ROLL_QUALITY_PRESETS.includes(action.value)) next.rollQuality = action.value;
  if (action.type === 'stat' && source?.status === 'READY' && source.stats.some(stat => stat.name === action.value)) {
    const names = new Set(next.valuableStats.selectedStats);
    if (names.has(action.value)) names.delete(action.value); else names.add(action.value);
    next.valuableStats.selectedStats = source.stats.map(stat => stat.name).filter(name => names.has(name));
  }
  if (action.type === 'count') next.valuableStats.requiredCount = action.value;
  return normalizeSimpleSettings(next, source, maxSubstats);
}
