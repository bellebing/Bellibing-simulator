const INPUT_KIND = 'PROFILE_SOURCE_RESEARCH_INPUT';
const REFRESH_KIND = 'PROFILE_COHORT_STATS_ER_REFRESH';
const MANIFEST_KIND = 'PROFILE_HORIZONTAL_COHORT_INPUT';
const REVIEW_STATES = new Set(['REVIEWED', 'BLOCKED']);

function fail(message) {
  throw new Error(`Profile Stats/ER refresh rejected: ${message}`);
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string`);
  return value.trim();
}

function stringArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  return value.map((entry, index) => nonEmptyString(entry, `${label}[${index}]`));
}

function normalizedErBand(value, label) {
  if (value == null) return null;
  const output = {
    minimum: value.minimum == null ? null : Number(value.minimum),
    preferred: value.preferred == null ? null : Number(value.preferred),
    maximum: value.maximum == null ? null : Number(value.maximum),
    context: nonEmptyString(value.context, `${label}.context`),
  };
  const numbers = ['minimum', 'preferred', 'maximum'].map((key) => output[key]).filter((entry) => entry != null);
  if (numbers.length === 0) fail(`${label} must contain at least one source-backed numeric ER ratio when present`);
  for (const number of numbers) {
    if (!Number.isFinite(number) || number <= 0) fail(`${label} ratios must be positive finite numbers`);
  }
  if (output.minimum != null && output.preferred != null && output.preferred < output.minimum) fail(`${label}.preferred cannot be below minimum`);
  if (output.preferred != null && output.maximum != null && output.maximum < output.preferred) fail(`${label}.maximum cannot be below preferred`);
  if (output.minimum != null && output.maximum != null && output.maximum < output.minimum) fail(`${label}.maximum cannot be below minimum`);
  return output;
}

function normalizedStats(value, label) {
  if (value == null) return null;
  const priority = stringArray(value.priority, `${label}.priority`);
  if (priority.length === 0) fail(`${label}.priority must contain at least one reviewed stat`);
  return {
    priority,
    relations: stringArray(value.relations ?? [], `${label}.relations`),
    erBand: normalizedErBand(value.erBand, `${label}.erBand`),
    notes: stringArray(value.notes ?? [], `${label}.notes`),
  };
}

function normalizeEntry(entry, index) {
  const label = `entries[${index}]`;
  const characterId = nonEmptyString(entry?.characterId, `${label}.characterId`);
  const modeKey = nonEmptyString(entry?.modeKey, `${label}.modeKey`);
  const reviewState = nonEmptyString(entry?.reviewState, `${label}.reviewState`);
  if (!REVIEW_STATES.has(reviewState)) fail(`${label}.reviewState must be REVIEWED or BLOCKED`);
  const stats = normalizedStats(entry?.stats, `${label}.stats`);
  const blockers = stringArray(entry?.blockers ?? [], `${label}.blockers`);
  if (reviewState === 'REVIEWED' && (!stats || blockers.length > 0)) fail(`${label} REVIEWED requires reviewed stats and zero blockers`);
  if (reviewState === 'BLOCKED' && blockers.length === 0) fail(`${label} BLOCKED requires at least one preserved blocker`);
  if (reviewState === 'BLOCKED' && stats != null) fail(`${label} BLOCKED must not stage partial Stats/ER data`);
  return {
    characterId,
    modeKey,
    stats,
    reviewState,
    blockers,
    evidenceClass: nonEmptyString(entry?.evidenceClass, `${label}.evidenceClass`),
    evidenceSummary: stringArray(entry?.evidenceSummary ?? [], `${label}.evidenceSummary`),
    source: {
      label: nonEmptyString(entry?.source?.label, `${label}.source.label`),
      url: nonEmptyString(entry?.source?.url, `${label}.source.url`),
      checkedAt: nonEmptyString(entry?.source?.checkedAt, `${label}.source.checkedAt`),
    },
  };
}

function normalizedEntries(refresh) {
  if (refresh?.kind !== REFRESH_KIND) fail(`refresh kind must be ${REFRESH_KIND}`);
  if (refresh?.verificationStatus !== 'NOT_VERIFIED' || refresh?.canonicalWriteAllowed !== false) fail('refresh must remain NOT_VERIFIED with canonicalWriteAllowed=false');
  if (!Array.isArray(refresh.entries) || refresh.entries.length === 0) fail('entries must be a non-empty array');
  const entries = refresh.entries.map(normalizeEntry);
  const duplicateKey = entries.map((entry) => `${entry.characterId}:${entry.modeKey}`).find((key, index, all) => all.indexOf(key) !== index);
  if (duplicateKey) fail(`duplicate refresh entry ${duplicateKey}`);
  return entries;
}

export function applyProfileStatsErRefresh(baseInput, refresh) {
  if (baseInput?.kind !== INPUT_KIND) fail(`base input kind must be ${INPUT_KIND}`);
  if (baseInput?.verificationStatus !== 'NOT_VERIFIED' || baseInput?.importStatus !== 'CANDIDATE_ONLY') fail('base input must remain NOT_VERIFIED and CANDIDATE_ONLY');
  const entries = normalizedEntries(refresh);
  const output = structuredClone(baseInput);
  const characters = new Map(output.characters.map((character) => [character.characterId, character]));

  for (const entry of entries) {
    const character = characters.get(entry.characterId);
    if (!character) fail(`unknown Character ${entry.characterId}`);
    const mode = character.modes?.find((candidate) => candidate.key === entry.modeKey);
    if (!mode) fail(`unknown mode ${entry.characterId}:${entry.modeKey}`);
    if (!character.sources?.some((source) => source.url === entry.source.url)) fail(`${entry.characterId}:${entry.modeKey} refresh source URL is not present in the reviewed base source roster`);
    if (mode.stats != null) fail(`${entry.characterId}:${entry.modeKey} base mode already has Stats/ER data; refresh overlay may only fill missing Stats fields`);
    if (entry.stats != null) mode.stats = entry.stats;
    mode.notes = [
      ...(Array.isArray(mode.notes) ? mode.notes : []),
      `STATS_ER refresh ${entry.reviewState}: ${entry.evidenceSummary.join(' ')}`.trim(),
    ];
  }

  output.generatedAt = refresh.checkedAt ?? output.generatedAt;
  output.sourceCheckpoint = {
    ...(output.sourceCheckpoint ?? {}),
    statsErRefresh: {
      cohortId: nonEmptyString(refresh.cohortId, 'cohortId'),
      checkedAt: nonEmptyString(refresh.checkedAt, 'checkedAt'),
      baseRepoMain: nonEmptyString(refresh.baseRepoMain, 'baseRepoMain'),
      reviewedEntryCount: entries.filter((entry) => entry.reviewState === 'REVIEWED').length,
      blockedEntryCount: entries.filter((entry) => entry.reviewState === 'BLOCKED').length,
    },
  };

  return {
    input: output,
    entries,
    summary: {
      entryCount: entries.length,
      reviewed: entries.filter((entry) => entry.reviewState === 'REVIEWED').length,
      blocked: entries.filter((entry) => entry.reviewState === 'BLOCKED').length,
      stagedStats: entries.filter((entry) => entry.stats != null).length,
      numericErBands: entries.filter((entry) => entry.stats?.erBand != null).length,
    },
    verificationStatus: 'NOT_VERIFIED',
    canonicalWriteAllowed: false,
  };
}

export function buildStatsErCohortManifest(parentManifest, refresh, refreshPath) {
  if (parentManifest?.kind !== MANIFEST_KIND) fail(`parent manifest kind must be ${MANIFEST_KIND}`);
  if (parentManifest?.verificationStatus !== 'NOT_VERIFIED' || parentManifest?.canonicalWriteAllowed !== false) fail('parent manifest must remain NOT_VERIFIED with canonicalWriteAllowed=false');
  if (!Array.isArray(parentManifest.autoParkMissingSourcePhases) || !parentManifest.autoParkMissingSourcePhases.includes('STATS_ER')) fail('parent manifest must still auto-park STATS_ER before this refresh is applied');
  const entries = normalizedEntries(refresh);
  const output = structuredClone(parentManifest);
  output.statsErRefresh = nonEmptyString(refreshPath, 'refreshPath');
  output.sourceCheckpoint = {
    ...(output.sourceCheckpoint ?? {}),
    repoMain: nonEmptyString(refresh.baseRepoMain, 'baseRepoMain'),
    statsErCheckedAt: nonEmptyString(refresh.checkedAt, 'checkedAt'),
  };
  output.autoParkMissingSourcePhases = output.autoParkMissingSourcePhases.filter((phase) => phase !== 'STATS_ER');
  output.phaseReviews = {...(output.phaseReviews ?? {})};
  for (const entry of entries) {
    const reviewKey = `${entry.characterId}:${entry.modeKey}:STATS_ER`;
    if (output.phaseReviews[reviewKey] != null) fail(`parent manifest already contains ${reviewKey}`);
    output.phaseReviews[reviewKey] = {
      reviewState: entry.reviewState,
      notes: entry.reviewState === 'REVIEWED'
        ? [`Reviewed from the 2026-08-30 Stats/ER refresh: ${entry.evidenceSummary.join(' ')}`.trim()]
        : [`Preserved upstream blocker(s): ${entry.blockers.join(', ')}.`],
    };
  }
  output.notes = [
    ...(Array.isArray(output.notes) ? output.notes : []),
    `STATS_ER is manually reviewed across all ${entries.length} staged modes: ${entries.filter((entry) => entry.reviewState === 'REVIEWED').length} REVIEWED / ${entries.filter((entry) => entry.reviewState === 'BLOCKED').length} BLOCKED / 0 pending.`,
    'Numeric ER is only staged when the reviewed source ties it to the selected mode/team/set context; exact-context gaps remain null rather than guessed.',
    'SOURCE_ROTATION remains mechanically parked until its own horizontal source-refresh pass.',
    'Stats/ER source review does not authorize canonical writes, VERIFIED truth, execution, or DPS readiness.',
  ];
  return output;
}
