import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyVerinaGiftOfNature,
  applyVerinaOutroBlossom,
  applyZhezhiOutroToIncoming,
  endZhezhiCarveAndDrawOnSwitch,
  isVerinaBlossomAmplificationActive,
  isVerinaGiftOfNatureActive,
  isZhezhiCarveAndDrawActive,
  JINHSI_TEAM_INCOMING_EXECUTION_SEMANTIC_REVIEW,
} from '../src/combat/jinhsiTeamIncomingStateAdapter.ts';

test('Zhezhi Outro applies only from an explicit Zhezhi outgoing-to-incoming event', () => {
  const window = applyZhezhiOutroToIncoming({
    kind: 'OUTRO_SWITCH',
    outgoingActorId: 'zhezhi',
    incomingActorId: 'jinhsi',
    atSeconds: 4,
  });
  assert.deepEqual(window, {
    primitiveId: 'jinhsi-team-incoming-state-v1',
    sourceActorId: 'zhezhi',
    incomingActorId: 'jinhsi',
    startedAtSeconds: 4,
    expiresAtSeconds: 18,
    glacioDamageAmplification: 0.20,
    resonanceSkillDamageAmplification: 0.25,
    resonanceEnergyRestored: 15,
  });
  assert.ok(window);
  assert.equal(isZhezhiCarveAndDrawActive(window, 'jinhsi', 17.999), true);
  assert.equal(isZhezhiCarveAndDrawActive(window, 'jinhsi', 18), false);
  assert.equal(isZhezhiCarveAndDrawActive(window, 'verina', 5), false);

  assert.equal(applyZhezhiOutroToIncoming({
    kind: 'OUTRO_SWITCH', outgoingActorId: 'verina', incomingActorId: 'jinhsi', atSeconds: 4,
  }), null);
});

test('Zhezhi Carve and Draw ends early only when its incoming Resonator switches out', () => {
  const window = applyZhezhiOutroToIncoming({
    kind: 'OUTRO_SWITCH', outgoingActorId: 'zhezhi', incomingActorId: 'jinhsi', atSeconds: 4,
  });
  assert.ok(window);

  const irrelevant = endZhezhiCarveAndDrawOnSwitch({
    window,
    outgoingActorId: 'verina',
    incomingActorId: 'zhezhi',
    atSeconds: 8,
  });
  assert.strictEqual(irrelevant, window);

  const ended = endZhezhiCarveAndDrawOnSwitch({
    window,
    outgoingActorId: 'jinhsi',
    incomingActorId: 'verina',
    atSeconds: 8,
  });
  assert.equal(ended.expiresAtSeconds, 8);
  assert.equal(isZhezhiCarveAndDrawActive(ended, 'jinhsi', 8), false);
});

test('Verina Gift of Nature requires one explicit source action and preserves its 20s team ATK window', () => {
  const liberation = applyVerinaGiftOfNature({
    actorId: 'verina',
    trigger: 'RESONANCE_LIBERATION',
    atSeconds: 2,
  });
  assert.deepEqual(liberation, {
    primitiveId: 'jinhsi-team-incoming-state-v1',
    sourceActorId: 'verina',
    trigger: 'RESONANCE_LIBERATION',
    startedAtSeconds: 2,
    expiresAtSeconds: 22,
    teamAttackBonus: 0.20,
  });
  assert.ok(liberation);
  assert.equal(isVerinaGiftOfNatureActive(liberation, 21.999), true);
  assert.equal(isVerinaGiftOfNatureActive(liberation, 22), false);

  assert.equal(applyVerinaGiftOfNature({ actorId: 'zhezhi', trigger: 'OUTRO', atSeconds: 2 }), null);
});

test('Verina Outro Blossom requires explicit Verina switch and keeps 30s amp separate from 6s heal metadata', () => {
  const window = applyVerinaOutroBlossom({
    kind: 'OUTRO_SWITCH',
    outgoingActorId: 'verina',
    incomingActorId: 'jinhsi',
    atSeconds: 3,
  });
  assert.deepEqual(window, {
    primitiveId: 'jinhsi-team-incoming-state-v1',
    sourceActorId: 'verina',
    incomingActorId: 'jinhsi',
    startedAtSeconds: 3,
    expiresAtSeconds: 33,
    nearbyTeamDamageAmplification: 0.15,
    incomingHealDurationSeconds: 6,
  });
  assert.ok(window);
  assert.equal(isVerinaBlossomAmplificationActive(window, 32.999), true);
  assert.equal(isVerinaBlossomAmplificationActive(window, 33), false);
});

test('team primitive remains predecessor-event gated and closes no Jinhsi dependency', () => {
  assert.equal(JINHSI_TEAM_INCOMING_EXECUTION_SEMANTIC_REVIEW.requiresExplicitPredecessorEvents, true);
  assert.deepEqual(JINHSI_TEAM_INCOMING_EXECUTION_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
  assert.equal(
    JINHSI_TEAM_INCOMING_EXECUTION_SEMANTIC_REVIEW.pendingExecutionId,
    'team:jinhsi-zhezhi-verina:incoming-state-adapter',
  );
});
