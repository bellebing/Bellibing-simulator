import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCharacterMechanicsCandidateImport,
  normalizeCharacterName,
  parsePercentExpression,
  parseTenLevelCoefficientRow,
  parseTenLevelFlatPlusPercentRow,
} from '../scripts/lib/character-mechanics-import.mjs';

const CURVE = ['10%', '11%', '12%', '13%', '14%', '15%', '16%', '17%', '18%', '19%'];
const MIXED = [
  '10%*2+20%', '11%*2+21%', '12%*2+22%', '13%*2+23%', '14%*2+24%',
  '15%*2+25%', '16%*2+26%', '17%*2+27%', '18%*2+28%', '19%*2+29%',
];
const FLAT_PLUS_PERCENT = [
  '575+2.9%', '622+3.14%', '669+3.38%', '735+3.71%', '782+3.95%',
  '836+4.22%', '911+4.6%', '987+4.98%', '1062+5.36%', '1142+5.76%',
];

function sourceCharacter(name = 'Rover: Aero', id = 1406, includeMoves = true) {
  return {
    id,
    name: { en: name },
    moves: includeMoves ? [
      {
        id: 1,
        type: 1,
        sort: 1,
        name: { en: 'Basic Attack' },
        description: { en: 'Perform up to 4 consecutive attacks.' },
        maxLevel: 10,
        values: [
          { id: 101, name: { en: 'Stage 1 DMG' }, values: CURVE },
          { id: 102, name: { en: 'Mixed DMG' }, values: MIXED },
          { id: 103, name: { en: 'Concerto Regen' }, values: Array(10).fill('5') },
          { id: 104, name: { en: 'Healing' }, values: FLAT_PLUS_PERCENT },
        ],
      },
      {
        id: 12,
        type: 12,
        sort: 99,
        name: { en: 'Tune Break' },
        description: { en: 'Raw Tune Break source entry.' },
        maxLevel: 1,
        values: [],
      },
    ] : [],
    chains: Array.from({ length: 6 }, (_, index) => ({
      id: 200 + index,
      name: { en: `Sequence ${index + 1}` },
      description: { en: `Sequence ${index + 1} raw description.` },
      param: [],
    })),
    skillTrees: [],
  };
}

test('normalizes punctuation and source article variants for roster matching', () => {
  assert.equal(normalizeCharacterName('Rover (Aero)'), normalizeCharacterName('Rover: Aero'));
  assert.equal(normalizeCharacterName('The Shorekeeper'), normalizeCharacterName('Shorekeeper'));
  assert.equal(normalizeCharacterName('Luuk Herssen'), 'luukherssen');
});

test('parses one current-source percentage expression without pre-summing components', () => {
  assert.deepEqual(parsePercentExpression('16.59%*2 + 66.36%*3 + 287.56%'), {
    components: [
      { coefficient: 0.1659, hitCount: 2 },
      { coefficient: 0.6636, hitCount: 3 },
      { coefficient: 2.8756, hitCount: 1 },
    ],
    aggregate: 5.1982,
  });
  assert.equal(parsePercentExpression('120% + 5 Concerto Energy'), null);
});

test('parses exact ten-level single and mixed coefficient shapes', () => {
  assert.deepEqual(parseTenLevelCoefficientRow(CURVE), {
    representation: 'CURVE',
    curve: [.10, .11, .12, .13, .14, .15, .16, .17, .18, .19],
    hitCount: 1,
    aggregateCurve: [.10, .11, .12, .13, .14, .15, .16, .17, .18, .19],
  });

  const mixed = parseTenLevelCoefficientRow(MIXED);
  assert.equal(mixed?.representation, 'COMPONENTS');
  assert.deepEqual(mixed?.components[0], {
    hitCount: 2,
    curve: [.10, .11, .12, .13, .14, .15, .16, .17, .18, .19],
  });
  assert.deepEqual(mixed?.components[1], {
    hitCount: 1,
    curve: [.20, .21, .22, .23, .24, .25, .26, .27, .28, .29],
  });
});

test('structures exact ten-level flat-plus-percent rows without assigning semantics', () => {
  assert.deepEqual(parseTenLevelFlatPlusPercentRow(FLAT_PLUS_PERCENT), {
    representation: 'FLAT_PLUS_PERCENT',
    flatCurve: [575, 622, 669, 735, 782, 836, 911, 987, 1062, 1142],
    coefficientCurve: [.029, .0314, .0338, .0371, .0395, .0422, .046, .0498, .0536, .0576],
  });
  assert.equal(parseTenLevelFlatPlusPercentRow(Array(10).fill('not a formula')), null);
});

test('rejects changing hit-count shape instead of guessing', () => {
  const values = [...CURVE];
  values[9] = '19%*2';
  assert.equal(parseTenLevelCoefficientRow(values), null);
});

test('builds candidate-only roster import and never auto-verifies it', () => {
  const roster = [
    { id: 'rover-aero', name: 'Rover (Aero)', releaseStatus: 'RELEASED' },
    { id: 'future', name: 'Future Character', releaseStatus: 'UNRELEASED_WIP' },
  ];
  const result = buildCharacterMechanicsCandidateImport({
    sourcePayload: [sourceCharacter()],
    roster,
    sourceRepository: 'fixture/repo',
    sourceCommit: 'abc1234',
    checkedAt: '2026-08-27',
  });

  assert.equal(result.importStatus, 'CANDIDATE_ONLY');
  assert.equal(result.verificationStatus, 'NOT_VERIFIED');
  assert.equal(result.summary.requestedReleasedCharacters, 1);
  assert.equal(result.summary.matchedCharacters, 1);
  assert.equal(result.summary.parsedCoefficientRows, 2);
  assert.equal(result.summary.parsedFormulaRows, 1);
  assert.equal(result.characters[0].verificationStatus, 'NOT_VERIFIED');
  assert.equal(result.characters[0].counts.sequences, 6);
  assert.equal(result.characters[0].moves[0].values[2].reviewStatus, 'RAW_ONLY');
  assert.equal(result.characters[0].moves[0].values[3].reviewStatus, 'PARSED_CANDIDATE');
  assert.equal(result.characters[0].moves[1].sectionCandidate, 'TUNE_BREAK');
  assert.deepEqual(result.characters[0].moves[1].issues, []);
});

test('collapses duplicate Rover gender/source records deterministically and records provenance', () => {
  const result = buildCharacterMechanicsCandidateImport({
    sourcePayload: [
      sourceCharacter('Rover: Aero', 1408, false),
      sourceCharacter('Rover: Aero', 1406, true),
    ],
    roster: [{ id: 'rover-aero', name: 'Rover (Aero)', releaseStatus: 'RELEASED' }],
    sourceRepository: 'fixture/repo',
    sourceCommit: 'abc1234',
    checkedAt: '2026-08-27',
  });

  assert.equal(result.summary.matchedCharacters, 1);
  assert.equal(result.summary.ambiguousCharacters, 0);
  assert.equal(result.characters[0].sourceCharacterId, 1406);
  assert.equal(result.characters[0].sourceMatch.mode, 'ROVER_VARIANT_COLLAPSE');
  assert.deepEqual(result.characters[0].sourceMatch.candidateSourceIds, [1408, 1406]);
});

test('keeps unmatched released characters explicit for a fail-closed sync gate', () => {
  const result = buildCharacterMechanicsCandidateImport({
    sourcePayload: [sourceCharacter('Someone Else')],
    roster: [{ id: 'rover-aero', name: 'Rover (Aero)', releaseStatus: 'RELEASED' }],
    sourceRepository: 'fixture/repo',
    sourceCommit: 'abc1234',
    checkedAt: '2026-08-27',
  });
  assert.equal(result.summary.matchedCharacters, 0);
  assert.equal(result.summary.unmatchedCharacters, 1);
  assert.deepEqual(result.unmatched, [{ id: 'rover-aero', name: 'Rover (Aero)' }]);
});
