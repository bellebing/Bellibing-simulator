import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = "2026-08-28";
const SOURCE_SNAPSHOT = "https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json";

export const LUMI_PROVENANCE = {
  sourceLabels: ["wuwabuild normalized Character snapshot — exact pinned upstream commit", "Prydwen — current Lumi kit", "Wuthering.wiki — current Lumi multiplier tables and damage data", "Wuthering.gg — current Lumi kit cross-check"],
  sourceUrls: ["https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json", "https://www.prydwen.gg/wuthering-waves/characters/lumi", "https://wuthering.wiki/character_1504.html", "https://wuthering.gg/characters/lumi"],
  checkedAt: CHECKED_AT,
  notes: [
    "The pinned PR #66/#68 promotion-review pipeline supplies exact Lv1-Lv10 transcription structures; current Prydwen, Wuthering.wiki and Wuthering.gg were used for semantic verification.",
    "All canonical Lumi damage is ATK-scaling. Red Light Heavy Attack, Energized Pounce/Rebound, Spotlight variants and Laser use the explicit source damage buckets; Energized skills and Laser are Basic Attack DMG despite their trigger/section ownership.",
    "Yellow/Red Light mode changes, Spotlight termination, Spark generation/consumption and Laser beam count stay RAW_ONLY without assumed hit cadence or automatic full-Spark uptime.",
    "Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.",
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: "lumi", kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: LUMI_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: "lumi", kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: LUMI_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: "lumi", kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: LUMI_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: "lumi", kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: LUMI_PROVENANCE };
}

export const LUMI_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: "lumi-basic-attack-navigation-support-yellow-light-basic-attack", name: "Navigation Support — Yellow Light: Basic Attack", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.16, 0.1732, 0.1863, 0.2047, 0.2178, 0.2329, 0.2539, 0.2748, 0.2958, 0.3181], hitCount: 3, conditional: false }),
  action({ factId: "lumi-basic-attack-navigation-support-glitter", name: "Navigation Support — Glitter", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.32, 0.3463, 0.3725, 0.4093, 0.4355, 0.4657, 0.5077, 0.5496, 0.5916, 0.6362], hitCount: 1, conditional: false }),
  action({ factId: "lumi-basic-attack-navigation-support-yellow-light-plunging-attack", name: "Navigation Support — Yellow Light: Plunging Attack", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.48, 0.5194, 0.5588, 0.6139, 0.6532, 0.6985, 0.7615, 0.8244, 0.8874, 0.9543], hitCount: 1, conditional: false }),
  action({ factId: "lumi-basic-attack-navigation-support-red-light-basic-attack-1-dmg", name: "Navigation Support — Red Light: Basic Attack 1 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.456, 0.4934, 0.5308, 0.5832, 0.6206, 0.6636, 0.7234, 0.7832, 0.8431, 0.9066], hitCount: 1, conditional: false }),
  action({ factId: "lumi-basic-attack-navigation-support-red-light-basic-attack-2-dmg", name: "Navigation Support — Red Light: Basic Attack 2 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.5415, 0.586, 0.6304, 0.6925, 0.7369, 0.788, 0.859, 0.9301, 1.0011, 1.0766], hitCount: 1 }, { curve: [0.1083, 0.1172, 0.1261, 0.1385, 0.1474, 0.1576, 0.1718, 0.1861, 0.2003, 0.2154], hitCount: 5 }], hitCount: null, conditional: false }),
  action({ factId: "lumi-basic-attack-navigation-support-red-light-basic-attack-3-dmg", name: "Navigation Support — Red Light: Basic Attack 3 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.3249, 0.3516, 0.3782, 0.4155, 0.4422, 0.4728, 0.5154, 0.5581, 0.6007, 0.646], hitCount: 1 }, { curve: [0.7581, 0.8203, 0.8825, 0.9695, 1.0317, 1.1032, 1.2026, 1.3021, 1.4015, 1.5072], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: "lumi-basic-attack-navigation-support-red-light-heavy-attack-dmg", name: "Navigation Support — Red Light: Heavy Attack DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3325, 0.3598, 0.3871, 0.4253, 0.4525, 0.4839, 0.5275, 0.5711, 0.6147, 0.6611], hitCount: 2, conditional: false, notes: ["Source explicitly considers Red Light Heavy Attack damage Basic Attack DMG."] }),
  action({ factId: "lumi-basic-attack-navigation-support-red-light-plunging-attack-dmg", name: "Navigation Support — Red Light: Plunging Attack DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.57, 0.6168, 0.6635, 0.729, 0.7757, 0.8295, 0.9042, 0.979, 1.0538, 1.1333], hitCount: 1, conditional: false }),
  action({ factId: "lumi-basic-attack-navigation-support-red-light-dodge-counter-dmg", name: "Navigation Support — Red Light: Dodge Counter DMG", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.8415, 0.9106, 0.9796, 1.0762, 1.1452, 1.2245, 1.3349, 1.4453, 1.5557, 1.673], hitCount: 1 }, { curve: [0.1683, 0.1822, 0.196, 0.2153, 0.2291, 0.2449, 0.267, 0.2891, 0.3112, 0.3346], hitCount: 5 }], hitCount: null, conditional: true }),
  action({ factId: "lumi-resonance-skill-searchlight-service-pounce-dmg", name: "Searchlight Service — Pounce DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.912, 0.9868, 1.0616, 1.1663, 1.2411, 1.3271, 1.4468, 1.5664, 1.6861, 1.8132], hitCount: 1, conditional: false }),
  action({ factId: "lumi-resonance-skill-searchlight-service-rebound-dmg", name: "Searchlight Service — Rebound DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.874, 0.9457, 1.0174, 1.1177, 1.1894, 1.2718, 1.3865, 1.5011, 1.6158, 1.7376], hitCount: 1, conditional: false }),
  action({ factId: "lumi-resonance-liberation-squeakie-express-skill-dmg", name: "Squeakie Express — Skill DMG", section: "RESONANCE_LIBERATION", actionKind: "LIBERATION", damageClass: "LIBERATION", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [4.8, 5.1936, 5.5872, 6.1383, 6.5319, 6.9845, 7.6143, 8.244, 8.8738, 9.5429], hitCount: 1, conditional: false }),
  action({ factId: "lumi-intro-skill-special-delivery-skill-dmg", name: "Special Delivery — Skill DMG", section: "INTRO_SKILL", actionKind: "INTRO", damageClass: "INTRO", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2834, 0.3066, 0.3298, 0.3624, 0.3856, 0.4123, 0.4495, 0.4867, 0.5238, 0.5633], hitCount: 3, conditional: false }),
  action({ factId: "lumi-forte-circuit-signal-light-glare-dmg", name: "Signal Light — Glare DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.41, 0.4437, 0.4773, 0.5244, 0.558, 0.5966, 0.6504, 0.7042, 0.758, 0.8152], hitCount: 1, conditional: true }),
  action({ factId: "lumi-forte-circuit-signal-light-red-spotlight-basic-attack-1-dmg", name: "Signal Light — Red Spotlight: Basic Attack 1 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.6048, 0.6544, 0.704, 0.7735, 0.8231, 0.8801, 0.9594, 1.0388, 1.1181, 1.2025], hitCount: 1, conditional: true }),
  action({ factId: "lumi-forte-circuit-signal-light-red-spotlight-basic-attack-2-dmg", name: "Signal Light — Red Spotlight: Basic Attack 2 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.6957, 0.7528, 0.8098, 0.8897, 0.9468, 1.0124, 1.1036, 1.1949, 1.2862, 1.3832], hitCount: 1 }, { curve: [0.1392, 0.1506, 0.162, 0.178, 0.1894, 0.2025, 0.2208, 0.239, 0.2573, 0.2767], hitCount: 5 }], hitCount: null, conditional: true }),
  action({ factId: "lumi-forte-circuit-signal-light-red-spotlight-basic-attack-3-dmg", name: "Signal Light — Red Spotlight: Basic Attack 3 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.4715, 0.5101, 0.5488, 0.6029, 0.6416, 0.686, 0.7479, 0.8097, 0.8716, 0.9373], hitCount: 1 }, { curve: [1.1, 1.1902, 1.2804, 1.4067, 1.4969, 1.6006, 1.7449, 1.8893, 2.0336, 2.1869], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: "lumi-forte-circuit-signal-light-red-spotlight-heavy-attack-dmg", name: "Signal Light — Red Spotlight: Heavy Attack DMG", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.4435, 0.4799, 0.5163, 0.5672, 0.6036, 0.6454, 0.7036, 0.7618, 0.8199, 0.8818], hitCount: 2, conditional: true, notes: ["Spotlight Heavy Attack remains explicitly Basic Attack DMG."] }),
  action({ factId: "lumi-forte-circuit-signal-light-energized-pounce-dmg", name: "Signal Light — Energized Pounce DMG", section: "FORTE_CIRCUIT", actionKind: "SKILL", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.922, 0.9977, 1.0733, 1.1791, 1.2547, 1.3417, 1.4626, 1.5836, 1.7046, 1.8331], hitCount: 2, conditional: true, notes: ["Energized Resonance Skill damage is explicitly considered Basic Attack DMG."] }),
  action({ factId: "lumi-forte-circuit-signal-light-energized-rebound-dmg", name: "Signal Light — Energized Rebound DMG", section: "FORTE_CIRCUIT", actionKind: "SKILL", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.266, 1.3699, 1.4737, 1.619, 1.7228, 1.8422, 2.0083, 2.1744, 2.3405, 2.517], hitCount: 1, conditional: true, notes: ["Energized Resonance Skill damage is explicitly considered Basic Attack DMG."] }),
  action({ factId: "lumi-forte-circuit-signal-light-single-laser-beam-dmg", name: "Signal Light — Single Laser Beam DMG", section: "FORTE_CIRCUIT", actionKind: "FORTE", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.375, 0.4058, 0.4365, 0.4796, 0.5103, 0.5457, 0.5949, 0.6441, 0.6933, 0.7456], hitCount: 1, conditional: true, notes: ["Laser is triggered by Outro Spark consumption and is explicitly considered Basic Attack DMG."] }),
] as const;

export const LUMI_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: "lumi-resource-yellow-light-spark", name: "Yellow Light Spark", section: "FORTE_CIRCUIT", conditional: false, resourceName: "Yellow Light Spark", maxValue: 100, ruleSummary: "Lumi can hold up to 100 Yellow Light Sparks. Yellow Light Basic Attack, Glitter, Glare and Energized Rebound hits, plus casting Intro Skill Special Delivery, generate Yellow Light Spark. Full Yellow Light Spark replaces Resonance Skill with Energized Pounce." }),
  resource({ factId: "lumi-resource-red-light-spark", name: "Red Light Spark", section: "FORTE_CIRCUIT", conditional: false, resourceName: "Red Light Spark", maxValue: 100, ruleSummary: "Lumi can hold up to 100 Red Light Sparks. Navigation Support hits in Red Light Mode or Red Spotlight Mode generate Red Light Spark. Full Red Light Spark replaces Resonance Skill with Energized Rebound." }),
] as const;

export const LUMI_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: "lumi-skill-light-modes", name: "Searchlight Service — Yellow / Red Light Modes", section: "RESONANCE_SKILL", conditional: false, scope: "SELF", triggerSummary: "Lumi uses Pounce/Rebound or is switched onto the field under the source-listed Pounce rule.", effectSummary: "Pounce switches Yellow Light Mode to Red Light Mode; Rebound switches Red Light Mode to Yellow Light Mode. Yellow Light uses ranged attacks and Red Light uses melee attacks. Switching onto the field performs a Pounce without STA cost.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "lumi-forte-spotlight-modes", name: "Signal Light — Spotlight Modes and Laser", section: "FORTE_CIRCUIT", conditional: true, scope: "SELF", triggerSummary: "Cast Energized Pounce/Energized Rebound or cast Outro Skill with Sparks.", effectSummary: "Energized Pounce enters Red Spotlight, which ends after 4 Basic/Heavy attacks. Energized Rebound enters Yellow Spotlight, where Glitter becomes Glare and ends after 6 Glares. Outro consumes all Sparks in the current mode; at least 25 consumed Sparks enables Laser, and every 25 consumed generates 1 extra beam up to 4 beams. No Spark gain cadence beyond the explicit hit/cast rules is assumed.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "lumi-inherent-pathfinding", name: "Inherent Skill — Pathfinding", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Lumi is in Red Light Mode.", effectSummary: "Gain 10% Electro DMG Bonus.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "lumi-inherent-expediting", name: "Inherent Skill — Expediting", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Cast Energized Pounce or Energized Rebound.", effectSummary: "Increase ATK by 10% for 5s.", durationSeconds: 5, maxStacks: null }),
  passive({ factId: "lumi-outro-escorting", name: "Outro Skill — Escorting", section: "OUTRO_SKILL", conditional: false, scope: "NEXT_CHARACTER", triggerSummary: "Lumi casts Outro Skill Escorting.", effectSummary: "The incoming Resonator has Resonance Skill DMG Amplified by 38% for 10s or until switched out.", durationSeconds: 10, maxStacks: null }),
] as const;

export const LUMI_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: "lumi-s1-parcel-to-be-delivered", name: "S1 — Parcel To Be Delivered", section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: "Current S1 Resonance Chain condition.", effectSummary: "After casting Energized Rebound, additionally recovers 60 STA within 3s." }),
  sequence({ factId: "lumi-s2-lollo-logistics-ready-to-help", name: "S2 — Lollo Logistics, Ready to Help", section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: "Current S2 Resonance Chain condition.", effectSummary: "Energized Pounce and Energized Rebound ignore 20% of the target's DEF." }),
  sequence({ factId: "lumi-s3-priority-parcel-in-transit", name: "S3 — Priority Parcel In Transit", section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: "Current S3 Resonance Chain condition.", effectSummary: "The DMG of Resonance Liberation Squeakie Express is increased by 30%." }),
  sequence({ factId: "lumi-s4-captain-lumi-at-your-service", name: "S4 — Captain Lumi, At Your Service", section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: "Current S4 Resonance Chain condition.", effectSummary: "Gain 30% Basic Attack DMG Bonus." }),
  sequence({ factId: "lumi-s5-parcel-collected-on-time", name: "S5 — Parcel Collected On Time", section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: "Current S5 Resonance Chain condition.", effectSummary: "When Spark is fully recovered, Laser DMG Multiplier is increased by 100%." }),
  sequence({ factId: "lumi-s6-give-me-a-five-star-rating", name: "S6 — Give Me A Five-star Rating", section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: "Current S6 Resonance Chain condition.", effectSummary: "Casting Resonance Liberation Squeakie Express increases all team members' ATK by 20% for 20s." }),
] as const;

export const LUMI_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...LUMI_ACTION_FACTS,
  ...LUMI_RESOURCE_FACTS,
  ...LUMI_PASSIVE_FACTS,
  ...LUMI_SEQUENCE_FACTS,
] as const;
