import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import {
  ROVER_ELECTRO_CHARACTER_MECHANIC_FACTS,
  ROVER_ELECTRO_PROVENANCE,
} from './roverElectroRawFacts.ts';
import {
  SUISUI_CHARACTER_MECHANIC_FACTS,
  SUISUI_PROVENANCE,
} from './suisuiRawFacts.ts';
import {
  ROVER_ELECTRO_TUNE_BREAK_FACT,
  SUISUI_TUNE_BREAK_FACT,
} from './finalBlockerResolvedTuneBreakFacts.ts';

function coverage(
  actions: string,
  forte: string,
  inherent: string,
  outro: string,
  resources: string,
): CharacterMechanicsProfile['coverage'] {
  return [
    { area: 'ACTIONS', status: 'VERIFIED', notes: actions },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: forte },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: inherent },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: outro },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: resources },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 mechanics are source-audited; sequence execution remains separate from raw source coverage.' },
  ];
}

export const ROVER_ELECTRO_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'rover-electro',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Deterrence, Thunderclap/Repel, Ultimate Tactics, Overshock, every current Thrum of All Sounds form, Thunder Bane and Thunderous Fury retain exact current Lv1-Lv10 source representations. Basic Attack - Repel remains Basic Attack DMG; Thunder Bane remains Resonance Skill DMG; shared Tune Break: Sword stays system-owned. Cross-attribute Thrum forms preserve their source attribute in notes and remain PENDING_INTERPRETATION for execution rather than being coerced to Electro.',
    'Electric Surge, Thunder Rage, Overshock, Apex Resonance and Thrum transition/consumption semantics are current-source audited without using the corrupted PR #66/#68 slice as truth.',
    'Decipher and Regression are current-source audited; their Electro Flare and timed Resonance Skill bonus semantics remain raw state/effect data.',
    'Rumbling Thunders preserves Electro Core, the Negative Status trigger and the 25% All DMG Amplification / 14s / switch-out termination semantics without assumed uptime.',
    'Electric Surge max 120 and Thunder Rage max 100 plus current gain/clear/decay rules are explicit.',
  ),
  factIds: [...ROVER_ELECTRO_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), ROVER_ELECTRO_TUNE_BREAK_FACT.factId],
  provenance: {
    ...ROVER_ELECTRO_PROVENANCE,
    notes: [
      ...ROVER_ELECTRO_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas, including one current shared-system Tune Break fact.',
      'The old PR #66/#68 Rover (Electro) review slice is explicitly non-authoritative because its labels/rows are corrupted or misaligned. This profile is an independent reconstruction from current live sources.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from VERIFIED source coverage. No broad Rover DPS, cross-attribute execution engine or shared Tune Break formula is implied.',
    ],
  },
};

export const SUISUI_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'suisui',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Current post-update Zephyr/Drizzle attacks, Vernal Screen/Awakening Spring, Tinkling Jade and the full Forte damage set retain exact Lv1-Lv10 source representations. Awakening Spring and Tinkling Jade preserve source-explicit HP scaling. Shared Tune Break is Rectifier; the stale Gauntlets artifact row is rejected.',
    'Zephyr/Drizzle stance transitions, Parting Mist, Cloud Breath/Floral Epistle generation, Enrichment, Ceaseless Landscape, Roaming Transcendent, Reflecting Shadows, Plume Step and 0/200/400/600 Outro thresholds are source-audited without assuming rotation cadence.',
    'Sky Over Water and Glimmering Gold are current-source audited, including Spring\'s Birth, the once-per-25s attack branch and the once-per-10-min fatal-damage protection.',
    'Rippling Waters preserves 25% team All DMG Amplification for 30s plus the current conditional Landscape/Roaming Transcendent threshold effects; no uptime is assumed.',
    'Cloud Breath max 120 and Floral Epistle max 600 plus current stance-specific gain/clear/consume rules are explicit.',
  ),
  factIds: [...SUISUI_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), SUISUI_TUNE_BREAK_FACT.factId],
  provenance: {
    ...SUISUI_PROVENANCE,
    notes: [
      ...SUISUI_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas, including current Tune Break: Rectifier.',
      'The normalized source record 1110 is retained only as discrepancy evidence where it conflicts with current official/current sources: its Tune Break: Gauntlets row and stale pre-update Zephyr multiplier are not promoted.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from VERIFIED source coverage. No Suisui rotation/DPS adapter, Negative Status system execution or shared Tune Break formula is implied.',
    ],
  },
};

export const FINAL_BLOCKER_RESOLVED_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  ROVER_ELECTRO_CHARACTER_MECHANICS_PROFILE,
  SUISUI_CHARACTER_MECHANICS_PROFILE,
] as const;
