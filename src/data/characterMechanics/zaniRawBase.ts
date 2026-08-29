import type {
  CharacterActionFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-29';
export const ZANI_PROVENANCE = {
  sourceLabels: ["wuwabuild normalized Character snapshot — exact pinned upstream commit", "Wuthering.gg — current Zani kit", "Prydwen — current Zani kit", "Wutheringlab — current Zani kit"],
  sourceUrls: ["https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json", "https://wuthering.gg/characters/zani", "https://www.prydwen.gg/wuthering-waves/characters/zani", "https://wutheringlab.com/character/zani-build/"],
  checkedAt: CHECKED_AT,
  notes: [
    'Exact Lv1-Lv10 tabular structures come from the pinned current-source promotion-review artifact; current source kit text was independently reviewed for action ownership, damage classification, resources, Forte state, Inherents, Outro and S1-S6.',
    'Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this source/semantic review; no generated candidate status was promoted automatically.',
  ],
} as const;

export const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';
export const FIXED_CONTEXT = 'Exact source-fixed Character damage coefficient declared directly by current kit text without fabricating a talent-level coefficient curve.';

export function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'provenance' | 'motionValue' | 'modelingStatus'> & { modelingStatus?: CharacterActionFact['modelingStatus'] }): CharacterActionFact {
  const { modelingStatus = 'MODEL_READY', ...rest } = input;
  return { ...rest, characterId: "zani", kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus, motionValue: null, provenance: ZANI_PROVENANCE };
}
export function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: "zani", kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: ZANI_PROVENANCE };
}
export function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: "zani", kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ZANI_PROVENANCE };
}
export function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: "zani", kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ZANI_PROVENANCE };
}
