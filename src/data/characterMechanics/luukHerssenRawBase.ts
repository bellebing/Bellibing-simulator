import type {
  CharacterActionFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-29';
export const LUUK_HERSSEN_PROVENANCE = {
  sourceLabels: ["wuwabuild normalized Character snapshot — exact pinned upstream commit", "Wuthering.gg — current Luuk Herssen kit", "Prydwen — current Luuk Herssen kit", "Wutheringlab — current Luuk Herssen kit"],
  sourceUrls: ["https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json", "https://wuthering.gg/characters/luuk-herssen", "https://www.prydwen.gg/wuthering-waves/characters/luuk-herssen", "https://wutheringlab.com/character/luuk-herssen-build/"],
  checkedAt: CHECKED_AT,
  notes: [
    'Exact Lv1-Lv10 tabular structures come from the pinned current-source promotion-review artifact; current source kit text was independently reviewed for action ownership, damage classification, resources, Forte state, Inherents, Outro and S1-S6.',
    'Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this source/semantic review; no generated candidate status was promoted automatically.',
  ],
} as const;

export const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';
export const FIXED_CONTEXT = 'Exact source-fixed Character damage coefficient declared directly by current kit text without fabricating a talent-level coefficient curve.';
export const FIXED_FLAT_CONTEXT = 'Exact source-fixed flat Character damage declared directly by current kit text; this is absolute damage, not an ATK coefficient or a talent-level curve.';

export function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'provenance' | 'motionValue' | 'modelingStatus'> & { modelingStatus?: CharacterActionFact['modelingStatus'] }): CharacterActionFact {
  const { modelingStatus = 'MODEL_READY', ...rest } = input;
  return { ...rest, characterId: "luuk-herssen", kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus, motionValue: null, provenance: LUUK_HERSSEN_PROVENANCE };
}
export function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: "luuk-herssen", kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: LUUK_HERSSEN_PROVENANCE };
}
export function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: "luuk-herssen", kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: LUUK_HERSSEN_PROVENANCE };
}
export function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: "luuk-herssen", kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: LUUK_HERSSEN_PROVENANCE };
}
