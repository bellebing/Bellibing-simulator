// Reuse the generated Echo Workspace catalog and reviewed loadout recommendations.
// This projection deliberately ignores slot costs, activation thresholds and effects.
export function readSonataChoices(data) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.sonataSets) || !Array.isArray(data.loadoutProfiles)) throw new Error('Sonata catalog unavailable.');
  const catalog = data.sonataSets.map(({ id, sourceId, name, releaseStatus, artPath }) => {
    if (!/^sonata-[1-9][0-9]*$/.test(id) || !Number.isInteger(sourceId) || sourceId <= 0 || typeof name !== 'string' || !name
      || releaseStatus !== 'RELEASED' || !/^docs\/ui-prototypes\/assets\/builder-icons\/sonata\/[\w-]+\.webp$/.test(artPath)) throw new Error('Invalid Sonata identity/icon.');
    return { id, sourceId, name, artPath };
  }).sort((a, b) => b.sourceId - a.sourceId || a.name.localeCompare(b.name, 'en') || a.id.localeCompare(b.id, 'en'));
  if (new Set(catalog.map(row => row.id)).size !== catalog.length || new Set(catalog.map(row => row.sourceId)).size !== catalog.length) throw new Error('Duplicate Sonata identity.');
  const available = new Set(catalog.map(row => row.id)), recommendations = Object.create(null);
  for (const profile of data.loadoutProfiles) {
    if (typeof profile.characterId !== 'string' || !profile.characterId || Object.hasOwn(recommendations, profile.characterId) || !Array.isArray(profile.sonataSetIds)
      || new Set(profile.sonataSetIds).size !== profile.sonataSetIds.length || profile.sonataSetIds.some(id => !available.has(id))) throw new Error('Invalid reviewed Sonata profile.');
    recommendations[profile.characterId] = [...profile.sonataSetIds];
  }
  return { catalog, recommendations };
}
export function sonataChoicesPresentation(state, choices) {
  const recommendedIds = choices.recommendations[state.characterId] ?? [];
  const recommended = choices.catalog.filter(row => recommendedIds.includes(row.id));
  const other = choices.catalog.filter(row => !recommendedIds.includes(row.id));
  // Absence inherits reviewed defaults; explicit empty selections remain empty.
  const selectedIds = state.selectedSonataSetIds ?? recommendedIds;
  const selected = selectedIds.map(id => choices.catalog.find(row => row.id === id)).filter(Boolean);
  return { recommended, other, selected };
}
export function toggleSonataSelection(state, choices, id) {
  if (!choices.catalog.some(row => row.id === id)) throw new Error('Unknown Sonata Set.');
  const inherited = choices.recommendations[state.characterId] ?? [];
  const selected = state.selectedSonataSetIds ?? inherited;
  return selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id];
}
