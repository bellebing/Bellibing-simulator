import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveShorekeeperOutroTeamWindowContract } from '../src/combat/shorekeeperOutroTeamWindowAdapter.ts';
import { REFERENCE_TEAM_01_SHOREKEEPER_OUTRO_AUGUSTA_OVERLAP_REVIEW_20260905 } from '../src/data/referenceTeam01ExecutionEvidence20260905.ts';
import {
  resolveReferenceTeam01ShorekeeperOutroAugustaCoverage,
  validateReferenceTeam01ShorekeeperOutroAugustaCoverage,
} from '../src/referenceTeam01ShorekeeperOutroAugustaCoverage.ts';

test('Reference Team 01 source review explicitly closes only Shorekeeper Outro -> Augusta overlap', () => {
  const review = REFERENCE_TEAM_01_SHOREKEEPER_OUTRO_AUGUSTA_OVERLAP_REVIEW_20260905;
  assert.equal(review.disposition, 'SOURCE_EXPLICIT_TEAM_OVERLAP_AUTHORIZED');
  assert.equal(review.teamProfileId, 'augusta-iuno-shorekeeper');
  assert.equal(review.sourceCharacterId, 'the-shorekeeper');
  assert.equal(review.targetCharacterId, 'augusta');
  assert.deepEqual(review.closesReferenceTeamDependencyIds, ['shorekeeper-outro-augusta-window-overlap']);
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('Stellar Symphony')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('No absolute Shorekeeper Outro timestamp')));
});

test('Reference Team 01 Shorekeeper Outro overlap validates selected source flow without fabricating a timestamp', () => {
  assert.deepEqual(validateReferenceTeam01ShorekeeperOutroAugustaCoverage(), []);

  const coverage = resolveReferenceTeam01ShorekeeperOutroAugustaCoverage();
  const sourceContract = resolveShorekeeperOutroTeamWindowContract();
  assert.equal(coverage.contractId, 'reference-team-01-shorekeeper-outro-augusta-coverage-v1');
  assert.equal(coverage.coverageBasis, 'SOURCE_EXPLICIT_TEAM_OVERLAP');
  assert.equal(coverage.sourceFactId, 'the-shorekeeper-outro-binary-butterfly');
  assert.equal(coverage.sourceCharacterId, 'the-shorekeeper');
  assert.equal(coverage.targetCharacterId, 'augusta');
  assert.equal(coverage.amplification, sourceContract.amplification);
  assert.equal(coverage.durationSeconds, sourceContract.durationSeconds);
  assert.equal(coverage.durationSeconds, 30);
  assert.equal(coverage.coversAugustaCoreDamagePhase, true);
  assert.equal('outgoingSwitchEvent' in coverage, false);
  assert.equal('startedAtSeconds' in coverage, false);
});
