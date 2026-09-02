export type MornyeExecutionBlockerKind =
  | 'ROTATION_TIMELINE'
  | 'RAW_DATA_CONFLICT'
  | 'ECHO_ACTIVE_DAMAGE'
  | 'WEAPON_SOURCE_CONFLICT'
  | 'EFFECT_CATALOG_GAP'
  | 'TEAM_INCOMING_STATE'
  | 'PERIODIC_EVENT_PHASE';

export interface MornyeExecutionBlocker {
  readonly blockerId: string;
  readonly kind: MornyeExecutionBlockerKind;
  readonly missingFact: string;
  readonly checkedSource: string;
  readonly whyRequired: string;
  readonly blockedBoundary: string;
}

export const MORNYE_STANDARD_SEQUENCE_20260831 = [
  'Intro',
  'Basic: Wide Field 1',
  'Basic: Wide Field 2',
  'Basic: Wide Field 3 (cancel animation on hit via Skill)',
  'Skill: Distributed Array',
  'Heavy: Inversion (cancel animation endlag on hit via Ultimate)',
  'Ultimate',
  'Echo: Reactor Husk (swap-cancel after Ultimate)',
  'Outro',
] as const;

export const MORNYE_STANDARD_EXECUTION_BLOCKERS_20260831: readonly MornyeExecutionBlocker[] = [
  {
    blockerId: 'mornye-rotation-timeline',
    kind: 'ROTATION_TIMELINE',
    missingFact: 'Exact total Loop Rotation duration and per-action timestamps.',
    checkedSource: 'Prydwen current Mornye Loop Rotation and Echo Timing.',
    whyRequired: 'The simulator needs an exact DPS denominator and timestamps to resolve 4s Starfield/Halo overlap instead of assuming uptime.',
    blockedBoundary: 'ENGINE_MODELED rotation, Personal Rotation DPS, exact short-window overlap, whole-build +25 comparison.',
  },
  {
    blockerId: 'mornye-critical-protocol-scaling-stat',
    kind: 'RAW_DATA_CONFLICT',
    missingFact: 'A reconciled canonical scaling stat for Critical Protocol in Bellibing raw data.',
    checkedSource: 'Current main mornyeRawFacts.ts says ATK; current Critical Protocol source classifies the skill as DEF-scaling.',
    whyRequired: 'DamageEvaluator cannot source the Ultimate from two contradictory scaling-stat truths.',
    blockedBoundary: 'Exact Critical Protocol damage and any full personal-rotation total.',
  },
  {
    blockerId: 'reactor-husk-active-scaling-stat',
    kind: 'ECHO_ACTIVE_DAMAGE',
    missingFact: 'Exact scaling stat for Reactor Husk active 351.00% Fusion DMG.',
    checkedSource: 'Current Reactor Husk source gives Rank-5 351.00% Fusion DMG and 20s CD but does not name ATK/DEF/HP; current echoAttacks.ts intentionally has no Reactor Husk profile.',
    whyRequired: 'The shared Echo active-damage adapter requires an explicit scaling stat and Bellibing policy forbids guessing generic Echo damage scaling.',
    blockedBoundary: 'Executable Reactor Husk hit and complete personal-rotation damage.',
  },
  {
    blockerId: 'starfield-calibrator-concerto-trigger',
    kind: 'WEAPON_SOURCE_CONFLICT',
    missingFact: 'Whether R1 Starfield Calibrator restores 8 Concerto on Resonance Skill or Resonance Liberation.',
    checkedSource: 'Current sources conflict: Wuthering.gg renders Resonance Skill while Wutheringlab/LDShop render Resonance Liberation.',
    whyRequired: 'Resource/handoff execution must bind the 8 Concerto event to a concrete cast event; selecting either trigger would be a guess.',
    blockedBoundary: 'Exact Starfield resource event and Concerto/handoff timeline.',
  },
  {
    blockerId: 'starfield-calibrator-def-effect-catalog',
    kind: 'EFFECT_CATALOG_GAP',
    missingFact: 'Bellibing effect-catalog representation of Starfield Calibrator R1 permanent DEF +16%.',
    checkedSource: 'Current external source is consistent on +16% DEF at R1; current weaponEffectCatalog contains SC-TEAM-CD but no Starfield DEF record.',
    whyRequired: 'Owned-build stat assembly must consume item effects from the effects layer, not a Mornye-local combat constant.',
    blockedBoundary: 'Exact owned five-Echo/build stat assembly and personal damage context.',
  },
  {
    blockerId: 'mornye-team-incoming-state',
    kind: 'TEAM_INCOMING_STATE',
    missingFact: 'Exact Lucy/Rebecca predecessor actions and active transfer/buff states at Mornye Intro.',
    checkedSource: 'Canonical profile fixes team membership but does not publish a full team rotation or starting-state snapshot.',
    whyRequired: 'Team buffs cannot be treated as permanent just because Lucy and Rebecca are selected teammates.',
    blockedBoundary: 'Team-supported personal DPS baseline and exact incoming handoff state.',
  },
  {
    blockerId: 'mornye-syntony-first-heal-offset',
    kind: 'PERIODIC_EVENT_PHASE',
    missingFact: 'Whether the first periodic Syntony/High Syntony heal occurs immediately or after the first 3s cadence interval.',
    checkedSource: 'Current kit text says healing can trigger once every 3s but does not establish the initial tick phase.',
    whyRequired: 'Exact repeated heal-trigger refresh timing for 4s Starfield/Halo windows requires the first tick timestamp.',
    blockedBoundary: 'Exact periodic heal event list and exact repeated Starfield/Halo refresh timeline; immediate Distributed Array healing remains executable when timestamped.',
  },
] as const;

export const MORNYE_STANDARD_EXECUTION_REVIEW_20260831 = {
  reviewId: 'MORNYE-STANDARD-COMBAT-CLOSURE-2026-08-31-01',
  profileId: 'mornye-standard',
  characterId: 'mornye',
  baselineSha: '2af8221b13448c9a0cc6749e3d6234b8e6c1efd8',
  checkedAt: '2026-08-31',
  currentRotationStatus: 'SOURCE_SEQUENCE_ONLY',
  disposition: 'BLOCKED' as const,
  canonicalSequence: MORNYE_STANDARD_SEQUENCE_20260831,
  exactErMechanicCapPercent: 260,
  exactErCapDerivation: '100% base threshold + 160% excess ER reaches the Critical Protocol +160% CRIT DMG cap, +80% CRIT Rate cap, and Interfered +40% amplification cap.',
  sourceSafeExecutableSemantics: [
    'Distributed Array heal can emit heal-triggered Starfield R1 TEAM CRIT DMG +20% for 4s at its eventual action timestamp.',
    'Halo of Starry Radiance can emit TEAM ATK for 4s from healer Off-Tune Buildup Rate: 0.2% ATK per 1% input, capped at +25%.',
    'Intro generates a 25s Syntony Field: +50% team Off-Tune Buildup Rate in-field, periodic healing cadence 3s, interruption resistance.',
    'Critical Protocol replaces an existing Syntony Field with a 25s High Syntony Field: +20% team DEF, inherited Syntony effects, +40% Healing Multiplier.',
    'Heavy Inversion applies Observation Marker for 30s; Tune Break on an observed target can create Interfered Marker for 8s.',
    'At S0, Interfered amplification is conditional on Tune Rupture/Strain Interfered state and scales from Mornye Energy Regen at 0.25% per point above 100%, capped +40%.',
    'Blueprint exposes two independent self Concerto +20 events (Intro and Wide Field Basic 3), each with a 20s cooldown, plus permanent self Energy Regen +10%.',
    'Boundedness trigger semantics are source-safe as an event/state contract and are not assumed permanently active.',
    'Outro emits TEAM All DMG Amplification +25% for 30s.',
  ],
  intentionallyNotPromoted: [
    'No ENGINE_MODELED rotation.',
    'No DPS_READY readiness mutation.',
    'No profile freeze.',
    'No Personal Rotation DPS denominator or total.',
    'No owned-build +25 candidate-vs-incumbent comparison.',
    'No Lucy/Rebecca buff uptime baked into Mornye mechanics.',
    'No guessed Reactor Husk ATK/DEF/HP scaling.',
    'No guessed Starfield Concerto trigger.',
    'No hand edit of generated mornye-standard profile to add the now-source-proven 260% mechanic cap.',
  ],
  blockers: MORNYE_STANDARD_EXECUTION_BLOCKERS_20260831,
} as const;
