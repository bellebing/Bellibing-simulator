import type { EchoAttackProfile } from '../echoAttackDomain.ts';

/**
 * First Echo attack fixture: The False Sovereign, because both of its relevant
 * Rank-5 attacks already have exact Augusta parity contracts in the app.
 *
 * This does not move Augusta to the new catalog yet; it establishes the clean
 * attack-data source that a later adapter refactor can consume without changing
 * the verified DPS result.
 */
export const ECHO_ATTACK_PROFILES: readonly EchoAttackProfile[] = [
  {
    echoId: 'echo-60001215',
    rank: 5,
    cooldownSeconds: 8,
    startingCharges: 2,
    maxCharges: 2,
    rechargeSeconds: 8,
    attacks: [
      {
        attackId: 'FALSE_SOV_ACTIVE_SPIN',
        name: 'The False Sovereign — active spinning strike',
        trigger: 'ACTIVE_CAST',
        element: 'Electro',
        scalingStat: 'ATK',
        components: [{ motionValuePerHit: 0.5535, hits: 4 }],
      },
      {
        attackId: 'FALSE_SOV_INTRO_SUMMON',
        name: 'The False Sovereign — automatic Intro summon',
        trigger: 'INTRO_AUTO_SUMMON',
        element: 'Electro',
        scalingStat: 'ATK',
        components: [{ motionValuePerHit: 4.05, hits: 1 }],
      },
    ],
    provenance: {
      sourceLabels: [
        'V9.15/Augusta exact parity fixture',
        'Wutheringlab',
        'Wuwa Wiki',
        'Wuthering.gg',
      ],
      sourceUrls: [
        'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
        'https://wutheringlab.com/echo/the-false-sovereign/',
        'https://wuwa.wiki/en/codex/echoes/60001215',
        'https://wuthering.gg/echos/the-false-sovereign',
      ],
      checkedAt: '2026-08-23',
      notes: [
        'Rank-5 active cast is 55.35% x4 = 221.4% total, matching Augusta step 14 motionValue 2.214.',
        'Rank-5 Intro auto-summon is 405% = 4.05, matching Augusta step 1E.',
        'Main-slot Electro/Heavy bonuses are intentionally stored in EchoEffectModel, not here.',
      ],
    },
  },
];
