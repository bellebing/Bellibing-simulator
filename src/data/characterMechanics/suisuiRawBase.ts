import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterMotionValueCurve,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-29';
const PINNED_CANDIDATE = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';

export const SUISUI_PROVENANCE = {
  sourceLabels: [
    'BWIKI — current Suisui exact Lv1-Lv10 combat tables',
    'Prydwen — current Suisui English kit semantics',
    'Wuthering.gg — current Suisui kit cross-check',
    'Wutheringlab — current Suisui/Tune Break cross-check',
    'wuwabuild normalized Character snapshot — stale candidate retained as discrepancy evidence',
  ],
  sourceUrls: [
    'https://wiki.biligame.com/wutheringwaves/共鸣者/穗穗',
    'https://www.prydwen.gg/wuthering-waves/characters/suisui',
    'https://wuthering.gg/characters/suisui',
    'https://wutheringlab.com/character/suisui-build/',
    PINNED_CANDIDATE,
  ],
  checkedAt: CHECKED_AT,
  notes: [
    'Current BWIKI tables replace stale/misaligned PR #66/#68 candidate numerics for Suisui; the candidate is discrepancy provenance only and is not promoted.',
    'Current English sources independently confirm Zephyr/Drizzle/Lambent Gold nomenclature and Tune Break: Rectifier.',
    'The stale candidate Mid-air Zephyr value 45.65% is rejected in favor of the current independently visible 35.57% Lv1 through 70.72% Lv10 table.',
    'Generated candidates remain CANDIDATE_ONLY / NOT_VERIFIED inputs and are never automatic canonical truth.',
  ],
} as const;

export const SUISUI_CURVE_CONTEXT = 'Exact current BWIKI Lv1-Lv10 source table cross-checked against current English kit semantics; no skill level is implicitly selected.';
export function curve(...values: CharacterMotionValueCurve): CharacterMotionValueCurve { return values; }

export function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: 'suisui', kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: SUISUI_PROVENANCE };
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

export type { CharacterMechanicFact };
