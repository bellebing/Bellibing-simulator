import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  VerifiedWuwaEchoRuntime,
  type Echo,
  type RandomSource,
} from '../src/echoCore.ts';

class SequenceRng implements RandomSource {
  private index = 0;

  constructor(private readonly values: readonly number[]) {}

  next(): number {
    const value = this.values[this.index % this.values.length];
    this.index += 1;
    if (value === undefined) throw new Error('SequenceRng requires at least one value.');
    return value;
  }
}

test('Echo Core can roll an Echo with no character/build/DPS input', () => {
  const runtime = new VerifiedWuwaEchoRuntime();
  const echo: Echo = {
    id: 'standalone-test',
    cost: 3,
    mainStat: { name: 'Electro DMG', value: 0.3 },
    level: 0,
    substats: [],
  };

  const step = runtime.rollNext(echo, new SequenceRng([0, 0]));
  assert.ok(step);
  assert.equal(step.echo.level, 5);
  assert.equal(step.echo.substats.length, 1);
  assert.deepEqual(step.cost, { echoes: 0, tuners: 10, exp: 4400 });
});

test('Echo Core source cannot import character/combat/decision layers', () => {
  const coreFiles = [
    'src/echoCore.ts',
    'src/echoCoreDomain.ts',
    'src/echoCoreRules.ts',
    'src/echoCoreRuntime.ts',
  ];

  const forbidden = [
    '/characters/',
    "'./characters",
    '"./characters',
    '/combat/',
    "'./combat",
    '"./combat',
    "'./analysis",
    '"./analysis',
    "'./rollRuntime",
    '"./rollRuntime',
    "'./domain",
    '"./domain',
    "'./nextRollAdvice",
    "'./ownedEchoValue",
  ];

  for (const file of coreFiles) {
    const source = readFileSync(file, 'utf8');
    for (const token of forbidden) {
      assert.equal(
        source.includes(token),
        false,
        `${file} crossed the Echo Core boundary through ${token}`,
      );
    }
  }
});
