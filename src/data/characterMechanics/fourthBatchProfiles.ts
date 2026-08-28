import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import { CALCHARO_CHARACTER_MECHANIC_FACTS, CALCHARO_PROVENANCE } from './calcharoRawFacts.ts';
import { LINGYANG_CHARACTER_MECHANIC_FACTS, LINGYANG_PROVENANCE } from './lingyangRawFacts.ts';
import { YINLIN_CHARACTER_MECHANIC_FACTS, YINLIN_PROVENANCE } from './yinlinRawFacts.ts';
import { CALCHARO_TUNE_BREAK_FACT, LINGYANG_TUNE_BREAK_FACT, YINLIN_TUNE_BREAK_FACT } from './tuneBreakFacts.ts';

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

export const YINLIN_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'yinlin',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Zapstring, Skill, Liberation, Intro, Chameleon Cipher and Judgment Strike carry exact current Lv1-Lv10 representations; Judgment Strike keeps coordinated triggering separate from its explicit Resonance Skill DMG bucket. Tune Break: Rectifier stays shared-system damage.',
    "Judgment Points, Execution Mode, Sinner's Mark/Punishment Mark conversion and once-per-second Judgment Strike trigger semantics are source-audited without guessed uptime.",
    'Pain Immersion and Deadly Focus are source-audited.',
    'Strategist 20% Electro + 25% Resonance Liberation DMG Amplification / 14s / switch-out termination is source-audited.',
    'Judgment Points max 100 and current source-listed gain/full-consume rules are source-audited.',
  ),
  factIds: [...YINLIN_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), YINLIN_TUNE_BREAK_FACT.factId],
  provenance: { ...YINLIN_PROVENANCE, notes: [...YINLIN_PROVENANCE.notes, 'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.', 'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Yinlin rotation/DPS adapter or shared Tune Break damage formula is implied.'] },
};

export const LINGYANG_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'lingyang',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Majestic Fists, Ancient Arts, Strive, Intro and all Striding Lion attacks carry exact current Lv1-Lv10 representations; Frosty Marks uses its source-fixed 587.94% ATK representation. Tune Break: Gauntlets stays shared-system damage.',
    "Lion's Spirit, Striding Lion replacements/consumption and Lion's Vigor extension semantics are source-audited without inventing state uptime.",
    "Lion's Pride and Diligent Practice are source-audited.",
    'Frosty Marks fixed Outro damage is source-audited; no skill-level curve is fabricated.',
    "Lion's Spirit max 100, source-listed restoration and continuous Striding Lion consumption are source-audited.",
  ),
  factIds: [...LINGYANG_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), LINGYANG_TUNE_BREAK_FACT.factId],
  provenance: { ...LINGYANG_PROVENANCE, notes: [...LINGYANG_PROVENANCE.notes, 'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.', 'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Lingyang rotation/DPS adapter or shared Tune Break damage formula is implied.'] },
};

export const CALCHARO_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'calcharo',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Gnawing Fangs, Extermination Order, Phantom Etching/Deathblade replacements, Intro, Mercy and Death Messenger carry exact current Lv1-Lv10 representations; Shadowy Raid preserves its two source-fixed coefficients. Tune Break: Broadblade stays shared-system damage.',
    'Cruelty/Killing Intent, Mercy/Death Messenger consumes and Deathblade Gear replacement buckets are source-audited without an assumed rotation.',
    'Bloodshed Awaken and Revenant Rush are source-audited.',
    'Shadowy Raid is source-audited as fixed 195.98% + 391.96% ATK Outro damage with both source components preserved separately.',
    'Cruelty max 3 and Killing Intent max 5 with source-listed acquisition/consume rules are source-audited.',
  ),
  factIds: [...CALCHARO_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), CALCHARO_TUNE_BREAK_FACT.factId],
  provenance: { ...CALCHARO_PROVENANCE, notes: [...CALCHARO_PROVENANCE.notes, 'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas. Wanted Outlaw/Wanted Criminal remains an explicit source nomenclature discrepancy rather than an invented reconciliation.', 'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Calcharo rotation/DPS adapter or shared Tune Break damage formula is implied.'] },
};

export const FOURTH_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [YINLIN_CHARACTER_MECHANICS_PROFILE, LINGYANG_CHARACTER_MECHANICS_PROFILE, CALCHARO_CHARACTER_MECHANICS_PROFILE] as const;
