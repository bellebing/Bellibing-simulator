import assert from 'node:assert/strict';
import test from 'node:test';
import { ECHO_ATTACK_PROFILES } from '../src/data/echoAttacks.ts';
import { evaluateEchoActiveHit, listEchoActiveHitSupport } from '../src/combat/echoActiveHitAdapter.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';

const cohort = [
  { echoId: 'echo-60000825', attackId: 'LORELEI_ACTIVE_STRIKE', element: 'Havoc' as const, motionValue: 4.05, cooldown: 25,
    url: 'https://wuthering.wiki/monster_330000110.html' },
  { echoId: 'echo-60001055', attackId: 'NIGHTMARE_LAMPYLUMEN_ACTIVE_STRIKE', element: 'Glacio' as const, motionValue: 2.736, cooldown: 20,
    url: 'https://wuthering.wiki/monster_340000130.html' },
];

test('Sentry normal and charged attacks are explicit alternatives, with no inferred capacitor or combined cast', () => {
  const profile = ECHO_ATTACK_PROFILES.find((p) => p.echoId === 'echo-60000835')!;
  assert.deepEqual(profile.attacks.map((a) => a.attackId), ['SENTRY_CONSTRUCT_NORMAL_STRIKE', 'SENTRY_CONSTRUCT_CHARGED_DIVE']);
  assert.equal(profile.cooldownSeconds, 25);
  for (const key of ['startingCharges', 'maxCharges', 'rechargeSeconds']) assert.equal(Object.hasOwn(profile, key), false);
  for (const attack of profile.attacks) {
    const input = { echoId: profile.echoId, attackId: attack.attackId, rank: 5, componentIndex: 0, landedHitCount: 1,
      snapshot: { element: 'Glacio' as const, scalingStat: 'ATK' as const, damageClass: 'ECHO' as const,
        totalScalingStat: 1000, damageBonus: 0, amplification: 0, critRate: 0, critDamage: 1.5,
        defenseMultiplier: 1, resistanceMultiplier: 1, damageReduction: 0 } };
    assert.equal(evaluateEchoActiveHit(input).expectedDamage, 4050);
    assert.equal(evaluateEchoActiveHit({ ...input, landedHitCount: 0 }).expectedDamage, 0);
    assert.throws(() => evaluateEchoActiveHit({ ...input, componentIndex: 1 }), /source Echo component/);
    assert.throws(() => evaluateEchoActiveHit({ ...input, landedHitCount: 2 }), /landed hit count/);
    assert.throws(() => evaluateEchoActiveHit({ ...input, attackId: undefined as never }), /does not own/);
    assert.throws(() => evaluateEchoActiveHit({ ...input, echoId: 'echo-60000825' }), /does not own/);
    assert.throws(() => evaluateEchoActiveHit({ ...input, snapshot: { ...input.snapshot, scalingStat: 'HP' } }), /source element, scaling stat/);
    assert.throws(() => evaluateEchoActiveHit({ ...input, rank: 1 }), /Rank-5/);
  }
});

test('Carlotta discovers both Sentry facts while all five profile edges and source-only rotation remain pending', () => {
  const db = buildCharacterDatabase(), q = buildProfileExecutionWorkQueue();
  const preset = db.profiles.presets.find((p) => p.id === 'carlotta-standard')!;
  const loadout = db.profiles.echoLoadouts.find((p) => p.id === preset.echoLoadoutProfileId)!;
  assert.equal(loadout.mainEchoId, 'echo-60000835');
  assert.equal(db.hitPrimitives.echoActiveHits.filter((a) => a.echoId === loadout.mainEchoId).length, 2);
  const edges = q.edges.filter((e) => e.presetId === preset.id);
  assert.equal(edges.length, 5);
  assert.equal(edges.filter((e) => e.semanticStatus === 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE').length, 3);
  const rotation = db.profiles.rotations.find((r) => r.id === preset.rotationProfileId)!;
  assert.equal(rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(rotation.rotationSeconds, undefined);
  assert.equal(q.summary.totalEdges, 83);
});

test('reviewed single-component Echo facts use the existing kernel with explicit landed damage and exact identity', () => {
  for (const row of cohort) {
    const profile = ECHO_ATTACK_PROFILES.find((p) => p.echoId === row.echoId)!;
    assert.equal(profile.cooldownSeconds, row.cooldown);
    assert.equal(profile.provenance.checkedAt, '2026-09-10');
    assert.ok(profile.provenance.sourceUrls?.includes(row.url));
    assert.deepEqual(profile.attacks[0].components, [{ motionValuePerHit: row.motionValue, hits: 1 }]);
    const input = { echoId: row.echoId, attackId: row.attackId, rank: 5, componentIndex: 0, landedHitCount: 1,
      snapshot: { element: row.element, scalingStat: 'ATK' as const, damageClass: 'ECHO' as const,
        totalScalingStat: 1000, damageBonus: .3, amplification: .2, critRate: .5, critDamage: 1.5,
        defenseMultiplier: .5, resistanceMultiplier: .9, damageReduction: .1 } };
    const expected = row.motionValue * 1000 * 1.3 * 1.2 * 1.25 * .5 * .9 * .9;
    assert.ok(Math.abs(evaluateEchoActiveHit(input).expectedDamage - expected) < 1e-9);
    assert.equal(evaluateEchoActiveHit({ ...input, landedHitCount: 0 }).expectedDamage, 0);
    assert.throws(() => evaluateEchoActiveHit({ ...input, landedHitCount: 2 }), /landed hit count/);
    assert.throws(() => evaluateEchoActiveHit({ ...input, landedHitCount: undefined as never }), /landed hit count/);
    assert.throws(() => evaluateEchoActiveHit({ ...input, componentIndex: 1 }), /source Echo component/);
    assert.throws(() => evaluateEchoActiveHit({ ...input, rank: 4 }), /Rank-5/);
    assert.throws(() => evaluateEchoActiveHit({ ...input, attackId: 'UNPROVEN_VARIANT' }), /does not own/);
    assert.throws(() => evaluateEchoActiveHit({ ...input, snapshot: { ...input.snapshot, scalingStat: 'DEF' } }), /source element, scaling stat/);
  }
  const supported = new Set(listEchoActiveHitSupport().map((r) => r.echoId));
  for (const unreviewed of ['echo-60000925', 'echo-60001985', 'echo-60002005']) assert.equal(supported.has(unreviewed), false);
});

test('exact preset Echo consumers discover attack facts while all execution edges and Reference Team blockers remain open', () => {
  const db = buildCharacterDatabase(), queue = buildProfileExecutionWorkQueue();
  const selected = queue.edges.filter((edge) => cohort.some((row) => edge.pendingExecutionId.includes(row.echoId)));
  assert.equal(selected.length, 2);
  assert.deepEqual(selected.map((e) => e.characterId).sort(), ['cantarella', 'zhezhi']);
  for (const edge of selected) {
    assert.equal(edge.semanticStatus, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
    assert.equal(edge.primitiveId, 'echo-active-explicit-hit-v1');
  }
  for (const row of cohort) {
    assert.ok(db.hitPrimitives.echoActiveHits.some((r) => r.echoId === row.echoId && r.attackId === row.attackId));
    assert.ok(db.gear.echoAttacks.some((r) => r.echoId === row.echoId));
  }
  assert.equal(queue.summary.totalEdges, 83);
  assert.equal(db.referenceTeam01.unresolvedDependencies.length, 6);
  assert.deepEqual(db.characters.filter((c) => c.readiness?.disposition === 'DPS_READY').map((c) => c.id), ['augusta', 'ciaccona']);
});
