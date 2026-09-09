import assert from 'node:assert/strict';
import test from 'node:test';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { activateWeaponDamageWindow, isWeaponDamageWindowActive, listWeaponDamageWindowSupport } from '../src/combat/weaponDamageWindowAdapter.ts';
import { evaluateEchoActiveHit } from '../src/combat/echoActiveHitAdapter.ts';

const activation = () => ({
  effectId: 'LU-ECHO-AMP', selectedWeapon: { id: 'lux-and-umbra', rank: 1 }, wielderId: 'galbrena',
  event: { kind: 'DAMAGE_DEALT' as const, actorId: 'galbrena', damageClass: 'HEAVY' as const,
    atSeconds: 2, sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT' as const },
});
const query = (atSeconds: number) => ({ actorId: 'galbrena', atSeconds, sameTimestampOrder: 'UNKNOWN' as const });

test('seven canonical damage-triggered effects cover current options for three Character profiles', () => {
  const support = listWeaponDamageWindowSupport();
  assert.equal(support.length, 7);
  const weapons = new Set<string>(support.map((row) => row.weaponId));
  assert.equal(weapons.size, 4);
  const profiles = PROFILE_CATALOGS.weaponRecommendations.filter((profile) => profile.options.some((option) => weapons.has(option.weaponId)));
  assert.deepEqual(profiles.map((row) => row.characterId).sort(), ['galbrena', 'luuk-herssen', 'phrolova']);
  for (const row of support) {
    assert.ok(WEAPON_EFFECT_CATALOG.some((effect) => effect.effectId === row.effectId && effect.weaponId === row.weaponId));
    assert.equal(Object.hasOwn(row, 'rankValues'), false);
    assert.equal(Object.hasOwn(row, 'durationSeconds'), false);
  }
});

test('every R1-R5 window reads the canonical value duration and distinct stat scope', () => {
  for (const row of listWeaponDamageWindowSupport()) {
    const source = WEAPON_EFFECT_CATALOG.find((effect) => effect.effectId === row.effectId)!;
    for (let rank = 1; rank <= 5; rank++) {
      const window = activateWeaponDamageWindow({ ...activation(), effectId: row.effectId,
        selectedWeapon: { id: row.weaponId, rank }, event: { ...activation().event, damageClass: row.damageClass } })!;
      assert.equal(window.value, source.rankValues[rank - 1]);
      assert.equal(window.expiresAtSeconds, 2 + source.durationSeconds!);
      assert.equal(window.statOrEffect, source.statOrEffect);
      assert.ok(Object.isFrozen(window));
    }
  }
});

test('casts hypothetical hits and unqualified damage cannot activate a damage window', () => {
  for (const kind of ['ECHO_SKILL_CAST', 'HEAVY_ATTACK_CAST', 'HIT_LANDED']) {
    assert.throws(() => activateWeaponDamageWindow({ ...activation(), event: { ...activation().event, kind: kind as never } }), /Actual source-qualified damage/);
  }
  assert.throws(() => activateWeaponDamageWindow({ ...activation(), event: { ...activation().event, sourceTriggerQualification: 'UNKNOWN' } }), /source-qualified damage/);
  assert.throws(() => activateWeaponDamageWindow({ ...activation(), event: { ...activation().event, damageClass: 'SKILL' as never } }), /Unsupported damage trigger/);
  assert.equal(activateWeaponDamageWindow({ ...activation(), event: { ...activation().event, damageClass: 'ECHO' } }), null);
  assert.equal(activateWeaponDamageWindow({ ...activation(), event: { ...activation().event, actorId: 'teammate' } }), null);
});

test('exact selected weapon and rank cannot be inferred from the effect or another owner', () => {
  assert.throws(() => activateWeaponDamageWindow({ ...activation(), selectedWeapon: { id: 'lethean-elegy', rank: 1 } }), /exact selected weapon/);
  for (const rank of [0, 1.5, 6, undefined as never]) {
    assert.throws(() => activateWeaponDamageWindow({ ...activation(), selectedWeapon: { id: 'lux-and-umbra', rank } }), /explicit R1 through R5/);
  }
  assert.throws(() => activateWeaponDamageWindow({ ...activation(), wielderId: ' ' }), /Explicit weapon owner/);
});

test('the triggering hit is never silently buffed and exact expiration excludes later damage', () => {
  const window = activateWeaponDamageWindow(activation())!;
  assert.equal(isWeaponDamageWindowActive(window, query(1.99)), false);
  assert.throws(() => isWeaponDamageWindowActive(window, query(2)), /ordering is unresolved/);
  assert.equal(isWeaponDamageWindowActive(window, { ...query(2), sameTimestampOrder: 'BEFORE_TRIGGER' }), false);
  assert.equal(isWeaponDamageWindowActive(window, { ...query(2), sameTimestampOrder: 'AFTER_TRIGGER' }), true);
  assert.equal(isWeaponDamageWindowActive(window, query(7.99)), true);
  assert.equal(isWeaponDamageWindowActive(window, query(8)), false);
  assert.equal(isWeaponDamageWindowActive(window, { ...query(3), actorId: 'teammate' }), false);
});

test('repeated activations remain independent and never refresh an earlier window', () => {
  const first = activateWeaponDamageWindow(activation())!;
  const second = activateWeaponDamageWindow({ ...activation(), event: { ...activation().event, atSeconds: 7 } })!;
  assert.equal(first.expiresAtSeconds, 8);
  assert.equal(second.expiresAtSeconds, 13);
  assert.equal(isWeaponDamageWindowActive(first, query(9)), false);
  assert.equal(isWeaponDamageWindowActive(second, query(9)), true);
});

test('stack cooldown prerequisite and source-class drift stay outside the damage-window family', () => {
  for (const patch of [{ trigger: 'Cast Echo Skill' }, { maxStacks: 2 }, { triggerCooldownSeconds: 1 },
    { conditions: ['Requires a stack'] }, { durationSeconds: null }, { weaponId: 'other' },
    { statOrEffect: 'ATK%' }, { mechanicsStatus: 'VERIFIED_RAW_PENDING_MODEL' }, { rankValues: [0.1] }]) {
    const catalog = WEAPON_EFFECT_CATALOG.map((row) => row.effectId === 'LU-ECHO-AMP' ? { ...row, ...patch } as never : row);
    assert.throws(() => activateWeaponDamageWindow({ ...activation(), catalog }), /source contract drift/);
  }
  assert.throws(() => activateWeaponDamageWindow({ ...activation(), catalog: [...WEAPON_EFFECT_CATALOG, WEAPON_EFFECT_CATALOG.find((row) => row.effectId === 'LU-ECHO-AMP')!] }), /exactly one source row/);
  for (const effectId of ['BJ-DEF', 'RS-BASIC', 'AS-SKILL', 'WS-BASIC']) {
    assert.throws(() => activateWeaponDamageWindow({ ...activation(), effectId }), /No reviewed damage-window/);
  }
});

test('invalid or unrepresentable timestamps fail closed', () => {
  for (const atSeconds of [-1, Number.NaN, Number.MAX_VALUE]) {
    assert.throws(() => activateWeaponDamageWindow({ ...activation(), event: { ...activation().event, atSeconds } }), /time|expiration/);
  }
  assert.throws(() => isWeaponDamageWindowActive(activateWeaponDamageWindow(activation())!, query(Number.NaN)), /query time/);
});

test('a separately proven Heavy damage event can amplify a later explicit Echo hit without inventing a rotation', () => {
  const window = activateWeaponDamageWindow(activation())!;
  const echoInput = {
    echoId: 'echo-60001065', attackId: 'FLEURDELYS_WINDCLEAVER_SUMMON', rank: 5,
    componentIndex: 0, landedHitCount: 1,
    snapshot: { damageClass: 'ECHO' as const, element: 'Aero' as const, scalingStat: 'ATK' as const,
      totalScalingStat: 1000, damageBonus: 0, amplification: 0, critRate: 0, critDamage: 1.5,
      defenseMultiplier: 1, resistanceMultiplier: 1, damageReduction: 0 },
  };
  const base = evaluateEchoActiveHit(echoInput).expectedDamage;
  assert.equal(window.statOrEffect, 'Echo Skill DMG Amplification');
  assert.ok(isWeaponDamageWindowActive(window, query(3)));
  const buffed = evaluateEchoActiveHit({ ...echoInput, snapshot: { ...echoInput.snapshot, amplification: window.value } }).expectedDamage;
  assert.equal(buffed, base * 1.24);
  // Synthetic equipment/context arithmetic, not a Galbrena loadout recommendation or DPS result.
  assert.equal(isWeaponDamageWindowActive(window, query(8)), false);
});
