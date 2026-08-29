import type { ContentProvenance } from './contentRegistry.ts';

export type SonataActivationPieceCount = 1 | 2 | 3 | 5;
export type SonataEffectType = 'PERMANENT' | 'TRIGGERED' | 'STACKING' | 'SCALING';
export type SonataEffectValueMode = 'FLAT' | 'PER_STACK' | 'PER_INPUT_POINT';
export type SonataEffectAppliesTo =
  | 'SELF'
  | 'TEAM'
  | 'ACTIVE_RESONATOR'
  | 'INCOMING_RESONATOR';
export type SonataEffectMechanicsStatus =
  | 'VERIFIED_MODELED'
  | 'VERIFIED_CONDITIONAL'
  | 'VALUE_VERIFIED_TRIGGER_PENDING';

export type SonataEffectSourceReviewStatus =
  | 'MODELED'
  | 'SOURCE_CONFLICT'
  | 'MODELED_WITH_PENDING_DAMAGE_ADAPTER'
  | 'MODELED_WITH_PENDING_STATE_ADAPTER';

/**
 * Source-audited Sonata effect fact.
 *
 * This layer records source-explicit stat/effect values and their conditions.
 * It does not by itself prove trigger uptime or execute team/rotation state.
 * Non-stat damage branches, state machines and source conflicts are dispositioned
 * separately by SonataActivationSourceReview.
 */
export interface SonataEffectModel {
  effectId: string;
  sonataSetId: string;
  pieces: SonataActivationPieceCount;
  statOrEffect: string;
  value: number;
  valueMode: SonataEffectValueMode;
  /** Optional hard cap for the resulting bonus, normalized as a decimal when the stat is percentage-based. */
  capValue?: number;
  maxStacks?: number;
  effectType: SonataEffectType;
  trigger: string;
  /** null means permanent or state-bound with no fixed numeric duration. */
  durationSeconds: number | null;
  stackIntervalSeconds?: number;
  appliesTo: SonataEffectAppliesTo;
  mechanicsStatus: SonataEffectMechanicsStatus;
  notes: string;
  provenance: ContentProvenance;
}

/**
 * One explicit source-review disposition per released Sonata activation tuple.
 * MODELED rows must have exactly expectedModeledEffectCount SonataEffectModel
 * records. Pending adapter statuses mean the source fact is known but deliberately
 * not misrepresented as a normal stat modifier.
 */
export interface SonataActivationSourceReview {
  sonataSetId: string;
  pieces: SonataActivationPieceCount;
  status: SonataEffectSourceReviewStatus;
  expectedModeledEffectCount: number;
  notes: string;
  provenance: ContentProvenance;
}
