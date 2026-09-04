import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateFallacySupportWindows,
  FALLACY_SUPPORT_SEMANTIC_SPLIT,
  isFallacySupportWindowActive,
  validateFallacySupportContracts,
} from '../src/combat/fallacySupportWindowAdapter.ts';
import { FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW } from '../src/combat/fallacyActiveDamageSemanticReview.ts';
import { ECHO_EFFECT_MODELS } from '../src/data/echoEffects.ts';

const TEAM_IDS = ['augusta', 'iuno', 'the-shorekeeper'] as const;

test('Fallacy support contracts remain source-locked and separate from active-damage execution', () => {
  assert.deepEqual(validateFallacySupportContracts(), []);
  assert.equal(FALLACY_SUPPORT_SEMANTIC_SPLIT.requiresProfileEventTimeline, true);
  assert.deepEqual(FALLACY_SUPPORT_SEMANTIC_SPLIT.closesPendingExecutionIds, []);

  assert.equal(FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.status, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.blockerId, 'BUG-010');
  assert.deepEqual(FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
});

test('explicit selected Fallacy cast activates canonical team ATK and wielder ER windows', () => {
  const activation = activateFallacySupportWindows({
    event: {
      kind: 'ECHO_SKILL_CAST',
      actorId: 'the-shorekeeper',
      echoId: 'echo-60000605',
      atSeconds: 3,
    },
    wielderId: 'the-shorekeeper',
    selectedMainEchoId: 'echo-60000605',
    teamMemberIds: TEAM_IDS,
  });

  assert.ok(activation);
  assert.equal(activation.teamAtk.effectId, 'FALLACY_TEAM_ATK');
  assert.equal(activation.teamAtk.sourceId, 'echo-60000605');
  assert.equal(activation.teamAtk.appliesTo, 'TEAM');
  assert.equal(activation.teamAtk.value, 0.10);
  assert.equal(activation.teamAtk.startedAtSeconds, 3);
  assert.equal(activation.teamAtk.expiresAtSeconds, 23);
  assert.equal(isFallacySupportWindowActive(activation.teamAtk, 'augusta', 22.999), true);
  assert.equal(isFallacySupportWindowActive(activation.teamAtk, 'augusta', 23), false);
  assert.equal(isFallacySupportWindowActive(activation.teamAtk, 'cartethyia', 10), false);

  assert.equal(activation.wielderEr.effectId, 'FALLACY_WIELDER_ER');
  assert.equal(activation.wielderEr.appliesTo, 'WIELDER');
  assert.equal(activation.wielderEr.value, 0.10);
  assert.equal(activation.wielderEr.expiresAtSeconds, 23);
  assert.equal(isFallacySupportWindowActive(activation.wielderEr, 'the-shorekeeper', 10), true);
  assert.equal(isFallacySupportWindowActive(activation.wielderEr, 'augusta', 10), false);
});

test('Fallacy support activation fails closed for wrong actor, selected Echo or cast Echo', () => {
  const base = {
    event: {
      kind: 'ECHO_SKILL_CAST' as const,
      actorId: 'the-shorekeeper',
      echoId: 'echo-60000605',
      atSeconds: 3,
    },
    wielderId: 'the-shorekeeper',
    selectedMainEchoId: 'echo-60000605',
    teamMemberIds: TEAM_IDS,
  };

  assert.equal(activateFallacySupportWindows({
    ...base,
    event: { ...base.event, actorId: 'iuno' },
  }), null);
  assert.equal(activateFallacySupportWindows({
    ...base,
    selectedMainEchoId: 'echo-60000525',
  }), null);
  assert.equal(activateFallacySupportWindows({
    ...base,
    event: { ...base.event, echoId: 'echo-60000525' },
  }), null);
});

test('Fallacy support activation requires explicit team membership and rejects unsupported event kinds', () => {
  assert.throws(() => activateFallacySupportWindows({
    event: {
      kind: 'ECHO_SKILL_CAST',
      actorId: 'the-shorekeeper',
      echoId: 'echo-60000605',
      atSeconds: 3,
    },
    wielderId: 'the-shorekeeper',
    selectedMainEchoId: 'echo-60000605',
    teamMemberIds: ['augusta', 'iuno'],
  }), /must include wielder/);

  assert.throws(() => activateFallacySupportWindows({
    event: {
      kind: 'ACTIVE_DAMAGE_VARIANT' as never,
      actorId: 'the-shorekeeper',
      echoId: 'echo-60000605',
      atSeconds: 3,
    },
    wielderId: 'the-shorekeeper',
    selectedMainEchoId: 'echo-60000605',
    teamMemberIds: TEAM_IDS,
  }), /unsupported Fallacy cast event kind/);
});

test('Fallacy support source drift fails closed', () => {
  const driftedTeamScope = ECHO_EFFECT_MODELS.map((effect) =>
    effect.effectId === 'FALLACY_TEAM_ATK'
      ? { ...effect, appliesTo: 'WIELDER' as const }
      : effect);
  assert.ok(validateFallacySupportContracts(driftedTeamScope).some((issue) => issue.includes('scope drift')));

  const driftedActivation = ECHO_EFFECT_MODELS.map((effect) =>
    effect.effectId === 'FALLACY_WIELDER_ER'
      ? { ...effect, activation: 'MAIN_SLOT_PASSIVE' as const }
      : effect);
  assert.ok(validateFallacySupportContracts(driftedActivation).some((issue) => issue.includes('must remain ON_ECHO_CAST')));

  const driftedDuration = ECHO_EFFECT_MODELS.map((effect) =>
    effect.effectId === 'FALLACY_WIELDER_ER'
      ? { ...effect, durationSeconds: 15 }
      : effect);
  assert.ok(validateFallacySupportContracts(driftedDuration).some((issue) => issue.includes('duration drifted apart')));
});
