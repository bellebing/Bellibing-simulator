import assert from 'node:assert/strict';
import test from 'node:test';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { activateSonataDamageWindow, isSonataDamageWindowActive, listSonataDamageWindowSupport } from '../src/combat/sonataDamageWindowAdapter.ts';
import { activateWeaponDamageWindow } from '../src/combat/weaponDamageWindowAdapter.ts';
import { evaluateEchoActiveHit } from '../src/combat/echoActiveHitAdapter.ts';

const activation = () => ({
  effectId: 'S22_3PC_ECHO_CR', selectedSet: { id: 'sonata-22', pieces: 3 }, ownerId: 'galbrena',
  event: { kind: 'DAMAGE_DEALT' as const, actorId: 'galbrena', damageClass: 'HEAVY' as const,
    atSeconds: 2, sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT' as const },
});
const query = (atSeconds: number) => ({ actorId: 'galbrena', atSeconds, sameTimestampOrder: 'UNKNOWN' as const });

test('four canonical Sonata damage windows cover existing Galbrena and Sigrika selections', () => {
  const support = listSonataDamageWindowSupport();
  assert.equal(support.length, 4);
  const sets = new Set<string>(support.map((row) => row.sonataSetId));
  assert.deepEqual(PROFILE_CATALOGS.echoLoadouts.filter((profile) => profile.sonataSetIds.some((id) => sets.has(id)))
    .map((profile) => profile.characterId).sort(), ['galbrena', 'sigrika']);
  for (const row of support) {
    const source = SONATA_EFFECT_MODELS.find((effect) => effect.effectId === row.effectId)!;
    const window = activateSonataDamageWindow({ ...activation(), effectId: row.effectId,
      selectedSet: { id: row.sonataSetId, pieces: row.pieces }, event: { ...activation().event, damageClass: row.damageClass } })!;
    assert.equal(window.value, source.value);
    assert.equal(window.expiresAtSeconds, 2 + source.durationSeconds!);
    assert.equal(window.statOrEffect, source.statOrEffect);
    assert.ok(Object.isFrozen(window));
    assert.equal(Object.hasOwn(row, 'value'), false);
  }
});

test('equipped identity count and actual damage qualification remain explicit', () => {
  assert.throws(() => activateSonataDamageWindow({ ...activation(), selectedSet: { id: 'sonata-29', pieces: 5 } }), /exact selected Sonata/);
  for (const pieces of [undefined as never, -1, 2.5, 6]) {
    assert.throws(() => activateSonataDamageWindow({ ...activation(), selectedSet: { id: 'sonata-22', pieces } }), /explicit equipped Sonata piece count/);
  }
  assert.equal(activateSonataDamageWindow({ ...activation(), selectedSet: { id: 'sonata-22', pieces: 2 } }), null);
  assert.ok(activateSonataDamageWindow({ ...activation(), selectedSet: { id: 'sonata-22', pieces: 4 } }));
  assert.equal(activateSonataDamageWindow({ ...activation(), event: { ...activation().event, actorId: 'sigrika' } }), null);
  assert.equal(activateSonataDamageWindow({ ...activation(), event: { ...activation().event, damageClass: 'ECHO' } }), null);
  assert.throws(() => activateSonataDamageWindow({ ...activation(), event: { ...activation().event, sourceTriggerQualification: 'UNKNOWN' } }), /Actual source-qualified damage/);
  assert.throws(() => activateSonataDamageWindow({ ...activation(), event: { ...activation().event, kind: 'ECHO_SKILL_CAST' as never } }), /Actual source-qualified damage/);
});

test('Sonata and weapon windows share same-hit ordering ownership and exact expiry rules', () => {
  const window = activateSonataDamageWindow(activation())!;
  assert.throws(() => isSonataDamageWindowActive(window, query(2)), /ordering is unresolved/);
  assert.equal(isSonataDamageWindowActive(window, { ...query(2), sameTimestampOrder: 'BEFORE_TRIGGER' }), false);
  assert.equal(isSonataDamageWindowActive(window, { ...query(2), sameTimestampOrder: 'AFTER_TRIGGER' }), true);
  assert.equal(isSonataDamageWindowActive(window, query(7.99)), true);
  assert.equal(isSonataDamageWindowActive(window, query(8)), false);
  assert.equal(isSonataDamageWindowActive(window, { ...query(3), actorId: 'sigrika' }), false);
  const later = activateSonataDamageWindow({ ...activation(), event: { ...activation().event, atSeconds: 7 } })!;
  assert.equal(window.expiresAtSeconds, 8);
  assert.equal(later.expiresAtSeconds, 13);
});

test('source drift and distinct stack or joint-state effects cannot become ordinary damage windows', () => {
  for (const patch of [{ pieces: 5 }, { sonataSetId: 'sonata-29' }, { trigger: 'Cast Echo Skill' },
    { appliesTo: 'TEAM' }, { valueMode: 'PER_STACK' }, { durationSeconds: null }, { maxStacks: 1 },
    { value: Number.NaN }, { mechanicsStatus: 'VALUE_VERIFIED_TRIGGER_PENDING' }]) {
    const catalog = SONATA_EFFECT_MODELS.map((row) => row.effectId === 'S22_3PC_ECHO_CR' ? { ...row, ...patch } as never : row);
    assert.throws(() => activateSonataDamageWindow({ ...activation(), catalog }), /source contract drift/);
  }
  assert.throws(() => activateSonataDamageWindow({ ...activation(), catalog: [...SONATA_EFFECT_MODELS, SONATA_EFFECT_MODELS.find((row) => row.effectId === 'S22_3PC_ECHO_CR')!] }), /exactly one source row/);
  for (const effectId of ['S22_3PC_FUSION', 'S26_5PC_SPECTRO_STACK', 'S11_5PC_CR']) {
    assert.throws(() => activateSonataDamageWindow({ ...activation(), effectId }), /No reviewed Sonata damage-window/);
  }
});

test('unrepresentable Sonata windows and invalid query timestamps fail closed', () => {
  for (const atSeconds of [-1, Number.NaN, Number.MAX_VALUE]) {
    assert.throws(() => activateSonataDamageWindow({ ...activation(), event: { ...activation().event, atSeconds } }), /time|expiration/);
  }
  assert.throws(() => isSonataDamageWindowActive(activateSonataDamageWindow(activation())!, query(Number.NaN)), /query time/);
});

test('one proven Heavy damage event supplies separate weapon amplification and Sonata Echo crit contributions', () => {
  const event = activation().event;
  const sonata = activateSonataDamageWindow(activation())!;
  const weapon = activateWeaponDamageWindow({ effectId: 'LU-ECHO-AMP', selectedWeapon: { id: 'lux-and-umbra', rank: 1 }, wielderId: 'galbrena', event })!;
  assert.equal(sonata.statOrEffect, 'Echo Skill CRIT Rate');
  assert.equal(weapon.statOrEffect, 'Echo Skill DMG Amplification');
  assert.ok(isSonataDamageWindowActive(sonata, query(3)));
  const hit = evaluateEchoActiveHit({ echoId: 'echo-60001065', attackId: 'FLEURDELYS_WINDCLEAVER_SUMMON', rank: 5,
    componentIndex: 0, landedHitCount: 1, snapshot: {
      damageClass: 'ECHO', element: 'Aero', scalingStat: 'ATK', totalScalingStat: 1000,
      damageBonus: 0, amplification: weapon.value, critRate: sonata.value, critDamage: 1.5,
      defenseMultiplier: 1, resistanceMultiplier: 1, damageReduction: 0,
    } });
  assert.equal(hit.expectedDamage, 273.6 * 1.24 * 1.1);
  // Synthetic arithmetic only; no loadout choice, Fusion joint-state bonus or rotation is inferred.
});
