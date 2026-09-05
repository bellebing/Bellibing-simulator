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
    'Augusta current team-flow guidance routes the third slot through its own Outro into the secondary buffer before Augusta returns; the same page identifies Iuno as Augusta’s best Outro buffer and Shorekeeper as the best third slot for Augusta teams.',
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

export const REFERENCE_TEAM_01_SHOREKEEPER_OUTRO_AUGUSTA_OVERLAP_REVIEW_20260905 = {
  reviewId: 'REFERENCE-TEAM-01-SHOREKEEPER-OUTRO-AUGUSTA-OVERLAP-2026-09-05-01',
  teamProfileId: 'augusta-iuno-shorekeeper',
  sourceCharacterId: 'the-shorekeeper',
  targetCharacterId: 'augusta',
  sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
  shorekeeperRotationId: 'shorekeeper-augusta-support-standard',
  iunoRotationId: 'iuno-augusta-sub-dps-standard',
  augustaRotationId: 'augusta-standard-iuno-shorekeeper',
  checkedAt: '2026-09-05',
  disposition: 'SOURCE_EXPLICIT_TEAM_OVERLAP_AUTHORIZED',
  sourceLabels: [
    'Prydwen — The Shorekeeper kit/gameplay',
    'Game8 — Shorekeeper Augusta + Iuno team rotation',
  ],
  sourceUrls: [
    'https://www.prydwen.gg/wuthering-waves/characters/the-shorekeeper',
    'https://game8.co/games/Wuthering-Waves/archives/463667',
  ],
  sourceEstablished: [
    'The Shorekeeper current kit states that Binary Butterfly Amplifies all nearby party members’ DMG by 15% for up to 30 seconds.',
    'The Shorekeeper current gameplay instructs players to summon Stellarealm and immediately perform Outro into another team member’s Intro, after which one additional Intro fully upgrades the realm.',
    'Game8’s Augusta + Iuno + Shorekeeper team guidance explicitly describes Shorekeeper as applying Stellarealm and Outro buffs, Iuno as applying the Heavy Attack buff, and Augusta as then utilizing those buffs through her damage rotation before the team returns to Shorekeeper.',
    'The selected Bellibing Shorekeeper rotation ends Liberation -> Outro, the selected Iuno rotation begins with Intro, and PR #170 separately source-locks the terminal Iuno Outro -> Augusta Intro/core-start handoff.',
    'For this exact selected Reference Team flow, Shorekeeper Binary Butterfly is therefore source-explicitly active for Augusta’s core damage phase without requiring Bellibing to invent an absolute team timestamp.',
  ],
  unresolvedSemantics: [
    'No absolute Shorekeeper Outro timestamp or Iuno field-time duration is claimed by this review.',
    'This review does not authorize Stellar Symphony, Rejuvenating Glow, Fallacy or Stellarealm party-crit overlap; each retains its own trigger/state dependency.',
    'No per-action Augusta timestamps are introduced and no Augusta DPS consumer is changed by this evidence alone.',
  ],
  closesReferenceTeamDependencyIds: [
    'shorekeeper-outro-augusta-window-overlap',
  ],
} as const;

export const REFERENCE_TEAM_01_SHOREKEEPER_STELLAREALM_AUGUSTA_OVERLAP_REVIEW_20260905 = {
  reviewId: 'REFERENCE-TEAM-01-SHOREKEEPER-STELLAREALM-AUGUSTA-OVERLAP-2026-09-05-01',
  teamProfileId: 'augusta-iuno-shorekeeper',
  sourceCharacterId: 'the-shorekeeper',
  targetCharacterId: 'augusta',
  sourceFactId: 'the-shorekeeper-liberation-stellarealms',
  shorekeeperRotationId: 'shorekeeper-augusta-support-standard',
  iunoRotationId: 'iuno-augusta-sub-dps-standard',
  augustaRotationId: 'augusta-standard-iuno-shorekeeper',
  checkedAt: '2026-09-05',
  disposition: 'SOURCE_EXPLICIT_STELLAREALM_STAGE_AND_RECIPIENT_AUTHORIZED',
  sourceLabels: [
    'Prydwen — The Shorekeeper kit/gameplay',
    'Prydwen — Augusta gameplay/teams',
    'Game8 — Iuno Augusta + Shorekeeper team rotation',
  ],
  sourceUrls: [
    'https://www.prydwen.gg/wuthering-waves/characters/the-shorekeeper',
    'https://www.prydwen.gg/wuthering-waves/characters/augusta',
    'https://game8.co/games/Wuthering-Waves/archives/524889',
  ],
  sourceEstablished: [
    'The Shorekeeper current kit states that End Loop creates Outer Stellarealm, the first party Intro used within Outer evolves it to Inner, and the second party Intro used within Inner evolves it to Supernal; Inner/Supernal provide party Crit Rate/Crit DMG from Shorekeeper Energy Regen while the party member is inside the realm.',
    'The Shorekeeper current gameplay explicitly instructs players to summon Stellarealm, immediately Outro into another member’s Intro for the first upgrade, and then use one additional Intro to fully upgrade the realm.',
    'Game8’s exact Augusta + Iuno + Shorekeeper rotation starts on Shorekeeper, uses Liberation to activate Stellarealm, switches to Iuno when Iuno Intro is available, then later switches from Iuno to Augusta when Augusta Intro is available.',
    'Game8 identifies Shorekeeper as the best third slot for this Iuno/Augusta team because of her Crit and ATK buffs, and current Augusta guidance likewise identifies Shorekeeper’s Crit Rate/Crit DMG support as Augusta-facing value.',
    'The selected Bellibing Shorekeeper rotation ends Liberation -> Outro, the selected Iuno rotation begins with Intro, and PR #170 independently source-locks terminal Iuno Outro -> Augusta Intro/core-start. For this selected flow, Iuno is the first party Intro after End Loop and Augusta is the second, so Augusta enters as Supernal Stellarealm is generated and is source-authorized as the selected Crit-buff recipient.',
  ],
  unresolvedSemantics: [
    'No absolute Shorekeeper/Iuno/Augusta team timestamps are created by this review; generic Stellarealm execution still requires explicit chronological events inside the 30s realm.',
    'No Shorekeeper Energy Regen value is hardcoded. The runtime continues to require an explicit query-time current Shorekeeper Energy Regen sample.',
    'Fallacy and other timed Energy Regen composition remain separately unresolved and are not converted into a Crit value by this review.',
    'Active-realm End Loop recast semantics remain source-boundary unresolved.',
    'No party Crit value is consumed by Augusta DPS and no per-action Augusta timestamps are introduced by this evidence alone.',
  ],
  closesReferenceTeamDependencyIds: [
    'shorekeeper-stellarealm-party-crit-to-augusta',
  ],
} as const;
