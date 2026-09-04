import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyIunoWanLightShieldGain,
  applyIunoWanLightSwitchOut,
  createIunoWanLightRecipientState,
  readIunoWanLightRecipientState,
  resolveIunoWanLightRecipientContract,
  validateIunoWanLightRecipientContract,
} from '../src/combat/iunoWanLightRecipientState.ts';

function shield(actorId: string, atSeconds: number, insideIunoFullMoonDomain = true) {
  return {
    kind: 'SHIELD_GAIN' as const,
    actorId,
    atSeconds,
    insideIunoFullMoonDomain,
  };
}

test('Iuno Wan Light runtime contract remains source-owned and exposes the bounded execution seam', () => {
  assert.deepEqual(validateIunoWanLightRecipientContract(), []);
  const contract = resolveIunoWanLightRecipientContract();
  assert.equal(contract.sourceFactId, 'iuno-full-moon-domain-wan-light-recipient');
  assert.equal(contract.sourceCharacterId, 'iuno');
  assert.equal(contract.minStackGainIntervalSeconds, 0.5);
  assert.equal(contract.amplificationPerStack, 0.04);
  assert.equal(contract.maxStacks, 10);
  assert.equal(contract.durationSeconds, 10);
  assert.equal(contract.requiresExplicitFullMoonDomainProof, true);
  assert.equal(contract.endsOnRecipientSwitchOut, true);
  assert.equal(contract.qualifyingTriggerAtCapSemantics, 'SOURCE_BOUNDARY_UNRESOLVED');
});

test('Wan Light gains only from explicit in-Domain recipient Shield events and respects the 0.5s cadence', () => {
  let state = createIunoWanLightRecipientState('augusta');
  state = applyIunoWanLightShieldGain(state, shield('augusta', 1, false));
  assert.equal(readIunoWanLightRecipientState(state, 1).stacks, 0);

  state = applyIunoWanLightShieldGain(state, shield('augusta', 2));
  assert.deepEqual(readIunoWanLightRecipientState(state, 2), {
    recipientId: 'augusta',
    stacks: 1,
    amplification: 0.04,
    active: true,
    expiresAtSeconds: 12,
  });

  state = applyIunoWanLightShieldGain(state, shield('augusta', 2.49));
  assert.equal(readIunoWanLightRecipientState(state, 2.49).stacks, 1);

  state = applyIunoWanLightShieldGain(state, shield('augusta', 2.5));
  assert.deepEqual(readIunoWanLightRecipientState(state, 2.5), {
    recipientId: 'augusta',
    stacks: 2,
    amplification: 0.08,
    active: true,
    expiresAtSeconds: 12.5,
  });
});

test('a newly gained Wan Light stack refreshes duration and exact expiry is fail-closed inactive', () => {
  let state = createIunoWanLightRecipientState('augusta');
  state = applyIunoWanLightShieldGain(state, shield('augusta', 0));
  state = applyIunoWanLightShieldGain(state, shield('augusta', 5));
  assert.equal(readIunoWanLightRecipientState(state, 14.999).stacks, 2);
  assert.deepEqual(readIunoWanLightRecipientState(state, 15), {
    recipientId: 'augusta',
    stacks: 0,
    amplification: 0,
    active: false,
    expiresAtSeconds: null,
  });
});

test('recipient switch-out clears all Wan Light stacks and unrelated switch-outs do not', () => {
  let state = createIunoWanLightRecipientState('augusta');
  state = applyIunoWanLightShieldGain(state, shield('augusta', 1));
  state = applyIunoWanLightSwitchOut(state, {
    kind: 'RESONATOR_SWITCH_OUT',
    actorId: 'iuno',
    atSeconds: 2,
  });
  assert.equal(readIunoWanLightRecipientState(state, 2).stacks, 1);

  state = applyIunoWanLightSwitchOut(state, {
    kind: 'RESONATOR_SWITCH_OUT',
    actorId: 'augusta',
    atSeconds: 3,
  });
  assert.deepEqual(readIunoWanLightRecipientState(state, 3), {
    recipientId: 'augusta',
    stacks: 0,
    amplification: 0,
    active: false,
    expiresAtSeconds: null,
  });
});

test('qualifying Shield events at the Wan Light cap fail closed instead of inventing refresh semantics', () => {
  let state = createIunoWanLightRecipientState('augusta');
  for (let stack = 0; stack < 10; stack += 1) {
    state = applyIunoWanLightShieldGain(state, shield('augusta', stack * 0.5));
  }
  assert.equal(readIunoWanLightRecipientState(state, 4.5).stacks, 10);
  assert.throws(
    () => applyIunoWanLightShieldGain(state, shield('augusta', 5)),
    /qualifying Shield event at max stacks is source-boundary unresolved/,
  );
});

test('Wan Light event processing rejects retroactive recipient events and queries', () => {
  let state = createIunoWanLightRecipientState('augusta');
  state = applyIunoWanLightShieldGain(state, shield('augusta', 2));
  assert.throws(
    () => applyIunoWanLightShieldGain(state, shield('augusta', 1.5)),
    /non-decreasing time order/,
  );
  assert.throws(
    () => readIunoWanLightRecipientState(state, 1.5),
    /precedes processed event history/,
  );
});
