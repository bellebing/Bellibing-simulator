import type { BuildContext, DamageEvaluator, DamageResult, Echo, StatRoll } from '../domain.ts';
import {
  evaluateAugustaStandardRotation,
  type AugustaBuildInputs,
} from './augustaStandard.ts';

const SUPPORTED = {
  characterId: 'augusta',
  sequence: 0,
  weaponId: 'thunderflare-dominion',
  weaponRank: 1,
  teamId: 'augusta-iuno-shorekeeper',
  rotationProfileId: 'AUGUSTA_STD_V1',
} as const;

/**
 * Source-backed S0/R1 standard-context stats that do not come from the five Echo stat cards.
 * The active Echo/set assumptions are still locked to the reviewed Augusta standard context.
 */
const AUGUSTA_STANDARD_NON_ECHO = {
  combinedBaseAtk: 1138,
  fixedAtkPct: 0.12,
  fixedCritRate: 0.2515, // 5% base + 12.15% weapon + 8% minor forte
  fixedCritDamage: 1.5,
  fixedElectroDamage: 0.12, // False Sovereign main-slot passive already modeled upstream
  fixedHeavyDamage: 0.12, // False Sovereign main-slot passive already modeled upstream
  baseEnergyRegen: 1,
} as const;

function allRolls(echo: Echo): StatRoll[] {
  return [echo.mainStat, ...echo.substats];
}

function sumStat(echoes: Echo[], name: string): number {
  let total = 0;
  for (const echo of echoes) {
    for (const stat of allRolls(echo)) {
      if (stat.name === name) total += stat.value;
    }
  }
  return total;
}

/** Secondary main stats are automatic game data, not user input. */
function automaticFlatAtk(echoes: Echo[]): number {
  return echoes.reduce((sum, echo) => {
    if (echo.cost === 4) return sum + 150;
    if (echo.cost === 3) return sum + 100;
    return sum;
  }, 0);
}

export function augustaInputsFromEchoes(echoes: Echo[]): AugustaBuildInputs {
  const atkPct = AUGUSTA_STANDARD_NON_ECHO.fixedAtkPct + sumStat(echoes, 'ATK%');
  const flatAtk = automaticFlatAtk(echoes) + sumStat(echoes, 'Flat ATK');

  return {
    upstreamAtk: AUGUSTA_STANDARD_NON_ECHO.combinedBaseAtk * (1 + atkPct) + flatAtk,
    upstreamCritRate: AUGUSTA_STANDARD_NON_ECHO.fixedCritRate + sumStat(echoes, 'CRIT Rate'),
    upstreamCritDamage: AUGUSTA_STANDARD_NON_ECHO.fixedCritDamage + sumStat(echoes, 'CRIT DMG'),
    upstreamHeavyDamage:
      AUGUSTA_STANDARD_NON_ECHO.fixedHeavyDamage + sumStat(echoes, 'Heavy Attack DMG'),
    upstreamElectroDamage:
      AUGUSTA_STANDARD_NON_ECHO.fixedElectroDamage + sumStat(echoes, 'Electro DMG'),
    skillDamage: sumStat(echoes, 'Skill DMG'),
    introDamage: 0,
    echoDamage: 0,
    energyRegen: AUGUSTA_STANDARD_NON_ECHO.baseEnergyRegen + sumStat(echoes, 'Energy Regen'),
  };
}

function isSupported(build: BuildContext): boolean {
  return (
    build.characterId === SUPPORTED.characterId &&
    build.sequence === SUPPORTED.sequence &&
    build.weapon.id === SUPPORTED.weaponId &&
    build.weapon.rank === SUPPORTED.weaponRank &&
    build.teamId === SUPPORTED.teamId &&
    build.rotationProfileId === SUPPORTED.rotationProfileId &&
    build.maxSkills === true
  );
}

export const augustaStandardEchoDamageEvaluator: DamageEvaluator = {
  evaluate(build: BuildContext): DamageResult {
    if (!isSupported(build)) {
      return {
        personalRotationDps: Number.NaN,
        energyRegen: Number.NaN,
        erGate: 'PENDING',
        notes: [
          'Only the verified Augusta S0 / Thunderflare Dominion R1 / Iuno + Shorekeeper / AUGUSTA_STD_V1 profile context is active in the app foundation.',
        ],
      };
    }

    const result = evaluateAugustaStandardRotation(augustaInputsFromEchoes(build.echoes));
    return {
      personalRotationDps: result.personalRotationDps,
      energyRegen: result.energyRegen,
      erGate: result.erGate,
      notes: ['Exact V9.15 action-event parity context, selected through canonical profile IDs.'],
    };
  },
};

export const AUGUSTA_LIVE_CURRENT_ECHOES_2026_08_21: Echo[] = [
  {
    id: 'ECHO_1', cost: 4, level: 25,
    mainStat: { name: 'CRIT Rate', value: 0.22 },
    substats: [
      { name: 'CRIT DMG', value: 0.174 },
      { name: 'ATK%', value: 0.064 },
      { name: 'Energy Regen', value: 0.092 },
      { name: 'Flat DEF', value: 40 },
      { name: 'Flat HP', value: 470 },
    ],
  },
  {
    id: 'ECHO_2', cost: 3, level: 25,
    mainStat: { name: 'Electro DMG', value: 0.30 },
    substats: [
      { name: 'CRIT DMG', value: 0.174 },
      { name: 'Flat ATK', value: 30 },
      { name: 'Energy Regen', value: 0.092 },
      { name: 'Flat DEF', value: 50 },
      { name: 'Liberation DMG', value: 0.094 },
    ],
  },
  {
    id: 'ECHO_3', cost: 3, level: 25,
    mainStat: { name: 'Electro DMG', value: 0.30 },
    substats: [
      { name: 'CRIT DMG', value: 0.15 },
      { name: 'Heavy Attack DMG', value: 0.094 },
      { name: 'Basic Attack DMG', value: 0.086 },
      { name: 'Flat HP', value: 430 },
      { name: 'CRIT Rate', value: 0.063 },
    ],
  },
  {
    id: 'ECHO_4', cost: 1, level: 25,
    mainStat: { name: 'ATK%', value: 0.18 },
    substats: [
      { name: 'CRIT Rate', value: 0.093 },
      { name: 'HP%', value: 0.086 },
      { name: 'Heavy Attack DMG', value: 0.094 },
      { name: 'ATK%', value: 0.079 },
      { name: 'Skill DMG', value: 0.079 },
    ],
  },
  {
    id: 'ECHO_5', cost: 1, level: 25,
    mainStat: { name: 'ATK%', value: 0.18 },
    substats: [
      { name: 'Heavy Attack DMG', value: 0.079 },
      { name: 'CRIT Rate', value: 0.081 },
      { name: 'HP%', value: 0.086 },
      { name: 'ATK%', value: 0.064 },
      { name: 'Liberation DMG', value: 0.101 },
    ],
  },
];

export const AUGUSTA_LIVE_CURRENT_BUILD_2026_08_21: BuildContext = {
  characterId: SUPPORTED.characterId,
  sequence: SUPPORTED.sequence,
  weapon: { id: SUPPORTED.weaponId, rank: SUPPORTED.weaponRank },
  teamId: SUPPORTED.teamId,
  echoes: AUGUSTA_LIVE_CURRENT_ECHOES_2026_08_21,
  maxSkills: true,
  rotationProfileId: SUPPORTED.rotationProfileId,
};
