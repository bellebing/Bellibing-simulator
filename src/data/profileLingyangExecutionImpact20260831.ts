import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';

/**
 * Focused execution review for the canonical Lingyang Main DPS profile.
 *
 * This file intentionally records exact unresolved boundaries instead of
 * promoting source sequence order into invented action durations or uptime.
 */
export const PROFILE_LINGYANG_EXECUTION_IMPACT_REVIEWS: readonly ProfileBackwardImpactReview[] = [
  {
    reviewId: 'PROFILE-IMPACT-LINGYANG-2026-08-31-01',
    characterId: 'lingyang',
    presetId: 'lingyang-standard',
    weaponRecommendationProfileId: 'lingyang-standard-weapons',
    checkedAt: '2026-08-31',
    patch: '3.6',
    reviewedWeaponEffectIds: ['MGS-ATK', 'MGS-LIB', 'MGS-DEF', 'MGS-MAX-STACK'],
    reviewedSonataSetIds: ['sonata-9'],
    reviewedEchoIds: ['echo-60000485'],
    pendingExecutionIds: [
      'weapon:moongazers-sigil:MGS-LIB:trigger-uptime-adapter',
      'weapon:moongazers-sigil:MGS-DEF:shield-stack-state-adapter',
      'weapon:moongazers-sigil:MGS-MAX-STACK:cross-effect-stack-override-adapter',
      'sonata:sonata-9:S09_5PC_FIELD_ATK:on-field-stack-state-adapter',
      'echo:echo-60000485:mech-abomination-cast-timeline-adapter',
      'character:lingyang:striding-lion-resource-state-adapter',
      'character:lingyang:diligent-practice-three-second-window-adapter',
      'character:lingyang:burst-combo-action-mapping-adapter',
      'team:lingyang-standard:zhezhi-incoming-state-adapter',
      'team:lingyang-standard:shorekeeper-incoming-state-adapter',
      'stat-target:lingyang-standard-stats:exact-er-gate-adapter',
      'rotation:lingyang-standard-rotation:engine-model',
    ],
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'The canonical profile remains Lingyang S0 / Moongazer’s Sigil R1 / Lingering Tunes / Mech Abomination / Zhezhi + The Shorekeeper / lingyang-standard-rotation. This review does not retranscribe or mutate the generated canonical profile rows.',
      'Moongazer’s Sigil permanent 12% ATK is executable source truth and MGS-LIB already has the reusable explicit cast-window primitive. MGS-DEF now also has a source-safe partial primitive: explicit owner Shield events from caller-supplied monotonic known state grant independent seven-second stacks at most once every 0.5s until five active stacks; a valid event at cap fails closed because refresh/replacement/ignore semantics are not source-established. Intro creates only a separate three-second forced-max read window and never fabricates five organic seven-second expiries. The canonical Shield/max-stack pending IDs remain open because the source rotation has no Shield timeline and the forced-max interaction with underlying organic expiries remains unresolved.',
      'Lingering Tunes identity is already mapped from the reviewed source label Endless Resonance to canonical sonata-9. Runtime truth is narrower: 5% ATK per 1.5s while on field, cap 4, plus 60% Outro Skill DMG. A source-safe continuous-on-field cadence primitive now executes that cadence only from caller-supplied known stack/phase state and treats leaving field as an unresolved lifecycle boundary. The current source still does not prove post-field lifetime, reset/persistence, refresh, or cadence carry semantics, so the canonical pending ID remains open and no fixed full-stack uptime is authorized.',
      'Mech Abomination Rank-5 attack math is now exact: 48.64% ATK front strike plus 320% and 160% ATK Mech Waste components; Waste damage is explicitly Outro Skill DMG. The cast grants 12% ATK for 15s and has a 20s cooldown. Exact summon/hit/explosion timing is not source-locked, so the profile still needs a cast/damage timeline even though reusable attack/effect facts exist.',
      'The Burst Combo source uses Glorious Plunge, repeated Feral Gyrate / Mountain Roamer actions, Stormy Kicks and Tail Strike, all of which touch Striding Lion/Lion’s Spirit semantics. Canonical raw facts prove base 5s resource consumption and up-to-10s extension under Lion’s Vigor, but not encounter animation times, airborne time, cancel frames, per-action resource consumption timing, or exact state overlap.',
      'Feral Gyrate has distinct canonical Stage 1 and Stage 2 damage facts while the source rotation names generic Feral Gyrate. Stormy Kicks and Tail Strike are source-classified as Basic Attack DMG facts despite the source rotation text labeling the final entries as Skill actions. Exact action-ID mapping must be resolved rather than guessed.',
      'Diligent Practice requires a Basic Attack followed by Mountain Roamer within 3s during Striding Lion. The source sequence has that order but no timestamps, so the additional 150%-of-Mountain-Roamer Skill DMG branch cannot be granted automatically.',
      'Zhezhi and The Shorekeeper remain external state owners. Canonical facts prove Zhezhi incoming 15 Resonance Energy plus 20% Glacio / 25% Resonance Skill amplification for 14s, and Shorekeeper team amplification/Stellarealm state, but the Lingyang source does not provide the teammate switch/timeline events needed to prove their overlap with this Burst Combo.',
      'The reviewed 120–125%+ Energy Regen text is team-contextual estimation only. No exact numeric mandatory ER gate is source-established for this executable sequence, so no boundary value is promoted.',
      'lingyang-standard-rotation remains SOURCE_SEQUENCE_ONLY. Without exact action timing/state closure it cannot become ENGINE_MODELED; buildContextFromVerifiedPreset therefore remains correctly blocked, no freeze approval is authorized, and DPS_READY/product support remain NO.',
    ],
  },
] as const;