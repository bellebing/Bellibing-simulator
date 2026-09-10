import assert from 'node:assert/strict';
import test from 'node:test';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { activateWeaponHealingWindow, isWeaponHealingWindowActive, listWeaponHealingWindowSupport, readWeaponHealingWindowFact } from '../src/combat/weaponHealingWindowAdapter.ts';
import { buildMornyeHealTriggeredWindows } from '../src/combat/mornyeSupportEvents.ts';

const activation = () => ({
  effectId: 'SC-TEAM-CD', selectedWeapon: { id: 'starfield-calibrator', rank: 1 }, wielderId: 'mornye',
  teamMemberIds: ['mornye', 'aemeath', 'the-shorekeeper'],
  event: { kind: 'HEAL_APPLIED' as const, healerId: 'mornye', targetId: 'aemeath', atSeconds: 2,
    sourceTriggerQualification: 'VERIFIED_HEAL_ALLY' as const },
});
const query = (atSeconds: number) => ({ actorId: 'aemeath', atSeconds, sameTimestampOrder: 'UNKNOWN' as const });

test('applied-heal family covers actual Mornye and Rover Aero weapon selections without new source facts', () => {
  const support = listWeaponHealingWindowSupport();
  assert.equal(support.length, 2);
  const weapons = new Set(support.map((row) => row.weaponId));
  assert.deepEqual(PROFILE_CATALOGS.weaponRecommendations.filter((profile) => profile.options.some((option) => weapons.has(option.weaponId)))
    .map((row) => row.characterId).sort(), ['mornye', 'rover-aero']);
  for (const row of support) {
    const source = WEAPON_EFFECT_CATALOG.find((effect) => effect.effectId === row.effectId)!;
    for (let rank = 1; rank <= 5; rank++) {
      const fact = readWeaponHealingWindowFact(row.effectId, rank);
      assert.equal(fact.value, source.rankValues[rank - 1]);
      assert.equal(fact.durationSeconds, source.durationSeconds);
      assert.equal(fact.appliesTo, source.appliesTo);
    }
    assert.equal(Object.hasOwn(row, 'rankValues'), false);
  }
});

test('source-qualified applied healing produces selected-team or wielder-only scope', () => {
  const team = activateWeaponHealingWindow(activation())!;
  assert.deepEqual(team.recipientIds, ['mornye', 'aemeath', 'the-shorekeeper']);
  assert.equal(team.value, 0.20);
  assert.equal(team.expiresAtSeconds, 6);
  const self = activateWeaponHealingWindow({ ...activation(), effectId: 'BPP-SKILL',
    selectedWeapon: { id: 'bloodpacts-pledge', rank: 5 }, wielderId: 'rover-aero', teamMemberIds: ['rover-aero', 'cartethyia'],
    event: { ...activation().event, healerId: 'rover-aero', targetId: 'cartethyia' } })!;
  assert.deepEqual(self.recipientIds, ['rover-aero']);
  assert.equal(self.statOrEffect, 'Resonance Skill DMG');
  assert.equal(self.value, 0.26);
  assert.equal(self.expiresAtSeconds, 8);
  assert.equal(isWeaponHealingWindowActive(self, { ...query(3), actorId: 'cartethyia' }), false);
  assert.equal(isWeaponHealingWindowActive(self, { ...query(3), actorId: 'rover-aero' }), true);
});

test('a healing Skill cast shield or unproven applied heal cannot silently trigger these effects', () => {
  for (const kind of ['RESONANCE_SKILL_CAST', 'SHIELD_APPLIED']) {
    assert.throws(() => activateWeaponHealingWindow({ ...activation(), event: { ...activation().event, kind: kind as never } }), /Actual source-qualified applied healing/);
  }
  assert.throws(() => activateWeaponHealingWindow({ ...activation(), event: { ...activation().event, sourceTriggerQualification: 'UNKNOWN' } }), /source-qualified applied healing/);
  assert.equal(activateWeaponHealingWindow({ ...activation(), event: { ...activation().event, healerId: 'the-shorekeeper' } }), null);
  assert.equal(activateWeaponHealingWindow({ ...activation(), event: { ...activation().event, targetId: 'outsider' } }), null);
  assert.throws(() => activateWeaponHealingWindow({ ...activation(), effectId: 'SSY-TEAM-ATK' }), /No reviewed applied-heal weapon contract/);
});

test('healing window selection is explicit and detached from later candidate edits', () => {
  assert.throws(() => activateWeaponHealingWindow({ ...activation(), selectedWeapon: { id: 'stellar-symphony', rank: 1 } }), /exact selected weapon/);
  for (const rank of [0, 6, 1.5, undefined as never]) {
    assert.throws(() => activateWeaponHealingWindow({ ...activation(), selectedWeapon: { id: 'starfield-calibrator', rank } }), /Explicit weapon rank/);
  }
  for (const teamMemberIds of [[], ['aemeath'], ['mornye', 'mornye'], ['mornye', ' ']]) {
    assert.throws(() => activateWeaponHealingWindow({ ...activation(), teamMemberIds }), /Explicit unique selected team/);
  }
  const input = activation();
  const window = activateWeaponHealingWindow(input)!;
  input.teamMemberIds[1] = 'edited';
  assert.deepEqual(window.recipientIds, ['mornye', 'aemeath', 'the-shorekeeper']);
  assert.ok(Object.isFrozen(window));
  assert.ok(Object.isFrozen(window.recipientIds));
});

test('same-timestamp healing order and exact expiry are explicit without repeated-window refresh', () => {
  const first = activateWeaponHealingWindow(activation())!;
  assert.throws(() => isWeaponHealingWindowActive(first, query(2)), /ordering is unresolved/);
  assert.equal(isWeaponHealingWindowActive(first, { ...query(2), sameTimestampOrder: 'BEFORE_TRIGGER' }), false);
  assert.equal(isWeaponHealingWindowActive(first, { ...query(2), sameTimestampOrder: 'AFTER_TRIGGER' }), true);
  assert.equal(isWeaponHealingWindowActive(first, query(5.99)), true);
  assert.equal(isWeaponHealingWindowActive(first, query(6)), false);
  const later = activateWeaponHealingWindow({ ...activation(), event: { ...activation().event, atSeconds: 5 } })!;
  assert.equal(first.expiresAtSeconds, 6);
  assert.equal(later.expiresAtSeconds, 9);
});

test('source identity scope prerequisites and stack/cooldown drift cannot enter applied-heal execution', () => {
  for (const patch of [{ appliesTo: 'SELF' }, { trigger: 'Cast Resonance Skill' }, { valueUnit: 'FLAT_AMOUNT' },
    { maxStacks: 2 }, { triggerCooldownSeconds: 1 }, { durationSeconds: null }, { rankValues: [0.2] }, { conditions: ['Unknown requirement'] }]) {
    const catalog = WEAPON_EFFECT_CATALOG.map((row) => row.effectId === 'SC-TEAM-CD' ? { ...row, ...patch } as never : row);
    assert.throws(() => activateWeaponHealingWindow({ ...activation(), catalog }), /source contract drift/);
  }
  for (const atSeconds of [-1, Number.NaN, Number.MAX_VALUE]) {
    assert.throws(() => activateWeaponHealingWindow({ ...activation(), event: { ...activation().event, atSeconds } }), /time|expiration/);
  }
});

test('Mornye retains its exact legacy R1 support-window payload while reusing the shared fact reader', () => {
  const [crit, atk] = buildMornyeHealTriggeredWindows({ atSeconds: 10, offTuneBuildupRatePercent: 100 });
  assert.deepEqual(crit, { eventId: 'mornye-heal-starfield-team-crit-dmg', sourceId: 'SC-TEAM-CD', sourceKind: 'WEAPON',
    effect: 'CRIT DMG', appliesTo: 'TEAM', value: 0.20, unit: 'DECIMAL_MULTIPLIER',
    startedAtSeconds: 10, expiresAtSeconds: 14, inputRequired: null });
  assert.equal(atk.value, 0.20);
  assert.equal(atk.expiresAtSeconds, 14);
  const [, unknown] = buildMornyeHealTriggeredWindows({ atSeconds: 10 });
  assert.equal(unknown.value, null);
});
