import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';

export const JINHSI_STANDARD_OPENER_IMPACT_REVIEWS_20260901: readonly ProfileBackwardImpactReview[] = [
  {
    reviewId: 'PROFILE-IMPACT-JINHSI-OPENER-2026-09-01-01',
    characterId: 'jinhsi',
    presetId: 'jinhsi-standard-opener',
    weaponRecommendationProfileId: 'jinhsi-standard-weapons',
    checkedAt: '2026-09-01',
    patch: '3.6',
    reviewedWeaponEffectIds: ['AH-ATTR', 'AH-INTRO', 'AH-SKILL'],
    reviewedSonataSetIds: ['sonata-5'],
    reviewedEchoIds: ['echo-60000595'],
    pendingExecutionIds: [
      'weapon:ages-of-harvest:AH-INTRO:trigger-uptime-adapter',
      'weapon:ages-of-harvest:AH-SKILL:trigger-uptime-adapter',
      'sonata:sonata-5:S05_5PC_SPECTRO:trigger-uptime-adapter',
      'echo:echo-60000595:jue-active-skill-and-blessing-adapter',
      'character:jinhsi:jinhsi-forte-incandescence-damage-multiplier:resource-timeline-adapter',
      'character:jinhsi:jinhsi-resource-unison:availability-adapter',
      'team:jinhsi-zhezhi-verina:incoming-state-adapter',
      'rotation:jinhsi-standard-opener-source-sequence:engine-model',
    ],
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'Ages of Harvest permanent 12% Attribute DMG is source-modeled. Its Intro and Resonance-Skill 24%/12s windows remain event/timestamp responsibilities; the canonical opener contains no Intro event.',
      'Celestial Light 2-piece 10% Spectro is permanent. Its 5-piece 30%/15s Intro window cannot be active merely because the set is equipped; the canonical opener starts at Basic P1.',
      'Exact Rank-5 Jué active-cast damage, 16% Skill-DMG Blessing, 16% once-per-second Skill-classified proc, 15s duration and 20s cooldown are source-closed facts, but the canonical opener contains no Jué cast.',
      'Basic P4 -> Overflowing Radiance -> Incarnation -> Incarnation Basic P4 -> Ordination Glow -> Illuminous Epiphany is source-safe state order. Starting/earned Incandescence and Unison/Concerto predecessor state remain unresolved.',
      'Zhezhi and Verina mechanics have independently verified raw facts, but this Jinhsi profile has no canonical predecessor timeline proving their incoming effects or coordinated-attack contribution at opener start.',
      'The source target 100–125% Energy Regen is team-dependent and is not promoted to an exact hard execution gate without canonical team energy accounting.',
      'The canonical artifact is an opener only. No exact duration, opener DPS denominator, sustained loop, ENGINE_MODELED rotation or DPS_READY state is inferred.',
    ],
  },
];
