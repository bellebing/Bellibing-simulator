import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const WUTHERING_GG = 'https://wuthering.gg/characters/mortefi';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/mortefi';

export const MORTEFI_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Wuthering.gg — current Mortefi kit and multiplier tables',
    'Prydwen — current Mortefi kit and Resonance Chain',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, WUTHERING_GG, PRYDWEN],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #68 review artifact supplies exact Lv1-Lv10 coefficient structures; current Wuthering.gg and Prydwen cross-check action identity, Annoyance rules, Burning Rhapsody/Marcato behavior, Inherents, Outro and S1-S6 semantics.',
    'Current Prydwen exposes an internal wording typo that calls Fury Fugue "Fury Fudge" in parts of the Forte description while the move heading, pinned source and Wuthering.gg use Fury Fugue. Bellibing keeps Fury Fugue as the canonical current label and records the wording discrepancy instead of creating a second mechanic.',
    'Marcato is a Coordinated Attack fired by Burning Rhapsody, while the source consistently identifies it as Resonance Liberation\'s Marcato and sequence effects modify Resonance Liberation Marcato. Bellibing stores LIBERATION as the damage-bonus class and keeps coordinated triggering in raw state semantics, matching the existing Baizhi coordinated-damage boundary.',
    'All Character-owned damaging actions in this source slice scale from ATK. Tune Break remains a separate shared-system action and is not represented in this file.',
  ],
} as const;

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return {
    ...input,
    characterId: 'mortefi',
    kind: 'ACTION',
    actionRole: 'DAMAGE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODEL_READY',
    motionValue: null,
    provenance: MORTEFI_PROVENANCE,
  };
}

function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return {
    ...rest,
    characterId: 'mortefi',
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    provenance: MORTEFI_PROVENANCE,
  };
}

function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return {
    ...input,
    characterId: 'mortefi',
    kind: 'RESOURCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: MORTEFI_PROVENANCE,
  };
}

function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return {
    ...input,
    characterId: 'mortefi',
    kind: 'SEQUENCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: MORTEFI_PROVENANCE,
  };
}

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation; no skill level is implicitly selected by raw data.';

export const MORTEFI_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'mortefi-basic-impromptu-show-1', name: 'Basic Attack — Impromptu Show Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2429, 0.2629, 0.2828, 0.3107, 0.3306, 0.3535, 0.3854, 0.4172, 0.4491, 0.483], hitCount: 1, conditional: false }),
  action({ factId: 'mortefi-basic-impromptu-show-2', name: 'Basic Attack — Impromptu Show Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2051, 0.222, 0.2388, 0.2623, 0.2792, 0.2985, 0.3254, 0.3523, 0.3792, 0.4078], hitCount: 2, conditional: false }),
  action({ factId: 'mortefi-basic-impromptu-show-3', name: 'Basic Attack — Impromptu Show Stage 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.5397, 0.584, 0.6283, 0.6902, 0.7345, 0.7854, 0.8562, 0.927, 0.9978, 1.073], hitCount: 1, conditional: false }),
  action({ factId: 'mortefi-basic-impromptu-show-4', name: 'Basic Attack — Impromptu Show Stage 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueComponents: [{ hitCount: 4, curve: [0.1057, 0.1144, 0.1231, 0.1352, 0.1439, 0.1539, 0.1677, 0.1816, 0.1955, 0.2102] }, { hitCount: 1, curve: [0.6384, 0.6908, 0.7431, 0.8164, 0.8688, 0.929, 1.0127, 1.0965, 1.1803, 1.2693] }], hitCount: null, conditional: false, notes: ['Source keeps the four-hit first component separate from the final listed coefficient; Bellibing preserves that exact component shape.'] }),
  action({ factId: 'mortefi-mid-air-impromptu-show-1', name: 'Mid-air Attack — Impromptu Show Stage 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1169, 0.1265, 0.1361, 0.1495, 0.1591, 0.1702, 0.1855, 0.2008, 0.2162, 0.2325], hitCount: 1, conditional: false }),
  action({ factId: 'mortefi-mid-air-impromptu-show-2', name: 'Mid-air Attack — Impromptu Show Stage 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1169, 0.1265, 0.1361, 0.1495, 0.1591, 0.1702, 0.1855, 0.2008, 0.2162, 0.2325], hitCount: 1, conditional: false }),
  action({ factId: 'mortefi-heavy-aimed-shot', name: 'Heavy Attack — Aimed Shot', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.4914, 0.5317, 0.572, 0.6285, 0.6687, 0.7151, 0.7796, 0.844, 0.9085, 0.977], hitCount: 1, conditional: false }),
  action({ factId: 'mortefi-heavy-fully-charged-aimed-shot', name: 'Heavy Attack — Fully Charged Aimed Shot', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.84, 0.9089, 0.9778, 1.0742, 1.1431, 1.2223, 1.3325, 1.4427, 1.553, 1.6701], hitCount: 1, conditional: false }),
  action({ factId: 'mortefi-dodge-counter-impromptu-show', name: 'Dodge Counter — Impromptu Show', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.9807, 1.0612, 1.1416, 1.2542, 1.3346, 1.4271, 1.5557, 1.6844, 1.8131, 1.9498], hitCount: 1, conditional: true }),
  action({ factId: 'mortefi-skill-passionate-variation', name: 'Resonance Skill — Passionate Variation', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.05, 1.1361, 1.2222, 1.3428, 1.4289, 1.5279, 1.6657, 1.8034, 1.9412, 2.0876], hitCount: 1, conditional: false }),
  action({ factId: 'mortefi-liberation-violent-finale', name: 'Resonance Liberation — Violent Finale', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.8, 0.8656, 0.9312, 1.0231, 1.0887, 1.1641, 1.2691, 1.374, 1.479, 1.5905], hitCount: 1, conditional: false }),
  action({ factId: 'mortefi-liberation-marcato', name: 'Resonance Liberation — Marcato', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.16, 0.1732, 0.1863, 0.2047, 0.2178, 0.2329, 0.2539, 0.2748, 0.2958, 0.3181], hitCount: 1, conditional: true, notes: ['Burning Rhapsody fires 1 Marcato when the active character Basic Attack hits and 2 Marcato when the active character Heavy Attack hits. One Coordinated Attack can trigger every 0.35s; the raw coefficient here is one Marcato hit, while trigger multiplicity remains in the Burning Rhapsody fact.'] }),
  action({ factId: 'mortefi-intro-dissonance', name: 'Intro Skill — Dissonance', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.85, 0.9197, 0.9894, 1.087, 1.1567, 1.2369, 1.3484, 1.4599, 1.5714, 1.6899], hitCount: 1, conditional: false }),
  action({ factId: 'mortefi-forte-fury-fugue', name: 'Forte Circuit — Fury Fugue', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'SKILL', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.64, 1.7745, 1.909, 2.0973, 2.2318, 2.3864, 2.6016, 2.8167, 3.0319, 3.2605], hitCount: 1, conditional: true, notes: ['Fury Fugue replaces Passionate Variation at 100 Annoyance, consumes all Annoyance on cast and is explicitly considered Resonance Skill DMG.'] }),
] as const;

export const MORTEFI_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'mortefi-resource-annoyance',
    name: 'Annoyance',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Annoyance',
    maxValue: 100,
    ruleSummary: 'Mortefi can hold up to 100 Annoyance. Impromptu Show hits, Intro Skill Dissonance hits and Resonance Skill Passionate Variation hits restore Annoyance. For 5 seconds after casting Passionate Variation, Impromptu Show hits restore additional Annoyance. At 100 Annoyance Passionate Variation is replaced with Fury Fugue; casting Fury Fugue consumes all Annoyance.',
  }),
] as const;

export const MORTEFI_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'mortefi-liberation-burning-rhapsody',
    name: 'Resonance Liberation — Burning Rhapsody',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'TEAM',
    triggerSummary: 'Mortefi casts Resonance Liberation Violent Finale.',
    effectSummary: 'Burning Rhapsody lasts 10 seconds. When the active character Basic Attack hits, Mortefi launches a Coordinated Attack firing 1 Marcato. When the active character Heavy Attack hits, he fires 2 Marcato. Mortefi can launch one Coordinated Attack every 0.35 seconds.',
    durationSeconds: 10,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['Trigger cadence and actual connected Marcato count are combat-state behavior rather than assumed uptime.'],
  }),
  passive({
    factId: 'mortefi-inherent-harmonic-control',
    name: 'Inherent Skill — Harmonic Control',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Mortefi casts Resonance Skill Passionate Variation.',
    effectSummary: 'Fury Fugue DMG is increased by 25% for 8 seconds.',
    durationSeconds: 8,
    maxStacks: 1,
  }),
  passive({
    factId: 'mortefi-inherent-rhythmic-vibrato',
    name: 'Inherent Skill — Rhythmic Vibrato',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'A Resonance Liberation Marcato hits during Burning Rhapsody.',
    effectSummary: 'Each Marcato hit increases the DMG of the next Marcato by 1.5%. This can trigger once every 0.35 seconds, stacks up to 50 times, and resets when Burning Rhapsody ends.',
    durationSeconds: null,
    maxStacks: 50,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'mortefi-outro-rage-transposition',
    name: 'Outro Skill — Rage Transposition',
    section: 'OUTRO_SKILL',
    conditional: true,
    scope: 'NEXT_CHARACTER',
    triggerSummary: 'Mortefi casts Outro Skill and the incoming Resonator takes the field.',
    effectSummary: 'The incoming Resonator gains 38% Heavy Attack DMG Amplification for 14 seconds or until they switch out.',
    durationSeconds: 14,
    maxStacks: 1,
    modelingStatus: 'MODEL_READY',
  }),
] as const;

export const MORTEFI_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'mortefi-s1-solitary-etude', name: 'S1 — Solitary Etude', section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: 'During Burning Rhapsody, the on-field character performs a Resonance Skill.', effectSummary: 'Mortefi launches a Coordinated Attack firing 2 Resonance Liberation Marcato hits, dealing Fusion DMG.' }),
  sequence({ factId: 'mortefi-s2-hypocritical-hymn', name: 'S2 — Hypocritical Hymn', section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: 'Mortefi uses an Echo Skill; can trigger once every 20 seconds.', effectSummary: 'Mortefi restores an additional 10 Resonance Energy.' }),
  sequence({ factId: 'mortefi-s3-flaming-recitativo', name: 'S3 — Flaming Recitativo', section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: 'Burning Rhapsody is active.', effectSummary: 'CRIT DMG of Resonance Liberation Marcato is increased by 30%.' }),
  sequence({ factId: 'mortefi-s4-cathartic-waltz', name: 'S4 — Cathartic Waltz', section: 'RESONANCE_CHAIN', sequence: 4, conditional: false, triggerSummary: 'Sequence is active.', effectSummary: 'The duration of Resonance Liberation Burning Rhapsody is extended by 7 seconds.' }),
  sequence({ factId: 'mortefi-s5-funerary-quartet', name: 'S5 — Funerary Quartet', section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: 'Passionate Variation or Fury Fugue hits a target.', effectSummary: 'A Coordinated Attack fires 4 Resonance Liberation Marcato hits. Marcato DMG fired this way is reduced by 50%.' }),
  sequence({ factId: 'mortefi-s6-apoplectic-instrumental', name: 'S6 — Apoplectic Instrumental', section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: 'Mortefi casts Resonance Liberation Violent Finale.', effectSummary: 'ATK of all team members is increased by 20% for 20 seconds.' }),
] as const;

export const MORTEFI_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...MORTEFI_ACTION_FACTS,
  ...MORTEFI_RESOURCE_FACTS,
  ...MORTEFI_PASSIVE_FACTS,
  ...MORTEFI_SEQUENCE_FACTS,
] as const;
