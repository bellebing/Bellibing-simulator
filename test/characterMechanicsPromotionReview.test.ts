import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCharacterMechanicsPromotionReview } from '../scripts/lib/character-mechanics-promotion-review.mjs';

const CURVE = [.10, .11, .12, .13, .14, .15, .16, .17, .18, .19];
const AGGREGATE_MIXED = [.40, .43, .46, .49, .52, .55, .58, .61, .64, .67];

function candidateFixture() {
  return {
    kind: 'CHARACTER_MECHANICS_SOURCE_IMPORT',
    importStatus: 'CANDIDATE_ONLY',
    verificationStatus: 'NOT_VERIFIED',
    source: {
      repository: 'fixture/repo',
      commit: 'abc1234',
      checkedAt: '2026-08-27',
    },
    summary: {},
    characters: [
      {
        bellibingCharacterId: 'fixture-character',
        bellibingName: 'Fixture Character',
        sourceCharacterId: 9999,
        sourceName: 'Fixture Character',
        sourceMatch: { mode: 'NAME', candidateSourceIds: [9999] },
        reviewStatus: 'READY_FOR_SOURCE_AUDIT',
        issues: [],
        moves: [
          {
            sourceMoveId: 1,
            sectionCandidate: 'BASIC_ATTACK',
            name: 'Basic Attack',
            description: 'Perform a source-backed attack.',
            descriptionParams: [],
            issues: [],
            values: [
              {
                sourceValueId: 101,
                name: 'Stage 1 DMG',
                rawValues: CURVE.map((value) => `${value * 100}%`),
                parsedCoefficient: {
                  representation: 'CURVE',
                  curve: CURVE,
                  hitCount: 1,
                  aggregateCurve: CURVE,
                },
                parsedFormula: null,
                reviewStatus: 'PARSED_CANDIDATE',
              },
              {
                sourceValueId: 102,
                name: 'Mixed DMG',
                rawValues: Array.from({ length: 10 }, (_, index) => `${10 + index}%*2+${20 + index}%`),
                parsedCoefficient: {
                  representation: 'COMPONENTS',
                  components: [
                    { hitCount: 2, curve: CURVE },
                    { hitCount: 1, curve: [.20, .21, .22, .23, .24, .25, .26, .27, .28, .29] },
                  ],
                  aggregateCurve: AGGREGATE_MIXED,
                },
                parsedFormula: null,
                reviewStatus: 'PARSED_CANDIDATE',
              },
              {
                sourceValueId: 103,
                name: 'Healing',
                rawValues: Array(10).fill('575+2.9%'),
                parsedCoefficient: null,
                parsedFormula: {
                  representation: 'FLAT_PLUS_PERCENT',
                  flatCurve: [575, 622, 669, 735, 782, 836, 911, 987, 1062, 1142],
                  coefficientCurve: [.029, .0314, .0338, .0371, .0395, .0422, .046, .0498, .0536, .0576],
                },
                reviewStatus: 'PARSED_CANDIDATE',
              },
              {
                sourceValueId: 104,
                name: 'Ambiguous Percent Row',
                rawValues: Array(10).fill('120% + 5 Concerto Energy'),
                parsedCoefficient: null,
                parsedFormula: null,
                reviewStatus: 'RAW_ONLY',
              },
            ],
          },
          {
            sourceMoveId: 12,
            sectionCandidate: 'TUNE_BREAK',
            name: 'Tune Break',
            description: 'When Off-Tune Level is full, cast Tune Break.',
            descriptionParams: [],
            issues: [],
            values: [],
          },
        ],
        chains: Array.from({ length: 6 }, (_, index) => ({
          sequence: index + 1,
          sourceChainId: 200 + index,
          name: `Sequence ${index + 1}`,
          description: `Sequence ${index + 1} raw description.`,
          params: [`${index + 10}%`],
          parsedUnconditionalBonus: null,
        })),
        skillTrees: [{ sourceNodeId: 1, name: 'Node' }],
        inherentBonuses: [{ id: 1, value: '1.2%' }],
      },
    ],
  };
}

test('promotion review copies exact action curves and components instead of retyping or summing them', () => {
  const review = buildCharacterMechanicsPromotionReview(candidateFixture());
  const character = review.characters[0];
  assert.ok(character);

  assert.equal(review.kind, 'CHARACTER_MECHANICS_PROMOTION_REVIEW');
  assert.equal(review.promotionStatus, 'REVIEW_REQUIRED');
  assert.equal(review.verificationStatus, 'NOT_VERIFIED');
  assert.equal(character.verificationStatus, 'NOT_VERIFIED');
  assert.equal(character.actionCandidates.length, 2);

  const single = character.actionCandidates[0];
  assert.equal(single.exactRepresentation.representation, 'CURVE');
  assert.deepEqual(single.exactRepresentation.motionValueCurve, CURVE);
  assert.equal(single.exactRepresentation.hitCount, 1);
  assert.equal(single.semanticReview.damageClass, 'PENDING_REVIEW');
  assert.equal(single.semanticReview.scalingStat, 'PENDING_REVIEW');
  assert.equal(single.promotionStatus, 'SEMANTIC_REVIEW_REQUIRED');

  const mixed = character.actionCandidates[1];
  assert.equal(mixed.exactRepresentation.representation, 'COMPONENTS');
  assert.deepEqual(mixed.exactRepresentation.motionValueComponents, [
    { hitCount: 2, curve: CURVE },
    { hitCount: 1, curve: [.20, .21, .22, .23, .24, .25, .26, .27, .28, .29] },
  ]);
  assert.equal(mixed.exactRepresentation.hitCount, null);
  assert.deepEqual(mixed.exactRepresentation.aggregateCurve, AGGREGATE_MIXED);
});

test('promotion review separates structured utility formulas from action damage semantics', () => {
  const review = buildCharacterMechanicsPromotionReview(candidateFixture());
  const utility = review.characters[0]?.utilityFormulaCandidates[0];
  assert.ok(utility);
  assert.equal(utility.exactFormula.representation, 'FLAT_PLUS_PERCENT');
  assert.deepEqual(utility.exactFormula.flatCurve, [575, 622, 669, 735, 782, 836, 911, 987, 1062, 1142]);
  assert.deepEqual(utility.exactFormula.coefficientCurve, [.029, .0314, .0338, .0371, .0395, .0422, .046, .0498, .0536, .0576]);
  assert.equal(utility.semanticReview.mechanicKind, 'PENDING_REVIEW');
  assert.equal(utility.semanticReview.scalingStat, 'PENDING_REVIEW');
});

test('promotion review carries Tune Break to the safe shared-system boundary without fabricating motion values', () => {
  const review = buildCharacterMechanicsPromotionReview(candidateFixture());
  const tuneBreak = review.characters[0]?.tuneBreakCandidates[0];
  assert.ok(tuneBreak);
  assert.deepEqual(tuneBreak.safeSystemBoundaryCandidate, {
    section: 'TUNE_BREAK',
    actionKind: 'TUNE_BREAK',
    actionRole: 'SHARED_SYSTEM_DAMAGE',
    scalingStat: 'SHARED_SYSTEM',
    damageClass: 'OTHER',
    motionValue: null,
    motionValueCurve: null,
    motionValueComponents: null,
    hitCount: null,
  });
  assert.equal(tuneBreak.verificationStatus, 'NOT_VERIFIED');
  assert.equal(tuneBreak.promotionStatus, 'SOURCE_REVIEW_REQUIRED');
});

test('promotion review generates all six raw sequence candidates but leaves execution semantics pending', () => {
  const review = buildCharacterMechanicsPromotionReview(candidateFixture());
  const sequences = review.characters[0]?.sequenceCandidates ?? [];
  assert.deepEqual(sequences.map((entry) => entry.sequence), [1, 2, 3, 4, 5, 6]);
  assert.equal(sequences[0]?.rawDescription, 'Sequence 1 raw description.');
  assert.equal(sequences[0]?.semanticReview.effectSummary, 'PENDING_REVIEW');
  assert.equal(sequences[0]?.verificationStatus, 'NOT_VERIFIED');
});

test('promotion review keeps ambiguous raw rows explicit instead of guessing', () => {
  const review = buildCharacterMechanicsPromotionReview(candidateFixture());
  const rows = review.characters[0]?.rawReviewRows ?? [];
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.sourceValueName, 'Ambiguous Percent Row');
  assert.equal(rows[0]?.reason, 'PERCENT_LIKE_ROW_NOT_STRUCTURED');
  assert.deepEqual(rows[0]?.rawValues, Array(10).fill('120% + 5 Concerto Energy'));
});

test('promotion review summarizes machine work versus remaining review work', () => {
  const review = buildCharacterMechanicsPromotionReview(candidateFixture());
  assert.deepEqual(review.summary, {
    characters: 1,
    readyForSemanticReview: 1,
    sourceReviewRequired: 0,
    actionCandidates: 2,
    utilityFormulaCandidates: 1,
    tuneBreakCandidates: 1,
    sequenceCandidates: 6,
    rawReviewRows: 1,
  });
  assert.equal(review.characters[0]?.promotionStatus, 'READY_FOR_SEMANTIC_REVIEW');
});

test('promotion review refuses source imports that have already been promoted or verified', () => {
  const verified = candidateFixture();
  verified.verificationStatus = 'VERIFIED';
  assert.throws(
    () => buildCharacterMechanicsPromotionReview(verified),
    /candidate-only, NOT_VERIFIED/i,
  );
});

test('promotion review fails closed on duplicate source-row identities', () => {
  const duplicate = candidateFixture();
  const move = duplicate.characters[0].moves[0];
  move.values.push({ ...move.values[0] });
  assert.throws(
    () => buildCharacterMechanicsPromotionReview(duplicate),
    /Duplicate promotion source key/,
  );
});

test('promotion review can select one imported character without changing verification state', () => {
  const candidate = candidateFixture();
  candidate.characters.push({
    ...candidate.characters[0],
    bellibingCharacterId: 'second-character',
    bellibingName: 'Second Character',
    sourceCharacterId: 9998,
  });
  const review = buildCharacterMechanicsPromotionReview(candidate, { characterId: 'second-character' });
  assert.equal(review.characters.length, 1);
  assert.equal(review.characters[0]?.bellibingCharacterId, 'second-character');
  assert.equal(review.verificationStatus, 'NOT_VERIFIED');
});
