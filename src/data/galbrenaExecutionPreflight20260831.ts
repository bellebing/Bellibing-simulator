export type GalbrenaExecutionBlockerKind =
  | 'SOURCE_OMISSION'
  | 'SOURCE_BLOCKED'
  | 'SEMANTIC_REVIEW_BLOCKED'
  | 'TIMELINE_BLOCKED'
  | 'INHERITED_PROJECT_BLOCKER'
  | 'INPUT_DATA_BLOCKED'
  | 'POLICY_PENDING';

export interface GalbrenaExecutionBlocker {
  readonly blockerId: string;
  readonly kind: GalbrenaExecutionBlockerKind;
  readonly dependencyIds: readonly string[];
  readonly reason: string;
}

/**
 * Exact execution dependency set for the canonical Galbrena profile.
 *
 * This is deliberately a fail-closed work queue. A dependency appearing here
 * does not authorize an adapter, ENGINE_MODELED rotation, DPS denominator,
 * freeze, or DPS_READY state. It records what must close first.
 */
export const GALBRENA_EXECUTION_DEPENDENCY_IDS_20260831 = [
  'weapon:lux-and-umbra:LU-HEAVY-AMP:damage-event-timed-self-window-adapter',
  'weapon:lux-and-umbra:LU-ECHO-AMP:damage-event-timed-self-window-adapter',
  'weapon:lux-and-umbra:LU-DEF:window-intersection-def-ignore-adapter',
  'sonata:sonata-22:S22_3PC_HEAVY_CR:damage-event-timed-self-window-adapter',
  'sonata:sonata-22:S22_3PC_ECHO_CR:damage-event-timed-self-window-adapter',
  'sonata:sonata-22:S22_3PC_FUSION:window-intersection-damage-bonus-adapter',
  'echo:echo-60001205:active-skill-damage-adapter',
  'character:galbrena:sinflame-purging-flame-transition-adapter',
  'character:galbrena:afterflame-demon-hypostasis-adapter',
  'character:galbrena:liberation-demon-enhancement-adapter',
  'character:galbrena:fated-end-damage-amplification-adapter',
  'team:galbrena-qiuyuan-shorekeeper:qiuyuan-echo-buff-uptime-adapter',
  'team:galbrena-qiuyuan-shorekeeper:shorekeeper-stellarealm-crit-uptime-adapter',
  'team:galbrena-qiuyuan-shorekeeper:shorekeeper-outro-amplification-uptime-adapter',
  'echo:echo-60000525:impermanence-heron-active-transfer-adapter',
  'combat:galbrena-standard:versioned-context-adapter',
  'rotation:galbrena-standard-source-sequence:engine-model',
] as const;

export const GALBRENA_EXECUTION_PREFLIGHT_20260831 = {
  preflightId: 'GALBRENA-EXECUTION-PREFLIGHT-2026-08-31-01',
  characterId: 'galbrena',
  checkedAt: '2026-08-31',
  patch: '3.6',
  baseMain: '2af8221b13448c9a0cc6749e3d6234b8e6c1efd8',
  disposition: 'BLOCKED_AT_SOURCE_BOUNDARY',
  canonicalPackage: {
    presetId: 'galbrena-standard',
    weaponRecommendationProfileId: 'galbrena-standard-weapons',
    weaponId: 'lux-and-umbra',
    weaponRank: 1,
    echoLoadoutProfileId: 'galbrena-standard-echoes',
    sonataSetId: 'sonata-22',
    mainEchoId: 'echo-60001205',
    statTargetProfileId: 'galbrena-standard-build-stats',
    teamProfileId: 'galbrena-qiuyuan-shorekeeper',
    rotationProfileId: 'galbrena-standard-source-sequence',
    rotationExecutionStatus: 'SOURCE_SEQUENCE_ONLY',
    sourceSequenceActionCount: 16,
  },
  exactDependencyIds: GALBRENA_EXECUTION_DEPENDENCY_IDS_20260831,
  sourceSafeClosures: [
    'Released raw Galbrena Lv90 HP/ATK/DEF/maxEnergy values are present and intrinsic CRIT DMG/ATK nodes are VERIFIED.',
    'Galbrena Character Mechanics source review is VERIFIED; action coefficients and source classifications remain in the Character Mechanics layer.',
    'Lux & Umbra R1 permanent ATK and the two reciprocal 6s Heavy/Echo amplification windows plus overlap DEF-ignore are represented as weapon effects.',
    "Flamewing's Shadow reciprocal 6s Heavy/Echo CRIT windows plus overlap Fusion bonus are represented as Sonata effects.",
    'Corrosaurus pinned Rank-5 source proves a 273.60% ATK Fusion active hit, 20s cooldown, +12% Fusion main-slot bonus, and +20% Echo Skill main-slot bonus.',
    'Qiuyuan raw facts keep his team-facing Echo Skill bonus and incoming-resonator Outro amplification on Qiuyuan rather than baking them into Galbrena.',
    'The Shorekeeper raw facts keep Stellarealm CRIT conversion and Binary Butterfly team amplification on The Shorekeeper rather than baking them into Galbrena.',
  ],
  blockers: [
    {
      blockerId: 'GALBRENA-BLOCK-ROTATION-ECHO-CAST',
      kind: 'SOURCE_OMISSION',
      dependencyIds: ['echo:echo-60001205:active-skill-damage-adapter', 'rotation:galbrena-standard-source-sequence:engine-model'],
      reason: 'The canonical 16-step sourceSequence contains no Echo cast, while the same current build source instructs Corrosaurus Active Skill before Galbrena’s enhanced Skill. Bellibing cannot invent an insertion point/cancel timeline and call the resulting order canonical.',
    },
    {
      blockerId: 'GALBRENA-BLOCK-ROTATION-TIMING',
      kind: 'TIMELINE_BLOCKED',
      dependencyIds: ['rotation:galbrena-standard-source-sequence:engine-model'],
      reason: 'The current supported source gives action order and qualitative cancel points but no exact per-action timestamps, cancel frames, or total duration for this exact sequence. Therefore no source-backed Personal Rotation DPS denominator exists.',
    },
    {
      blockerId: 'GALBRENA-BLOCK-RESOURCE-TRANSITIONS',
      kind: 'SOURCE_BLOCKED',
      dependencyIds: ['character:galbrena:sinflame-purging-flame-transition-adapter'],
      reason: 'Current VERIFIED raw facts prove the Sinflame/Purging Flame caps and Ascent 1:1 conversion, but do not encode exact Sinflame gain and Purging Flame consumption for every action in the supported sequence. Executable state transitions would require guessed quantities.',
    },
    {
      blockerId: 'GALBRENA-BLOCK-PENDING-CHARACTER-SEMANTICS',
      kind: 'SEMANTIC_REVIEW_BLOCKED',
      dependencyIds: [
        'character:galbrena:afterflame-demon-hypostasis-adapter',
        'character:galbrena:liberation-demon-enhancement-adapter',
        'character:galbrena:fated-end-damage-amplification-adapter',
      ],
      reason: 'Demon Hypostasis/Afterflame scaling, the Liberation Demon enhancement, and Fated End amplification remain PENDING_INTERPRETATION/RAW_ONLY in current Character Mechanics. A DPS engine must not silently choose multiplier semantics.',
    },
    {
      blockerId: 'GALBRENA-BLOCK-WEAPON-SONATA-TIMELINE',
      kind: 'TIMELINE_BLOCKED',
      dependencyIds: [
        'weapon:lux-and-umbra:LU-HEAVY-AMP:damage-event-timed-self-window-adapter',
        'weapon:lux-and-umbra:LU-ECHO-AMP:damage-event-timed-self-window-adapter',
        'weapon:lux-and-umbra:LU-DEF:window-intersection-def-ignore-adapter',
        'sonata:sonata-22:S22_3PC_HEAVY_CR:damage-event-timed-self-window-adapter',
        'sonata:sonata-22:S22_3PC_ECHO_CR:damage-event-timed-self-window-adapter',
        'sonata:sonata-22:S22_3PC_FUSION:window-intersection-damage-bonus-adapter',
      ],
      reason: 'Weapon and Sonata values/triggers are source-backed, but exact uptime and overlap require damage-event timestamps from the blocked executable rotation. Existing cast-window primitives must not be reused for damage-event triggers merely because both have 6s durations.',
    },
    {
      blockerId: 'GALBRENA-BLOCK-TEAM-UPTIME',
      kind: 'TIMELINE_BLOCKED',
      dependencyIds: [
        'team:galbrena-qiuyuan-shorekeeper:qiuyuan-echo-buff-uptime-adapter',
        'team:galbrena-qiuyuan-shorekeeper:shorekeeper-stellarealm-crit-uptime-adapter',
        'team:galbrena-qiuyuan-shorekeeper:shorekeeper-outro-amplification-uptime-adapter',
      ],
      reason: 'Canonical team identities and teammate effect semantics are verified, but the Galbrena source profile contains no executable Qiuyuan/Shorekeeper timeline proving which buffs are active at each Galbrena hit. No team uptime is assumed.',
    },
    {
      blockerId: 'GALBRENA-BLOCK-HERON-CONFLICT',
      kind: 'INHERITED_PROJECT_BLOCKER',
      dependencyIds: ['echo:echo-60000525:impermanence-heron-active-transfer-adapter'],
      reason: 'The current Galbrena calculation reference equips Qiuyuan with Moonlit Clouds / Impermanence Heron. Project BUG-008 already records the unresolved Impermanence Heron source conflict, so exact transfer behavior cannot be frozen here.',
    },
    {
      blockerId: 'GALBRENA-BLOCK-COMBAT-CONTEXT',
      kind: 'SOURCE_BLOCKED',
      dependencyIds: ['combat:galbrena-standard:versioned-context-adapter'],
      reason: 'No explicit versioned enemy level/DEF/resistance/combat context is locked by the canonical Galbrena source package. Personal DPS cannot be frozen against an invented target context.',
    },
    {
      blockerId: 'GALBRENA-BLOCK-EXACT-ER-GATE',
      kind: 'SOURCE_BLOCKED',
      dependencyIds: ['rotation:galbrena-standard-source-sequence:engine-model'],
      reason: 'The verified profile preserves a 110%-125% team-dependent ER recommendation range, but current source does not resolve one exact Qiuyuan + Shorekeeper mandatory ER gate or energy timeline for this supported sequence.',
    },
    {
      blockerId: 'GALBRENA-BLOCK-OWNED-ECHO-CANDIDATE',
      kind: 'INPUT_DATA_BLOCKED',
      dependencyIds: [],
      reason: 'The canonical build profile defines desired Echo slots/main stats, not five concrete owned +25 Echo instances plus a candidate/incumbent roll set. Exact combat-stat materialization and candidate-vs-incumbent upgrade evaluation have no source input to execute.',
    },
    {
      blockerId: 'GALBRENA-POLICY-PARTIAL-UPGRADE-STOP',
      kind: 'POLICY_PENDING',
      dependencyIds: [],
      reason: 'No verified +5/+10/+15/+20 stopping policy is part of the Galbrena source package. Partial-upgrade stopping remains POLICY PENDING and is not inferred from +25 comparison semantics.',
    },
  ] satisfies readonly GalbrenaExecutionBlocker[],
  notes: [
    'No Galbrena-specific calculator or team-baked Character mechanic is authorized by this preflight.',
    'Exact Corrosaurus combat facts may be added to generic Echo catalogs independently of the blocked rotation because their source does not depend on Galbrena timing.',
    'DPS_READY, freeze, Personal Rotation DPS, mandatory gates, and owned-Echo upgrade outputs remain blocked until the listed source/input boundaries close.',
  ],
} as const;
