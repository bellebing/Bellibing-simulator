import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EchoLab,
  SeededRng,
  VerifiedWuwaEchoRuntime,
  createRank5EchoAtLevel0,
} from '../src/echoCore.ts';

const template = createRank5EchoAtLevel0({
  id: 'batch-cost1-atk',
  cost: 1,
  primaryMainStat: 'ATK%',
});

function runFiveToPlus10(seed: string) {
  const lab = new EchoLab(new VerifiedWuwaEchoRuntime());
  const rng = new SeededRng(seed);
  const acquired = lab.acquirePlan(
    lab.createSession(),
    [{ template, count: 5 }],
    rng,
  );
  return lab.rollAllTo(acquired, 10, rng);
}

test('seeded Echo Lab simulation is exactly reproducible', () => {
  const a = runFiveToPlus10('bellibing-repro-1');
  const b = runFiveToPlus10('bellibing-repro-1');

  assert.deepEqual(a, b);
});

test('different simulation seeds produce different rolled Echo paths', () => {
  const a = runFiveToPlus10('bellibing-repro-A');
  const b = runFiveToPlus10('bellibing-repro-B');

  assert.notDeepEqual(
    a.echoes.map((echo) => echo.substats),
    b.echoes.map((echo) => echo.substats),
  );
});

test('rolling five acquired Echoes to +10 tracks the complete batch spend', () => {
  const result = runFiveToPlus10('cost-check');

  assert.equal(result.echoes.length, 5);
  for (const echo of result.echoes) {
    assert.equal(echo.level, 10);
    assert.equal(echo.substats.length, 2);
    assert.equal(new Set(echo.substats.map((stat) => stat.name)).size, 2);
  }
  assert.deepEqual(result.spent, {
    echoes: 5,
    tuners: 100,
    exp: 82500,
    shellCredits: 28250,
  });
});

test('selected batch tuning spends only on the selected Echoes', () => {
  const lab = new EchoLab(new VerifiedWuwaEchoRuntime());
  const rng = new SeededRng('selected-batch');
  const acquired = lab.acquire(lab.createSession(), template, 5, rng);
  const result = lab.rollEchoesTo(acquired, [1, 3], 5, rng);

  assert.deepEqual(result.echoes.map((echo) => echo.level), [0, 5, 0, 5, 0]);
  assert.deepEqual(result.spent, {
    echoes: 5,
    tuners: 20,
    exp: 8800,
    shellCredits: 4880,
  });
});

test('batch tuning rejects duplicate selection before any simulated spend', () => {
  const lab = new EchoLab(new VerifiedWuwaEchoRuntime());
  const rng = new SeededRng('duplicate-selection');
  const acquired = lab.acquire(lab.createSession(), template, 2, rng);

  assert.throws(
    () => lab.rollEchoesTo(acquired, [0, 0], 5, rng),
    /selected more than once/,
  );
  assert.deepEqual(acquired.spent, {
    echoes: 2,
    tuners: 0,
    exp: 0,
    shellCredits: 0,
  });
});
