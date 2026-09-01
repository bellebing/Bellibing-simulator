import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';

export const MORNYE_STANDARD_PROFILE_IMPACT_REVIEW_20260831: ProfileBackwardImpactReview = {
  reviewId: 'PROFILE-IMPACT-MORNYE-2026-08-31-01',
  characterId: 'mornye',
  presetId: 'mornye-standard',
  weaponRecommendationProfileId: 'mornye-standard-weapons',
  checkedAt: '2026-08-31',
  patch: '3.6',
  reviewedWeaponEffectIds: ['SC-TEAM-CD'],
  reviewedSonataSetIds: ['sonata-25'],
  reviewedEchoIds: ['echo-60001905'],
  pendingExecutionIds: [
    'weapon:starfield-calibrator:concerto-resource-event:source-conflict',
    'weapon:starfield-calibrator:permanent-def:effect-catalog-gap',
    'echo:echo-60001905:reactor-husk-active-skill-damage-adapter',
    'character:mornye:critical-protocol:scaling-stat-reconciliation',
    'rotation:mornye-standard-rotation:engine-model',
  ],
  result: 'REVIEWED_WITH_PENDING_EXECUTION',
  notes: [
    'SC-TEAM-CD is source-backed for R1 as heal-triggered TEAM CRIT DMG +20% for 4s. The worker adds event semantics but does not infer trigger timestamps from SOURCE_SEQUENCE_ONLY rotation data.',
    'Halo of Starry Radiance is source-backed as a 4s heal-triggered TEAM ATK window scaling by 0.2% per 1% healer Off-Tune Buildup Rate, capped at +25%; the numeric value remains input-driven instead of assuming Mornye is at the cap.',
    'Reactor Husk permanent main-slot Energy Regen +10% is already modeled. Its active 351.00% Fusion hit remains non-executable because current source does not identify the attack scaling stat.',
    'Starfield Calibrator current sources agree on R1 permanent DEF +16% and heal-triggered team CRIT DMG, but disagree on Skill versus Liberation for its 8-Concerto trigger. The current effect catalog also lacks the permanent DEF record, so owned-build assembly must not inject it from combat code.',
    'Current Bellibing raw data marks Critical Protocol ATK-scaling while current skill source classifies it as DEF-scaling. Personal DPS remains fail-closed until raw data is reconciled.',
    'The source formulas now prove 260% Energy Regen as the shared mechanic cap point for Critical Protocol CRIT bonuses and S0 Interfered amplification, but the generated profile is intentionally not hand-edited by this worker.',
    'Lucy and Rebecca remain canonical teammates only. No incoming teammate buff is assumed without a full team action/state timeline.',
    'The selected Mornye rotation remains SOURCE_SEQUENCE_ONLY, so this review cannot promote the preset to ENGINE_MODELED or DPS_READY.',
  ],
};
