import test from 'node:test';
import assert from 'node:assert/strict';

import { ROVER_HAVOC_EXECUTION_PREFLIGHT_20260831 } from '../src/data/roverHavocExecutionPreflight20260831.ts';

test('Rover Havoc 140%+ Energy Regen remains minimum build guidance, never an exact gate', () => {
  const review = ROVER_HAVOC_EXECUTION_PREFLIGHT_20260831;

  assert.equal(review.sourceBackedEnergyRegenContext, 1.4);
  assert.equal(review.sourceBackedEnergyRegenContextSourceText, '140%+');
  assert.equal(review.sourceBackedEnergyRegenContextRelation, 'AT_LEAST');
  assert.equal(review.sourceBackedEnergyRegenContextUsage, 'ESTIMATED_BUILD_GUIDANCE_ONLY');
  assert.equal(review.sourceBackedEnergyRegenContextIsExactGate, false);
  assert.equal(review.exactEnergyRegenGate, null);
  assert.ok(review.exactBlockers.some((note) => note.includes('not an exact energy-ledger gate')));
});
