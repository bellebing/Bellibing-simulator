import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/yinlin';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/yinlin';
const WUTHERING_DB = 'https://wuwa.incin.net/resonators/1302';
const WUTHERING_WIKI = 'https://wuthering.wiki/character_1302.html';

export const YINLIN_PROVENANCE = {
  sourceLabels: ['wuwabuild normalized Character snapshot — exact pinned upstream commit', 'Wuthering.gg — current Yinlin kit/multiplier tables', 'Prydwen — current Yinlin kit and Resonance Chain', 'WutheringDB — current Yinlin raw kit/sequence text', 'Wuthering.wiki — raw damage-data/type cross-check'],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN, WUTHERING_DB, WUTHERING_WIKI],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #68 review artifacts supply exact Lv1-Lv10 action coefficient structures and description numerics; current Wuthering.gg, Prydwen, WutheringDB and Wuthering.wiki are used for semantic/source cross-check.',
    'Chameleon Cipher is explicitly Heavy Attack DMG. Judgement Strike is explicitly a Coordinated Attack whose damage is considered Resonance Skill DMG; Bellibing therefore keeps SKILL as its damage bucket and coordinated cadence in raw semantics.',
    'The source table gives Execution Mode a 10-second duration. A separate unused raw description parameter value 8 is not assigned a mechanic meaning and remains provenance-only instead of being guessed as Lightning Execution timing.',
    'Generated promotion candidates remained NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.',
  ],
} as const;

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

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation; no skill level is implicitly selected by raw data.';

export const YINLIN_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: "yinlin-basic-zapstrings-dance-1", name: "Basic Attack — Zapstring's Dance Stage 1", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1449, 0.1568, 0.1687, 0.1853, 0.1972, 0.2109, 0.2299, 0.2489, 0.2679, 0.2881], hitCount: 1, conditional: false }),
  action({ factId: "yinlin-basic-zapstrings-dance-2", name: "Basic Attack — Zapstring's Dance Stage 2", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1701, 0.1841, 0.198, 0.2176, 0.2315, 0.2476, 0.2699, 0.2922, 0.3145, 0.3382], hitCount: 2, conditional: false }),
  action({ factId: "yinlin-basic-zapstrings-dance-3", name: "Basic Attack — Zapstring's Dance Stage 3", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.0704, 0.0762, 0.0819, 0.09, 0.0958, 0.1024, 0.1116, 0.1209, 0.1301, 0.1399], hitCount: 7, conditional: false }),
  action({ factId: "yinlin-basic-zapstrings-dance-4", name: "Basic Attack — Zapstring's Dance Stage 4", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.378, 0.409, 0.44, 0.4834, 0.5144, 0.5501, 0.5997, 0.6493, 0.6989, 0.7516], hitCount: 1, conditional: false }),
  action({ factId: "yinlin-heavy-zapstrings-dance", name: "Heavy Attack — Zapstring's Dance", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.15, 0.1623, 0.1746, 0.1919, 0.2042, 0.2183, 0.238, 0.2577, 0.2774, 0.2983], hitCount: 2, conditional: false, notes: ["Source lists 25 STA consumption."] }),
  action({ factId: "yinlin-mid-air-zapstrings-dance", name: "Mid-air Attack — Zapstring's Dance", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.62, 0.6709, 0.7217, 0.7929, 0.8437, 0.9022, 0.9836, 1.0649, 1.1462, 1.2327], hitCount: 1, conditional: false, notes: ["Source lists 30 STA cost."] }),
  action({ factId: "yinlin-dodge-counter-zapstrings-dance", name: "Dodge Counter — Zapstring's Dance", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1218, 0.1318, 0.1418, 0.1558, 0.1658, 0.1772, 0.1932, 0.2092, 0.2252, 0.2422], hitCount: 7, conditional: true }),
  action({ factId: "yinlin-skill-magnetic-roar", name: "Resonance Skill — Magnetic Roar", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3, 0.3246, 0.3492, 0.3837, 0.4083, 0.4366, 0.4759, 0.5153, 0.5547, 0.5965], hitCount: 3, conditional: false, notes: ["Source lists 12s cooldown, 10 Concerto Regen and enters 10s Execution Mode."] }),
  action({ factId: "yinlin-skill-lightning-execution", name: "Resonance Skill — Lightning Execution", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.45, 0.4869, 0.5238, 0.5755, 0.6124, 0.6548, 0.7139, 0.7729, 0.832, 0.8947], hitCount: 4, conditional: true, notes: ["Available after Magnetic Roar; source lists 15 Concerto Regen. If not activated in time or Yinlin is switched, the Skill enters cooldown."] }),
  action({ factId: "yinlin-skill-electromagnetic-blast", name: "Resonance Skill — Electromagnetic Blast", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1, 0.1082, 0.1164, 0.1279, 0.1361, 0.1456, 0.1587, 0.1718, 0.1849, 0.1989], hitCount: 1, conditional: true, notes: ["Execution Mode allows Basic Attack/Dodge Counter stages to trigger one Blast each, up to four times; Blast attacks Sinner's Mark targets and lists 5 Concerto Regen."] }),
  action({ factId: "yinlin-liberation-thundering-wrath", name: "Resonance Liberation — Thundering Wrath", section: "RESONANCE_LIBERATION", actionKind: "LIBERATION", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.5863, 0.6344, 0.6825, 0.7498, 0.7979, 0.8532, 0.9301, 1.007, 1.0839, 1.1656], hitCount: 7, conditional: false, notes: ["Source lists 16s cooldown, 125 Resonance Cost and 20 Concerto Regen."] }),
  action({ factId: "yinlin-intro-raging-storm", name: "Intro Skill — Raging Storm", section: "INTRO_SKILL", actionKind: "INTRO", damageClass: "INTRO", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.072, 0.078, 0.0839, 0.0921, 0.098, 0.1048, 0.1143, 0.1237, 0.1332, 0.1432], hitCount: 10, conditional: false, notes: ["Source lists 10 Concerto Regen and applies Sinner's Mark on hit."] }),
  action({ factId: "yinlin-forte-chameleon-cipher", name: "Forte Circuit — Chameleon Cipher", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.9, 0.9738, 1.0476, 1.151, 1.2248, 1.3096, 1.4277, 1.5458, 1.6639, 1.7893], hitCount: 2, conditional: true, notes: ["Source explicitly classifies Chameleon Cipher as Heavy Attack DMG. Requires full Judgment Points, consumes all points, and converts Sinner's Mark to 18s Punishment Mark on hit."] }),
  action({ factId: "yinlin-forte-judgement-strike", name: "Forte Circuit — Judgement Strike", section: "FORTE_CIRCUIT", actionKind: "FORTE", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3956, 0.428, 0.4605, 0.5059, 0.5383, 0.5756, 0.6275, 0.6794, 0.7313, 0.7864], hitCount: 1, conditional: true, notes: ["Source explicitly classifies Judgement Strike as Resonance Skill DMG and as a Coordinated Attack triggered when Punishment Mark targets take damage, at most once per second."] }),
] as const;

export const YINLIN_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: 'yinlin-resource-judgment-points', name: 'Judgment Points', section: 'FORTE_CIRCUIT', conditional: false, resourceName: 'Judgment Points', maxValue: 100, ruleSummary: 'Yinlin holds up to 100 Judgment Points. Intro Skill, Basic Attack hits, casting Magnetic Roar, Electromagnetic Blast hits and casting Lightning Execution restore Judgment Points. At full Judgment Points, Heavy Attack is replaced by Chameleon Cipher, which consumes all points.' }),
] as const;

export const YINLIN_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: 'yinlin-skill-execution-mode', name: 'Execution Mode', section: 'RESONANCE_SKILL', conditional: true, scope: 'SELF', triggerSummary: 'Cast Magnetic Roar.', effectSummary: 'For 10s, each Basic Attack stage or Dodge Counter can trigger one Electromagnetic Blast on hit, up to four Blasts total.', durationSeconds: 10, maxStacks: 4, modelingStatus: 'PENDING_INTERPRETATION', notes: ['The PR #68 description artifact also contains an unused raw parameter value 8 in Magnetic Roar text. No current rendered source assigns it a mechanic meaning, so Bellibing does not guess one.'] }),
  passive({ factId: 'yinlin-forte-sinners-mark', name: "Sinner's Mark", section: 'FORTE_CIRCUIT', conditional: true, scope: 'TARGET', triggerSummary: "Basic Attack Zapstring's Dance, Thundering Wrath and Raging Storm apply Sinner's Mark on hit.", effectSummary: "Sinner's Mark remains on the target until Yinlin is switched out; Chameleon Cipher can replace it with Punishment Mark.", durationSeconds: null, maxStacks: null, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'yinlin-forte-punishment-mark', name: 'Punishment Mark', section: 'FORTE_CIRCUIT', conditional: true, scope: 'TARGET', triggerSummary: "Chameleon Cipher hits a target carrying Sinner's Mark.", effectSummary: "Replace Sinner's Mark with Punishment Mark for 18s. When a marked target takes damage, Judgement Strike triggers Coordinated Attacks against all Punishment Mark targets, at most once per second; Judgement Strike damage is Resonance Skill DMG.", durationSeconds: 18, maxStacks: null, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'yinlin-inherent-pain-immersion', name: 'Pain Immersion', section: 'INHERENT_SKILL', conditional: true, scope: 'SELF', triggerSummary: 'Use Magnetic Roar.', effectSummary: "Increase Yinlin's Crit. Rate by 15% for 5s.", durationSeconds: 5, maxStacks: null }),
  passive({ factId: 'yinlin-inherent-deadly-focus', name: 'Deadly Focus', section: 'INHERENT_SKILL', conditional: true, scope: 'SELF', triggerSummary: "Lightning Execution hits a target marked with Sinner's Mark.", effectSummary: "Increase Lightning Execution damage by 10%; when this triggers, increase Yinlin's ATK by 10% for 4s.", durationSeconds: 4, maxStacks: null, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'yinlin-outro-strategist', name: 'Outro Skill — Strategist', section: 'OUTRO_SKILL', conditional: true, scope: 'NEXT_CHARACTER', triggerSummary: 'Cast Outro Skill and switch to the incoming Resonator.', effectSummary: "Amplify the incoming Resonator's Electro DMG by 20% and Resonance Liberation DMG by 25% for 14s or until they are switched out.", durationSeconds: 14, maxStacks: null, modelingStatus: 'MODEL_READY' }),
] as const;

export const YINLIN_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: "yinlin-s1-morality-s-crossroads", name: "S1 — Morality's Crossroads", section: 'RESONANCE_CHAIN', conditional: true, sequence: 1, triggerSummary: "Sequence is active.", effectSummary: "Magnetic Roar and Lightning Execution deal 70% more DMG." }),
  sequence({ factId: "yinlin-s2-ensnarled-by-rapport", name: "S2 — Ensnarled by Rapport", section: 'RESONANCE_CHAIN', conditional: true, sequence: 2, triggerSummary: "Electromagnetic Blast hits a target.", effectSummary: "Recover an additional 5 Judgment Points and 5 Resonance Energy on hit." }),
  sequence({ factId: "yinlin-s3-unyielding-verdict", name: "S3 — Unyielding Verdict", section: 'RESONANCE_CHAIN', conditional: true, sequence: 3, triggerSummary: "Sequence is active.", effectSummary: "Increase Judgement Strike DMG Multiplier by 55%." }),
  sequence({ factId: "yinlin-s4-steadfast-conviction", name: "S4 — Steadfast Conviction", section: 'RESONANCE_CHAIN', conditional: true, sequence: 4, triggerSummary: "Judgement Strike hits a target.", effectSummary: "Increase all team members' ATK by 20% for 12s." }),
  sequence({ factId: "yinlin-s5-resounding-will", name: "S5 — Resounding Will", section: 'RESONANCE_CHAIN', conditional: true, sequence: 5, triggerSummary: "Thundering Wrath hits a target carrying Sinner's Mark or Punishment Mark.", effectSummary: "Thundering Wrath deals 100% extra DMG to that target." }),
  sequence({ factId: "yinlin-s6-pursuit-of-justice", name: "S6 — Pursuit of Justice", section: 'RESONANCE_CHAIN', conditional: true, sequence: 6, triggerSummary: "Within 30s after casting Thundering Wrath, Yinlin's Basic Attack hits a target.", effectSummary: "Trigger Furious Thunder for 419.59% of Yinlin's ATK as Electro DMG, considered Resonance Skill DMG. Each Basic Attack hit can trigger it once, up to 4 times." }),
] as const;

export const YINLIN_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...YINLIN_ACTION_FACTS,
  ...YINLIN_RESOURCE_FACTS,
  ...YINLIN_PASSIVE_FACTS,
  ...YINLIN_SEQUENCE_FACTS,
] as const;
