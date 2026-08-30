const INPUT_KIND = 'PROFILE_SOURCE_RESEARCH_INPUT';
const REFRESH_KIND = 'PROFILE_COHORT_MODE_CONTEXT_REFRESH';
const REVIEW_STATES = new Set(['REVIEWED', 'BLOCKED']);
const ROLES = new Set(['MAIN_DPS', 'HYBRID', 'SUPPORT']);

function fail(message) {
  throw new Error(`Profile mode/context refresh rejected: ${message}`);
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string`);
  return value.trim();
}

function stringArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  return value.map((entry, index) => nonEmptyString(entry, `${label}[${index}]`));
}

function normalizedRole(value, label) {
  if (value == null) return null;
  const role = nonEmptyString(value, label);
  if (!ROLES.has(role)) fail(`${label} must be MAIN_DPS, HYBRID, or SUPPORT`);
  return role;
}

function normalizedTeam(value, characterId, label) {
  if (value == null) return null;
  const members = stringArray(value.members, `${label}.members`);
  if (members.length !== 3 || new Set(members).size !== 3) fail(`${label}.members must contain exactly three unique Character ids`);
  if (!members.includes(characterId)) fail(`${label}.members must include ${characterId}`);
  return {
    members,
    context: nonEmptyString(value.context, `${label}.context`),
  };
}

function normalizeEntry(entry, index) {
  const label = `entries[${index}]`;
  const characterId = nonEmptyString(entry?.characterId, `${label}.characterId`);
  const modeKey = nonEmptyString(entry?.modeKey, `${label}.modeKey`);
  const reviewState = nonEmptyString(entry?.reviewState, `${label}.reviewState`);
  if (!REVIEW_STATES.has(reviewState)) fail(`${label}.reviewState must be REVIEWED or BLOCKED`);
  const role = normalizedRole(entry?.role, `${label}.role`);
  const team = normalizedTeam(entry?.team, characterId, `${label}.team`);
  const blockers = entry?.blockers == null ? [] : stringArray(entry.blockers, `${label}.blockers`);
  if (entry?.defaultCandidate !== null) fail(`${label}.defaultCandidate must remain null unless a later source checkpoint explicitly reviews a default`);
  if (reviewState === 'REVIEWED' && (!role || !team || blockers.length > 0)) {
    fail(`${label} REVIEWED requires role + exact three-member team and zero blockers`);
  }
  if (reviewState === 'BLOCKED' && blockers.length === 0) fail(`${label} BLOCKED requires at least one blocker`);
  const source = {
    label: nonEmptyString(entry?.source?.label, `${label}.source.label`),
    url: nonEmptyString(entry?.source?.url, `${label}.source.url`),
    checkedAt: nonEmptyString(entry?.source?.checkedAt, `${label}.source.checkedAt`),
    profileUpdatedAt: nonEmptyString(entry?.source?.profileUpdatedAt, `${label}.source.profileUpdatedAt`),
  };
  return {
    characterId,
    modeKey,
    role,
    team,
    defaultCandidate: null,
    reviewState,
    blockers,
    evidenceClass: nonEmptyString(entry?.evidenceClass, `${label}.evidenceClass`),
    evidenceSummary: stringArray(entry?.evidenceSummary ?? [], `${label}.evidenceSummary`),
    source,
  };
}

export function applyProfileModeContextRefresh(baseInput, refresh) {
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

    if (mode.role != null && entry.role != null && mode.role !== entry.role) {
      fail(`${entry.characterId}:${entry.modeKey} cannot overwrite reviewed role ${mode.role} with ${entry.role}`);
    }
    if (mode.team != null) fail(`${entry.characterId}:${entry.modeKey} base mode already has team data; refresh overlay may only fill missing mode/context fields`);

    if (entry.role != null) mode.role = entry.role;
    if (entry.team != null) mode.team = entry.team;
    mode.defaultCandidate = null;
    mode.notes = [
      ...(Array.isArray(mode.notes) ? mode.notes : []),
      `MODE_TEAM_CONTEXT refresh ${entry.reviewState}: ${entry.evidenceSummary.join(' ')}`.trim(),
    ];
  }

  output.generatedAt = refresh.checkedAt ?? output.generatedAt;
  output.sourceCheckpoint = {
    ...(output.sourceCheckpoint ?? {}),
    modeTeamContextRefresh: {
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
      defaultSelections: entries.filter((entry) => entry.defaultCandidate !== null).length,
    },
    verificationStatus: 'NOT_VERIFIED',
    canonicalWriteAllowed: false,
  };
}
