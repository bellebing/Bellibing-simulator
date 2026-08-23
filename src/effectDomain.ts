import type { ContentProvenance } from './contentRegistry.ts';

export type WeaponEffectType = 'PERMANENT' | 'TRIGGERED' | 'STACKING';
export type WeaponEffectAppliesTo = 'SELF' | 'TEAM';
export type WeaponEffectSimulatorMode = 'ALWAYS' | 'RECOMMENDED' | 'MANUAL';
export type WeaponEffectMechanicsStatus = 'VERIFIED_MODELED' | 'VERIFIED_CONDITIONAL';

/** R1 through R5, normalized as decimal multipliers for percentage-based effects. */
export type RankValues = readonly [number, number, number, number, number];

/**
 * Source-backed weapon passive/effect data only.
 *
 * This is deliberately separate from:
 * - raw weapon identity/core stats
 * - which character should use the weapon
 * - team/rotation assumptions that decide whether a trigger is active
 * - executable combat adapters
 *
 * Trigger text is source/audit metadata. A combat model must explicitly decide
 * when a conditional/stacking effect is active rather than silently assuming it.
 */
export interface WeaponEffectData {
  effectId: string;
  weaponId: string;
  statOrEffect: string;
  rankValues: RankValues;
  effectType: WeaponEffectType;
  trigger: string;
  /** null means permanent/passive rather than a timed buff. */
  durationSeconds: number | null;
  maxStacks: number;
  stackIntervalSeconds: number;
  appliesTo: WeaponEffectAppliesTo;
  simulatorMode: WeaponEffectSimulatorMode;
  mechanicsStatus: WeaponEffectMechanicsStatus;
  notes: string;
  provenance: ContentProvenance;
}
