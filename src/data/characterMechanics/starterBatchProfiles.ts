import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import {
  CHIXIA_CHARACTER_MECHANIC_FACTS,
  CHIXIA_PROVENANCE,
} from './chixiaRawFacts.ts';
import {
  MORTEFI_CHARACTER_MECHANIC_FACTS,
  MORTEFI_PROVENANCE,
} from './mortefiRawFacts.ts';
import {
  CHIXIA_TUNE_BREAK_FACT,
  MORTEFI_TUNE_BREAK_FACT,
  YANGYANG_TUNE_BREAK_FACT,
} from './tuneBreakFacts.ts';
import {
  YANGYANG_CHARACTER_MECHANIC_FACTS,
  YANGYANG_PROVENANCE,
} from './yangyangRawFacts.ts';

export const CHIXIA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'chixia',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'POW POW Basic/Heavy/Mid-air/Dodge, Whizzing Fight Spirit, Blazing Flames, DAKA DAKA!/Boom Boom, Intro and source-fixed Leaping Flames damage are source-audited; Tune Break: Pistols is explicit shared-system damage without a fabricated Character coefficient.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Thermobaric Bullet acquisition, DAKA DAKA! consumption/state exit, 30-shot Boom Boom access and Inherent cap modification are source-audited; firing cadence remains executable combat state.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Scorching Magazine and Numbingly Spicy! are source-audited.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Leaping Flames is source-audited as fixed 530% ATK Fusion damage with no Lv1-Lv10 table.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Thermobaric Bullets baseline 60 cap, +10 Inherent modifier, gain and continuous-consumption rules are source-audited without collapsing the conditional cap into one unconditional maxValue.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; sequence execution remains separate from raw coverage.' },
  ],
  factIds: [
    ...CHIXIA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId),
    CHIXIA_TUNE_BREAK_FACT.factId,
  ],
  provenance: {
    ...CHIXIA_PROVENANCE,
    notes: [
      ...CHIXIA_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas. Tune Break carries independent shared-system provenance and no Chixia-specific Tune Break coefficient is fabricated.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Chixia rotation/DPS adapter or shared Tune Break damage formula is implied by this profile.',
    ],
  },
};

export const YANGYANG_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'yangyang',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Feather as Blade Basic/Heavy/Mid-air/Dodge, Zephyr Song, Zephyr Domain, Wind Spirals, Intro, Stormy Strike and Feather Release carry exact current Lv1-Lv10 source representations; Tune Break: Sword is explicit shared-system damage.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Melody gain/cap, 3-Melody Stormy Strike access and 3-Melody Feather Release consumption are source-audited without inventing an unstated Stormy Strike consumption rule.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Compassion and Lazuline Mercy are source-audited.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Whispering Breeze restores 4 Resonance Energy per second for 5 seconds to the incoming Resonator.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Melodies cap at 3 and all currently stated gain/Feather Release consumption rules are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; sequence execution remains separate from raw coverage.' },
  ],
  factIds: [
    ...YANGYANG_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId),
    YANGYANG_TUNE_BREAK_FACT.factId,
  ],
  provenance: {
    ...YANGYANG_PROVENANCE,
    notes: [
      ...YANGYANG_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas. Tune Break carries independent shared-system provenance and no Yangyang-specific Tune Break coefficient is fabricated.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Yangyang rotation/DPS adapter or shared Tune Break damage formula is implied by this profile.',
    ],
  },
};

export const MORTEFI_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'mortefi',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Impromptu Show Basic/Heavy/Mid-air/Dodge, Passionate Variation, Violent Finale/Marcato, Dissonance and Fury Fugue carry exact current Lv1-Lv10 source representations; Tune Break: Pistols is explicit shared-system damage.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Annoyance cap/gain/5-second additional-gain window, 100-point Fury Fugue replacement and full-resource consumption are source-audited.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Harmonic Control and Rhythmic Vibrato are source-audited; stack/cadence execution remains explicit combat state.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Rage Transposition 38% Heavy Attack DMG Amplification / 14s / switch-out termination is source-audited.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Annoyance cap 100, source-listed gain families, additional-gain window and Fury Fugue consumption are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited. Current Prydwen Fury Fudge wording is retained only as label-discrepancy provenance, not a separate action.' },
  ],
  factIds: [
    ...MORTEFI_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId),
    MORTEFI_TUNE_BREAK_FACT.factId,
  ],
  provenance: {
    ...MORTEFI_PROVENANCE,
    notes: [
      ...MORTEFI_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas. Tune Break carries independent shared-system provenance and no Mortefi-specific Tune Break coefficient is fabricated.',
      'Burning Rhapsody coordinated-trigger cadence, Marcato stack execution and actual rotation hit count remain separate from raw source verification.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Mortefi rotation/DPS adapter or shared Tune Break damage formula is implied by this profile.',
    ],
  },
};

export const STARTER_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  CHIXIA_CHARACTER_MECHANICS_PROFILE,
  MORTEFI_CHARACTER_MECHANICS_PROFILE,
  YANGYANG_CHARACTER_MECHANICS_PROFILE,
] as const;
