import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import { CANTARELLA_CHARACTER_MECHANIC_FACTS, CANTARELLA_PROVENANCE } from './cantarellaRawFacts.ts';
import { CARTETHYIA_CHARACTER_MECHANIC_FACTS, CARTETHYIA_PROVENANCE } from './cartethyiaRawFacts.ts';
import { LUCILLA_CHARACTER_MECHANIC_FACTS, LUCILLA_PROVENANCE } from './lucillaRawFacts.ts';
import { GALBRENA_CHARACTER_MECHANIC_FACTS, GALBRENA_PROVENANCE } from './galbrenaRawFacts.ts';
import { LYNAE_CHARACTER_MECHANIC_FACTS, LYNAE_PROVENANCE } from './lynaeRawFacts.ts';
import {
  CANTARELLA_TUNE_BREAK_FACT,
  CARTETHYIA_TUNE_BREAK_FACT,
  LUCILLA_TUNE_BREAK_FACT,
  GALBRENA_TUNE_BREAK_FACT,
  LYNAE_TUNE_BREAK_FACT,
} from './tuneBreakFacts.ts';

function coverage(actionNotes: string, forteNotes: string, inherentNotes: string, outroNotes: string, resourceNotes: string): CharacterMechanicsProfile['coverage'] {
  return [
    { area: 'ACTIONS', status: 'VERIFIED', notes: actionNotes },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: forteNotes },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: inherentNotes },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: outroNotes },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: resourceNotes },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw source text and numeric parameter payloads are source-audited; unresolved placeholder position is preserved rather than guessed.' },
  ];
}
function notes<T extends { notes: readonly string[] }>(provenance: T): readonly string[] {
  return [...provenance.notes,
    'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
    'AERO_EROSION, ECHO and TUNE_RUPTURE are source-facing Character damage classifications only. This promotion does not add negative-status, Echo/Sonata, Tune Rupture or broad DPS execution.',
    'sourceFixedFlatDamage is a raw literal-damage representation and must not be interpreted as an ATK coefficient.',
    'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no shared Tune Break damage formula is implied.'];
}

export const CANTARELLA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "cantarella",
  verificationStatus: 'VERIFIED',
  coverage: coverage("Illusion Collapse, Dance with Shadows, Beneath the Sea, Cruise and Forte actions retain exact Lv1-Lv10 representations. Echo Skill cast identity on Flickering Reverie/Flowing Suffocation/Perception Drain stays separate from their source damage buckets; Diffusion and Tidal Surge coordinated behavior is explicit.", "Trance/Shiver, Mirage, Hazy Dream, Perception Drain and Abyssal Rebirth state transitions are source-audited without assumed trigger cadence.", "Cure and Poison are source-audited; healing remains utility semantics outside Character damage fields.", "Gentle Tentacles grants incoming 20% Havoc and 25% Resonance Skill DMG Amplification for 14s or until switch.", "Trance max 5 and Shiver max 3 plus current gain/consume rules are explicit."),
  factIds: [...CANTARELLA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), CANTARELLA_TUNE_BREAK_FACT.factId],
  provenance: { ...CANTARELLA_PROVENANCE, notes: notes(CANTARELLA_PROVENANCE) },
};

export const CARTETHYIA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "cartethyia",
  verificationStatus: 'VERIFIED',
  coverage: coverage("All source Character damage retains exact HP-scaling Lv1-Lv10 structures. Cartethyia Heavy/Skill overrides remain Basic Attack DMG, while the four Cartethyia Mid-air forms use source-explicit AERO_EROSION taxonomy; Fleurdelys action buckets remain separate.", "Conviction, Sword Shadows, Manifest/Fleurdelys and raw Aero Erosion trigger/consume interactions are source-audited without implementing negative-status combat math.", "A Heart’s Truest Wishes and Wind’s Indelible Imprint are source-audited; status-stack execution stays raw/pending.", "Windward preserves the 17.5% Aero amplification against Negative Status targets for 20s.", "Conviction max 120 and the three distinct Sword Shadows (one each / 20s) are explicit."),
  factIds: [...CARTETHYIA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), CARTETHYIA_TUNE_BREAK_FACT.factId],
  provenance: { ...CARTETHYIA_PROVENANCE, notes: notes(CARTETHYIA_PROVENANCE) },
};

export const LUCILLA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "lucilla",
  verificationStatus: 'VERIFIED',
  coverage: coverage("Snapshot/Phantom Frame/Clip It and Reminiscence actions retain exact source curves. Clear As Day, Letting It Go and Oblivion each have explicit Glacio-Chafe BASIC and Echo ECHO mode variants sharing the same source coefficient rather than one coerced damageClass.", "Trace/Photos, Reminiscence, Déjà Vu, Film Roll/Zoom and Focus Ring state rules are source-audited without assumed mode uptime.", "Slow Motion and Remembrance are source-audited with separate Glacio-Chafe/Echo branches.", "Montage preserves its mode-dependent 60% Glacio Chafe branch versus 50% Echo Skill amplification branch and their distinct termination rules.", "Trace max 150, Photos max 3, Film Roll max 10 with Remembrance, and Zoom max 4 with Remembrance are explicit."),
  factIds: [...LUCILLA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), LUCILLA_TUNE_BREAK_FACT.factId],
  provenance: { ...LUCILLA_PROVENANCE, notes: notes(LUCILLA_PROVENANCE) },
};

export const GALBRENA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "galbrena",
  verificationStatus: 'VERIFIED',
  coverage: coverage("Slayer’s Trigger, Edge Transcended, Hellfire Absolution, Hellflare Overload, Ashen Pursuit and Demon replacement actions retain exact source structures. Heavy-versus-Echo overrides are explicit; Hellstride is literal fixed 666 flat damage, Basic Attack DMG and unaffected by DMG buffs.", "Afterflame/Sinflame/Purging Flame and Threshold/Demon Hypostasis transitions are source-audited without assuming resource cadence or state uptime.", "Oathbound Hunt and Sin Feaster are source-audited; Fated End and stamina restoration stay raw state semantics.", "Ashen Pursuit retains its exact Lv1-Lv10 source component representation as the Character-owned Outro damage action.", "Afterflame max 40, Sinflame max 100 and Purging Flame/Demon depletion rules are explicit."),
  factIds: [...GALBRENA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), GALBRENA_TUNE_BREAK_FACT.factId],
  provenance: { ...GALBRENA_PROVENANCE, notes: notes(GALBRENA_PROVENANCE) },
};

export const LYNAE_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: "lynae",
  verificationStatus: 'VERIFIED',
  coverage: coverage("Chroma Drift, Kaleidoscopic Parade, Skill, Liberation, Intro and Forte actions retain exact source structures. Ground Heavy/Graffiti/Mid-air Heavy stay Basic Attack DMG; Spectral Analysis is represented once as TUNE_RUPTURE/TUNE_AMP, and fixed 100% ATK Outro damage is separate.", "Overflow/Lumiflow/True Color, Resonance Mode and Tune Rupture/Tune Strain shifting state rules are source-audited without implementing shared status formulas.", "Colors Never Fade and Adaptive Optics are source-audited; Spray Paint/Optic Camo execution remains raw where appropriate.", "Let’s Hit the Road keeps fixed 100% ATK Outro damage separate from 15% All DMG + 25% Liberation DMG Amplification for 14s/until switch.", "Overflow max 120, Lumiflow max 120 and True Color max 3 with the Visual Impact 40 Tune Break Boost grant are explicit."),
  factIds: [...LYNAE_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), LYNAE_TUNE_BREAK_FACT.factId],
  provenance: { ...LYNAE_PROVENANCE, notes: notes(LYNAE_PROVENANCE) },
};

export const TWELFTH_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  CANTARELLA_CHARACTER_MECHANICS_PROFILE,
  CARTETHYIA_CHARACTER_MECHANICS_PROFILE,
  LUCILLA_CHARACTER_MECHANICS_PROFILE,
  GALBRENA_CHARACTER_MECHANICS_PROFILE,
  LYNAE_CHARACTER_MECHANICS_PROFILE,
] as const;
