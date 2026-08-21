import type {
  Echo,
  ResourceCost,
  StatRoll,
} from './echoCoreDomain.ts';

export type {
  Echo,
  EchoLevel,
  ResourceCost,
  StatName,
  StatRoll,
} from './echoCoreDomain.ts';

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
