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
      'Lion’s Vigor now has an explicit self-window primitive tied only to a caller-supplied Lingyang Resonance Liberation cast event for Strive: Lion’s Vigor. It materializes the source-backed 14-second SELF window with +50% Glacio DMG Bonus and a 0.5 Lion’s Spirit consumption multiplier during Striding Lion, following the existing Bellibing start-inclusive/expiry-exclusive timed-window convention. It does not infer the Ultimate timestamp from sequence order and does not by itself prove that a later Striding Lion segment is fully covered.',
      'The Burst Combo source uses Glorious Plunge, repeated Feral Gyrate / Mountain Roamer actions, Stormy Kicks and Tail Strike, all of which touch Striding Lion/Lion’s Spirit semantics. A source-safe known-segment resource primitive now derives only the source-implied constant continuous-consumption rates from a full 100 Lion’s Spirit entry: 20 Spirit/s for a caller-proven no-Vigor segment and 10 Spirit/s for a caller-proven all-Vigor segment, with Stormy Kicks eligibility exposed only when remaining Spirit is strictly below 10. Any Vigor state change/unknown interval or intervening Spirit gain fails closed. The canonical resource-state pending ID remains open because the profile still lacks exact action timestamps, Vigor transition timing, animation/airborne/cancel time, resource-event interaction and action mapping.',
      'A partial Burst Combo action mapper now locks the canonical 15-step sequence verbatim and resolves the Echo event plus Intro, Ultimate, Glorious Plunge, all four Mountain Roamer steps, Stormy Kicks, Tail Strike and Outro to unique current canonical identities. The four generic Basic: Feral Gyrate steps deliberately remain two-way ambiguous between canonical Stage 1 and Stage 2 because current source does not identify their stage. Stormy Kicks and Tail Strike keep canonical Basic Attack DMG classification despite the source sequence prefix Skill:. The mapping pending ID remains open and no timestamps/hit completion are inferred.',
      'Diligent Practice now has a source-safe known-event primitive. With caller-proven Striding Lion state and explicit owner timestamps, a Basic Attack followed by Mountain Roamer strictly before 3s returns the source-backed additional damage ratio of 150% of Mountain Roamer DMG and preserves its Resonance Skill DMG classification; a delta strictly above 3s misses. The exact 3.000s boundary fails closed because current wording does not independently establish inclusivity. The source sequence still has no timestamps and generic Feral Gyrate does not identify Stage 1 versus Stage 2, so the canonical Diligent Practice pending ID remains open and no Burst Combo pair is granted automatically.',
      'Zhezhi and The Shorekeeper remain external state owners. Canonical facts prove Zhezhi incoming 15 Resonance Energy plus 20% Glacio / 25% Resonance Skill amplification for 14s, and Shorekeeper team amplification/Stellarealm state, but the Lingyang source does not provide the teammate switch/timeline events needed to prove their overlap with this Burst Combo.',
      'The reviewed 120–125%+ Energy Regen text is team-contextual estimation only. No exact numeric mandatory ER gate is source-established for this executable sequence, so no boundary value is promoted.',
      'lingyang-standard-rotation remains SOURCE_SEQUENCE_ONLY. Without exact action timing/state closure it cannot become ENGINE_MODELED; buildContextFromVerifiedPreset therefore remains correctly blocked, no freeze approval is authorized, and DPS_READY/product support remain NO.',
    ],
  },
] as const;
