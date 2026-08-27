import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterMotionValueCurve,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/baizhi';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/baizhi';
const FANDOM_EMERGENCY_PLAN = 'https://wutheringwaves.fandom.com/wiki/Emergency_Plan';
const FANDOM_MOMENTARY_UNION = 'https://wutheringwaves.fandom.com/wiki/Momentary_Union';
const BILIBILI_WIKI = 'https://wiki.biligame.com/wutheringwaves/%E5%85%B1%E9%B8%A3%E8%80%85/%E7%99%BD%E8%8A%B7';
const WUTHERING_WIKI_RAW = 'https://wuthering.wiki/character_1103.html';

const BAIZHI_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Wuthering.gg — current Baizhi kit',
    'Prydwen — current Baizhi kit',
    'Wuthering Waves Wiki/Fandom — Baizhi skill tables/scaling',
    '鸣潮WIKI/Bilibili — current Baizhi full skill tables',
    'Wuthering.wiki — raw damage-data mirror retained for scaling/type evidence and discrepancy review',
  ],
  sourceUrls: [
    SOURCE_SNAPSHOT,
    WUTHERING_GG,
    PRYDWEN,
    FANDOM_EMERGENCY_PLAN,
    FANDOM_MOMENTARY_UNION,
    BILIBILI_WIKI,
    WUTHERING_WIKI_RAW,
  ],
  checkedAt: CHECKED_AT,
  notes: [
    'The PR #61 importer supplied the pinned Lv1-Lv10 transcription candidate; current Wuthering.gg/Prydwen/Wutheringlab/Bilibili/Fandom pages were used to audit kit semantics, current displayed values and endpoints rather than treating the import itself as verification.',
    'Emergency Plan is HP-scaling damage despite being a Resonance Skill; Fandom labels the skill HP-scaling and the raw damage-data mirror independently reports Base Attribute HP / Type Skill.',
    'Remnant Entities is HP-scaling coordinated damage. The raw damage-data mirror marks Coordinated and Type Liberation; Bellibing therefore stores the damage-bonus class as LIBERATION while retaining coordinated-trigger semantics separately instead of inventing a separate damage bucket.',
    'Current displayed healing tables use Emergency Plan Lv10 1144+5.76%, Overflowing Frost Lv10 150+0.75% and Concentration Lv10 63+0.31%. The raw damage-data mirror exposes 5.77%, 0.76% and 0.32% respectively at its Lv10 backend-data view; Bellibing preserves the current display/source consensus in raw summaries and records the backend/display precision discrepancy here instead of silently reconciling it.',
    'The Forte source text says all Concentration is consumed by Heavy Attack or Emergency Plan and lists 4 Concerto / 8 Concerto / 2.5 Resonance values under those consumption paths. The exact executable per-consumed-stack versus per-cast interpretation of the base table is not guessed here; S1 is independently explicit that its extra 2.5 Resonance Energy is per 1 Concentration.',
  ],
} as const;

const CURVE_CONTEXT = 'Current source Lv1-Lv10 per-listed-hit multiplier curve from the pinned normalized snapshot, source-audited against current Baizhi skill tables; no skill level is implicitly selected.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return {
    ...input,
    characterId: 'baizhi',
    kind: 'ACTION',
    actionRole: 'DAMAGE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODEL_READY',
    motionValue: null,
    provenance: BAIZHI_PROVENANCE,
  };
}

function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return {
    ...rest,
    characterId: 'baizhi',
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    provenance: BAIZHI_PROVENANCE,
  };
}

function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return {
    ...input,
    characterId: 'baizhi',
    kind: 'RESOURCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: BAIZHI_PROVENANCE,
  };
}

function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return {
    ...input,
    characterId: 'baizhi',
    kind: 'SEQUENCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: BAIZHI_PROVENANCE,
  };
}

const BASIC_1: CharacterMotionValueCurve = [.3294, .3564, .3834, .4212, .4482, .4793, .5225, .5657, .6089, .6548];
const BASIC_2: CharacterMotionValueCurve = [.3952, .4276, .4601, .5054, .5378, .5751, .6269, .6788, .7306, .7857];
const BASIC_3: CharacterMotionValueCurve = [.0659, .0713, .0767, .0843, .0897, .0959, .1045, .1132, .1218, .1310];
const BASIC_4: CharacterMotionValueCurve = [.3952, .4276, .4601, .5054, .5378, .5751, .6269, .6788, .7306, .7857];
const HEAVY: CharacterMotionValueCurve = [.2458, .2660, .2861, .3143, .3345, .3577, .3899, .4221, .4544, .4886];
const MID_AIR: CharacterMotionValueCurve = [.3968, .4294, .4619, .5075, .5400, .5774, .6295, .6816, .7336, .7889];
const DODGE_COUNTER: CharacterMotionValueCurve = [.8986, .9723, 1.0460, 1.1491, 1.2228, 1.3075, 1.4254, 1.5433, 1.6612, 1.7865];
const EMERGENCY_PLAN_DAMAGE: CharacterMotionValueCurve = [.0802, .0868, .0934, .1026, .1091, .1167, .1272, .1377, .1482, .1594];
const REMNANT_ENTITIES_DAMAGE: CharacterMotionValueCurve = [.0205, .0222, .0239, .0262, .0279, .0298, .0325, .0352, .0379, .0407];
const INTRO_DAMAGE: CharacterMotionValueCurve = [.4000, .4328, .4656, .5116, .5444, .5821, .6346, .6870, .7395, .7953];

export const BAIZHI_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'baizhi-basic-destined-promise-1', name: 'Basic Attack — Destined Promise Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_1, hitCount: 1, conditional: false }),
  action({ factId: 'baizhi-basic-destined-promise-2', name: 'Basic Attack — Destined Promise Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_2, hitCount: 1, conditional: false }),
  action({ factId: 'baizhi-basic-destined-promise-3', name: 'Basic Attack — Destined Promise Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_3, hitCount: 7, conditional: false, notes: ['Source lists the Stage 3 coefficient explicitly as *7 at every skill level; hit multiplicity remains separate from the curve.'] }),
  action({ factId: 'baizhi-basic-destined-promise-4', name: 'Basic Attack — Destined Promise Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_4, hitCount: 1, conditional: false }),
  action({ factId: 'baizhi-heavy-destined-promise', name: 'Heavy Attack — Destined Promise', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: HEAVY, hitCount: 1, conditional: false, notes: ['Source lists 12.5 Stamina consumption per second. The curve is the listed per-hit coefficient; the raw fact does not invent a held-duration hit count.'] }),
  action({ factId: 'baizhi-mid-air-destined-promise', name: 'Mid-air Attack — Destined Promise', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: MID_AIR, hitCount: 1, conditional: false, notes: ['Source lists 30 Stamina consumption.'] }),
  action({ factId: 'baizhi-dodge-counter-destined-promise', name: 'Dodge Counter — Destined Promise', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: DODGE_COUNTER, hitCount: 1, conditional: true }),
  action({ factId: 'baizhi-skill-emergency-plan-damage', name: 'Resonance Skill — Emergency Plan damage', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'HP', motionValueContext: CURVE_CONTEXT, motionValueCurve: EMERGENCY_PLAN_DAMAGE, hitCount: 1, conditional: false, notes: ['Emergency Plan simultaneously heals the nearby team; that raw healing table is retained in a separate utility fact instead of being placed in damage motionValue fields.', 'Current sources list 16s cooldown and 10 Concerto Energy regen.'] }),
  action({ factId: 'baizhi-liberation-remnant-entities-damage', name: 'Resonance Liberation — Remnant Entities coordinated damage', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'HP', motionValueContext: CURVE_CONTEXT, motionValueCurve: REMNANT_ENTITIES_DAMAGE, hitCount: 1, conditional: true, notes: ['Momentary Union generates 4 Remnant Entity stacks; 1 stack is automatically consumed every 2.5s to perform a Coordinated Attack.', 'Raw damage data marks this hit Coordinated and Type=LIBERATION. damageClass stores the source damage-bonus type; coordinated execution remains separate trigger semantics.'] }),
  action({ factId: 'baizhi-intro-overflowing-frost-damage', name: 'Intro Skill — Overflowing Frost damage', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: INTRO_DAMAGE, hitCount: 1, conditional: false, notes: ['Overflowing Frost is described as one plunging attack and simultaneously heals the nearby team; the healing table is retained separately.', 'Current sources list 10 Concerto Energy regen.'] }),
] as const;

export const BAIZHI_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'baizhi-resource-concentration',
    name: 'Forte Gauge — Concentration',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Concentration',
    maxValue: 4,
    ruleSummary: 'Baizhi can hold up to 4 Concentration. She gains 1 Concentration for every Basic Attack that hits. Casting Heavy Attack or Resonance Skill Emergency Plan consumes all Concentration.',
  }),
] as const;

export const BAIZHI_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'baizhi-skill-emergency-plan-healing',
    name: 'Resonance Skill — Emergency Plan healing',
    section: 'RESONANCE_SKILL',
    conditional: false,
    scope: 'TEAM',
    triggerSummary: 'Baizhi casts Resonance Skill Emergency Plan.',
    effectSummary: 'Immediately heals all characters on nearby teams. Current displayed Lv1-Lv10 HP-scaling healing values are 575+2.90%, 623+3.14%, 670+3.37%, 736+3.71%, 783+3.94%, 837+4.22%, 913+4.60%, 988+4.98%, 1064+5.36%, 1144+5.76%.',
    durationSeconds: null,
    maxStacks: null,
  }),
  passive({
    factId: 'baizhi-liberation-momentary-union-utility',
    name: 'Resonance Liberation — Momentary Union healing and Remnant Entities',
    section: 'RESONANCE_LIBERATION',
    conditional: false,
    scope: 'TEAM',
    triggerSummary: 'Baizhi casts Resonance Liberation Momentary Union.',
    effectSummary: 'Immediately heals the nearby team and generates 4 Remnant Entity stacks. Current displayed initial-heal Lv1-Lv10 values are 310+1.26%, 336+1.36%, 361+1.47%, 397+1.61%, 422+1.71%, 452+1.83%, 492+2.00%, 533+2.16%, 574+2.33%, 617+2.51%. One Remnant stack is automatically consumed every 2.5s for coordinated damage plus team healing; displayed Remnant-heal Lv1-Lv10 values are 349+1.42%, 378+1.53%, 406+1.65%, 446+1.81%, 475+1.93%, 508+2.06%, 554+2.25%, 599+2.43%, 645+2.62%, 694+2.82%. The skill costs 175 Resonance Energy, has 25s cooldown and restores 20 Concerto Energy.',
    durationSeconds: null,
    maxStacks: 4,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['The raw fact preserves automatic 2.5-second stack consumption without converting it into assumed encounter uptime or guaranteed target hits.'],
  }),
  passive({
    factId: 'baizhi-intro-overflowing-frost-healing',
    name: 'Intro Skill — Overflowing Frost healing',
    section: 'INTRO_SKILL',
    conditional: false,
    scope: 'TEAM',
    triggerSummary: 'Baizhi casts Intro Skill Overflowing Frost.',
    effectSummary: 'Heals all characters on a nearby team. Current displayed Lv1-Lv10 HP-scaling healing values are 75+0.38%, 82+0.41%, 88+0.44%, 96+0.48%, 103+0.51%, 110+0.55%, 119+0.60%, 129+0.65%, 139+0.70%, 150+0.75%.',
    durationSeconds: null,
    maxStacks: null,
  }),
  passive({
    factId: 'baizhi-forte-youtan-shared-stats',
    name: "Forte Circuit — You'tan shared stats",
    section: 'FORTE_CIRCUIT',
    conditional: false,
    scope: 'OTHER',
    triggerSummary: "You'tan is present as Baizhi's Remnant Creature.",
    effectSummary: "You'tan shares all of Baizhi's stats and returns to Baizhi when Baizhi dodges.",
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'baizhi-forte-concentration-consumption',
    name: 'Forte Circuit — Concentration consumption, healing and recovery',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'OTHER',
    triggerSummary: 'Baizhi casts Heavy Attack or Emergency Plan while holding Concentration.',
    effectSummary: 'All Concentration is consumed. Each 1 Concentration consumed provides one team-healing instance every 2s. Current displayed Lv1-Lv10 Concentration-heal values are 32+0.16%, 34+0.17%, 37+0.18%, 40+0.20%, 43+0.21%, 46+0.23%, 50+0.25%, 54+0.27%, 58+0.29%, 63+0.31%. The source table additionally lists Heavy Attack with Concentration: 4 Concerto Energy and 2.5 Resonance Energy; Emergency Plan with Concentration: 8 Concerto Energy.',
    durationSeconds: null,
    maxStacks: 4,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['The raw table values are preserved exactly. The base source wording does not explicitly state whether each listed recovery value is applied once per consumed Concentration or once per consuming cast, so executable multiplication is intentionally pending.'],
  }),
  passive({
    factId: 'baizhi-inherent-harmonic-range',
    name: 'Inherent Skill — Harmonic Range',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'TEAM',
    triggerSummary: 'Baizhi casts Resonance Skill Emergency Plan, then a Resonator picks up the generated Euphonia.',
    effectSummary: "Emergency Plan causes You'tan to generate a Euphonia field that lasts 15s. A Resonator who picks up Euphonia gains 15% ATK for 20s.",
    durationSeconds: 20,
    maxStacks: null,
    modelingStatus: 'MODEL_READY',
    notes: ['The Euphonia field lifetime is 15s; durationSeconds records the 20s ATK-buff duration. Pickup/recipient state remains rotation state.'],
  }),
  passive({
    factId: 'baizhi-inherent-stimulus-feedback',
    name: 'Inherent Skill — Stimulus Feedback',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'TEAM',
    triggerSummary: "Baizhi's Heavy Attack hits a target.",
    effectSummary: "Heals the nearby-team character with the lowest HP by 0.25% of Baizhi's Max HP.",
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'MODEL_READY',
  }),
  passive({
    factId: 'baizhi-outro-rejuvinating-flow',
    name: 'Outro Skill — Rejuvinating Flow',
    section: 'OUTRO_SKILL',
    conditional: true,
    scope: 'NEXT_CHARACTER',
    triggerSummary: 'Baizhi casts Outro Skill and the incoming Resonator receives the healing effect.',
    effectSummary: "Heals the incoming Resonator by 1.54% of Baizhi's Max HP every 3s for 30s. A Resonator receiving this healing has DMG Amplified by 15% for 6s.",
    durationSeconds: 30,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['The source gives a 30s repeating-heal window and a separate 6s damage-amplification duration after receiving the heal. Exact refresh/overlap timing belongs to executable rotation state.'],
  }),
] as const;

export const BAIZHI_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'baizhi-s1-complex-simplicity', name: 'S1 — Complex Simplicity', section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: 'Active at Sequence 1 or higher; Emergency Plan consumes Concentration.', effectSummary: 'Emergency Plan additionally restores 2.5 Resonance Energy for every 1 Concentration consumed.' }),
  sequence({ factId: 'baizhi-s2-silent-tundra', name: 'S2 — Silent Tundra', section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: 'Active at Sequence 2 or higher; Emergency Plan is cast while Baizhi has 4 Concentration.', effectSummary: "Increases Baizhi's Glacio DMG Bonus by 15% and her Healing by 15% for 12s." }),
  sequence({ factId: 'baizhi-s3-veritas-lux-mea', name: 'S3 — Veritas Lux Mea', section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: 'Active at Sequence 3 or higher; Baizhi casts Intro Skill Overflowing Frost.', effectSummary: "Increases Baizhi's Max HP by 12% for 10s." }),
  sequence({ factId: 'baizhi-s4-eternal-verity', name: 'S4 — Eternal Verity', section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: 'Active at Sequence 4 or higher; Baizhi casts Resonance Liberation Momentary Union.', effectSummary: "Enhances Remnant Entities: they can be performed 2 additional times, their healing multiplier is increased by 20%, and they deal additional Glacio DMG equal to 1.20% of Baizhi's Max HP." }),
  sequence({ factId: 'baizhi-s5-a-wish-answered', name: 'S5 — A Wish Answered', section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: 'A team member is knocked out while Baizhi is alive on the team.', effectSummary: 'Immediately revives that team member and restores 100% of their Max HP. Can trigger once every 10 minutes.' }),
  sequence({ factId: 'baizhi-s6-seekers-devotion', name: "S6 — Seeker's Devotion", section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: 'Euphonia is picked up.', effectSummary: 'Increases the Glacio DMG Bonus of all nearby characters by 12% for 20s.' }),
] as const;

export const BAIZHI_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...BAIZHI_ACTION_FACTS,
  ...BAIZHI_RESOURCE_FACTS,
  ...BAIZHI_PASSIVE_FACTS,
  ...BAIZHI_SEQUENCE_FACTS,
] as const;
