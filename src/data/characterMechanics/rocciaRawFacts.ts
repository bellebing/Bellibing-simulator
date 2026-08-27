import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/roccia';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/roccia';
const WUTHERING_DB = 'https://wuwa.incin.net/resonators/1606';
const WUTHERING_WIKI = 'https://wuthering.wiki/character_1606.html';

export const ROCCIA_PROVENANCE = {
  sourceLabels: ['wuwabuild normalized Character snapshot — exact pinned upstream commit', 'Wuthering.gg — current Roccia kit/multiplier tables', 'Prydwen — current Roccia kit and Resonance Chain', 'WutheringDB — current Roccia raw kit/sequence text', 'Wuthering.wiki — raw damage-data/type cross-check'],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN, WUTHERING_DB, WUTHERING_WIKI],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #68 review artifacts supply exact Lv1-Lv10 action coefficient structures and description numerics; current Wuthering.gg, Prydwen, WutheringDB and Wuthering.wiki are used for semantic/source cross-check.',
    'Commedia Improvviso! and all Real Fantasy stages are explicitly classified as Heavy Attack DMG by current source text; those buckets are preserved independently from their Liberation/Forte sections.',
    'Magic Box is source-verified as a 14-second incoming-Resonator Utility replacement that deals fixed 100-point Havoc Utility DMG considered Echo Skill. Bellibing keeps that as raw utility semantics rather than fabricating a Character motion-value coefficient.',
    'Generated promotion candidates remained NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.',
  ],
} as const;

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

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation; no skill level is implicitly selected by raw data.';

export const ROCCIA_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: "roccia-basic-pero-easy-1", name: "Basic Attack — Pero, Easy Stage 1", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3681, 0.3983, 0.4285, 0.4707, 0.5009, 0.5356, 0.5839, 0.6322, 0.6805, 0.7318], hitCount: 1, conditional: false }),
  action({ factId: "roccia-basic-pero-easy-2", name: "Basic Attack — Pero, Easy Stage 2", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1919, 0.2076, 0.2234, 0.2454, 0.2611, 0.2792, 0.3044, 0.3296, 0.3548, 0.3814], hitCount: 3, conditional: false }),
  action({ factId: "roccia-basic-pero-easy-3", name: "Basic Attack — Pero, Easy Stage 3", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ curve: [0.17, 0.184, 0.1979, 0.2174, 0.2314, 0.2474, 0.2697, 0.292, 0.3143, 0.338], hitCount: 2 }, { curve: [0.51, 0.5519, 0.5937, 0.6522, 0.6941, 0.7422, 0.8091, 0.876, 0.9429, 1.014], hitCount: 1 }], hitCount: null, conditional: false }),
  action({ factId: "roccia-basic-pero-easy-4", name: "Basic Attack — Pero, Easy Stage 4", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.5241, 0.567, 0.61, 0.6702, 0.7131, 0.7626, 0.8313, 0.9001, 0.9688, 1.0419], hitCount: 2, conditional: false }),
  action({ factId: "roccia-heavy-pero-easy", name: "Heavy Attack — Pero, Easy", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.85, 0.9197, 0.9894, 1.087, 1.1567, 1.2369, 1.3484, 1.4599, 1.5714, 1.6899], hitCount: 1, conditional: false, notes: ["Source lists 10 STA initial cost plus 15 STA per second while charging. Hitting with at least 100 Imagination launches Roccia and enters Beyond Imagination; state/resource semantics are stored separately."] }),
  action({ factId: "roccia-mid-air-pero-easy", name: "Mid-air Attack — Pero, Easy", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.527, 0.5703, 0.6135, 0.674, 0.7172, 0.7669, 0.836, 0.9052, 0.9743, 1.0478], hitCount: 1, conditional: false, notes: ["Source lists 30 STA cost."] }),
  action({ factId: "roccia-dodge-counter-pero-easy", name: "Dodge Counter — Pero, Easy", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3466, 0.375, 0.4034, 0.4432, 0.4716, 0.5043, 0.5497, 0.5952, 0.6407, 0.689], hitCount: 3, conditional: true }),
  action({ factId: "roccia-skill-acrobatic-trick", name: "Resonance Skill — Acrobatic Trick", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3092, 0.3346, 0.3599, 0.3954, 0.4207, 0.4499, 0.4905, 0.531, 0.5716, 0.6147], hitCount: 8, conditional: false, notes: ["Source lists 10s cooldown and 20 Concerto Regen; cast restores 100 Imagination and enters Beyond Imagination."] }),
  action({ factId: "roccia-liberation-commedia-improvviso", name: "Resonance Liberation — Commedia Improvviso!", section: "RESONANCE_LIBERATION", actionKind: "LIBERATION", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.4, 1.5148, 1.6296, 1.7904, 1.9052, 2.0372, 2.2209, 2.4045, 2.5882, 2.7834], hitCount: 3, conditional: false, notes: ["Source explicitly classifies this damage as Heavy Attack DMG. Source lists 20s cooldown, 125 Resonance Cost and 20 Concerto Regen; team ATK conversion is stored separately."] }),
  action({ factId: "roccia-intro-pero-help", name: "Intro Skill — Pero, Help", section: "INTRO_SKILL", actionKind: "INTRO", damageClass: "INTRO", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.85, 0.9197, 0.9894, 1.087, 1.1567, 1.2369, 1.3484, 1.4599, 1.5714, 1.6899], hitCount: 1, conditional: false, notes: ["Source lists 10 Concerto Regen and permits immediate Basic Attack Stage 4 follow-up; cast restores 100 Imagination."] }),
  action({ factId: "roccia-forte-real-fantasy-1", name: "Basic Attack — Real Fantasy Stage 1", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.62, 1.7529, 1.8857, 2.0717, 2.2045, 2.3573, 2.5699, 2.7824, 2.9949, 3.2208], hitCount: 1, conditional: true, notes: ["Source explicitly classifies Real Fantasy as Heavy Attack DMG. Stage 1 lists 10 Concerto Regen; each cast requires and consumes 100 Imagination."] }),
  action({ factId: "roccia-forte-real-fantasy-2", name: "Basic Attack — Real Fantasy Stage 2", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.71, 1.8503, 1.9905, 2.1868, 2.327, 2.4883, 2.7126, 2.937, 3.1613, 3.3997], hitCount: 1, conditional: true, notes: ["Source explicitly classifies Real Fantasy as Heavy Attack DMG. Stage 2 lists 16 Concerto Regen; each cast requires and consumes 100 Imagination."] }),
  action({ factId: "roccia-forte-real-fantasy-3", name: "Basic Attack — Real Fantasy Stage 3", section: "FORTE_CIRCUIT", actionKind: "BASIC", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.8, 1.9476, 2.0952, 2.3019, 2.4495, 2.6192, 2.8554, 3.0915, 3.3277, 3.5786], hitCount: 1, conditional: true, notes: ["Source explicitly classifies Real Fantasy as Heavy Attack DMG. Stage 3 lists 25 Concerto Regen; each cast requires and consumes 100 Imagination."] }),
] as const;

export const ROCCIA_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: 'roccia-resource-imagination', name: 'Imagination', section: 'FORTE_CIRCUIT', conditional: false, resourceName: 'Imagination', maxValue: 300, ruleSummary: 'Roccia holds up to 300 Imagination. Normal Attack damage and holding Normal Attack restore Imagination; Acrobatic Trick and Pero, Help each restore 100. Real Fantasy requires at least 100 and consumes 100 per cast.' }),
] as const;

export const ROCCIA_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: 'roccia-state-beyond-imagination', name: 'Beyond Imagination', section: 'FORTE_CIRCUIT', conditional: true, scope: 'SELF', triggerSummary: 'Enter from a Heavy Attack hit with at least 100 Imagination, Acrobatic Trick, or qualifying Real Fantasy Stage 1/2 landing.', effectSummary: 'While airborne in Beyond Imagination with at least 100 Imagination, Basic Attack can consume 100 Imagination to cast Real Fantasy. Roccia exits when no longer airborne or when switched off field.', durationSeconds: null, maxStacks: null, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'roccia-liberation-team-atk-conversion', name: 'Commedia Improvviso! — team ATK conversion', section: 'RESONANCE_LIBERATION', conditional: true, scope: 'TEAM', triggerSummary: 'Cast Commedia Improvviso!.', effectSummary: "For every 0.1% Crit. Rate above 50%, increase all Resonators' ATK by 1 point for 30s, capped at 200 points.", durationSeconds: 30, maxStacks: null, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'roccia-inherent-immersive-performance', name: 'Immersive Performance', section: 'INHERENT_SKILL', conditional: true, scope: 'SELF', triggerSummary: 'Cast Resonance Skill or Heavy Attack.', effectSummary: "Increase Roccia's ATK by 20% for 12s.", durationSeconds: 12, maxStacks: null }),
  passive({ factId: 'roccia-inherent-super-attractive-magic-box', name: 'Super Attractive Magic Box', section: 'INHERENT_SKILL', conditional: true, scope: 'NEXT_CHARACTER', triggerSummary: "After Roccia casts Outro Skill, replace the incoming Resonator's Utility with Magic Box.", effectSummary: 'Magic Box lasts 14s or until the Resonator is switched out. On use it pulls nearby targets and deals fixed 100 points of Havoc Utility DMG, considered Echo Skill.', durationSeconds: 14, maxStacks: null, modelingStatus: 'PENDING_INTERPRETATION', notes: ['The fixed 100-point Utility damage is not an ATK/HP/DEF motion-value coefficient and is deliberately not forced into Character damage fields.'] }),
  passive({ factId: 'roccia-outro-applause-please', name: 'Outro Skill — Applause, Please!', section: 'OUTRO_SKILL', conditional: true, scope: 'NEXT_CHARACTER', triggerSummary: 'Cast Outro Skill and switch to the incoming Resonator.', effectSummary: "Amplify the incoming Resonator's Havoc DMG by 20% and Basic Attack DMG by 25% for 14s or until they are switched out.", durationSeconds: 14, maxStacks: null, modelingStatus: 'MODEL_READY' }),
] as const;

export const ROCCIA_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: "roccia-s1-when-shadows-engulf-the-hull", name: "S1 — When Shadows Engulf the Hull", section: 'RESONANCE_CHAIN', conditional: true, sequence: 1, triggerSummary: "Casting Acrobatic Trick.", effectSummary: "Gain 100 additional Imagination and 10 Concerto Energy; Roccia is immune to interruptions while casting Real Fantasy." }),
  sequence({ factId: "roccia-s2-when-the-luceanite-gleams", name: "S2 — When the Luceanite Gleams", section: 'RESONANCE_CHAIN', conditional: true, sequence: 2, triggerSummary: "Casting Real Fantasy.", effectSummary: "Grant all Resonators 10% Havoc DMG Bonus for 30s, stacking up to 3 times; at max stacks grant an additional 10% Havoc DMG Bonus for 30s." }),
  sequence({ factId: "roccia-s3-when-the-heart-sees-and-hands-feel", name: "S3 — When the Heart Sees and Hands Feel", section: 'RESONANCE_CHAIN', conditional: true, sequence: 3, triggerSummary: "Casting Intro Skill Pero, Help.", effectSummary: "Increase Roccia's Crit. Rate by 10% and Crit. DMG by 30% for 15s." }),
  sequence({ factId: "roccia-s4-when-wonders-gather-in-the-box", name: "S4 — When Wonders Gather in the Box", section: 'RESONANCE_CHAIN', conditional: true, sequence: 4, triggerSummary: "Casting Acrobatic Trick.", effectSummary: "Increase Real Fantasy's DMG Multiplier by 60% for 12s." }),
  sequence({ factId: "roccia-s5-when-dreams-are-reborn-on-stage", name: "S5 — When Dreams Are Reborn on Stage", section: 'RESONANCE_CHAIN', conditional: true, sequence: 5, triggerSummary: "Sequence is active.", effectSummary: "Increase Commedia Improvviso! DMG Multiplier by 20% and Heavy Attack DMG Multiplier by 80%." }),
  sequence({ factId: "roccia-s6-when-the-golden-wings-fly", name: "S6 — When the Golden Wings Fly", section: 'RESONANCE_CHAIN', conditional: true, sequence: 6, triggerSummary: "Casting Commedia Improvviso!.", effectSummary: "For 12s, Real Fantasy ignores 60% DEF. After Real Fantasy Stage 3 lands Roccia re-enters Beyond Imagination and gains Reality Recreation; Reality Recreation deals 100% of Real Fantasy Stage 3 DMG, is considered Heavy Attack DMG, grants interruption immunity during cast, and loops Roccia back into Beyond Imagination on landing." }),
] as const;

export const ROCCIA_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...ROCCIA_ACTION_FACTS,
  ...ROCCIA_RESOURCE_FACTS,
  ...ROCCIA_PASSIVE_FACTS,
  ...ROCCIA_SEQUENCE_FACTS,
] as const;
