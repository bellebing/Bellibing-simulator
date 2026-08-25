import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EchoLab,
  SeededRng,
  VerifiedWuwaEchoRuntime,
  createRank5EchoAtLevel0,
  primaryMainStatValueAtLevel,
  secondaryMainStatValueAtLevel,
  type EchoCost,
  type EchoLevel,
  type PrimaryMainStatName,
} from '../src/echoCore.ts';

const template = createRank5EchoAtLevel0({
  id: 'batch-cost1-atk',
  cost: 1,
  primaryMainStat: 'ATK%',
});

const checkpoints: readonly EchoLevel[] = [0, 5, 10, 15, 20, 25];
const representativeProgressionCases: readonly {
  cost: EchoCost;
  primaryMainStat: PrimaryMainStatName;
}[] = [
  { cost: 1, primaryMainStat: 'HP%' },
  { cost: 3, primaryMainStat: 'Electro DMG' },
  { cost: 4, primaryMainStat: 'DEF%' },
];

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

test('Echo Lab preserves exact main-stat progression across representative costs and every checkpoint', () => {
  for (const progressionCase of representativeProgressionCases) {
    for (const checkpoint of checkpoints) {
      const lab = new EchoLab(new VerifiedWuwaEchoRuntime());
      const rng = new SeededRng(`lab-main-${progressionCase.cost}-${checkpoint}`);
      const progressionTemplate = createRank5EchoAtLevel0({
        id: `lab-main-${progressionCase.cost}-${checkpoint}`,
        cost: progressionCase.cost,
        primaryMainStat: progressionCase.primaryMainStat,
      });
      const acquired = lab.acquire(lab.createSession(), progressionTemplate, 1, rng);
      const session = checkpoint === 0
        ? acquired
        : lab.rollEchoTo(acquired, 0, checkpoint, rng);
      const echo = session.echoes[0]!;

      assert.equal(echo.level, checkpoint);
      assert.equal(
        echo.mainStat.value,
        primaryMainStatValueAtLevel(
          progressionCase.cost,
          progressionCase.primaryMainStat,
          checkpoint,
        ),
      );
      assert.equal(
        echo.secondaryMainStat?.value,
        secondaryMainStatValueAtLevel(progressionCase.cost, checkpoint),
      );
    }
  }
});

test('rolling five acquired Echoes to +10 tracks the complete batch spend', () => {
  const result = runFiveToPlus10('cost-check');

  assert.equal(result.echoes.length, 5);
  for (const echo of result.echoes) {
    assert.equal(echo.level, 10);
    assert.equal(echo.substats.length, 2);
    assert.equal(new Set(echo.substats.map((stat) => stat.name)).size, 2);
    assert.equal(echo.mainStat.value, primaryMainStatValueAtLevel(1, 'ATK%', 10));
    assert.equal(echo.secondaryMainStat?.value, secondaryMainStatValueAtLevel(1, 10));
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
