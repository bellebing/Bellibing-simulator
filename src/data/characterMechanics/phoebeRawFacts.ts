import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = "2026-08-28";
const SOURCE_SNAPSHOT = "https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json";

export const PHOEBE_PROVENANCE = {
  sourceLabels: ["wuwabuild normalized Character snapshot — exact pinned upstream commit", "Prydwen — current Phoebe kit", "Wuthering.wiki — current Phoebe multiplier tables and damage data"],
  sourceUrls: ["https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json", "https://www.prydwen.gg/wuthering-waves/characters/phoebe", "https://wuthering.wiki/character_1506.html"],
  checkedAt: CHECKED_AT,
  notes: [
    "The pinned PR #66/#68 promotion-review pipeline supplies exact Lv1-Lv10 transcription structures; current Prydwen and Wuthering.wiki were used for semantic verification.",
    "All canonical Phoebe Character-owned damage is ATK-scaling. Ring of Mirrors Refracted Holy Light and Chamuel’s Star are explicitly Basic Attack DMG despite living under Resonance Skill; Starflash/Absolution Litany are Heavy Attack DMG.",
    "Attentive Heart base damage is source-fixed 528.41% ATK. Absolution’s +255% multiplier and Confession’s Silent Prayer remain conditional Outro semantics rather than being pre-applied to the base Outro action.",
    "Prayer, Divine Voice, Absolution/Confession, Ring of Mirrors, Spectro Frazzle application and Starflash conditions remain raw source semantics without assumed Frazzle uptime or state choice.",
    "Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.",
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';
const FIXED_CONTEXT = 'Current source-fixed Character damage coefficient declared directly in kit text; not a selected talent-level scalar and not a fabricated Lv1-Lv10 curve.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: "phoebe", kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: PHOEBE_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: "phoebe", kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: PHOEBE_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: "phoebe", kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: PHOEBE_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: "phoebe", kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: PHOEBE_PROVENANCE };
}

export const PHOEBE_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: "phoebe-basic-attack-o-come-divine-light-stage-1-dmg", name: "O Come Divine Light — Stage 1 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1485, 0.1607, 0.1729, 0.19, 0.2021, 0.2161, 0.2356, 0.2551, 0.2746, 0.2953], hitCount: 1, conditional: false }),
  action({ factId: "phoebe-basic-attack-o-come-divine-light-stage-2-dmg", name: "O Come Divine Light — Stage 2 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.1125, 0.1218, 0.131, 0.1439, 0.1531, 0.1637, 0.1785, 0.1933, 0.208, 0.2237], hitCount: 1 }, { curve: [0.1375, 0.1488, 0.1601, 0.1759, 0.1872, 0.2001, 0.2182, 0.2362, 0.2542, 0.2734], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: "phoebe-basic-attack-o-come-divine-light-stage-3-dmg", name: "O Come Divine Light — Stage 3 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.0717, 0.0775, 0.0834, 0.0916, 0.0975, 0.1043, 0.1137, 0.1231, 0.1325, 0.1424], hitCount: 8, conditional: false }),
  action({ factId: "phoebe-basic-attack-o-come-divine-light-heavy-attack-dmg", name: "O Come Divine Light — Heavy Attack DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.208, 0.225, 0.2421, 0.266, 0.283, 0.3026, 0.3299, 0.3572, 0.3845, 0.4135], hitCount: 4, conditional: false }),
  action({ factId: "phoebe-basic-attack-o-come-divine-light-mid-air-attack-dmg", name: "O Come Divine Light — Mid-air Attack DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2325, 0.2516, 0.2707, 0.2974, 0.3164, 0.3384, 0.3689, 0.3994, 0.4299, 0.4623], hitCount: 2, conditional: false }),
  action({ factId: "phoebe-basic-attack-o-come-divine-light-dodge-counter-dmg", name: "O Come Divine Light — Dodge Counter DMG", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1086, 0.1175, 0.1264, 0.1389, 0.1478, 0.158, 0.1722, 0.1865, 0.2007, 0.2158], hitCount: 8, conditional: true }),
  action({ factId: "phoebe-basic-attack-o-come-divine-light-chamuel-s-star-dodge-counter-dmg", name: "O Come Divine Light — Chamuel's Star: Dodge Counter DMG", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2205, 0.2386, 0.2567, 0.282, 0.3001, 0.3209, 0.3498, 0.3788, 0.4077, 0.4384], hitCount: 6, conditional: true }),
  action({ factId: "phoebe-resonance-skill-to-where-light-shines-skill-dmg", name: "To Where Light Shines — Skill DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.315, 0.3409, 0.3667, 0.4029, 0.4287, 0.4584, 0.4997, 0.5411, 0.5824, 0.6263], hitCount: 2, conditional: false }),
  action({ factId: "phoebe-resonance-skill-to-where-light-shines-ring-of-mirrors-refracted-holy-light-dmg", name: "To Where Light Shines — Ring of Mirrors: Refracted Holy Light DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.075, 0.0812, 0.0873, 0.096, 0.1021, 0.1092, 0.119, 0.1289, 0.1387, 0.1492], hitCount: 2, conditional: true, notes: ["Ring-owned Refracted Holy Light is triggered by Basic Attack/Dodge Counter hitting the ring but is explicitly considered Basic Attack DMG."] }),
  action({ factId: "phoebe-resonance-skill-to-where-light-shines-chamuel-s-star-stage-1-dmg", name: "To Where Light Shines — Chamuel's Star: Stage 1 DMG", section: "RESONANCE_SKILL", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2985, 0.323, 0.3475, 0.3818, 0.4062, 0.4344, 0.4736, 0.5127, 0.5519, 0.5935], hitCount: 1, conditional: true }),
  action({ factId: "phoebe-resonance-skill-to-where-light-shines-chamuel-s-star-stage-2-dmg", name: "To Where Light Shines — Chamuel's Star: Stage 2 DMG", section: "RESONANCE_SKILL", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2, 0.2164, 0.2328, 0.2558, 0.2722, 0.2911, 0.3173, 0.3435, 0.3698, 0.3977], hitCount: 2, conditional: true }),
  action({ factId: "phoebe-resonance-skill-to-where-light-shines-chamuel-s-star-stage-3-dmg", name: "To Where Light Shines — Chamuel's Star: Stage 3 DMG", section: "RESONANCE_SKILL", actionKind: "BASIC", damageClass: "BASIC", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1455, 0.1575, 0.1694, 0.1861, 0.198, 0.2118, 0.2309, 0.2499, 0.269, 0.2893], hitCount: 6, conditional: true }),
  action({ factId: "phoebe-resonance-liberation-dawn-of-enlightenment-skill-dmg", name: "Dawn of Enlightenment — Skill DMG", section: "RESONANCE_LIBERATION", actionKind: "LIBERATION", damageClass: "LIBERATION", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [2.02, 2.1857, 2.3513, 2.5832, 2.7489, 2.9394, 3.2044, 3.4694, 3.7344, 4.016], hitCount: 1, conditional: false }),
  action({ factId: "phoebe-intro-skill-golden-grace-skill-dmg", name: "Golden Grace — Skill DMG", section: "INTRO_SKILL", actionKind: "INTRO", damageClass: "INTRO", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [1, 1.082, 1.164, 1.2788, 1.3608, 1.4551, 1.5863, 1.7175, 1.8487, 1.9881], hitCount: 1, conditional: false }),
  action({ factId: "phoebe-forte-circuit-radiant-invocation-heavy-attack-starflash-dmg", name: "Radiant Invocation — Heavy Attack: Starflash DMG", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.4159, 0.45, 0.4841, 0.5319, 0.566, 0.6052, 0.6598, 0.7143, 0.7689, 0.8269], hitCount: 3, conditional: true }),
  action({ factId: "phoebe-forte-circuit-radiant-invocation-absolution-litany-dmg", name: "Radiant Invocation — Absolution Litany DMG", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [3.21, 3.4733, 3.7365, 4.105, 4.3682, 4.6709, 5.0921, 5.5132, 5.9344, 6.3819], hitCount: 1, conditional: true }),
  action({ factId: "phoebe-forte-circuit-radiant-invocation-utter-confession-dmg", name: "Radiant Invocation — Utter Confession DMG", section: "FORTE_CIRCUIT", actionKind: "SKILL", damageClass: "SKILL", scalingStat: "ATK", motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.945, 1.0225, 1.1, 1.2085, 1.286, 1.3751, 1.4991, 1.6231, 1.7471, 1.8788], hitCount: 1, conditional: true }),
  action({ factId: 'phoebe-outro-attentive-heart-base', name: 'Outro Skill — Attentive Heart', section: 'OUTRO_SKILL', actionKind: 'OUTRO', damageClass: 'OUTRO', scalingStat: 'ATK', motionValueContext: FIXED_CONTEXT, sourceFixedMotionValue: 5.2841, hitCount: 1, conditional: false, notes: ['Absolution/Confession modify this Outro through separate raw conditional semantics rather than mutating the source-fixed base coefficient.'] }),
] as const;

export const PHOEBE_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: "phoebe-resource-prayer", name: "Prayer", section: "FORTE_CIRCUIT", conditional: false, resourceName: "Prayer", maxValue: 120, ruleSummary: "Phoebe can hold up to 120 Prayer and automatically gains 5 Prayer every second. At full Prayer she consumes all Prayer to cast either Absolution Litany or Utter Confession." }),
  resource({ factId: "phoebe-resource-divine-voice", name: "Divine Voice", section: "FORTE_CIRCUIT", conditional: false, resourceName: "Divine Voice", maxValue: 60, ruleSummary: "Phoebe can hold up to 60 Divine Voice. Absolution Litany or Utter Confession restores 60. Starflash costs 30 Divine Voice; Absolution reduces that cost by 15. The source states the Litany/Confession recast gate in terms of Divine Voice exhaustion." }),
] as const;

export const PHOEBE_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: "phoebe-skill-ring-of-mirrors", name: "Ring of Mirrors", section: "RESONANCE_SKILL", conditional: true, scope: "TARGET", triggerSummary: "Cast Resonance Skill To Where Light Shines.", effectSummary: "Ring of Mirrors lasts 30s; a newly summoned ring replaces the existing one. The initial hit stagnates up to 12 targets for 2s. Outside the ring, Basic Attack/Dodge Counter hitting the ring can trigger Refracted Holy Light once every 0.5s; inside, Basic Attack becomes Chamuel’s Star.", durationSeconds: 30, maxStacks: null }),
  passive({ factId: "phoebe-forte-absolution-confession", name: "Absolution / Confession", section: "FORTE_CIRCUIT", conditional: true, scope: "SELF", triggerSummary: "At full Prayer, consume all Prayer to cast Absolution Litany or Utter Confession.", effectSummary: "Absolution and Confession cannot coexist; entering one ends the other. Starflash consumes Divine Voice. In Absolution, Starflash costs 15 less Divine Voice and gains 256% DMG Amplification against targets with Spectro Frazzle. In Confession, Starflash applies 5 Spectro Frazzle stacks. Utter Confession applies the source-listed Frazzle stack.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "phoebe-inherent-presence", name: "Inherent Skill — Presence", section: "INHERENT_SKILL", conditional: false, scope: "SELF", triggerSummary: "Passive Inherent Skill.", effectSummary: "Mid-air Heavy Attack can be cast 1 additional time.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "phoebe-inherent-revelation", name: "Inherent Skill — Revelation", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Phoebe is in Absolution or Confession.", effectSummary: "Increase Spectro DMG Bonus by 12%.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "phoebe-outro-attentive-heart-enhancements", name: "Outro Skill — Attentive Heart enhancements", section: "OUTRO_SKILL", conditional: true, scope: "TARGET", triggerSummary: "Attentive Heart resolves while Phoebe is in Absolution or Confession.", effectSummary: "Absolution increases the Outro DMG Multiplier by 255%. Confession grants Silent Prayer to the on-field Resonator: nearby targets have Spectro RES reduced by 10%, Spectro Frazzle DMG is Amplified by 100%, and Frazzle damage interval is extended by 50%. Silent Prayer lasts 30s or until Phoebe switches to Absolution.", durationSeconds: 30, maxStacks: null }),
] as const;

export const PHOEBE_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: "phoebe-s1-warm-light-and-bedside-wishes", name: "S1 — Warm Light and Bedside Wishes", section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: "Current S1 Resonance Chain condition.", effectSummary: "When in Absolution, Resonance Liberation Dawn of Enlightenment now increases DMG Multiplier by 480% instead of 255%.\nWhen in Confession, Resonance Liberation Dawn of Enlightenment  increases DMG Multiplier by 90% and applies Spectro Frazzle to the targets with the maximum stack the targets can receive." }),
  sequence({ factId: "phoebe-s2-a-boat-adrift-in-tears", name: "S2 — A Boat Adrift in Tears", section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: "Current S2 Resonance Chain condition.", effectSummary: "When in Absolution, DMG dealt by Outro Skills to targets with Spectro Frazzle is Amplified by 120%.\nWhen in Confession, Silent Prayer grants 120% more DMG Amplification for Spectro Frazzle." }),
  sequence({ factId: "phoebe-s3-daisy-wreaths-and-dreams", name: "S3 — Daisy Wreaths and Dreams", section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: "Current S3 Resonance Chain condition.", effectSummary: "When in Absolution, the DMG Multiplier of Heavy Attack Starflash is increased by 91%.\nWhen in Confession, the DMG Multiplier of Heavy Attack Starflash is increased by 249%." }),
  sequence({ factId: "phoebe-s4-ringing-bells-on-wings-aloft", name: "S4 — Ringing Bells on Wings Aloft", section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: "Current S4 Resonance Chain condition.", effectSummary: "When Basic Attack, Basic Attack Chamuel's Star, Dodge Counter, or Chamuel's Star: Dodge Counter hits, the target's Spectro RES is reduced by 10% for 30s." }),
  sequence({ factId: "phoebe-s5-prayer-to-the-distant-light", name: "S5 — Prayer to the Distant Light", section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: "Current S5 Resonance Chain condition.", effectSummary: "Casting Intro Skill Golden Grace increases Phoebe's Spectro DMG Bonus by 12% for 15s." }),
  sequence({ factId: "phoebe-s6-whispering-chirps-in-silence", name: "S6 — Whispering Chirps in Silence", section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: "Current S6 Resonance Chain condition.", effectSummary: "Targets entering the Ring of Mirrors are stagnated for an additional 2s. The stagnation effect affects all targets entering the Ring of Mirrors and can be applied to 12 targets max for each Ring of Mirrors. Each target will only be affected by this effect once.\nWhen in Absolution or Confession, summoning a Ring of Mirrors with Resonance Skill increases Phoebe's ATK by 10% for 20s, and triggers an extra Heavy Attack Starflash at the Ring of Mirrors' location. This Heavy Attack Starflash does not consume Divine Voice and is not considered as casting a Heavy Attack." }),
] as const;

export const PHOEBE_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...PHOEBE_ACTION_FACTS,
  ...PHOEBE_RESOURCE_FACTS,
  ...PHOEBE_PASSIVE_FACTS,
  ...PHOEBE_SEQUENCE_FACTS,
] as const;
