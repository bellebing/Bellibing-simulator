import type {
  Echo,
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
