import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LINGYANG_STANDARD_SOURCE_SEQUENCE,
} from '../src/combat/lingyangBurstComboActionMapping.ts';
import {
  getLingyangMoongazersSigilCastTriggerCheckpointForStep,
  LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_CHECKPOINTS,
  LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_REVIEW,
  validateLingyangMoongazersSigilCastTriggerCheckpoints,
} from '../src/combat/lingyangMoongazersSigilCastTriggerCheckpoints.ts';
import {
  WEAPON_CAST_WINDOW_CONTRACTS,
} from '../src/combat/weaponCastWindowAdapter.ts';

test('Lingyang MGS-LIB review locks exactly the canonical Intro and Liberation trigger identities', () => {
  assert.deepEqual(validateLingyangMoongazersSigilCastTriggerCheckpoints(), []);
  assert.deepEqual(LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_CHECKPOINTS, [
    {
      sourceStepIndex: 1,
      sourceStep: 'Intro',
      actionFactId: 'lingyang-intro-lion-awakens',
      eventKind: 'INTRO_SKILL_CAST',
    },
    {
      sourceStepIndex: 2,
      sourceStep: 'Ultimate',
      actionFactId: 'lingyang-liberation-strive-lions-vigor',
      eventKind: 'RESONANCE_LIBERATION_CAST',
    },
  ]);
  assert.equal(LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_REVIEW.status, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_REVIEW.primitiveId, 'weapon-cast-timed-self-window-v1');
  assert.equal(LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_REVIEW.requiresExactTimestamps, true);
  assert.equal(LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_REVIEW.requiresMultiTriggerLifecycle, true);
  assert.deepEqual(LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_REVIEW.closesPendingExecutionIds, []);
});

test('Lingyang MGS-LIB checkpoint lookup returns trigger identities only and never invents other source events', () => {
  assert.deepEqual(getLingyangMoongazersSigilCastTriggerCheckpointForStep(1), LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_CHECKPOINTS[0]);
  assert.deepEqual(getLingyangMoongazersSigilCastTriggerCheckpointForStep(2), LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_CHECKPOINTS[1]);

  for (let index = 0; index < LINGYANG_STANDARD_SOURCE_SEQUENCE.length; index += 1) {
    if (index === 1 || index === 2) continue;
    assert.equal(getLingyangMoongazersSigilCastTriggerCheckpointForStep(index), null);
  }
});

test('Lingyang MGS-LIB checkpoint review fails closed on canonical sequence or weapon-contract drift', () => {
  const driftedSequence = [...LINGYANG_STANDARD_SOURCE_SEQUENCE];
  driftedSequence[1] = 'Intro drift';
  assert.ok(
    validateLingyangMoongazersSigilCastTriggerCheckpoints({ sourceSequence: driftedSequence })
      .some((issue) => issue.includes('source step 1 drift')),
  );

  const driftedContracts = WEAPON_CAST_WINDOW_CONTRACTS.map((contract) => contract.effectId === 'MGS-LIB'
    ? { ...contract, triggerEvents: ['INTRO_SKILL_CAST'] as const }
    : contract);
  assert.ok(
    validateLingyangMoongazersSigilCastTriggerCheckpoints({ contracts: driftedContracts })
      .some((issue) => issue.includes('trigger event mapping drift')),
  );
});

test('Lingyang MGS-LIB checkpoint lookup rejects invalid canonical source indexes', () => {
  assert.throws(() => getLingyangMoongazersSigilCastTriggerCheckpointForStep(-1), /integer from 0 through 14/);
  assert.throws(() => getLingyangMoongazersSigilCastTriggerCheckpointForStep(15), /integer from 0 through 14/);
  assert.throws(() => getLingyangMoongazersSigilCastTriggerCheckpointForStep(1.5), /integer from 0 through 14/);
});
