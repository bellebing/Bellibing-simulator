import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = "2026-08-28";
const SOURCE_SNAPSHOT = "https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json";

export const CIACCONA_PROVENANCE = {
  sourceLabels: ["wuwabuild normalized Character snapshot — exact pinned upstream commit", "Prydwen — current Ciaccona kit", "Wuthering.wiki — current Ciaccona multiplier tables and damage data"],
  sourceUrls: ["https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json", "https://www.prydwen.gg/wuthering-waves/characters/ciaccona", "https://wuthering.wiki/character_1407.html"],
  checkedAt: CHECKED_AT,
  notes: [
    "The pinned PR #66/#68 promotion-review pipeline supplies exact Lv1-Lv10 transcription structures; current Prydwen and Wuthering.wiki were used for semantic verification.",
    "All canonical Ciaccona Character-owned damage is ATK-scaling. Aimed/Fully Charged Aimed and Quadruple Downbeat are Heavy Attack DMG; Harmonic Allegro is Resonance Skill DMG; Singer’s Triple Cadenza/Tonic are Resonance Liberation DMG.",
    "Solo Concert, Ensemble Sylph continuation/generation, Recital switching/Tonic behavior, Musical Essence, Aero Erosion/Spectro Frazzle application, Inherents and Windcalling Tune remain raw state/effect semantics without assumed rotation cadence or uptime.",
    "Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.",
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';
const FIXED_CONTEXT = 'Current source-fixed Character damage coefficient declared directly in kit text; not a selected talent-level scalar and not a fabricated Lv1-Lv10 curve.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: "ciaccona", kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: CIACCONA_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: "ciaccona", kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: CIACCONA_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: "ciaccona", kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: CIACCONA_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: "ciaccona", kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: CIACCONA_PROVENANCE };
}

export const CIACCONA_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: "ciaccona-basic-attack-quadruple-time-steps-stage-1-dmg", name: "Quadruple Time Steps — Stage 1 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.287, 0.3106, 0.3341, 0.3671, 0.3906, 0.4177, 0.4553, 0.493, 0.5306, 0.5706], hitCount: 1, conditional: false }),
  action({ factId: "ciaccona-basic-attack-quadruple-time-steps-stage-2-dmg", name: "Quadruple Time Steps — Stage 2 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.246, 0.2662, 0.2864, 0.3146, 0.3348, 0.358, 0.3903, 0.4226, 0.4548, 0.4891], hitCount: 1 }, { curve: [0.123, 0.1331, 0.1432, 0.1573, 0.1674, 0.179, 0.1952, 0.2113, 0.2274, 0.2446], hitCount: 2 }, { curve: [0.328, 0.3549, 0.3818, 0.4195, 0.4464, 0.4773, 0.5204, 0.5634, 0.6064, 0.6521], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: "ciaccona-basic-attack-quadruple-time-steps-stage-3-dmg", name: "Quadruple Time Steps — Stage 3 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1661, 0.1797, 0.1933, 0.2124, 0.226, 0.2417, 0.2635, 0.2852, 0.307, 0.3302], hitCount: 4, conditional: false }),
  action({ factId: "ciaccona-basic-attack-quadruple-time-steps-stage-4-dmg", name: "Quadruple Time Steps — Stage 4 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3075, 0.3328, 0.358, 0.3933, 0.4185, 0.4475, 0.4878, 0.5282, 0.5685, 0.6114], hitCount: 4, conditional: false, notes: ["Basic Attack Stage 4 inflicts 1 stack of Aero Erosion and starts Solo Concert; Sylph continuation semantics stay separate from the damage fact."] }),
  action({ factId: "ciaccona-basic-attack-quadruple-time-steps-heavy-attack-dmg", name: "Quadruple Time Steps — Heavy Attack DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.5412, 0.5856, 0.63, 0.6921, 0.7365, 0.7876, 0.8586, 0.9296, 1.0006, 1.076], hitCount: 1, conditional: false }),
  action({ factId: "ciaccona-basic-attack-quadruple-time-steps-aimed-shot-dmg", name: "Quadruple Time Steps — Aimed Shot DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.164, 0.1775, 0.1909, 0.2098, 0.2232, 0.2387, 0.2602, 0.2817, 0.3032, 0.3261], hitCount: 1, conditional: false }),
  action({ factId: "ciaccona-basic-attack-quadruple-time-steps-fully-charged-aimed-shot-dmg", name: "Quadruple Time Steps — Fully Charged Aimed Shot DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.369, 0.3993, 0.4296, 0.4719, 0.5022, 0.537, 0.5854, 0.6338, 0.6822, 0.7337], hitCount: 1, conditional: false }),
  action({ factId: "ciaccona-basic-attack-quadruple-time-steps-mid-air-attack-stage-1-dmg", name: "Quadruple Time Steps — Mid-air Attack Stage 1 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2788, 0.3017, 0.3246, 0.3566, 0.3794, 0.4057, 0.4423, 0.4789, 0.5155, 0.5543], hitCount: 2, conditional: false }),
  action({ factId: "ciaccona-basic-attack-quadruple-time-steps-mid-air-attack-stage-2-dmg", name: "Quadruple Time Steps — Mid-air Attack Stage 2 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.123, 0.1331, 0.1432, 0.1573, 0.1674, 0.179, 0.1952, 0.2113, 0.2274, 0.2446], hitCount: 4, conditional: false }),
  action({ factId: "ciaccona-basic-attack-quadruple-time-steps-dodge-counter-dmg", name: "Quadruple Time Steps — Dodge Counter DMG", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2876, 0.3112, 0.3348, 0.3678, 0.3913, 0.4185, 0.4562, 0.4939, 0.5316, 0.5717], hitCount: 4, conditional: true }),
  action({ factId: "ciaccona-resonance-skill-harmonic-allegro-skill-dmg", name: "Harmonic Allegro — Skill DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2032, 0.2198, 0.2365, 0.2598, 0.2765, 0.2956, 0.3223, 0.3489, 0.3756, 0.4039], hitCount: 4, conditional: false, notes: ["Harmonic Allegro inflicts 1 stack of Aero Erosion."] }),
  action({ factId: "ciaccona-resonance-liberation-singer-s-triple-cadenza-improvised-symphonic-poem-skill-dmg", name: "Singer's Triple Cadenza — Improvised Symphonic Poem Skill DMG", section: "RESONANCE_LIBERATION", actionKind: "LIBERATION", damageClass: "LIBERATION", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [5.535, 5.9889, 6.4428, 7.0782, 7.5321, 8.054, 8.7802, 9.5064, 10.2326, 11.0042], hitCount: 1, conditional: false }),
  action({ factId: "ciaccona-resonance-liberation-singer-s-triple-cadenza-symphonic-poem-tonic-dmg", name: "Singer's Triple Cadenza — Symphonic Poem: Tonic DMG", section: "RESONANCE_LIBERATION", actionKind: "LIBERATION", damageClass: "LIBERATION", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.0308, 0.0333, 0.0358, 0.0394, 0.0419, 0.0448, 0.0488, 0.0529, 0.0569, 0.0612], hitCount: 20, conditional: true, notes: ["Green Tonic inflicts Aero Erosion; Yellow Tonic inflicts Spectro Frazzle."] }),
  action({ factId: "ciaccona-intro-skill-roaming-with-the-wind-skill-dmg", name: "Roaming with the Wind — Skill DMG", section: "INTRO_SKILL", actionKind: "INTRO", damageClass: "INTRO", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.9512, 1.0292, 1.1072, 1.2164, 1.2944, 1.3841, 1.5089, 1.6337, 1.7585, 1.8911], hitCount: 1, conditional: false, notes: ["Roaming with the Wind inflicts 1 stack of Aero Erosion."] }),
  action({ factId: "ciaccona-forte-circuit-symphony-of-wind-and-verse-quadruple-downbeat-dmg", name: "Symphony of Wind and Verse — Quadruple Downbeat DMG", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.158, 0.171, 0.1839, 0.202, 0.215, 0.2299, 0.2506, 0.2713, 0.2921, 0.3141], hitCount: 10 }, { curve: [1.5795, 1.7091, 1.8386, 2.0199, 2.1494, 2.2984, 2.5056, 2.7128, 2.9201, 3.1403], hitCount: 1 }], hitCount: null, conditional: true, notes: ["Requires 3 Musical Essence, consumes all, pulls nearby targets and inflicts 1 stack of Aero Erosion."] }),
] as const;

export const CIACCONA_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: "ciaccona-resource-musical-essence", name: "Musical Essence", section: "FORTE_CIRCUIT", conditional: false, resourceName: "Musical Essence", maxValue: 3, ruleSummary: "Ciaccona can hold up to 3 segments of Musical Essence. Casting Basic Attack Stage 4 or Intro Skill Roaming with the Wind restores 1 segment. Heavy Attack — Quadruple Downbeat becomes available at 3 segments and consumes all Musical Essence." }),
  resource({ factId: "ciaccona-resource-ensemble-sylph", name: "Ensemble Sylph", section: "BASIC_ATTACK", conditional: true, resourceName: "Ensemble Sylph", maxValue: 2, ruleSummary: "Up to 2 Ensemble Sylphs may exist simultaneously. Interrupted Basic Attack Stage 4 or Solo Concert can generate a Sylph that finishes/continues the interrupted action; Harmonic Allegro also generates a Sylph when it interrupts Basic Attack, Heavy Attack, Mid-air Attack or Solo Concert, with the source-listed completion behavior." }),
] as const;

export const CIACCONA_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: "ciaccona-basic-solo-concert", name: "Solo Concert", section: "BASIC_ATTACK", conditional: true, scope: "TEAM", triggerSummary: "Ciaccona or an Ensemble Sylph performs Solo Concert after the source-listed Basic Attack Stage 4 / interruption flow.", effectSummary: "Grant 24% Aero DMG Bonus to all nearby Resonators in the team. The effect is explicitly not stackable.", durationSeconds: null, maxStacks: 1 }),
  passive({ factId: "ciaccona-liberation-recital", name: "Recital", section: "RESONANCE_LIBERATION", conditional: true, scope: "SELF", triggerSummary: "Singer's Triple Cadenza enters Recital.", effectSummary: "Periodic sound-wave interactions generate green/yellow Symphonic Poem: Tonic and recover source-listed Concerto Energy. Switching out does not end Recital and generates the source-defined Tonic; Ciaccona takes 50% less DMG and is immune to interruptions during Recital. Recital ends by recasting Resonance Liberation or switching Ciaccona back onto the field.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "ciaccona-inherent-interlude-tune", name: "Inherent Skill — Interlude Tune", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Cast Resonance Liberation Singer's Triple Cadenza.", effectSummary: "Grant Ciaccona a Shield equal to 100% of Max HP for 4s. Switching Ciaccona out removes the Shield.", durationSeconds: 4, maxStacks: null }),
  passive({ factId: "ciaccona-inherent-winds-of-rinascita", name: "Inherent Skill — Winds of Rinascita", section: "INHERENT_SKILL", conditional: false, scope: "SELF", triggerSummary: "Passive Inherent Skill.", effectSummary: "Increase Heavy Attack — Quadruple Downbeat DMG by 30%.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "ciaccona-outro-windcalling-tune", name: "Outro Skill — Windcalling Tune", section: "OUTRO_SKILL", conditional: false, scope: "TARGET", triggerSummary: "Ciaccona casts Outro Skill Windcalling Tune.", effectSummary: "Aero Erosion DMG dealt to targets near the active Resonator is Amplified by 100% for 30s.", durationSeconds: 30, maxStacks: null }),
] as const;

export const CIACCONA_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: "ciaccona-s1-where-wind-sings", name: "S1 — Where Wind Sings", section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: "Current S1 Resonance Chain condition.", effectSummary: "Casting Resonance Skill Harmonic Allegro grants Ciaccona immunity to interruption for 3s. Casting Basic Attack increases Ciaccona's ATK by 35% for 10s." }),
  sequence({ factId: "ciaccona-s2-song-of-the-four-seasons", name: "S2 — Song of the Four Seasons", section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: "Current S2 Resonance Chain condition.", effectSummary: "During Resonance Liberation Singer's Triple Cadenza, Resonators in the team gain 40% Aero DMG Bonus." }),
  sequence({ factId: "ciaccona-s3-starlit-improv", name: "S3 — Starlit Improv", section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: "Current S3 Resonance Chain condition.", effectSummary: "Casting Basic Attack Stage 4 additionally grants 1 of Musical Essence. Resonance Skill Harmonic Allegro gains 1 more charge." }),
  sequence({ factId: "ciaccona-s4-toccata-and-fugue", name: "S4 — Toccata and Fugue", section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: "Current S4 Resonance Chain condition.", effectSummary: "Ciaccona ignores 45% of the targets' DEF when dealing damage with Heavy Attack Quadruple Downbeat;\nCiaccona ignores 45% of the targets' DEF when dealing Resonance Liberation DMG." }),
  sequence({ factId: "ciaccona-s5-eternal-idyll-to-lasting-summer", name: "S5 — Eternal Idyll to Lasting Summer", section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: "Current S5 Resonance Chain condition.", effectSummary: "Gain 40% Resonance Liberation DMG Bonus;\nDMG taken by Resonators within and around the range of Resonance Liberation Singer's Triple Cadenza is reduced by 30%." }),
  sequence({ factId: "ciaccona-s6-unending-cadence", name: "S6 — Unending Cadence", section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: "Current S6 Resonance Chain condition.", effectSummary: "When in Solo Concert, Ciaccona or Ensemble Sylph deals Aero DMG equal to 220% of Ciaccona's ATK to nearby targets, considered Resonance Liberation DMG." }),
] as const;

export const CIACCONA_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...CIACCONA_ACTION_FACTS,
  ...CIACCONA_RESOURCE_FACTS,
  ...CIACCONA_PASSIVE_FACTS,
  ...CIACCONA_SEQUENCE_FACTS,
] as const;
