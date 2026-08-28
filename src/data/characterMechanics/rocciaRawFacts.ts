import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-28';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/roccia';
const WUTHERING_GG = 'https://wuthering.gg/characters/roccia';
const WUTHERING_WIKI = 'https://wuthering.wiki/character_1606.html';

export const ROCCIA_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Prydwen — current Roccia kit cross-check',
    'Wuthering.gg — current Roccia kit and Tune Break entry',
    'Wuthering.wiki — current multiplier tables and raw damage-data scaling/type cross-check',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, PRYDWEN, WUTHERING_GG, WUTHERING_WIKI],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #66/#68 promotion-review pipeline supplies exact Lv1-Lv10 transcription structures; current Prydwen, Wuthering.gg and Wuthering.wiki were used for semantic verification.',
    'All canonical Character-owned Roccia damage entries are ATK-scaling. Current damage data classifies Commedia Improvviso! and every Real Fantasy stage as Heavy Attack DMG despite their Liberation/Forte ownership.',
    'Magic Box is retained as raw utility semantics: the source calls it an Echo Skill dealing Utility DMG with a fixed 100-point Havoc hit. Bellibing does not fabricate that external utility action as a Character Lv1-Lv10 motion-value action.',
    'Imagination/Beyond Imagination, Real Fantasy state transitions and sequence-derived Reality Recreation remain raw state/sequence semantics. No rotation uptime or repeated-state cadence is assumed.',
    'Current external profile headers disagree on Max Resonance Energy (Prydwen 125 versus Wuthering.gg 140). Static Character core data is outside this Character Mechanics promotion and is not changed or inferred here.',
    'Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.',
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: 'roccia', kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: ROCCIA_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: 'roccia', kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: ROCCIA_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: 'roccia', kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ROCCIA_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: 'roccia', kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: ROCCIA_PROVENANCE };
}

export const ROCCIA_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'roccia-basic-attack-pero-easy-stage-1-dmg', name: "Basic Attack \u2014 Pero, Easy Stage 1", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3681, .3983, .4285, .4707, .5009, .5356, .5839, .6322, .6805, .7318], hitCount: 1, conditional: false }),
  action({ factId: 'roccia-basic-attack-pero-easy-stage-2-dmg', name: "Basic Attack \u2014 Pero, Easy Stage 2", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.1919, .2076, .2233, .2453, .2611, .2792, .3043, .3295, .3547, .3814], hitCount: 3, conditional: false }),
  action({ factId: 'roccia-basic-attack-pero-easy-stage-3-dmg', name: "Basic Attack \u2014 Pero, Easy Stage 3", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [.17, .184, .1979, .2174, .2314, .2474, .2697, .292, .3143, .338], hitCount: 2 }, { curve: [.51, .5519, .5937, .6522, .6941, .7422, .8091, .876, .9429, 1.014], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: 'roccia-basic-attack-pero-easy-stage-4-dmg', name: "Basic Attack \u2014 Pero, Easy Stage 4", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.5241, .567, .61, .6702, .7131, .7626, .8313, .9001, .9688, 1.0419], hitCount: 2, conditional: false }),
  action({ factId: 'roccia-basic-attack-pero-easy-heavy-attack-dmg', name: "Heavy Attack \u2014 Pero, Easy", section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.85, .9197, .9894, 1.087, 1.1567, 1.2369, 1.3484, 1.4599, 1.5714, 1.6899], hitCount: 1, conditional: false, notes: ["Hitting a target with at least 100 Imagination sends Roccia into mid-air and activates Beyond Imagination; the damage remains the ordinary Heavy Attack coefficient."] }),
  action({ factId: 'roccia-basic-attack-pero-easy-mid-air-attack-dmg', name: "Mid-air Attack \u2014 Pero, Easy", section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.527, .5703, .6135, .674, .7172, .7669, .836, .9052, .9743, 1.0478], hitCount: 1, conditional: false }),
  action({ factId: 'roccia-basic-attack-pero-easy-dodge-counter-dmg', name: "Dodge Counter \u2014 Pero, Easy", section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3466, .375, .4034, .4432, .4716, .5043, .5497, .5952, .6407, .689], hitCount: 3, conditional: true }),
  action({ factId: 'roccia-resonance-skill-acrobatic-trick-skill-dmg', name: "Resonance Skill \u2014 Acrobatic Trick", section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.3092, .3346, .3599, .3954, .4207, .4499, .4905, .531, .5716, .6147], hitCount: 8, conditional: false }),
  action({ factId: 'roccia-resonance-liberation-commedia-improvviso-skill-dmg', name: "Resonance Liberation \u2014 Commedia Improvviso!", section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.4, 1.5148, 1.6296, 1.7904, 1.9052, 2.0372, 2.2209, 2.4045, 2.5882, 2.7834], hitCount: 3, conditional: false, notes: ["Current damage data classifies Commedia Improvviso! as Heavy Attack DMG despite being cast as Resonance Liberation."] }),
  action({ factId: 'roccia-intro-skill-pero-help-skill-dmg', name: "Intro Skill \u2014 Pero, Help", section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [.85, .9197, .9894, 1.087, 1.1567, 1.2369, 1.3484, 1.4599, 1.5714, 1.6899], hitCount: 1, conditional: false, notes: ["Using Basic Attack immediately after Pero, Help casts Basic Attack Stage 4; Stage 4 retains its own canonical action fact."] }),
  action({ factId: 'roccia-forte-circuit-a-prop-master-prepares-stage-1-dmg', name: "Forte Circuit \u2014 Real Fantasy Stage 1", section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.62, 1.7529, 1.8857, 2.0717, 2.2045, 2.3573, 2.5699, 2.7824, 2.9949, 3.2208], hitCount: 1, conditional: true, notes: ["Real Fantasy is explicitly considered Heavy Attack DMG and requires Beyond Imagination plus at least 100 Imagination."] }),
  action({ factId: 'roccia-forte-circuit-a-prop-master-prepares-stage-2-dmg', name: "Forte Circuit \u2014 Real Fantasy Stage 2", section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.71, 1.8503, 1.9905, 2.1868, 2.327, 2.4883, 2.7126, 2.937, 3.1613, 3.3997], hitCount: 1, conditional: true, notes: ["Real Fantasy is explicitly considered Heavy Attack DMG and requires Beyond Imagination plus at least 100 Imagination."] }),
  action({ factId: 'roccia-forte-circuit-a-prop-master-prepares-stage-3-dmg', name: "Forte Circuit \u2014 Real Fantasy Stage 3", section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.8, 1.9476, 2.0952, 2.3019, 2.4495, 2.6192, 2.8554, 3.0915, 3.3277, 3.5786], hitCount: 1, conditional: true, notes: ["Real Fantasy is explicitly considered Heavy Attack DMG and requires Beyond Imagination plus at least 100 Imagination."] }),
] as const;

export const ROCCIA_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'roccia-resource-imagination',
    name: 'Imagination',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Imagination',
    maxValue: 300,
    ruleSummary: 'Roccia can hold up to 300 Imagination. Normal Attack damage restores Imagination; holding Normal Attack charges while restoring it. Acrobatic Trick and Pero, Help each restore 100. In Beyond Imagination, at least 100 Imagination is required and 100 is consumed to cast Real Fantasy.',
  }),
] as const;

export const ROCCIA_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'roccia-forte-beyond-imagination',
    name: 'Forte Circuit — Beyond Imagination',
    section: 'FORTE_CIRCUIT',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Roccia enters Beyond Imagination while airborne, including after Heavy Attack hits with at least 100 Imagination or after Acrobatic Trick.',
    effectSummary: 'With at least 100 Imagination, Basic Attack consumes 100 to cast Real Fantasy. Roccia exits Beyond Imagination when no longer airborne or when switched off field. Landing after Real Fantasy Stage 1 or Stage 2 with over 100 Imagination launches Roccia back into the air and reactivates Beyond Imagination.',
    durationSeconds: null,
    maxStacks: null,
  }),
  passive({
    factId: 'roccia-liberation-team-atk',
    name: 'Resonance Liberation — Crit Rate to team ATK',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'TEAM',
    triggerSummary: 'Roccia casts Commedia Improvviso! with Crit. Rate above 50%.',
    effectSummary: 'For every 0.1% Crit. Rate over 50%, all Resonators in the team gain 1 flat ATK point for 30s, up to 200 points.',
    durationSeconds: 30,
    maxStacks: null,
  }),
  passive({
    factId: 'roccia-inherent-immersive-performance',
    name: 'Inherent Skill — Immersive Performance',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Roccia casts Resonance Skill or Heavy Attack.',
    effectSummary: 'Roccia gains 20% ATK.',
    durationSeconds: 12,
    maxStacks: null,
  }),
  passive({
    factId: 'roccia-inherent-super-attractive-magic-box',
    name: 'Inherent Skill — Super Attractive Magic Box',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'NEXT_CHARACTER',
    triggerSummary: 'Roccia casts Outro Skill.',
    effectSummary: 'The incoming Resonator\'s Utility is replaced with Magic Box. Using Magic Box pulls nearby targets and deals 100 fixed points of Havoc DMG; the source considers it an Echo Skill dealing Utility DMG. Magic Box is utility/external-action semantics here, not fabricated Character motion-value data.',
    durationSeconds: 14,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'roccia-outro-applause-please',
    name: 'Outro Skill — Applause, Please!',
    section: 'OUTRO_SKILL',
    conditional: true,
    scope: 'NEXT_CHARACTER',
    triggerSummary: 'Roccia casts Outro Skill.',
    effectSummary: 'The incoming Resonator has Havoc DMG Amplified by 20% and Basic Attack DMG Amplified by 25%. The effect ends early if the Resonator is switched out.',
    durationSeconds: 14,
    maxStacks: null,
  }),
] as const;

export const ROCCIA_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'roccia-s1-when-shadows-engulf-the-hull', name: "When Shadows Engulf the Hull", section: 'RESONANCE_CHAIN', conditional: true, sequence: 1, triggerSummary: "Roccia casts Resonance Skill Acrobatic Trick.", effectSummary: "Gain 100 additional Imagination and 10 Concerto Energy. Roccia is immune to interruptions while casting Basic Attack Real Fantasy." }),
  sequence({ factId: 'roccia-s2-when-the-luceanite-gleams', name: "When the Luceanite Gleams", section: 'RESONANCE_CHAIN', conditional: true, sequence: 2, triggerSummary: "Roccia casts Basic Attack Real Fantasy.", effectSummary: "All Resonators gain 10% Havoc DMG Bonus for 30s, stacking up to 3 times. At max stacks, grant an additional 10% Havoc DMG Bonus for 30s." }),
  sequence({ factId: 'roccia-s3-when-the-heart-sees-and-hands-feel', name: "When the Heart Sees and Hands Feel", section: 'RESONANCE_CHAIN', conditional: true, sequence: 3, triggerSummary: "Roccia casts Intro Skill Pero, Help.", effectSummary: "Roccia gains 10% Crit. Rate and 30% Crit. DMG for 15s." }),
  sequence({ factId: 'roccia-s4-when-wonders-gather-in-the-box', name: "When Wonders Gather in the Box", section: 'RESONANCE_CHAIN', conditional: true, sequence: 4, triggerSummary: "Roccia casts Resonance Skill Acrobatic Trick.", effectSummary: "Basic Attack Real Fantasy DMG Multiplier increases by 60% for 12s." }),
  sequence({ factId: 'roccia-s5-when-dreams-are-reborn-on-stage', name: "When Dreams Are Reborn on Stage", section: 'RESONANCE_CHAIN', conditional: true, sequence: 5, triggerSummary: "Sequence 5 is active.", effectSummary: "Commedia Improvviso! DMG Multiplier increases by 20% and Heavy Attack DMG Multiplier increases by 80%." }),
  sequence({ factId: 'roccia-s6-when-the-golden-wings-fly', name: "When the Golden Wings Fly", section: 'RESONANCE_CHAIN', conditional: true, sequence: 6, triggerSummary: "Roccia casts Resonance Liberation Commedia Improvviso!.", effectSummary: "For 12s, Real Fantasy ignores 60% enemy DEF. Landing after Real Fantasy Stage 3 launches Roccia into Beyond Imagination and replaces Basic Attack with Reality Recreation, which deals damage equal to 100% of Real Fantasy Stage 3 damage and is considered Heavy Attack DMG; casting it grants interruption immunity. Landing after Reality Recreation launches Roccia again into Beyond Imagination." }),
] as const;

export const ROCCIA_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...ROCCIA_ACTION_FACTS,
  ...ROCCIA_RESOURCE_FACTS,
  ...ROCCIA_PASSIVE_FACTS,
  ...ROCCIA_SEQUENCE_FACTS,
] as const;
