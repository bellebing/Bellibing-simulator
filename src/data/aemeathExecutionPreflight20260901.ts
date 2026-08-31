export type AemeathExecutionPreflightStatus = 'SOURCE_PROVEN' | 'BLOCKED_SOURCE_DATA' | 'BLOCKED_PREDECESSOR_STATE';

export interface AemeathSourceActionMapping {
  readonly step: number;
  readonly sourceAction: string;
  readonly factIds: readonly string[];
  readonly formBefore: 'AEMEATH' | 'MECH' | 'SOURCE_DEPENDENT';
  readonly formAfter: 'AEMEATH' | 'MECH' | 'SOURCE_DEPENDENT';
}

export const AEMEATH_STANDARD_SOURCE_ACTION_FACT_MAP_20260901: readonly AemeathSourceActionMapping[] = [
  { step: 1, sourceAction: 'Intro (Mech)', factIds: ['aemeath-intro-debut-meteoric-radiance'], formBefore: 'SOURCE_DEPENDENT', formAfter: 'MECH' },
  { step: 2, sourceAction: 'Basic: Mech 3', factIds: ['aemeath-mech-basic-3'], formBefore: 'MECH', formAfter: 'MECH' },
  { step: 3, sourceAction: 'Basic: Mech 4 (cancel first slash via Ultimate)', factIds: ['aemeath-mech-basic-4'], formBefore: 'MECH', formAfter: 'MECH' },
  { step: 4, sourceAction: 'Ultimate: Overdrive', factIds: ['aemeath-liberation-heavenfall-overdrive', 'aemeath-liberation-stardust-resonance', 'aemeath-liberation-heavenfall-unbound', 'aemeath-intro-starlume-acceleration'], formBefore: 'MECH', formAfter: 'MECH' },
  { step: 5, sourceAction: 'Basic: Mech 2', factIds: ['aemeath-mech-basic-2'], formBefore: 'MECH', formAfter: 'MECH' },
  { step: 6, sourceAction: 'Basic: Mech 3', factIds: ['aemeath-mech-basic-3'], formBefore: 'MECH', formAfter: 'MECH' },
  { step: 7, sourceAction: 'Basic: Mech 4 (cancel first slash via Skill)', factIds: ['aemeath-mech-basic-4', 'aemeath-forte-seraphic-duo-state'], formBefore: 'MECH', formAfter: 'MECH' },
  { step: 8, sourceAction: 'Skill: Duet Encore', factIds: ['aemeath-forte-seraphic-duet-encore', 'aemeath-forte-seraphic-duo-state'], formBefore: 'MECH', formAfter: 'AEMEATH' },
  { step: 9, sourceAction: 'Basic: Aemeath 2', factIds: ['aemeath-basic-infinity-calibration-2'], formBefore: 'AEMEATH', formAfter: 'AEMEATH' },
  { step: 10, sourceAction: 'Basic: Aemeath 3', factIds: ['aemeath-basic-infinity-calibration-3'], formBefore: 'AEMEATH', formAfter: 'AEMEATH' },
  { step: 11, sourceAction: 'Basic: Aemeath 4 (cancel endlag via Skill)', factIds: ['aemeath-basic-infinity-calibration-4', 'aemeath-forte-seraphic-duo-state'], formBefore: 'AEMEATH', formAfter: 'AEMEATH' },
  { step: 12, sourceAction: 'Skill: Duet Overture', factIds: ['aemeath-forte-seraphic-duet-overture', 'aemeath-forte-seraphic-duo-state'], formBefore: 'AEMEATH', formAfter: 'MECH' },
  { step: 13, sourceAction: 'Heavy: Mech II (cancel endlag via Ultimate)', factIds: ['aemeath-mech-heavy-charged-ii', 'aemeath-liberation-heavenfall-unbound'], formBefore: 'MECH', formAfter: 'MECH' },
  { step: 14, sourceAction: 'Ultimate: Finale', factIds: ['aemeath-liberation-heavenfall-finale', 'aemeath-liberation-heavenfall-unbound'], formBefore: 'MECH', formAfter: 'AEMEATH' },
  { step: 15, sourceAction: 'Skill: Mech Basic 1 (Switch to Mech Form)', factIds: ['aemeath-skill-form-switch', 'aemeath-mech-basic-1'], formBefore: 'AEMEATH', formAfter: 'MECH' },
  { step: 16, sourceAction: 'Outro', factIds: ['aemeath-outro-silent-protection'], formBefore: 'MECH', formAfter: 'MECH' },
] as const;

export const AEMEATH_STANDARD_EXECUTION_PREFLIGHT_20260901 = {
  reviewId: 'AEMEATH-EXECUTION-PREFLIGHT-2026-09-01-01',
  characterId: 'aemeath',
  presetId: 'aemeath-standard',
  teamProfileId: 'aemeath-denia-chisa',
  rotationId: 'aemeath-standard-source-sequence',
  checkedAt: '2026-09-01',
  patch: '3.6',
  sourceSequenceStatus: 'SOURCE_SEQUENCE_ONLY',
  engineModeled: false,
  dpsReady: false,
  exactRotationDurationSeconds: null,
  exactDpsDenominatorSeconds: null,
  exactTeamSpecificEnergyRegenGate: null,
  buildContextAllowed: false,
  freezeAllowed: false,
  sourceProven: {
    formTransitions: [
      'Intro replacement executes in Mech form.',
      'Duet Encore requires the source-defined Seraphic Duo/Synchronization condition, consumes 100 Synchronization Rate, and switches Mech -> Aemeath.',
      'Duet Overture requires the source-defined Seraphic Duo/Synchronization condition, consumes 100 Synchronization Rate, and switches Aemeath -> Mech.',
      'Finale ends the source-defined Unbound/Seraphic Duo state and returns Aemeath from Mech form to Aemeath form.',
      'Form Switch routes Aemeath form back to Mech form and the selected source action continues as Mech Basic 1.',
    ],
    resourceFacts: [
      'Synchronization Rate cap is 200.',
      'Intro recovers 40 Synchronization Rate.',
      'Heavenfall Edict: Overdrive recovers 30 Synchronization Rate.',
      'Aemeath/Mech routine Basic attacks recover Synchronization Rate, but current canonical mechanics source does not expose exact per-action gains.',
      'Duet Encore and Duet Overture each require at least 100 Synchronization Rate and consume 100.',
      'Resonance Rate cap is 4; each Duet grants 1; Overdrive grants 1 and Starlume Acceleration grants one additional Overdrive Resonance Rate.',
      'Under Instant Response + Unbound, Heavy Attack — Mech Charged II restores 200 Synchronization Rate.',
      'Finale requires source-defined Unbound plus capped Synchronization Rate and Resonance Rate, then consumes the resource state.',
    ],
    stateDurations: [
      'Starlume Acceleration: 15s.',
      'Stardust Resonance after Overdrive: 30s.',
      'Heavenfall Edict: Unbound after Overdrive: 60s.',
      'Seraphic Duo after qualifying Basic Attack Stage 4: 5s.',
    ],
    damageClassification: [
      'Duet Encore and Duet Overture are Forte actions whose damage is classified as Resonance Liberation DMG.',
      'Heavy Attack — Mech Charged II is an action-kind Heavy Attack whose source-explicit damage classification is Resonance Liberation DMG.',
      'Overdrive and Finale are Resonance Liberation DMG.',
    ],
    weaponAndSonata: [
      'Everbright Polestar EP-ATTR is permanent All-Attribute DMG.',
      'EP-LIB-DEF and EP-LIB-FUSION-RES are separate 8s SELF windows triggered by the wielder inflicting Fusion Burst or Tune Rupture - Shifting.',
      'Trailblazing Star 2-piece Fusion DMG is permanent.',
      'S27_5PC_CR and S27_5PC_FUSION are separate 8s SELF windows with the same two explicit status-infliction trigger kinds.',
      'status-infliction-timed-self-window-v1 can execute those windows only from an explicit actor/timestamp event; it does not infer uptime.',
    ],
    sigillum: [
      'Sigillum main-slot passive is identity-restricted to Aemeath and grants 25% Resonance Liberation DMG Bonus.',
      'Current source proves Rank-5 active skill values 68.40% + 205.20% Fusion DMG and a 20s cooldown.',
      'Current exact EchoAttackProfile domain also requires scalingStat; current reviewed text does not identify the scaling stat, so active attack math is not promoted by this review.',
      'The canonical aemeath-standard source sequence contains no Echo cast, so Sigillum active damage is not inserted into the rotation.',
    ],
  },
  incomingStateDependencies: [
    {
      dependencyId: 'incoming:denia:aemeath-fusion-burst-predecessor-state',
      producerCharacterId: 'denia',
      status: 'BLOCKED_PREDECESSOR_STATE' as AemeathExecutionPreflightStatus,
      notes: 'Canonical team/profile selection proves Denia is the SUB_DPS in the Fusion Burst team, but Aemeath execution cannot fabricate Denia actions, exact Fusion Burst application timestamps, Echo/Outro transfer lifecycle or resulting incoming windows.',
    },
    {
      dependencyId: 'incoming:chisa:aemeath-negative-status-predecessor-state',
      producerCharacterId: 'chisa',
      status: 'BLOCKED_PREDECESSOR_STATE' as AemeathExecutionPreflightStatus,
      notes: 'Canonical team/profile selection proves Chisa is the SUPPORT. Any Negative Status stack/team effect or healing/Outro-derived state must arrive as an explicit predecessor state; Aemeath execution does not invent Chisa rotation or uptime.',
    },
  ],
  closedExecutionIds: [
    'echo:echo-60001915:sigillum-character-restriction-adapter',
    'weapon:everbright-polestar:EP-LIB-DEF:status-infliction-window-semantics',
    'weapon:everbright-polestar:EP-LIB-FUSION-RES:status-infliction-window-semantics',
    'sonata:sonata-27:S27_5PC_CR:status-infliction-window-semantics',
    'sonata:sonata-27:S27_5PC_FUSION:status-infliction-window-semantics',
  ],
  blockedExecutionIds: [
    'echo:echo-60001915:sigillum-active-skill-scaling-stat',
    'character:aemeath:synchronization-routine-gain-values',
    'character:aemeath:duet-threshold-proof',
    'incoming:denia:aemeath-fusion-burst-predecessor-state',
    'incoming:chisa:aemeath-negative-status-predecessor-state',
    'rotation:aemeath-standard-source-sequence:timing-denominator',
    'rotation:aemeath-standard-source-sequence:engine-model',
  ],
  blockerNotes: [
    'The source action order does not provide exact timestamps, animation/cancel durations or a total canonical rotation duration.',
    'The current source does not expose exact routine Basic-attack Synchronization gains, so the two >=100 Synchronization Duet gates cannot be numerically proven from the canonical action list.',
    'No canonical Aemeath + Denia + Chisa source locks the 115%-125% ER guidance range to one exact numeric execution gate; therefore no numeric team-specific ER gate is promoted.',
    'A third-party timed team rotation exists, but it is a different execution artifact and is not substituted for the canonical aemeath-standard source sequence or its missing denominator.',
    'BuildContext remains fail-closed for SOURCE_SEQUENCE_ONLY rotations and freeze cannot approve this profile before ENGINE_MODELED plus clean dependency closure.',
  ],
} as const;
