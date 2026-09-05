import {
  activateIunoOutroTransfer,
  resolveIunoOutroTransferContract,
} from './combat/iunoOutroTransferAdapter.ts';
import type { IncomingTransferWindow, OutgoingSwitchEvent } from './combat/incomingTransferState.ts';
import {
  activateSonataOutroTransfer,
  SONATA_OUTRO_TRANSFER_CONTRACTS,
} from './combat/sonataOutroTransferAdapter.ts';
import {
  AUGUSTA_STANDARD_ACTIONS,
  AUGUSTA_STD_V1,
} from './characters/augustaStandard.ts';
import { ROTATION_PROFILES } from './data/rotationProfiles.ts';
import { REFERENCE_TEAM_01_IUNO_AUGUSTA_HANDOFF_REVIEW_20260905 } from './data/referenceTeam01ExecutionEvidence20260905.ts';

const MOONLIT_EFFECT_ID = 'S08_5PC_INCOMING_ATK';
const RELATIVE_HANDOFF_SECONDS = 0;

export interface ReferenceTeam01IunoAugustaWindowCoverage {
  readonly contractId: 'reference-team-01-iuno-augusta-window-coverage-v1';
  readonly relativeOrigin: 'IUNO_OUTRO_TO_AUGUSTA_INTRO';
  readonly outgoingSwitchEvent: OutgoingSwitchEvent;
  readonly augustaRotationSeconds: number;
  readonly iunoOutroWindow: IncomingTransferWindow;
  readonly moonlitWindow: IncomingTransferWindow;
  readonly iunoOutroCoversEntireAugustaRotation: true;
  readonly moonlitCoversEntireAugustaRotation: true;
}

function rotationById(id: string) {
  return ROTATION_PROFILES.find((rotation) => rotation.id === id) ?? null;
}

export function validateReferenceTeam01IunoAugustaWindowCoverage(): readonly string[] {
  const issues: string[] = [];
  const review = REFERENCE_TEAM_01_IUNO_AUGUSTA_HANDOFF_REVIEW_20260905;
  const iunoRotation = rotationById(review.outgoingRotationId);
  const augustaRotation = rotationById(review.incomingRotationId);

  if (review.disposition !== 'RELATIVE_HANDOFF_AUTHORIZED') {
    issues.push('Reference Team Iuno -> Augusta handoff review is not authorized');
  }
  if (review.teamProfileId !== 'augusta-iuno-shorekeeper') issues.push('Reference Team handoff team id drift');
  if (review.outgoingCharacterId !== 'iuno') issues.push('Reference Team outgoing handoff character drift');
  if (review.incomingCharacterId !== 'augusta') issues.push('Reference Team incoming handoff character drift');
  if (review.incomingEntry !== 'INTRO_SKILL') issues.push('Reference Team incoming handoff entry drift');
  if (review.sourceUrls.length < 2 || review.sourceUrls.some((url) => !url.startsWith('https://'))) {
    issues.push('Reference Team handoff review must retain two source URLs');
  }
  if (!review.closesReferenceTeamDependencyIds.includes('iuno-outro-augusta-window-overlap')) {
    issues.push('Reference Team handoff review no longer closes Iuno Outro overlap');
  }
  if (!review.closesReferenceTeamDependencyIds.includes('iuno-moonlit-augusta-window-overlap')) {
    issues.push('Reference Team handoff review no longer closes Moonlit overlap');
  }

  if (!iunoRotation) {
    issues.push(`missing Iuno rotation ${review.outgoingRotationId}`);
  } else {
    if (iunoRotation.characterId !== review.outgoingCharacterId) issues.push('Iuno handoff rotation character drift');
    if (iunoRotation.teamProfileId !== review.teamProfileId) issues.push('Iuno handoff rotation team drift');
    if (iunoRotation.executionStatus !== 'SOURCE_SEQUENCE_ONLY') issues.push('Iuno handoff rotation execution-status drift');
    const tail = iunoRotation.sourceSequence.slice(-2);
    if (tail[0] !== 'Forte: Heavy Attack: Absolute Fullness (Swap)' || tail[1] !== 'Outro') {
      issues.push('Iuno Augusta-specific rotation must retain Absolute Fullness (Swap) -> Outro tail');
    }
  }

  if (!augustaRotation) {
    issues.push(`missing Augusta rotation ${review.incomingRotationId}`);
  } else {
    if (augustaRotation.characterId !== review.incomingCharacterId) issues.push('Augusta handoff rotation character drift');
    if (augustaRotation.teamProfileId !== review.teamProfileId) issues.push('Augusta handoff rotation team drift');
    if (augustaRotation.executionStatus !== 'ENGINE_MODELED') issues.push('Augusta handoff rotation must remain ENGINE_MODELED');
    if (augustaRotation.engineModelId !== 'AUGUSTA_STD_V1') issues.push('Augusta handoff engine-model drift');
    if (augustaRotation.rotationSeconds !== AUGUSTA_STD_V1.rotationSeconds) {
      issues.push('Augusta rotation/profile duration drift');
    }
  }

  if (AUGUSTA_STANDARD_ACTIONS[0]?.actionClass !== 'INTRO') {
    issues.push('Augusta fixed rotation must begin with Intro at the relative handoff origin');
  }
  const boundaryIndexes = AUGUSTA_STANDARD_ACTIONS
    .map((action, index) => action.actionClass === 'BOUNDARY' ? index : -1)
    .filter((index) => index >= 0);
  if (
    boundaryIndexes.length !== 1
    || boundaryIndexes[0] !== AUGUSTA_STANDARD_ACTIONS.length - 1
  ) {
    issues.push('Augusta fixed rotation must have no switch-out boundary before its terminal Outro');
  }

  const iunoOutroContract = resolveIunoOutroTransferContract();
  const moonlitContract = SONATA_OUTRO_TRANSFER_CONTRACTS.find((contract) => contract.effectId === MOONLIT_EFFECT_ID);
  if (!moonlitContract) {
    issues.push(`missing Moonlit transfer contract ${MOONLIT_EFFECT_ID}`);
  } else if (AUGUSTA_STD_V1.rotationSeconds >= moonlitContract.durationSeconds) {
    issues.push('Moonlit duration no longer covers the full Augusta fixed rotation envelope');
  }
  if (AUGUSTA_STD_V1.rotationSeconds >= iunoOutroContract.durationSeconds) {
    issues.push('Iuno Outro duration no longer covers the full Augusta fixed rotation envelope');
  }

  return issues;
}

export function resolveReferenceTeam01IunoAugustaWindowCoverage(): ReferenceTeam01IunoAugustaWindowCoverage {
  const issues = validateReferenceTeam01IunoAugustaWindowCoverage();
  if (issues.length > 0) {
    throw new Error(`Invalid Reference Team 01 Iuno -> Augusta coverage: ${issues.join('; ')}`);
  }

  const event: OutgoingSwitchEvent = {
    kind: 'OUTRO_SWITCH',
    actorId: 'iuno',
    incomingResonatorId: 'augusta',
    incomingEntry: 'INTRO_SKILL',
    atSeconds: RELATIVE_HANDOFF_SECONDS,
  };
  const iunoOutroWindow = activateIunoOutroTransfer({ event });
  const moonlitWindow = activateSonataOutroTransfer({
    effectId: MOONLIT_EFFECT_ID,
    wielderId: 'iuno',
    event,
  });
  if (!iunoOutroWindow || !moonlitWindow) {
    throw new Error('Reference Team 01 Iuno -> Augusta handoff failed to activate source-locked transfer windows');
  }

  if (iunoOutroWindow.expiresAtSeconds <= AUGUSTA_STD_V1.rotationSeconds) {
    throw new Error('Iuno Outro transfer does not cover the full Augusta fixed rotation envelope');
  }
  if (moonlitWindow.expiresAtSeconds <= AUGUSTA_STD_V1.rotationSeconds) {
    throw new Error('Moonlit transfer does not cover the full Augusta fixed rotation envelope');
  }

  return {
    contractId: 'reference-team-01-iuno-augusta-window-coverage-v1',
    relativeOrigin: 'IUNO_OUTRO_TO_AUGUSTA_INTRO',
    outgoingSwitchEvent: event,
    augustaRotationSeconds: AUGUSTA_STD_V1.rotationSeconds,
    iunoOutroWindow,
    moonlitWindow,
    iunoOutroCoversEntireAugustaRotation: true,
    moonlitCoversEntireAugustaRotation: true,
  };
}

const REFERENCE_TEAM_01_IUNO_AUGUSTA_COVERAGE_ISSUES = validateReferenceTeam01IunoAugustaWindowCoverage();
if (REFERENCE_TEAM_01_IUNO_AUGUSTA_COVERAGE_ISSUES.length > 0) {
  throw new Error(
    `Invalid Reference Team 01 Iuno -> Augusta coverage: ${REFERENCE_TEAM_01_IUNO_AUGUSTA_COVERAGE_ISSUES.join('; ')}`,
  );
}
