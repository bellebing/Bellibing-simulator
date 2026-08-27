const SOURCE_KIND = 'CHARACTER_MECHANICS_SOURCE_IMPORT';
const REVIEW_KIND = 'CHARACTER_MECHANICS_PROMOTION_REVIEW';

function slug(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unnamed';
}

function pendingActionSemantics() {
  return {
    actionRole: 'PENDING_REVIEW',
    actionKind: 'PENDING_REVIEW',
    damageClass: 'PENDING_REVIEW',
    scalingStat: 'PENDING_REVIEW',
    conditional: 'PENDING_REVIEW',
  };
}

function pendingUtilitySemantics() {
  return {
    mechanicKind: 'PENDING_REVIEW',
    scalingStat: 'PENDING_REVIEW',
    scope: 'PENDING_REVIEW',
    trigger: 'PENDING_REVIEW',
  };
}

function assertCandidateImport(candidate) {
  if (!candidate || candidate.kind !== SOURCE_KIND) {
    throw new TypeError(`Promotion review requires ${SOURCE_KIND} input.`);
  }
  if (candidate.importStatus !== 'CANDIDATE_ONLY' || candidate.verificationStatus !== 'NOT_VERIFIED') {
    throw new Error('Promotion review accepts candidate-only, NOT_VERIFIED source imports only.');
  }
  if (!Array.isArray(candidate.characters)) {
    throw new TypeError('Promotion review source import must contain characters[].');
  }
}

function exactRepresentation(parsedCoefficient) {
  if (parsedCoefficient?.representation === 'CURVE') {
    return {
      representation: 'CURVE',
      motionValueCurve: [...parsedCoefficient.curve],
      hitCount: parsedCoefficient.hitCount,
      aggregateCurve: [...parsedCoefficient.aggregateCurve],
    };
  }
  if (parsedCoefficient?.representation === 'COMPONENTS') {
    return {
      representation: 'COMPONENTS',
      motionValueComponents: parsedCoefficient.components.map((component) => ({
        hitCount: component.hitCount,
        curve: [...component.curve],
      })),
      hitCount: null,
      aggregateCurve: [...parsedCoefficient.aggregateCurve],
    };
  }
  throw new TypeError('Action promotion candidate requires an exact parsed coefficient representation.');
}

function finiteNumberString(value) {
  const text = String(value ?? '').trim();
  if (!/^-?\d+(?:\.\d+)?$/.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function parsePlainNumericCurve(rawValues) {
  if (!Array.isArray(rawValues) || rawValues.length !== 10) return null;
  const values = rawValues.map(finiteNumberString);
  if (values.some((value) => value === null)) return null;
  return {
    representation: 'NUMERIC_CURVE',
    values,
    constantAcrossLevels: values.every((value) => value === values[0]),
  };
}

function parseTwoTermNumericCurve(rawValues) {
  if (!Array.isArray(rawValues) || rawValues.length !== 10) return null;
  const parsed = rawValues.map((rawValue) => {
    const normalized = String(rawValue ?? '').replace(/\s+/g, '');
    const match = normalized.match(/^(-?\d+(?:\.\d+)?)\+(-?\d+(?:\.\d+)?)$/);
    if (!match) return null;
    const left = Number(match[1]);
    const right = Number(match[2]);
    return Number.isFinite(left) && Number.isFinite(right) ? { left, right } : null;
  });
  if (parsed.some((value) => value === null)) return null;
  return {
    representation: 'TWO_TERM_NUMERIC_CURVE',
    leftCurve: parsed.map((value) => value.left),
    rightCurve: parsed.map((value) => value.right),
  };
}

function baseRowCandidate(characterId, move, row) {
  return {
    sourceKey: `${characterId}:${String(move.sourceMoveId)}:${String(row.sourceValueId)}`,
    sourceMoveId: move.sourceMoveId,
    sourceValueId: row.sourceValueId,
    sourceSection: move.sectionCandidate,
    sourceMoveName: move.name,
    sourceValueName: row.name,
    sourceDescription: move.description,
    sourceDescriptionParams: [...(move.descriptionParams ?? [])],
    rawValues: [...row.rawValues],
  };
}

function actionCandidate(characterId, move, row) {
  return {
    ...baseRowCandidate(characterId, move, row),
    suggestedFactId: [
      characterId,
      slug(move.sectionCandidate),
      slug(move.name),
      slug(row.name),
    ].join('-'),
    exactRepresentation: exactRepresentation(row.parsedCoefficient),
    semanticReview: pendingActionSemantics(),
    promotionStatus: 'SEMANTIC_REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
  };
}

function utilityFormulaCandidate(characterId, move, row) {
  return {
    ...baseRowCandidate(characterId, move, row),
    exactFormula: {
      representation: 'FLAT_PLUS_PERCENT',
      flatCurve: [...row.parsedFormula.flatCurve],
      coefficientCurve: [...row.parsedFormula.coefficientCurve],
    },
    semanticReview: pendingUtilitySemantics(),
    promotionStatus: 'SEMANTIC_REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
  };
}

function numericCurveCandidate(characterId, move, row, exactNumeric) {
  return {
    ...baseRowCandidate(characterId, move, row),
    exactNumeric,
    semanticReview: pendingUtilitySemantics(),
    promotionStatus: 'SEMANTIC_REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
  };
}

function twoTermNumericCandidate(characterId, move, row, exactNumeric) {
  return {
    ...baseRowCandidate(characterId, move, row),
    exactNumeric,
    semanticReview: pendingUtilitySemantics(),
    promotionStatus: 'SEMANTIC_REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
  };
}

function rawReviewRow(characterId, move, row) {
  return {
    ...baseRowCandidate(characterId, move, row),
    reason: row.rawValues.some((value) => String(value).includes('%'))
      ? 'PERCENT_LIKE_ROW_NOT_STRUCTURED'
      : 'RAW_SOURCE_ROW',
  };
}

function tuneBreakCandidate(characterId, move) {
  return {
    sourceKey: `${characterId}:${String(move.sourceMoveId)}:TUNE_BREAK`,
    suggestedFactId: `${characterId}-tune-break`,
    sourceMoveId: move.sourceMoveId,
    sourceSection: move.sectionCandidate,
    sourceMoveName: move.name,
    sourceDescription: move.description,
    safeSystemBoundaryCandidate: {
      section: 'TUNE_BREAK',
      actionKind: 'TUNE_BREAK',
      actionRole: 'SHARED_SYSTEM_DAMAGE',
      scalingStat: 'SHARED_SYSTEM',
      damageClass: 'OTHER',
      motionValue: null,
      motionValueCurve: null,
      motionValueComponents: null,
      hitCount: null,
    },
    promotionStatus: 'SOURCE_REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
  };
}

function sequenceCandidate(characterId, chain) {
  return {
    sourceKey: `${characterId}:S${String(chain.sequence)}:${String(chain.sourceChainId)}`,
    suggestedFactId: `${characterId}-s${String(chain.sequence)}-${slug(chain.name)}`,
    sequence: chain.sequence,
    sourceChainId: chain.sourceChainId,
    name: chain.name,
    rawDescription: chain.description,
    rawParams: [...(chain.params ?? [])],
    parsedUnconditionalBonus: chain.parsedUnconditionalBonus ?? null,
    semanticReview: {
      effectSummary: 'PENDING_REVIEW',
      conditions: 'PENDING_REVIEW',
      timing: 'PENDING_REVIEW',
      scope: 'PENDING_REVIEW',
    },
    promotionStatus: 'SEMANTIC_REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
  };
}

function ensureUniqueSourceKeys(entries, characterId) {
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.sourceKey)) {
      throw new Error(`Duplicate promotion source key for ${characterId}: ${entry.sourceKey}`);
    }
    seen.add(entry.sourceKey);
  }
}

function transformCharacter(character) {
  const characterId = character.bellibingCharacterId;
  const actionCandidates = [];
  const utilityFormulaCandidates = [];
  const numericCurveCandidates = [];
  const twoTermNumericCandidates = [];
  const rawReviewRows = [];
  const tuneBreakCandidates = [];

  for (const move of character.moves ?? []) {
    if (move.sectionCandidate === 'TUNE_BREAK') {
      tuneBreakCandidates.push(tuneBreakCandidate(characterId, move));
    }
    for (const row of move.values ?? []) {
      if (row.parsedCoefficient) {
        actionCandidates.push(actionCandidate(characterId, move, row));
        continue;
      }
      if (row.parsedFormula) {
        utilityFormulaCandidates.push(utilityFormulaCandidate(characterId, move, row));
        continue;
      }
      const plainNumeric = parsePlainNumericCurve(row.rawValues);
      if (plainNumeric) {
        numericCurveCandidates.push(numericCurveCandidate(characterId, move, row, plainNumeric));
        continue;
      }
      const twoTermNumeric = parseTwoTermNumericCurve(row.rawValues);
      if (twoTermNumeric) {
        twoTermNumericCandidates.push(twoTermNumericCandidate(characterId, move, row, twoTermNumeric));
        continue;
      }
      rawReviewRows.push(rawReviewRow(characterId, move, row));
    }
  }

  const sequenceCandidates = (character.chains ?? []).map((chain) => sequenceCandidate(characterId, chain));
  ensureUniqueSourceKeys(
    [
      ...actionCandidates,
      ...utilityFormulaCandidates,
      ...numericCurveCandidates,
      ...twoTermNumericCandidates,
      ...rawReviewRows,
      ...tuneBreakCandidates,
      ...sequenceCandidates,
    ],
    characterId,
  );

  const issues = [...(character.issues ?? [])];
  if (tuneBreakCandidates.length !== 1) {
    issues.push(`TUNE_BREAK_SOURCE_COUNT_${tuneBreakCandidates.length}`);
  }
  if (sequenceCandidates.length !== 6) {
    issues.push(`SEQUENCE_SOURCE_COUNT_${sequenceCandidates.length}`);
  }

  return {
    bellibingCharacterId: characterId,
    bellibingName: character.bellibingName,
    sourceCharacterId: character.sourceCharacterId,
    sourceName: character.sourceName,
    sourceMatch: character.sourceMatch,
    sourceReviewStatus: character.reviewStatus,
    promotionStatus: issues.length === 0 ? 'READY_FOR_SEMANTIC_REVIEW' : 'SOURCE_REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
    issues,
    actionCandidates,
    utilityFormulaCandidates,
    numericCurveCandidates,
    twoTermNumericCandidates,
    tuneBreakCandidates,
    sequenceCandidates,
    skillTrees: character.skillTrees ?? [],
    inherentBonuses: character.inherentBonuses ?? [],
    rawReviewRows,
    counts: {
      actionCandidates: actionCandidates.length,
      utilityFormulaCandidates: utilityFormulaCandidates.length,
      numericCurveCandidates: numericCurveCandidates.length,
      twoTermNumericCandidates: twoTermNumericCandidates.length,
      tuneBreakCandidates: tuneBreakCandidates.length,
      sequenceCandidates: sequenceCandidates.length,
      rawReviewRows: rawReviewRows.length,
    },
  };
}

export function buildCharacterMechanicsPromotionReview(candidate, { characterId = null } = {}) {
  assertCandidateImport(candidate);
  let sourceCharacters = candidate.characters;
  if (characterId) {
    sourceCharacters = sourceCharacters.filter((character) => character.bellibingCharacterId === characterId);
    if (sourceCharacters.length === 0) {
      throw new Error(`No imported Character Mechanics candidate matches characterId=${characterId}.`);
    }
  }

  const characters = sourceCharacters.map(transformCharacter);
  const summary = characters.reduce((counts, character) => ({
    characters: counts.characters + 1,
    readyForSemanticReview: counts.readyForSemanticReview + (character.promotionStatus === 'READY_FOR_SEMANTIC_REVIEW' ? 1 : 0),
    sourceReviewRequired: counts.sourceReviewRequired + (character.promotionStatus === 'SOURCE_REVIEW_REQUIRED' ? 1 : 0),
    actionCandidates: counts.actionCandidates + character.counts.actionCandidates,
    utilityFormulaCandidates: counts.utilityFormulaCandidates + character.counts.utilityFormulaCandidates,
    numericCurveCandidates: counts.numericCurveCandidates + character.counts.numericCurveCandidates,
    twoTermNumericCandidates: counts.twoTermNumericCandidates + character.counts.twoTermNumericCandidates,
    tuneBreakCandidates: counts.tuneBreakCandidates + character.counts.tuneBreakCandidates,
    sequenceCandidates: counts.sequenceCandidates + character.counts.sequenceCandidates,
    rawReviewRows: counts.rawReviewRows + character.counts.rawReviewRows,
  }), {
    characters: 0,
    readyForSemanticReview: 0,
    sourceReviewRequired: 0,
    actionCandidates: 0,
    utilityFormulaCandidates: 0,
    numericCurveCandidates: 0,
    twoTermNumericCandidates: 0,
    tuneBreakCandidates: 0,
    sequenceCandidates: 0,
    rawReviewRows: 0,
  });

  return {
    kind: REVIEW_KIND,
    promotionStatus: 'REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
    source: candidate.source,
    notes: [
      'Exact numeric source representations are copied mechanically from the candidate importer; they are not retyped by hand.',
      'Plain numeric and two-term numeric source tables are structured without assigning mechanic meaning, so costs, cooldowns, regen, durations and unusual formulas stay exact while semantics remain reviewable.',
      'Action damage class, scaling, conditions, resource/state semantics, utility meaning and sequence execution semantics remain explicit review work.',
      'This artifact cannot promote canonical Character Mechanics data to VERIFIED. The existing canonical structural/source audit remains authoritative.',
    ],
    summary,
    characters,
  };
}
