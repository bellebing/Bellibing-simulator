import { AEMEATH_CHARACTER_MECHANIC_FACTS } from '../data/characterMechanics/aemeathRawFacts.ts';
import { CHISA_CHARACTER_MECHANIC_FACTS } from '../data/characterMechanics/chisaRawFacts.ts';
import {
  PROFILE_MULTIMODE_DENIA_PRESETS,
  PROFILE_MULTIMODE_DENIA_ROTATIONS,
} from '../data/profileMultiModeDenia20260829.ts';
import { PROFILE_CATALOGS } from '../data/profileCatalogs.ts';

export interface AemeathChisaNegativeStatusEntryState {
  readonly coreId: 'aemeath-chisa-negative-status-entry-v1';
  readonly teamProfileId: 'aemeath-denia-chisa';
  readonly handoffOrder: readonly ['chisa', 'denia', 'aemeath'];
  readonly resonantThreadOfClosureActiveAtAemeathEntry: true;
  readonly resonantThreadOfClosureDurationSeconds: 20;
  readonly exactRemainingClosureSecondsAtAemeathEntry: null;
  readonly targetNegativeStatusStackCapIncreaseAvailableOnAemeathHit: true;
  readonly aemeathThreadOfBaneActiveAtEntry: false;
  readonly aemeathCanTriggerThreadOfBaneByOwnFusionBurst: true;
  readonly threadOfBaneDurationSeconds: 15;
  readonly exactThreadOfBaneFullRotationUptimeProven: false;
}

const CANONICAL_TEAM_ID = 'aemeath-denia-chisa';
const CANONICAL_DENIA_PRESET_ID = 'denia-fusion-burst-aemeath';
const CANONICAL_DENIA_ROTATION_ID = 'denia-fusion-burst-aemeath-standard';
const CHISA_OUTRO_FACT_ID = 'chisa-outro-unraveling-law-zero';
const AEMEATH_FUSION_STATUS_FACT_ID = 'aemeath-forte-resonance-mode-trails';

export const AEMEATH_CHISA_NEGATIVE_STATUS_PREDECESSOR_CONTRACT_20260901 = {
  contractId: 'aemeath-chisa-negative-status-predecessor-v1',
  teamProfileId: CANONICAL_TEAM_ID,
  supportCharacterId: 'chisa',
  bridgeCharacterId: 'denia',
  recipientCharacterId: 'aemeath',
  deniaPresetId: CANONICAL_DENIA_PRESET_ID,
  deniaRotationId: CANONICAL_DENIA_ROTATION_ID,
  requiredChisaFactId: CHISA_OUTRO_FACT_ID,
  requiredAemeathFactId: AEMEATH_FUSION_STATUS_FACT_ID,
  closesPendingExecutionId: 'incoming:chisa:aemeath-negative-status-predecessor-state',
  checkedAt: '2026-09-01',
  sourceUrls: [
    'https://www.prydwen.gg/wuthering-waves/characters/chisa',
    'https://www.prydwen.gg/wuthering-waves/characters/denia',
    'https://www.prydwen.gg/wuthering-waves/characters/aemeath',
  ],
  reviewedSourceAssertions: [
    'Current Chisa source says Chisa acts as the first character in all her teams and both listed opener/loop rotations conclude with Outro.',
    'Current Chisa source says a 20-second Fallacy team buff cast immediately before Chisa Outro is sufficient for the other two teammates rotation times. Chisa own Resonant Thread of Closure starts on that Outro and also lasts 20 seconds.',
    'Canonical Bellibing Denia Fusion Burst preset uses team aemeath-denia-chisa and its source sequence ends with Outro to Aemeath, establishing Chisa -> Denia -> Aemeath as the source-supported handoff order for this exact composition.',
    'Current Aemeath source says Intro and Basic Attacks apply Fusion Burst in Fusion Burst Resonance Mode; current raw mechanics also preserve qualifying Aemeath status application.',
  ],
  notes: [
    'This contract closes only the predecessor ENTRY state: Chisa Resonant Thread of Closure is source-supported as still active when Aemeath enters after Denia.',
    'No exact Chisa, Denia or Aemeath timestamps are assigned. The exact number of closure seconds remaining at Aemeath entry is intentionally null.',
    'Aemeath does not inherit Denia Thread of Bane. Aemeath must trigger her own 15-second Thread of Bane by inflicting Fusion Burst or dealing qualifying Negative Status damage while Resonant Thread of Closure is active.',
    'The current exact Aemeath rotation duration is still unproven, so this contract does not claim that Aemeath own 15-second Thread of Bane lasts through every later action or that any Chisa-derived modifier has blanket full-rotation uptime.',
  ],
} as const;

export function validateAemeathChisaNegativeStatusPredecessorContract(): readonly string[] {
  const issues: string[] = [];
  const contract = AEMEATH_CHISA_NEGATIVE_STATUS_PREDECESSOR_CONTRACT_20260901;

  const team = PROFILE_CATALOGS.teams.find((row) => row.id === contract.teamProfileId);
  if (!team) {
    issues.push(`missing canonical team ${contract.teamProfileId}`);
  } else {
    const actualMembers = team.members.map((member) => `${member.characterId}:${member.role}`);
    for (const expected of ['aemeath:DPS', 'denia:SUB_DPS', 'chisa:SUPPORT']) {
      if (!actualMembers.includes(expected)) issues.push(`canonical team missing ${expected}`);
    }
  }

  const deniaPreset = PROFILE_MULTIMODE_DENIA_PRESETS.find((row) => row.id === contract.deniaPresetId);
  if (!deniaPreset) {
    issues.push(`missing Denia preset ${contract.deniaPresetId}`);
  } else {
    if (deniaPreset.teamProfileId !== contract.teamProfileId) issues.push(`Denia team drift: ${deniaPreset.teamProfileId}`);
    if (deniaPreset.modeKey !== 'fusion-burst') issues.push(`Denia mode drift: ${String(deniaPreset.modeKey)}`);
    if (deniaPreset.rotationProfileId !== contract.deniaRotationId) issues.push(`Denia rotation drift: ${deniaPreset.rotationProfileId}`);
  }

  const deniaRotation = PROFILE_MULTIMODE_DENIA_ROTATIONS.find((row) => row.id === contract.deniaRotationId);
  if (!deniaRotation) {
    issues.push(`missing Denia rotation ${contract.deniaRotationId}`);
  } else if (deniaRotation.sourceSequence.at(-1) !== 'Outro to Aemeath') {
    issues.push('canonical Denia predecessor rotation must end with Outro to Aemeath');
  }

  const chisaOutro = CHISA_CHARACTER_MECHANIC_FACTS.find((fact) => fact.factId === contract.requiredChisaFactId);
  if (!chisaOutro || chisaOutro.kind !== 'PASSIVE') {
    issues.push(`missing Chisa Outro fact ${contract.requiredChisaFactId}`);
  } else {
    if (chisaOutro.durationSeconds !== 20) issues.push(`Chisa Outro duration drift: ${String(chisaOutro.durationSeconds)}`);
    if (!chisaOutro.effectSummary.includes('Grant Resonant Thread of Closure for 20s.')) issues.push('Chisa Resonant Thread of Closure semantics drift');
    if (!chisaOutro.effectSummary.includes("inflicting Negative Status or dealing Negative Status DMG grants Thread of Bane for 15s")) issues.push('Chisa Thread of Bane semantics drift');
  }

  const aemeathStatus = AEMEATH_CHARACTER_MECHANIC_FACTS.find((fact) => fact.factId === contract.requiredAemeathFactId);
  if (!aemeathStatus || aemeathStatus.kind !== 'PASSIVE') {
    issues.push(`missing Aemeath status fact ${contract.requiredAemeathFactId}`);
  } else if (!aemeathStatus.effectSummary.includes('Qualifying Aemeath skills can inflict the mode status on a target')) {
    issues.push('Aemeath own mode-status application semantics drift');
  }

  return issues;
}

export function createCanonicalAemeathChisaNegativeStatusEntryState(): AemeathChisaNegativeStatusEntryState {
  const issues = validateAemeathChisaNegativeStatusPredecessorContract();
  if (issues.length > 0) {
    throw new Error(`Aemeath/Chisa predecessor contract invalid: ${issues.join('; ')}`);
  }

  return {
    coreId: 'aemeath-chisa-negative-status-entry-v1',
    teamProfileId: CANONICAL_TEAM_ID,
    handoffOrder: ['chisa', 'denia', 'aemeath'],
    resonantThreadOfClosureActiveAtAemeathEntry: true,
    resonantThreadOfClosureDurationSeconds: 20,
    exactRemainingClosureSecondsAtAemeathEntry: null,
    targetNegativeStatusStackCapIncreaseAvailableOnAemeathHit: true,
    aemeathThreadOfBaneActiveAtEntry: false,
    aemeathCanTriggerThreadOfBaneByOwnFusionBurst: true,
    threadOfBaneDurationSeconds: 15,
    exactThreadOfBaneFullRotationUptimeProven: false,
  };
}
