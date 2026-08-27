import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCharacterMechanicsDescriptionReview } from '../scripts/lib/character-mechanics-description-review.mjs';

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
    characters: [
      {
        bellibingCharacterId: 'fixture-character',
        bellibingName: 'Fixture Character',
        sourceCharacterId: 9999,
        sourceName: 'Fixture Character',
        sourceMatch: { mode: 'NAME', candidateSourceIds: [9999] },
        moves: [
          {
            sourceMoveId: 1,
            sectionCandidate: 'OUTRO_SKILL',
            name: 'Fixed Outro',
            description: "Deal Fusion DMG equal to {0} of the character's ATK.",
            descriptionParams: ['530.00%'],
          },
          {
            sourceMoveId: 2,
            sectionCandidate: 'OUTRO_SKILL',
            name: 'Mixed Fixed Outro',
            description: "Deal Electro DMG equal to {0} of the character's ATK.",
            descriptionParams: ['195.98%+391.96%'],
          },
          {
            sourceMoveId: 3,
            sectionCandidate: 'OUTRO_SKILL',
            name: 'Support Outro',
            description: 'Amplify damage for {0}s.',
            descriptionParams: ['14'],
          },
          {
            sourceMoveId: 4,
            sectionCandidate: 'BASIC_ATTACK',
            name: 'No Parameters',
            description: 'No source placeholders here.',
            descriptionParams: [],
          },
        ],
      },
    ],
  };
}

test('description review structures source-fixed percent parameters without deciding their mechanic meaning', () => {
  const review = buildCharacterMechanicsDescriptionReview(candidateFixture());
  const character = review.characters[0];
  assert.ok(character);
  assert.equal(review.kind, 'CHARACTER_MECHANICS_DESCRIPTION_REVIEW');
  assert.equal(review.promotionStatus, 'REVIEW_REQUIRED');
  assert.equal(review.verificationStatus, 'NOT_VERIFIED');
  assert.equal(character.moveParameterCandidates.length, 3);

  const fixed = character.moveParameterCandidates[0];
  assert.equal(fixed.sourceSection, 'OUTRO_SKILL');
  assert.deepEqual(fixed.parameters[0]?.exact, {
    representation: 'PERCENT_COMPONENTS',
    components: [{ coefficient: 5.3, hitCount: 1 }],
    aggregateCoefficient: 5.3,
  });
  assert.equal(fixed.semanticReview.parameterMeaning, 'PENDING_REVIEW');
  assert.equal(fixed.semanticReview.actionRelationship, 'PENDING_REVIEW');
  assert.equal(fixed.verificationStatus, 'NOT_VERIFIED');
});

test('description review preserves mixed fixed percent expressions as independent components', () => {
  const review = buildCharacterMechanicsDescriptionReview(candidateFixture());
  const mixed = review.characters[0]?.moveParameterCandidates[1];
  assert.ok(mixed);
  assert.deepEqual(mixed.parameters[0]?.exact, {
    representation: 'PERCENT_COMPONENTS',
    components: [
      { coefficient: 1.9598, hitCount: 1 },
      { coefficient: 3.9196, hitCount: 1 },
    ],
    aggregateCoefficient: 5.8794,
  });
});

test('description review structures plain numbers but does not infer duration, stacks or resource meaning', () => {
  const review = buildCharacterMechanicsDescriptionReview(candidateFixture());
  const support = review.characters[0]?.moveParameterCandidates[2];
  assert.ok(support);
  assert.deepEqual(support.parameters[0]?.exact, {
    representation: 'NUMBER',
    value: 14,
  });
  assert.equal(support.semanticReview.triggerAndScope, 'PENDING_REVIEW');
});

test('description review summarizes machine parsing separately from semantic review', () => {
  const review = buildCharacterMechanicsDescriptionReview(candidateFixture());
  assert.deepEqual(review.summary, {
    characters: 1,
    readyForSemanticReview: 1,
    sourceReviewRequired: 0,
    movesWithParameters: 3,
    parsedParameters: 3,
    rawParameters: 0,
  });
  assert.equal(review.characters[0]?.promotionStatus, 'READY_FOR_SEMANTIC_REVIEW');
});

test('description review fails closed on a future parameter shape it cannot structure', () => {
  const candidate = candidateFixture();
  candidate.characters[0].moves.push({
    sourceMoveId: 5,
    sectionCandidate: 'INHERENT_PASSIVE',
    name: 'Future Shape',
    description: 'Future source representation {0}.',
    descriptionParams: ['10% of 5'],
  });

  const review = buildCharacterMechanicsDescriptionReview(candidate);
  const character = review.characters[0];
  assert.equal(character?.promotionStatus, 'SOURCE_REVIEW_REQUIRED');
  assert.equal(character?.counts.rawParameters, 1);
  assert.deepEqual(character?.moveParameterCandidates.at(-1)?.parameters[0]?.exact, {
    representation: 'RAW',
    value: '10% of 5',
  });
});

test('description review refuses already-promoted/verified imports and supports one-character selection', () => {
  const verified = candidateFixture();
  verified.verificationStatus = 'VERIFIED';
  assert.throws(
    () => buildCharacterMechanicsDescriptionReview(verified),
    /candidate-only, NOT_VERIFIED/i,
  );

  const candidate = candidateFixture();
  candidate.characters.push({
    ...candidate.characters[0],
    bellibingCharacterId: 'second-character',
    bellibingName: 'Second Character',
    sourceCharacterId: 9998,
  });
  const review = buildCharacterMechanicsDescriptionReview(candidate, { characterId: 'second-character' });
  assert.equal(review.characters.length, 1);
  assert.equal(review.characters[0]?.bellibingCharacterId, 'second-character');
  assert.equal(review.verificationStatus, 'NOT_VERIFIED');
});
