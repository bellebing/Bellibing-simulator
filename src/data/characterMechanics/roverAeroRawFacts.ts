import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-29';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';

export const ROVER_AERO_PROVENANCE = {
  sourceLabels: ['wuwabuild normalized Character snapshot — exact pinned upstream commit', 'Prydwen — current Rover (Aero) kit'],
  sourceUrls: [SOURCE_SNAPSHOT, "https://www.prydwen.gg/wuthering-waves/characters/rover-aero"],
  checkedAt: CHECKED_AT,
  notes: [
    "Exact Lv1-Lv10 tabular structures come from the pinned PR #66/#68 promotion-review artifact; current Prydwen kit text was used for action ownership, damage-bucket, resource/state, Inherent and Outro semantics.",
    "Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this source/semantic review; no candidate status was promoted automatically.",
    "Cloudburst Dance and Unbound Flow retain Resonance Skill DMG classification even where the player input is a Normal Attack; healing tables remain raw utility data."
],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';
const FIXED_CONTEXT = 'Exact source-fixed Character damage coefficient declared directly by the current kit without a Lv1-Lv10 table; no talent-level curve is fabricated.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: "rover-aero", kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: ROVER_AERO_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: "rover-aero", kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: ROVER_AERO_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: "rover-aero", kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ROVER_AERO_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: "rover-aero", kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ROVER_AERO_PROVENANCE };
}

export const ROVER_AERO_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: "rover-aero-basic-attack-wind-cutter-stage-1-dmg", name: "Wind Cutter — Stage 1 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1776,0.1922,0.2068,0.2272,0.2417,0.2585,0.2818,0.3051,0.3284,0.3531], hitCount: 1, conditional: false }),
  action({ factId: "rover-aero-basic-attack-wind-cutter-stage-2-dmg", name: "Wind Cutter — Stage 2 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2166,0.2343,0.2521,0.2769,0.2947,0.3151,0.3435,0.3719,0.4003,0.4305], hitCount: 2, conditional: false }),
  action({ factId: "rover-aero-basic-attack-wind-cutter-stage-3-dmg", name: "Wind Cutter — Stage 3 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.2769,0.2996,0.3223,0.3541,0.3768,0.4029,0.4392,0.4756,0.5119,0.5505], hitCount: 1 }, { curve: [0.01,0.0109,0.0117,0.0128,0.0137,0.0146,0.0159,0.0172,0.0185,0.0199], hitCount: 25 }], hitCount: null, conditional: false }),
  action({ factId: "rover-aero-basic-attack-wind-cutter-stage-4-dmg", name: "Wind Cutter — Stage 4 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3859,0.4176,0.4492,0.4935,0.5251,0.5615,0.6121,0.6628,0.7134,0.7672], hitCount: 1, conditional: false }),
  action({ factId: "rover-aero-basic-attack-wind-cutter-heavy-attack-dmg", name: "Wind Cutter — Heavy Attack DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.0901,0.0975,0.1049,0.1152,0.1226,0.1311,0.1429,0.1548,0.1666,0.1791], hitCount: 3, conditional: false }),
  action({ factId: "rover-aero-basic-attack-wind-cutter-razor-wind-dmg", name: "Wind Cutter — Razor Wind DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.183,0.198,0.213,0.234,0.249,0.2662,0.2902,0.3142,0.3382,0.3637], hitCount: 1 }, { curve: [0.2236,0.242,0.2603,0.286,0.3043,0.3254,0.3547,0.384,0.4134,0.4446], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: "rover-aero-basic-attack-wind-cutter-mid-air-attack-dmg", name: "Wind Cutter — Mid-air Attack DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.708,0.7661,0.8242,0.9054,0.9635,1.0303,1.1232,1.216,1.3089,1.4076], hitCount: 1, conditional: false }),
  action({ factId: "rover-aero-basic-attack-wind-cutter-dodge-counter-dmg", name: "Wind Cutter — Dodge Counter DMG", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.6309,0.6827,0.7344,0.8068,0.8585,0.918,1.0008,1.0836,1.1663,1.2543], hitCount: 1 }, { curve: [0.01,0.0109,0.0117,0.0128,0.0137,0.0146,0.0159,0.0172,0.0185,0.0199], hitCount: 25 }], hitCount: null, conditional: true }),
  action({ factId: "rover-aero-resonance-skill-illusion-breaker-awakening-gale-dmg", name: "Illusion Breaker — Awakening Gale DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.3342,0.3616,0.389,0.4274,0.4548,0.4863,0.5302,0.574,0.6178,0.6644], hitCount: 1 }, { curve: [0.5013,0.5424,0.5835,0.6411,0.6822,0.7294,0.7952,0.861,0.9267,0.9966], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: "rover-aero-resonance-skill-illusion-breaker-skyfall-severance-dmg", name: "Illusion Breaker — Skyfall Severance DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.1176,0.1272,0.1369,0.1503,0.16,0.1711,0.1865,0.2019,0.2173,0.2337], hitCount: 3 }, { curve: [0.5289,0.5723,0.6157,0.6764,0.7197,0.7696,0.839,0.9084,0.9778,1.0515], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: "rover-aero-resonance-liberation-omega-storm-skill-dmg", name: "Omega Storm — Skill DMG", section: "RESONANCE_LIBERATION", actionKind: "LIBERATION", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [2.7,2.9214,3.1428,3.4528,3.6742,3.9288,4.2831,4.6373,4.9915,5.3679], hitCount: 1, conditional: false }),
  action({ factId: "rover-aero-intro-skill-relentless-squall-skill-dmg", name: "Relentless Squall — Skill DMG", section: "INTRO_SKILL", actionKind: "INTRO", damageClass: "INTRO", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.4,0.4328,0.4656,0.5116,0.5444,0.5821,0.6346,0.687,0.7395,0.7953], hitCount: 1 }, { curve: [0.6,0.6492,0.6984,0.7673,0.8165,0.8731,0.9518,1.0305,1.1093,1.1929], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: "rover-aero-forte-circuit-cycle-of-wind-cloudburst-dance-stage-1-dmg", name: "Cycle of Wind — Cloudburst Dance Stage 1 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.6479,0.701,0.7541,0.8285,0.8816,0.9427,1.0277,1.1127,1.1977,1.288], hitCount: 1, conditional: true, notes: ["Current source explicitly considers this Forte damage Resonance Skill DMG."] }),
  action({ factId: "rover-aero-forte-circuit-cycle-of-wind-cloudburst-dance-stage-2-dmg", name: "Cycle of Wind — Cloudburst Dance Stage 2 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.7116,0.7699,0.8283,0.91,0.9683,1.0354,1.1288,1.2221,1.3155,1.4147], hitCount: 1, conditional: true, notes: ["Current source explicitly considers this Forte damage Resonance Skill DMG."] }),
  action({ factId: "rover-aero-forte-circuit-cycle-of-wind-unbound-flow-stage-1-dmg", name: "Cycle of Wind — Unbound Flow Stage 1 DMG", section: "FORTE_CIRCUIT", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1726,0.1867,0.2009,0.2207,0.2348,0.2511,0.2737,0.2963,0.319,0.343], hitCount: 5, conditional: true, notes: ["Current source explicitly considers this Forte damage Resonance Skill DMG."] }),
  action({ factId: "rover-aero-forte-circuit-cycle-of-wind-unbound-flow-stage-2-dmg", name: "Cycle of Wind — Unbound Flow Stage 2 DMG", section: "FORTE_CIRCUIT", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [3.6368,3.935,4.2332,4.6507,4.949,5.2919,5.769,6.2462,6.7233,7.2303], hitCount: 1, conditional: true, notes: ["Current source explicitly considers this Forte damage Resonance Skill DMG."] }),
] as const;

export const ROVER_AERO_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: "rover-aero-resource-windstrings", name: "Windstrings", section: "FORTE_CIRCUIT", conditional: false, resourceName: "Windstrings", maxValue: 120, ruleSummary: "Rover holds up to 120 Windstrings. Each Cloudburst Dance stage restores 25 on hit; Intro restores 20; Basic Stage 3/4 and Dodge Counter hits restore 10. Each Unbound Flow stage consumes 60." }),
] as const;

export const ROVER_AERO_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: "rover-aero-utility-healing-curves", name: "Omega Storm / Cloudburst Dance healing tables", section: "FORTE_CIRCUIT", conditional: true, scope: "TEAM", triggerSummary: "Current source condition for this raw mechanic.", effectSummary: "Exact Lv1-Lv10 flat+ATK healing tables are preserved as raw utility data. Omega Storm flat [1100,1232,1375,1540,1738,1925,1958,2002,2035,2090] + ATK coefficients [36.67,38.13,39.6,41.8,44.73,47.67,53.17,59.4,66,77]%. Cloudburst Dance flat [330,369,412,462,521,577,587,600,610,627] + ATK coefficients [11,11.44,11.88,12.54,13.42,14.3,15.95,17.82,19.8,23.1]%.", durationSeconds: null, maxStacks: null, modelingStatus: "RAW_ONLY" }),
  passive({ factId: "rover-aero-inherent-sand-in-the-storm", name: "Inherent Skill — Sand in the Storm", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Current source condition for this raw mechanic.", effectSummary: "Casting Intro Skill Relentless Squall increases ATK by 20% for 10s.", durationSeconds: 10, maxStacks: null, modelingStatus: "RAW_ONLY" }),
  passive({ factId: "rover-aero-inherent-boundless-winds", name: "Inherent Skill — Boundless Winds", section: "INHERENT_SKILL", conditional: false, scope: "SELF", triggerSummary: "Current source condition for this raw mechanic.", effectSummary: "Increase healing from Resonance Liberation Omega Storm by 20%.", durationSeconds: null, maxStacks: null, modelingStatus: "RAW_ONLY" }),
  passive({ factId: "rover-aero-outro-storms-echo", name: "Outro Skill — Storm’s Echo", section: "OUTRO_SKILL", conditional: true, scope: "TEAM", triggerSummary: "Current source condition for this raw mechanic.", effectSummary: "Grant Aeolian Realm to all nearby team Resonators for 30s. On hitting a target, Aeolian Realm increases that target's maximum Aero Erosion stacks by 3 for 10s; this effect does not stack.", durationSeconds: 30, maxStacks: null, modelingStatus: "RAW_ONLY" }),
] as const;

export const ROVER_AERO_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: "rover-aero-s1-storm-subsides-in-the-void", name: "S1 — Storm Subsides in the Void", section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: "Current S1 Resonance Chain condition.", effectSummary: "Casting Mid-air Attack Cloudburst Dance enhances Rover's resistance to interruption for {0}s.\nSource raw numeric parameters (preserved in source order; not auto-bound where importer positional mapping is ambiguous): 3" }),
  sequence({ factId: "rover-aero-s2-glimmers-fade-into-the-dark", name: "S2 — Glimmers Fade into the Dark", section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: "Current S2 Resonance Chain condition.", effectSummary: "Casting Resonance Skill Unbound Flow continuously restores HP for the Resonator on the field by {1} of Rover's ATK every {0}s for {2}s. When the Resonator on the field has an HP lower than {3}, immediately restore {4} of their lost HP. This restoration effect can be triggered once every {5}s and will not be affected by any Healing Bonus.\nSource raw numeric parameters (preserved in source order; not auto-bound where importer positional mapping is ambiguous): 3, 20%, 30, 35%, 10%, 10" }),
  sequence({ factId: "rover-aero-s3-illusions-collapse-in-a-grip", name: "S3 — Illusions Collapse in a Grip", section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: "Current S3 Resonance Chain condition.", effectSummary: "Aero DMG Bonus is increased by {0}.\nSource raw numeric parameters (preserved in source order; not auto-bound where importer positional mapping is ambiguous): 15%" }),
  sequence({ factId: "rover-aero-s4-boundaries-shatter-in-an-instant", name: "S4 — Boundaries Shatter in an Instant", section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: "Current S4 Resonance Chain condition.", effectSummary: "Casting Mid-air Attack Cloudburst Dance increases Resonance Skill DMG Bonus by {0} for {1}s.\nSource raw numeric parameters (preserved in source order; not auto-bound where importer positional mapping is ambiguous): 15%, 5" }),
  sequence({ factId: "rover-aero-s5-life-and-death-intertwine", name: "S5 — Life and Death Intertwine", section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: "Current S5 Resonance Chain condition.", effectSummary: "The DMG Multiplier of Resonance Liberation Omega Storm is increased by {0}.\nSource raw numeric parameters (preserved in source order; not auto-bound where importer positional mapping is ambiguous): 20%" }),
  sequence({ factId: "rover-aero-s6-all-crumble-in-the-wind", name: "S6 — All Crumble in the Wind", section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: "Current S6 Resonance Chain condition.", effectSummary: "The DMG Multiplier of Resonance Skill Unbound Flow is increased by {0}.\nSource raw numeric parameters (preserved in source order; not auto-bound where importer positional mapping is ambiguous): 30%" }),
] as const;

export const ROVER_AERO_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...ROVER_AERO_ACTION_FACTS,
  ...ROVER_AERO_RESOURCE_FACTS,
  ...ROVER_AERO_PASSIVE_FACTS,
  ...ROVER_AERO_SEQUENCE_FACTS,
] as const;
