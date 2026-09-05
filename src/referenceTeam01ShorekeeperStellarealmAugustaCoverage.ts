import {
  resolveShorekeeperStellarealmContract,
  validateShorekeeperStellarealmContract,
} from './combat/shorekeeperStellarealmState.ts';
import { ROTATION_PROFILES } from './data/rotationProfiles.ts';
import { REFERENCE_TEAM_01_SHOREKEEPER_STELLAREALM_AUGUSTA_OVERLAP_REVIEW_20260905 } from './data/referenceTeam01ExecutionEvidence20260905.ts';
import { validateReferenceTeam01IunoAugustaWindowCoverage } from './referenceTeam01IunoAugustaWindowCoverage.ts';
import { validateReferenceTeam01ShorekeeperOutroAugustaCoverage } from './referenceTeam01ShorekeeperOutroAugustaCoverage.ts';

export interface ReferenceTeam01ShorekeeperStellarealmAugustaCoverage {
  readonly contractId: 'reference-team-01-shorekeeper-stellarealm-augusta-coverage-v1';
  readonly sourceReviewId: typeof REFERENCE_TEAM_01_SHOREKEEPER_STELLAREALM_AUGUSTA_OVERLAP_REVIEW_20260905.reviewId;
  readonly sourceFactId: 'the-shorekeeper-liberation-stellarealms';
  readonly sourceCharacterId: 'the-shorekeeper';
  readonly targetCharacterId: 'augusta';
  readonly coverageBasis: 'SOURCE_EXPLICIT_STELLAREALM_STAGE_AND_RECIPIENT';
  readonly firstPartyIntroCharacterId: 'iuno';
  readonly secondPartyIntroCharacterId: 'augusta';
  readonly iunoEntryStage: 'INNER';
  readonly augustaEntryStage: 'SUPERNAL';
  readonly sourceAuthorizesAugustaAsCritRecipient: true;
  readonly requiresQueryTimeEnergyRegenSample: true;
  readonly fallacyEnergyRegenCompositionResolved: false;
  readonly absoluteTeamTimelineResolved: false;
}

function rotationById(id: string) {
  return ROTATION_PROFILES.find((rotation) => rotation.id === id) ?? null;
}

export function validateReferenceTeam01ShorekeeperStellarealmAugustaCoverage(): readonly string[] {
  const issues: string[] = [];
  const review = REFERENCE_TEAM_01_SHOREKEEPER_STELLAREALM_AUGUSTA_OVERLAP_REVIEW_20260905;
  const shorekeeperRotation = rotationById(review.shorekeeperRotationId);
  const iunoRotation = rotationById(review.iunoRotationId);
  const augustaRotation = rotationById(review.augustaRotationId);

  if (review.disposition !== 'SOURCE_EXPLICIT_STELLAREALM_STAGE_AND_RECIPIENT_AUTHORIZED') {
    issues.push('Reference Team Shorekeeper Stellarealm -> Augusta review is not authorized');
  }
  if (review.teamProfileId !== 'augusta-iuno-shorekeeper') issues.push('Reference Team Stellarealm team id drift');
  if (review.sourceCharacterId !== 'the-shorekeeper') issues.push('Reference Team Stellarealm source character drift');
  if (review.targetCharacterId !== 'augusta') issues.push('Reference Team Stellarealm target character drift');
  if (review.sourceFactId !== 'the-shorekeeper-liberation-stellarealms') issues.push('Reference Team Stellarealm source fact drift');
  if (review.sourceUrls.length < 3 || review.sourceUrls.some((url) => !url.startsWith('https://'))) {
    issues.push('Reference Team Stellarealm review must retain three source URLs');
  }
  if (
    review.closesReferenceTeamDependencyIds.length !== 1
    || review.closesReferenceTeamDependencyIds[0] !== 'shorekeeper-stellarealm-party-crit-to-augusta'
  ) {
    issues.push('Reference Team Stellarealm review must close only party-crit-to-Augusta overlap');
  }

  if (!shorekeeperRotation) {
    issues.push(`missing Shorekeeper rotation ${review.shorekeeperRotationId}`);
  } else {
    if (shorekeeperRotation.characterId !== 'the-shorekeeper') issues.push('Shorekeeper Stellarealm rotation character drift');
    if (shorekeeperRotation.teamProfileId !== review.teamProfileId) issues.push('Shorekeeper Stellarealm rotation team drift');
    if (shorekeeperRotation.executionStatus !== 'SOURCE_SEQUENCE_ONLY') issues.push('Shorekeeper Stellarealm rotation execution-status drift');
    const tail = shorekeeperRotation.sourceSequence.slice(-2);
    if (tail[0] !== 'Liberation' || tail[1] !== 'Outro') {
      issues.push('Selected Shorekeeper rotation must retain Liberation -> Outro tail');
    }
  }

  if (!iunoRotation) {
    issues.push(`missing Iuno rotation ${review.iunoRotationId}`);
  } else {
    if (iunoRotation.characterId !== 'iuno') issues.push('Iuno Stellarealm rotation character drift');
    if (iunoRotation.teamProfileId !== review.teamProfileId) issues.push('Iuno Stellarealm rotation team drift');
    if (iunoRotation.executionStatus !== 'SOURCE_SEQUENCE_ONLY') issues.push('Iuno Stellarealm rotation execution-status drift');
    if (iunoRotation.sourceSequence[0] !== 'Intro') {
      issues.push('Selected Iuno rotation must begin with the first party Intro after Shorekeeper Outro');
    }
  }

  if (!augustaRotation) {
    issues.push(`missing Augusta rotation ${review.augustaRotationId}`);
  } else {
    if (augustaRotation.characterId !== 'augusta') issues.push('Augusta Stellarealm rotation character drift');
    if (augustaRotation.teamProfileId !== review.teamProfileId) issues.push('Augusta Stellarealm rotation team drift');
    if (augustaRotation.executionStatus !== 'ENGINE_MODELED') issues.push('Augusta Stellarealm rotation must remain ENGINE_MODELED');
    if (augustaRotation.engineModelId !== 'AUGUSTA_STD_V1') issues.push('Augusta Stellarealm engine-model drift');
  }

  const iunoAugustaIssues = validateReferenceTeam01IunoAugustaWindowCoverage();
  if (iunoAugustaIssues.length > 0) {
    issues.push(`Iuno -> Augusta handoff coverage drift: ${iunoAugustaIssues.join('; ')}`);
  }
  const shorekeeperOutroIssues = validateReferenceTeam01ShorekeeperOutroAugustaCoverage();
  if (shorekeeperOutroIssues.length > 0) {
    issues.push(`Shorekeeper -> Iuno -> Augusta selected-flow coverage drift: ${shorekeeperOutroIssues.join('; ')}`);
  }

  const stellarealmIssues = validateShorekeeperStellarealmContract();
  if (stellarealmIssues.length > 0) {
    issues.push(`Shorekeeper Stellarealm source contract drift: ${stellarealmIssues.join('; ')}`);
  } else {
    const contract = resolveShorekeeperStellarealmContract();
    if (contract.durationSeconds !== 30) issues.push('Shorekeeper Stellarealm duration drift');
    if (contract.selectedSequence !== 0) issues.push('Reference Team Shorekeeper sequence drift');
    if (!contract.requiresExplicitIntroInRangeProof) issues.push('Stellarealm must retain explicit Intro/in-range proof boundary');
    if (!contract.requiresExplicitEnergyRegenSample) issues.push('Stellarealm must retain explicit Energy Regen sample boundary');
  }

  return issues;
}

export function resolveReferenceTeam01ShorekeeperStellarealmAugustaCoverage(): ReferenceTeam01ShorekeeperStellarealmAugustaCoverage {
  const issues = validateReferenceTeam01ShorekeeperStellarealmAugustaCoverage();
  if (issues.length > 0) {
    throw new Error(`Invalid Reference Team 01 Shorekeeper Stellarealm -> Augusta coverage: ${issues.join('; ')}`);
  }

  return {
    contractId: 'reference-team-01-shorekeeper-stellarealm-augusta-coverage-v1',
    sourceReviewId: REFERENCE_TEAM_01_SHOREKEEPER_STELLAREALM_AUGUSTA_OVERLAP_REVIEW_20260905.reviewId,
    sourceFactId: 'the-shorekeeper-liberation-stellarealms',
    sourceCharacterId: 'the-shorekeeper',
    targetCharacterId: 'augusta',
    coverageBasis: 'SOURCE_EXPLICIT_STELLAREALM_STAGE_AND_RECIPIENT',
    firstPartyIntroCharacterId: 'iuno',
    secondPartyIntroCharacterId: 'augusta',
    iunoEntryStage: 'INNER',
    augustaEntryStage: 'SUPERNAL',
    sourceAuthorizesAugustaAsCritRecipient: true,
    requiresQueryTimeEnergyRegenSample: true,
    fallacyEnergyRegenCompositionResolved: false,
    absoluteTeamTimelineResolved: false,
  };
}

const REFERENCE_TEAM_01_SHOREKEEPER_STELLAREALM_AUGUSTA_COVERAGE_ISSUES =
  validateReferenceTeam01ShorekeeperStellarealmAugustaCoverage();
if (REFERENCE_TEAM_01_SHOREKEEPER_STELLAREALM_AUGUSTA_COVERAGE_ISSUES.length > 0) {
  throw new Error(
    `Invalid Reference Team 01 Shorekeeper Stellarealm -> Augusta coverage: ${REFERENCE_TEAM_01_SHOREKEEPER_STELLAREALM_AUGUSTA_COVERAGE_ISSUES.join('; ')}`,
  );
}
