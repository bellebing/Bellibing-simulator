import type {
  CanonicalCharacterRecommendation, CharacterRecommendationReview,
  CharacterRecommendationSource, RecommendationTextInterpretation, RecommendationUnit,
  RecommendedCharacterStats,
} from './characterRecommendationDomain.ts';
import { CHARACTER_RECOMMENDATION_UNITS } from './characterRecommendationDomain.ts';
import { CHARACTER_RECOMMENDATION_SOURCES, CHARACTER_RECOMMENDATION_REVIEWS } from './data/characterRecommendationSourceReview.ts';
import { improvePolicySourceBinding } from './improvePolicySources.ts';

/** Syntax normalization is discovery only; this function cannot approve evidence. */
export function interpretRecommendationText(text: string, unit: RecommendationUnit): RecommendationTextInterpretation {
  const match = /^(\d+(?:\.\d+)?)(?:(%)?-(\d+(?:\.\d+)?))?(%)?(\+)?$/.exec(text.trim());
  if (!match || (unit === 'RATIO') !== Boolean(match[4]) || (unit === 'POINTS' && Boolean(match[2]))) {
    return { status: 'UNRESOLVED', reason: 'Unsupported wording or unit; explicit semantic review required.' };
  }
  const scale = unit === 'RATIO' ? 100 : 1;
  const lower = Number(match[1]) / scale;
  const upper = match[3] === undefined ? undefined : Number(match[3]) / scale;
  if (!Number.isFinite(lower) || upper !== undefined && (!Number.isFinite(upper) || upper < lower)) {
    return { status: 'UNRESOLVED', reason: 'Invalid numeric endpoints.' };
  }
  if (upper !== undefined && match[5]) {
    return { status: 'NORMALIZED',
      value: { kind: 'OPEN_ENDED_BAND', minimum: lower, upperReference: upper } };
  }
  return { status: 'NORMALIZED', value: upper !== undefined
    ? { kind: 'BOUNDED_RANGE', minimum: lower, upper }
    : match[5] ? { kind: 'MINIMUM', minimum: lower } : { kind: 'EXACT', target: lower } };
}

export interface CharacterRecommendationDependencies {
  readonly sources?: readonly CharacterRecommendationSource[];
  readonly reviews?: readonly CharacterRecommendationReview[];
}

/**
 * Dedicated source/domain projection only. No legacy gates/priorities, Echo
 * policy, equipment, Customize, evaluator or UI projection is accepted as input.
 * APPROVED rows require exact primary wording, explicit interpretation and a pin.
 */
export async function projectRecommendedCharacterStats(
  characterId: string,
  dependencies: CharacterRecommendationDependencies = {},
): Promise<RecommendedCharacterStats> {
  // Snapshot before hashing so each result describes one detached evidence set.
  const sources = structuredClone(dependencies.sources ?? CHARACTER_RECOMMENDATION_SOURCES)
    .filter(source => source.characterId === characterId);
  const reviews = structuredClone(dependencies.reviews ?? CHARACTER_RECOMMENDATION_REVIEWS)
    .filter(review => review.characterId === characterId);
  if (sources.length === 0 && reviews.length === 0) {
    return { characterId, sourceReviewStatus: 'PENDING', rows: [] };
  }
  const source = sources.length === 1 ? sources[0] : undefined;
  const review = reviews.length === 1 ? reviews[0] : undefined;
  const sourceBinding = source ? await improvePolicySourceBinding(source) : null;
  const bindingValid = Boolean(source && review && review.sourceId === source.id
    && review.sourceBinding === sourceBinding && /^\d{4}-\d{2}-\d{2}$/.test(review.checkedAt)
    && new Set(source.evidence.map(item => item.id)).size === source.evidence.length
    && new Set(review.rows.map(row => row.metric)).size === review.rows.length
    && review.rows.every(row => Object.hasOwn(CHARACTER_RECOMMENDATION_UNITS, row.metric))
    && source.evidence.every(item => item.characterId === characterId
      && Object.hasOwn(CHARACTER_RECOMMENDATION_UNITS, item.metric)));
  // Metrics are explicitly reviewed per Character; no universal roster scaffold.
  const metrics = [...new Set(review?.rows.map(row => row.metric) ?? source?.evidence.map(item => item.metric) ?? [])];
  const rows: CanonicalCharacterRecommendation[] = [];
  for (const metric of metrics) {
    const unit = CHARACTER_RECOMMENDATION_UNITS[metric];
    if (!unit) continue; // Unknown runtime metric never becomes a canonical stat.
    const row = review?.rows.find(item => item.metric === metric);
    const evidence = source?.evidence.filter(item => row?.evidenceIds.includes(item.id)) ?? [];
    const base = { metric, unit, reviewId: review?.id ?? null, sourceBinding,
      evidence, comparisonStatus: 'PENDING' as const };
    const blocked = (status: 'PENDING' | 'REVIEW_REQUIRED', reason: string): CanonicalCharacterRecommendation =>
      ({ ...base, status, value: null, reason });
    if (!bindingValid) {
      rows.push(blocked('REVIEW_REQUIRED', 'Missing, duplicate or drifted source/review binding.'));
      continue;
    }
    if (!row || row.decision !== 'APPROVED_FOR_CANONICAL_VERIFIED') {
      rows.push(blocked(row?.decision === 'REVIEW_REQUIRED' ? 'REVIEW_REQUIRED' : 'PENDING',
        row?.reason ?? 'No explicit metric review.'));
      continue;
    }
    const validEvidence = evidence.length > 0 && evidence.length === row.evidenceIds.length
      && new Set(row.evidenceIds).size === row.evidenceIds.length
      && evidence.every(item => item.characterId === characterId && item.metric === metric
        && item.evidenceClass === 'PRIMARY_SOURCE_CAPTURE' && item.originalText !== null
        && item.sourceIdentity.trim() && /^https:\/\//.test(item.sourceUrl)
        && /^\d{4}-\d{2}-\d{2}$/.test(item.checkedAt) && item.artifact.trim()
        && item.locator.trim() && item.excerpt.trim() && item.context.description.trim());
    if (!validEvidence || row.interpretation === null) {
      rows.push(blocked('REVIEW_REQUIRED', 'Approval lacks primary wording/provenance or explicit interpretation; candidate/legacy references cannot auto-promote.'));
      continue;
    }
    // Each source must support the same interpretation. Disagreement and ambiguous
    // prose stay closed; a fresh explicit reviewed capture is needed to resolve it.
    const interpretationBinding = await improvePolicySourceBinding(row.interpretation);
    const interpretations = evidence.map(item => interpretRecommendationText(item.originalText!, unit));
    const agrees = await Promise.all(interpretations.map(async item => item.status === 'NORMALIZED'
      && await improvePolicySourceBinding(item.value) === interpretationBinding));
    if (agrees.some(item => !item)) {
      rows.push(blocked('REVIEW_REQUIRED', 'Source wording is ambiguous, disagrees, or does not support the reviewed numeric interpretation.'));
      continue;
    }
    rows.push({ ...base, status: 'VERIFIED', value: row.interpretation, reason: null });
  }
  return { characterId, sourceReviewStatus: !bindingValid || rows.some(row => row.status === 'REVIEW_REQUIRED') ? 'REVIEW_REQUIRED'
    : rows.some(row => row.status === 'PENDING') || rows.length === 0 ? 'PENDING' : 'CURRENT', rows };
}
