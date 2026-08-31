import type { EchoEffectModel } from '../echoEffectDomain.ts';

const ECHO_SKILL_SOURCE_URL = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Echoes.json';

export const MECH_ABOMINATION_EFFECT_MODELS: readonly EchoEffectModel[] = [
  {
    effectId: 'MECH_ABOMINATION_WIELDER_ATK',
    echoId: 'echo-60000485',
    statOrEffect: 'ATK%',
    value: 0.12,
    activation: 'ON_ECHO_CAST',
    trigger: 'Cast Mech Abomination Echo Skill',
    durationSeconds: 15,
    appliesTo: 'WIELDER',
    mechanicsStatus: 'VERIFIED_MODELED',
    notes: 'Rank-5 source explicitly grants the current character 12% ATK for 15s after the Echo Skill cast. Rotation state must still prove the cast and overlap; this row does not grant automatic uptime.',
    provenance: {
      sourceLabels: ['wuwabuild Echo skill rendered English text + exact pinned Rank-5 params'],
      sourceUrls: [ECHO_SKILL_SOURCE_URL],
      checkedAt: '2026-08-31',
      notes: [
        'The active ATK window is stored separately from Mech Abomination attack math and cooldown.',
        'No cast duration, summon delay, or profile-wide uptime is inferred from this effect fact.',
      ],
    },
  },
] as const;
