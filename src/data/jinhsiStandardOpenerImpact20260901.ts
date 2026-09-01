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
      'This source-review snapshot preserves the eight execution edges originally identified for the canonical Jinhsi opener. The aggregate catalog applies source-specific fail-closed closure records afterward rather than rewriting this review history.',
      'Ages of Harvest permanent 12% Attribute DMG is source-modeled. Current Standard Opener source explicitly starts combat with Jinhsi and contains no Intro, so the aggregate AH-INTRO dependency is source-closed as inactive; AH-SKILL remains pending because exact 12-second overlap needs action timing.',
      'Celestial Light 2-piece 10% Spectro is permanent. Its 5-piece Intro-triggered window remains reusable through sonata-cast-timed-self-window-v1, while the exact combat-start Standard Opener dependency is source-closed as inactive because no Intro occurs.',
      'Exact Rank-5 Jué active-cast damage, 16% Skill-DMG Blessing, 16% once-per-second Skill-classified proc, 15s duration and 20s cooldown are executable through jue-blessing-state-v1 from explicit cast/hit events. Current source describes Jué timing as free-flow and does not pin a Standard Opener cast, so this dependency remains open rather than treating omission as guaranteed absence.',
      'Basic P4 -> Overflowing Radiance -> Incarnation -> Incarnation Basic P4 -> Ordination Glow -> Illuminous Epiphany is source-safe state order. The first combat-start Illuminous -> Unison -> Outro path is source-closed separately; Incandescence amount/cadence remains unresolved.',
      'Current rotation-concept source explicitly places the low-power opener before the rest of the team applies buffs. No teammate window is treated as active inside the opener, but the broader Jinhsi+Zhezhi+Verina incoming-state dependency remains pending for later-cycle team execution and energy accounting.',
      'The source target 100–125% Energy Regen remains guidance and is not promoted to an exact hard gate for the exact Jinhsi+Zhezhi+Verina context without stronger source or exact team accounting.',
      'After applying source-specific closures, aggregate Jinhsi pending execution is reduced to AH-SKILL, Jué, Incandescence, team incoming state and the profile-specific engine-model edge.',
      'The canonical artifact remains an opener only. No exact duration, opener DPS denominator, sustained loop, ENGINE_MODELED rotation or DPS_READY state is inferred.',
    ],
  },
];
