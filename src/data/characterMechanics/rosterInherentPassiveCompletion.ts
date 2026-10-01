import type {
  CharacterMechanicsProfile,
  CharacterPassiveFact,
} from '../../characterMechanicsDomain.ts';
import {
  BULING_CHARACTER_MECHANICS_PROFILE_WITH_FORTE,
  DANJIN_CHARACTER_MECHANICS_PROFILE_WITH_FORTE,
  XIANGLI_YAO_CHARACTER_MECHANICS_PROFILE_WITH_FORTE,
} from './rosterForteCompletion.ts';

const CHECKED_AT = '2026-10-01';
const CHARACTER_SOURCE = 'https://github.com/DommyMM/wuwabuild/blob/2b57a127b26b062ab58d272cd6735338507de1cd/public/Data/Characters.json';
const TREE_SOURCE = 'https://github.com/Arikatsu/WutheringWaves_Data/blob/353f2eaed119bc9f680eab92807d20ac75a79b40/BinData/skillTree/skilltree.json';
const TEXT_SOURCE = 'https://github.com/Arikatsu/WutheringWaves_Data/blob/353f2eaed119bc9f680eab92807d20ac75a79b40/Textmaps/en/multi_text/MultiText.json';

function inherentProvenance(characterName: string) {
  return {
    sourceLabels: [
      'Bellibing Skills/Forte source — pinned wuwabuild Character payload',
      'Bellibing Skills/Forte tree/text source — pinned WutheringWaves_Data payload',
    ],
    sourceUrls: [CHARACTER_SOURCE, TREE_SOURCE, TEXT_SOURCE],
    checkedAt: CHECKED_AT,
    notes: [
      `${characterName} INHERENT_PASSIVES are promoted only from the two source-explicit Inherent Skill rows already present in data/source/character-forte-ui.json. No unstated timing, magnitude, stack behavior or combat execution is inferred.`,
    ],
  } as const;
}

export const BULING_INHERENT_PASSIVE_PROVENANCE = inherentProvenance('Buling');
export const DANJIN_INHERENT_PASSIVE_PROVENANCE = inherentProvenance('Danjin');
export const XIANGLI_YAO_INHERENT_PASSIVE_PROVENANCE = inherentProvenance('Xiangli Yao');

function passive(input: CharacterPassiveFact): CharacterPassiveFact {
  return input;
}

export const BULING_INHERENT_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'buling-inherent-time-arrives-evil-declines',
    characterId: 'buling',
    kind: 'PASSIVE',
    name: 'Inherent Skill — Time Arrives, Evil Declines',
    section: 'INHERENT_SKILL',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: BULING_INHERENT_PASSIVE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: 'Buling restores HP for a Resonator with less than 50% HP.',
    effectSummary: 'Buling gains 25% Healing Bonus.',
    durationSeconds: null,
    maxStacks: null,
    notes: ['Source move 1004304. The source states the healing condition and 25% Healing Bonus but no separate duration; none is invented.'],
  }),
  passive({
    factId: 'buling-inherent-earthly-immortal-is-here',
    characterId: 'buling',
    kind: 'PASSIVE',
    name: 'Inherent Skill — Earthly Immortal is Here!',
    section: 'INHERENT_SKILL',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: BULING_INHERENT_PASSIVE_PROVENANCE,
    scope: 'TARGET',
    triggerSummary: 'A target is damaged by Intro Skill — Summon and Smite. This effect can trigger once every 10 seconds.',
    effectSummary: 'The damaged target obtains 4 stacks of Electro Flare.',
    durationSeconds: null,
    maxStacks: null,
    notes: ['Source move 1004305. Electro Flare system lifetime/stack execution is not expanded beyond this source-explicit application fact.'],
  }),
] as const;

export const DANJIN_INHERENT_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'danjin-inherent-crimson-light',
    characterId: 'danjin',
    kind: 'PASSIVE',
    name: 'Inherent Skill — Crimson Light',
    section: 'INHERENT_SKILL',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: DANJIN_INHERENT_PASSIVE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: 'Resonance Skill — Crimson Erosion is triggered by Dodge Counter: Ruby Shades.',
    effectSummary: 'Crimson Erosion DMG is increased by 20%. The HP cost and the stacks of Ruby Blossom recovered are doubled.',
    durationSeconds: null,
    maxStacks: null,
    notes: ['Source move 1000804. This records the source-explicit modifier only; it does not resolve Danjin\'s separate full-power Ruby Blossom threshold contradiction.'],
  }),
  passive({
    factId: 'danjin-inherent-overflow',
    characterId: 'danjin',
    kind: 'PASSIVE',
    name: 'Inherent Skill — Overflow',
    section: 'INHERENT_SKILL',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: DANJIN_INHERENT_PASSIVE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: 'Danjin casts Resonance Skill — Sanguine Pulse.',
    effectSummary: "Danjin's Heavy Attack DMG is increased by 30% for 5 seconds.",
    durationSeconds: 5,
    maxStacks: null,
    notes: ['Source move 1000805. No refresh/stack rule is inferred beyond the source text.'],
  }),
] as const;

export const XIANGLI_YAO_INHERENT_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'xiangli-yao-inherent-knowing',
    characterId: 'xiangli-yao',
    kind: 'PASSIVE',
    name: 'Inherent Skill — Knowing',
    section: 'INHERENT_SKILL',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: XIANGLI_YAO_INHERENT_PASSIVE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: 'Xiangli Yao casts Resonance Skill.',
    effectSummary: 'Xiangli Yao gains 5% Electro DMG Bonus for 8 seconds, stackable up to 4 times.',
    durationSeconds: 8,
    maxStacks: 4,
    notes: ['Source move 1002304. Stack refresh/independent-duration semantics are not stated by this source row and remain uninterpreted.'],
  }),
  passive({
    factId: 'xiangli-yao-inherent-focus',
    characterId: 'xiangli-yao',
    kind: 'PASSIVE',
    name: 'Inherent Skill — Focus',
    section: 'INHERENT_SKILL',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: XIANGLI_YAO_INHERENT_PASSIVE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: 'Xiangli Yao is in Intuition triggered by Resonance Liberation.',
    effectSummary: "Xiangli Yao's resistance to interruption is enhanced.",
    durationSeconds: null,
    maxStacks: null,
    notes: ['Source move 1002305 provides no numeric interruption-resistance magnitude; the qualitative effect is preserved without inventing one.'],
  }),
] as const;

export interface CharacterInherentPassiveSourceBlocker {
  blockerId: string;
  characterId: string;
  factIds: readonly string[];
  sourceMoveIds: readonly number[];
  reason: string;
}

export const CHARACTER_INHERENT_PASSIVE_SOURCE_BLOCKERS: readonly CharacterInherentPassiveSourceBlocker[] = [] as const;

function withVerifiedInherentPassives(
  base: CharacterMechanicsProfile,
  facts: readonly CharacterPassiveFact[],
  notes: string,
): CharacterMechanicsProfile {
  return {
    ...base,
    coverage: base.coverage.map((entry) => entry.area === 'INHERENT_PASSIVES'
      ? { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes }
      : entry),
    factIds: [...base.factIds, ...facts.map((fact) => fact.factId)],
    provenance: {
      ...base.provenance,
      sourceLabels: [...new Set([...base.provenance.sourceLabels, ...facts[0].provenance.sourceLabels])],
      sourceUrls: [...new Set([...(base.provenance.sourceUrls ?? []), ...(facts[0].provenance.sourceUrls ?? [])])],
      checkedAt: CHECKED_AT,
      notes: [
        ...(base.provenance.notes ?? []),
        'INHERENT_PASSIVES completion is source-verified independently and does not promote unresolved mechanics areas or the full Character Mechanics profile.',
      ],
    },
  };
}

export const BULING_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES = withVerifiedInherentPassives(
  BULING_CHARACTER_MECHANICS_PROFILE_WITH_FORTE,
  BULING_INHERENT_PASSIVE_FACTS,
  'Both current Inherent Skills are linked from the pinned Skills/Forte source with exact condition/effect values. Existing ACTIONS/FORTE blockers remain unchanged.',
);

export const DANJIN_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES = withVerifiedInherentPassives(
  DANJIN_CHARACTER_MECHANICS_PROFILE_WITH_FORTE,
  DANJIN_INHERENT_PASSIVE_FACTS,
  'Both current Inherent Skills are linked from the pinned Skills/Forte source with exact condition/effect values. The separate Ruby Blossom full-power contradiction remains unchanged.',
);

export const XIANGLI_YAO_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES = withVerifiedInherentPassives(
  XIANGLI_YAO_CHARACTER_MECHANICS_PROFILE_WITH_FORTE,
  XIANGLI_YAO_INHERENT_PASSIVE_FACTS,
  'Both current Inherent Skills are linked from the pinned Skills/Forte source with exact condition/effect values. The independent Pivot — Impale ACTIONS blocker remains unchanged.',
);

export const ROSTER_INHERENT_PASSIVE_COMPLETION_FACTS: readonly CharacterPassiveFact[] = [
  ...BULING_INHERENT_PASSIVE_FACTS,
  ...DANJIN_INHERENT_PASSIVE_FACTS,
  ...XIANGLI_YAO_INHERENT_PASSIVE_FACTS,
] as const;

export const ROSTER_INHERENT_PASSIVE_COMPLETION_PROFILES: readonly CharacterMechanicsProfile[] = [
  BULING_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES,
  DANJIN_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES,
  XIANGLI_YAO_CHARACTER_MECHANICS_PROFILE_WITH_INHERENT_PASSIVES,
] as const;
