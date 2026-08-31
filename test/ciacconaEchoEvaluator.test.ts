import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CIACCONA_OWNED_BUILD_STATIC_REVIEW_20260831,
  ciacconaInputsFromEchoes,
  createCiacconaOwnedEchoDamageEvaluator,
  type CiacconaOwnedBuildCombatContext,
} from '../src/characters/ciacconaEchoEvaluator.ts';
import type { Echo } from '../src/domain.ts';
import { analyzeOwnedBuild, resolveOwnedBuildDpsBinding } from '../src/ownedBuildAnalysis.ts';
import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';

const ZERO_CONTEXT: CiacconaOwnedBuildCombatContext = {
  enemyDefense: 0,
  enemyAeroResistance: 0.2,
  attackPercent: 0,
  flatAttack: 0,
  critRate: 0,
  critDamage: 0,
  aeroDamageBonus: 0,
  basicAttackDamageBonus: 0,
  heavyAttackDamageBonus: 0,
  resonanceSkillDamageBonus: 0,
  resonanceLiberationDamageBonus: 0,
  introSkillDamageBonus: 0,
  allDamageAmplification: 0,
  energyRegen: 0,
};

const CANONICAL_SHELL: Echo[] = [
  {
    id: 'CIACCONA_1', rank: 5, cost: 4, level: 25,
    mainStat: { name: 'CRIT Rate', value: 0.22 },
    substats: [],
  },
  {
    id: 'CIACCONA_2', rank: 5, cost: 3, level: 25,
    mainStat: { name: 'Aero DMG', value: 0.30 },
    substats: [],
  },
  {
    id: 'CIACCONA_3', rank: 5, cost: 3, level: 25,
    mainStat: { name: 'Aero DMG', value: 0.30 },
    substats: [],
  },
  {
    id: 'CIACCONA_4', rank: 5, cost: 1, level: 25,
    mainStat: { name: 'ATK%', value: 0.18 },
    substats: [],
  },
  {
    id: 'CIACCONA_5', rank: 5, cost: 1, level: 25,
    mainStat: { name: 'ATK%', value: 0.18 },
    substats: [],
  },
];

function assertClose(actual: number, expected: number): void {
  assert.ok(
    Math.abs(actual - expected) < 1e-12,
    `Expected ${actual} to be within 1e-12 of ${expected}.`,
  );
}

test('Ciaccona static owned-build assembly derives canonical Character/Weapon/Echo/Sonata stats without runtime buffs', () => {
  const assembled = ciacconaInputsFromEchoes(CANONICAL_SHELL, ZERO_CONTEXT);

  assert.equal(assembled.inputs.totalAttack, 1750);
  assertClose(assembled.inputs.critRate, 0.63);
  assertClose(assembled.inputs.critDamage, 1.66);
  assertClose(assembled.inputs.aeroDamageBonus, 0.82);
  assert.equal(assembled.inputs.basicAttackDamageBonus, 0);
  assert.equal(assembled.inputs.heavyAttackDamageBonus, 0);
  assert.equal(assembled.inputs.resonanceSkillDamageBonus, 0);
  assert.equal(assembled.inputs.resonanceLiberationDamageBonus, 0);
  assert.equal(assembled.inputs.introSkillDamageBonus, 0);
  assert.equal(assembled.inputs.allDamageAmplification, 0);
  assert.equal(assembled.inputs.attackerLevel, 90);
  assert.equal(assembled.inputs.skillLevel, 10);
  assert.equal(assembled.inputs.weaponRank, 1);
  assert.equal(assembled.inputs.enemyDefense, 0);
  assertClose(assembled.inputs.enemyAeroResistance, 0.2);
  assert.equal(assembled.energyRegen, 1);
  assertClose(assembled.erMinimum, 1.15);
  assert.equal(assembled.erGate, 'FAIL');

  assert.equal(CIACCONA_OWNED_BUILD_STATIC_REVIEW_20260831.disposition, 'STATIC_ASSEMBLY_VERIFIED_CONTEXT_PENDING');
  assert.deepEqual(
    CIACCONA_OWNED_BUILD_STATIC_REVIEW_20260831.deliberatelyExcludedRuntimeEffects,
    [
      'Woodland Aria WA-AERO and WA-AERO-RES trigger state',
      'Gusts of Welkin 5-piece trigger state',
      'Solo Concert Aero DMG state',
      'Winds of Rinascita Forte Heavy bonus',
    ],
  );
});

test('Ciaccona owned-build assembly adds exact Echo rolls and explicit external context only once', () => {
  const echoes: Echo[] = CANONICAL_SHELL.map((echo) => ({
    ...echo,
    mainStat: { ...echo.mainStat },
    substats: [...echo.substats],
  }));
  echoes[0]!.substats = [
    { name: 'CRIT DMG', value: 0.174 },
    { name: 'Energy Regen', value: 0.092 },
  ];
  echoes[1]!.substats = [{ name: 'Flat ATK', value: 30 }];
  echoes[3]!.substats = [
    { name: 'ATK%', value: 0.079 },
    { name: 'Skill DMG', value: 0.079 },
  ];

  const context: CiacconaOwnedBuildCombatContext = {
    ...ZERO_CONTEXT,
    enemyDefense: 1592,
    attackPercent: 0.10,
    flatAttack: 25,
    critRate: 0.05,
    critDamage: 0.10,
    aeroDamageBonus: 0.08,
    basicAttackDamageBonus: 0.03,
    heavyAttackDamageBonus: 0.04,
    resonanceSkillDamageBonus: 0.05,
    resonanceLiberationDamageBonus: 0.06,
    introSkillDamageBonus: 0.07,
    allDamageAmplification: 0.09,
    energyRegen: 0.06,
  };
  const assembled = ciacconaInputsFromEchoes(echoes, context);

  assertClose(assembled.inputs.totalAttack, 1961.625);
  assertClose(assembled.inputs.critRate, 0.68);
  assertClose(assembled.inputs.critDamage, 1.934);
  assertClose(assembled.inputs.aeroDamageBonus, 0.90);
  assertClose(assembled.inputs.basicAttackDamageBonus, 0.03);
  assertClose(assembled.inputs.heavyAttackDamageBonus, 0.04);
  assertClose(assembled.inputs.resonanceSkillDamageBonus, 0.129);
  assertClose(assembled.inputs.resonanceLiberationDamageBonus, 0.06);
  assertClose(assembled.inputs.introSkillDamageBonus, 0.07);
  assertClose(assembled.inputs.allDamageAmplification, 0.09);
  assertClose(assembled.energyRegen, 1.152);
  assert.equal(assembled.erGate, 'PASS');
});

test('explicit-context Ciaccona evaluator executes finite DPS but remains unregistered for Alpha owned-build analysis', () => {
  const evaluator = createCiacconaOwnedEchoDamageEvaluator(ZERO_CONTEXT);
  const build = buildContextFromVerifiedPreset('ciaccona-cartethyia-aero', CANONICAL_SHELL);
  const result = evaluator.evaluate(build);

  assert.ok(Number.isFinite(result.personalRotationDps));
  assert.ok(result.personalRotationDps > 0);
  assert.equal(result.energyRegen, 1);
  assert.equal(result.erGate, 'FAIL');

  assert.equal(resolveOwnedBuildDpsBinding('ciaccona-cartethyia-aero'), null);
  assert.throws(
    () => analyzeOwnedBuild({ presetId: 'ciaccona-cartethyia-aero', echoes: CANONICAL_SHELL }),
    /no verified owned-build DPS adapter is registered/,
  );
});

test('Ciaccona assembly rejects missing loadout or non-finite unresolved context instead of inventing defaults', () => {
  assert.throws(
    () => ciacconaInputsFromEchoes(CANONICAL_SHELL.slice(0, 4), ZERO_CONTEXT),
    /requires exactly five Echoes/,
  );
  assert.throws(
    () => ciacconaInputsFromEchoes(CANONICAL_SHELL, { ...ZERO_CONTEXT, enemyDefense: Number.NaN }),
    /enemyDefense must be finite and non-negative/,
  );
  assert.throws(
    () => ciacconaInputsFromEchoes(CANONICAL_SHELL, { ...ZERO_CONTEXT, enemyAeroResistance: Number.NaN }),
    /enemyAeroResistance must be finite/,
  );
});
