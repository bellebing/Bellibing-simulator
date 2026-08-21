import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EchoLab,
  VerifiedWuwaEchoRuntime,
  type Echo,
  type RandomSource,
} from '../src/echoCore.ts';

class ZeroRng implements RandomSource {
  next(): number {
    return 0;
  }
}

test('Echo Lab tracks tuning spend independently of any character model', () => {
  const lab = new EchoLab(new VerifiedWuwaEchoRuntime());
  const echo: Echo = {
    id: 'lab-cost-test',
    cost: 1,
    mainStat: { name: 'ATK%', value: 0.18 },
    level: 0,
    substats: [],
  };

  const start = lab.createSession([echo]);
  const plus10 = lab.rollEchoTo(start, 0, 10, new ZeroRng());

  assert.deepEqual(plus10.spent, {
    echoes: 0,
    tuners: 20,
    exp: 16500,
    shellCredits: 5650,
  });

  const discard = lab.discard(plus10, 0);
  assert.deepEqual(discard.recovered, {
    echoes: 0,
    tuners: 6,
    exp: 12375,
    shellCredits: 0,
  });
  assert.equal(discard.session.echoes.length, 0);
});
