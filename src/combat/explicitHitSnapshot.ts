/** Fully assembled, caller-proven combat values for one explicit hit. */
export interface ExplicitHitSnapshot {
  readonly totalScalingStat: number;
  readonly damageBonus: number;
  readonly amplification: number;
  readonly critRate: number;
  readonly critDamage: number;
  readonly defenseMultiplier: number;
  readonly resistanceMultiplier: number;
  readonly damageReduction: number;
}

/** Shared numeric boundary; source class/stat/element binding stays in each adapter. */
export function assertExplicitHitSnapshot(s: ExplicitHitSnapshot, label: string): void {
  if (!s || [s.totalScalingStat, s.damageBonus, s.amplification, s.critRate, s.critDamage,
    s.defenseMultiplier, s.resistanceMultiplier, s.damageReduction].some((value) => !Number.isFinite(value))) {
    throw new Error(`${label} requires a complete finite combat snapshot.`);
  }
  if (s.totalScalingStat <= 0 || s.damageBonus < -1 || s.amplification < -1 || s.critRate < 0 || s.critDamage < 1
      || s.defenseMultiplier < 0 || s.defenseMultiplier > 1 || s.resistanceMultiplier < 0
      || s.damageReduction < 0 || s.damageReduction > 1) {
    throw new Error(`${label} combat snapshot is outside supported bounds.`);
  }
}
