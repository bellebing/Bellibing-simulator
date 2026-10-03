import type { BuildStatMetric } from './improvePolicyDomain.ts';

/** Dedicated whole-build recommendation metrics; does not extend Customize. */
export type CharacterRecommendationMetric = BuildStatMetric | 'ELECTRO_DMG_BONUS';
export type RecommendationUnit = 'POINTS' | 'RATIO';

export const CHARACTER_RECOMMENDATION_UNITS: Readonly<Record<CharacterRecommendationMetric, RecommendationUnit>> = {
  TOTAL_HP: 'POINTS', TOTAL_DEF: 'POINTS', TOTAL_ATK: 'POINTS',
  TOTAL_CRIT_RATE: 'RATIO', TOTAL_CRIT_DAMAGE: 'RATIO', TOTAL_ENERGY_REGEN: 'RATIO',
  ELECTRO_DMG_BONUS: 'RATIO',
};

/** Upper is a recommendation endpoint, never a gameplay maximum. */
export type RecommendationValue =
  | { readonly kind: 'MINIMUM'; readonly minimum: number }
  | { readonly kind: 'BOUNDED_RANGE'; readonly minimum: number; readonly upper: number }
  /** Trailing + leaves guidance open above this reference; no evaluator meaning. */
  | { readonly kind: 'OPEN_ENDED_BAND'; readonly minimum: number; readonly upperReference: number }
  | { readonly kind: 'EXACT'; readonly target: number };

export type RecommendationTextInterpretation =
  | { readonly status: 'NORMALIZED'; readonly value: RecommendationValue }
  | { readonly status: 'UNRESOLVED'; readonly reason: string;
      readonly sourceEndpoints?: readonly [number, number] };

export interface RecommendationContext {
  /** Source prose, not executable applicability or proof of static comparison. */
  readonly description: string;
  readonly conditions: readonly string[];
  readonly team: string | null;
  readonly weapon: string | null;
  readonly sequence: string | null;
  readonly rotation: string | null;
  readonly measurementBasis: string | null;
}

export interface CharacterRecommendationEvidence {
  readonly id: string;
  readonly characterId: string;
  readonly metric: CharacterRecommendationMetric;
  readonly sourceIdentity: string;
  readonly sourceUrl: string;
  /** Date of evidence capture, distinct from a later repository review. */
  readonly checkedAt: string;
  readonly evidenceClass: 'PRIMARY_SOURCE_CAPTURE' | 'CANDIDATE_ONLY' | 'LEGACY_PROFILE_REFERENCE';
  readonly artifact: string;
  readonly locator: string;
  /** Null when exact source wording was not captured. Never substitute paraphrase. */
  readonly originalText: string | null;
  readonly excerpt: string;
  readonly context: RecommendationContext;
}

export interface CharacterRecommendationSource {
  readonly id: string;
  readonly characterId: string;
  readonly evidence: readonly CharacterRecommendationEvidence[];
  readonly researchArtifact: string;
  readonly researchBinding: string;
}

export interface CharacterRecommendationRowReview {
  readonly metric: CharacterRecommendationMetric;
  readonly decision: 'APPROVED_FOR_CANONICAL_VERIFIED' | 'PENDING' | 'REVIEW_REQUIRED';
  readonly evidenceIds: readonly string[];
  readonly reason: string;
  /** Bellibing interpretation is separate from the verbatim source statement. */
  readonly interpretation: RecommendationValue | null;
}

export interface CharacterRecommendationReview {
  readonly id: string;
  readonly characterId: string;
  readonly sourceId: string;
  readonly checkedAt: string;
  /** Exact evidence/conditions/provenance pin, like Improve policy source binding. */
  readonly sourceBinding: string;
  readonly rows: readonly CharacterRecommendationRowReview[];
}

export type CanonicalCharacterRecommendation = {
  readonly metric: CharacterRecommendationMetric;
  readonly unit: RecommendationUnit;
  readonly reviewId: string | null;
  readonly sourceBinding: string | null;
  readonly evidence: readonly CharacterRecommendationEvidence[];
  readonly comparisonStatus: 'PENDING';
} & (
  | { readonly status: 'VERIFIED'; readonly value: RecommendationValue; readonly reason: null }
  | { readonly status: 'PENDING' | 'REVIEW_REQUIRED'; readonly value: null; readonly reason: string }
);

export interface RecommendedCharacterStats {
  readonly characterId: string;
  readonly sourceReviewStatus: 'CURRENT' | 'PENDING' | 'REVIEW_REQUIRED';
  readonly rows: readonly CanonicalCharacterRecommendation[];
}
