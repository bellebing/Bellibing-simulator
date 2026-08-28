import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-28';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/zhezhi';
const WUTHERING_GG = 'https://wuthering.gg/characters/zhezhi';
const WUTHERING_WIKI = 'https://wuthering.wiki/character_1105.html';

export const ZHEZHI_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Prydwen — current Zhezhi kit cross-check',
    'Wuthering.gg — current Zhezhi kit and Tune Break entry',
    'Wuthering.wiki — current multiplier tables and raw damage-data scaling/type cross-check',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, PRYDWEN, WUTHERING_GG, WUTHERING_WIKI],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #66/#68 promotion-review pipeline supplies exact Lv1-Lv10 transcription structures; current Prydwen, Wuthering.gg and Wuthering.wiki were used for semantic verification.',
    'All canonical Character-owned Zhezhi damage entries are ATK-scaling. Inklit Spirit is a Coordinated Attack trigger whose current raw damage type is Basic; Heavy Attack Conjuration is Heavy while Stroke of Genius and Creation\'s Zenith are Basic.',
    'Afflatus, Phantasmic Imprints and Painter\'s Delight remain raw resource/state semantics. No imprint placement, teleport cadence or coordinated-attack uptime is assumed.',
    'S5 and S6 proportional follow-up damage remains sequence raw semantics rather than duplicated into fabricated Lv1-Lv10 base actions.',
    'Current external profile headers disagree on Max Resonance Energy (Prydwen 125 versus Wuthering.gg 140). Static Character core data is outside this Character Mechanics promotion and is not changed or inferred here.',
    'Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.',
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: 'zhezhi', kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: ZHEZHI_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: 'zhezhi', kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: ZHEZHI_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: 'zhezhi', kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ZHEZHI_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: 'zhezhi', kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ZHEZHI_PROVENANCE };
}

export const ZHEZHI_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'zhezhi-basic-attack-dimming-brush-stage-1-dmg', name: "Basic Attack \u2014 Dimming Brush Stage 1", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.21, .2273, .2445, .2686, .2858, .3056, .3332, .3607, .3883, .4176], hitCount: 2, conditional: false }),
  action({ factId: 'zhezhi-basic-attack-dimming-brush-stage-2-dmg', name: "Basic Attack \u2014 Dimming Brush Stage 2", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1034, .1118, .1203, .1322, .1406, .1504, .1639, .1775, .1911, .2055], hitCount: 5, conditional: false }),
  action({ factId: 'zhezhi-basic-attack-dimming-brush-stage-3-dmg', name: "Basic Attack \u2014 Dimming Brush Stage 3", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.672, .7272, .7823, .8594, .9145, .9779, 1.066, 1.1542, 1.2424, 1.3361], hitCount: 1, conditional: false }),
  action({ factId: 'zhezhi-basic-attack-dimming-brush-ha-dmg', name: "Heavy Attack \u2014 Dimming Brush", section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.567, .6135, .66, .7251, .7716, .825, .8994, .9738, 1.0482, 1.1272], hitCount: 1, conditional: false }),
  action({ factId: 'zhezhi-basic-attack-dimming-brush-mid-air-attack-dmg', name: "Mid-air Attack \u2014 Dimming Brush", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.1255, .1358, .1461, .1605, .1708, .1826, .1991, .2155, .232, .2495], hitCount: 5 }, { curve: [.527, .5703, .6135, .674, .7172, .7669, .836, .9052, .9743, 1.0478], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: 'zhezhi-basic-attack-dimming-brush-dodge-counter-dmg', name: "Dodge Counter \u2014 Dimming Brush", section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1462, .1582, .1702, .187, .199, .2128, .232, .2511, .2703, .2907], hitCount: 5, conditional: true }),
  action({ factId: 'zhezhi-resonance-skill-manifestation-press-dmg', name: "Resonance Skill \u2014 Manifestation (Press)", section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.495, .5356, .5762, .6331, .6736, .7203, .7853, .8502, .9152, .9842], hitCount: 3, conditional: false }),
  action({ factId: 'zhezhi-resonance-skill-manifestation-hold-dmg', name: "Resonance Skill \u2014 Manifestation (Hold)", section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.495, .5356, .5762, .6331, .6736, .7203, .7853, .8502, .9152, .9842], hitCount: 3, conditional: false }),
  action({ factId: 'zhezhi-resonance-skill-manifestation-mid-air-press-dmg', name: "Resonance Skill \u2014 Manifestation (Mid-air Press)", section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.495, .5356, .5762, .6331, .6736, .7203, .7853, .8502, .9152, .9842], hitCount: 3, conditional: false }),
  action({ factId: 'zhezhi-resonance-liberation-living-canvas-inklit-spirit-dmg', name: "Resonance Liberation \u2014 Inklit Spirit", section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.328, .3549, .3818, .4195, .4464, .4773, .5204, .5634, .6064, .6521], hitCount: 1, conditional: true, notes: ["Living Canvas summons Inklit Spirit as a Coordinated Attack, while current damage data classifies the damage as Basic Attack DMG. Coordinated triggering is kept separate from damageClass."] }),
  action({ factId: 'zhezhi-intro-skill-radiant-ruin-dmg', name: "Intro Skill \u2014 Radiant Ruin", section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.4334, .4689, .5044, .5542, .5897, .6306, .6874, .7443, .8012, .8616], hitCount: 3, conditional: false }),
  action({ factId: 'zhezhi-forte-circuit-ink-and-wash-ha-conjuration-dmg', name: "Forte Circuit \u2014 Heavy Attack: Conjuration", section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.4175, .4518, .486, .5339, .5682, .6076, .6623, .7171, .7719, .8301], hitCount: 3, conditional: true, notes: ["Current raw damage data classifies Conjuration as Heavy Attack DMG."] }),
  action({ factId: 'zhezhi-forte-circuit-ink-and-wash-stroke-of-genius-dmg', name: "Forte Circuit \u2014 Stroke of Genius", section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.5, 1.623, 1.746, 1.9182, 2.0412, 2.1827, 2.3795, 2.5763, 2.7731, 2.9822], hitCount: 1, conditional: true, notes: ["Current source explicitly considers Stroke of Genius Basic Attack DMG."] }),
  action({ factId: 'zhezhi-forte-circuit-ink-and-wash-creation-s-zenith-dmg', name: "Forte Circuit \u2014 Creation's Zenith", section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.6, .6492, .6984, .7673, .8165, .8731, .9518, 1.0305, 1.1093, 1.1929], hitCount: 3, conditional: true, notes: ["Current source explicitly considers Creation's Zenith Basic Attack DMG."] }),
] as const;

export const ZHEZHI_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'zhezhi-resource-afflatus',
    name: 'Afflatus',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Afflatus',
    maxValue: 90,
    ruleSummary: 'Zhezhi can hold up to 90 Afflatus. Normal Attacks grant Afflatus on hit and Intro Skill grants Afflatus. Manifestation consumes 60 at or above 60 to summon Left and Right Phantasmic Imprints; Heavy Attack Conjuration consumes 30 at or above 30 to summon the Middle Imprint.',
  }),
  resource({
    factId: 'zhezhi-resource-painters-delight',
    name: "Painter's Delight",
    section: 'FORTE_CIRCUIT',
    conditional: true,
    resourceName: "Painter's Delight",
    maxValue: 2,
    ruleSummary: 'Casting Stroke of Genius grants 1 stack for 8s, stacking up to 2. With a nearby Phantasmic Imprint and 2 stacks, Stroke of Genius is replaced by Creation\'s Zenith; casting Creation\'s Zenith consumes all Painter\'s Delight stacks.',
  }),
] as const;

export const ZHEZHI_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'zhezhi-skill-manifestation-imprints',
    name: 'Resonance Skill — Manifestation imprint creation',
    section: 'RESONANCE_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Manifestation is cast while Afflatus is at least 60.',
    effectSummary: 'Consume 60 Afflatus to summon Phantasmic Imprint - Left and Phantasmic Imprint - Right. Press on the ground places them on the ground; hold on the ground or press in mid-air places them in mid-air.',
    durationSeconds: 15,
    maxStacks: null,
  }),
  passive({
    factId: 'zhezhi-forte-phantasmic-imprints',
    name: 'Forte Circuit — Phantasmic Imprints',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Zhezhi creates Phantasmic Imprints through Manifestation or Heavy Attack Conjuration.',
    effectSummary: 'Up to one each of Left, Middle and Right Phantasmic Imprint can exist at the same time, each lasting 15s. Conjuration consumes 30 Afflatus when available to summon the Middle Imprint.',
    durationSeconds: 15,
    maxStacks: 3,
  }),
  passive({
    factId: 'zhezhi-forte-stroke-creation-state',
    name: "Forte Circuit — Stroke of Genius / Creation's Zenith state",
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'A Phantasmic Imprint is nearby; Creation\'s Zenith additionally requires 2 Painter\'s Delight stacks.',
    effectSummary: 'Stroke of Genius moves to and removes the selected Imprint, summons an Ivory Herald and grants 1 Painter\'s Delight stack. At 2 stacks it is replaced by Creation\'s Zenith, which consumes all Painter\'s Delight, moves to and removes the Imprint, summons an Ivory Herald and grants 18% Basic Attack DMG Bonus for 27s. Both can be cast in mid-air and can refresh mid-air Dodge attempts when the selected Imprint is airborne.',
    durationSeconds: null,
    maxStacks: null,
  }),
  passive({
    factId: 'zhezhi-liberation-inklit-trigger',
    name: 'Resonance Liberation — Living Canvas trigger rules',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'TEAM',
    triggerSummary: 'After Living Canvas, the active Resonator deals damage.',
    effectSummary: 'For 3s after damage is dealt, summon 1 Inklit Spirit per second; the trigger can occur once per second. Inklit Spirit damage does not trigger itself. Up to 1 Inklit Spirit can be summoned per second and up to 21 total. The effect lasts 30s or until the maximum count is reached.',
    durationSeconds: 30,
    maxStacks: 21,
  }),
  passive({
    factId: 'zhezhi-inherent-calligraphers-touch',
    name: "Inherent Skill — Calligrapher's Touch",
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: "Zhezhi casts Stroke of Genius or Creation's Zenith.",
    effectSummary: 'Increase ATK by 6% for 27s, stacking up to 3 times.',
    durationSeconds: 27,
    maxStacks: 3,
  }),
  passive({
    factId: 'zhezhi-inherent-flourish',
    name: 'Inherent Skill — Flourish',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'NEXT_CHARACTER',
    triggerSummary: 'Zhezhi casts Outro Skill.',
    effectSummary: 'Restore 15 Resonance Energy to the incoming Resonator.',
    durationSeconds: null,
    maxStacks: null,
  }),
  passive({
    factId: 'zhezhi-outro-carve-and-draw',
    name: 'Outro Skill — Carve and Draw',
    section: 'OUTRO_SKILL',
    conditional: true,
    scope: 'NEXT_CHARACTER',
    triggerSummary: 'Zhezhi casts Outro Skill.',
    effectSummary: 'The incoming Resonator has Glacio DMG Amplified by 20% and Resonance Skill DMG Amplified by 25%. The effect ends early if the Resonator is switched out.',
    durationSeconds: 14,
    maxStacks: null,
  }),
] as const;

export const ZHEZHI_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'zhezhi-s1-brushwork-s-finish', name: "Brushwork's Finish", section: 'RESONANCE_CHAIN', conditional: true, sequence: 1, triggerSummary: "Zhezhi casts Creation's Zenith.", effectSummary: "Restore 15 Resonance Energy and increase Crit. Rate by 10% for 27s." }),
  sequence({ factId: 'zhezhi-s2-vivid-strokes', name: "Vivid Strokes", section: 'RESONANCE_CHAIN', conditional: true, sequence: 2, triggerSummary: "Sequence 2 is active.", effectSummary: "Increase the maximum Inklit Spirits summoned by Living Canvas by 6." }),
  sequence({ factId: 'zhezhi-s3-reflection-s-grace', name: "Reflection's Grace", section: 'RESONANCE_CHAIN', conditional: true, sequence: 3, triggerSummary: "Zhezhi casts Manifestation, Stroke of Genius, or Creation's Zenith.", effectSummary: "Increase ATK by 15% for 27s, stacking up to 3 times." }),
  sequence({ factId: 'zhezhi-s4-hue-s-spectrum', name: "Hue's Spectrum", section: 'RESONANCE_CHAIN', conditional: true, sequence: 4, triggerSummary: "Zhezhi casts Living Canvas.", effectSummary: "Increase ATK of all Resonators on the team by 20% for 30s." }),
  sequence({ factId: 'zhezhi-s5-composition-s-clue', name: "Composition's Clue", section: 'RESONANCE_CHAIN', conditional: true, sequence: 5, triggerSummary: "Every 3 Inklit Spirits summoned by Living Canvas.", effectSummary: "Summon 1 extra Inklit Spirit to perform a Coordinated Attack dealing 140% of normal Inklit Spirit damage, considered Basic Attack DMG. This damage does not summon another Inklit Spirit." }),
  sequence({ factId: 'zhezhi-s6-infinite-legacy', name: "Infinite Legacy", section: 'RESONANCE_CHAIN', conditional: true, sequence: 6, triggerSummary: "Zhezhi casts Stroke of Genius or Creation's Zenith.", effectSummary: "Summon an extra Ivory Herald dealing damage equal to 120% of Stroke of Genius damage, considered Basic Attack DMG." }),
] as const;

export const ZHEZHI_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...ZHEZHI_ACTION_FACTS,
  ...ZHEZHI_RESOURCE_FACTS,
  ...ZHEZHI_PASSIVE_FACTS,
  ...ZHEZHI_SEQUENCE_FACTS,
] as const;
