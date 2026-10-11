import type { RotationExecutionStatus } from './profileDomain.ts';

/** Guide command order; timing, legality and engine execution are separate claims. */
export interface TeamAwareRotationReference {
  readonly id: string;
  readonly kind: 'TEAM_AWARE_ROTATION_REFERENCE';
  readonly characterId: string;
  readonly variantKey: string;
  readonly phase: 'STANDARD' | 'LOOP' | 'OPENER' | 'PREPARATION' | 'PRIORITY';
  readonly scope: 'BASELINE' | 'TEAM_OR_MODE_VARIANT' | 'SETUP' | 'PRIORITY_GUIDANCE';
  readonly executionStatus: Extract<RotationExecutionStatus, 'SOURCE_SEQUENCE_ONLY'> | 'SOURCE_PRIORITY_ONLY';
  readonly sourceReviewStatus: 'REVIEWED_REFERENCE_ONLY';
  readonly sourceOrderBasis: 'REVIEWED_GUIDE_COMMAND_ORDER' | 'PRIORITY_DISPLAY_ORDER_NOT_TIMELINE';
  readonly sourceHeading: string | null;
  readonly source: {
    readonly provider: 'PRYDWEN'; readonly url: string;
    readonly capturedAt: string; readonly reviewedAt: string;
    readonly sectionSha256: string;
    readonly selectedLineRange: readonly [number, number];
    readonly adaptationEvidenceLines: readonly number[];
    readonly reviewKind: 'SOURCE_ORDERED_LIST' | 'SOURCE_PRIORITY_GUIDANCE' | 'SOURCE_DESCRIBED_ADAPTATION';
  };
  readonly context: {
    /** Empty means no separate mode restriction was recorded, not all modes verified. */
    readonly modeKeys: readonly string[];
    readonly introAvailability: boolean | null;
    /** OR between combinations, AND within a combination. Only explicit use cases. */
    readonly requiredTeamCombinations: readonly (readonly string[])[];
    readonly excludedTeamCombinations: readonly (readonly string[])[];
    /** Examples never become eligibility requirements or inferred default teams. */
    readonly exampleTeams: readonly (readonly string[])[];
    /** Human-readable guide prerequisites, deliberately not executable predicates. */
    readonly conditions: readonly string[];
    readonly teamSemantics: 'EXPLICIT_SOURCE_CONTEXT_NOT_UNIVERSAL_TEAM_ELIGIBILITY';
  };
  readonly steps: readonly { readonly order: number; readonly instruction: string; readonly sourceLine: number }[];
  readonly priorityGuidance: readonly { readonly displayOrder: number; readonly instruction: string; readonly sourceLine: number }[];
  readonly echoTiming: string | null;
  readonly notes: readonly string[];
}

export interface CharacterRotationReferenceCoverage {
  readonly characterId: string;
  readonly status: 'BASIC_SOURCE_SEQUENCE_AVAILABLE' | 'PRIORITY_GUIDANCE_ONLY';
  readonly referenceIds: readonly string[];
  readonly reviewedSourceHeadings: readonly string[];
  readonly scope: 'BASELINE_AND_NECESSARY_CONTEXT_VARIANTS_NOT_ALL_POSSIBLE_ROTATIONS';
}
