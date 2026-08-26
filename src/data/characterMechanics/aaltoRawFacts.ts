import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterMotionValueCurve,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-26';
const WUTHERING_WIKI = 'https://wuthering.wiki/character_1403.html';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/aalto';
const WUTHERINGLAB = 'https://wutheringlab.com/character/aalto-build/';

const AALTO_PROVENANCE = {
  sourceLabels: ['Wuthering.wiki — Aalto raw skill data', 'Prydwen — current Aalto kit', 'Wutheringlab — current Aalto kit'],
  sourceUrls: [WUTHERING_WIKI, PRYDWEN, WUTHERINGLAB],
  checkedAt: CHECKED_AT,
  notes: [
    'Wuthering.wiki supplies the full Lv1-Lv10 multiplier tables; current Prydwen and Wutheringlab cross-check action identity, kit wording and endpoint values.',
    'The Wuthering Waves Fandom Half Truths table currently displays 38.81%*2 for Basic Attack Stage 3 at Lv6, conflicting with the structured Wuthering.wiki value 34.93%*2 and the surrounding progression. Bellibing retains 34.93%*2 and records the discrepancy instead of silently copying the outlier.',
    'Source-facing damage curves are stored per listed coefficient. Explicit source multipliers such as *2 and *3 are represented by hitCount instead of being multiplied into the curve.',
  ],
} as const;

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return {
    ...input,
    characterId: 'aalto',
    kind: 'ACTION',
    actionRole: 'DAMAGE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODEL_READY',
    motionValue: null,
    provenance: AALTO_PROVENANCE,
  };
}

function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return {
    ...rest,
    characterId: 'aalto',
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    provenance: AALTO_PROVENANCE,
  };
}

function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return {
    ...input,
    characterId: 'aalto',
    kind: 'RESOURCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: AALTO_PROVENANCE,
  };
}

function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return {
    ...input,
    characterId: 'aalto',
    kind: 'SEQUENCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: AALTO_PROVENANCE,
  };
}

const BASIC_1: CharacterMotionValueCurve = [.16, .1732, .1863, .2047, .2178, .2329, .2539, .2748, .2958, .3181];
const BASIC_2: CharacterMotionValueCurve = [.2667, .2886, .3104, .3411, .3629, .3881, .4231, .458, .493, .5302];
const BASIC_3: CharacterMotionValueCurve = [.24, .2597, .2794, .307, .3266, .3493, .3808, .4122, .4437, .4772];
const BASIC_4: CharacterMotionValueCurve = [.2534, .2742, .2949, .324, .3448, .3687, .4019, .4351, .4684, .5037];
const BASIC_5: CharacterMotionValueCurve = [.904, .9782, 1.0523, 1.1561, 1.2302, 1.3155, 1.4341, 1.5527, 1.6713, 1.7973];
const MID_AIR: CharacterMotionValueCurve = [.30, .3246, .3492, .3837, .4083, .4366, .4759, .5153, .5547, .5965];
const AIMED: CharacterMotionValueCurve = [.18, .1948, .2096, .2302, .245, .262, .2856, .3092, .3328, .3579];
const FULLY_CHARGED_AIMED: CharacterMotionValueCurve = [.405, .4383, .4715, .518, .5512, .5894, .6425, .6956, .7488, .8052];
const DODGE_COUNTER: CharacterMotionValueCurve = [1.077, 1.1654, 1.2537, 1.3773, 1.4656, 1.5672, 1.7085, 1.8498, 1.9911, 2.1412];
const MIST_BULLET: CharacterMotionValueCurve = [.30, .3246, .3492, .3837, .4083, .4366, .4759, .5153, .5547, .5965];
const LIBERATION: CharacterMotionValueCurve = [2, 2.164, 2.328, 2.5576, 2.7216, 2.9102, 3.1726, 3.435, 3.6974, 3.9762];
const INTRO: CharacterMotionValueCurve = [.3334, .3607, .388, .4263, .4536, .4851, .5288, .5725, .6163, .6627];
const CURVE_CONTEXT = 'Current source Lv1-Lv10 per-listed-hit multiplier curve; no skill level is implicitly selected by raw data.';

export const AALTO_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'aalto-basic-half-truths-1', name: 'Basic Attack — Half Truths Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_1, hitCount: 1, conditional: false }),
  action({ factId: 'aalto-basic-half-truths-2', name: 'Basic Attack — Half Truths Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_2, hitCount: 1, conditional: false }),
  action({ factId: 'aalto-basic-half-truths-3', name: 'Basic Attack — Half Truths Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_3, hitCount: 2, conditional: false, notes: ['Source-facing multiplier is listed as coefficient *2. Fandom currently has a conflicting Lv6 table cell; see provenance.'] }),
  action({ factId: 'aalto-basic-half-truths-4', name: 'Basic Attack — Half Truths Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_4, hitCount: 2, conditional: false, notes: ['Basic Attack Stage 4 also spreads Mist forward for 1.5 seconds; that utility state is not converted into damage uptime here.'] }),
  action({ factId: 'aalto-basic-half-truths-5', name: 'Basic Attack — Half Truths Stage 5', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_5, hitCount: 1, conditional: false }),
  action({ factId: 'aalto-heavy-aimed-shot', name: 'Heavy Attack — Aimed Shot', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: AIMED, hitCount: 1, conditional: false }),
  action({ factId: 'aalto-heavy-fully-charged-aimed-shot', name: 'Heavy Attack — Fully Charged Aimed Shot', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: FULLY_CHARGED_AIMED, hitCount: 1, conditional: false }),
  action({ factId: 'aalto-mid-air-half-truths', name: 'Mid-air Attack — Half Truths', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: MID_AIR, hitCount: 1, conditional: false, notes: ['Source lists 5 Stamina consumption at every skill level.'] }),
  action({ factId: 'aalto-dodge-counter-half-truths', name: 'Dodge Counter — Half Truths', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: DODGE_COUNTER, hitCount: 1, conditional: true }),
  action({ factId: 'aalto-skill-shift-trick-mist-bullet', name: 'Resonance Skill — Shift Trick: Mist Bullet', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: MIST_BULLET, hitCount: 6, conditional: false, notes: ['Shift Trick generates 6 Mist Bullets. Whether all projectiles connect is encounter state, not raw-data uptime.'] }),
  action({ factId: 'aalto-forte-mist-missile', name: 'Forte Circuit — Mist Missile', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: MIST_BULLET, hitCount: 1, conditional: true, notes: ['One Mist Missile is generated per Mist Drop consumed during Mistcloak Dash and is considered Resonance Skill DMG.'] }),
  action({ factId: 'aalto-liberation-flower-in-the-mist', name: 'Resonance Liberation — Flower in the Mist', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: LIBERATION, hitCount: 1, conditional: false }),
  action({ factId: 'aalto-intro-feint-shot', name: 'Intro Skill — Feint Shot', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: INTRO, hitCount: 3, conditional: false }),
] as const;

export const AALTO_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'aalto-resource-mist-drops',
    name: 'Mist Drops',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Mist Drops',
    maxValue: 6,
    ruleSummary: 'Aalto can hold up to 6 Mist Drops. A Basic Attack or Mid-air Attack that passes through Mist and hits a target restores 1 Mist Drop. During Mistcloak Dash, Mist Drops are continuously consumed and each consumed drop generates 1 Mist Missile.',
  }),
] as const;

export const AALTO_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'aalto-skill-mist-avatar-utility',
    name: 'Resonance Skill — Mist Avatar utility',
    section: 'RESONANCE_SKILL',
    conditional: false,
    scope: 'OTHER',
    triggerSummary: 'Cast Resonance Skill — Shift Trick.',
    effectSummary: 'Creates Mist and one Mist Avatar that taunts nearby targets. The avatar inherits 100% of Aalto HP at all skill levels and lasts 8 seconds; the skill generates 6 Mist Bullets.',
    durationSeconds: 8,
    maxStacks: 1,
  }),
  passive({
    factId: 'aalto-forte-mistcloak-dash',
    name: 'Forte Circuit — Mistcloak Dash',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Aalto passes through Mist or Gate of Quandary.',
    effectSummary: 'Aalto enters Mistcloak Dash and gains 40% Movement Speed. Mist Drops are continuously consumed; each consumed Mist Drop generates one Mist Missile.',
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['Exact dash duration/consumption cadence is combat-state behavior and is not invented by the raw fact.'],
  }),
  passive({
    factId: 'aalto-liberation-gate-of-quandary',
    name: 'Resonance Liberation — Gate of Quandary',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'OTHER',
    triggerSummary: 'Cast Flower in the Mist; a bullet then passes through Gate of Quandary.',
    effectSummary: 'Gate of Quandary lasts 10 seconds. Current skill tables expose a 10% "Gate Of Quandary ATK Increase" parameter for bullets passing through it.',
    durationSeconds: 10,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['Current Prydwen labels the effect as ATK increase while Wuthering.wiki descriptive text says bullets deal increased DMG; the raw 10% parameter is retained but executable stat-bucket interpretation remains pending.'],
  }),
  passive({
    factId: 'aalto-inherent-perfect-performance',
    name: 'Inherent Skill — Perfect Performance',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Aalto performs a Heavy Attack; can trigger once every 30 seconds.',
    effectSummary: 'The Heavy Attack will always critically hit.',
    durationSeconds: null,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'aalto-inherent-mid-game-break',
    name: 'Inherent Skill — Mid-game Break',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Aalto is in Forte Circuit Mistcloak Dash state.',
    effectSummary: 'Aalto continuously recovers Stamina while Mistcloak Dash is active.',
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'aalto-outro-dissolving-mist',
    name: 'Outro Skill — Dissolving Mist',
    section: 'OUTRO_SKILL',
    conditional: true,
    scope: 'NEXT_CHARACTER',
    triggerSummary: 'Aalto casts Outro Skill and the incoming Resonator takes the field.',
    effectSummary: 'The incoming Resonator gains 23% Aero DMG Amplification for 14 seconds or until that character switches out.',
    durationSeconds: 14,
    maxStacks: 1,
    modelingStatus: 'MODEL_READY',
  }),
] as const;

export const AALTO_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'aalto-s1-sequence-node-1', name: 'S1 — Sequence Node 1', section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: 'Active at Sequence 1 or higher.', effectSummary: 'Reduces Resonance Skill Shift Trick cooldown by 4 seconds.' }),
  sequence({ factId: 'aalto-s2-sequence-node-2', name: 'S2 — Sequence Node 2', section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: 'Active at Sequence 2 or higher; ATK branch requires Aalto to attack a target taunted by Mist Avatar.', effectSummary: 'Mist Avatar inherits 100% more HP from Aalto. When Aalto attacks targets taunted by Mist Avatar, his ATK is increased by 15%.' }),
  sequence({ factId: 'aalto-s3-sequence-node-3', name: 'S3 — Sequence Node 3', section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: 'Aalto Basic Attack or Mid-air Attack passes through Gate of Quandary.', effectSummary: 'Generates 2 additional bullets, each dealing 50% of the originating Basic Attack or Mid-air Attack DMG.' }),
  sequence({ factId: 'aalto-s4-sequence-node-4', name: 'S4 — Sequence Node 4', section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: 'Active at Sequence 4 or higher.', effectSummary: 'Increases Resonance Skill Mist Bullet damage by 30%. While in Mistcloak Dash, Aalto takes 30% less damage.' }),
  sequence({ factId: 'aalto-s5-sequence-node-5', name: 'S5 — Sequence Node 5', section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: 'Aalto is in Forte Circuit Mistcloak Dash state.', effectSummary: 'Increases Aalto Aero DMG Bonus by 25% for 6 seconds.' }),
  sequence({ factId: 'aalto-s6-sequence-node-6', name: 'S6 — Sequence Node 6', section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: 'Active at Sequence 6; Heavy Attack branch requires the Heavy Attack to pass through Gate of Quandary.', effectSummary: 'Flower in the Mist additionally increases Crit Rate by 8%. When Aalto Heavy Attack passes through Gate of Quandary, its damage is additionally increased by 50%.' }),
] as const;

export const AALTO_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...AALTO_ACTION_FACTS,
  ...AALTO_RESOURCE_FACTS,
  ...AALTO_PASSIVE_FACTS,
  ...AALTO_SEQUENCE_FACTS,
] as const;