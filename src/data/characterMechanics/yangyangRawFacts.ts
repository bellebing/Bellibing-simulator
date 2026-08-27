import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/yangyang';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/yangyang';

export const YANGYANG_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Wuthering.gg — current Yangyang kit and multiplier tables',
    'Prydwen — current Yangyang kit and Resonance Chain',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #68 review artifact supplies exact Lv1-Lv10 coefficient structures; current Wuthering.gg and Prydwen cross-check action identity, Melody rules, Inherents, Outro and S1-S6 semantics.',
    'Feather Release is explicitly considered Basic Attack DMG. Stormy Strike is explicitly a Heavy Attack. Bellibing keeps those source classifications instead of inferring a damage bucket from the Forte section.',
    'The current source text requires 3 Melodies for Stormy Strike and Feather Release, and explicitly says Feather Release consumes all Melodies. It does not state that Stormy Strike consumes them, so no such consumption rule is invented.',
  ],
} as const;

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return {
    ...input,
    characterId: 'yangyang',
    kind: 'ACTION',
    actionRole: 'DAMAGE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODEL_READY',
    motionValue: null,
    provenance: YANGYANG_PROVENANCE,
  };
}

function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return {
    ...rest,
    characterId: 'yangyang',
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    provenance: YANGYANG_PROVENANCE,
  };
}

function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return {
    ...input,
    characterId: 'yangyang',
    kind: 'RESOURCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: YANGYANG_PROVENANCE,
  };
}

function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return {
    ...input,
    characterId: 'yangyang',
    kind: 'SEQUENCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: YANGYANG_PROVENANCE,
  };
}

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation; no skill level is implicitly selected by raw data.';

export const YANGYANG_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'yangyang-basic-feather-as-blade-1', name: 'Basic Attack — Feather as Blade Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.225, .2434, .2618, .2877, .3061, .3273, .3569, .3864, .4159, .4473], hitCount: 1, conditional: false }),
  action({ factId: 'yangyang-basic-feather-as-blade-2', name: 'Basic Attack — Feather as Blade Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3, .3246, .3492, .3836, .4082, .4365, .4758, .5152, .5546, .5964], hitCount: 1, conditional: false }),
  action({ factId: 'yangyang-basic-feather-as-blade-3', name: 'Basic Attack — Feather as Blade Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.2355, .2548, .2741, .3011, .3204, .3426, .3735, .4044, .4353, .4681], hitCount: 2, conditional: false }),
  action({ factId: 'yangyang-basic-feather-as-blade-4', name: 'Basic Attack — Feather as Blade Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ hitCount: 2, curve: [.2986, .3231, .3476, .3819, .4064, .4345, .4737, .5129, .552, .5936] }, { hitCount: 1, curve: [.3981, .4307, .4633, .509, .5417, .5792, .6315, .6837, .7359, .7914] }], hitCount: null, conditional: false }),
  action({ factId: 'yangyang-heavy-feather-as-blade', name: 'Heavy Attack — Feather as Blade', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1, .1082, .1164, .1278, .136, .1455, .1586, .1717, .1848, .1988], hitCount: 3, conditional: false }),
  action({ factId: 'yangyang-mid-air-feather-as-blade', name: 'Mid-air Attack — Feather as Blade', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.465, .5031, .5412, .5946, .6327, .6766, .7376, .7986, .8596, .9244], hitCount: 1, conditional: false }),
  action({ factId: 'yangyang-heavy-zephyr-song', name: 'Heavy Attack — Zephyr Song', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.5362, .5802, .6241, .6857, .7297, .7802, .8506, .921, .9913, 1.0661], hitCount: 1, conditional: true, notes: ['Zephyr Song is available after Heavy Attack or Dodge Counter and is explicitly a Heavy Attack.'] }),
  action({ factId: 'yangyang-dodge-counter-feather-as-blade', name: 'Dodge Counter — Feather as Blade', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.438, .4739, .5098, .5601, .596, .6373, .6947, .7522, .8097, .8707], hitCount: 2, conditional: true }),
  action({ factId: 'yangyang-skill-zephyr-domain', name: 'Resonance Skill — Zephyr Domain', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ hitCount: 4, curve: [.1737, .1879, .2021, .2221, .2363, .2527, .2755, .2983, .3211, .3453] }, { hitCount: 1, curve: [1.0422, 1.1276, 1.2131, 1.3327, 1.4182, 1.5165, 1.6532, 1.7899, 1.9267, 2.0719] }], hitCount: null, conditional: false, notes: ['The pull effect remains utility semantics; only the listed damage components are represented here.'] }),
  action({ factId: 'yangyang-liberation-wind-spirals', name: 'Resonance Liberation — Wind Spirals', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ hitCount: 12, curve: [.2343, .2535, .2727, .2996, .3188, .3409, .3717, .4024, .4332, .4658] }, { hitCount: 1, curve: [1.8746, 2.0283, 2.1821, 2.3973, 2.551, 2.7278, 2.9737, 3.2197, 3.4656, 3.727] }], hitCount: null, conditional: false, notes: ['The cyclone pull remains utility semantics; listed damage components stay independent.'] }),
  action({ factId: 'yangyang-intro-cerulean-song', name: 'Intro Skill — Cerulean Song', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.4, .4328, .4656, .5115, .5443, .582, .6345, .687, .7394, .7952], hitCount: 2, conditional: false }),
  action({ factId: 'yangyang-forte-stormy-strike', name: 'Forte Circuit — Stormy Strike', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1912, .2069, .2226, .2445, .2602, .2782, .3033, .3284, .3535, .3802], hitCount: 2, conditional: true, notes: ['Stormy Strike requires 3 Melodies and is explicitly a Heavy Attack.'] }),
  action({ factId: 'yangyang-forte-feather-release', name: 'Forte Circuit — Feather Release', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ hitCount: 5, curve: [.1093, .1183, .1272, .1398, .1488, .1591, .1734, .1878, .2021, .2173] }, { hitCount: 2, curve: [.6378, .6901, .7424, .8157, .868, .9281, 1.0118, 1.0955, 1.1792, 1.2681] }], hitCount: null, conditional: true, notes: ['Feather Release requires 3 Melodies, consumes all Melodies and is explicitly considered Basic Attack DMG.'] }),
] as const;

export const YANGYANG_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'yangyang-resource-melodies',
    name: 'Melodies',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Melodies',
    maxValue: 3,
    ruleSummary: 'Yangyang can hold up to 3 Melodies. She gains 1 from Basic Attack Stage 4 on hit, Zephyr Song on hit, Zephyr Domain on hit and casting Cerulean Song. With 3 Melodies she can cast Stormy Strike after Heavy Attack or Dodge Counter, and she can cast Feather Release in mid-air; Feather Release explicitly consumes all Melodies.',
  }),
] as const;

export const YANGYANG_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: 'yangyang-inherent-compassion', name: 'Inherent Skill — Compassion', section: 'INHERENT_SKILL', conditional: true, scope: 'SELF', triggerSummary: 'Yangyang casts Mid-air Attack Feather Release.', effectSummary: 'Yangyang recovers 30 Stamina.', durationSeconds: null, maxStacks: 1 }),
  passive({ factId: 'yangyang-inherent-lazuline-mercy', name: 'Inherent Skill — Lazuline Mercy', section: 'INHERENT_SKILL', conditional: true, scope: 'SELF', triggerSummary: 'Yangyang casts Intro Skill Cerulean Song.', effectSummary: 'Yangyang gains 8% Aero DMG Bonus for 8 seconds.', durationSeconds: 8, maxStacks: 1 }),
  passive({ factId: 'yangyang-outro-whispering-breeze', name: 'Outro Skill — Whispering Breeze', section: 'OUTRO_SKILL', conditional: true, scope: 'NEXT_CHARACTER', triggerSummary: 'Yangyang casts Outro Skill and the incoming Resonator takes the field.', effectSummary: 'The incoming Resonator restores 4 Resonance Energy per second for 5 seconds.', durationSeconds: 5, maxStacks: 1, modelingStatus: 'MODEL_READY' }),
] as const;

export const YANGYANG_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'yangyang-s1-sapphire-skies', name: 'S1 — Sapphire Skies, Soaring Sparrows', section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: 'Yangyang casts Intro Skill Cerulean Song.', effectSummary: 'Cerulean Song additionally increases Yangyang Aero DMG Bonus by 15% for 8 seconds.' }),
  sequence({ factId: 'yangyang-s2-nesting-twigs', name: 'S2 — Nesting Twigs, in Beaks They Harrow', section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: 'Heavy Attack hits a target; can trigger once every 20 seconds.', effectSummary: 'Yangyang recovers an additional 10 Resonance Energy.' }),
  sequence({ factId: 'yangyang-s3-nature-sings', name: 'S3 — Nature Sings in Symphony', section: 'RESONANCE_CHAIN', sequence: 3, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'Resonance Skill DMG Bonus is increased by 40%; the Wind Field pull is enhanced and its pulling range is expanded by 33%.' }),
  sequence({ factId: 'yangyang-s4-close-your-eyes', name: 'S4 — Close Your Eyes and Listen in', section: 'RESONANCE_CHAIN', sequence: 4, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'Mid-air Attack Feather Release damage is increased by 95%.' }),
  sequence({ factId: 'yangyang-s5-winds-whisper', name: 'S5 — Winds Whisper in Harmony', section: 'RESONANCE_CHAIN', sequence: 5, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'Resonance Liberation Wind Spirals damage is increased by 85%.' }),
  sequence({ factId: 'yangyang-s6-tribute-to-life', name: "S6 — A Tribute to Life's Sweet Hymn", section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: 'Yangyang casts Mid-air Attack Feather Release.', effectSummary: 'ATK of all team members is increased by 20% for 20 seconds.' }),
] as const;

export const YANGYANG_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...YANGYANG_ACTION_FACTS,
  ...YANGYANG_RESOURCE_FACTS,
  ...YANGYANG_PASSIVE_FACTS,
  ...YANGYANG_SEQUENCE_FACTS,
] as const;
