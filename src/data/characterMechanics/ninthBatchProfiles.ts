import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import { CHISA_CHARACTER_MECHANIC_FACTS, CHISA_PROVENANCE } from './chisaRawFacts.ts';
import { LUPA_CHARACTER_MECHANIC_FACTS, LUPA_PROVENANCE } from './lupaRawFacts.ts';
import { IUNO_CHARACTER_MECHANIC_FACTS, IUNO_PROVENANCE } from './iunoRawFacts.ts';
import { ROVER_HAVOC_CHARACTER_MECHANIC_FACTS, ROVER_HAVOC_PROVENANCE } from './roverHavocRawFacts.ts';
import { ROVER_SPECTRO_CHARACTER_MECHANIC_FACTS, ROVER_SPECTRO_PROVENANCE } from './roverSpectroRawFacts.ts';
import {
  CHISA_TUNE_BREAK_FACT,
  LUPA_TUNE_BREAK_FACT,
  IUNO_TUNE_BREAK_FACT,
  ROVER_HAVOC_TUNE_BREAK_FACT,
  ROVER_SPECTRO_TUNE_BREAK_FACT,
} from './tuneBreakFacts.ts';

function coverage(actionNotes: string, forteNotes: string, inherentNotes: string, outroNotes: string, resourceNotes: string): CharacterMechanicsProfile['coverage'] {
  return [
    { area: 'ACTIONS', status: 'VERIFIED', notes: actionNotes },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: forteNotes },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: inherentNotes },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: outroNotes },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: resourceNotes },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; sequence execution and conditional damage/buffs remain separate from source coverage.' },
  ];
}

export const CHISA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "chisa",
  verificationStatus: 'VERIFIED',
  coverage: coverage("Death Snip, Sawring - Blitz, Chainsaw Mode - Dodge Counter and Sawring - Eradication keep explicit Resonance Liberation DMG classification; the per-Ring Eradication multiplier stays a separate raw modifier. Tune Break: Broadblade remains shared-system damage.", "Unseen Snare/Thread of Bane, Chainsaw Mode/Fever, Ring of Chainsaw and Lifethread - Jetstream are source-audited without fabricated uptime.", "Inescapable Fate and All Ends Here are source-audited.", "Unraveling - Law Zero is source-audited as a 20s team state affecting Negative Status/Electro Rage caps and Thread of Bane generation.", "Ring of Chainsaw and Lifethread - Jetstream caps/gain/consumption rules are explicit."),
  factIds: [...CHISA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), CHISA_TUNE_BREAK_FACT.factId],
  provenance: {
    ...CHISA_PROVENANCE,
    notes: [
      ...CHISA_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no rotation/DPS adapter or shared Tune Break damage formula is implied.',
    ],
  },
};

export const LUPA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "lupa",
  verificationStatus: 'VERIFIED',
  coverage: coverage("Basic/Heavy/Skill/Liberation/Intro and Forte damage retain current damage-bucket overrides: Firestrike Heavy; Dance/Climax and Nowhere Liberation; Set the Arena Ablaze Skill. Tune Break: Broadblade remains shared-system damage.", "Wolflame/Wolfaith, Wildfire Banner, Burning Matchpoint, Pack Hunt/Glory and off-field Arena trigger semantics are source-audited.", "Remember My Name and Applause of Victory/Glory are source-audited.", "Stand by Me, Warrior is source-audited as 20% Fusion + 25% Basic Attack DMG Amplification for 14s or until switch-out.", "Wolflame max 100 and Wolfaith max 2 with current consumption, duration and expiry conversion are explicit."),
  factIds: [...LUPA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), LUPA_TUNE_BREAK_FACT.factId],
  provenance: {
    ...LUPA_PROVENANCE,
    notes: [
      ...LUPA_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no rotation/DPS adapter or shared Tune Break damage formula is implied.',
    ],
  },
};

export const IUNO_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "iuno",
  verificationStatus: 'VERIFIED',
  coverage: coverage("Moonring, Moonbow, Skill, Liberation, Intro, Flux and Absolute Fullness damage retain explicit Basic-vs-Liberation boundaries; fixed 100% ATK Outro damage is represented separately. Tune Break: Gauntlets remains shared-system damage.", "Lunar Cycle forms, Sentience, Full Moon Domain and Blessing of the Wan Light remain raw state/resource semantics without assumed uptime.", "Waxing Ascent and Derivation are source-audited; current S4 shield wording conflict remains provenance evidence.", "From Gloom to Gleam source-fixed damage plus 50% Heavy Attack DMG Amplification / 14s / switch-out termination is source-audited.", "Sentience max 100 with current restores/consumption semantics is explicit; exact healing curves remain raw utility semantics."),
  factIds: [...IUNO_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), IUNO_TUNE_BREAK_FACT.factId],
  provenance: {
    ...IUNO_PROVENANCE,
    notes: [
      ...IUNO_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no rotation/DPS adapter or shared Tune Break damage formula is implied.',
    ],
  },
};

export const ROVER_HAVOC_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "rover-havoc",
  verificationStatus: 'VERIFIED',
  coverage: coverage("Tuneslayer/Wingblade/Liberation/Intro plus Dark Surge replacements carry exact current Lv1-Lv10 damage; Devastation/Thwackblade are Heavy and Lifetaker is Skill. Soundweaver is source-fixed. Tune Break: Sword remains shared-system damage.", "Umbra and Dark Surge replacement rules are source-audited without assumed rotation timing.", "Metamorph and Bleak Crescendo are source-audited.", "Soundweaver is source-fixed 143.3% ATK Havoc damage every 2s for 6s.", "Umbra max 100 and current gain/full-gauge gate are explicit."),
  factIds: [...ROVER_HAVOC_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), ROVER_HAVOC_TUNE_BREAK_FACT.factId],
  provenance: {
    ...ROVER_HAVOC_PROVENANCE,
    notes: [
      ...ROVER_HAVOC_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no rotation/DPS adapter or shared Tune Break damage formula is implied.',
    ],
  },
};

export const ROVER_SPECTRO_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "rover-spectro",
  verificationStatus: 'VERIFIED',
  coverage: coverage("Vibration Manifestation, Skill, Liberation, Intro and Forte actions carry exact current Lv1-Lv10 damage; Resonating Spin/Whirl/Echoes are explicitly Skill DMG despite mixed trigger ownership. Tune Break: Sword remains shared-system damage.", "Diminutive Sound and Resonating Spin/Echoes transitions are source-audited without assumed cast cadence.", "Reticence and Silent Listener are source-audited.", "Instant is source-audited as a non-damage 3s stasis area; no damage coefficient is fabricated.", "Diminutive Sound max 100 with 50-point Forte consumption and source-listed generation is explicit."),
  factIds: [...ROVER_SPECTRO_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), ROVER_SPECTRO_TUNE_BREAK_FACT.factId],
  provenance: {
    ...ROVER_SPECTRO_PROVENANCE,
    notes: [
      ...ROVER_SPECTRO_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no rotation/DPS adapter or shared Tune Break damage formula is implied.',
    ],
  },
};

export const NINTH_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  CHISA_CHARACTER_MECHANICS_PROFILE,
  LUPA_CHARACTER_MECHANICS_PROFILE,
  IUNO_CHARACTER_MECHANICS_PROFILE,
  ROVER_HAVOC_CHARACTER_MECHANICS_PROFILE,
  ROVER_SPECTRO_CHARACTER_MECHANICS_PROFILE,
] as const;
