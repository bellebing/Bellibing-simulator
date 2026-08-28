import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-28';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const PRYDWEN = 'https://www.prydwen.gg/wuthering-waves/characters/camellya';
const WUTHERING_GG = 'https://wuthering.gg/characters/camellya';
const WUTHERING_WIKI = 'https://wuthering.wiki/character_1603.html';

export const CAMELLYA_PROVENANCE = {
  sourceLabels: [
    'wuwabuild normalized Character snapshot — exact pinned upstream commit',
    'Prydwen — current Camellya kit cross-check',
    'Wuthering.gg — current Camellya kit and Tune Break entry',
    'Wuthering.wiki — current multiplier tables and damage-data type/scaling cross-check',
  ],
  sourceUrls: [SOURCE_SNAPSHOT, PRYDWEN, WUTHERING_GG, WUTHERING_WIKI],
  checkedAt: CHECKED_AT,
  notes: [
    'The pinned PR #66/#68 promotion-review pipeline supplies exact Lv1-Lv10 transcription structures; current Prydwen, Wuthering.gg and Wuthering.wiki were used for semantic verification.',
    'All canonical Character-owned Camellya damage is ATK-scaling. Blossom-mode replacements, Crimson Blossom, Floral Ravage and Ephemeral are Basic Attack DMG where the current kit states so.',
    'Heavy Attack Pruning is an underlying Heavy Attack table entry, but current Inherent Skill Seedbed explicitly changes its dealt damage to Basic Attack DMG; Bellibing keeps that distinction as provenance rather than ignoring the Inherent.',
    'Twining base damage and its post-Ephemeral additional damage are separate source-fixed Outro facts because their activation semantics differ; S5 multiplier changes remain sequence semantics instead of rewriting the base source-fixed facts.',
    'Crimson Pistils, Crimson Buds, Blossom Mode and Budding Mode/Sweet Dream remain raw state/resource semantics. No rotation uptime, automatic bud count or Concerto timing is assumed.',
    'Generated candidates remained CANDIDATE_ONLY / NOT_VERIFIED until this semantic/source review; no generated candidate status was promoted automatically.',
  ],
} as const;

const CURVE_CONTEXT = 'Exact pinned current-source Lv1-Lv10 coefficient representation, source-audited for action identity, damage bucket and scaling; no skill level is implicitly selected by raw data.';
const FIXED_CONTEXT = 'Current source-fixed Character damage coefficient declared directly in kit text; not a selected talent-level scalar and not a fabricated Lv1-Lv10 curve.';

function action(input: Omit<CharacterActionFact, 'characterId' | 'kind' | 'actionRole' | 'verificationStatus' | 'modelingStatus' | 'provenance' | 'motionValue'>): CharacterActionFact {
  return { ...input, characterId: 'camellya', kind: 'ACTION', actionRole: 'DAMAGE', verificationStatus: 'VERIFIED', modelingStatus: 'MODEL_READY', motionValue: null, provenance: CAMELLYA_PROVENANCE };
}
function passive(input: Omit<CharacterPassiveFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'> & { modelingStatus?: CharacterPassiveFact['modelingStatus'] }): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return { ...rest, characterId: 'camellya', kind: 'PASSIVE', verificationStatus: 'VERIFIED', modelingStatus, provenance: CAMELLYA_PROVENANCE };
}
function resource(input: Omit<CharacterResourceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterResourceFact {
  return { ...input, characterId: 'camellya', kind: 'RESOURCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: CAMELLYA_PROVENANCE };
}
function sequence(input: Omit<CharacterSequenceFact, 'characterId' | 'kind' | 'verificationStatus' | 'modelingStatus' | 'provenance'>): CharacterSequenceFact {
  return { ...input, characterId: 'camellya', kind: 'SEQUENCE', verificationStatus: 'VERIFIED', modelingStatus: 'RAW_ONLY', provenance: CAMELLYA_PROVENANCE };
}

export const CAMELLYA_ACTION_FACTS: readonly CharacterActionFact[] = [
  action({ factId: 'camellya-basic-attack-burgeoning-basic-attack-1-dmg', name: 'Burgeoning — Basic Attack 1', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.3145, 0.3403, 0.3661, 0.4022, 0.428, 0.4577, 0.4989, 0.5402, 0.5815, 0.6253], hitCount: 1, conditional: false }),
  action({ factId: 'camellya-basic-attack-burgeoning-basic-attack-2-dmg', name: 'Burgeoning — Basic Attack 2', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2338, 0.253, 0.2721, 0.299, 0.3181, 0.3402, 0.3708, 0.4015, 0.4322, 0.4648], hitCount: 2, conditional: false }),
  action({ factId: 'camellya-basic-attack-burgeoning-basic-attack-3-dmg', name: 'Burgeoning — Basic Attack 3', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.255, 0.2759, 0.2968, 0.3261, 0.347, 0.3711, 0.4045, 0.438, 0.4714, 0.507], hitCount: 3, conditional: false }),
  action({ factId: 'camellya-basic-attack-burgeoning-basic-attack-4-dmg', name: 'Burgeoning — Basic Attack 4', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1242, 0.1344, 0.1446, 0.1589, 0.1691, 0.1808, 0.1971, 0.2134, 0.2297, 0.247], hitCount: 20, conditional: false }),
  action({ factId: 'camellya-basic-attack-burgeoning-basic-attack-5-dmg', name: 'Burgeoning — Basic Attack 5', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2423, 0.2622, 0.282, 0.3098, 0.3297, 0.3525, 0.3843, 0.4161, 0.4479, 0.4817], hitCount: 4, conditional: false }),
  action({ factId: 'camellya-basic-attack-burgeoning-heavy-attack-dmg', name: 'Burgeoning — Heavy Attack', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.4433, 0.4797, 0.516, 0.5669, 0.6033, 0.6451, 0.7032, 0.7614, 0.8196, 0.8814], hitCount: 3, conditional: false, notes: ['Seedbed explicitly changes Heavy Attack Pruning damage to Basic Attack DMG; the raw damage table retains the underlying Heavy entry as provenance.'] }),
  action({ factId: 'camellya-basic-attack-burgeoning-mid-air-attack-dmg', name: 'Burgeoning — Mid-air Attack', section: 'BASIC_ATTACK', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.33, 0.3571, 0.3842, 0.4221, 0.4491, 0.4802, 0.5235, 0.5668, 0.6101, 0.6561], hitCount: 2, conditional: false }),
  action({ factId: 'camellya-basic-attack-burgeoning-dodge-counter-dmg', name: 'Burgeoning — Dodge Counter', section: 'BASIC_ATTACK', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.5, 0.541, 0.582, 0.6394, 0.6804, 0.7275, 0.7931, 0.8587, 0.9243, 0.994], hitCount: 3, conditional: false }),
  action({ factId: 'camellya-resonance-skill-valse-of-bloom-and-blight-crimson-blossom-dmg', name: 'Valse of Bloom and Blight — Crimson Blossom', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.5715, 0.6184, 0.6653, 0.7309, 0.7777, 0.8316, 0.9066, 0.9816, 1.0566, 1.1362], hitCount: 2, conditional: false, notes: ['Current kit text and current damage data classify this Blossom-mode action as Basic Attack DMG.'] }),
  action({ factId: 'camellya-resonance-skill-valse-of-bloom-and-blight-vining-waltz-1-dmg', name: 'Valse of Bloom and Blight — Vining Waltz 1', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.4845, 0.5243, 0.564, 0.6196, 0.6594, 0.705, 0.7686, 0.8322, 0.8957, 0.9633], hitCount: 1, conditional: false, notes: ['Current kit text and current damage data classify this Blossom-mode action as Basic Attack DMG.'] }),
  action({ factId: 'camellya-resonance-skill-valse-of-bloom-and-blight-vining-waltz-2-dmg', name: 'Valse of Bloom and Blight — Vining Waltz 2', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2295, 0.2484, 0.2672, 0.2935, 0.3124, 0.334, 0.3641, 0.3942, 0.4243, 0.4563], hitCount: 2, conditional: false, notes: ['Current kit text and current damage data classify this Blossom-mode action as Basic Attack DMG.'] }),
  action({ factId: 'camellya-resonance-skill-valse-of-bloom-and-blight-vining-waltz-3-dmg', name: 'Valse of Bloom and Blight — Vining Waltz 3', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1104, 0.1195, 0.1286, 0.1412, 0.1503, 0.1607, 0.1752, 0.1897, 0.2041, 0.2195], hitCount: 6, conditional: false, notes: ['Current kit text and current damage data classify this Blossom-mode action as Basic Attack DMG.'] }),
  action({ factId: 'camellya-resonance-skill-valse-of-bloom-and-blight-vining-waltz-4-dmg', name: 'Valse of Bloom and Blight — Vining Waltz 4', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.34, 0.3679, 0.3958, 0.4348, 0.4627, 0.4947, 0.5393, 0.5839, 0.6285, 0.6759], hitCount: 3, conditional: false, notes: ['Current kit text and current damage data classify this Blossom-mode action as Basic Attack DMG.'] }),
  action({ factId: 'camellya-resonance-skill-valse-of-bloom-and-blight-floral-ravage-dmg', name: 'Valse of Bloom and Blight — Floral Ravage', section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2646, 0.2863, 0.308, 0.3384, 0.3601, 0.3851, 0.4198, 0.4545, 0.4892, 0.5261], hitCount: 5, conditional: false, notes: ['Current kit text and current damage data classify this Blossom-mode action as Basic Attack DMG.'] }),
  action({ factId: 'camellya-resonance-skill-valse-of-bloom-and-blight-vining-ronde-dmg', name: 'Valse of Bloom and Blight — Vining Ronde', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.2664, 0.2882, 0.31, 0.3406, 0.3624, 0.3876, 0.4225, 0.4574, 0.4924, 0.5295], hitCount: 3, conditional: false, notes: ['Current kit text and current damage data classify this Blossom-mode action as Basic Attack DMG.'] }),
  action({ factId: 'camellya-resonance-skill-valse-of-bloom-and-blight-atonement-dmg', name: 'Valse of Bloom and Blight — Atonement', section: 'RESONANCE_SKILL', actionKind: 'DODGE_COUNTER', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.57, 0.6168, 0.6635, 0.729, 0.7757, 0.8295, 0.9042, 0.979, 1.0538, 1.1333], hitCount: 2, conditional: false, notes: ['Current kit text and current damage data classify this Blossom-mode action as Basic Attack DMG.'] }),
  action({ factId: 'camellya-resonance-skill-valse-of-bloom-and-blight-blazing-waltz-dmg', name: 'Valse of Bloom and Blight — Blazing Waltz', section: 'RESONANCE_SKILL', actionKind: 'BASIC', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [0.1104, 0.1195, 0.1286, 0.1412, 0.1503, 0.1607, 0.1752, 0.1897, 0.2041, 0.2195], hitCount: 19, conditional: false, notes: ['Current kit text and current damage data classify this Blossom-mode action as Basic Attack DMG.'] }),
  action({ factId: 'camellya-resonance-liberation-fervor-efflorescent-skill-dmg', name: 'Fervor Efflorescent — Skill', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'LIBERATION', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [6.05, 6.5461, 7.0422, 7.7368, 8.2329, 8.8034, 9.5972, 10.3909, 11.1847, 12.0281], hitCount: 1, conditional: false }),
  action({ factId: 'camellya-intro-skill-everblooming-skill-dmg', name: 'Everblooming — Skill', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [1, 1.082, 1.164, 1.2788, 1.3608, 1.4551, 1.5863, 1.7175, 1.8487, 1.9881], hitCount: 1, conditional: false }),
  action({ factId: 'camellya-forte-circuit-vegetative-universe-ephemeral-dmg', name: 'Vegetative Universe — Ephemeral', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'BASIC', scalingStat: 'ATK', motionValueContext: CURVE_CONTEXT, motionValueCurve: [6.35, 6.8707, 7.3914, 8.1204, 8.6411, 9.2399, 10.0731, 10.9062, 11.7393, 12.6245], hitCount: 1, conditional: false, notes: ['Ephemeral is Forte-owned but explicitly considered Basic Attack DMG.'] }),
  action({ factId: 'camellya-outro-twining-base', name: 'Outro Skill — Twining', section: 'OUTRO_SKILL', actionKind: 'OUTRO', damageClass: 'OUTRO', scalingStat: 'ATK', motionValueContext: FIXED_CONTEXT, sourceFixedMotionValue: 3.2924, hitCount: 1, conditional: false }),
  action({ factId: 'camellya-outro-twining-post-ephemeral', name: 'Outro Skill — Twining additional post-Ephemeral damage', section: 'OUTRO_SKILL', actionKind: 'OUTRO', damageClass: 'OUTRO', scalingStat: 'ATK', motionValueContext: FIXED_CONTEXT, sourceFixedMotionValue: 4.5902, hitCount: 1, conditional: true, notes: ['Only the next Twining after activating Ephemeral gains this additional source-fixed damage instance.'] }),
] as const;

export const CAMELLYA_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({ factId: 'camellya-resource-crimson-pistils', name: 'Crimson Pistils', section: 'FORTE_CIRCUIT', conditional: false, resourceName: 'Crimson Pistils', maxValue: 100, ruleSummary: 'Camellya can hold up to 100 Crimson Pistils. Intro Skill Everblooming and activating Ephemeral each recover 100. The listed normal/Blossom-mode attacks consume Crimson Pistils; consuming 10 recovers 4 Concerto Energy and grants 1 Crimson Bud.' }),
  resource({ factId: 'camellya-resource-crimson-buds', name: 'Crimson Buds', section: 'FORTE_CIRCUIT', conditional: true, resourceName: 'Crimson Buds', maxValue: 10, ruleSummary: 'Each Crimson Bud lasts 15s and stacks up to 10. Ephemeral consumes all Crimson Buds. Buds cannot be gained while Camellya is in Budding Mode.' }),
] as const;

export const CAMELLYA_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({ factId: 'camellya-skill-blossom-mode', name: 'Resonance Skill — Blossom Mode', section: 'RESONANCE_SKILL', conditional: true, scope: 'SELF', triggerSummary: 'Camellya casts Crimson Blossom.', effectSummary: 'Basic Attack/Pruning are replaced by Vining Waltz; Dodge Counter becomes Atonement; Resonance Skill becomes Floral Ravage; Jump becomes Vining Ronde. Blossom Mode ends after Floral Ravage, Levitator use or Vining Ronde, while suspended actions consume STA as stated by the source.', durationSeconds: null, maxStacks: null }),
  passive({ factId: 'camellya-forte-budding-mode', name: 'Forte Circuit — Budding Mode / Sweet Dream', section: 'FORTE_CIRCUIT', conditional: true, scope: 'SELF', triggerSummary: 'Camellya casts Ephemeral.', effectSummary: 'Sweet Dream increases the listed normal/Blossom-mode action DMG multipliers by 50%. Each Crimson Bud consumed by Ephemeral adds 5% to Sweet Dream, up to an additional 50%. In Budding Mode Camellya cannot gain Crimson Buds and the listed actions have their Energy Regen Multiplier reduced to 0%. Budding Mode ends when Camellya switches off field or all Crimson Pistils are consumed.', durationSeconds: 15, maxStacks: null, modelingStatus: 'PENDING_INTERPRETATION' }),
  passive({ factId: 'camellya-inherent-seedbed', name: 'Inherent Skill — Seedbed', section: 'INHERENT_SKILL', conditional: false, scope: 'SELF', triggerSummary: 'Passive Inherent Skill.', effectSummary: 'Gain 15% Havoc DMG Bonus. Damage dealt by Heavy Attack Pruning is considered Basic Attack DMG.', durationSeconds: null, maxStacks: null }),
  passive({ factId: 'camellya-inherent-epiphyte', name: 'Inherent Skill — Epiphyte', section: 'INHERENT_SKILL', conditional: false, scope: 'SELF', triggerSummary: 'Passive Inherent Skill.', effectSummary: 'Gain 15% Basic Attack DMG Bonus and increased interruption resistance while casting Basic Attack, Vining Waltz and Blazing Waltz.', durationSeconds: null, maxStacks: null }),
] as const;

export const CAMELLYA_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({ factId: 'camellya-s1-somewhere-no-one-travelled', name: 'S1 — Somewhere No One Travelled', section: 'RESONANCE_CHAIN', sequence: 1, conditional: true, triggerSummary: 'Cast Intro Skill Everblooming / cast Ephemeral.', effectSummary: 'Everblooming increases Camellya Crit DMG by 28% for 18s, triggerable once every 25s. Camellya is immune to interruptions while casting Ephemeral.' }),
  sequence({ factId: 'camellya-s2-calling-upon-the-silent-rose', name: 'S2 — Calling Upon the Silent Rose', section: 'RESONANCE_CHAIN', sequence: 2, conditional: false, triggerSummary: 'Sequence enabled.', effectSummary: 'The DMG Multiplier of Ephemeral is increased by 120%.' }),
  sequence({ factId: 'camellya-s3-a-bud-adorned-by-thorns', name: 'S3 — A Bud Adorned by Thorns', section: 'RESONANCE_CHAIN', sequence: 3, conditional: true, triggerSummary: 'Sequence enabled / Budding Mode active.', effectSummary: 'Fervor Efflorescent DMG Multiplier is increased by 50%. While in Budding Mode, Camellya ATK is increased by 58%.' }),
  sequence({ factId: 'camellya-s4-roots-set-deep-in-eternity', name: 'S4 — Roots Set Deep In Eternity', section: 'RESONANCE_CHAIN', sequence: 4, conditional: true, triggerSummary: 'Cast Everblooming.', effectSummary: 'All team members gain 25% Basic Attack DMG Bonus for 30s.' }),
  sequence({ factId: 'camellya-s5-infinity-held-in-your-palm', name: 'S5 — Infinity Held in Your Palm', section: 'RESONANCE_CHAIN', sequence: 5, conditional: false, triggerSummary: 'Sequence enabled.', effectSummary: 'Everblooming DMG Multiplier is increased by 303% and Twining DMG Multiplier is increased by 68%.' }),
  sequence({ factId: 'camellya-s6-bloom-for-you-thousand-times-over', name: 'S6 — Bloom For You Thousand Times Over', section: 'RESONANCE_CHAIN', sequence: 6, conditional: true, triggerSummary: 'Sequence enabled; Perennial requires the source-stated post-Ephemeral/full-Concerto window.', effectSummary: 'Sweet Dream DMG Multiplier is additionally increased by 150%. Within 15s after Ephemeral, when Concerto Energy is full and Perennial is off cooldown, Resonance Skill becomes Perennial. Perennial consumes 50 Concerto Energy, recovers 50 Crimson Pistils and deals Havoc DMG equal to 100% of Ephemeral DMG, considered Basic Attack DMG; it can be cast once every 25s. It enters Budding Mode, removes all Crimson Buds, raises Sweet Dream bonus DMG Multiplier to 250%, and grants interruption immunity while casting.', notes: ['The 100%-of-Ephemeral relationship remains sequence/raw proportional semantics; no fabricated standalone Lv1-Lv10 Perennial curve is added.'] }),
] as const;

export const CAMELLYA_CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...CAMELLYA_ACTION_FACTS,
  ...CAMELLYA_RESOURCE_FACTS,
  ...CAMELLYA_PASSIVE_FACTS,
  ...CAMELLYA_SEQUENCE_FACTS,
] as const;
