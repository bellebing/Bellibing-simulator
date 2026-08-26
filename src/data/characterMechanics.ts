import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterMechanicsProfile,
} from '../characterMechanicsDomain.ts';
import { AALTO_CHARACTER_MECHANIC_FACTS } from './characterMechanics/aaltoRawFacts.ts';
import { AEMEATH_CHARACTER_MECHANIC_FACTS } from './characterMechanics/aemeathRawFacts.ts';
import { AUGUSTA_NON_ACTION_MECHANIC_FACTS } from './characterMechanics/augustaRawFacts.ts';

const CHECKED_AT = '2026-08-25';
const AUGUSTA_VALUE_CONTEXT = 'V9.15 Augusta Standard Lv90/S0/10-10-10-10-10 exact-parity fixture';

function augustaAction(
  input: Omit<
    CharacterActionFact,
    | 'characterId'
    | 'kind'
    | 'verificationStatus'
    | 'modelingStatus'
    | 'provenance'
  >,
): CharacterActionFact {
  return {
    ...input,
    characterId: 'augusta',
    kind: 'ACTION',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODELED',
    provenance: {
      sourceLabels: ['V9.15 Augusta Standard', 'Bellibing exact Augusta parity regressions'],
      checkedAt: CHECKED_AT,
      notes: [
        'Lv90/S0 with all five relevant skill levels at 10 is the active spreadsheet-oracle context.',
        'These values are migrated from the exact-parity model; they are not inferred from a Lv1 public multiplier table.',
      ],
    },
  };
}

/**
 * Exact S0 Standard-rotation action facts. Repeated rotation steps reuse these
 * records. Full-kit action/multiplier-curve ingestion is tracked separately by
 * the mechanics coverage profile below and must not be implied by this subset.
 */
export const AUGUSTA_CHARACTER_ACTION_FACTS: readonly CharacterActionFact[] = [
  augustaAction({ factId: 'augusta-intro-stride-of-goldenflare', name: 'Intro Skill — Stride of Goldenflare', section: 'INTRO_SKILL', actionKind: 'INTRO', actionRole: 'DAMAGE', damageClass: 'INTRO', scalingStat: 'ATK', motionValue: 1.9882, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-heavy-thunderoar-backstep', name: 'Heavy Attack — Thunderoar: Backstep', section: 'BASIC_ATTACK', actionKind: 'HEAVY', actionRole: 'DAMAGE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 0.5368, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-heavy-thunderoar-spinslash', name: 'Heavy Attack — Thunderoar: Spinslash', section: 'BASIC_ATTACK', actionKind: 'HEAVY', actionRole: 'DAMAGE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 4.2516, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-skill-warriors-blade', name: "Resonance Skill — Warrior's Blade", section: 'RESONANCE_SKILL', actionKind: 'SKILL', actionRole: 'DAMAGE', damageClass: 'SKILL', scalingStat: 'ATK', motionValue: 6.561, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-liberation-sword-of-eternal-oath', name: 'Resonance Liberation — Sword of Eternal Oath', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', actionRole: 'DAMAGE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 10.9948, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false, notes: ['Kit section is Resonance Liberation while the game classifies its damage as Heavy Attack DMG.'] }),
  augustaAction({ factId: 'augusta-forte-undying-sunlight-strike', name: 'Forte Skill — Undying Sunlight: Strike', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', actionRole: 'DAMAGE', damageClass: 'SKILL', scalingStat: 'ATK', motionValue: 2.7834, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-forte-undying-sunlight-leap', name: 'Forte Skill — Undying Sunlight: Leap', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', actionRole: 'DAMAGE', damageClass: 'SKILL', scalingStat: 'ATK', motionValue: 2.7835, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-forte-undying-sunlight-plunge', name: 'Forte Skill — Undying Sunlight: Plunge', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', actionRole: 'DAMAGE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 8.6583, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-liberation-sublime-is-the-sun-state', name: 'Resonance Liberation — Sublime is the Sun', section: 'RESONANCE_LIBERATION', actionKind: 'STATE_CHANGE', actionRole: 'NON_DAMAGE', damageClass: null, scalingStat: 'UNKNOWN', motionValue: null, motionValueContext: null, hitCount: null, conditional: false, notes: ['Non-damaging state/setup action in the exact-parity rotation.'] }),
  augustaAction({ factId: 'augusta-liberation-sunborne', name: 'Sublime is the Sun — Sunborne', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', actionRole: 'DAMAGE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 10.7361, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: true, notes: ['Available during Sworn Allegiance and classified as Heavy Attack DMG.'] }),
  augustaAction({ factId: 'augusta-liberation-everbright-protector', name: 'Sublime is the Sun — Everbright Protector', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', actionRole: 'DAMAGE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 11.9293, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: true, notes: ['Available during Sworn Allegiance and classified as Heavy Attack DMG.'] }),
  augustaAction({ factId: 'augusta-outro-battlesong-of-the-unyielding', name: 'Outro — Battlesong of the Unyielding', section: 'OUTRO_SKILL', actionKind: 'OUTRO', actionRole: 'NON_DAMAGE', damageClass: null, scalingStat: 'UNKNOWN', motionValue: null, motionValueContext: null, hitCount: null, conditional: false, notes: ['The team-facing Outro effect is owned by a separate verified passive fact.'] }),
] as const;

export const CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...AUGUSTA_CHARACTER_ACTION_FACTS,
  ...AUGUSTA_NON_ACTION_MECHANIC_FACTS,
  ...AALTO_CHARACTER_MECHANIC_FACTS,
  ...AEMEATH_CHARACTER_MECHANIC_FACTS,
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

export function getCharacterActionFact(factId: string): CharacterActionFact | null {
  const fact = getCharacterMechanicFact(factId);
  return fact?.kind === 'ACTION' ? fact : null;
}

/**
 * Raw mechanics coverage is intentionally independent from executable combat
 * coverage. Non-action S0/S1-S6 mechanics are now source-audited; full action
 * coverage still needs the remaining non-standard actions and source-level
 * multiplier curves before the Character Raw gate can call Augusta complete.
 */
export const AUGUSTA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'augusta',
  verificationStatus: 'PARTIALLY_VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'PARTIAL', notes: 'Exact S0 Standard Lv10 action set is verified. Full-kit non-rotation actions and their skill-level multiplier curves are still pending raw ingestion.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Prowess/Ascendancy/Majesty, Undying Sunlight gating and Sworn Allegiance rules are source-audited.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'S1-S6 raw text is verified; sequence effects remain RAW_ONLY until a sequence-aware combat adapter consumes them.' },
  ],
  factIds: CHARACTER_MECHANIC_FACTS.filter((fact) => fact.characterId === 'augusta').map((fact) => fact.factId),
  provenance: {
    sourceLabels: ['V9.15 Augusta Standard', 'Prydwen — current Augusta kit', 'Wutheringlab — current Augusta kit'],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/characters/augusta',
      'https://wutheringlab.com/character/augusta-build/',
    ],
    checkedAt: CHECKED_AT,
    notes: ['Raw resource/passive/Outro/S1-S6 coverage is complete. ACTIONS remains partial until complete current skill-level multiplier coverage is ingested without mixing Lv1 public tables into the Lv10 parity fixture.'],
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

export const CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  AUGUSTA_CHARACTER_MECHANICS_PROFILE,
  AALTO_CHARACTER_MECHANICS_PROFILE,
  AEMEATH_CHARACTER_MECHANICS_PROFILE,
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
