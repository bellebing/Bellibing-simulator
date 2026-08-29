import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = "2026-08-29";
const SOURCE_SNAPSHOT = "https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json";

export const SANHUA_PROVENANCE = {
  sourceLabels: ["wuwabuild normalized Character snapshot — exact pinned upstream commit", "Prydwen — current Sanhua kit", "Wuthering Waves Wiki — current Snowy Clarity S2"],
  sourceUrls: ["https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json", "https://www.prydwen.gg/wuthering-waves/characters/sanhua", "https://wutheringwaves.fandom.com/wiki/Snowy_Clarity"],
  checkedAt: CHECKED_AT,
  notes: [
    "Exact Lv1-Lv10 tabular structures come from the pinned PR #66/#68 promotion-review artifact; current source kit text was used for action ownership, damage-bucket, resource/state, Inherent and Outro semantics.",
    "Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this source/semantic review; no candidate status was promoted automatically.",
    "Current Prydwen and Wuthering Waves Wiki both state Sanhua S2 anti-interruption duration as 10s; the pinned promotion artifact still carries a stale 5s parameter, so current cross-source text controls the canonical S2 fact."
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';
const FIXED_CONTEXT = 'Exact source-fixed Character damage coefficient declared directly by the current kit without a Lv1-Lv10 table; no talent-level curve is fabricated.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: "sanhua", kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: SANHUA_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: "sanhua", kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: SANHUA_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: "sanhua", kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: SANHUA_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: "sanhua", kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: SANHUA_PROVENANCE };
}

export const SANHUA_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: "sanhua-basic-attack-frigid-light-stage-1-dmg", name: "Frigid Light — Stage 1 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.245,0.2651,0.2852,0.3134,0.3334,0.3565,0.3887,0.4208,0.453,0.4871], hitCount: 1, conditional: false }),
  action({ factId: "sanhua-basic-attack-frigid-light-stage-2-dmg", name: "Frigid Light — Stage 2 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.371,0.4015,0.4319,0.4745,0.5049,0.5399,0.5886,0.6372,0.6859,0.7376], hitCount: 1, conditional: false }),
  action({ factId: "sanhua-basic-attack-frigid-light-stage-3-dmg", name: "Frigid Light — Stage 3 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1085,0.1174,0.1263,0.1388,0.1477,0.1579,0.1722,0.1864,0.2006,0.2158], hitCount: 4, conditional: false }),
  action({ factId: "sanhua-basic-attack-frigid-light-stage-4-dmg", name: "Frigid Light — Stage 4 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1995,0.2159,0.2323,0.2552,0.2715,0.2903,0.3165,0.3427,0.3689,0.3967], hitCount: 2, conditional: false }),
  action({ factId: "sanhua-basic-attack-frigid-light-stage-5-dmg", name: "Frigid Light — Stage 5 DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.176,1.2725,1.3689,1.5039,1.6004,1.7112,1.8655,2.0198,2.1741,2.3381], hitCount: 1, conditional: false }),
  action({ factId: "sanhua-basic-attack-frigid-light-heavy-attack-dmg", name: "Frigid Light — Heavy Attack DMG", section: "BASIC_ATTACK", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.112,0.1212,0.1304,0.1433,0.1525,0.163,0.1777,0.1924,0.2071,0.2227], hitCount: 5, conditional: false }),
  action({ factId: "sanhua-basic-attack-frigid-light-mid-air-attack-dmg", name: "Frigid Light — Mid-air Attack DMG", section: "BASIC_ATTACK", actionKind: "BASIC", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.434,0.4696,0.5052,0.555,0.5906,0.6316,0.6885,0.7454,0.8024,0.8629], hitCount: 1, conditional: false }),
  action({ factId: "sanhua-basic-attack-frigid-light-dodge-counter-dmg", name: "Frigid Light — Dodge Counter DMG", section: "BASIC_ATTACK", actionKind: "DODGE_COUNTER", damageClass: "BASIC", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.84,0.9089,0.9778,1.0742,1.1431,1.2223,1.3325,1.4427,1.553,1.6701], hitCount: 1, conditional: true }),
  action({ factId: "sanhua-resonance-skill-eternal-frost-skill-dmg", name: "Eternal Frost — Skill DMG", section: "RESONANCE_SKILL", actionKind: "SKILL", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1.81,1.9585,2.1069,2.3147,2.4631,2.6338,2.8713,3.1087,3.3462,3.5985], hitCount: 1, conditional: false }),
  action({ factId: "sanhua-resonance-liberation-glacial-gaze-skill-dmg", name: "Glacial Gaze — Skill DMG", section: "RESONANCE_LIBERATION", actionKind: "LIBERATION", damageClass: "LIBERATION", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [4.0716,4.4055,4.7394,5.2068,5.5407,5.9246,6.4588,6.993,7.5272,8.0948], hitCount: 1, conditional: false }),
  action({ factId: "sanhua-intro-skill-freezing-thorns-skill-dmg", name: "Freezing Thorns — Skill DMG", section: "INTRO_SKILL", actionKind: "INTRO", damageClass: "INTRO", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.7,0.7574,0.8148,0.8952,0.9526,1.0186,1.1105,1.2023,1.2941,1.3917], hitCount: 1, conditional: false }),
  action({ factId: "sanhua-forte-circuit-clarity-of-mind-detonate-damage", name: "Clarity of Mind — Detonate Damage", section: "FORTE_CIRCUIT", actionKind: "HEAVY", damageClass: "HEAVY", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.937,1.0139,1.0907,1.1983,1.2751,1.3635,1.4864,1.6093,1.7323,1.8629], hitCount: 2, conditional: true }),
  action({ factId: "sanhua-forte-circuit-clarity-of-mind-glacier-burst-damage", name: "Clarity of Mind — Glacier Burst Damage", section: "FORTE_CIRCUIT", actionKind: "FORTE", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.7,0.7574,0.8148,0.8952,0.9526,1.0186,1.1105,1.2023,1.2941,1.3917], hitCount: 1, conditional: true }),
  action({ factId: "sanhua-forte-circuit-clarity-of-mind-ice-prism-burst-damage", name: "Clarity of Mind — Ice Prism Burst Damage", section: "FORTE_CIRCUIT", actionKind: "FORTE", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.4,0.4328,0.4656,0.5116,0.5444,0.5821,0.6346,0.687,0.7395,0.7953], hitCount: 1, conditional: true }),
  action({ factId: "sanhua-forte-circuit-clarity-of-mind-ice-thorn-burst-damage", name: "Clarity of Mind — Ice Thorn Burst Damage", section: "FORTE_CIRCUIT", actionKind: "FORTE", damageClass: "SKILL", scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3,0.3246,0.3492,0.3837,0.4083,0.4366,0.4759,0.5153,0.5547,0.5965], hitCount: 1, conditional: true }),
] as const;

export const SANHUA_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: "sanhua-resource-clarity", name: "Clarity", section: "FORTE_CIRCUIT", conditional: false, resourceName: "Clarity", maxValue: 2, ruleSummary: "Clarity stacks up to 2. Basic Attack V, Intro and Resonance Skill grant 1; Resonance Liberation grants 2; Heavy Attack Detonate removes all Clarity. Each stack expands the Frostbite area." }),
] as const;

export const SANHUA_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: "sanhua-forte-frostbite-area", name: "Frostbite Area / Ice Burst", section: "FORTE_CIRCUIT", conditional: true, scope: "SELF", triggerSummary: "Holding Basic Attack moves the cursor; releasing in Frostbite casts Heavy Attack Detonate. Detonate explodes nearby Ice Thorn/Prism/Glacier; Ice Burst damage is Resonance Skill DMG.", effectSummary: "Heavy Attack Detonate / Ice Creation state rules.", durationSeconds: null, maxStacks: null, modelingStatus: "RAW_ONLY" }),
  passive({ factId: "sanhua-inherent-condensation", name: "Inherent Skill — Condensation", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Casting Intro Skill.", effectSummary: "Sanhua Resonance Skill damage is increased by 20% for 8s after casting Intro Skill.", durationSeconds: 8, maxStacks: null, modelingStatus: "RAW_ONLY" }),
  passive({ factId: "sanhua-inherent-avalanche", name: "Inherent Skill — Avalanche", section: "INHERENT_SKILL", conditional: true, scope: "SELF", triggerSummary: "Casting Basic Attack V.", effectSummary: "Sanhua Forte Circuit Ice Burst damage is increased by 20% for 8s after casting Basic Attack V.", durationSeconds: 8, maxStacks: null, modelingStatus: "RAW_ONLY" }),
  passive({ factId: "sanhua-outro-silversnow", name: "Outro Skill — Silversnow", section: "OUTRO_SKILL", conditional: true, scope: "NEXT_CHARACTER", triggerSummary: "Casting Outro Skill.", effectSummary: "The incoming character gains 38% Basic Attack DMG Deepen for 14s or until switched off field.", durationSeconds: 14, maxStacks: null, modelingStatus: "RAW_ONLY" }),
] as const;

export const SANHUA_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: "sanhua-s1-solitude-s-embrace", name: "S1 — Solitude's Embrace", section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: "Current S1 Resonance Chain condition.", effectSummary: "Basic Attack V increases Sanhua's Crit. Rate by 15% for 10s.\nSource raw numeric parameters (preserved in source order): 15%, 10" }),
  sequence({ factId: "sanhua-s2-snowy-clarity", name: "S2 — Snowy Clarity", section: 'RESONANCE_CHAIN', sequence: 2, conditional: true, triggerSummary: "Current S2 Resonance Chain condition.", effectSummary: "Stamina cost of Heavy Attack Detonate is reduced by 10. When Sanhua casts Resonance Skill Eternal Frost, her Anti-interruption is enhanced for 10s. Current Prydwen and Wuthering Waves Wiki agree on 10s; the pinned promotion artifact still carries a stale 5s parameter and is retained only as provenance discrepancy." }),
  sequence({ factId: "sanhua-s3-anomalous-vision", name: "S3 — Anomalous Vision", section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: "Current S3 Resonance Chain condition.", effectSummary: "Sanhua's damage dealt is increased by 35% against targets with HP below 70%.\nSource raw numeric parameters (preserved in source order): 70%, 35%" }),
  sequence({ factId: "sanhua-s4-blade-mastery", name: "S4 — Blade Mastery", section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: "Current S4 Resonance Chain condition.", effectSummary: "Resonance Liberation Glacial Gaze restores 10 Resonance Energy. \nDMG of the next Heavy Attack Detonate within 5s is increased by 120%.\nSource raw numeric parameters (preserved in source order): 10, 5, 120%" }),
  sequence({ factId: "sanhua-s5-unraveling-fate", name: "S5 — Unraveling Fate", section: 'RESONANCE_CHAIN', sequence: 5, conditional: true, triggerSummary: "Current S5 Resonance Chain condition.", effectSummary: "Crit. DMG of Forte Circuit Ice Burst is increased by 100%. Ice Creations (Ice Thorn, Ice Prism, and Glacier) will explode even if they are not detonated.\nSource raw numeric parameters (preserved in source order): 100%" }),
  sequence({ factId: "sanhua-s6-daybreak-radiance", name: "S6 — Daybreak Radiance", section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: "Current S6 Resonance Chain condition.", effectSummary: "After an Ice Prism or a Glacier is detonated, all team members' ATK is increased by 10% for 20s, stacking up to 2 times.\nSource raw numeric parameters (preserved in source order): 10%, 20, 2" }),
] as const;

export const SANHUA_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...SANHUA_ACTION_FACTS,
  ...SANHUA_RESOURCE_FACTS,
  ...SANHUA_PASSIVE_FACTS,
  ...SANHUA_SEQUENCE_FACTS,
] as const;
