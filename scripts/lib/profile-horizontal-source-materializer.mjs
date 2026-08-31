const SNAPSHOT_KIND = 'PRYDWEN_PROFILE_SOURCE_SNAPSHOT';
const REVIEW_KIND = 'PROFILE_HORIZONTAL_SEMANTIC_REVIEW';
const APPROVED = 'APPROVED_FOR_CANONICAL_VERIFIED';
const PARKED = 'PARKED_SEMANTIC_AMBIGUITY';

function fail(message) {
  throw new Error(`Horizontal profile source materializer rejected: ${message}`);
}

function text(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string`);
  return value.trim();
}

function strings(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  return value.map((entry, index) => text(entry, `${label}[${index}]`));
}

function slug(value) {
  return text(value, 'slug value').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function sourceRole(value) {
  const normalized = text(value, 'source role').toLowerCase();
  if (normalized === 'dps') return 'MAIN_DPS';
  if (normalized === 'hybrid') return 'HYBRID';
  if (normalized === 'support') return 'SUPPORT';
  fail(`unsupported source role ${value}`);
}

function parseWeapon(value) {
  const source = text(value, 'weapon candidate');
  const match = /^(.*?)\s+\(R([1-5])\)$/.exec(source);
  if (!match) fail(`weapon candidate must end in (R1)-(R5): ${source}`);
  return {name: match[1].trim(), rank: `R${match[2]}`};
}

function parseCost(value) {
  const match = /^([134])\s*cost$/i.exec(text(value, 'Echo cost'));
  if (!match) fail(`unsupported Echo cost ${value}`);
  return Number(match[1]);
}

function normalizeStat(value) {
  const source = text(value, 'stat').replace(/\s+/g, ' ').trim();
  const upper = source.toUpperCase();
  if (upper === 'CRIT RATE') return 'CRIT Rate';
  if (upper === 'CRIT DMG') return 'CRIT DMG';
  if (upper === 'ATK') return 'Flat ATK';
  if (upper === 'DEF') return 'Flat DEF';
  if (upper === 'ENERGY REGEN (UNTIL SATISFIED)') return 'Energy Regen';
  if (/^HEAVY (?:ATK )?DMG%$/i.test(source)) return 'Heavy Attack DMG';
  if (/^BASIC (?:ATK )?DMG%$/i.test(source)) return 'Basic Attack DMG';
  if (/^SKILL DMG%$/i.test(source)) return 'Skill DMG';
  if (/^LIBERATION (?:ATK )?DMG%$/i.test(source)) return 'Liberation DMG';
  return source;
}

function parseStatPriority(value) {
  const source = text(value, 'substat priority').replace(/^Substats:\s*/i, '');
  const groups = source.split(/\s*>+\s*/).map((group) =>
    group.split(/\s*=\s*/).map(normalizeStat).filter(Boolean)
  ).filter((group) => group.length > 0);
  if (groups.length === 0) fail('substat priority yielded no groups');
  const priority = groups.flat();
  const relations = groups.filter((group) => group.length > 1).map((group) => group.join(' = '));
  return {priority, relations};
}

function candidateId(characterId, kind, sourceRank = null, name = null) {
  if (kind === 'role') return `${characterId}:role:${sourceRank}`;
  if (kind === 'weapon') return `${characterId}:weapon:${sourceRank}`;
  if (kind === 'sonata') return `${characterId}:sonata:${sourceRank}`;
  if (kind === 'mainEcho') return `${characterId}:main-echo:${sourceRank}:${slug(name)}`;
  if (kind === 'mainStats') return `${characterId}:main-stats:source`;
  if (kind === 'statPriority') return `${characterId}:stat-priority:source`;
  if (kind === 'endgameStats') return `${characterId}:endgame-stats:source`;
  fail(`unsupported candidate kind ${kind}`);
}

function addCandidate(map, candidate) {
  if (map.has(candidate.id)) fail(`duplicate candidate id ${candidate.id}`);
  map.set(candidate.id, candidate);
}

export function buildHorizontalProfileSourceCandidates(snapshot) {
  if (snapshot?.kind !== SNAPSHOT_KIND || snapshot?.importStatus !== 'CANDIDATE_ONLY' || snapshot?.verificationStatus !== 'NOT_VERIFIED') {
    fail(`snapshot must be ${SNAPSHOT_KIND} / CANDIDATE_ONLY / NOT_VERIFIED`);
  }
  if (!Array.isArray(snapshot.characters)) fail('snapshot.characters must be an array');

  const map = new Map();
  for (const row of snapshot.characters) {
    const characterId = text(row?.characterId, 'snapshot.characterId');
    if (!['FETCHED', 'PARTIAL'].includes(row?.fetchStatus)) continue;

    (row.roleLeads ?? []).forEach((role, index) => addCandidate(map, {
      id: candidateId(characterId, 'role', index + 1), characterId, kind: 'role', sourceIndex: index + 1,
      sourceValue: text(role, `${characterId}.role`), role: sourceRole(role),
    }));

    (row.weapons ?? []).forEach((weapon) => addCandidate(map, {
      id: candidateId(characterId, 'weapon', weapon.sourceRank), characterId, kind: 'weapon', sourceRank: weapon.sourceRank,
      ...parseWeapon(weapon.name),
    }));

    (row.echoRecommendations ?? []).forEach((sonata) => addCandidate(map, {
      id: candidateId(characterId, 'sonata', sonata.sourceRank), characterId, kind: 'sonata', sourceRank: sonata.sourceRank,
      name: text(sonata.name, `${characterId}.sonata.name`),
    }));

    (row.mainEchoLeads ?? []).forEach((echo) => addCandidate(map, {
      id: candidateId(characterId, 'mainEcho', echo.setSourceRank, echo.name), characterId, kind: 'mainEcho', setSourceRank: echo.setSourceRank,
      name: text(echo.name, `${characterId}.mainEcho.name`), sourceField: text(echo.sourceField, `${characterId}.mainEcho.sourceField`),
    }));

    const mainStats = (row.mainStats ?? []).map((entry, index) => ({
      sourceIndex: entry.sourceIndex ?? index + 1,
      cost: parseCost(entry.cost),
      stats: text(entry.stats, `${characterId}.mainStats[${index}].stats`),
    }));
    if (mainStats.length > 0) addCandidate(map, {id: candidateId(characterId, 'mainStats'), characterId, kind: 'mainStats', rows: mainStats});

    if (typeof row.substatPriorityText === 'string' && row.substatPriorityText.trim()) addCandidate(map, {
      id: candidateId(characterId, 'statPriority'), characterId, kind: 'statPriority', sourceText: row.substatPriorityText,
      ...parseStatPriority(row.substatPriorityText),
    });

    const endgameStatLines = strings(row.endgameStatLines ?? [], `${characterId}.endgameStatLines`);
    if (endgameStatLines.length > 0) addCandidate(map, {
      id: candidateId(characterId, 'endgameStats'), characterId, kind: 'endgameStats', lines: endgameStatLines,
      energyRegenText: strings(row.energyRegenText ?? [], `${characterId}.energyRegenText`),
    });
  }
  return map;
}

function requireCandidate(candidates, id, characterId, kind) {
  const candidate = candidates.get(text(id, `${characterId}.${kind}CandidateId`));
  if (!candidate) fail(`${characterId} references missing candidate ${id}`);
  if (candidate.characterId !== characterId || candidate.kind !== kind) fail(`${characterId} candidate ${id} is not a ${kind} candidate for that Character`);
  return candidate;
}

function validateReview(review) {
  if (review?.kind !== REVIEW_KIND) fail(`review kind must be ${REVIEW_KIND}`);
  if (review?.semanticReviewRequired !== true || review?.automationMayApproveSemanticTruth !== false) {
    fail('review must require semantic review and explicitly forbid automation approval');
  }
  if (!Array.isArray(review.entries) || review.entries.length !== review.summary?.reviewedCharacterCount) fail('review entry count must equal reviewedCharacterCount');
  const duplicate = review.entries.map((entry) => entry.characterId).find((id, index, all) => all.indexOf(id) !== index);
  if (duplicate) fail(`duplicate review Character ${duplicate}`);
  const approved = review.entries.filter((entry) => entry.decision === APPROVED);
  const parked = review.entries.filter((entry) => entry.decision === PARKED);
  if (approved.length !== review.summary?.approvedCharacterCount || parked.length !== review.summary?.parkedCharacterCount) fail('review decision counts do not match summary');
  if (approved.length + parked.length !== review.entries.length) fail('review contains unsupported decision');
  for (const entry of parked) {
    if (entry.sourceComplete !== false || entry.isDefault !== null || entry.candidateIds !== null || !Array.isArray(entry.blockers) || entry.blockers.length === 0) {
      fail(`${entry.characterId} parked entry must remain incomplete with explicit blockers and no candidates/default`);
    }
  }
  return approved;
}

export function buildReviewedHorizontalProfileSourceInput(snapshot, review) {
  const approved = validateReview(review);
  const candidates = buildHorizontalProfileSourceCandidates(snapshot);
  const snapshotById = new Map(snapshot.characters.map((row) => [row.characterId, row]));

  const characters = approved.map((entry) => {
    const characterId = text(entry.characterId, 'review.characterId');
    if (entry.sourceComplete !== true || entry.isDefault !== true || entry.modeKey !== 'standard' || (entry.blockers ?? []).length > 0) {
      fail(`${characterId} approved entry must be source-complete standard default with zero blockers`);
    }
    const row = snapshotById.get(characterId);
    if (!row) fail(`approved Character ${characterId} is missing from the pinned snapshot`);
    if (row.sourceUrl !== entry.source?.url) fail(`${characterId} source URL drift between snapshot and review`);

    const role = requireCandidate(candidates, entry.candidateIds?.role, characterId, 'role');
    if (role.role !== entry.reviewedRole) fail(`${characterId} reviewed role ${entry.reviewedRole} does not match candidate ${role.role}`);
    const weapon = requireCandidate(candidates, entry.candidateIds?.weapon, characterId, 'weapon');
    const sonata = requireCandidate(candidates, entry.candidateIds?.sonata, characterId, 'sonata');
    const mainEcho = requireCandidate(candidates, entry.candidateIds?.mainEcho, characterId, 'mainEcho');
    const mainStats = requireCandidate(candidates, entry.candidateIds?.mainStats, characterId, 'mainStats');
    const statPriority = requireCandidate(candidates, entry.candidateIds?.statPriority, characterId, 'statPriority');
    const endgameStats = requireCandidate(candidates, entry.candidateIds?.endgameStats, characterId, 'endgameStats');

    if (mainEcho.setSourceRank !== sonata.sourceRank) fail(`${characterId} selected Main Echo source rank ${mainEcho.setSourceRank} does not match Sonata source rank ${sonata.sourceRank}`);
    if (mainStats.rows.length !== 5) fail(`${characterId} requires exactly five source main-stat rows`);
    if (entry.team?.members?.length !== 3 || new Set(entry.team.members).size !== 3 || !entry.team.members.includes(characterId)) fail(`${characterId} reviewed team must contain exactly three unique members including the Character`);
    if (entry.rotation?.executionStatus !== 'SOURCE_SEQUENCE_ONLY' || !Array.isArray(entry.rotation.sequence) || entry.rotation.sequence.length === 0) fail(`${characterId} reviewed rotation must be non-empty SOURCE_SEQUENCE_ONLY`);
    for (const forbidden of ['rotationSeconds', 'uptime', 'engineModelId']) if (entry.rotation[forbidden] != null) fail(`${characterId} review may not contain ${forbidden}`);

    return {
      characterId,
      sources: [{label: text(entry.source.label, `${characterId}.source.label`), url: text(entry.source.url, `${characterId}.source.url`), checkedAt: text(entry.source.checkedAt, `${characterId}.source.checkedAt`), sourceClass: 'CURRENT_REFERENCE_GUIDE'}],
      modes: [{
        key: 'standard', role: role.role,
        weapon: {name: weapon.name, rank: weapon.rank, sourceCandidateId: weapon.id},
        echo: {
          sonataSet: sonata.name, mainEcho: mainEcho.name,
          costLayout: mainStats.rows.map((row) => row.cost), mainStats: mainStats.rows.map((row) => row.stats),
          context: `${entry.team.context} Selected deterministic source candidates ${sonata.id} + ${mainEcho.id}.`,
          sourceCandidateIds: [sonata.id, mainEcho.id, mainStats.id],
        },
        stats: {
          priority: statPriority.priority, relations: statPriority.relations, erBand: null,
          notes: [`Exact snapshot stat priority: ${statPriority.sourceText}`, ...endgameStats.lines.map((line) => `Exact snapshot endgame stat source: ${line}`), ...endgameStats.energyRegenText.map((line) => `Exact snapshot ER source: ${line}`), 'No numeric ER gate is materialized in this tranche; endgame/ER text remains source context unless a later exact-context review promotes a number.'],
          sourceCandidateIds: [statPriority.id, endgameStats.id],
        },
        team: {members: [...entry.team.members], context: text(entry.team.context, `${characterId}.team.context`)},
        rotation: {
          sequence: strings(entry.rotation.sequence, `${characterId}.rotation.sequence`),
          alternatives: (entry.rotation.alternatives ?? []).map((alternative, index) => ({label: text(alternative.label, `${characterId}.rotation.alternatives[${index}].label`), sequence: strings(alternative.sequence, `${characterId}.rotation.alternatives[${index}].sequence`), context: text(alternative.context, `${characterId}.rotation.alternatives[${index}].context`)})),
          context: text(entry.rotation.context, `${characterId}.rotation.context`), notes: strings(entry.rotation.notes ?? [], `${characterId}.rotation.notes`), executionStatus: 'SOURCE_SEQUENCE_ONLY',
        },
        defaultCandidate: true,
        notes: [...strings(entry.rationale ?? [], `${characterId}.rationale`), `Deterministic role candidate: ${role.id}.`, `Deterministic weapon candidate: ${weapon.id}.`],
      }],
    };
  });

  return {
    input: {
      kind: 'PROFILE_SOURCE_RESEARCH_INPUT', importStatus: 'CANDIDATE_ONLY', verificationStatus: 'NOT_VERIFIED', generatedAt: review.checkedAt,
      sourceCheckpoint: {repoMain: review.reviewedAgainstRepoMain, profileSourceWorkflowRunId: review.sourceSnapshot.workflowRunId, profileSourceWorkflowHeadSha: review.sourceSnapshot.workflowHeadSha, profileSourceArtifactId: review.sourceSnapshot.artifactId, profileSourceArtifactDigest: review.sourceSnapshot.artifactDigest},
      characters,
    },
    semanticReview: {
      kind: 'PROFILE_COHORT_SEMANTIC_PROMOTION_REVIEW', cohortId: review.cohortId, checkedAt: review.checkedAt, semanticReviewRequired: true, automationMayApproveSemanticTruth: false,
      entries: approved.map((entry) => ({characterId: entry.characterId, modeKey: 'standard', sourceComplete: true, decision: APPROVED, isDefault: true, blockers: [], rationale: [...entry.rationale]})),
    },
    candidateCount: candidates.size,
    approvedCharacterIds: approved.map((entry) => entry.characterId),
    parkedCharacterIds: review.entries.filter((entry) => entry.decision === PARKED).map((entry) => entry.characterId),
  };
}

export const PROFILE_HORIZONTAL_REVIEW_DECISIONS = Object.freeze({APPROVED, PARKED});