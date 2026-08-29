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
    reviewId: 'PROFILE-IMPACT-AUGUSTA-2026-08-29-01',
    characterId: 'augusta',
    presetId: 'augusta-standard',
    weaponRecommendationProfileId: 'augusta-standard-weapons',
    checkedAt: '2026-08-29',
    patch: '3.6',
    reviewedWeaponEffectIds: ['TFD-ATK', 'TFD-HEAVY', 'TFD-DEF'],
    reviewedSonataSetIds: ['sonata-20', 'sonata-3'],
    reviewedEchoIds: ['echo-60001215'],
    pendingExecutionIds: [],
    result: 'REVIEWED_NO_BLOCKING_PROFILE_CHANGE',
    notes: [
      'The current composable profile resolves to S0 Augusta / Thunderflare Dominion R1 / Crown of Valor + 2P Void Thunder / The False Sovereign / Iuno + Shorekeeper / AUGUSTA_STD_V1.',
      'AUGUSTA_STD_V1 already executes the locked current context: Thunderflare permanent ATK, Intro/Skill Heavy window, five verified shield-driven DEF-ignore stacks, Crown of Valor stack windows, Void Thunder 2P Electro bonus, False Sovereign passive plus explicit Echo hit events, and the locked Iuno/Shorekeeper team amplification/CRIT context.',
      'The generic buildContextFromVerifiedPreset adapter now resolves the canonical profile IDs into the exact executable BuildContext; SOURCE_SEQUENCE_ONLY profiles are rejected by the same bridge.',
      'Existing action-event parity fixtures continue to own the exact supported personal-DPS semantics. This review does not generalize the locked team/stack assumptions to other profiles.',
    ],
  },
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
  {
    reviewId: 'PROFILE-IMPACT-ROVER-AERO-2026-08-29-01',
    characterId: 'rover-aero',
    presetId: 'rover-aero-cartethyia-ciaccona',
    weaponRecommendationProfileId: 'rover-aero-cartethyia-ciaccona-weapons',
    checkedAt: '2026-08-29',
    patch: '3.6',
    reviewedWeaponEffectIds: ['BPP-SKILL', 'BPP-TEAM-AERO'],
    reviewedSonataSetIds: ['sonata-17'],
    reviewedEchoIds: ['echo-60001065'],
    pendingExecutionIds: [
      'weapon:bloodpacts-pledge:BPP-SKILL:healing-uptime-adapter',
      'weapon:bloodpacts-pledge:BPP-TEAM-AERO:unbound-flow-team-amplify-adapter',
      'echo:echo-60001065:fleurdelys-character-restriction-adapter',
      'echo:echo-60001065:active-skill-damage-adapter',
      'rotation:rover-aero-cartethyia-ciaccona-standard:engine-model',
    ],
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'Bloodpact’s Pledge source effects are fully audited, but healing-trigger overlap and the Rover-specific Unbound Flow team-amplification event remain rotation/event-state responsibilities.',
      'Windward Pilgrimage is source-reviewed for the selected high-investment Cartethyia + Ciaccona context; trigger/state uptime is not inferred from profile selection.',
      'Reminiscence: Fleurdelys unconditional main-slot Aero bonus is modeled. Its additional Aero-resonator branch retains the existing CHARACTER_RESTRICTION adapter boundary, and the source rotation’s explicit Echo cast cannot contribute damage until its active-skill execution is independently modeled.',
      'The selected Rover (Aero) rotation is SOURCE_SEQUENCE_ONLY, so this review cannot promote the preset to DPS_READY.',
    ],
  },
  {
    reviewId: 'PROFILE-IMPACT-IUNO-2026-08-29-01',
    characterId: 'iuno',
    presetId: 'iuno-augusta-hybrid',
    weaponRecommendationProfileId: 'iuno-augusta-hybrid-weapons',
    checkedAt: '2026-08-29',
    patch: '3.6',
    reviewedWeaponEffectIds: ['MGS-ATK', 'MGS-LIB', 'MGS-DEF', 'MGS-MAX-STACK'],
    reviewedSonataSetIds: ['sonata-8'],
    reviewedEchoIds: ['echo-60000525'],
    pendingExecutionIds: [
      'weapon:moongazers-sigil:MGS-LIB:trigger-uptime-adapter',
      'weapon:moongazers-sigil:MGS-DEF:shield-stack-state-adapter',
      'weapon:moongazers-sigil:MGS-MAX-STACK:cross-effect-stack-override-adapter',
      'echo:echo-60000525:impermanence-heron-active-transfer-adapter',
      'rotation:iuno-augusta-sub-dps-standard:engine-model',
    ],
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'Moongazer’s Sigil permanent ATK component is executable source truth; Liberation-window timing, shield-driven DEF-ignore stacks and the Intro-triggered max-stack override remain explicit combat-state responsibilities.',
      'Moonlit Clouds is reviewed specifically for Sub DPS Iuno. Its transfer timing must be proven by the eventual engine rotation rather than treated as permanent uptime.',
      'Impermanence Heron is explicitly cast and canceled into Ultimate in the selected source guidance; its active damage/resource/transfer lifecycle is not silently inferred from the Echo being equipped.',
      'The selected Iuno rotation is SOURCE_SEQUENCE_ONLY, so this review cannot promote the preset to DPS_READY.',
    ],
  },
  {
    reviewId: 'PROFILE-IMPACT-SHOREKEEPER-2026-08-29-01',
    characterId: 'the-shorekeeper',
    presetId: 'shorekeeper-augusta-support',
    weaponRecommendationProfileId: 'shorekeeper-augusta-iuno-weapons',
    checkedAt: '2026-08-29',
    patch: '3.6',
    reviewedWeaponEffectIds: ['SSY-HP', 'SSY-CONCERTO', 'SSY-TEAM-ATK'],
    reviewedSonataSetIds: ['sonata-7'],
    reviewedEchoIds: ['echo-60000605'],
    pendingExecutionIds: [
      'weapon:stellar-symphony:SSY-CONCERTO:resource-event-adapter',
      'weapon:stellar-symphony:SSY-TEAM-ATK:healing-skill-team-uptime-adapter',
      'echo:echo-60000605:fallacy-active-skill-damage-adapter',
      'rotation:shorekeeper-augusta-support-standard:engine-model',
    ],
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'Stellar Symphony permanent HP component is executable source truth; Liberation Concerto restoration and healing-qualified Skill team ATK remain event/rotation-state responsibilities.',
      'Rejuvenating Glow is source-reviewed for the selected support shell. Healing-trigger uptime must come from actual character/rotation execution.',
      'Fallacy of No Return team ATK and wielder ER cast effects are already modeled as conditional Echo effects and the selected source sequence explicitly casts Fallacy. Its active damage is still outside the current exact Echo attack catalog and is retained as pending rather than guessed.',
      'The selected Shorekeeper rotation is SOURCE_SEQUENCE_ONLY, so this review cannot promote the preset to DPS_READY.',
    ],
  },
] as const;
