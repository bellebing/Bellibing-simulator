export type ProfileBackwardImpactResult =
  | 'REVIEWED_NO_BLOCKING_PROFILE_CHANGE'
  | 'REVIEWED_WITH_PENDING_EXECUTION';

export interface ProfileBackwardImpactReview {
  readonly reviewId: string;
  readonly characterId: string;
  readonly presetId: string;
  readonly weaponRecommendationProfileId: string;
  readonly checkedAt: string;
  readonly patch: string;
  readonly reviewedWeaponEffectIds: readonly string[];
  readonly reviewedSonataSetIds: readonly string[];
  readonly reviewedEchoIds: readonly string[];
  readonly pendingExecutionIds: readonly string[];
  readonly result: ProfileBackwardImpactResult;
  readonly notes: readonly string[];
}

/**
 * Backward-impact review attached to profile onboarding, separate from the
 * historical weapon-effect ingestion reviews. Historical reviews keep the
 * profile snapshot that existed when those effects were ingested; new profiles
 * receive a fresh review rather than rewriting that history.
 */
export const PROFILE_BACKWARD_IMPACT_REVIEWS_V36: readonly ProfileBackwardImpactReview[] = [
  {
    reviewId: 'PROFILE-IMPACT-CARTETHYIA-2026-08-29-01',
    characterId: 'cartethyia',
    presetId: 'cartethyia-aero-erosion',
    weaponRecommendationProfileId: 'cartethyia-aero-erosion-weapons',
    checkedAt: '2026-08-29',
    patch: '3.6',
    reviewedWeaponEffectIds: ['DT-HP', 'DT-DEF', 'DT-AERO-AMP'],
    reviewedSonataSetIds: ['sonata-17'],
    reviewedEchoIds: ['echo-60001065'],
    pendingExecutionIds: [
      'weapon:defiers-thorn:DT-DEF:source-timing-adapter',
      'weapon:defiers-thorn:DT-AERO-AMP:target-state-adapter',
      'echo:echo-60001065:fleurdelys-character-restriction-adapter',
      'rotation:cartethyia-basic-ciaccona-rover-aero:engine-model',
    ],
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'Defier’s Thorn permanent HP component is already executable; its DEF timing clause and Aero-Erosion target-state amplification remain explicit pending execution/state semantics.',
      'Windward Pilgrimage source review is complete for the selected set, but source-backed effect facts still require normal rotation/trigger execution where applicable.',
      'Reminiscence: Fleurdelys unconditional main-slot Aero bonus is modeled; its additional Cartethyia/Aero conditional +10% Aero DMG remains behind the existing CHARACTER_RESTRICTION Echo adapter boundary.',
      'The selected Cartethyia rotation is SOURCE_SEQUENCE_ONLY, so this review cannot promote the preset to DPS_READY.',
    ],
  },
  {
    reviewId: 'PROFILE-IMPACT-CIACCONA-2026-08-29-01',
    characterId: 'ciaccona',
    presetId: 'ciaccona-cartethyia-aero',
    weaponRecommendationProfileId: 'ciaccona-cartethyia-aero-weapons',
    checkedAt: '2026-08-29',
    patch: '3.6',
    reviewedWeaponEffectIds: ['WA-ATK', 'WA-AERO', 'WA-AERO-RES'],
    reviewedSonataSetIds: ['sonata-16'],
    reviewedEchoIds: ['echo-60001135'],
    pendingExecutionIds: [
      'weapon:woodland-aria:WA-AERO:trigger-uptime-adapter',
      'weapon:woodland-aria:WA-AERO-RES:target-state-adapter',
      'rotation:ciaccona-basic-cartethyia-rover-aero:engine-model',
    ],
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'Woodland Aria permanent ATK component is executable; Aero-Erosion trigger uptime and target Aero RES reduction remain combat/target-state responsibilities.',
      'Gusts of Welkin source review is complete for the selected Aero Main DPS context; no automatic rotation uptime is inferred from the modeled source facts.',
      'Nightmare: Kelpie main-slot passive is source-safe for this profile. The reviewed Ciaccona rotation explicitly does not use Kelpie Transform Active, so no Kelpie active-skill adapter is required by this supported path.',
      'The selected Ciaccona rotation is SOURCE_SEQUENCE_ONLY, so this review cannot promote the preset to DPS_READY.',
    ],
  },
] as const;
