import type {
  CharacterMechanicFact,
  CharacterMechanicsProfile,
} from '../characterMechanicsDomain.ts';
import { AALTO_CHARACTER_MECHANIC_FACTS } from './characterMechanics/aaltoRawFacts.ts';
import { AEMEATH_CHARACTER_MECHANIC_FACTS } from './characterMechanics/aemeathRawFacts.ts';
import { AUGUSTA_CHARACTER_ACTION_FACTS } from './characterMechanics/augustaActionFacts.ts';
import { AUGUSTA_NON_ACTION_MECHANIC_FACTS } from './characterMechanics/augustaRawFacts.ts';
import { BAIZHI_CHARACTER_MECHANIC_FACTS } from './characterMechanics/baizhiRawFacts.ts';

export { AUGUSTA_CHARACTER_ACTION_FACTS } from './characterMechanics/augustaActionFacts.ts';
export { BAIZHI_ACTION_FACTS } from './characterMechanics/baizhiRawFacts.ts';

export const CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...AUGUSTA_CHARACTER_ACTION_FACTS,
  ...AUGUSTA_NON_ACTION_MECHANIC_FACTS,
  ...AALTO_CHARACTER_MECHANIC_FACTS,
  ...AEMEATH_CHARACTER_MECHANIC_FACTS,
  ...BAIZHI_CHARACTER_MECHANIC_FACTS,
] as const;

export const CHARACTER_MECHANIC_FACT_BY_ID: ReadonlyMap<string, CharacterMechanicFact> = (() => {
  const map = new Map<string, CharacterMechanicFact>();
  for (const fact of CHARACTER_MECHANIC_FACTS) {
    if (map.has(fact.factId)) throw new Error(`Duplicate character mechanic fact: ${fact.factId}`);
    map.set(fact.factId, fact);
  }
  return map;
})();

export function getCharacterMechanicFact(factId: string): CharacterMechanicFact | null {
  return CHARACTER_MECHANIC_FACT_BY_ID.get(factId) ?? null;
}

export function getCharacterActionFact(factId: string) {
  const fact = getCharacterMechanicFact(factId);
  return fact?.kind === 'ACTION' ? fact : null;
}

/**
 * Raw mechanics coverage is independent from executable combat coverage.
 * Augusta's current live ACTION catalog is source-complete at Lv1-Lv10 while
 * the existing V9.15 Standard engine keeps its selected-level aggregate values
 * in a separate parity fixture. This prevents the historical combat oracle from
 * being mistaken for raw source data or forcing selected-level scalars into the
 * source-completeness audit.
 */
export const AUGUSTA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'augusta',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Full current Basic/Heavy/Mid-air/Dodge, Skill, Forte, Liberation and Intro action coverage carries exact Lv1-Lv10 source representations; non-damage state/Outro actions are explicit. The V9.15 Standard selected-level aggregates remain a separate parity fixture.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Prowess/Ascendancy/Majesty, Undying Sunlight gating and Sworn Allegiance rules are source-audited.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'S1-S6 raw text is verified; sequence effects remain RAW_ONLY until a sequence-aware combat adapter consumes them.' },
  ],
  factIds: CHARACTER_MECHANIC_FACTS.filter((fact) => fact.characterId === 'augusta').map((fact) => fact.factId),
  provenance: {
    sourceLabels: [
      'Wuthering Waves Wiki/Fandom — current Augusta combat tables',
      'Wuthering.gg — current Augusta kit',
      'Prydwen — current Augusta kit',
      'Index Game Center — current Augusta Lv10 endpoints',
      '鳴潮 Wiki* — current Augusta live endpoints',
      'Wutheringlab — current page retained as discrepancy evidence',
    ],
    sourceUrls: [
      'https://wutheringwaves.fandom.com/wiki/Augusta/Combat',
      'https://wuthering.gg/characters/augusta',
      'https://www.prydwen.gg/wuthering-waves/characters/augusta',
      'https://www.indexgame.in.th/en/guide/wutheringwavesuid/augusta',
      'https://wikiwiki.jp/w-w/%E3%82%AA%E3%83%BC%E3%82%AC%E3%82%B9%E3%82%BF',
      'https://wutheringlab.com/character/augusta-build/',
    ],
    checkedAt: '2026-08-26',
    notes: [
      'Source-level raw mechanics coverage is complete for the six required Character Mechanics areas.',
      'The current Fandom Everbright Protector Lv1 first-component cell conflicts with current Wuthering.gg/Japanese-wiki evidence; the independently corroborated 120.00% value is used and the conflicting 20.00% cell remains provenance evidence.',
      "Current Warrior's Blade source consensus is 110.00%*3 at Lv1, 218.70%*3 at Lv10 and 15s cooldown; current Japanese-wiki/Wutheringlab conflicting older cells remain provenance evidence rather than overriding the live consensus.",
      'Current Undying Sunlight: Plunge source structure is 43.55% + 391.95% at Lv1 through 86.59% + 779.24% at Lv10; stale split-component mirrors remain recorded rather than silently flattened into the same aggregate.',
      'MODEL_READY/MODELED/PENDING_INTERPRETATION remain independent from source VERIFIED coverage. Augusta Standard remains the existing narrow exact-parity combat fixture; this profile does not authorize broad DPS expansion.',
    ],
  },
};

export const AALTO_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'aalto',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Basic/Heavy/Mid-air/Dodge, Skill, Forte, Liberation and Intro damaging actions carry source-backed Lv1-Lv10 motion-value curves.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Mistcloak Dash, Mist Drop acquisition/consumption and Mist Missile generation are source-audited; executable dash cadence remains separate from raw coverage.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Perfect Performance and Mid-game Break are source-audited.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Dissolving Mist 23% Aero DMG Amplification / 14s / switch-out termination is source-audited.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Mist Drops max 6 and generation/consumption rules are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact S1-S6 raw mechanics are source-audited. Sequence execution remains a later sequence-aware combat concern.' },
  ],
  factIds: CHARACTER_MECHANIC_FACTS.filter((fact) => fact.characterId === 'aalto').map((fact) => fact.factId),
  provenance: {
    sourceLabels: ['Wuthering.wiki — Aalto raw skill data', 'Prydwen — current Aalto kit', 'Wutheringlab — current Aalto kit'],
    sourceUrls: [
      'https://wuthering.wiki/character_1403.html',
      'https://www.prydwen.gg/wuthering-waves/characters/aalto',
      'https://wutheringlab.com/character/aalto-build/',
    ],
    checkedAt: '2026-08-26',
    notes: [
      'Source-level raw mechanics coverage is complete for the six required Character Mechanics areas.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION statuses remain distinct from source verification; VERIFIED profile coverage does not claim an Aalto rotation/DPS adapter exists.',
    ],
  },
};

export const AEMEATH_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'aemeath',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Aemeath/Mech Basic, Heavy, Mid-air, Dodge, Sync Strike, Liberation, Seraphic Duet, Tune-AMP response and Intro actions carry exact Lv1-Lv10 source representations. Mixed-hit expressions remain explicit components.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Seraphic Duo/Duet, Resonance Mode trails, Tune Rupture/Fusion Burst response state, Starflux and Tune-AMP coefficients are source-audited; encounter timing remains separate.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Before All Sounds and Between the Stars are source-audited without assuming state uptime or team triggers.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Silent Protection team amplification and 20-second duration are source-audited; qualifying 20% branch remains conditional.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Synchronization Rate 200, Resonance Rate 4 and Starflux 600 caps plus current gain/consumption rules are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'S1-S6 raw mechanics are source-audited against the current raw-data/multi-source consensus; conflicting secondary wording remains provenance evidence rather than executable guesswork.' },
  ],
  factIds: CHARACTER_MECHANIC_FACTS.filter((fact) => fact.characterId === 'aemeath').map((fact) => fact.factId),
  provenance: {
    sourceLabels: [
      'Prydwen — current Aemeath kit',
      'Wutheringlab — current Aemeath kit/multiplier tables',
      'WuWaBuilds — current Aemeath kit/multiplier tables',
      'Wuthering Waves Wiki/Fandom — current Aemeath combat tables',
      'WutheringDB — current raw-data mirror',
    ],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/characters/aemeath',
      'https://wutheringlab.com/character/aemeath-build/',
      'https://wuwa.build/characters/1210',
      'https://wutheringwaves.fandom.com/wiki/Aemeath/Combat',
      'https://wutheringdb.com/zh/characters/aemeath',
    ],
    checkedAt: '2026-08-26',
    notes: [
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas.',
      'WWPlus malformed/repeated table cells, stale Synchronization tooltip ordering and the current Seraphic Duet Overture/Encore label disagreement remain provenance discrepancies rather than guessed executable truth.',
      'S6 max-trail-limit combat-state wording conflicts across current secondary sources; the current WutheringDB raw-data mirror plus WuWaBuilds/PlayAware/Wuthering.gg in-combat consensus is used while Wutheringlab/WutheringTools out-of-combat wording remains explicit provenance evidence.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Aemeath build, rotation or DPS adapter is implied by this profile.',
    ],
  },
};

export const BAIZHI_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'baizhi',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Destined Promise Basic/Heavy/Mid-air/Dodge, Emergency Plan, Remnant Entities and Intro damage carry exact current Lv1-Lv10 source curves with source-backed scaling and hit counts.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: "You'tan shared-stat behavior, Concentration gain/max/consume rules, healing cadence and source-listed recovery values are audited; unresolved per-stack versus per-cast execution of the base recovery table remains PENDING_INTERPRETATION rather than guessed." },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Harmonic Range/Euphonia and Stimulus Feedback are source-audited.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Rejuvinating Flow 1.54% Max-HP healing every 3s for 30s plus 15% DMG Amplification for 6s is source-audited; refresh timing remains executable state.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Concentration max 4, +1 per Basic Attack hit and all-stack consumption by Heavy Attack/Emergency Plan are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; sequence execution remains separate from raw coverage.' },
  ],
  factIds: CHARACTER_MECHANIC_FACTS.filter((fact) => fact.characterId === 'baizhi').map((fact) => fact.factId),
  provenance: {
    sourceLabels: [
      'wuwabuild normalized Character snapshot — pinned source candidate',
      'Wuthering.gg — current Baizhi kit',
      'Prydwen — current Baizhi kit',
      'Wuthering Waves Wiki/Fandom — current Baizhi skill tables/scaling',
      '鸣潮WIKI/Bilibili — current Baizhi full skill tables',
      'Wuthering.wiki — raw damage-data mirror for scaling/type/discrepancy evidence',
    ],
    sourceUrls: [
      'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json',
      'https://wuthering.gg/characters/baizhi',
      'https://www.prydwen.gg/wuthering-waves/characters/baizhi',
      'https://wutheringwaves.fandom.com/wiki/Emergency_Plan',
      'https://wutheringwaves.fandom.com/wiki/Momentary_Union',
      'https://wiki.biligame.com/wutheringwaves/%E5%85%B1%E9%B8%A3%E8%80%85/%E7%99%BD%E8%8A%B7',
      'https://wuthering.wiki/character_1103.html',
    ],
    checkedAt: '2026-08-27',
    notes: [
      'PR #61 candidate extraction removed transcription work but did not count as verification; this profile was promoted only after current source/semantic review.',
      'Emergency Plan and Remnant Entities are source-backed HP-scaling damage, while Destined Promise and Overflowing Frost damage are ATK-scaling. Remnant Entities is simultaneously a coordinated attack and raw Type=LIBERATION.',
      'Current displayed healing values and the raw damage-data mirror differ by 0.01 percentage point at several Lv10 backend/display cells (Emergency Plan 5.76 vs 5.77, Intro 0.75 vs 0.76, Concentration 0.31 vs 0.32). Bellibing keeps the current displayed multi-source values and records the backend precision discrepancy instead of guessing a silent correction.',
      'Healing tables remain raw utility summaries because the current Character Mechanics domain has an exact typed Lv1-Lv10 contract for damage motion values but no fake reuse of damage fields for healing. This does not imply healing uptime or a healer combat adapter.',
      'Broad DPS remains blocked by the rest of roster-wide Character Mechanics coverage.',
    ],
  },
};

export const CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  AUGUSTA_CHARACTER_MECHANICS_PROFILE,
  AALTO_CHARACTER_MECHANICS_PROFILE,
  AEMEATH_CHARACTER_MECHANICS_PROFILE,
  BAIZHI_CHARACTER_MECHANICS_PROFILE,
] as const;

export const CHARACTER_MECHANICS_PROFILE_BY_ID: ReadonlyMap<string, CharacterMechanicsProfile> = (() => {
  const map = new Map<string, CharacterMechanicsProfile>();
  for (const profile of CHARACTER_MECHANICS_PROFILES) {
    if (map.has(profile.characterId)) throw new Error(`Duplicate character mechanics profile: ${profile.characterId}`);
    for (const factId of profile.factIds) {
      const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
      if (!fact) throw new Error(`${profile.characterId} references unknown mechanic fact ${factId}`);
      if (fact.characterId !== profile.characterId) throw new Error(`${profile.characterId} references mechanic fact owned by ${fact.characterId}: ${factId}`);
    }
    map.set(profile.characterId, profile);
  }
  return map;
})();

export function getCharacterMechanicsProfile(characterId: string): CharacterMechanicsProfile | null {
  return CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId) ?? null;
}
