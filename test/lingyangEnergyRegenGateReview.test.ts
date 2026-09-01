import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LINGYANG_ENERGY_REGEN_GATE_REVIEW,
  validateLingyangEnergyRegenGateReview,
} from '../src/data/lingyangEnergyRegenGateReview20260901.ts';
import { PROFILE_HORIZONTAL_GREEN_LANE_STATS } from '../src/data/profileHorizontalGreenLane20260830.ts';

test('Lingyang ER review preserves the canonical no-exact-gate boundary', () => {
  assert.deepEqual(validateLingyangEnergyRegenGateReview(), []);
  assert.equal(LINGYANG_ENERGY_REGEN_GATE_REVIEW.status, 'BLOCKED_SOURCE_SEMANTICS');
  assert.equal(LINGYANG_ENERGY_REGEN_GATE_REVIEW.blockerId, 'BUG-017');
  assert.equal(
    LINGYANG_ENERGY_REGEN_GATE_REVIEW.pendingExecutionId,
    'stat-target:lingyang-standard-stats:exact-er-gate-adapter',
  );
  assert.equal(LINGYANG_ENERGY_REGEN_GATE_REVIEW.sourceRange, '120-125%+');
  assert.deepEqual(LINGYANG_ENERGY_REGEN_GATE_REVIEW.closesPendingExecutionIds, []);
});

test('canonical Lingyang stat target keeps ER as priority context rather than a materialized hard gate', () => {
  const profile = PROFILE_HORIZONTAL_GREEN_LANE_STATS.find((row) => row.id === 'lingyang-standard-stats');
  assert.ok(profile);
  assert.deepEqual(profile.gates, []);
  assert.equal(profile.targetRules.find((rule) => rule.stat === 'Energy Regen')?.priority, 1);
  assert.ok(profile.provenance.notes.some((note) => note.includes('Energy Regen: 120-125%+')));
  assert.ok(profile.provenance.notes.some((note) => note.includes('Estimated in a Zhezhi+Shorekeeper team')));
  assert.ok(profile.provenance.notes.some((note) => note.includes('No exact numeric ER gate is claimed')));
  assert.ok(profile.provenance.notes.some((note) => note.includes('No numeric ER gate is materialized')));
});
