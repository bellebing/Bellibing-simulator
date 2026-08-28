import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import { CIACCONA_CHARACTER_MECHANIC_FACTS, CIACCONA_PROVENANCE } from './ciacconaRawFacts.ts';
import { PHOEBE_CHARACTER_MECHANIC_FACTS, PHOEBE_PROVENANCE } from './phoebeRawFacts.ts';
import { THE_SHOREKEEPER_CHARACTER_MECHANIC_FACTS, THE_SHOREKEEPER_PROVENANCE } from './theShorekeeperRawFacts.ts';
import { JIANXIN_CHARACTER_MECHANIC_FACTS, JIANXIN_PROVENANCE } from './jianxinRawFacts.ts';
import { LUMI_CHARACTER_MECHANIC_FACTS, LUMI_PROVENANCE } from './lumiRawFacts.ts';
import { JINHSI_CHARACTER_MECHANIC_FACTS, JINHSI_PROVENANCE } from './jinhsiRawFacts.ts';
import {
  CIACCONA_TUNE_BREAK_FACT,
  PHOEBE_TUNE_BREAK_FACT,
  THE_SHOREKEEPER_TUNE_BREAK_FACT,
  JIANXIN_TUNE_BREAK_FACT,
  LUMI_TUNE_BREAK_FACT,
  JINHSI_TUNE_BREAK_FACT,
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

export const CIACCONA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "ciaccona",
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Quadruple Time Steps, Harmonic Allegro, Singer’s Triple Cadenza/Tonic, Roaming with the Wind and Quadruple Downbeat carry exact current Lv1-Lv10 structures with explicit Basic/Heavy/Skill/Liberation/Intro buckets. Tune Break: Pistols stays shared-system damage.",
    "Musical Essence, Ensemble Sylph, Solo Concert and Recital generation/continuation/switch semantics are source-audited without assumed cadence or uptime.",
    "Interlude Tune and Winds of Rinascita are source-audited, including the 100% Max HP / 4s shield and 30% Quadruple Downbeat DMG increase.",
    "Windcalling Tune is source-audited as 100% Aero Erosion DMG Amplification for 30s near the active Resonator.",
    "Musical Essence max 3 and Ensemble Sylph max 2 with current source generation/consumption rules are explicit.",
  ),
  factIds: [...CIACCONA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), CIACCONA_TUNE_BREAK_FACT.factId],
  provenance: {
    ...CIACCONA_PROVENANCE,
    notes: [
      ...CIACCONA_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      "MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Ciaccona rotation/DPS adapter or shared Tune Break damage formula is implied.",
    ],
  },
};

export const PHOEBE_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "phoebe",
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "O Come Divine Light, To Where Light Shines/Ring variants, Dawn of Enlightenment, Golden Grace, Starflash/Litany/Confession carry exact current Lv1-Lv10 structures. Refracted Holy Light/Chamuel’s Star preserve explicit Basic buckets. Attentive Heart base 528.41% ATK is source-fixed. Tune Break: Rectifier stays shared-system damage.",
    "Prayer/Divine Voice and mutually exclusive Absolution/Confession state gates are source-audited; Starflash costs/amplification/Frazzle application remain conditional RAW_ONLY semantics.",
    "Presence and Revelation are source-audited.",
    "Attentive Heart base damage plus Absolution +255% multiplier and Confession Silent Prayer semantics are source-audited without pre-applying state choice.",
    "Prayer max 120 with +5/s and Divine Voice max 60 with current restore/cost rules are explicit.",
  ),
  factIds: [...PHOEBE_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), PHOEBE_TUNE_BREAK_FACT.factId],
  provenance: {
    ...PHOEBE_PROVENANCE,
    notes: [
      ...PHOEBE_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      "MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Phoebe rotation/DPS adapter or shared Tune Break damage formula is implied.",
    ],
  },
};

export const THE_SHOREKEEPER_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "the-shorekeeper",
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Origin Calculus, Dim/Flare Star Butterflies, Enlightenment/Discernment, Illation and Transmutation carry exact current Lv1-Lv10 structures. Discernment is HP-scaling Liberation DMG; Enlightenment/Dim Star are Skill DMG. Tune Break: Rectifier stays shared-system damage.",
    "Collapsed Core/Empirical/Deductive Data, Butterfly conversion and Stellarealm evolution are source-audited without assumed on-field cadence or proc uptime.",
    "Life Entwined and Self Gravitation are source-audited, including 50% HP fatal protection and Stellarealm Energy Regen effects.",
    "Binary Butterfly 30s / up to 5 interruption-recovery triggers / 15% team DMG Amplification is source-audited.",
    "Collapsed Core max 5, Empirical Data max 5 and source-defined Deductive Data conversion rules are explicit; exact HP-based healing curves remain raw utility summaries.",
  ),
  factIds: [...THE_SHOREKEEPER_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), THE_SHOREKEEPER_TUNE_BREAK_FACT.factId],
  provenance: {
    ...THE_SHOREKEEPER_PROVENANCE,
    notes: [
      ...THE_SHOREKEEPER_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      "MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no The Shorekeeper rotation/DPS adapter or shared Tune Break damage formula is implied.",
    ],
  },
};

export const JIANXIN_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "jianxin",
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Fengyiquan, Calming Air counters, Purification Force Field, Essence of Tao and Primordial Chi Spiral damage carry exact current Lv1-Lv10 structures. Current Damage Data explicitly classifies the Forte Pushing Punch/Zhoutian/Shock/Yielding Pull family as Heavy Attack DMG. Tune Break: Gauntlets stays shared-system damage.",
    "Chi, Parry Stance, Zhoutian Progress, shield tiers/healing and release/consumption semantics are source-audited without invented Chi generation amounts or charge timing.",
    "Formless Release and Reflection are source-audited.",
    "Transcendence is source-audited as 38% Resonance Liberation DMG Amplification for 14s or until switch-out.",
    "Chi max 120 and current generation/gating rules are explicit; shield/heal Lv1-Lv10 formulas remain raw utility semantics.",
  ),
  factIds: [...JIANXIN_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), JIANXIN_TUNE_BREAK_FACT.factId],
  provenance: {
    ...JIANXIN_PROVENANCE,
    notes: [
      ...JIANXIN_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      "MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Jianxin rotation/DPS adapter or shared Tune Break damage formula is implied.",
    ],
  },
};

export const LUMI_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "lumi",
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Yellow/Red Navigation Support, Searchlight Service, Squeakie Express, Special Delivery, Spotlight variants, Energized skills and Laser carry exact current Lv1-Lv10 structures. Explicit Basic bucket conversions for Red Heavy/Energized/Laser are preserved. Tune Break: Broadblade stays shared-system damage.",
    "Yellow/Red Light and Spotlight mode transitions/termination plus Laser Spark consumption are source-audited without assumed hit cadence or full-Spark uptime.",
    "Pathfinding and Expediting are source-audited.",
    "Escorting is source-audited as 38% Resonance Skill DMG Amplification for 10s or until switch-out.",
    "Yellow Light Spark and Red Light Spark each max at 100 with only source-listed generation and consumption rules.",
  ),
  factIds: [...LUMI_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), LUMI_TUNE_BREAK_FACT.factId],
  provenance: {
    ...LUMI_PROVENANCE,
    notes: [
      ...LUMI_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      "MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Lumi rotation/DPS adapter or shared Tune Break damage formula is implied.",
    ],
  },
};

export const JINHSI_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "jinhsi",
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Slash of Breaking Dawn, Trailing Lights/Overflowing Radiance, Purge of Light, Loong’s Halo and Luminal Synthesis attacks carry exact current Lv1-Lv10 structures. Incarnation Basics are Skill DMG while current Damage Data explicitly classifies Incarnation Heavy/Dodge Counter as Basic DMG. Tune Break: Broadblade stays shared-system damage.",
    "Incarnation, Ordination Glow, Illuminous Epiphany, Unison and the exact per-Incandescence Stella Glamor modifier are source-audited without pre-summing or assumed rotation cadence.",
    "Radiant Surge and Converged Flash are source-audited.",
    "Temporal Bender is source-audited as the 20s Eras in Unity same-Attribute cadence modification.",
    "Incandescence max 50 with independent Attribute/Coordinated generation rules and Unison max 1 with its source 25s trigger gate are explicit.",
  ),
  factIds: [...JINHSI_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), JINHSI_TUNE_BREAK_FACT.factId],
  provenance: {
    ...JINHSI_PROVENANCE,
    notes: [
      ...JINHSI_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      "MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Jinhsi rotation/DPS adapter or shared Tune Break damage formula is implied.",
    ],
  },
};

export const EIGHTH_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  CIACCONA_CHARACTER_MECHANICS_PROFILE,
  PHOEBE_CHARACTER_MECHANICS_PROFILE,
  THE_SHOREKEEPER_CHARACTER_MECHANICS_PROFILE,
  JIANXIN_CHARACTER_MECHANICS_PROFILE,
  LUMI_CHARACTER_MECHANICS_PROFILE,
  JINHSI_CHARACTER_MECHANICS_PROFILE,
] as const;
