import type {
  CharacterActionFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-29';
export const LUCY_PROVENANCE = {
  sourceLabels: ["wuwabuild normalized Character snapshot — exact pinned upstream commit", "Wuthering.gg — current Lucy kit", "Prydwen — current Lucy kit/Tune Break", "Wutheringlab — current Lucy kit/Tune Break"],
  sourceUrls: ["https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json", "https://wuthering.gg/characters/lucy", "https://www.prydwen.gg/wuthering-waves/characters/lucy", "https://wutheringlab.com/character/lucy-build/"],
  checkedAt: CHECKED_AT,
  notes: [
    'Exact Lv1-Lv10 tabular structures come from the pinned current-source promotion-review artifact; current source kit text was independently reviewed for action ownership, damage classification, resources, Forte state, Inherents, Outro and S1-S6.',
    'Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this source/semantic review; no generated candidate status was promoted automatically.',
  ],
} as const;

export const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';

export function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'provenance' | 'motionValue' | 'modelingStatus'> & { modelingStatus?: CharacterActionFact['modelingStatus'] }): CharacterActionFact {
  const { modelingStatus = 'MODEL_READY', ...rest } = input;
  return { ...rest, characterId: "lucy", kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus, motionValue: null, provenance: LUCY_PROVENANCE };
}
export function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: "lucy", kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: LUCY_PROVENANCE };
}
export function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: "lucy", kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: LUCY_PROVENANCE };
}
export function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: "lucy", kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: LUCY_PROVENANCE };
}
