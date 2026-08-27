import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = "https://wuthering.gg/characters/encore";
const PRYDWEN = "https://www.prydwen.gg/wuthering-waves/characters/encore";
const WUTHERING_WIKI = "https://wuthering.wiki/character_1203.html";

export const ENCORE_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    "Wuthering.gg — current Encore kit and multiplier tables",
    "Prydwen — current Encore kit and Resonance Chain cross-check",
    "Wuthering.wiki — raw damage-data mirror for scaling/type cross-check",
  ],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN, WUTHERING_WIKI],
  checkedAt: CHECKED_AT,
  notes: [
    "The pinned PR #68 candidate/review artifacts supply exact Lv1-Lv10 transcription structures and the fixed Outro description coefficient; current Wuthering.gg, Prydwen and raw damage-data evidence were used for semantic verification.",
    "Current pinned raw data and current Wuthering.gg both call Encore’s Forte resource/state Mayhem. Prydwen currently displays the older/alternate Dissonance name while describing the same 100-gauge consume/state mechanics; Bellibing uses the current raw/Wuthering.gg Mayhem name and retains the naming discrepancy as provenance rather than treating it as a mechanic conflict.",
    "Cosmos Rave replacement Basic, Heavy, Skill and Dodge actions preserve their explicit Basic/Heavy/Skill damage buckets. Cloudy Frenzy and Cosmos Rupture are explicitly Resonance Liberation DMG even though they are Forte-triggered Heavy Attack branches.",
    "Thermal Field is source-fixed Outro damage declared directly in kit text (176.76% ATK every 1.5s for 6s), so it uses the sourceFixedMotionValue path instead of fabricating a ten-level curve.",
    "Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.",
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return {
    ...input,
    characterId: 'encore',
    kind: 'ACTION',
    actionRole: 'DAMAGE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODEL_READY',
    motionValue: null,
    provenance: ENCORE_PROVENANCE,
  };
}

function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return {
    ...rest,
    characterId: 'encore',
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    provenance: ENCORE_PROVENANCE,
  };
}

function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return {
    ...input,
    characterId: 'encore',
    kind: 'RESOURCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: ENCORE_PROVENANCE,
  };
}

function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return {
    ...input,
    characterId: 'encore',
    kind: 'SEQUENCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: ENCORE_PROVENANCE,
  };
}

export const ENCORE_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'encore-basic-wooly-attack-1', name: "Basic Attack — Wooly Attack Stage 1", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.28, .3029, .3259, .358, .381, .4074, .4441, .4809, .5176, .5566], hitCount: 1, conditional: false }),
  action({ factId: 'encore-basic-wooly-attack-2', name: "Basic Attack — Wooly Attack Stage 2", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.333, .3603, .3876, .4258, .4531, .4845, .5282, .5719, .6156, .662], hitCount: 1, conditional: false }),
  action({ factId: 'encore-basic-wooly-attack-3', name: "Basic Attack — Wooly Attack Stage 3", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3335, .3608, .3881, .4264, .4538, .4852, .529, .5727, .6165, .663], hitCount: 2, conditional: false }),
  action({ factId: 'encore-basic-wooly-attack-4', name: "Basic Attack — Wooly Attack Stage 4", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1925, .2082, .224, .2461, .2619, .2801, .3053, .3306, .3558, .3827], hitCount: 4, conditional: false }),
  action({ factId: 'encore-basic-wooly-strike', name: "Basic Attack — Wooly Strike", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.2, 1.2984, 1.3967, 1.5345, 1.6329, 1.7461, 1.9035, 2.061, 2.2184, 2.3857], hitCount: 1, conditional: true, notes: ["Available as the Normal Attack follow-up after Basic Attack Stage 4."] }),
  action({ factId: 'encore-heavy-wooly-attack', name: "Heavy Attack — Wooly Attack", section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.941, 1.0181, 1.0953, 1.2033, 1.2805, 1.3692, 1.4927, 1.6161, 1.7396, 1.8708], hitCount: 1, conditional: false }),
  action({ factId: 'encore-mid-air-wooly-attack', name: "Mid-air Attack — Wooly Attack", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.62, .6708, .7216, .7928, .8436, .9021, .9835, 1.0648, 1.1461, 1.2326], hitCount: 1, conditional: false }),
  action({ factId: 'encore-dodge-counter-wooly-attack', name: "Dodge Counter — Wooly Attack", section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.6334, .6854, .7373, .8101, .862, .9218, 1.0049, 1.088, 1.1711, 1.2594], hitCount: 2, conditional: true }),
  action({ factId: 'encore-skill-flaming-woolies', name: "Resonance Skill — Flaming Woolies", section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3853, .4169, .4485, .4928, .5244, .5607, .6113, .6618, .7124, .7661], hitCount: 8, conditional: false }),
  action({ factId: 'encore-skill-energetic-welcome', name: "Resonance Skill — Energetic Welcome", section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.706, 1.8458, 1.9857, 2.1816, 2.3215, 2.4824, 2.7062, 2.93, 3.1538, 3.3916], hitCount: 1, conditional: true, notes: ["Available as the Resonance Skill follow-up after Flaming Woolies."] }),
  action({ factId: 'encore-cosmos-frolicking-1', name: "Basic Attack — Cosmos: Frolicking Stage 1", section: 'RESONANCE_LIBERATION', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.4536, .4908, .528, .5801, .6173, .6601, .7196, .7791, .8386, .9018], hitCount: 2, conditional: true, notes: ["During Cosmos Rave, Basic Attack is replaced by Cosmos: Frolicking."] }),
  action({ factId: 'encore-cosmos-frolicking-2', name: "Basic Attack — Cosmos: Frolicking Stage 2", section: 'RESONANCE_LIBERATION', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.2837, .307, .3302, .3628, .3861, .4128, .45, .4872, .5245, .564], hitCount: 3, conditional: true, notes: ["During Cosmos Rave, Basic Attack is replaced by Cosmos: Frolicking."] }),
  action({ factId: 'encore-cosmos-frolicking-3', name: "Basic Attack — Cosmos: Frolicking Stage 3", section: 'RESONANCE_LIBERATION', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3319, .3592, .3864, .4245, .4517, .483, .5265, .5701, .6136, .6599], hitCount: 4, conditional: true, notes: ["During Cosmos Rave, Basic Attack is replaced by Cosmos: Frolicking."] }),
  action({ factId: 'encore-cosmos-frolicking-4', name: "Basic Attack — Cosmos: Frolicking Stage 4", section: 'RESONANCE_LIBERATION', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.9759, 1.0559, 1.1359, 1.2479, 1.3279, 1.42, 1.548, 1.676, 1.804, 1.9401], hitCount: 3, conditional: true, notes: ["During Cosmos Rave, Basic Attack is replaced by Cosmos: Frolicking."] }),
  action({ factId: 'encore-cosmos-heavy-attack', name: "Heavy Attack — Cosmos: Heavy Attack", section: 'RESONANCE_LIBERATION', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.0944, 1.1842, 1.2739, 1.3996, 1.4893, 1.5925, 1.7361, 1.8797, 2.0232, 2.1758], hitCount: 1, conditional: true, notes: ["During Cosmos Rave, Heavy Attack is replaced by Cosmos: Heavy Attack."] }),
  action({ factId: 'encore-cosmos-rampage', name: "Resonance Skill — Cosmos: Rampage", section: 'RESONANCE_LIBERATION', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3185, .3446, .3707, .4072, .4334, .4634, .5052, .547, .5888, .6332], hitCount: 4, conditional: true, notes: ["During Cosmos Rave, Flaming Woolies is replaced by Cosmos: Rampage."] }),
  action({ factId: 'encore-cosmos-dodge-counter', name: "Dodge Counter — Cosmos", section: 'RESONANCE_LIBERATION', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3319, .3592, .3864, .4245, .4517, .483, .5265, .5701, .6136, .6599], hitCount: 4, conditional: true, notes: ["During Cosmos Rave, this Dodge Counter is explicitly considered Basic Attack DMG."] }),
  action({ factId: 'encore-intro-woolies-helpers', name: "Intro Skill — Woolies Helpers", section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1, 1.082, 1.164, 1.2788, 1.3608, 1.4551, 1.5863, 1.7175, 1.8487, 1.9881], hitCount: 1, conditional: false }),
  action({ factId: 'encore-forte-cloudy-frenzy', name: "Forte Circuit — Cloudy Frenzy", section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.68, 1.8177, 1.9555, 2.1483, 2.2861, 2.4445, 2.6649, 2.8853, 3.1058, 3.34], hitCount: 1, conditional: true, notes: ["Requires full Mayhem outside Cosmos Rave. Source explicitly considers Cloudy Frenzy Resonance Liberation DMG."] }),
  action({ factId: 'encore-forte-cosmos-rupture', name: "Forte Circuit — Cosmos Rupture", section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.2335, .2526, .2718, .2986, .3177, .3397, .3704, .401, .4317, .4642], hitCount: 6 }, { curve: [2.4908, 2.6951, 2.8993, 3.1853, 3.3895, 3.6244, 3.9512, 4.278, 4.6048, 4.9521], hitCount: 1 }], hitCount: null, conditional: true, notes: ["Requires full Mayhem during Cosmos Rave. Source explicitly considers Cosmos Rupture Resonance Liberation DMG."] }),
  action({
    factId: 'encore-outro-thermal-field',
    name: 'Outro Skill — Thermal Field',
    section: 'OUTRO_SKILL',
    actionKind: 'OUTRO',
    damageClass: 'OUTRO',
    scalingStat: 'ATK',
    motionValueContext: 'Current source-fixed Outro coefficient declared directly in kit text; no Lv1-Lv10 table exists for Thermal Field.',
    sourceFixedMotionValue: 1.7676,
    hitCount: 1,
    conditional: true,
    notes: ["Creates a 3m-radius field centered on the skill target. Targets inside take 176.76% of Encore's ATK as Fusion DMG every 1.5s for 6s. The raw fact does not pre-expand this timed field into an assumed hit count."],
  }),
] as const;

export const ENCORE_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'encore-resource-mayhem',
    name: 'Mayhem',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Mayhem',
    maxValue: 100,
    ruleSummary: 'Encore can hold up to 100 Mayhem. Mayhem is restored when Wooly Attack, Flaming Woolies, Energetic Welcome or Intro Skill Woolies Helpers hits a target, and by hitting targets during Cosmos Rave. At full Mayhem, casting Heavy Attack consumes all Mayhem to enter the corresponding Mayhem state before Cloudy Frenzy or, during Cosmos Rave, Cosmos Rupture.',
  }),
] as const;

export const ENCORE_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'encore-state-cosmos-rave',
    name: 'Resonance Liberation — Cosmos Rave state',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Encore casts Resonance Liberation Cosmos Rave.',
    effectSummary: 'For 10s, Basic Attack is replaced with Cosmos: Frolicking, Heavy Attack with Cosmos: Heavy Attack, Flaming Woolies with Cosmos: Rampage, and the Dodge Counter with Cosmos: Dodge Counter. Cosmos: Frolicking and the Dodge Counter are Basic Attack DMG, Cosmos: Heavy Attack is Heavy Attack DMG, and Cosmos: Rampage is Resonance Skill DMG.',
    durationSeconds: 10,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'encore-state-mayhem',
    name: 'Forte Circuit — Mayhem state',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Encore casts Heavy Attack with full Mayhem; during Cosmos Rave the corresponding Cosmos Mayhem branch is used.',
    effectSummary: 'Encore consumes all Mayhem and enters Mayhem, reducing damage taken by 70%. Switching characters does not interrupt the state. When it ends, Encore casts Cloudy Frenzy; during Cosmos Rave, Cosmos Mayhem instead ends with Cosmos Rupture.',
    durationSeconds: null,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['Current raw/Wuthering.gg call this resource/state Mayhem. Prydwen currently uses Dissonance for the same mechanics; no duration is guessed from animation timing.'],
  }),
  passive({
    factId: 'encore-inherent-angry-cosmos',
    name: 'Inherent Skill — Angry Cosmos',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Encore is in Cosmos Rave and her HP is above 70%.',
    effectSummary: 'Encore deals 10% increased DMG.',
    durationSeconds: null,
    maxStacks: 1,
  }),
  passive({
    factId: 'encore-inherent-woolies-cheer-dance',
    name: 'Inherent Skill — Woolies Cheer Dance',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Encore casts Flaming Woolies or Cosmos: Rampage.',
    effectSummary: "Encore's Fusion DMG Bonus is increased by 10% for 10s.",
    durationSeconds: 10,
    maxStacks: 1,
    modelingStatus: 'MODEL_READY',
  }),
] as const;

export const ENCORE_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'encore-s1-woolys-fairy-tale', name: "S1 — Wooly's Fairy Tale", section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: "Encore's Basic Attack hits a target.", effectSummary: "Encore's Fusion DMG Bonus increases by 3% for 6s, stacking up to 4 times." }),
  sequence({ factId: 'encore-s2-sheep-counting-lullaby', name: "S2 — Sheep-counting Lullaby", section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: "Encore casts Basic Attack Wooly Strike or Resonance Skill Energetic Welcome.", effectSummary: "Encore additionally restores 10 Resonance Energy. This can trigger once every 10s." }),
  sequence({ factId: 'encore-s3-fog-the-black-shores', name: "S3 — Fog? The Black Shores!", section: 'RESONANCE_CHAIN', sequence: 3, conditional: false, triggerSummary: "Sequence is active.", effectSummary: "The DMG multipliers of Heavy Attack Cloudy Frenzy and Heavy Attack Cosmos Rupture are increased by 40%." }),
  sequence({ factId: 'encore-s4-adventure-lets-go', name: "S4 — Adventure? Let's go!", section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: "Encore casts Heavy Attack Cosmos Rupture.", effectSummary: "All team members gain 20% Fusion DMG Bonus for 30s." }),
  sequence({ factId: 'encore-s5-hero-takes-the-stage', name: "S5 — Hero Takes the Stage!", section: 'RESONANCE_CHAIN', sequence: 5, conditional: false, triggerSummary: "Sequence is active.", effectSummary: "Encore's Resonance Skill DMG Bonus is increased by 35%." }),
  sequence({ factId: 'encore-s6-woolies-save-the-world', name: "S6 — Woolies Save the World!", section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: "Encore deals damage during Resonance Liberation Cosmos Rave.", effectSummary: "Encore gains 1 Lost Lamb stack per damage event; each stack increases ATK by 5% for 10s, stacking up to 5 times." }),
] as const;

export const ENCORE_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...ENCORE_ACTION_FACTS,
  ...ENCORE_RESOURCE_FACTS,
  ...ENCORE_PASSIVE_FACTS,
  ...ENCORE_SEQUENCE_FACTS,
] as const;
