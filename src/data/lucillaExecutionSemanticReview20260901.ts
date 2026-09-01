import { LUCILLA_STANDARD_PENDING_EXECUTION_IDS } from './profileLucillaImpact20260901.ts';

export const LUCILLA_GLOMMOTH_ACTIVE_DAMAGE_SEMANTIC_REVIEW_20260901 = {
  reviewId: 'ECHO-EXECUTION-GLOMMOTH-2026-09-01-01',
  pendingExecutionId: LUCILLA_STANDARD_PENDING_EXECUTION_IDS.glommothScaling,
  checkedAt: '2026-09-01',
  status: 'BLOCKED_SOURCE_SEMANTICS',
  blockerId: 'BUG-015',
  actionKey: 'echo:glommoth-active-damage-scaling',
  echoId: 'echo-60001955',
  rank: 5,
  sourceDamageCoefficient: 2.736,
  sourceLabels: [
    'Wuthering Waves Wiki — Glommoth Echo',
    'Game8 — Glommoth Echo Skill',
    'Wuthering.gg — Glommoth Echo Ability',
  ],
  sourceUrls: [
    'https://wutheringwaves.fandom.com/wiki/Glommoth/Echo',
    'https://game8.co/games/Wuthering-Waves/archives/578130',
    'https://wuthering.gg/echos/glommoth',
  ],
  unresolvedSemantics: [
    'Reviewed current sources agree on the exact Rank-5 active hit coefficient: 273.60% Glacio DMG.',
    'The reviewed public text does not identify an explicit ATK/DEF/HP scaling stat for that coefficient.',
    'Bellibing must not route 273.60% through the generic Echo active-damage primitive until the scaling stat is independently source-resolved.',
  ],
} as const;
