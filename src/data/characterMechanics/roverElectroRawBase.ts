import type {
  CharacterActionFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-29';
export const ROVER_ELECTRO_PROVENANCE = {
  sourceLabels: [
    'BWIKI/Biligame — current Rover (Electro) live Lv1-Lv10 tables and kit semantics',
    'Wuthering.gg — current Rover (Electro) English kit',
    'Wuthering Waves official Steam announcement — Version 3.5 released identity',
  ],
  sourceUrls: [
    'https://wiki.biligame.com/wutheringwaves/%E5%85%B1%E9%B8%A3%E8%80%85/%E6%BC%82%E6%B3%8A%E8%80%85%C2%B7%E5%AF%BC%E7%94%B5',
    'https://wuthering.gg/characters/rover-electro',
    'https://steamcommunity.com/app/3513350/announcements/',
  ],
  checkedAt: CHECKED_AT,
  notes: [
    'Rover (Electro) is independently reconstructed from current live sources. The corrupted/misaligned PR #66/#68 review slice is retained only as rejected artifact evidence and contributes no canonical semantic decisions.',
    'Current source identity is Rover: Electro, released in Version 3.5; the normalized upstream candidate identified source record 1508, but exact current action tables and semantics are taken from current BWIKI/Wuthering.gg instead of the damaged candidate slice.',
    'BWIKI current page was updated 2026-08-05 and supplies exact Lv1-Lv10 values; Wuthering.gg independently confirms current English action names, resource rules, Inherents, Outro, S1-S6 and Tune Break identity.',
    'Cross-attribute Thrum of All Sounds forms are explicitly Spectro/Havoc/Aero in current source while remaining Resonance Skill actions. Their non-Electro attribute is preserved in fact notes and left PENDING_INTERPRETATION until an attribute-aware combat adapter exists.',
  ],
} as const;

export const CURVE_CONTEXT = 'Exact current-source Lv1-Lv10 coefficient representation from the 2026-08-05 BWIKI live table, English action identity cross-checked against current Wuthering.gg; no skill level is implicitly selected.';

export function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'provenance' | 'motionValue' | 'modelingStatus'> & { modelingStatus?: CharacterActionFact['modelingStatus'] }): CharacterActionFact {
  const { modelingStatus = 'MODEL_READY', ...rest } = input;
  return { ...rest, characterId: 'rover-electro', kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus, motionValue: null, provenance: ROVER_ELECTRO_PROVENANCE };
}
export function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: 'rover-electro', kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: ROVER_ELECTRO_PROVENANCE };
}
export function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: 'rover-electro', kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ROVER_ELECTRO_PROVENANCE };
}
export function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: 'rover-electro', kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ROVER_ELECTRO_PROVENANCE };
}
