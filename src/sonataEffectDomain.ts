import type { ContentProvenance } from './contentRegistry.ts';

export type SonataEffectType = 'PERMANENT' | 'TRIGGERED' | 'STACKING' | 'SCALING';
export type SonataEffectValueMode = 'FLAT' | 'PER_STACK' | 'PER_INPUT_POINT';
export type SonataEffectAppliesTo = 'SELF' | 'TEAM' | 'INCOMING_RESONATOR';
export type SonataEffectMechanicsStatus =
  | 'VERIFIED_MODELED'
  | 'VERIFIED_CONDITIONAL'
  | 'VALUE_VERIFIED_TRIGGER_PENDING';

/**
 * Executable-ready Sonata effect facts that have already been audited beyond
 * raw set text. This layer is deliberately partial.
 *
 * It is separate from:
 * - Sonata identity/raw source text
 * - character recommendations/loadouts
 * - team/rotation assumptions that decide uptime
 * - character-specific combat adapters
 *
 * A missing record means "not migrated/audited here yet", never "the Sonata
 * has no effect".
 */
export interface SonataEffectModel {
  effectId: string;
  sonataSetId: string;
  pieces: 2 | 3 | 5;
  statOrEffect: string;
  value: number;
  valueMode: SonataEffectValueMode;
  /** Optional hard cap for the resulting bonus, normalized as a decimal. */
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
