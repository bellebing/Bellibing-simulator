import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';

/**
 * Character-specific backward-impact review for the canonical Chixia profile.
 *
 * The source package is complete enough to identify its reusable effect
 * boundaries, but not to authorize an executable rotation or DPS denominator.
 */
export const CHIXIA_STANDARD_PROFILE_IMPACT_REVIEW_20260831: ProfileBackwardImpactReview = {
  reviewId: 'PROFILE-IMPACT-CHIXIA-STANDARD-2026-08-31-01',
  characterId: 'chixia',
  presetId: 'chixia-standard',
  weaponRecommendationProfileId: 'chixia-standard-weapons',
  checkedAt: '2026-08-31',
  patch: '3.6',
  reviewedWeaponEffectIds: ['TLD-ATK', 'TLD-SKILL'],
  reviewedSonataSetIds: ['sonata-2'],
  reviewedEchoIds: ['echo-60000915'],
  pendingExecutionIds: [
    'weapon:the-last-dance:TLD-SKILL:trigger-uptime-adapter',
    'sonata:sonata-2:S02_5PC_FUSION:trigger-uptime-adapter',
    'echo:echo-60000915:nightmare-inferno-rider-active-skill-damage-adapter',
    'rotation:chixia-standard-rotation:engine-model',
  ],
  result: 'REVIEWED_WITH_PENDING_EXECUTION',
  notes: [
    'The Last Dance R1 permanent 12% ATK is source-modeled. Its 5-second Resonance Skill DMG window after Intro/Liberation belongs to the existing cast-timed SELF-window primitive and still needs exact event overlap from the Chixia timeline.',
    'Molten Rift 2-piece Fusion bonus is source-modeled. Its 5-piece 30% Fusion DMG window for 15 seconds after Resonance Skill belongs to the existing Sonata cast-window primitive and must follow executed Skill casts.',
    'Nightmare: Inferno Rider main-slot 12% Fusion and 12% Resonance Skill bonuses are source-modeled. Exact Rank-5 normal active damage is cataloged separately, while the canonical source step only says Echo and does not resolve normal activation versus hold/Riding Mode.',
    'The reviewed Burst Combo proves two full 30-bullet DAKA DAKA channels and publishes 4 seconds for a full channel, but no source-backed total duration for Echo -> Intro -> channel -> Boom Boom -> Liberation -> channel -> Boom Boom -> Outro was found.',
    'The exact S0 canonical profile intentionally has no materialized numeric Energy Regen gate. The current 115% endgame suggestion is published under Prydwen defaults for 4-star/free-character recommendations and is not promoted into this exact profile context.',
    'Lupa + Brant is the source-reviewed canonical team. Their relevant team/Outro effects remain combat-state facts; this profile does not invent predecessor timing, target-category state, or transfer uptime.',
  ],
};

export const PROFILE_CHIXIA_IMPACT_REVIEWS_20260831: readonly ProfileBackwardImpactReview[] = [
  CHIXIA_STANDARD_PROFILE_IMPACT_REVIEW_20260831,
] as const;
