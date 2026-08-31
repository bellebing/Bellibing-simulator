import type { BuildContext, DamageEvaluator, DamageResult, Echo, StatRoll } from '../domain.ts';
import { secondaryMainStatValueAtLevel } from '../echoMainStats.ts';
import { createEchoEffectRegistry } from '../echoEffectRegistry.ts';
import { resolvePresetMainEchoEffects } from '../profileEchoEffectResolver.ts';
import { resolveBuildPreset } from '../profileRegistry.ts';
import {
  evaluateCiacconaBasicRotation,
  type CiacconaBuildInputs,
  CIACCONA_BASIC_ENGINE_MODEL_ID,
} from './ciacconaStandard.ts';
import { CHARACTER_CATALOG } from '../data/characters.ts';
import { getCharacterIntrinsicProfile } from '../data/characterIntrinsicStats.ts';
import { ECHO_EFFECT_MODELS } from '../data/echoEffects.ts';
import { PROFILE_REGISTRY } from '../data/profileCatalogs.ts';
import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';
import { WEAPON_CATALOG } from '../data/weapons.ts';

const SUPPORTED = {
  presetId: 'ciaccona-cartethyia-aero',
  characterId: 'ciaccona',
  weaponId: 'woodland-aria',
  weaponRank: 1,
  teamId: 'cartethyia-ciaccona-rover-aero',
  rotationProfileId: CIACCONA_BASIC_ENGINE_MODEL_ID,
  attackerLevel: 90,
  skillLevel: 10,
} as const;

/**
 * External combat context is deliberately explicit. Ciaccona's DPS freeze
 * authorizes caller-provided combat/enemy stats, but current canonical data does
 * not yet define one versioned Alpha default for these values/team windows.
 */
export interface CiacconaOwnedBuildCombatContext {
  readonly enemyDefense: number;
  readonly enemyAeroResistance: number;
  readonly attackPercent: number;
  readonly flatAttack: number;
  readonly critRate: number;
  readonly critDamage: number;
  readonly aeroDamageBonus: number;
  readonly basicAttackDamageBonus: number;
  readonly heavyAttackDamageBonus: number;
  readonly resonanceSkillDamageBonus: number;
  readonly resonanceLiberationDamageBonus: number;
  readonly introSkillDamageBonus: number;
  readonly allDamageAmplification: number;
  readonly energyRegen: number;
}

export interface CiacconaOwnedBuildAssembly {
  readonly inputs: CiacconaBuildInputs;
  readonly energyRegen: number;
  readonly erMinimum: number;
  readonly erGate: 'PASS' | 'FAIL';
}

export const CIACCONA_OWNED_BUILD_STATIC_REVIEW_20260831 = {
  reviewId: 'CIACCONA-OWNED-BUILD-STATIC-2026-08-31-01',
  presetId: SUPPORTED.presetId,
  checkedAt: '2026-08-31',
  disposition: 'STATIC_ASSEMBLY_VERIFIED_CONTEXT_PENDING',
  sourceBackedStaticInputs: [
    'Ciaccona Lv90 base ATK and base CRIT values from CHARACTER_CATALOG',
    'Ciaccona VERIFIED Minor Fortes from characterIntrinsicStats',
    'Woodland Aria R1 Lv90 base ATK / CRIT Rate secondary / permanent WA-ATK',
    'Gusts of Welkin 2-piece permanent Aero DMG bonus',
    'Nightmare: Kelpie permanent main-slot Aero DMG bonus',
    'Exact Rank-5 Echo primary/substat values plus automatic COST-bound secondary main stats',
    'Ciaccona 115% canonical Energy Regen minimum',
  ],
  deliberatelyExcludedRuntimeEffects: [
    'Woodland Aria WA-AERO and WA-AERO-RES trigger state',
    'Gusts of Welkin 5-piece trigger state',
    'Solo Concert Aero DMG state',
    'Winds of Rinascita Forte Heavy bonus',
  ],
  unresolvedOwnedBuildDefaults: [
    'versioned enemyDefense',
    'versioned enemyAeroResistance',
    'source-backed team buff/amplification values and uptime for the exact Cartethyia + Rover (Aero) context',
  ],
  notes: [
    'The four runtime effects above are already executed inside CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1 and must not be duplicated in static owned-build assembly.',
    'Rover (Aero) execution remains BUG-012 fail-closed, so no Rover team amplification is silently promoted into this context.',
    'This review does not register Ciaccona in ownedBuildAnalysis. Alpha owned-build DPS remains unavailable until a versioned external combat context is independently verified.',
  ],
} as const;

const ECHO_EFFECT_REGISTRY = createEchoEffectRegistry(ECHO_EFFECT_MODELS);
const RESOLVED = resolveBuildPreset(PROFILE_REGISTRY, SUPPORTED.presetId);

function requireFiniteNonNegative(name: string, value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be finite and non-negative.`);
  return value;
}

function rankValue(effectId: string, rank: number): number {
  const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === effectId);
  if (!effect) throw new Error(`Missing weapon effect ${effectId}.`);
  const value = effect.rankValues[rank - 1];
  if (value === undefined) throw new Error(`${effectId}: missing rank ${rank}.`);
  return value;
}

function statValue(stats: readonly { stat: string; value: number }[], name: string): number {
  return stats.filter((row) => row.stat === name).reduce((sum, row) => sum + row.value, 0);
}

function echoRolls(echo: Echo): readonly StatRoll[] {
  const automaticSecondary = echo.secondaryMainStat ?? {
    name: echo.cost === 1 ? 'Flat HP' : 'Flat ATK',
    value: secondaryMainStatValueAtLevel(echo.cost, echo.level),
  };
  return [echo.mainStat, automaticSecondary, ...echo.substats];
}

function sumEchoStat(echoes: readonly Echo[], name: string): number {
  let total = 0;
  for (const echo of echoes) {
    for (const roll of echoRolls(echo)) {
      if (roll.name === name) total += roll.value;
    }
  }
  return total;
}

function sonataValue(effectId: string): number {
  const effect = SONATA_EFFECT_MODELS.find((row) => row.effectId === effectId);
  if (!effect) throw new Error(`Missing Sonata effect ${effectId}.`);
  return effect.value;
}

function mainEchoStaticAeroBonus(): number {
  return resolvePresetMainEchoEffects(
    PROFILE_REGISTRY,
    ECHO_EFFECT_REGISTRY,
    SUPPORTED.presetId,
  )
    .filter((effect) => effect.statOrEffect === 'Aero DMG Bonus')
    .reduce((sum, effect) => sum + effect.value, 0);
}

function canonicalErMinimum(): number {
  const gate = RESOLVED.statTarget.gates?.find((row) => row.stat === 'Energy Regen Total');
  if (!gate || !Number.isFinite(gate.minimum)) {
    throw new Error(`${SUPPORTED.presetId}: missing canonical Energy Regen Total minimum.`);
  }
  return gate.minimum;
}

function validateCanonicalStaticDependencies(): void {
  if (RESOLVED.preset.characterId !== SUPPORTED.characterId) {
    throw new Error(`${SUPPORTED.presetId}: Character drift.`);
  }
  if (RESOLVED.weaponRecommendation.defaultWeaponId !== SUPPORTED.weaponId) {
    throw new Error(`${SUPPORTED.presetId}: weapon drift.`);
  }
  const defaultWeapon = RESOLVED.weaponRecommendation.options.find(
    (row) => row.weaponId === SUPPORTED.weaponId,
  );
  if (!defaultWeapon || defaultWeapon.rank !== SUPPORTED.weaponRank) {
    throw new Error(`${SUPPORTED.presetId}: Woodland Aria R1 default drift.`);
  }
  if (RESOLVED.team.id !== SUPPORTED.teamId) throw new Error(`${SUPPORTED.presetId}: team drift.`);
  if (RESOLVED.rotation.executionStatus !== 'ENGINE_MODELED'
      || RESOLVED.rotation.engineModelId !== SUPPORTED.rotationProfileId) {
    throw new Error(`${SUPPORTED.presetId}: engine-model drift.`);
  }
  if (!RESOLVED.echoLoadout.sonataSetIds.includes('sonata-16')) {
    throw new Error(`${SUPPORTED.presetId}: Gusts of Welkin drift.`);
  }
  if (RESOLVED.echoLoadout.mainEchoId !== 'echo-60001135') {
    throw new Error(`${SUPPORTED.presetId}: Nightmare: Kelpie drift.`);
  }
}

validateCanonicalStaticDependencies();

/**
 * Assemble the exact Ciaccona-owned static build while keeping all still-
 * unverified team/enemy context explicit. Runtime trigger effects remain owned
 * by evaluateCiacconaBasicRotation and are never pre-applied here.
 */
export function ciacconaInputsFromEchoes(
  echoes: readonly Echo[],
  context: CiacconaOwnedBuildCombatContext,
): CiacconaOwnedBuildAssembly {
  if (echoes.length !== 5) throw new Error('Ciaccona owned-build assembly requires exactly five Echoes.');

  const character = CHARACTER_CATALOG.find((row) => row.id === SUPPORTED.characterId);
  const weapon = WEAPON_CATALOG.find((row) => row.id === SUPPORTED.weaponId);
  const intrinsic = getCharacterIntrinsicProfile(SUPPORTED.characterId);
  if (!character || character.level90.atk === null) throw new Error('Missing Ciaccona Lv90 ATK.');
  if (character.baseCombat.critRate === null || character.baseCombat.critDamage === null || character.baseCombat.energyRegen === null) {
    throw new Error('Missing Ciaccona base combat stats.');
  }
  if (!weapon || weapon.level90BaseAtk === null || !weapon.secondary || weapon.secondary.stat !== 'CRIT Rate') {
    throw new Error('Missing Woodland Aria Lv90 base/CRIT Rate stats.');
  }
  if (!intrinsic || intrinsic.verificationStatus !== 'VERIFIED') {
    throw new Error('Missing VERIFIED Ciaccona intrinsic stats.');
  }

  const external = [
    ['enemyDefense', context.enemyDefense],
    ['attackPercent', context.attackPercent],
    ['flatAttack', context.flatAttack],
    ['critRate', context.critRate],
    ['critDamage', context.critDamage],
    ['aeroDamageBonus', context.aeroDamageBonus],
    ['basicAttackDamageBonus', context.basicAttackDamageBonus],
    ['heavyAttackDamageBonus', context.heavyAttackDamageBonus],
    ['resonanceSkillDamageBonus', context.resonanceSkillDamageBonus],
    ['resonanceLiberationDamageBonus', context.resonanceLiberationDamageBonus],
    ['introSkillDamageBonus', context.introSkillDamageBonus],
    ['allDamageAmplification', context.allDamageAmplification],
    ['energyRegen', context.energyRegen],
  ] as const;
  for (const [name, value] of external) requireFiniteNonNegative(name, value);
  if (!Number.isFinite(context.enemyAeroResistance)) {
    throw new Error('enemyAeroResistance must be finite.');
  }

  const combinedBaseAtk = character.level90.atk + weapon.level90BaseAtk;
  const atkPct = statValue(intrinsic.stats, 'ATK%')
    + rankValue('WA-ATK', SUPPORTED.weaponRank)
    + sumEchoStat(echoes, 'ATK%')
    + context.attackPercent;
  const flatAtk = sumEchoStat(echoes, 'Flat ATK') + context.flatAttack;
  const energyRegen = character.baseCombat.energyRegen
    + sumEchoStat(echoes, 'Energy Regen')
    + context.energyRegen;
  const erMinimum = canonicalErMinimum();

  return {
    inputs: {
      totalAttack: combinedBaseAtk * (1 + atkPct) + flatAtk,
      critRate: character.baseCombat.critRate
        + weapon.secondary.value
        + sumEchoStat(echoes, 'CRIT Rate')
        + context.critRate,
      critDamage: character.baseCombat.critDamage
        + statValue(intrinsic.stats, 'CRIT DMG')
        + sumEchoStat(echoes, 'CRIT DMG')
        + context.critDamage,
      aeroDamageBonus: sonataValue('S16_2PC_AERO')
        + mainEchoStaticAeroBonus()
        + sumEchoStat(echoes, 'Aero DMG')
        + context.aeroDamageBonus,
      basicAttackDamageBonus: sumEchoStat(echoes, 'Basic Attack DMG') + context.basicAttackDamageBonus,
      heavyAttackDamageBonus: sumEchoStat(echoes, 'Heavy Attack DMG') + context.heavyAttackDamageBonus,
      resonanceSkillDamageBonus: sumEchoStat(echoes, 'Skill DMG') + context.resonanceSkillDamageBonus,
      resonanceLiberationDamageBonus: sumEchoStat(echoes, 'Liberation DMG') + context.resonanceLiberationDamageBonus,
      introSkillDamageBonus: context.introSkillDamageBonus,
      allDamageAmplification: context.allDamageAmplification,
      attackerLevel: SUPPORTED.attackerLevel,
      enemyDefense: context.enemyDefense,
      enemyAeroResistance: context.enemyAeroResistance,
      skillLevel: SUPPORTED.skillLevel,
      weaponRank: SUPPORTED.weaponRank,
    },
    energyRegen,
    erMinimum,
    erGate: energyRegen >= erMinimum ? 'PASS' : 'FAIL',
  };
}

function isSupportedBuild(build: BuildContext): boolean {
  return build.characterId === SUPPORTED.characterId
    && build.sequence === RESOLVED.preset.sequence
    && build.weapon.id === SUPPORTED.weaponId
    && build.weapon.rank === SUPPORTED.weaponRank
    && build.teamId === SUPPORTED.teamId
    && build.rotationProfileId === SUPPORTED.rotationProfileId
    && build.maxSkills === true;
}

/**
 * Explicit-context evaluator factory. This is intentionally not registered in
 * ownedBuildAnalysis until one versioned Alpha default context is source-backed.
 */
export function createCiacconaOwnedEchoDamageEvaluator(
  context: CiacconaOwnedBuildCombatContext,
): DamageEvaluator {
  return {
    evaluate(build: BuildContext): DamageResult {
      if (!isSupportedBuild(build)) {
        return {
          personalRotationDps: Number.NaN,
          energyRegen: Number.NaN,
          erGate: 'PENDING',
          notes: ['Only the exact verified Ciaccona / Woodland Aria R1 / Cartethyia + Rover (Aero) / CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1 context is supported.'],
        };
      }
      const assembled = ciacconaInputsFromEchoes(build.echoes, context);
      const result = evaluateCiacconaBasicRotation(assembled.inputs);
      return {
        personalRotationDps: result.personalDirectRotationDps,
        energyRegen: assembled.energyRegen,
        erGate: assembled.erGate,
        notes: [
          'Static Character/Weapon/Echo/Sonata assembly is source-backed; caller supplied the still-explicit versioned enemy/team combat context.',
        ],
      };
    },
  };
}
