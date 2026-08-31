import type { EchoAttackProfile } from '../echoAttackDomain.ts';

const ECHO_SKILL_SOURCE_URL = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Echoes.json';

/**
 * Source-exact Rank-5 Mech Abomination active cast facts.
 *
 * The summon timing is deliberately not materialized: the pinned source proves
 * the damage components and their classification, but not an executable delay
 * between the cast, Mech Waste hit, and explosion.
 */
export const MECH_ABOMINATION_ATTACK_PROFILE: EchoAttackProfile = {
  echoId: 'echo-60000485',
  rank: 5,
  cooldownSeconds: 20,
  attacks: [
    {
      attackId: 'MECH_ABOMINATION_FRONT_STRIKE',
      name: 'Mech Abomination — front strike',
      trigger: 'ACTIVE_CAST',
      element: 'Electro',
      scalingStat: 'ATK',
      components: [{ motionValuePerHit: 0.4864, hits: 1 }],
    },
    {
      attackId: 'MECH_ABOMINATION_WASTE',
      name: 'Mech Abomination — Mech Waste hit and explosion',
      trigger: 'ACTIVE_CAST',
      element: 'Electro',
      scalingStat: 'ATK',
      sourceDamageClass: 'OUTRO',
      components: [
        { motionValuePerHit: 3.2, hits: 1 },
        { motionValuePerHit: 1.6, hits: 1 },
      ],
    },
  ],
  provenance: {
    sourceLabels: ['wuwabuild Echo skill rendered English text + exact pinned Rank-5 params'],
    sourceUrls: [ECHO_SKILL_SOURCE_URL],
    checkedAt: '2026-08-31',
    notes: [
      'Rank-5 source resolves the front strike to 48.64% ATK Electro DMG, the Mech Waste hit to 320% ATK Electro DMG, and the later Waste explosion to 160% ATK Electro DMG.',
      'The source explicitly classifies Mech Waste damage as Resonator Outro Skill DMG; that classification is preserved on the Waste attack fact instead of flattened into generic Echo damage.',
      'The source gives a 20-second cooldown. It does not give an exact executable delay for the summoned Waste hit or explosion, so this profile proves attack math but not a rotation timeline.',
    ],
  },
};
