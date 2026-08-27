import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/changli';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/changli';
const WUTHERINGLAB = 'https://wutheringlab.com/character/changli-build/';

export const CHANGLI_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Wuthering.gg — current Changli kit and multiplier tables',
    'Prydwen — current Changli kit and Resonance Chain',
    'Wutheringlab — current Changli kit/multiplier cross-check',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN, WUTHERINGLAB],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #68 review artifact supplies exact Lv1-Lv10 coefficient structures and parsed description parameters; current Wuthering.gg, Prydwen and Wutheringlab cross-check action identity, True Sight/Enflamement rules, Inherents, Outro and S1-S6 semantics.',
    'True Sight: Conquest, True Sight: Charge and Flaming Sacrifice are explicitly classified as Resonance Skill DMG by current source text; Bellibing preserves those damage buckets independently from their Basic Attack/Heavy Attack activation wording and source sections.',
    'Generated promotion candidates remained NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.',
  ],
} as const;

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return {
    ...input,
    characterId: 'changli',
    kind: 'ACTION',
    actionRole: 'DAMAGE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODEL_READY',
    motionValue: null,
    provenance: CHANGLI_PROVENANCE,
  };
}

function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return {
    ...rest,
    characterId: 'changli',
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    provenance: CHANGLI_PROVENANCE,
  };
}

function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return {
    ...input,
    characterId: 'changli',
    kind: 'RESOURCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: CHANGLI_PROVENANCE,
  };
}

function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return {
    ...input,
    characterId: 'changli',
    kind: 'SEQUENCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: CHANGLI_PROVENANCE,
  };
}

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation; no skill level is implicitly selected by raw data.';

export const CHANGLI_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'changli-basic-blazing-enlightment-1', name: 'Basic Attack — Blazing Enlightment Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1484, .1605, .1727, .1897, .2019, .2159, .2353, .2548, .2743, .2949], hitCount: 2, conditional: false }),
  action({ factId: 'changli-basic-blazing-enlightment-2', name: 'Basic Attack — Blazing Enlightment Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1785, .1932, .2078, .2283, .243, .2598, .2832, .3066, .33, .3549], hitCount: 2, conditional: false }),
  action({ factId: 'changli-basic-blazing-enlightment-3', name: 'Basic Attack — Blazing Enlightment Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1834, .1984, .2134, .2345, .2495, .2668, .2908, .3149, .3389, .3645], hitCount: 3, conditional: false }),
  action({ factId: 'changli-basic-blazing-enlightment-4', name: 'Basic Attack — Blazing Enlightment Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.255, .276, .2969, .3261, .3471, .3711, .4046, .438, .4715, .507], hitCount: 1 }, { curve: [.1488, .161, .1732, .1903, .2025, .2165, .236, .2555, .275, .2958], hitCount: 4 }], hitCount: null, conditional: false, notes: ['Casting Stage 4 enters True Sight for the source-listed 12 seconds.'] }),
  action({ factId: 'changli-mid-air-blazing-enlightment-1', name: 'Mid-air Attack — Blazing Enlightment Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3086, .3339, .3592, .3946, .4199, .449, .4895, .53, .5705, .6135], hitCount: 1, conditional: false }),
  action({ factId: 'changli-mid-air-blazing-enlightment-2', name: 'Mid-air Attack — Blazing Enlightment Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.2559, .2769, .2979, .3272, .3482, .3723, .4059, .4395, .473, .5087], hitCount: 2, conditional: false }),
  action({ factId: 'changli-mid-air-blazing-enlightment-3', name: 'Mid-air Attack — Blazing Enlightment Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.2213, .2395, .2576, .283, .3012, .322, .3511, .3801, .4091, .44], hitCount: 3, conditional: false }),
  action({ factId: 'changli-mid-air-blazing-enlightment-4', name: 'Mid-air Attack — Blazing Enlightment Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.1913, .207, .2227, .2446, .2603, .2783, .3034, .3285, .3536, .3803], hitCount: 1 }, { curve: [.1116, .1208, .1299, .1427, .1519, .1624, .177, .1917, .2063, .2218], hitCount: 4 }], hitCount: null, conditional: false, notes: ['Casting Stage 4 enters True Sight for the source-listed 12 seconds.'] }),
  action({ factId: 'changli-heavy-blazing-enlightment', name: 'Heavy Attack — Blazing Enlightment', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.1458, .1578, .1697, .1865, .1984, .2122, .2313, .2504, .2695, .2899], hitCount: 3 }, { curve: [.1875, .2028, .2182, .2397, .2551, .2728, .2974, .322, .3465, .3727], hitCount: 1 }], hitCount: null, conditional: false, notes: ['Source lists 25 STA cost and allows a timed Basic Attack follow-up into Mid-air Attack Stage 3.'] }),
  action({ factId: 'changli-mid-air-heavy-blazing-enlightment', name: 'Mid-air Heavy Attack — Blazing Enlightment', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.62, .6709, .7217, .7929, .8437, .9022, .9836, 1.0649, 1.1462, 1.2327], hitCount: 1, conditional: true, notes: ['Source lists 30 STA cost and allows a timed Basic Attack follow-up into Basic Attack Stage 3.'] }),
  action({ factId: 'changli-dodge-counter-blazing-enlightment', name: 'Dodge Counter — Blazing Enlightment', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.4157, .4498, .4839, .5316, .5657, .6049, .6594, .714, .7685, .8264], hitCount: 3, conditional: true }),
  action({ factId: 'changli-skill-true-sight-capture', name: 'Resonance Skill — True Sight: Capture', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.4119, .4457, .4794, .5267, .5605, .5993, .6534, .7074, .7614, .8188], hitCount: 3 }, { curve: [.8237, .8913, .9588, 1.0534, 1.1209, 1.1986, 1.3067, 1.4147, 1.5228, 1.6376], hitCount: 1 }], hitCount: null, conditional: false, notes: ['The cast enters True Sight for 12 seconds; Tripartite Flames charge rules are stored separately.'] }),
  action({ factId: 'changli-skill-true-sight-conquest', name: 'Basic Attack — True Sight: Conquest', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.2965, .3208, .3451, .3792, .4035, .4314, .4703, .5092, .5481, .5895], hitCount: 2 }, { curve: [.4151, .4491, .4832, .5308, .5649, .604, .6585, .7129, .7674, .8252], hitCount: 1 }, { curve: [.4744, .5133, .5522, .6067, .6456, .6903, .7525, .8148, .877, .9431], hitCount: 1 }], hitCount: null, conditional: true, notes: ['Source explicitly considers this Resonance Skill DMG despite the Basic Attack activation/name. It ends True Sight.'] }),
  action({ factId: 'changli-skill-true-sight-charge', name: 'Basic Attack — True Sight: Charge', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.3656, .3956, .4256, .4675, .4975, .532, .58, .6279, .6759, .7268], hitCount: 1 }, { curve: [.5484, .5934, .6383, .7013, .7462, .798, .8699, .9418, 1.0138, 1.0902], hitCount: 1 }], hitCount: null, conditional: true, notes: ['Source explicitly considers this Resonance Skill DMG despite the Basic Attack activation/name. It ends True Sight.'] }),
  action({ factId: 'changli-liberation-radiance-of-fealty', name: 'Resonance Liberation — Radiance of Fealty', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [6.1, 6.6002, 7.1004, 7.8007, 8.3009, 8.8762, 9.6765, 10.4768, 11.2771, 12.1275], hitCount: 1, conditional: false, notes: ['The cast grants 4 Enflamement and enters Fiery Feather; those state/resource rules are stored separately.'] }),
  action({ factId: 'changli-intro-obedience-of-rules', name: 'Intro Skill — Obedience of Rules', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.2238, .2422, .2606, .2862, .3046, .3257, .3551, .3844, .4138, .445], hitCount: 1 }, { curve: [.1306, .1413, .152, .167, .1777, .19, .2071, .2243, .2414, .2596], hitCount: 4 }], hitCount: null, conditional: false, notes: ['The Intro also enters True Sight for 12 seconds.'] }),
  action({ factId: 'changli-forte-flaming-sacrifice', name: 'Forte Circuit — Flaming Sacrifice', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.1974, .2136, .2298, .2525, .2687, .2873, .3132, .3391, .365, .3925], hitCount: 5 }, { curve: [2.303, 2.4918, 2.6807, 2.9451, 3.1339, 3.3511, 3.6532, 3.9554, 4.2575, 4.5785], hitCount: 1 }], hitCount: null, conditional: true, notes: ['Requires 4 Enflamement, consumes all 4, and is explicitly considered Resonance Skill DMG. Source also states 40% damage reduction while casting.'] }),
] as const;

export const CHANGLI_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'changli-resource-enflamement',
    name: 'Enflamement',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Enflamement',
    maxValue: 4,
    ruleSummary: 'Changli can hold up to 4 Enflamement. True Sight: Conquest on hit grants 1, True Sight: Charge on hit grants 1, and Radiance of Fealty grants 4. At 4 stacks, Heavy Attack can cast Flaming Sacrifice, which consumes all Enflamement.',
  }),
  resource({
    factId: 'changli-resource-tripartite-flames-charges',
    name: 'Tripartite Flames charges',
    section: 'RESONANCE_SKILL',
    conditional: false,
    resourceName: 'Tripartite Flames charges',
    maxValue: 2,
    ruleSummary: 'True Sight: Capture starts with 2 charges, holds up to 2, and replenishes 1 charge every 12 seconds.',
  }),
] as const;

export const CHANGLI_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'changli-state-true-sight',
    name: 'True Sight',
    section: 'RESONANCE_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Changli releases Basic Attack Stage 4, Mid-air Attack Stage 4, True Sight: Capture, or Intro Skill Obedience of Rules.',
    effectSummary: 'Changli enters True Sight for 12 seconds. Ground Basic Attack releases True Sight: Conquest; jumping or using Basic Attack in mid-air releases True Sight: Charge. Releasing either attack ends True Sight.',
    durationSeconds: 12,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'changli-state-fiery-feather',
    name: 'Fiery Feather',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Changli casts Resonance Liberation Radiance of Fealty.',
    effectSummary: 'If Changli releases Heavy Attack Flaming Sacrifice within 10 seconds, her ATK is increased by 25%, after which Fiery Feather ends. The source states the 10-second activation window but does not separately state a post-trigger ATK-buff duration.',
    durationSeconds: 10,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'changli-inherent-secret-strategist',
    name: 'Inherent Skill — Secret Strategist',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Changli casts True Sight: Conquest or True Sight: Charge.',
    effectSummary: 'Each stack of Enflamement increases Changli\'s Fusion DMG Bonus by 5%.',
    durationSeconds: null,
    maxStacks: 4,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'changli-inherent-sweeping-force',
    name: 'Inherent Skill — Sweeping Force',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Changli casts Heavy Attack Flaming Sacrifice or Resonance Liberation Radiance of Fealty.',
    effectSummary: 'Changli gains 20% Fusion DMG Bonus and ignores 15% of the target\'s DEF when dealing damage.',
    durationSeconds: null,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'changli-outro-strategy-of-duality',
    name: 'Outro Skill — Strategy of Duality',
    section: 'OUTRO_SKILL',
    conditional: true,
    scope: 'NEXT_CHARACTER',
    triggerSummary: 'Changli casts Outro Skill and the incoming Resonator takes the field.',
    effectSummary: 'The incoming Resonator has Fusion DMG Amplified by 20% and Resonance Liberation DMG Amplified by 25% for 10 seconds or until switched out.',
    durationSeconds: 10,
    maxStacks: 1,
    modelingStatus: 'MODEL_READY',
  }),
] as const;

export const CHANGLI_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'changli-s1-hidden-thoughts', name: 'S1 — Hidden Thoughts', section: 'RESONANCE_CHAIN', sequence: 1, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'Resonance Skill Tripartite Flames and Heavy Attack Flaming Sacrifice increase Changli\'s DMG dealt by 10% and resistance to interruption.' }),
  sequence({ factId: 'changli-s2-pursuit-of-desires', name: 'S2 — Pursuit of Desires', section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: 'Enflamement is present.', effectSummary: 'Enflamement increases Changli\'s Crit. Rate by 25% for 8s.' }),
  sequence({ factId: 'changli-s3-learned-secrets', name: 'S3 — Learned Secrets', section: 'RESONANCE_CHAIN', sequence: 3, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'Resonance Liberation Radiance of Fealty DMG is increased by 80%.' }),
  sequence({ factId: 'changli-s4-polished-words', name: 'S4 — Polished Words', section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: 'Changli casts Intro Skill.', effectSummary: 'After Intro Skill is cast, all team members\' ATK is increased by 20% for 30s.' }),
  sequence({ factId: 'changli-s5-sacrificed-gains', name: 'S5 — Sacrificed Gains', section: 'RESONANCE_CHAIN', sequence: 5, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'Heavy Attack Flaming Sacrifice\'s Multiplier is increased by 50% and its DMG dealt is increased by 50%.' }),
  sequence({ factId: 'changli-s6-realized-plans', name: 'S6 — Realized Plans', section: 'RESONANCE_CHAIN', sequence: 6, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'Resonance Skill Tripartite Flames, Heavy Attack Flaming Sacrifice, and Resonance Liberation Radiance of Fealty ignore an additional 40% of the target\'s DEF when dealing damage.' }),
] as const;

export const CHANGLI_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...CHANGLI_ACTION_FACTS,
  ...CHANGLI_RESOURCE_FACTS,
  ...CHANGLI_PASSIVE_FACTS,
  ...CHANGLI_SEQUENCE_FACTS,
] as const;
