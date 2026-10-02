// Improve-owned presentation state. No gameplay/evaluator imports or build writes.
export const SIMPLE_GATES = Object.freeze([5, 10, 15, 20, 25]);
export const ROLL_QUALITY_PRESETS = Object.freeze(['All Rolls', 'Mid+', 'High+']);
export const ROLL_QUALITY_MAPPING_STATUS = 'PENDING';
export const SETTINGS_KEY = 'bellibing.improve.simple-settings.v2';
export const LEGACY_SETTINGS_KEY = 'bellibing.improve.simple-settings.v1';

export function normalizeSimpleSettings(saved, source, characterId = source?.characterId ?? null) {
  const ready = source?.status === 'READY' && source.characterId === characterId;
  const pool = ready ? [...new Set(source.stats.map(stat => stat.name))] : [];
  // Bind provenance and conditional notes too: same IDs alone do not prove the same source.
  const binding = ready ? JSON.stringify([characterId, source.presetId, source.profileId, source.provenance, source.stats]) : null;
  const sameSource = saved?.schemaVersion === 2 && saved.characterId === characterId
    && binding !== null && saved.valuableStats?.sourceBinding === binding;
  const manual = sameSource && saved.valuableStats.orderingMode === 'MANUAL';
  const active = manual && Array.isArray(saved.valuableStats.activeStats)
    ? [...new Set(saved.valuableStats.activeStats.filter(name => pool.includes(name)))] : [];
  // v1 selectedStats meant an eligible pool, not a v2 Active set. Never infer from it.
  return {
    schemaVersion: 2, characterId,
    gate: SIMPLE_GATES.includes(saved?.gate) ? saved.gate : 5,
    valuableStats: {
      schemaVersion: 2, status: ready ? 'READY' : 'PENDING', sourceBinding: binding,
      presetId: ready ? source.presetId : null, profileId: ready ? source.profileId : null,
      orderingMode: manual ? 'MANUAL' : 'RECOMMENDED', recommendedOrderStatus: 'PENDING',
      activeStats: active, availableStats: pool.filter(name => !active.includes(name)),
    },
    rollQuality: ROLL_QUALITY_PRESETS.includes(saved?.rollQuality) ? saved.rollQuality : 'All Rolls',
    rollQualityMappingStatus: ROLL_QUALITY_MAPPING_STATUS,
  };
}

export function updateSimpleSettings(current, action, source, characterId = current.characterId) {
  const next = normalizeSimpleSettings(current, source, characterId);
  const config = next.valuableStats;
  if (action.type === 'gate' && SIMPLE_GATES.includes(action.value)) next.gate = action.value;
  if (action.type === 'quality' && ROLL_QUALITY_PRESETS.includes(action.value)) next.rollQuality = action.value;
  if (config.status === 'READY') {
    if (action.type === 'stat' && [...config.activeStats, ...config.availableStats].includes(action.value)) {
      config.activeStats = config.activeStats.includes(action.value)
        ? config.activeStats.filter(name => name !== action.value) : [...config.activeStats, action.value];
      config.orderingMode = 'MANUAL';
    }
    if (action.type === 'mode' && action.value === 'MANUAL') config.orderingMode = 'MANUAL';
    // Recommended is an explicit reset, never a label on a retained manual selection.
    if (action.type === 'reset' || (action.type === 'mode' && action.value === 'RECOMMENDED')) {
      config.activeStats = []; config.orderingMode = 'RECOMMENDED';
    }
    if (action.type === 'reorder') {
      const from = config.activeStats.indexOf(action.value), to = action.to;
      if (from >= 0 && Number.isInteger(to) && to >= 0 && to < config.activeStats.length && from !== to) {
        const [name] = config.activeStats.splice(from, 1); config.activeStats.splice(to, 0, name);
        config.orderingMode = 'MANUAL';
      }
    }
  }
  return normalizeSimpleSettings(next, source, characterId);
}

const records = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
export function loadSimpleSettingsStorage(storage) {
  let current, legacy;
  try { current = JSON.parse(storage.getItem(SETTINGS_KEY)); } catch {}
  try { legacy = JSON.parse(storage.getItem(LEGACY_SETTINGS_KEY)); } catch {}
  return { version: 2, characters: current?.version === 2 ? records(current.characters) : {},
    pendingV1Characters: current?.version === 2 ? records(current.pendingV1Characters)
      : legacy?.version === 1 ? records(legacy.characters) : {} };
}
export function savedCharacterSettings(store, id) {
  return store.characters[id] ?? store.pendingV1Characters[id] ?? null;
}
export function persistSimpleSettings(store, settings, storage) {
  const id = settings.characterId;
  if (!id) return;
  const next = structuredClone(store);
  if (settings.valuableStats.status === 'READY') {
    next.characters[id] = settings; delete next.pendingV1Characters[id];
  } else if (next.characters[id]) {
    // Source outage masks live stats but does not overwrite a validated saved binding/order.
    next.characters[id] = { ...settings, valuableStats: next.characters[id].valuableStats };
  } else if (next.pendingV1Characters[id]) {
    next.pendingV1Characters[id] = { ...next.pendingV1Characters[id], gate: settings.gate, rollQuality: settings.rollQuality };
  } else next.characters[id] = settings;
  storage.setItem(SETTINGS_KEY, JSON.stringify(next));
  Object.assign(store, next);
}
