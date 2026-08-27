import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/brant';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/brant';
const WUTHERING_LAB = 'https://wutheringlab.com/character/brant-build/';
const WUTHERING_WIKI_RAW = 'https://wuthering.wiki/character_1206.html';
const WUTHERING_DB = 'https://wuwa.incin.net/resonators/1206';

const BRANT_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Wuthering.gg — current Brant kit and Tune Break entry',
    'Prydwen — current Brant kit and sequence cross-check',
    'Wuthering.wiki — full Lv1-Lv10 tables and raw damage/scaling/type mirror',
    'WutheringDB — current Brant kit and sequence raw-text cross-check',
    'Wutheringlab — current Brant kit and explicit discrepancy evidence',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN, WUTHERING_WIKI_RAW, WUTHERING_DB, WUTHERING_LAB],
  checkedAt: CHECKED_AT,
  notes: [
    'The PR #61 importer supplied the pinned transcription candidate only. Current source review independently checked Brant kit semantics and current tables before canonical promotion.',
    'Wuthering.wiki full tables and raw damage data corroborate the pinned Lv1-Lv10 damage coefficients, ATK scaling and Basic/Heavy/Skill/Liberation/Intro damage-type boundaries used here.',
    'Healing and shielding scale from Energy Regen in the raw data. They remain utility summaries because Character damage motion-value fields must not be reused for healing/shield formulas or automatic uptime.',
    'Current WutheringDB, Wuthering.gg, Prydwen and the pinned source agree that S2 remains active when Brant is switched off field. Current Wutheringlab instead says the effect ends early if Brant leaves the team; Bellibing keeps the four-source/raw-data consensus and records the conflicting secondary wording rather than guessing.',
    'Current external profile headers disagree on Brant Max Energy (Prydwen/Wutheringlab 125 versus Wuthering.gg 140), while To the Horizon Resonance Cost is separately listed as 175. This Character Mechanics slice does not alter static Character core data or equate Resonance Cost with Max Energy.',
  ],
} as const;

const CURVE_CONTEXT = 'Current source Lv1-Lv10 per-listed-hit multiplier representation from the pinned normalized snapshot, source-audited against current Brant tables/raw damage data; no skill level is implicitly selected.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return {
    ...input,
    characterId: 'brant',
    kind: 'ACTION',
    actionRole: 'DAMAGE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODEL_READY',
    motionValue: null,
    provenance: BRANT_PROVENANCE,
  };
}

function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return {
    ...rest,
    characterId: 'brant',
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    provenance: BRANT_PROVENANCE,
  };
}

function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return {
    ...input,
    characterId: 'brant',
    kind: 'RESOURCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: BRANT_PROVENANCE,
  };
}

function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return {
    ...input,
    characterId: 'brant',
    kind: 'SEQUENCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: BRANT_PROVENANCE,
  };
}

export const BRANT_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'brant-basic-captains-rhapsody-1', name: "Basic Attack — Captain's Rhapsody Stage 1", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.2542, .275, .2959, .3251, .3459, .3699, .4032, .4366, .4699, .5053], hitCount: 1, conditional: false }),
  action({ factId: 'brant-basic-captains-rhapsody-2', name: "Basic Attack — Captain's Rhapsody Stage 2", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.255, .276, .2969, .3261, .3471, .3711, .4046, .438, .4715, .507], hitCount: 1 }, { curve: [.255, .276, .2969, .3261, .3471, .3711, .4046, .438, .4715, .507], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: 'brant-basic-captains-rhapsody-3', name: "Basic Attack — Captain's Rhapsody Stage 3", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.111, .1201, .1292, .1419, .151, .1615, .176, .1906, .2051, .2206], hitCount: 3 }, { curve: [.1664, .1801, .1937, .2128, .2265, .2422, .264, .2858, .3077, .3308], hitCount: 2 }], hitCount: null, conditional: false }),
  action({ factId: 'brant-basic-captains-rhapsody-4', name: "Basic Attack — Captain's Rhapsody Stage 4", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.141, .1525, .1641, .1803, .1918, .2051, .2236, .2421, .2606, .2802], hitCount: 1 }, { curve: [.1128, .122, .1313, .1442, .1535, .1641, .1789, .1937, .2085, .2242], hitCount: 5 }], hitCount: null, conditional: false }),
  action({ factId: 'brant-heavy-captains-rhapsody', name: "Heavy Attack — Captain's Rhapsody", section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.9937, 1.0752, 1.1567, 1.2707, 1.3522, 1.4459, 1.5763, 1.7066, 1.837, 1.9755], hitCount: 1, conditional: false, notes: ['Source lists 25 STA cost.'] }),
  action({ factId: 'brant-heavy-rhapsodic-riff', name: 'Heavy Attack — Rhapsodic Riff', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.85, .9197, .9894, 1.087, 1.1567, 1.2369, 1.3484, 1.4599, 1.5714, 1.6899], hitCount: 1, conditional: true, notes: ['Available after Basic Attack Stage 2/4 by holding Normal Attack, or after Mid-air Attack Stage 4 by pressing Normal Attack. Source lists 25 STA cost.'] }),
  action({ factId: 'brant-mid-air-captains-rhapsody-1', name: "Mid-air Attack — Captain's Rhapsody Stage 1", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.618, .6687, .7193, .7903, .841, .8992, .9803, 1.0614, 1.1425, 1.2286], hitCount: 1, conditional: true, notes: ['Source lists 5 STA cost for Mid-air Attack.'] }),
  action({ factId: 'brant-mid-air-captains-rhapsody-1-charged', name: 'Mid-air Attack — Stage 1 Charged Attack', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.1672, .181, .1947, .2139, .2276, .2433, .2653, .2872, .3091, .3325], hitCount: 1 }, { curve: [.2508, .2714, .292, .3208, .3413, .365, .3979, .4308, .4637, .4987], hitCount: 1 }, { curve: [.209, .2262, .2433, .2673, .2844, .3042, .3316, .359, .3864, .4156], hitCount: 6 }], hitCount: null, conditional: true, notes: ['Source lists 15 STA cost for Mid-air Charged Attack.'] }),
  action({ factId: 'brant-mid-air-captains-rhapsody-1-flip', name: 'Mid-air Attack — Stage 1 Flip', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.17, .184, .1979, .2174, .2314, .2474, .2697, .292, .3143, .338], hitCount: 1 }, { curve: [.2975, .3219, .3463, .3805, .4049, .4329, .472, .511, .55, .5915], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: 'brant-mid-air-captains-rhapsody-1-slash', name: 'Mid-air Attack — Stage 1 Slash', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1417, .1533, .1649, .1812, .1928, .2062, .2248, .2434, .2619, .2817], hitCount: 3, conditional: true, notes: ['Used when the Stage 1 Grapple swing fails to reach the target.'] }),
  action({ factId: 'brant-mid-air-captains-rhapsody-2', name: "Mid-air Attack — Captain's Rhapsody Stage 2", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.4272, .4622, .4972, .5463, .5813, .6216, .6776, .7336, .7897, .8492], hitCount: 1 }, { curve: [.4272, .4622, .4972, .5463, .5813, .6216, .6776, .7336, .7897, .8492], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: 'brant-mid-air-captains-rhapsody-2-charged', name: 'Mid-air Attack — Stage 2 Charged Attack', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1654, .1789, .1925, .2115, .225, .2406, .2623, .284, .3057, .3287], hitCount: 6, conditional: true }),
  action({ factId: 'brant-mid-air-captains-rhapsody-2-flip', name: 'Mid-air Attack — Stage 2 Flip', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.17, .184, .1979, .2174, .2314, .2474, .2697, .292, .3143, .338], hitCount: 1 }, { curve: [.2975, .3219, .3463, .3805, .4049, .4329, .472, .511, .55, .5915], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: 'brant-mid-air-captains-rhapsody-3', name: "Mid-air Attack — Captain's Rhapsody Stage 3", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1417, .1533, .1649, .1812, .1928, .2062, .2248, .2434, .2619, .2817], hitCount: 6, conditional: true }),
  action({ factId: 'brant-mid-air-captains-rhapsody-3-flip', name: 'Mid-air Attack — Stage 3 Flip', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.17, .184, .1979, .2174, .2314, .2474, .2697, .292, .3143, .338], hitCount: 1 }, { curve: [.2975, .3219, .3463, .3805, .4049, .4329, .472, .511, .55, .5915], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: 'brant-mid-air-captains-rhapsody-4', name: "Mid-air Attack — Captain's Rhapsody Stage 4", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.5107, .5526, .5945, .6531, .695, .7431, .8101, .8771, .9441, 1.0153], hitCount: 1 }, { curve: [.1277, .1382, .1487, .1633, .1738, .1858, .2026, .2193, .2361, .2539], hitCount: 3 }, { curve: [.3831, .4145, .4459, .4898, .5213, .5574, .6076, .6579, .7081, .7615], hitCount: 1 }], hitCount: null, conditional: true }),
  action({ factId: 'brant-dodge-counter-captains-rhapsody', name: "Dodge Counter — Captain's Rhapsody", section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.1913, .207, .2227, .2446, .2603, .2783, .3034, .3285, .3536, .3803], hitCount: 3 }, { curve: [.2869, .3104, .334, .3669, .3904, .4175, .4551, .4928, .5304, .5704], hitCount: 2 }], hitCount: null, conditional: true }),
  action({ factId: 'brant-skill-anchors-aweigh', name: 'Resonance Skill — Anchors Aweigh!', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [1.0077, 1.0904, 1.173, 1.2887, 1.3713, 1.4664, 1.5986, 1.7308, 1.863, 2.0035], hitCount: 1 }, { curve: [.6718, .7269, .782, .8591, .9142, .9776, 1.0657, 1.1539, 1.242, 1.3357], hitCount: 1 }], hitCount: null, conditional: false, notes: ['Launches Brant into the air. Current source lists 4s cooldown and 10 Concerto Regen.'] }),
  action({ factId: 'brant-skill-plunging-attack', name: 'Resonance Skill replacement — Plunging Attack', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.527, .5703, .6135, .674, .7172, .7669, .836, .9052, .9743, 1.0478], hitCount: 1, conditional: true, notes: ['While mid-air and Bravo is not full, Anchors Aweigh! is replaced with Plunging Attack. Source explicitly classifies its damage as Basic Attack DMG and lists 30 STA cost.'] }),
  action({ factId: 'brant-liberation-to-the-horizon', name: 'Resonance Liberation — To the Horizon', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.4278, .4629, .498, .5471, .5822, .6225, .6787, .7348, .7909, .8506], hitCount: 4 }, { curve: [1.7112, 1.8516, 1.9919, 2.1883, 2.3287, 2.49, 2.7145, 2.939, 3.1635, 3.4021], hitCount: 1 }], hitCount: null, conditional: false, notes: ['Can be cast in mid-air. Current source lists 24s cooldown, 175 Resonance Cost and 20 Concerto Regen. Healing and Aflame are stored as separate utility facts.'] }),
  action({ factId: 'brant-intro-applaud-for-me', name: 'Intro Skill — Applaud for Me!', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [1.02, 1.1037, 1.1873, 1.3044, 1.3881, 1.4843, 1.6181, 1.7519, 1.8857, 2.0279], hitCount: 1 }, { curve: [.255, .276, .2969, .3261, .3471, .3711, .4046, .438, .4715, .507], hitCount: 1 }], hitCount: null, conditional: false, notes: ['Current source lists 10 Concerto Regen. Interlude Applause is stored as a separate state/utility fact.'] }),
  action({ factId: 'brant-forte-returned-from-ashes', name: 'Forte Circuit — Returned from Ashes', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.2375, .257, .2765, .3038, .3232, .3456, .3768, .408, .4391, .4722], hitCount: 2 }, { curve: [.475, .514, .5529, .6075, .6464, .6912, .7535, .8159, .8782, .9444], hitCount: 1 }, { curve: [.95, 1.0279, 1.1058, 1.2149, 1.2928, 1.3824, 1.507, 1.6317, 1.7563, 1.8887], hitCount: 2 }, { curve: [6.65, 7.1953, 7.7406, 8.5041, 9.0494, 9.6765, 10.5489, 11.4214, 12.2939, 13.2209], hitCount: 1 }], hitCount: null, conditional: true, notes: ['Available when Bravo is full and replaces Anchors Aweigh!. Consumes all Bravo. Source explicitly classifies the damage as Basic Attack DMG and lists 20 Concerto Regen. Shield/state effects are stored separately.'] }),
] as const;

export const BRANT_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'brant-resource-bravo',
    name: 'Forte Gauge — Bravo',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Bravo',
    maxValue: 100,
    ruleSummary: 'Brant can hold up to 100 Bravo. Normal Attacks, Intro Skill and Resonance Skill grant Bravo when they hit. Waves of Acclaims triggers at 25/50/75/100 Bravo. At full Bravo, Returned from Ashes replaces Anchors Aweigh! and consumes all Bravo when cast. During Aflame, Bravo gain efficiency from Normal Attack and Anchors Aweigh! hits is increased by 100%.',
  }),
] as const;

export const BRANT_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'brant-basic-mid-air-grapple-loop',
    name: "Captain's Rhapsody — Mid-air Grapple/Flip transitions",
    section: 'BASIC_ATTACK',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Brant performs the Mid-air Attack chain and its Grapple/Flip branches.',
    effectSummary: 'After Mid-air Stage 1 or 2, Normal Attack can Grapple toward the target. Releasing after a hit or finishing a held string flips backward; Stage 3 flips automatically. Normal Attack after a flip advances the Mid-air chain, and each flip resets Mid-air Dodge attempts. Failure-to-reach and reached-but-missed branches lead to the source-listed Slash or temporary suspension/Plunging options.',
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['Raw transition rules are preserved without inventing airborne timing, target-reach success, hit confirmation or rotation cadence.'],
  }),
  passive({
    factId: 'brant-liberation-to-the-horizon-healing',
    name: 'Resonance Liberation — To the Horizon healing',
    section: 'RESONANCE_LIBERATION',
    conditional: false,
    scope: 'TEAM',
    triggerSummary: 'Brant casts To the Horizon.',
    effectSummary: 'Heals all nearby Resonators before entering Aflame. Current Lv1-Lv10 source values are 500+1.75%, 560+1.96%, 625+2.18%, 700+2.45%, 790+2.76%, 875+3.06%, 890+3.11%, 910+3.18%, 925+3.23%, 950+3.32% using Energy Regen as the raw scaling attribute.',
    durationSeconds: null,
    maxStacks: null,
  }),
  passive({
    factId: 'brant-liberation-aflame-my-moment',
    name: 'Resonance Liberation — Aflame / "My" Moment',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Brant casts To the Horizon and enters Aflame for 12s.',
    effectSummary: 'During Aflame, Bravo gain efficiency from Normal Attack or Anchors Aweigh! hits is increased by 100%, and Theatrical Moment is replaced by "My" Moment. For each 1% Energy Regen over 150%, "My" Moment grants 20 ATK up to 2600.',
    durationSeconds: 12,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['Aflame is ended after Returned from Ashes finishes when that action is cast during Aflame. Runtime state timing remains a combat-model concern.'],
  }),
  passive({
    factId: 'brant-forte-theatrical-moment',
    name: 'Forte Circuit — Theatrical Moment',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Brant has Energy Regen above 150% outside the Aflame replacement state.',
    effectSummary: 'For each 1% Energy Regen over 150%, Brant gains 12 ATK, up to 1560. During Aflame this rule is replaced by the separately recorded "My" Moment rule.',
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'brant-forte-waves-of-acclaims',
    name: 'Forte Circuit — Waves of Acclaims healing',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'TEAM',
    triggerSummary: 'Bravo reaches 25, 50, 75 or 100.',
    effectSummary: 'Heals all nearby Resonators at each listed Bravo threshold. Current Lv1-Lv10 source values are 312+1.09%, 350+1.22%, 390+1.36%, 437+1.53%, 493+1.72%, 546+1.91%, 556+1.94%, 568+1.99%, 578+2.02%, 593+2.07% using Energy Regen as the raw scaling attribute.',
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ["Voyager's Blaze increases this healing by 20%; trigger crossings and re-trigger behavior require executable resource state rather than assumed uptime."],
  }),
  passive({
    factId: 'brant-forte-returned-from-ashes-shield',
    name: 'Forte Circuit — Returned from Ashes shield',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'TEAM',
    triggerSummary: 'Brant casts Returned from Ashes at full Bravo.',
    effectSummary: 'Generates a 30s shield for nearby Resonators. Current Lv1-Lv10 source values are 2500+9.00%, 2800+10.08%, 3125+11.25%, 3500+12.60%, 3950+14.22%, 4375+15.75%, 4450+16.02%, 4550+16.38%, 4625+16.65%, 4750+17.10% using Energy Regen as the raw scaling attribute. The source explicitly says the shield cannot be transferred when the on-field Resonator switches off.',
    durationSeconds: 30,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'brant-intro-interlude-applause',
    name: 'Intro Skill — Interlude Applause',
    section: 'INTRO_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Brant casts Intro Skill Applaud for Me!.',
    effectSummary: 'The next Mid-air Attack begins at Stage 2. The effect ends if Brant lands early or is switched out.',
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'brant-inherent-voyagers-blaze',
    name: "Inherent Skill — Voyager's Blaze",
    section: 'INHERENT_SKILL',
    conditional: false,
    scope: 'SELF',
    triggerSummary: 'Waves of Acclaims provides healing.',
    effectSummary: 'Healing provided by Waves of Acclaims is increased by 20%.',
    durationSeconds: null,
    maxStacks: null,
  }),
  passive({
    factId: 'brant-inherent-trial-by-fire-and-tide',
    name: 'Inherent Skill — Trial by Fire and Tide',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Brant is performing Mid-air Attacks.',
    effectSummary: 'Increases interruption resistance during Mid-air Attacks and grants 15% Fusion DMG Bonus.',
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'brant-outro-the-course-is-set',
    name: 'Outro Skill — The Course is Set!',
    section: 'OUTRO_SKILL',
    conditional: true,
    scope: 'NEXT_CHARACTER',
    triggerSummary: 'Brant casts Outro Skill and the incoming Resonator takes the field.',
    effectSummary: "Amplifies the incoming Resonator's Fusion DMG by 20% and Resonance Skill DMG by 25% for 14s or until that Resonator is switched out.",
    durationSeconds: 14,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
] as const;

export const BRANT_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({
    factId: 'brant-s1-by-currents-and-winds',
    name: 'S1 — By Currents and Winds',
    section: 'RESONANCE_CHAIN',
    sequence: 1,
    conditional: true,
    triggerSummary: 'Returned from Ashes is cast, or Brant casts Applaud for Me!/performs a Mid-air flip.',
    effectSummary: 'Returned from Ashes temporarily stagnates nearby targets while casting; switching Brant off removes that stagnation. After Applaud for Me! or each Mid-air flip, Brant gains 20% increased DMG dealt for 5s, stacking up to 3 times.',
  }),
  sequence({
    factId: 'brant-s2-for-smiles-and-cheers',
    name: 'S2 — For Smiles and Cheers',
    section: 'RESONANCE_CHAIN',
    sequence: 2,
    conditional: true,
    triggerSummary: 'Brant casts Mid-air Attack/Returned from Ashes, and the enhanced Outro window is active.',
    effectSummary: 'Casting Mid-air Attack and Returned from Ashes increases Brant CRIT Rate by 30%. Within 20s after The Course is Set!, a qualifying incoming/nearby Resonator Resonance Skill hit makes Brant deal 440% ATK Fusion DMG considered Basic Attack DMG; at most once per second and 2 explosions total. Current raw-source/current multi-source consensus says this effect remains active when Brant is switched off field.',
    notes: ['Current Wutheringlab instead says the enhanced Outro effect ends early if Brant leaves the team. Bellibing preserves that conflict in provenance and does not replace the raw-data/WutheringDB/Wuthering.gg/Prydwen consensus.'],
  }),
  sequence({
    factId: 'brant-s3-through-storms-i-sail',
    name: 'S3 — Through Storms I Sail',
    section: 'RESONANCE_CHAIN',
    sequence: 3,
    conditional: true,
    triggerSummary: 'Returned from Ashes deals damage.',
    effectSummary: 'Increases the DMG Multiplier of Returned from Ashes by 42%.',
  }),
  sequence({
    factId: 'brant-s4-to-freedom-i-sing',
    name: 'S4 — To Freedom I Sing',
    section: 'RESONANCE_CHAIN',
    sequence: 4,
    conditional: true,
    triggerSummary: 'Brant obtains/casts Returned from Ashes.',
    effectSummary: 'Increases the Returned from Ashes shield by 20%. Casting Returned from Ashes restores HP for all nearby Resonators at 6.60 HP for every 1% Energy Regen.',
  }),
  sequence({
    factId: 'brant-s5-all-the-worlds-an-actors-stage',
    name: "S5 — All the World's an Actor's Stage",
    section: 'RESONANCE_CHAIN',
    sequence: 5,
    conditional: true,
    triggerSummary: 'Brant deals Basic Attack DMG.',
    effectSummary: 'Grants Brant 15% Basic Attack DMG Bonus for 10s.',
  }),
  sequence({
    factId: 'brant-s6-all-the-worlds-a-captains-carnevale',
    name: "S6 — All the World's a Captain's Carnevale",
    section: 'RESONANCE_CHAIN',
    sequence: 6,
    conditional: true,
    triggerSummary: 'Brant performs Mid-air Attack or casts Returned from Ashes.',
    effectSummary: 'Increases Mid-air Attack DMG Multiplier by 30%. Returned from Ashes causes a secondary blast equal to 30% of the damage dealt by Returned from Ashes, considered Basic Attack DMG.',
  }),
] as const;

export const BRANT_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...BRANT_ACTION_FACTS,
  ...BRANT_RESOURCE_FACTS,
  ...BRANT_PASSIVE_FACTS,
  ...BRANT_SEQUENCE_FACTS,
] as const;
