import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  EchoLab,
  VerifiedWuwaEchoRuntime,
  type Echo,
  type RandomSource,
} from '../src/echoCore.ts';

class SequenceRng implements RandomSource {
  private index = 0;
  private readonly values: readonly number[];

  constructor(values: readonly number[]) {
    this.values = values;
  }

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
  assert.deepEqual(step.cost, {
    echoes: 0,
    tuners: 10,
    exp: 4400,
    shellCredits: 2440,
  });
});

test('Echo Lab may simulate four 4-cost Echoes without character validation', () => {
  const lab = new EchoLab(new VerifiedWuwaEchoRuntime());
  const fourCost: Echo = {
    id: 'forecast-four-cost',
    cost: 4,
    mainStat: { name: 'CRIT Rate', value: 0.22 },
    level: 0,
    substats: [],
  };

  const session = lab.acquire(
    lab.createSession(),
    fourCost,
    4,
    new SequenceRng([0.25]),
  );

  assert.equal(session.echoes.length, 4);
  assert.equal(session.echoes.reduce((sum, echo) => sum + echo.cost, 0), 16);
  assert.deepEqual(session.spent, { echoes: 4, tuners: 0, exp: 0, shellCredits: 0 });

  const rolled = lab.rollEchoTo(session, 0, 10, new SequenceRng([0, 0.5, 0.2, 0.8]));
  assert.equal(rolled.echoes[0]?.level, 10);
  assert.equal(rolled.echoes[0]?.substats.length, 2);
  assert.equal(rolled.spent.shellCredits, 5650);
});

test('Echo Core source cannot import character/combat/decision layers', () => {
  const coreFiles = [
    'src/echoCore.ts',
    'src/echoCoreDomain.ts',
    'src/echoCoreLab.ts',
    'src/echoCoreRules.ts',
    'src/echoCoreRuntime.ts',
    'src/echoMainStats.ts',
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
