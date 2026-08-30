import test from 'node:test';
import assert from 'node:assert/strict';

import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import {
  BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW,
  validateBlazingBrillianceStackSemanticReview,
} from '../src/combat/blazingBrillianceStackSemanticReview.ts';

test('Blazing Brilliance review preserves exact raw stack facts and parks only at-cap lifecycle semantics', () => {
  const review = BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW;
  assert.deepEqual(validateBlazingBrillianceStackSemanticReview(), []);
  assert.equal(review.blockerId, 'BUG-013');
  assert.equal(review.contracts.length, 2);
  assert.deepEqual(review.closesPendingExecutionIds, []);

  const stacking = review.contracts.find((row) => row.effectId === 'BBR-SKILL');
  const skillCast = review.contracts.find((row) => row.effectId === 'BBR-SKILL-CAST-STACKS');
  assert.ok(stacking);
  assert.ok(skillCast);
  assert.equal(stacking.triggerSemantic, 'DAMAGE_EVENT');
  assert.equal(skillCast.triggerSemantic, 'RESONANCE_SKILL_CAST');
  assert.ok(stacking.unresolvedSemantics.some((note) => note.includes('already capped')));
  assert.ok(skillCast.unresolvedSemantics.some((note) => note.includes('already at 14 stacks')));
});

test('Blazing Brilliance review rejects canonical source drift instead of normalizing it', () => {
  const wrongCap = WEAPON_EFFECT_CATALOG.map((effect) => effect.effectId === 'BBR-SKILL'
    ? { ...effect, maxStacks: 13 }
    : effect);
  assert.ok(validateBlazingBrillianceStackSemanticReview(wrongCap).some((issue) => issue.includes('maxStacks drift')));

  const wrongMutation = WEAPON_EFFECT_CATALOG.map((effect) => effect.effectId === 'BBR-SKILL-CAST-STACKS'
    ? { ...effect, rankValues: [4, 4, 4, 4, 4] as const }
    : effect);
  assert.ok(validateBlazingBrillianceStackSemanticReview(wrongMutation).some((issue) => issue.includes('must remain +5')));
});
