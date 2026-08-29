import type { EchoLoadoutProfile } from '../profileDomain.ts';

export const ECHO_LOADOUT_PROFILES: readonly EchoLoadoutProfile[] = [
  {
    kind: 'ECHO_LOADOUT',
    id: 'augusta-standard-echoes',
    name: 'Augusta — Standard Echoes',
    characterId: 'augusta',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['V9.15 Build Simulator', 'Prydwen Augusta build', 'Bellibing Echo catalog'],
      sourceUrls: [
        'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
        'https://www.prydwen.gg/wuthering-waves/characters/augusta',
      ],
      checkedAt: '2026-08-23',
      notes: [
        'Current V9.15 main-stat layout is CRIT Rate / Electro / Electro / ATK% / ATK%.',
        'Prydwen current standard shell uses Crown of Valor with 2P Void Thunder and The False Sovereign as main Echo.',
      ],
    },
    slots: [
      { cost: 4, primaryMainStats: [{ stat: 'CRIT Rate', priority: 1 }] },
      { cost: 3, primaryMainStats: [{ stat: 'Electro DMG', priority: 1 }] },
      { cost: 3, primaryMainStats: [{ stat: 'Electro DMG', priority: 1 }] },
      { cost: 1, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] },
      { cost: 1, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] },
    ],
    sonataSetIds: ['sonata-20', 'sonata-3'],
    mainEchoId: 'echo-60001215',
  },
  {
    kind: 'ECHO_LOADOUT',
    id: 'cartethyia-windward-fleurdelys',
    name: 'Cartethyia — Windward Pilgrimage / Fleurdelys',
    characterId: 'cartethyia',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Prydwen Cartethyia build', 'Bellibing Echo/Sonata catalogs'],
      sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/cartethyia'],
      checkedAt: '2026-08-29',
      notes: [
        'Current source recommends 5P Windward Pilgrimage with Reminiscence: Fleurdelys as Cartethyia main Echo.',
        'The source main-stat shell is 4/4/1/1/1: CRIT Rate / CRIT DMG / HP% / HP% / HP%.',
        'Fleurdelys has a source-explicit Cartethyia/Aero conditional extra +10% Aero DMG branch that remains behind the existing specialized Echo adapter boundary until freeze/execution work requires it.',
      ],
    },
    slots: [
      { cost: 4, primaryMainStats: [{ stat: 'CRIT Rate', priority: 1 }] },
      { cost: 4, primaryMainStats: [{ stat: 'CRIT DMG', priority: 1 }] },
      { cost: 1, primaryMainStats: [{ stat: 'HP%', priority: 1 }] },
      { cost: 1, primaryMainStats: [{ stat: 'HP%', priority: 1 }] },
      { cost: 1, primaryMainStats: [{ stat: 'HP%', priority: 1 }] },
    ],
    sonataSetIds: ['sonata-17'],
    mainEchoId: 'echo-60001065',
  },
  {
    kind: 'ECHO_LOADOUT',
    id: 'ciaccona-gusts-kelpie-cartethyia',
    name: 'Ciaccona — Gusts of Welkin / Nightmare: Kelpie',
    characterId: 'ciaccona',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Prydwen Ciaccona build', 'Bellibing Echo/Sonata catalogs'],
      sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/ciaccona'],
      checkedAt: '2026-08-29',
      notes: [
        'Current source recommends Gusts of Welkin for Ciaccona when an Aero Main DPS is present, matching the Cartethyia context.',
        'Nightmare: Kelpie is the current best main Echo by a very small margin over Reminiscence: Fleurdelys; the source explicitly says its Transform Active is not used in Ciaccona rotations.',
        'The 4-cost source choice is CRIT Rate / CRIT DMG as a tie. The second 3-cost prefers Aero DMG with ATK% as a fallback.',
      ],
    },
    slots: [
      {
        cost: 4,
        primaryMainStats: [
          { stat: 'CRIT Rate', priority: 1 },
          { stat: 'CRIT DMG', priority: 1 },
        ],
      },
      { cost: 3, primaryMainStats: [{ stat: 'Aero DMG', priority: 1 }] },
      {
        cost: 3,
        primaryMainStats: [
          { stat: 'Aero DMG', priority: 1 },
          { stat: 'ATK%', priority: 2 },
        ],
      },
      { cost: 1, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] },
      { cost: 1, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] },
    ],
    sonataSetIds: ['sonata-16'],
    mainEchoId: 'echo-60001135',
  },
  {
    kind: 'ECHO_LOADOUT',
    id: 'rover-aero-windward-fleurdelys',
    name: 'Rover (Aero) — Windward Pilgrimage / Fleurdelys',
    characterId: 'rover-aero',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Prydwen Rover (Aero) build', 'Bellibing Echo/Sonata catalogs'],
      sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/rover-aero'],
      checkedAt: '2026-08-29',
      notes: [
        'The reviewed Cartethyia + Ciaccona high-investment context uses Windward Pilgrimage with Reminiscence: Fleurdelys rather than the general Rejuvenating Glow support shell.',
        'The 4-cost source choice is CRIT Rate / CRIT DMG as a tie. The second 3-cost prefers Aero DMG with ATK% as a fallback.',
        'Fleurdelys grants its unconditional main-slot Aero bonus plus a source-explicit extra Aero-resonator branch. Character restriction remains an execution boundary rather than an automatic generic bonus.',
      ],
    },
    slots: [
      {
        cost: 4,
        primaryMainStats: [
          { stat: 'CRIT Rate', priority: 1 },
          { stat: 'CRIT DMG', priority: 1 },
        ],
      },
      { cost: 3, primaryMainStats: [{ stat: 'Aero DMG', priority: 1 }] },
      {
        cost: 3,
        primaryMainStats: [
          { stat: 'Aero DMG', priority: 1 },
          { stat: 'ATK%', priority: 2 },
        ],
      },
      { cost: 1, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] },
      { cost: 1, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] },
    ],
    sonataSetIds: ['sonata-17'],
    mainEchoId: 'echo-60001065',
  },
  {
    kind: 'ECHO_LOADOUT',
    id: 'iuno-augusta-moonlit-heron',
    name: 'Iuno — Augusta Hybrid / Moonlit Clouds / Impermanence Heron',
    characterId: 'iuno',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Prydwen Iuno build', 'Bellibing Echo/Sonata catalogs'],
      sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/iuno'],
      checkedAt: '2026-08-29',
      notes: [
        'This profile is specifically Iuno as Augusta Sub DPS/Hybrid. The source reserves Moonlit Clouds for Sub DPS Iuno and describes it as near-equal team damage to Crown of Valor in the best Sub DPS teams.',
        'Impermanence Heron is the source main Echo for the Moonlit path; source Echo-usage guidance casts it near the start and cancels into Ultimate.',
        'The 4-cost source choice is CRIT Rate / CRIT DMG as a tie. The second 3-cost prefers Aero DMG with ATK% as a fallback.',
      ],
    },
    slots: [
      {
        cost: 4,
        primaryMainStats: [
          { stat: 'CRIT Rate', priority: 1 },
          { stat: 'CRIT DMG', priority: 1 },
        ],
      },
      { cost: 3, primaryMainStats: [{ stat: 'Aero DMG', priority: 1 }] },
      {
        cost: 3,
        primaryMainStats: [
          { stat: 'Aero DMG', priority: 1 },
          { stat: 'ATK%', priority: 2 },
        ],
      },
      { cost: 1, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] },
      { cost: 1, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] },
    ],
    sonataSetIds: ['sonata-8'],
    mainEchoId: 'echo-60000525',
  },
  {
    kind: 'ECHO_LOADOUT',
    id: 'shorekeeper-rejuvenating-fallacy',
    name: 'The Shorekeeper — Rejuvenating Glow / Fallacy of No Return',
    characterId: 'the-shorekeeper',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Prydwen The Shorekeeper build', 'Bellibing Echo/Sonata catalogs'],
      sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/the-shorekeeper'],
      checkedAt: '2026-08-29',
      notes: [
        'Current source recommends Rejuvenating Glow with Fallacy of No Return as the general Shorekeeper support shell.',
        'The 4-cost source preference is CRIT DMG over HP%. The first 3-cost is Energy Regen; the second preserves the source Energy Regen / Spectro DMG alternatives.',
        'Fallacy team ATK and wielder ER cast effects are already source-modeled in Bellibing, but their actual cast timing remains rotation execution state.',
      ],
    },
    slots: [
      {
        cost: 4,
        primaryMainStats: [
          { stat: 'CRIT DMG', priority: 1 },
          { stat: 'HP%', priority: 2 },
        ],
      },
      { cost: 3, primaryMainStats: [{ stat: 'Energy Regen', priority: 1 }] },
      {
        cost: 3,
        primaryMainStats: [
          { stat: 'Energy Regen', priority: 1 },
          { stat: 'Spectro DMG', priority: 1 },
        ],
      },
      { cost: 1, primaryMainStats: [{ stat: 'HP%', priority: 1 }] },
      { cost: 1, primaryMainStats: [{ stat: 'HP%', priority: 1 }] },
    ],
    sonataSetIds: ['sonata-7'],
    mainEchoId: 'echo-60000605',
  },
];
