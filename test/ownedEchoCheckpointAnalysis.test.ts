import assert from 'node:assert/strict';
import test from 'node:test';

import {
  analyzeOwnedEchoCheckpoint,
  listOwnedEchoRollOptions,
} from '../src/ownedEchoCheckpointAnalysis.ts';

test('owned Echo input exposes only exact verified Rank-5 roll values', () => {
  const critRate = listOwnedEchoRollOptions().find((row) => row.name === 'CRIT Rate');
  assert.deepEqual(critRate?.values, [0.063, 0.069, 0.075, 0.081, 0.087, 0.093, 0.099, 0.105]);
});

test('Augusta owned +5 checkpoint reproduces low/high CRIT verdict split', () => {
  const low = analyzeOwnedEchoCheckpoint({
    presetId: 'augusta-standard',
    slotIndex: 0,
    level: 5,
    substats: [{ name: 'CRIT Rate', value: 0.063 }],
  });
  assert.equal(low.decision, 'DISCARD');
  assert.equal(low.headline, 'DISCARD');

  const high = analyzeOwnedEchoCheckpoint({
    presetId: 'augusta-standard',
    slotIndex: 0,
    level: 5,
    substats: [{ name: 'CRIT Rate', value: 0.093 }],
  });
  assert.equal(high.decision, 'ROLL');
  assert.equal(high.headline, 'ROLL TO +10');
  assert.deepEqual(high.targetHits, ['CRIT Rate']);
});

test('Augusta owned +10 checkpoint reuses exact policy state rather than a universal score', () => {
  const result = analyzeOwnedEchoCheckpoint({
    presetId: 'augusta-standard',
    slotIndex: 0,
    level: 10,
    substats: [
      { name: 'CRIT Rate', value: 0.093 },
      { name: 'Flat DEF', value: 40 },
    ],
  });
  assert.equal(result.decision, 'ROLL');
  assert.equal(result.headline, 'ROLL TO +15');
  assert.equal(result.deadCount, 1);
  assert.equal(result.finalRequirementSatisfied, false);
});

test('owned Echo analysis rejects fabricated roll magnitudes and duplicate substats', () => {
  assert.throws(() => analyzeOwnedEchoCheckpoint({
    presetId: 'augusta-standard',
    slotIndex: 0,
    level: 5,
    substats: [{ name: 'CRIT Rate', value: 0.091 }],
  }), /not an exact verified Rank-5 roll value/);

  assert.throws(() => analyzeOwnedEchoCheckpoint({
    presetId: 'augusta-standard',
    slotIndex: 0,
    level: 10,
    substats: [
      { name: 'CRIT Rate', value: 0.093 },
      { name: 'CRIT Rate', value: 0.099 },
    ],
  }), /Duplicate Echo substat/);
});

test('DPS_READY without an independent roll policy stays fail-closed for owned Echo analysis', () => {
  assert.throws(() => analyzeOwnedEchoCheckpoint({
    presetId: 'ciaccona-cartethyia-aero',
    slotIndex: 0,
    level: 5,
    substats: [{ name: 'CRIT Rate', value: 0.093 }],
  }), /no verified Roll Assist checkpoint policy/);
});
