import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUGUSTA_LIVE_CURRENT_2026_08_21,
  AUGUSTA_LIVE_EXPECTED_2026_08_21,
  evaluateAugustaStandardRotation,
} from '../src/characters/augustaStandard.ts';
import { defenseMultiplier, resistanceMultiplier } from '../src/combat/damageKernel.ts';

const closeTo = (actual: number, expected: number, tolerance = 1e-8) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
};

test('verified fixed-target DEF and RES multipliers match V9.15 kernel', () => {
  closeTo(defenseMultiplier({ attackerLevel: 90, enemyDefense: 1592 }), 0.4884318766066838, 1e-15);
  closeTo(defenseMultiplier({ attackerLevel: 90, enemyDefense: 1592, defIgnore: 0.36 }), 0.5986891857827074, 1e-15);
  closeTo(resistanceMultiplier(0.2), 0.8, 1e-15);
});

test('Augusta action-event pre-action stack ramp matches V9.15 exactly', () => {
  const result = evaluateAugustaStandardRotation(AUGUSTA_LIVE_CURRENT_2026_08_21);
  assert.deepEqual(
    result.actions.map(({ step, covStacks, wanLightStacks, weaponDefStacks, shieldEventAfter }) => ({
      step, covStacks, wanLightStacks, weaponDefStacks, shieldEventAfter,
    })),
    [
      { step: '1', covStacks: 0, wanLightStacks: 0, weaponDefStacks: 0, shieldEventAfter: true },
      { step: '1E', covStacks: 1, wanLightStacks: 1, weaponDefStacks: 1, shieldEventAfter: false },
      { step: '2', covStacks: 1, wanLightStacks: 1, weaponDefStacks: 1, shieldEventAfter: true },
      { step: '3', covStacks: 2, wanLightStacks: 2, weaponDefStacks: 2, shieldEventAfter: true },
      { step: '4', covStacks: 3, wanLightStacks: 3, weaponDefStacks: 3, shieldEventAfter: true },
      { step: '5', covStacks: 4, wanLightStacks: 4, weaponDefStacks: 4, shieldEventAfter: true },
      { step: '6', covStacks: 5, wanLightStacks: 5, weaponDefStacks: 5, shieldEventAfter: true },
      { step: '7', covStacks: 5, wanLightStacks: 6, weaponDefStacks: 5, shieldEventAfter: true },
      { step: '8', covStacks: 5, wanLightStacks: 7, weaponDefStacks: 5, shieldEventAfter: true },
      { step: '9', covStacks: 5, wanLightStacks: 8, weaponDefStacks: 5, shieldEventAfter: true },
      { step: '10', covStacks: 5, wanLightStacks: 9, weaponDefStacks: 5, shieldEventAfter: true },
      { step: '11', covStacks: 5, wanLightStacks: 10, weaponDefStacks: 5, shieldEventAfter: false },
      { step: '12', covStacks: 5, wanLightStacks: 10, weaponDefStacks: 5, shieldEventAfter: true },
      { step: '13', covStacks: 5, wanLightStacks: 10, weaponDefStacks: 5, shieldEventAfter: true },
      { step: '14', covStacks: 5, wanLightStacks: 10, weaponDefStacks: 5, shieldEventAfter: false },
      { step: '15', covStacks: 5, wanLightStacks: 10, weaponDefStacks: 5, shieldEventAfter: false },
    ],
  );
});

test('Augusta live Current action damages match V9.15 modeled action-event bridge', () => {
  const result = evaluateAugustaStandardRotation(AUGUSTA_LIVE_CURRENT_2026_08_21);
  const expected = [
    9770.116053876909,
    21455.939647970194,
    5442.615205705625,
    47760.84083922616,
    41773.45800174336,
    7408.983629931441,
    65098.86200663251,
    171988.1036203971,
    21536.481226128744,
    22139.695671944748,
    144038.2900164991,
    0,
    182158.59967481683,
    202403.5341605231,
    16493.08247701834,
    0,
  ];
  result.actions.forEach((row, index) => closeTo(row.damage, expected[index], 1e-7));
});

test('Augusta live Current total and DPS are exact V9.15 parity', () => {
  const result = evaluateAugustaStandardRotation(AUGUSTA_LIVE_CURRENT_2026_08_21);
  closeTo(result.rotationDamage, 959468.6022324142, 1e-7);
  closeTo(result.personalRotationDps, 85896.92052214989, 1e-8);
  assert.equal(result.erGate, 'PASS');
});

test('Augusta live Expected total and DPS are exact V9.15 parity while ER stays invalid', () => {
  const result = evaluateAugustaStandardRotation(AUGUSTA_LIVE_EXPECTED_2026_08_21);
  closeTo(result.rotationDamage, 674665.6572694146, 1e-7);
  closeTo(result.personalRotationDps, 60399.790265838375, 1e-8);
  assert.equal(result.erGate, 'FAIL');
});

test('Heavy DMG is evaluated by actual rotation impact, not by a recommendation label', () => {
  const base = evaluateAugustaStandardRotation(AUGUSTA_LIVE_CURRENT_2026_08_21);
  const withoutHeavySubstats = evaluateAugustaStandardRotation({
    ...AUGUSTA_LIVE_CURRENT_2026_08_21,
    upstreamHeavyDamage: 0.12,
  });
  assert.ok(base.personalRotationDps > withoutHeavySubstats.personalRotationDps);
  closeTo(
    base.personalRotationDps / withoutHeavySubstats.personalRotationDps - 1,
    0.09881228321960989,
    1e-12,
  );
});
