import assert from 'node:assert/strict';
import test from 'node:test';
import { createRank5EchoAtLevel0, withRank5MainStatsAtLevel, type Echo } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { compareCharacterHitEchoReplacement, listCharacterEchoComparisonSupport,
  type CharacterEchoComparisonInput, type EchoBuildHitContext } from '../src/combat/characterEchoComparison.ts';
import { listCharacterDirectHitSupport, evaluateCharacterDirectHit } from '../src/combat/characterDirectHitAdapter.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, i) => createRank5EchoAtLevel0({
  id: 'owned-' + i, cost: cost as 1 | 3 | 4, primaryMainStat: 'ATK%',
}));
const defaultRow = listCharacterDirectHitSupport().find(r => r.factId === 'aalto-basic-half-truths-1')!;
function fixture(row = defaultRow): CharacterEchoComparisonInput {
  const current = cards(), candidate = cards();
  candidate[0] = withRank5MainStatsAtLevel(candidate[0], 5);
  candidate[0].substats = [{ name: 'CRIT Rate', value: .063 }];
  const context = (echoes: Echo[], evidenceId: string): EchoBuildHitContext => ({
    status: 'QUALIFIED', characterId: row.characterId, factId: row.factId,
    componentIndex: 0, landedHitCount: 1,
    eventContextId: 'same-observed-hit', echoStatKey: projectRank5EchoStats(echoes).key, evidenceId,
    damageElement: CHARACTER_CATALOG.find(c => c.id === row.characterId)!.element!,
    scalingBaseBeforePercentBonuses: 1000, allNonEchoSourcesQualified: true,
    echoDependentEffectsRecomputed: true, equipmentStateQualified: true,
    nonEchoSnapshot: { totalScalingStat: 1000, scalingStat: row.scalingStat, damageClass: row.sourceDamageClass,
      damageBonus: 0, amplification: 0, critRate: 0, critDamage: 1.5,
      defenseMultiplier: 1, resistanceMultiplier: 1, damageReduction: 0 },
  });
  return { hit: { characterId: row.characterId, factId: row.factId, sequence: 0, maxSkills: true,
    componentIndex: 0, landedHitCount: 1 }, eventContextId: 'same-observed-hit', slotIndex: 0,
    current: { echoes: current, context: context(current, 'current-source') },
    candidate: { echoes: candidate, context: context(candidate, 'candidate-source') } };
}

test('all 54 existing Character consumers can recompute exact same-hit Echo replacements', () => {
  const support = listCharacterEchoComparisonSupport();
  assert.equal(support.length, 492);
  assert.equal(new Set(support.map(r => r.characterId)).size, 54);
  for (const row of listCharacterDirectHitSupport()) {
    const input = fixture(row), result = compareCharacterHitEchoReplacement(input);
    assert.equal(result.status, 'EVALUATED_HIT_COMPARISON');
    if (result.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Unexpected pending fixture');
    const expectedBase = row.scalingStat === 'ATK' ? 1328 : row.scalingStat === 'HP' ? 1912 : 1000;
    assert.ok(Math.abs(result.current.snapshot.totalScalingStat - expectedBase) < 1e-10, row.factId);
    assert.equal(result.current.expectedDamage, evaluateCharacterDirectHit({ ...input.hit,
      snapshot: { ...result.current.snapshot, totalScalingStat: expectedBase } }).expectedDamage);
    assert.ok(result.expectedDamageDelta > 0, row.factId);
    assert.equal(result.authorizesRotationDps, false);
    assert.equal(result.authorizesUpgradeVerdict, false);
    assert.equal(result.resourceFeasibility, 'NOT_EVALUATED');
  }
});

test('one complete recomputation accounts for percent, automatic flat stats and nonlinear crit together', () => {
  const input = fixture(), original = structuredClone(input);
  const result = compareCharacterHitEchoReplacement(input);
  assert.equal(result.status, 'EVALUATED_HIT_COMPARISON');
  if (result.status !== 'EVALUATED_HIT_COMPARISON') return;
  assert.ok(Math.abs(result.candidate.snapshot.totalScalingStat - 1404.8) < 1e-10);
  assert.equal(result.candidate.snapshot.critRate, .063);
  assert.ok(Math.abs(result.relativeExpectedDamageDelta! - (1404.8 * 1.0315 / 1328 - 1)) < 1e-12);
  assert.deepEqual(input, original);
});

test('build-dependent effects use independently supplied candidate state; unknown effects stay pending', () => {
  const input = fixture();
  assert.equal(input.candidate.context.status, 'QUALIFIED');
  if (input.candidate.context.status !== 'QUALIFIED') return;
  input.candidate = { ...input.candidate, context: { ...input.candidate.context,
    nonEchoSnapshot: { ...input.candidate.context.nonEchoSnapshot, critRate: .99, amplification: .2 } } };
  const result = compareCharacterHitEchoReplacement(input);
  if (result.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected evaluated');
  assert.equal(result.candidate.snapshot.amplification, .2);
  assert.equal(result.candidate.snapshot.critRate, 1.053);
  assert.equal(result.current.snapshot.amplification, 0);
  const pending = compareCharacterHitEchoReplacement({ ...input,
    candidate: { ...input.candidate, context: { status: 'PENDING', reason: 'ER-dependent teammate crit not recomputed' } } });
  assert.equal(pending.status, 'PENDING');
  assert.equal('expectedDamageDelta' in pending, false);
  assert.equal('current' in pending, false);
});

test('stale, wrong-actor, wrong-event and incomplete proofs cannot be reused', () => {
  const changes = [
    { echoStatKey: 'old-build' }, { characterId: 'ciaccona' }, { factId: 'wrong' },
    { eventContextId: 'other-hit' }, { evidenceId: '' }, { damageElement: undefined },
    { componentIndex: 1 }, { landedHitCount: 0 },
    { allNonEchoSourcesQualified: false }, { echoDependentEffectsRecomputed: false },
    { equipmentStateQualified: false }, { scalingBaseBeforePercentBonuses: Number.NaN },
  ];
  for (const patch of changes) {
    const input = fixture();
    input.candidate = { ...input.candidate, context: { ...input.candidate.context, ...patch } as any };
    assert.throws(() => compareCharacterHitEchoReplacement(input));
  }
  const input = fixture();
  input.candidate = { ...input.candidate, context: input.current.context };
  assert.throws(() => compareCharacterHitEchoReplacement(input), /bound to these exact/);
});

test('source damage class and explicitly proven element determine which Echo bonuses apply', () => {
  const row = listCharacterDirectHitSupport().find(r => r.factId === 'aemeath-heavy-charged-ii')!;
  assert.equal(row.sourceDamageClass, 'LIBERATION');
  const input = fixture(row);
  input.candidate.echoes[0].substats = [{ name: 'Liberation DMG', value: .094 }];
  if (input.candidate.context.status !== 'QUALIFIED') throw new Error('fixture');
  input.candidate = { ...input.candidate, context: { ...input.candidate.context,
    echoStatKey: projectRank5EchoStats(input.candidate.echoes).key } };
  const result = compareCharacterHitEchoReplacement(input);
  if (result.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('fixture');
  assert.equal(result.candidate.snapshot.damageBonus, .094);
  const elemental = fixture();
  elemental.candidate.echoes[1].mainStat = { name: 'Aero DMG', value: .06 };
  elemental.candidate.echoes[0] = structuredClone(elemental.current.echoes[0]);
  elemental.slotIndex = 1;
  if (elemental.candidate.context.status !== 'QUALIFIED') throw new Error('fixture');
  elemental.candidate = { ...elemental.candidate, context: { ...elemental.candidate.context,
    echoStatKey: projectRank5EchoStats(elemental.candidate.echoes).key } };
  const r = compareCharacterHitEchoReplacement(elemental);
  if (r.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('fixture');
  assert.equal(r.candidate.snapshot.damageBonus, .06);
});

test('zero landed hits produce no gain and no invented percentage denominator', () => {
  const input = fixture(); input.hit = { ...input.hit, landedHitCount: 0 };
  for (const side of ['current', 'candidate'] as const) {
    input[side] = { ...input[side], context: { ...input[side].context, landedHitCount: 0 } as EchoBuildHitContext };
  }
  const r = compareCharacterHitEchoReplacement(input);
  if (r.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('fixture');
  assert.equal(r.expectedDamageDelta, 0);
  assert.equal(r.relativeExpectedDamageDelta, null);
});

test('scope does not allow a second slot, COST, element, base, S1 or unsupported hit to change', () => {
  for (const mutate of [
    (x: CharacterEchoComparisonInput) => { x.candidate.echoes[1].id = 'other'; },
    (x: CharacterEchoComparisonInput) => { x.candidate.echoes[0] = createRank5EchoAtLevel0({ id: 'new', cost: 1, primaryMainStat: 'ATK%' }); },
    (x: CharacterEchoComparisonInput) => { x.hit = { ...x.hit, sequence: 1 }; },
    (x: CharacterEchoComparisonInput) => { x.hit = { ...x.hit, landedHitCount: 999 }; },
    (x: CharacterEchoComparisonInput) => { x.hit = { ...x.hit, factId: 'unsupported' }; },
    (x: CharacterEchoComparisonInput) => { x.slotIndex = .5; },
    (x: CharacterEchoComparisonInput) => { if (x.candidate.context.status === 'QUALIFIED') x.candidate = { ...x.candidate, context: { ...x.candidate.context, damageElement: 'Fusion' } }; },
    (x: CharacterEchoComparisonInput) => { if (x.candidate.context.status === 'QUALIFIED') x.candidate = { ...x.candidate, context: { ...x.candidate.context, scalingBaseBeforePercentBonuses: 999 } }; },
  ]) { const input = fixture(); mutate(input); assert.throws(() => compareCharacterHitEchoReplacement(input)); }
});

test('consumer discovery does not alter readiness or promote the 17 reviewed pending profiles', () => {
  const db = buildCharacterDatabase();
  assert.deepEqual(db.hitPrimitives.echoComparisons, listCharacterEchoComparisonSupport());
  assert.equal(db.characters.filter(c => c.readiness?.disposition === 'DPS_READY').length, 2);
  assert.equal(db.profiles.rotations.filter(r => r.executionStatus === 'ENGINE_MODELED').length, 2);
  assert.equal(db.referenceTeam01.unresolvedDependencies.length, 6);
});
