import {
  defenseMultiplier,
  expectedDamage,
  resistanceMultiplier,
} from '../combat/damageKernel.ts';
import type { CharacterActionFact } from '../characterMechanicsDomain.ts';
import { getCharacterActionFact } from '../data/characterMechanics.ts';
import { ECHO_ATTACK_PROFILES } from '../data/echoAttacks.ts';
import { totalMotionValue } from '../echoAttackDomain.ts';
import { createEchoAttackRegistry } from '../echoAttackRegistry.ts';

export type AugustaActionClass = 'HEAVY' | 'SKILL' | 'INTRO' | 'ECHO' | 'SETUP' | 'BOUNDARY';

export interface AugustaAction {
  step: string;
  actor: 'Augusta' | 'The False Sovereign';
  name: string;
  motionValue: number;
  actionClass: AugustaActionClass;
  included: boolean;
  crownActive: boolean;
  /** Character mechanic fact id or Echo attack id that owns the raw action value. */
  sourceFactId?: string;
}

export interface AugustaBuildInputs {
  upstreamAtk: number;
  upstreamCritRate: number;
  upstreamCritDamage: number;
  upstreamHeavyDamage: number;
  upstreamElectroDamage: number;
  skillDamage: number;
  introDamage: number;
  echoDamage: number;
  energyRegen: number;
}

export interface AugustaStandardContext {
  attackerLevel: number;
  enemyDefense: number;
  enemyResistance: number;
  rotationSeconds: number;
  combinedBaseAtk: number;
  staticContextAtkPct: number;
  shorekeeperCritRate: number;
  shorekeeperCritDamage: number;
  staticSetElectroDamage: number;
  crownElectroDamage: number;
  selectedWeaponHeavyDamage: number;
  staticAllDamageAmplification: number;
  staticHeavyAmplification: number;
  covAtkPerStack: number;
  covCritDamagePerStack: number;
  covCap: number;
  wanLightAmplificationPerStack: number;
  wanLightCap: number;
  weaponDefIgnorePerStack: number;
  weaponDefIgnoreCap: number;
  erHardFloor: number;
}

export interface AugustaActionResult {
  step: string;
  name: string;
  actor: AugustaAction['actor'];
  covStacks: number;
  wanLightStacks: number;
  weaponDefStacks: number;
  shieldEventAfter: boolean;
  damage: number;
}

export interface AugustaRotationResult {
  actions: AugustaActionResult[];
  rotationDamage: number;
  personalRotationDps: number;
  energyRegen: number;
  erGate: 'PASS' | 'FAIL';
}

function augustaActionClass(fact: CharacterActionFact): AugustaActionClass {
  switch (fact.damageClass) {
    case 'HEAVY': return 'HEAVY';
    case 'SKILL': return 'SKILL';
    case 'INTRO': return 'INTRO';
    case null:
      if (fact.actionKind === 'STATE_CHANGE') return 'SETUP';
      if (fact.actionKind === 'OUTRO') return 'BOUNDARY';
      break;
    case 'BASIC':
    case 'LIBERATION':
    case 'OUTRO':
    case 'COORDINATED':
    case 'OTHER':
      break;
  }
  throw new Error(`Augusta Standard has no adapter for action fact ${fact.factId} (${String(fact.damageClass)})`);
}

function characterAction(
  step: string,
  factId: string,
  included: boolean,
  crownActive: boolean,
): AugustaAction {
  const fact = getCharacterActionFact(factId);
  if (!fact) throw new Error(`Missing Augusta character action fact: ${factId}`);
  if (fact.characterId !== 'augusta') throw new Error(`Augusta rotation cannot consume ${fact.characterId} fact ${factId}`);
  if (included && fact.motionValue === null) throw new Error(`Included Augusta damage action has no motion value: ${factId}`);
  return {
    step,
    actor: 'Augusta',
    name: fact.name,
    motionValue: fact.motionValue ?? 0,
    actionClass: augustaActionClass(fact),
    included,
    crownActive,
    sourceFactId: fact.factId,
  };
}

const ECHO_ATTACK_REGISTRY = createEchoAttackRegistry(ECHO_ATTACK_PROFILES);

function falseSovereignAction(
  step: string,
  attackId: string,
  name: string,
  crownActive: boolean,
): AugustaAction {
  const attack = ECHO_ATTACK_REGISTRY.attackById.get(attackId);
  if (!attack) throw new Error(`Missing False Sovereign Echo attack fact: ${attackId}`);
  return {
    step,
    actor: 'The False Sovereign',
    name,
    motionValue: totalMotionValue(attack),
    actionClass: 'ECHO',
    included: true,
    crownActive,
    sourceFactId: attack.attackId,
  };
}

/**
 * Rotation recipe only. Character/Echo motion values are owned by their raw
 * fact catalogs and looked up here, so a patched fact has one canonical value.
 */
export const AUGUSTA_STANDARD_ACTIONS: AugustaAction[] = [
  characterAction('1', 'augusta-intro-stride-of-goldenflare', true, true),
  falseSovereignAction('1E', 'FALSE_SOV_INTRO_SUMMON', 'Automatic Intro summon', true),
  characterAction('2', 'augusta-heavy-thunderoar-backstep', true, true),
  characterAction('3', 'augusta-heavy-thunderoar-spinslash', true, true),
  characterAction('4', 'augusta-skill-warriors-blade', true, true),
  characterAction('5', 'augusta-heavy-thunderoar-backstep', true, true),
  characterAction('6', 'augusta-heavy-thunderoar-spinslash', true, true),
  characterAction('7', 'augusta-liberation-sword-of-eternal-oath', true, true),
  characterAction('8', 'augusta-forte-undying-sunlight-strike', true, true),
  characterAction('9', 'augusta-forte-undying-sunlight-leap', true, true),
  characterAction('10', 'augusta-forte-undying-sunlight-plunge', true, true),
  characterAction('11', 'augusta-liberation-sublime-is-the-sun-state', false, false),
  characterAction('12', 'augusta-liberation-sunborne', true, true),
  characterAction('13', 'augusta-liberation-everbright-protector', true, true),
  falseSovereignAction('14', 'FALSE_SOV_ACTIVE_SPIN', 'Active Echo cast — end of rotation', false),
  characterAction('15', 'augusta-outro-battlesong-of-the-unyielding', false, false),
];

export const AUGUSTA_STD_V1: AugustaStandardContext = {
  attackerLevel: 90,
  enemyDefense: 1592,
  enemyResistance: 0.2,
  rotationSeconds: 11.17,
  combinedBaseAtk: 1138,
  staticContextAtkPct: 0.37,
  shorekeeperCritRate: 0.125,
  shorekeeperCritDamage: 0.25,
  staticSetElectroDamage: 0.10,
  crownElectroDamage: 0.15,
  selectedWeaponHeavyDamage: 0.20,
  staticAllDamageAmplification: 0.15,
  staticHeavyAmplification: 0.50,
  covAtkPerStack: 0.06,
  covCritDamagePerStack: 0.04,
  covCap: 5,
  wanLightAmplificationPerStack: 0.04,
  wanLightCap: 10,
  weaponDefIgnorePerStack: 0.072,
  weaponDefIgnoreCap: 5,
  erHardFloor: 1.16,
};

function actionTypeBonus(action: AugustaAction, build: AugustaBuildInputs): number {
  switch (action.actionClass) {
    case 'HEAVY': return build.upstreamHeavyDamage;
    case 'SKILL': return build.skillDamage;
    case 'INTRO': return build.introDamage;
    case 'ECHO': return build.echoDamage;
    case 'SETUP':
    case 'BOUNDARY': return 0;
  }
}

export function evaluateAugustaStandardRotation(
  build: AugustaBuildInputs,
  context: AugustaStandardContext = AUGUSTA_STD_V1,
): AugustaRotationResult {
  const staticAtk = build.upstreamAtk + context.combinedBaseAtk * context.staticContextAtkPct;
  const critRate = Math.min(build.upstreamCritRate + context.shorekeeperCritRate, 1);
  const baseCritDamage = build.upstreamCritDamage + context.shorekeeperCritDamage;
  const resMult = resistanceMultiplier(context.enemyResistance);
  const baseDefMult = defenseMultiplier({
    attackerLevel: context.attackerLevel,
    enemyDefense: context.enemyDefense,
  });

  let covStacks = 0;
  let wanLightStacks = 0;
  let weaponDefStacks = 0;
  const results: AugustaActionResult[] = [];

  for (const action of AUGUSTA_STANDARD_ACTIONS) {
    const isHeavy = action.actionClass === 'HEAVY';
    const shieldEventAfter = action.included && action.actor === 'Augusta';

    let damage = 0;
    if (action.included) {
      const dynamicAtk = staticAtk + context.combinedBaseAtk * context.covAtkPerStack * covStacks;
      const electroDamage =
        build.upstreamElectroDamage +
        context.staticSetElectroDamage +
        (action.crownActive ? context.crownElectroDamage : 0);
      const damageBonus =
        electroDamage +
        actionTypeBonus(action, build) +
        (isHeavy ? context.selectedWeaponHeavyDamage : 0);
      const amplification =
        context.staticAllDamageAmplification +
        context.wanLightAmplificationPerStack * wanLightStacks +
        (isHeavy ? context.staticHeavyAmplification : 0);
      const critDamage = baseCritDamage + context.covCritDamagePerStack * covStacks;
      const defMult = isHeavy
        ? defenseMultiplier({
            attackerLevel: context.attackerLevel,
            enemyDefense: context.enemyDefense,
            defIgnore: context.weaponDefIgnorePerStack * weaponDefStacks,
          })
        : baseDefMult;

      damage = expectedDamage({
        scalingStat: dynamicAtk,
        motionValue: action.motionValue,
        damageBonus,
        amplification,
        critRate,
        critDamage,
        defenseMultiplier: defMult,
        resistanceMultiplier: resMult,
      });
    }

    results.push({
      step: action.step,
      name: action.name,
      actor: action.actor,
      covStacks,
      wanLightStacks,
      weaponDefStacks,
      shieldEventAfter,
      damage,
    });

    if (shieldEventAfter) {
      covStacks = Math.min(context.covCap, covStacks + 1);
      wanLightStacks = Math.min(context.wanLightCap, wanLightStacks + 1);
      weaponDefStacks = Math.min(context.weaponDefIgnoreCap, weaponDefStacks + 1);
    }
  }

  const rotationDamage = results.reduce((sum, row) => sum + row.damage, 0);
  return {
    actions: results,
    rotationDamage,
    personalRotationDps: rotationDamage / context.rotationSeconds,
    energyRegen: build.energyRegen,
    erGate: build.energyRegen >= context.erHardFloor ? 'PASS' : 'FAIL',
  };
}

export const AUGUSTA_LIVE_CURRENT_2026_08_21: AugustaBuildInputs = {
  upstreamAtk: 2299.806,
  upstreamCritRate: 0.7085,
  upstreamCritDamage: 1.998,
  upstreamHeavyDamage: 0.387,
  upstreamElectroDamage: 0.72,
  skillDamage: 0.079,
  introDamage: 0,
  echoDamage: 0,
  energyRegen: 1.184,
};

export const AUGUSTA_LIVE_EXPECTED_2026_08_21: AugustaBuildInputs = {
  upstreamAtk: 2140.9477505000004,
  upstreamCritRate: 0.6023217500000005,
  upstreamCritDamage: 1.589513999999999,
  upstreamHeavyDamage: 0.1923725000000006,
  upstreamElectroDamage: 0.72,
  skillDamage: 0.04940975,
  introDamage: 0,
  echoDamage: 0,
  energyRegen: 1.0737810000000005,
};
