import type { CharacterActionFact, CharacterDamageClass } from '../characterMechanicsDomain.ts';
import { defenseMultiplier, expectedDamage, resistanceMultiplier } from '../combat/damageKernel.ts';
import { getCharacterActionFact } from '../data/characterMechanics.ts';
import { ECHO_EFFECT_MODELS } from '../data/echoEffects.ts';
import { SONATA_EFFECT_MODELS } from '../data/sonataEffects.ts';
import { WEAPON_EFFECT_CATALOG } from '../data/weaponEffectCatalog.ts';

export const LUCILLA_STANDARD_ENGINE_MODEL_ID = 'LUCILLA_STANDARD_GLACIO_CHAFE_V1';
export const LUCILLA_STANDARD_ROTATION_SECONDS = 7.34;
export const LUCILLA_GLOMMOTH_ECHO_ID = 'echo-60001955';
export const LUCILLA_GLOMMOTH_SOURCE_DAMAGE_COEFFICIENT = 2.736;
export const LUCILLA_GLOMMOTH_SCALING_BLOCKER_ID = 'echo:echo-60001955:glommoth-active-skill-scaling-stat';

export const LUCILLA_STANDARD_EXECUTION_SOURCE_URLS = [
  'https://www.prydwen.gg/wuthering-waves/characters/lucilla',
  'https://arabwuwa.com/rotations/hiyuki-and-chisa-with-lucilla-fast-rotation-107/',
  'https://arabwuwa.com/teams/hiyuki-lucilla-chisa-136/',
] as const;

const CLEAR_AS_DAY_BASIC_BONUS = 0.30;
const SLOW_MOTION_GLACIO_RES_REDUCTION = 0.08;
const REMEMBRANCE_FILM_ROLL_PER_PHOTO = 2;
const DEJA_VU_FILM_ROLL = 4;

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
  'lucilla-resource-film-roll',
  'lucilla-inherent-slow-motion',
  'lucilla-inherent-remembrance',
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
  /** Constant external amplification only. Canonical Chisa/Kumokiri state is deliberately not flattened here. */
  allDamageAmplification: number;
  attackerLevel: number;
  enemyDefense: number;
  enemyGlacioResistance: number;
  /** Constant external DEF ignore only. Dynamic Chisa Thread of Bane state is deliberately not synthesized here. */
  defIgnore: number;
  /** Constant external DEF reduction only. Canonical Chisa Havoc Bane is not allowed to use this as blanket uptime. */
  defReduction: number;
  skillLevel: number;
  weaponRank: number;
}

export type LucillaExecutionEventKind = 'CHARACTER_DAMAGE' | 'ECHO_CAST_UNRESOLVED_DAMAGE';

export interface LucillaActionResult {
  readonly eventIndex: number;
  readonly kind: LucillaExecutionEventKind;
  readonly sourceFactId: string | null;
  readonly echoId: string | null;
  readonly name: string;
  readonly damageClass: CharacterDamageClass | null;
  /** Exact source coefficient when known but not executable because its scaling stat is unresolved. */
  readonly sourceDamageCoefficient: number | null;
  readonly motionValue: number | null;
  readonly photosBefore: number;
  readonly photosAfter: number;
  readonly filmRollBefore: number;
  readonly filmRollAfter: number;
  readonly freezeFrameTriggeredBefore: boolean;
  readonly wishesFivePieceBefore: boolean;
  readonly slowMotionBefore: boolean;
  readonly clearAsDayBasicBonusBefore: boolean;
  readonly glacioChafeApplicationsAfter: number;
  readonly damage: number | null;
}

export interface LucillaRotationResult {
  readonly engineModelId: typeof LUCILLA_STANDARD_ENGINE_MODEL_ID;
  readonly rotationSeconds: number;
  readonly actions: readonly LucillaActionResult[];
  /** Sum of only source-resolved executable damage events. */
  readonly sourceResolvedRotationDamage: number;
  /** Source-resolved direct damage divided by the exact 7.34s segment. Not a full canonical DPS claim. */
  readonly sourceResolvedPersonalDirectDps: number;
  readonly fullPersonalRotationDamageResolved: false;
  readonly unresolvedDamageEventIds: readonly [typeof LUCILLA_GLOMMOTH_SCALING_BLOCKER_ID];
  readonly finalTrace: number;
  readonly finalPhotos: number;
  readonly finalFilmRoll: number;
  readonly glacioChafeApplications: number;
  readonly glommothCastReached: true;
  readonly glommothOutroTransferGuaranteedByBoundedOrder: true;
  readonly wishesSnowfallPreservedToOutro: true;
  readonly incomingGlacioDamageBonusFromWishes: number;
  readonly incomingGlacioDamageBonusFromGlommoth: number;
  readonly incomingGlacioDamageBonusTotal: number;
  readonly outroReached: true;
  readonly excludesGlacioChafeSystemDamage: true;
  readonly excludesDynamicChisaHavocBaneState: true;
  readonly excludesChisaThreadOfBaneAndKumokiriState: true;
}

interface CharacterRecipeAction {
  readonly kind: 'CHARACTER';
  readonly sourceFactId: string;
  readonly traceGainAfter?: number;
  readonly filmRollGainAfter?: number;
  readonly chafeApplicationsAfter?: number;
  readonly requiresPhotos?: number;
  readonly consumesPhotoAfter?: boolean;
  readonly activatesSlowMotionAfter?: boolean;
  readonly activatesClearBasicBonusAfter?: boolean;
}

interface EchoRecipeAction {
  readonly kind: 'ECHO';
  readonly echoId: typeof LUCILLA_GLOMMOTH_ECHO_ID;
  readonly name: 'Glommoth — summon/stomp';
  readonly sourceDamageCoefficient: typeof LUCILLA_GLOMMOTH_SOURCE_DAMAGE_COEFFICIENT;
}

type RecipeAction = CharacterRecipeAction | EchoRecipeAction;

/**
 * Ordered execution for the source-tested Hiyuki/Lucilla/Chisa fast route.
 *
 * Prydwen supplies the source-leading Lucilla skeleton and Perfect Release
 * semantics. Arab Wuwa's published S0/R1 fast route materializes Glommoth
 * between Hold Skill and Clear As Day and measures Lucilla's segment at 7.34s.
 * Individual action timestamps are intentionally absent, so every state that
 * needs sub-segment timing remains outside this engine.
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
    echoId: LUCILLA_GLOMMOTH_ECHO_ID,
    name: 'Glommoth — summon/stomp',
    sourceDamageCoefficient: LUCILLA_GLOMMOTH_SOURCE_DAMAGE_COEFFICIENT,
  },
  {
    kind: 'CHARACTER',
    sourceFactId: 'lucilla-resonance-liberation-clear-as-day-clear-as-day-dmg-glacio-chafe-mode',
    requiresPhotos: 3,
    filmRollGainAfter: DEJA_VU_FILM_ROLL,
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

function sonataEffect(effectId: string) {
  const effect = SONATA_EFFECT_MODELS.find((row) => row.effectId === effectId);
  if (!effect) throw new Error(`Missing Sonata effect ${effectId}.`);
  return effect;
}

function echoEffect(effectId: string) {
  const effect = ECHO_EFFECT_MODELS.find((row) => row.effectId === effectId);
  if (!effect) throw new Error(`Missing Echo effect ${effectId}.`);
  return effect;
}

function classBonus(damageClass: CharacterDamageClass, build: LucillaBuildInputs): number {
  switch (damageClass) {
    case 'BASIC': return build.basicAttackDamageBonus;
    case 'SKILL': return build.resonanceSkillDamageBonus;
    case 'INTRO': return build.introSkillDamageBonus;
    default:
      throw new Error(`Lucilla standard source-resolved direct damage does not support ${damageClass}.`);
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
  const wishesTwoPiece = sonataEffect('S30_2PC_GLACIO');
  const wishesFivePiece = sonataEffect('S30_5PC_GLACIO');
  const wishesIncoming = sonataEffect('S30_5PC_INCOMING_GLACIO');
  const glommothIncoming = echoEffect('GLOMMOTH_INCOMING_GLACIO');

  if (wishesFivePiece.durationSeconds !== 15 || wishesIncoming.durationSeconds !== 15) {
    throw new Error('Lucilla Wishes of Quiet Snowfall execution requires the source-locked 15s Snowfall/transfer windows.');
  }
  if (glommothIncoming.activationWindowSeconds !== 15 || glommothIncoming.durationSeconds !== 15) {
    throw new Error('Lucilla Glommoth transfer requires the source-locked 15s activation and incoming windows.');
  }
  if (LUCILLA_STANDARD_ROTATION_SECONDS >= 15) {
    throw new Error('Lucilla bounded-order transfer proof requires the fixed rotation to remain shorter than 15s.');
  }

  let trace = 0;
  let photos = 0;
  let filmRoll = 0;
  let chafeApplications = 0;
  let freezeFrameTriggered = false;
  let wishesFivePieceActive = false;
  let wishesSnowfallActive = false;
  let slowMotionActive = false;
  let clearBasicBonusActive = false;
  let glommothSummoned = false;
  const results: LucillaActionResult[] = [];

  for (const [eventIndex, recipe] of LUCILLA_STANDARD_RECIPE.entries()) {
    const photosBefore = photos;
    const filmRollBefore = filmRoll;
    const freezeBefore = freezeFrameTriggered;
    const wishesBefore = wishesFivePieceActive;
    const slowBefore = slowMotionActive;
    const clearBasicBefore = clearBasicBonusActive;

    if (recipe.kind === 'ECHO') {
      glommothSummoned = true;
      results.push({
        eventIndex,
        kind: 'ECHO_CAST_UNRESOLVED_DAMAGE',
        sourceFactId: null,
        echoId: recipe.echoId,
        name: recipe.name,
        damageClass: null,
        sourceDamageCoefficient: recipe.sourceDamageCoefficient,
        motionValue: null,
        photosBefore,
        photosAfter: photos,
        filmRollBefore,
        filmRollAfter: filmRoll,
        freezeFrameTriggeredBefore: freezeBefore,
        wishesFivePieceBefore: wishesBefore,
        slowMotionBefore: slowBefore,
        clearAsDayBasicBonusBefore: clearBasicBefore,
        glacioChafeApplicationsAfter: 0,
        damage: null,
      });
      continue;
    }

    const fact = characterAction(recipe.sourceFactId);
    if (recipe.requiresPhotos !== undefined && photos < recipe.requiresPhotos) {
      throw new Error(`${fact.factId}: requires ${recipe.requiresPhotos} Photos, has ${photos}.`);
    }
    const motionValue = motionValueAtLevel(fact, build.skillLevel);
    const damageClass = fact.damageClass as CharacterDamageClass;
    const totalAttack = build.combinedBaseAttack * (
      1
      + build.attackPercent
      + ffPermanentAtk
      + (freezeFrameTriggered ? ffTriggeredTeamAtk : 0)
    ) + build.flatAttack;
    const glacioBonus = build.glacioDamageBonus
      + wishesTwoPiece.value
      + (freezeFrameTriggered ? ffTriggeredGlacio : 0)
      + (wishesFivePieceActive ? wishesFivePiece.value : 0);
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
    if (recipe.traceGainAfter) {
      const oldTrace = trace;
      trace = Math.min(150, trace + recipe.traceGainAfter);
      const restored = trace - oldTrace;
      photos = Math.min(3, photos + Math.floor(restored / 50));
    }
    if (recipe.filmRollGainAfter) filmRoll = Math.min(10, filmRoll + recipe.filmRollGainAfter);
    if (recipe.consumesPhotoAfter) {
      photos -= 1;
      filmRoll = Math.min(10, filmRoll + REMEMBRANCE_FILM_ROLL_PER_PHOTO);
    }
    if (recipe.chafeApplicationsAfter) {
      applicationsAfter = recipe.chafeApplicationsAfter;
      chafeApplications += applicationsAfter;
      // Trigger order is deliberately post-damage unless the source proves
      // the state existed before the hit. Intro therefore never buffs itself.
      freezeFrameTriggered = true;
      wishesFivePieceActive = true;
      wishesSnowfallActive = true;
    }
    if (recipe.activatesSlowMotionAfter) slowMotionActive = true;
    if (recipe.activatesClearBasicBonusAfter) clearBasicBonusActive = true;

    results.push({
      eventIndex,
      kind: 'CHARACTER_DAMAGE',
      sourceFactId: fact.factId,
      echoId: null,
      name: fact.name,
      damageClass,
      sourceDamageCoefficient: null,
      motionValue,
      photosBefore,
      photosAfter: photos,
      filmRollBefore,
      filmRollAfter: filmRoll,
      freezeFrameTriggeredBefore: freezeBefore,
      wishesFivePieceBefore: wishesBefore,
      slowMotionBefore: slowBefore,
      clearAsDayBasicBonusBefore: clearBasicBefore,
      glacioChafeApplicationsAfter: applicationsAfter,
      damage,
    });
  }

  if (photos !== 0) throw new Error(`Lucilla standard rotation must consume all 3 Photos, has ${photos}.`);
  if (filmRoll !== 10) throw new Error(`Lucilla standard rotation must leave 10 Film Roll, has ${filmRoll}.`);
  if (!freezeFrameTriggered || !wishesFivePieceActive || !wishesSnowfallActive || !slowMotionActive || !clearBasicBonusActive) {
    throw new Error('Lucilla standard rotation did not reach all required self execution states.');
  }
  if (!glommothSummoned) throw new Error('Lucilla standard rotation did not summon Glommoth.');

  // No source-resolved Lucilla hit in this Glacio-Chafe branch deals Resonance
  // Liberation DMG. Clear As Day is BASIC damage, so the Snowfall CRIT branch
  // never consumes Snowfall before the fixed Outro. The whole segment is 7.34s,
  // shorter than both the 15s Snowfall lifetime and Glommoth arm window.
  const wishesSnowfallPreservedToOutro = results
    .filter((row) => row.kind === 'CHARACTER_DAMAGE')
    .every((row) => row.damageClass !== 'LIBERATION');
  if (!wishesSnowfallPreservedToOutro) {
    throw new Error('Lucilla Glacio-Chafe execution unexpectedly produced Resonance Liberation DMG before Outro.');
  }

  const sourceResolvedRotationDamage = results.reduce((sum, row) => sum + (row.damage ?? 0), 0);
  const incomingGlacioDamageBonusFromWishes = wishesIncoming.value;
  const incomingGlacioDamageBonusFromGlommoth = glommothIncoming.value;

  return {
    engineModelId: LUCILLA_STANDARD_ENGINE_MODEL_ID,
    rotationSeconds: LUCILLA_STANDARD_ROTATION_SECONDS,
    actions: results,
    sourceResolvedRotationDamage,
    sourceResolvedPersonalDirectDps: sourceResolvedRotationDamage / LUCILLA_STANDARD_ROTATION_SECONDS,
    fullPersonalRotationDamageResolved: false,
    unresolvedDamageEventIds: [LUCILLA_GLOMMOTH_SCALING_BLOCKER_ID],
    finalTrace: trace,
    finalPhotos: photos,
    finalFilmRoll: filmRoll,
    glacioChafeApplications: chafeApplications,
    glommothCastReached: true,
    glommothOutroTransferGuaranteedByBoundedOrder: true,
    wishesSnowfallPreservedToOutro: true,
    incomingGlacioDamageBonusFromWishes,
    incomingGlacioDamageBonusFromGlommoth,
    incomingGlacioDamageBonusTotal: incomingGlacioDamageBonusFromWishes + incomingGlacioDamageBonusFromGlommoth,
    outroReached: true,
    excludesGlacioChafeSystemDamage: true,
    excludesDynamicChisaHavocBaneState: true,
    excludesChisaThreadOfBaneAndKumokiriState: true,
  };
}
