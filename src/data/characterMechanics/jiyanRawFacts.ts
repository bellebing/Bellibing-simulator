import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/jiyan';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/jiyan';
const WUTHERINGLAB = 'https://wutheringlab.com/character/jiyan-build/';

export const JIYAN_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Wuthering.gg — current Jiyan kit and multiplier tables',
    'Prydwen — current Jiyan kit and Resonance Chain',
    'Wutheringlab — current Jiyan kit/multiplier cross-check',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN, WUTHERINGLAB],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #68 review artifact supplies exact Lv1-Lv10 coefficient structures and parsed description parameters; current Wuthering.gg, Prydwen and Wutheringlab cross-check action identity, Resolve/Qingloong rules, Inherents, Outro and S1-S6 semantics.',
    'Lance of Qingloong and Emerald Storm: Finale are explicitly classified as Heavy Attack DMG by current source text even though they are owned by the Resonance Liberation/Forte flow. Bellibing keeps source section, action kind and damage bucket independent.',
    'Emerald Storm: Prelude is represented explicitly as a non-damaging Liberation/state-transition action instead of fabricating a coefficient from the Finale table.',
    'Generated promotion candidates remained NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.',
  ],
} as const;

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return {
    ...input,
    characterId: 'jiyan',
    kind: 'ACTION',
    actionRole: 'DAMAGE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODEL_READY',
    motionValue: null,
    provenance: JIYAN_PROVENANCE,
  };
}

function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return {
    ...rest,
    characterId: 'jiyan',
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    provenance: JIYAN_PROVENANCE,
  };
}

function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return {
    ...input,
    characterId: 'jiyan',
    kind: 'RESOURCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: JIYAN_PROVENANCE,
  };
}

function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return {
    ...input,
    characterId: 'jiyan',
    kind: 'SEQUENCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: JIYAN_PROVENANCE,
  };
}

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation; no skill level is implicitly selected by raw data.';
const FIXED_OUTRO_CONTEXT = 'Current source-fixed Outro coefficient declared directly in Jiyan kit text; no Lv1-Lv10 skill table exists for Discipline.';

export const JIYAN_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'jiyan-basic-lone-lance-1', name: 'Basic Attack — Lone Lance Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.368, .3981, .4283, .4705, .5007, .5354, .5837, .632, .6803, .7316], hitCount: 1, conditional: false }),
  action({ factId: 'jiyan-basic-lone-lance-2', name: 'Basic Attack — Lone Lance Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.22, .238, .256, .2813, .2993, .3201, .3489, .3778, .4067, .4373], hitCount: 1, conditional: false }),
  action({ factId: 'jiyan-basic-lone-lance-3', name: 'Basic Attack — Lone Lance Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.183, .198, .213, .234, .249, .2662, .2902, .3143, .3383, .3638], hitCount: 5, conditional: false }),
  action({ factId: 'jiyan-basic-lone-lance-4', name: 'Basic Attack — Lone Lance Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.333, .3603, .3876, .4258, .4531, .4845, .5282, .5719, .6156, .662], hitCount: 2, conditional: false }),
  action({ factId: 'jiyan-basic-lone-lance-5', name: 'Basic Attack — Lone Lance Stage 5', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.1187, .1284, .1382, .1518, .1615, .1727, .1883, .2039, .2195, .236], hitCount: 7 }, { curve: [.7718, .8351, .8984, .987, 1.0503, 1.1231, 1.2244, 1.3256, 1.4269, 1.5345], hitCount: 2 }], hitCount: null, conditional: false }),
  action({ factId: 'jiyan-heavy-lone-lance', name: 'Heavy Attack — Lone Lance', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1116, .1208, .1299, .1427, .1519, .1624, .1771, .1917, .2064, .222], hitCount: 6, conditional: false, notes: ['Source lists 25 STA cost.'] }),
  action({ factId: 'jiyan-heavy-windborne-strike', name: 'Heavy Attack — Windborne Strike', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.533, .5767, .6204, .6816, .7253, .7755, .8454, .9154, .9853, 1.0596], hitCount: 1, conditional: true, notes: ['Available by holding Basic Attack during Heavy Attack.'] }),
  action({ factId: 'jiyan-heavy-abyssal-slash', name: 'Heavy Attack — Abyssal Slash', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.411, .4447, .4784, .5255, .5592, .598, .6519, .7058, .7598, .8171], hitCount: 1, conditional: true, notes: ['Available by releasing Basic Attack during Heavy Attack.'] }),
  action({ factId: 'jiyan-mid-air-lone-lance', name: 'Mid-air Attack — Lone Lance', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.62, .6708, .7216, .7928, .8436, .9021, .9835, 1.0648, 1.1461, 1.2326], hitCount: 1, conditional: false, notes: ['Source lists 30 STA cost.'] }),
  action({ factId: 'jiyan-mid-air-banner-of-triumph', name: 'Mid-air Attack — Banner of Triumph', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.4, .4328, .4656, .5115, .5443, .582, .6345, .687, .7394, .7952], hitCount: 1, conditional: true, notes: ['Available after Windborne Strike or Windqueller is cast in mid-air.'] }),
  action({ factId: 'jiyan-mid-air-follow-up', name: 'Mid-air Attack — Follow-Up', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.783, .8472, .9114, 1.0013, 1.0655, 1.1393, 1.242, 1.3448, 1.4475, 1.5566], hitCount: 1, conditional: true, notes: ['Available by using Basic Attack after the Mid-air Plunging Attack.'] }),
  action({ factId: 'jiyan-dodge-counter-lone-lance', name: 'Dodge Counter — Lone Lance', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.633, .6849, .7368, .8094, .8613, .921, 1.0041, 1.0871, 1.1702, 1.2584], hitCount: 2, conditional: true }),
  action({ factId: 'jiyan-skill-windqueller', name: 'Resonance Skill — Windqueller', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.535, .5788, .6227, .6841, .728, .7784, .8486, .9188, .989, 1.0636], hitCount: 4, conditional: false, notes: ['Can be cast in the air. Source table lists 7-second cooldown and 16 Concerto Regen.'] }),
  action({ factId: 'jiyan-liberation-lance-of-qingloong-1', name: 'Heavy Attack — Lance of Qingloong Stage 1', section: 'RESONANCE_LIBERATION', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3295, .3566, .3836, .4214, .4484, .4795, .5228, .566, .6093, .6552], hitCount: 8, conditional: true, notes: ['Available only in Qingloong Mode and explicitly considered Heavy Attack DMG.'] }),
  action({ factId: 'jiyan-liberation-lance-of-qingloong-2', name: 'Heavy Attack — Lance of Qingloong Stage 2', section: 'RESONANCE_LIBERATION', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3096, .3349, .3603, .3959, .4213, .4505, .4911, .5317, .5723, .6155], hitCount: 8, conditional: true, notes: ['Available only in Qingloong Mode and explicitly considered Heavy Attack DMG.'] }),
  action({ factId: 'jiyan-liberation-lance-of-qingloong-3', name: 'Heavy Attack — Lance of Qingloong Stage 3', section: 'RESONANCE_LIBERATION', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3358, .3633, .3908, .4294, .4569, .4886, .5327, .5767, .6208, .6676], hitCount: 8, conditional: true, notes: ['Available only in Qingloong Mode and explicitly considered Heavy Attack DMG.'] }),
  action({ factId: 'jiyan-intro-tactical-strike', name: 'Intro Skill — Tactical Strike', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1, 1.082, 1.164, 1.2788, 1.3608, 1.4551, 1.5863, 1.7175, 1.8487, 1.9881], hitCount: 1, conditional: false }),
  action({ factId: 'jiyan-liberation-emerald-storm-finale', name: 'Resonance Liberation — Emerald Storm: Finale', section: 'FORTE_CIRCUIT', actionKind: 'LIBERATION', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.7188, .7777, .8367, .9192, .9781, 1.0459, 1.1402, 1.2345, 1.3288, 1.4291], hitCount: 2 }, { curve: [2.1564, 2.3333, 2.5101, 2.7577, 2.9345, 3.1378, 3.4208, 3.7037, 3.9866, 4.2873], hitCount: 1 }], hitCount: null, conditional: true, notes: ['Requires at least 30 Resolve when casting Emerald Storm: Prelude, consumes 30 Resolve, and is explicitly considered Heavy Attack DMG.'] }),
  {
    factId: 'jiyan-liberation-emerald-storm-prelude',
    characterId: 'jiyan',
    kind: 'ACTION',
    name: 'Resonance Liberation — Emerald Storm: Prelude',
    section: 'RESONANCE_LIBERATION',
    actionKind: 'STATE_CHANGE',
    actionRole: 'NON_DAMAGE',
    damageClass: null,
    scalingStat: 'UNKNOWN',
    motionValue: null,
    motionValueContext: null,
    hitCount: null,
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    conditional: false,
    provenance: JIYAN_PROVENANCE,
    notes: ['Enters Qingloong Mode for 10 seconds. Current source table lists 16s cooldown, 125 Resonance Cost and 10 Concerto Regen. If Resolve is at least 30, the Forte rule additionally consumes 30 Resolve to cast Emerald Storm: Finale.'],
  },
  {
    factId: 'jiyan-outro-discipline',
    characterId: 'jiyan',
    kind: 'ACTION',
    name: 'Outro Skill — Discipline',
    section: 'OUTRO_SKILL',
    actionKind: 'OUTRO',
    actionRole: 'DAMAGE',
    damageClass: 'COORDINATED',
    scalingStat: 'ATK',
    motionValue: null,
    motionValueContext: FIXED_OUTRO_CONTEXT,
    sourceFixedMotionValue: 3.134,
    hitCount: 1,
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: JIYAN_PROVENANCE,
    notes: ['The incoming Resonator\'s Heavy Attack hit summons the coordinated attack. The effect lasts 8s, can trigger once every 1s, and can trigger up to 2 times.'],
  },
] as const;

export const JIYAN_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'jiyan-resource-resolve',
    name: 'Resolve',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Resolve',
    maxValue: 60,
    ruleSummary: 'Jiyan can hold up to 60 Resolve. Normal Attack Lone Lance hits and Intro Skill Tactical Strike hits grant Resolve. If Jiyan does not hit a target for 15 seconds, Resolve gradually decreases. Outside Qingloong Mode, Windqueller can consume 30 Resolve at 30+ Resolve for its 20% damage branch; Emerald Storm: Finale consumes 30 Resolve at 30+ Resolve. In Qingloong Mode Windqueller gains the same 20% damage increase without consuming Resolve.',
  }),
] as const;

export const JIYAN_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'jiyan-state-qingloong-mode',
    name: 'Qingloong Mode',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Jiyan casts Resonance Liberation Emerald Storm: Prelude.',
    effectSummary: 'For 10 seconds, Jiyan has increased resistance to interruption and Basic Attack, Heavy Attack and Dodge Counter are replaced with Heavy Attack Lance of Qingloong.',
    durationSeconds: 10,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'jiyan-forte-windqueller-resolve-branch',
    name: 'Forte Circuit — Windqueller Resolve branch',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Jiyan casts Resonance Skill Windqueller.',
    effectSummary: 'At 30+ Resolve outside Qingloong Mode, consume 30 Resolve to increase Windqueller DMG by 20%. In Qingloong Mode, Windqueller DMG is increased by 20% without consuming Resolve.',
    durationSeconds: null,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'jiyan-inherent-heavenly-balance',
    name: 'Inherent Skill — Heavenly Balance',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Jiyan casts Intro Skill Tactical Strike.',
    effectSummary: 'Jiyan\'s ATK is increased by 10% for 15 seconds.',
    durationSeconds: 15,
    maxStacks: 1,
  }),
  passive({
    factId: 'jiyan-inherent-tempest-taming',
    name: 'Inherent Skill — Tempest Taming',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Jiyan\'s attacks hit a target.',
    effectSummary: 'Jiyan\'s Crit. DMG is increased by 12% for 8 seconds.',
    durationSeconds: 8,
    maxStacks: 1,
  }),
] as const;

export const JIYAN_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'jiyan-s1-benevolence', name: 'S1 — Benevolence', section: 'RESONANCE_CHAIN', sequence: 1, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'Resonance Skill Windqueller can be used 1 more time. When casting Resonance Skill Windqueller, the Resolve cost is decreased by 15.' }),
  sequence({ factId: 'jiyan-s2-versatility', name: 'S2 — Versatility', section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: 'Jiyan casts Intro Skill Tactical Strike.', effectSummary: 'After casting Intro Skill Tactical Strike, Jiyan gains 30 Resolve and his ATK is increased by 28% for 15s. This can be triggered once every 15s.' }),
  sequence({ factId: 'jiyan-s3-spectation', name: 'S3 — Spectation', section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: 'Jiyan casts Windqueller, Emerald Storm: Prelude, Emerald Storm: Finale, or Intro Skill Tactical Strike.', effectSummary: 'When casting Resonance Skill Windqueller, Resonance Liberation Emerald Storm: Prelude, Resonance Skill Emerald Storm: Finale or Intro Skill Tactical Strike, Jiyan\'s Crit. Rate is increased by 16% and Crit. DMG is increased by 32% for 8s.' }),
  sequence({ factId: 'jiyan-s4-prudence', name: 'S4 — Prudence', section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: 'Jiyan casts Emerald Storm: Prelude or Emerald Storm: Finale.', effectSummary: 'When casting Resonance Liberation Emerald Storm: Prelude or Resonance Liberation Emerald Storm: Finale, the Heavy Attack DMG Bonus of all team members is increased by 25% for 30s.' }),
  sequence({ factId: 'jiyan-s5-resolution', name: 'S5 — Resolution', section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: 'Sequence modifies Outro Skill Discipline and Jiyan attack-hit behavior.', effectSummary: 'Outro Skill Discipline gains an additional DMG Multiplier of 120%. When Jiyan\'s attacks hit a target, his ATK is increased by 3% for 8s, stacking up to 15 times; this effect is immediately maxed after he casts Intro Skill Tactical Strike.' }),
  sequence({ factId: 'jiyan-s6-fortitude', name: 'S6 — Fortitude', section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: 'Heavy Attack, Intro Skill Tactical Strike or Resonance Skill Windqueller is used; Finale consumes accumulated Momentum.', effectSummary: 'Every time Heavy Attack, Intro Skill Tactical Strike or Resonance Skill Windqueller is used, Jiyan gains 1 stack of "Momentum", stacking up to 2 times. Resonance Liberation Emerald Storm: Finale consumes all "Momentum", and each stack consumed increases its DMG multiplier by 120%.' }),
] as const;

export const JIYAN_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...JIYAN_ACTION_FACTS,
  ...JIYAN_RESOURCE_FACTS,
  ...JIYAN_PASSIVE_FACTS,
  ...JIYAN_SEQUENCE_FACTS,
] as const;
