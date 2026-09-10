import assert from 'node:assert/strict';
import test from 'node:test';
import { ECHO_ATTACK_PROFILES } from '../src/data/echoAttacks.ts';
import { evaluateEchoActiveHit, listEchoActiveHitSupport, type EchoActiveHitInput } from '../src/combat/echoActiveHitAdapter.ts';
import { resolveExactEchoActiveDamage } from '../src/combat/echoActiveDamageAdapter.ts';

const input = (overrides: Partial<EchoActiveHitInput> = {}): EchoActiveHitInput => ({
  echoId: 'echo-60001065', attackId: 'FLEURDELYS_WINDCLEAVER_SUMMON', rank: 5,
  componentIndex: 0, landedHitCount: 1,
  snapshot: { damageClass: 'ECHO', element: 'Aero', scalingStat: 'ATK', totalScalingStat: 1000,
    damageBonus: 0, amplification: 0, critRate: 0, critDamage: 1.5,
    defenseMultiplier: 1, resistanceMultiplier: 1, damageReduction: 0 },
  ...overrides,
});

test('seven exact active Echo attacks share the explicit hit boundary across ATK HP and DEF', () => {
  const support = listEchoActiveHitSupport();
  assert.equal(support.length, 7);
  assert.deepEqual(support.map((row) => row.scalingStat).sort(), ['ATK', 'ATK', 'ATK', 'ATK', 'ATK', 'DEF', 'HP']);
  for (const row of support) {
    const source = ECHO_ATTACK_PROFILES.find((profile) => profile.echoId === row.echoId)!;
    assert.equal(source.attacks.find((attack) => attack.attackId === row.attackId)?.trigger, 'ACTIVE_CAST');
    assert.equal(row.rank, 5);
    assert.equal(row.scope, 'EXPLICIT_HITS_ONLY');
  }
});

test('explicitly landing every source component matches the existing exact whole-action reader', () => {
  for (const support of listEchoActiveHitSupport()) {
    const source = ECHO_ATTACK_PROFILES.find((row) => row.echoId === support.echoId)!.attacks.find((row) => row.attackId === support.attackId)!;
    const actual = source.components.reduce((sum, component, componentIndex) => sum + evaluateEchoActiveHit(input({
      echoId: support.echoId, attackId: support.attackId, componentIndex, landedHitCount: component.hits,
      snapshot: { ...input().snapshot, scalingStat: support.scalingStat, element: support.element,
        damageBonus: 0.3, amplification: 0.2, critRate: 0.5, defenseMultiplier: 0.5, resistanceMultiplier: 0.9, damageReduction: 0.1 },
    })).expectedDamage, 0);
    const expected = resolveExactEchoActiveDamage(support.echoId, support.attackId).motionValue * 1000 * 1.3 * 1.2 * 1.25 * 0.5 * 0.9 * 0.9;
    assert.ok(Math.abs(actual - expected) < 1e-9, support.attackId);
  }
});

test('Fleurdelys source components can miss or use different explicitly supplied hit snapshots', () => {
  assert.equal(evaluateEchoActiveHit(input({ landedHitCount: 0 })).expectedDamage, 0);
  const partial = evaluateEchoActiveHit(input({ landedHitCount: 4 }));
  assert.equal(partial.motionValue, 0.2736 * 4);
  const final = evaluateEchoActiveHit(input({ componentIndex: 1, landedHitCount: 1,
    snapshot: { ...input().snapshot, totalScalingStat: 2000 } }));
  assert.equal(final.motionValue, 1.368);
  assert.equal(final.expectedDamage, 1.368 * 2000);
  assert.equal(Object.hasOwn(partial, 'rotationSeconds'), false);
});

test('HP DEF element and damage-scope bindings cannot accidentally use the ATK Echo context', () => {
  const fallacy = input({ echoId: 'echo-60000605', attackId: 'FALLACY_INITIAL_BLAST' });
  assert.throws(() => evaluateEchoActiveHit(fallacy), /source element, scaling stat/);
  assert.equal(evaluateEchoActiveHit({ ...fallacy, snapshot: { ...fallacy.snapshot, element: 'Spectro', scalingStat: 'HP', totalScalingStat: 20000 } }).expectedDamage,
    0.1586 * 20000);
  const bell = input({ echoId: 'echo-60000375', attackId: 'BELL_BORNE_PROTECTION_BLAST' });
  assert.equal(evaluateEchoActiveHit({ ...bell, snapshot: { ...bell.snapshot, element: 'Glacio', scalingStat: 'DEF', totalScalingStat: 1500 } }).expectedDamage,
    1.4592 * 1500);
  assert.throws(() => evaluateEchoActiveHit(input({ snapshot: { ...input().snapshot, damageClass: 'HEAVY' as never } })), /Echo damage scope/);
});

test('rank changes automatic Intro summons and unproven active variants stay outside the primitive', () => {
  assert.throws(() => evaluateEchoActiveHit(input({ rank: 4 })), /Rank-5/);
  assert.throws(() => evaluateEchoActiveHit(input({ echoId: 'echo-60000605', attackId: 'FALLACY_HOLD' })), /does not own/);
  assert.throws(() => evaluateEchoActiveHit(input({ echoId: 'echo-60001915', attackId: 'UNKNOWN_SIGILLUM_ATTACK' })), /No exact Echo attack profile/);
  const profile = ECHO_ATTACK_PROFILES.find((row) => row.attacks.some((attack) => attack.trigger === 'INTRO_AUTO_SUMMON'))!;
  const intro = profile.attacks.find((attack) => attack.trigger === 'INTRO_AUTO_SUMMON')!;
  assert.throws(() => evaluateEchoActiveHit(input({ echoId: profile.echoId, attackId: intro.attackId })), /not an ACTIVE_CAST/);
});

test('partial-hit input never defaults to all hits or another component', () => {
  for (const componentIndex of [-1, 0.5, 2, Number.NaN]) {
    assert.throws(() => evaluateEchoActiveHit(input({ componentIndex })), /source Echo component/);
  }
  for (const landedHitCount of [-1, 0.5, 9, undefined as never]) {
    assert.throws(() => evaluateEchoActiveHit(input({ landedHitCount })), /must be explicit/);
  }
});

test('Echo hits use the same complete finite snapshot boundary as Character hits', () => {
  assert.throws(() => evaluateEchoActiveHit(input({ snapshot: undefined as never })), /complete finite/);
  assert.throws(() => evaluateEchoActiveHit(input({ snapshot: { ...input().snapshot, damageReduction: undefined as never } })), /complete finite/);
  assert.throws(() => evaluateEchoActiveHit(input({ snapshot: { ...input().snapshot, defenseMultiplier: 1.1 } })), /outside supported bounds/);
  assert.throws(() => evaluateEchoActiveHit(input({ snapshot: { ...input().snapshot, totalScalingStat: Number.MAX_VALUE, damageBonus: Number.MAX_VALUE } })), /numeric range/);
});
