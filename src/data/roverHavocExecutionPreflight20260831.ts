export const ROVER_HAVOC_EXECUTION_SOURCE_BLOCKER_ID = 'ROVER-HAVOC-EXEC-SOURCE-2026-08-31';

export const ROVER_HAVOC_PENDING_EXECUTION_IDS = Object.freeze([
  'weapon:red-spring:RS-BASIC:basic-hit-stack-timing-adapter',
  'weapon:red-spring:RS-CONCERTO-BASIC:concerto-window-lifecycle-adapter',
  'sonata:sonata-6:S06_5PC:source-conflict-stack-adapter',
  'echo:echo-60000535:dreamless-active-skill-damage-adapter',
  'character:rover-havoc:umbra-dark-surge-state-adapter',
  'team:rover-havoc:roccia-shorekeeper-uptime-adapter',
  'rotation:rover-havoc-standard-rotation:engine-model',
] as const);

/**
 * Source-locked execution preflight for the canonical Rover (Havoc) S0 profile.
 *
 * This record is intentionally fail-closed. It separates source-proven build and
 * action facts from the timing/state facts that are still missing for an
 * executable denominator, buff ledger and ER gate.
 */
export const ROVER_HAVOC_EXECUTION_PREFLIGHT_20260831 = Object.freeze({
  characterId: 'rover-havoc',
  presetId: 'rover-havoc-standard',
  sequence: 0,
  checkedAt: '2026-08-31',
  patch: '3.6',
  disposition: 'SOURCE_SEMANTICS_BLOCKED',
  dpsReadyCandidate: false,
  ownedBuildExecutable: false,
  alphaBindingAllowed: false,
  partialRollAssistPolicy: 'POLICY PENDING',
  rotationExecutionStatus: 'SOURCE_SEQUENCE_ONLY',
  exactRotationDurationSeconds: null,
  exactEnergyRegenGate: null,
  sourceBackedEnergyRegenContext: 1.4,
  sourceSequence: Object.freeze([
    'Intro',
    'Skill',
    'Heavy ATK: Devastation',
    'Umbra: Basic P1',
    'Umbra: Basic P2',
    'Umbra: Basic P3',
    'Umbra: Basic P4',
    'Umbra: Basic P5',
    'Umbra: Basic P1',
    'Umbra: Basic P2',
    'Umbra: Basic P3',
    'Umbra: Basic P4',
    'Umbra: Basic P5',
    'Skill: Umbra: Lifetaker (optionally swap-cancel)',
    'Ultimate',
    'Echo: Dreamless (swap-cancel)',
    'Outro',
  ]),
  sourceEstablished: Object.freeze([
    'The canonical profile is Rover (Havoc) S0 with Red Spring R1, Havoc Eclipse, Dreamless, Roccia and The Shorekeeper. Rover (Aero) BUG-012 is unrelated and is not inherited by this profile.',
    'Prydwen Medium Burst Combo matches the canonical source sequence and explicitly expects a completed warm-up before Rover enters through Intro and the listed Skill into Umbra/Dark Surge play.',
    'Rover raw mechanics source-proves the 100-Umbra Dark Surge entry condition, Devastation entry action, Umbra Basic replacements, Lifetaker, and Dark-Surge energy passive, but not a numeric Dark Surge duration or a complete per-action Umbra ledger.',
    'Red Spring R1 source-proves permanent 12% ATK, Basic-hit stacks of 10% Basic DMG for 14 seconds up to 3 with a once-per-second trigger, and the 40% Concerto-consumption Basic-DMG window for 10 seconds that ends when the wielder switches off field.',
    'Havoc Eclipse 2-piece 10% Havoc DMG is source-modeled. The canonical project source review keeps the 5-piece branch in SOURCE_CONFLICT because rendered English says 7.5% x4 while structured params say 6% x5.',
    'Dreamless Rank-5 attack magnitude is source-resolved as five 54.08% ATK Havoc hits plus one 270.40% ATK Havoc hit; current source also states +50% Echo Skill DMG when Dreamless is used within 5 seconds after Rover (Havoc) casts Deadening Abyss.',
    'Roccia Outro Applause, Please! source-proves 20% Havoc DMG Amplification plus 25% Basic Attack DMG Amplification for the next incoming Resonator for 14 seconds, ending early on switch-off.',
    'The Shorekeeper source-proves 30-second Stellarealm, Rover-specific 10% Energy Regen while Rover is in the party and Stellarealm, and 15% all-DMG Amplification for other party Resonators for 30 seconds from Binary Butterfly.',
    'Prydwen publishes Energy Regen 140%+ build context and explicitly includes Roccia + The Shorekeeper among the teams to which that recommendation applies.',
  ]),
  exactBlockers: Object.freeze([
    'No source-reviewed total duration or per-action timestamps exist for the Medium Burst Combo, so Bellibing cannot create a Personal Rotation DPS denominator or convert optional swap-cancel text into frame timing.',
    'The canonical source sequence omits the warm-up/support-cycle actions that establish the starting Umbra and Havoc Eclipse state; current Rover raw facts also do not expose enough numeric Umbra gain/depletion data to reconstruct the exact Dark Surge state transition timeline.',
    'Red Spring RS-BASIC requires exact Basic-hit spacing for its once-per-second stack trigger, while RS-CONCERTO-BASIC requires the actual Concerto-consumption/switch lifecycle. SOURCE_SEQUENCE_ONLY text is insufficient to assign either window to damage events.',
    'Havoc Eclipse 5-piece remains a canonical project SOURCE_CONFLICT (7.5% x4 rendered English versus 6% x5 structured params), and the omitted warm-up leaves its starting stack state unmaterialized.',
    'Dreamless exact Rank-5 damage is now cataloged, but the profile still lacks an executable cast/timeline event and a modeled post-Liberation conditional branch; the source-proven swap cancel does not provide a duration.',
    'The Rover-only source sequence does not execute Roccia or The Shorekeeper actions, so their exact start timestamps and supported overlap with Rover damage cannot be proved from the canonical rotation.',
    'The 140%+ ER value is source-backed team/build context, not an exact energy-ledger gate for this represented rotation. Without the omitted warm-up/support actions and exact energy timeline, it must not be materialized as a hard gate.',
  ]),
  pendingExecutionIds: ROVER_HAVOC_PENDING_EXECUTION_IDS,
  sourceUrls: Object.freeze([
    'https://www.prydwen.gg/wuthering-waves/characters/rover-havoc',
    'https://wuthering.gg/echos/dreamless',
    'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json',
    'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Echoes.json',
  ]),
});

/**
 * Semantic dispositions for Rover-Havoc shared-dependency edges. The rotation
 * engine-model edge is intentionally absent: profileAdapterDependencyMatrix
 * owns that edge as PROFILE_SPECIFIC_EXECUTION.
 */
export const ROVER_HAVOC_EXECUTION_SEMANTIC_REVIEWS = Object.freeze([
  {
    pendingExecutionId: ROVER_HAVOC_PENDING_EXECUTION_IDS[0],
    status: 'BLOCKED_SOURCE_SEMANTICS',
    actionKey: 'weapon:red-spring-basic-hit-stack-timing',
    reviewedAt: '2026-08-31',
    blockerId: ROVER_HAVOC_EXECUTION_SOURCE_BLOCKER_ID,
    notes: Object.freeze([
      'RS-BASIC values, duration, cap and once-per-second trigger are source-proven.',
      'Exact Basic hit timestamps and warm-up carry-in state are not source-locked, so stack uptime cannot be assigned to Rover damage events.',
    ]),
  },
  {
    pendingExecutionId: ROVER_HAVOC_PENDING_EXECUTION_IDS[1],
    status: 'BLOCKED_SOURCE_SEMANTICS',
    actionKey: 'weapon:red-spring-concerto-window-lifecycle',
    reviewedAt: '2026-08-31',
    blockerId: ROVER_HAVOC_EXECUTION_SOURCE_BLOCKER_ID,
    notes: Object.freeze([
      'RS-CONCERTO-BASIC has exact 40% / 10-second / switch-off termination source semantics.',
      'The represented sequence does not include the full support-cycle Concerto lifecycle, so Bellibing will not assume a positive window or carry-in state.',
    ]),
  },
  {
    pendingExecutionId: ROVER_HAVOC_PENDING_EXECUTION_IDS[2],
    status: 'BLOCKED_SOURCE_CONFLICT',
    actionKey: 'sonata:havoc-eclipse-five-piece-stack-state',
    reviewedAt: '2026-08-31',
    blockerId: ROVER_HAVOC_EXECUTION_SOURCE_BLOCKER_ID,
    notes: Object.freeze([
      'Canonical project source review preserves the Havoc Eclipse 5-piece conflict: rendered English 7.5% x4 versus structured params 6% x5.',
      'The source warm-up also leaves the represented burst starting stack state outside the canonical sequence.',
    ]),
  },
  {
    pendingExecutionId: ROVER_HAVOC_PENDING_EXECUTION_IDS[3],
    status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE',
    actionKey: 'echo:dreamless-active-cast-exact-damage',
    reviewedAt: '2026-08-31',
    primitiveId: 'echo-active-damage-v1',
    notes: Object.freeze([
      'Exact Rank-5 Dreamless ACTIVE_CAST attack magnitude is now present in the Echo attack catalog.',
      'The generic echo-active-damage-v1 primitive can resolve that magnitude once an executable Rover timeline emits the cast; the +50% post-Liberation branch must remain source-coupled rather than flattened into permanent Echo damage.',
    ]),
  },
  {
    pendingExecutionId: ROVER_HAVOC_PENDING_EXECUTION_IDS[4],
    status: 'BLOCKED_SOURCE_SEMANTICS',
    actionKey: 'character:rover-havoc-umbra-dark-surge-state',
    reviewedAt: '2026-08-31',
    blockerId: ROVER_HAVOC_EXECUTION_SOURCE_BLOCKER_ID,
    notes: Object.freeze([
      'Dark Surge entry and action replacements are source-proven.',
      'Exact starting Umbra after the omitted warm-up, per-action Umbra movement, Dark Surge depletion/duration and Lifetaker extension timing are not all numerically source-resolved.',
    ]),
  },
  {
    pendingExecutionId: ROVER_HAVOC_PENDING_EXECUTION_IDS[5],
    status: 'BLOCKED_SOURCE_SEMANTICS',
    actionKey: 'team:rover-havoc-roccia-shorekeeper-uptime',
    reviewedAt: '2026-08-31',
    blockerId: ROVER_HAVOC_EXECUTION_SOURCE_BLOCKER_ID,
    notes: Object.freeze([
      'Roccia and The Shorekeeper buff magnitudes/durations are source-proven in Character Mechanics.',
      'The canonical Rover source sequence omits both support rotations, so exact activation timestamps, transfer target state and Rover overlap cannot be source-locked.',
    ]),
  },
] as const);
