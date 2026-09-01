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
      'Mech Abomination Rank-5 attack math is exact: 48.64% ATK front strike plus 320% and 160% ATK Mech Waste components; Waste damage is explicitly Outro Skill DMG. A source-safe explicit-cast primitive now turns only a caller-supplied Mech cast timestamp into the source-backed +12% ATK [cast, cast+15s) wielder window and next-cast readiness at cast+20s. The exact attack IDs remain deliberately unscheduled because current source does not provide cast-to-front-strike/Waste-hit/explosion delays. The canonical Mech timeline pending ID therefore remains open.',
      'Lion’s Vigor now has an explicit self-window primitive tied only to a caller-supplied Lingyang Resonance Liberation cast event for Strive: Lion’s Vigor. It materializes the source-backed 14-second SELF window with +50% Glacio DMG Bonus and a 0.5 Lion’s Spirit consumption multiplier during Striding Lion, following the existing Bellibing start-inclusive/expiry-exclusive timed-window convention. It does not infer the Ultimate timestamp from sequence order and does not by itself prove that a later Striding Lion segment is fully covered.',
      'The Burst Combo source uses Glorious Plunge, repeated Feral Gyrate / Mountain Roamer actions, Stormy Kicks and Tail Strike, all of which touch Striding Lion/Lion’s Spirit semantics. A source-safe known-segment resource primitive now derives only the source-implied constant continuous-consumption rates from a full 100 Lion’s Spirit entry: 20 Spirit/s for a caller-proven no-Vigor segment and 10 Spirit/s for a caller-proven all-Vigor segment, with Stormy Kicks eligibility exposed only when remaining Spirit is strictly below 10. Any Vigor state change/unknown interval or intervening Spirit gain fails closed. The canonical resource-state pending ID remains open because the profile still lacks exact action timestamps, Vigor transition timing, animation/airborne/cancel time, resource-event interaction and action mapping.',
      'The canonical generated sequence remains the committed 15-step lingyang-standard-rotation with four generic Basic: Feral Gyrate entries and Skill-prefixed Stormy Kicks/Tail Strike. A 2026-09-01 current Prydwen re-check instead exposes a 16-step Burst Combo with Feral Gyrate P1/P2/P1/P2/P1, Basic Attack: Stormy Kicks and Mid-Air Attack: Tail Strike. The mismatch-aware mapper preserves both layers: canonical runtime resolution stays fail-closed on the four generic Feral entries, while a separate current-source resolver records all 16 exact action identities as source-resolution evidence. Bellibing does not silently substitute the live sequence under the generated profile, and the historical cause of the mismatch remains unresolved because no immutable 2026-08-30 source-rotation snapshot is retained. The mapping pending ID therefore remains open.',
      'Diligent Practice now has a source-safe known-event primitive. With caller-proven Striding Lion state and explicit owner timestamps, a Basic Attack followed by Mountain Roamer strictly before 3s returns the source-backed additional damage ratio of 150% of Mountain Roamer DMG and preserves its Resonance Skill DMG classification; a delta strictly above 3s misses. The exact 3.000s boundary fails closed because current wording does not independently establish inclusivity. The canonical generated sequence still has no timestamps and does not identify Feral Gyrate Stage 1 versus Stage 2, while the separate current-source sequence does identify those stages but cannot be promoted underneath canonical runtime until the source mismatch is resolved and canonical data is deterministically regenerated. The canonical Diligent Practice pending ID remains open and no Burst Combo pair is granted automatically.',
      'Zhezhi and The Shorekeeper remain external state owners, but source-safe explicit-event primitives now exist for their proven Lingyang-facing effects. An explicit Zhezhi Outro switch whose actual incoming Resonator is Lingyang exposes one 15 Resonance Energy restore plus a 14-second 20% Glacio / 25% Resonance Skill amplification window; the timed amplification additionally requires caller proof that Lingyang has not switched out because Carve and Draw ends early on switch-out. An explicit Shorekeeper Binary Butterfly Outro event exposes the source 30-second 15% team DMG amplification only when caller evidence says Lingyang satisfies the nearby-party-member condition. The canonical Lingyang source sequence supplies neither teammate event timestamp nor the required switch/proximity lifecycle evidence, so both team pending IDs remain open and no overlap is inferred.',
      'The reviewed 120–125%+ Energy Regen text is team-contextual estimation only. No exact numeric mandatory ER gate is source-established for this executable sequence, so no boundary value is promoted.',
      'lingyang-standard-rotation remains SOURCE_SEQUENCE_ONLY. Without exact action timing/state closure it cannot become ENGINE_MODELED; buildContextFromVerifiedPreset therefore remains correctly blocked, no freeze approval is authorized, and DPS_READY/product support remain NO.',
    ],
  },
] as const;
