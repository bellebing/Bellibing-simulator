import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateIunoOutroTransfer,
  isIunoOutroTransferActive,
  validateIunoOutroTransferContract,
} from '../src/combat/iunoOutroTransferAdapter.ts';
import {
  isIncomingTransferWindowActive,
  type OutgoingSwitchEvent,
  type ResonatorSwitchOutEvent,
} from '../src/combat/incomingTransferState.ts';
import {
  activateSonataOutroTransfer,
  SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT,
  validateSonataOutroTransferContracts,
} from '../src/combat/sonataOutroTransferAdapter.ts';
import { REFERENCE_TEAM_01_EXECUTION_CONTEXT } from '../src/data/referenceTeam01ExecutionContext.ts';

const IUNO_TO_AUGUSTA_OUTRO: OutgoingSwitchEvent = {
  kind: 'OUTRO_SWITCH',
  actorId: 'iuno',
  incomingResonatorId: 'augusta',
  incomingEntry: 'INTRO_SKILL',
  atSeconds: 6,
};

test('Reference Team 01 selected Iuno loadout binds source-clean Moonlit Clouds 5-piece', () => {
  const iuno = REFERENCE_TEAM_01_EXECUTION_CONTEXT.members.find((member) => member.characterId === 'iuno');
  assert.ok(iuno);
  assert.equal(iuno.presetId, 'iuno-augusta-hybrid');
  assert.equal(iuno.echoLoadoutProfileId, 'iuno-augusta-moonlit-heron');
  assert.deepEqual(iuno.sonataSetIds, ['sonata-8']);

  assert.deepEqual(validateIunoOutroTransferContract(), []);
  assert.deepEqual(validateSonataOutroTransferContracts(), []);
  assert.equal(SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT.requiresProfileEventTimeline, true);
  assert.deepEqual(SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT.closesPendingExecutionIds, []);
});

test('one explicit Iuno OUTRO_SWITCH can activate Character Outro and selected Moonlit transfer to actual Augusta recipient', () => {
  const characterWindow = activateIunoOutroTransfer({ event: IUNO_TO_AUGUSTA_OUTRO });
  const moonlitWindow = activateSonataOutroTransfer({
    effectId: 'S08_5PC_INCOMING_ATK',
    wielderId: 'iuno',
    event: IUNO_TO_AUGUSTA_OUTRO,
  });

  assert.ok(characterWindow);
  assert.ok(moonlitWindow);

  assert.equal(characterWindow.sourceLayer, 'CHARACTER');
  assert.equal(characterWindow.incomingResonatorId, 'augusta');
  assert.equal(characterWindow.value, 0.50);
  assert.equal(characterWindow.startedAtSeconds, 6);
  assert.equal(characterWindow.expiresAtSeconds, 20);
  assert.equal(characterWindow.endsOnIncomingSwitchOut, true);

  assert.equal(moonlitWindow.sourceLayer, 'SONATA');
  assert.equal(moonlitWindow.effectId, 'S08_5PC_INCOMING_ATK');
  assert.equal(moonlitWindow.sourceId, 'sonata-8');
  assert.equal(moonlitWindow.incomingResonatorId, 'augusta');
  assert.equal(moonlitWindow.statOrEffect, 'ATK%');
  assert.equal(moonlitWindow.value, 0.225);
  assert.equal(moonlitWindow.startedAtSeconds, 6);
  assert.equal(moonlitWindow.expiresAtSeconds, 21);
  assert.equal(moonlitWindow.endsOnIncomingSwitchOut, false);
});

test('Moonlit and Iuno Outro preserve distinct source termination semantics', () => {
  const characterWindow = activateIunoOutroTransfer({ event: IUNO_TO_AUGUSTA_OUTRO });
  const moonlitWindow = activateSonataOutroTransfer({
    effectId: 'S08_5PC_INCOMING_ATK',
    wielderId: 'iuno',
    event: IUNO_TO_AUGUSTA_OUTRO,
  });
  assert.ok(characterWindow);
  assert.ok(moonlitWindow);

  const switchOutEvents: readonly ResonatorSwitchOutEvent[] = [
    { kind: 'RESONATOR_SWITCH_OUT', actorId: 'augusta', atSeconds: 10 },
  ];

  assert.equal(isIunoOutroTransferActive(characterWindow, 'augusta', 9.999, switchOutEvents), true);
  assert.equal(isIunoOutroTransferActive(characterWindow, 'augusta', 10, switchOutEvents), false);

  assert.equal(isIncomingTransferWindowActive(moonlitWindow, 'augusta', 10, switchOutEvents), true);
  assert.equal(isIncomingTransferWindowActive(moonlitWindow, 'augusta', 20.999, switchOutEvents), true);
  assert.equal(isIncomingTransferWindowActive(moonlitWindow, 'augusta', 21, switchOutEvents), false);
});

test('Moonlit transfer fails closed for wrong outgoing actor or recipient self-transfer', () => {
  assert.equal(activateSonataOutroTransfer({
    effectId: 'S08_5PC_INCOMING_ATK',
    wielderId: 'iuno',
    event: { ...IUNO_TO_AUGUSTA_OUTRO, actorId: 'the-shorekeeper' },
  }), null);

  assert.equal(activateSonataOutroTransfer({
    effectId: 'S08_5PC_INCOMING_ATK',
    wielderId: 'iuno',
    event: { ...IUNO_TO_AUGUSTA_OUTRO, incomingResonatorId: 'iuno' },
  }), null);
});
