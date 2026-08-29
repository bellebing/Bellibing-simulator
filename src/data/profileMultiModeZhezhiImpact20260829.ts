import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';

export const PROFILE_MULTIMODE_ZHEZHI_IMPACT_REVIEWS: readonly ProfileBackwardImpactReview[] = [
  {
    reviewId: 'PROFILE-IMPACT-ZHEZHI-EMPYREAN-2026-08-29-01',
    characterId: 'zhezhi',
    presetId: 'zhezhi-empyrean-endgame',
    weaponRecommendationProfileId: 'zhezhi-carlotta-weapons',
    checkedAt: '2026-08-29',
    patch: '3.6',
    reviewedWeaponEffectIds: ['RDS-ATK', 'RDS-BASIC-STACK', 'RDS-OFFFIELD'],
    reviewedSonataSetIds: ['sonata-13'],
    reviewedEchoIds: ['echo-60001055'],
    pendingExecutionIds: [
      'weapon:rime-draped-sprouts:RDS-BASIC-STACK:skill-stack-timing-adapter',
      'weapon:rime-draped-sprouts:RDS-OFFFIELD:outro-three-stack-offfield-adapter',
      'sonata:sonata-13:S13_5PC_ACTIVE_ATK:coordinated-crit-active-resonator-adapter',
      'echo:echo-60001055:nightmare-lampylumen-active-skill-damage-adapter',
      'rotation:zhezhi-empyrean-carlotta-standard:engine-model',
    ],
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'Rime-Draped Sprouts permanent ATK component is source-audited, but exact Basic-DMG stack overlap and the Outro-at-three-stacks off-field window remain rotation/state responsibilities.',
      'Empyrean Anthem 2-piece Energy Regen and 5-piece Coordinated Attack DMG are source-modeled; the active-Resonator ATK branch still requires a coordinated-CRIT event/target adapter rather than automatic uptime.',
      'Nightmare: Lampylumen Myriad main-slot Glacio and Coordinated Attack bonuses are already modeled. Its active Summon damage is not in the exact Echo attack catalog and remains pending.',
      'The source rotation is SOURCE_SEQUENCE_ONLY and the source explicitly allows flexible Nightmare: Lampylumen timing, so no exact engine timing is invented here.',
    ],
  },
  {
    reviewId: 'PROFILE-IMPACT-ZHEZHI-MOONLIT-2026-08-29-01',
    characterId: 'zhezhi',
    presetId: 'zhezhi-moonlit-fallback',
    weaponRecommendationProfileId: 'zhezhi-carlotta-weapons',
    checkedAt: '2026-08-29',
    patch: '3.6',
    reviewedWeaponEffectIds: ['RDS-ATK', 'RDS-BASIC-STACK', 'RDS-OFFFIELD'],
    reviewedSonataSetIds: ['sonata-8'],
    reviewedEchoIds: ['echo-60000525'],
    pendingExecutionIds: [
      'weapon:rime-draped-sprouts:RDS-BASIC-STACK:skill-stack-timing-adapter',
      'weapon:rime-draped-sprouts:RDS-OFFFIELD:outro-three-stack-offfield-adapter',
      'sonata:sonata-8:S08_5PC_INCOMING_ATK:outro-transfer-adapter',
      'echo:echo-60000525:impermanence-heron-active-transfer-adapter',
      'rotation:zhezhi-moonlit-carlotta-standard:engine-model',
    ],
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'Rime-Draped Sprouts uses the same source-audited weapon rows as the endgame preset; no different weapon passive is fabricated for the fallback set.',
      'Moonlit Clouds transfer is source-reviewed but its Outro-to-incoming ATK timing must be executed by team/rotation state.',
      'Impermanence Heron is source-explicit immediately before Outro with a switch cancel. Its active/resource/transfer lifecycle remains behind the existing Echo execution boundary.',
      'The selected Moonlit rotation is SOURCE_SEQUENCE_ONLY, so this fallback package is build truth rather than executable DPS.',
    ],
  },
];
