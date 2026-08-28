import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-28';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/youhu';
const WUTHERING_WIKI = 'https://wuthering.wiki/character_1106.html';

export const YOUHU_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Wuthering.gg — current Youhu kit and Resonance Chain',
    'Wuthering.wiki — current multiplier tables and raw damage-data scaling/type cross-check',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, WUTHERING_WIKI],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #66/#68 promotion-review pipeline supplies exact Lv1-Lv10 transcription structures; current Wuthering.gg and Wuthering.wiki were used for semantic verification.',
    'All source-listed Youhu damage entries in the canonical kit are ATK-scaling. Poetic Essence is explicitly considered Resonance Skill DMG even though it is a Forte Circuit action.',
    'Scroll Divination and Poetic Essence healing remain utility semantics, not fabricated Character damage actions. Exact source healing progressions are retained in raw passive summaries.',
    'Lucky Draw, Antique replacement and Auspice combinations remain raw state/resource semantics. No random-draw distribution or assumed combo uptime is introduced.',
    'Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.',
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: 'youhu', kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: YOUHU_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: 'youhu', kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: YOUHU_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: 'youhu', kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: YOUHU_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: 'youhu', kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: YOUHU_PROVENANCE };
}

export const YOUHU_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'youhu-basic-frosty-punches-1', name: 'Basic Attack — Frosty Punches Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.2383, .2579, .2774, .3048, .3243, .3468, .378, .4093, .4405, .4738], hitCount: 1, conditional: false }),
  action({ factId: 'youhu-basic-frosty-punches-2', name: 'Basic Attack — Frosty Punches Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.1605, .1737, .1869, .2053, .2184, .2336, .2546, .2757, .2967, .3191], hitCount: 1 }, { curve: [.2981, .3225, .347, .3812, .4056, .4337, .4728, .5119, .551, .5926], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: 'youhu-basic-frosty-punches-3', name: 'Basic Attack — Frosty Punches Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.1915, .2072, .2229, .2449, .2606, .2786, .3037, .3288, .354, .3806], hitCount: 1 }, { curve: [.234, .2532, .2724, .2993, .3184, .3405, .3712, .4019, .4326, .4652], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: 'youhu-basic-frosty-punches-4', name: 'Basic Attack — Frosty Punches Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.5853, .6333, .6813, .7484, .7964, .8516, .9284, 1.0052, 1.082, 1.1635], hitCount: 1, conditional: false }),
  action({ factId: 'youhu-heavy-frostfall', name: 'Heavy Attack — Frostfall', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.0727, .0787, .0846, .0929, .0989, .1058, .1153, .1248, .1343, .1445], hitCount: 6, conditional: true, notes: ['Requires Frost to be full; Frostfall performs Lucky Draw once after the attack.'] }),
  action({ factId: 'youhu-mid-air-frosty-punches', name: 'Mid-air Attack — Frosty Punches', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.62, .6709, .7217, .7929, .8437, .9022, .9836, 1.0649, 1.1462, 1.2327], hitCount: 1, conditional: false }),
  action({ factId: 'youhu-dodge-counter-frosty-punches', name: 'Dodge Counter — Frosty Punches', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1453, .1573, .1692, .1858, .1978, .2115, .2305, .2496, .2686, .2889], hitCount: 6, conditional: true, notes: ['Available after a successful Dodge while Youhu possesses no Antique; performs Lucky Draw once.'] }),
  action({ factId: 'youhu-skill-scroll-divination', name: 'Resonance Skill — Scroll Divination', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.787, .8516, .9161, 1.0064, 1.071, 1.1452, 1.2484, 1.3517, 1.4549, 1.5646], hitCount: 1, conditional: false, notes: ['The cast also heals nearby party members and performs Lucky Draw; those utility/state semantics are stored separately.'] }),
  action({ factId: 'youhu-skill-antique-appraisal-chime', name: 'Resonance Skill — Antique Appraisal: Chime', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.2065, .2234, .2404, .2641, .281, .3005, .3276, .3546, .3817, .4105], hitCount: 1 }, { curve: [.2507, .2713, .2919, .3206, .3412, .3648, .3977, .4306, .4635, .4985], hitCount: 3 }, { curve: [.5162, .5585, .6008, .6601, .7024, .7511, .8188, .8865, .9542, 1.0262], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: 'youhu-skill-antique-appraisal-ruyi', name: 'Resonance Skill — Antique Appraisal: Ruyi', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.6891, .7456, .8021, .8813, .9378, 1.0027, 1.0931, 1.1836, 1.274, 1.37], hitCount: 1 }, { curve: [.8423, .9113, .9804, 1.0771, 1.1461, 1.2256, 1.3361, 1.4466, 1.5571, 1.6745], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: 'youhu-skill-antique-appraisal-ding', name: 'Resonance Skill — Antique Appraisal: Ding', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.1438, .1555, .1673, .1838, .1956, .2092, .228, .2469, .2657, .2857], hitCount: 6 }, { curve: [.5749, .622, .6691, .7351, .7823, .8365, .9119, .9873, 1.0627, 1.1428], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: 'youhu-skill-antique-appraisal-mask', name: 'Resonance Skill — Antique Appraisal: Mask', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.0577, .0624, .0671, .0737, .0785, .0839, .0915, .099, .1066, .1146], hitCount: 9 }, { curve: [.2223, .2406, .2588, .2843, .3025, .3235, .3527, .3818, .411, .442], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: 'youhu-liberation-fortunes-favor', name: "Resonance Liberation — Fortune's Favor", section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.6458, 1.7807, 1.9157, 2.1046, 2.2395, 2.3947, 2.6106, 2.8266, 3.0425, 3.2719], hitCount: 1, conditional: false, notes: ['After the blast, the source allows choosing one of four Antique buttons within the specified time; otherwise one random Antique is obtained.'] }),
  action({ factId: 'youhu-intro-scroll-of-wonders', name: 'Intro Skill — Scroll of Wonders', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.45, .4869, .5238, .5755, .6124, .6548, .7139, .7729, .832, .8947], hitCount: 1 }, { curve: [.55, .5951, .6402, .7034, .7485, .8004, .8725, .9447, 1.0168, 1.0935], hitCount: 1 }], hitCount: null, conditional: false, notes: ['The Intro also performs Lucky Draw once.'] }),
  action({ factId: 'youhu-forte-poetic-essence', name: 'Forte Circuit — Poetic Essence', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1872, .2026, .2179, .2394, .2547, .2724, .2969, .3215, .346, .3721], hitCount: 10, conditional: true, notes: ['Requires four Auspices and consumes all Auspices. Source explicitly considers Poetic Essence Resonance Skill DMG. Combination-specific damage/healing/vibration effects are stored as raw passive semantics rather than pre-applied uptime.'] }),
] as const;

export const YOUHU_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: 'youhu-resource-frost', name: 'Frost', section: 'BASIC_ATTACK', conditional: false, resourceName: 'Frost', maxValue: null, ruleSummary: 'The current source defines a full-Frost condition but does not expose a canonical numeric maximum. While Frost is not full, holding Normal Attack enters Fortune Rolling and restores Frost over time; Basic Attack hits also restore Frost. Full Frost enables Heavy Attack Frostfall.' }),
  resource({ factId: 'youhu-resource-antique', name: 'Antique', section: 'RESONANCE_SKILL', conditional: true, resourceName: 'Antique', maxValue: 1, ruleSummary: 'Lucky Draw grants one random Antique. Only one Antique can exist at a time and a newly drawn Antique replaces the existing one. With an Antique, the next Basic Attack activates the corresponding Antique Appraisal; Antique Appraisal grants the matching Auspice.' }),
  resource({ factId: 'youhu-resource-auspice', name: 'Auspice', section: 'FORTE_CIRCUIT', conditional: false, resourceName: 'Auspice', maxValue: 4, ruleSummary: 'Youhu can hold up to four Auspices. Antique Appraisal grants the corresponding Auspice. At four Auspices, Poetic Essence becomes available and consumes all Auspices when cast.' }),
] as const;

export const YOUHU_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: 'youhu-skill-scroll-divination-utility', name: 'Resonance Skill — Scroll Divination healing and Lucky Draw', section: 'RESONANCE_SKILL', conditional: false, scope: 'TEAM', triggerSummary: 'Youhu casts Scroll Divination.', effectSummary: 'The cast restores HP for all nearby party members and performs Lucky Draw once. Current Lv1-Lv10 healing values are 1041+39.00%, 1097+40.56%, 1162+42.12%, 1302+44.46%, 1469+47.58%, 1627+50.70%, 1655+56.55%, 1692+63.18%, 1720+70.20%, 1767+81.90% ATK.', durationSeconds: null, maxStacks: 1, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'youhu-forte-poetic-essence-effects', name: 'Forte Circuit — Poetic Essence healing and Auspice combinations', section: 'FORTE_CIRCUIT', conditional: true, scope: 'TEAM', triggerSummary: 'Youhu casts Poetic Essence with four Auspices.', effectSummary: 'Poetic Essence heals all nearby party members. Current Lv1-Lv10 healing values are 1180+44.20%, 1243+45.97%, 1317+47.74%, 1475+50.39%, 1665+53.92%, 1844+57.46%, 1876+64.09%, 1918+71.60%, 1949+79.56%, 2002+92.82% ATK. Free Verse additionally reduces hit enemies’ Vibration Strength. Antithesis increases Poetic Essence DMG by 70%. Double Pun additionally heals nearby party members with source values 694+26.00%, 731+27.04%, 775+28.08%, 868+29.64%, 979+31.72%, 1085+33.80%, 1103+37.70%, 1128+42.12%, 1147+46.80%, 1178+54.60% ATK. Triplet increases Poetic Essence DMG by 175%. Perfect Rhyme simultaneously activates Free Verse, Double Pun and Triplet.', durationSeconds: null, maxStacks: 1, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'youhu-inherent-treasured-piece', name: 'Inherent Skill — Treasured Piece', section: 'INHERENT_SKILL', conditional: true, scope: 'TEAM', triggerSummary: 'Youhu casts Resonance Skill Antique Appraisal.', effectSummary: 'Restore HP for all nearby party members based on 30% of the healing provided by Resonance Skill Scroll Divination.', durationSeconds: null, maxStacks: 1, modelingStatus: 'MODEL_READY' }),
  passive({ factId: 'youhu-inherent-rare-find', name: 'Inherent Skill — Rare Find', section: 'INHERENT_SKILL', conditional: true, scope: 'SELF', triggerSummary: 'Youhu casts Intro Skill Scroll of Wonders.', effectSummary: 'Youhu gains 15% Glacio DMG Bonus for 14s.', durationSeconds: 14, maxStacks: 1, modelingStatus: 'MODEL_READY' }),
  passive({ factId: 'youhu-outro-timeless-classics', name: 'Outro Skill — Timeless Classics', section: 'OUTRO_SKILL', conditional: true, scope: 'NEXT_CHARACTER', triggerSummary: 'Youhu casts Outro Skill Timeless Classics.', effectSummary: 'The incoming Resonator has their Coordinated Attack DMG Amplified by 100% for 28s.', durationSeconds: 28, maxStacks: 1, modelingStatus: 'MODEL_READY' }),
] as const;

export const YOUHU_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'youhu-s1-waterside-respite', name: 'S1 — Waterside Respite', section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: 'Youhu casts Lucky Draw.', effectSummary: 'Youhu has a 10% chance to gain immunity to damage and interruption for 5s or until she is switched out.' }),
  sequence({ factId: 'youhu-s2-sunroom-siesta', name: 'S2 — Sunroom Siesta', section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: 'Poetic Essence gains Antithesis, Triplet or Perfect Rhyme effects.', effectSummary: 'The DMG bonus of Antithesis, Triplet and Perfect Rhyme on Poetic Essence is doubled.' }),
  sequence({ factId: 'youhu-s3-restless-sleep', name: 'S3 — Restless Sleep', section: 'RESONANCE_CHAIN', sequence: 3, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: "Youhu's ATK is increased by 20%." }),
  sequence({ factId: 'youhu-s4-frosted-lullaby', name: 'S4 — Frosted Lullaby', section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: 'Youhu casts Resonance Skill Scroll Divination.', effectSummary: 'There is a 20% chance that Scroll Divination will not enter Cooldown.' }),
  sequence({ factId: 'youhu-s5-dreamland-meander', name: 'S5 — Dreamland Meander', section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: 'Youhu casts Intro Skill Scroll of Wonders.', effectSummary: "Youhu's Crit. Rate is increased by 15% for 14s." }),
  sequence({ factId: 'youhu-s6-slumber-evermore', name: 'S6 — Slumber Evermore', section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: 'Youhu casts Resonance Skill Antique Appraisal.', effectSummary: "Gain 1 stack of Sky Blue, stackable up to 4 times for 7s. Each stack increases Youhu's Crit. DMG by 15%." }),
] as const;

export const YOUHU_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...YOUHU_ACTION_FACTS,
  ...YOUHU_RESOURCE_FACTS,
  ...YOUHU_PASSIVE_FACTS,
  ...YOUHU_SEQUENCE_FACTS,
] as const;
