const INPUT_KIND = 'PROFILE_SOURCE_RESEARCH_INPUT';
const OUTPUT_KIND = 'PROFILE_CANDIDATE_REVIEW';

export const PROFILE_SOURCE_DISPOSITIONS = Object.freeze([
  'READY_FOR_REVIEW',
  'MULTI_MODE',
  'MISSING_CONTEXT',
  'SOURCE_CONFLICT',
  'RAW_PREFLIGHT_BLOCKED',
]);

export const PROFILE_EXECUTION_DISPOSITIONS = Object.freeze([
  'NO_KNOWN_SPECIALIZED_ADAPTER',
  'SPECIALIZED_ADAPTER_REQUIRED',
]);

function fail(message) {
  throw new Error(`Profile candidate review input rejected: ${message}`);
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string`);
  return value.trim();
}

function optionalString(value, label) {
  if (value == null) return null;
  return nonEmptyString(value, label);
}

function stringArray(value, label) {
  if (value == null) return [];
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  return value.map((entry, index) => nonEmptyString(entry, `${label}[${index}]`));
}

function normalizedSources(value, characterId) {
  if (!Array.isArray(value) || value.length === 0) fail(`${characterId}.sources must contain at least one source`);
  return value.map((source, index) => ({
    label: nonEmptyString(source?.label, `${characterId}.sources[${index}].label`),
    url: nonEmptyString(source?.url, `${characterId}.sources[${index}].url`),
    checkedAt: nonEmptyString(source?.checkedAt, `${characterId}.sources[${index}].checkedAt`),
    patch: optionalString(source?.patch, `${characterId}.sources[${index}].patch`),
    sourceClass: optionalString(source?.sourceClass, `${characterId}.sources[${index}].sourceClass`) ?? 'REFERENCE_GUIDE',
  }));
}

function normalizedWeapon(value, label) {
  if (value == null) return null;
  return {
    name: nonEmptyString(value.name, `${label}.name`),
    rank: value.rank == null ? null : nonEmptyString(String(value.rank), `${label}.rank`),
    context: optionalString(value.context, `${label}.context`),
    alternatives: Array.isArray(value.alternatives)
      ? value.alternatives.map((entry, index) => ({
          name: nonEmptyString(entry?.name, `${label}.alternatives[${index}].name`),
          rank: entry?.rank == null ? null : nonEmptyString(String(entry.rank), `${label}.alternatives[${index}].rank`),
          context: optionalString(entry?.context, `${label}.alternatives[${index}].context`),
        }))
      : [],
  };
}

function normalizedEcho(value, label) {
  if (value == null) return null;
  const costLayout = Array.isArray(value.costLayout) ? value.costLayout.map(Number) : [];
  if (costLayout.some((cost) => !Number.isInteger(cost) || ![1, 3, 4].includes(cost))) {
    fail(`${label}.costLayout may only contain Echo COST values 1, 3, or 4`);
  }
  if (costLayout.length > 0 && (costLayout.length !== 5 || costLayout.reduce((sum, cost) => sum + cost, 0) !== 12)) {
    fail(`${label}.costLayout must describe exactly five Echoes totaling COST 12 when present`);
  }
  return {
    sonataSet: optionalString(value.sonataSet, `${label}.sonataSet`),
    mainEcho: optionalString(value.mainEcho, `${label}.mainEcho`),
    costLayout,
    mainStats: stringArray(value.mainStats, `${label}.mainStats`),
    alternatives: stringArray(value.alternatives, `${label}.alternatives`),
    notes: stringArray(value.notes, `${label}.notes`),
  };
}

function normalizedStats(value, label) {
  if (value == null) return null;
  const erBand = value.erBand == null ? null : {
    minimum: value.erBand.minimum == null ? null : Number(value.erBand.minimum),
    preferred: value.erBand.preferred == null ? null : Number(value.erBand.preferred),
    maximum: value.erBand.maximum == null ? null : Number(value.erBand.maximum),
    context: optionalString(value.erBand.context, `${label}.erBand.context`),
  };
  if (erBand) {
    for (const [key, number] of Object.entries(erBand)) {
      if (key === 'context' || number == null) continue;
      if (!Number.isFinite(number) || number <= 0) fail(`${label}.erBand.${key} must be a positive finite ratio`);
    }
  }
  return {
    priority: stringArray(value.priority, `${label}.priority`),
    relations: stringArray(value.relations, `${label}.relations`),
    erBand,
    notes: stringArray(value.notes, `${label}.notes`),
  };
}

function normalizedTeam(value, label) {
  if (value == null) return null;
  return {
    members: stringArray(value.members, `${label}.members`),
    context: optionalString(value.context, `${label}.context`),
    alternatives: stringArray(value.alternatives, `${label}.alternatives`),
  };
}

function normalizedRotation(value, label) {
  if (value == null) return null;
  return {
    sequence: stringArray(value.sequence, `${label}.sequence`),
    alternatives: Array.isArray(value.alternatives)
      ? value.alternatives.map((entry, index) => ({
          label: nonEmptyString(entry?.label, `${label}.alternatives[${index}].label`),
          sequence: stringArray(entry?.sequence, `${label}.alternatives[${index}].sequence`),
          context: optionalString(entry?.context, `${label}.alternatives[${index}].context`),
        }))
      : [],
    context: optionalString(value.context, `${label}.context`),
    executionStatus: 'SOURCE_SEQUENCE_ONLY',
  };
}

function normalizeMode(mode, characterId, index) {
  const label = `${characterId}.modes[${index}]`;
  const key = nonEmptyString(mode?.key, `${label}.key`);
  return {
    key,
    role: optionalString(mode?.role, `${label}.role`),
    defaultCandidate: mode?.defaultCandidate === true,
    weapon: normalizedWeapon(mode?.weapon, `${label}.weapon`),
    echo: normalizedEcho(mode?.echo, `${label}.echo`),
    stats: normalizedStats(mode?.stats, `${label}.stats`),
    team: normalizedTeam(mode?.team, `${label}.team`),
    rotation: normalizedRotation(mode?.rotation, `${label}.rotation`),
    requiredSpecializedAdapters: stringArray(mode?.requiredSpecializedAdapters, `${label}.requiredSpecializedAdapters`),
    notes: stringArray(mode?.notes, `${label}.notes`),
  };
}

function missingContext(mode) {
  const missing = [];
  if (!mode.role) missing.push('role');
  if (!mode.weapon) missing.push('weapon');
  if (!mode.echo?.sonataSet) missing.push('sonataSet');
  if (!mode.echo?.mainEcho) missing.push('mainEcho');
  if (mode.echo?.costLayout.length !== 5) missing.push('costLayout');
  if (!mode.echo || mode.echo.mainStats.length !== 5) missing.push('mainStats');
  if (!mode.stats || mode.stats.priority.length === 0) missing.push('statPriority');
  if (!mode.team || mode.team.members.length !== 3) missing.push('team');
  if (!mode.rotation || mode.rotation.sequence.length === 0) missing.push('rotation');
  return missing;
}

function sourceDisposition(character) {
  if (character.rawPreflightBlockers.length > 0) return 'RAW_PREFLIGHT_BLOCKED';
  if (character.sourceConflict) return 'SOURCE_CONFLICT';
  if (character.modes.length > 1) return 'MULTI_MODE';
  if (character.modes.length === 0 || character.modes.some((mode) => missingContext(mode).length > 0)) return 'MISSING_CONTEXT';
  return 'READY_FOR_REVIEW';
}

function normalizeCharacter(character, index) {
  const characterId = nonEmptyString(character?.characterId, `characters[${index}].characterId`);
  const modes = Array.isArray(character?.modes)
    ? character.modes.map((mode, modeIndex) => normalizeMode(mode, characterId, modeIndex))
    : [];
  const rawPreflightBlockers = stringArray(character?.rawPreflightBlockers, `${characterId}.rawPreflightBlockers`);
  const normalized = {
    characterId,
    sources: normalizedSources(character?.sources, characterId),
    modes,
    sourceConflict: character?.sourceConflict === true,
    sourceConflictNotes: stringArray(character?.sourceConflictNotes, `${characterId}.sourceConflictNotes`),
    rawPreflightBlockers,
    notes: stringArray(character?.notes, `${characterId}.notes`),
  };
  const missingByMode = Object.fromEntries(modes.map((mode) => [mode.key, missingContext(mode)]));
  const requiredSpecializedAdapters = [...new Set(modes.flatMap((mode) => mode.requiredSpecializedAdapters))].sort();
  return {
    ...normalized,
    sourceDisposition: sourceDisposition(normalized),
    executionDisposition: requiredSpecializedAdapters.length > 0
      ? 'SPECIALIZED_ADAPTER_REQUIRED'
      : 'NO_KNOWN_SPECIALIZED_ADAPTER',
    missingByMode,
    requiredSpecializedAdapters,
    promotionStatus: 'REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
  };
}

export function buildProfileCandidateReview(input) {
  if (input?.kind !== INPUT_KIND) fail(`kind must be ${INPUT_KIND}`);
  if (input?.verificationStatus !== 'NOT_VERIFIED') fail('verificationStatus must be NOT_VERIFIED');
  if (input?.importStatus !== 'CANDIDATE_ONLY') fail('importStatus must be CANDIDATE_ONLY');
  if (!Array.isArray(input.characters) || input.characters.length === 0) fail('characters must be a non-empty array');

  const characters = input.characters.map(normalizeCharacter);
  const duplicateIds = characters
    .map((character) => character.characterId)
    .filter((id, index, all) => all.indexOf(id) !== index);
  if (duplicateIds.length > 0) fail(`duplicate characterId entries: ${[...new Set(duplicateIds)].join(', ')}`);

  const sourceDispositionCounts = Object.fromEntries(
    PROFILE_SOURCE_DISPOSITIONS.map((disposition) => [
      disposition,
      characters.filter((character) => character.sourceDisposition === disposition).length,
    ]),
  );
  const executionDispositionCounts = Object.fromEntries(
    PROFILE_EXECUTION_DISPOSITIONS.map((disposition) => [
      disposition,
      characters.filter((character) => character.executionDisposition === disposition).length,
    ]),
  );

  return {
    kind: OUTPUT_KIND,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    sourceCheckpoint: input.sourceCheckpoint ?? null,
    promotionStatus: 'REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
    canonicalWriteAllowed: false,
    sourceDispositionCounts,
    executionDispositionCounts,
    characters,
    notes: [
      'This artifact is transcription/structuring/review input only.',
      'No generated candidate may become canonical or VERIFIED without character-by-character semantic/source review.',
      'SOURCE_SEQUENCE_ONLY never implies executable timing, uptime, or combat-state behavior.',
    ],
  };
}
