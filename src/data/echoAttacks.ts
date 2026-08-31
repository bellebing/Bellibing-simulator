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
    echoId: 'echo-60000535',
    rank: 5,
    cooldownSeconds: 20,
    attacks: [
      {
        attackId: 'DREAMLESS_SIX_STRIKE_COMBO',
        name: 'Dreamless — six-strike combo',
        trigger: 'ACTIVE_CAST',
        element: 'Havoc',
        scalingStat: 'ATK',
        components: [
          { motionValuePerHit: 0.5408, hits: 5 },
          { motionValuePerHit: 2.704, hits: 1 },
        ],
      },
    ],
    provenance: {
      sourceLabels: [
        'wuwabuild Echo skill source identity',
        'Wuthering.gg current Dreamless Rank-5 skill',
      ],
      sourceUrls: [
        ECHO_SKILL_SOURCE_URL,
        'https://wuthering.gg/echos/dreamless',
      ],
      checkedAt: '2026-08-31',
      notes: [
        'Current Rank-5 source resolves Dreamless to five 54.08% ATK Havoc hits plus one 270.40% ATK Havoc hit, totaling 540.8% ATK motion value over six strikes.',
        'The source also gives Dreamless +50% Echo Skill DMG during the first 5 seconds after Rover (Havoc) casts Deadening Abyss. That conditional remains an execution/window concern and is not flattened into this attack magnitude.',
        'The source-proven Dreamless swap cancel in the Rover profile does not provide attack timestamps or total rotation duration.',
      ],
    },
  },
  {
    echoId: 'echo-60000605',
    rank: 5,
    cooldownSeconds: 20,
    attacks: [
      {
        attackId: 'FALLACY_INITIAL_BLAST',
        name: 'Fallacy of No Return — initial blast',
        trigger: 'ACTIVE_CAST',
        element: 'Spectro',
        scalingStat: 'HP',
        components: [{ motionValuePerHit: 0.1586, hits: 1 }],
      },
    ],
    provenance: {
      sourceLabels: [
        'wuwabuild Echo skill rendered text + Rank-5 params',
        'Wutheringlab Fallacy of No Return',
        'Prydwen current Fallacy usage',
      ],
      sourceUrls: [
        ECHO_SKILL_SOURCE_URL,
        'https://wutheringlab.com/echo/fallacy-of-no-return/',
        'https://www.prydwen.gg/wuthering-waves/echoes/',
      ],
      checkedAt: '2026-08-30',
      notes: [
        'Rank-5 source explicitly resolves the normal activation blast to one Spectro hit equal to 15.86% of max HP.',
        'The Hold Echo Skill flurry is not included because the source gives 1.58% max-HP damage per hit but does not define one fixed executable hit count for an arbitrary hold duration.',
        'The 19.82% max-HP release finisher is also excluded because it belongs to the hold/release variant rather than the normal activation blast represented by this attack fact.',
        'The wielder 10% Energy Regen and team 10% ATK effects remain in EchoEffectModel and are not duplicated in the attack layer.',
      ],
    },
  },
  {
    echoId: 'echo-60000885',
    rank: 5,
    cooldownSeconds: 25,
    attacks: [
      {
        attackId: 'NIGHTMARE_THUNDERING_MEPHIS_ACTIVE_STRIKE',
        name: 'Nightmare: Thundering Mephis — active strike',
        trigger: 'ACTIVE_CAST',
        element: 'Electro',
        scalingStat: 'ATK',
        components: [{ motionValuePerHit: 4.05, hits: 1 }],
      },
    ],
    provenance: {
      sourceLabels: [
        'Wuthering Waves Wiki — Nightmare: Thundering Mephis damage data',
        'Wutheringlab — Nightmare: Thundering Mephis Rank-5 skill',
        'wuwabuild Echo skill source identity',
      ],
      sourceUrls: [
        'https://wutheringwaves.fandom.com/wiki/Nightmare:_Thundering_Mephis',
        'https://wutheringlab.com/echo/nightmare-thundering-mephis/',
        ECHO_SKILL_SOURCE_URL,
      ],
      checkedAt: '2026-08-31',
      notes: [
        'Current independent sources agree that the Rank-5 active Echo Skill deals one 405% ATK Electro hit with a 25-second cooldown.',
        'Nightmare: Thundering Mephis main-slot Electro and Resonance Liberation bonuses remain in the Echo effect layer and are not duplicated here.',
        'This exact attack fact authorizes damage resolution only after a profile rotation proves the active Echo cast event; it does not authorize rotation timing by itself.',
      ],
    },
  },
  {
    echoId: 'echo-60001065',
    rank: 5,
    cooldownSeconds: 20,
    attacks: [
      {
        attackId: 'FLEURDELYS_WINDCLEAVER_SUMMON',
        name: 'Reminiscence: Fleurdelys — Windcleaver summon',
        trigger: 'ACTIVE_CAST',
        element: 'Aero',
        scalingStat: 'ATK',
        components: [
          { motionValuePerHit: 0.2736, hits: 8 },
          { motionValuePerHit: 1.368, hits: 1 },
        ],
      },
    ],
    provenance: {
      sourceLabels: ['wuwabuild Echo skill rendered English text + exact pinned Rank-5 params'],
      sourceUrls: [ECHO_SKILL_SOURCE_URL],
      checkedAt: '2026-08-30',
      notes: [
        'The pinned source explicitly defines one summon: 27.36% Aero DMG x8 plus one 136.80% Aero hit at Rank 5, totaling 355.68% ATK motion value.',
        'The fifth source params row is Rank 5, matching the established Echo attack ingestion convention used by Bell-Borne and other exact attack facts.',
        'Fleurdelys main-slot Aero bonuses and the Rover (Aero)/Cartethyia character restriction remain in the Echo effect/applicability layer and are not duplicated here.',
        'This attack fact proves damage mechanics only. A profile rotation must still emit the exact Echo cast before the damage dependency can close.',
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
