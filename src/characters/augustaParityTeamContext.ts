/**
 * Historical V9.15 parity input, not a current canonical teammate-buff table.
 * The mixed ATK aggregate and action-driven Wan Light ramp are intentionally
 * preserved until the actual current support package has execution proof.
 */
export const AUGUSTA_PARITY_TEAM_ID = 'augusta-iuno-shorekeeper' as const;

export interface AugustaParityTeamContext {
  readonly basis: 'HISTORICAL_V9_15_PARITY_ONLY';
  readonly teamProfileId: typeof AUGUSTA_PARITY_TEAM_ID;
  /** Historical mixed support/weapon aggregate; not a resolved team ATK bonus. */
  readonly historicalAdditionalAtkPct: number;
  readonly shorekeeperCritRate: number;
  readonly shorekeeperCritDamage: number;
  readonly staticAllDamageAmplification: number;
  readonly staticHeavyAmplification: number;
  readonly wanLightAmplificationPerStack: number;
  readonly wanLightCap: number;
}

export const AUGUSTA_PARITY_TEAM_CONTEXT: AugustaParityTeamContext = Object.freeze({
  basis: 'HISTORICAL_V9_15_PARITY_ONLY',
  teamProfileId: AUGUSTA_PARITY_TEAM_ID,
  historicalAdditionalAtkPct: 0.37,
  shorekeeperCritRate: 0.125,
  shorekeeperCritDamage: 0.25,
  staticAllDamageAmplification: 0.15,
  staticHeavyAmplification: 0.50,
  wanLightAmplificationPerStack: 0.04,
  wanLightCap: 10,
});

export function assertAugustaParityTeamContext(team: AugustaParityTeamContext): void {
  if (!team || team.basis !== 'HISTORICAL_V9_15_PARITY_ONLY'
      || team.teamProfileId !== AUGUSTA_PARITY_TEAM_ID) {
    throw new Error('Augusta parity requires its explicit historical Iuno/Shorekeeper team context; replacement needs resolved execution.');
  }
}
