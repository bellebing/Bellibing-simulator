import assert from 'node:assert/strict';
import test from 'node:test';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import {
  advanceWeaponResourceCast, createWeaponResourceCastState,
  listWeaponResourceCastSupport, supportsWeaponResourceCast,
} from '../src/combat/weaponResourceCastAdapter.ts';

const initial = (overrides: Partial<Parameters<typeof createWeaponResourceCastState>[0]> = {}) => createWeaponResourceCastState({
  effectId: 'SSY-CONCERTO', selectedWeapon: { id: 'stellar-symphony', rank: 1 },
  wielderId: 'the-shorekeeper', observedAtSeconds: 0, cooldownReadyAtSeconds: 0, ...overrides,
});
const cast = (atSeconds: number) => ({ kind: 'RESONANCE_LIBERATION_CAST' as const, actorId: 'the-shorekeeper', atSeconds });

test('the shared source family covers 17 weapons across all five weapon types without borrowing conditional mechanics', () => {
  const support = listWeaponResourceCastSupport();
  assert.equal(support.length, 17);
  assert.equal(new Set(support.map((row) => row.weaponId)).size, 17);
  assert.deepEqual([...new Set(support.map((row) => WEAPON_CATALOG.find((weapon) => weapon.id === row.weaponId)!.weaponType))].sort(),
    ['Broadblade', 'Gauntlets', 'Pistols', 'Rectifier', 'Sword']);
  assert.equal(support.filter((row) => row.resource === 'Concerto Energy').length, 7);
  assert.equal(support.filter((row) => row.resource === 'Resonance Energy').length, 10);
  for (const excluded of ['BM-CONCERTO', 'BM-ENERGY', 'SSY-TEAM-ATK', 'P26-STACK-LOSS']) {
    assert.equal(support.some((row) => row.effectId === excluded), false, excluded);
  }
  assert.ok(PROFILE_CATALOGS.weaponRecommendations.some((profile) =>
    profile.characterId === 'the-shorekeeper' && support.some((row) => row.weaponId === profile.defaultWeaponId)));
});

test('all 17 cast effects read exact canonical R1-R5 amounts and cooldowns', () => {
  for (const row of listWeaponResourceCastSupport()) {
    const source = WEAPON_EFFECT_CATALOG.find((effect) => effect.effectId === row.effectId)!;
    for (let rank = 1; rank <= 5; rank += 1) {
      const state = createWeaponResourceCastState({
        effectId: row.effectId, selectedWeapon: { id: row.weaponId, rank }, wielderId: 'explicit-wielder',
        observedAtSeconds: 3, cooldownReadyAtSeconds: 3,
      });
      const result = advanceWeaponResourceCast(state, { kind: row.triggerEvent, actorId: state.actorId, atSeconds: 3 });
      assert.equal(result.resource, source.statOrEffect);
      assert.equal(result.nominalFlatAmount, source.rankValues[rank - 1]);
      assert.equal(result.state.cooldownReadyAtSeconds, 3 + source.triggerCooldownSeconds!);
      assert.equal(result.triggered, true);
      assert.equal(Object.hasOwn(result, 'energyRegen'), false);
    }
  }
});

test('cooldown blocks repeated casts without refreshing and allows the exact source boundary', () => {
  const first = advanceWeaponResourceCast(initial(), cast(5));
  assert.equal(first.nominalFlatAmount, 8);
  assert.equal(first.state.cooldownReadyAtSeconds, 25);
  const blocked = advanceWeaponResourceCast(first.state, cast(24.999));
  assert.equal(blocked.triggered, false);
  assert.equal(blocked.nominalFlatAmount, 0);
  assert.equal(blocked.state.cooldownReadyAtSeconds, 25);
  const next = advanceWeaponResourceCast(blocked.state, cast(25));
  assert.equal(next.nominalFlatAmount, 8);
  assert.equal(next.state.cooldownReadyAtSeconds, 45);
});

test('an initial active cooldown, another actor or another cast cannot fabricate a resource event', () => {
  const cooling = initial({ observedAtSeconds: 8, cooldownReadyAtSeconds: 12 });
  assert.equal(advanceWeaponResourceCast(cooling, cast(9)).nominalFlatAmount, 0);
  const ready = initial();
  const otherActor = advanceWeaponResourceCast(ready, { ...cast(1), actorId: 'augusta' });
  assert.equal(otherActor.nominalFlatAmount, 0);
  assert.equal(otherActor.state.cooldownReadyAtSeconds, 0);
  const skill = advanceWeaponResourceCast(otherActor.state, { ...cast(2), kind: 'RESONANCE_SKILL_CAST' });
  assert.equal(skill.nominalFlatAmount, 0, 'Stellar Symphony uses Liberation, not Skill');
  assert.equal(advanceWeaponResourceCast(skill.state, cast(2)).nominalFlatAmount, 8);
});

test('unknown cooldown, source conditions, unsupported triggers and invalid binding fail closed', () => {
  assert.throws(() => initial({ cooldownReadyAtSeconds: undefined as unknown as number }), /known finite/);
  assert.throws(() => initial({ selectedWeapon: { id: 'variation', rank: 1 } }), /selected weapon/);
  assert.throws(() => initial({ selectedWeapon: { id: 'stellar-symphony', rank: 0 } }), /rank/);
  const source = WEAPON_EFFECT_CATALOG.find((effect) => effect.effectId === 'SSY-CONCERTO')!;
  assert.equal(supportsWeaponResourceCast({ ...source, conditions: ['Unknown resource state'] }), false);
  assert.equal(supportsWeaponResourceCast({ ...source, triggerCooldownSeconds: null }), false);
  assert.equal(supportsWeaponResourceCast({ ...source, mechanicsStatus: 'VERIFIED_RAW_PENDING_MODEL' }), false);
  assert.equal(supportsWeaponResourceCast({ ...source, trigger: 'Deal Resonance Liberation DMG' }), false);
  assert.equal(supportsWeaponResourceCast({ ...source, valueUnit: 'DECIMAL_MULTIPLIER' }), false);
  assert.throws(() => initial({ effectId: 'BM-CONCERTO', selectedWeapon: { id: 'beguiling-melody', rank: 1 } }), /unsupported/);
});

test('event order, unresolved kinds and unrepresentable times cannot silently award resources', () => {
  assert.throws(() => advanceWeaponResourceCast(initial({ observedAtSeconds: 5 }), cast(4)), /ordered/);
  assert.throws(() => advanceWeaponResourceCast(initial(), cast(Number.NaN)), /known finite/);
  assert.throws(() => advanceWeaponResourceCast(initial(), cast(Number.MAX_VALUE)), /not representable/);
  assert.throws(() => advanceWeaponResourceCast(initial(), { ...cast(0), kind: 'UNKNOWN' as never }), /resolved cast/);
});

test('independent candidate cooldowns cannot mutate earlier states or another selected weapon', () => {
  const sourceState = initial();
  const before = { ...sourceState };
  const triggered = advanceWeaponResourceCast(sourceState, cast(0));
  assert.deepEqual(sourceState, before);
  assert.ok(Object.isFrozen(sourceState));
  assert.ok(Object.isFrozen(triggered.state));
  assert.throws(() => { (triggered.state as { weaponId: string }).weaponId = 'variation'; }, TypeError);
  assert.equal(advanceWeaponResourceCast(initial(), cast(0)).nominalFlatAmount, 8);
  assert.equal(advanceWeaponResourceCast(triggered.state, cast(0)).nominalFlatAmount, 0);
});
