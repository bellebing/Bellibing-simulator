import {
  defenseMultiplier,
  expectedDamage,
  resistanceMultiplier,
} from '../combat/damageKernel.ts';

export type AugustaActionClass = 'HEAVY' | 'SKILL' | 'INTRO' | 'ECHO' | 'SETUP' | 'BOUNDARY';

export interface AugustaAction {
  step: string;
  actor: 'Augusta' | 'The False Sovereign';
  name: string;
  motionValue: number;
  actionClass: AugustaActionClass;
  included: boolean;
  crownActive: boolean;
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

export const AUGUSTA_STANDARD_ACTIONS: AugustaAction[] = [
  { step: '1', actor: 'Augusta', name: 'Intro Skill — Stride of Goldenflare', motionValue: 1.9882, actionClass: 'INTRO', included: true, crownActive: true },
  { step: '1E', actor: 'The False Sovereign', name: 'Automatic Intro summon', motionValue: 4.05, actionClass: 'ECHO', included: true, crownActive: true },
  { step: '2', actor: 'Augusta', name: 'Heavy Attack — Thunderoar: Backstep', motionValue: 0.5368, actionClass: 'HEAVY', included: true, crownActive: true },
  { step: '3', actor: 'Augusta', name: 'Heavy Attack — Thunderoar: Spinslash', motionValue: 4.2516, actionClass: 'HEAVY', included: true, crownActive: true },
  { step: '4', actor: 'Augusta', name: "Resonance Skill — Warrior's Blade", motionValue: 6.561, actionClass: 'SKILL', included: true, crownActive: true },
  { step: '5', actor: 'Augusta', name: 'Heavy Attack — Thunderoar: Backstep', motionValue: 0.5368, actionClass: 'HEAVY', included: true, crownActive: true },
  { step: '6', actor: 'Augusta', name: 'Heavy Attack — Thunderoar: Spinslash', motionValue: 4.2516, actionClass: 'HEAVY', included: true, crownActive: true },
  { step: '7', actor: 'Augusta', name: 'Resonance Liberation — Sword of Eternal Oath', motionValue: 10.9948, actionClass: 'HEAVY', included: true, crownActive: true },
  { step: '8', actor: 'Augusta', name: 'Forte Skill — Undying Sunlight: Strike', motionValue: 2.7834, actionClass: 'SKILL', included: true, crownActive: true },
  { step: '9', actor: 'Augusta', name: 'Forte Skill — Undying Sunlight: Leap', motionValue: 2.7835, actionClass: 'SKILL', included: true, crownActive: true },
  { step: '10', actor: 'Augusta', name: 'Forte Skill — Undying Sunlight: Plunge', motionValue: 8.6583, actionClass: 'HEAVY', included: true, crownActive: true },
  { step: '11', actor: 'Augusta', name: 'Resonance Liberation — Sublime is the Sun', motionValue: 0, actionClass: 'SETUP', included: false, crownActive: false },
  { step: '12', actor: 'Augusta', name: 'Sublime is the Sun — Sunborne', motionValue: 10.7361, actionClass: 'HEAVY', included: true, crownActive: true },
  { step: '13', actor: 'Augusta', name: 'Sublime is the Sun — Everbright Protector', motionValue: 11.9293, actionClass: 'HEAVY', included: true, crownActive: true },
  { step: '14', actor: 'The False Sovereign', name: 'Active Echo cast — end of rotation', motionValue: 2.214, actionClass: 'ECHO', included: true, crownActive: false },
  { step: '15', actor: 'Augusta', name: 'Outro — Battlesong of the Unyielding', motionValue: 0, actionClass: 'BOUNDARY', included: false, crownActive: false },
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
