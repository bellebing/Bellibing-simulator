import type { ContentProvenance } from './contentRegistry.ts';
import type { StatName } from './echoCore.ts';
import type { CharacterRollProfile } from './targetCheckpointPolicy.ts';

export type ImprovePolicyMode = 'RECOMMENDED' | 'MANUAL';

/** Whole-build metrics, deliberately distinct from Echo substat names. */
export type BuildStatMetric =
  | 'TOTAL_ENERGY_REGEN' | 'TOTAL_CRIT_RATE' | 'TOTAL_CRIT_DAMAGE'
  | 'TOTAL_ATK' | 'TOTAL_HP' | 'TOTAL_DEF';

export interface ImprovePolicyApplicability {
  readonly characterId: string;
  readonly presetId: string;
  readonly modeKey: string;
  readonly sequence: number;
  readonly weaponRecommendationProfileId: string;
  readonly echoLoadoutProfileId: string;
  readonly teamProfileId: string;
  readonly rotationProfileId: string;
  /** Pins the reviewed composition, including provenance and Echo shell. */
  readonly contextBinding: string;
}

export interface CharacterStatTarget {
  readonly metric: BuildStatMetric;
  readonly unit: 'RATIO' | 'POINTS';
  readonly minimum: number;
  readonly preferred?: number;
  readonly basis: {
    readonly kind: 'SOURCE_DESCRIBED';
    readonly description: string | null;
    /** Source validity does not prove comparability with static Build Stats. */
    readonly comparisonStatus: 'PENDING';
  };
}

export interface CharacterStatPriority {
  readonly stat: StatName;
  /** Lower numbers come first; equal numbers are explicit ties, not weights. */
  readonly priorityGroup: number;
  readonly condition: { readonly kind: 'SOURCE_DESCRIBED'; readonly text: string } | null;
}

export interface PolicySourceEvidence {
  readonly reviewId: string;
  readonly sourceId: string;
  readonly sourceBinding: string;
  readonly applicability: ImprovePolicyApplicability;
  readonly provenance: ContentProvenance | string;
}

/** Null is unsupported/missing; an empty verified policy needs explicit evidence. */
export type PolicySection<T> =
  | { readonly status: 'VERIFIED'; readonly content: 'PRESENT' | 'EXPLICITLY_EMPTY';
      readonly origin: 'PROFILE'; readonly value: T; readonly source: PolicySourceEvidence }
  | { readonly status: 'USER_DEFINED'; readonly content: 'PRESENT' | 'EXPLICITLY_EMPTY';
      readonly origin: 'USER'; readonly value: T }
  | { readonly status: 'PENDING'; readonly origin: 'PROFILE' | 'USER';
      readonly value: null; readonly reason: string };

export interface CharacterTargetPolicy {
  readonly numericTargets: PolicySection<readonly CharacterStatTarget[]>;
  readonly priorities: PolicySection<readonly CharacterStatPriority[]>;
}

/** Applies to one finished candidate Echo, not to Character total stats. */
export interface EchoStatRequirement {
  readonly stat: StatName;
  readonly minimum?: number;
}

export interface EchoRequirementGroup {
  readonly id: string;
  readonly minimumHits: number;
  readonly members: readonly EchoStatRequirement[];
}

export interface EchoStatPreference {
  readonly stat: StatName;
  readonly priorityGroup: number;
}

export interface EchoRequirements {
  readonly requiredOnEveryEcho: readonly EchoStatRequirement[];
  readonly groups: readonly EchoRequirementGroup[];
  /** Additional source acceptance semantics, not another scoring model. */
  readonly acceptanceConstraints: {
    readonly nonTargetRoles: CharacterRollProfile['nonTargetRoles'];
    readonly maximumDeadStats: number;
  };
}

export interface EchoPolicyProfile {
  readonly scope: 'FINISHED_CANDIDATE_ECHO';
  readonly requirements: PolicySection<EchoRequirements>;
  readonly preferences: PolicySection<readonly EchoStatPreference[]>;
  /** Reference only: this slice does not execute checkpoints or change Gate. */
  readonly checkpointReference: CharacterRollProfile | null;
}

/**
 * Future user-owned state: only supplied sections replace Recommended sections.
 * Omitted sections inherit; explicit empty sections are intentional overrides.
 * No persistence/migration or Manual editor is introduced by this contract.
 */
export interface ImprovePolicyOverrides {
  readonly characterId: string;
  readonly presetId: string;
  readonly contextBinding: string;
  readonly numericTargets?: readonly CharacterStatTarget[];
  readonly priorities?: readonly CharacterStatPriority[];
  readonly echoRequirements?: EchoRequirements;
  readonly echoPreferences?: readonly EchoStatPreference[];
}

export interface ResolvedImprovePolicy {
  readonly characterId: string;
  readonly presetId: string | null;
  readonly mode: ImprovePolicyMode;
  readonly characterTarget: CharacterTargetPolicy;
  readonly echoPolicy: EchoPolicyProfile;
}

// Build Need is deliberately absent: later evaluation reads CharacterBuildState
// and these policies. This contract owns no equipment, totals, deficits or scores.
