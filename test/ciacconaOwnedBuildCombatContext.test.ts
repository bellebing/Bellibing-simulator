import assert from 'node:assert/strict';
import test from 'node:test';

import { CIACCONA_OWNED_BUILD_COMBAT_CONTEXT_REVIEW_20260831 } from '../src/data/ciacconaOwnedBuildCombatContext20260831.ts';

const REVIEW = CIACCONA_OWNED_BUILD_COMBAT_CONTEXT_REVIEW_20260831;

test('Ciaccona owned-build benchmark keeps target modifiers explicit and non-inferred', () => {
  assert.equal(REVIEW.target.id, 'tactical-hologram-lorelei-vi');
  assert.equal(REVIEW.target.enemyDefense, 1592);
  assert.equal(REVIEW.target.enemyAeroResistance, 0.10);
  assert.ok(REVIEW.target.assumptions.some((note) => note.includes('no successful Dodge')));
  assert.ok(REVIEW.target.assumptions.some((note) => note.includes('before its 180-second trigger')));
  assert.ok(REVIEW.mappingNotes.some((note) => note.includes('No Cartethyia Outro value is assumed')));
});

test('Ciaccona owned-build benchmark keeps Rover Bloodpact source event separate from BUG-012 full rotation timing', () => {
  assert.equal(REVIEW.team.predecessorPresetId, 'rover-aero-cartethyia-ciaccona');
  assert.equal(REVIEW.team.predecessorWeaponId, 'bloodpacts-pledge');
  assert.equal(REVIEW.team.predecessorWeaponRank, 1);
  assert.equal(REVIEW.team.durationSeconds, 30);
  assert.equal(REVIEW.rotationSeconds, 4.5);
  assert.ok(REVIEW.team.durationSeconds > REVIEW.rotationSeconds);
  assert.ok(REVIEW.team.assumptions.some((note) => note.includes('Unbound Flow P1')));
  assert.ok(REVIEW.mappingNotes.some((note) => note.includes('No teammate ATK/CRIT/ER bonus is assumed')));
});
