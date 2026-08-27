import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/chixia';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/chixia';
const WUTHERINGLAB = 'https://wutheringlab.com/character/chixia-build/';

export const CHIXIA_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Wuthering.gg — current Chixia kit and multiplier tables',
    'Prydwen — current Chixia kit and Resonance Chain',
    'Wutheringlab — current Chixia page retained as discrepancy evidence',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN, WUTHERINGLAB],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #68 review artifact supplies the exact Lv1-Lv10 coefficient structures; current Wuthering.gg and Prydwen cross-check action identity, Forte rules, Inherents, Outro and S1-S6 semantics.',
    'Current Wutheringlab displays stale/conflicting Heroic Bullets Lv1 values (14.67% Thermobaric Bullet / 200% Bombard) while the pinned source and current Wuthering.gg expose 10.00% / 220.00%. Bellibing retains the pinned/current Wuthering.gg values and records the conflict instead of averaging or guessing.',
    'External profile headers disagree on Chixia Max Resonance Energy in some current sources. Static Character core data is outside this mechanics promotion and is not changed or inferred here.',
    'Leaping Flames is a source-fixed 530% ATK Outro coefficient declared in kit text, not a skill-level table; it therefore uses the explicit source-fixed representation added in PR #68.',
  ],
} as const;

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return {
    ...input,
    characterId: 'chixia',
    kind: 'ACTION',
    actionRole: 'DAMAGE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODEL_READY',
    motionValue: null,
    provenance: CHIXIA_PROVENANCE,
  };
}

function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return {
    ...rest,
    characterId: 'chixia',
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    provenance: CHIXIA_PROVENANCE,
  };
}

function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return {
    ...input,
    characterId: 'chixia',
    kind: 'RESOURCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: CHIXIA_PROVENANCE,
  };
}

function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return {
    ...input,
    characterId: 'chixia',
    kind: 'SEQUENCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: CHIXIA_PROVENANCE,
  };
}

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation; no skill level is implicitly selected by raw data.';

export const CHIXIA_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'chixia-basic-pow-pow-1', name: 'Basic Attack — POW POW Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.333, .3604, .3877, .4259, .4532, .4846, .5283, .572, .6157, .6621], hitCount: 1, conditional: false }),
  action({ factId: 'chixia-basic-pow-pow-2', name: 'Basic Attack — POW POW Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.243, .263, .2829, .3108, .3307, .3536, .3855, .4174, .4493, .4832], hitCount: 2, conditional: false }),
  action({ factId: 'chixia-basic-pow-pow-3', name: 'Basic Attack — POW POW Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1688, .1826, .1965, .2158, .2297, .2456, .2677, .2899, .312, .3355], hitCount: 4, conditional: false }),
  action({ factId: 'chixia-basic-pow-pow-4', name: 'Basic Attack — POW POW Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.17, 1.266, 1.3619, 1.4962, 1.5922, 1.7025, 1.856, 2.0095, 2.163, 2.3261], hitCount: 1, conditional: false }),
  action({ factId: 'chixia-heavy-aimed-shot', name: 'Heavy Attack — Aimed Shot', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.18, .1948, .2096, .2302, .245, .262, .2856, .3092, .3328, .3579], hitCount: 1, conditional: false }),
  action({ factId: 'chixia-heavy-full-charge', name: 'Heavy Attack — Full Charge', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.405, .4383, .4715, .518, .5512, .5894, .6425, .6956, .7488, .8052], hitCount: 1, conditional: false }),
  action({ factId: 'chixia-mid-air-pow-pow', name: 'Mid-air Attack — POW POW', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.162, .1753, .1886, .2072, .2205, .2358, .257, .2783, .2995, .3221], hitCount: 1, conditional: false }),
  action({ factId: 'chixia-dodge-counter-pow-pow', name: 'Dodge Counter — POW POW', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.71, 1.8503, 1.9905, 2.1868, 2.327, 2.4883, 2.7126, 2.937, 3.1613, 3.3997], hitCount: 1, conditional: true }),
  action({ factId: 'chixia-skill-whizzing-fight-spirit', name: 'Resonance Skill — Whizzing Fight Spirit', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.16, .1732, .1863, .2047, .2178, .2329, .2539, .2748, .2958, .3181], hitCount: 8, conditional: false, notes: ['Source lists eight shots; the coefficient remains per listed shot and hitCount preserves *8.'] }),
  action({ factId: 'chixia-liberation-blazing-flames', name: 'Resonance Liberation — Blazing Flames', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ hitCount: 1, curve: [4.8, 5.1936, 5.5872, 6.1383, 6.5319, 6.9845, 7.6143, 8.244, 8.8738, 9.5429] }, { hitCount: 11, curve: [.291, .3148, .3387, .3721, .3959, .4234, .4615, .4997, .5379, .5784] }], hitCount: null, conditional: false, notes: ['Source expression is 480% + 29.1%*11 at Lv1; components remain independent.'] }),
  action({ factId: 'chixia-intro-grand-entrance', name: 'Intro Skill — Grand Entrance', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ hitCount: 2, curve: [.2475, .2678, .2881, .3166, .3368, .3602, .3927, .4251, .4576, .4921] }, { hitCount: 4, curve: [.1238, .1339, .1441, .1583, .1684, .1801, .1964, .2126, .2288, .2461] }], hitCount: null, conditional: false, notes: ['Source expression uses two independently listed components with explicit *2 and *4 hit counts.'] }),
  action({ factId: 'chixia-forte-thermobaric-bullet', name: 'Forte Circuit — DAKA DAKA! Thermobaric Bullet', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1, .1082, .1164, .1279, .1361, .1456, .1587, .1718, .1849, .1989], hitCount: 1, conditional: true, notes: ['DAKA DAKA! damage is explicitly considered Resonance Skill DMG.'] }),
  action({ factId: 'chixia-forte-boom-boom', name: 'Forte Circuit — Boom Boom', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [2.2, 2.3804, 2.5608, 2.8134, 2.9938, 3.2013, 3.4899, 3.7785, 4.0672, 4.3739], hitCount: 1, conditional: true, notes: ['Boom Boom is explicitly considered Resonance Skill DMG and requires the DAKA DAKA!/bullet condition.'] }),
  action({
    factId: 'chixia-outro-leaping-flames',
    name: 'Outro Skill — Leaping Flames',
    section: 'OUTRO_SKILL',
    actionKind: 'OUTRO',
    damageClass: 'OUTRO',
    scalingStat: 'ATK',
    motionValueContext: 'Current source-fixed Outro coefficient declared directly in kit text; no Lv1-Lv10 table exists for this damage instance.',
    sourceFixedMotionValue: 5.3,
    hitCount: 1,
    conditional: true,
  }),
] as const;

export const CHIXIA_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'chixia-resource-thermobaric-bullets',
    name: 'Thermobaric Bullets',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Thermobaric Bullets',
    maxValue: null,
    ruleSummary: 'Current source text states that Chixia can hold up to 60 Thermobaric Bullets and that Inherent Skill Scorching Magazine increases Max Thermobaric Bullets by 10. Bullets are obtained from POW POW hits and upon casting Grand Entrance or Whizzing Fight Spirit. DAKA DAKA! continuously consumes them; after 30 bullets have been fired, Basic Attack can cast Boom Boom, and the state ends when all bullets are consumed.',
    notes: ['maxValue remains null because the source exposes a baseline cap plus an Inherent cap modifier rather than one unconditional cap value.'],
  }),
] as const;

export const CHIXIA_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'chixia-skill-whizzing-fight-spirit-charges',
    name: 'Whizzing Fight Spirit — initial charges',
    section: 'RESONANCE_SKILL',
    conditional: false,
    scope: 'SELF',
    triggerSummary: 'Resonance Skill Whizzing Fight Spirit charge state.',
    effectSummary: 'Whizzing Fight Spirit has 2 initial charges.',
    durationSeconds: null,
    maxStacks: 2,
  }),
  passive({
    factId: 'chixia-forte-daka-daka-state',
    name: 'Forte Circuit — DAKA DAKA! state rules',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Hold Resonance Skill Whizzing Fight Spirit.',
    effectSummary: 'Chixia enters DAKA DAKA!, continuously consumes Thermobaric Bullets and fires Resonance Skill DMG. Basic Attack exits through Basic Attack 4, or casts Boom Boom if 30 bullets have already been fired. The state also ends when all Thermobaric Bullets are consumed.',
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['Exact firing cadence, interruption and encounter hit success remain combat-state behavior rather than raw automatic uptime.'],
  }),
  passive({
    factId: 'chixia-inherent-scorching-magazine',
    name: 'Inherent Skill — Scorching Magazine',
    section: 'INHERENT_SKILL',
    conditional: false,
    scope: 'SELF',
    triggerSummary: 'Inherent Skill is unlocked.',
    effectSummary: 'Max Thermobaric Bullets is increased by 10 rounds and Resonance Skill Boom Boom DMG is increased by 50%.',
    durationSeconds: null,
    maxStacks: 1,
  }),
  passive({
    factId: 'chixia-inherent-numbingly-spicy',
    name: 'Inherent Skill — Numbingly Spicy!',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'A Thermobaric Bullet hits a target during DAKA DAKA!.',
    effectSummary: 'Each hit increases Chixia ATK by 1% for 10 seconds, stacking up to 30 times.',
    durationSeconds: 10,
    maxStacks: 30,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
] as const;

export const CHIXIA_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'chixia-s1-no1-hero-play-fan', name: 'S1 — No.1 Hero Play Fan', section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: 'Resonance Skill Boom Boom hits.', effectSummary: 'Boom Boom hits will always be Critical Hits.' }),
  sequence({ factId: 'chixia-s2-leaping-sparkles', name: 'S2 — Leaping Sparkles', section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: 'A target is defeated during Resonance Liberation Blazing Flames.', effectSummary: 'For every 1 target defeated, Chixia recovers 5 Resonance Energy, up to 20 each time.' }),
  sequence({ factId: 'chixia-s3-eternal-flames', name: 'S3 — Eternal Flames', section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: 'Blazing Flames hits a target below 50% HP.', effectSummary: 'Resonance Liberation Blazing Flames deals 40% more DMG to targets below 50% HP.' }),
  sequence({ factId: 'chixia-s4-heros-ultimate-move', name: "S4 — Hero's Ultimate Move", section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: 'Cast Resonance Liberation Blazing Flames.', effectSummary: 'Blazing Flames grants 60 Thermobaric Bullets and immediately resets the Cooldown of Whizzing Fight Spirit.' }),
  sequence({ factId: 'chixia-s5-triumphant-explosions', name: 'S5 — Triumphant Explosions', section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: 'Numbingly Spicy! reaches maximum stacks.', effectSummary: 'ATK is additionally increased by 30%.' }),
  sequence({ factId: 'chixia-s6-easter-egg-performance', name: 'S6 — Easter Egg Performance', section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: 'Resonance Skill Boom Boom is cast.', effectSummary: 'Boom Boom increases the Basic Attack DMG Bonus of all team members by 25% for 15 seconds.' }),
] as const;

export const CHIXIA_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...CHIXIA_ACTION_FACTS,
  ...CHIXIA_RESOURCE_FACTS,
  ...CHIXIA_PASSIVE_FACTS,
  ...CHIXIA_SEQUENCE_FACTS,
] as const;
