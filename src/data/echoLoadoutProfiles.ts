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
      { cost: 4, primaryMainStat: 'CRIT Rate' },
      { cost: 3, primaryMainStat: 'Electro DMG' },
      { cost: 3, primaryMainStat: 'Electro DMG' },
      { cost: 1, primaryMainStat: 'ATK%' },
      { cost: 1, primaryMainStat: 'ATK%' },
    ],
    sonataSetIds: ['sonata-20', 'sonata-3'],
    mainEchoId: 'echo-60001215',
  },
];
