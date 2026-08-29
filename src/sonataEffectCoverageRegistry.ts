import { SONATA_EFFECT_SOURCE_REVIEWS } from './data/sonataEffectSourceReview.ts';
import { SONATA_EFFECT_MODELS } from './data/sonataEffects.ts';
import { SONATA_CATALOG } from './data/sonatas.ts';
import type { SonataGameData } from './gameDataDomain.ts';
import type {
  SonataActivationSourceReview,
  SonataEffectSourceReviewStatus,
} from './sonataEffectDomain.ts';
import { createSonataEffectRegistry } from './sonataEffectRegistry.ts';

export interface SonataEffectCoverageSummary {
  releasedSonataCount: number;
  reviewedActivationCount: number;
  modeledEffectCount: number;
  statusCounts: Readonly<Record<SonataEffectSourceReviewStatus, number>>;
}

function activationKey(sonataSetId: string, pieces: number): string {
  return `${sonataSetId}:${pieces}`;
}

export function auditSonataEffectCoverage(
  effects = SONATA_EFFECT_MODELS,
  reviews = SONATA_EFFECT_SOURCE_REVIEWS,
): SonataEffectCoverageSummary {
  createSonataEffectRegistry(effects);

  const releasedSonatas: readonly SonataGameData[] = SONATA_CATALOG.filter(
    (row) => row.releaseStatus === 'RELEASED',
  ) as readonly SonataGameData[];

  const expectedActivations = new Map<string, { sonataSetId: string; pieces: number }>();
  for (const sonata of releasedSonatas) {
    for (const pieces of sonata.activationPieces) {
      const key = activationKey(sonata.id, pieces);
      if (expectedActivations.has(key)) {
        throw new Error(`Duplicate raw Sonata activation: ${key}`);
      }
      expectedActivations.set(key, { sonataSetId: sonata.id, pieces });
    }
  }

  const modelsByActivation = new Map<string, number>();
  for (const model of effects) {
    const key = activationKey(model.sonataSetId, model.pieces);
    modelsByActivation.set(key, (modelsByActivation.get(key) ?? 0) + 1);
  }

  const reviewByActivation = new Map<string, SonataActivationSourceReview>();
  const statusCounts: Record<SonataEffectSourceReviewStatus, number> = {
    MODELED: 0,
    SOURCE_CONFLICT: 0,
    MODELED_WITH_PENDING_DAMAGE_ADAPTER: 0,
    MODELED_WITH_PENDING_STATE_ADAPTER: 0,
  };

  for (const review of reviews) {
    const key = activationKey(review.sonataSetId, review.pieces);
    if (reviewByActivation.has(key)) {
      throw new Error(`Duplicate Sonata effect source review: ${key}`);
    }
    if (!expectedActivations.has(key)) {
      throw new Error(`Review targets non-released/unknown Sonata activation: ${key}`);
    }
    if (!Number.isInteger(review.expectedModeledEffectCount) || review.expectedModeledEffectCount < 0) {
      throw new Error(`Invalid expected modeled effect count for ${key}`);
    }

    const actualModelCount = modelsByActivation.get(key) ?? 0;
    if (actualModelCount !== review.expectedModeledEffectCount) {
      throw new Error(
        `${key} expected ${review.expectedModeledEffectCount} modeled effect rows but found ${actualModelCount}`,
      );
    }
    if (review.status === 'SOURCE_CONFLICT' && actualModelCount !== 0) {
      throw new Error(`${key} is SOURCE_CONFLICT and must not silently carry modeled rows`);
    }
    if (review.status !== 'SOURCE_CONFLICT' && actualModelCount === 0) {
      throw new Error(`${key} is ${review.status} but has no modeled effect rows`);
    }
    if (
      (review.status === 'MODELED_WITH_PENDING_DAMAGE_ADAPTER' ||
        review.status === 'MODELED_WITH_PENDING_STATE_ADAPTER') &&
      !review.notes.toLowerCase().includes('adapter')
    ) {
      throw new Error(`${key} pending-adapter review must document the adapter boundary`);
    }

    reviewByActivation.set(key, review);
    statusCounts[review.status] += 1;
  }

  const missingReviews = [...expectedActivations.keys()].filter((key) => !reviewByActivation.has(key));
  if (missingReviews.length > 0) {
    throw new Error(`Unreviewed released Sonata activations: ${missingReviews.join(', ')}`);
  }

  const unreviewedModels = [...modelsByActivation.keys()].filter((key) => !reviewByActivation.has(key));
  if (unreviewedModels.length > 0) {
    throw new Error(`Modeled Sonata activations without source review: ${unreviewedModels.join(', ')}`);
  }

  return {
    releasedSonataCount: releasedSonatas.length,
    reviewedActivationCount: reviewByActivation.size,
    modeledEffectCount: effects.length,
    statusCounts: Object.freeze({ ...statusCounts }),
  };
}
