import { PROFILE_REGISTRY } from '../data/profileCatalogs.ts';

export const SIGRIKA_STANDARD_ER_GATE_ADAPTER_ID = 'sigrika-standard-er-gate-v1' as const;
export const SIGRIKA_STANDARD_ER_GATE_PROFILE_ID = 'sigrika-standard-build-stats' as const;
export const SIGRIKA_STANDARD_ER_GATE_TEAM_ID = 'sigrika-qiuyuan-ciaccona' as const;

export interface SigrikaEnergyRegenGateResult {
  readonly adapterId: typeof SIGRIKA_STANDARD_ER_GATE_ADAPTER_ID;
  readonly statTargetProfileId: typeof SIGRIKA_STANDARD_ER_GATE_PROFILE_ID;
  readonly teamProfileId: typeof SIGRIKA_STANDARD_ER_GATE_TEAM_ID;
  readonly totalEnergyRegen: number;
  readonly minimum: 1.09;
  readonly preferred: 1.19;
  readonly passesMinimum: boolean;
  readonly meetsPreferred: boolean;
}

function resolveCanonicalGate() {
  const statTarget = PROFILE_REGISTRY.statTargets.get(SIGRIKA_STANDARD_ER_GATE_PROFILE_ID);
  if (!statTarget) throw new Error(`Missing Sigrika stat target ${SIGRIKA_STANDARD_ER_GATE_PROFILE_ID}`);
  if (statTarget.characterId !== 'sigrika' || statTarget.verificationStatus !== 'VERIFIED') {
    throw new Error(`${SIGRIKA_STANDARD_ER_GATE_PROFILE_ID}: expected VERIFIED Sigrika stat target`);
  }

  const gate = statTarget.gates.find((row) => row.stat === 'Energy Regen Total');
  if (!gate) throw new Error(`${SIGRIKA_STANDARD_ER_GATE_PROFILE_ID}: missing Energy Regen Total gate`);
  if (gate.minimum !== 1.09 || gate.preferred !== 1.19) {
    throw new Error(`${SIGRIKA_STANDARD_ER_GATE_PROFILE_ID}: expected canonical 1.09 / 1.19 ER gate`);
  }

  const team = PROFILE_REGISTRY.teams.get(SIGRIKA_STANDARD_ER_GATE_TEAM_ID);
  if (!team) throw new Error(`Missing Sigrika team ${SIGRIKA_STANDARD_ER_GATE_TEAM_ID}`);
  if (team.verificationStatus !== 'VERIFIED') {
    throw new Error(`${SIGRIKA_STANDARD_ER_GATE_TEAM_ID}: team must remain VERIFIED`);
  }
  const members = team.members.map((row) => row.characterId);
  if (members.length !== 3
      || members[0] !== 'sigrika'
      || members[1] !== 'qiuyuan'
      || members[2] !== 'ciaccona') {
    throw new Error(`${SIGRIKA_STANDARD_ER_GATE_TEAM_ID}: canonical team drifted from Sigrika/Qiuyuan/Ciaccona`);
  }

  return { statTarget, gate, team } as const;
}

export const SIGRIKA_STANDARD_ER_GATE_CONTRACT = Object.freeze({
  adapterId: SIGRIKA_STANDARD_ER_GATE_ADAPTER_ID,
  statTargetProfileId: SIGRIKA_STANDARD_ER_GATE_PROFILE_ID,
  teamProfileId: SIGRIKA_STANDARD_ER_GATE_TEAM_ID,
  sourceCharacterId: 'sigrika',
  sourceTeamMembers: ['sigrika', 'qiuyuan', 'ciaccona'] as const,
  minimum: 1.09,
  preferred: 1.19,
  sourceDisposition: '109% maps to Qiuyuan + Ciaccona; 119% maps to Qiuyuan + Shorekeeper in current Prydwen Sigrika source.',
} as const);

export function evaluateSigrikaStandardEnergyRegenGate(totalEnergyRegen: number): SigrikaEnergyRegenGateResult {
  if (!Number.isFinite(totalEnergyRegen) || totalEnergyRegen < 0) {
    throw new Error(`Sigrika total Energy Regen must be finite and non-negative: ${totalEnergyRegen}`);
  }
  const { gate } = resolveCanonicalGate();
  return Object.freeze({
    adapterId: SIGRIKA_STANDARD_ER_GATE_ADAPTER_ID,
    statTargetProfileId: SIGRIKA_STANDARD_ER_GATE_PROFILE_ID,
    teamProfileId: SIGRIKA_STANDARD_ER_GATE_TEAM_ID,
    totalEnergyRegen,
    minimum: gate.minimum as 1.09,
    preferred: gate.preferred as 1.19,
    passesMinimum: totalEnergyRegen >= gate.minimum,
    meetsPreferred: totalEnergyRegen >= (gate.preferred ?? gate.minimum),
  });
}

export function validateSigrikaStandardEnergyRegenGateContract(): readonly string[] {
  const issues: string[] = [];
  try {
    const { gate } = resolveCanonicalGate();
    if (!gate.notes?.includes('109%-119%')) issues.push('Sigrika ER gate must preserve 109%-119% source note');
  } catch (error) {
    issues.push(error instanceof Error ? error.message : String(error));
  }
  return Object.freeze(issues);
}

const CONTRACT_ISSUES = validateSigrikaStandardEnergyRegenGateContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Sigrika canonical ER gate contract: ${CONTRACT_ISSUES.join('; ')}`);
}
