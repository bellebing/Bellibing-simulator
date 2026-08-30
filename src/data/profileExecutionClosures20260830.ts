import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';
import { FLEURDELYS_CHARACTER_RESTRICTION_REVIEW } from './echoCharacterRestrictedEffects.ts';

export interface ProfileExecutionDependencyClosure {
  readonly closureId: string;
  readonly reviewedAt: string;
  readonly pendingExecutionId: string;
  readonly presetIds: readonly string[];
  readonly primitiveId: string;
  readonly notes: readonly string[];
}

export const PROFILE_EXECUTION_DEPENDENCY_CLOSURES_20260830: readonly ProfileExecutionDependencyClosure[] = [
  {
    closureId: 'PROFILE-CLOSURE-FLEURDELYS-CHARACTER-RESTRICTION-2026-08-30-01',
    reviewedAt: FLEURDELYS_CHARACTER_RESTRICTION_REVIEW.reviewedAt,
    pendingExecutionId: FLEURDELYS_CHARACTER_RESTRICTION_REVIEW.closesPendingExecutionId,
    presetIds: [
      'cartethyia-aero-erosion',
      'rover-aero-cartethyia-ciaccona',
    ],
    primitiveId: FLEURDELYS_CHARACTER_RESTRICTION_REVIEW.primitiveId,
    notes: [
      'Pinned Fleurdelys structured characterCondition plus multilingual rendered text resolves the eligible wielders to canonical rover-aero and cartethyia.',
      'The static profile-to-main-Echo effect resolver can now prove the extra +10% Aero DMG from characterId + mainEchoId without an executable rotation timeline.',
      'Only the exact Fleurdelys character-restriction dependency closes. Active Echo damage and each profile rotation engine-model remain separate pending execution boundaries.',
    ],
  },
] as const;

export function applyProfileExecutionDependencyClosures(
  reviews: readonly ProfileBackwardImpactReview[],
  closures: readonly ProfileExecutionDependencyClosure[] = PROFILE_EXECUTION_DEPENDENCY_CLOSURES_20260830,
): readonly ProfileBackwardImpactReview[] {
  const byPreset = new Map(reviews.map((review) => [review.presetId, review] as const));
  const duplicatePresetIds = reviews
    .map((review) => review.presetId)
    .filter((presetId, index, all) => all.indexOf(presetId) !== index);
  if (duplicatePresetIds.length > 0) {
    throw new Error(`Execution dependency closures require unique preset reviews: ${[...new Set(duplicatePresetIds)].join(', ')}`);
  }

  const closureByPreset = new Map<string, ProfileExecutionDependencyClosure[]>();
  for (const closure of closures) {
    if (!closure.closureId.trim()) throw new Error('Execution dependency closure id is blank.');
    if (!closure.pendingExecutionId.trim()) throw new Error(`${closure.closureId}: pendingExecutionId is blank.`);
    if (!closure.primitiveId.trim()) throw new Error(`${closure.closureId}: primitiveId is blank.`);
    if (closure.presetIds.length === 0) throw new Error(`${closure.closureId}: presetIds is empty.`);
    if (new Set(closure.presetIds).size !== closure.presetIds.length) {
      throw new Error(`${closure.closureId}: duplicate preset target.`);
    }

    for (const presetId of closure.presetIds) {
      const review = byPreset.get(presetId);
      if (!review) throw new Error(`${closure.closureId}: unknown preset review ${presetId}.`);
      if (!review.pendingExecutionIds.includes(closure.pendingExecutionId)) {
        throw new Error(`${closure.closureId}: ${presetId} no longer contains ${closure.pendingExecutionId}.`);
      }
      const existing = closureByPreset.get(presetId) ?? [];
      if (existing.some((row) => row.pendingExecutionId === closure.pendingExecutionId)) {
        throw new Error(`${closure.closureId}: duplicate closure for ${presetId} / ${closure.pendingExecutionId}.`);
      }
      existing.push(closure);
      closureByPreset.set(presetId, existing);
    }
  }

  return reviews.map((review) => {
    const matching = closureByPreset.get(review.presetId) ?? [];
    if (matching.length === 0) return review;
    const closedIds = new Set(matching.map((closure) => closure.pendingExecutionId));
    const pendingExecutionIds = review.pendingExecutionIds.filter((id) => !closedIds.has(id));
    const notes = [
      ...review.notes,
      ...matching.flatMap((closure) => [
        `Execution dependency closure ${closure.closureId} via ${closure.primitiveId}: ${closure.pendingExecutionId}.`,
        ...closure.notes,
      ]),
    ];
    return {
      ...review,
      pendingExecutionIds,
      result: pendingExecutionIds.length === 0
        ? 'REVIEWED_NO_BLOCKING_PROFILE_CHANGE'
        : 'REVIEWED_WITH_PENDING_EXECUTION',
      notes,
    };
  });
}
