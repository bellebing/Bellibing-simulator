import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/taoqi';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/taoqi';
const WUTHERING_WIKI = 'https://wuthering.wiki/character_1601.html';

export const TAOQI_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Wuthering.gg — current Taoqi kit and multiplier tables',
    'Prydwen — current Taoqi kit and Resonance Chain',
    'Wuthering.wiki — raw damage-data mirror for scaling/type cross-check',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN, WUTHERING_WIKI],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #68 candidate/review artifacts supply exact Lv1-Lv10 transcription structures; current Wuthering.gg, Prydwen and raw damage-data evidence were used for semantic verification.',
    'Taoqi basic/heavy/mid-air/dodge/Intro damage is ATK-scaling, while Strategic Parry, Fortified Defense, Unmovable and Timed Counters are DEF-scaling where current raw damage data explicitly identifies the base attribute.',
    'Timed Counters are explicitly considered Basic Attack DMG despite living in Forte Circuit. Rocksteady Defense and Rocksteady Shield damage-reduction rows are utility mechanics, not Character damage actions.',
    'Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.',
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return {
    ...input,
    characterId: 'taoqi',
    kind: 'ACTION',
    actionRole: 'DAMAGE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODEL_READY',
    motionValue: null,
    provenance: TAOQI_PROVENANCE,
  };
}

function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: 'taoqi', kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: TAOQI_PROVENANCE };
}

function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: 'taoqi', kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: TAOQI_PROVENANCE };
}

function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: 'taoqi', kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: TAOQI_PROVENANCE };
}

export const TAOQI_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'taoqi-basic-concealed-edge-1', name: 'Basic Attack — Concealed Edge Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.4534, .4906, .5278, .5799, .617, .6598, .7193, .7788, .8383, .9015], hitCount: 1, conditional: false }),
  action({ factId: 'taoqi-basic-concealed-edge-2', name: 'Basic Attack — Concealed Edge Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.4267, .4617, .4967, .5457, .5807, .6209, .6769, .7329, .7889, .8484], hitCount: 1, conditional: false }),
  action({ factId: 'taoqi-basic-concealed-edge-3', name: 'Basic Attack — Concealed Edge Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.56, .606, .6519, .7162, .7621, .8149, .8884, .9618, 1.0353, 1.1134], hitCount: 1, conditional: false }),
  action({ factId: 'taoqi-basic-concealed-edge-4', name: 'Basic Attack — Concealed Edge Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.36, 1.4716, 1.5831, 1.7392, 1.8507, 1.979, 2.1574, 2.3358, 2.5143, 2.7039], hitCount: 1, conditional: false }),
  action({ factId: 'taoqi-heavy-concealed-edge', name: 'Heavy Attack — Concealed Edge', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.1084, 1.1993, 1.2902, 1.4175, 1.5084, 1.6129, 1.7583, 1.9037, 2.0491, 2.2037], hitCount: 1, conditional: false, notes: ['Source text confirms the tap/press Heavy Attack deals Havoc DMG; holding Basic Attack enters Rocksteady Defense, represented separately.'] }),
  action({ factId: 'taoqi-heavy-strategic-parry', name: 'Heavy Attack — Strategic Parry', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'BASIC', scalingStat: 'DEF', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3959, .4284, .4608, .5063, .5387, .5761, .628, .6799, .7319, .787], hitCount: 1, conditional: true, notes: ['Current raw damage data identifies Strategic Parry as DEF scaling and Basic damage type despite being the Heavy Attack counter branch.'] }),
  action({ factId: 'taoqi-mid-air-concealed-edge', name: 'Mid-air Attack — Concealed Edge', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.62, .6709, .7217, .7929, .8437, .9022, .9836, 1.0649, 1.1462, 1.2327], hitCount: 1, conditional: false }),
  action({ factId: 'taoqi-dodge-counter-concealed-edge', name: 'Dodge Counter — Concealed Edge', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.25, 1.3525, 1.455, 1.5985, 1.701, 1.8189, 1.9829, 2.1469, 2.3109, 2.4852], hitCount: 1, conditional: true }),
  action({ factId: 'taoqi-skill-fortified-defense', name: 'Resonance Skill — Fortified Defense', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'DEF', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.6786, .7343, .7899, .8678, .9235, .9875, 1.0765, 1.1655, 1.2546, 1.3492], hitCount: 1, conditional: false, notes: ['Current raw damage data identifies Fortified Defense damage and healing as DEF scaling.'] }),
  action({ factId: 'taoqi-liberation-unmovable', name: 'Resonance Liberation — Unmovable', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'DEF', motionValueContext: CURVE_CONTEXT, motionValueCurve: [2.262, 2.4475, 2.633, 2.8927, 3.0782, 3.2915, 3.5883, 3.885, 4.1818, 4.4971], hitCount: 1, conditional: false, notes: ["Source explicitly states the attack is based on Taoqi's DEF."] }),
  action({ factId: 'taoqi-intro-defense-formation', name: 'Intro Skill — Defense Formation', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.05, 1.1361, 1.2222, 1.3428, 1.4289, 1.5279, 1.6657, 1.8034, 1.9412, 2.0876], hitCount: 1, conditional: false }),
  action({ factId: 'taoqi-forte-timed-counter-1', name: 'Forte Circuit — Timed Counter Stage 1', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'BASIC', scalingStat: 'DEF', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.4336, .4692, .5047, .5545, .59, .6309, .6878, .7447, .8016, .862], hitCount: 1, conditional: true, notes: ['Source considers Timed Counters Basic Attack DMG; raw damage data identifies DEF scaling.'] }),
  action({ factId: 'taoqi-forte-timed-counter-2', name: 'Forte Circuit — Timed Counter Stage 2', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'BASIC', scalingStat: 'DEF', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.558, .6038, .6495, .7136, .7593, .8119, .8851, .9583, 1.0316, 1.1093], hitCount: 1, conditional: true, notes: ['Source considers Timed Counters Basic Attack DMG; raw damage data identifies DEF scaling.'] }),
  action({ factId: 'taoqi-forte-timed-counter-3', name: 'Forte Circuit — Timed Counter Stage 3', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'BASIC', scalingStat: 'DEF', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.7314, .7914, .8514, .9353, .9953, 1.0643, 1.1602, 1.2562, 1.3522, 1.4541], hitCount: 1, conditional: true, notes: ['Source considers Timed Counters Basic Attack DMG; raw damage data identifies DEF scaling.'] }),
] as const;

export const TAOQI_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: 'taoqi-resource-resolving-caliber', name: 'Resolving Caliber', section: 'FORTE_CIRCUIT', conditional: false, resourceName: 'Resolving Caliber', maxValue: 3, ruleSummary: 'Taoqi can hold up to 3 Resolving Caliber. Basic Attack Stage 4 consumes all Rocksteady Shields and grants the same number of Resolving Caliber. While Rocksteady Shield exists, an on-field hit consumes 1 shield and recovers Resolving Caliber. When Rocksteady Shield ends, all remaining shields are consumed to grant the same number of Resolving Caliber.' }),
  resource({ factId: 'taoqi-resource-rocksteady-shield', name: 'Rocksteady Shield', section: 'RESONANCE_SKILL', conditional: false, resourceName: 'Rocksteady Shield', maxValue: 3, ruleSummary: 'Fortified Defense generates 3 Rocksteady Shields. When the active character is attacked, 1 Rocksteady Shield is consumed to reduce that instance of damage; remaining shields later convert into Resolving Caliber under the Forte rule.' }),
] as const;

export const TAOQI_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: 'taoqi-state-rocksteady-defense', name: 'Rocksteady Defense', section: 'BASIC_ATTACK', conditional: true, scope: 'SELF', triggerSummary: 'Taoqi holds Basic Attack to enter Rocksteady Defense.', effectSummary: 'Taoqi takes 35% less damage. Being attacked during Rocksteady Defense casts Strategic Parry; Strategic Parry is also automatically cast after Rocksteady Defense lasts 3s. Being attacked while casting Fortified Defense also automatically casts Strategic Parry.', durationSeconds: 3, maxStacks: 1, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'taoqi-skill-fortified-defense-utility', name: 'Resonance Skill — Fortified Defense healing and shields', section: 'RESONANCE_SKILL', conditional: false, scope: 'TEAM', triggerSummary: 'Taoqi casts Fortified Defense.', effectSummary: 'Taoqi heals herself using DEF scaling and generates 3 Rocksteady Shields. Current Lv1-Lv10 healing values are 950+45%, 1064+46.8%, 1187+48.6%, 1330+51.3%, 1501+54.9%, 1662+58.5%, 1691+65.25%, 1729+72.9%, 1757+81%, 1805+94.5%. Each Rocksteady Shield reduces the triggering damage instance by 15% before one shield is consumed. The skill has 15s cooldown and restores 15 Concerto Energy.', durationSeconds: null, maxStacks: 3, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'taoqi-forte-power-shift-shields', name: 'Forte Circuit — Power Shift shields', section: 'FORTE_CIRCUIT', conditional: true, scope: 'SELF', triggerSummary: 'Timed Counter Stage 1, 2 or 3 hits a target while Taoqi carries Resolving Caliber.', effectSummary: 'Each Timed Counter hit consumes 1 Resolving Caliber and grants a DEF-scaling shield for 18s. Current Lv1-Lv10 Stage 1 shield values are 300+11.25%, 336+11.7%, 375+12.15%, 420+12.82%, 474+13.72%, 525+14.62%, 534+16.31%, 546+18.22%, 555+20.25%, 570+23.62%; Stage 2: 450+16.87%, 504+17.55%, 562+18.22%, 630+19.23%, 711+20.58%, 787+21.93%, 801+24.46%, 819+27.33%, 832+30.37%, 855+35.43%; Stage 3: 750+28.12%, 840+29.25%, 937+30.37%, 1050+32.06%, 1185+34.31%, 1312+36.56%, 1335+40.78%, 1365+45.56%, 1387+50.62%, 1425+59.06%.', durationSeconds: 18, maxStacks: null, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'taoqi-inherent-steadfast-protection', name: 'Inherent Skill — Steadfast Protection', section: 'INHERENT_SKILL', conditional: true, scope: 'SELF', triggerSummary: 'Resonance Skill Rocksteady Shield is active.', effectSummary: "Taoqi's DEF is increased by 15% while Rocksteady Shield lasts.", durationSeconds: null, maxStacks: 1 }),
  passive({ factId: 'taoqi-inherent-unyielding', name: 'Inherent Skill — Unyielding', section: 'INHERENT_SKILL', conditional: true, scope: 'SELF', triggerSummary: 'Heavy Attack Strategic Parry is successfully triggered.', effectSummary: 'Taoqi recovers 25 STA.', durationSeconds: null, maxStacks: 1 }),
  passive({ factId: 'taoqi-outro-iron-will', name: 'Outro Skill — Iron Will', section: 'OUTRO_SKILL', conditional: true, scope: 'NEXT_CHARACTER', triggerSummary: 'Taoqi casts Outro Skill and the incoming Resonator takes the field.', effectSummary: 'The incoming Resonator has Resonance Skill DMG Amplified by 38% for 14s or until switched out.', durationSeconds: 14, maxStacks: 1, modelingStatus: 'MODEL_READY' }),
] as const;

export const TAOQI_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'taoqi-s1-essense-of-tranquility', name: 'S1 — Essense of Tranquility', section: 'RESONANCE_CHAIN', sequence: 1, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: "Forte Circuit Power Shift's shield is increased by 40%." }),
  sequence({ factId: 'taoqi-s2-silent-strength', name: 'S2 — Silent Strength', section: 'RESONANCE_CHAIN', sequence: 2, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'The Crit. Rate and Crit. DMG of Resonance Liberation Unmovable are each increased by 20%.' }),
  sequence({ factId: 'taoqi-s3-keen-eyed-observer', name: 'S3 — Keen-eyed Observer', section: 'RESONANCE_CHAIN', sequence: 3, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'The duration of Resonance Skill Rocksteady Shield is extended to 30s.' }),
  sequence({ factId: 'taoqi-s4-heavylifting-duty', name: 'S4 — Heavylifting Duty', section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: 'Taoqi successfully triggers Heavy Attack Strategic Parry.', effectSummary: 'Taoqi restores 25% HP and increases her DEF by 50% for 5s. This can be triggered once every 15s.' }),
  sequence({ factId: 'taoqi-s5-benevolent-guardian', name: 'S5 — Benevolent Guardian', section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: 'Forte Circuit Power Shift is used / hits a target.', effectSummary: 'Power Shift damage is increased by 50%; when Power Shift hits a target, Taoqi restores 20 Resonance Energy.' }),
  sequence({ factId: 'taoqi-s6-defender-of-peace', name: 'S6 — Defender of Peace', section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: 'The shield granted by Resonance Skill Rocksteady Shield holds.', effectSummary: "Taoqi's Basic Attack and Heavy Attack damage is increased by 40%." }),
] as const;

export const TAOQI_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...TAOQI_ACTION_FACTS,
  ...TAOQI_RESOURCE_FACTS,
  ...TAOQI_PASSIVE_FACTS,
  ...TAOQI_SEQUENCE_FACTS,
] as const;
