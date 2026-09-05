import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveShorekeeperStellarealmContract } from '../src/combat/shorekeeperStellarealmState.ts';
import { REFERENCE_TEAM_01_SHOREKEEPER_STELLAREALM_AUGUSTA_OVERLAP_REVIEW_20260905 } from '../src/data/referenceTeam01ExecutionEvidence20260905.ts';
import {
  resolveReferenceTeam01ShorekeeperStellarealmAugustaCoverage,
  validateReferenceTeam01ShorekeeperStellarealmAugustaCoverage,
} from '../src/referenceTeam01ShorekeeperStellarealmAugustaCoverage.ts';

test('Reference Team 01 source review closes only Shorekeeper Stellarealm party-crit recipient overlap', () => {
  const review = REFERENCE_TEAM_01_SHOREKEEPER_STELLAREALM_AUGUSTA_OVERLAP_REVIEW_20260905;
  assert.equal(review.disposition, 'SOURCE_EXPLICIT_STELLAREALM_STAGE_AND_RECIPIENT_AUTHORIZED');
  assert.equal(review.teamProfileId, 'augusta-iuno-shorekeeper');
  assert.equal(review.sourceFactId, 'the-shorekeeper-liberation-stellarealms');
  assert.equal(review.sourceCharacterId, 'the-shorekeeper');
  assert.equal(review.targetCharacterId, 'augusta');
  assert.deepEqual(review.closesReferenceTeamDependencyIds, ['shorekeeper-stellarealm-party-crit-to-augusta']);
  assert.equal(review.sourceUrls.length, 3);
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('No Shorekeeper Energy Regen value')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('Fallacy')));
  assert.ok(review.unresolvedSemantics.some((note) => note.includes('No absolute')));
});

test('Reference Team 01 Stellarealm coverage source-locks Iuno first Intro and Augusta second Intro without a numeric crit value', () => {
  assert.deepEqual(validateReferenceTeam01ShorekeeperStellarealmAugustaCoverage(), []);

  const coverage = resolveReferenceTeam01ShorekeeperStellarealmAugustaCoverage();
  const sourceContract = resolveShorekeeperStellarealmContract();
  assert.equal(coverage.contractId, 'reference-team-01-shorekeeper-stellarealm-augusta-coverage-v1');
  assert.equal(coverage.coverageBasis, 'SOURCE_EXPLICIT_STELLAREALM_STAGE_AND_RECIPIENT');
  assert.equal(coverage.sourceFactId, sourceContract.sourceFactId);
  assert.equal(coverage.firstPartyIntroCharacterId, 'iuno');
  assert.equal(coverage.iunoEntryStage, 'INNER');
  assert.equal(coverage.secondPartyIntroCharacterId, 'augusta');
  assert.equal(coverage.augustaEntryStage, 'SUPERNAL');
  assert.equal(coverage.sourceAuthorizesAugustaAsCritRecipient, true);
  assert.equal(coverage.requiresQueryTimeEnergyRegenSample, true);
  assert.equal(sourceContract.requiresExplicitEnergyRegenSample, true);
  assert.equal(coverage.fallacyEnergyRegenCompositionResolved, false);
  assert.equal(coverage.absoluteTeamTimelineResolved, false);
  assert.equal('critRateBonus' in coverage, false);
  assert.equal('critDamageBonus' in coverage, false);
  assert.equal('startedAtSeconds' in coverage, false);
});
