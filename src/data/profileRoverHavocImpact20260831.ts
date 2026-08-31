import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';
import { ROVER_HAVOC_PENDING_EXECUTION_IDS } from './roverHavocExecutionPreflight20260831.ts';

/**
 * Rover (Havoc) canonical-profile backward-impact review.
 *
 * This worker review deliberately parks source/timeline gaps instead of using
 * Rover (Aero) BUG-012 or peak-uptime assumptions as substitutes.
 */
export const PROFILE_ROVER_HAVOC_IMPACT_REVIEWS: readonly ProfileBackwardImpactReview[] = [
  {
    reviewId: 'PROFILE-IMPACT-ROVER-HAVOC-STANDARD-2026-08-31-01',
    characterId: 'rover-havoc',
    presetId: 'rover-havoc-standard',
    weaponRecommendationProfileId: 'rover-havoc-standard-weapons',
    checkedAt: '2026-08-31',
    patch: '3.6',
    reviewedWeaponEffectIds: ['RS-ATK', 'RS-BASIC', 'RS-CONCERTO-BASIC'],
    reviewedSonataSetIds: ['sonata-6'],
    reviewedEchoIds: ['echo-60000535'],
    pendingExecutionIds: ROVER_HAVOC_PENDING_EXECUTION_IDS,
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'Canonical sequence is Rover (Havoc) S0. Rover (Aero) BUG-012 is unrelated and is not reused as a blocker or shortcut.',
      'Red Spring R1 permanent ATK is source-modeled; Basic-hit stack timing and Concerto-window lifecycle remain pending behind missing full-cycle timing/state rather than assumed uptime.',
      'Havoc Eclipse 2-piece is modeled. Its 5-piece remains parked behind the canonical source conflict plus omitted warm-up stack state.',
      'Dreamless exact Rank-5 active attack magnitude is now cataloged and the generic Echo active-damage primitive exists, but the profile has no executable timeline or modeled post-Liberation conditional branch yet.',
      'Rover raw facts prove the 100-Umbra Dark Surge entry mechanic but not enough numeric warm-up/resource/depletion timing to execute the two Umbra chains and Lifetaker as an exact state ledger.',
      'Roccia + The Shorekeeper is an exact reviewed team context and 140%+ ER is published build context for that trio, but the Rover-only source sequence does not execute support actions or an energy ledger. Numeric ER gate remains intentionally unset.',
      'No total source-reviewed Medium Burst duration exists. Optional Lifetaker/Dreamless swap-cancel text therefore remains qualitative and does not become frame timing.',
      'Partial Roll Assist remains POLICY PENDING; no policy binding or Alpha product binding is authorized while Personal Rotation DPS is blocked.',
    ],
  },
];
