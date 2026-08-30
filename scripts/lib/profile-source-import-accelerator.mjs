export const PROFILE_SOURCE_IMPORT_DISPOSITIONS = Object.freeze([
  'AUTO_EXTRACTED_READY_FOR_REVIEW',
  'NEEDS_SEMANTIC_REVIEW',
  'MISSING_TEAM_MODE',
  'MISSING_ROTATION',
  'SOURCE_CONFLICT',
  'RAW_PREFLIGHT_BLOCKED',
]);

const COVERAGE_KEYS = Object.freeze([
  'roleMode',
  'weapons',
  'sonataSet',
  'mainEcho',
  'mainStats',
  'statPriority',
  'endgameErText',
  'provenance',
]);

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function modeHasTeam(mode) {
  return Array.isArray(mode?.team?.members) && mode.team.members.length === 3;
}

function modeHasRotation(mode) {
  return Array.isArray(mode?.rotation?.sequence) && mode.rotation.sequence.length > 0;
}

function candidateCoverage(candidate) {
  const modes = candidate?.modes ?? [];
  const notes = modes.flatMap((mode) => [
    ...(mode?.notes ?? []),
    ...(mode?.stats?.notes ?? []),
    mode?.stats?.erBand?.context ?? '',
  ]).filter(nonEmpty);
  return {
    roleMode: modes.some((mode) => nonEmpty(mode?.role)),
    weapons: modes.some((mode) => nonEmpty(mode?.weapon?.name)),
    sonataSet: modes.some((mode) => nonEmpty(mode?.echo?.sonataSet)),
    mainEcho: modes.some((mode) => nonEmpty(mode?.echo?.mainEcho)),
    mainStats: modes.some((mode) => Array.isArray(mode?.echo?.mainStats) && mode.echo.mainStats.length > 0),
    statPriority: modes.some((mode) => Array.isArray(mode?.stats?.priority) && mode.stats.priority.length > 0),
    endgameErText: modes.some((mode) => mode?.stats?.erBand != null) || notes.some((note) => /energy regen|\bER\b/i.test(note)),
    provenance: Array.isArray(candidate?.sources) && candidate.sources.some((source) => nonEmpty(source?.url) && nonEmpty(source?.checkedAt)),
  };
}

function snapshotCoverage(snapshotRow) {
  const fetched = snapshotRow && ['FETCHED', 'PARTIAL'].includes(snapshotRow.fetchStatus);
  if (!fetched) return Object.fromEntries(COVERAGE_KEYS.map((key) => [key, false]));
  return {
    roleMode: Array.isArray(snapshotRow.roleLeads) && snapshotRow.roleLeads.some(nonEmpty),
    weapons: Array.isArray(snapshotRow.weapons) && snapshotRow.weapons.some((weapon) => nonEmpty(weapon?.name)),
    sonataSet: Array.isArray(snapshotRow.echoRecommendations) && snapshotRow.echoRecommendations.some((echo) => nonEmpty(echo?.name)),
    mainEcho: Array.isArray(snapshotRow.mainEchoLeads) && snapshotRow.mainEchoLeads.some((echo) => nonEmpty(echo?.name)),
    mainStats: Array.isArray(snapshotRow.mainStats) && snapshotRow.mainStats.some((row) => nonEmpty(row?.stats)),
    statPriority: nonEmpty(snapshotRow.substatPriorityText),
    endgameErText: Array.isArray(snapshotRow.endgameStatLines) && snapshotRow.endgameStatLines.some(nonEmpty),
    provenance: nonEmpty(snapshotRow.sourceUrl) && nonEmpty(snapshotRow.checkedAt),
  };
}

function mergedCoverage(candidate, snapshotRow) {
  const candidateFields = candidateCoverage(candidate);
  const snapshotFields = snapshotCoverage(snapshotRow);
  return Object.fromEntries(COVERAGE_KEYS.map((key) => [key, candidateFields[key] || snapshotFields[key]]));
}

function sourceLeadSnapshot(candidate, snapshotRow) {
  const modes = candidate?.modes ?? [];
  return {
    roleModeLeads: snapshotRow?.roleLeads ?? modes.flatMap((mode) => mode?.role ? [{ key: mode.key, role: mode.role }] : []),
    weapons: snapshotRow?.weapons ?? modes.flatMap((mode) => mode?.weapon ? [mode.weapon] : []),
    sonataSets: snapshotRow?.echoRecommendations ?? modes.flatMap((mode) => nonEmpty(mode?.echo?.sonataSet) ? [{
      modeKey: mode.key,
      name: mode.echo.sonataSet,
      alternatives: mode.echo.alternatives,
    }] : []),
    mainEchoes: snapshotRow?.mainEchoLeads ?? modes.flatMap((mode) => nonEmpty(mode?.echo?.mainEcho) ? [{
      modeKey: mode.key,
      name: mode.echo.mainEcho,
    }] : []),
    mainStats: snapshotRow?.mainStats ?? modes.flatMap((mode) => mode?.echo?.mainStats ?? []),
    statPriorityText: snapshotRow?.substatPriorityText ?? modes.flatMap((mode) => mode?.stats?.priority ?? []),
    endgameErText: snapshotRow?.endgameStatLines ?? modes.flatMap((mode) => [
      ...(mode?.stats?.notes ?? []),
      ...(mode?.stats?.erBand?.context ? [mode.stats.erBand.context] : []),
    ]),
  };
}

function classifyRow(readinessRow, candidate, snapshotRow) {
  const modes = candidate?.modes ?? [];
  const rawBlocked = (readinessRow?.rawDpsBlockers?.length ?? 0) > 0
    || readinessRow?.intrinsicDpsBlocked === true
    || readinessRow?.mechanicsSourceBlocked === true;
  const sourceConflict = candidate?.sourceDisposition === 'SOURCE_CONFLICT' || candidate?.sourceConflict === true;
  const missingTeamMode = modes.length !== 1
    || modes.some((mode) => !nonEmpty(mode?.role) || !modeHasTeam(mode));
  const missingRotation = modes.length === 0 || modes.some((mode) => !modeHasRotation(mode));
  const coverage = mergedCoverage(candidate, snapshotRow);
  const missingBuildFields = COVERAGE_KEYS.filter((key) => !coverage[key]);
  const snapshotNeedsReview = snapshotRow && snapshotRow.fetchStatus !== 'FETCHED';
  const candidateNeedsReview = !candidate
    || candidate.sourceDisposition !== 'READY_FOR_REVIEW'
    || candidate.promotionStatus !== 'REVIEW_REQUIRED'
    || candidate.verificationStatus !== 'NOT_VERIFIED';
  const needsSemanticReview = missingBuildFields.length > 0 || snapshotNeedsReview || candidateNeedsReview;

  const dispositions = [];
  if (rawBlocked) dispositions.push('RAW_PREFLIGHT_BLOCKED');
  if (sourceConflict) dispositions.push('SOURCE_CONFLICT');
  if (missingTeamMode) dispositions.push('MISSING_TEAM_MODE');
  if (missingRotation) dispositions.push('MISSING_ROTATION');
  if (needsSemanticReview) dispositions.push('NEEDS_SEMANTIC_REVIEW');
  if (dispositions.length === 0) dispositions.push('AUTO_EXTRACTED_READY_FOR_REVIEW');

  const priority = [
    'RAW_PREFLIGHT_BLOCKED',
    'SOURCE_CONFLICT',
    'MISSING_TEAM_MODE',
    'MISSING_ROTATION',
    'NEEDS_SEMANTIC_REVIEW',
    'AUTO_EXTRACTED_READY_FOR_REVIEW',
  ];
  const primaryDisposition = priority.find((value) => dispositions.includes(value));
  return { dispositions, primaryDisposition, coverage, missingBuildFields };
}

export function buildProfileSourceImportAccelerator({ readiness, candidateReview, sourceSnapshot = null }) {
  if (!readiness || !Array.isArray(readiness.profileSourcePendingIds) || !Array.isArray(readiness.characters)) {
    throw new Error('Profile source accelerator requires registry-derived readiness input.');
  }
  if (candidateReview?.verificationStatus !== 'NOT_VERIFIED' || candidateReview?.canonicalWriteAllowed !== false) {
    throw new Error('Profile source accelerator requires fail-closed NOT_VERIFIED candidate review input.');
  }
  if (sourceSnapshot && (sourceSnapshot.importStatus !== 'CANDIDATE_ONLY' || sourceSnapshot.verificationStatus !== 'NOT_VERIFIED')) {
    throw new Error('Profile source snapshot must remain CANDIDATE_ONLY / NOT_VERIFIED.');
  }

  const readinessById = new Map(readiness.characters.map((row) => [row.characterId, row]));
  const candidateById = new Map(candidateReview.characters.map((row) => [row.characterId, row]));
  const snapshotById = new Map((sourceSnapshot?.characters ?? []).map((row) => [row.characterId, row]));

  const characters = readiness.profileSourcePendingIds.map((characterId) => {
    const readinessRow = readinessById.get(characterId);
    const candidate = candidateById.get(characterId) ?? null;
    const snapshotRow = snapshotById.get(characterId) ?? null;
    const classification = classifyRow(readinessRow, candidate, snapshotRow);
    const coveredFieldCount = COVERAGE_KEYS.filter((key) => classification.coverage[key]).length;
    return {
      characterId,
      readinessDisposition: 'PROFILE_SOURCE_PENDING',
      primaryDisposition: classification.primaryDisposition,
      dispositions: classification.dispositions,
      sourceLeadCoverage: classification.coverage,
      coveredSourceFieldCount: coveredFieldCount,
      totalSourceFieldCount: COVERAGE_KEYS.length,
      missingBuildFields: classification.missingBuildFields,
      missingByMode: candidate?.missingByMode ?? {},
      sourceLeads: sourceLeadSnapshot(candidate, snapshotRow),
      sourceFetchStatus: snapshotRow?.fetchStatus ?? 'NOT_RUN',
      sourceWarnings: snapshotRow?.warnings ?? [],
      sourceUrl: snapshotRow?.sourceUrl ?? candidate?.sources?.[0]?.url ?? null,
      promotionStatus: 'REVIEW_REQUIRED',
      verificationStatus: 'NOT_VERIFIED',
      canonicalWriteAllowed: false,
    };
  });

  const dispositionCounts = Object.fromEntries(PROFILE_SOURCE_IMPORT_DISPOSITIONS.map((disposition) => [
    disposition,
    characters.filter((row) => row.primaryDisposition === disposition).length,
  ]));
  const dispositionCharacterIds = Object.fromEntries(PROFILE_SOURCE_IMPORT_DISPOSITIONS.map((disposition) => [
    disposition,
    characters.filter((row) => row.primaryDisposition === disposition).map((row) => row.characterId),
  ]));
  const automaticFieldCoverage = characters.reduce((sum, row) => sum + row.coveredSourceFieldCount, 0);
  const possibleFieldCoverage = characters.length * COVERAGE_KEYS.length;

  return {
    kind: 'PROFILE_SOURCE_IMPORT_ACCELERATOR_REVIEW',
    generatedAt: new Date().toISOString(),
    sourceCheckpoint: sourceSnapshot?.sourceCheckpoint ?? null,
    promotionStatus: 'REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
    canonicalWriteAllowed: false,
    profileSourcePendingCount: readiness.profileSourcePendingIds.length,
    dispositionCounts,
    dispositionCharacterIds,
    manualTranscription: {
      fieldKinds: [...COVERAGE_KEYS],
      automaticallyCoveredFieldCount: automaticFieldCoverage,
      possibleFieldCount: possibleFieldCoverage,
      remainingFieldCount: possibleFieldCoverage - automaticFieldCoverage,
    },
    characters,
    notes: [
      'Disposition is review workflow state only; it never promotes canonical profile truth.',
      'Role/mode, weapon, Sonata, Main Echo, main-stat, priority and endgame/ER values are source leads until explicitly reviewed.',
      'Numeric ER bands, teams, defaults, rotations, mechanics, trigger semantics, timestamps and uptime are never inferred by this accelerator.',
      'A blocked Character is classified independently and never prevents the remaining backlog from being extracted or reviewed.',
    ],
  };
}
