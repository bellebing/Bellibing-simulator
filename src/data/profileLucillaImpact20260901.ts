import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';

export const LUCILLA_STANDARD_PENDING_EXECUTION_IDS = {
  glommothScaling: 'echo:echo-60001955:glommoth-active-skill-scaling-stat',
  glacioChafeDamage: 'character:lucilla:glacio-chafe-system-damage-adapter',
  chisaPredecessorState: 'character:chisa:thread-of-bane-kumokiri-predecessor-state-adapter',
  chisaHavocBaneTimeline: 'character:chisa:havoc-bane-stack-timeline-adapter',
} as const;

export const PROFILE_LUCILLA_IMPACT_REVIEWS_20260901: readonly ProfileBackwardImpactReview[] = [
  {
    reviewId: 'PROFILE-IMPACT-LUCILLA-STANDARD-2026-09-01-01',
    characterId: 'lucilla',
    presetId: 'lucilla-standard',
    weaponRecommendationProfileId: 'lucilla-standard-weapons',
    checkedAt: '2026-09-01',
    patch: '3.6',
    reviewedWeaponEffectIds: ['FF-ATK', 'FF-GLACIO', 'FF-TEAM-ATK'],
    reviewedSonataSetIds: ['sonata-30'],
    reviewedEchoIds: ['echo-60001955'],
    pendingExecutionIds: [
      LUCILLA_STANDARD_PENDING_EXECUTION_IDS.glommothScaling,
      LUCILLA_STANDARD_PENDING_EXECUTION_IDS.glacioChafeDamage,
      LUCILLA_STANDARD_PENDING_EXECUTION_IDS.chisaPredecessorState,
      LUCILLA_STANDARD_PENDING_EXECUTION_IDS.chisaHavocBaneTimeline,
    ],
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'Canonical lucilla-standard now resolves the independently reviewed 7.34-second fast Hiyuki + Lucilla + Chisa segment through LUCILLA_STANDARD_GLACIO_CHAFE_V1. No rotation:*:engine-model dependency remains for this preset.',
      'Freeze Frame permanent ATK and the first source-proven Glacio Chafe trigger activate its 12-second SELF Glacio DMG and 30-second TEAM ATK windows for all later Lucilla events in the bounded 7.34-second segment. Same-hit trigger ordering is deliberately post-damage.',
      'Wishes of Quiet Snowfall 2P and the self 5P Glacio window are executable. The fixed segment deals no Resonance Liberation-class damage, so Snowfall survives to Outro and its 25% incoming Glacio transfer is source-safe.',
      'Glommoth is explicitly summoned before Liberation in the independently published fast route. Because the whole Lucilla segment is 7.34 seconds, Outro is guaranteed inside Glommoth’s 15-second transfer arm window; the +12% incoming Glacio transfer is executable and combines with Wishes to the source-reported 37%.',
      'Glommoth active damage remains pending because current reviewed sources expose the exact Rank-5 273.60% Glacio coefficient but do not state an unambiguous scaling stat in the source text Bellibing has reviewed. No ATK/DEF/HP assumption is allowed.',
      'Glacio Chafe system damage is not part of the current direct Character-action engine and remains a separate damage-system execution boundary.',
      'The canonical team includes Chisa, but the current Lucilla engine intentionally does not synthesize Thread of Bane/Kumokiri predecessor state or Havoc Bane stack timing as permanent DEF reduction/amplification. Those effects need an explicit team/target-state timeline before they can enter a full DPS claim.',
      'Therefore the engine may expose source-resolved Lucilla direct damage and bounded outgoing support state, but lucilla-standard must not receive DPS_READY freeze or a product DamageEvaluator binding yet.',
    ],
  },
] as const;
