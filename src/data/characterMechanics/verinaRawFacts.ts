import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/verina';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/verina';
const WUTHERING_WIKI = 'https://wuthering.wiki/character_1503.html';

export const VERINA_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Wuthering.gg — current Verina kit and multiplier tables',
    'Prydwen — current Verina kit and Resonance Chain',
    'Wuthering.wiki — raw damage-data mirror for scaling/type/coordinated cross-check',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN, WUTHERING_WIKI],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #68 candidate/review artifacts supply exact Lv1-Lv10 transcription structures and exact flat+percent utility formulas; current Wuthering.gg, Prydwen and raw damage-data evidence were used for semantic verification.',
    'Current raw damage data identifies Verina damage and healing coefficients as ATK-scaling. Photosynthesis Mark damage is explicitly Coordinated while its damage-data Type remains Liberation; Bellibing preserves both semantics instead of inventing a new bonus bucket.',
    'Heavy Attack: Starflower Blooms is explicitly Heavy Attack DMG; its Mid-air Starflower branch is explicitly Basic Attack DMG. Both consume Photosynthesis Energy and heal the nearby team.',
    'Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.',
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: 'verina', kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: VERINA_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: 'verina', kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: VERINA_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: 'verina', kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: VERINA_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: 'verina', kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: VERINA_PROVENANCE };
}

export const VERINA_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'verina-basic-cultivation-1', name: 'Basic Attack — Cultivation Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1904, .2061, .2217, .2435, .2591, .2771, .3021, .327, .352, .3786], hitCount: 1, conditional: false }),
  action({ factId: 'verina-basic-cultivation-2', name: 'Basic Attack — Cultivation Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.2573, .2784, .2995, .3291, .3502, .3744, .4082, .4419, .4757, .5116], hitCount: 1, conditional: false }),
  action({ factId: 'verina-basic-cultivation-3', name: 'Basic Attack — Cultivation Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1287, .1392, .1498, .1646, .1751, .1872, .2041, .221, .2379, .2558], hitCount: 2, conditional: false }),
  action({ factId: 'verina-basic-cultivation-4', name: 'Basic Attack — Cultivation Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3386, .3664, .3942, .433, .4608, .4927, .5372, .5816, .626, .6732], hitCount: 1, conditional: false }),
  action({ factId: 'verina-basic-cultivation-5', name: 'Basic Attack — Cultivation Stage 5', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3603, .3898, .4193, .4607, .4902, .5242, .5714, .6187, .666, .7162], hitCount: 1, conditional: false }),
  action({ factId: 'verina-heavy-cultivation', name: 'Heavy Attack — Cultivation', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.5, .541, .582, .6394, .6804, .7276, .7932, .8588, .9244, .9941], hitCount: 1, conditional: false }),
  action({ factId: 'verina-mid-air-cultivation-1', name: 'Mid-air Attack — Cultivation Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.2835, .3068, .33, .3626, .3858, .4126, .4498, .487, .5242, .5637], hitCount: 1, conditional: false }),
  action({ factId: 'verina-mid-air-cultivation-2', name: 'Mid-air Attack — Cultivation Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.2675, .2895, .3114, .3421, .3641, .3893, .4244, .4595, .4946, .5319], hitCount: 1, conditional: false }),
  action({ factId: 'verina-mid-air-cultivation-3', name: 'Mid-air Attack — Cultivation Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1279, .1384, .1488, .1635, .174, .1861, .2028, .2196, .2364, .2542], hitCount: 3, conditional: false }),
  action({ factId: 'verina-mid-air-heavy-cultivation', name: 'Mid-air Heavy Attack — Cultivation', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.31, .3355, .3609, .3965, .4219, .4511, .4918, .5325, .5731, .6164], hitCount: 1, conditional: false }),
  action({ factId: 'verina-dodge-counter-cultivation', name: 'Dodge Counter — Cultivation', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.65, .7033, .7566, .8313, .8846, .9459, 1.0311, 1.1164, 1.2017, 1.2923], hitCount: 1, conditional: true }),
  action({ factId: 'verina-skill-botany-experiment', name: 'Resonance Skill — Botany Experiment', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.18, .1948, .2096, .2302, .245, .262, .2856, .3092, .3328, .3579], hitCount: 3 }, { curve: [.36, .3896, .4191, .4604, .4899, .5239, .5711, .6183, .6656, .7158], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: 'verina-liberation-arboreal-flourish', name: 'Resonance Liberation — Arboreal Flourish', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1, 1.082, 1.164, 1.2788, 1.3608, 1.4551, 1.5863, 1.7175, 1.8487, 1.9881], hitCount: 1, conditional: false, notes: ['The cast also heals nearby teams and applies Photosynthesis Mark; those utility/trigger semantics are stored separately.'] }),
  action({ factId: 'verina-liberation-photosynthesis-mark-coordinated', name: 'Resonance Liberation — Photosynthesis Mark coordinated attack', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.05, .0541, .0582, .064, .0681, .0728, .0794, .0859, .0925, .0995], hitCount: 1, conditional: true, notes: ['Current raw damage data marks this hit Coordinated and Type=LIBERATION; damageClass stores the source damage-bonus type while coordinated triggering is kept explicit in notes/passive semantics.'] }),
  action({ factId: 'verina-intro-verdant-growth', name: 'Intro Skill — Verdant Growth', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.5, .541, .582, .6394, .6804, .7276, .7932, .8588, .9244, .9941], hitCount: 1, conditional: false }),
  action({ factId: 'verina-forte-starflower-heavy', name: 'Forte Circuit — Heavy Attack: Starflower Blooms', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.3267, .3535, .3803, .4178, .4446, .4754, .5182, .5611, .604, .6495], hitCount: 1 }, { curve: [.49, .5302, .5704, .6267, .6668, .713, .7773, .8416, .9059, .9742], hitCount: 1 }], hitCount: null, conditional: true, notes: ['Requires and consumes 1 Photosynthesis Energy. Source explicitly considers this Heavy Attack DMG.'] }),
  action({ factId: 'verina-forte-starflower-mid-air-1', name: 'Forte Circuit — Mid-air Attack: Starflower Blooms Stage 1', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3402, .3681, .396, .4351, .463, .4951, .5397, .5843, .629, .6764], hitCount: 1, conditional: true, notes: ['Requires and consumes 1 Photosynthesis Energy. Source explicitly considers this Basic Attack DMG.'] }),
  action({ factId: 'verina-forte-starflower-mid-air-2', name: 'Forte Circuit — Mid-air Attack: Starflower Blooms Stage 2', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.321, .3474, .3737, .4105, .4369, .4671, .5093, .5514, .5935, .6382], hitCount: 1, conditional: true, notes: ['Requires and consumes 1 Photosynthesis Energy. Source explicitly considers this Basic Attack DMG.'] }),
  action({ factId: 'verina-forte-starflower-mid-air-3', name: 'Forte Circuit — Mid-air Attack: Starflower Blooms Stage 3', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1534, .166, .1786, .1962, .2088, .2233, .2434, .2635, .2836, .305], hitCount: 3, conditional: true, notes: ['Requires and consumes 1 Photosynthesis Energy. Source explicitly considers this Basic Attack DMG.'] }),
] as const;

export const VERINA_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: 'verina-resource-photosynthesis-energy', name: 'Photosynthesis Energy', section: 'FORTE_CIRCUIT', conditional: false, resourceName: 'Photosynthesis Energy', maxValue: 4, ruleSummary: 'Verina can hold up to 4 Photosynthesis Energy. Basic Attack Stage 5 on hit grants 1; casting Botany Experiment grants 1; casting Intro Skill Verdant Growth grants 1. Heavy Attack or Mid-air Attack Starflower Blooms consumes 1 stack.' }),
] as const;

export const VERINA_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: 'verina-liberation-arboreal-flourish-utility', name: 'Resonance Liberation — Arboreal Flourish healing and Photosynthesis Mark', section: 'RESONANCE_LIBERATION', conditional: false, scope: 'TEAM', triggerSummary: 'Verina casts Arboreal Flourish and hits a target.', effectSummary: 'The cast heals all nearby team characters and applies Photosynthesis Mark for 12s. Current Lv1-Lv10 Arboreal Flourish healing values are 500+11.33%, 600+13.03%, 700+14.17%, 800+15.87%, 825+17%, 890+18.13%, 900+19.27%, 915+20.4%, 930+21.53%, 950+23.8%. When a nearby team character attacks a marked target, Verina performs a Coordinated Attack and heals the active character, triggerable once per second. Current Coordinated Attack healing values are 225+5.1%, 270+5.87%, 315+6.38%, 360+7.14%, 372+7.65%, 401+8.16%, 405+8.67%, 412+9.18%, 419+9.69%, 428+10.71%. The skill has 25s cooldown, costs 175 Resonance Energy and restores 20 Concerto Energy.', durationSeconds: 12, maxStacks: 1, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'verina-forte-starflower-healing', name: 'Forte Circuit — Starflower Blooms healing', section: 'FORTE_CIRCUIT', conditional: true, scope: 'TEAM', triggerSummary: 'Verina casts Heavy Attack or Mid-air Attack Starflower Blooms while carrying Photosynthesis Energy.', effectSummary: 'Consumes 1 Photosynthesis Energy, restores 12 Concerto Energy and heals all nearby team characters. Current Lv1-Lv10 ATK-scaling Starflower Blooms healing values are 625+14.17%, 750+16.29%, 875+17.71%, 1000+19.83%, 1032+21.25%, 1113+22.67%, 1125+24.08%, 1144+25.5%, 1163+26.92%, 1188+29.75%.', durationSeconds: null, maxStacks: null, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'verina-inherent-grace-of-life', name: 'Inherent Skill — Grace of Life', section: 'INHERENT_SKILL', conditional: true, scope: 'TEAM', triggerSummary: 'A team member would take fatal damage.', effectSummary: "Verina protects that team member from fatal damage and grants a shield equal to 120% of Verina's ATK for 10s. This can trigger once every 10 minutes.", durationSeconds: 10, maxStacks: 1, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'verina-inherent-gift-of-nature', name: 'Inherent Skill — Gift of Nature', section: 'INHERENT_SKILL', conditional: true, scope: 'TEAM', triggerSummary: 'Verina casts Heavy Attack Starflower Blooms, Mid-air Attack Starflower Blooms, Arboreal Flourish or Outro Skill Blossom.', effectSummary: "All team members' ATK is increased by 20% for 20s.", durationSeconds: 20, maxStacks: 1, modelingStatus: 'MODEL_READY' }),
  passive({ factId: 'verina-outro-blossom', name: 'Outro Skill — Blossom', section: 'OUTRO_SKILL', conditional: true, scope: 'TEAM', triggerSummary: 'Verina casts Outro Skill and the incoming Resonator takes the field.', effectSummary: "The incoming Resonator is healed by 19% of Verina's ATK per second for 6s. All nearby-team Resonators have DMG Amplified by 15% for 30s.", durationSeconds: 30, maxStacks: 1, modelingStatus: 'PENDING_INTERPRETATION', notes: ['The heal and team amplification have different source durations (6s and 30s); durationSeconds stores the longer umbrella effect window and the exact split remains explicit in effectSummary.'] }),
] as const;

export const VERINA_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'verina-s1-moment-of-emergence', name: 'S1 — Moment of Emergence', section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: 'Verina casts Outro Skill Blossom.', effectSummary: "The next character gains continuous healing equal to 20% of Verina's ATK every 5s for 30s." }),
  sequence({ factId: 'verina-s2-sprouting-reflections', name: 'S2 — Sprouting Reflections', section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: 'Verina casts Resonance Skill Botany Experiment.', effectSummary: 'Botany Experiment additionally grants 1 Photosynthesis Energy and 10 Concerto Energy.' }),
  sequence({ factId: 'verina-s3-the-choice-to-flourish', name: 'S3 — The Choice to Flourish', section: 'RESONANCE_CHAIN', sequence: 3, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'Healing from Resonance Liberation Photosynthesis Mark is increased by 12%.' }),
  sequence({ factId: 'verina-s4-blossoming-embrace', name: 'S4 — Blossoming Embrace', section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: 'Verina casts Heavy Attack Starflower Blooms, Mid-air Attack Starflower Blooms, Arboreal Flourish or Blossom.', effectSummary: 'All team members gain 15% Spectro DMG Bonus for 24s.' }),
  sequence({ factId: 'verina-s5-miraculous-blooms', name: 'S5 — Miraculous Blooms', section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: 'Verina heals a team member below 50% HP.', effectSummary: "Verina's Healing is increased by 20% for that healing condition." }),
  sequence({ factId: 'verina-s6-joyous-harvest', name: 'S6 — Joyous Harvest', section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: 'Verina casts Heavy Attack or Mid-air Attack Starflower Blooms.', effectSummary: 'Starflower Blooms deals 20% more DMG, triggers one Coordinated Attack, and heals all nearby characters. The Coordinated Attack damage and healing equal the corresponding Resonance Liberation Photosynthesis Mark values.' }),
] as const;

export const VERINA_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...VERINA_ACTION_FACTS,
  ...VERINA_RESOURCE_FACTS,
  ...VERINA_PASSIVE_FACTS,
  ...VERINA_SEQUENCE_FACTS,
] as const;
