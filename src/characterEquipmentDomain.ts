/** Identity associations reference existing catalogs; they never select equipment. */
export type CharacterSignatureAssociation = {
  readonly characterId: string;
  readonly releaseFamily: 'LIMITED_FIVE_STAR' | 'STANDARD_FIVE_STAR' | 'FOUR_STAR' | 'ROVER';
  readonly reviewedAt: string;
  readonly meaning: 'IDENTIFIED_DEDICATED_SIGNATURE_NOT_EXCLUSIVE_OR_BIS';
  readonly evidence: readonly {
    readonly sourceUrl: string;
    readonly evidenceKind: 'EXPLICIT_GUIDE_SIGNATURE' | 'SEARCH_RESULT_EXPLICIT_SIGNATURE' | 'REVIEWED_NON_SIGNATURE_RELEASE_FAMILY';
    readonly sourceClaim: string;
    readonly checkedAt: string;
  }[];
} & (
  | { readonly status: 'VERIFIED_SIGNATURE'; readonly weaponId: string }
  | { readonly status: 'VERIFIED_NO_SIGNATURE'; readonly weaponId: null }
  | { readonly status: 'PENDING'; readonly weaponId: null }
);

export interface GuidePerformanceValue {
  readonly sourceColumn: number;
  readonly sourceText: string;
  readonly relativePerformance: number | null;
  readonly contextLabel: string | null;
}

/** Reviewed publication/order, not an independently validated gameplay ranking. */
export interface CharacterGuideRecommendation {
  readonly characterId: string;
  readonly provider: 'PRYDWEN';
  readonly sourceUrl: string;
  readonly capturedAt: string;
  readonly sourceUpdatedAt: string | null;
  readonly sourceLinesSha256: string;
  readonly orderingPolicy: 'SOURCE_DISPLAY_ORDER_NOT_RECALCULATED';
  readonly comparisonStatus: 'NOT_INDEPENDENTLY_VALIDATED';
  readonly weapons: readonly {
    readonly sourceOrder: number; readonly weaponId: string | null;
    readonly sourceName: string; readonly refinement: number;
    readonly performance: readonly GuidePerformanceValue[]; readonly sourceLine: number;
  }[];
  readonly skillPriorities: readonly {
    readonly contextLabel: string | null;
    readonly skills: readonly { readonly sourceOrder: number; readonly sourceName: string; readonly sourceLine: number }[];
  }[];
  readonly calculationContexts: readonly {
    readonly label: string;
    readonly teammates: readonly {
      readonly characterId: string | null; readonly sourceName: string;
      readonly weaponId: string | null; readonly sourceWeaponName: string | null;
    }[];
  }[];
  readonly echoSets: readonly {
    readonly sourceOrder: number; readonly setId: string;
    readonly sourceName: string; readonly section: string;
    readonly usage: 'PRIMARY' | 'COMPANION_OPTION';
    readonly companionToOrder: number | null; readonly pieces: number | null;
    readonly performance: readonly GuidePerformanceValue[];
    readonly mainEchoes: readonly { readonly sourceOrder: number; readonly echoId: string; readonly sourceName: string; readonly sourceLine: number }[];
    readonly sourceLine: number; readonly conditionExcerpt: string | null;
  }[];
  readonly mainStats: readonly { readonly slotOrder: number; readonly cost: number; readonly sourceText: string | null; readonly sourceLine: number }[];
  readonly substatPriorities: readonly { readonly sourceText: string; readonly sourceLine: number }[];
  readonly endgameStats: readonly { readonly sourceStatName: string; readonly sourceText: string; readonly conditions: readonly string[]; readonly sourceLine: number }[];
  readonly endgameContext: {
    readonly level: 90;
    readonly sequencePolicy: 'SOURCE_DEFAULT_S0_FIVE_STAR_S6_FOUR_STAR_AND_FREE_UNLESS_OVERRIDDEN';
    readonly measurementBasis: 'OUT_OF_COMBAT_ACTIVE_PARTY_TOTAL_STAT_SCREEN';
    readonly energyRegenTeamBasis: 'SOURCE_BEST_TEAM_UNLESS_SPECIFIED';
  };
  readonly teammateGroups: readonly {
    readonly displayOrder: number; readonly characterIds: readonly (string | null)[];
    readonly sourceNames: readonly string[]; readonly conditionExcerpt: string | null; readonly sourceLine: number;
  }[];
  readonly generalTeamGuidance: readonly { readonly sourceText: string | null; readonly sourceLine: number }[];
  readonly teammateOrderingPolicy: 'DISPLAY_ORDER_ONLY_NOT_AN_INFERRED_POWER_RANK';
  readonly exampleTeamLabels: readonly string[];
  readonly exampleTeamMembersStatus: 'NOT_EXPOSED_BY_TEXT_CAPTURE';
  readonly unresolvedIdentities: readonly string[];
}
