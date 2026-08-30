import type { ContentProvenance } from './contentRegistry.ts';

export type EchoEffectActivation = 'MAIN_SLOT_PASSIVE' | 'ON_ECHO_CAST' | 'TRANSFER_WINDOW';
export type EchoEffectAppliesTo = 'WIELDER' | 'TEAM' | 'INCOMING_RESONATOR';
export type EchoEffectMechanicsStatus =
  | 'VERIFIED_MODELED'
  | 'VERIFIED_CONDITIONAL'
  | 'ALREADY_MODELED_UPSTREAM';

/**
 * Verified non-damage mechanics attached to an Echo skill/equip state.
 *
 * Deliberately separate from:
 * - raw Echo species identity / Sonata membership
 * - Echo active-skill damage and motion values
 * - character recommendations / default loadouts
 * - team or rotation logic that proves conditional uptime
 *
 * Missing records mean pending migration, never "this Echo has no effect".
 */
export interface EchoEffectModel {
  effectId: string;
  echoId: string;
  statOrEffect: string;
  value: number;
  activation: EchoEffectActivation;
  trigger: string;
  /** Window in which a follow-up condition must occur, when applicable. */
  activationWindowSeconds?: number;
  /** null means permanent while the equip condition remains true. */
  durationSeconds: number | null;
  appliesTo: EchoEffectAppliesTo;
  /**
   * Optional source-verified wielder identity restriction.
   *
   * This is effect applicability, not a recommendation. When present, the
   * effect must fail closed for every canonical character outside this list.
   */
  wielderCharacterIds?: readonly string[];
  requiresIncomingIntro?: boolean;
  mechanicsStatus: EchoEffectMechanicsStatus;
  notes: string;
  provenance: ContentProvenance;
}
