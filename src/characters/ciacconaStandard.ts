import {
  defenseMultiplier,
  expectedDamage,
  resistanceMultiplier,
} from '../combat/damageKernel.ts';
import {
  AeroErosionTargetState,
  timedEffectCoversRemainingShortRotation,
} from '../combat/aeroErosionTargetState.ts';
import { WoodlandAriaAeroExecutionState } from '../combat/aeroErosionWeaponAdapter.ts';
import type { CharacterActionFact, CharacterDamageClass } from '../characterMechanicsDomain.ts';
import { getCharacterActionFact } from '../data/characterMechanics.ts';
import { CIACCONA_BASIC_ROTATION_EXECUTION_REVIEW_20260830 } from '../data/profileExecutionSemanticReview20260830.ts';
import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';

export const CIACCONA_BASIC_ENGINE_MODEL_ID = 'CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1';

const SOLO_CONCERT_AERO_BONUS = 0.24;
const WINDS_OF_RINASCITA_HEAVY_BONUS = 0.30;

function sonataValue(effectId: string): number {
  const effect = SONATA_EFFECT_MODELS.find((row) => row.effectId === effectId);
  if (!effect) throw new Error(`Missing Sonata effect ${effectId}.`);
  return effect.value;
}

const GUSTS_TEAM_AERO = SONATA_EFFECT_MODELS.find((row) => row.effectId === 'S16_5PC_TEAM_AERO');
const GUSTS_SELF_AERO = SONATA_EFFECT_MODELS.find((row) => row.effectId === 'S16_5PC_SELF_AERO');
if (!GUSTS_TEAM_AERO || !GUSTS_SELF_AERO) throw new Error('Missing Gusts of Welkin Aero effects.');

export const CIACCONA_BASIC_MODELED_MECHANIC_FACT_IDS = [
  'ciaccona-intro-skill-roaming-with-the-wind-skill-dmg',
  'ciaccona-basic-attack-quadruple-time-steps-stage-3-dmg',
  'ciaccona-basic-attack-quadruple-time-steps-stage-4-dmg',
  'ciaccona-basic-attack-quadruple-time-steps-mid-air-attack-stage-1-dmg',
  'ciaccona-basic-attack-quadruple-time-steps-mid-air-attack-stage-2-dmg',
  'ciaccona-resonance-skill-harmonic-allegro-skill-dmg',
  'ciaccona-forte-circuit-symphony-of-wind-and-verse-quadruple-downbeat-dmg',
  'ciaccona-resonance-liberation-singer-s-triple-cadenza-improvised-symphonic-poem-skill-dmg',
  'ciaccona-resource-musical-essence',
  'ciaccona-resource-ensemble-sylph',
  'ciaccona-basic-solo-concert',
  'ciaccona-inherent-winds-of-rinascita',
] as const;

export interface CiacconaBuildInputs {
  /** Total ATK after all non-execution/static profile assembly. */
  totalAttack: number;
  critRate: number;
  critDamage: number;
  /** Static Aero DMG already assembled from stats/permanent effects; do not include runtime WA/S16/Solo Concert here. */
  aeroDamageBonus: number;
  basicAttackDamageBonus: number;
  heavyAttackDamageBonus: number;
  resonanceSkillDamageBonus: number;
  resonanceLiberationDamageBonus: number;
  introSkillDamageBonus: number;
  allDamageAmplification: number;
  attackerLevel: number;
  enemyDefense: number;
  enemyAeroResistance: number;
  /** Explicit Character skill level used to select the canonical Lv1-Lv10 source curves. */
  skillLevel: number;
  /** Woodland Aria rank, 1-5. */
  weaponRank: number;
}

export interface CiacconaActionResult {
  readonly eventIndex: number;
  readonly sourceFactId: string;
  readonly name: string;
  readonly damageClass: CharacterDamageClass;
  readonly motionValue: number;
  readonly aeroErosionBefore: boolean;
  readonly woodlandAeroBefore: boolean;
  readonly woodlandResReductionBefore: boolean;
  readonly gustsAeroBefore: boolean;
  readonly soloConcertBefore: boolean;
  readonly musicalEssenceBefore: number;
  readonly musicalEssenceAfter: number;
  readonly damage: number;
}

export interface CiacconaRotationResult {
  readonly engineModelId: typeof CIACCONA_BASIC_ENGINE_MODEL_ID;
  readonly rotationSeconds: number;
  readonly actions: readonly CiacconaActionResult[];
  readonly rotationDamage: number;
  readonly personalDirectRotationDps: number;
  readonly finalAeroErosionStacksObserved: number;
  readonly finalMusicalEssence: number;
  readonly outroReached: true;
  readonly excludesOptionalTonicEvents: true;
}

interface CiacconaRecipeAction {
  readonly sourceFactId: string;
  readonly aeroErosionStacksAfter?: number;
  readonly musicalEssenceGainAfter?: number;
  readonly requiresMusicalEssence?: number;
  readonly consumesAllMusicalEssenceAfter?: boolean;
  readonly activatesSoloConcertAfter?: boolean;
}

/**
 * Exact damage-bearing subset of the canonical fast rotation. Jump/cancel and
 * Outro are execution boundaries rather than Character-owned damage rows.
 * Individual event timestamps are intentionally absent.
 */
const CIACCONA_BASIC_RECIPE: readonly CiacconaRecipeAction[] = [
  {
    sourceFactId: 'ciaccona-intro-skill-roaming-with-the-wind-skill-dmg',
    aeroErosionStacksAfter: 1,
    musicalEssenceGainAfter: 1,
  },
  { sourceFactId: 'ciaccona-basic-attack-quadruple-time-steps-stage-3-dmg' },
  {
    sourceFactId: 'ciaccona-basic-attack-quadruple-time-steps-stage-4-dmg',
    aeroErosionStacksAfter: 1,
    musicalEssenceGainAfter: 1,
    // Canonical next step is Jump cancel; source says the generated Sylph finishes P4 and enters Solo Concert.
    activatesSoloConcertAfter: true,
  },
  { sourceFactId: 'ciaccona-basic-attack-quadruple-time-steps-mid-air-attack-stage-1-dmg' },
  { sourceFactId: 'ciaccona-basic-attack-quadruple-time-steps-mid-air-attack-stage-2-dmg' },
  {
    sourceFactId: 'ciaccona-basic-attack-quadruple-time-steps-stage-4-dmg',
    aeroErosionStacksAfter: 1,
    musicalEssenceGainAfter: 1,
  },
  {
    sourceFactId: 'ciaccona-resonance-skill-harmonic-allegro-skill-dmg',
    aeroErosionStacksAfter: 1,
  },
  {
    sourceFactId: 'ciaccona-forte-circuit-symphony-of-wind-and-verse-quadruple-downbeat-dmg',
    aeroErosionStacksAfter: 1,
    requiresMusicalEssence: 3,
    consumesAllMusicalEssenceAfter: true,
  },
  { sourceFactId: 'ciaccona-resonance-liberation-singer-s-triple-cadenza-improvised-symphonic-poem-skill-dmg' },
] as const;

function actionFact(factId: string): CharacterActionFact {
  const fact = getCharacterActionFact(factId);
  if (!fact) throw new Error(`Missing Ciaccona Character action fact ${factId}.`);
  if (fact.characterId !== 'ciaccona') throw new Error(`Ciaccona engine cannot consume ${fact.characterId} fact ${factId}.`);
  if (fact.actionRole !== 'DAMAGE' || fact.scalingStat !== 'ATK') {
    throw new Error(`Ciaccona engine requires ATK-scaling DAMAGE fact ${factId}.`);
  }
  if (!fact.damageClass) throw new Error(`Ciaccona engine requires one damage class for ${factId}.`);
  return fact;
}

function motionValueAtLevel(fact: CharacterActionFact, skillLevel: number): number {
  if (!Number.isInteger(skillLevel) || skillLevel < 1 || skillLevel > 10) {
    throw new Error(`Ciaccona skill level must be an integer 1-10, got ${skillLevel}.`);
  }
  const index = skillLevel - 1;
  if (fact.motionValueCurve) {
    if (fact.hitCount === null) throw new Error(`${fact.factId}: motionValueCurve requires explicit hitCount.`);
    return fact.motionValueCurve[index] * fact.hitCount;
  }
  if (fact.motionValueComponents) {
    return fact.motionValueComponents.reduce((sum, component) => sum + component.curve[index] * component.hitCount, 0);
  }
  if (fact.sourceFixedMotionValue !== null && fact.sourceFixedMotionValue !== undefined) {
    if (fact.hitCount === null) throw new Error(`${fact.factId}: sourceFixedMotionValue requires explicit hitCount.`);
    return fact.sourceFixedMotionValue * fact.hitCount;
  }
  if (fact.sourceFixedMotionValueComponents) {
    return fact.sourceFixedMotionValueComponents.reduce(
      (sum, component) => sum + component.coefficient * component.hitCount,
      0,
    );
  }
  if (fact.motionValue !== null) return fact.motionValue;
  throw new Error(`${fact.factId}: no executable motion value for skill level ${skillLevel}.`);
}

function classBonus(damageClass: CharacterDamageClass, build: CiacconaBuildInputs): number {
  switch (damageClass) {
    case 'BASIC': return build.basicAttackDamageBonus;
    case 'HEAVY': return build.heavyAttackDamageBonus;
    case 'SKILL': return build.resonanceSkillDamageBonus;
    case 'LIBERATION': return build.resonanceLiberationDamageBonus;
    case 'INTRO': return build.introSkillDamageBonus;
    default:
      throw new Error(`Ciaccona basic rotation does not support ${damageClass} direct-hit damage.`);
  }
}

function validateBuild(build: CiacconaBuildInputs): void {
  const finite = [
    build.totalAttack,
    build.critRate,
    build.critDamage,
    build.aeroDamageBonus,
    build.basicAttackDamageBonus,
    build.heavyAttackDamageBonus,
    build.resonanceSkillDamageBonus,
    build.resonanceLiberationDamageBonus,
    build.introSkillDamageBonus,
    build.allDamageAmplification,
    build.attackerLevel,
    build.enemyDefense,
    build.enemyAeroResistance,
  ];
  if (finite.some((value) => !Number.isFinite(value))) throw new Error('Ciaccona build contains a non-finite numeric input.');
  if (build.totalAttack <= 0) throw new Error('Ciaccona totalAttack must be positive.');
  if (build.attackerLevel <= 0) throw new Error('Ciaccona attackerLevel must be positive.');
  if (build.enemyDefense < 0) throw new Error('Ciaccona enemyDefense cannot be negative.');
  if (!Number.isInteger(build.skillLevel) || build.skillLevel < 1 || build.skillLevel > 10) throw new Error('Ciaccona skillLevel must be 1-10.');
  if (!Number.isInteger(build.weaponRank) || build.weaponRank < 1 || build.weaponRank > 5) throw new Error('Woodland Aria weaponRank must be 1-5.');
}

export function evaluateCiacconaBasicRotation(build: CiacconaBuildInputs): CiacconaRotationResult {
  validateBuild(build);
  const rotationSeconds = CIACCONA_BASIC_ROTATION_EXECUTION_REVIEW_20260830.rotationSeconds;
  const target = new AeroErosionTargetState(rotationSeconds);
  const woodland = new WoodlandAriaAeroExecutionState(target, build.weaponRank);
  const gustsTeamAero = GUSTS_TEAM_AERO;
  const gustsSelfAero = GUSTS_SELF_AERO;
  if (!gustsTeamAero || !gustsSelfAero) throw new Error('Missing Gusts of Welkin Aero effects.');

  if (!timedEffectCoversRemainingShortRotation(rotationSeconds, gustsTeamAero.durationSeconds)
      || !timedEffectCoversRemainingShortRotation(rotationSeconds, gustsSelfAero.durationSeconds)) {
    throw new Error('Gusts of Welkin 5-piece windows do not prove full Ciaccona short-rotation coverage.');
  }

  const defMult = defenseMultiplier({ attackerLevel: build.attackerLevel, enemyDefense: build.enemyDefense });
  let musicalEssence = 0;
  let gustsAeroActive = false;
  let soloConcertActive = false;
  const results: CiacconaActionResult[] = [];

  for (const [eventIndex, recipe] of CIACCONA_BASIC_RECIPE.entries()) {
    const fact = actionFact(recipe.sourceFactId);
    const damageClass = fact.damageClass as CharacterDamageClass;
    const before = woodland.snapshot();
    const musicalEssenceBefore = musicalEssence;
    const gustsAeroBefore = gustsAeroActive;
    const soloConcertBefore = soloConcertActive;

    if (recipe.requiresMusicalEssence !== undefined && musicalEssence < recipe.requiresMusicalEssence) {
      throw new Error(`${fact.factId}: requires ${recipe.requiresMusicalEssence} Musical Essence, has ${musicalEssence}.`);
    }

    const heavyPassive = fact.factId === 'ciaccona-forte-circuit-symphony-of-wind-and-verse-quadruple-downbeat-dmg'
      ? WINDS_OF_RINASCITA_HEAVY_BONUS
      : 0;
    const damageBonus = build.aeroDamageBonus
      + classBonus(damageClass, build)
      + woodland.aeroDamageBonus
      + (gustsAeroActive ? sonataValue('S16_5PC_TEAM_AERO') + sonataValue('S16_5PC_SELF_AERO') : 0)
      + (soloConcertActive ? SOLO_CONCERT_AERO_BONUS : 0)
      + heavyPassive;
    const resMult = resistanceMultiplier(build.enemyAeroResistance, woodland.targetAeroResReduction);
    const motionValue = motionValueAtLevel(fact, build.skillLevel);
    const damage = expectedDamage({
      scalingStat: build.totalAttack,
      motionValue,
      damageBonus,
      amplification: build.allDamageAmplification,
      critRate: build.critRate,
      critDamage: build.critDamage,
      defenseMultiplier: defMult,
      resistanceMultiplier: resMult,
    });

    // Trigger order is deliberately post-damage unless the source already proves
    // the state existed before this hit.
    woodland.afterTargetHit(before.target.affected);
    if (recipe.aeroErosionStacksAfter) {
      woodland.afterAeroErosionApplication(eventIndex, fact.factId, recipe.aeroErosionStacksAfter);
      gustsAeroActive = true;
    }
    if (recipe.musicalEssenceGainAfter) {
      musicalEssence = Math.min(3, musicalEssence + recipe.musicalEssenceGainAfter);
    }
    if (recipe.consumesAllMusicalEssenceAfter) musicalEssence = 0;
    if (recipe.activatesSoloConcertAfter) soloConcertActive = true;

    results.push({
      eventIndex,
      sourceFactId: fact.factId,
      name: fact.name,
      damageClass,
      motionValue,
      aeroErosionBefore: before.target.affected,
      woodlandAeroBefore: before.aeroDamageBonusActive,
      woodlandResReductionBefore: before.targetAeroResReductionActive,
      gustsAeroBefore,
      soloConcertBefore,
      musicalEssenceBefore,
      musicalEssenceAfter: musicalEssence,
      damage,
    });
  }

  const rotationDamage = results.reduce((sum, row) => sum + row.damage, 0);
  return {
    engineModelId: CIACCONA_BASIC_ENGINE_MODEL_ID,
    rotationSeconds,
    actions: results,
    rotationDamage,
    personalDirectRotationDps: rotationDamage / rotationSeconds,
    finalAeroErosionStacksObserved: target.snapshot().observedStacks,
    finalMusicalEssence: musicalEssence,
    outroReached: true,
    excludesOptionalTonicEvents: true,
  };
}
