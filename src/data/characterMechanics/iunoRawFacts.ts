import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = "2026-09-04";
const FULL_MOON_DOMAIN_CHECKED_AT = "2026-09-05";
const SOURCE_SNAPSHOT = "https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json";

export const IUNO_PROVENANCE = {
  sourceLabels: ["wuwabuild normalized Character snapshot — exact pinned upstream commit", "Prydwen — current Iuno kit", "Current raw/skill data cross-check — Iuno", "Wutheringlab — current Iuno kit/build"],
  sourceUrls: [SOURCE_SNAPSHOT, "https://www.prydwen.gg/wuthering-waves/characters/iuno", "https://wuthering.wiki/character_1410.html", "https://wutheringlab.com/character/iuno-build/"],
  checkedAt: CHECKED_AT,
  notes: [
    "The pinned PR #66/#68 promotion-review pipeline supplies exact Lv1-Lv10 transcription structures; current source pages were used for semantic verification.",
    "Moonbow, Flux, Arc Beyond the Edge, enhanced Moonbow/Arc and Absolute Fullness are explicitly Resonance Liberation DMG even when triggered through Basic/Heavy/Skill inputs.",
    "Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this Iuno semantic/source review; no generated candidate status was promoted automatically.",
    "Current Prydwen and Wutheringlab cross-checks resolve Full Moon Domain Wan Light recipient semantics: the receiving/active Resonator gains a stack when that Resonator gains a Shield inside the Domain; the trigger cadence is 0.5s, the buff lasts 10s, new stacks reset its duration, the cap is 10 and switching that Resonator off field removes all stacks. Both current guides explicitly discuss Augusta as able to exploit this mechanic through repeated self-shields.",
    "Current sequence sources disagree on S4 shield magnitude/inheritance wording: the pinned raw source plus current Prydwen use 160% ATK and not passed to incoming Resonator, while Wuthering.wiki currently shows conflicting wording. The raw consensus is retained and the conflict remains provenance evidence.",
  ],
} as const;

export const IUNO_FULL_MOON_DOMAIN_PROVENANCE = {
  sourceLabels: [
    "wuwabuild normalized Character snapshot — exact pinned upstream commit",
    "Wutheringlab — current Iuno kit/build",
    "Wuthering.wiki — current Iuno skill table",
    "Wuthering.gg — current Iuno skill table",
  ],
  sourceUrls: [
    SOURCE_SNAPSHOT,
    "https://wutheringlab.com/character/iuno-build/",
    "https://wuthering.wiki/character_1410.html",
    "https://wuthering.gg/characters/iuno",
  ],
  checkedAt: FULL_MOON_DOMAIN_CHECKED_AT,
  notes: [
    "Current source tables independently list Lunar Cycle Duration = 15s and Full Moon Domain Duration = 30s; the two lifecycles must not share one duration field.",
    "Current Wutheringlab explicitly states that Full Moon Domain lasts a fixed 30 seconds and does not end early when Iuno leaves the field.",
    "This provenance owns only the separated Full Moon Domain lifecycle; Wan Light recipient stack semantics remain owned by iuno-full-moon-domain-wan-light-recipient.",
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';
const FIXED_CONTEXT = 'Exact source-fixed Character damage coefficient declared directly by the current kit without a Lv1-Lv10 table; no talent-level curve is fabricated.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: "iuno", kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: IUNO_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: "iuno", kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: IUNO_PROVENANCE };
}
function fullMoonDomainPassive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterPassiveFact {
  return {
    ...input,
    characterId: "iuno",
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: IUNO_FULL_MOON_DOMAIN_PROVENANCE,
  };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: "iuno", kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: IUNO_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: "iuno", kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: IUNO_PROVENANCE };
}

export const IUNO_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: "iuno-basic-attack-moon-steps-moonring-basic-attack-1-dmg", name: "Moon Steps — Moonring - Basic Attack 1 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.441, 0.4772, 0.5134, 0.564, 0.6002, 0.6417, 0.6996, 0.7575, 0.8153, 0.8768], hitCount: 1, conditional: false }),
  action({ factId: "iuno-basic-attack-moon-steps-moonring-basic-attack-2-dmg", name: "Moon Steps — Moonring - Basic Attack 2 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.2317, 0.2507, 0.2697, 0.2963, 0.3153, 0.3371, 0.3675, 0.3979, 0.4283, 0.4606], hitCount: 2 }, { curve: [0.2387, 0.2583, 0.2779, 0.3053, 0.3248, 0.3474, 0.3787, 0.41, 0.4413, 0.4746], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: "iuno-basic-attack-moon-steps-moonring-basic-attack-3-dmg", name: "Moon Steps — Moonring - Basic Attack 3 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.4426, 0.4789, 0.5152, 0.566, 0.6022, 0.644, 0.702, 0.7601, 0.8182, 0.8798], hitCount: 2 }, { curve: [0.456, 0.4934, 0.5308, 0.5831, 0.6205, 0.6635, 0.7233, 0.7831, 0.8429, 0.9065], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: "iuno-basic-attack-moon-steps-mid-air-attack", name: "Moon Steps — Mid-air Attack", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.27, 0.2922, 0.3143, 0.3453, 0.3675, 0.3929, 0.4284, 0.4638, 0.4992, 0.5368], hitCount: 2, conditional: false }),
  action({ factId: "iuno-basic-attack-moon-steps-moonring-dodge-counter", name: "Moon Steps — Moonring - Dodge Counter", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.4129, 0.4467, 0.4806, 0.528, 0.5618, 0.6008, 0.6549, 0.7091, 0.7632, 0.8208], hitCount: 2 }, { curve: [0.4254, 0.4603, 0.4951, 0.544, 0.5789, 0.619, 0.6748, 0.7306, 0.7864, 0.8457], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: "iuno-basic-attack-moon-steps-moonbow-basic-attack-1-dmg", name: "Moon Steps — Moonbow - Basic Attack 1 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.636, 0.6882, 0.7404, 0.8134, 0.8655, 0.9255, 1.0089, 1.0924, 1.1758, 1.2645], hitCount: 1, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-basic-attack-moon-steps-moonbow-basic-attack-2-dmg", name: "Moon Steps — Moonbow - Basic Attack 2 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.28, 0.303, 0.326, 0.3581, 0.3811, 0.4075, 0.4442, 0.4809, 0.5177, 0.5567], hitCount: 3, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-basic-attack-moon-steps-moonbow-basic-attack-3-dmg", name: "Moon Steps — Moonbow - Basic Attack 3 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.84, 0.9089, 0.9778, 1.0742, 1.1431, 1.2223, 1.3325, 1.4427, 1.553, 1.6701], hitCount: 2, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-basic-attack-moon-steps-moonbow-dodge-counter-dmg", name: "Moon Steps — Moonbow - Dodge Counter DMG", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.52, 0.5627, 0.6053, 0.665, 0.7077, 0.7567, 0.8249, 0.8931, 0.9614, 1.0339], hitCount: 3, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-resonance-skill-foresight-fugue-pulse-of-origins-dmg", name: "Foresight Fugue — Pulse of Origins DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.0938, 0.1015, 0.1092, 0.12, 0.1277, 0.1365, 0.1488, 0.1611, 0.1734, 0.1865], hitCount: 7 }, { curve: [0.6565, 0.7104, 0.7642, 0.8396, 0.8934, 0.9553, 1.0415, 1.1276, 1.2137, 1.3052], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: "iuno-resonance-skill-foresight-fugue-closing-refrain-dmg", name: "Foresight Fugue — Closing Refrain DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.7079, 0.7659, 0.824, 0.9052, 0.9633, 1.03, 1.1229, 1.2158, 1.3087, 1.4073], hitCount: 2 }, { curve: [0.7293, 0.7892, 0.849, 0.9327, 0.9925, 1.0613, 1.1569, 1.2526, 1.3483, 1.45], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: "iuno-resonance-skill-foresight-fugue-arc-beyond-the-edge-dmg", name: "Foresight Fugue — Arc Beyond the Edge DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.1055, 1.1962, 1.2869, 1.4138, 1.5044, 1.6087, 1.7537, 1.8987, 2.0438, 2.1979], hitCount: 2, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-resonance-skill-foresight-fugue-unfinished-refrain-dmg", name: "Foresight Fugue — Unfinished Refrain DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.7079, 0.7659, 0.824, 0.9052, 0.9633, 1.03, 1.1229, 1.2158, 1.3087, 1.4073], hitCount: 2 }, { curve: [0.7293, 0.7892, 0.849, 0.9327, 0.9925, 1.0613, 1.1569, 1.2526, 1.3483, 1.45], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: "iuno-resonance-liberation-beneath-lunar-tides-skill-dmg", name: "Beneath Lunar Tides — Skill DMG", section: "RESONANCE_LIBERATION", actionKind: "LIBERATION", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [5.5, 5.951, 6.402, 7.0334, 7.4844, 8.0031, 8.7247, 9.4463, 10.1679, 10.9346], hitCount: 1, conditional: false }),
  action({ factId: "iuno-intro-skill-illuminated-manifestation-skill-dmg", name: "Illuminated Manifestation — Skill DMG", section: "INTRO_SKILL", actionKind: "INTRO", damageClass: "INTRO", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.08, 0.0866, 0.0932, 0.1024, 0.1089, 0.1165, 0.127, 0.1374, 0.1479, 0.1591], hitCount: 7 }, { curve: [0.24, 0.2597, 0.2794, 0.307, 0.3266, 0.3493, 0.3808, 0.4122, 0.4437, 0.4772], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: "iuno-forte-circuit-ebb-and-flow-flux-moonbow-dmg", name: "Ebb and Flow — Flux - Moonbow DMG", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.26, 1.3634, 1.4667, 1.6113, 1.7147, 1.8335, 1.9988, 2.1641, 2.3294, 2.5051], hitCount: 1, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-forte-circuit-ebb-and-flow-flux-moonring-dmg", name: "Ebb and Flow — Flux - Moonring DMG", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3983, 0.431, 0.4636, 0.5093, 0.542, 0.5795, 0.6318, 0.684, 0.7363, 0.7918], hitCount: 4, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-forte-circuit-ebb-and-flow-enhanced-moonbow-basic-attack-1-dmg", name: "Ebb and Flow — Enhanced Moonbow - Basic Attack 1 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.036, 1.121, 1.206, 1.3249, 1.4098, 1.5075, 1.6435, 1.7794, 1.9153, 2.0597], hitCount: 1, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-forte-circuit-ebb-and-flow-enhanced-moonbow-basic-attack-2-dmg", name: "Ebb and Flow — Enhanced Moonbow - Basic Attack 2 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.48, 0.5194, 0.5588, 0.6139, 0.6532, 0.6985, 0.7615, 0.8244, 0.8874, 0.9543], hitCount: 3, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-forte-circuit-ebb-and-flow-enhanced-moonbow-basic-attack-3-dmg", name: "Ebb and Flow — Enhanced Moonbow - Basic Attack 3 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.34, 1.4499, 1.5598, 1.7136, 1.8235, 1.9499, 2.1257, 2.3015, 2.4773, 2.6641], hitCount: 2, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-forte-circuit-ebb-and-flow-enhanced-moonbow-dodge-counter-dmg", name: "Ebb and Flow — Enhanced Moonbow - Dodge Counter DMG", section: "FORTE_CIRCUIT", actionKind: "DODGE_COUNTER", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.7867, 0.8512, 0.9157, 1.006, 1.0705, 1.1447, 1.2479, 1.3511, 1.4544, 1.564], hitCount: 3, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-forte-circuit-ebb-and-flow-enhanced-arc-beyond-the-edge-dmg", name: "Ebb and Flow — Enhanced Arc Beyond the Edge DMG", section: "FORTE_CIRCUIT", actionKind: "SKILL", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.6055, 1.7372, 1.8689, 2.0532, 2.1848, 2.3362, 2.5469, 2.7575, 2.9681, 3.1919], hitCount: 2, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-forte-circuit-ebb-and-flow-absolute-fullness-dmg", name: "Ebb and Flow — Absolute Fullness DMG", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.8, 0.8656, 0.9312, 1.0231, 1.0887, 1.1641, 1.2691, 1.374, 1.479, 1.5905], hitCount: 1, conditional: true, notes: ["Current source explicitly considers this action Resonance Liberation DMG."] }),
  action({ factId: "iuno-outro-from-gloom-to-gleam", name: "From Gloom to Gleam", section: "OUTRO_SKILL", actionKind: "OUTRO", damageClass: "OUTRO", scalingStat: 'ATK', motionValueContext: FIXED_CONTEXT, sourceFixedMotionValue: 1.0, hitCount: 1, conditional: false, notes: ["Source-fixed 100% ATK Aero damage. The incoming Resonator gains 50% Heavy Attack DMG Amplification for 14s or until switched out; Outro casting does not interrupt Absolute Fullness."] }),
] as const;

export const IUNO_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: "iuno-resource-sentience", name: "Sentience", section: "FORTE_CIRCUIT", conditional: false, resourceName: "Sentience", maxValue: 100, ruleSummary: "Iuno holds up to 100 Sentience. Intro restores 40, Resonance Liberation restores 60, and Closing/Unfinished Refrain restore 25. In Lunar Cycle, Moonring Basics, Moonring Dodge Counter and Mid-air Attack restore Sentience on hit. Moonbow/Arc actions consume Sentience to increase their multiplier, restore extra Concerto and heal." }),
] as const;

export const IUNO_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: "iuno-forte-lunar-cycle", name: "Lunar Cycle", section: "FORTE_CIRCUIT", conditional: true, scope: "SELF", triggerSummary: "Cast Closing Refrain or Resonance Liberation; Flux switches Half Moon/New Moon.", effectSummary: "Lunar Cycle has Half Moon and New Moon forms and lasts 15s. Absolute Fullness ends Lunar Cycle. Full Moon Domain lifecycle is owned by the separate Full Moon Domain lifecycle fact.", durationSeconds: 15, maxStacks: null }),
  fullMoonDomainPassive({ factId: "iuno-full-moon-domain-lifecycle", name: "Full Moon Domain — Lifecycle", section: "FORTE_CIRCUIT", conditional: true, scope: "TEAM", triggerSummary: "Cast Heavy Attack - Absolute Fullness; Absolute Fullness ends Lunar Cycle and conjures Full Moon Domain at Iuno's location.", effectSummary: "Full Moon Domain lasts 30s and does not end early when Iuno leaves the field. Resonators inside the Domain periodically restore HP and STA. Recipient-specific Blessing of the Wan Light trigger/stack semantics are owned by the separate Full Moon Domain Wan Light fact.", durationSeconds: 30, maxStacks: null, notes: ["Source skill tables explicitly separate Lunar Cycle Duration 15s from Full Moon Domain Duration 30s."] }),
  passive({ factId: "iuno-full-moon-domain-wan-light-recipient", name: "Full Moon Domain — Blessing of the Wan Light", section: "FORTE_CIRCUIT", conditional: true, scope: "TEAM", triggerSummary: "A receiving Resonator inside Iuno's Full Moon Domain gains a Shield.", effectSummary: "That receiving Resonator gains 1 stack of Blessing of the Wan Light, at most once every 0.5s. Each stack grants 4% all DMG Amplification, up to 10 stacks. The buff lasts 10s; gaining a new stack resets the buff duration. Switching that Resonator off field removes all stacks.", durationSeconds: 10, maxStacks: 10 }),
  passive({ factId: "iuno-forte-healing-curves", name: "Moonbow / Arc / Absolute Fullness healing tables", section: "FORTE_CIRCUIT", conditional: true, scope: "TEAM", triggerSummary: "Use the source-listed Moonbow/Arc/Absolute Fullness/Full Moon Domain healing action.", effectSummary: "Exact ATK-scaling Lv1-Lv10 healing coefficients are preserved from the pinned tables: Moonbow Basic 1/2 [13.03,14.10,15.17,16.67,17.73,18.96,20.67,22.38,24.09,25.91]%; Basic 3 and Arc [24.43,26.44,28.44,31.24,33.25,35.55,38.75,41.96,45.16,48.57]%; Moonbow Dodge and Full Moon Domain [16.29,17.63,18.96,20.83,22.17,23.70,25.84,27.97,30.11,32.38]%; Absolute Fullness [97.71,105.73,113.74,124.96,132.97,142.18,155.00,167.82,180.64,194.26]%.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "iuno-inherent-waxing-ascent", name: "Inherent Skill — Waxing Ascent", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Cast Basic Attack, Heavy Attack, Dodge Counter, Resonance Skill, Resonance Liberation or Intro Skill.", effectSummary: "Gain 1 Shield equal to 32% of Iuno's ATK for 15s. This Shield is not passed to the incoming Resonator.", durationSeconds: 15, maxStacks: null }),
  passive({ factId: "iuno-inherent-derivation", name: "Inherent Skill — Derivation", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Cast Intro Skill or Resonance Liberation.", effectSummary: "Immediately gain 5 stacks of Blessing of the Wan Light.", durationSeconds: null, maxStacks: 5 }),
] as const;

export const IUNO_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: "iuno-s1-wax-or-wane-all-gild-the-bough", name: "S1 — Wax or Wane, All Gild the Bough", section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: "Current S1 Resonance Chain condition.", effectSummary: "When Iuno is in Lunar Cycle, her ATK is increased by 40%.\nWhen Iuno is inside the Full Moon Domain, she additionally restores 1 point of Resonance Energy per second.\nResonance Skill - Arc Beyond the Edge and Heavy Attack - Absolute Fullness become immune to interruption." }),
  sequence({ factId: "iuno-s2-day-or-night-let-this-be-eternal", name: "S2 — Day or Night, Let This Be Eternal", section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: "Current S2 Resonance Chain condition.", effectSummary: "Resonators in the team with 10 stacks of Blessing of the Wan Light gain an additional 40% all DMG Amplification." }),
  sequence({ factId: "iuno-s3-i-drink-deep-of-their-forgetting", name: "S3 — I Drink Deep of Their Forgetting", section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: "Current S3 Resonance Chain condition.", effectSummary: "When Iuno is in Lunar Cycle, DMG dealt by Moonbow - Basic Attack, Resonance Skill - Arc Beyond the Edge, and Moonbow - Dodge Counter is Amplified by 65%.\nWithin a certain period after performing Moonbow - Basic Attack or  Moonbow - Dodge Counter, casting Resonance Skill - Arc Beyond the Edge does not reset the cycle of Moonbow - Basic Attack." }),
  sequence({ factId: "iuno-s4-rainy-season-dwell-in-my-eyes", name: "S4 — Rainy Season Dwell in My Eyes", section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: "Current S4 Resonance Chain condition.", effectSummary: "Casting Heavy Attack - Absolute Fullness grants a Shield equal to 160% of Iuno's ATK to all Resonators in the team for 30s, which cannot be passed on to the incoming Resonator." }),
  sequence({ factId: "iuno-s5-a-thousand-futile-glimpses", name: "S5 — A Thousand Futile Glimpses", section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: "Current S5 Resonance Chain condition.", effectSummary: "Iuno gains 20% Resonance Liberation DMG Bonus." }),
  sequence({ factId: "iuno-s6-i-am-the-constant-in-the-chaos", name: "S6 — I Am the Constant in the Chaos", section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: "Current S6 Resonance Chain condition.", effectSummary: "The DMG Multiplier of Heavy Attack - Absolute Fullness is increased by 1600%. Upon casting this skill, Iuno re-enters Lunar Cycle - New Moon, gains 100 points of Sentience, and resets all the cooldown of Resonance Skill - Arc Beyond the Edge." }),
] as const;

export const IUNO_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...IUNO_ACTION_FACTS,
  ...IUNO_RESOURCE_FACTS,
  ...IUNO_PASSIVE_FACTS,
  ...IUNO_SEQUENCE_FACTS,
] as const;
