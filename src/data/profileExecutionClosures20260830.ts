import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';
import { FLEURDELYS_CHARACTER_RESTRICTION_REVIEW } from './echoCharacterRestrictedEffects.ts';
import { AERO_EROSION_WEAPON_ADAPTER_REVIEW_20260830 } from '../combat/aeroErosionWeaponAdapter.ts';
import { CIACCONA_BASIC_ROTATION_EXECUTION_REVIEW_20260830 } from './profileExecutionSemanticReview20260830.ts';

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
  {
    closureId: 'PROFILE-CLOSURE-CIACCONA-WA-AERO-2026-08-30-01',
    reviewedAt: AERO_EROSION_WEAPON_ADAPTER_REVIEW_20260830.checkedAt,
    pendingExecutionId: 'weapon:woodland-aria:WA-AERO:trigger-uptime-adapter',
    presetIds: ['ciaccona-cartethyia-aero'],
    primitiveId: AERO_EROSION_WEAPON_ADAPTER_REVIEW_20260830.adapterId,
    notes: [
      'The canonical Ciaccona engine emits source-proven Aero Erosion application events from Intro, Basic P4, Harmonic Allegro and Quadruple Downbeat.',
      'Woodland Aria WA-AERO activates only after the first proven application; its 10-second source duration covers all later events in the verified 4.5-second fixed rotation without fabricated per-action timestamps.',
    ],
  },
  {
    closureId: 'PROFILE-CLOSURE-CIACCONA-WA-AERO-RES-2026-08-30-01',
    reviewedAt: AERO_EROSION_WEAPON_ADAPTER_REVIEW_20260830.checkedAt,
    pendingExecutionId: 'weapon:woodland-aria:WA-AERO-RES:target-state-adapter',
    presetIds: ['ciaccona-cartethyia-aero'],
    primitiveId: AERO_EROSION_WEAPON_ADAPTER_REVIEW_20260830.adapterId,
    notes: [
      'The shared Aero Erosion target-state primitive starts clean, changes only on explicit application events and conservatively proves persistence across the short fixed rotation.',
      'WA-AERO-RES activates after a hit whose pre-hit target state is already Aero-Eroded. The triggering hit itself is not granted newly-created RES reduction because same-hit ordering is not source-proven.',
    ],
  },
  {
    closureId: 'PROFILE-CLOSURE-CARTETHYIA-DT-AERO-AMP-2026-08-30-01',
    reviewedAt: AERO_EROSION_WEAPON_ADAPTER_REVIEW_20260830.checkedAt,
    pendingExecutionId: 'weapon:defiers-thorn:DT-AERO-AMP:target-state-adapter',
    presetIds: ['cartethyia-aero-erosion'],
    primitiveId: AERO_EROSION_WEAPON_ADAPTER_REVIEW_20260830.adapterId,
    notes: [
      'Defier’s Thorn DT-AERO-AMP is now executable as a pure query against the shared team target-state primitive: nonzero only while the supplied target is explicitly affected by Aero Erosion.',
      'This does not claim Cartethyia rotation timing or initial target state. Her eventual engine must still supply the actual ordered team/target state.',
      'DT-DEF remains parked behind its separate SOURCE_SEMANTICS ambiguity and is not inferred from this closure.',
    ],
  },
  {
    closureId: 'PROFILE-CLOSURE-CIACCONA-ROTATION-ENGINE-2026-08-30-01',
    reviewedAt: CIACCONA_BASIC_ROTATION_EXECUTION_REVIEW_20260830.checkedAt,
    pendingExecutionId: 'rotation:ciaccona-basic-cartethyia-rover-aero:engine-model',
    presetIds: ['ciaccona-cartethyia-aero'],
    primitiveId: 'CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1',
    notes: [
      'The exact canonical fixed sequence is now an executable ordered-event model using canonical Character motion-value curves and source-backed 4.5-second total duration.',
      'The engine validates Musical Essence generation/consumption, P4 Jump-cancel Solo Concert, Aero Erosion application state, Woodland Aria and Gusts of Welkin execution state.',
      'Optional/periodic Symphonic Poem: Tonic events remain excluded because the canonical fixed sequence does not specify a count; no status tick cadence or damage formula is fabricated.',
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
