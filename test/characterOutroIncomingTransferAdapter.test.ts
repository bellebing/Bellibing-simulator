import test from 'node:test';
import assert from 'node:assert/strict';

import {
  activateCharacterOutroIncomingTransfer,
  CHARACTER_OUTRO_INCOMING_TRANSFER_CONTRACTS,
  isCharacterIncomingTransferActive,
  terminateCharacterIncomingTransferOnSwitchOut,
  validateCharacterOutroIncomingTransferContracts,
} from '../src/combat/characterOutroIncomingTransferAdapter.ts';

test('Qiuyuan Outro transfer contract stays locked to exact current raw semantics', () => {
  assert.deepEqual(validateCharacterOutroIncomingTransferContracts(), []);
  assert.deepEqual(CHARACTER_OUTRO_INCOMING_TRANSFER_CONTRACTS, [{
    factId: 'qiuyuan-outro-strike-before-ready-amplification',
    sourceActorId: 'qiuyuan',
    expectedScope: 'NEXT_CHARACTER',
    expectedDurationSeconds: 14,
    statOrEffect: 'Echo Skill DMG Amplification',
    value: 0.50,
    triggerSummaryContains: 'Casting Outro Skill',
    effectSummaryContains: [
      '50% Echo Skill DMG Amplification',
      '14s or until switched out',
    ],
  }]);
});

test('Qiuyuan Outro opens only on an explicit Qiuyuan -> incoming Resonator switch event', () => {
  const window = activateCharacterOutroIncomingTransfer({
    factId: 'qiuyuan-outro-strike-before-ready-amplification',
    event: {
      kind: 'OUTRO_SWITCH',
      actorId: 'qiuyuan',
      incomingResonatorId: 'sigrika',
      incomingEntry: 'INTRO_SKILL',
      atSeconds: 3,
    },
  });

  assert.deepEqual(window, {
    adapterId: 'character-outro-incoming-transfer-v1',
    factId: 'qiuyuan-outro-strike-before-ready-amplification',
    sourceActorId: 'qiuyuan',
    incomingResonatorId: 'sigrika',
    statOrEffect: 'Echo Skill DMG Amplification',
    value: 0.50,
    startedAtSeconds: 3,
    expiresAtSeconds: 17,
    terminatedAtSeconds: null,
  });
  assert.ok(window);
  assert.equal(isCharacterIncomingTransferActive(window, 'sigrika', 16.999), true);
  assert.equal(isCharacterIncomingTransferActive(window, 'sigrika', 17), false);
  assert.equal(isCharacterIncomingTransferActive(window, 'qiuyuan', 4), false);

  assert.equal(activateCharacterOutroIncomingTransfer({
    factId: 'qiuyuan-outro-strike-before-ready-amplification',
    event: {
      kind: 'OUTRO_SWITCH',
      actorId: 'ciaccona',
      incomingResonatorId: 'sigrika',
      incomingEntry: 'INTRO_SKILL',
      atSeconds: 3,
    },
  }), null);
});

test('Qiuyuan incoming transfer terminates when the actual incoming Resonator switches out', () => {
  const window = activateCharacterOutroIncomingTransfer({
    factId: 'qiuyuan-outro-strike-before-ready-amplification',
    event: {
      kind: 'OUTRO_SWITCH',
      actorId: 'qiuyuan',
      incomingResonatorId: 'sigrika',
      incomingEntry: 'DIRECT_SWITCH',
      atSeconds: 5,
    },
  });
  assert.ok(window);

  const unrelated = terminateCharacterIncomingTransferOnSwitchOut(window, {
    kind: 'RESONATOR_SWITCH_OUT',
    actorId: 'ciaccona',
    atSeconds: 8,
  });
  assert.equal(unrelated, window);

  const terminated = terminateCharacterIncomingTransferOnSwitchOut(window, {
    kind: 'RESONATOR_SWITCH_OUT',
    actorId: 'sigrika',
    atSeconds: 10,
  });
  assert.equal(terminated.terminatedAtSeconds, 10);
  assert.equal(isCharacterIncomingTransferActive(terminated, 'sigrika', 9.999), true);
  assert.equal(isCharacterIncomingTransferActive(terminated, 'sigrika', 10), false);

  const laterTermination = terminateCharacterIncomingTransferOnSwitchOut(terminated, {
    kind: 'RESONATOR_SWITCH_OUT',
    actorId: 'sigrika',
    atSeconds: 12,
  });
  assert.deepEqual(laterTermination, terminated);
});
