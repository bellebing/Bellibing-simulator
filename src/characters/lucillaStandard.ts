import type { CharacterActionFact, CharacterDamageClass } from '../characterMechanicsDomain.ts';
import { defenseMultiplier, expectedDamage, resistanceMultiplier } from '../combat/damageKernel.ts';
import { resolveExactEchoActiveDamage } from '../combat/echoActiveDamageAdapter.ts';
import { getCharacterActionFact } from '../data/characterMechanics.ts';
import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';

export const LUCILLA_STANDARD_ENGINE_MODEL_ID = 'LUCILLA_STANDARD_GLACIO_CHAFE_V1';
export const LUCILLA_STANDARD_ROTATION_SECONDS = 7.34;
export const LUCILLA_GLOMMOTH_ATTACK_ID = 'GLOMMOTH_SUMMON_STOMP';

const CLEAR_AS_DAY_BASIC_BONUS = 0.30;
const SLOW_MOTION_GLACIO_RES_REDUCTION = 0.08;

export const LUCILLA_STANDARD_MODELED_MECHANIC_FACT_IDS = [
  'lucilla-intro-skill-clip-it-clip-it-dmg',
  'lucilla-resonance-skill-phantom-frame-phantom-frame-dmg',
  'lucilla-resonance-skill-phantom-frame-spotlight-dmg',
  'lucilla-resonance-liberation-clear-as-day-clear-as-day-dmg-glacio-chafe-mode',
  'lucilla-resonance-liberation-clear-as-day-basic-attack-tracing-forms-stage-1-dmg',
  'lucilla-resonance-liberation-clear-as-day-basic-attack-tracing-forms-stage-2-dmg',
  'lucilla-resonance-liberation-clear-as-day-basic-attack-tracing-forms-stage-3-dmg',
  'lucilla-forte-circuit-memory-palace-oblivion-dmg-glacio-chafe-mode',
  'lucilla-resonance-liberation-clear-as-day-letting-it-go-dmg-glacio-chafe-mode',
  'lucilla-resource-trace',
  'lucilla-resource-photos',
  'lucilla-inherent-slow-motion',
] as const;

export const LUCILLA_STANDARD_ASSUMED_MECHANIC_FACT_IDS = [
  'lucilla-state-focus-ring',
] as const;

export interface LucillaBuildInputs {
  /** Character + weapon base ATK before percentage/flat assembly. */
  combinedBaseAttack: number;
  /** Static/external ATK% already active at Lucilla entry; excludes Freeze Frame effects owned by this engine. */
  attackPercent: number;
  flatAttack: number;
  critRate: number;
  critDamage: number;
  /** Static/external Glacio DMG; excludes Wishes 2P/5P and Freeze Frame trigger owned by this engine. */
  glacioDamageBonus: number;
  basicAttackDamageBonus: number;
  resonanceSkillDamageBonus: number;
  introSkillDamageBonus: number;
  echoSkillDamageBonus: number;
  allDamageAmplification: number;
  attackerLevel: number;
  enemyDefense: number;
  enemyGlacioResistance: number;
  /** Constant external DEF ignore only. Dynamic Chisa Thread/Bane state is deliberately not synthesized here. */
  defIgnore: number;
  /** Constant external DEF reduction only. Canonical Chisa Havoc Bane is not allowed to use this as blanket uptime. */
  defReduction: number;
  skillLevel: number;
  weaponRank: number;
}

export interface LucillaActionResult {
  readonly eventIndex: number;
  readonly sourceFactId: string | null;
  readonly echoAttackId: string | null;
  readonly name: string;
  readonly damageClass: CharacterDamageClass;
  readonly motionValue: number;
  readonly photosBefore: number;
  readonly photosAfter: number;
  readonly freezeFrameTriggeredBefore: boolean;
  readonly wishesFivePieceBefore: boolean;
  readonly slowMotionBefore: boolean;
  readonly clearAsDayBasicBonusBefore: boolean;
  readonly glacioChafeApplicationsAfter: number;
  readonly damage: number;
}

export interface LucillaRotationResult {
  readonly engineModelId: typeof LUCILLA_STANDARD_ENGINE_MODEL_ID;
  readonly rotationSeconds: number;
  readonly actions: readonly LucillaActionResult[];
  readonly rotationDamage: number;
  readonly personalDirectRotationDps: number;
  readonly finalTrace: number;
  readonly finalPhotos: number;
  readonly glacioChafeApplications: number;
  readonly glommothCastReached: true;
  readonly glommothOutroTransferGuaranteedByBoundedOrder: true;
  readonly outroReached: true;
  readonly excludesGlacioChafeSystemDamage: true;
  readonly excludesDynamicChisaHavocBaneState: true;
}

interface CharacterRecipeAction {
  readonly kind: 'CHARACTER';
  readonly sourceFactId: string;
  readonly traceGainAfter?: number;
  readonly chafeApplicationsAfter?: number;
  readonly requiresPhotos?: number;
  readonly consumesPhotoAfter?: boolean;
  readonly activatesSlowMotionAfter?: boolean;
  readonly activatesClearBasicBonusAfter?: boolean;
}

interface EchoRecipeAction {
  readonly kind: 'ECHO';
  readonly echoId: 'echo-60001955';
  readonly attackId: typeof LUCILLA_GLOMMOTH_ATTACK_ID;
}

type RecipeAction = CharacterRecipeAction | EchoRecipeAction;

/**
 * Damage-bearing execution for the source-tested fast route.
 *
 * The canonical guide sequence keeps Echo timing in a separate note; the measured
 * 7.34-second Hiyuki/Lucilla/Chisa fast route explicitly materializes Glommoth
 * between the Perfect-Release Skill and Clear As Day. Individual action timestamps
 * are intentionally absent, so no time-varying teammate target state is invented.
 */
const LUCILLA_STANDARD_RECIPE: readonly RecipeAction[] = [
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-intro-skill-clip-it-clip-it-dmg',
    traceGainAfter: 100,
    chafeApplicationsAfter: 1,
  },
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-resonance-skill-phantom-frame-phantom-frame-dmg',
  },
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-resonance-skill-phantom-frame-spotlight-dmg',
    traceGainAfter: 50,
    chafeApplicationsAfter: 1,
    activatesSlowMotionAfter: true,
  },
  {
    kind: 'ECHO',
    echoId: 'echo-60001955',
    attackId: LUCILLA_GLOMMOTH_ATTACK_ID,
  },
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-resonance-liberation-clear-as-day-clear-as-day-dmg-glacio-chafe-mode',
    requiresPhotos: 3,
    activatesClearBasicBonusAfter: true,
  },
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-resonance-liberation-clear-as-day-basic-attack-tracing-forms-stage-1-dmg',
  },
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-resonance-liberation-clear-as-day-basic-attack-tracing-forms-stage-2-dmg',
  },
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-resonance-liberation-clear-as-day-basic-attack-tracing-forms-stage-3-dmg',
  },
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-forte-circuit-memory-palace-oblivion-dmg-glacio-chafe-mode',
    requiresPhotos: 1,
    consumesPhotoAfter: true,
    chafeApplicationsAfter: 1,
  },
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-forte-circuit-memory-palace-oblivion-dmg-glacio-chafe-mode',
    requiresPhotos: 1,
    consumesPhotoAfter: true,
    chafeApplicationsAfter: 1,
  },
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-forte-circuit-memory-palace-oblivion-dmg-glacio-chafe-mode',
    requiresPhotos: 1,
    consumesPhotoAfter: true,
    chafeApplicationsAfter: 1,
  },
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-resonance-liberation-clear-as-day-letting-it-go-dmg-glacio-chafe-mode',
  },
] as const;

function characterAction(factId: string): CharacterActionFact {
  const fact = getCharacterActionFact(factId);
  if (!fact) throw new Error(`Missing Lucilla Character action fact ${factId}.`);
  if (fact.characterId !== 'lucilla') throw new Error(`Lucilla engine cannot consume ${fact.characterId} fact ${factId}.`);
  if (fact.actionRole !== 'DAMAGE' || fact.scalingStat !== 'ATK' || !fact.damageClass) {
    throw new Error(`Lucilla engine requires one ATK-scaling DAMAGE class for ${factId}.`);
  }
  return fact;
}

function motionValueAtLevel(fact: CharacterActionFact, skillLevel: number): number {
  if (!Number.isInteger(skillLevel) || skillLevel < 1 || skillLevel > 10) {
    throw new Error(`Lucilla skill level must be an integer 1-10, got ${skillLevel}.`);
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

function weaponRankValue(effectId: string, rank: number): number {
  const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === effectId);
  if (!effect) throw new Error(`Missing weapon effect ${effectId}.`);
  const value = effect.rankValues[rank - 1];
  if (value === undefined) throw new Error(`${effectId}: missing rank ${rank}.`);
  return value;
}

function sonataValue(effectId: string): number {
  const effect = SONATA_EFFECT_MODELS.find((row) => row.effectId === effectId);
  if (!effect) throw new Error(`Missing Sonata effect ${effectId}.`);
  return effect.value;
}

function classBonus(damageClass: CharacterDamageClass, build: LucillaBuildInputs): number {
  switch (damageClass) {
    case 'BASIC': return build.basicAttackDamageBonus;
    case 'SKILL': return build.resonanceSkillDamageBonus;
    case 'INTRO': return build.introSkillDamageBonus;
    case 'ECHO': return build.echoSkillDamageBonus;
    default:
      throw new Error(`Lucilla standard rotation does not support ${damageClass} direct-hit damage.`);
  }
}

function validateBuild(build: LucillaBuildInputs): void {
  const finite = [
    build.combinedBaseAttack,
    build.attackPercent,
    build.flatAttack,
    build.critRate,
    build.critDamage,
    build.glacioDamageBonus,
    build.basicAttackDamageBonus,
    build.resonanceSkillDamageBonus,
    build.introSkillDamageBonus,
    build.echoSkillDamageBonus,
    build.allDamageAmplification,
    build.attackerLevel,
    build.enemyDefense,
    build.enemyGlacioResistance,
    build.defIgnore,
    build.defReduction,
  ];
  if (finite.some((value) => !Number.isFinite(value))) throw new Error('Lucilla build contains a non-finite numeric input.');
  if (build.combinedBaseAttack <= 0) throw new Error('Lucilla combinedBaseAttack must be positive.');
  if (build.attackerLevel <= 0) throw new Error('Lucilla attackerLevel must be positive.');
  if (build.enemyDefense < 0) throw new Error('Lucilla enemyDefense cannot be negative.');
  if (!Number.isInteger(build.skillLevel) || build.skillLevel < 1 || build.skillLevel > 10) throw new Error('Lucilla skillLevel must be 1-10.');
  if (!Number.isInteger(build.weaponRank) || build.weaponRank < 1 || build.weaponRank > 5) throw new Error('Freeze Frame weaponRank must be 1-5.');
}

export function evaluateLucillaStandardRotation(build: LucillaBuildInputs): LucillaRotationResult {
  validateBuild(build);

  const ffPermanentAtk = weaponRankValue('FF-ATK', build.weaponRank);
  const ffTriggeredGlacio = weaponRankValue('FF-GLACIO', build.weaponRank);
  const ffTriggeredTeamAtk = weaponRankValue('FF-TEAM-ATK', build.weaponRank);
  const wishesTwoPieceGlacio = sonataValue('S30_2PC_GLACIO');
  const wishesFivePieceGlacio = sonataValue('S30_5PC_GLACIO');
  const glommoth = resolveExactEchoActiveDamage('echo-60001955', LUCILLA_GLOMMOTH_ATTACK_ID);
  if (glommoth.scalingStat !== 'ATK' || glommoth.element !== 'Glacio') {
    throw new Error('Lucilla Glommoth execution requires exact ATK-scaling Glacio active damage.');
  }

  let trace = 0;
  let photos = 0;
  let chafeApplications = 0;
  let freezeFrameTriggered = false;
  let wishesFivePieceActive = false;
  let slowMotionActive = false;
  let clearBasicBonusActive = false;
  const results: LucillaActionResult[] = [];

  for (const [eventIndex, recipe] of LUCILLA_STANDARD_RECIPE.entries()) {
    const photosBefore = photos;
    const freezeBefore = freezeFrameTriggered;
    const wishesBefore = wishesFivePieceActive;
    const slowBefore = slowMotionActive;
    const clearBasicBefore = clearBasicBonusActive;

    let sourceFactId: string | null = null;
    let echoAttackId: string | null = null;
    let name: string;
    let damageClass: CharacterDamageClass;
    let motionValue: number;

    if (recipe.kind === 'CHARACTER') {
      const fact = characterAction(recipe.sourceFactId);
      if (recipe.requiresPhotos !== undefined && photos < recipe.requiresPhotos) {
        throw new Error(`${fact.factId}: requires ${recipe.requiresPhotos} Photos, has ${photos}.`);
      }
      sourceFactId = fact.factId;
      name = fact.name;
      damageClass = fact.damageClass as CharacterDamageClass;
      motionValue = motionValueAtLevel(fact, build.skillLevel);
    } else {
      echoAttackId = recipe.attackId;
      name = glommoth.name;
      damageClass = 'ECHO';
      motionValue = glommoth.motionValue;
    }

    const totalAttack = build.combinedBaseAttack * (
      1
      + build.attackPercent
      + ffPermanentAtk
      + (freezeFrameTriggered ? ffTriggeredTeamAtk : 0)
    ) + build.flatAttack;
    const glacioBonus = build.glacioDamageBonus
      + wishesTwoPieceGlacio
      + (freezeFrameTriggered ? ffTriggeredGlacio : 0)
      + (wishesFivePieceActive ? wishesFivePieceGlacio : 0);
    const damageBonus = glacioBonus
      + classBonus(damageClass, build)
      + (damageClass === 'BASIC' && clearBasicBonusActive ? CLEAR_AS_DAY_BASIC_BONUS : 0);
    const defMult = defenseMultiplier({
      attackerLevel: build.attackerLevel,
      enemyDefense: build.enemyDefense,
      defIgnore: build.defIgnore,
      defReduction: build.defReduction,
    });
    const resMult = resistanceMultiplier(
      build.enemyGlacioResistance,
      slowMotionActive ? SLOW_MOTION_GLACIO_RES_REDUCTION : 0,
    );
    const damage = expectedDamage({
      scalingStat: totalAttack,
      motionValue,
      damageBonus,
      amplification: build.allDamageAmplification,
      critRate: build.critRate,
      critDamage: build.critDamage,
      defenseMultiplier: defMult,
      resistanceMultiplier: resMult,
    });

    let applicationsAfter = 0;
    if (recipe.kind === 'CHARACTER') {
      if (recipe.traceGainAfter) {
        const oldTrace = trace;
        trace = Math.min(150, trace + recipe.traceGainAfter);
        const restored = trace - oldTrace;
        photos = Math.min(3, photos + Math.floor(restored / 50));
      }
      if (recipe.consumesPhotoAfter) photos -= 1;
      if (recipe.chafeApplicationsAfter) {
        applicationsAfter = recipe.chafeApplicationsAfter;
        chafeApplications += applicationsAfter;
        // Trigger order is deliberately post-damage unless the source proves
        // the state existed before the hit. Intro therefore never buffs itself.
        freezeFrameTriggered = true;
        wishesFivePieceActive = true;
      }
      if (recipe.activatesSlowMotionAfter) slowMotionActive = true;
      if (recipe.activatesClearBasicBonusAfter) clearBasicBonusActive = true;
    }

    results.push({
      eventIndex,
      sourceFactId,
      echoAttackId,
      name,
      damageClass,
      motionValue,
      photosBefore,
      photosAfter: photos,
      freezeFrameTriggeredBefore: freezeBefore,
      wishesFivePieceBefore: wishesBefore,
      slowMotionBefore: slowBefore,
      clearAsDayBasicBonusBefore: clearBasicBefore,
      glacioChafeApplicationsAfter: applicationsAfter,
      damage,
    });
  }

  if (photos !== 0) throw new Error(`Lucilla standard rotation must consume all 3 Photos, has ${photos}.`);
  if (!freezeFrameTriggered || !wishesFivePieceActive || !slowMotionActive || !clearBasicBonusActive) {
    throw new Error('Lucilla standard rotation did not reach all required self execution states.');
  }

  const rotationDamage = results.reduce((sum, row) => sum + row.damage, 0);
  return {
    engineModelId: LUCILLA_STANDARD_ENGINE_MODEL_ID,
    rotationSeconds: LUCILLA_STANDARD_ROTATION_SECONDS,
    actions: results,
    rotationDamage,
    personalDirectRotationDps: rotationDamage / LUCILLA_STANDARD_ROTATION_SECONDS,
    finalTrace: trace,
    finalPhotos: photos,
    glacioChafeApplications: chafeApplications,
    glommothCastReached: true,
    // Echo is explicitly after Intro/Skill and before Outro inside a total 7.34s
    // rotation, so Outro must occur less than 15s after the summon even without
    // fabricating an individual Echo timestamp.
    glommothOutroTransferGuaranteedByBoundedOrder: true,
    outroReached: true,
    excludesGlacioChafeSystemDamage: true,
    excludesDynamicChisaHavocBaneState: true,
  };
}
