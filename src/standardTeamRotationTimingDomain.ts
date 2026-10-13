/** Research reference budgets, kept separate from executable action/engine timing. */
export interface PublishedRotationTimingMember {
  readonly characterId: string;
  readonly sourceActionLabel: string;
  readonly sourceIntroLabel: string;
  readonly fieldSeconds: number;
  readonly waitSeconds: number;
  readonly difficulty: number;
  readonly sourceLine: number;
}
export interface PublishedRotationTimingPhase {
  readonly rotationNumber: number;
  readonly headingLine: number;
  readonly reportedCycleSeconds: number;
  readonly summaryLine: number;
  readonly members: readonly PublishedRotationTimingMember[];
}
export interface StandardTeamRotationTimingReference {
  readonly id: string;
  readonly provider: 'ARAB_WUWA';
  readonly url: string;
  readonly capturedAt: string;
  readonly sourceLastUpdated: string;
  readonly reportedAverageCycleSeconds: number;
  readonly builds: readonly {
    readonly characterId: string;
    readonly sequence: number;
    readonly sourceLine: number;
    readonly weaponName: string;
    readonly refinement: number;
    readonly sonataLabel: string;
  }[];
  readonly phases: readonly PublishedRotationTimingPhase[];
  readonly review: {
    readonly sourceId: string;
    readonly coordinationCaseId: string | null;
    readonly caseRelationship: 'ALTERNATIVE_ONE_ANCHOR_NOT_DOUBLE_FORTE' | 'BROAD_PARTNER_MATCH' | 'BROAD_TRIO_MATCH' | 'ADDITIONAL_RESEARCH_TRIO';
    readonly relatedReferenceIds: readonly string[];
    readonly referenceRelationship: 'RELATED_VARIANT_ONLY_NOT_EXACT_ACTION_TIMING';
    readonly modeRequirements: Readonly<Record<string, string>>;
    readonly actorOrder: readonly string[] | null;
    readonly orderEvidenceLines: readonly number[];
    readonly orderBasis: 'WRITTEN_TEAM_RECIPE_REVIEW';
    readonly eligibleStandardRotationNumbers: readonly number[];
    readonly timelinePolicy: 'AGGREGATE_ONLY_SPLIT_VISITS' | 'CUMULATIVE_CONTIGUOUS_FIELD_BUDGETS_WITH_ZERO_WAIT_ONLY';
    readonly executionStyle: 'SINGLE_VISITS_WITH_BASIC_INTRA_CHARACTER_CANCELS' | 'REENTRY_REQUIRES_VISIT_TIMING';
    readonly infoSv: readonly string[];
  };
}
export interface TeamTimingCaseCoverage {
  readonly coordinationCaseId: string;
  readonly sourceIds: readonly string[];
  readonly status: 'RELATED_PUBLISHED_TIMING' | 'NO_MATCH_IDENTIFIED_IN_BOUNDED_SEARCH';
  readonly infoSv: string;
}
