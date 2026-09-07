import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { WEAPON_CAST_WINDOW_CONTRACTS, activateWeaponCastWindow, isWeaponCastWindowActive } from '../src/combat/weaponCastWindowAdapter.ts';
import { SONATA_CAST_WINDOW_CONTRACTS, activateSonataCastWindow, isSonataCastWindowActive } from '../src/combat/sonataCastWindowAdapter.ts';

test('cast family executes all 34 reviewed weapon effects at all source ranks without numeric copies', () => {
  assert.equal(WEAPON_CAST_WINDOW_CONTRACTS.length, 34);
  for (const contract of WEAPON_CAST_WINDOW_CONTRACTS) {
    const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === contract.effectId)!;
    for (const rank of [1, 2, 3, 4, 5] as const) for (const kind of contract.triggerEvents) {
      const window = activateWeaponCastWindow({ effectId: effect.effectId, rank, wielderId: 'owner',
        event: { kind, actorId: 'owner', atSeconds: 10 } })!;
      assert.equal(window.weaponId, effect.weaponId);
      assert.equal(window.value, effect.rankValues[rank - 1]);
      assert.equal(window.statOrEffect, effect.statOrEffect);
      assert.equal(window.valueUnit, effect.valueUnit);
      assert.equal(window.expiresAtSeconds, 10 + effect.durationSeconds!);
      assert.equal(isWeaponCastWindowActive(window, window.expiresAtSeconds), false);
      assert.equal(activateWeaponCastWindow({ effectId: effect.effectId, rank, wielderId: 'owner',
        event: { kind, actorId: 'someone-else', atSeconds: 10 } }), null);
    }
  }
});

test('six source-qualified Sonata cast effects preserve value, duration, owner and event identity', () => {
  assert.equal(SONATA_CAST_WINDOW_CONTRACTS.length, 6);
  for (const contract of SONATA_CAST_WINDOW_CONTRACTS) {
    const effect = SONATA_EFFECT_MODELS.find((row) => row.effectId === contract.effectId)!;
    const kind = contract.triggerEvents[0];
    const window = activateSonataCastWindow({ effectId: effect.effectId, ownerId: 'owner',
      event: { kind, actorId: 'owner', atSeconds: 3 } })!;
    assert.equal(window.value, effect.value);
    assert.equal(window.sonataSetId, effect.sonataSetId);
    assert.equal(window.expiresAtSeconds, 3 + effect.durationSeconds!);
    assert.equal(isSonataCastWindowActive(window, 2.99), false);
    assert.equal(isSonataCastWindowActive(window, 3), true);
    assert.equal(isSonataCastWindowActive(window, window.expiresAtSeconds), false);
    assert.equal(activateSonataCastWindow({ effectId: effect.effectId, ownerId: 'owner',
      event: { kind: kind === 'INTRO_SKILL_CAST' ? 'RESONANCE_SKILL_CAST' : 'INTRO_SKILL_CAST', actorId: 'owner', atSeconds: 3 } }), null);
  }
});

test('cast-only family rejects damage, target status, team, stack, cooldown and pending trigger cases', () => {
  for (const effectId of ['AS-BASIC', 'LE-SKILL', 'BPP-SKILL', 'WA-AERO', 'BPP-TEAM-AERO', 'RDS-OFFFIELD', 'RJ-ATK', 'LL-BASIC']) {
    assert.throws(() => activateWeaponCastWindow({ effectId, rank: 1, wielderId: 'owner',
      event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'owner', atSeconds: 3 } }), /No verified/);
  }
  for (const effectId of ['S10_5PC_SKILL_STACK', 'S11_5PC_CR', 'S14_5PC_ATTRIBUTE_DMG', 'S22_3PC_FUSION', 'S30_5PC_CR']) {
    assert.throws(() => activateSonataCastWindow({ effectId, ownerId: 'owner',
      event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'owner', atSeconds: 3 } }), /No verified/);
  }
});

test('runtime catalog overrides cannot bypass source validation or produce unrepresentable windows', () => {
  const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === 'UF-SKILL')!;
  const weaponInput = { effectId: effect.effectId, rank: 1 as const, wielderId: 'owner',
    event: { kind: 'INTRO_SKILL_CAST' as const, actorId: 'owner', atSeconds: 3 } };
  for (const patch of [{ trigger: 'Deal Skill DMG' }, { triggerCooldownSeconds: 1 },
    { conditions: ['Needs target status'] }, { mechanicsStatus: 'VERIFIED_RAW_PENDING_MODEL' as const }]) {
    assert.throws(() => activateWeaponCastWindow({ ...weaponInput, catalog: [{ ...effect, ...patch }] }));
  }
  const sonata = SONATA_EFFECT_MODELS.find((row) => row.effectId === 'S10_5PC_GLACIO')!;
  const sonataInput = { effectId: sonata.effectId, ownerId: 'owner',
    event: { kind: 'RESONANCE_SKILL_CAST' as const, actorId: 'owner', atSeconds: 3 } };
  for (const patch of [{ trigger: 'Deal Skill DMG' }, { maxStacks: 2 }, { value: .3 }]) {
    assert.throws(() => activateSonataCastWindow({ ...sonataInput, catalog: [{ ...sonata, ...patch }] }));
  }
  assert.throws(() => activateWeaponCastWindow({ ...weaponInput, event: { ...weaponInput.event, atSeconds: Number.MAX_VALUE } }), /representable/);
  assert.throws(() => activateSonataCastWindow({ ...sonataInput, event: { ...sonataInput.event, atSeconds: Number.MAX_VALUE } }), /representable/);
});
