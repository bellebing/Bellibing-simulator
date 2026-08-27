const SOURCE_KIND = 'CHARACTER_MECHANICS_SOURCE_IMPORT';
const REVIEW_KIND = 'CHARACTER_MECHANICS_DESCRIPTION_REVIEW';

function assertCandidateImport(candidate) {
  if (!candidate || candidate.kind !== SOURCE_KIND) {
    throw new TypeError(`Description review requires ${SOURCE_KIND} input.`);
  }
  if (candidate.importStatus !== 'CANDIDATE_ONLY' || candidate.verificationStatus !== 'NOT_VERIFIED') {
    throw new Error('Description review accepts candidate-only, NOT_VERIFIED source imports only.');
  }
  if (!Array.isArray(candidate.characters)) {
    throw new TypeError('Description review source import must contain characters[].');
  }
}

function finiteNumberString(value) {
  const text = String(value ?? '').trim();
  if (!/^-?\d+(?:\.\d+)?$/.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function parsePercentComponents(value) {
  const normalized = String(value ?? '').replace(/\s+/g, '');
  const terms = normalized.split('+');
  if (terms.length === 0) return null;

  const components = [];
  for (const term of terms) {
    const match = term.match(/^(-?\d+(?:\.\d+)?)%(?:\*(\d+))?$/);
    if (!match) return null;
    const coefficient = Number(match[1]) / 100;
    const hitCount = match[2] ? Number(match[2]) : 1;
    if (!Number.isFinite(coefficient) || !Number.isInteger(hitCount) || hitCount <= 0) return null;
    components.push({ coefficient, hitCount });
  }

  return {
    representation: 'PERCENT_COMPONENTS',
    components,
    aggregateCoefficient: components.reduce(
      (total, component) => total + component.coefficient * component.hitCount,
      0,
    ),
  };
}

function parseDescriptionParameter(rawValue) {
  const percent = parsePercentComponents(rawValue);
  if (percent) return percent;

  const number = finiteNumberString(rawValue);
  if (number !== null) {
    return {
      representation: 'NUMBER',
      value: number,
    };
  }

  return {
    representation: 'RAW',
    value: String(rawValue ?? ''),
  };
}

function moveCandidate(characterId, move) {
  const rawParams = [...(move.descriptionParams ?? [])];
  const parameters = rawParams.map((rawValue, index) => ({
    index,
    rawValue,
    exact: parseDescriptionParameter(rawValue),
  }));
  return {
    sourceKey: `${characterId}:${String(move.sourceMoveId)}:DESCRIPTION_PARAMS`,
    sourceMoveId: move.sourceMoveId,
    sourceSection: move.sectionCandidate,
    sourceMoveName: move.name,
    sourceDescription: move.description,
    rawParams,
    parameters,
    semanticReview: {
      parameterMeaning: 'PENDING_REVIEW',
      actionRelationship: 'PENDING_REVIEW',
      triggerAndScope: 'PENDING_REVIEW',
    },
    promotionStatus: parameters.some((parameter) => parameter.exact.representation === 'RAW')
      ? 'SOURCE_REVIEW_REQUIRED'
      : 'SEMANTIC_REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
  };
}

function transformCharacter(character) {
  const characterId = character.bellibingCharacterId;
  const moveParameterCandidates = (character.moves ?? [])
    .filter((move) => (move.descriptionParams ?? []).length > 0)
    .map((move) => moveCandidate(characterId, move));

  const rawParameters = moveParameterCandidates.reduce(
    (count, move) => count + move.parameters.filter((parameter) => parameter.exact.representation === 'RAW').length,
    0,
  );
  const parsedParameters = moveParameterCandidates.reduce(
    (count, move) => count + move.parameters.filter((parameter) => parameter.exact.representation !== 'RAW').length,
    0,
  );

  return {
    bellibingCharacterId: characterId,
    bellibingName: character.bellibingName,
    sourceCharacterId: character.sourceCharacterId,
    sourceName: character.sourceName,
    sourceMatch: character.sourceMatch,
    promotionStatus: rawParameters === 0 ? 'READY_FOR_SEMANTIC_REVIEW' : 'SOURCE_REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
    moveParameterCandidates,
    counts: {
      movesWithParameters: moveParameterCandidates.length,
      parsedParameters,
      rawParameters,
    },
  };
}

export function buildCharacterMechanicsDescriptionReview(candidate, { characterId = null } = {}) {
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
    movesWithParameters: counts.movesWithParameters + character.counts.movesWithParameters,
    parsedParameters: counts.parsedParameters + character.counts.parsedParameters,
    rawParameters: counts.rawParameters + character.counts.rawParameters,
  }), {
    characters: 0,
    readyForSemanticReview: 0,
    sourceReviewRequired: 0,
    movesWithParameters: 0,
    parsedParameters: 0,
    rawParameters: 0,
  });

  return {
    kind: REVIEW_KIND,
    promotionStatus: 'REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
    source: candidate.source,
    notes: [
      'Move description parameters are copied mechanically from the pinned candidate source instead of being retyped into Character files.',
      'Plain numbers and percent expressions are structured exactly; percent expressions preserve independent components and explicit hit multipliers rather than being silently flattened.',
      'The parser does not decide whether a parameter is damage, healing, duration, resource gain, a threshold, a stack count or another mechanic. Meaning, trigger, scope, damage class and scaling remain semantic/source review work.',
      'Source-fixed Character damage can only become canonical through the explicit source-fixed motion-value fields and the existing structural/source audit. This review artifact never auto-verifies facts.',
    ],
    summary,
    characters,
  };
}
