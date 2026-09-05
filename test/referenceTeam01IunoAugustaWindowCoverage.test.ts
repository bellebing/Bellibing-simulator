import assert from 'node:assert/strict';
import test from 'node:test';

import { isIunoOutroTransferActive } from '../src/combat/iunoOutroTransferAdapter.ts';
import { isIncomingTransferWindowActive } from '../src/combat/incomingTransferState.ts';
import { AUGUSTA_STANDARD_ACTIONS, AUGUSTA_STD_V1 } from '../src/characters/augustaStandard.ts';
import { REFERENCE_TEAM_01_IUNO_AUGUSTA_HANDOFF_REVIEW_20260905 } from '../src/data/referenceTeam01ExecutionEvidence20260905.ts';
import {
  resolveReferenceTeam01IunoAugustaWindowCoverage,
  validateReferenceTeam01IunoAugustaWindowCoverage,
} from '../src/referenceTeam01IunoAugustaWindowCoverage.ts';

test('Reference Team 01 source review binds terminal Iuno Outro directly to Augusta Intro', () => {
  const review = REFERENCE_TEAM_01_IUNO_AUGUSTA_HANDOFF_REVIEW_20260905;
  assert.equal(review.disposition, 'RELATIVE_HANDOFF_AUTHORIZED');
  assert.equal(review.teamProfileId, 'augusta-iuno-shorekeeper');
  assert.equal(review.outgoingCharacterId, 'iuno');
  assert.equal(review.incomingCharacterId, 'augusta');
  assert.equal(review.outgoingRotationId, 'iuno-augusta-sub-dps-standard');
  assert.equal(review.incomingRotationId, 'augusta-standard-iuno-shorekeeper');
  assert.equal(review.incomingEntry, 'INTRO_SKILL');
  assert.deepEqual(review.closesReferenceTeamDependencyIds, [
    'iuno-outro-augusta-window-overlap',
    'iuno-moonlit-augusta-window-overlap',
  ]);
  assert.deepEqual(validateReferenceTeam01IunoAugustaWindowCoverage(), []);
});

test('relative Iuno Outro origin covers the complete fixed Augusta rotation for both Iuno and Moonlit windows', () => {
  const coverage = resolveReferenceTeam01IunoAugustaWindowCoverage();

  assert.equal(coverage.relativeOrigin, 'IUNO_OUTRO_TO_AUGUSTA_INTRO');
  assert.deepEqual(coverage.outgoingSwitchEvent, {
    kind: 'OUTRO_SWITCH',
    actorId: 'iuno',
    incomingResonatorId: 'augusta',
    incomingEntry: 'INTRO_SKILL',
    atSeconds: 0,
  });
  assert.equal(coverage.augustaRotationSeconds, 11.17);
  assert.equal(coverage.augustaRotationSeconds, AUGUSTA_STD_V1.rotationSeconds);

  assert.equal(coverage.iunoOutroWindow.startedAtSeconds, 0);
  assert.equal(coverage.iunoOutroWindow.expiresAtSeconds, 14);
  assert.equal(coverage.iunoOutroWindow.endsOnIncomingSwitchOut, true);
  assert.equal(coverage.moonlitWindow.startedAtSeconds, 0);
  assert.equal(coverage.moonlitWindow.expiresAtSeconds, 15);
  assert.equal(coverage.moonlitWindow.endsOnIncomingSwitchOut, false);

  assert.equal(isIunoOutroTransferActive(
    coverage.iunoOutroWindow,
    'augusta',
    coverage.augustaRotationSeconds,
    [],
  ), true);
  assert.equal(isIncomingTransferWindowActive(
    coverage.moonlitWindow,
    'augusta',
    coverage.augustaRotationSeconds,
    [],
  ), true);
  assert.equal(coverage.iunoOutroCoversEntireAugustaRotation, true);
  assert.equal(coverage.moonlitCoversEntireAugustaRotation, true);
});

test('Augusta fixed engine envelope has no intermediate switch-out boundary to terminate Iuno Outro early', () => {
  assert.equal(AUGUSTA_STANDARD_ACTIONS[0]?.actionClass, 'INTRO');
  assert.equal(AUGUSTA_STANDARD_ACTIONS.at(-1)?.actionClass, 'BOUNDARY');
  assert.equal(
    AUGUSTA_STANDARD_ACTIONS.slice(0, -1).some((action) => action.actionClass === 'BOUNDARY'),
    false,
  );
});

test('handoff review remains explicitly relative and does not claim a global team timeline', () => {
  const unresolved = REFERENCE_TEAM_01_IUNO_AUGUSTA_HANDOFF_REVIEW_20260905.unresolvedSemantics.join(' ');
  assert.match(unresolved, /No absolute team timestamp/i);
  assert.match(unresolved, /relative origin/i);
  assert.match(unresolved, /does not provide per-action Augusta timestamps/i);
});
