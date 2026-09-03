import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateIunoOutroTransfer,
  IUNO_OUTRO_TRANSFER_SEMANTIC_SPLIT,
  isIunoOutroTransferActive,
  resolveIunoOutroTransferContract,
  validateIunoOutroTransferContract,
} from '../src/combat/iunoOutroTransferAdapter.ts';
import { IUNO_ACTION_FACTS } from '../src/data/characterMechanics/iunoRawFacts.ts';

test('Iuno Outro transfer contract derives value/duration from the canonical Character fact', () => {
  assert.deepEqual(validateIunoOutroTransferContract(), []);
  const contract = resolveIunoOutroTransferContract();

  assert.equal(contract.sourceFactId, 'iuno-outro-from-gloom-to-gleam');
  assert.equal(contract.sourceCharacterId, 'iuno');
  assert.equal(contract.statOrEffect, 'Heavy Attack DMG Amplification');
  assert.equal(contract.amplification, 0.50);
  assert.equal(contract.durationSeconds, 14);
  assert.equal(contract.endsOnIncomingSwitchOut, true);
  assert.equal(IUNO_OUTRO_TRANSFER_SEMANTIC_SPLIT.requiresProfileEventTimeline, true);
  assert.deepEqual(IUNO_OUTRO_TRANSFER_SEMANTIC_SPLIT.closesPendingExecutionIds, []);
});

test('Iuno Outro binds the actual incoming Resonator and honors source duration', () => {
  const window = activateIunoOutroTransfer({
    event: {
      kind: 'OUTRO_SWITCH',
      actorId: 'iuno',
      incomingResonatorId: 'augusta',
      incomingEntry: 'DIRECT_SWITCH',
      atSeconds: 3,
    },
  });

  assert.ok(window);
  assert.equal(window.sourceLayer, 'CHARACTER');
  assert.equal(window.sourceId, 'iuno-outro-from-gloom-to-gleam');
  assert.equal(window.incomingResonatorId, 'augusta');
  assert.equal(window.value, 0.50);
  assert.equal(window.startedAtSeconds, 3);
  assert.equal(window.expiresAtSeconds, 17);
  assert.equal(window.endsOnIncomingSwitchOut, true);
  assert.equal(isIunoOutroTransferActive(window, 'augusta', 16.999, []), true);
  assert.equal(isIunoOutroTransferActive(window, 'augusta', 17, []), false);
  assert.equal(isIunoOutroTransferActive(window, 'iuno', 4, []), false);
});

test('Iuno Outro ends exactly when the affected incoming Resonator switches out', () => {
  const window = activateIunoOutroTransfer({
    event: {
      kind: 'OUTRO_SWITCH',
      actorId: 'iuno',
      incomingResonatorId: 'augusta',
      incomingEntry: 'INTRO_SKILL',
      atSeconds: 3,
    },
  });
  assert.ok(window);

  const switchOutEvents = [
    { kind: 'RESONATOR_SWITCH_OUT' as const, actorId: 'the-shorekeeper', atSeconds: 6 },
    { kind: 'RESONATOR_SWITCH_OUT' as const, actorId: 'augusta', atSeconds: 9 },
  ];
  assert.equal(isIunoOutroTransferActive(window, 'augusta', 8.999, switchOutEvents), true);
  assert.equal(isIunoOutroTransferActive(window, 'augusta', 9, switchOutEvents), false);
  assert.equal(isIunoOutroTransferActive(window, 'augusta', 10, switchOutEvents), false);
});

test('Iuno Outro activation fails closed without an explicit Iuno outgoing switch', () => {
  assert.equal(activateIunoOutroTransfer({
    event: {
      kind: 'OUTRO_SWITCH',
      actorId: 'the-shorekeeper',
      incomingResonatorId: 'augusta',
      incomingEntry: 'DIRECT_SWITCH',
      atSeconds: 3,
    },
  }), null);

  assert.throws(() => activateIunoOutroTransfer({
    event: {
      kind: 'FAKE_EVENT' as never,
      actorId: 'iuno',
      incomingResonatorId: 'augusta',
      incomingEntry: 'DIRECT_SWITCH',
      atSeconds: 3,
    },
  }), /unsupported outgoing transfer event kind/);
});

test('Iuno Outro source-text drift fails the adapter instead of preserving stale values', () => {
  const driftedFacts = IUNO_ACTION_FACTS.map((fact) => fact.factId === 'iuno-outro-from-gloom-to-gleam'
    ? {
      ...fact,
      notes: ['Source text intentionally drifted for test coverage.'],
    }
    : fact);

  assert.ok(
    validateIunoOutroTransferContract(driftedFacts).some((issue) => issue.includes('parseable incoming Heavy Attack transfer lifecycle')),
  );
  assert.throws(
    () => resolveIunoOutroTransferContract(driftedFacts),
    /Invalid Iuno Outro transfer contract/,
  );
});

test('Iuno Outro activity rejects malformed switch-out events', () => {
  const window = activateIunoOutroTransfer({
    event: {
      kind: 'OUTRO_SWITCH',
      actorId: 'iuno',
      incomingResonatorId: 'augusta',
      incomingEntry: 'DIRECT_SWITCH',
      atSeconds: 3,
    },
  });
  assert.ok(window);

  assert.throws(
    () => isIunoOutroTransferActive(window, 'augusta', 4, [
      { kind: 'FAKE_SWITCH' as never, actorId: 'augusta', atSeconds: 4 },
    ]),
    /unsupported Resonator switch-out event kind/,
  );
});
