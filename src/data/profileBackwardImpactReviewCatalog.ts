import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 as BASE_PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from './profileBackwardImpactReview.ts';
import { PROFILE_MULTIMODE_ZHEZHI_IMPACT_REVIEWS } from './profileMultiModeZhezhiImpact20260829.ts';
import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';

/**
 * Canonical aggregate of current profile-onboarding backward-impact reviews.
 *
 * The original review file remains stable historical/current baseline data;
 * focused profile throughput slices append here instead of requiring risky
 * monolithic edits to that file.
 */
export const PROFILE_BACKWARD_IMPACT_REVIEWS_V36: readonly ProfileBackwardImpactReview[] = Object.freeze([
  ...BASE_PROFILE_BACKWARD_IMPACT_REVIEWS_V36,
  ...PROFILE_MULTIMODE_ZHEZHI_IMPACT_REVIEWS,
]);
