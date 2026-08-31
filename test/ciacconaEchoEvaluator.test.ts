import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CIACCONA_OWNED_BUILD_STATIC_REVIEW_20260831,
  ciacconaInputsFromEchoes,
  createCiacconaOwnedEchoDamageEvaluator,
  type CiacconaOwnedBuildCombatContext,
} from '../src/characters/ciacconaEchoEvaluator.ts';
import {
  CIACCONA_OWNED_BUILD_PRODUCT_CONTEXT_20260831,
  CIACCONA_OWNED_BUILD_PRODUCT_CONTEXT_LABEL,
} from '../src/characters/ciacconaProductOwnedBuildEvaluator.ts';
import { CIACCONA_OWNED_BUILD_COMBAT_CONTEXT_REVIEW_20260831 } from '../src/data/ciacconaOwnedBuildCombatContext20260831.ts';
import type { Echo, StatRoll } from '../src/domain.ts';
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

const LOW_IMPACT_EXACT_SUBSTATS: readonly StatRoll[] = [
  { name: 'Flat HP', value: 470 },
  { name: 'Flat DEF', value: 40 },
  { name: 'HP%', value: 0.086 },
  { name: 'DEF%', value: 0.109 },
  { name: 'Basic Attack DMG', value: 0.064 },
] as const;

function exactSubstats(): StatRoll[] {
  return LOW_IMPACT_EXACT_SUBSTATS.map((roll) => ({ ...roll }));
}

const CANONICAL_SHELL: Echo[] = [
  {
    id: 'CIACCONA_1', rank: 5, cost: 4, level: 25,
    mainStat: { name: 'CRIT Rate', value: 0.22 },
    substats: exactSubstats(),
  },
  {
    id: 'CIACCONA_2', rank: 5, cost: 3, level: 25,
    mainStat: { name: 'Aero DMG', value: 0.30 },
    substats: exactSubstats(),
  },
  {
    id: 'CIACCONA_3', rank: 5, cost: 3, level: 25,
    mainStat: { name: 'Aero DMG', value: 0.30 },
    substats: exactSubstats(),
  },
  {
    id: 'CIACCONA_4', rank: 5, cost: 1, level: 25,
    mainStat: { name: 'ATK%', value: 0.18 },
    substats: exactSubstats(),
  },
  {
    id: 'CIACCONA_5', rank: 5, cost: 1, level: 25,
    mainStat: { name: 'ATK%', value: 0.18 },
    substats: exactSubstats(),
  },
];

function cloneShell(): Echo[] {
  return CANONICAL_SHELL.map((echo) => ({
    ...echo,
    mainStat: { ...echo.mainStat },
    secondaryMainStat: echo.secondaryMainStat ? { ...echo.secondaryMainStat } : undefined,
    substats: echo.substats.map((roll) => ({ ...roll })),
  }));
}

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
  assertClose(assembled.inputs.basicAttackDamageBonus, 0.32);
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
  const echoes = cloneShell();
  echoes[0]!.substats = [
    { name: 'CRIT DMG', value: 0.174 },
    { name: 'Energy Regen', value: 0.092 },
    { name: 'Flat HP', value: 470 },
    { name: 'Flat DEF', value: 40 },
    { name: 'HP%', value: 0.086 },
  ];
  echoes[1]!.substats = [
    { name: 'Flat ATK', value: 30 },
    { name: 'Flat HP', value: 470 },
    { name: 'Flat DEF', value: 40 },
    { name: 'HP%', value: 0.086 },
    { name: 'DEF%', value: 0.109 },
  ];
  echoes[3]!.substats = [
    { name: 'ATK%', value: 0.079 },
    { name: 'Skill DMG', value: 0.079 },
    { name: 'Flat HP', value: 470 },
    { name: 'Flat DEF', value: 40 },
    { name: 'HP%', value: 0.086 },
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
  assertClose(assembled.inputs.basicAttackDamageBonus, 0.158);
  assertClose(assembled.inputs.heavyAttackDamageBonus, 0.04);
  assertClose(assembled.inputs.resonanceSkillDamageBonus, 0.129);
  assertClose(assembled.inputs.resonanceLiberationDamageBonus, 0.06);
  assertClose(assembled.inputs.introSkillDamageBonus, 0.07);
  assertClose(assembled.inputs.allDamageAmplification, 0.09);
  assertClose(assembled.energyRegen, 1.152);
  assert.equal(assembled.erGate, 'PASS');
});

test('reviewed Ciaccona product context locks Lorelei VI plus Rover Bloodpact R1 and registers owned-build DPS', () => {
  const review = CIACCONA_OWNED_BUILD_COMBAT_CONTEXT_REVIEW_20260831;
  assert.equal(review.disposition, 'VERIFIED_PRODUCT_BENCHMARK_CONTEXT');
  assert.equal(review.target.level, 100);
  assert.equal(review.target.enemyDefense, 1592);
  assertClose(review.target.enemyAeroResistance, 0.10);
  assert.equal(review.team.predecessorWeaponId, 'bloodpacts-pledge');
  assert.equal(review.team.predecessorWeaponRank, 1);
  assertClose(review.team.aeroDamageAmplification, 0.10);
  assert.equal(review.team.durationSeconds, 30);
  assert.equal(review.rotationSeconds, 4.5);
  assert.match(CIACCONA_OWNED_BUILD_PRODUCT_CONTEXT_LABEL, /Lorelei VI/);

  assert.deepEqual(CIACCONA_OWNED_BUILD_PRODUCT_CONTEXT_20260831, {
    enemyDefense: 1592,
    enemyAeroResistance: 0.10,
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
    allDamageAmplification: 0.10,
    energyRegen: 0,
  });

  const evaluator = createCiacconaOwnedEchoDamageEvaluator(CIACCONA_OWNED_BUILD_PRODUCT_CONTEXT_20260831);
  const build = buildContextFromVerifiedPreset('ciaccona-cartethyia-aero', CANONICAL_SHELL);
  const direct = evaluator.evaluate(build);
  assert.ok(Number.isFinite(direct.personalRotationDps));
  assert.ok(direct.personalRotationDps > 0);
  assert.equal(direct.energyRegen, 1);
  assert.equal(direct.erGate, 'FAIL');

  const binding = resolveOwnedBuildDpsBinding('ciaccona-cartethyia-aero');
  assert.equal(binding?.characterId, 'ciaccona');
  assert.equal(binding?.engineModelId, 'CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1');

  const product = analyzeOwnedBuild({ presetId: 'ciaccona-cartethyia-aero', echoes: CANONICAL_SHELL });
  assert.ok(Number.isFinite(product.personalRotationDps));
  assert.ok(product.personalRotationDps > 0);
  assertClose(product.personalRotationDps, direct.personalRotationDps);
  assert.equal(product.energyRegen, 1);
  assert.equal(product.erGate, 'FAIL');
});

test('Ciaccona assembly rejects invalid owned loadouts or non-finite unresolved context instead of inventing defaults', () => {
  assert.throws(
    () => ciacconaInputsFromEchoes(CANONICAL_SHELL.slice(0, 4), ZERO_CONTEXT),
    /requires exactly five Echoes/,
  );

  const wrongRank = cloneShell();
  wrongRank[0] = { ...wrongRank[0]!, rank: 4 };
  assert.throws(
    () => ciacconaInputsFromEchoes(wrongRank, ZERO_CONTEXT),
    /requires Rank-5 Echoes/,
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
