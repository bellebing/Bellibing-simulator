const INPUT_KIND = 'PROFILE_SOURCE_RESEARCH_INPUT';
const REFRESH_KIND = 'PROFILE_COHORT_ECHO_SONATA_REFRESH';
const REVIEW_STATES = new Set(['REVIEWED', 'BLOCKED']);
const VALID_COSTS = new Set([1, 3, 4]);

function fail(message) {
  throw new Error(`Profile Echo/Sonata refresh rejected: ${message}`);
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string`);
  return value.trim();
}

function stringArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  return value.map((entry, index) => nonEmptyString(entry, `${label}[${index}]`));
}

function normalizedEcho(value, label) {
  if (value == null) return null;
  const costLayout = value.costLayout;
  if (!Array.isArray(costLayout) || costLayout.length !== 5) fail(`${label}.costLayout must contain exactly five Echo costs`);
  if (costLayout.some((cost) => !Number.isInteger(cost) || !VALID_COSTS.has(cost))) {
    fail(`${label}.costLayout may only contain integer COST 1, 3, or 4 entries`);
  }
  if (costLayout.reduce((sum, cost) => sum + cost, 0) !== 12) fail(`${label}.costLayout must total COST 12`);
  const mainStats = stringArray(value.mainStats, `${label}.mainStats`);
  if (mainStats.length !== 5) fail(`${label}.mainStats must contain exactly five slot recommendations`);
  return {
    sonataSet: nonEmptyString(value.sonataSet, `${label}.sonataSet`),
    mainEcho: nonEmptyString(value.mainEcho, `${label}.mainEcho`),
    costLayout: [...costLayout],
    mainStats,
    context: nonEmptyString(value.context, `${label}.context`),
  };
}

function normalizeEntry(entry, index) {
  const label = `entries[${index}]`;
  const characterId = nonEmptyString(entry?.characterId, `${label}.characterId`);
  const modeKey = nonEmptyString(entry?.modeKey, `${label}.modeKey`);
  const reviewState = nonEmptyString(entry?.reviewState, `${label}.reviewState`);
  if (!REVIEW_STATES.has(reviewState)) fail(`${label}.reviewState must be REVIEWED or BLOCKED`);
  const echo = normalizedEcho(entry?.echo, `${label}.echo`);
  const blockers = entry?.blockers == null ? [] : stringArray(entry.blockers, `${label}.blockers`);
  if (reviewState === 'REVIEWED' && (!echo || blockers.length > 0)) {
    fail(`${label} REVIEWED requires exact Echo/Sonata data and zero blockers`);
  }
  if (reviewState === 'BLOCKED' && blockers.length === 0) fail(`${label} BLOCKED requires at least one blocker`);
  if (reviewState === 'BLOCKED' && echo != null) fail(`${label} BLOCKED must not stage a partial Echo/Sonata recommendation`);
  const source = {
    label: nonEmptyString(entry?.source?.label, `${label}.source.label`),
    url: nonEmptyString(entry?.source?.url, `${label}.source.url`),
    checkedAt: nonEmptyString(entry?.source?.checkedAt, `${label}.source.checkedAt`),
  };
  return {
    characterId,
    modeKey,
    echo,
    reviewState,
    blockers,
    evidenceClass: nonEmptyString(entry?.evidenceClass, `${label}.evidenceClass`),
    evidenceSummary: stringArray(entry?.evidenceSummary ?? [], `${label}.evidenceSummary`),
    source,
  };
}

export function applyProfileEchoSonataRefresh(baseInput, refresh) {
  if (baseInput?.kind !== INPUT_KIND) fail(`base input kind must be ${INPUT_KIND}`);
  if (baseInput?.verificationStatus !== 'NOT_VERIFIED' || baseInput?.importStatus !== 'CANDIDATE_ONLY') {
    fail('base input must remain NOT_VERIFIED and CANDIDATE_ONLY');
  }
  if (refresh?.kind !== REFRESH_KIND) fail(`refresh kind must be ${REFRESH_KIND}`);
  if (refresh?.verificationStatus !== 'NOT_VERIFIED' || refresh?.canonicalWriteAllowed !== false) {
    fail('refresh must remain NOT_VERIFIED with canonicalWriteAllowed=false');
  }
  if (!Array.isArray(refresh.entries) || refresh.entries.length === 0) fail('entries must be a non-empty array');

  const entries = refresh.entries.map(normalizeEntry);
  const duplicateKey = entries
    .map((entry) => `${entry.characterId}:${entry.modeKey}`)
    .find((key, index, all) => all.indexOf(key) !== index);
  if (duplicateKey) fail(`duplicate refresh entry ${duplicateKey}`);

  const output = structuredClone(baseInput);
  const characters = new Map(output.characters.map((character) => [character.characterId, character]));

  for (const entry of entries) {
    const character = characters.get(entry.characterId);
    if (!character) fail(`unknown Character ${entry.characterId}`);
    const mode = character.modes?.find((candidate) => candidate.key === entry.modeKey);
    if (!mode) fail(`unknown mode ${entry.characterId}:${entry.modeKey}`);

    const sourceMatch = character.sources?.some((source) => source.url === entry.source.url);
    if (!sourceMatch) fail(`${entry.characterId}:${entry.modeKey} refresh source URL is not present in the reviewed base source roster`);
    if (mode.echo != null) fail(`${entry.characterId}:${entry.modeKey} base mode already has Echo/Sonata data; refresh overlay may only fill missing Echo fields`);

    if (entry.echo != null) mode.echo = entry.echo;
    mode.notes = [
      ...(Array.isArray(mode.notes) ? mode.notes : []),
      `ECHO_SONATA refresh ${entry.reviewState}: ${entry.evidenceSummary.join(' ')}`.trim(),
    ];
  }

  output.generatedAt = refresh.checkedAt ?? output.generatedAt;
  output.sourceCheckpoint = {
    ...(output.sourceCheckpoint ?? {}),
    echoSonataRefresh: {
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
      stagedEchoes: entries.filter((entry) => entry.echo != null).length,
    },
    verificationStatus: 'NOT_VERIFIED',
    canonicalWriteAllowed: false,
  };
}
