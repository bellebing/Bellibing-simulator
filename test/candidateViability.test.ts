import assert from 'node:assert/strict';
import test from 'node:test';
import {
  VerifiedWuwaEchoRuntime,
  createSeededRng,
  type Echo,
} from '../src/echoCore.ts';
import { forecastCandidateViability } from '../src/candidateViability.ts';

const runtime = new VerifiedWuwaEchoRuntime();

function partial(critRate: number): Echo {
  return {
    id: `partial-${critRate}`,
    rank: 5,
    cost: 3,
    mainStat: { name: 'Electro DMG', value: 0.3 },
    secondaryMainStat: { name: 'Flat ATK', value: 100 },
    level: 20,
    substats: [
      { name: 'CRIT Rate', value: critRate },
      { name: 'ATK%', value: 0.079 },
      { name: 'Heavy Attack DMG', value: 0.094 },
      { name: 'Flat DEF', value: 40 },
    ],
  };
}

test('the same CRIT Rate label can be rejected or kept based on its exact roll value', () => {
  const assessFinal = (echo: Echo) => {
    const crit = echo.substats.find((stat) => stat.name === 'CRIT Rate')?.value ?? 0;
    return { status: crit >= 0.09 ? 'KEEP' as const : 'REJECT' as const };
  };

  const low = forecastCandidateViability({
    current: partial(0.063),
    trials: 2000,
    runtime,
    rng: createSeededRng('low-crit'),
    assessFinal,
  });
  const high = forecastCandidateViability({
    current: partial(0.093),
    trials: 2000,
    runtime,
    rng: createSeededRng('high-crit'),
    assessFinal,
  });

  assert.equal(low.keepProbability, 0);
  assert.equal(high.keepProbability, 1);
});

test('a DEF roll does not force rejection when the injected target evaluator still accepts the Echo', () => {
  const result = forecastCandidateViability({
    current: partial(0.093),
    trials: 1000,
    runtime,
    rng: createSeededRng('def-is-contextual'),
    assessFinal: (echo) => {
      const hasDefense = echo.substats.some((stat) => stat.name === 'Flat DEF');
      const crit = echo.substats.find((stat) => stat.name === 'CRIT Rate')?.value ?? 0;
      return { status: hasDefense && crit >= 0.09 ? 'TEMPORARY' as const : 'REJECT' as const };
    },
  });

  assert.equal(result.usableProbability, 1);
  assert.equal(result.temporary, 1000);
});

test('forecast reports future spend from the decision point, not sunk +0-to-+20 cost', () => {
  const result = forecastCandidateViability({
    current: partial(0.093),
    trials: 100,
    runtime,
    rng: createSeededRng('future-spend'),
    assessFinal: () => ({ status: 'KEEP' }),
  });

  assert.deepEqual(result.averageFutureSpend, {
    echoes: 0,
    tuners: 10,
    exp: 63500,
    shellCredits: 8350,
  });
});

test('final evaluator can classify exact future branches as reject, temporary or keep', () => {
  const result = forecastCandidateViability({
    current: {
      ...partial(0.075),
      substats: [
        { name: 'CRIT Rate', value: 0.075 },
        { name: 'ATK%', value: 0.079 },
        { name: 'Heavy Attack DMG', value: 0.094 },
      ],
      level: 15,
    },
    trials: 5000,
    runtime,
    rng: createSeededRng('three-way-final'),
    assessFinal: (echo) => {
      const critDmg = echo.substats.find((stat) => stat.name === 'CRIT DMG')?.value ?? 0;
      const er = echo.substats.find((stat) => stat.name === 'Energy Regen')?.value ?? 0;
      if (critDmg >= 0.174) return { status: 'KEEP' as const };
      if (critDmg > 0 || er > 0) return { status: 'TEMPORARY' as const };
      return { status: 'REJECT' as const };
    },
  });

  assert.ok(result.kept > 0);
  assert.ok(result.temporary > 0);
  assert.ok(result.rejected > 0);
  assert.equal(result.rejected + result.temporary + result.kept, 5000);
});
