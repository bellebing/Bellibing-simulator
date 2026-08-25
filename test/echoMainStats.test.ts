import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RANK5_MAIN_STAT_GROWTH,
  RANK5_PRIMARY_MAIN_STATS,
  RANK5_SECONDARY_MAIN_STATS,
  VerifiedWuwaEchoRuntime,
  createRank5EchoAtLevel0,
  isPrimaryMainStatAllowed,
  primaryMainStatProfile,
  primaryMainStatValueAtLevel,
  secondaryMainStatValueAtLevel,
  withRank5MainStatsAtLevel,
  type EchoCost,
  type EchoLevel,
} from '../src/echoCore.ts';

const LEVELS: readonly EchoLevel[] = [0, 5, 10, 15, 20, 25];

test('rank-5 primary main-stat pools are cost-bound', () => {
  assert.deepEqual(
    RANK5_PRIMARY_MAIN_STATS[1].map((x) => x.name),
    ['HP%', 'ATK%', 'DEF%'],
  );
  assert.equal(RANK5_PRIMARY_MAIN_STATS[3].length, 10);
  assert.equal(RANK5_PRIMARY_MAIN_STATS[4].length, 6);

  assert.equal(isPrimaryMainStatAllowed(1, 'CRIT Rate'), false);
  assert.equal(isPrimaryMainStatAllowed(3, 'Energy Regen'), true);
  assert.equal(isPrimaryMainStatAllowed(3, 'Electro DMG'), true);
  assert.equal(isPrimaryMainStatAllowed(4, 'CRIT DMG'), true);
  assert.equal(isPrimaryMainStatAllowed(4, 'Energy Regen'), false);
});

test('rank-5 GrowthId=1 checkpoint curve matches raw game data', () => {
  assert.deepEqual(RANK5_MAIN_STAT_GROWTH, {
    0: 10000,
    5: 18000,
    10: 26000,
    15: 34000,
    20: 42000,
    25: 50000,
  });
});

test('rank-5 main-stat endpoints preserve exact raw game values instead of rounded guide displays', () => {
  assert.deepEqual(primaryMainStatProfile(1, 'HP%'), {
    name: 'HP%',
    atLevel0: 0.0456,
    atLevel25: 0.228,
  });
  assert.deepEqual(primaryMainStatProfile(3, 'Electro DMG'), {
    name: 'Electro DMG',
    atLevel0: 0.06,
    atLevel25: 0.30,
  });
  assert.deepEqual(primaryMainStatProfile(4, 'CRIT Rate'), {
    name: 'CRIT Rate',
    atLevel0: 0.044,
    atLevel25: 0.22,
  });
  assert.deepEqual(primaryMainStatProfile(4, 'Healing Bonus'), {
    name: 'Healing Bonus',
    atLevel0: 0.0528,
    atLevel25: 0.264,
  });
  assert.deepEqual(primaryMainStatProfile(4, 'DEF%'), {
    name: 'DEF%',
    atLevel0: 0.0836,
    atLevel25: 0.418,
  });
});

test('every rank-5 primary main-stat family has exact +0/+5/+10/+15/+20/+25 values', () => {
  const fixtures: readonly {
    cost: EchoCost;
    name: string;
    values: readonly number[];
  }[] = [
    { cost: 1, name: 'HP%', values: [0.0456, 0.0820, 0.1185, 0.1550, 0.1915, 0.2280] },
    { cost: 1, name: 'ATK%', values: [0.0360, 0.0648, 0.0936, 0.1224, 0.1512, 0.1800] },
    { cost: 1, name: 'DEF%', values: [0.0360, 0.0648, 0.0936, 0.1224, 0.1512, 0.1800] },

    { cost: 3, name: 'HP%', values: [0.0600, 0.1080, 0.1560, 0.2040, 0.2520, 0.3000] },
    { cost: 3, name: 'ATK%', values: [0.0600, 0.1080, 0.1560, 0.2040, 0.2520, 0.3000] },
    { cost: 3, name: 'DEF%', values: [0.0760, 0.1368, 0.1976, 0.2584, 0.3192, 0.3800] },
    { cost: 3, name: 'Energy Regen', values: [0.0640, 0.1152, 0.1664, 0.2176, 0.2688, 0.3200] },
    { cost: 3, name: 'Aero DMG', values: [0.0600, 0.1080, 0.1560, 0.2040, 0.2520, 0.3000] },
    { cost: 3, name: 'Glacio DMG', values: [0.0600, 0.1080, 0.1560, 0.2040, 0.2520, 0.3000] },
    { cost: 3, name: 'Fusion DMG', values: [0.0600, 0.1080, 0.1560, 0.2040, 0.2520, 0.3000] },
    { cost: 3, name: 'Electro DMG', values: [0.0600, 0.1080, 0.1560, 0.2040, 0.2520, 0.3000] },
    { cost: 3, name: 'Havoc DMG', values: [0.0600, 0.1080, 0.1560, 0.2040, 0.2520, 0.3000] },
    { cost: 3, name: 'Spectro DMG', values: [0.0600, 0.1080, 0.1560, 0.2040, 0.2520, 0.3000] },

    { cost: 4, name: 'HP%', values: [0.0660, 0.1188, 0.1716, 0.2244, 0.2772, 0.3300] },
    { cost: 4, name: 'ATK%', values: [0.0660, 0.1188, 0.1716, 0.2244, 0.2772, 0.3300] },
    { cost: 4, name: 'DEF%', values: [0.0836, 0.1504, 0.2173, 0.2842, 0.3511, 0.4180] },
    { cost: 4, name: 'CRIT Rate', values: [0.0440, 0.0792, 0.1144, 0.1496, 0.1848, 0.2200] },
    { cost: 4, name: 'CRIT DMG', values: [0.0880, 0.1584, 0.2288, 0.2992, 0.3696, 0.4400] },
    { cost: 4, name: 'Healing Bonus', values: [0.0528, 0.0950, 0.1372, 0.1795, 0.2217, 0.2640] },
  ];

  for (const fixture of fixtures) {
    const actual = LEVELS.map((level) => primaryMainStatValueAtLevel(fixture.cost, fixture.name, level));
    assert.deepEqual(actual, fixture.values, `${fixture.cost}-cost ${fixture.name}`);
  }
});

test('secondary main stats follow the same raw GrowthId=1 curve', () => {
  assert.deepEqual(RANK5_SECONDARY_MAIN_STATS[1], {
    name: 'Flat HP',
    atLevel0: 456,
    atLevel25: 2280,
  });
  assert.deepEqual(RANK5_SECONDARY_MAIN_STATS[3], {
    name: 'Flat ATK',
    atLevel0: 20,
    atLevel25: 100,
  });
  assert.deepEqual(RANK5_SECONDARY_MAIN_STATS[4], {
    name: 'Flat ATK',
    atLevel0: 30,
    atLevel25: 150,
  });

  assert.deepEqual(LEVELS.map((level) => secondaryMainStatValueAtLevel(1, level)), [456, 820, 1185, 1550, 1915, 2280]);
  assert.deepEqual(LEVELS.map((level) => secondaryMainStatValueAtLevel(3, level)), [20, 36, 52, 68, 84, 100]);
  assert.deepEqual(LEVELS.map((level) => secondaryMainStatValueAtLevel(4, level)), [30, 54, 78, 102, 126, 150]);
});

test('creating a +0 rank-5 Echo produces both exact main-stat lines and no substats', () => {
  const echo = createRank5EchoAtLevel0({
    id: 'hp-common',
    cost: 1,
    primaryMainStat: 'HP%',
  });

  assert.equal(echo.rank, 5);
  assert.equal(echo.level, 0);
  assert.deepEqual(echo.mainStat, { name: 'HP%', value: 0.0456 });
  assert.deepEqual(echo.secondaryMainStat, { name: 'Flat HP', value: 456 });
  assert.deepEqual(echo.substats, []);
});

test('source-backed runtime advances both main-stat lines at every tuning checkpoint', () => {
  const runtime = new VerifiedWuwaEchoRuntime();
  const rng = { next: () => 0 };
  let echo = createRank5EchoAtLevel0({
    id: 'crit-overlord',
    cost: 4,
    primaryMainStat: 'CRIT Rate',
  });

  const expectedPrimary = [0.0440, 0.0792, 0.1144, 0.1496, 0.1848, 0.2200];
  const expectedSecondary = [30, 54, 78, 102, 126, 150];

  assert.equal(echo.mainStat.value, expectedPrimary[0]);
  assert.equal(echo.secondaryMainStat?.value, expectedSecondary[0]);

  for (let index = 1; index < LEVELS.length; index += 1) {
    const step = runtime.rollNext(echo, rng);
    assert.ok(step);
    echo = step.echo;
    assert.equal(echo.level, LEVELS[index]);
    assert.equal(echo.mainStat.value, expectedPrimary[index]);
    assert.equal(echo.secondaryMainStat?.value, expectedSecondary[index]);
  }
});

test('acquiring another eligible rank-5 candidate resets a leveled template to exact +0 main stats', () => {
  const runtime = new VerifiedWuwaEchoRuntime();
  const leveled = withRank5MainStatsAtLevel(
    createRank5EchoAtLevel0({ id: 'healing-overlord', cost: 4, primaryMainStat: 'Healing Bonus' }),
    25,
  );
  const fresh = runtime.acquireFresh(leveled, { next: () => 0 }).echo;

  assert.equal(fresh.level, 0);
  assert.equal(fresh.mainStat.value, 0.0528);
  assert.equal(fresh.secondaryMainStat?.value, 30);
  assert.deepEqual(fresh.substats, []);
});

test('Echo Core rejects impossible primary-main/cost combinations', () => {
  assert.throws(
    () => createRank5EchoAtLevel0({ id: 'bad-1', cost: 1, primaryMainStat: 'CRIT Rate' }),
    /not a valid 1-cost primary main stat/,
  );
  assert.throws(
    () => createRank5EchoAtLevel0({ id: 'bad-4', cost: 4, primaryMainStat: 'Energy Regen' }),
    /not a valid 4-cost primary main stat/,
  );
});
