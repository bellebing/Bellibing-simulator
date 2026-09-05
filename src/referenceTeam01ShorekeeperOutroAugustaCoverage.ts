import {
  resolveShorekeeperOutroTeamWindowContract,
  validateShorekeeperOutroTeamWindowContract,
} from './combat/shorekeeperOutroTeamWindowAdapter.ts';
import { ROTATION_PROFILES } from './data/rotationProfiles.ts';
import { REFERENCE_TEAM_01_SHOREKEEPER_OUTRO_AUGUSTA_OVERLAP_REVIEW_20260905 } from './data/referenceTeam01ExecutionEvidence20260905.ts';
import { validateReferenceTeam01IunoAugustaWindowCoverage } from './referenceTeam01IunoAugustaWindowCoverage.ts';

const DEPENDENCY_ID = 'shorekeeper-outro-augusta-window-overlap';

export interface ReferenceTeam01ShorekeeperOutroAugustaCoverage {
  readonly contractId: 'reference-team-01-shorekeeper-outro-augusta-coverage-v1';
  readonly sourceReviewId: typeof REFERENCE_TEAM_01_SHOREKEEPER_OUTRO_AUGUSTA_OVERLAP_REVIEW_20260905.reviewId;
  readonly sourceFactId: 'the-shorekeeper-outro-binary-butterfly';
  readonly sourceCharacterId: 'the-shorekeeper';
  readonly targetCharacterId: 'augusta';
  readonly coverageBasis: 'SOURCE_EXPLICIT_TEAM_OVERLAP';
  readonly amplification: number;
  readonly durationSeconds: number;
  readonly coversAugustaCoreDamagePhase: true;
}

function rotationById(id: string) {
  return ROTATION_PROFILES.find((rotation) => rotation.id === id) ?? null;
}

export function validateReferenceTeam01ShorekeeperOutroAugustaCoverage(): readonly string[] {
  const issues: string[] = [];
  const review = REFERENCE_TEAM_01_SHOREKEEPER_OUTRO_AUGUSTA_OVERLAP_REVIEW_20260905;

  if (review.disposition !== 'SOURCE_EXPLICIT_TEAM_OVERLAP_AUTHORIZED') {
    issues.push('Reference Team Shorekeeper Outro -> Augusta overlap review is not authorized');
  }
  if (review.teamProfileId !== 'augusta-iuno-shorekeeper') issues.push('Shorekeeper Outro overlap team id drift');
  if (review.sourceCharacterId !== 'the-shorekeeper') issues.push('Shorekeeper Outro overlap source character drift');
  if (review.targetCharacterId !== 'augusta') issues.push('Shorekeeper Outro overlap target character drift');
  if (review.sourceFactId !== 'the-shorekeeper-outro-binary-butterfly') issues.push('Shorekeeper Outro overlap source fact drift');
  if (!review.closesReferenceTeamDependencyIds.includes(DEPENDENCY_ID)) {
    issues.push(`Shorekeeper Outro overlap review no longer closes ${DEPENDENCY_ID}`);
  }
  if (review.sourceUrls.length < 2 || review.sourceUrls.some((url) => !url.startsWith('https://'))) {
    issues.push('Shorekeeper Outro overlap review must retain at least two source URLs');
  }

  const shorekeeperRotation = rotationById(review.shorekeeperRotationId);
  if (!shorekeeperRotation) {
    issues.push(`missing Shorekeeper rotation ${review.shorekeeperRotationId}`);
  } else {
    if (shorekeeperRotation.characterId !== review.sourceCharacterId) issues.push('Shorekeeper overlap rotation character drift');
    if (shorekeeperRotation.teamProfileId !== review.teamProfileId) issues.push('Shorekeeper overlap rotation team drift');
    if (shorekeeperRotation.executionStatus !== 'SOURCE_SEQUENCE_ONLY') issues.push('Shorekeeper overlap rotation execution-status drift');
    const tail = shorekeeperRotation.sourceSequence.slice(-2);
    if (tail[0] !== 'Liberation' || tail[1] !== 'Outro') {
      issues.push('Shorekeeper selected rotation must retain terminal Liberation -> Outro');
    }
  }

  const iunoRotation = rotationById(review.iunoRotationId);
  if (!iunoRotation) {
    issues.push(`missing Iuno rotation ${review.iunoRotationId}`);
  } else {
    if (iunoRotation.characterId !== 'iuno') issues.push('Shorekeeper overlap Iuno rotation character drift');
    if (iunoRotation.teamProfileId !== review.teamProfileId) issues.push('Shorekeeper overlap Iuno rotation team drift');
    if (iunoRotation.sourceSequence[0] !== 'Intro') issues.push('Selected Iuno rotation must begin with Intro after Shorekeeper Outro');
  }

  const augustaRotation = rotationById(review.augustaRotationId);
  if (!augustaRotation) {
    issues.push(`missing Augusta rotation ${review.augustaRotationId}`);
  } else {
    if (augustaRotation.characterId !== review.targetCharacterId) issues.push('Shorekeeper overlap Augusta rotation character drift');
    if (augustaRotation.teamProfileId !== review.teamProfileId) issues.push('Shorekeeper overlap Augusta rotation team drift');
    if (augustaRotation.executionStatus !== 'ENGINE_MODELED' || augustaRotation.engineModelId !== 'AUGUSTA_STD_V1') {
      issues.push('Shorekeeper overlap Augusta rotation must remain the fixed AUGUSTA_STD_V1 engine model');
    }
  }

  const iunoAugustaIssues = validateReferenceTeam01IunoAugustaWindowCoverage();
  if (iunoAugustaIssues.length > 0) {
    issues.push(`Iuno -> Augusta handoff coverage drift: ${iunoAugustaIssues.join('; ')}`);
  }

  const outroIssues = validateShorekeeperOutroTeamWindowContract();
  if (outroIssues.length > 0) {
    issues.push(`Shorekeeper Outro lifecycle drift: ${outroIssues.join('; ')}`);
  } else {
    const contract = resolveShorekeeperOutroTeamWindowContract();
    if (contract.scope !== 'TEAM') issues.push('Shorekeeper Outro overlap requires TEAM scope');
    if (contract.durationSeconds !== 30) issues.push('Shorekeeper Outro source duration drift');
    if (contract.amplification !== 0.15) issues.push('Shorekeeper Outro source amplification drift');
  }

  return issues;
}

export function resolveReferenceTeam01ShorekeeperOutroAugustaCoverage(): ReferenceTeam01ShorekeeperOutroAugustaCoverage {
  const issues = validateReferenceTeam01ShorekeeperOutroAugustaCoverage();
  if (issues.length > 0) {
    throw new Error(`Invalid Reference Team 01 Shorekeeper Outro -> Augusta coverage: ${issues.join('; ')}`);
  }

  const contract = resolveShorekeeperOutroTeamWindowContract();
  return {
    contractId: 'reference-team-01-shorekeeper-outro-augusta-coverage-v1',
    sourceReviewId: REFERENCE_TEAM_01_SHOREKEEPER_OUTRO_AUGUSTA_OVERLAP_REVIEW_20260905.reviewId,
    sourceFactId: contract.sourceFactId,
    sourceCharacterId: contract.sourceCharacterId,
    targetCharacterId: 'augusta',
    coverageBasis: 'SOURCE_EXPLICIT_TEAM_OVERLAP',
    amplification: contract.amplification,
    durationSeconds: contract.durationSeconds,
    coversAugustaCoreDamagePhase: true,
  };
}

const REFERENCE_TEAM_01_SHOREKEEPER_OUTRO_AUGUSTA_COVERAGE_ISSUES =
  validateReferenceTeam01ShorekeeperOutroAugustaCoverage();
if (REFERENCE_TEAM_01_SHOREKEEPER_OUTRO_AUGUSTA_COVERAGE_ISSUES.length > 0) {
  throw new Error(
    `Invalid Reference Team 01 Shorekeeper Outro -> Augusta coverage: ${REFERENCE_TEAM_01_SHOREKEEPER_OUTRO_AUGUSTA_COVERAGE_ISSUES.join('; ')}`,
  );
}
