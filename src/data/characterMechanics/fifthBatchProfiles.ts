import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import { YOUHU_CHARACTER_MECHANIC_FACTS, YOUHU_PROVENANCE } from './youhuRawFacts.ts';
import { YUANWU_CHARACTER_MECHANIC_FACTS, YUANWU_PROVENANCE } from './yuanwuRawFacts.ts';
import { YOUHU_TUNE_BREAK_FACT, YUANWU_TUNE_BREAK_FACT } from './tuneBreakFacts.ts';

function coverage(actionNotes: string, forteNotes: string, inherentNotes: string, outroNotes: string, resourceNotes: string): CharacterMechanicsProfile['coverage'] {
  return [
    { area: 'ACTIONS', status: 'VERIFIED', notes: actionNotes },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: forteNotes },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: inherentNotes },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: outroNotes },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: resourceNotes },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; sequence execution remains separate from source coverage.' },
  ];
}

export const YOUHU_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'youhu',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Frosty Punches, Scroll Divination/Antique Appraisal, Fortune’s Favor, Scroll of Wonders and Poetic Essence carry exact current Lv1-Lv10 representations. Poetic Essence preserves its explicit Resonance Skill DMG bucket. Tune Break: Gauntlets stays shared-system damage.',
    'Frost/Fortune Rolling, Lucky Draw, one-Antique replacement, four-Auspice consumption and Free Verse/Antithesis/Double Pun/Triplet/Perfect Rhyme semantics are source-audited without assumed random distribution or uptime.',
    'Treasured Piece and Rare Find are source-audited; Scroll Divination and Poetic Essence healing remain raw utility semantics.',
    'Timeless Classics 100% incoming Coordinated Attack DMG Amplification for 28s is source-audited.',
    'Frost full-state semantics, Antique max one and Auspice max four are source-audited. The source does not expose a canonical numeric Frost maximum, so none is fabricated.',
  ),
  factIds: [...YOUHU_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), YOUHU_TUNE_BREAK_FACT.factId],
  provenance: {
    ...YOUHU_PROVENANCE,
    notes: [
      ...YOUHU_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Youhu rotation/DPS adapter, random-draw distribution or shared Tune Break damage formula is implied.',
    ],
  },
};

export const YUANWU_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'yuanwu',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Leihuangquan, Thunder Wedge, Blazing Might, Thunder Bombardment and all Lightning Infused/Forte damage entries carry exact current Lv1-Lv10 representations with their source-backed ATK/DEF scaling and damage buckets. Tune Break: Gauntlets stays shared-system damage.',
    'Readiness, Rumbling Spark/Thunder Uprising replacement semantics, Thunder Wedge coordinated triggering and Lightning Infused attack replacements are source-audited without assumed field time or coordinated-attack uptime.',
    'Thunderous Determination and Reserved Confidence are source-audited. The +40% Thunder Uprising multiplier remains a modifier, not a duplicate action.',
    'Lightning Manipulation is source-audited as Vibration Strength utility with no fabricated Character damage coefficient.',
    'Readiness max 100, +6/s while Thunder Wedge is on-field, +5 per coordinated hit and full-consume Rumbling Spark rules are source-audited.',
  ),
  factIds: [...YUANWU_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), YUANWU_TUNE_BREAK_FACT.factId],
  provenance: {
    ...YUANWU_PROVENANCE,
    notes: [
      ...YUANWU_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Yuanwu rotation/DPS adapter, coordinated-attack uptime or shared Tune Break damage formula is implied.',
    ],
  },
};

export const FIFTH_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  YOUHU_CHARACTER_MECHANICS_PROFILE,
  YUANWU_CHARACTER_MECHANICS_PROFILE,
] as const;
