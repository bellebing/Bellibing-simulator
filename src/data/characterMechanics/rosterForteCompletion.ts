import { DANJIN_RUBY_BLOSSOM_INTERPRETATION as ruby } from './danjinInterpretation.ts';
import type {
  CharacterMechanicsProfile,
  CharacterPassiveFact,
} from '../../characterMechanicsDomain.ts';
import {
  BULING_ACTION_FACTS,
  BULING_ACTION_PROVENANCE,
  DANJIN_ACTION_FACTS,
  DANJIN_ACTION_PROVENANCE,
  XIANGLI_YAO_ACTION_FACTS,
  XIANGLI_YAO_ACTION_PROVENANCE,
} from './rosterActionCompletion.ts';

const CHECKED_AT = '2026-10-01';
const CHARACTER_SOURCE = 'https://github.com/DommyMM/wuwabuild/blob/2b57a127b26b062ab58d272cd6735338507de1cd/public/Data/Characters.json';
const TREE_SOURCE = 'https://github.com/Arikatsu/WutheringWaves_Data/blob/353f2eaed119bc9f680eab92807d20ac75a79b40/BinData/skillTree/skilltree.json';
const TEXT_SOURCE = 'https://github.com/Arikatsu/WutheringWaves_Data/blob/353f2eaed119bc9f680eab92807d20ac75a79b40/Textmaps/en/multi_text/MultiText.json';

function forteProvenance(characterName: string) {
  return {
    sourceLabels: [
      'Bellibing Skills/Forte source — pinned wuwabuild Character payload',
      'Bellibing Skills/Forte tree/text source — pinned WutheringWaves_Data payload',
    ],
    sourceUrls: [CHARACTER_SOURCE, TREE_SOURCE, TEXT_SOURCE],
    checkedAt: CHECKED_AT,
    notes: [
      `${characterName} FORTE_RULES are promoted only from source-explicit Forte/state relationships already present in data/source/character-forte-ui.json. Unsupported execution timing, resource arithmetic and damage taxonomy remain pending or blocked rather than inferred.`,
    ],
  } as const;
}

export const BULING_FORTE_PROVENANCE = forteProvenance('Buling');
export const DANJIN_FORTE_PROVENANCE = forteProvenance('Danjin');
export const XIANGLI_YAO_FORTE_PROVENANCE = forteProvenance('Xiangli Yao');

function passive(input: CharacterPassiveFact): CharacterPassiveFact {
  return input;
}

export const BULING_FORTE_RULE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'buling-forte-yin-yang-balance',
    characterId: 'buling',
    kind: 'PASSIVE',
    name: 'Forte Circuit — Yin-Yang Balance',
    section: 'FORTE_CIRCUIT',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: BULING_FORTE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: 'Buling obtains both Minor Yin and Minor Yang.',
    effectSummary: 'Buling enters Yin-Yang Balance and Resonance Liberation — Flashing Thunder Spell is replaced by Resonance Liberation — Flashing Thunder Spell: Harmony. Minor Yang is obtained after casting Heavy Attack — Mountain Over Thunder or Thunder Over Mountain; Minor Yin is obtained after casting Heavy Attack — Twin Mountains or Twin Thunders.',
    durationSeconds: null,
    maxStacks: null,
    notes: ['This fact preserves only the source-explicit state/transform relationship. No acquisition arithmetic or persistence timing beyond the source text is inferred.'],
  }),
  passive({
    factId: 'buling-forte-five-thunders-spell-array-state',
    characterId: 'buling',
    kind: 'PASSIVE',
    name: 'Forte Circuit — Five Thunders Spell Array state',
    section: 'FORTE_CIRCUIT',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: BULING_FORTE_PROVENANCE,
    scope: 'TEAM',
    triggerSummary: 'Buling casts Flashing Thunder Spell: Harmony.',
    effectSummary: 'Harmony generates Five Thunders Spell Array at the target area. The array lasts 24s, inflicts 2 Electro Flare stacks on targets within it every 2s, and while it is active all Resonators in the team enter Thunder Spell — Primordial Qi.',
    durationSeconds: 24,
    maxStacks: null,
    notes: ['The array continuous-damage coefficient remains a separate ACTION fact. Its Liberation damage class is proven separately by original damage row 1307019002.'],
  }),
  passive({
    factId: 'buling-forte-thunder-spell-yin-and-yang',
    characterId: 'buling',
    kind: 'PASSIVE',
    name: 'Forte Circuit — Thunder Spell: Yin and Yang',
    section: 'FORTE_CIRCUIT',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: BULING_FORTE_PROVENANCE,
    scope: 'TEAM',
    triggerSummary: 'Any Resonator in the team casts Intro Skill while Thunder Spell — Primordial Qi is active.',
    effectSummary: 'Thunder Spell — Primordial Qi becomes Thunder Spell — Yin and Yang, granting 10% Resonance Skill DMG Bonus to all active Resonators in the team.',
    durationSeconds: null,
    maxStacks: null,
    notes: ['The source ties this state to the Five Thunders Spell Array chain but does not publish a separate duration for this intermediate state.'],
  }),
  passive({
    factId: 'buling-forte-thunder-spell-heaven-earth-mind',
    characterId: 'buling',
    kind: 'PASSIVE',
    name: 'Forte Circuit — Thunder Spell: Heaven, Earth, Mind',
    section: 'FORTE_CIRCUIT',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: BULING_FORTE_PROVENANCE,
    scope: 'TEAM',
    triggerSummary: 'Any Resonator in the team casts Intro Skill while Thunder Spell — Yin and Yang is active.',
    effectSummary: 'Thunder Spell — Yin and Yang becomes Thunder Spell — Heaven, Earth, Mind, granting 25% Resonance Skill DMG Bonus to all active Resonators in the team.',
    durationSeconds: null,
    maxStacks: null,
    notes: ['No separate state duration or stack arithmetic is inferred beyond the source-explicit transformation.'],
  }),
] as const;

export const DANJIN_FORTE_RULE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'danjin-forte-chaoscleave-scatterbloom-chain',
    characterId: 'danjin',
    kind: 'PASSIVE',
    name: 'Forte Circuit — Chaoscleave / Scatterbloom chain',
    section: 'FORTE_CIRCUIT',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: DANJIN_FORTE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: 'After accumulating 60 Ruby Blossom, hold Basic Attack.',
    effectSummary: 'Danjin consumes all Ruby Blossom to cast Heavy Attack: Chaoscleave. Using Basic Attack after Chaoscleave casts Heavy Attack: Scatterbloom.',
    durationSeconds: null,
    maxStacks: null,
    notes: ['The 60-Ruby-Blossom unlock and Chaoscleave → Scatterbloom action relationship are source-explicit. Executable resource accounting remains outside this FORTE_RULES slice.'],
  }),
  passive({
    factId: 'danjin-forte-full-power-threshold-conflict',
    characterId: 'danjin',
    kind: 'PASSIVE',
    name: 'Forte Circuit — Full-power Chaoscleave / Scatterbloom threshold',
    section: 'FORTE_CIRCUIT',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: DANJIN_FORTE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: `Ruby Blossom reaches full meter (${ruby.fullPowerThreshold}, maximum ${ruby.maximum}); exactly 120 qualifies under the explicit owner decision.`,
    effectSummary: `Consume ${ruby.fullPowerConsumption} Ruby Blossom for the increased Chaoscleave and Scatterbloom multipliers for that use.`,
    durationSeconds: null,
    maxStacks: null,
    notes: [ruby.translationIssue, 'Authority: explicit owner decision, reaffirmed 2026-10-22 in Issue #348 work. Raw source text and pins remain unchanged; no gameplay-DPS qualification follows.'],
  }),
] as const;

export const XIANGLI_YAO_FORTE_RULE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'xiangli-yao-forte-intuition-transformations',
    characterId: 'xiangli-yao',
    kind: 'PASSIVE',
    name: 'Forte relationship — Intuition transformations',
    section: 'FORTE_CIRCUIT',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: XIANGLI_YAO_FORTE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: 'Xiangli Yao casts Resonance Liberation — Cogitation Model and enters Intuition.',
    effectSummary: 'Intuition lasts up to 24s. It provides 3 Hypercubes; casting Law of Reigns consumes 1 Hypercube and Intuition ends once all Hypercubes are consumed. During Intuition, Basic Attack and Heavy Attack are replaced by Pivot — Impale, Resonance Skill — Deduction is replaced by Divergence, and Dodge Counter is replaced by Unfathomed.',
    durationSeconds: 24,
    maxStacks: null,
    notes: ['The source-explicit mode and replacements are canonical here. Pivot — Impale Basic DMG is proven by its original damage rows, independently of the Intuition state.'],
  }),
  passive({
    factId: 'xiangli-yao-forte-decipher-replacement',
    characterId: 'xiangli-yao',
    kind: 'PASSIVE',
    name: 'Forte Circuit — Decipher replacement',
    section: 'FORTE_CIRCUIT',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: XIANGLI_YAO_FORTE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: 'Capacity reaches 100.',
    effectSummary: 'Resonance Skill — Deduction is replaced by Resonance Skill — Decipher. Casting Decipher consumes 100 Capacity. The Decipher action itself is explicitly considered Resonance Liberation DMG.',
    durationSeconds: null,
    maxStacks: null,
    notes: ['The threshold/replacement/consume relationship is source-explicit; broader Capacity gain arithmetic remains outside this FORTE_RULES slice.'],
  }),
  passive({
    factId: 'xiangli-yao-forte-law-of-reigns-replacement',
    characterId: 'xiangli-yao',
    kind: 'PASSIVE',
    name: 'Forte Circuit — Law of Reigns replacement',
    section: 'FORTE_CIRCUIT',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: XIANGLI_YAO_FORTE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: 'Performance Capacity reaches 5 while Intuition is active.',
    effectSummary: 'Resonance Skill — Divergence is replaced by Resonance Skill — Law of Reigns. Casting Law of Reigns consumes 5 Performance Capacity. The Law of Reigns action itself is explicitly considered Resonance Liberation DMG.',
    durationSeconds: null,
    maxStacks: null,
    notes: ['The threshold/replacement/consume relationship is source-explicit; broader Performance Capacity gain arithmetic remains outside this FORTE_RULES slice.'],
  }),
  passive({
    factId: 'xiangli-yao-forte-revamp-follow-up',
    characterId: 'xiangli-yao',
    kind: 'PASSIVE',
    name: 'Forte Circuit — Revamp follow-up relationship',
    section: 'FORTE_CIRCUIT',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: XIANGLI_YAO_FORTE_PROVENANCE,
    scope: 'SELF',
    triggerSummary: 'Shortly after casting Decipher or Divergence, use Basic Attack.',
    effectSummary: 'Xiangli Yao performs Mid-air Attack — Revamp at the source-stated STA cost. Revamp is explicitly considered Resonance Liberation DMG.',
    durationSeconds: null,
    maxStacks: null,
    notes: ['The source says only “shortly after”; no numeric input window or timing boundary is invented. Runtime timing therefore remains PENDING_INTERPRETATION.'],
  }),
] as const;

export interface CharacterForteRuleSourceBlocker {
  blockerId: string;
  characterId: string;
  factIds: readonly string[];
  sourceMoveIds: readonly number[];
  reason: string;
}

export const CHARACTER_FORTE_RULE_SOURCE_BLOCKERS: readonly CharacterForteRuleSourceBlocker[] = [];

function coverage(
  actions: CharacterMechanicsProfile['coverage'][number],
  forte: CharacterMechanicsProfile['coverage'][number],
): CharacterMechanicsProfile['coverage'] {
  return [
    actions,
    forte,
    { area: 'INHERENT_PASSIVES', status: 'PENDING', notes: 'Not evaluated by the ACTIONS-only roster completion.' },
    { area: 'OUTRO_EFFECT', status: 'PENDING', notes: 'Not evaluated by the ACTIONS-only roster completion.' },
    { area: 'RESOURCE_RULES', status: 'PENDING', notes: 'Not evaluated by the ACTIONS-only roster completion.' },
    { area: 'SEQUENCES', status: 'PENDING', notes: 'Not evaluated by the ACTIONS-only roster completion.' },
  ];
}

export const BULING_CHARACTER_MECHANICS_PROFILE_WITH_FORTE: CharacterMechanicsProfile = {
  characterId: 'buling',
  verificationStatus: 'PARTIALLY_VERIFIED',
  coverage: coverage(
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'All current source-backed damage actions and Tune Break are mapped with exact source representations. Original released damage data resolves the array as Liberation DMG.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Yin-Yang Balance, Harmony replacement, Five Thunders Spell Array cadence/Flare/team-state chain and both Thunder Spell team buffs are source-mapped. Original released damage row 1307019002 has Liberation damage Type=2.' },
  ),
  factIds: [...BULING_ACTION_FACTS.map((fact) => fact.factId), ...BULING_FORTE_RULE_FACTS.map((fact) => fact.factId)],
  provenance: BULING_ACTION_PROVENANCE,
};

export const DANJIN_CHARACTER_MECHANICS_PROFILE_WITH_FORTE: CharacterMechanicsProfile = {
  characterId: 'danjin',
  verificationStatus: 'PARTIALLY_VERIFIED',
  coverage: coverage(
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'All current source-backed Character damage actions plus Tune Break are mapped with exact Lv1-Lv10 curves/components and source-explicit damage classes/scaling. Ruby Blossom full-power wording is resolved by explicit owner interpretation; runtime execution remains separate.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'The 60-Ruby-Blossom trigger and action chain are source-mapped. The owner resolves the full-power translation as full meter: exactly 120, consuming 120. Runtime execution remains separate.' },
  ),
  factIds: [...DANJIN_ACTION_FACTS.map((fact) => fact.factId), ...DANJIN_FORTE_RULE_FACTS.map((fact) => fact.factId)],
  provenance: DANJIN_ACTION_PROVENANCE,
};

export const XIANGLI_YAO_CHARACTER_MECHANICS_PROFILE_WITH_FORTE: CharacterMechanicsProfile = {
  characterId: 'xiangli-yao',
  verificationStatus: 'PARTIALLY_VERIFIED',
  coverage: coverage(
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'All current source-backed damage actions and Tune Break are mapped with exact source representations. Original released damage data resolves all three Pivot stages as Basic DMG.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Intuition mode/replacements, the source-fixed 24s state limit, Decipher and Law of Reigns thresholds/replacements/consumption, and the Revamp follow-up relationship are source-mapped. Exact runtime timing for “shortly after” remains PENDING_INTERPRETATION without blocking source verification.' },
  ),
  factIds: [...XIANGLI_YAO_ACTION_FACTS.map((fact) => fact.factId), ...XIANGLI_YAO_FORTE_RULE_FACTS.map((fact) => fact.factId)],
  provenance: XIANGLI_YAO_ACTION_PROVENANCE,
};

export const ROSTER_FORTE_COMPLETION_FACTS: readonly CharacterPassiveFact[] = [
  ...BULING_FORTE_RULE_FACTS,
  ...DANJIN_FORTE_RULE_FACTS,
  ...XIANGLI_YAO_FORTE_RULE_FACTS,
] as const;

export const ROSTER_FORTE_COMPLETION_PROFILES: readonly CharacterMechanicsProfile[] = [
  BULING_CHARACTER_MECHANICS_PROFILE_WITH_FORTE,
  DANJIN_CHARACTER_MECHANICS_PROFILE_WITH_FORTE,
  XIANGLI_YAO_CHARACTER_MECHANICS_PROFILE_WITH_FORTE,
] as const;
