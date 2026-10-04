import test from 'node:test';
import assert from 'node:assert/strict';
import { zeroCost, addCost, subtractCost } from '../src/resourceCost.ts';

test('generic cost arithmetic never drops populated Shell Credits', () => {
  const a = { echoes: 1, tuners: 10, exp: 4400, shellCredits: 2440 };
  const b = { echoes: 0, tuners: 10, exp: 12100, shellCredits: 3210 };

  assert.deepEqual(addCost(a, b), {
    echoes: 1,
    tuners: 20,
    exp: 16500,
    shellCredits: 5650,
  });
  assert.deepEqual(subtractCost(addCost(a, b), { echoes: 0, tuners: 6, exp: 12375, shellCredits: 0 }), {
    echoes: 1,
    tuners: 14,
    exp: 4125,
    shellCredits: 5650,
  });
});
