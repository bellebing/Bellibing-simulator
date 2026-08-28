import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-28';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/yinlin';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/yinlin';
const WUTHERING_WIKI = 'https://wuthering.wiki/character_1302.html';

export const YINLIN_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Wuthering.gg — current Yinlin kit and multiplier tables',
    'Prydwen — current Yinlin kit and Resonance Chain cross-check',
    'Wuthering.wiki — raw damage-data mirror for scaling/type cross-check',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN, WUTHERING_WIKI],
  checkedAt: CHECKED_AT,
  notes: [
    "The pinned PR #68 promotion-review artifact supplies exact Lv1-Lv10 transcription structures; current Wuthering.gg, Prydwen and raw damage-data evidence were used for semantic verification.",
    "Judgment Strike is a Coordinated Attack trigger while current source text explicitly classifies its damage as Resonance Skill DMG; Bellibing preserves both semantics instead of replacing the damage-bonus bucket with trigger type.",
    "Chameleon Cipher consumes full Judgment Points and is explicitly Heavy Attack DMG. Sinner's Mark and Punishment Mark remain raw target-state mechanics; no mark uptime or trigger count is guessed.",
    'Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.',
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: 'yinlin', kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: YINLIN_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: 'yinlin', kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: YINLIN_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: 'yinlin', kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: YINLIN_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: 'yinlin', kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: YINLIN_PROVENANCE };
}

export const YINLIN_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'yinlin-basic-zapstring-1', name: 'Basic Attack — Zapstring’s Dance Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1449, .1568, .1687, .1853, .1972, .2109, .2299, .2489, .2679, .2881], hitCount: 1, conditional: false }),
  action({ factId: 'yinlin-basic-zapstring-2', name: 'Basic Attack — Zapstring’s Dance Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1701, .1841, .198, .2176, .2315, .2476, .2699, .2922, .3145, .3382], hitCount: 2, conditional: false }),
  action({ factId: 'yinlin-basic-zapstring-3', name: 'Basic Attack — Zapstring’s Dance Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.0704, .0762, .0819, .09, .0958, .1024, .1116, .1209, .1301, .1399], hitCount: 7, conditional: false }),
  action({ factId: 'yinlin-basic-zapstring-4', name: 'Basic Attack — Zapstring’s Dance Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.378, .409, .44, .4834, .5144, .5501, .5997, .6493, .6989, .7516], hitCount: 1, conditional: false }),
  action({ factId: 'yinlin-heavy-zapstring', name: 'Heavy Attack — Zapstring’s Dance', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.15, .1623, .1746, .1919, .2042, .2183, .238, .2577, .2774, .2983], hitCount: 2, conditional: false }),
  action({ factId: 'yinlin-mid-air-zapstring', name: 'Mid-air Attack — Zapstring’s Dance', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.62, .6709, .7217, .7929, .8437, .9022, .9836, 1.0649, 1.1462, 1.2327], hitCount: 1, conditional: false }),
  action({ factId: 'yinlin-dodge-counter-zapstring', name: 'Dodge Counter — Zapstring’s Dance', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1218, .1318, .1418, .1558, .1658, .1772, .1932, .2092, .2252, .2422], hitCount: 7, conditional: true }),
  action({ factId: 'yinlin-skill-magnetic-roar', name: 'Resonance Skill — Magnetic Roar', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3, .3246, .3492, .3837, .4083, .4366, .4759, .5153, .5547, .5965], hitCount: 3, conditional: false }),
  action({ factId: 'yinlin-skill-lightning-execution', name: 'Resonance Skill — Lightning Execution', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.45, .4869, .5238, .5755, .6124, .6548, .7139, .7729, .832, .8947], hitCount: 4, conditional: true, notes: ['Available after Magnetic Roar; delayed use or switching puts the Skill on cooldown.'] }),
  action({ factId: 'yinlin-skill-electromagnetic-blast', name: 'Resonance Skill — Electromagnetic Blast', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1, .1082, .1164, .1279, .1361, .1456, .1587, .1718, .1849, .1989], hitCount: 1, conditional: true, notes: ["Triggered by Basic Attack/Dodge Counter hits during Execution Mode and attacks targets with Sinner's Mark; each stage can trigger once, up to four times."] }),
  action({ factId: 'yinlin-liberation-thundering-wrath', name: 'Resonance Liberation — Thundering Wrath', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.5863, .6344, .6825, .7498, .7979, .8532, .9301, 1.007, 1.0839, 1.1656], hitCount: 7, conditional: false }),
  action({ factId: 'yinlin-intro-raging-storm', name: 'Intro Skill — Raging Storm', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.072, .078, .0839, .0921, .098, .1048, .1143, .1237, .1332, .1432], hitCount: 10, conditional: false }),
  action({ factId: 'yinlin-forte-chameleon-cipher', name: 'Forte Circuit — Chameleon Cipher', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.9, .9738, 1.0476, 1.151, 1.2248, 1.3096, 1.4277, 1.5458, 1.6639, 1.7893], hitCount: 2, conditional: true, notes: ['Requires full Judgment Points; consumes all Judgment Points. Source explicitly considers the damage Heavy Attack DMG.'] }),
  action({ factId: 'yinlin-forte-judgment-strike', name: 'Forte Circuit — Judgment Strike', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3956, .428, .4605, .5059, .5383, .5756, .6275, .6794, .7313, .7864], hitCount: 1, conditional: true, notes: ['Punishment Mark damage trigger; coordinated execution is separate from its explicit Resonance Skill DMG classification.'] }),
] as const;

export const YINLIN_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'yinlin-resource-judgment-points',
    name: 'Judgment Points',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Judgment Points',
    maxValue: 100,
    ruleSummary: "Yinlin can hold up to 100 Judgment Points. Current source lists gain from casting Intro Skill Raging Storm, Basic Attack Zapstring's Dance hits, casting Magnetic Roar, Electromagnetic Blast hits and casting Lightning Execution. At full Judgment Points, Heavy Attack becomes Chameleon Cipher and consumes all Judgment Points.",
  }),
] as const;

export const YINLIN_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'yinlin-skill-execution-mode',
    name: 'Resonance Skill — Execution Mode',
    section: 'RESONANCE_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Yinlin casts Magnetic Roar.',
    effectSummary: "Basic Attack and Dodge Counter hits trigger Electromagnetic Blast. Each stage can trigger one Electromagnetic Blast, up to 4 times; the blast attacks targets carrying Sinner's Mark. Lightning Execution becomes available after Magnetic Roar and is put on cooldown if not activated in time or if Yinlin is switched.",
    durationSeconds: null,
    maxStacks: 4,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'yinlin-forte-marks',
    name: "Forte Circuit — Sinner's Mark and Punishment Mark",
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'TARGET',
    triggerSummary: "Zapstring's Dance, Thundering Wrath and Intro Skill Raging Storm apply Sinner's Mark. Chameleon Cipher converts Sinner's Mark on hit to Punishment Mark.",
    effectSummary: "Sinner's Mark is removed when Yinlin is switched out. Punishment Mark lasts 18s. When a marked target takes damage, Judgment Strike performs Coordinated Attacks against all Punishment-marked targets, triggerable up to once per second; the damage itself is explicitly Resonance Skill DMG.",
    durationSeconds: 18,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({ factId: 'yinlin-inherent-pain-immersion', name: 'Inherent Skill — Pain Immersion', section: 'INHERENT_SKILL', conditional: true, scope: 'SELF', triggerSummary: 'Yinlin uses Resonance Skill Magnetic Roar.', effectSummary: "Yinlin's Crit. Rate is increased by 15% for 5s.", durationSeconds: 5, maxStacks: 1, modelingStatus: 'MODEL_READY' }),
  passive({ factId: 'yinlin-inherent-deadly-focus', name: 'Inherent Skill — Deadly Focus', section: 'INHERENT_SKILL', conditional: true, scope: 'SELF', triggerSummary: "Lightning Execution hits a target carrying Sinner's Mark.", effectSummary: "Lightning Execution damage is increased by 10%; when this triggers, Yinlin's ATK is increased by 10% for 4s.", durationSeconds: 4, maxStacks: 1, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'yinlin-outro-strategist', name: 'Outro Skill — Strategist', section: 'OUTRO_SKILL', conditional: true, scope: 'NEXT_CHARACTER', triggerSummary: 'Yinlin casts Outro Skill and the incoming Resonator takes the field.', effectSummary: 'The incoming Resonator has Electro DMG Amplified by 20% and Resonance Liberation DMG Amplified by 25% for 14s or until switched out.', durationSeconds: 14, maxStacks: 1, modelingStatus: 'MODEL_READY' }),
] as const;

export const YINLIN_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'yinlin-s1-moralitys-crossroads', name: "S1 — Morality's Crossroads", section: 'RESONANCE_CHAIN', sequence: 1, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'Resonance Skill Magnetic Roar and Lightning Execution deal 70% more DMG.' }),
  sequence({ factId: 'yinlin-s2-ensnared-by-rapport', name: 'S2 — Ensnared by Rapport', section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: 'Resonance Skill Electromagnetic Blast hits a target.', effectSummary: 'Electromagnetic Blast additionally recovers 5 Judgment Points and 5 Resonance Energy on hit.' }),
  sequence({ factId: 'yinlin-s3-unyielding-verdict', name: 'S3 — Unyielding Verdict', section: 'RESONANCE_CHAIN', sequence: 3, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: "Forte Circuit Judgment Strike's DMG multiplier is increased by 55%." }),
  sequence({ factId: 'yinlin-s4-steadfast-conviction', name: 'S4 — Steadfast Conviction', section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: 'Forte Circuit Judgment Strike hits a target.', effectSummary: 'The ATK of all team members is increased by 20% for 12s.' }),
  sequence({ factId: 'yinlin-s5-resounding-will', name: 'S5 — Resounding Will', section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: "Thundering Wrath hits a target carrying Sinner's Mark or Punishment Mark.", effectSummary: 'Resonance Liberation Thundering Wrath deals 100% extra DMG to those marked targets.' }),
  sequence({ factId: 'yinlin-s6-pursuit-of-justice', name: 'S6 — Pursuit of Justice', section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: "Within the first 30s after Thundering Wrath, Yinlin's Basic Attack hits a target.", effectSummary: "Furious Thunder triggers for 419.59% of Yinlin's ATK as Electro DMG. Each Basic Attack hit can trigger it once, up to 4 times; the damage is considered Resonance Skill DMG." }),
] as const;

export const YINLIN_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...YINLIN_ACTION_FACTS,
  ...YINLIN_RESOURCE_FACTS,
  ...YINLIN_PASSIVE_FACTS,
  ...YINLIN_SEQUENCE_FACTS,
] as const;
