const INPUT_KIND = 'PROFILE_SOURCE_RESEARCH_INPUT';
const REFRESH_KIND = 'PROFILE_COHORT_SOURCE_ROTATION_REFRESH';
const MANIFEST_KIND = 'PROFILE_HORIZONTAL_COHORT_INPUT';
const REVIEW_STATES = new Set(['REVIEWED', 'BLOCKED']);

function fail(message) {
  throw new Error(`Profile Source Rotation refresh rejected: ${message}`);
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string`);
  return value.trim();
}

function stringArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  return value.map((entry, index) => nonEmptyString(entry, `${label}[${index}]`));
}

function normalizedRotation(value, label) {
  if (value == null) return null;
  const sequence = stringArray(value.sequence, `${label}.sequence`);
  if (sequence.length === 0) fail(`${label}.sequence must contain at least one source-backed action`);
  const alternatives = Array.isArray(value.alternatives)
    ? value.alternatives.map((entry, index) => {
        const alternativeSequence = stringArray(entry?.sequence, `${label}.alternatives[${index}].sequence`);
        if (alternativeSequence.length === 0) fail(`${label}.alternatives[${index}].sequence must not be empty`);
        return {
          label: nonEmptyString(entry?.label, `${label}.alternatives[${index}].label`),
          sequence: alternativeSequence,
          context: nonEmptyString(entry?.context, `${label}.alternatives[${index}].context`),
        };
      })
    : [];
  if (value.executionStatus != null && value.executionStatus !== 'SOURCE_SEQUENCE_ONLY') fail(`${label}.executionStatus must remain SOURCE_SEQUENCE_ONLY`);
  if (value.rotationSeconds != null || value.uptime != null || value.engineModelId != null) fail(`${label} may not stage executable timing, uptime, or an engine model`);
  return {
    sequence,
    alternatives,
    context: nonEmptyString(value.context, `${label}.context`),
    notes: stringArray(value.notes ?? [], `${label}.notes`),
    executionStatus: 'SOURCE_SEQUENCE_ONLY',
  };
}

function normalizeEntry(entry, index) {
  const label = `entries[${index}]`;
  const characterId = nonEmptyString(entry?.characterId, `${label}.characterId`);
  const modeKey = nonEmptyString(entry?.modeKey, `${label}.modeKey`);
  const reviewState = nonEmptyString(entry?.reviewState, `${label}.reviewState`);
  if (!REVIEW_STATES.has(reviewState)) fail(`${label}.reviewState must be REVIEWED or BLOCKED`);
  const rotation = normalizedRotation(entry?.rotation, `${label}.rotation`);
  const blockers = stringArray(entry?.blockers ?? [], `${label}.blockers`);
  if (reviewState === 'REVIEWED' && (!rotation || blockers.length > 0)) fail(`${label} REVIEWED requires a source rotation and zero blockers`);
  if (reviewState === 'BLOCKED' && blockers.length === 0) fail(`${label} BLOCKED requires at least one preserved blocker`);
  if (reviewState === 'BLOCKED' && rotation != null) fail(`${label} BLOCKED must not stage a partial rotation`);
  return {
    characterId,
    modeKey,
    rotation,
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

export function applyProfileSourceRotationRefresh(baseInput, refresh) {
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
    if (mode.rotation != null) fail(`${entry.characterId}:${entry.modeKey} base mode already has rotation data; refresh overlay may only fill missing rotation fields`);
    if (entry.rotation != null) mode.rotation = entry.rotation;
    mode.notes = [
      ...(Array.isArray(mode.notes) ? mode.notes : []),
      `SOURCE_ROTATION refresh ${entry.reviewState}: ${entry.evidenceSummary.join(' ')}`.trim(),
    ];
  }

  output.generatedAt = refresh.checkedAt ?? output.generatedAt;
  output.sourceCheckpoint = {
    ...(output.sourceCheckpoint ?? {}),
    sourceRotationRefresh: {
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
      stagedRotations: entries.filter((entry) => entry.rotation != null).length,
    },
    verificationStatus: 'NOT_VERIFIED',
    canonicalWriteAllowed: false,
  };
}

export function buildSourceRotationCohortManifest(parentManifest, refresh, refreshPath) {
  if (parentManifest?.kind !== MANIFEST_KIND) fail(`parent manifest kind must be ${MANIFEST_KIND}`);
  if (parentManifest?.verificationStatus !== 'NOT_VERIFIED' || parentManifest?.canonicalWriteAllowed !== false) fail('parent manifest must remain NOT_VERIFIED with canonicalWriteAllowed=false');
  if (!Array.isArray(parentManifest.autoParkMissingSourcePhases) || !parentManifest.autoParkMissingSourcePhases.includes('SOURCE_ROTATION')) fail('parent manifest must still auto-park SOURCE_ROTATION before this refresh is applied');
  const entries = normalizedEntries(refresh);
  const output = structuredClone(parentManifest);
  output.sourceRotationRefresh = nonEmptyString(refreshPath, 'refreshPath');
  output.sourceCheckpoint = {
    ...(output.sourceCheckpoint ?? {}),
    repoMain: nonEmptyString(refresh.baseRepoMain, 'baseRepoMain'),
    sourceRotationCheckedAt: nonEmptyString(refresh.checkedAt, 'checkedAt'),
  };
  output.autoParkMissingSourcePhases = output.autoParkMissingSourcePhases.filter((phase) => phase !== 'SOURCE_ROTATION');
  output.phaseReviews = {...(output.phaseReviews ?? {})};
  for (const entry of entries) {
    const reviewKey = `${entry.characterId}:${entry.modeKey}:SOURCE_ROTATION`;
    if (output.phaseReviews[reviewKey] != null) fail(`parent manifest already contains ${reviewKey}`);
    output.phaseReviews[reviewKey] = {
      reviewState: entry.reviewState,
      notes: entry.reviewState === 'REVIEWED'
        ? [`Reviewed from the 2026-08-30 Source Rotation refresh: ${entry.evidenceSummary.join(' ')}`.trim()]
        : [`Preserved upstream blocker(s): ${entry.blockers.join(', ')}.`],
    };
  }
  output.notes = [
    ...(Array.isArray(output.notes) ? output.notes : []),
    `SOURCE_ROTATION is manually reviewed across all ${entries.length} staged modes: ${entries.filter((entry) => entry.reviewState === 'REVIEWED').length} REVIEWED / ${entries.filter((entry) => entry.reviewState === 'BLOCKED').length} BLOCKED / 0 pending.`,
    'Every staged sequence remains SOURCE_SEQUENCE_ONLY. Swaps, Intro/Outro, Echo placement and cancels are transcribed only when source-explicit; no duration, uptime, animation frame, or engine timing is inferred.',
    'All source-extraction phases are now manually closed for this cohort; semantic promotion review is still required before canonical writes or VERIFIED truth.',
  ];
  return output;
}
