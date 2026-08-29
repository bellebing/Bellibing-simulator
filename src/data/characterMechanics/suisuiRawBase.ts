import type {
  CharacterActionFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-29';
const STALE_UPSTREAM = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
export const SUISUI_PROVENANCE = {
  sourceLabels: [
    'Wuthering Waves official Steam announcement — Version 3.5 released Suisui identity',
    'Wuthering.gg — current Suisui English kit and Tune Break',
    'BWIKI/Biligame — current Suisui post-update Lv1-Lv10 tables',
    'wuwabuild normalized Character snapshot — stale discrepancy evidence only',
  ],
  sourceUrls: [
    'https://steamcommunity.com/app/3513350/announcements/',
    'https://wuthering.gg/characters/suisui',
    'https://wiki.biligame.com/wutheringwaves/%E5%85%B1%E9%B8%A3%E8%80%85/%E7%A9%97%E7%A9%97',
    STALE_UPSTREAM,
  ],
  checkedAt: CHECKED_AT,
  notes: [
    'Released identity is explicitly Suisui (Glacio/Rectifier) in the Version 3.5 official announcement and current Wuthering.gg/BWIKI. Current source record identity is 1110.',
    'The pinned normalized upstream record is stale/misaligned on multiple live fields: it says Rectifier at the Character identity but Tune Break: Gauntlets and retains pre-update multiplier rows. Those fields are rejected rather than reconciled by inference.',
    'Current BWIKI post-update tables are used for exact Lv1-Lv10 values; Wuthering.gg independently confirms current English Zephyr/Drizzle nomenclature, weapon, resources, Inherents, Outro and S1-S6.',
    'Generated PR #66/#68 artifacts remain transcription aids only. Canonical semantics and corrected post-update values are independently source-reviewed here.',
  ],
} as const;

export const CURVE_CONTEXT = 'Exact current post-update Lv1-Lv10 coefficient representation from BWIKI, current English action identity cross-checked against Wuthering.gg; no skill level is implicitly selected.';

export function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'provenance' | 'motionValue' | 'modelingStatus'> & { modelingStatus?: CharacterActionFact['modelingStatus'] }): CharacterActionFact {
  const { modelingStatus = 'MODEL_READY', ...rest } = input;
  return { ...rest, characterId: 'suisui', kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus, motionValue: null, provenance: SUISUI_PROVENANCE };
}
export function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: 'suisui', kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: SUISUI_PROVENANCE };
}
export function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: 'suisui', kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: SUISUI_PROVENANCE };
}
export function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: 'suisui', kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: SUISUI_PROVENANCE };
}
