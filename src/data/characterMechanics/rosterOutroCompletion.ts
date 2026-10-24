import type {
  CharacterMechanicFact,
  CharacterMechanicsProfile,
  CharacterPassiveFact,
} from '../../characterMechanicsDomain.ts';
import type { ContentProvenance } from '../../contentRegistry.ts';
import { RELEASE_CHARACTER_MECHANIC_COMPLETION_FACTS } from './releaseCharacterKitFacts.ts';
import {
  BULING_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES,
  DANJIN_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES,
  XIANGLI_YAO_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES,
} from './rosterInherentPassiveCompletion.ts';

const CHECKED_AT = '2026-10-02';
const CHARACTER_SOURCE = 'https://github.com/DommyMM/wuwabuild/blob/2b57a127b26b062ab58d272cd6735338507de1cd/public/Data/Characters.json';
const TREE_SOURCE = 'https://github.com/Arikatsu/WutheringWaves_Data/blob/353f2eaed119bc9f680eab92807d20ac75a79b40/BinData/skillTree/skilltree.json';
const TEXT_SOURCE = 'https://github.com/Arikatsu/WutheringWaves_Data/blob/353f2eaed119bc9f680eab92807d20ac75a79b40/Textmaps/en/multi_text/MultiText.json';

function outroProvenance(characterName: string) {
  return {
    sourceLabels: [
      'Bellibing Skills/Forte source — pinned wuwabuild Character payload',
      'Bellibing Skills/Forte tree/text source — pinned WutheringWaves_Data payload',
    ],
    sourceUrls: [CHARACTER_SOURCE, TREE_SOURCE, TEXT_SOURCE],
    checkedAt: CHECKED_AT,
    notes: [
      `${characterName} OUTRO_EFFECT is promoted only from the source-explicit Outro Skill row already present in data/source/character-forte-ui.json. Runtime application, uptime and event scheduling remain separate from raw source verification.`,
    ],
  } as const;
}

export const BULING_OUTRO_PROVENANCE = outroProvenance('Buling');
export const DANJIN_OUTRO_PROVENANCE = outroProvenance('Danjin');
export const XIANGLI_YAO_OUTRO_PROVENANCE = outroProvenance('Xiangli Yao');

function passive(input: CharacterPassiveFact): CharacterPassiveFact {
  return input;
}

export const BULING_OUTRO_EFFECT_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'buling-outro-exorcism-spell',
    characterId: 'buling',
    kind: 'PASSIVE',
    name: 'Outro Skill — Exorcism Spell',
    section: 'OUTRO_SKILL',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: BULING_OUTRO_PROVENANCE,
    scope: 'TEAM',
    triggerSummary: 'Buling casts Outro Skill — Exorcism Spell.',
    effectSummary: "The active Resonator in the team is healed by 18% of Buling's ATK per second for 16s. All nearby Resonators in the team have their DMG Amplified by 15% for 30s.",
    durationSeconds: 30,
    maxStacks: null,
    notes: ['Source move 1004309. The source row has separate explicit 16s healing and 30s team-amplification windows; durationSeconds stores the longer umbrella window while effectSummary preserves the exact split. No refresh, stack or switch-out behavior is inferred.'],
  }),
] as const;

export const DANJIN_OUTRO_EFFECT_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'danjin-outro-duality',
    characterId: 'danjin',
    kind: 'PASSIVE',
    name: 'Outro Skill — Duality',
    section: 'OUTRO_SKILL',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: DANJIN_OUTRO_PROVENANCE,
    scope: 'NEXT_CHARACTER',
    triggerSummary: 'Danjin casts Outro Skill — Duality and the incoming Resonator takes the field.',
    effectSummary: 'The incoming Resonator has their Havoc DMG Amplified by 23% for 14s or until they are switched out.',
    durationSeconds: 14,
    maxStacks: null,
    notes: ['Source move 1000809. The 14s duration and switch-out termination are source-explicit; no refresh or stacking semantics are inferred.'],
  }),
] as const;

export const XIANGLI_YAO_OUTRO_EFFECT_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'xiangli-yao-outro-chain-rule-trigger-window',
    characterId: 'xiangli-yao',
    kind: 'PASSIVE',
    name: 'Outro Skill — Chain Rule',
    section: 'OUTRO_SKILL',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: XIANGLI_YAO_OUTRO_PROVENANCE,
    scope: 'TARGET',
    triggerSummary: "During Chain Rule's 8s window, the incoming Resonator's Basic Attack hits its first target.",
    effectSummary: "Xiangli Yao calls down a laser beam on that area, dealing Electro DMG equal to 237.63% of Xiangli Yao's ATK. The effect can trigger once every 2s, up to 3 times.",
    durationSeconds: 8,
    maxStacks: null,
    notes: [
      'Source move 1002309. The 8s duration, once-every-2s cadence and up-to-3 trigger limit are source-explicit. Up to 3 triggers is not represented as maxStacks.',
      'The Character-owned damage coefficient/classification remains represented by the pre-existing VERIFIED ACTION fact xiangli-yao-outro-chain-rule from the completed ACTIONS area; this OUTRO_EFFECT slice does not modify that fact.',
    ],
  }),
] as const;

export interface CharacterOutroEffectSourceBlocker {
  blockerId: string;
  characterId: string;
  factIds: readonly string[];
  sourceMoveIds: readonly number[];
  reason: string;
}

export const CHARACTER_OUTRO_EFFECT_SOURCE_BLOCKERS: readonly CharacterOutroEffectSourceBlocker[] = [] as const;

function withVerifiedOutroEffect(
  base: CharacterMechanicsProfile,
  newFacts: readonly CharacterMechanicFact[],
  provenance: ContentProvenance,
  notes: string,
): CharacterMechanicsProfile {
  return {
    ...base,
    coverage: base.coverage.map((entry) => entry.area === 'OUTRO_EFFECT'
      ? { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes }
      : entry),
    factIds: [...base.factIds, ...newFacts.map((fact) => fact.factId)],
    provenance: {
      ...base.provenance,
      sourceLabels: [...new Set([...base.provenance.sourceLabels, ...provenance.sourceLabels])],
      sourceUrls: [...new Set([...(base.provenance.sourceUrls ?? []), ...(provenance.sourceUrls ?? [])])],
      checkedAt: CHECKED_AT,
      notes: [
        ...(base.provenance.notes ?? []),
        'OUTRO_EFFECT completion is source-verified independently and does not promote unresolved mechanics areas or the full Character Mechanics profile.',
      ],
    },
  };
}

export const BULING_CHARACTER_MECHANICS_PROFILE_WITH_OUTRO = withVerifiedOutroEffect(
  BULING_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES,
  BULING_OUTRO_EFFECT_FACTS,
  BULING_OUTRO_PROVENANCE,
  'Exorcism Spell healing and team DMG Amplification are source-mapped with their explicit 16s/30s windows. Original release damage rows resolve the prior ACTIONS/FORTE classification blocker.',
);

export const DANJIN_CHARACTER_MECHANICS_PROFILE_WITH_OUTRO = withVerifiedOutroEffect(
  DANJIN_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES,
  DANJIN_OUTRO_EFFECT_FACTS,
  DANJIN_OUTRO_PROVENANCE,
  'Duality is source-mapped as 23% incoming-Resonator Havoc DMG Amplification for 14s or until switch-out. The owner has resolved the Ruby Blossom full-power translation as exactly 120.',
);

export const XIANGLI_YAO_CHARACTER_MECHANICS_PROFILE_WITH_OUTRO = withVerifiedOutroEffect(
  XIANGLI_YAO_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES,
  XIANGLI_YAO_OUTRO_EFFECT_FACTS,
  XIANGLI_YAO_OUTRO_PROVENANCE,
  'Chain Rule already exists as the source-VERIFIED Character-owned OUTRO ACTION from the completed ACTIONS area: exact 237.63% ATK per-trigger coefficient plus source-explicit 8s / once-per-2s / up-to-3 trigger semantics. OUTRO_EFFECT reuses that fact unchanged. Original release damage rows independently resolve Pivot — Impale as Basic DMG.',
);

export const ROSTER_OUTRO_COMPLETION_FACTS: readonly CharacterMechanicFact[] = [
  ...BULING_OUTRO_EFFECT_FACTS,
  ...DANJIN_OUTRO_EFFECT_FACTS,
  ...XIANGLI_YAO_OUTRO_EFFECT_FACTS,
] as const;

function withReleaseResourcesAndSequences(base: CharacterMechanicsProfile): CharacterMechanicsProfile {
  const facts = RELEASE_CHARACTER_MECHANIC_COMPLETION_FACTS.filter(fact => fact.characterId === base.characterId);
  const coverage: CharacterMechanicsProfile['coverage'] = base.coverage.map(entry => {
    if (entry.area === 'SEQUENCES') return { area: entry.area, status: 'VERIFIED', notes: 'All six original released chain rows, parameter substitution and conditions reviewed; RAW_ONLY.' };
    if (entry.area === 'RESOURCE_RULES') return { area: entry.area, status: 'VERIFIED', notes: base.characterId === 'danjin' ? 'Ruby Blossom cap/acquisition are source-explicit; the owner resolves full-power wording as full meter, exactly 120 consuming 120. Raw text is preserved; runtime accounting remains separate.' : 'Original released caps, gain/spend conditions and source descriptions reviewed; runtime accounting remains separate.' };
    return entry;
  });
  return {
    ...base,
    verificationStatus: coverage.every(entry => entry.status === 'VERIFIED') ? 'VERIFIED' : 'PARTIALLY_VERIFIED',
    coverage,
    factIds: [...base.factIds, ...facts.map(fact => fact.factId)],
    provenance: {
      ...base.provenance,
      sourceLabels: [...base.provenance.sourceLabels, ...facts[0].provenance.sourceLabels],
      sourceUrls: [...new Set([...(base.provenance.sourceUrls ?? []), ...(facts[0].provenance.sourceUrls ?? [])])],
      checkedAt: '2026-10-11',
    },
  };
}

export const ROSTER_OUTRO_COMPLETION_PROFILES: readonly CharacterMechanicsProfile[] = [
  BULING_CHARACTER_MECHANICS_PROFILE_WITH_OUTRO,
  DANJIN_CHARACTER_MECHANICS_PROFILE_WITH_OUTRO,
  XIANGLI_YAO_CHARACTER_MECHANICS_PROFILE_WITH_OUTRO,
].map(withReleaseResourcesAndSequences);
