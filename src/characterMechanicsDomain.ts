import type { ContentProvenance, VerificationStatus } from './contentRegistry.ts';

/** Where the fact lives in the Resonator kit. */
export type CharacterMechanicSection =
  | 'BASIC_ATTACK'
  | 'RESONANCE_SKILL'
  | 'FORTE_CIRCUIT'
  | 'RESONANCE_LIBERATION'
  | 'INTRO_SKILL'
  | 'OUTRO_SKILL'
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
  | 'STATE_CHANGE'
  | 'OTHER';

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

export type CharacterScalingStat = 'ATK' | 'HP' | 'DEF' | 'TUNE_AMP' | 'FIXED' | 'MIXED' | 'UNKNOWN';

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
 * `section` and `damageClass` are deliberately independent. A Resonance
 * Liberation action may, for example, be classified by the game as Heavy Attack
 * DMG. Rotation engines must consume the explicit damage class instead of
 * inferring it from the button/kit section.
 */
export interface CharacterActionFact extends CharacterMechanicFactBase {
  kind: 'ACTION';
  actionKind: CharacterActionKind;
  damageClass: CharacterDamageClass | null;
  scalingStat: CharacterScalingStat;
  /** null means a non-damaging/state action or an unresolved selected-level value; never implicit zero. */
  motionValue: number | null;
  /** Describes the source/value level convention. Avoids silently mixing talent levels. */
  motionValueContext: string | null;
  /**
   * Optional full source curve for skill levels 1-10 when the source action has
   * one coefficient shape. Values are the listed per-hit/source coefficient;
   * `hitCount` stays separate when the source explicitly writes e.g. `24%*2`.
   *
   * For mixed-coefficient actions use `motionValueComponents` instead of
   * flattening the source expression into a total. Existing exact-parity
   * fixtures may keep both representations null until their source curve is
   * independently ingested. A profile cannot mark ACTIONS VERIFIED without one
   * valid exact representation for every damaging action fact.
   */
  motionValueCurve?: CharacterMotionValueCurve | null;
  /** Exact mixed-coefficient source representation; mutually exclusive with `motionValueCurve`. */
  motionValueComponents?: readonly CharacterMotionValueComponent[] | null;
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