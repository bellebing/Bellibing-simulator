import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import { DENIA_CHARACTER_MECHANIC_FACTS, DENIA_PROVENANCE } from './deniaRawFacts.ts';
import { HIYUKI_CHARACTER_MECHANIC_FACTS, HIYUKI_PROVENANCE } from './hiyukiRawFacts.ts';
import { QINGXIAO_CHARACTER_MECHANIC_FACTS, QINGXIAO_PROVENANCE } from './qingxiaoRawFacts.ts';
import { ROVER_AERO_CHARACTER_MECHANIC_FACTS, ROVER_AERO_PROVENANCE } from './roverAeroRawFacts.ts';
import { YANGYANG_XUANLING_CHARACTER_MECHANIC_FACTS, YANGYANG_XUANLING_PROVENANCE } from './yangyangXuanlingRawFacts.ts';
import {
  DENIA_TUNE_BREAK_FACT,
  HIYUKI_TUNE_BREAK_FACT,
  QINGXIAO_TUNE_BREAK_FACT,
  ROVER_AERO_TUNE_BREAK_FACT,
  YANGYANG_XUANLING_TUNE_BREAK_FACT,
} from './tuneBreakFacts.ts';

function coverage(actionNotes: string, forteNotes: string, inherentNotes: string, outroNotes: string, resourceNotes: string): CharacterMechanicsProfile['coverage'] {
  return [
    { area: 'ACTIONS', status: 'VERIFIED', notes: actionNotes },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: forteNotes },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: inherentNotes },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: outroNotes },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: resourceNotes },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw source text and numeric parameter payloads are source-audited; sequence execution remains separate from raw coverage.' },
  ];
}

export const DENIA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "denia",
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Stagecraft/Breakdown Basic/Heavy/Mid-air/Dodge plus Skill/Liberation/Intro/Erosion Field retain exact Lv1-Lv10 structures. Banish and Erosion Field stay Liberation-class; the conditional Void Particle Normal-Attack reclassification remains a separate raw modifier. Tune Break stays shared-system damage.",
    "Dark Core/Void Particle/Conformal Charge, Entropy Shift, Erosion Field and both Resonance Mode state machines are source-audited without assumed uptime.",
    "Vestiges of Falsehood and Etched Colors are source-audited.",
    "Unfinished Lies is source-audited as mode-dependent non-damage amplification with its 30s/16s branches and early termination rules.",
    "Dark Core max 3, Void Particle max 100 and Conformal Charge max 100 plus current source generation/consumption gates are explicit.",
  ),
  factIds: [...DENIA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), DENIA_TUNE_BREAK_FACT.factId],
  provenance: {
    ...DENIA_PROVENANCE,
    notes: [
      ...DENIA_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no rotation/DPS adapter or shared Tune Break damage formula is implied.',
    ],
  },
};

export const HIYUKI_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "hiyuki",
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Present/Foreclaimed damage retains explicit Basic/Heavy versus Liberation overrides; Frostedge and Basic Attack - Iai remain Liberation-class despite Intro/Basic ownership. The per-Snowforged-Blade row is not standalone damage. Tune Break stays shared-system damage.",
    "Present/Foreclaimed/Iai state transitions plus Dedication/Frostheart/Frostharden Iai/Whiteout Bitterfrost/Snowforged Blade rules are source-audited without fabricated rotation timing.",
    "Fine Snow and Ephemeral Realm are source-audited. Glacio Bite remains Negative-Status/system semantics and is not coerced into Character ACTION damage.",
    "Snowlight Blessing is source-audited as 20% Glacio DMG Amplification for other nearby team Resonators against Glacio-Chafe targets for 20s.",
    "Five source-listed Forte resources and their caps/gain/consumption rules are explicit.",
  ),
  factIds: [...HIYUKI_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), HIYUKI_TUNE_BREAK_FACT.factId],
  provenance: {
    ...HIYUKI_PROVENANCE,
    notes: [
      ...HIYUKI_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no rotation/DPS adapter or shared Tune Break damage formula is implied.',
    ],
  },
};

export const QINGXIAO_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "qingxiao",
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Stringblade/Severing Note/Liberation/Intro/Ephemeral actions retain exact Lv1-Lv10 structures and source action buckets; Lingering Song is source-fixed 800% ATK Outro damage. Tune Break stays shared-system damage.",
    "Ephemeral Transcendence, Mindlock, Heaven’s Clarity, Swordlight Ward and Sword Flight remain raw state semantics without assumed execution cadence.",
    "Sea of Thought, World of Dust and To Know, To Banish are source-audited.",
    "Lingering Song is represented as source-fixed 800% ATK Aero damage without inventing a skill-level curve.",
    "Qin Heart, Sword Cadence and Heart Sword Intent each max at 100 with current source gain/gating rules explicit.",
  ),
  factIds: [...QINGXIAO_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), QINGXIAO_TUNE_BREAK_FACT.factId],
  provenance: {
    ...QINGXIAO_PROVENANCE,
    notes: [
      ...QINGXIAO_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no rotation/DPS adapter or shared Tune Break damage formula is implied.',
    ],
  },
};

export const ROVER_AERO_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "rover-aero",
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Wind Cutter/Skill/Liberation/Intro plus Cloudburst Dance/Unbound Flow retain exact Lv1-Lv10 structures; Cloudburst and Unbound Flow are explicitly Skill DMG despite mixed player-input ownership. Tune Break stays shared-system damage.",
    "Windstrings max 120, Cloudburst/Unbound transitions and exact healing tables remain raw state/utility semantics without assumed rotation timing.",
    "Sand in the Storm and Boundless Winds are source-audited.",
    "Storm’s Echo is source-audited as NON_DAMAGE Aeolian Realm: 30s team state, target-hit Aero Erosion cap +3 for 10s, non-stackable.",
    "Windstrings max 120 with 25/20/10 source-listed generation and 60-per-Unbound-stage consumption is explicit.",
  ),
  factIds: [...ROVER_AERO_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), ROVER_AERO_TUNE_BREAK_FACT.factId],
  provenance: {
    ...ROVER_AERO_PROVENANCE,
    notes: [
      ...ROVER_AERO_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no rotation/DPS adapter or shared Tune Break damage formula is implied.',
    ],
  },
};

export const YANGYANG_XUANLING_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "yangyang-xuanling",
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Azure/Feather Basics plus Skill/Liberation/Forte actions retain exact Lv1-Lv10 structures; Sword Stance Switch/Hush/Shadow/Flow/Feather Fall/Havoc in Bloom keep current Heavy Attack DMG overrides. As the Wind Wills is source-fixed 300% ATK Outro damage. Tune Break stays shared-system damage.",
    "Melody/Azure Plume, Bated Breath/Streaming Storm/Hark the Wind, Feathered Oath and Refrain are source-audited without fabricated description-parameter substitution.",
    "Unbroken Vow and One Life, One Blade are source-audited.",
    "As the Wind Wills keeps source-fixed 300% ATK damage separate from Tonal Switch 20s utility and the conditional 20% Havoc DMG Amplification.",
    "Melody max 100 and Azure Plume max 2 with current source restore/consume rules are explicit.",
  ),
  factIds: [...YANGYANG_XUANLING_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), YANGYANG_XUANLING_TUNE_BREAK_FACT.factId],
  provenance: {
    ...YANGYANG_XUANLING_PROVENANCE,
    notes: [
      ...YANGYANG_XUANLING_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no rotation/DPS adapter or shared Tune Break damage formula is implied.',
    ],
  },
};

export const TENTH_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  DENIA_CHARACTER_MECHANICS_PROFILE,
  HIYUKI_CHARACTER_MECHANICS_PROFILE,
  QINGXIAO_CHARACTER_MECHANICS_PROFILE,
  ROVER_AERO_CHARACTER_MECHANICS_PROFILE,
  YANGYANG_XUANLING_CHARACTER_MECHANICS_PROFILE,
] as const;
