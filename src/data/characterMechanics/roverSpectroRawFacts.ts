import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = "2026-08-28";
const SOURCE_SNAPSHOT = "https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json";

export const ROVER_SPECTRO_PROVENANCE = {
  sourceLabels: ["wuwabuild normalized Character snapshot — exact pinned upstream commit", "Prydwen — current Rover (Spectro) kit", "Current raw/skill data cross-check — Rover (Spectro)"],
  sourceUrls: [SOURCE_SNAPSHOT, "https://www.prydwen.gg/wuthering-waves/characters/rover-spectro", "https://wuthering.wiki/character_1501.html"],
  checkedAt: CHECKED_AT,
  notes: [
    "The pinned PR #66/#68 promotion-review pipeline supplies exact Lv1-Lv10 transcription structures; current source pages were used for semantic verification.",
    "Resonating Spin/Whirl/Echoes are explicitly Resonance Skill DMG while their player-action identity remains separate; Outro Instant is non-damage stasis.",
    "Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this Rover (Spectro) semantic/source review; no generated candidate status was promoted automatically.",
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';
const FIXED_CONTEXT = 'Exact source-fixed Character damage coefficient declared directly by the current kit without a Lv1-Lv10 table; no talent-level curve is fabricated.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: "rover-spectro", kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: ROVER_SPECTRO_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: "rover-spectro", kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: ROVER_SPECTRO_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: "rover-spectro", kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ROVER_SPECTRO_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: "rover-spectro", kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ROVER_SPECTRO_PROVENANCE };
}

export const ROVER_SPECTRO_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: "rover-spectro-basic-attack-vibration-manifestation-stage-1-dmg", name: "Vibration Manifestation — Stage 1 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2975, 0.3219, 0.3463, 0.3805, 0.4049, 0.4329, 0.472, 0.511, 0.55, 0.5915], hitCount: 1, conditional: false }),
  action({ factId: "rover-spectro-basic-attack-vibration-manifestation-stage-2-dmg", name: "Vibration Manifestation — Stage 2 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3825, 0.4139, 0.4453, 0.4892, 0.5206, 0.5566, 0.6068, 0.657, 0.7072, 0.7605], hitCount: 1, conditional: false }),
  action({ factId: "rover-spectro-basic-attack-vibration-manifestation-stage-3-dmg", name: "Vibration Manifestation — Stage 3 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.0765, 0.0828, 0.0891, 0.0979, 0.1042, 0.1114, 0.1214, 0.1314, 0.1415, 0.1521], hitCount: 5, conditional: false }),
  action({ factId: "rover-spectro-basic-attack-vibration-manifestation-stage-4-dmg", name: "Vibration Manifestation — Stage 4 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.6545, 0.7082, 0.7619, 0.837, 0.8907, 0.9524, 1.0383, 1.1242, 1.21, 1.3013], hitCount: 1, conditional: false }),
  action({ factId: "rover-spectro-basic-attack-vibration-manifestation-dodge-counter-dmg", name: "Vibration Manifestation — Dodge Counter DMG", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.9825, 1.0631, 1.1437, 1.2565, 1.337, 1.4297, 1.5586, 1.6875, 1.8164, 1.9534], hitCount: 1, conditional: true }),
  action({ factId: "rover-spectro-basic-attack-vibration-manifestation-heavy-attack-dmg", name: "Vibration Manifestation — Heavy Attack DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.0969, 0.1049, 0.1128, 0.124, 0.1319, 0.141, 0.1538, 0.1665, 0.1792, 0.1927], hitCount: 5, conditional: false }),
  action({ factId: "rover-spectro-basic-attack-vibration-manifestation-heavy-attack-resonance-dmg", name: "Vibration Manifestation — Heavy Attack - Resonance DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3825, 0.4139, 0.4453, 0.4892, 0.5206, 0.5566, 0.6068, 0.657, 0.7072, 0.7605], hitCount: 1, conditional: true }),
  action({ factId: "rover-spectro-basic-attack-vibration-manifestation-heavy-attack-aftertune-dmg", name: "Vibration Manifestation — Heavy Attack - Aftertune DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.6375, 0.6898, 0.7421, 0.8153, 0.8676, 0.9277, 1.0113, 1.095, 1.1786, 1.2675], hitCount: 1, conditional: true }),
  action({ factId: "rover-spectro-basic-attack-vibration-manifestation-mid-air-attack-dmg", name: "Vibration Manifestation — Mid-air Attack DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.527, 0.5703, 0.6135, 0.674, 0.7172, 0.7669, 0.836, 0.9052, 0.9743, 1.0478], hitCount: 1, conditional: false }),
  action({ factId: "rover-spectro-resonance-skill-resonating-slashes-skill-dmg", name: "Resonating Slashes — Skill DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.188, 1.2855, 1.3829, 1.5193, 1.6167, 1.7287, 1.8846, 2.0404, 2.1963, 2.3619], hitCount: 1, conditional: false }),
  action({ factId: "rover-spectro-resonance-liberation-echoing-orchestra-skill-dmg", name: "Echoing Orchestra — Skill DMG", section: "RESONANCE_LIBERATION", actionKind: "LIBERATION", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [1, 1.082, 1.164, 1.2788, 1.3608, 1.4551, 1.5863, 1.7175, 1.8487, 1.9881], hitCount: 1 }, { curve: [3.4, 3.6788, 3.9576, 4.348, 4.6268, 4.9474, 5.3935, 5.8395, 6.2856, 6.7596], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: "rover-spectro-intro-skill-waveshock-skill-dmg", name: "Waveshock — Skill DMG", section: "INTRO_SKILL", actionKind: "INTRO", damageClass: "INTRO", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.85, 0.9197, 0.9894, 1.087, 1.1567, 1.2369, 1.3484, 1.4599, 1.5714, 1.6899], hitCount: 1, conditional: false }),
  action({ factId: "rover-spectro-forte-circuit-world-in-a-grain-of-sand-resonating-spin-dmg", name: "World in a Grain of Sand — Resonating Spin DMG", section: "FORTE_CIRCUIT", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.6493, 0.7025, 0.7558, 0.8303, 0.8835, 0.9448, 1.03, 1.1151, 1.2003, 1.2908], hitCount: 2, conditional: true, notes: ["Current source explicitly considers this Forte action Resonance Skill DMG."] }),
  action({ factId: "rover-spectro-forte-circuit-world-in-a-grain-of-sand-resonating-whirl-dmg", name: "World in a Grain of Sand — Resonating Whirl DMG", section: "FORTE_CIRCUIT", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2, 0.2164, 0.2328, 0.2558, 0.2722, 0.2911, 0.3173, 0.3435, 0.3698, 0.3977], hitCount: 1, conditional: true, notes: ["Current source explicitly considers this Forte action Resonance Skill DMG."] }),
  action({ factId: "rover-spectro-forte-circuit-world-in-a-grain-of-sand-resonating-echoes-stage-1-dmg", name: "World in a Grain of Sand — Resonating Echoes Stage 1 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.4, 0.4328, 0.4656, 0.5116, 0.5444, 0.5821, 0.6346, 0.687, 0.7395, 0.7953], hitCount: 1, conditional: true, notes: ["Current source explicitly considers this Forte action Resonance Skill DMG."] }),
  action({ factId: "rover-spectro-forte-circuit-world-in-a-grain-of-sand-resonating-echoes-stage-2-dmg", name: "World in a Grain of Sand — Resonating Echoes Stage 2 DMG", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.8, 0.8656, 0.9312, 1.0231, 1.0887, 1.1641, 1.2691, 1.374, 1.479, 1.5905], hitCount: 1, conditional: true, notes: ["Current source explicitly considers this Forte action Resonance Skill DMG."] }),
] as const;

export const ROVER_SPECTRO_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: "rover-spectro-resource-diminutive-sound", name: "Diminutive Sound", section: "FORTE_CIRCUIT", conditional: false, resourceName: "Diminutive Sound", maxValue: 100, ruleSummary: "Rover holds up to 100 Diminutive Sound. Normal Attack Vibration Manifestation and Heavy Attack Aftertune grant it on hit; Intro Skill Waveshock grants it on cast. If Diminutive Sound exceeds 50 when Resonance Skill is used, Rover consumes 50 to cast Resonating Spin." }),
] as const;

export const ROVER_SPECTRO_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: "rover-spectro-forte-resonating-echoes", name: "Resonating Spin / Resonating Echoes", section: "FORTE_CIRCUIT", conditional: true, scope: "SELF", triggerSummary: "Spend 50 Diminutive Sound with Resonance Skill, then press Basic Attack after Resonating Spin.", effectSummary: "Resonating Spin and the following Resonating Echoes deal their separate source action damage and are explicitly considered Resonance Skill DMG.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "rover-spectro-inherent-reticence", name: "Inherent Skill — Reticence", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Deal damage with Basic Attack Resonating Echoes.", effectSummary: "Increase Resonating Echoes damage by 60%.", durationSeconds: null, maxStacks: null }),
  passive({ factId: "rover-spectro-inherent-silent-listener", name: "Inherent Skill — Silent Listener", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Cast Heavy Attack Resonance.", effectSummary: "Gain 15% ATK for 5s.", durationSeconds: 5, maxStacks: null }),
  passive({ factId: "rover-spectro-outro-instant", name: "Outro Skill — Instant", section: "OUTRO_SKILL", conditional: false, scope: "OTHER", triggerSummary: "Cast Rover-Spectro's Outro Skill.", effectSummary: "Generate an area of stasis centered on the incoming Resonator for 3s. This is a NON_DAMAGE Outro effect; no damage coefficient is fabricated.", durationSeconds: 3, maxStacks: null }),
] as const;

export const ROVER_SPECTRO_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: "rover-spectro-s1-odyssey-of-beginnings", name: "S1 — Odyssey of Beginnings", section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: "Current S1 Resonance Chain condition.", effectSummary: "Rover's Crit. Rate is increased by 15% for 7s when casting Resonance Skill Resonating Slashes or Resonance Skill Resonating Spin." }),
  sequence({ factId: "rover-spectro-s2-microcosmic-murmurs", name: "S2 — Microcosmic Murmurs", section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: "Current S2 Resonance Chain condition.", effectSummary: "Rover's Spectro DMG Bonus is increased by 20%." }),
  sequence({ factId: "rover-spectro-s3-visages-of-dust", name: "S3 — Visages of Dust", section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: "Current S3 Resonance Chain condition.", effectSummary: "Rover's Energy Regen is increased by 20%." }),
  sequence({ factId: "rover-spectro-s4-resonating-lamella", name: "S4 — Resonating Lamella", section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: "Current S4 Resonance Chain condition.", effectSummary: "When casting Resonance Liberation Echoing Resonance, Rover continuously restores HP for all team members: HP equal to 20% of Rover's ATK will be restored every second for 5s." }),
  sequence({ factId: "rover-spectro-s5-temporal-virtuoso", name: "S5 — Temporal Virtuoso", section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: "Current S5 Resonance Chain condition.", effectSummary: "Rover's Resonance Liberation DMG Bonus is increased by 40%." }),
  sequence({ factId: "rover-spectro-s6-echoes-of-wanderlust", name: "S6 — Echoes of Wanderlust", section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: "Current S6 Resonance Chain condition.", effectSummary: "Resonance Skill Resonating Slashes and Resonance Skill Resonating Spin reduces the target's Spectro RES by 10% on hit for 20s." }),
] as const;

export const ROVER_SPECTRO_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...ROVER_SPECTRO_ACTION_FACTS,
  ...ROVER_SPECTRO_RESOURCE_FACTS,
  ...ROVER_SPECTRO_PASSIVE_FACTS,
  ...ROVER_SPECTRO_SEQUENCE_FACTS,
] as const;
