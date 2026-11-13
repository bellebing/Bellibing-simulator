// Pure, fail-closed source/consumer coverage. It is NOT a second Character catalog.
// A projection's presence never proves private DPS execution or browser acceptance.
const isNonempty = value => typeof value === 'string' && value.trim().length > 0;
const sourceBacked = value => isNonempty(value?.sourceUrl) || (Array.isArray(value?.sourceUrls) && value.sourceUrls.some(isNonempty));
const rowsFor = (input, key = 'characters') => Array.isArray(input) ? input : (Array.isArray(input?.[key]) ? input[key] : []);
const byId = (rows, id) => rows.filter(row => (row.characterId ?? row.id) === id);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const status = (ok, missing) => ({status: ok ? 'PASS' : 'PENDING', details: ok ? 'Source-backed artifact found.' : missing});
const required = Object.freeze([
  'canonicalIdentity','originalRelease','releasedAndVerified','level90','sourceAssets',
  'forteSource','sequenceSource','buildStats','skillsRuntime','sequenceRuntime',
  'portrait','heroArt','buildSelector','weaponEchoGuidance','improveConfiguration'
]);

export function characterImportCoverage(id, sources, {asOf = '9999-12-31', browserVerified = false} = {}) {
  if (!/^[a-z][a-z0-9-]*$/.test(id)) throw Error('Expected canonical lower-case Character ID.');
  if (!/^\d{4}-\d\d-\d\d$/.test(asOf)) throw Error('Expected an ISO review date.');
  const raw = sources.rawCatalog ?? [];
  const records = raw.filter(row => row.id === id);
  const duplicateIds = [...new Set(raw.map(row => row.id).filter((key, index, all) => all.indexOf(key) !== index))].sort();
  const row = records.length === 1 ? records[0] : null;
  const original = sources.originalRelease?.[id] ?? null;
  const published = sources.publishedEvidence?.[id] ?? null;
  const verifiedIdentity = row && row.verificationStatus === 'VERIFIED' && sourceBacked(row.provenance);
  const rawFields = ['hp','atk','def','maxEnergy'].filter(key => !finite(row?.level90?.[key]));
  const baseFields = ['critRate','critDamage','energyRegen'].filter(key => !finite(row?.baseCombat?.[key]));
  const checks = {};
  const check = (name, condition, issue) => {checks[name] = status(Boolean(condition), issue);};
  check('canonicalIdentity', records.length === 1 && !duplicateIds.length,
    records.length ? 'Duplicate canonical IDs: ' + duplicateIds.join(', ') : 'Missing canonical Character in src/data/characters.ts; source projection alone does not import it.');
  check('originalRelease', original && /^\d+\.\d+$/.test(original.patch) && /^\d{4}-\d\d-\d\d$/.test(original.date),
    'Missing independently reviewed original release patch/date.');
  check('releasedAndVerified', row?.releaseStatus === 'RELEASED' && verifiedIdentity,
    row ? 'Canonical status ' + row.releaseStatus + ' / verification ' + row.verificationStatus + '; released identity must be source-verified.' : 'Canonical released identity missing.');
  check('level90', row && !rawFields.length && !baseFields.length && sourceBacked(row.provenance),
    'Missing verified source-backed stats: ' + [...rawFields, ...baseFields].join(', ') + '. Null is not zero.');
  const assets = byId(rowsFor(sources.builderManifest), id);
  check('sourceAssets', assets.length === 1 && Array.isArray(assets[0].chains) && assets[0].chains.length >= 2 && Object.keys(assets[0].skills ?? {}).length > 0,
    'Missing reviewed Character Builder skill/Sequence icon identity or pinned asset mapping.');
  const forte = byId(rowsFor(sources.forteSource), id);
  check('forteSource', forte.length === 1 && Array.isArray(forte[0].tree) && forte[0].tree.length >= 16,
    'Missing original source-backed Forte/Skills tree and exact node values.');
  const sequence = byId(rowsFor(sources.sequenceSource), id);
  check('sequenceSource', sequence.length === 1 && Array.isArray(sequence[0].chains) && sequence[0].chains.length === 6,
    'Missing six original source-backed Sequence records.');
  check('buildStats', byId(rowsFor(sources.buildStats), id).length === 1,
    'Generated Build Stats projection missing (run existing exporter only after source review).');
  const skills = byId(rowsFor(sources.skillsRuntime), id);
  check('skillsRuntime', skills.length === 1 && skills[0].status === 'SOURCE_BACKED' && Array.isArray(skills[0].nodes) && skills[0].nodes.length > 0,
    'Skills runtime absent or Pending; source kit facts alone do not populate the editor.');
  const sequences = byId(rowsFor(sources.sequenceRuntime), id);
  check('sequenceRuntime', sequences.length === 1 && sequences[0].chains?.length === 6 &&
    sequences[0].chains.every(chain => chain.contentStatus === 'SOURCE_BACKED'),
    'Generated Sequence runtime absent/incomplete; six source-backed sequences required.');
  const portraits = [...rowsFor(sources.portraitManifest, 'portraits'), ...rowsFor(sources.portraitManifest, 'roverPortraits')];
  check('portrait', byId(portraits, id).some(p => p.uiEligible === true),
    'Reviewed, selectable Character portrait not available; an excluded upcoming portrait is not enough.');
  const hero = byId(rowsFor(sources.heroRuntime), id);
  check('heroArt', hero.length === 1 && hero[0].status === 'READY' && isNonempty(hero[0].assetPath) &&
    hero[0].presentation && finite(hero[0].presentation.scale),
    'Hero Art READY source mapping/presentation missing; a generic/borrowed image is not a substitute.');
  const selectable = byId(rowsFor(sources.uiCatalog), id);
  check('buildSelector', selectable.length === 1 && selectable[0].element === row?.element &&
    selectable[0].weaponType === row?.weaponType && isNonempty(selectable[0].art),
    'Generated Build selector projection absent or identity mismatched.');
  check('weaponEchoGuidance', sourceBacked(sources.recommendations),
    'Reviewed weapon/Echo source recommendations missing. Never infer BiS from rarity.');
  check('improveConfiguration', sources.improveConfiguration && sourceBacked(sources.improveConfiguration),
    'Source-linked Improve Hard/Flex policy missing. Numeric outcome remains Pending without provider.');
  const releaseNeedsReview = Boolean(original && original.date <= asOf && row?.releaseStatus === 'CONFIRMED_UPCOMING');
  const gaps = required.filter(key => checks[key].status !== 'PASS');
  const prerequisitesReady = !gaps.length;
  return {
    schemaVersion: 1, characterId: id, canonicalName: row?.name ?? published?.name ?? null,
    catalogPresence: records.length === 1 ? 'EXISTS' : records.length ? 'DUPLICATE' : 'MISSING',
    release: {canonicalStatus:row?.releaseStatus ?? 'NOT_IMPORTED',originalPatch:original?.patch ?? null,
      originalDate:original?.date ?? null,releaseNeedsReview,
      note: releaseNeedsReview ? 'Date has passed but RELEASED must be explicitly source-reviewed; never auto-promote from calendar.' : null},
    publishedEvidence: published ?? null, duplicateIds, checks, gaps,
    characterUsable: prerequisitesReady && browserVerified ? 'CHARACTER_USABLE' : 'PENDING',
    characterUsableReason: !prerequisitesReady ? 'SOURCE_OR_PROJECTION_GAPS' : browserVerified ? null : 'LIVE_CHROMIUM_AND_ACCOUNT_VERIFICATION_PENDING',
    dpsReady: 'PENDING',
    dpsReason: 'Private native execution/rotation/buff/resource and parity verification required; public preflight never grants DPS Ready.',
    publicDpsPreflight: sources.publicDpsPreflight ?? null,
    optionalTeamReference: sources.teamReference ?? null,
    existingReleasedCount: raw.filter(c => c.releaseStatus === 'RELEASED').length,
  };
}
