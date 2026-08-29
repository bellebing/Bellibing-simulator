import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from './data/profileBackwardImpactReviewCatalog.ts';
import type { ProfileBackwardImpactReview } from './data/profileBackwardImpactReview.ts';

export type ProfileAdapterImplementationScope =
  | 'REUSABLE_PRIMITIVE_CANDIDATE'
  | 'PROFILE_SPECIFIC_EXECUTION';

export interface ProfileAdapterDependencyEdge {
  readonly reviewId: string;
  readonly characterId: string;
  readonly presetId: string;
  readonly pendingExecutionId: string;
  readonly layer: string;
  readonly syntacticPrimitiveKey: string;
  readonly implementationScope: ProfileAdapterImplementationScope;
}

export interface ProfileAdapterPrimitiveRow {
  readonly syntacticPrimitiveKey: string;
  readonly layer: string;
  readonly adapterToken: string;
  readonly implementationScope: ProfileAdapterImplementationScope;
  readonly dependencyCount: number;
  readonly profileCount: number;
  readonly characterCount: number;
  readonly presetIds: readonly string[];
  readonly characterIds: readonly string[];
  readonly pendingExecutionIds: readonly string[];
}

export interface ProfileAdapterDependencyMatrix {
  readonly reviewCount: number;
  readonly profileCount: number;
  readonly pendingProfileCount: number;
  readonly dependencyCount: number;
  readonly edges: readonly ProfileAdapterDependencyEdge[];
  readonly primitives: readonly ProfileAdapterPrimitiveRow[];
  readonly reusablePriorityQueue: readonly ProfileAdapterPrimitiveRow[];
  readonly authorizesExecution: false;
  readonly notes: readonly string[];
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function dependencyShape(pendingExecutionId: string): Pick<ProfileAdapterDependencyEdge, 'layer' | 'syntacticPrimitiveKey' | 'implementationScope'> {
  const segments = pendingExecutionId.split(':');
  const layer = segments[0] || 'unknown';
  const adapterToken = segments.at(-1) || pendingExecutionId;
  const profileSpecificRotation = layer === 'rotation' && adapterToken === 'engine-model';
  return {
    layer,
    syntacticPrimitiveKey: profileSpecificRotation
      ? 'rotation:engine-model'
      : `${layer}:${adapterToken}`,
    implementationScope: profileSpecificRotation
      ? 'PROFILE_SPECIFIC_EXECUTION'
      : 'REUSABLE_PRIMITIVE_CANDIDATE',
  };
}

function prioritySort(left: ProfileAdapterPrimitiveRow, right: ProfileAdapterPrimitiveRow): number {
  return right.profileCount - left.profileCount
    || right.characterCount - left.characterCount
    || right.dependencyCount - left.dependencyCount
    || left.syntacticPrimitiveKey.localeCompare(right.syntacticPrimitiveKey);
}

export function buildProfileAdapterDependencyMatrix(
  reviews: readonly ProfileBackwardImpactReview[] = PROFILE_BACKWARD_IMPACT_REVIEWS_V36,
): ProfileAdapterDependencyMatrix {
  const edges: ProfileAdapterDependencyEdge[] = reviews.flatMap((review) =>
    review.pendingExecutionIds.map((pendingExecutionId) => ({
      reviewId: review.reviewId,
      characterId: review.characterId,
      presetId: review.presetId,
      pendingExecutionId,
      ...dependencyShape(pendingExecutionId),
    })),
  );

  const primitiveKeys = uniqueSorted(edges.map((edge) => edge.syntacticPrimitiveKey));
  const primitives: ProfileAdapterPrimitiveRow[] = primitiveKeys.map((syntacticPrimitiveKey) => {
    const matching = edges.filter((edge) => edge.syntacticPrimitiveKey === syntacticPrimitiveKey);
    const first = matching[0];
    const segments = syntacticPrimitiveKey.split(':');
    return {
      syntacticPrimitiveKey,
      layer: first?.layer ?? segments[0] ?? 'unknown',
      adapterToken: segments.slice(1).join(':'),
      implementationScope: first?.implementationScope ?? 'REUSABLE_PRIMITIVE_CANDIDATE',
      dependencyCount: matching.length,
      profileCount: new Set(matching.map((edge) => edge.presetId)).size,
      characterCount: new Set(matching.map((edge) => edge.characterId)).size,
      presetIds: uniqueSorted(matching.map((edge) => edge.presetId)),
      characterIds: uniqueSorted(matching.map((edge) => edge.characterId)),
      pendingExecutionIds: uniqueSorted(matching.map((edge) => edge.pendingExecutionId)),
    };
  });

  const reusablePriorityQueue = primitives
    .filter((row) => row.implementationScope === 'REUSABLE_PRIMITIVE_CANDIDATE')
    .sort(prioritySort);

  return {
    reviewCount: reviews.length,
    profileCount: new Set(reviews.map((review) => review.presetId)).size,
    pendingProfileCount: new Set(edges.map((edge) => edge.presetId)).size,
    dependencyCount: edges.length,
    edges,
    primitives,
    reusablePriorityQueue,
    authorizesExecution: false,
    notes: [
      'The matrix is derived only from canonical backward-impact pendingExecutionIds.',
      'syntacticPrimitiveKey groups identical adapter suffixes within the same layer to identify reuse candidates; it does not prove shared semantic behavior.',
      'rotation:*:engine-model remains PROFILE_SPECIFIC_EXECUTION and is excluded from the reusable priority queue.',
      'No dependency row authorizes ENGINE_MODELED or DPS_READY status without an independently implemented and verified adapter.',
    ],
  };
}

export const PROFILE_ADAPTER_DEPENDENCY_MATRIX = buildProfileAdapterDependencyMatrix();
