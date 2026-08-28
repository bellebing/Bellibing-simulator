import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import { CAMELLYA_CHARACTER_MECHANIC_FACTS, CAMELLYA_PROVENANCE } from './camellyaRawFacts.ts';
import { CARLOTTA_CHARACTER_MECHANIC_FACTS, CARLOTTA_PROVENANCE } from './carlottaRawFacts.ts';
import { CAMELLYA_TUNE_BREAK_FACT, CARLOTTA_TUNE_BREAK_FACT } from './tuneBreakFacts.ts';

function coverage(actionNotes: string, forteNotes: string, inherentNotes: string, outroNotes: string, resourceNotes: string): CharacterMechanicsProfile['coverage'] {
  return [
    { area: 'ACTIONS', status: 'VERIFIED', notes: actionNotes },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: forteNotes },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: inherentNotes },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: outroNotes },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: resourceNotes },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; sequence execution and proportional/fixed follow-up damage remain separate from source coverage.' },
  ];
}

export const CAMELLYA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'camellya',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Burgeoning, Blossom-mode replacements, Fervor Efflorescent, Everblooming and Ephemeral carry exact current Lv1-Lv10 representations. Seedbed explicitly moves Pruning into the Basic Attack DMG bucket. Twining uses separate source-fixed base and post-Ephemeral damage facts. Tune Break: Sword stays shared-system damage.',
    'Crimson Pistils/Buds, Blossom Mode, Ephemeral and Budding Mode/Sweet Dream state/consume semantics are source-audited without assumed bud count, Concerto timing or rotation uptime.',
    'Seedbed and Epiphyte are source-audited, including Pruning damage-bucket conversion and interruption-resistance semantics.',
    'Twining base 329.24% ATK and the next post-Ephemeral additional 459.02% ATK instance are source-audited as separate source-fixed Outro facts.',
    'Crimson Pistils max 100 and Crimson Buds max 10 / 15s with current gain/consume rules are source-audited.',
  ),
  factIds: [...CAMELLYA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), CAMELLYA_TUNE_BREAK_FACT.factId],
  provenance: {
    ...CAMELLYA_PROVENANCE,
    notes: [
      ...CAMELLYA_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Camellya rotation/DPS adapter, Budding-mode state engine or shared Tune Break damage formula is implied.',
    ],
  },
};

export const CARLOTTA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'carlotta',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Silent Execution/Necessary Measures, ordinary Heavy/Containment Tactics, Art of Violence/Chromatic Splendor, Era of New Wave/Death Knell/Fatal Finale, Wintertime Aria and Imminent Oblivion carry exact current Lv1-Lv10 representations with explicit Basic/Heavy/Skill buckets. Closing Remark is source-fixed Outro damage. Tune Break: Pistols stays shared-system damage.',
    'Substance/Moldable Crystal/Meta Vector, Dispersion, Deconstruction, Twilight Tango and Final Bow semantics are source-audited without assumed stack generation, debuff uptime or Liberation cadence.',
    'Flawless Purity and Ars Gratia Artis are source-audited, including the post-Chromatic mid-air protection and Deconstruction application list.',
    'Closing Remark is source-audited as source-fixed 794.2% ATK Outro damage; S3 Kaleidoscope Sparks remains sequence semantics rather than mutating the base Outro fact.',
    'Substance max 120, Moldable Crystal max 6 / 10s and Meta Vector max 4 with current gain/consume gates are source-audited.',
  ),
  factIds: [...CARLOTTA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), CARLOTTA_TUNE_BREAK_FACT.factId],
  provenance: {
    ...CARLOTTA_PROVENANCE,
    notes: [
      ...CARLOTTA_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Carlotta rotation/DPS adapter, Twilight Tango execution engine or shared Tune Break damage formula is implied.',
    ],
  },
};

export const SEVENTH_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  CAMELLYA_CHARACTER_MECHANICS_PROFILE,
  CARLOTTA_CHARACTER_MECHANICS_PROFILE,
] as const;
