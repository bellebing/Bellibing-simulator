import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = "2026-08-28";
const SOURCE_SNAPSHOT = "https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json";

export const ROVER_HAVOC_PROVENANCE = {
  sourceLabels: ["wuwabuild normalized Character snapshot — exact pinned upstream commit", "Prydwen — current Rover (Havoc) kit", "Current raw/skill data cross-check — Rover (Havoc)"],
  sourceUrls: [SOURCE_SNAPSHOT, "https://www.prydwen.gg/wuthering-waves/characters/rover-havoc", "https://wuthering.wiki/character_1604.html"],
  checkedAt: CHECKED_AT,
  notes: [
    "The pinned PR #66/#68 promotion-review pipeline supplies exact Lv1-Lv10 transcription structures; current source pages were used for semantic verification.",
    "Devastation and Thwackblade are explicitly Heavy Attack DMG; Dark Surge replacements preserve Basic/Heavy/Skill identity instead of inheriting the Forte section label.",
    "Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this Rover (Havoc) semantic/source review; no generated candidate status was promoted automatically.",
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';
const FIXED_CONTEXT = 'Exact source-fixed Character damage coefficient declared directly by the current kit without a Lv1-Lv10 table; no talent-level curve is fabricated.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: "rover-havoc", kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: ROVER_HAVOC_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: "rover-havoc", kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: ROVER_HAVOC_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: "rover-havoc", kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ROVER_HAVOC_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: "rover-havoc", kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ROVER_HAVOC_PROVENANCE };
}

export const ROVER_HAVOC_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: "rover-havoc-basic-attack-tuneslayer-stage-1-dmg", name: "Tuneslayer — Stage 1 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.285, 0.3084, 0.3318, 0.3645, 0.3879, 0.4148, 0.4521, 0.4895, 0.5269, 0.5667], hitCount: 1, conditional: false }),
  action({ factId: "rover-havoc-basic-attack-tuneslayer-stage-2-dmg", name: "Tuneslayer — Stage 2 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.285, 0.3084, 0.3318, 0.3645, 0.3879, 0.4148, 0.4521, 0.4895, 0.5269, 0.5667], hitCount: 2, conditional: false }),
  action({ factId: "rover-havoc-basic-attack-tuneslayer-stage-3-dmg", name: "Tuneslayer — Stage 3 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.4275, 0.4626, 0.4977, 0.5467, 0.5818, 0.6221, 0.6782, 0.7343, 0.7904, 0.85], hitCount: 1, conditional: false }),
  action({ factId: "rover-havoc-basic-attack-tuneslayer-stage-4-dmg", name: "Tuneslayer — Stage 4 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2027, 0.2193, 0.236, 0.2592, 0.2758, 0.295, 0.3215, 0.3481, 0.3747, 0.403], hitCount: 3, conditional: false }),
  action({ factId: "rover-havoc-basic-attack-tuneslayer-stage-5-dmg", name: "Tuneslayer — Stage 5 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.475, 0.514, 0.5529, 0.6075, 0.6464, 0.6912, 0.7535, 0.8159, 0.8782, 0.9444], hitCount: 2, conditional: false }),
  action({ factId: "rover-havoc-basic-attack-tuneslayer-heavy-attack-dmg", name: "Tuneslayer — Heavy Attack DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.48, 0.5194, 0.5588, 0.6139, 0.6532, 0.6985, 0.7615, 0.8244, 0.8874, 0.9543], hitCount: 1, conditional: false }),
  action({ factId: "rover-havoc-basic-attack-tuneslayer-mid-air-attack-dmg", name: "Tuneslayer — Mid-air Attack DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.589, 0.6373, 0.6856, 0.7533, 0.8016, 0.8571, 0.9344, 1.0117, 1.0889, 1.171], hitCount: 1, conditional: false }),
  action({ factId: "rover-havoc-basic-attack-tuneslayer-dodge-counter-dmg", name: "Tuneslayer — Dodge Counter DMG", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.9025, 0.9766, 1.0506, 1.1542, 1.2282, 1.3133, 1.4317, 1.5501, 1.6685, 1.7943], hitCount: 1, conditional: true }),
  action({ factId: "rover-havoc-resonance-skill-wingblade-skill-dmg", name: "Wingblade — Skill DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.44, 1.5581, 1.6762, 1.8415, 1.9596, 2.0954, 2.2843, 2.4732, 2.6622, 2.8629], hitCount: 2, conditional: false }),
  action({ factId: "rover-havoc-resonance-liberation-deadening-abyss-skill-dmg", name: "Deadening Abyss — Skill DMG", section: "RESONANCE_LIBERATION", actionKind: "LIBERATION", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [7.65, 8.2773, 8.9046, 9.7829, 10.4102, 11.1316, 12.1352, 13.1389, 14.1426, 15.209], hitCount: 1, conditional: false }),
  action({ factId: "rover-havoc-intro-skill-instant-of-annihilation-skill-dmg", name: "Instant of Annihilation — Skill DMG", section: "INTRO_SKILL", actionKind: "INTRO", damageClass: "INTRO", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1, 1.082, 1.164, 1.2788, 1.3608, 1.4551, 1.5863, 1.7175, 1.8487, 1.9881], hitCount: 1, conditional: false }),
  action({ factId: "rover-havoc-forte-circuit-umbra-eclipse-devastation-damage", name: "Umbra Eclipse — Devastation Damage", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.1475, 1.2416, 1.3357, 1.4675, 1.5616, 1.6698, 1.8203, 1.9709, 2.1214, 2.2814], hitCount: 1, conditional: true, notes: ["Current source explicitly considers this Forte action Heavy Attack DMG."] }),
  action({ factId: "rover-havoc-forte-circuit-umbra-eclipse-umbra-basic-attack-stage-1-dmg", name: "Umbra Eclipse — Umbra: Basic Attack Stage 1 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2835, 0.3068, 0.33, 0.3626, 0.3858, 0.4126, 0.4498, 0.487, 0.5242, 0.5637], hitCount: 1, conditional: true }),
  action({ factId: "rover-havoc-forte-circuit-umbra-eclipse-umbra-basic-attack-stage-2-dmg", name: "Umbra Eclipse — Umbra: Basic Attack Stage 2 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.4725, 0.5113, 0.55, 0.6043, 0.643, 0.6876, 0.7496, 0.8116, 0.8736, 0.9394], hitCount: 1, conditional: true }),
  action({ factId: "rover-havoc-forte-circuit-umbra-eclipse-umbra-basic-attack-stage-3-dmg", name: "Umbra Eclipse — Umbra: Basic Attack Stage 3 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.783, 0.8473, 0.9115, 1.0014, 1.0656, 1.1394, 1.2421, 1.3449, 1.4476, 1.5567], hitCount: 1, conditional: true }),
  action({ factId: "rover-havoc-forte-circuit-umbra-eclipse-umbra-basic-attack-stage-4-dmg", name: "Umbra Eclipse — Umbra: Basic Attack Stage 4 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.1868, 0.2021, 0.2174, 0.2389, 0.2542, 0.2718, 0.2963, 0.3208, 0.3453, 0.3713], hitCount: 3 }, { curve: [0.5603, 0.6062, 0.6522, 0.7165, 0.7624, 0.8153, 0.8888, 0.9623, 1.0358, 1.1139], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: "rover-havoc-forte-circuit-umbra-eclipse-umbra-basic-attack-stage-5-dmg", name: "Umbra Eclipse — Umbra: Basic Attack Stage 5 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.1435, 0.1552, 0.167, 0.1835, 0.1952, 0.2088, 0.2276, 0.2464, 0.2652, 0.2852], hitCount: 4 }, { curve: [0.5738, 0.6208, 0.6679, 0.7338, 0.7808, 0.8349, 0.9102, 0.9855, 1.0607, 1.1407], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: "rover-havoc-forte-circuit-umbra-eclipse-umbra-heavy-attack-dmg", name: "Umbra Eclipse — Umbra: Heavy Attack DMG", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.648, 0.7012, 0.7543, 0.8287, 0.8818, 0.943, 1.028, 1.113, 1.198, 1.2883], hitCount: 1, conditional: true }),
  action({ factId: "rover-havoc-forte-circuit-umbra-eclipse-umbra-thwackblade-damage", name: "Umbra Eclipse — Umbra: Thwackblade Damage", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.637, 0.6893, 0.7415, 0.8146, 0.8669, 0.9269, 1.0105, 1.0941, 1.1777, 1.2665], hitCount: 1 }, { curve: [0.05, 0.0541, 0.0582, 0.064, 0.0681, 0.0728, 0.0794, 0.0859, 0.0925, 0.0995], hitCount: 4 }], hitCount: null, conditional: true, notes: ["Current source explicitly considers this Forte action Heavy Attack DMG."] }),
  action({ factId: "rover-havoc-forte-circuit-umbra-eclipse-umbra-plunging-attack-dmg", name: "Umbra Eclipse — Umbra: Plunging Attack DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.62, 0.6709, 0.7217, 0.7929, 0.8437, 0.9022, 0.9836, 1.0649, 1.1462, 1.2327], hitCount: 1, conditional: true }),
  action({ factId: "rover-havoc-forte-circuit-umbra-eclipse-umbra-dodge-counter-dmg", name: "Umbra Eclipse — Umbra: Dodge Counter DMG", section: "FORTE_CIRCUIT", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.593, 1.7237, 1.8543, 2.0372, 2.1678, 2.318, 2.527, 2.736, 2.945, 3.1671], hitCount: 1, conditional: true }),
  action({ factId: "rover-havoc-forte-circuit-umbra-eclipse-umbra-lifetaker-damage", name: "Umbra Eclipse — Umbra: Lifetaker Damage", section: "FORTE_CIRCUIT", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [1.39, 1.504, 1.618, 1.7776, 1.8916, 2.0226, 2.205, 2.3874, 2.5697, 2.7635], hitCount: 2 }, { curve: [0.05, 0.0541, 0.0582, 0.064, 0.0681, 0.0728, 0.0794, 0.0859, 0.0925, 0.0995], hitCount: 4 }], hitCount: null, conditional: true }),
  action({ factId: "rover-havoc-outro-soundweaver", name: "Soundweaver", section: "OUTRO_SKILL", actionKind: "OUTRO", damageClass: "OUTRO", scalingStat: 'ATK', motionValueContext: FIXED_CONTEXT, sourceFixedMotionValue: 1.433, hitCount: 1, conditional: false, notes: ["Source-fixed 143.3% ATK Havoc damage per field hit. The Havoc Field deals this damage every 2s for 6s."] }),
] as const;

export const ROVER_HAVOC_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: "rover-havoc-resource-umbra", name: "Umbra", section: "FORTE_CIRCUIT", conditional: false, resourceName: "Umbra", maxValue: 100, ruleSummary: "Rover-Havoc holds up to 100 Umbra. Tuneslayer restores Umbra on hit; Wingblade, Lifetaker and Intro Skill Instant of Annihilation restore Umbra when cast. At full Umbra, holding Basic Attack casts Devastation and enters Dark Surge." }),
] as const;

export const ROVER_HAVOC_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: "rover-havoc-forte-dark-surge", name: "Dark Surge", section: "FORTE_CIRCUIT", conditional: true, scope: "SELF", triggerSummary: "Cast Devastation at full Umbra.", effectSummary: "Enter Dark Surge: Basic Attack becomes the five-stage Enhanced Basic string, Heavy becomes Enhanced Heavy/Thwackblade, and Wingblade becomes Lifetaker. Source action replacements remain separate facts; no rotation cadence is assumed.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "rover-havoc-inherent-metamorph", name: "Inherent Skill — Metamorph", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Be in Dark Surge.", effectSummary: "Gain 20% Havoc DMG Bonus.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "rover-havoc-inherent-bleak-crescendo", name: "Inherent Skill — Bleak Crescendo", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "A Basic Attack hits while in Dark Surge.", effectSummary: "Recover 1 extra Resonance Energy; this can trigger once per second.", durationSeconds: null, maxStacks: null }),
] as const;

export const ROVER_HAVOC_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: "rover-havoc-s1-cryptic-insight", name: "S1 — Cryptic Insight", section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: "Current S1 Resonance Chain condition.", effectSummary: "Resonance Skill DMG Bonus is increased by 30%." }),
  sequence({ factId: "rover-havoc-s2-waning-crescent", name: "S2 — Waning Crescent", section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: "Current S2 Resonance Chain condition.", effectSummary: "Reset Resonance Skill's Cooldown when Rover enters the Dark Surge state by casting Heavy Attack Devastation." }),
  sequence({ factId: "rover-havoc-s3-surging-resonance", name: "S3 — Surging Resonance", section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: "Current S3 Resonance Chain condition.", effectSummary: "In the Dark Surge state, Basic Attack 5 restores HP equal to 10% of total HP lost on hit." }),
  sequence({ factId: "rover-havoc-s4-annihilated-silence", name: "S4 — Annihilated Silence", section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: "Current S4 Resonance Chain condition.", effectSummary: "Heavy Attack Devastation and Resonance Liberation Deadening Abyss reduces enemy's Havoc RES by 10% for 20s on hit." }),
  sequence({ factId: "rover-havoc-s5-aeon-symphony", name: "S5 — Aeon Symphony", section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: "Current S5 Resonance Chain condition.", effectSummary: "In the Dark Surge state, Basic Attack 5 deals an additional Havoc DMG equal to 50% of Basic Attack 5 DMG." }),
  sequence({ factId: "rover-havoc-s6-ebbing-undercurrent", name: "S6 — Ebbing Undercurrent", section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: "Current S6 Resonance Chain condition.", effectSummary: "In the Dark Surge state, Rover's Crit. Rate is increased by 25%." }),
] as const;

export const ROVER_HAVOC_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...ROVER_HAVOC_ACTION_FACTS,
  ...ROVER_HAVOC_RESOURCE_FACTS,
  ...ROVER_HAVOC_PASSIVE_FACTS,
  ...ROVER_HAVOC_SEQUENCE_FACTS,
] as const;
