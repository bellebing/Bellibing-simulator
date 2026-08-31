import type { EchoAttackProfile } from '../echoAttackDomain.ts';
import type { EchoEffectModel } from '../echoEffectDomain.ts';

const JUE_SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Echoes.json';

export const JINHSI_JUE_PROVENANCE_20260901 = {
  sourceLabels: [
    'wuwabuild normalized Echo snapshot — exact pinned upstream commit',
    'Wuwa Wiki — current Jué Echo skill',
    'Wuthering.gg — current Jué Echo ability',
  ],
  sourceUrls: [
    JUE_SOURCE_SNAPSHOT,
    'https://wuwa.wiki/en/codex/echoes/60000595',
    'https://wuthering.gg/echos/ju%C3%A9',
  ],
  checkedAt: '2026-09-01',
  notes: [
    'Rank-5 active damage, Blessing of Time Skill-DMG bonus, repeated Skill-classified damage, 15s duration and 20s cooldown were cross-checked against current rendered sources.',
    'These are Echo facts only. The canonical jinhsi-standard-opener source sequence does not contain a Jué cast, so this file does not grant any Jué uptime to that profile.',
  ],
} as const;

export const JINHSI_JUE_RANK5_ATTACK_20260901: EchoAttackProfile = {
  echoId: 'echo-60000595',
  rank: 5,
  cooldownSeconds: 20,
  attacks: [
    {
      attackId: 'JUE_ACTIVE_SUMMON',
      name: 'Jué — active summon',
      trigger: 'ACTIVE_CAST',
      element: 'Spectro',
      scalingStat: 'ATK',
      components: [
        { motionValuePerHit: 0.4864, hits: 1 },
        { motionValuePerHit: 0.1946, hits: 5 },
        { motionValuePerHit: 0.4864, hits: 2 },
      ],
    },
  ],
  provenance: JINHSI_JUE_PROVENANCE_20260901,
};

export const JINHSI_JUE_SKILL_BONUS_20260901: EchoEffectModel = {
  effectId: 'JUE_BLESSING_OF_TIME_SKILL_DMG',
  echoId: 'echo-60000595',
  statOrEffect: 'Resonance Skill DMG Bonus',
  value: 0.16,
  activation: 'ON_ECHO_CAST',
  trigger: 'Cast Jué Echo Skill',
  durationSeconds: 15,
  appliesTo: 'WIELDER',
  mechanicsStatus: 'VERIFIED_CONDITIONAL',
  notes: 'Blessing of Time is source-explicit, but uptime requires an actual Jué cast event or explicitly verified carry-in state.',
  provenance: JINHSI_JUE_PROVENANCE_20260901,
};

export const JINHSI_JUE_REPEATED_SKILL_DAMAGE_20260901 = {
  effectId: 'JUE_BLESSING_OF_TIME_REPEATED_DAMAGE',
  echoId: 'echo-60000595',
  rank: 5,
  trigger: 'While Blessing of Time is active, Resonance Skill hits a target',
  element: 'Spectro',
  scalingStat: 'ATK',
  motionValuePerProc: 0.16,
  damageClass: 'SKILL',
  minimumProcIntervalSeconds: 1,
  blessingDurationSeconds: 15,
  adapterStatus: 'PENDING_EXECUTION_ADAPTER',
  notes: 'This repeated damage is not flattened into EchoAttackProfile because it is conditional on later Resonance Skill hit events during the Blessing window.',
  provenance: JINHSI_JUE_PROVENANCE_20260901,
} as const;
