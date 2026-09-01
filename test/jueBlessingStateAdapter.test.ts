import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyJueResonanceSkillHit,
  castJueForBlessing,
  getJueResonanceSkillDamageBonus,
  isJueBlessingActive,
  JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW,
} from '../src/combat/jueBlessingStateAdapter.ts';
import { JINHSI_STANDARD_OPENER_EXECUTION_REVIEW_20260901 } from '../src/data/jinhsiStandardOpenerExecutionReview20260901.ts';

test('explicit Jué cast resolves exact active damage and starts only the source-backed 15s Blessing window', () => {
  const cast = castJueForBlessing({ kind: 'ECHO_CAST', actorId: 'jinhsi', atSeconds: 5 });
  assert.equal(cast.activeDamage.primitiveId, 'echo-active-damage-v1');
  assert.equal(cast.activeDamage.echoId, 'echo-60000595');
  assert.equal(cast.activeDamage.attackId, 'JUE_ACTIVE_SUMMON');
  assert.equal(cast.activeDamage.scalingStat, 'ATK');
  assert.ok(Math.abs(cast.activeDamage.motionValue - 2.4322) < 1e-12);
  assert.equal(cast.resonanceSkillDamageBonus, 0.16);
  assert.equal(cast.state.startedAtSeconds, 5);
  assert.equal(cast.state.expiresAtSeconds, 20);
  assert.equal(getJueResonanceSkillDamageBonus(cast.state, 'jinhsi', 19.999), 0.16);
  assert.equal(getJueResonanceSkillDamageBonus(cast.state, 'jinhsi', 20), 0);
  assert.equal(getJueResonanceSkillDamageBonus(cast.state, 'zhezhi', 6), 0);
});

test('Jué repeated Skill-classified damage requires explicit owner Skill hits and enforces one-second cadence', () => {
  const cast = castJueForBlessing({ kind: 'ECHO_CAST', actorId: 'jinhsi', atSeconds: 5 });
  const first = applyJueResonanceSkillHit(cast.state, {
    kind: 'RESONANCE_SKILL_HIT',
    actorId: 'jinhsi',
    atSeconds: 6,
  });
  assert.ok(first.proc);
  assert.equal(first.proc.motionValue, 0.16);
  assert.equal(first.proc.damageClass, 'SKILL');
  assert.equal(first.proc.element, 'Spectro');
  assert.equal(first.proc.scalingStat, 'ATK');

  const tooSoon = applyJueResonanceSkillHit(first.state, {
    kind: 'RESONANCE_SKILL_HIT',
    actorId: 'jinhsi',
    atSeconds: 6.999,
  });
  assert.equal(tooSoon.proc, null);

  const ready = applyJueResonanceSkillHit(tooSoon.state, {
    kind: 'RESONANCE_SKILL_HIT',
    actorId: 'jinhsi',
    atSeconds: 7,
  });
  assert.ok(ready.proc);

  const otherActor = applyJueResonanceSkillHit(ready.state, {
    kind: 'RESONANCE_SKILL_HIT',
    actorId: 'zhezhi',
    atSeconds: 8,
  });
  assert.equal(otherActor.proc, null);
});

test('Jué primitive expires deterministically and never implies equipment-only uptime', () => {
  const cast = castJueForBlessing({ kind: 'ECHO_CAST', actorId: 'jinhsi', atSeconds: 0 });
  assert.equal(isJueBlessingActive(cast.state, 'jinhsi', 14.999), true);
  assert.equal(isJueBlessingActive(cast.state, 'jinhsi', 15), false);
  assert.equal(applyJueResonanceSkillHit(cast.state, {
    kind: 'RESONANCE_SKILL_HIT', actorId: 'jinhsi', atSeconds: 15,
  }).proc, null);
  assert.deepEqual(JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.closesPendingExecutionIds, []);
  assert.equal(JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.requiresExplicitEchoCast, true);
});

test('Jué source placement remains free-flow instead of becoming fixed presence or fixed absence in Standard Opener', () => {
  assert.equal(JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.blockerId, 'BUG-020');
  assert.equal(JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.sourcePlacementDisposition, 'FREE_FLOW_NO_CANONICAL_FIXED_CAST');
  assert.equal(JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.canonicalFixedCastCheckpointPresent, false);
  assert.equal(JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.canonicalCastPresence, null);
  assert.equal(JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.recommendedPlacementIfUsed, 'BEFORE_FORTE_SKILL_NUKE');
  assert.equal(JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.sourcePlacementBlocksCanonicalExecution, true);
  assert.equal(JINHSI_STANDARD_OPENER_EXECUTION_REVIEW_20260901.jue.canonicalCastPresent, null);
  assert.equal(JINHSI_STANDARD_OPENER_EXECUTION_REVIEW_20260901.jue.runtimeContributionAuthorized, false);
  assert.ok(JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.notes.some((note) => note.includes('neither auto-insert nor auto-suppress')));
});