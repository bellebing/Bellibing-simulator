import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EchoLab,
  VerifiedWuwaEchoRuntime,
  createRank5EchoAtLevel0,
  type RandomSource,
} from '../src/echoCore.ts';
import { validateEchoLoadout } from '../src/loadoutValidator.ts';

class FixedRng implements RandomSource {
  next(): number {
    return 0.5;
  }
}

const fourCost = createRank5EchoAtLevel0({
  id: 'cost4',
  cost: 4,
  primaryMainStat: 'CRIT Rate',
});
const threeCost = createRank5EchoAtLevel0({
  id: 'cost3',
  cost: 3,
  primaryMainStat: 'Electro DMG',
});
const oneCost = createRank5EchoAtLevel0({
  id: 'cost1',
  cost: 1,
  primaryMainStat: 'ATK%',
});

test('Echo Lab can generate an arbitrary mixed batch before loadout validation', () => {
  const lab = new EchoLab(new VerifiedWuwaEchoRuntime());
  const session = lab.acquirePlan(
    lab.createSession(),
    [
      { template: fourCost, count: 2 },
      { template: threeCost, count: 1 },
      { template: oneCost, count: 3 },
    ],
    new FixedRng(),
  );

  assert.equal(session.echoes.length, 6);
  assert.equal(session.echoes.reduce((sum, echo) => sum + echo.cost, 0), 14);
  assert.deepEqual(session.spent, {
    echoes: 6,
    tuners: 0,
    exp: 0,
    shellCredits: 0,
  });
});

test('four 4-cost Echoes remain legal to simulate but fail equip validation only afterwards', () => {
  const lab = new EchoLab(new VerifiedWuwaEchoRuntime());
  const experiment = lab.acquirePlan(
    lab.createSession(),
    [{ template: fourCost, count: 4 }],
    new FixedRng(),
  );

  assert.equal(experiment.echoes.length, 4);
  const result = validateEchoLoadout(experiment.echoes);
  assert.equal(result.valid, false);
  assert.equal(result.status, 'TOO_HIGH_COST');
  assert.deepEqual(result.violations, ['TOO_HIGH_COST']);
  assert.equal(result.totalCost, 16);
});

test('standard 4-3-3-1-1 and alternative 4-4-1-1-1 fit the verified endgame cap', () => {
  const standard = [fourCost, threeCost, threeCost, oneCost, oneCost];
  const doubleFour = [fourCost, fourCost, oneCost, oneCost, oneCost];

  assert.deepEqual(
    { valid: validateEchoLoadout(standard).valid, cost: validateEchoLoadout(standard).totalCost },
    { valid: true, cost: 12 },
  );
  assert.deepEqual(
    { valid: validateEchoLoadout(doubleFour).valid, cost: validateEchoLoadout(doubleFour).totalCost },
    { valid: true, cost: 11 },
  );
});

test('slot-count validation is independent from cost validation', () => {
  const sixOneCosts = [oneCost, oneCost, oneCost, oneCost, oneCost, oneCost];
  const result = validateEchoLoadout(sixOneCosts);

  assert.equal(result.totalCost, 6);
  assert.equal(result.status, 'TOO_MANY_ECHOES');
  assert.deepEqual(result.violations, ['TOO_MANY_ECHOES']);
});

test('full-build callers can require all five slots without changing raw equip legality', () => {
  const partial = [fourCost, threeCost, oneCost, oneCost];

  assert.equal(validateEchoLoadout(partial).status, 'VALID_LOADOUT');
  assert.equal(
    validateEchoLoadout(partial, { maxEchoes: 5, maxCost: 12, requireFullLoadout: true }).status,
    'INCOMPLETE_LOADOUT',
  );
});
