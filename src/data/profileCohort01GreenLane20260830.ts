import type {
  CharacterBuildPreset,
  EchoLoadoutProfile,
  RotationProfile,
  StatTargetProfile,
  TeamProfile,
  WeaponRecommendationProfile,
} from '../profileDomain.ts';

const CHECKED_AT = '2026-08-30';
const SEMANTIC_REVIEW = 'data/research/profile-cohort-01-semantic-promotion-review-2026-08-30.json';

type SourceRole = 'MAIN_DPS' | 'HYBRID' | 'SUPPORT';

type ApprovedSpec = {
  readonly characterId: string;
  readonly characterName: string;
  readonly modeKey: string;
  readonly sourceRole: SourceRole;
  readonly sourceUrl: string;
  readonly weaponId: string;
  readonly weaponName: string;
  readonly sonataSetId: string;
  readonly sonataSetName: string;
  readonly mainEchoId: string;
  readonly mainEchoName: string;
  readonly echoMainStats: readonly [string, string, string, string, string];
  readonly statPriority: readonly string[];
  readonly statRelations: readonly string[];
  readonly erGate: null | { readonly minimum: number; readonly preferred?: number; readonly context: string };
  readonly team: readonly [string, string, string];
  readonly teamContext: string;
  readonly rotation: readonly string[];
  readonly rotationContext: string;
  readonly sourceNotes: readonly string[];
  readonly isDefault: true;
};

function sourceRole(role: SourceRole): 'DPS' | 'SUB_DPS' | 'SUPPORT' {
  if (role === 'MAIN_DPS') return 'DPS';
  if (role === 'SUPPORT') return 'SUPPORT';
  return 'SUB_DPS';
}

function normalizeStatName(stat: string): string {
  if (stat === 'Resonance Skill DMG') return 'Skill DMG';
  if (stat === 'Resonance Liberation DMG') return 'Liberation DMG';
  return stat;
}

function echoMainStats(source: string): EchoLoadoutProfile['slots'][number]['primaryMainStats'] {
  if (source.includes(' / ')) {
    return source.split(' / ').map((stat) => ({ stat: normalizeStatName(stat), priority: 1, notes: `Source relation: ${source}` }));
  }
  if (source.includes(' ≥ ')) {
    return source.split(' ≥ ').map((stat) => ({ stat: normalizeStatName(stat), priority: 1, notes: `Source relation: ${source}` }));
  }
  if (source.includes(' > ')) {
    return source.split(' > ').map((stat, index) => ({ stat: normalizeStatName(stat), priority: index + 1, notes: `Source relation: ${source}` }));
  }
  return [{ stat: normalizeStatName(source), priority: 1 }];
}

function statRules(spec: ApprovedSpec): StatTargetProfile['targetRules'] {
  const ordered = spec.statPriority.map(normalizeStatName);
  const equality = spec.statRelations.flatMap((relation) => {
    const match = /^(.+?) = (.+?)(?: after .*)?$/.exec(relation);
    return match ? [[normalizeStatName(match[1]), normalizeStatName(match[2])] as const] : [];
  });
  const groups: string[][] = [];
  for (const stat of ordered) {
    const matches = equality.filter(([left, right]) => left === stat || right === stat).flat();
    const existing = groups.find((group) => group.some((entry) => matches.includes(entry)));
    if (existing) {
      for (const entry of [stat, ...matches]) if (!existing.includes(entry)) existing.push(entry);
    } else {
      groups.push([...new Set([stat, ...matches])]);
    }
  }
  return ordered.map((stat) => {
    const priority = groups.findIndex((group) => group.includes(stat)) + 1;
    const notes = spec.statRelations.filter((relation) => relation.includes(stat));
    return { stat, priority, ...(notes.length > 0 ? {notes: notes.join(' ')} : {}) };
  });
}

function provenance(spec: ApprovedSpec) {
  return {
    sourceLabels: [`Prydwen ${spec.characterName} current build/profile`, 'Cohort 01 semantic promotion review'],
    sourceUrls: [spec.sourceUrl],
    checkedAt: CHECKED_AT,
    notes: [
      `Semantic approval source: ${SEMANTIC_REVIEW}.`,
      `Reviewed mode/team context: ${spec.modeKey}; ${spec.teamContext}`,
      `Reviewed Echo shell: ${spec.sonataSetName} / ${spec.mainEchoName}.`,
      spec.erGate?.context ?? 'No exact numeric Energy Regen gate is claimed for this reviewed team/set context.',
      `Reviewed source rotation context: ${spec.rotationContext}`,
      ...spec.sourceNotes,
      'SOURCE_SEQUENCE_ONLY is verified source transcription, not ENGINE_MODELED execution; no duration, uptime or animation-frame timing is inferred.',
    ],
  } as const;
}

function materialize(spec: ApprovedSpec) {
  const baseId = `${spec.characterId}-${spec.modeKey}`;
  const weaponRecommendationProfileId = `${baseId}-weapons`;
  const echoLoadoutProfileId = `${baseId}-echoes`;
  const statTargetProfileId = `${baseId}-stats`;
  const teamProfileId = `${baseId}-team`;
  const rotationProfileId = `${baseId}-rotation`;
  const prov = provenance(spec);

  const weapon: WeaponRecommendationProfile = {
    kind: 'WEAPON_RECOMMENDATION',
    id: weaponRecommendationProfileId,
    name: `${spec.characterName} — ${spec.modeKey} Weapons`,
    characterId: spec.characterId,
    defaultWeaponId: spec.weaponId,
    options: [{ weaponId: spec.weaponId, rank: 1, label: `Reviewed source recommendation: ${spec.weaponName}` }],
    verificationStatus: 'VERIFIED',
    provenance: prov,
  };

  const echo: EchoLoadoutProfile = {
    kind: 'ECHO_LOADOUT',
    id: echoLoadoutProfileId,
    name: `${spec.characterName} — ${spec.modeKey} Echoes`,
    characterId: spec.characterId,
    slots: [4, 3, 3, 1, 1].map((cost, index) => ({
      cost: cost as 1 | 3 | 4,
      primaryMainStats: echoMainStats(spec.echoMainStats[index]),
    })),
    sonataSetIds: [spec.sonataSetId],
    mainEchoId: spec.mainEchoId,
    verificationStatus: 'VERIFIED',
    provenance: prov,
  };

  const stats: StatTargetProfile = {
    kind: 'STAT_TARGET',
    id: statTargetProfileId,
    name: `${spec.characterName} — ${spec.modeKey} Stats`,
    characterId: spec.characterId,
    targetRules: statRules(spec),
    gates: spec.erGate == null ? [] : [{
      stat: 'Energy Regen Total',
      minimum: spec.erGate.minimum,
      preferred: spec.erGate.preferred ?? spec.erGate.minimum,
      notes: spec.erGate.context,
    }],
    verificationStatus: 'VERIFIED',
    provenance: prov,
  };

  const team: TeamProfile = {
    kind: 'TEAM',
    id: teamProfileId,
    name: `${spec.characterName} — ${spec.modeKey} Team`,
    members: spec.team.map((characterId) => ({
      characterId,
      role: characterId === spec.characterId ? sourceRole(spec.sourceRole) : 'FLEX',
    })),
    verificationStatus: 'VERIFIED',
    provenance: prov,
  };

  const rotation: RotationProfile = {
    kind: 'ROTATION',
    id: rotationProfileId,
    name: `${spec.characterName} — ${spec.modeKey} Source Rotation`,
    characterId: spec.characterId,
    teamProfileId,
    executionStatus: 'SOURCE_SEQUENCE_ONLY',
    sourceSequence: spec.rotation,
    variantKey: spec.modeKey,
    modeledMechanicFactIds: [],
    assumedMechanicFactIds: [],
    verificationStatus: 'VERIFIED',
    provenance: prov,
  };

  const preset: CharacterBuildPreset = {
    kind: 'CHARACTER_PRESET',
    id: baseId,
    name: `${spec.characterName} — ${spec.modeKey}`,
    characterId: spec.characterId,
    modeKey: spec.modeKey,
    displayLabel: spec.modeKey,
    sequence: 0,
    isDefault: spec.isDefault,
    uiSelectable: true,
    weaponRecommendationProfileId,
    echoLoadoutProfileId,
    statTargetProfileId,
    teamProfileId,
    rotationProfileId,
    verificationStatus: 'VERIFIED',
    provenance: prov,
  };

  return { weapon, echo, stats, team, rotation, preset };
}

const APPROVED_SPECS: readonly ApprovedSpec[] = [
  {
    characterId: 'lumi', characterName: 'Lumi', modeKey: 'hybrid', sourceRole: 'HYBRID',
    sourceUrl: 'https://www.prydwen.gg/wuthering-waves/characters/lumi',
    weaponId: 'ages-of-harvest', weaponName: 'Ages of Harvest',
    sonataSetId: 'sonata-8', sonataSetName: 'Moonlit Clouds', mainEchoId: 'echo-60000525', mainEchoName: 'Impermanence Heron',
    echoMainStats: ['CRIT Rate / CRIT DMG', 'Electro DMG', 'Electro DMG > Energy Regen', 'ATK%', 'ATK%'],
    statPriority: ['Energy Regen', 'CRIT Rate', 'CRIT DMG', 'ATK%', 'Flat ATK'], statRelations: ['CRIT Rate = CRIT DMG'],
    erGate: { minimum: 1.42, preferred: 1.42, context: '142% is the source lower ER estimate explicitly tied to Carlotta + The Shorekeeper; the 150% Phrolova-team estimate is not applied here.' },
    team: ['lumi', 'carlotta', 'the-shorekeeper'], teamContext: 'Reviewed Hybrid calculation/stat context with Carlotta + The Shorekeeper.',
    rotation: ['Intro', 'Ultimate', 'Skill: Energized Pounce (optional swap cancel and return)', 'Red Spotlight: Basic 1', 'Red Spotlight: Basic 2', 'Red Spotlight: Basic 3 (optional swap cancel and return)', 'Skill: Energized Rebound', 'Yellow Light: Basic', 'Channelled Dash: Glare x6', 'Skill: Energized Pounce', 'Echo: Impermanence Heron (swap cancel)', 'Outro'],
    rotationContext: 'Current Prydwen Hybrid sequence; optional swap cancels stay textual rather than timed.',
    sourceNotes: ['Current source presents Hybrid as Lumi’s primary practical use and dedicated Main DPS as a separate non-optimal path.'],
    isDefault: true,
  },
  {
    characterId: 'yinlin', characterName: 'Yinlin', modeKey: 'moonlit', sourceRole: 'HYBRID',
    sourceUrl: 'https://www.prydwen.gg/wuthering-waves/characters/yinlin',
    weaponId: 'stringmaster', weaponName: 'Stringmaster',
    sonataSetId: 'sonata-8', sonataSetName: 'Moonlit Clouds', mainEchoId: 'echo-60000525', mainEchoName: 'Impermanence Heron',
    echoMainStats: ['CRIT Rate / CRIT DMG', 'Electro DMG', 'Electro DMG > ATK%', 'ATK%', 'ATK%'],
    statPriority: ['Energy Regen', 'CRIT Rate', 'CRIT DMG', 'ATK%', 'Flat ATK', 'Resonance Skill DMG'], statRelations: ['CRIT Rate = CRIT DMG', 'Flat ATK = Resonance Skill DMG after ATK%'],
    erGate: { minimum: 1.28, preferred: 1.28, context: '128%+ is explicitly estimated in Xiangli Yao + The Shorekeeper, exactly matching the reviewed Moonlit team.' },
    team: ['yinlin', 'xiangli-yao', 'the-shorekeeper'], teamContext: 'Reviewed Hybrid Moonlit context with Xiangli Yao + The Shorekeeper.',
    rotation: ['Intro', 'Basic 4 (optional swap cancel)', 'Skill: Magnetic Roar', 'Heavy Attack', 'Skill: Lightning Execution (cancel Heavy Attack endlag)', 'Ultimate', 'Basic 1', 'Forte Heavy: Chameleon Cipher', 'Echo: Impermanence Heron (swap cancel)', 'Outro'],
    rotationContext: 'Current source standard Yinlin sequence with explicit Heavy endlag and Heron swap cancels.',
    sourceNotes: ['Current source says Hybrid Yinlin will nearly always use Moonlit Clouds in optimal sets and explicitly warns against Main DPS use.'],
    isDefault: true,
  },
  {
    characterId: 'calcharo', characterName: 'Calcharo', modeKey: 'standard', sourceRole: 'MAIN_DPS',
    sourceUrl: 'https://www.prydwen.gg/wuthering-waves/characters/calcharo',
    weaponId: 'wildfire-mark', weaponName: 'Wildfire Mark',
    sonataSetId: 'sonata-3', sonataSetName: 'Void Thunder', mainEchoId: 'echo-60000885', mainEchoName: 'Nightmare: Thundering Mephis',
    echoMainStats: ['CRIT Rate / CRIT DMG', 'Electro DMG', 'Electro DMG > ATK%', 'ATK%', 'ATK%'],
    statPriority: ['Energy Regen', 'CRIT Rate', 'CRIT DMG', 'ATK%', 'Flat ATK', 'Liberation DMG'], statRelations: ['CRIT Rate = CRIT DMG', 'Flat ATK = Liberation DMG after ATK%'],
    erGate: { minimum: 1.2, preferred: 1.2, context: '120% is the source lower ER estimate explicitly tied to Lynae + The Shorekeeper; the higher quickswap estimate is not applied here.' },
    team: ['calcharo', 'lynae', 'the-shorekeeper'], teamContext: 'Reviewed Main DPS calculation/stat context with Lynae + The Shorekeeper.',
    rotation: ['Echo: Nightmare - Thundering Mephis (before burst; swap cancel)', 'Intro', 'Ultimate', 'Heavy: Death Messenger (optional swap cancel)', 'Basic: Hounds Roar 1', 'Basic: Hounds Roar 2 (Dash Cancel)', 'Basic: Hounds Roar 1', 'Basic: Hounds Roar 2 (Dash Cancel)', 'Basic: Hounds Roar 1', 'Heavy: Death Messenger (optional swap cancel)', 'Basic: Hounds Roar 1', 'Basic: Hounds Roar 2 (Dash Cancel)', 'Basic: Hounds Roar 1', 'Basic: Hounds Roar 2 (Dash Cancel)', 'Basic: Hounds Roar 1', 'Heavy: Death Messenger', 'Outro'],
    rotationContext: 'Current source optimized burst; warmup alternatives remain source notes and are not converted into executable timing.',
    sourceNotes: ['Source also publishes two warmup alternatives. Their existence is preserved by the research refresh and does not change this primary source sequence.'],
    isDefault: true,
  },
  {
    characterId: 'cantarella', characterName: 'Cantarella', modeKey: 'standard', sourceRole: 'HYBRID',
    sourceUrl: 'https://www.prydwen.gg/wuthering-waves/characters/cantarella',
    weaponId: 'whispers-of-sirens', weaponName: 'Whispers of Sirens',
    sonataSetId: 'sonata-12', sonataSetName: 'Midnight Veil', mainEchoId: 'echo-60000825', mainEchoName: 'Lorelei',
    echoMainStats: ['CRIT Rate / CRIT DMG', 'Havoc DMG', 'Havoc DMG > Energy Regen', 'ATK%', 'ATK%'],
    statPriority: ['Energy Regen', 'CRIT Rate', 'CRIT DMG', 'ATK%', 'Flat ATK', 'Basic Attack DMG'], statRelations: ['CRIT Rate = CRIT DMG', 'Flat ATK = Basic Attack DMG after ATK%'],
    erGate: null,
    team: ['cantarella', 'phrolova', 'qiuyuan'], teamContext: 'Reviewed Hybrid calculation context with Phrolova + Qiuyuan; Havoc teammate context resolves Midnight Veil.',
    rotation: ['Intro Skill: Ripple', 'Basic 3', 'Skill: Graceful Step', 'Ultimate: Flowing Suffocation', 'Heavy Attack: Delusive Dive', 'Skill: Flickering Reverie', 'Forte: Phantom String 1', 'Forte: Phantom String 2', 'Forte: Phantom String 3', 'Forte Skill: Perception Drain', 'Echo: Lorelei (end of rotation; swap cancel)', 'Outro'],
    rotationContext: 'Current standard sequence with source-explicit Lorelei end placement/swap cancel.',
    sourceNotes: ['The source ER examples span 120%-140% across different Midnight/Havoc and Moonlit/non-Havoc contexts, but no exact numeric gate is fabricated for the reviewed Phrolova + Qiuyuan trio.'],
    isDefault: true,
  },
  {
    characterId: 'carlotta', characterName: 'Carlotta', modeKey: 'standard', sourceRole: 'MAIN_DPS',
    sourceUrl: 'https://www.prydwen.gg/wuthering-waves/characters/carlotta',
    weaponId: 'the-last-dance', weaponName: 'The Last Dance',
    sonataSetId: 'sonata-10', sonataSetName: 'Frosty Resolve', mainEchoId: 'echo-60000835', mainEchoName: 'Sentry Construct',
    echoMainStats: ['CRIT Rate / CRIT DMG', 'Glacio DMG', 'Glacio DMG ≥ ATK%', 'ATK%', 'ATK%'],
    statPriority: ['Energy Regen', 'CRIT Rate', 'CRIT DMG', 'ATK%', 'Resonance Skill DMG', 'Flat ATK'], statRelations: ['CRIT Rate = CRIT DMG'],
    erGate: { minimum: 1.08, preferred: 1.08, context: '108% is the source lower ER estimate explicitly tied to Zhezhi + The Shorekeeper; the higher Cantarella-team estimate is not applied here.' },
    team: ['carlotta', 'zhezhi', 'the-shorekeeper'], teamContext: 'Reviewed Hyper Carry DPS calculation context with Zhezhi + The Shorekeeper.',
    rotation: ['Start burst with source-defined Substance state', 'Intro: Wintertime Aria', 'Skill: Art of Violence', 'Skill: Chromatic Splendor', 'Mid-Air Attack', 'Forte Heavy: Imminent Oblivion', 'Ultimate: Era of New Wave', 'Death Knell 1', 'Death Knell 2', 'Death Knell 3', 'Death Knell 4', 'Fatal Finale', 'Skill: Art of Violence', 'Skill: Chromatic Splendor', 'Echo: Sentry Construct (swap cancel)', 'Outro'],
    rotationContext: 'Current source burst; zero-Substance warmup remains a separate source alternative and no resource timing is invented.',
    sourceNotes: ['Current source calls Frosty Resolve Carlotta’s best set bar none and Sentry Construct its best main Echo.'],
    isDefault: true,
  },
  {
    characterId: 'changli', characterName: 'Changli', modeKey: 'standard', sourceRole: 'HYBRID',
    sourceUrl: 'https://www.prydwen.gg/wuthering-waves/characters/changli',
    weaponId: 'blazing-brilliance', weaponName: 'Blazing Brilliance',
    sonataSetId: 'sonata-2', sonataSetName: 'Molten Rift', mainEchoId: 'echo-60000915', mainEchoName: 'Nightmare: Inferno Rider',
    echoMainStats: ['CRIT Rate / CRIT DMG', 'Fusion DMG', 'ATK% ≥ Fusion DMG', 'ATK%', 'ATK%'],
    statPriority: ['Energy Regen', 'CRIT Rate', 'CRIT DMG', 'ATK%', 'Flat ATK', 'Resonance Skill DMG'], statRelations: ['CRIT Rate = CRIT DMG'],
    erGate: { minimum: 1.08, preferred: 1.08, context: '108% is the source lower Mono Fusion ER condition; the reviewed Changli + Brant + Lupa trio is explicitly all Fusion.' },
    team: ['changli', 'brant', 'lupa'], teamContext: 'Reviewed Mono Fusion Hybrid context with Brant + Lupa.',
    rotation: ['Intro', 'Basic: True Sight - Charge', 'Skill', 'Heavy Attack', 'Basic: True Sight - Charge', 'Basic Mid-Air (interrupt via Dash)', 'Dash', 'Basic Mid-Air 4', 'Basic: True Sight - Charge', 'Skill', 'Basic: True Sight - Conquest', 'Heavy: Flaming Sacrifice', 'Ultimate', 'Heavy: Flaming Sacrifice (Swap)', 'Outro'],
    rotationContext: 'Current source Standard Rotation explicitly highlighted for Changli + Brant + Lupa.',
    sourceNotes: ['The optional Ultimate -> Flaming Sacrifice opener remains a source alternative; no timing is inferred.'],
    isDefault: true,
  },
  {
    characterId: 'chisa', characterName: 'Chisa', modeKey: 'standard', sourceRole: 'SUPPORT',
    sourceUrl: 'https://www.prydwen.gg/wuthering-waves/characters/chisa',
    weaponId: 'kumokiri', weaponName: 'Kumokiri',
    sonataSetId: 'sonata-7', sonataSetName: 'Rejuvenating Glow', mainEchoId: 'echo-60000605', mainEchoName: 'Fallacy of No Return',
    echoMainStats: ['CRIT Rate / CRIT DMG', 'Havoc DMG', 'Havoc DMG ≥ ATK%', 'ATK%', 'ATK%'],
    statPriority: ['Energy Regen', 'CRIT Rate', 'CRIT DMG', 'ATK%', 'Liberation DMG', 'Flat ATK'], statRelations: ['CRIT Rate = CRIT DMG'],
    erGate: { minimum: 1.25, preferred: 1.25, context: '125%+ is the source ER target in the same Aemeath + Denia calculation context used by this profile.' },
    team: ['chisa', 'aemeath', 'denia'], teamContext: 'Reviewed Negative Status Support calculation context with Aemeath + Denia.',
    rotation: ['Intro', 'Basic 2', 'Basic: Rending Lunge', 'Basic: Death Snip (partial animation interruption via Ultimate)', 'Ultimate', 'Skill: Serrated Loop', 'Basic: Sawring Blitz 2', 'Basic: Sawring Blitz 3', 'Echo: Fallacy of No Return (before Outro for Rejuvenating Glow support timing)', 'Basic: Eradication (Swap)', 'Outro'],
    rotationContext: 'Current loop rotation with source-explicit Rejuvenating Glow/Fallacy placement before Outro and source cancel relationships.',
    sourceNotes: ['The separate opener remains source-audited in the research refresh; no cancel frame or animation duration is inferred.'],
    isDefault: true,
  },
] as const;

const MATERIALIZED = APPROVED_SPECS.map(materialize);

export const PROFILE_COHORT_01_GREEN_LANE_META = {
  cohortId: 'PROFILE-COHORT-01-2026-08-29',
  checkedAt: CHECKED_AT,
  approvedModeCount: APPROVED_SPECS.length,
  approvedCharacterCount: new Set(APPROVED_SPECS.map((spec) => spec.characterId)).size,
  semanticReview: SEMANTIC_REVIEW,
  automationApprovedSemanticTruth: false,
  rotationsRemainSourceSequenceOnly: true,
} as const;

export const PROFILE_COHORT_01_GREEN_LANE_WEAPONS: readonly WeaponRecommendationProfile[] = MATERIALIZED.map((entry) => entry.weapon);
export const PROFILE_COHORT_01_GREEN_LANE_ECHOES: readonly EchoLoadoutProfile[] = MATERIALIZED.map((entry) => entry.echo);
export const PROFILE_COHORT_01_GREEN_LANE_STATS: readonly StatTargetProfile[] = MATERIALIZED.map((entry) => entry.stats);
export const PROFILE_COHORT_01_GREEN_LANE_TEAMS: readonly TeamProfile[] = MATERIALIZED.map((entry) => entry.team);
export const PROFILE_COHORT_01_GREEN_LANE_ROTATIONS: readonly RotationProfile[] = MATERIALIZED.map((entry) => entry.rotation);
export const PROFILE_COHORT_01_GREEN_LANE_PRESETS: readonly CharacterBuildPreset[] = MATERIALIZED.map((entry) => entry.preset);
