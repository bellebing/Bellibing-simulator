import assert from 'node:assert/strict';
import test from 'node:test';

import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { getDefaultBuildPreset } from '../src/profileRegistry.ts';

test('Cartethyia Aero Erosion default resolves the reviewed source context', () => {
  const resolved = getDefaultBuildPreset(PROFILE_REGISTRY, 'cartethyia');
  assert.ok(resolved);

  assert.equal(resolved.preset.id, 'cartethyia-aero-erosion');
  assert.equal(resolved.weaponRecommendation.defaultWeaponId, 'defiers-thorn');
  assert.deepEqual(resolved.echoLoadout.sonataSetIds, ['sonata-17']);
  assert.equal(resolved.echoLoadout.mainEchoId, 'echo-60001065');
  assert.deepEqual(
    resolved.echoLoadout.slots.map((slot) => [
      slot.cost,
      slot.primaryMainStats.map((option) => [option.stat, option.priority]),
    ]),
    [
      [4, [['CRIT Rate', 1]]],
      [4, [['CRIT DMG', 1]]],
      [1, [['HP%', 1]]],
      [1, [['HP%', 1]]],
      [1, [['HP%', 1]]],
    ],
  );
  assert.deepEqual(resolved.statTarget.targetRules.map((rule) => [rule.stat, rule.priority]), [
    ['Energy Regen', 1],
    ['CRIT Rate', 2],
    ['CRIT DMG', 2],
    ['HP%', 3],
    ['Basic Attack DMG', 4],
    ['Liberation DMG', 4],
    ['Flat HP', 5],
  ]);
  assert.deepEqual(resolved.statTarget.gates, [{
    stat: 'Energy Regen Total',
    minimum: 1.1,
    notes: 'Current Prydwen endgame target is 110%+ Energy Regen.',
  }]);
  assert.deepEqual(resolved.team.members.map((member) => [member.characterId, member.role]), [
    ['cartethyia', 'DPS'],
    ['ciaccona', 'SUB_DPS'],
    ['rover-aero', 'SUPPORT'],
  ]);
  assert.equal(resolved.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(resolved.rotation.engineModelId, undefined);
  assert.equal(resolved.rotation.sourceSequence[0], 'Intro - Cartethyia');
  assert.equal(resolved.rotation.sourceSequence.at(-1), 'Outro');
});

test('Ciaccona Cartethyia Aero default preserves source main-stat alternatives and executable reviewed rotation', () => {
  const resolved = getDefaultBuildPreset(PROFILE_REGISTRY, 'ciaccona');
  assert.ok(resolved);

  assert.equal(resolved.preset.id, 'ciaccona-cartethyia-aero');
  assert.equal(resolved.weaponRecommendation.defaultWeaponId, 'woodland-aria');
  assert.deepEqual(resolved.echoLoadout.sonataSetIds, ['sonata-16']);
  assert.equal(resolved.echoLoadout.mainEchoId, 'echo-60001135');
  assert.deepEqual(resolved.echoLoadout.slots[0]?.primaryMainStats, [
    { stat: 'CRIT Rate', priority: 1 },
    { stat: 'CRIT DMG', priority: 1 },
  ]);
  assert.deepEqual(resolved.echoLoadout.slots[2]?.primaryMainStats, [
    { stat: 'Aero DMG', priority: 1 },
    { stat: 'ATK%', priority: 2 },
  ]);
  assert.deepEqual(resolved.statTarget.targetRules.map((rule) => [rule.stat, rule.priority]), [
    ['Energy Regen', 1],
    ['CRIT Rate', 2],
    ['CRIT DMG', 2],
    ['ATK%', 3],
    ['Flat ATK', 4],
  ]);
  assert.deepEqual(resolved.statTarget.gates, [{
    stat: 'Energy Regen Total',
    minimum: 1.15,
    notes: 'Current Prydwen endgame target is 115%+ Energy Regen.',
  }]);
  assert.equal(resolved.rotation.executionStatus, 'ENGINE_MODELED');
  assert.equal(resolved.rotation.engineModelId, 'CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1');
  assert.ok(resolved.rotation.sourceSequence.includes('Forte: Heavy Attack: Quadruple Downbeat'));
  assert.equal(resolved.rotation.sourceSequence.at(-1), 'Outro');
  assert.equal(resolved.rotation.sourceSequence.some((step) => step.includes('Symphonic Poem: Tonic')), false);
});
