import assert from 'node:assert/strict';
import test from 'node:test';
import { createRank5EchoAtLevel0, withRank5MainStatsAtLevel } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, i) => createRank5EchoAtLevel0({
  id: 'owned-' + i, cost: cost as 1 | 3 | 4, primaryMainStat: 'ATK%',
}));

test('exact Echo stat reconstruction includes automatic secondaries once, with or without explicit copies', () => {
  const current = cards();
  const projection = projectRank5EchoStats(current);
  assert.equal(projection.totals['Flat ATK'], 70);
  assert.equal(projection.totals['Flat HP'], 912);
  assert.ok(Math.abs(projection.totals['ATK%'] - .258) < 1e-12);
  const implicit = current.map(({ secondaryMainStat, ...echo }) => echo);
  assert.deepEqual(projectRank5EchoStats(implicit), projection);
  assert.equal(projection.authorizesDamage, false);
  assert.equal(projection.includesEchoOrSonataEffects, false);
});

test('checkpoint growth and exact newly tuned rolls change the recomputed totals and evidence key', () => {
  const current = cards();
  const candidate = structuredClone(current);
  candidate[0] = withRank5MainStatsAtLevel(candidate[0], 5);
  candidate[0].substats = [{ name: 'CRIT Rate', value: .063 }];
  const before = projectRank5EchoStats(current), after = projectRank5EchoStats(candidate);
  assert.equal(after.totals['CRIT Rate'], .063);
  assert.equal(after.totals['Flat ATK'], 94);
  assert.ok(after.totals['ATK%'] > before.totals['ATK%']);
  assert.notEqual(before.key, after.key);
  assert.deepEqual(current, cards());
});

test('projection is detached and stat-order normalization does not change proof identity', () => {
  const current = cards();
  current[0] = withRank5MainStatsAtLevel(current[0], 10);
  current[0].substats = [{ name: 'CRIT Rate', value: .063 }, { name: 'Flat ATK', value: 30 }];
  const a = projectRank5EchoStats(current);
  const reversed = structuredClone(current); reversed[0].substats.reverse();
  assert.equal(projectRank5EchoStats(reversed).key, a.key);
  a.cards[0].substats[0].value = 999;
  a.totals['ATK%'] = 999;
  assert.notEqual(projectRank5EchoStats(current).totals['ATK%'], 999);
});

test('malformed, guessed, untuned and duplicate card inputs fail closed', () => {
  const mutations = [
    (x: ReturnType<typeof cards>) => { x[0].rank = 4; },
    (x: ReturnType<typeof cards>) => { x[0].id = x[1].id; },
    (x: ReturnType<typeof cards>) => { x[0].mainStat.value = Number.NaN; },
    (x: ReturnType<typeof cards>) => { x[0].secondaryMainStat!.value += 1; },
    (x: ReturnType<typeof cards>) => { x[0].secondaryMainStat!.name = 'Flat HP'; },
    (x: ReturnType<typeof cards>) => { x[0] = withRank5MainStatsAtLevel(x[0], 5); },
    (x: ReturnType<typeof cards>) => { x[0] = withRank5MainStatsAtLevel(x[0], 5); x[0].substats = [{ name: 'CRIT Rate', value: .07 }]; },
    (x: ReturnType<typeof cards>) => { x[0] = withRank5MainStatsAtLevel(x[0], 10); x[0].substats = [{ name: 'Flat ATK', value: 30 }, { name: 'Flat ATK', value: 40 }]; },
  ];
  for (const mutate of mutations) { const x = cards(); mutate(x); assert.throws(() => projectRank5EchoStats(x)); }
  assert.throws(() => projectRank5EchoStats(cards().slice(1)));
});
