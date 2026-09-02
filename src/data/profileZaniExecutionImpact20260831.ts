import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';
import { ZANI_SPECTRO_FRAZZLE_TARGET_STATE_ADAPTER_ID } from '../combat/zaniSpectroFrazzleTargetState.ts';

export const ZANI_EXECUTION_BLOCKER_ID = 'BUG-015' as const;

export const ZANI_PENDING_EXECUTION_IDS = [
  'sonata:sonata-11:S11_5PC_CR:frazzle-infliction-event-adapter',
  'sonata:sonata-11:S11_5PC_SPECTRO:target-stack-timeline-adapter',
  'weapon:blazing-justice:BJ-DEF:trigger-uptime-adapter',
  'weapon:blazing-justice:BJ-FRAZZLE:trigger-uptime-adapter',
  'echo:echo-60000925:active-skill-damage-adapter',
  'echo:echo-60000925:frazzle-target-state-damage-scope-adapter',
  'character:zani:redundant-energy-sequence-adapter',
  'character:zani:blaze-inferno-resource-adapter',
  'team:zani-phoebe-rover-spectro:incoming-spectro-frazzle-timeline-adapter',
  'stat:zani-standard-build-stats:er-team-timeline-review',
  'rotation:zani-standard-source-sequence:engine-model',
] as const;

export const PROFILE_ZANI_EXECUTION_IMPACT_REVIEWS: readonly ProfileBackwardImpactReview[] = [
  {
    reviewId: 'PROFILE-IMPACT-ZANI-2026-08-31-01',
    characterId: 'zani',
    presetId: 'zani-standard',
    weaponRecommendationProfileId: 'zani-standard-weapons',
    checkedAt: '2026-08-31',
    patch: '3.6',
    reviewedWeaponEffectIds: ['BJ-ATK', 'BJ-DEF', 'BJ-FRAZZLE'],
    reviewedSonataSetIds: ['sonata-11'],
    reviewedEchoIds: ['echo-60000925'],
    pendingExecutionIds: ZANI_PENDING_EXECUTION_IDS,
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      'zani-standard resolves to S0 Zani / Blazing Justice R1 / Eternal Radiance / Nightmare: Mourning Aix / Phoebe + Rover (Spectro) / zani-standard-source-sequence.',
      `The source-safe ${ZANI_SPECTRO_FRAZZLE_TARGET_STATE_ADAPTER_ID} primitive now keeps Spectro Frazzle application, atomic conversion, Heliacal Ember TARGET state, per-stack six-second expiry, Eternal Radiance-only stack equivalence and Outro consumption distinct. It does not manufacture teammate applications or Zani SELF Blaze state.`,
      'Blazing Justice permanent BJ-ATK is executable source truth. BJ-DEF and BJ-FRAZZLE stay pending because current reviewed sources conflict on the triggering action; no trigger winner is selected here.',
      'Eternal Radiance 2-piece Spectro is static source truth. Its 5-piece target-stack condition can read the source-safe Heliacal target view once a real timeline supplies an attack event, while the separate “Inflict Spectro Frazzle” trigger is not inferred from Heliacal equivalence.',
      'Nightmare: Mourning Aix has source-backed Rank-5 273.60% active coefficient, +100% damage against a Spectro-Frazzle-inflicted enemy, +12% main-slot Spectro bonus and 20s cooldown, but the reusable active attack stays pending because current reviewed source does not establish the attack scaling stat required by the Echo attack runtime.',
      'Zani Character action multipliers are VERIFIED, but exact canonical SELF-resource execution remains incomplete: Redundant Energy deltas are insufficient to prove the Targeted Action gate, exact Heavy Slash Blaze spend/lifecycle is not fully source-closed, and Inferno timing semantics are not promoted from conflicting/incomplete execution evidence.',
      'Phoebe source truth can produce explicit Spectro Frazzle in Confession (including 5 stacks from Starflash), but the canonical predecessor state/timeline is not executable. Rover (Spectro) current raw Character facts expose no explicit Frazzle producer. This Zani review therefore accepts only explicit incoming-state events and fabricates no teammate rotation.',
      'The canonical 115%+ Energy Regen source target remains profile truth with its quickswap caveat, but it is not promoted to a mandatory product gate without the exact Phoebe/Rover predecessor and energy timeline that determines this canonical execution.',
      'zani-standard-source-sequence remains SOURCE_SEQUENCE_ONLY with no source-backed total duration. No DPS denominator, ENGINE_MODELED rotation, BuildContext bridge, freeze or product support is authorized by this review.',
    ],
  },
] as const;

export const ZANI_EXECUTION_PREFLIGHT_20260831 = {
  preflightId: 'ZANI-EXECUTION-PREFLIGHT-2026-08-31-01',
  checkedAt: '2026-08-31',
  presetId: 'zani-standard',
  blockerId: ZANI_EXECUTION_BLOCKER_ID,
  backwardImpactReviewId: 'PROFILE-IMPACT-ZANI-2026-08-31-01',
  sourceProven: {
    weaponStaticEffectIds: ['BJ-ATK'],
    sonataStaticEffectIds: ['S11_2PC_SPECTRO'],
    echoStaticFacts: [
      'Nightmare: Mourning Aix main-slot Spectro DMG Bonus +12%.',
      'Nightmare: Mourning Aix Rank-5 active coefficient 273.60%, Frazzle-target modifier +100%, cooldown 20s; scaling stat is not source-proven for reusable attack execution.',
    ],
    targetStateFacts: [
      'An explicit Spectro Frazzle application while Zani is in the team is consumed and converted 1:1 to Heliacal Ember after the corresponding Frazzle damage resolution.',
      'Heliacal Ember is capped at 60, each stack lasts 6 seconds, and each converted stack produces a separate +5 Blaze SELF-resource delta contract for Zani.',
      'Targeted Action and Forcible Riposte can explicitly apply one Heliacal Ember and their +10 Blaze grant remains a separate Zani SELF-resource contract.',
      'Heliacal Ember counts as Spectro Frazzle only for Eternal Radiance stack-count conditions.',
      'Beacon For the Future consumes live Heliacal Ember; each consumed stack carries the source-declared 10% damage modifier for that Outro resolution.',
    ],
    characterActionFacts: [
      'Standard Defense Protocol, Targeted Action, Rekindle, Heavy Slash Daybreak/Dawning/Nightfall, The Last Stand and Outro action identities/multipliers are current VERIFIED Character Mechanics.',
      'Heavy Slash Daybreak/Dawning/Nightfall are simultaneously Heavy Attack DMG and Spectro Frazzle DMG in current Character facts.',
    ],
    teammateIncomingFacts: [
      'Phoebe Confession Starflash source truth applies 5 Spectro Frazzle stacks when that teammate state/action actually occurs.',
      'Rover (Spectro) current Character raw facts contain no explicit Spectro Frazzle producer.',
    ],
  },
  engineModeled: {
    adapterIds: [ZANI_SPECTRO_FRAZZLE_TARGET_STATE_ADAPTER_ID],
    canonicalRotationEngineModeled: false,
    rotationSeconds: null,
    notes: [
      'The target-state primitive executes only explicit caller-supplied events and exact stack lifetime/consume semantics. It is not a teammate rotation, SELF-resource engine or DPS rotation.',
      'Eternal Radiance can read effective Frazzle stacks from live Heliacal Ember only for its stack-count condition; the primitive returns provesInflictSpectroFrazzleTrigger=false by construction.',
    ],
  },
  energyRegenReview: {
    sourceTargetMinimumTotal: 1.15,
    sourceNotesQuickswapCanReduceRequirement: true,
    mandatoryCanonicalProductGateProven: false,
    reason: 'The exact canonical Phoebe/Rover predecessor, energy delivery and quickswap timeline is not executable, so the source target cannot be converted into a mandatory owned-build gate without additional evidence.',
  },
  buildContextBoundary: {
    profileBuildContextAdapterId: 'profile-build-context-v1',
    canResolveCanonicalPresetNow: false,
    reason: 'buildContextFromVerifiedPreset rejects SOURCE_SEQUENCE_ONLY rotations and zani-standard has no engineModelId.',
  },
  freezeBoundary: {
    dpsReady: false,
    freezeApproved: false,
    productSupported: false,
  },
  pendingExecutionIds: ZANI_PENDING_EXECUTION_IDS,
  blocked: [
    'Eternal Radiance S11_5PC_CR needs source-proven mapping from an actual event to “Inflict Spectro Frazzle”; Heliacal stack equivalence alone is insufficient.',
    'Eternal Radiance S11_5PC_SPECTRO needs an executable attack/timeline event to prove the 10-stack condition at that moment.',
    'Blazing Justice BJ-DEF and BJ-FRAZZLE share an unresolved Basic Attack versus Resonance Liberation trigger conflict in current reviewed source.',
    'Nightmare: Mourning Aix active damage cannot enter reusable Echo attack execution until its scaling stat is source-proven; its Frazzle-target modifier therefore remains outside executable active damage.',
    'Exact Zani Redundant Energy and Blaze/Inferno lifecycle is not sufficient to prove every gate/spend in the canonical slash sequence without inference.',
    'Canonical Phoebe/Rover incoming Spectro Frazzle predecessor state/timeline is missing; no starting/max Frazzle assumption is allowed.',
    'Exact zani-standard-source-sequence total duration is missing, so no DPS denominator or ENGINE_MODELED rotation exists.',
    'The 115%+ Energy Regen source target has a quickswap caveat and lacks exact canonical team energy accounting, so mandatory product-gate use is blocked.',
  ],
} as const;
