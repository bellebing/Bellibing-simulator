const MOVE_SECTION_BY_TYPE = new Map([
  [1, 'BASIC_ATTACK'],
  [2, 'RESONANCE_SKILL'],
  [3, 'RESONANCE_LIBERATION'],
  [4, 'INHERENT_PASSIVE'],
  [5, 'INTRO_SKILL'],
  [6, 'FORTE_CIRCUIT'],
  [11, 'OUTRO_SKILL'],
  [12, 'TUNE_BREAK'],
]);

function english(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object' && typeof value.en === 'string') return value.en.trim();
  return '';
}

export function normalizeCharacterName(value) {
  const normalizedWords = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/^the[\s:_-]+/, '');
  return normalizedWords.replace(/[^a-z0-9]+/g, '');
}

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function parsePercentTerm(rawTerm) {
  const term = rawTerm.trim();
  const match = term.match(/^(-?\d+(?:\.\d+)?)\s*%\s*(?:\*\s*(\d+))?$/);
  if (!match) return null;
  const percent = Number(match[1]);
  const hitCount = match[2] ? Number(match[2]) : 1;
  if (!finiteNumber(percent) || !Number.isInteger(hitCount) || hitCount <= 0) return null;
  return { coefficient: percent / 100, hitCount };
}

export function parsePercentExpression(rawValue) {
  if (typeof rawValue !== 'string') return null;
  const normalized = rawValue
    .replaceAll('×', '*')
    .replaceAll('％', '%')
    .replace(/[\u00a0\s]+/g, ' ')
    .trim();
  if (!normalized || !normalized.includes('%')) return null;

  const terms = normalized.split('+').map((term) => term.trim()).filter(Boolean);
  if (terms.length === 0) return null;
  const components = terms.map(parsePercentTerm);
  if (components.some((component) => component === null)) return null;

  return {
    components,
    aggregate: components.reduce(
      (total, component) => total + component.coefficient * component.hitCount,
      0,
    ),
  };
}

function sameHitShape(expressions) {
  const first = expressions[0]?.components ?? [];
  return expressions.every((expression) => {
    if (expression.components.length !== first.length) return false;
    return expression.components.every(
      (component, index) => component.hitCount === first[index].hitCount,
    );
  });
}

export function parseTenLevelCoefficientRow(rawValues) {
  if (!Array.isArray(rawValues) || rawValues.length !== 10) return null;
  const expressions = rawValues.map(parsePercentExpression);
  if (expressions.some((expression) => expression === null)) return null;
  if (!sameHitShape(expressions)) return null;

  const firstComponents = expressions[0].components;
  if (firstComponents.length === 1) {
    return {
      representation: 'CURVE',
      curve: expressions.map((expression) => expression.components[0].coefficient),
      hitCount: firstComponents[0].hitCount,
      aggregateCurve: expressions.map((expression) => expression.aggregate),
    };
  }

  return {
    representation: 'COMPONENTS',
    components: firstComponents.map((component, componentIndex) => ({
      hitCount: component.hitCount,
      curve: expressions.map(
        (expression) => expression.components[componentIndex].coefficient,
      ),
    })),
    aggregateCurve: expressions.map((expression) => expression.aggregate),
  };
}

function parseFlatPlusPercentExpression(rawValue) {
  if (typeof rawValue !== 'string') return null;
  const normalized = rawValue.replaceAll('％', '%').replace(/\s+/g, '').trim();
  let match = normalized.match(/^(-?\d+(?:\.\d+)?)\+(-?\d+(?:\.\d+)?)%$/);
  if (match) {
    return { flat: Number(match[1]), coefficient: Number(match[2]) / 100 };
  }
  match = normalized.match(/^(-?\d+(?:\.\d+)?)%\+(-?\d+(?:\.\d+)?)$/);
  if (match) {
    return { flat: Number(match[2]), coefficient: Number(match[1]) / 100 };
  }
  return null;
}

export function parseTenLevelFlatPlusPercentRow(rawValues) {
  if (!Array.isArray(rawValues) || rawValues.length !== 10) return null;
  const expressions = rawValues.map(parseFlatPlusPercentExpression);
  if (expressions.some((expression) => expression === null)) return null;
  return {
    representation: 'FLAT_PLUS_PERCENT',
    flatCurve: expressions.map((expression) => expression.flat),
    coefficientCurve: expressions.map((expression) => expression.coefficient),
  };
}

function normalizeRawValue(value) {
  if (typeof value === 'string') return value.trim();
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function transformValueRow(row) {
  const rawValues = Array.isArray(row?.values)
    ? row.values.map(normalizeRawValue)
    : [];
  const parsedCoefficient = parseTenLevelCoefficientRow(rawValues);
  const parsedFormula = parsedCoefficient ? null : parseTenLevelFlatPlusPercentRow(rawValues);
  return {
    sourceValueId: row?.id ?? null,
    name: english(row?.name),
    rawValues,
    parsedCoefficient,
    parsedFormula,
    reviewStatus: parsedCoefficient || parsedFormula ? 'PARSED_CANDIDATE' : 'RAW_ONLY',
  };
}

function transformMove(move) {
  const values = Array.isArray(move?.values) ? move.values.map(transformValueRow) : [];
  const percentLikeRawRows = values.filter(
    (row) => row.parsedCoefficient === null
      && row.parsedFormula === null
      && row.rawValues.some((value) => value.includes('%')),
  );
  const issues = [];
  if (!MOVE_SECTION_BY_TYPE.has(move?.type)) issues.push('UNKNOWN_MOVE_TYPE');
  if (!english(move?.name)) issues.push('MISSING_MOVE_NAME');
  if (percentLikeRawRows.length > 0) issues.push('PERCENT_LIKE_ROW_NEEDS_REVIEW');

  return {
    sourceMoveId: move?.id ?? null,
    sourceType: move?.type ?? null,
    sectionCandidate: MOVE_SECTION_BY_TYPE.get(move?.type) ?? 'UNKNOWN',
    sort: move?.sort ?? null,
    name: english(move?.name),
    description: english(move?.description),
    descriptionParams: Array.isArray(move?.descriptionParams)
      ? move.descriptionParams.map(normalizeRawValue)
      : [],
    maxLevel: move?.maxLevel ?? null,
    values,
    reviewStatus: issues.length === 0 ? 'PARSED_CANDIDATE' : 'NEEDS_REVIEW',
    issues,
  };
}

function transformChain(chain, index) {
  return {
    sequence: index + 1,
    sourceChainId: chain?.id ?? null,
    name: english(chain?.name),
    description: english(chain?.description),
    params: Array.isArray(chain?.param) ? chain.param.map(normalizeRawValue) : [],
    parsedUnconditionalBonus: chain?.bonus ?? null,
  };
}

function transformSkillTreeNode(node) {
  return {
    sourceNodeId: node?.id ?? null,
    name: english(node?.name),
    coordinate: node?.coordinate ?? null,
    parentNodes: Array.isArray(node?.parentNodes) ? node.parentNodes : [],
    value: node?.value ?? null,
    valueText: node?.valueText ?? null,
  };
}

function releasedRoster(roster) {
  return roster.filter((character) => character?.releaseStatus === 'RELEASED');
}

function sourceArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.characters)) return payload.characters;
  if (Array.isArray(payload?.Characters)) return payload.Characters;
  if (payload && typeof payload === 'object') {
    const values = Object.values(payload);
    if (values.length > 0 && values.every((value) => value && typeof value === 'object')) {
      return values;
    }
  }
  throw new TypeError('Character source payload must contain an array of character records.');
}

function buildSourceIndex(sourceCharacters) {
  const index = new Map();
  for (const sourceCharacter of sourceCharacters) {
    const sourceName = english(sourceCharacter?.name);
    const key = normalizeCharacterName(sourceName);
    if (!key) continue;
    const bucket = index.get(key) ?? [];
    bucket.push(sourceCharacter);
    index.set(key, bucket);
  }
  return index;
}

function sourceRichness(sourceCharacter) {
  return (Array.isArray(sourceCharacter?.moves) ? sourceCharacter.moves.length * 100 : 0)
    + (Array.isArray(sourceCharacter?.chains) ? sourceCharacter.chains.length * 10 : 0)
    + (Array.isArray(sourceCharacter?.skillTrees) ? sourceCharacter.skillTrees.length : 0);
}

function resolveSourceMatch(rosterCharacter, matches) {
  if (matches.length === 1) {
    return {
      sourceCharacter: matches[0],
      sourceMatch: { mode: 'NAME', candidateSourceIds: [matches[0]?.id ?? null] },
    };
  }

  if (matches.length > 1 && normalizeCharacterName(rosterCharacter.name).startsWith('rover')) {
    const ranked = [...matches].sort((left, right) => {
      const richnessDelta = sourceRichness(right) - sourceRichness(left);
      if (richnessDelta !== 0) return richnessDelta;
      return Number(left?.id ?? Number.MAX_SAFE_INTEGER) - Number(right?.id ?? Number.MAX_SAFE_INTEGER);
    });
    return {
      sourceCharacter: ranked[0],
      sourceMatch: {
        mode: 'ROVER_VARIANT_COLLAPSE',
        candidateSourceIds: matches.map((match) => match?.id ?? null),
        selectedSourceId: ranked[0]?.id ?? null,
        notes: [
          'Normalized upstream data exposes separate Rover gender/source records for the same element kit. Bellibing keeps one mechanics profile per element and selects the richest variant deterministically while retaining every candidate source id for audit.',
        ],
      },
    };
  }

  return null;
}

function transformCharacter(rosterCharacter, sourceCharacter, sourceMatch) {
  const moves = Array.isArray(sourceCharacter?.moves)
    ? sourceCharacter.moves.map(transformMove)
    : [];
  const chains = Array.isArray(sourceCharacter?.chains)
    ? sourceCharacter.chains.map(transformChain)
    : [];
  const skillTrees = Array.isArray(sourceCharacter?.skillTrees)
    ? sourceCharacter.skillTrees.map(transformSkillTreeNode)
    : [];
  const issues = [];
  if (moves.length === 0) issues.push('NO_MOVES');
  if (chains.length !== 6) issues.push('SEQUENCE_COUNT_NOT_SIX');
  if (moves.some((move) => move.reviewStatus === 'NEEDS_REVIEW')) issues.push('MOVE_ROWS_NEED_REVIEW');

  const parsedCoefficientRows = moves.reduce(
    (total, move) => total + move.values.filter((row) => row.parsedCoefficient !== null).length,
    0,
  );
  const parsedFormulaRows = moves.reduce(
    (total, move) => total + move.values.filter((row) => row.parsedFormula !== null).length,
    0,
  );
  const rawOnlyValueRows = moves.reduce(
    (total, move) => total + move.values.filter(
      (row) => row.parsedCoefficient === null && row.parsedFormula === null,
    ).length,
    0,
  );

  return {
    bellibingCharacterId: rosterCharacter.id,
    bellibingName: rosterCharacter.name,
    sourceCharacterId: sourceCharacter?.id ?? null,
    sourceName: english(sourceCharacter?.name),
    sourceMatch,
    importStatus: 'CANDIDATE_ONLY',
    verificationStatus: 'NOT_VERIFIED',
    moves,
    chains,
    skillTrees,
    inherentBonuses: Array.isArray(sourceCharacter?.inherentBonuses)
      ? sourceCharacter.inherentBonuses
      : [],
    counts: {
      moves: moves.length,
      sequences: chains.length,
      skillTreeNodes: skillTrees.length,
      parsedCoefficientRows,
      parsedFormulaRows,
      rawOnlyValueRows,
    },
    reviewStatus: issues.length === 0 ? 'READY_FOR_SOURCE_AUDIT' : 'NEEDS_REVIEW',
    issues,
  };
}

export function buildCharacterMechanicsCandidateImport({
  sourcePayload,
  roster,
  sourceRepository,
  sourceCommit,
  checkedAt,
  characterId = null,
}) {
  const sourceCharacters = sourceArray(sourcePayload);
  const sourceIndex = buildSourceIndex(sourceCharacters);
  let selectedRoster = releasedRoster(roster);
  if (characterId) {
    selectedRoster = selectedRoster.filter((character) => character.id === characterId);
    if (selectedRoster.length === 0) {
      throw new Error(`No RELEASED Bellibing character matches --character=${characterId}.`);
    }
  }

  const importedCharacters = [];
  const unmatched = [];
  const ambiguous = [];

  for (const rosterCharacter of selectedRoster) {
    const key = normalizeCharacterName(rosterCharacter.name);
    const matches = sourceIndex.get(key) ?? [];
    if (matches.length === 0) {
      unmatched.push({ id: rosterCharacter.id, name: rosterCharacter.name });
      continue;
    }
    const resolved = resolveSourceMatch(rosterCharacter, matches);
    if (!resolved) {
      ambiguous.push({
        id: rosterCharacter.id,
        name: rosterCharacter.name,
        sourceIds: matches.map((match) => match?.id ?? null),
      });
      continue;
    }
    importedCharacters.push(
      transformCharacter(rosterCharacter, resolved.sourceCharacter, resolved.sourceMatch),
    );
  }

  const reviewReady = importedCharacters.filter(
    (character) => character.reviewStatus === 'READY_FOR_SOURCE_AUDIT',
  ).length;
  const needsReview = importedCharacters.length - reviewReady;
  const parsedCoefficientRows = importedCharacters.reduce(
    (total, character) => total + character.counts.parsedCoefficientRows,
    0,
  );
  const parsedFormulaRows = importedCharacters.reduce(
    (total, character) => total + character.counts.parsedFormulaRows,
    0,
  );
  const rawOnlyValueRows = importedCharacters.reduce(
    (total, character) => total + character.counts.rawOnlyValueRows,
    0,
  );

  return {
    kind: 'CHARACTER_MECHANICS_SOURCE_IMPORT',
    importStatus: 'CANDIDATE_ONLY',
    verificationStatus: 'NOT_VERIFIED',
    source: {
      repository: sourceRepository,
      commit: sourceCommit,
      checkedAt,
      notes: [
        'This file is a machine-extracted review candidate, not canonical CharacterMechanicFact data.',
        'Bellibing never promotes imported rows to VERIFIED without the existing source/structural audit.',
        'Percent expressions are parsed only when all ten levels share one unambiguous component/hit-count shape; flat+percent rows are structured separately; everything else stays raw for review.',
      ],
    },
    summary: {
      requestedReleasedCharacters: selectedRoster.length,
      matchedCharacters: importedCharacters.length,
      unmatchedCharacters: unmatched.length,
      ambiguousCharacters: ambiguous.length,
      reviewReadyCharacters: reviewReady,
      charactersNeedingReview: needsReview,
      parsedCoefficientRows,
      parsedFormulaRows,
      rawOnlyValueRows,
    },
    unmatched,
    ambiguous,
    characters: importedCharacters,
  };
}
