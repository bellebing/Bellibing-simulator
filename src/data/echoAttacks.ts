import type { EchoAttackProfile } from '../echoAttackDomain.ts';

const ECHO_SKILL_SOURCE_URL = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Echoes.json';

/**
 * Exact Rank-5 Echo attacks only.
 *
 * The roster-wide source review intentionally does not convert generic damage
 * prose into attack profiles when the current source does not prove scaling,
 * hit decomposition, or variant/state semantics. Those Echoes remain source-
 * reviewed but execution-pending instead of receiving guessed ATK scaling.
 */
export const ECHO_ATTACK_PROFILES: readonly EchoAttackProfile[] = [
  {
    echoId: 'echo-60000375',
    rank: 5,
    cooldownSeconds: 20,
    attacks: [
      {
        attackId: 'BELL_BORNE_PROTECTION_BLAST',
        name: 'Bell-Borne Geochelone — protection blast',
        trigger: 'ACTIVE_CAST',
        element: 'Glacio',
        scalingStat: 'DEF',
        components: [{ motionValuePerHit: 1.4592, hits: 1 }],
      },
    ],
    provenance: {
      sourceLabels: ['wuwabuild Echo skill rendered English text + Rank-5 params'],
      sourceUrls: [ECHO_SKILL_SOURCE_URL],
      checkedAt: '2026-08-29',
      notes: [
        'Source text explicitly says the blast deals Glacio DMG based on 145.92% of the current character DEF at Rank 5.',
        'The 15s Bell-Borne Shield, 50% DMG Reduction, 10% DMG Boost, and three-hit removal rule are not flattened into this attack layer; they require a shield/state adapter.',
      ],
    },
  },
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
        'wuwabuild Echo skill source',
        'Wutheringlab',
        'Wuwa Wiki',
        'Wuthering.gg',
      ],
      sourceUrls: [
        'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
        ECHO_SKILL_SOURCE_URL,
        'https://wutheringlab.com/echo/the-false-sovereign/',
        'https://wuwa.wiki/en/codex/echoes/60001215',
        'https://wuthering.gg/echos/the-false-sovereign',
      ],
      checkedAt: '2026-08-29',
      notes: [
        'Rank-5 active cast is 55.35% x4 = 221.4% total, matching Augusta step 14 motionValue 2.214.',
        'Rank-5 Intro auto-summon is 405% = 4.05, matching Augusta step 1E.',
        'Main-slot Electro/Heavy bonuses are intentionally stored in EchoEffectModel, not here.',
      ],
    },
  },
];
