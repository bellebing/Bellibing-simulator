import { BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW } from './combat/blazingBrillianceStackSemanticReview.ts';
import { FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW } from './combat/fallacyActiveDamageSemanticReview.ts';
import { IMPERMANENCE_HERON_TRANSFER_DISPOSITION } from './combat/echoTransferWindowAdapter.ts';
import { JINHSI_RESOURCE_EXECUTION_SEMANTIC_REVIEW } from './combat/jinhsiResourceStateAdapter.ts';
import { JINHSI_TEAM_INCOMING_EXECUTION_SEMANTIC_REVIEW } from './combat/jinhsiTeamIncomingStateAdapter.ts';
import { JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW } from './combat/jueBlessingStateAdapter.ts';
import { SONATA_CAST_WINDOW_SEMANTIC_SPLIT } from './combat/sonataCastWindowAdapter.ts';
import { SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT } from './combat/sonataOutroTransferAdapter.ts';
import { WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT } from './combat/weaponCastWindowAdapter.ts';
import { WEAPON_SKILL_STACK_SEMANTIC_REVIEW } from './combat/weaponSkillStackSemanticReview.ts';
import {
  DEFIERS_THORN_DEF_EXECUTION_REVIEW_20260830,
  ROVER_AERO_STANDARD_ROTATION_EXECUTION_REVIEW_20260830,
} from './data/profileExecutionSemanticReview20260830.ts';
import {
  PROFILE_ADAPTER_DEPENDENCY_MATRIX,
  type ProfileAdapterDependencyEdge,
  type ProfileAdapterDependencyMatrix,
} from './profileAdapterDependencyMatrix.ts';

export type ExecutionSemanticStatus =
  | 'UNREVIEWED'
  | 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING'
  | 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE'
  | 'BLOCKED_SOURCE_CONFLICT'
  | 'BLOCKED_SOURCE_SEMANTICS'
  | 'PROFILE_SPECIFIC_EXECUTION';

export interface ExecutionSemanticReview {
  readonly pendingExecutionId: string;
  readonly status:
    | 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING'
    | 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE'
    | 'BLOCKED_SOURCE_CONFLICT'
    | 'BLOCKED_SOURCE_SEMANTICS';
  readonly actionKey: string;
  readonly reviewedAt: string;
  readonly primitiveId?: string;
  readonly blockerId?: string;
  readonly notes: readonly string[];
}

export interface ProfileExecutionDispositionEdge extends ProfileAdapterDependencyEdge {
  readonly semanticStatus: ExecutionSemanticStatus;
  readonly actionKey: string;
  readonly primitiveId: string | null;
  readonly blockerId: string | null;
}

export interface ProfileExecutionWorkGroup {
  readonly actionKey: string;
  readonly semanticStatus: ExecutionSemanticStatus;
  readonly dependencyCount: number;
  readonly profileCount: number;
  readonly characterCount: number;
  readonly syntacticPrimitiveKeys: readonly string[];
  readonly pendingExecutionIds: readonly string[];
  readonly presetIds: readonly string[];
  readonly characterIds: readonly string[];
  readonly primitiveIds: readonly string[];
  readonly blockerIds: readonly string[];
}

export interface ProfileExecutionWorkSummary {
  readonly totalEdges: number;
  readonly unreviewedEdges: number;
  readonly semanticallyReviewedImplementationPendingEdges: number;
  readonly primitiveAvailableRequiresTimelineEdges: number;
  readonly blockedSourceConflictEdges: number;
  readonly blockedSourceSemanticsEdges: number;
  readonly profileSpecificExecutionEdges: number;
  readonly actionableSharedEdges: number;
}

export interface ProfileExecutionWorkQueue {
  readonly summary: ProfileExecutionWorkSummary;
  readonly reviewRecordCount: number;
  readonly edges: readonly ProfileExecutionDispositionEdge[];
  readonly actionableSharedQueue: readonly ProfileExecutionWorkGroup[];
  readonly primitiveAvailableRequiresTimeline: readonly ProfileExecutionWorkGroup[];
  readonly blockedSourceConflicts: readonly ProfileExecutionWorkGroup[];
  readonly blockedSourceSemantics: readonly ProfileExecutionWorkGroup[];
  readonly profileSpecificExecution: readonly ProfileExecutionWorkGroup[];
  readonly authorizesExecution: false;
  readonly notes: readonly string[];
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

const WEAPON_CAST_REVIEWS: readonly ExecutionSemanticReview[] =
  WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.castWindowPendingExecutionIds.map((pendingExecutionId) => ({
    pendingExecutionId,
    status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
    actionKey: 'weapon:cast-timed-self-window',
    reviewedAt: WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.reviewedAt,
    primitiveId: WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.adapterId,
    notes: [
      'Manual semantic review proved this edge belongs to the explicit cast-event -> timed SELF-window primitive.',
      'The exact profile edge remains pending until an executable timeline supplies the source event and timing.',
    ],
  }));

const WEAPON_TARGET_APPLICATION_REVIEWS: readonly ExecutionSemanticReview[] =
  WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.targetStatusPendingExecutionIds.map((pendingExecutionId) => ({
    pendingExecutionId,
    status: 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING',
    actionKey: 'weapon:aero-erosion-application-state',
    reviewedAt: WEAPON_TRIGGER_UPTIME_SEMANTIC_SPLIT.reviewedAt,
    notes: [
      'The target/application-state boundary was manually split from cast-window semantics.',
      'Only still-canonical pending target/application edges belong in this list.',
    ],
  }));

const WEAPON_SKILL_STACK_REVIEWS: readonly ExecutionSemanticReview[] =
  WEAPON_SKILL_STACK_SEMANTIC_REVIEW.contracts.map((contract) => ({
    pendingExecutionId: contract.pendingExecutionId,
    status: 'BLOCKED_SOURCE_SEMANTICS',
    actionKey: contract.actionKey,
    reviewedAt: WEAPON_SKILL_STACK_SEMANTIC_REVIEW.reviewedAt,
    blockerId: WEAPON_SKILL_STACK_SEMANTIC_REVIEW.blockerId,
    notes: [
      `Source-reviewed trigger semantic: ${contract.triggerSemantic}.`,
      ...contract.unresolvedSemantics,
      'No stack lifecycle runtime is authorized until the duration/refresh policy is independently resolved.',
    ],
  }));

const BLAZING_BRILLIANCE_STACK_REVIEWS: readonly ExecutionSemanticReview[] =
  BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW.contracts.map((contract) => ({
    pendingExecutionId: contract.pendingExecutionId,
    status: 'BLOCKED_SOURCE_SEMANTICS',
    actionKey: contract.actionKey,
    reviewedAt: BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW.reviewedAt,
    blockerId: BLAZING_BRILLIANCE_STACK_SEMANTIC_REVIEW.blockerId,
    notes: [
      `Source-reviewed trigger semantic: ${contract.triggerSemantic}.`,
      ...contract.unresolvedSemantics,
      'The raw Searing Feather values remain verified, but no executable at-cap timer policy is authorized.',
    ],
  }));

const SONATA_CAST_WINDOW_REVIEWS: readonly ExecutionSemanticReview[] =
  SONATA_CAST_WINDOW_SEMANTIC_SPLIT.pendingExecutionIds.map((pendingExecutionId) => ({
    pendingExecutionId,
    status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
    actionKey: 'sonata:cast-timed-self-window',
    reviewedAt: SONATA_CAST_WINDOW_SEMANTIC_SPLIT.reviewedAt,
    primitiveId: SONATA_CAST_WINDOW_SEMANTIC_SPLIT.adapterId,
    notes: [
      'Manual semantic review proved this canonical Sonata edge belongs to an explicit owner cast-event -> timed SELF-window primitive.',
      'The exact profile dependency remains pending until an executable predecessor/profile timeline supplies the matching source event and timestamp; equipment alone grants no uptime.',
    ],
  }));

const SONATA_TRANSFER_REVIEWS: readonly ExecutionSemanticReview[] =
  SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT.directOutroPendingExecutionIds.map((pendingExecutionId) => ({
    pendingExecutionId,
    status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
    actionKey: 'sonata:direct-outro-incoming-transfer',
    reviewedAt: SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT.reviewedAt,
    primitiveId: SONATA_OUTRO_TRANSFER_SEMANTIC_SPLIT.adapterId,
    notes: [
      'Manual semantic review proved this direct Outro transfer can use incoming-transfer-state-v1 through the Sonata wrapper.',
      'The profile dependency remains pending until the exact rotation supplies outgoing actor, incoming Resonator and timing.',
    ],
  }));

const JINHSI_RESOURCE_REVIEWS: readonly ExecutionSemanticReview[] =
  JINHSI_RESOURCE_EXECUTION_SEMANTIC_REVIEW.pendingExecutionIds.map((pendingExecutionId) => ({
    pendingExecutionId,
    status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
    actionKey: 'character:jinhsi-resource-state',
    reviewedAt: JINHSI_RESOURCE_EXECUTION_SEMANTIC_REVIEW.reviewedAt,
    primitiveId: JINHSI_RESOURCE_EXECUTION_SEMANTIC_REVIEW.primitiveId,
    notes: [
      ...JINHSI_RESOURCE_EXECUTION_SEMANTIC_REVIEW.notes,
      'Primitive availability does not establish the canonical opener predecessor resource/cooldown state.',
    ],
  }));

const JINHSI_TEAM_INCOMING_REVIEWS: readonly ExecutionSemanticReview[] = [{
  pendingExecutionId: JINHSI_TEAM_INCOMING_EXECUTION_SEMANTIC_REVIEW.pendingExecutionId,
  status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
  actionKey: 'team:jinhsi-incoming-state',
  reviewedAt: JINHSI_TEAM_INCOMING_EXECUTION_SEMANTIC_REVIEW.reviewedAt,
  primitiveId: JINHSI_TEAM_INCOMING_EXECUTION_SEMANTIC_REVIEW.primitiveId,
  notes: JINHSI_TEAM_INCOMING_EXECUTION_SEMANTIC_REVIEW.notes,
}];

const JUE_BLESSING_REVIEWS: readonly ExecutionSemanticReview[] = [{
  pendingExecutionId: JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.pendingExecutionId,
  status: 'BLOCKED_SOURCE_SEMANTICS',
  actionKey: 'echo:jue-cast-blessing-state',
  reviewedAt: JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.reviewedAt,
  primitiveId: JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.primitiveId,
  blockerId: JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.blockerId,
  notes: JUE_BLESSING_EXECUTION_SEMANTIC_REVIEW.notes,
}];

const HERON_REVIEWS: readonly ExecutionSemanticReview[] = [{
  pendingExecutionId: IMPERMANENCE_HERON_TRANSFER_DISPOSITION.pendingExecutionId,
  status: 'BLOCKED_SOURCE_CONFLICT',
  actionKey: 'echo:impermanence-heron-transfer',
  reviewedAt: IMPERMANENCE_HERON_TRANSFER_DISPOSITION.reviewedAt,
  blockerId: 'BUG-008',
  notes: IMPERMANENCE_HERON_TRANSFER_DISPOSITION.notes,
}];

const FALLACY_ACTIVE_DAMAGE_REVIEWS: readonly ExecutionSemanticReview[] = [{
  pendingExecutionId: FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.pendingExecutionId,
  status: 'BLOCKED_SOURCE_SEMANTICS',
  actionKey: 'echo:fallacy-cast-variant-resolution',
  reviewedAt: FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.reviewedAt,
  blockerId: FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.blockerId,
  notes: [
    ...FALLACY_ACTIVE_DAMAGE_SEMANTIC_REVIEW.unresolvedSemantics,
    'The exact normal activation blast is attack data only; profile execution remains blocked until the source sequence resolves normal cast versus hold/release.',
  ],
}];

const DEFIERS_THORN_DEF_REVIEWS: readonly ExecutionSemanticReview[] = [{
  pendingExecutionId: 'weapon:defiers-thorn:DT-DEF:source-timing-adapter',
  status: 'BLOCKED_SOURCE_SEMANTICS',
  actionKey: 'weapon:defiers-thorn-def-timing',
  reviewedAt: DEFIERS_THORN_DEF_EXECUTION_REVIEW_20260830.checkedAt,
  blockerId: 'BUG-011',
  notes: [
    ...DEFIERS_THORN_DEF_EXECUTION_REVIEW_20260830.notes,
    'This exact Cartethyia dependency stays parked; the closure tranche does not infer a delay/window lifecycle from ambiguous prose.',
  ],
}];

const ROVER_AERO_REVIEWS: readonly ExecutionSemanticReview[] = [
  {
    pendingExecutionId: 'weapon:bloodpacts-pledge:BPP-SKILL:healing-uptime-adapter',
    status: 'BLOCKED_SOURCE_SEMANTICS',
    actionKey: 'weapon:bloodpacts-pledge-healing-window-overlap',
    reviewedAt: ROVER_AERO_STANDARD_ROTATION_EXECUTION_REVIEW_20260830.checkedAt,
    blockerId: ROVER_AERO_STANDARD_ROTATION_EXECUTION_REVIEW_20260830.blockerId,
    notes: [
      ...ROVER_AERO_STANDARD_ROTATION_EXECUTION_REVIEW_20260830.sourceEstablished,
      ...ROVER_AERO_STANDARD_ROTATION_EXECUTION_REVIEW_20260830.unresolvedSemantics,
      'Healing events and the 6-second weapon duration are source-proven; exact overlap is not. This edge stays parked instead of receiving blanket uptime.',
    ],
  },
  {
    pendingExecutionId: 'weapon:bloodpacts-pledge:BPP-TEAM-AERO:unbound-flow-team-amplify-adapter',
    status: 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING',
    actionKey: 'weapon:bloodpacts-pledge-unbound-flow-team-amplify',
    reviewedAt: ROVER_AERO_STANDARD_ROTATION_EXECUTION_REVIEW_20260830.checkedAt,
    notes: [
      'The weapon trigger is exact: Rover (Aero) casting Unbound Flow grants nearby on-field Resonators Aero DMG Amplification for 30 seconds.',
      'The canonical source sequence explicitly contains Unbound Flow P1 before the swap, so trigger identity is semantically resolved.',
      'No profile dependency closes until an executable Rover rotation owns the event and team state.',
    ],
  },
  {
    pendingExecutionId: 'echo:echo-60001065:active-skill-damage-adapter',
    status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
    actionKey: 'echo:active-cast-exact-damage',
    reviewedAt: ROVER_AERO_STANDARD_ROTATION_EXECUTION_REVIEW_20260830.checkedAt,
    primitiveId: 'echo-active-damage-v1',
    notes: [
      'Prydwen Echo Usage explicitly places Reminiscence: Fleurdelys after Unbound Flow P1 and before switching out, so the cast event is source-proven for this profile sequence.',
      'echo-active-damage-v1 already resolves the exact Rank-5 Fleurdelys ACTIVE_CAST attack data.',
      'The dependency remains pending because the Rover profile is still SOURCE_SEQUENCE_ONLY; primitive availability does not manufacture an executable rotation.',
    ],
  },
];

/** Semantic records only for exact dependencies that are still pending. */
export const EXECUTION_SEMANTIC_REVIEWS: readonly ExecutionSemanticReview[] = Object.freeze([
  ...WEAPON_CAST_REVIEWS,
  ...WEAPON_TARGET_APPLICATION_REVIEWS,
  ...WEAPON_SKILL_STACK_REVIEWS,
  ...BLAZING_BRILLIANCE_STACK_REVIEWS,
  ...SONATA_CAST_WINDOW_REVIEWS,
  ...SONATA_TRANSFER_REVIEWS,
  ...JINHSI_RESOURCE_REVIEWS,
  ...JINHSI_TEAM_INCOMING_REVIEWS,
  ...JUE_BLESSING_REVIEWS,
  ...HERON_REVIEWS,
  ...FALLACY_ACTIVE_DAMAGE_REVIEWS,
  ...DEFIERS_THORN_DEF_REVIEWS,
  ...ROVER_AERO_REVIEWS,
]);

export function validateExecutionSemanticReviews(
  matrix: ProfileAdapterDependencyMatrix = PROFILE_ADAPTER_DEPENDENCY_MATRIX,
  reviews: readonly ExecutionSemanticReview[] = EXECUTION_SEMANTIC_REVIEWS,
): readonly string[] {
  const issues: string[] = [];
  const canonicalIds = new Set(matrix.edges.map((edge) => edge.pendingExecutionId));
  const profileSpecificIds = new Set(
    matrix.edges
      .filter((edge) => edge.implementationScope === 'PROFILE_SPECIFIC_EXECUTION')
      .map((edge) => edge.pendingExecutionId),
  );
  const seen = new Set<string>();

  for (const review of reviews) {
    if (!review.pendingExecutionId.trim()) issues.push('semantic review pendingExecutionId is blank');
    if (seen.has(review.pendingExecutionId)) issues.push(`duplicate semantic review ${review.pendingExecutionId}`);
    seen.add(review.pendingExecutionId);
    if (!canonicalIds.has(review.pendingExecutionId)) issues.push(`semantic review targets non-canonical pending id ${review.pendingExecutionId}`);
    if (profileSpecificIds.has(review.pendingExecutionId)) issues.push(`profile-specific execution id must not use reusable semantic review ${review.pendingExecutionId}`);
    if (!review.actionKey.trim()) issues.push(`semantic review ${review.pendingExecutionId} has blank actionKey`);
    if (!review.reviewedAt.trim()) issues.push(`semantic review ${review.pendingExecutionId} has blank reviewedAt`);
    if (review.notes.length === 0) issues.push(`semantic review ${review.pendingExecutionId} has no notes`);
    if (review.status === 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE' && !review.primitiveId?.trim()) {
      issues.push(`semantic review ${review.pendingExecutionId} requires primitiveId`);
    }
    if ((review.status === 'BLOCKED_SOURCE_CONFLICT' || review.status === 'BLOCKED_SOURCE_SEMANTICS') && !review.blockerId?.trim()) {
      issues.push(`semantic review ${review.pendingExecutionId} requires blockerId`);
    }
  }
  return issues;
}

function dispositionForEdge(
  edge: ProfileAdapterDependencyEdge,
  reviewById: ReadonlyMap<string, ExecutionSemanticReview>,
): ProfileExecutionDispositionEdge {
  if (edge.implementationScope === 'PROFILE_SPECIFIC_EXECUTION') {
    return { ...edge, semanticStatus: 'PROFILE_SPECIFIC_EXECUTION', actionKey: edge.syntacticPrimitiveKey, primitiveId: null, blockerId: null };
  }
  const review = reviewById.get(edge.pendingExecutionId);
  if (!review) return { ...edge, semanticStatus: 'UNREVIEWED', actionKey: edge.syntacticPrimitiveKey, primitiveId: null, blockerId: null };
  return { ...edge, semanticStatus: review.status, actionKey: review.actionKey, primitiveId: review.primitiveId ?? null, blockerId: review.blockerId ?? null };
}

function groupEdges(edges: readonly ProfileExecutionDispositionEdge[]): readonly ProfileExecutionWorkGroup[] {
  return uniqueSorted(edges.map((edge) => edge.actionKey)).map((actionKey) => {
    const matching = edges.filter((edge) => edge.actionKey === actionKey);
    const statuses = uniqueSorted(matching.map((edge) => edge.semanticStatus));
    if (statuses.length !== 1) throw new Error(`Execution action ${actionKey} mixes semantic statuses: ${statuses.join(', ')}`);
    return {
      actionKey,
      semanticStatus: matching[0]?.semanticStatus ?? 'UNREVIEWED',
      dependencyCount: matching.length,
      profileCount: new Set(matching.map((edge) => edge.presetId)).size,
      characterCount: new Set(matching.map((edge) => edge.characterId)).size,
      syntacticPrimitiveKeys: uniqueSorted(matching.map((edge) => edge.syntacticPrimitiveKey)),
      pendingExecutionIds: uniqueSorted(matching.map((edge) => edge.pendingExecutionId)),
      presetIds: uniqueSorted(matching.map((edge) => edge.presetId)),
      characterIds: uniqueSorted(matching.map((edge) => edge.characterId)),
      primitiveIds: uniqueSorted(matching.flatMap((edge) => edge.primitiveId ? [edge.primitiveId] : [])),
      blockerIds: uniqueSorted(matching.flatMap((edge) => edge.blockerId ? [edge.blockerId] : [])),
    };
  });
}

function actionableSort(left: ProfileExecutionWorkGroup, right: ProfileExecutionWorkGroup): number {
  const leftReviewed = left.semanticStatus === 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING' ? 1 : 0;
  const rightReviewed = right.semanticStatus === 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING' ? 1 : 0;
  return right.profileCount - left.profileCount
    || right.characterCount - left.characterCount
    || right.dependencyCount - left.dependencyCount
    || rightReviewed - leftReviewed
    || left.actionKey.localeCompare(right.actionKey);
}

function generalSort(left: ProfileExecutionWorkGroup, right: ProfileExecutionWorkGroup): number {
  return right.profileCount - left.profileCount
    || right.characterCount - left.characterCount
    || right.dependencyCount - left.dependencyCount
    || left.actionKey.localeCompare(right.actionKey);
}

export function buildProfileExecutionWorkQueue(
  matrix: ProfileAdapterDependencyMatrix = PROFILE_ADAPTER_DEPENDENCY_MATRIX,
  reviews: readonly ExecutionSemanticReview[] = EXECUTION_SEMANTIC_REVIEWS,
): ProfileExecutionWorkQueue {
  const issues = validateExecutionSemanticReviews(matrix, reviews);
  if (issues.length > 0) throw new Error(`Invalid execution semantic review catalog: ${issues.join('; ')}`);

  const reviewById = new Map(reviews.map((review) => [review.pendingExecutionId, review] as const));
  const edges = matrix.edges.map((edge) => dispositionForEdge(edge, reviewById));
  const count = (status: ExecutionSemanticStatus) => edges.filter((edge) => edge.semanticStatus === status).length;
  const unreviewedEdges = count('UNREVIEWED');
  const semanticallyReviewedImplementationPendingEdges = count('SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING');
  const primitiveAvailableRequiresTimelineEdges = count('PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  const blockedSourceConflictEdges = count('BLOCKED_SOURCE_CONFLICT');
  const blockedSourceSemanticsEdges = count('BLOCKED_SOURCE_SEMANTICS');
  const profileSpecificExecutionEdges = count('PROFILE_SPECIFIC_EXECUTION');
  const actionableEdges = edges.filter((edge) => edge.semanticStatus === 'UNREVIEWED' || edge.semanticStatus === 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING');

  return {
    summary: {
      totalEdges: edges.length,
      unreviewedEdges,
      semanticallyReviewedImplementationPendingEdges,
      primitiveAvailableRequiresTimelineEdges,
      blockedSourceConflictEdges,
      blockedSourceSemanticsEdges,
      profileSpecificExecutionEdges,
      actionableSharedEdges: actionableEdges.length,
    },
    reviewRecordCount: reviews.length,
    edges,
    actionableSharedQueue: [...groupEdges(actionableEdges)].sort(actionableSort),
    primitiveAvailableRequiresTimeline: [...groupEdges(edges.filter((edge) => edge.semanticStatus === 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE'))].sort(generalSort),
    blockedSourceConflicts: [...groupEdges(edges.filter((edge) => edge.semanticStatus === 'BLOCKED_SOURCE_CONFLICT'))].sort(generalSort),
    blockedSourceSemantics: [...groupEdges(edges.filter((edge) => edge.semanticStatus === 'BLOCKED_SOURCE_SEMANTICS'))].sort(generalSort),
    profileSpecificExecution: [...groupEdges(edges.filter((edge) => edge.semanticStatus === 'PROFILE_SPECIFIC_EXECUTION'))].sort(generalSort),
    authorizesExecution: false,
    notes: [
      'The work queue classifies exact canonical pending edges; it never removes or closes pendingExecutionIds.',
      'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE means reusable mechanics exist but the exact profile still lacks an executable event timeline.',
      'BLOCKED_SOURCE_CONFLICT and BLOCKED_SOURCE_SEMANTICS stay excluded until their evidence gaps are resolved.',
      'PROFILE_SPECIFIC_EXECUTION remains separate from shared-primitive prioritization.',
      'Unlisted new pending IDs become UNREVIEWED automatically and surface in the actionable queue.',
    ],
  };
}

export const PROFILE_EXECUTION_WORK_QUEUE = buildProfileExecutionWorkQueue();