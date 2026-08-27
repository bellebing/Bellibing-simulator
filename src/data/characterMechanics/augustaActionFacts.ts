import type {
  CharacterActionFact,
  CharacterMotionValueCurve,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-26';
const FANDOM_COMBAT = 'https://wutheringwaves.fandom.com/wiki/Augusta/Combat';
const WUTHERING_GG = 'https://wuthering.gg/characters/augusta';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/augusta';
const INDEX_GAME = 'https://www.indexgame.in.th/en/guide/wutheringwavesuid/augusta';
const JP_WIKI = 'https://wikiwiki.jp/w-w/%E3%82%AA%E3%83%BC%E3%82%AC%E3%82%B9%E3%82%BF';
const WUTHERINGLAB = 'https://wutheringlab.com/character/augusta-build/';

const AUGUSTA_ACTION_PROVENANCE = {
  sourceLabels: [
    'Wuthering Waves Wiki/Fandom — current Augusta combat tables',
    'Wuthering.gg — current Augusta kit and live Lv1 values',
    'Prydwen — current Augusta kit and live Lv1 values',
    'Index Game Center — current Augusta Lv10 endpoints',
    '鳴潮 Wiki* — current Augusta live endpoints',
    'Wutheringlab — current page retained as conflicting/stale representation evidence',
  ],
  sourceUrls: [FANDOM_COMBAT, WUTHERING_GG, PRYDWEN, INDEX_GAME, JP_WIKI, WUTHERINGLAB],
  checkedAt: CHECKED_AT,
  notes: [
    'Canonical ACTION curves use the current live Lv1-Lv10 values. The separate Augusta Standard parity fixture continues to own its historical selected-level aggregate motion values.',
    'Current Fandom displays 20.00% as Everbright Protector first component at Lv1, but its Lv2-Lv10 row continues 129.84% through 238.58%; current Wuthering.gg and the current Japanese wiki both show 120.00% at Lv1 and 238.58% at Lv10. Bellibing therefore records the Fandom Lv1 cell as a source discrepancy and uses the independently corroborated 120.00% value.',
    "Current Fandom, Wuthering.gg and Prydwen show Warrior's Blade at 110.00%*3 with 15s cooldown, while the current Japanese wiki page shows a conflicting 89.10%*3 Lv1 cell and Wutheringlab still shows the older 85.82%*3 / 8s representation. The full current Fandom curve is retained and the conflicting secondary cells remain provenance evidence.",
    'Current live sources represent Undying Sunlight: Plunge as 43.55% + 391.95% at Lv1 through 86.59% + 779.24% at Lv10. Older/stale mirrors still split the first coefficient as 21.78%*2 through 43.30%*2; Bellibing preserves the current source structure instead of merely matching the same aggregate total.',
    'Source-facing curves store one listed coefficient per Lv1-Lv10 row. Explicit source multipliers remain separate hit counts/components and are never pre-summed into raw data.',
  ],
} as const;

const CURVE_CONTEXT = 'Current live source Lv1-Lv10 per-listed-hit multiplier representation; no skill level is implicitly selected by raw data.';

function action(
  input: Omit<
    CharacterActionFact,
    | 'characterId'
    | 'kind'
    | 'verificationStatus'
    | 'provenance'
    | 'motionValue'
    | 'actionRole'
    | 'modelingStatus'
  > & {
    actionRole?: CharacterActionFact['actionRole'];
    modelingStatus?: CharacterActionFact['modelingStatus'];
  },
): CharacterActionFact {
  const {
    actionRole = 'DAMAGE',
    modelingStatus = 'MODEL_READY',
    ...rest
  } = input;
  return {
    ...rest,
    characterId: 'augusta',
    kind: 'ACTION',
    actionRole,
    verificationStatus: 'VERIFIED',
    modelingStatus,
    motionValue: null,
    provenance: AUGUSTA_ACTION_PROVENANCE,
  };
}

const BASIC_1: CharacterMotionValueCurve = [.289, .3127, .3364, .3696, .3933, .4206, .4585, .4964, .5343, .5746];
const BASIC_2: CharacterMotionValueCurve = [.337, .3647, .3923, .431, .4586, .4904, .5346, .5788, .6231, .67];
const BASIC_3: CharacterMotionValueCurve = [.33, .3571, .3842, .4221, .4491, .4802, .5235, .5668, .6101, .6561];
const BASIC_4: CharacterMotionValueCurve = [.3251, .3518, .3784, .4157, .4424, .473, .5157, .5583, .601, .6463];
const STEELCLASH: CharacterMotionValueCurve = [.2334, .2525, .2716, .2984, .3176, .3396, .3702, .4008, .4314, .4639];
const MID_AIR: CharacterMotionValueCurve = [.30, .3246, .3492, .3837, .4083, .4366, .4759, .5153, .5547, .5965];
const BACKSTEP: CharacterMotionValueCurve = [.27, .2922, .3143, .3453, .3675, .3929, .4284, .4638, .4992, .5368];
const SPINSLASH: CharacterMotionValueCurve = [.7128, .7713, .8297, .9116, .97, 1.0372, 1.1308, 1.2243, 1.3178, 1.4172];
const UPPERCUT: CharacterMotionValueCurve = [.90, .9738, 1.0476, 1.1510, 1.2248, 1.3096, 1.4277, 1.5458, 1.6639, 1.7893];
const WARRIORS_BLADE: CharacterMotionValueCurve = [1.10, 1.1902, 1.2804, 1.4067, 1.4969, 1.6007, 1.7450, 1.8893, 2.0336, 2.1870];
const SWORD_OATH_A: CharacterMotionValueCurve = [.1659, .1796, .1932, .2122, .2258, .2415, .2632, .2850, .3067, .3299];
const SWORD_OATH_B: CharacterMotionValueCurve = [.6636, .7181, .7725, .8487, .9031, .9657, 1.0527, 1.1398, 1.2268, 1.3194];
const SWORD_OATH_C: CharacterMotionValueCurve = [2.8756, 3.1114, 3.3472, 3.6774, 3.9132, 4.1843, 4.5616, 4.9389, 5.3162, 5.7170];
const SUNBORNE: CharacterMotionValueCurve = [.60, .6492, .6984, .7673, .8165, .8731, .9518, 1.0305, 1.1093, 1.1929];
const EVERBRIGHT_A: CharacterMotionValueCurve = [1.20, 1.2984, 1.3968, 1.5346, 1.6330, 1.7462, 1.9036, 2.0610, 2.2185, 2.3858];
const EVERBRIGHT_B: CharacterMotionValueCurve = [4.50, 4.8690, 5.2380, 5.7546, 6.1236, 6.5480, 7.1384, 7.7288, 8.3192, 8.9465];
const EVERBRIGHT_C: CharacterMotionValueCurve = [.03, .0325, .0350, .0384, .0409, .0437, .0476, .0516, .0555, .0597];
const UNDYING_STRIKE: CharacterMotionValueCurve = [.70, .7574, .8148, .8952, .9526, 1.0186, 1.1105, 1.2023, 1.2941, 1.3917];
const UNDYING_LEAP_A: CharacterMotionValueCurve = [1.12, 1.2119, 1.3037, 1.4323, 1.5241, 1.6298, 1.7767, 1.9236, 2.0706, 2.2267];
const UNDYING_LEAP_B: CharacterMotionValueCurve = [.14, .1515, .1630, .1791, .1906, .2038, .2221, .2405, .2589, .2784];
const UNDYING_PLUNGE_A: CharacterMotionValueCurve = [.4355, .4713, .5070, .5570, .5927, .6337, .6909, .7480, .8052, .8659];
const UNDYING_PLUNGE_B: CharacterMotionValueCurve = [3.9195, 4.2409, 4.5623, 5.0123, 5.3337, 5.7033, 6.2176, 6.7318, 7.2460, 7.7924];
const INTRO: CharacterMotionValueCurve = [.50, .5410, .5820, .6394, .6804, .7276, .7932, .8588, .9244, .9941];

export const AUGUSTA_CHARACTER_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'augusta-basic-hunters-path-1', name: "Basic Attack — Hunter's Path Stage 1", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_1, hitCount: 1, conditional: false }),
  action({ factId: 'augusta-basic-hunters-path-2', name: "Basic Attack — Hunter's Path Stage 2", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_2, hitCount: 2, conditional: false }),
  action({ factId: 'augusta-basic-hunters-path-3', name: "Basic Attack — Hunter's Path Stage 3", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_3, hitCount: 3, conditional: false }),
  action({ factId: 'augusta-basic-hunters-path-4', name: "Basic Attack — Hunter's Path Stage 4", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_4, hitCount: 3, conditional: false }),
  action({ factId: 'augusta-heavy-steelclash', name: 'Heavy Attack — Steelclash', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: STEELCLASH, hitCount: 3, conditional: false }),
  action({ factId: 'augusta-mid-air-hunters-path', name: "Mid-air Attack — Hunter's Path", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: MID_AIR, hitCount: 2, conditional: false }),
  action({ factId: 'augusta-dodge-counter-hunters-path', name: "Dodge Counter — Hunter's Path", section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BASIC_2, hitCount: 2, conditional: true }),
  action({ factId: 'augusta-mid-air-dodge-counter-hunters-path', name: "Mid-air Dodge Counter — Hunter's Path", section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: MID_AIR, hitCount: 2, conditional: true }),
  action({ factId: 'augusta-heavy-thunderoar-backstep', name: 'Heavy Attack — Thunderoar: Backstep', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BACKSTEP, hitCount: 1, conditional: true, modelingStatus: 'MODELED' }),
  action({ factId: 'augusta-heavy-thunderoar-spinslash', name: 'Heavy Attack — Thunderoar: Spinslash', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: SPINSLASH, hitCount: 3, conditional: true, modelingStatus: 'MODELED' }),
  action({ factId: 'augusta-heavy-thunderoar-uppercut', name: 'Heavy Attack — Thunderoar: Uppercut', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: UPPERCUT, hitCount: 2, conditional: true }),
  action({ factId: 'augusta-dodge-counter-heavy-steelclash', name: 'Dodge Counter — Heavy Attack: Steelclash', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: STEELCLASH, hitCount: 3, conditional: true, notes: ['Current kit wording explicitly classifies this replacement Dodge Counter as Heavy Attack DMG.'] }),
  action({ factId: 'augusta-dodge-counter-thunderoar-backstep', name: 'Dodge Counter — Thunderoar: Backstep', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: BACKSTEP, hitCount: 1, conditional: true, notes: ['Current kit wording explicitly classifies this replacement Dodge Counter as Heavy Attack DMG.'] }),
  action({ factId: 'augusta-skill-warriors-blade', name: "Resonance Skill — Warrior's Blade", section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: WARRIORS_BLADE, hitCount: 3, conditional: false, modelingStatus: 'MODELED' }),
  action({ factId: 'augusta-liberation-sword-of-eternal-oath', name: 'Resonance Liberation — Sword of Eternal Oath', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [
    { curve: SWORD_OATH_A, hitCount: 2 },
    { curve: SWORD_OATH_B, hitCount: 3 },
    { curve: SWORD_OATH_A, hitCount: 2 },
    { curve: SWORD_OATH_C, hitCount: 1 },
  ], hitCount: null, conditional: false, modelingStatus: 'MODELED', notes: ['Kit section is Resonance Liberation while current source wording explicitly classifies its damage as Heavy Attack DMG.'] }),
  action({ factId: 'augusta-liberation-sublime-is-the-sun-state', name: 'Resonance Liberation — Sublime is the Sun', section: 'RESONANCE_LIBERATION', actionKind: 'STATE_CHANGE', actionRole: 'NON_DAMAGE', damageClass: null, scalingStat: 'UNKNOWN', motionValueContext: null, hitCount: null, conditional: false, modelingStatus: 'MODELED', notes: ['Non-damaging state/setup action. Its Ruler\'s Realm / Sworn Allegiance mechanics are owned by separate raw facts.'] }),
  action({ factId: 'augusta-liberation-sunborne', name: 'Sublime is the Sun — Sunborne', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: SUNBORNE, hitCount: 1, conditional: true, modelingStatus: 'MODELED', notes: ['Each source action instance uses the listed coefficient. The Augusta Standard parity fixture separately locks its historical nine-cast aggregate. Current source wording explicitly classifies Sunborne as Heavy Attack DMG.'] }),
  action({ factId: 'augusta-liberation-everbright-protector', name: 'Sublime is the Sun — Everbright Protector', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [
    { curve: EVERBRIGHT_A, hitCount: 1 },
    { curve: EVERBRIGHT_B, hitCount: 1 },
    { curve: EVERBRIGHT_C, hitCount: 10 },
  ], hitCount: null, conditional: true, modelingStatus: 'MODELED', notes: ['Current source wording explicitly classifies Everbright Protector as Heavy Attack DMG. The Fandom Lv1 first-component typo/conflict is recorded in provenance.'] }),
  action({ factId: 'augusta-forte-undying-sunlight-strike', name: 'Resonance Skill — Undying Sunlight: Strike', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: UNDYING_STRIKE, hitCount: 2, conditional: true, modelingStatus: 'MODELED' }),
  action({ factId: 'augusta-forte-undying-sunlight-leap', name: 'Resonance Skill — Undying Sunlight: Leap', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [
    { curve: UNDYING_LEAP_A, hitCount: 1 },
    { curve: UNDYING_LEAP_B, hitCount: 2 },
  ], hitCount: null, conditional: true, modelingStatus: 'MODELED' }),
  action({ factId: 'augusta-forte-undying-sunlight-plunge', name: 'Resonance Skill — Undying Sunlight: Plunge', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [
    { curve: UNDYING_PLUNGE_A, hitCount: 1 },
    { curve: UNDYING_PLUNGE_B, hitCount: 1 },
  ], hitCount: null, conditional: true, modelingStatus: 'MODELED', notes: ['Current kit wording explicitly classifies Plunge as Heavy Attack DMG. Older source mirrors retain a stale split first component; see provenance.'] }),
  action({ factId: 'augusta-dodge-counter-undying-sunlight-strike', name: 'Dodge Counter — Undying Sunlight: Strike', section: 'FORTE_CIRCUIT', actionKind: 'DODGE_COUNTER', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: UNDYING_STRIKE, hitCount: 2, conditional: true, notes: ['Current kit wording explicitly classifies this Dodge Counter replacement as Resonance Skill DMG.'] }),
  action({ factId: 'augusta-intro-stride-of-goldenflare', name: 'Intro Skill — Stride of Goldenflare', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: INTRO, hitCount: 2, conditional: false, modelingStatus: 'MODELED' }),
  action({ factId: 'augusta-outro-battlesong-of-the-unyielding', name: 'Outro — Battlesong of the Unyielding', section: 'OUTRO_SKILL', actionKind: 'OUTRO', actionRole: 'NON_DAMAGE', damageClass: null, scalingStat: 'UNKNOWN', motionValueContext: null, hitCount: null, conditional: false, modelingStatus: 'MODELED', notes: ['The team-facing Outro effect is owned by a separate verified passive fact.'] }),
] as const;
