import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProfileCandidateReview } from '../scripts/lib/profile-candidate-review.mjs';

const source = [{
  label: 'Current reference guide',
  url: 'https://example.invalid/character',
  checkedAt: '2026-08-29',
  patch: '3.5',
}];

const completeMode = {
  key: 'standard',
  role: 'MAIN_DPS',
  weapon: { name: 'Example Weapon', rank: 'R1' },
  echo: {
    sonataSet: 'Example Sonata',
    mainEcho: 'Example Echo',
    costLayout: [4, 3, 3, 1, 1],
    mainStats: ['CRIT Rate / CRIT DMG', 'Element DMG', 'ATK% = Element DMG', 'ATK%', 'ATK%'],
  },
  stats: {
    priority: ['Energy Regen (until satisfied)', 'CRIT Rate = CRIT DMG', 'ATK%'],
    relations: ['CRIT Rate = CRIT DMG'],
    erBand: { minimum: 1.15, preferred: 1.25 },
  },
  team: { members: ['Example', 'Hybrid', 'Support'] },
  rotation: { sequence: ['Intro', 'Skill', 'Outro'] },
};

test('complete candidate stays NOT_VERIFIED and review-only', () => {
  const review = buildProfileCandidateReview({
    kind: 'PROFILE_SOURCE_RESEARCH_INPUT',
    importStatus: 'CANDIDATE_ONLY',
    verificationStatus: 'NOT_VERIFIED',
    generatedAt: '2026-08-29T00:00:00.000Z',
    characters: [{ characterId: 'example', sources: source, modes: [completeMode] }],
  });
  assert.equal(review.canonicalWriteAllowed, false);
  assert.equal(review.verificationStatus, 'NOT_VERIFIED');
  assert.equal(review.promotionStatus, 'REVIEW_REQUIRED');
  assert.equal(review.characters[0].sourceDisposition, 'READY_FOR_REVIEW');
  assert.equal(review.characters[0].verificationStatus, 'NOT_VERIFIED');
  assert.equal(review.characters[0].modes[0].rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
});

test('multi-mode, missing context, raw blockers and adapters are explicit', () => {
  const review = buildProfileCandidateReview({
    kind: 'PROFILE_SOURCE_RESEARCH_INPUT',
    importStatus: 'CANDIDATE_ONLY',
    verificationStatus: 'NOT_VERIFIED',
    characters: [
      { characterId: 'multi', sources: source, modes: [completeMode, { ...completeMode, key: 'alternate' }] },
      { characterId: 'missing', sources: source, modes: [{ ...completeMode, team: null }] },
      { characterId: 'blocked', sources: source, rawPreflightBlockers: ['raw maxEnergy missing'], modes: [] },
      {
        characterId: 'adapter', sources: source,
        modes: [{ ...completeMode, requiredSpecializedAdapters: ['TIMED_BUFF_WINDOW'] }],
      },
    ],
  });
  assert.equal(review.characters[0].sourceDisposition, 'MULTI_MODE');
  assert.equal(review.characters[1].sourceDisposition, 'MISSING_CONTEXT');
  assert.deepEqual(review.characters[1].missingByMode.standard, ['team']);
  assert.equal(review.characters[2].sourceDisposition, 'RAW_PREFLIGHT_BLOCKED');
  assert.equal(review.characters[3].sourceDisposition, 'READY_FOR_REVIEW');
  assert.equal(review.characters[3].executionDisposition, 'SPECIALIZED_ADAPTER_REQUIRED');
});

test('pipeline rejects any input presented as verified or importable canonical data', () => {
  for (const mutation of [
    { verificationStatus: 'VERIFIED' },
    { importStatus: 'CANONICAL' },
  ]) {
    assert.throws(() => buildProfileCandidateReview({
      kind: 'PROFILE_SOURCE_RESEARCH_INPUT',
      importStatus: 'CANDIDATE_ONLY',
      verificationStatus: 'NOT_VERIFIED',
      characters: [{ characterId: 'example', sources: source, modes: [completeMode] }],
      ...mutation,
    }), /rejected/);
  }
});

test('mechanical Echo layout validation fails closed', () => {
  assert.throws(() => buildProfileCandidateReview({
    kind: 'PROFILE_SOURCE_RESEARCH_INPUT',
    importStatus: 'CANDIDATE_ONLY',
    verificationStatus: 'NOT_VERIFIED',
    characters: [{
      characterId: 'bad-layout',
      sources: source,
      modes: [{ ...completeMode, echo: { ...completeMode.echo, costLayout: [4, 4, 1, 1, 1] } }],
    }],
  }), /COST 12/);
});
