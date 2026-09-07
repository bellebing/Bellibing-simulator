import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import {
  activateWeaponTeamAmplifyWindow, validateWeaponTeamAmplifyWindowContract,
  weaponTeamAeroAmplificationAt, WEAPON_TEAM_AMPLIFY_WINDOW_REVIEW,
} from '../src/combat/weaponTeamAmplifyWindowAdapter.ts';
import { evaluateCharacterDirectHit, listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';

const cast = {
  weaponId: 'bloodpacts-pledge', rank: 1 as const, wielderId: 'support', wielderCharacterId: 'rover-aero',
  event: { kind: 'ROVER_AERO_UNBOUND_FLOW_CAST' as const, actorId: 'support', atSeconds: 5 },
};
const query = {
  atSeconds: 5, triggerOrder: 'AFTER_TRIGGER' as const,
  nearbyOnFieldEligibility: 'VERIFIED_ELIGIBLE' as const, damageElement: 'Aero' as const,
};

test('reviewed team window reads all canonical ranks and ends at exact source expiration', () => {
  assert.deepEqual(validateWeaponTeamAmplifyWindowContract(), []);
  const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === 'BPP-TEAM-AERO')!;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const window = activateWeaponTeamAmplifyWindow({ ...cast, rank })!;
    assert.ok(Object.isFrozen(window));
    assert.equal(window.expiresAtSeconds, 35);
    assert.equal(weaponTeamAeroAmplificationAt(window, { ...query, atSeconds: 4.99 }), 0);
    assert.equal(weaponTeamAeroAmplificationAt(window, query), effect.rankValues[rank - 1]);
    assert.equal(weaponTeamAeroAmplificationAt(window, { ...query, atSeconds: 34.99 }), effect.rankValues[rank - 1]);
    assert.equal(weaponTeamAeroAmplificationAt(window, { ...query, atSeconds: 35 }), 0);
  }
});

test('wrong weapon, Character, actor or source event never activates the team effect', () => {
  assert.equal(activateWeaponTeamAmplifyWindow({ ...cast, weaponId: 'emerald-of-genesis' }), null);
  assert.equal(activateWeaponTeamAmplifyWindow({ ...cast, wielderCharacterId: 'rover-spectro' }), null);
  assert.equal(activateWeaponTeamAmplifyWindow({ ...cast, event: { ...cast.event, actorId: 'other' } }), null);
  assert.equal(activateWeaponTeamAmplifyWindow({ ...cast, event: { ...cast.event, kind: 'RESONANCE_SKILL_CAST' as never } }), null);
  assert.throws(() => activateWeaponTeamAmplifyWindow({ ...cast, rank: 0 as never }), /rank/);
  assert.throws(() => activateWeaponTeamAmplifyWindow({ ...cast, wielderId: ' ' }), /Actor/);
  for (const atSeconds of [-1, NaN, Infinity, Number.MAX_VALUE]) {
    assert.throws(() => activateWeaponTeamAmplifyWindow({ ...cast, event: { ...cast.event, atSeconds } }));
  }
});

test('recipient eligibility and trigger ordering are explicit, unknown is not a zero', () => {
  const window = activateWeaponTeamAmplifyWindow(cast)!;
  assert.equal(weaponTeamAeroAmplificationAt(window, { ...query, triggerOrder: 'BEFORE_TRIGGER' }), 0);
  assert.equal(weaponTeamAeroAmplificationAt(window, { ...query, nearbyOnFieldEligibility: 'VERIFIED_INELIGIBLE' }), 0);
  assert.equal(weaponTeamAeroAmplificationAt(window, { ...query, damageElement: 'Fusion' }), 0);
  assert.throws(() => weaponTeamAeroAmplificationAt(window, { ...query, nearbyOnFieldEligibility: 'UNKNOWN' }), /unresolved/);
  assert.throws(() => weaponTeamAeroAmplificationAt(window, { ...query, triggerOrder: undefined as never }), /order/);
  assert.throws(() => weaponTeamAeroAmplificationAt(window, { ...query, atSeconds: NaN }), /Time/);
  assert.throws(() => weaponTeamAeroAmplificationAt(window, { ...query, damageElement: '' as never }), /element/);
  assert.throws(() => weaponTeamAeroAmplificationAt(window, { ...query, damageElement: 'UNKNOWN' as never }), /element/);
  const later = activateWeaponTeamAmplifyWindow({ ...cast, event: { ...cast.event, atSeconds: 20 } })!;
  assert.equal(later.expiresAtSeconds, 50);
  assert.equal(window.expiresAtSeconds, 35, 'another activation cannot mutate or refresh the first window');
});

test('source drift fails closed for amount, scope, trigger, duration and additional conditions', () => {
  const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === 'BPP-TEAM-AERO')!;
  for (const patch of [
    { rankValues: [.11, .14, .18, .22, .26] as const }, { durationSeconds: 31 }, { appliesTo: 'SELF' as const },
    { trigger: 'Any Skill' }, { conditions: [] }, { triggerCooldownSeconds: 1 },
    { maxStacks: 2 }, { mechanicsStatus: 'VERIFIED_RAW_PENDING_MODEL' as const },
    { sourceEffectText: 'Applies off field too' },
  ]) assert.ok(validateWeaponTeamAmplifyWindowContract([{ ...effect, ...patch }]).length > 0);
  assert.ok(validateWeaponTeamAmplifyWindowContract([]).length > 0);
  assert.ok(validateWeaponTeamAmplifyWindowContract([effect, effect]).length > 0);
});

test('team amplification composes with existing direct-hit kernel without granting profile execution', () => {
  const window = activateWeaponTeamAmplifyWindow(cast)!;
  const hit = listCharacterDirectHitSupport().find((row) => row.characterId === 'ciaccona')!;
  const params = {
    characterId: hit.characterId, factId: hit.factId, sequence: 0 as const, maxSkills: true as const,
    componentIndex: 0, landedHitCount: 1,
    snapshot: { damageClass: hit.sourceDamageClass, scalingStat: hit.scalingStat, totalScalingStat: 1000,
      damageBonus: .2, amplification: 0, critRate: .5, critDamage: 2,
      defenseMultiplier: .5, resistanceMultiplier: .9, damageReduction: 0 },
  };
  const baseline = evaluateCharacterDirectHit(params).expectedDamage;
  const amplified = evaluateCharacterDirectHit({ ...params, snapshot: {
    ...params.snapshot, amplification: weaponTeamAeroAmplificationAt(window, query),
  } }).expectedDamage;
  assert.ok(Math.abs(amplified - baseline * 1.1) < 1e-8);
  const queue = buildProfileExecutionWorkQueue();
  assert.equal(queue.edges.find((row) => row.pendingExecutionId === WEAPON_TEAM_AMPLIFY_WINDOW_REVIEW.pendingExecutionId)?.semanticStatus,
    'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.deepEqual(WEAPON_TEAM_AMPLIFY_WINDOW_REVIEW.closesPendingExecutionIds, []);
  const database = buildCharacterDatabase();
  assert.equal(database.referenceTeam01.dpsReady, false);
  assert.equal(database.characters.filter((row) => row.readiness?.disposition === 'DPS_READY').length, 2);
});
