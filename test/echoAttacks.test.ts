import assert from 'node:assert/strict';
import test from 'node:test';

import { AUGUSTA_STANDARD_ACTIONS } from '../src/characters/augustaStandard.ts';
import { ECHO_ATTACK_PROFILES } from '../src/data/echoAttacks.ts';
import { totalMotionValue } from '../src/echoAttackDomain.ts';
import { createEchoAttackRegistry } from '../src/echoAttackRegistry.ts';

const registry = createEchoAttackRegistry(ECHO_ATTACK_PROFILES);

test('Echo attack foundation begins with the exact Augusta golden Echo only', () => {
  assert.equal(ECHO_ATTACK_PROFILES.length, 1);
  assert.ok(registry.byEchoId.has('echo-60001215'));
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
      echoId: 'echo-60001215',
      attacks: [{
        ...base.attacks[0]!,
        attackId: 'BROKEN_ATTACK',
        components: [{ motionValuePerHit: 0, hits: 4 }],
      }],
    }]),
    /invalid motion value/,
  );
});
