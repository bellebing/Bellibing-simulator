import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import { ROCCIA_CHARACTER_MECHANIC_FACTS, ROCCIA_PROVENANCE } from './rocciaRawFacts.ts';
import { ZHEZHI_CHARACTER_MECHANIC_FACTS, ZHEZHI_PROVENANCE } from './zhezhiRawFacts.ts';
import { ROCCIA_TUNE_BREAK_FACT, ZHEZHI_TUNE_BREAK_FACT } from './tuneBreakFacts.ts';

function coverage(actionNotes: string, forteNotes: string, inherentNotes: string, outroNotes: string, resourceNotes: string): CharacterMechanicsProfile['coverage'] {
  return [
    { area: 'ACTIONS', status: 'VERIFIED', notes: actionNotes },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: forteNotes },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: inherentNotes },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: outroNotes },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: resourceNotes },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; sequence execution and proportional follow-up damage remain separate from source coverage.' },
  ];
}

export const ROCCIA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'roccia',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Pero, Easy; Acrobatic Trick; Commedia Improvviso!; Pero, Help; and Real Fantasy carry exact current Lv1-Lv10 representations. Liberation and Real Fantasy preserve their explicit Heavy Attack DMG buckets. Tune Break: Gauntlets stays shared-system damage.',
    'Imagination max/gain/consume rules, Beyond Imagination entry/exit and Real Fantasy re-launch semantics are source-audited without assumed airtime or rotation cadence.',
    'Immersive Performance and Super Attractive Magic Box are source-audited. Magic Box remains Echo Skill / Utility DMG raw semantics rather than fabricated Character motion-value data.',
    'Applause, Please! 20% Havoc DMG Amplification + 25% Basic Attack DMG Amplification for 14s / until switch-out is source-audited.',
    'Imagination max 300, 100-cost Real Fantasy and the source-listed 100-point Skill/Intro restoration are source-audited.',
  ),
  factIds: [...ROCCIA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), ROCCIA_TUNE_BREAK_FACT.factId],
  provenance: {
    ...ROCCIA_PROVENANCE,
    notes: [
      ...ROCCIA_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Roccia rotation/DPS adapter, Magic Box combat adapter or shared Tune Break damage formula is implied.',
    ],
  },
};

export const ZHEZHI_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'zhezhi',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Dimming Brush, Manifestation, Inklit Spirit, Radiant Ruin, Conjuration, Stroke of Genius and Creation’s Zenith carry exact current Lv1-Lv10 representations. Coordinated Inklit Spirit triggering remains separate from its Basic Attack DMG bucket. Tune Break: Rectifier stays shared-system damage.',
    'Afflatus consumption, typed Phantasmic Imprints, Painter’s Delight, Stroke/Creation replacement and Living Canvas trigger/cap semantics are source-audited without assumed placement, teleport or coordinated-attack uptime.',
    'Calligrapher’s Touch and Flourish are source-audited; Flourish remains incoming-Resonator Resonance Energy utility.',
    'Carve and Draw 20% Glacio DMG Amplification + 25% Resonance Skill DMG Amplification for 14s / until switch-out is source-audited.',
    'Afflatus max 90 and Painter’s Delight max 2 with current gain/consume rules are source-audited. Phantasmic Imprints retain their one-each Left/Middle/Right 15s state rules.',
  ),
  factIds: [...ZHEZHI_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), ZHEZHI_TUNE_BREAK_FACT.factId],
  provenance: {
    ...ZHEZHI_PROVENANCE,
    notes: [
      ...ZHEZHI_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Zhezhi rotation/DPS adapter, imprint/Coordinated uptime or shared Tune Break damage formula is implied.',
    ],
  },
};

export const SIXTH_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  ROCCIA_CHARACTER_MECHANICS_PROFILE,
  ZHEZHI_CHARACTER_MECHANICS_PROFILE,
] as const;
