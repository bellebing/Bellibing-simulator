import test from 'node:test';
import assert from 'node:assert/strict';

import { buildProfileSourceImportAccelerator } from '../scripts/lib/profile-source-import-accelerator.mjs';

function completeCandidate(characterId = 'test-character') {
  return {
    characterId,
    sourceDisposition: 'READY_FOR_REVIEW',
    promotionStatus: 'REVIEW_REQUIRED',
    verificationStatus: 'NOT_VERIFIED',
    sourceConflict: false,
    sources: [{ label: 'Source', url: `https://example.com/${characterId}`, checkedAt: '2026-08-30' }],
    missingByMode: { standard: [] },
    modes: [{
      key: 'standard',
      role: 'MAIN_DPS',
      weapon: { name: 'Source Weapon' },
      echo: { sonataSet: 'Source Sonata', mainEcho: 'Source Echo', mainStats: ['CRIT', 'DMG', 'DMG', 'ATK', 'ATK'] },
      stats: { priority: ['CRIT', 'ATK'], erBand: { minimum: 1.1, preferred: 1.2, maximum: 1.2, context: '110%-120% Energy Regen' }, notes: [] },
      team: { members: [characterId, 'ally-a', 'ally-b'] },
      rotation: { sequence: ['Intro', 'Skill', 'Outro'] },
    }],
  };
}

function readiness(characterId = 'test-character', overrides = {}) {
  return {
    profileSourcePendingIds: [characterId],
    profileSourcePendingCount: 1,
    characters: [{
      characterId,
      disposition: 'PROFILE_SOURCE_PENDING',
      rawDpsBlockers: [],
      intrinsicDpsBlocked: false,
      mechanicsSourceBlocked: false,
      ...overrides,
    }],
  };
}

function candidateReview(character) {
  return {
    verificationStatus: 'NOT_VERIFIED',
    canonicalWriteAllowed: false,
    characters: [character],
  };
}

test('complete source-clean candidate is review-ready without canonical promotion', () => {
  const review = buildProfileSourceImportAccelerator({
    readiness: readiness(),
    candidateReview: candidateReview(completeCandidate()),
  });
  const row = review.characters[0];
  assert.equal(row.primaryDisposition, 'AUTO_EXTRACTED_READY_FOR_REVIEW');
  assert.deepEqual(row.dispositions, ['AUTO_EXTRACTED_READY_FOR_REVIEW']);
  assert.equal(row.coveredSourceFieldCount, 7);
  assert.equal(row.canonicalWriteAllowed, false);
  assert.equal(row.verificationStatus, 'NOT_VERIFIED');
  assert.equal(review.canonicalWriteAllowed, false);
});

test('source snapshot can eliminate build transcription while team/mode and rotation remain explicit blockers', () => {
  const characterId = 'snapshot-character';
  const incomplete = {
    ...completeCandidate(characterId),
    sourceDisposition: 'MISSING_CONTEXT',
    missingByMode: { standard: ['team', 'rotation'] },
    modes: [{
      key: 'standard',
      role: 'MAIN_DPS',
      weapon: null,
      echo: null,
      stats: null,
      team: null,
      rotation: null,
    }],
  };
  const snapshot = {
    importStatus: 'CANDIDATE_ONLY',
    verificationStatus: 'NOT_VERIFIED',
    characters: [{
      characterId,
      sourceUrl: `https://example.com/${characterId}`,
      checkedAt: '2026-08-30',
      fetchStatus: 'FETCHED',
      roleLeads: ['Main DPS'],
      weapons: [{ name: 'Source Weapon' }],
      echoRecommendations: [{ name: 'Source Sonata' }],
      mainStats: [{ cost: '4 cost', stats: 'CRIT Rate / CRIT DMG' }],
      substatPriorityText: 'CRIT > ATK',
      endgameStatLines: ['Energy Regen: 120%'],
      warnings: [],
    }],
  };
  const review = buildProfileSourceImportAccelerator({
    readiness: readiness(characterId),
    candidateReview: candidateReview(incomplete),
    sourceSnapshot: snapshot,
  });
  const row = review.characters[0];
  assert.equal(row.coveredSourceFieldCount, 7);
  assert.equal(row.primaryDisposition, 'MISSING_TEAM_MODE');
  assert.ok(row.dispositions.includes('MISSING_ROTATION'));
  assert.ok(row.dispositions.includes('NEEDS_SEMANTIC_REVIEW'));
  assert.deepEqual(row.missingBuildFields, []);
});

test('raw/preflight blockers take primary priority without blocking classification', () => {
  const review = buildProfileSourceImportAccelerator({
    readiness: readiness('blocked-character', { rawDpsBlockers: ['level90.maxEnergy'] }),
    candidateReview: candidateReview(completeCandidate('blocked-character')),
  });
  assert.equal(review.characters[0].primaryDisposition, 'RAW_PREFLIGHT_BLOCKED');
  assert.equal(review.profileSourcePendingCount, 1);
});

test('verified or promotion-capable source snapshots are rejected', () => {
  assert.throws(() => buildProfileSourceImportAccelerator({
    readiness: readiness(),
    candidateReview: candidateReview(completeCandidate()),
    sourceSnapshot: { importStatus: 'CANDIDATE_ONLY', verificationStatus: 'VERIFIED', characters: [] },
  }), /CANDIDATE_ONLY \/ NOT_VERIFIED/);
});
