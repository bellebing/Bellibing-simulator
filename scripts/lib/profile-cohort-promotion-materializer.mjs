const REVIEW_KIND = 'PROFILE_COHORT_SEMANTIC_PROMOTION_REVIEW';
const APPROVED = 'APPROVED_FOR_CANONICAL_VERIFIED';

function fail(message) {
  throw new Error(`Profile promotion materializer rejected: ${message}`);
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) fail(`${label} must be a non-empty string`);
  return value.trim();
}

function uniqueByName(rows, label) {
  const map = new Map();
  for (const row of rows) {
    const name = nonEmptyString(row?.name, `${label}.name`);
    if (map.has(name)) fail(`${label} contains duplicate name ${name}`);
    map.set(name, row);
  }
  return map;
}

function reviewedProvenance(character, mode, reviewEntry, checkedAt) {
  const sourceLabels = [...new Set(character.sources.map((source) => source.label))];
  const sourceUrls = [...new Set(character.sources.map((source) => source.url))];
  const notes = [
    `Cohort 01 semantic promotion: ${character.characterId}:${mode.key}.`,
    `Reviewed role/team context: ${mode.role}; ${mode.team.context}`,
    `Reviewed Echo context: ${mode.echo.context}`,
    `Reviewed Stats/ER context: ${mode.stats.erBand?.context ?? 'No exact numeric ER gate is claimed for this reviewed context.'}`,
    `Reviewed source rotation context: ${mode.rotation.context}`,
    ...mode.stats.notes,
    ...mode.rotation.notes,
    ...reviewEntry.rationale,
    'Rotation source truth remains SOURCE_SEQUENCE_ONLY and does not claim executable timing, uptime, animation frames, or ENGINE_MODELED status.',
  ];
  for (const alternative of mode.rotation.alternatives ?? []) {
    notes.push(`Source rotation alternative retained for audit — ${alternative.label}: ${alternative.sequence.join(' -> ')} (${alternative.context})`);
  }
  return {sourceLabels, sourceUrls, checkedAt, notes};
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeStatName(value) {
  const trimmed = nonEmptyString(value, 'stat name');
  if (trimmed === 'Resonance Skill DMG') return 'Skill DMG';
  if (trimmed === 'Resonance Liberation DMG') return 'Liberation DMG';
  return trimmed;
}

function parseEchoMainStat(value) {
  const source = nonEmptyString(value, 'Echo main stat');
  const relation = source.includes(' / ')
    ? {separator: ' / ', tie: true}
    : source.includes(' ≥ ')
      ? {separator: ' ≥ ', tie: true}
      : source.includes(' > ')
        ? {separator: ' > ', tie: false}
        : null;
  if (!relation) return [{stat: normalizeStatName(source), priority: 1}];
  const parts = source.split(relation.separator).map((part) => normalizeStatName(part));
  if (parts.length !== 2) fail(`unsupported Echo main-stat relation: ${source}`);
  return parts.map((stat, index) => ({
    stat,
    priority: relation.tie ? 1 : index + 1,
    notes: `Source relation: ${source}`,
  }));
}

function equalityPairs(relations) {
  return relations.flatMap((relation) => {
    const match = /^(.+?) = (.+?)(?: after .*)?$/.exec(relation);
    if (!match) return [];
    return [[normalizeStatName(match[1]), normalizeStatName(match[2])]];
  });
}

function targetRules(stats) {
  const ordered = stats.priority.map(normalizeStatName);
  const parent = new Map(ordered.map((stat) => [stat, stat]));
  const find = (stat) => {
    const current = parent.get(stat) ?? stat;
    if (current === stat) return stat;
    const root = find(current);
    parent.set(stat, root);
    return root;
  };
  const union = (left, right) => {
    if (!parent.has(left) || !parent.has(right)) return;
    const l = find(left);
    const r = find(right);
    if (l !== r) parent.set(r, l);
  };
  for (const [left, right] of equalityPairs(stats.relations)) union(left, right);

  const priorityByRoot = new Map();
  let nextPriority = 1;
  for (const stat of ordered) {
    const root = find(stat);
    if (!priorityByRoot.has(root)) priorityByRoot.set(root, nextPriority++);
  }
  return ordered.map((stat) => ({
    stat,
    priority: priorityByRoot.get(find(stat)),
    ...(stats.relations.some((relation) => relation.includes(stat))
      ? {notes: stats.relations.filter((relation) => relation.includes(stat)).join(' ')}
      : {}),
  }));
}

function statGates(stats) {
  const band = stats.erBand;
  if (band == null) return [];
  const minimum = band.minimum ?? band.preferred ?? band.maximum;
  if (!(minimum > 0)) fail('numeric ER band requires a positive source-backed minimum/preferred/maximum');
  const preferred = band.preferred != null && band.preferred >= minimum ? band.preferred : undefined;
  const bounds = [
    band.minimum == null ? null : `minimum=${band.minimum}`,
    band.preferred == null ? null : `preferred=${band.preferred}`,
    band.maximum == null ? null : `maximum=${band.maximum}`,
  ].filter(Boolean).join(', ');
  return [{
    stat: 'Energy Regen Total',
    minimum,
    ...(preferred === undefined ? {} : {preferred}),
    notes: `${band.context} Source ER band fields: ${bounds}.`,
  }];
}

function selectedRole(role) {
  if (role === 'MAIN_DPS') return 'DPS';
  if (role === 'SUPPORT') return 'SUPPORT';
  if (role === 'HYBRID') return 'SUB_DPS';
  return 'FLEX';
}

function teamMembers(mode, characterId) {
  return mode.team.members.map((memberId) => ({
    characterId: memberId,
    role: memberId === characterId ? selectedRole(mode.role) : 'FLEX',
  }));
}

function assertCompleteMode(mode, key) {
  for (const field of ['role', 'weapon', 'echo', 'stats', 'team', 'rotation']) {
    if (mode?.[field] == null) fail(`${key} is approved but missing ${field}`);
  }
  if (mode.team.members?.length !== 3) fail(`${key} approved team must contain exactly three members`);
  if (mode.echo.costLayout?.length !== 5 || mode.echo.mainStats?.length !== 5) fail(`${key} approved Echo shell must contain five slots`);
  if (mode.rotation.executionStatus !== 'SOURCE_SEQUENCE_ONLY') fail(`${key} approved rotation must remain SOURCE_SEQUENCE_ONLY`);
  for (const forbidden of ['rotationSeconds', 'uptime', 'engineModelId']) {
    if (mode.rotation[forbidden] != null) fail(`${key} may not materialize ${forbidden}`);
  }
}

export function materializeApprovedProfileModes(sourceInput, semanticReview, catalogs) {
  if (semanticReview?.kind !== REVIEW_KIND) fail(`semantic review kind must be ${REVIEW_KIND}`);
  if (semanticReview?.automationMayApproveSemanticTruth !== false || semanticReview?.semanticReviewRequired !== true) {
    fail('semantic review must explicitly forbid automation from approving truth');
  }
  const approved = semanticReview.entries.filter((entry) => entry.decision === APPROVED);
  if (approved.length === 0) fail('semantic review contains no approved modes');
  if (approved.some((entry) => entry.sourceComplete !== true || typeof entry.isDefault !== 'boolean' || entry.blockers?.length > 0)) {
    fail('approved modes require sourceComplete=true, explicit isDefault, and zero blockers');
  }

  const characters = new Map(sourceInput.characters.map((character) => [character.characterId, character]));
  const characterCatalog = new Map(catalogs.characters.map((character) => [character.id, character]));
  const weaponsByName = uniqueByName(catalogs.weapons, 'Weapon catalog');
  const echoesByName = uniqueByName(catalogs.echoes, 'Echo catalog');
  const sonatasByName = uniqueByName(catalogs.sonatas, 'Sonata catalog');

  const defaultsByCharacter = new Map();
  for (const entry of approved) {
    if (entry.isDefault) defaultsByCharacter.set(entry.characterId, (defaultsByCharacter.get(entry.characterId) ?? 0) + 1);
  }
  for (const characterId of new Set(approved.map((entry) => entry.characterId))) {
    if (defaultsByCharacter.get(characterId) !== 1) fail(`${characterId} approved package set must contain exactly one semantic default`);
  }

  const output = {
    weaponRecommendations: [],
    echoLoadouts: [],
    statTargets: [],
    teams: [],
    rotations: [],
    presets: [],
  };
  const sequenceByCharacter = new Map();

  for (const entry of approved) {
    const character = characters.get(entry.characterId);
    if (!character) fail(`semantic review references unknown source character ${entry.characterId}`);
    const rawCharacter = characterCatalog.get(entry.characterId);
    if (!rawCharacter) fail(`semantic review references unknown canonical character ${entry.characterId}`);
    const mode = character.modes.find((candidate) => candidate.key === entry.modeKey);
    const key = `${entry.characterId}:${entry.modeKey}`;
    if (!mode) fail(`semantic review references unknown mode ${key}`);
    assertCompleteMode(mode, key);

    const weapon = weaponsByName.get(mode.weapon.name);
    const echo = echoesByName.get(mode.echo.mainEcho);
    const sonata = sonatasByName.get(mode.echo.sonataSet);
    if (!weapon) fail(`${key} cannot resolve Weapon ${mode.weapon.name}`);
    if (!echo) fail(`${key} cannot resolve main Echo ${mode.echo.mainEcho}`);
    if (!sonata) fail(`${key} cannot resolve Sonata ${mode.echo.sonataSet}`);

    const baseId = `${entry.characterId}-${slug(entry.modeKey)}`;
    const provenance = reviewedProvenance(character, mode, entry, semanticReview.checkedAt);
    const weaponProfileId = `${baseId}-weapons`;
    const echoProfileId = `${baseId}-echoes`;
    const statProfileId = `${baseId}-stats`;
    const teamProfileId = `${baseId}-team`;
    const rotationProfileId = `${baseId}-rotation`;
    const sequence = sequenceByCharacter.get(entry.characterId) ?? 0;
    sequenceByCharacter.set(entry.characterId, sequence + 1);
    const displayName = rawCharacter.name ?? entry.characterId;

    output.weaponRecommendations.push({
      kind: 'WEAPON_RECOMMENDATION',
      id: weaponProfileId,
      name: `${displayName} — ${entry.modeKey} Weapons`,
      characterId: entry.characterId,
      defaultWeaponId: weapon.id,
      options: [{weaponId: weapon.id, rank: 1, label: 'Current reviewed source recommendation'}],
      verificationStatus: 'VERIFIED',
      provenance,
    });

    output.echoLoadouts.push({
      kind: 'ECHO_LOADOUT',
      id: echoProfileId,
      name: `${displayName} — ${entry.modeKey} Echoes`,
      characterId: entry.characterId,
      slots: mode.echo.costLayout.map((cost, index) => ({
        cost,
        primaryMainStats: parseEchoMainStat(mode.echo.mainStats[index]),
      })),
      sonataSetIds: [sonata.id],
      mainEchoId: echo.id,
      verificationStatus: 'VERIFIED',
      provenance,
    });

    output.statTargets.push({
      kind: 'STAT_TARGET',
      id: statProfileId,
      name: `${displayName} — ${entry.modeKey} Stats`,
      characterId: entry.characterId,
      targetRules: targetRules(mode.stats),
      gates: statGates(mode.stats),
      verificationStatus: 'VERIFIED',
      provenance,
    });

    output.teams.push({
      kind: 'TEAM',
      id: teamProfileId,
      name: `${displayName} — ${entry.modeKey} Team`,
      members: teamMembers(mode, entry.characterId),
      verificationStatus: 'VERIFIED',
      provenance,
    });

    output.rotations.push({
      kind: 'ROTATION',
      id: rotationProfileId,
      name: `${displayName} — ${entry.modeKey} Source Rotation`,
      characterId: entry.characterId,
      teamProfileId,
      executionStatus: 'SOURCE_SEQUENCE_ONLY',
      sourceSequence: [...mode.rotation.sequence],
      variantKey: entry.modeKey,
      modeledMechanicFactIds: [],
      assumedMechanicFactIds: [],
      verificationStatus: 'VERIFIED',
      provenance,
    });

    output.presets.push({
      kind: 'CHARACTER_PRESET',
      id: baseId,
      name: `${displayName} — ${entry.modeKey}`,
      characterId: entry.characterId,
      modeKey: entry.modeKey,
      displayLabel: entry.modeKey,
      sequence,
      isDefault: entry.isDefault,
      uiSelectable: true,
      weaponRecommendationProfileId: weaponProfileId,
      echoLoadoutProfileId: echoProfileId,
      statTargetProfileId: statProfileId,
      teamProfileId,
      rotationProfileId,
      verificationStatus: 'VERIFIED',
      provenance,
    });
  }

  return {
    ...output,
    meta: {
      cohortId: semanticReview.cohortId,
      checkedAt: semanticReview.checkedAt,
      approvedModeCount: approved.length,
      approvedCharacterCount: new Set(approved.map((entry) => entry.characterId)).size,
      semanticReviewRequired: true,
      automationApprovedSemanticTruth: false,
      rotationsRemainSourceSequenceOnly: true,
    },
  };
}

export const PROFILE_COHORT_PROMOTION_DECISIONS = Object.freeze({APPROVED});
