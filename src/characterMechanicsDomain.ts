import type { ContentProvenance, VerificationStatus } from './contentRegistry.ts';

/** Where the fact lives in the Resonator kit. */
export type CharacterMechanicSection =
  | 'BASIC_ATTACK'
  | 'RESONANCE_SKILL'
  | 'FORTE_CIRCUIT'
  | 'RESONANCE_LIBERATION'
  | 'INTRO_SKILL'
  | 'OUTRO_SKILL'
  | 'TUNE_BREAK'
  | 'INHERENT_SKILL'
  | 'RESONANCE_CHAIN';

/** What the player/system is doing. This is intentionally separate from damage classification. */
export type CharacterActionKind =
  | 'BASIC'
  | 'HEAVY'
  | 'DODGE_COUNTER'
  | 'SKILL'
  | 'FORTE'
  | 'LIBERATION'
  | 'INTRO'
  | 'OUTRO'
  | 'TUNE_BREAK'
  | 'STATE_CHANGE'
  | 'OTHER';

/**
 * Whether the action owns Character motion-value data.
 *
 * `SHARED_SYSTEM_DAMAGE` is reserved for actions such as Tune Break whose
 * character page grants/variants the action while the damage formula belongs to
 * a shared combat system instead of a Character Lv1-Lv10 coefficient table.
 * Never infer any role from nullable fields.
 */
export type CharacterActionRole = 'DAMAGE' | 'SHARED_SYSTEM_DAMAGE' | 'NON_DAMAGE' | 'UNKNOWN';

/** Which damage-bonus bucket the game treats the hit as. */
export type CharacterDamageClass =
  | 'BASIC'
  | 'HEAVY'
  | 'SKILL'
  | 'LIBERATION'
  | 'INTRO'
  | 'OUTRO'
  | 'COORDINATED'
  | 'OTHER';

export type CharacterScalingStat =
  | 'ATK'
  | 'HP'
  | 'DEF'
  | 'TUNE_AMP'
  | 'FIXED'
  | 'MIXED'
  | 'SHARED_SYSTEM'
  | 'UNKNOWN';

/** Exact source-facing skill levels 1 through 10, stored as decimal multipliers. */
export type CharacterMotionValueCurve = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

/**
 * One independently listed damage coefficient inside an action that has mixed
 * hit values, for example `6.99% + 10.48% + 17.47%` or `4.69%*3 + 9.37% + 23.42%`.
 * The curve stores the exact coefficient at Lv1-Lv10; `hitCount` stores only the
 * explicit multiplier attached to that coefficient. Components are raw source
 * structure and must not be collapsed into one total before a combat adapter
 * chooses a skill level.
 */
export interface CharacterMotionValueComponent {
  curve: CharacterMotionValueCurve;
  hitCount: number;
}

/**
 * One source-fixed damage coefficient that does not have a Lv1-Lv10 skill table,
 * for example a fixed Outro coefficient declared directly in kit text.
 * `coefficient` is stored as a decimal multiplier and `hitCount` preserves only
 * an explicit source multiplier. Conditional follow-up coefficients should stay
 * separate facts when their activation semantics differ instead of being summed.
 */
export interface CharacterFixedMotionValueComponent {
  coefficient: number;
  hitCount: number;
}

/**
 * Raw-source verification and executable combat support are different questions.
 * A fact can be source-verified while still waiting for an adapter that knows how
 * to apply its trigger/stack/uptime semantics.
 */
export type CharacterMechanicModelStatus =
  | 'RAW_ONLY'
  | 'MODEL_READY'
  | 'MODELED'
  | 'PENDING_INTERPRETATION';

export type CharacterMechanicFactKind = 'ACTION' | 'PASSIVE' | 'RESOURCE' | 'SEQUENCE';

export interface CharacterMechanicFactBase {
  factId: string;
  characterId: string;
  kind: CharacterMechanicFactKind;
  name: string;
  section: CharacterMechanicSection;
  verificationStatus: VerificationStatus;
  modelingStatus: CharacterMechanicModelStatus;
  /** True when the value/effect only exists under a trigger, state, target or timing condition. */
  conditional: boolean;
  provenance: ContentProvenance;
  notes?: readonly string[];
}

/**
 * Source-backed character action fact.
 *
 * `actionRole`, `section` and `damageClass` are deliberately independent. A
 * Resonance Liberation action may, for example, own damage but be classified by
 * the game as Heavy Attack DMG. A Tune Break action can deal damage through the
 * shared Tune Break combat system without owning a Character motion-value curve.
 * A state/setup action can be explicitly `NON_DAMAGE` without overloading
 * `damageClass: null` as evidence. Rotation engines must consume the explicit
 * fields instead of inferring semantics from nullable data.
 */
export interface CharacterActionFact extends CharacterMechanicFactBase {
  kind: 'ACTION';
  actionKind: CharacterActionKind;
  actionRole: CharacterActionRole;
  damageClass: CharacterDamageClass | null;
  scalingStat: CharacterScalingStat;
  /** null means no selected-level damage scalar is stored; never implicit zero. */
  motionValue: number | null;
  /** Describes the source/value level convention or, for shared-system damage, the ownership boundary. */
  motionValueContext: string | null;
  /**
   * Optional full source curve for skill levels 1-10 when the source action has
   * one coefficient shape. Values are the listed per-hit/source coefficient;
   * `hitCount` stays separate when the source explicitly writes e.g. `24%*2`.
   *
   * For mixed-coefficient actions use `motionValueComponents` instead of
   * flattening the source expression into a total. Existing exact-parity
   * fixtures may keep both representations null until their source curve is
   * independently ingested. `SHARED_SYSTEM_DAMAGE` intentionally has neither:
   * the Character fact owns access/variant semantics while its damage formula
   * remains in the shared combat-system layer.
   */
  motionValueCurve?: CharacterMotionValueCurve | null;
  /** Exact mixed-coefficient Lv1-Lv10 source representation; mutually exclusive with `motionValueCurve`. */
  motionValueComponents?: readonly CharacterMotionValueComponent[] | null;
  /**
   * Exact source-fixed coefficient for Character damage that has no Lv1-Lv10
   * table, stored as a decimal multiplier. This is not a selected talent-level
   * scalar and must never be populated merely because one level was sampled.
   */
  sourceFixedMotionValue?: number | null;
  /**
   * Exact mixed source-fixed coefficients for a no-level-table damage expression.
   * Mutually exclusive with all other source damage representations.
   */
  sourceFixedMotionValueComponents?: readonly CharacterFixedMotionValueComponent[] | null;
  hitCount: number | null;
}

export type CharacterEffectScope = 'SELF' | 'TEAM' | 'NEXT_CHARACTER' | 'TARGET' | 'OTHER';

/** Raw passive text/meaning. Executable buff math belongs in a later effect adapter. */
export interface CharacterPassiveFact extends CharacterMechanicFactBase {
  kind: 'PASSIVE';
  scope: CharacterEffectScope;
  triggerSummary: string;
  effectSummary: string;
  durationSeconds: number | null;
  maxStacks: number | null;
}

/** Character-specific resource/gauge rule that can affect rotations or gates. */
export interface CharacterResourceFact extends CharacterMechanicFactBase {
  kind: 'RESOURCE';
  resourceName: string;
  maxValue: number | null;
  ruleSummary: string;
}

export type CharacterSequence = 1 | 2 | 3 | 4 | 5 | 6;

/** S1-S6 raw fact; relationship to a selected build sequence is modeled later. */
export interface CharacterSequenceFact extends CharacterMechanicFactBase {
  kind: 'SEQUENCE';
  sequence: CharacterSequence;
  triggerSummary: string;
  effectSummary: string;
}

export type CharacterMechanicFact =
  | CharacterActionFact
  | CharacterPassiveFact
  | CharacterResourceFact
  | CharacterSequenceFact;

export type CharacterMechanicsCoverageArea =
  | 'ACTIONS'
  | 'FORTE_RULES'
  | 'INHERENT_PASSIVES'
  | 'OUTRO_EFFECT'
  | 'RESOURCE_RULES'
  | 'SEQUENCES';

export type CharacterMechanicsCoverageStatus = 'VERIFIED' | 'PARTIAL' | 'PENDING';

export interface CharacterMechanicsCoverageAreaState {
  area: CharacterMechanicsCoverageArea;
  status: CharacterMechanicsCoverageStatus;
  notes?: string;
}

/**
 * Per-character mechanics ingestion status. This is developer/preflight state,
 * not a combat result. Missing sections remain visible instead of becoming zero.
 */
export interface CharacterMechanicsProfile {
  characterId: string;
  verificationStatus: VerificationStatus;
  coverage: readonly CharacterMechanicsCoverageAreaState[];
  factIds: readonly string[];
  provenance: ContentProvenance;
}
