import type { EchoAttackProfile } from '../echoAttackDomain.ts';
import type { EchoEffectModel } from '../echoEffectDomain.ts';

const SOURCE_COMMIT = '5fa70b11f1d84fb644e4dbed47873708da0fe66f';
const SOURCE_URL = `https://github.com/DommyMM/wuwabuild/blob/${SOURCE_COMMIT}/public/Data/Echoes.json`;
const CHECKED_AT = '2026-08-31';

/**
 * Exact Rank-5 Corrosaurus facts required by Galbrena's canonical profile.
 *
 * Kept in the generic Echo layers so Corrosaurus remains reusable by future
 * team/profile combinations instead of becoming Galbrena-only calculator data.
 */
export const CORROSAURUS_ATTACK_PROFILES_20260831: readonly EchoAttackProfile[] = [
  {
    echoId: 'echo-60001205',
    rank: 5,
    cooldownSeconds: 20,
    attacks: [
      {
        attackId: 'CORROSAURUS_ACTIVE_STRIKE',
        name: 'Corrosaurus — active strike',
        trigger: 'ACTIVE_CAST',
        element: 'Fusion',
        scalingStat: 'ATK',
        components: [{ motionValuePerHit: 2.736, hits: 1 }],
      },
    ],
    provenance: {
      sourceLabels: ['wuwabuild Echo skill rendered English text + exact pinned Rank-5 params'],
      sourceUrls: [SOURCE_URL],
      checkedAt: CHECKED_AT,
      notes: [
        'Pinned Rank-5 source row resolves the summon to one 273.60% Fusion DMG hit and a 20-second cooldown.',
        'The permanent main-slot Fusion and Echo Skill bonuses are effect facts and are not duplicated in this attack record.',
        'This attack fact proves damage mechanics only. An executable profile rotation must still prove the Corrosaurus cast event and its timestamp.',
      ],
    },
  },
];

export const CORROSAURUS_EFFECT_MODELS_20260831: readonly EchoEffectModel[] = [
  {
    effectId: 'ECHO_60001205_ECHO_SKILL_DMG',
    echoId: 'echo-60001205',
    statOrEffect: 'Echo Skill DMG Bonus',
    value: 0.20,
    activation: 'MAIN_SLOT_PASSIVE',
    trigger: 'Corrosaurus equipped in the main Echo slot',
    durationSeconds: null,
    appliesTo: 'WIELDER',
    mechanicsStatus: 'VERIFIED_MODELED',
    notes: 'Source-explicit permanent main-slot bonus from the rendered English Echo skill text. The existing +12% Fusion main-slot row remains separate.',
    provenance: {
      sourceLabels: ['wuwabuild Echo skill rendered English text + exact pinned Rank-5 params'],
      sourceUrls: [SOURCE_URL],
      checkedAt: CHECKED_AT,
      notes: [`Pinned upstream source commit ${SOURCE_COMMIT}.`],
    },
  },
];
