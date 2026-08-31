import assert from 'node:assert/strict';
import test from 'node:test';

import type { Echo } from '../src/domain.ts';
import { validateOwnedBuildEchoSlot } from '../src/ownedBuildEchoValidation.ts';

const EXACT_SLOT_ONE: Echo = {
  id: 'owned-validation-slot-1',
  rank: 5,
  cost: 4,
  level: 25,
  mainStat: { name: 'CRIT Rate', value: 0.22 },
  substats: [
    { name: 'Flat HP', value: 470 },
    { name: 'Flat DEF', value: 40 },
    { name: 'HP%', value: 0.086 },
    { name: 'DEF%', value: 0.109 },
    { name: 'Basic Attack DMG', value: 0.064 },
  ],
};

test('shared owned-build validator accepts automatic secondary main and rejects injected wrong values', () => {
  assert.doesNotThrow(() => validateOwnedBuildEchoSlot({
    presetId: 'augusta-standard',
    slotIndex: 0,
    echo: EXACT_SLOT_ONE,
  }));

  assert.doesNotThrow(() => validateOwnedBuildEchoSlot({
    presetId: 'augusta-standard',
    slotIndex: 0,
    echo: {
      ...EXACT_SLOT_ONE,
      secondaryMainStat: { name: 'Flat ATK', value: 150 },
    },
  }));

  assert.throws(() => validateOwnedBuildEchoSlot({
    presetId: 'augusta-standard',
    slotIndex: 0,
    echo: {
      ...EXACT_SLOT_ONE,
      secondaryMainStat: { name: 'Flat ATK', value: 149 },
    },
  }), /secondary main stat is not the exact COST-bound Rank-5 \+25 value/);

  assert.throws(() => validateOwnedBuildEchoSlot({
    presetId: 'augusta-standard',
    slotIndex: 0,
    echo: {
      ...EXACT_SLOT_ONE,
      secondaryMainStat: { name: 'Flat HP', value: 2280 },
    },
  }), /secondary main stat is not the exact COST-bound Rank-5 \+25 value/);
});
