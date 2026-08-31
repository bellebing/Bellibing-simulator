import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 as BASE_PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from './profileBackwardImpactReview.ts';
import { PROFILE_COHORT_01_GREEN_LANE_IMPACT_REVIEWS } from './profileCohort01GreenLaneImpact20260830.ts';
import {
  applyProfileExecutionDependencyClosures,
} from './profileExecutionClosures20260830.ts';
import { PROFILE_LINGYANG_EXECUTION_IMPACT_REVIEWS } from './profileLingyangExecutionImpact20260831.ts';
import { PROFILE_MULTIMODE_DENIA_IMPACT_REVIEWS } from './profileMultiModeDeniaImpact20260829.ts';
import { PROFILE_MULTIMODE_ZHEZHI_IMPACT_REVIEWS } from './profileMultiModeZhezhiImpact20260829.ts';
import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';

/**
 * Canonical aggregate of current profile-onboarding backward-impact reviews.
 *
 * The original review files remain stable historical/current baseline data.
 * Focused execution slices are applied as explicit, fail-closed dependency
 * closures here instead of rewriting the source-review snapshots that first
 * recorded each pending boundary.
 */
const PROFILE_BACKWARD_IMPACT_REVIEW_BASE: readonly ProfileBackwardImpactReview[] = Object.freeze([
  ...BASE_PROFILE_BACKWARD_IMPACT_REVIEWS_V36,
  ...PROFILE_MULTIMODE_ZHEZHI_IMPACT_REVIEWS,
  ...PROFILE_MULTIMODE_DENIA_IMPACT_REVIEWS,
  ...PROFILE_COHORT_01_GREEN_LANE_IMPACT_REVIEWS,
  ...PROFILE_LINGYANG_EXECUTION_IMPACT_REVIEWS,
]);

export const PROFILE_BACKWARD_IMPACT_REVIEWS_V36: readonly ProfileBackwardImpactReview[] = Object.freeze(
  applyProfileExecutionDependencyClosures(PROFILE_BACKWARD_IMPACT_REVIEW_BASE),
);
