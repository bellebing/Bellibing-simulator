import type {
  CharacterBuildPreset,
  EchoLoadoutProfile,
  RotationProfile,
  StatTargetProfile,
  TeamProfile,
  WeaponRecommendationProfile,
} from '../profileDomain.ts';

const CHECKED_AT = '2026-08-29';

function source(characterId: string, label: string, notes: readonly string[] = []) {
  return {
    sourceLabels: [label],
    sourceUrls: [`https://www.prydwen.gg/wuthering-waves/characters/${characterId}`],
    checkedAt: CHECKED_AT,
    notes,
  } as const;
}

const SOURCES = {
  aemeath: source('aemeath', 'Prydwen Aemeath build'),
  camellya: source('camellya', 'Prydwen Camellya build'),
  galbrena: source('galbrena', 'Prydwen Galbrena build'),
  hiyuki: source('hiyuki', 'Prydwen Hiyuki build'),
  jinhsi: source('jinhsi', 'Prydwen Jinhsi build'),
  luuk: source('luuk-herssen', 'Prydwen Luuk Herssen build'),
  lynae: source('lynae', 'Prydwen Lynae build'),
  sigrika: source('sigrika', 'Prydwen Sigrika build'),
  xuanling: source('yangyang-xuanling', 'Prydwen Yangyang (Xuanling) build'),
  zani: source('zani', 'Prydwen Zani build'),
} as const;

export const PROFILE_SOURCE_BATCH_20260829_WEAPONS: readonly WeaponRecommendationProfile[] = [
  { kind: 'WEAPON_RECOMMENDATION', id: 'aemeath-standard-weapons', name: 'Aemeath — Standard Weapons', characterId: 'aemeath', defaultWeaponId: 'everbright-polestar', verificationStatus: 'VERIFIED', provenance: SOURCES.aemeath, options: [{ weaponId: 'everbright-polestar', rank: 1, label: 'Signature / current reference', relativePerformance: 1 }] },
  { kind: 'WEAPON_RECOMMENDATION', id: 'camellya-standard-weapons', name: 'Camellya — Standard Weapons', characterId: 'camellya', defaultWeaponId: 'red-spring', verificationStatus: 'VERIFIED', provenance: SOURCES.camellya, options: [{ weaponId: 'red-spring', rank: 1, label: 'Signature / current reference', relativePerformance: 1 }] },
  { kind: 'WEAPON_RECOMMENDATION', id: 'galbrena-standard-weapons', name: 'Galbrena — Standard Weapons', characterId: 'galbrena', defaultWeaponId: 'lux-and-umbra', verificationStatus: 'VERIFIED', provenance: SOURCES.galbrena, options: [{ weaponId: 'lux-and-umbra', rank: 1, label: 'Signature / current reference', relativePerformance: 1 }] },
  { kind: 'WEAPON_RECOMMENDATION', id: 'hiyuki-standard-weapons', name: 'Hiyuki — Standard Weapons', characterId: 'hiyuki', defaultWeaponId: 'frostburn', verificationStatus: 'VERIFIED', provenance: SOURCES.hiyuki, options: [{ weaponId: 'frostburn', rank: 1, label: 'Signature / current reference', relativePerformance: 1 }] },
  { kind: 'WEAPON_RECOMMENDATION', id: 'jinhsi-standard-weapons', name: 'Jinhsi — Standard Weapons', characterId: 'jinhsi', defaultWeaponId: 'ages-of-harvest', verificationStatus: 'VERIFIED', provenance: SOURCES.jinhsi, options: [{ weaponId: 'ages-of-harvest', rank: 1, label: 'Signature / current reference', relativePerformance: 1 }] },
  { kind: 'WEAPON_RECOMMENDATION', id: 'luuk-herssen-standard-weapons', name: 'Luuk Herssen — Standard Weapons', characterId: 'luuk-herssen', defaultWeaponId: 'daybreakers-spine', verificationStatus: 'VERIFIED', provenance: SOURCES.luuk, options: [{ weaponId: 'daybreakers-spine', rank: 1, label: 'Signature / current reference', relativePerformance: 1 }] },
  { kind: 'WEAPON_RECOMMENDATION', id: 'lynae-standard-weapons', name: 'Lynae — Standard Weapons', characterId: 'lynae', defaultWeaponId: 'spectrum-blaster', verificationStatus: 'VERIFIED', provenance: SOURCES.lynae, options: [{ weaponId: 'spectrum-blaster', rank: 1, label: 'Signature / current reference', relativePerformance: 1 }] },
  { kind: 'WEAPON_RECOMMENDATION', id: 'sigrika-standard-weapons', name: 'Sigrika — Standard Weapons', characterId: 'sigrika', defaultWeaponId: 'solsworn-ciphers', verificationStatus: 'VERIFIED', provenance: SOURCES.sigrika, options: [{ weaponId: 'solsworn-ciphers', rank: 1, label: 'Signature / current reference', relativePerformance: 1 }] },
  { kind: 'WEAPON_RECOMMENDATION', id: 'yangyang-xuanling-standard-weapons', name: 'Yangyang (Xuanling) — Standard Weapons', characterId: 'yangyang-xuanling', defaultWeaponId: 'azure-oath', verificationStatus: 'VERIFIED', provenance: SOURCES.xuanling, options: [{ weaponId: 'azure-oath', rank: 1, label: 'Signature / current reference', relativePerformance: 1 }] },
  { kind: 'WEAPON_RECOMMENDATION', id: 'zani-standard-weapons', name: 'Zani — Standard Weapons', characterId: 'zani', defaultWeaponId: 'blazing-justice', verificationStatus: 'VERIFIED', provenance: SOURCES.zani, options: [{ weaponId: 'blazing-justice', rank: 1, label: 'Signature / current reference', relativePerformance: 1 }] },
];

const critSlot = {
  cost: 4 as const,
  primaryMainStats: [
    { stat: 'CRIT Rate' as const, priority: 1 },
    { stat: 'CRIT DMG' as const, priority: 1 },
  ],
};
const atkOne = { cost: 1 as const, primaryMainStats: [{ stat: 'ATK%' as const, priority: 1 }] };

export const PROFILE_SOURCE_BATCH_20260829_ECHOES: readonly EchoLoadoutProfile[] = [
  {
    kind: 'ECHO_LOADOUT', id: 'aemeath-standard-echoes', name: 'Aemeath — Trailblazing Star / Sigillum', characterId: 'aemeath', verificationStatus: 'VERIFIED', provenance: SOURCES.aemeath,
    slots: [critSlot, { cost: 3, primaryMainStats: [{ stat: 'Fusion DMG', priority: 1 }] }, { cost: 3, primaryMainStats: [{ stat: 'ATK%', priority: 1 }, { stat: 'Fusion DMG', priority: 1 }] }, atkOne, atkOne], sonataSetIds: ['sonata-27'], mainEchoId: 'echo-60001915',
  },
  {
    kind: 'ECHO_LOADOUT', id: 'camellya-standard-echoes', name: 'Camellya — Havoc Eclipse / Nightmare: Crownless', characterId: 'camellya', verificationStatus: 'VERIFIED', provenance: SOURCES.camellya,
    slots: [critSlot, { cost: 3, primaryMainStats: [{ stat: 'Havoc DMG', priority: 1 }] }, { cost: 3, primaryMainStats: [{ stat: 'ATK%', priority: 1 }, { stat: 'Havoc DMG', priority: 2 }] }, atkOne, atkOne], sonataSetIds: ['sonata-6'], mainEchoId: 'echo-60000905',
  },
  {
    kind: 'ECHO_LOADOUT', id: 'galbrena-standard-echoes', name: "Galbrena — Flamewing's Shadow / Corrosaurus", characterId: 'galbrena', verificationStatus: 'VERIFIED', provenance: SOURCES.galbrena,
    slots: [critSlot, { cost: 3, primaryMainStats: [{ stat: 'Fusion DMG', priority: 1 }] }, { cost: 3, primaryMainStats: [{ stat: 'Fusion DMG', priority: 1 }, { stat: 'ATK%', priority: 2 }] }, atkOne, atkOne], sonataSetIds: ['sonata-22'], mainEchoId: 'echo-60001205',
  },
  {
    kind: 'ECHO_LOADOUT', id: 'hiyuki-standard-echoes', name: 'Hiyuki — Wishes of Quiet Snowfall / Voidborne Construct', characterId: 'hiyuki', verificationStatus: 'VERIFIED', provenance: SOURCES.hiyuki,
    slots: [critSlot, { cost: 3, primaryMainStats: [{ stat: 'Glacio DMG', priority: 1 }] }, { cost: 3, primaryMainStats: [{ stat: 'Glacio DMG', priority: 1 }, { stat: 'ATK%', priority: 2 }] }, atkOne, atkOne], sonataSetIds: ['sonata-30'], mainEchoId: 'echo-60001995',
  },
  {
    kind: 'ECHO_LOADOUT', id: 'jinhsi-standard-echoes', name: 'Jinhsi — Celestial Light / Jué', characterId: 'jinhsi', verificationStatus: 'VERIFIED', provenance: SOURCES.jinhsi,
    slots: [critSlot, { cost: 3, primaryMainStats: [{ stat: 'Spectro DMG', priority: 1 }] }, { cost: 3, primaryMainStats: [{ stat: 'Spectro DMG', priority: 1 }, { stat: 'ATK%', priority: 2 }] }, atkOne, atkOne], sonataSetIds: ['sonata-5'], mainEchoId: 'echo-60000595',
  },
  {
    kind: 'ECHO_LOADOUT', id: 'luuk-herssen-standard-echoes', name: 'Luuk Herssen — Rite of Gilded Revelation / Twin Nova', characterId: 'luuk-herssen', verificationStatus: 'VERIFIED', provenance: SOURCES.luuk,
    slots: [critSlot, { cost: 3, primaryMainStats: [{ stat: 'Spectro DMG', priority: 1 }] }, { cost: 3, primaryMainStats: [{ stat: 'ATK%', priority: 1 }, { stat: 'Spectro DMG', priority: 1 }] }, atkOne, atkOne], sonataSetIds: ['sonata-26'], mainEchoId: 'echo-60001795',
  },
  {
    kind: 'ECHO_LOADOUT', id: 'lynae-standard-echoes', name: 'Lynae — Pact of Neonlight Leap / Hyvatia', characterId: 'lynae', verificationStatus: 'VERIFIED', provenance: SOURCES.lynae,
    slots: [critSlot, { cost: 3, primaryMainStats: [{ stat: 'Spectro DMG', priority: 1 }] }, { cost: 3, primaryMainStats: [{ stat: 'Spectro DMG', priority: 1 }, { stat: 'ATK%', priority: 2 }] }, atkOne, atkOne], sonataSetIds: ['sonata-24'], mainEchoId: 'echo-60001895',
  },
  {
    kind: 'ECHO_LOADOUT', id: 'sigrika-standard-echoes', name: 'Sigrika — Sound of True Name / Nameless Explorer', characterId: 'sigrika', verificationStatus: 'VERIFIED', provenance: SOURCES.sigrika,
    slots: [critSlot, { cost: 3, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] }, { cost: 3, primaryMainStats: [{ stat: 'ATK%', priority: 1 }, { stat: 'Energy Regen', priority: 2 }] }, atkOne, atkOne], sonataSetIds: ['sonata-29'], mainEchoId: 'echo-60001925',
  },
  {
    kind: 'ECHO_LOADOUT', id: 'yangyang-xuanling-standard-echoes', name: 'Yangyang (Xuanling) — Song of Feathered Trace / Thousand-Puppet Pavilion', characterId: 'yangyang-xuanling', verificationStatus: 'VERIFIED', provenance: SOURCES.xuanling,
    slots: [critSlot, { cost: 3, primaryMainStats: [{ stat: 'Havoc DMG', priority: 1 }] }, { cost: 3, primaryMainStats: [{ stat: 'ATK%', priority: 1 }, { stat: 'Havoc DMG', priority: 1 }] }, atkOne, atkOne], sonataSetIds: ['sonata-33'], mainEchoId: 'echo-60002185',
  },
  {
    kind: 'ECHO_LOADOUT', id: 'zani-standard-echoes', name: 'Zani — Eternal Radiance / Nightmare: Mourning Aix', characterId: 'zani', verificationStatus: 'VERIFIED', provenance: SOURCES.zani,
    slots: [critSlot, { cost: 3, primaryMainStats: [{ stat: 'Spectro DMG', priority: 1 }] }, { cost: 3, primaryMainStats: [{ stat: 'Spectro DMG', priority: 1 }, { stat: 'ATK%', priority: 2 }] }, atkOne, atkOne], sonataSetIds: ['sonata-11'], mainEchoId: 'echo-60000925',
  },
];

export const PROFILE_SOURCE_BATCH_20260829_STATS: readonly StatTargetProfile[] = [
  {
    kind: 'STAT_TARGET', id: 'aemeath-standard-build-stats', name: 'Aemeath — Standard Build Stats', characterId: 'aemeath', verificationStatus: 'VERIFIED', provenance: SOURCES.aemeath,
    targetRules: [{ stat: 'Energy Regen', priority: 1 }, { stat: 'CRIT DMG', priority: 2 }, { stat: 'CRIT Rate', priority: 2 }, { stat: 'ATK%', priority: 3 }, { stat: 'Liberation DMG', priority: 4 }, { stat: 'Flat ATK', priority: 5 }],
    gates: [{ stat: 'Energy Regen Total', minimum: 1.15, preferred: 1.25, notes: 'Current source range is 115%-125%, team-dependent.' }],
  },
  {
    kind: 'STAT_TARGET', id: 'camellya-standard-build-stats', name: 'Camellya — Standard Build Stats', characterId: 'camellya', verificationStatus: 'VERIFIED', provenance: SOURCES.camellya,
    targetRules: [{ stat: 'Energy Regen', priority: 1 }, { stat: 'CRIT Rate', priority: 2 }, { stat: 'CRIT DMG', priority: 2 }, { stat: 'ATK%', priority: 3 }, { stat: 'Basic Attack DMG', priority: 4 }, { stat: 'Flat ATK', priority: 5 }],
    gates: [{ stat: 'Energy Regen Total', minimum: 1.15, preferred: 1.28, notes: 'Current source range is 115%-128%, team-dependent.' }],
  },
  {
    kind: 'STAT_TARGET', id: 'galbrena-standard-build-stats', name: 'Galbrena — Standard Build Stats', characterId: 'galbrena', verificationStatus: 'VERIFIED', provenance: SOURCES.galbrena,
    targetRules: [{ stat: 'Energy Regen', priority: 1 }, { stat: 'CRIT Rate', priority: 2 }, { stat: 'CRIT DMG', priority: 2 }, { stat: 'ATK%', priority: 3 }, { stat: 'Flat ATK', priority: 4 }, { stat: 'Heavy Attack DMG', priority: 5 }],
    gates: [{ stat: 'Energy Regen Total', minimum: 1.1, preferred: 1.25, notes: 'Current source range is 110%-125%, team-dependent.' }],
  },
  {
    kind: 'STAT_TARGET', id: 'hiyuki-standard-build-stats', name: 'Hiyuki — Standard Build Stats', characterId: 'hiyuki', verificationStatus: 'VERIFIED', provenance: SOURCES.hiyuki,
    targetRules: [{ stat: 'Energy Regen', priority: 1 }, { stat: 'CRIT DMG', priority: 2 }, { stat: 'CRIT Rate', priority: 2, notes: 'Source equality applies until the documented 75% CRIT Rate target.' }, { stat: 'ATK%', priority: 3 }, { stat: 'Liberation DMG', priority: 4 }, { stat: 'Flat ATK', priority: 5 }],
    gates: [{ stat: 'Energy Regen Total', minimum: 1.2, preferred: 1.2, notes: 'Current source target is 120%.' }],
  },
  {
    kind: 'STAT_TARGET', id: 'jinhsi-standard-build-stats', name: 'Jinhsi — Standard Build Stats', characterId: 'jinhsi', verificationStatus: 'VERIFIED', provenance: SOURCES.jinhsi,
    targetRules: [{ stat: 'Energy Regen', priority: 1 }, { stat: 'CRIT Rate', priority: 2 }, { stat: 'CRIT DMG', priority: 2 }, { stat: 'ATK%', priority: 3 }, { stat: 'Skill DMG', priority: 4 }, { stat: 'Flat ATK', priority: 5 }],
    gates: [{ stat: 'Energy Regen Total', minimum: 1, preferred: 1.25, notes: 'Current source range is 100%-125%, team-dependent.' }],
  },
  {
    kind: 'STAT_TARGET', id: 'luuk-herssen-standard-build-stats', name: 'Luuk Herssen — Standard Build Stats', characterId: 'luuk-herssen', verificationStatus: 'VERIFIED', provenance: SOURCES.luuk,
    targetRules: [{ stat: 'Energy Regen', priority: 1 }, { stat: 'CRIT DMG', priority: 2 }, { stat: 'CRIT Rate', priority: 2 }, { stat: 'ATK%', priority: 3 }, { stat: 'Basic Attack DMG', priority: 3 }, { stat: 'Flat ATK', priority: 4 }],
    gates: [{ stat: 'Energy Regen Total', minimum: 1.18, preferred: 1.25, notes: 'Current source range is 118%-125%, team-dependent.' }],
  },
  {
    kind: 'STAT_TARGET', id: 'lynae-standard-build-stats', name: 'Lynae — Standard Build Stats', characterId: 'lynae', verificationStatus: 'VERIFIED', provenance: SOURCES.lynae,
    targetRules: [{ stat: 'Energy Regen', priority: 1 }, { stat: 'CRIT Rate', priority: 2 }, { stat: 'CRIT DMG', priority: 2 }, { stat: 'ATK%', priority: 3 }, { stat: 'Flat ATK', priority: 4 }, { stat: 'Basic Attack DMG', priority: 4 }],
    gates: [{ stat: 'Energy Regen Total', minimum: 1.15, preferred: 1.3, notes: 'Current source range is 115%-130%, team-dependent.' }],
  },
  {
    kind: 'STAT_TARGET', id: 'sigrika-standard-build-stats', name: 'Sigrika — Standard Build Stats', characterId: 'sigrika', verificationStatus: 'VERIFIED', provenance: SOURCES.sigrika,
    targetRules: [{ stat: 'Energy Regen', priority: 1, notes: 'Primary source ER gate first; source also discusses further ER optimization after the gate, which is not promoted as a second hard gate.' }, { stat: 'CRIT DMG', priority: 2 }, { stat: 'CRIT Rate', priority: 2 }, { stat: 'ATK%', priority: 3 }, { stat: 'Flat ATK', priority: 4 }],
    gates: [{ stat: 'Energy Regen Total', minimum: 1.09, preferred: 1.19, notes: 'Current source team-dependent ER requirement is 109%-119%.' }],
  },
  {
    kind: 'STAT_TARGET', id: 'yangyang-xuanling-standard-build-stats', name: 'Yangyang (Xuanling) — Standard Build Stats', characterId: 'yangyang-xuanling', verificationStatus: 'VERIFIED', provenance: SOURCES.xuanling,
    targetRules: [{ stat: 'Energy Regen', priority: 1 }, { stat: 'CRIT Rate', priority: 2 }, { stat: 'CRIT DMG', priority: 2 }, { stat: 'ATK%', priority: 3 }, { stat: 'Heavy Attack DMG', priority: 3 }, { stat: 'Flat ATK', priority: 4 }],
    gates: [{ stat: 'Energy Regen Total', minimum: 1.07, preferred: 1.19, notes: 'Current source range is 107%-119%, team-dependent.' }],
  },
  {
    kind: 'STAT_TARGET', id: 'zani-standard-build-stats', name: 'Zani — Standard Build Stats', characterId: 'zani', verificationStatus: 'VERIFIED', provenance: SOURCES.zani,
    targetRules: [{ stat: 'Energy Regen', priority: 1 }, { stat: 'CRIT Rate', priority: 2 }, { stat: 'CRIT DMG', priority: 2 }, { stat: 'ATK%', priority: 3 }, { stat: 'Flat ATK', priority: 4 }],
    gates: [{ stat: 'Energy Regen Total', minimum: 1.15, notes: 'Current source target is 115%+; quickswap can reduce the requirement.' }],
  },
];

export const PROFILE_SOURCE_BATCH_20260829_TEAMS: readonly TeamProfile[] = [
  { kind: 'TEAM', id: 'aemeath-denia-chisa', name: 'Aemeath / Denia / Chisa', verificationStatus: 'VERIFIED', provenance: SOURCES.aemeath, members: [{ characterId: 'aemeath', role: 'DPS' }, { characterId: 'denia', role: 'SUB_DPS' }, { characterId: 'chisa', role: 'SUPPORT' }] },
  { kind: 'TEAM', id: 'camellya-lynae-mornye', name: 'Camellya / Lynae / Mornye', verificationStatus: 'VERIFIED', provenance: SOURCES.camellya, members: [{ characterId: 'camellya', role: 'DPS' }, { characterId: 'lynae', role: 'SUB_DPS' }, { characterId: 'mornye', role: 'SUPPORT' }] },
  { kind: 'TEAM', id: 'galbrena-qiuyuan-shorekeeper', name: 'Galbrena / Qiuyuan / Shorekeeper', verificationStatus: 'VERIFIED', provenance: SOURCES.galbrena, members: [{ characterId: 'galbrena', role: 'DPS' }, { characterId: 'qiuyuan', role: 'SUB_DPS' }, { characterId: 'the-shorekeeper', role: 'SUPPORT' }] },
  { kind: 'TEAM', id: 'hiyuki-lucilla-chisa', name: 'Hiyuki / Lucilla / Chisa', verificationStatus: 'VERIFIED', provenance: SOURCES.hiyuki, members: [{ characterId: 'hiyuki', role: 'DPS' }, { characterId: 'lucilla', role: 'SUB_DPS' }, { characterId: 'chisa', role: 'SUPPORT' }] },
  { kind: 'TEAM', id: 'jinhsi-zhezhi-verina', name: 'Jinhsi / Zhezhi / Verina', verificationStatus: 'VERIFIED', provenance: SOURCES.jinhsi, members: [{ characterId: 'jinhsi', role: 'DPS' }, { characterId: 'zhezhi', role: 'SUB_DPS' }, { characterId: 'verina', role: 'SUPPORT' }] },
  { kind: 'TEAM', id: 'luuk-herssen-denia-mornye', name: 'Luuk Herssen / Denia / Mornye', verificationStatus: 'VERIFIED', provenance: SOURCES.luuk, members: [{ characterId: 'luuk-herssen', role: 'DPS' }, { characterId: 'denia', role: 'SUB_DPS' }, { characterId: 'mornye', role: 'SUPPORT' }] },
  { kind: 'TEAM', id: 'lynae-aemeath-mornye', name: 'Lynae / Aemeath / Mornye', verificationStatus: 'VERIFIED', provenance: SOURCES.lynae, members: [{ characterId: 'lynae', role: 'SUB_DPS' }, { characterId: 'aemeath', role: 'DPS' }, { characterId: 'mornye', role: 'SUPPORT' }] },
  { kind: 'TEAM', id: 'sigrika-qiuyuan-ciaccona', name: 'Sigrika / Qiuyuan / Ciaccona', verificationStatus: 'VERIFIED', provenance: SOURCES.sigrika, members: [{ characterId: 'sigrika', role: 'DPS' }, { characterId: 'qiuyuan', role: 'SUB_DPS' }, { characterId: 'ciaccona', role: 'SUB_DPS' }] },
  { kind: 'TEAM', id: 'yangyang-xuanling-lynae-chisa', name: 'Yangyang (Xuanling) / Lynae / Chisa', verificationStatus: 'VERIFIED', provenance: SOURCES.xuanling, members: [{ characterId: 'yangyang-xuanling', role: 'DPS' }, { characterId: 'lynae', role: 'SUB_DPS' }, { characterId: 'chisa', role: 'SUPPORT' }] },
  { kind: 'TEAM', id: 'zani-phoebe-rover-spectro', name: 'Zani / Phoebe / Rover (Spectro)', verificationStatus: 'VERIFIED', provenance: SOURCES.zani, members: [{ characterId: 'zani', role: 'DPS' }, { characterId: 'phoebe', role: 'SUB_DPS' }, { characterId: 'rover-spectro', role: 'SUPPORT' }] },
];

const sourceOnlyNotes = (adapters: readonly string[]) => [
  'Source-reviewed guide sequence only; no Bellibing executable timing, uptime, damage, or state transition is claimed.',
  `DPS execution remains blocked on specialized adapter review: ${adapters.join(', ')}.`,
];

export const PROFILE_SOURCE_BATCH_20260829_ROTATIONS: readonly RotationProfile[] = [
  {
    kind: 'ROTATION', id: 'aemeath-standard-source-sequence', name: 'Aemeath — Standard Source Sequence', characterId: 'aemeath', teamProfileId: 'aemeath-denia-chisa', executionStatus: 'SOURCE_SEQUENCE_ONLY', variantKey: 'standard', modeledMechanicFactIds: [], assumedMechanicFactIds: [], verificationStatus: 'VERIFIED', provenance: { ...SOURCES.aemeath, notes: sourceOnlyNotes(['FUSION_BURST_OR_TUNE_RUPTURE_SET_TRIGGER', 'SIGILLUM_CHARACTER_RESTRICTION', 'EVERBRIGHT_POLESTAR_EFFECT', 'AEMEATH_FORM_AND_FORTE_STATE']) },
    sourceSequence: ['Intro (Mech)', 'Basic: Mech 3', 'Basic: Mech 4 (cancel first slash via Ultimate)', 'Ultimate: Overdrive', 'Basic: Mech 2', 'Basic: Mech 3', 'Basic: Mech 4 (cancel first slash via Skill)', 'Skill: Duet Encore', 'Basic: Aemeath 2', 'Basic: Aemeath 3', 'Basic: Aemeath 4 (cancel endlag via Skill)', 'Skill: Duet Overture', 'Heavy: Mech II (cancel endlag via Ultimate)', 'Ultimate: Finale', 'Skill: Mech Basic 1 (Switch to Mech Form)', 'Outro'],
  },
  {
    kind: 'ROTATION', id: 'camellya-standard-source-sequence', name: 'Camellya — Standard Red-Hair Source Sequence', characterId: 'camellya', teamProfileId: 'camellya-lynae-mornye', executionStatus: 'SOURCE_SEQUENCE_ONLY', variantKey: 'standard-red-hair', modeledMechanicFactIds: [], assumedMechanicFactIds: [], verificationStatus: 'VERIFIED', provenance: { ...SOURCES.camellya, notes: sourceOnlyNotes(['HAVOC_ECLIPSE_RAMP', 'NIGHTMARE_CROWNLESS_CAST', 'RED_SPRING_EFFECT', 'CAMELLYA_FORM_CONCERTO_AND_BUDDING_STATE']) },
    sourceSequence: ['Intro', 'Skill: Crimson Blossom (cancel endlag via Echo)', 'Echo (cancel via Dash)', 'Dash', 'Heavy: Vining Waltz 1', 'Heavy: Vining Waltz 2', 'Heavy: Vining Waltz 3', 'Heavy: Blazing Waltz', 'Heavy: Vining Waltz 4 (cancel endlag via Echo)', 'Echo (cancel via Dash)', 'Dash (cancel via Ultimate)', 'Ultimate', 'Basic: Vining Waltz 1 (cancel endlag via Skill)', 'Skill: Ephemeral', 'Heavy: Vining Waltz 1', 'Heavy: Vining Waltz 2', 'Heavy: Vining Waltz 3', 'Heavy: Blazing Waltz', 'Heavy: Vining Waltz 4 (cancel endlag via Skill)', 'Skill: Floral Ravage', 'Echo (Swap)', 'Outro'],
  },
  {
    kind: 'ROTATION', id: 'galbrena-standard-source-sequence', name: 'Galbrena — Standard Source Sequence', characterId: 'galbrena', teamProfileId: 'galbrena-qiuyuan-shorekeeper', executionStatus: 'SOURCE_SEQUENCE_ONLY', variantKey: 'standard', modeledMechanicFactIds: [], assumedMechanicFactIds: [], verificationStatus: 'VERIFIED', provenance: { ...SOURCES.galbrena, notes: sourceOnlyNotes(['AFTERFLAME_ECHO_SKILL_EVENT', 'FLAMEWINGS_SHADOW_TRIGGER', 'CORROSAURUS_ACTIVE', 'LUX_UMBRA_EFFECT', 'GALBRENA_SINFLAME_AFTERFLAME_STATE']) },
    sourceSequence: ['Intro', 'Basic P2', 'Basic P3', 'Basic P4', 'Basic P2', 'Basic P3', 'Skill: Ascent of Malice (interrupt on hit)', 'Ultimate', 'Forte: Basic P2', 'Forte: Basic P3', 'Forte: Basic P4', 'Forte: Basic P5', 'Forte: Basic P3', 'Forte: Basic P4', 'Forte: Basic P5 (Swap)', 'Outro'],
  },
  {
    kind: 'ROTATION', id: 'hiyuki-standard-source-sequence', name: 'Hiyuki — Standard Source Sequence', characterId: 'hiyuki', teamProfileId: 'hiyuki-lucilla-chisa', executionStatus: 'SOURCE_SEQUENCE_ONLY', variantKey: 'standard', modeledMechanicFactIds: [], assumedMechanicFactIds: [], verificationStatus: 'VERIFIED', provenance: { ...SOURCES.hiyuki, notes: sourceOnlyNotes(['GLACIO_CHAFE_SET_STATE', 'VOIDBORNE_CONSTRUCT_SUMMON', 'FROSTBURN_EFFECT', 'HIYUKI_IAI_AND_LIBERATION_STATE']) },
    sourceSequence: ['Intro', 'Basic 3', 'Heavy: Frost Splinter (cancel via Ultimate)', 'Ultimate: Inward Vision', 'Basic: Foreclaimed Self 1', 'Basic: Foreclaimed Self 2', 'Basic: Foreclaimed Self 3 (cancel via Skill)', 'Skill: Jade Cleave', 'Skill: Petalfall', 'Basic: Foreclaimed Self 1', 'Basic: Foreclaimed Self 2', 'Basic: Foreclaimed Self 3 (cancel via Dodge)', 'Dodge (Enter Iai Stance)', 'Basic: Iai (3 times)', 'Heavy: Bitterfrost', 'Hold Ultimate: Blade Liberation', 'Skill (Swap)', 'Outro'],
  },
  {
    kind: 'ROTATION', id: 'jinhsi-standard-opener-source-sequence', name: 'Jinhsi — Standard Opener Source Sequence', characterId: 'jinhsi', teamProfileId: 'jinhsi-zhezhi-verina', executionStatus: 'SOURCE_SEQUENCE_ONLY', variantKey: 'standard-opener', modeledMechanicFactIds: [], assumedMechanicFactIds: [], verificationStatus: 'VERIFIED', provenance: { ...SOURCES.jinhsi, notes: [...sourceOnlyNotes(['CELESTIAL_LIGHT_INTRO_WINDOW', 'JUE_SUMMON_AND_SKILL_BONUS', 'AGES_OF_HARVEST_EFFECT', 'JINHSI_INCARNATION_UNISON_INCANDESCENCE_STATE']), 'Only the source standard opener is promoted here; loop/advanced variants remain alternatives for later mode review.'] },
    sourceSequence: ['Basic P1', 'Basic P2', 'Basic P3', 'Basic P4', 'Skill: Overflowing Radiance', 'Ultimate', 'Incarnation Basic P1', 'Incarnation Basic P2', 'Incarnation Basic P3', 'Incarnation Basic P4', 'Skill: Illuminous Epiphany', 'Outro'],
  },
  {
    kind: 'ROTATION', id: 'luuk-herssen-standard-source-sequence', name: 'Luuk Herssen — Standard Source Sequence', characterId: 'luuk-herssen', teamProfileId: 'luuk-herssen-denia-mornye', executionStatus: 'SOURCE_SEQUENCE_ONLY', variantKey: 'standard', modeledMechanicFactIds: [], assumedMechanicFactIds: [], verificationStatus: 'VERIFIED', provenance: { ...SOURCES.luuk, notes: sourceOnlyNotes(['RITE_OF_GILDED_REVELATION_STACKS', 'TWIN_NOVA_MAIN_SLOT_EFFECT', 'DAYBREAKERS_SPINE_EFFECT', 'LUUK_GOLDEN_RULE_ICHOR_AND_AUREATE_STATE']) },
    sourceSequence: ['Intro', 'Jump: Mid-air Attack Resection 2', 'Jump: Mid-air Attack Resection 3', 'Skill: Ring', 'Basic: Golden Impale (cancel via Dash)', 'Dash', 'Basic: Mid-air Attack 1', 'Jump: Mid-air Attack Resection 2', 'Jump: Mid-air Attack Resection 3', 'Skill: Breach', 'Basic: Golden Impale (cancel via Dash)', 'Dash', 'Basic: Mid-air Attack 1', 'Jump: Mid-air Attack Resection 2', 'Jump: Mid-air Attack Resection 3', 'Skill: Glare', 'Basic: Mid-air Attack Gavel of Earthshaker (cancel via Ultimate)', 'Ultimate', 'Skill (Swap)', 'Outro'],
  },
  {
    kind: 'ROTATION', id: 'lynae-standard-source-sequence', name: 'Lynae — Standard Source Sequence', characterId: 'lynae', teamProfileId: 'lynae-aemeath-mornye', executionStatus: 'SOURCE_SEQUENCE_ONLY', variantKey: 'standard', modeledMechanicFactIds: [], assumedMechanicFactIds: [], verificationStatus: 'VERIFIED', provenance: { ...SOURCES.lynae, notes: sourceOnlyNotes(['PACT_OF_NEONLIGHT_OUTRO_TRANSFER', 'HYVATIA_OUTRO_TRANSFER', 'SPECTRUM_BLASTER_TUNE_EVENT', 'LYNAE_OVERFLOW_LUMIFLOW_TRUE_COLOR_STATE']) },
    sourceSequence: ['Intro (cancel endlag via Ultimate)', 'Ultimate', 'Skill: Lynae-Style Palettes', 'Heavy: Spark Collision (Full Charge; cancel via Jump)', 'Jump: Polychrome Leap (3 Times)', 'Basic: Mid-air Attack Visual Impact', 'Outro'],
  },
  {
    kind: 'ROTATION', id: 'sigrika-standard-source-sequence', name: 'Sigrika — Standard Source Sequence', characterId: 'sigrika', teamProfileId: 'sigrika-qiuyuan-ciaccona', executionStatus: 'SOURCE_SEQUENCE_ONLY', variantKey: 'standard', modeledMechanicFactIds: [], assumedMechanicFactIds: [], verificationStatus: 'VERIFIED', provenance: { ...SOURCES.sigrika, notes: [...sourceOnlyNotes(['SOUND_OF_TRUE_NAME_ECHO_SKILL_TRIGGER', 'NAMELESS_EXPLORER_MAIN_SLOT_EFFECT', 'SOLSWORN_CIPHERS_EFFECT', 'SIGRIKA_RUNE_STATE']), 'The source standard rotation is promoted; Double Outburst remains an advanced quickswap alternative.'] },
    sourceSequence: ['Intro', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic: Elucidated', 'Heavy: Chain Whip (cancel on hit via Ultimate)', 'Ultimate', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic: Elucidated', 'Heavy: Outburst (cancel via Hold Skill)', 'Hold Skill: Learn My True Name', 'Outro'],
  },
  {
    kind: 'ROTATION', id: 'yangyang-xuanling-standard-source-sequence', name: 'Yangyang (Xuanling) — Standard Source Sequence', characterId: 'yangyang-xuanling', teamProfileId: 'yangyang-xuanling-lynae-chisa', executionStatus: 'SOURCE_SEQUENCE_ONLY', variantKey: 'standard', modeledMechanicFactIds: [], assumedMechanicFactIds: [], verificationStatus: 'VERIFIED', provenance: { ...SOURCES.xuanling, notes: sourceOnlyNotes(['HAVOC_BANE_STACK_STATE', 'SONG_OF_FEATHERED_TRACE_TRIGGER', 'THOUSAND_PUPPET_PAVILION_SUMMON', 'AZURE_OATH_EFFECT', 'YANGYANG_XUANLING_STANCE_MELODY_PLUME_STATE']) },
    sourceSequence: ['Intro', 'Basic: Azure 1', 'Basic: Azure 2', 'Basic: Azure 3', 'Basic: Azure 4', 'Skill (Switch to Feather stance)', 'Heavy: Feather', 'Basic: Mid-air Attack Feather Fall', 'Basic: Havoc in Bloom 1', 'Basic: Havoc in Bloom 2', 'Basic: Havoc in Bloom 3 (cancel via Ultimate)', 'Ultimate', 'Skill (Switch to Azure stance)', 'Heavy: Azure', 'Outro'],
  },
  {
    kind: 'ROTATION', id: 'zani-standard-source-sequence', name: 'Zani — Standard Source Sequence', characterId: 'zani', teamProfileId: 'zani-phoebe-rover-spectro', executionStatus: 'SOURCE_SEQUENCE_ONLY', variantKey: 'standard', modeledMechanicFactIds: [], assumedMechanicFactIds: [], verificationStatus: 'VERIFIED', provenance: { ...SOURCES.zani, notes: sourceOnlyNotes(['SPECTRO_FRAZZLE_TO_HELIACAL_EMBER_CONVERSION', 'ETERNAL_RADIANCE_FRAZZLE_TRIGGER', 'NIGHTMARE_MOURNING_AIX_FRAZZLE_ATTACK', 'BLAZING_JUSTICE_EFFECT', 'ZANI_BLAZE_AND_INFERNO_STATE']) },
    sourceSequence: ['Intro', 'Skill: Standard Def Protocol', 'Basic P3', 'Skill: Targeted Action', 'Ultimate: Rekindle', 'Forte: Heavy Slash - Daybreak', 'Forte: Heavy Slash - Dawning', 'Forte: Heavy Slash - Nightfall', 'Forte: Heavy Slash - Daybreak', 'Forte: Heavy Slash - Dawning', 'Forte: Heavy Slash - Nightfall', 'Ultimate: The Last Stand', 'Outro'],
  },
];

function preset(
  id: string,
  name: string,
  characterId: string,
  modeKey: string,
  displayLabel: string,
  weaponRecommendationProfileId: string,
  echoLoadoutProfileId: string,
  statTargetProfileId: string,
  teamProfileId: string,
  rotationProfileId: string,
  provenance: CharacterBuildPreset['provenance'],
): CharacterBuildPreset {
  return {
    kind: 'CHARACTER_PRESET', id, name, characterId, modeKey, displayLabel, sequence: 0,
    isDefault: true, uiSelectable: true, weaponRecommendationProfileId, echoLoadoutProfileId,
    statTargetProfileId, teamProfileId, rotationProfileId, verificationStatus: 'VERIFIED', provenance,
  };
}

export const PROFILE_SOURCE_BATCH_20260829_PRESETS: readonly CharacterBuildPreset[] = [
  preset('aemeath-standard', 'Aemeath — Standard', 'aemeath', 'standard', 'Standard', 'aemeath-standard-weapons', 'aemeath-standard-echoes', 'aemeath-standard-build-stats', 'aemeath-denia-chisa', 'aemeath-standard-source-sequence', SOURCES.aemeath),
  preset('camellya-standard', 'Camellya — Standard', 'camellya', 'standard', 'Standard', 'camellya-standard-weapons', 'camellya-standard-echoes', 'camellya-standard-build-stats', 'camellya-lynae-mornye', 'camellya-standard-source-sequence', SOURCES.camellya),
  preset('galbrena-standard', 'Galbrena — Standard', 'galbrena', 'standard', 'Standard', 'galbrena-standard-weapons', 'galbrena-standard-echoes', 'galbrena-standard-build-stats', 'galbrena-qiuyuan-shorekeeper', 'galbrena-standard-source-sequence', SOURCES.galbrena),
  preset('hiyuki-standard', 'Hiyuki — Standard', 'hiyuki', 'standard', 'Standard', 'hiyuki-standard-weapons', 'hiyuki-standard-echoes', 'hiyuki-standard-build-stats', 'hiyuki-lucilla-chisa', 'hiyuki-standard-source-sequence', SOURCES.hiyuki),
  preset('jinhsi-standard-opener', 'Jinhsi — Standard Opener', 'jinhsi', 'standard-opener', 'Standard Opener', 'jinhsi-standard-weapons', 'jinhsi-standard-echoes', 'jinhsi-standard-build-stats', 'jinhsi-zhezhi-verina', 'jinhsi-standard-opener-source-sequence', SOURCES.jinhsi),
  preset('luuk-herssen-standard', 'Luuk Herssen — Standard', 'luuk-herssen', 'standard', 'Standard', 'luuk-herssen-standard-weapons', 'luuk-herssen-standard-echoes', 'luuk-herssen-standard-build-stats', 'luuk-herssen-denia-mornye', 'luuk-herssen-standard-source-sequence', SOURCES.luuk),
  preset('lynae-standard', 'Lynae — Standard', 'lynae', 'standard', 'Standard', 'lynae-standard-weapons', 'lynae-standard-echoes', 'lynae-standard-build-stats', 'lynae-aemeath-mornye', 'lynae-standard-source-sequence', SOURCES.lynae),
  preset('sigrika-standard', 'Sigrika — Standard', 'sigrika', 'standard', 'Standard', 'sigrika-standard-weapons', 'sigrika-standard-echoes', 'sigrika-standard-build-stats', 'sigrika-qiuyuan-ciaccona', 'sigrika-standard-source-sequence', SOURCES.sigrika),
  preset('yangyang-xuanling-standard', 'Yangyang (Xuanling) — Standard', 'yangyang-xuanling', 'standard', 'Standard', 'yangyang-xuanling-standard-weapons', 'yangyang-xuanling-standard-echoes', 'yangyang-xuanling-standard-build-stats', 'yangyang-xuanling-lynae-chisa', 'yangyang-xuanling-standard-source-sequence', SOURCES.xuanling),
  preset('zani-standard', 'Zani — Standard', 'zani', 'standard', 'Standard', 'zani-standard-weapons', 'zani-standard-echoes', 'zani-standard-build-stats', 'zani-phoebe-rover-spectro', 'zani-standard-source-sequence', SOURCES.zani),
];
