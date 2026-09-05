export const REFERENCE_TEAM_01_IUNO_AUGUSTA_HANDOFF_REVIEW_20260905 = {
  reviewId: 'REFERENCE-TEAM-01-IUNO-AUGUSTA-HANDOFF-2026-09-05-01',
  teamProfileId: 'augusta-iuno-shorekeeper',
  outgoingCharacterId: 'iuno',
  incomingCharacterId: 'augusta',
  outgoingRotationId: 'iuno-augusta-sub-dps-standard',
  incomingRotationId: 'augusta-standard-iuno-shorekeeper',
  incomingEntry: 'INTRO_SKILL',
  checkedAt: '2026-09-05',
  disposition: 'RELATIVE_HANDOFF_AUTHORIZED',
  sourceLabels: [
    'Prydwen — Iuno gameplay/Standard Sub DPS Rotation',
    'Prydwen — Augusta gameplay/Core Rotation',
  ],
  sourceUrls: [
    'https://www.prydwen.gg/wuthering-waves/characters/iuno',
    'https://www.prydwen.gg/wuthering-waves/characters/augusta',
  ],
  sourceEstablished: [
    'Iuno current gameplay identifies Standard Sub DPS Rotation as the preferred rotation when using Augusta, states that it buffs Augusta the most, and ends the sequence with Absolute Fullness (Swap) followed by Outro.',
    'Iuno current kit states that Outro buffs the next character switched in for 14 seconds and ends early if that affected character switches off field.',
    'Augusta current gameplay states that her core rotation runs under an Amplify Outro in her best teams and that switching Augusta out during the rotation ends that kind of buff.',
    'Augusta current team-flow guidance places the secondary buffer immediately before Augusta returns to execute her core rotation; Iuno is identified on the same page as Augusta’s best Outro buffer.',
    'For the selected Augusta/Iuno/Shorekeeper Reference Team and the selected Iuno Augusta-Sub-DPS profile, the terminal Iuno Outro therefore hands directly to Augusta’s Intro/core-rotation start.',
  ],
  unresolvedSemantics: [
    'No absolute team timestamp is claimed for Iuno field time, Shorekeeper field time or the Iuno Outro event.',
    'This evidence authorizes only a relative origin where Iuno Outro -> Augusta Intro is t=0 for the selected Augusta rotation envelope.',
    'It does not provide per-action Augusta timestamps, Full Moon Domain timing, Wan Light Shield timestamps, Shorekeeper timing or a reusable arbitrary-team handoff schedule.',
  ],
  closesReferenceTeamDependencyIds: [
    'iuno-outro-augusta-window-overlap',
    'iuno-moonlit-augusta-window-overlap',
  ],
} as const;
