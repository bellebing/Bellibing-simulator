import assert from 'node:assert/strict';
import test from 'node:test';

import { AUGUSTA_STANDARD_ACTIONS } from '../src/characters/augustaStandard.ts';
import { ECHO_ATTACK_PROFILES } from '../src/data/echoAttacks.ts';
import { totalMotionValue } from '../src/echoAttackDomain.ts';
import { createEchoAttackRegistry } from '../src/echoAttackRegistry.ts';

const registry = createEchoAttackRegistry(ECHO_ATTACK_PROFILES);

test('Echo attack catalog contains only source-explicit executable profiles', () => {
  assert.equal(ECHO_ATTACK_PROFILES.length, 6);
  assert.equal(registry.attackById.size, 8);
  assert.ok(registry.byEchoId.has('echo-60000375'));
  assert.ok(registry.byEchoId.has('echo-60000485'));
  assert.ok(registry.byEchoId.has('echo-60000605'));
  assert.ok(registry.byEchoId.has('echo-60000885'));
  assert.ok(registry.byEchoId.has('echo-60001065'));
  assert.ok(registry.byEchoId.has('echo-60001215'));
});

test('Bell-Borne Rank-5 protection blast is exact 145.92% DEF Glacio damage', () => {
  const profile = registry.byEchoId.get('echo-60000375')!;
  const attack = profile.attacks[0]!;
  assert.equal(profile.cooldownSeconds, 20);
  assert.equal(attack.attackId, 'BELL_BORNE_PROTECTION_BLAST');
  assert.equal(attack.element, 'Glacio');
  assert.equal(attack.scalingStat, 'DEF');
  assert.equal(totalMotionValue(attack), 1.4592);
});

test('Mech Abomination Rank-5 attack facts preserve direct and Outro-classified Waste damage', () => {
  const profile = registry.byEchoId.get('echo-60000485')!;
  const direct = profile.attacks.find((row) => row.attackId === 'MECH_ABOMINATION_FRONT_STRIKE')!;
  const waste = profile.attacks.find((row) => row.attackId === 'MECH_ABOMINATION_WASTE')!;
  assert.equal(profile.cooldownSeconds, 20);
  assert.equal(profile.attacks.length, 2);
  assert.equal(direct.element, 'Electro');
  assert.equal(direct.scalingStat, 'ATK');
  assert.equal(totalMotionValue(direct), 0.4864);
  assert.equal(waste.sourceDamageClass, 'OUTRO');
  assert.deepEqual(waste.components, [
    { motionValuePerHit: 3.2, hits: 1 },
    { motionValuePerHit: 1.6, hits: 1 },
  ]);
  assert.equal(totalMotionValue(waste), 4.8);
});

test('Fallacy Rank-5 normal activation is exact one-hit 15.86% max-HP Spectro damage', () => {
  const profile = registry.byEchoId.get('echo-60000605')!;
  const attack = profile.attacks[0]!;
  assert.equal(profile.cooldownSeconds, 20);
  assert.equal(profile.attacks.length, 1);
  assert.equal(attack.attackId, 'FALLACY_INITIAL_BLAST');
  assert.equal(attack.trigger, 'ACTIVE_CAST');
  assert.equal(attack.element, 'Spectro');
  assert.equal(attack.scalingStat, 'HP');
  assert.equal(attack.components.length, 1);
  assert.equal(attack.components[0]?.hits, 1);
  assert.ok(Math.abs(totalMotionValue(attack) - 0.1586) < 1e-12);
  assert.equal(profile.attacks.some((row) => row.attackId.includes('HOLD') || row.attackId.includes('RELEASE')), false);
});

test('Nightmare Thundering Mephis Rank-5 active strike is exact one-hit 405% ATK Electro damage', () => {
  const profile = registry.byEchoId.get('echo-60000885')!;
  const attack = profile.attacks[0]!;
  assert.equal(profile.cooldownSeconds, 25);
  assert.equal(profile.attacks.length, 1);
  assert.equal(attack.attackId, 'NIGHTMARE_THUNDERING_MEPHIS_ACTIVE_STRIKE');
  assert.equal(attack.trigger, 'ACTIVE_CAST');
  assert.equal(attack.element, 'Electro');
  assert.equal(attack.scalingStat, 'ATK');
  assert.deepEqual(attack.components, [{ motionValuePerHit: 4.05, hits: 1 }]);
  assert.equal(totalMotionValue(attack), 4.05);
});

test('Fleurdelys Rank-5 summon is exact 27.36% x8 + 136.80% ATK Aero damage', () => {
  const profile = registry.byEchoId.get('echo-60001065')!;
  const attack = profile.attacks[0]!;
  assert.equal(profile.cooldownSeconds, 20);
  assert.equal(profile.attacks.length, 1);
  assert.equal(attack.attackId, 'FLEURDELYS_WINDCLEAVER_SUMMON');
  assert.equal(attack.trigger, 'ACTIVE_CAST');
  assert.equal(attack.element, 'Aero');
  assert.equal(attack.scalingStat, 'ATK');
  assert.deepEqual(attack.components, [
    { motionValuePerHit: 0.2736, hits: 8 },
    { motionValuePerHit: 1.368, hits: 1 },
  ]);
  assert.ok(Math.abs(totalMotionValue(attack) - 3.5568) < 1e-12);
});

test('False Sovereign active Rank-5 cast is 55.35% x4 = exact Augusta 2.214 motion value', () => {
  const profile = registry.byEchoId.get('echo-60001215')!;
  const active = profile.attacks.find((row) => row.attackId === 'FALSE_SOV_ACTIVE_SPIN')!;
  assert.equal(active.components[0]?.motionValuePerHit, 0.5535);
  assert.equal(active.components[0]?.hits, 4);
  assert.ok(Math.abs(totalMotionValue(active) - 2.214) < 1e-12);

  const augustaAction = AUGUSTA_STANDARD_ACTIONS.find((row) => row.step === '14')!;
  assert.equal(augustaAction.actor, 'The False Sovereign');
  assert.ok(Math.abs(totalMotionValue(active) - augustaAction.motionValue) < 1e-12);
});

test('False Sovereign Intro summon is exact Augusta 4.05 motion value', () => {
  const profile = registry.byEchoId.get('echo-60001215')!;
  const intro = profile.attacks.find((row) => row.attackId === 'FALSE_SOV_INTRO_SUMMON')!;
  assert.equal(totalMotionValue(intro), 4.05);

  const augustaAction = AUGUSTA_STANDARD_ACTIONS.find((row) => row.step === '1E')!;
  assert.equal(augustaAction.actor, 'The False Sovereign');
  assert.equal(totalMotionValue(intro), augustaAction.motionValue);
});

test('False Sovereign charge/cooldown mechanics are stored as Echo facts, not rotation assumptions', () => {
  const profile = registry.byEchoId.get('echo-60001215')!;
  assert.equal(profile.cooldownSeconds, 8);
  assert.equal(profile.startingCharges, 2);
  assert.equal(profile.maxCharges, 2);
  assert.equal(profile.rechargeSeconds, 8);
});

test('Echo attack layer contains no buffs, build recommendations or team relationships', () => {
  for (const profile of ECHO_ATTACK_PROFILES) {
    for (const forbidden of ['statOrEffect', 'buffValue', 'characterId', 'teamProfileId', 'rotationProfileId', 'recommendedFor']) {
      assert.equal(Object.hasOwn(profile, forbidden), false, `${profile.echoId} leaked ${forbidden}`);
    }
  }
});

test('registry rejects dangling Echo IDs and invalid damage components', () => {
  const base = ECHO_ATTACK_PROFILES[0]!;
  assert.throws(
    () => createEchoAttackRegistry([{ ...base, echoId: 'echo-missing' }]),
    /Unknown Echo attack profile id/,
  );

  assert.throws(
    () => createEchoAttackRegistry([{
      ...base,
      attacks: [{
        ...base.attacks[0]!,
        attackId: 'BROKEN_ATTACK',
        components: [{ motionValuePerHit: 0, hits: 1 }],
      }],
    }]),
    /invalid motion value/,
  );
});
