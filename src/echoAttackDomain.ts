import type { ContentProvenance } from './contentRegistry.ts';
import type { Element } from './gameDataDomain.ts';

export type EchoAttackTrigger = 'ACTIVE_CAST' | 'INTRO_AUTO_SUMMON';
export type EchoAttackScalingStat = 'ATK' | 'HP' | 'DEF';

export interface EchoAttackComponent {
  /** Per-hit multiplier as a normalized decimal, e.g. 55.35% = 0.5535. */
  motionValuePerHit: number;
  hits: number;
}

export interface EchoAttackFact {
  attackId: string;
  name: string;
  trigger: EchoAttackTrigger;
  element: Element;
  scalingStat: EchoAttackScalingStat;
  components: readonly EchoAttackComponent[];
}

/**
 * Rank-specific active Echo attack facts only.
 *
 * Non-damage buffs/passives live in EchoEffectModel. Sonata effects and build
 * recommendations live elsewhere. Rotation adapters decide if/when an attack
 * happens; this record only describes the verified attack mechanics.
 */
export interface EchoAttackProfile {
  echoId: string;
  rank: 5;
  cooldownSeconds: number;
  startingCharges?: number;
  maxCharges?: number;
  rechargeSeconds?: number;
  attacks: readonly EchoAttackFact[];
  provenance: ContentProvenance;
}

export function totalMotionValue(attack: EchoAttackFact): number {
  return attack.components.reduce((sum, component) => sum + component.motionValuePerHit * component.hits, 0);
}
