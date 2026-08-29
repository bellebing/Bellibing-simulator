import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import { MORNYE_CHARACTER_MECHANIC_FACTS, MORNYE_PROVENANCE } from './mornyeRawFacts.ts';
import { PHROLOVA_CHARACTER_MECHANIC_FACTS, PHROLOVA_PROVENANCE } from './phrolovaRawFacts.ts';
import { QIUYUAN_CHARACTER_MECHANIC_FACTS, QIUYUAN_PROVENANCE } from './qiuyuanRawFacts.ts';
import { SANHUA_CHARACTER_MECHANIC_FACTS, SANHUA_PROVENANCE } from './sanhuaRawFacts.ts';
import { SIGRIKA_CHARACTER_MECHANIC_FACTS, SIGRIKA_PROVENANCE } from './sigrikaRawFacts.ts';
import {
  MORNYE_TUNE_BREAK_FACT,
  PHROLOVA_TUNE_BREAK_FACT,
  QIUYUAN_TUNE_BREAK_FACT,
  SANHUA_TUNE_BREAK_FACT,
  SIGRIKA_TUNE_BREAK_FACT,
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

function notes<T extends { notes: readonly string[] }>(provenance: T): readonly string[] {
  return [
    ...provenance.notes,
    'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
    'ECHO and TUNE_RUPTURE are source-facing Character damage classifications only. This promotion does not add Echo/Sonata execution, Tune Rupture combat-system math, rotations or DPS adapters.',
    'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no shared Tune Break damage formula is implied.',
  ];
}

export const SANHUA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'sanhua',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Frigid Light, Eternal Frost, Glacial Gaze, Freezing Thorns and Forte damage retain exact Lv1-Lv10 structures. Heavy Attack Detonate remains Heavy Attack DMG while Ice Thorn/Prism/Glacier Burst remain Resonance Skill DMG. Tune Break stays shared-system damage.',
    'Clarity/Frostbite/Detonate and Ice creation rules are source-audited. Current sources agree S2 Snowy Clarity anti-interruption lasts 10s; the stale pinned 5s parameter remains discrepancy provenance only.',
    'Condensation and Avalanche are source-audited with their 8s Skill/Ice Burst damage windows.',
    'Silversnow grants the incoming character 38% Basic Attack DMG Deepen for 14s or until switched out.',
    'Clarity max 2 plus current gain/removal rules are explicit.',
  ),
  factIds: [...SANHUA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), SANHUA_TUNE_BREAK_FACT.factId],
  provenance: { ...SANHUA_PROVENANCE, notes: notes(SANHUA_PROVENANCE) },
};

export const QIUYUAN_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'qiuyuan',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Basic/Heavy/Mid-air/Dodge, Skill, Liberation, Intro and Forte actions retain exact source structures. Through the Groves/Undaunted Wayfarer/Sundering Strike and fixed Outro damage use source-explicit Echo Skill DMG classification; the Inksplash Heavy chain remains Heavy Attack DMG despite also counting as performing Echo Skill.',
    "Swordster's Soliloquy, Bamboo's Shade and Inksplash of Mind state/gauge rules are source-audited without assuming Echo-cast cadence or buff uptime.",
    'Quietude Within and Drink Away Woes Age-Old are source-audited; Flowing Panacea remains a raw trigger/state mechanic.',
    'Strike Before Ready keeps fixed 100% ATK Echo Skill DMG separate from its 50% Echo Skill DMG Amplification for the incoming Resonator.',
    "Swordster's Soliloquy max 600 with current 100/400 gain rules, Inksplash suppression and clear behavior is explicit.",
  ),
  factIds: [...QIUYUAN_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), QIUYUAN_TUNE_BREAK_FACT.factId],
  provenance: { ...QIUYUAN_PROVENANCE, notes: notes(QIUYUAN_PROVENANCE) },
};

export const SIGRIKA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'sigrika',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Normal attacks preserve ordinary buckets while Elucidated/Decipher, BIG BOOMY BOOM!, Soliskin to the Aid, Liberation and Runic/Forte specials retain source-explicit Echo Skill DMG classification. Fixed 795% ATK Outro damage remains separate.',
    'Decipher plus Rune/Full Stop/Soliskin Vitality/Innate Gift state transitions are source-audited without fabricated execution order.',
    'True Names Invoked and True Names Aligned are source-audited; Convergent/Blessing semantics remain raw state/effect rules.',
    'In This Very Moment keeps source-fixed 795% ATK Outro damage separate from the 2-stack / 30s Encapsulated target-control state.',
    'Rune max 4, Full Stop max 100, Soliskin Vitality max 60 and Innate Gift max 2 with current source rules are explicit.',
  ),
  factIds: [...SIGRIKA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), SIGRIKA_TUNE_BREAK_FACT.factId],
  provenance: { ...SIGRIKA_PROVENANCE, notes: notes(SIGRIKA_PROVENANCE) },
};

export const PHROLOVA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'phrolova',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Movement/Skill/Liberation/Intro/Forte actions retain exact source structures. Scarlet Coda remains Heavy ownership but Resonance Skill DMG; Hecate Basic/Enhanced attacks are source-explicit Echo Skill DMG. The per-Aftersound Scarlet Coda multiplier is not fabricated as standalone ACTION damage.',
    'Aftersound/Volatile Note, Compose/Resolving Chord/Maestro and Hecate ownership-attribution semantics are source-audited without assumed uptime.',
    'Accidental and Octet are source-audited; Echo Skill cast protection/Cadenza and Aftersound Crit. DMG remain raw state semantics.',
    'Unfinished Piece is source-audited as incoming 20% Havoc + 25% Heavy Attack DMG Amplification for 14s, with Maestro/Hecate follow-up state kept separate.',
    'Aftersound max 24 and Volatile Note max 6 with current source generation/clear rules are explicit.',
  ),
  factIds: [...PHROLOVA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), PHROLOVA_TUNE_BREAK_FACT.factId],
  provenance: { ...PHROLOVA_PROVENANCE, notes: notes(PHROLOVA_PROVENANCE) },
};

export const MORNYE_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'mornye',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Ground/Wide Field Basics, Skill, Liberation, Intro and Forte actions retain exact source structures. Geopotential Shift/Inversion are Heavy Attack DMG, Syntony Field is Resonance Liberation DMG and Particle Jet is source-explicit Tune Rupture DMG.',
    'Wide Field Observation, Syntony Field, Observation/Interfered/Visual markers and mode transitions are source-audited without assuming trigger cadence.',
    'Blueprint and Boundedness are source-audited; healing/protection tables remain utility semantics instead of false damage actions.',
    'Recursion grants 25% All DMG Amplification to the team for 30s.',
    'Rest Mass Energy max 100 and Relative Momentum max 100 with current source gain/consume/mode rules are explicit.',
  ),
  factIds: [...MORNYE_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), MORNYE_TUNE_BREAK_FACT.factId],
  provenance: { ...MORNYE_PROVENANCE, notes: notes(MORNYE_PROVENANCE) },
};

export const ELEVENTH_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  SANHUA_CHARACTER_MECHANICS_PROFILE,
  QIUYUAN_CHARACTER_MECHANICS_PROFILE,
  SIGRIKA_CHARACTER_MECHANICS_PROFILE,
  PHROLOVA_CHARACTER_MECHANICS_PROFILE,
  MORNYE_CHARACTER_MECHANICS_PROFILE,
] as const;
