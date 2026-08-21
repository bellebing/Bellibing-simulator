import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RANK5_PRIMARY_MAIN_STATS,
  RANK5_SECONDARY_MAIN_STATS,
  createRank5EchoAtLevel0,
  isPrimaryMainStatAllowed,
  primaryMainStatProfile,
} from '../src/echoCore.ts';

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

test('rank-5 main-stat endpoints use verified source-backed values', () => {
  assert.deepEqual(primaryMainStatProfile(1, 'HP%'), {
    name: 'HP%',
    atLevel0: 0.045,
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
    atLevel0: 0.052,
    atLevel25: 0.26,
  });
  assert.deepEqual(primaryMainStatProfile(4, 'DEF%'), {
    name: 'DEF%',
    atLevel0: 0.083,
    atLevel25: 0.415,
  });
});

test('secondary main stats are automatic by cost', () => {
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
});

test('creating a +0 rank-5 Echo produces both main-stat lines and no substats', () => {
  const echo = createRank5EchoAtLevel0({
    id: 'electro-elite',
    cost: 3,
    primaryMainStat: 'Electro DMG',
  });

  assert.equal(echo.rank, 5);
  assert.equal(echo.level, 0);
  assert.deepEqual(echo.mainStat, { name: 'Electro DMG', value: 0.06 });
  assert.deepEqual(echo.secondaryMainStat, { name: 'Flat ATK', value: 20 });
  assert.deepEqual(echo.substats, []);
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
