import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';

export const JIYAN_STANDARD_PENDING_EXECUTION_IDS = [
  'weapon:verdant-summit:VS-HEAVY:intro-liberation-stack-window-adapter',
  'sonata:sonata-17:S17_5PC_CR:aero-erosion-hit-window-adapter',
  'sonata:sonata-17:S17_5PC_AERO:aero-erosion-hit-window-adapter',
  'echo:echo-60001135:canonical-echo-event-resolution-adapter',
  'team:iuno:from-gloom-to-gleam:jiyan-heavy-amplify-incoming-state-adapter',
  'team:ciaccona:aero-erosion:jiyan-target-state-handoff-adapter',
  'rotation:jiyan-standard-rotation:engine-model',
] as const;

export const JIYAN_STANDARD_EXECUTION_REVIEW_20260831 = {
  reviewId: 'ROTATION-EXECUTION-JIYAN-2026-08-31-01',
  profileId: 'jiyan-standard',
  rotationId: 'jiyan-standard-rotation',
  checkedAt: '2026-08-31',
  disposition: 'SOURCE_SEMANTICS_BLOCKED',
  blockerId: 'BUG-016',
  rotationSeconds: null,
  sourceLabels: [
    'Bellibing current-main canonical Jiyan profile snapshot',
    'Prydwen current Jiyan gameplay / Echo usage',
    'wuwabuild pinned Echoes.json Rank-5 parameters',
  ],
  sourceUrls: [
    'https://github.com/bellebing/Bellibing-simulator/blob/2af8221b13448c9a0cc6749e3d6234b8e6c1efd8/src/data/profileHorizontalGreenLane20260830.ts',
    'https://www.prydwen.gg/wuthering-waves/characters/jiyan',
    'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Echoes.json',
  ],
  sourceEstablished: [
    'The canonical current-main profile is VERIFIED and remains Jiyan / Verdant Summit R1 / Windward Pilgrimage / Nightmare: Kelpie / Jiyan + Iuno + Ciaccona / jiyan-standard-rotation.',
    'The current-main source snapshot publishes a fixed Burst Combo order, including a first Lance P1 interrupted as fast as possible with Skill, but publishes no executable duration or per-action timestamps.',
    'Verdant Summit R1 separates a permanent 12% Attribute DMG component from the triggered Heavy Attack DMG stack component: Intro Skill or Resonance Liberation grants 24% Heavy Attack DMG per stack, max 2, for 14 seconds.',
    'Windward Pilgrimage 5-piece is conditional rather than permanent: hitting a target affected by Aero Erosion grants 10% CRIT Rate and 30% Aero DMG Bonus for 10 seconds.',
    'Pinned Rank-5 Nightmare: Kelpie data resolves the active transform to one 405% ATK Glacio hit, the Outro-switch auto summon to one 405% ATK Aero hit, and the Echo cooldown to 25 seconds.',
    'Jiyan raw mechanics prove Qingloong Mode lasts 10 seconds, Lance P1/P2/P3 are Heavy Attack DMG, Emerald Storm Finale consumes 30 Resolve when the Prelude cast meets the threshold, and the Qingloong Skill branch receives its source-stated damage increase without consuming Resolve.',
    'Iuno raw mechanics prove From Gloom to Gleam grants the incoming Resonator 50% Heavy Attack DMG Amplification for 14 seconds or until that Resonator switches out.',
  ],
  unresolvedSemantics: [
    'The current-main snapshot names Nightmare: Kelpie before the combo, but refreshed current Prydwen now renders the first Burst Combo step only as generic Echo and explicitly says Nightmare: Kelpie Transform Active Skill is not used in Jiyan rotations. The canonical Echo event therefore cannot be reinterpreted as ACTIVE_CAST without resolving this source drift.',
    'No reviewed source publishes exact total rotation duration or per-action timestamps, so rotationSeconds and a DPS denominator remain unproven.',
    'The source says the first Lance P1 is interrupted as fast as possible with Skill but does not state how many of the eight source-defined P1 hits land before that interrupt. Full P1 motion value cannot be assumed.',
    'The fixed personal sequence does not establish starting Resolve. Bellibing therefore cannot choose Emerald Storm Finale versus the non-Finale state by assumption.',
    'Qingloong replacement state, Resolve mutation, Skill-in-Qingloong behavior and the fast Lance interrupt still need one ordered Jiyan character-state execution path before damage can be evaluated exactly.',
    'The canonical team context does not provide an executable Iuno -> Jiyan handoff timestamp, so the 50% Heavy Attack DMG Amplification cannot be baked into Jiyan as permanent uptime.',
    'The canonical team context does not provide an executable Ciaccona -> Jiyan target-state handoff proving Aero Erosion is present at each Windward trigger event.',
    'The source phrase around 117% Energy Regen for Iuno + Ciaccona is approximate guidance, not an exact hard gate. The canonical profile intentionally keeps numeric Energy Regen gating unset.',
    'Verdant Summit stack duration is source-backed, but no unverified refresh/expiry policy beyond the explicit 14-second duration may be invented for repeated acquisition while building an executable timeline.',
  ],
  reviewedPendingExecutionIds: JIYAN_STANDARD_PENDING_EXECUTION_IDS,
  closesPendingExecutionIds: [] as readonly string[],
} as const;

export const PROFILE_JIYAN_STANDARD_IMPACT_REVIEWS: readonly ProfileBackwardImpactReview[] = [
  {
    reviewId: 'PROFILE-IMPACT-JIYAN-STANDARD-2026-08-31-01',
    characterId: 'jiyan',
    presetId: 'jiyan-standard',
    weaponRecommendationProfileId: 'jiyan-standard-weapons',
    checkedAt: '2026-08-31',
    patch: '3.6',
    reviewedWeaponEffectIds: ['VS-ATTR', 'VS-HEAVY'],
    reviewedSonataSetIds: ['sonata-17'],
    reviewedEchoIds: ['echo-60001135'],
    pendingExecutionIds: JIYAN_STANDARD_PENDING_EXECUTION_IDS,
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'Verdant Summit static Attribute DMG is source-safe, while VS-HEAVY remains an event/timed-stack responsibility and no stack refresh policy is invented.',
      'Windward Pilgrimage 2-piece is static source truth. Both 5-piece branches remain conditional on an actual hit against an Aero-Eroded target and therefore need an executable target-state timeline.',
      'Nightmare: Kelpie now has exact Rank-5 attack facts, but attack data does not resolve the current source conflict over whether the canonical pre-combo Echo step is the Transform Active Skill.',
      'Jiyan character-state details that block damage evaluation — starting Resolve, Finale selection, Qingloong state, Skill branch and the fast-interrupted Lance P1 hit count — remain owned by the profile-specific rotation engine model rather than being flattened into static profile stats.',
      'Iuno Heavy Attack Amplification and Ciaccona Aero-Erosion target state are tracked as incoming team dependencies. Neither teammate engine is modified and neither effect is treated as permanent Jiyan state.',
      'No exact rotationSeconds, timestamps, DPS denominator or numeric ER gate is authorized. jiyan-standard remains SOURCE_SEQUENCE_ONLY and cannot receive BuildContext/freeze/DPS_READY approval.',
    ],
  },
] as const;
