import type { ContentProvenance } from './contentRegistry.ts';

export type WeaponEffectType = 'PERMANENT' | 'INSTANT' | 'TRIGGERED' | 'STACKING' | 'STATE_CONDITIONAL';
export type WeaponEffectAppliesTo = 'SELF' | 'TEAM' | 'TARGET' | 'NEXT_RESONATOR';
export type WeaponEffectValueUnit = 'DECIMAL_MULTIPLIER' | 'FLAT_AMOUNT';
export type WeaponEffectSimulatorMode = 'ALWAYS' | 'RECOMMENDED' | 'MANUAL';
export type WeaponEffectMechanicsStatus =
  | 'VERIFIED_MODELED'
  | 'VERIFIED_CONDITIONAL'
  | 'VERIFIED_RAW_PENDING_MODEL';

/** R1 through R5. The value unit is explicit on each effect record. */
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
 * Trigger text, conditions and cooldowns are source/audit facts. A combat model
 * must explicitly decide when a conditional/stacking effect is active rather
 * than silently assuming uptime.
 */
export interface WeaponEffectData {
  effectId: string;
  weaponId: string;
  statOrEffect: string;
  rankValues: RankValues;
  valueUnit: WeaponEffectValueUnit;
  effectType: WeaponEffectType;
  trigger: string;
  /** null means the effect is not an independently timed buff/debuff (for example permanent, instant, or state-conditional). */
  durationSeconds: number | null;
  /** Minimum time before the passive trigger itself can fire again, when source-defined. */
  triggerCooldownSeconds: number | null;
  maxStacks: number;
  stackIntervalSeconds: number;
  appliesTo: WeaponEffectAppliesTo;
  /** Source-backed prerequisites beyond the trigger event. Empty means no additional condition is known. */
  conditions: readonly string[];
  simulatorMode: WeaponEffectSimulatorMode;
  mechanicsStatus: WeaponEffectMechanicsStatus;
  /** Short source-normalized passive text kept separate from executable fields. */
  sourceEffectText: string | null;
  notes: string;
  provenance: ContentProvenance;
}
