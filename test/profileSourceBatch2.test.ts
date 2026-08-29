import assert from 'node:assert/strict';
import test from 'node:test';

import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { getDefaultBuildPreset } from '../src/profileRegistry.ts';

test('Rover Aero Cartethyia/Ciaccona support default preserves the reviewed source context', () => {
  const resolved = getDefaultBuildPreset(PROFILE_REGISTRY, 'rover-aero');
  assert.ok(resolved);

  assert.equal(resolved.preset.id, 'rover-aero-cartethyia-ciaccona');
  assert.equal(resolved.weaponRecommendation.defaultWeaponId, 'bloodpacts-pledge');
  assert.deepEqual(resolved.echoLoadout.sonataSetIds, ['sonata-17']);
  assert.equal(resolved.echoLoadout.mainEchoId, 'echo-60001065');
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
    ['Skill DMG', 4],
    ['Flat ATK', 5],
  ]);
  assert.deepEqual(resolved.statTarget.gates, [{
    stat: 'Energy Regen Total',
    minimum: 1.38,
    notes: 'Current source gives 128%-138%; the reviewed Cartethyia + Ciaccona context uses the high end, 138%. Bloodpact’s Pledge supplies enough ER that source guidance does not require ER substats in this setup.',
  }]);
  assert.equal(resolved.team.id, 'cartethyia-ciaccona-rover-aero');
  assert.equal(resolved.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(resolved.rotation.engineModelId, undefined);
  assert.equal(resolved.rotation.sourceSequence[0], 'Intro');
  assert.ok(resolved.rotation.sourceSequence.includes('Echo: Reminiscence: Fleurdelys (before switching out)'));
  assert.equal(resolved.rotation.sourceSequence.at(-1), 'Forte: Unbound Flow P2 (automatic off-field follow-up)');
});

test('Iuno Augusta Hybrid default keeps Sub DPS Moonlit context source-only', () => {
  const resolved = getDefaultBuildPreset(PROFILE_REGISTRY, 'iuno');
  assert.ok(resolved);

  assert.equal(resolved.preset.id, 'iuno-augusta-hybrid');
  assert.equal(resolved.weaponRecommendation.defaultWeaponId, 'moongazers-sigil');
  assert.deepEqual(resolved.echoLoadout.sonataSetIds, ['sonata-8']);
  assert.equal(resolved.echoLoadout.mainEchoId, 'echo-60000525');
  assert.deepEqual(resolved.echoLoadout.slots[0]?.primaryMainStats, [
    { stat: 'CRIT Rate', priority: 1 },
    { stat: 'CRIT DMG', priority: 1 },
  ]);
  assert.deepEqual(resolved.statTarget.targetRules.map((rule) => [rule.stat, rule.priority]), [
    ['Energy Regen', 1],
    ['CRIT Rate', 2],
    ['CRIT DMG', 2],
    ['Liberation DMG', 3],
    ['ATK%', 4],
    ['Flat ATK', 5],
  ]);
  assert.deepEqual(resolved.statTarget.gates, [{
    stat: 'Energy Regen Total',
    minimum: 1.2,
    preferred: 1.3,
    notes: 'Current Hybrid/Sub DPS source band is 120%-130%+ ER and is estimated in an Augusta team context.',
  }]);
  assert.equal(resolved.team.id, 'augusta-iuno-shorekeeper');
  assert.equal(resolved.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(resolved.rotation.engineModelId, undefined);
  assert.deepEqual(resolved.rotation.sourceSequence.slice(0, 3), [
    'Intro',
    'Echo: Impermanence Heron (cancel with Ultimate)',
    'Ultimate',
  ]);
  assert.equal(resolved.rotation.sourceSequence.at(-1), 'Outro');
});

test('The Shorekeeper Augusta support default preserves source ER semantics and Fallacy rotation', () => {
  const resolved = getDefaultBuildPreset(PROFILE_REGISTRY, 'the-shorekeeper');
  assert.ok(resolved);

  assert.equal(resolved.preset.id, 'shorekeeper-augusta-support');
  assert.equal(resolved.weaponRecommendation.defaultWeaponId, 'stellar-symphony');
  assert.deepEqual(resolved.echoLoadout.sonataSetIds, ['sonata-7']);
  assert.equal(resolved.echoLoadout.mainEchoId, 'echo-60000605');
  assert.deepEqual(resolved.echoLoadout.slots[0]?.primaryMainStats, [
    { stat: 'CRIT DMG', priority: 1 },
    { stat: 'HP%', priority: 2 },
  ]);
  assert.deepEqual(resolved.echoLoadout.slots[2]?.primaryMainStats, [
    { stat: 'Energy Regen', priority: 1 },
    { stat: 'Spectro DMG', priority: 1 },
  ]);
  assert.deepEqual(resolved.statTarget.targetRules.map((rule) => [rule.stat, rule.priority]), [
    ['Energy Regen', 1],
    ['CRIT DMG', 2],
    ['Liberation DMG', 3],
    ['HP%', 4],
    ['CRIT Rate', 5],
    ['Flat HP', 6],
    ['ATK%', 7],
    ['Flat ATK', 7],
  ]);
  assert.deepEqual(resolved.statTarget.gates, [{
    stat: 'Energy Regen Total',
    minimum: 2.3,
    notes: 'Current source target is 230% ER before the +10% Fallacy of No Return Echo effect and Shorekeeper’s +10% passive contribution.',
  }]);
  assert.equal(resolved.team.id, 'augusta-iuno-shorekeeper');
  assert.equal(resolved.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(resolved.rotation.engineModelId, undefined);
  assert.ok(resolved.rotation.sourceSequence.includes('Echo: Fallacy of No Return'));
  assert.equal(resolved.rotation.sourceSequence.at(-1), 'Outro');
});
