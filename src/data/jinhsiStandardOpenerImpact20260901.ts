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
      'Ages of Harvest permanent 12% Attribute DMG is source-modeled. Its Intro and Resonance-Skill 24%/12s windows are covered by weapon-cast-timed-self-window-v1, but still require actual events/timestamps; the canonical opener contains no Intro event.',
      'Celestial Light 2-piece 10% Spectro is permanent. Its 5-piece 30%/15s Intro window is covered by sonata-cast-timed-self-window-v1 but cannot be active merely because the set is equipped; the canonical opener starts at Basic P1.',
      'Exact Rank-5 Jué active-cast damage, 16% Skill-DMG Blessing, 16% once-per-second Skill-classified proc, 15s duration and 20s cooldown are source-closed and executable through jue-blessing-state-v1 from explicit cast/hit events; the canonical opener contains no Jué cast.',
      'Basic P4 -> Overflowing Radiance -> Incarnation -> Incarnation Basic P4 -> Ordination Glow -> Illuminous Epiphany is source-safe state order. jinhsi-resource-state-v1 can execute Incandescence generation/consume and Unison grant/consume from known predecessor state plus explicit events, but canonical starting Incandescence/cadence and Unison/Concerto predecessor state remain unresolved.',
      'jinhsi-team-incoming-state-v1 can execute source-defined Zhezhi Outro and Verina trigger/switch windows from explicit predecessor events. This profile supplies no such canonical predecessor timeline, so no teammate buff, +15 Zhezhi Energy handoff or coordinated-attack contribution is assumed at opener start.',
      'The source target 100–125% Energy Regen is team-dependent and is not promoted to an exact hard execution gate without canonical team energy accounting.',
      'Seven of eight Jinhsi pending execution edges now have source-safe event/state primitives; the profile-specific engine-model edge remains separate. Primitive availability closes zero dependencies because the canonical opener still lacks predecessor state/timestamps and exact duration.',
      'The canonical artifact is an opener only. No exact duration, opener DPS denominator, sustained loop, ENGINE_MODELED rotation or DPS_READY state is inferred.',
    ],
  },
];
