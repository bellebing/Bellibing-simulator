import test from 'node:test';
import assert from 'node:assert/strict';

import {
  activateSonataDamageWindow,
  isSonataDamageWindowActive,
  SONATA_DAMAGE_WINDOW_CONTRACTS,
  validateSonataDamageWindowContracts,
} from '../src/combat/sonataDamageWindowAdapter.ts';
import {
  activateWeaponDamageWindow,
  isWeaponDamageWindowActive,
  validateWeaponDamageWindowContracts,
  WEAPON_DAMAGE_WINDOW_CONTRACTS,
} from '../src/combat/weaponDamageWindowAdapter.ts';
import { PROFILE_EXECUTION_WORK_QUEUE } from '../src/profileExecutionWorkQueue.ts';

test('Solsworn SCIP-AERO-DEF has one exact Echo Skill damage window contract', () => {
  assert.deepEqual(validateWeaponDamageWindowContracts(), []);
  assert.deepEqual(WEAPON_DAMAGE_WINDOW_CONTRACTS, [{
    effectId: 'SCIP-AERO-DEF',
    expectedSourceTrigger: 'Deal Echo Skill DMG',
    expectedConditions: ['Damage is Aero DMG'],
    triggerEvents: ['ECHO_SKILL_DAMAGE'],
  }]);

  const window = activateWeaponDamageWindow({
    effectId: 'SCIP-AERO-DEF',
    rank: 1,
    wielderId: 'sigrika',
    event: { kind: 'ECHO_SKILL_DAMAGE', actorId: 'sigrika', atSeconds: 7.5 },
  });
  assert.deepEqual(window, {
    adapterId: 'weapon-damage-timed-self-window-v1',
    effectId: 'SCIP-AERO-DEF',
    weaponId: 'solsworn-ciphers',
    actorId: 'sigrika',
    statOrEffect: 'Aero DMG DEF Ignore',
    value: 0.10,
    valueUnit: 'DECIMAL_MULTIPLIER',
    conditions: ['Damage is Aero DMG'],
    startedAtSeconds: 7.5,
    expiresAtSeconds: 13.5,
  });
  assert.ok(window);
  assert.equal(isWeaponDamageWindowActive(window, 13.499), true);
  assert.equal(isWeaponDamageWindowActive(window, 13.5), false);

  assert.equal(activateWeaponDamageWindow({
    effectId: 'SCIP-AERO-DEF',
    rank: 1,
    wielderId: 'sigrika',
    event: { kind: 'ECHO_SKILL_DAMAGE', actorId: 'other-character', atSeconds: 7.5 },
  }), null);
});

test('Sound of True Name 5-piece windows open from the same explicit Echo Skill damage event', () => {
  assert.deepEqual(validateSonataDamageWindowContracts(), []);
  assert.deepEqual(SONATA_DAMAGE_WINDOW_CONTRACTS.map((row) => row.effectId), [
    'S29_5PC_ECHO_CR',
    'S29_5PC_AERO',
  ]);

  const event = { kind: 'ECHO_SKILL_DAMAGE' as const, actorId: 'sigrika', atSeconds: 9 };
  const crit = activateSonataDamageWindow({
    effectId: 'S29_5PC_ECHO_CR',
    ownerId: 'sigrika',
    event,
  });
  const aero = activateSonataDamageWindow({
    effectId: 'S29_5PC_AERO',
    ownerId: 'sigrika',
    event,
  });

  assert.deepEqual(crit, {
    adapterId: 'sonata-damage-timed-self-window-v1',
    effectId: 'S29_5PC_ECHO_CR',
    sonataSetId: 'sonata-29',
    actorId: 'sigrika',
    statOrEffect: 'Echo Skill CRIT Rate',
    value: 0.20,
    startedAtSeconds: 9,
    expiresAtSeconds: 14,
  });
  assert.deepEqual(aero, {
    adapterId: 'sonata-damage-timed-self-window-v1',
    effectId: 'S29_5PC_AERO',
    sonataSetId: 'sonata-29',
    actorId: 'sigrika',
    statOrEffect: 'Aero DMG Bonus',
    value: 0.15,
    startedAtSeconds: 9,
    expiresAtSeconds: 14,
  });
  assert.ok(crit && aero);
  assert.equal(isSonataDamageWindowActive(crit, 13.999), true);
  assert.equal(isSonataDamageWindowActive(aero, 14), false);

  assert.equal(activateSonataDamageWindow({
    effectId: 'S29_5PC_AERO',
    ownerId: 'sigrika',
    event: { ...event, actorId: 'other-character' },
  }), null);
});

test('Sigrika equipment and Qiuyuan incoming edges become primitive-covered without closing timeline dependencies', () => {
  const byId = new Map(
    PROFILE_EXECUTION_WORK_QUEUE.edges
      .filter((row) => row.presetId === 'sigrika-standard')
      .map((row) => [row.pendingExecutionId, row]),
  );

  assert.equal(byId.get('weapon:solsworn-ciphers:SCIP-ECHO-AMP:echo-intro-cast-window-adapter')?.semanticStatus, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(byId.get('weapon:solsworn-ciphers:SCIP-ECHO-AMP:echo-intro-cast-window-adapter')?.primitiveId, 'weapon-cast-timed-self-window-v1');
  assert.equal(byId.get('weapon:solsworn-ciphers:SCIP-AERO-DEF:echo-skill-damage-window-adapter')?.semanticStatus, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(byId.get('weapon:solsworn-ciphers:SCIP-AERO-DEF:echo-skill-damage-window-adapter')?.primitiveId, 'weapon-damage-timed-self-window-v1');
  assert.equal(byId.get('sonata:sonata-29:S29_5PC_ECHO_CR:echo-skill-damage-window-adapter')?.semanticStatus, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(byId.get('sonata:sonata-29:S29_5PC_ECHO_CR:echo-skill-damage-window-adapter')?.primitiveId, 'sonata-damage-timed-self-window-v1');
  assert.equal(byId.get('sonata:sonata-29:S29_5PC_AERO:echo-skill-damage-window-adapter')?.semanticStatus, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(byId.get('sonata:sonata-29:S29_5PC_AERO:echo-skill-damage-window-adapter')?.primitiveId, 'sonata-damage-timed-self-window-v1');
  assert.equal(byId.get('team:qiuyuan:outro-echo-skill-amplification-incoming-state-adapter')?.semanticStatus, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(byId.get('team:qiuyuan:outro-echo-skill-amplification-incoming-state-adapter')?.primitiveId, 'character-outro-incoming-transfer-v1');

  assert.equal(byId.get('team:ciaccona:solo-concert-aero-bonus-incoming-state-adapter')?.semanticStatus, 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING');
});
