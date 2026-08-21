export type StatName =
  | 'CRIT Rate'
  | 'CRIT DMG'
  | 'ATK%'
  | 'Flat ATK'
  | 'Energy Regen'
  | 'Basic Attack DMG'
  | 'Heavy Attack DMG'
  | 'Skill DMG'
  | 'Liberation DMG'
  | 'HP%'
  | 'Flat HP'
  | 'DEF%'
  | 'Flat DEF'
  | string;

export interface StatRoll {
  name: StatName;
  value: number;
}

export type EchoLevel = 0 | 5 | 10 | 15 | 20 | 25;

export interface Echo {
  id: string;
  cost: 1 | 3 | 4;
  mainStat: StatRoll;
  level: EchoLevel;
  substats: StatRoll[];
}

export interface WeaponSelection {
  id: string;
  rank: number;
}

export interface BuildContext {
  characterId: string;
  sequence: number;
  weapon: WeaponSelection;
  teamId: string;
  echoes: Echo[];
  /** Product default: true. Skills are not a normal user input. */
  maxSkills: true;
  /** Versioned, source-backed standard rotation selected internally. */
  rotationProfileId: string;
}

export interface DamageResult {
  personalRotationDps: number;
  energyRegen: number;
  erGate: 'PASS' | 'FAIL' | 'PENDING';
  notes?: string[];
}

export interface DamageEvaluator {
  evaluate(build: BuildContext): DamageResult;
}

export interface ResourceCost {
  echoes: number;
  tuners: number;
  exp: number;
}

export interface UpgradeEconomics {
  successProbability: number;
  expectedCostToSuccess: ResourceCost | null;
  expectedDpsGainOnSuccess: number | null;
  tunersPerOnePercentDps: number | null;
}

export type EchoVerdict =
  | 'KEEP'
  | 'UPGRADE'
  | 'NO_UPGRADE'
  | 'INVALID_ER'
  | 'PENDING_MODEL';

export interface EchoAnalysis {
  slot: number;
  incumbent: DamageResult;
  candidate: DamageResult;
  dpsDelta: number | null;
  dpsDeltaPct: number | null;
  verdict: EchoVerdict;
  statContributions: Array<{
    stat: StatRoll;
    dpsLostIfRemoved: number | null;
    dpsLostIfRemovedPct: number | null;
  }>;
  reasons: string[];
}
