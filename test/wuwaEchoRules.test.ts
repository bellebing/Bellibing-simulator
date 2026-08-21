import assert from 'node:assert/strict';
import test from 'node:test';
import type { Echo } from '../src/domain.ts';
import type { RandomSource } from '../src/rollRuntime.ts';
import { VerifiedWuwaEchoRuntime } from '../src/verifiedWuwaEchoRuntime.ts';
import {
  CHECKPOINT_CUMULATIVE_COST,
  ECHO_EXP_RECOVERY_FRACTION,
  SUBSTAT_TYPES,
  SUBSTAT_VALUE_PROBABILITIES,
  TUNER_RECOVERY_FRACTION,
  checkpointIncrement,
  effectiveRefundAtLevel,
  rollNewSubstat,
  rollSubstatValue,
} from '../src/wuwaEchoRules.ts';

class SequenceRng implements RandomSource {
  #index = 0;
  readonly values: readonly number[];
  constructor(values: readonly number[]) {
    this.values = values;
  }
  next(): number {
    const value = this.values[this.#index];
    if (value === undefined) throw new Error('SequenceRng exhausted.');
    this.#index += 1;
    return value;
  }
}

function approx(actual: number, expected: number, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
}

test('all verified probability tables carry ~100% mass', () => {
  for (const [stat, probabilities] of Object.entries(SUBSTAT_VALUE_PROBABILITIES)) {
    const mass = probabilities.reduce((sum, p) => sum + p, 0);
    assert.ok(Math.abs(mass - 1) < 0.00001, `${stat} probability mass is ${mass}`);
  }
});

test('crit tiers use the disclosed low-roll-heavy distribution', () => {
  assert.equal(rollSubstatValue('CRIT Rate', new SequenceRng([0])), 0.063);
  assert.equal(rollSubstatValue('CRIT Rate', new SequenceRng([0.24])), 0.069);
  assert.equal(rollSubstatValue('CRIT Rate', new SequenceRng([0.48])), 0.075);
  assert.equal(rollSubstatValue('CRIT Rate', new SequenceRng([0.71])), 0.081);
  assert.equal(rollSubstatValue('CRIT Rate', new SequenceRng([0.999999])), 0.105);
});

test('substat type cannot repeat on the same Echo', () => {
  const existing = [{ name: 'Flat HP', value: 320 }];
  const rolled = rollNewSubstat(existing, new SequenceRng([0, 0]));
  assert.equal(rolled.name, 'Flat ATK');
  assert.notEqual(rolled.name, existing[0]!.name);
});

test('13 source-backed substat types are represented', () => {
  assert.equal(SUBSTAT_TYPES.length, 13);
  assert.equal(new Set(SUBSTAT_TYPES).size, 13);
});

test('checkpoint costs match current rank-5 Echo cumulative costs', () => {
  assert.deepEqual(CHECKPOINT_CUMULATIVE_COST[25], { echoes: 0, tuners: 50, exp: 142600 });
  assert.deepEqual(checkpointIncrement(0, 5), { echoes: 0, tuners: 10, exp: 4400 });
  assert.deepEqual(checkpointIncrement(5, 10), { echoes: 0, tuners: 10, exp: 12100 });
  assert.deepEqual(checkpointIncrement(10, 15), { echoes: 0, tuners: 10, exp: 23100 });
  assert.deepEqual(checkpointIncrement(15, 20), { echoes: 0, tuners: 10, exp: 39500 });
  assert.deepEqual(checkpointIncrement(20, 25), { echoes: 0, tuners: 10, exp: 63500 });
});

test('effective recycle/feed recovery uses 75% EXP and 30% Tuners', () => {
  approx(ECHO_EXP_RECOVERY_FRACTION, 0.75);
  approx(TUNER_RECOVERY_FRACTION, 0.3);
  assert.deepEqual(effectiveRefundAtLevel(25), { echoes: 0, tuners: 15, exp: 106950 });
});

test('verified runtime advances one checkpoint and adds exactly one unique substat', () => {
  const runtime = new VerifiedWuwaEchoRuntime();
  const echo: Echo = {
    id: 'candidate',
    cost: 3,
    mainStat: { name: 'ATK%', value: 0.3 },
    level: 0,
    substats: [],
  };
  const step = runtime.rollNext(echo, new SequenceRng([0, 0]));
  assert.ok(step);
  assert.equal(step.echo.level, 5);
  assert.equal(step.echo.substats.length, 1);
  assert.equal(step.echo.substats[0]!.name, 'Flat HP');
  assert.equal(step.echo.substats[0]!.value, 320);
  assert.deepEqual(step.cost, { echoes: 0, tuners: 10, exp: 4400 });
});
