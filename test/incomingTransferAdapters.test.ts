import test from 'node:test';
import assert from 'node:assert/strict';

import { ECHO_EFFECT_MODELS } from '../src/data/echoEffects.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import {
  createIncomingTransferWindow,
  isIncomingTransferWindowActive,
} from '../src/combat/incomingTransferState.ts';
import {
  activateEchoTransferWindow,
  ECHO_TRANSFER_WINDOW_CONTRACTS,
  IMPERMANENCE_HERON_TRANSFER_DISPOSITION,
  validateEchoTransferWindowContracts,
} from '../src/combat/echoTransferWindowAdapter.ts';
import {
  activateSonataOutroTransfer,
  SONATA_OUTRO_TRANSFER_CONTRACTS,
  SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT,
  validateSonataOutroTransferContracts,
} from '../src/combat/sonataOutroTransferAdapter.ts';
import { buildProfileAdapterDependencyMatrix } from '../src/profileAdapterDependencyMatrix.ts';

test('generic incoming transfer core binds the window to the actual incoming Resonator only', () => {
  const window = createIncomingTransferWindow({
    adapterId: 'test-transfer',
    sourceLayer: 'WEAPON',
    effectId: 'TEST',
    sourceId: 'test-source',
    sourceActorId: 'aalto',
    statOrEffect: 'ATK%',
    value: 0.10,
    durationSeconds: 14,
    requiresIncomingIntro: false,
  }, {
    kind: 'OUTRO_SWITCH',
    actorId: 'aalto',
    incomingResonatorId: 'jiyan',
    incomingEntry: 'DIRECT_SWITCH',
    atSeconds: 3,
  });

  assert.ok(window);
  assert.equal(window.incomingResonatorId, 'jiyan');
  assert.equal(isIncomingTransferWindowActive(window, 'jiyan', 3), true);
  assert.equal(isIncomingTransferWindowActive(window, 'jiyan', 16.999), true);
  assert.equal(isIncomingTransferWindowActive(window, 'jiyan', 17), false);
  assert.equal(isIncomingTransferWindowActive(window, 'aalto', 4), false);
});

test('generic transfer core fails closed on actor mismatch, missing paired arming fields and unmet Intro requirement', () => {
  const base = {
    adapterId: 'test-transfer',
    sourceLayer: 'ECHO' as const,
    effectId: 'TEST',
    sourceId: 'echo-test',
    sourceActorId: 'zhezhi',
    statOrEffect: 'DMG Bonus',
    value: 0.12,
    durationSeconds: 15,
    requiresIncomingIntro: false,
  };
  const event = {
    kind: 'OUTRO_SWITCH' as const,
    actorId: 'other',
    incomingResonatorId: 'carlotta',
    incomingEntry: 'DIRECT_SWITCH' as const,
    atSeconds: 5,
  };
  assert.equal(createIncomingTransferWindow(base, event), null);
  assert.throws(() => createIncomingTransferWindow({ ...base, armedAtSeconds: 1 }, event), /provided together/);

  const introRequired = { ...base, sourceActorId: 'zhezhi', requiresIncomingIntro: true };
  assert.equal(createIncomingTransferWindow(introRequired, {
    ...event,
    actorId: 'zhezhi',
  }), null);
  assert.ok(createIncomingTransferWindow(introRequired, {
    ...event,
    actorId: 'zhezhi',
    incomingEntry: 'INTRO_SKILL',
  }));
});

test('Echo transfer contracts stay source-locked and execute Denia/Hyvatia prerequisites without guessing', () => {
  assert.deepEqual(validateEchoTransferWindowContracts(), []);
  assert.deepEqual(ECHO_TRANSFER_WINDOW_CONTRACTS.map((row) => row.effectId), [
    'REMINISCENCE_DENIA_INCOMING_FUSION',
    'HYVATIA_INCOMING_ALL_ATTRIBUTE',
  ]);

  const denia = activateEchoTransferWindow({
    effectId: 'REMINISCENCE_DENIA_INCOMING_FUSION',
    wielderId: 'aemeath',
    armEvent: { kind: 'ECHO_SKILL_SUMMON', echoId: 'echo-60002005', actorId: 'aemeath', atSeconds: 2 },
    outroEvent: { kind: 'OUTRO_SWITCH', actorId: 'aemeath', incomingResonatorId: 'changli', incomingEntry: 'DIRECT_SWITCH', atSeconds: 10 },
  });
  assert.equal(denia?.value, 0.12);
  assert.equal(denia?.statOrEffect, 'Fusion DMG Bonus');
  assert.equal(denia?.incomingResonatorId, 'changli');
  assert.equal(denia?.expiresAtSeconds, 25);

  const tooLate = activateEchoTransferWindow({
    effectId: 'REMINISCENCE_DENIA_INCOMING_FUSION',
    wielderId: 'aemeath',
    armEvent: { kind: 'ECHO_SKILL_SUMMON', echoId: 'echo-60002005', actorId: 'aemeath', atSeconds: 2 },
    outroEvent: { kind: 'OUTRO_SWITCH', actorId: 'aemeath', incomingResonatorId: 'changli', incomingEntry: 'DIRECT_SWITCH', atSeconds: 17.001 },
  });
  assert.equal(tooLate, null);

  assert.equal(activateEchoTransferWindow({
    effectId: 'HYVATIA_INCOMING_ALL_ATTRIBUTE',
    wielderId: 'zhezhi',
    armEvent: { kind: 'ECHO_SKILL_SUMMON', echoId: 'echo-60001895', actorId: 'zhezhi', atSeconds: 1 },
    outroEvent: { kind: 'OUTRO_SWITCH', actorId: 'zhezhi', incomingResonatorId: 'carlotta', incomingEntry: 'DIRECT_SWITCH', atSeconds: 5 },
  }), null);

  const hyvatia = activateEchoTransferWindow({
    effectId: 'HYVATIA_INCOMING_ALL_ATTRIBUTE',
    wielderId: 'zhezhi',
    armEvent: { kind: 'ECHO_SKILL_SUMMON', echoId: 'echo-60001895', actorId: 'zhezhi', atSeconds: 1 },
    outroEvent: { kind: 'OUTRO_SWITCH', actorId: 'zhezhi', incomingResonatorId: 'carlotta', incomingEntry: 'INTRO_SKILL', atSeconds: 5 },
  });
  assert.equal(hyvatia?.value, 0.10);
  assert.equal(hyvatia?.expiresAtSeconds, 20);

  const drifted = ECHO_EFFECT_MODELS.map((effect) => effect.effectId === 'REMINISCENCE_DENIA_INCOMING_FUSION'
    ? { ...effect, trigger: 'Automatic transfer' }
    : effect);
  assert.ok(validateEchoTransferWindowContracts(drifted).some((issue) => issue.includes('trigger drift')));
});

test('Impermanence Heron remains explicitly blocked while current hit-vs-cancel transfer evidence conflicts', () => {
  assert.equal(IMPERMANENCE_HERON_TRANSFER_DISPOSITION.status, 'BLOCKED_SOURCE_CONFLICT');
  assert.equal(IMPERMANENCE_HERON_TRANSFER_DISPOSITION.echoId, 'echo-60000525');
  assert.equal(IMPERMANENCE_HERON_TRANSFER_DISPOSITION.sourceConflict.length, 2);
  assert.deepEqual(IMPERMANENCE_HERON_TRANSFER_DISPOSITION.closesPendingExecutionIds, []);
  assert.throws(() => activateEchoTransferWindow({
    effectId: 'IMPERMANENCE_HERON_INCOMING_DMG',
    wielderId: 'lumi',
    armEvent: { kind: 'ECHO_SKILL_SUMMON', echoId: 'echo-60000525', actorId: 'lumi', atSeconds: 1 },
    outroEvent: { kind: 'OUTRO_SWITCH', actorId: 'lumi', incomingResonatorId: 'augusta', incomingEntry: 'INTRO_SKILL', atSeconds: 2 },
  }), /No verified Echo transfer contract/);
});

test('simple Sonata Outro transfers share the core but preserve exact source values and targets', () => {
  assert.deepEqual(validateSonataOutroTransferContracts(), []);
  assert.deepEqual(SONATA_OUTRO_TRANSFER_CONTRACTS.map((row) => row.effectId), [
    'S08_5PC_INCOMING_ATK',
    'S12_5PC_INCOMING_HAVOC',
  ]);

  const moonlit = activateSonataOutroTransfer({
    effectId: 'S08_5PC_INCOMING_ATK',
    wielderId: 'lumi',
    event: { kind: 'OUTRO_SWITCH', actorId: 'lumi', incomingResonatorId: 'augusta', incomingEntry: 'INTRO_SKILL', atSeconds: 8 },
  });
  assert.equal(moonlit?.value, 0.225);
  assert.equal(moonlit?.statOrEffect, 'ATK%');
  assert.equal(moonlit?.sourceId, 'sonata-8');
  assert.equal(moonlit?.incomingResonatorId, 'augusta');
  assert.equal(moonlit?.expiresAtSeconds, 23);

  const midnight = activateSonataOutroTransfer({
    effectId: 'S12_5PC_INCOMING_HAVOC',
    wielderId: 'cantarella',
    event: { kind: 'OUTRO_SWITCH', actorId: 'cantarella', incomingResonatorId: 'phrolova', incomingEntry: 'DIRECT_SWITCH', atSeconds: 4 },
  });
  assert.equal(midnight?.value, 0.15);
  assert.equal(midnight?.statOrEffect, 'Havoc DMG Bonus');
  assert.equal(midnight?.expiresAtSeconds, 19);

  assert.equal(activateSonataOutroTransfer({
    effectId: 'S08_5PC_INCOMING_ATK',
    wielderId: 'lumi',
    event: { kind: 'OUTRO_SWITCH', actorId: 'yinlin', incomingResonatorId: 'augusta', incomingEntry: 'INTRO_SKILL', atSeconds: 8 },
  }), null);

  const drifted = SONATA_EFFECT_MODELS.map((effect) => effect.effectId === 'S08_5PC_INCOMING_ATK'
    ? { ...effect, valueMode: 'PER_STACK' as const }
    : effect);
  assert.ok(validateSonataOutroTransferContracts(drifted).some((issue) => issue.includes('must remain FLAT')));
});

test('canonical Sonata outro-transfer fanout is fully reviewed without admitting more complex incoming-state effects', () => {
  const matrix = buildProfileAdapterDependencyMatrix();
  const edges = matrix.edges.filter((edge) => edge.syntacticPrimitiveKey === 'sonata:outro-transfer-adapter');
  assert.equal(edges.length, 4);
  assert.deepEqual([...new Set(edges.map((edge) => edge.pendingExecutionId))].sort(), [
    ...SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT.directOutroPendingExecutionIds,
  ].sort());
  assert.deepEqual(SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT.closesPendingExecutionIds, []);

  const otherIncoming = SONATA_EFFECT_MODELS.filter((effect) =>
    effect.appliesTo === 'INCOMING_RESONATOR'
    && !SONATA_OUTRO_TRANSFER_CONTRACTS.some((contract) => contract.effectId === effect.effectId));
  assert.ok(otherIncoming.length > 0);
  for (const effect of otherIncoming) {
    assert.throws(() => activateSonataOutroTransfer({
      effectId: effect.effectId,
      wielderId: 'source',
      event: { kind: 'OUTRO_SWITCH', actorId: 'source', incomingResonatorId: 'incoming', incomingEntry: 'INTRO_SKILL', atSeconds: 1 },
    }), /No verified direct Sonata Outro transfer contract/);
  }
});

test('canonical Impermanence Heron fanout remains pending despite the shared transfer core', () => {
  const matrix = buildProfileAdapterDependencyMatrix();
  const edges = matrix.edges.filter((edge) => edge.syntacticPrimitiveKey === 'echo:impermanence-heron-active-transfer-adapter');
  assert.equal(edges.length, 5);
  assert.ok(edges.every((edge) => edge.pendingExecutionId === IMPERMANENCE_HERON_TRANSFER_DISPOSITION.pendingExecutionId));
});
