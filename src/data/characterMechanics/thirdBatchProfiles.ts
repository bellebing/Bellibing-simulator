import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import { ENCORE_CHARACTER_MECHANIC_FACTS, ENCORE_PROVENANCE } from './encoreRawFacts.ts';
import { TAOQI_CHARACTER_MECHANIC_FACTS, TAOQI_PROVENANCE } from './taoqiRawFacts.ts';
import { VERINA_CHARACTER_MECHANIC_FACTS, VERINA_PROVENANCE } from './verinaRawFacts.ts';
import {
  ENCORE_TUNE_BREAK_FACT,
  TAOQI_TUNE_BREAK_FACT,
  VERINA_TUNE_BREAK_FACT,
} from './tuneBreakFacts.ts';

export const TAOQI_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'taoqi',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Concealed Edge, Strategic Parry, Fortified Defense, Unmovable, Intro and Timed Counter damage carry exact current Lv1-Lv10 source representations. Strategic Parry/Timed Counters preserve their Basic Attack DMG bucket while using source-backed DEF scaling. Tune Break: Broadblade remains shared-system damage.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Rocksteady Defense, Rocksteady Shield conversion and Resolving Caliber/Timed Counter consumption are source-audited; exact encounter timing remains separate.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Steadfast Protection and Unyielding are source-audited.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Iron Will 38% Resonance Skill DMG Amplification / 14s / switch-out termination is source-audited.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Resolving Caliber max 3, Fortified Defense generation of 3 Rocksteady Shields and shield-to-caliber conversion rules are source-audited without inventing shield uptime.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; sequence execution remains separate from raw coverage.' },
  ],
  factIds: [...TAOQI_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), TAOQI_TUNE_BREAK_FACT.factId],
  provenance: {
    ...TAOQI_PROVENANCE,
    notes: [
      ...TAOQI_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas. Rocksteady damage reduction, healing and shield formulas remain utility semantics rather than fabricated Character damage actions.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Taoqi rotation/DPS adapter or shared Tune Break damage formula is implied by this profile.',
    ],
  },
};

export const VERINA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'verina',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Cultivation, Botany Experiment, Arboreal Flourish, Photosynthesis Mark coordinated damage, Intro and both Starflower branches carry exact current Lv1-Lv10 source representations. Starflower Heavy/Mid-air preserve explicit Heavy/Basic buckets. Tune Break: Rectifier remains shared-system damage.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Photosynthesis Energy acquisition/consumption and Starflower damage/healing branches are source-audited; executable heal/trigger cadence remains separate.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Grace of Life and Gift of Nature are source-audited.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Blossom incoming-character healing and 15% nearby-team DMG Amplification with their distinct source durations are source-audited.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Photosynthesis Energy max 4, source-listed gain paths and one-stack Starflower consumption are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; sequence execution remains separate from raw coverage.' },
  ],
  factIds: [...VERINA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), VERINA_TUNE_BREAK_FACT.factId],
  provenance: {
    ...VERINA_PROVENANCE,
    notes: [
      ...VERINA_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas. Photosynthesis Mark coordinated execution is retained separately from its source Liberation damage-bonus classification.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Verina rotation/DPS adapter or shared Tune Break damage formula is implied by this profile.',
    ],
  },
};

export const ENCORE_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'encore',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Wooly Attack, Flaming Woolies/Energetic Welcome, Cosmos Rave replacements, Intro, Cloudy Frenzy, Cosmos Rupture and source-fixed Thermal Field are source-audited. Replacement actions preserve Basic/Heavy/Skill buckets while the two Forte finishers remain explicit Resonance Liberation DMG. Tune Break: Rectifier remains shared-system damage.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Mayhem max/gain/full-consumption rules, damage-reduction state and Cloudy Frenzy/Cosmos Rupture resolution are source-audited; Prydwen Dissonance naming is retained only as provenance.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Angry Cosmos and Woolies Cheer Dance are source-audited.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Thermal Field is source-audited as fixed 176.76% ATK Fusion damage every 1.5s for 6s within the source-listed 3m field; timed hit execution remains separate.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Current raw/Wuthering.gg Mayhem max 100, source-listed gain paths and full-resource consume rules are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited, including S6 Lost Lamb max 5 stacks.' },
  ],
  factIds: [...ENCORE_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), ENCORE_TUNE_BREAK_FACT.factId],
  provenance: {
    ...ENCORE_PROVENANCE,
    notes: [
      ...ENCORE_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas. The Mayhem/Dissonance difference is a documented nomenclature discrepancy, not an invented semantic reconciliation.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Encore rotation/DPS adapter or shared Tune Break damage formula is implied by this profile.',
    ],
  },
};

export const THIRD_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  TAOQI_CHARACTER_MECHANICS_PROFILE,
  VERINA_CHARACTER_MECHANICS_PROFILE,
  ENCORE_CHARACTER_MECHANICS_PROFILE,
] as const;
