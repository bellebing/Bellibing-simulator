const INPUT_KIND = 'PROFILE_HORIZONTAL_COHORT_INPUT';
const OUTPUT_KIND = 'PROFILE_HORIZONTAL_COHORT_REVIEW';

export const PROFILE_HORIZONTAL_PHASES = Object.freeze([
  'MODE_TEAM_CONTEXT',
  'WEAPON',
  'ECHO_SONATA',
  'STATS_ER',
  'SOURCE_ROTATION',
  'EXECUTION_ADAPTERS',
  'PROMOTION_FREEZE',
]);

const REVIEW_STATES = new Set(['PENDING_REVIEW', 'REVIEWED', 'BLOCKED']);

function fail(message) {
  throw new Error(`Profile horizontal cohort input rejected: ${message}`);
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string`);
  return value.trim();
}

function uniqueStrings(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  const normalized = value.map((entry, index) => nonEmptyString(entry, `${label}[${index}]`));
  const duplicate = normalized.find((entry, index) => normalized.indexOf(entry) !== index);
  if (duplicate) fail(`${label} contains duplicate ${duplicate}`);
  return normalized;
}

function phaseReview(manifest, characterId, modeKey, phase) {
  const key = `${characterId}:${modeKey}:${phase}`;
  const review = manifest.phaseReviews?.[key];
  if (review == null) return { reviewState: 'PENDING_REVIEW', notes: [] };
  const reviewState = nonEmptyString(review.reviewState, `${key}.reviewState`);
  if (!REVIEW_STATES.has(reviewState)) fail(`${key}.reviewState must be PENDING_REVIEW, REVIEWED, or BLOCKED`);
  const notes = Array.isArray(review.notes)
    ? review.notes.map((entry, index) => nonEmptyString(entry, `${key}.notes[${index}]`))
    : [];
  return { reviewState, notes };
}

function extraction(blockers, data) {
  return {
    extractionState: blockers.length === 0 ? 'SOURCE_FIELDS_PRESENT' : 'SOURCE_FIELDS_MISSING',
    blockers,
    data,
  };
}

function stageMode(character, mode, manifest) {
  const missing = character.missingByMode?.[mode.key] ?? [];
  const modeContextBlockers = missing.filter((field) => field === 'role' || field === 'team');
  const weaponBlockers = missing.filter((field) => field === 'weapon');
  const echoBlockers = missing.filter((field) => ['sonataSet', 'mainEcho', 'costLayout', 'mainStats'].includes(field));
  const statsBlockers = missing.filter((field) => field === 'statPriority');
  const rotationBlockers = missing.filter((field) => field === 'rotation');

  const phase = (name, staged) => {
    const review = phaseReview(manifest, character.characterId, mode.key, name);
    if (review.reviewState === 'REVIEWED' && staged.blockers.length > 0) {
      fail(`${character.characterId}:${mode.key}:${name} cannot be REVIEWED while source fields are missing: ${staged.blockers.join(', ')}`);
    }
    return {
      phase: name,
      ...staged,
      ...review,
    };
  };

  const phases = {
    MODE_TEAM_CONTEXT: phase('MODE_TEAM_CONTEXT', extraction(modeContextBlockers, {
      role: mode.role,
      defaultCandidate: mode.defaultCandidate,
      team: mode.team,
    })),
    WEAPON: phase('WEAPON', extraction(weaponBlockers, mode.weapon)),
    ECHO_SONATA: phase('ECHO_SONATA', extraction(echoBlockers, mode.echo)),
    STATS_ER: phase('STATS_ER', extraction(statsBlockers, {
      stats: mode.stats,
      erBand: mode.stats?.erBand ?? null,
      numericErInvented: false,
    })),
    SOURCE_ROTATION: phase('SOURCE_ROTATION', extraction(rotationBlockers, mode.rotation == null ? null : {
      ...mode.rotation,
      executionStatus: 'SOURCE_SEQUENCE_ONLY',
    })),
    EXECUTION_ADAPTERS: phase('EXECUTION_ADAPTERS', extraction([], {
      executionDisposition: character.executionDisposition,
      requiredSpecializedAdapters: mode.requiredSpecializedAdapters,
      noKnownAdapterDoesNotMeanExecutable: true,
    })),
    PROMOTION_FREEZE: phase('PROMOTION_FREEZE', {
      extractionState: 'REVIEW_GATE_ONLY',
      blockers: [],
      data: {
        promotionStatus: 'REVIEW_REQUIRED',
        verificationStatus: 'NOT_VERIFIED',
        canonicalWriteAllowed: false,
      },
    }),
  };

  const sourceFieldBlockers = [
    ...modeContextBlockers,
    ...weaponBlockers,
    ...echoBlockers,
    ...statsBlockers,
    ...rotationBlockers,
  ];

  return {
    modeKey: mode.key,
    sourceDisposition: character.sourceDisposition,
    verificationStatus: 'NOT_VERIFIED',
    canonicalWriteAllowed: false,
    phases,
    materializationCandidate: {
      kind: 'PROFILE_MATERIALIZATION_CANDIDATE',
      characterId: character.characterId,
      modeKey: mode.key,
      materializationStatus: sourceFieldBlockers.length === 0
        ? 'DRAFT_READY_FOR_SEMANTIC_REVIEW'
        : 'BLOCKED_BY_MISSING_SOURCE_FIELDS',
      blockers: [...new Set(sourceFieldBlockers)],
      sourceData: {
        role: mode.role,
        defaultCandidate: mode.defaultCandidate,
        weapon: mode.weapon,
        echo: mode.echo,
        stats: mode.stats,
        team: mode.team,
        rotation: mode.rotation == null ? null : {
          ...mode.rotation,
          executionStatus: 'SOURCE_SEQUENCE_ONLY',
        },
        requiredSpecializedAdapters: mode.requiredSpecializedAdapters,
        notes: mode.notes,
      },
      verificationStatus: 'NOT_VERIFIED',
      canonicalWriteAllowed: false,
    },
  };
}

function stageCharacter(character, manifest) {
  const modes = character.modes.map((mode) => stageMode(character, mode, manifest));
  return {
    characterId: character.characterId,
    sources: character.sources,
    sourceDisposition: character.sourceDisposition,
    executionDisposition: character.executionDisposition,
    rawPreflightBlockers: character.rawPreflightBlockers,
    notes: character.notes,
    parkedBlockers: [
      ...character.rawPreflightBlockers,
      ...modes.flatMap((mode) => Object.values(mode.phases).flatMap((phase) => phase.blockers)),
    ],
    modes,
    verificationStatus: 'NOT_VERIFIED',
    canonicalWriteAllowed: false,
  };
}

export function buildProfileHorizontalCohort(candidateReview, manifest, currentProfileSourcePendingIds) {
  if (manifest?.kind !== INPUT_KIND) fail(`kind must be ${INPUT_KIND}`);
  if (manifest?.verificationStatus !== 'NOT_VERIFIED') fail('verificationStatus must be NOT_VERIFIED');
  if (manifest?.canonicalWriteAllowed !== false) fail('canonicalWriteAllowed must be false');
  if (candidateReview?.kind !== 'PROFILE_CANDIDATE_REVIEW') fail('candidateReview must be PROFILE_CANDIDATE_REVIEW');
  if (candidateReview?.verificationStatus !== 'NOT_VERIFIED' || candidateReview?.canonicalWriteAllowed !== false) {
    fail('candidateReview must remain NOT_VERIFIED and review-only');
  }

  const characterIds = uniqueStrings(manifest.characterIds, 'characterIds');
  if (characterIds.length < 10 || characterIds.length > 20) {
    fail(`characterIds must contain 10-20 Characters, found ${characterIds.length}`);
  }
  const sourcePendingIds = new Set(uniqueStrings(currentProfileSourcePendingIds, 'currentProfileSourcePendingIds'));
  const byId = new Map(candidateReview.characters.map((character) => [character.characterId, character]));

  const missingCandidates = characterIds.filter((id) => !byId.has(id));
  if (missingCandidates.length > 0) fail(`unknown candidate Characters: ${missingCandidates.join(', ')}`);
  const noLongerPending = characterIds.filter((id) => !sourcePendingIds.has(id));
  if (noLongerPending.length > 0) fail(`cohort contains Characters no longer PROFILE_SOURCE_PENDING: ${noLongerPending.join(', ')}`);

  const characters = characterIds.map((id) => stageCharacter(byId.get(id), manifest));
  const modeCount = characters.reduce((sum, character) => sum + character.modes.length, 0);
  const phaseCounts = Object.fromEntries(PROFILE_HORIZONTAL_PHASES.map((phaseName) => {
    const phases = characters.flatMap((character) => character.modes.map((mode) => mode.phases[phaseName]));
    return [phaseName, {
      sourceFieldsPresent: phases.filter((phase) => phase.extractionState === 'SOURCE_FIELDS_PRESENT').length,
      sourceFieldsMissing: phases.filter((phase) => phase.extractionState === 'SOURCE_FIELDS_MISSING').length,
      reviewed: phases.filter((phase) => phase.reviewState === 'REVIEWED').length,
      blocked: phases.filter((phase) => phase.reviewState === 'BLOCKED').length,
      pendingReview: phases.filter((phase) => phase.reviewState === 'PENDING_REVIEW').length,
    }];
  }));

  const materializationCandidates = characters.flatMap((character) => character.modes.map((mode) => mode.materializationCandidate));

  return {
    kind: OUTPUT_KIND,
    cohortId: nonEmptyString(manifest.cohortId, 'cohortId'),
    sourceRoster: nonEmptyString(manifest.sourceRoster, 'sourceRoster'),
    sourceCheckpoint: manifest.sourceCheckpoint ?? candidateReview.sourceCheckpoint ?? null,
    characterCount: characters.length,
    modeCount,
    phaseCounts,
    characters,
    materializationCandidates,
    parkedBlockerCount: characters.reduce((sum, character) => sum + character.parkedBlockers.length, 0),
    verificationStatus: 'NOT_VERIFIED',
    canonicalWriteAllowed: false,
    notes: [
      'This cohort is horizontal staging/review data, not canonical profile truth.',
      'Automation may extract and materialize NOT_VERIFIED draft candidates but never marks semantic truth VERIFIED.',
      'SOURCE_SEQUENCE_ONLY remains non-executable until independently modeled execution/combat adapters exist.',
      'Missing or blocked fields stay parked per Character/mode so the rest of the cohort can continue.',
      'Unspecified mode/default choice stays null rather than being normalized into a false default decision.',
    ],
  };
}
