import { AEMEATH_CHARACTER_MECHANIC_FACTS } from '../data/characterMechanics/aemeathRawFacts.ts';
import { DENIA_CHARACTER_MECHANIC_FACTS } from '../data/characterMechanics/deniaRawFacts.ts';
import {
  PROFILE_MULTIMODE_DENIA_PRESETS,
  PROFILE_MULTIMODE_DENIA_ROTATIONS,
} from '../data/profileMultiModeDenia20260829.ts';
import { PROFILE_CATALOGS } from '../data/profileCatalogs.ts';

export type AemeathResonanceMode = 'FUSION_BURST' | 'TUNE_RUPTURE';

export interface AemeathBetweenStarsState {
  readonly coreId: 'aemeath-between-stars-fusion-burst-v1';
  readonly mode: AemeathResonanceMode;
  readonly teamResonatorIds: readonly string[];
  readonly triggeredResonatorIds: readonly string[];
  readonly critDmgBonus: number;
  readonly finaleDmgAmplification: number;
}

export type AemeathBetweenStarsEvent =
  | {
      readonly kind: 'FUSION_BURST_INFLICTED';
      readonly actorId: string;
    }
  | {
      readonly kind: 'TEAM_CHANGED';
      readonly teamResonatorIds: readonly string[];
    }
  | {
      readonly kind: 'RESONANCE_MODE_SWITCHED';
      readonly nextMode: AemeathResonanceMode;
    };

const CANONICAL_TEAM_ID = 'aemeath-denia-chisa';
const CANONICAL_DENIA_PRESET_ID = 'denia-fusion-burst-aemeath';
const CANONICAL_DENIA_ROTATION_ID = 'denia-fusion-burst-aemeath-standard';
const BETWEEN_STARS_FACT_ID = 'aemeath-inherent-between-the-stars';
const DENIA_FUSION_BURST_FACT_ID = 'denia-mode-fusion-burst';
const DENIA_PROVEN_PRODUCER_ACTIONS = ['Intro', 'Ultimate: Stagecraft', 'Ultimate: Breakdown'] as const;

export const AEMEATH_DENIA_FUSION_BURST_PREDECESSOR_CONTRACT_20260901 = {
  contractId: 'aemeath-denia-fusion-burst-predecessor-v1',
  teamProfileId: CANONICAL_TEAM_ID,
  aemeathResonanceMode: 'FUSION_BURST' as const,
  predecessorCharacterId: 'denia',
  predecessorPresetId: CANONICAL_DENIA_PRESET_ID,
  predecessorRotationId: CANONICAL_DENIA_ROTATION_ID,
  requiredAemeathFactId: BETWEEN_STARS_FACT_ID,
  requiredDeniaFactId: DENIA_FUSION_BURST_FACT_ID,
  sourceProvenProducerActions: DENIA_PROVEN_PRODUCER_ACTIONS,
  resultingBetweenStarsTriggerCount: 1,
  resultingCritDmgBonus: 0.30,
  resultingFinaleDmgAmplification: 0,
  closesPendingExecutionId: 'incoming:denia:aemeath-fusion-burst-predecessor-state',
  checkedAt: '2026-09-01',
  sourceUrls: [
    'https://www.prydwen.gg/wuthering-waves/characters/aemeath',
    'https://www.prydwen.gg/wuthering-waves/characters/denia',
  ],
  notes: [
    'This contract closes only the timeless Denia -> Aemeath Between the Stars predecessor stack for the exact canonical Fusion Burst team.',
    'It does not assign Denia action timestamps, execute Denia damage, assume Reminiscence: Denia transfer timing, or claim blanket uptime for Denia Outro Unfinished Lies.',
    'The current Aemeath source identifies Denia as the required Fusion Burst partner, while the canonical Denia preset is explicitly Fusion Burst mode, uses the exact Aemeath + Denia + Chisa team, contains source-listed Fusion Burst-producing actions, and ends with Outro to Aemeath.',
  ],
} as const;

function uniqueNonBlank(values: readonly string[], label: string): void {
  if (values.length === 0) throw new Error(`${label} must not be empty`);
  const seen = new Set<string>();
  for (const value of values) {
    if (!value.trim()) throw new Error(`${label} contains a blank Resonator id`);
    if (seen.has(value)) throw new Error(`${label} contains duplicate Resonator id: ${value}`);
    seen.add(value);
  }
}

function resetBetweenStars(
  mode: AemeathResonanceMode,
  teamResonatorIds: readonly string[],
): AemeathBetweenStarsState {
  uniqueNonBlank(teamResonatorIds, 'Aemeath Between the Stars team');
  return {
    coreId: 'aemeath-between-stars-fusion-burst-v1',
    mode,
    teamResonatorIds: [...teamResonatorIds],
    triggeredResonatorIds: [],
    critDmgBonus: 0,
    finaleDmgAmplification: 0,
  };
}

export function createAemeathBetweenStarsState(
  teamResonatorIds: readonly string[],
  mode: AemeathResonanceMode = 'FUSION_BURST',
): AemeathBetweenStarsState {
  return resetBetweenStars(mode, teamResonatorIds);
}

export function applyAemeathBetweenStarsEvent(
  state: AemeathBetweenStarsState,
  event: AemeathBetweenStarsEvent,
): AemeathBetweenStarsState {
  if (event.kind === 'TEAM_CHANGED') {
    return resetBetweenStars(state.mode, event.teamResonatorIds);
  }
  if (event.kind === 'RESONANCE_MODE_SWITCHED') {
    return resetBetweenStars(event.nextMode, state.teamResonatorIds);
  }
  if (event.kind !== 'FUSION_BURST_INFLICTED') {
    throw new Error(`unsupported Aemeath Between the Stars event kind: ${String((event as { kind?: unknown }).kind)}`);
  }
  if (!event.actorId.trim()) throw new Error('Fusion Burst actor id must not be blank');
  if (state.mode !== 'FUSION_BURST') return state;
  if (!state.teamResonatorIds.includes(event.actorId)) return state;
  if (state.triggeredResonatorIds.includes(event.actorId)) return state;
  if (state.triggeredResonatorIds.length >= 2) return state;

  const triggeredResonatorIds = [...state.triggeredResonatorIds, event.actorId];
  return {
    ...state,
    triggeredResonatorIds,
    critDmgBonus: triggeredResonatorIds.length * 0.30,
    finaleDmgAmplification: triggeredResonatorIds.length >= 2 ? 0.25 : 0,
  };
}

export function validateAemeathDeniaFusionBurstPredecessorContract(): readonly string[] {
  const issues: string[] = [];
  const contract = AEMEATH_DENIA_FUSION_BURST_PREDECESSOR_CONTRACT_20260901;

  const team = PROFILE_CATALOGS.teams.find((row) => row.id === contract.teamProfileId);
  if (!team) {
    issues.push(`missing canonical team ${contract.teamProfileId}`);
  } else {
    const actualMembers = team.members.map((member) => `${member.characterId}:${member.role}`);
    const expectedMembers = ['aemeath:DPS', 'denia:SUB_DPS', 'chisa:SUPPORT'];
    if (actualMembers.length !== expectedMembers.length || expectedMembers.some((member) => !actualMembers.includes(member))) {
      issues.push(`canonical team membership drift: ${actualMembers.join(', ')}`);
    }
  }

  const preset = PROFILE_MULTIMODE_DENIA_PRESETS.find((row) => row.id === contract.predecessorPresetId);
  if (!preset) {
    issues.push(`missing Denia predecessor preset ${contract.predecessorPresetId}`);
  } else {
    if (preset.modeKey !== 'fusion-burst') issues.push(`Denia predecessor mode drift: ${String(preset.modeKey)}`);
    if (preset.teamProfileId !== contract.teamProfileId) issues.push(`Denia predecessor team drift: ${preset.teamProfileId}`);
    if (preset.rotationProfileId !== contract.predecessorRotationId) issues.push(`Denia predecessor rotation drift: ${preset.rotationProfileId}`);
  }

  const rotation = PROFILE_MULTIMODE_DENIA_ROTATIONS.find((row) => row.id === contract.predecessorRotationId);
  if (!rotation) {
    issues.push(`missing Denia predecessor rotation ${contract.predecessorRotationId}`);
  } else {
    if (rotation.teamProfileId !== contract.teamProfileId) issues.push(`Denia rotation team drift: ${rotation.teamProfileId}`);
    if (rotation.variantKey !== 'fusion-burst-aemeath') issues.push(`Denia rotation variant drift: ${String(rotation.variantKey)}`);
    if (rotation.sourceSequence.at(-1) !== 'Outro to Aemeath') issues.push('Denia predecessor rotation must end with Outro to Aemeath');
    for (const action of contract.sourceProvenProducerActions) {
      if (!rotation.sourceSequence.includes(action)) issues.push(`Denia predecessor rotation missing Fusion Burst producer: ${action}`);
    }
  }

  const deniaModeFact = DENIA_CHARACTER_MECHANIC_FACTS.find((fact) => fact.factId === contract.requiredDeniaFactId);
  if (!deniaModeFact || deniaModeFact.kind !== 'PASSIVE') {
    issues.push(`missing Denia Fusion Burst mechanic fact ${contract.requiredDeniaFactId}`);
  } else if (!deniaModeFact.effectSummary.includes('Intro/Liberation/Erosion Field hits inflict 2 Fusion Burst stacks')) {
    issues.push('Denia Fusion Burst producer semantics drift');
  }

  const betweenStarsFact = AEMEATH_CHARACTER_MECHANIC_FACTS.find((fact) => fact.factId === contract.requiredAemeathFactId);
  if (!betweenStarsFact || betweenStarsFact.kind !== 'PASSIVE') {
    issues.push(`missing Aemeath Between the Stars mechanic fact ${contract.requiredAemeathFactId}`);
  } else {
    if (betweenStarsFact.durationSeconds !== null) issues.push(`Between the Stars unexpectedly gained a duration: ${String(betweenStarsFact.durationSeconds)}`);
    if (!betweenStarsFact.effectSummary.includes('Fusion Burst mode grants 30% Crit DMG per trigger, up to 2 stacks; at 2 stacks Finale DMG is Amplified by 25%.')) {
      issues.push('Aemeath Fusion Burst Between the Stars semantics drift');
    }
  }

  return issues;
}

export function createCanonicalAemeathBetweenStarsStateAfterDenia(): AemeathBetweenStarsState {
  const issues = validateAemeathDeniaFusionBurstPredecessorContract();
  if (issues.length > 0) {
    throw new Error(`Aemeath/Denia Fusion Burst predecessor contract invalid: ${issues.join('; ')}`);
  }
  const team = PROFILE_CATALOGS.teams.find((row) => row.id === CANONICAL_TEAM_ID);
  if (!team) throw new Error(`missing canonical team ${CANONICAL_TEAM_ID}`);

  const initial = createAemeathBetweenStarsState(
    team.members.map((member) => member.characterId),
    'FUSION_BURST',
  );
  return applyAemeathBetweenStarsEvent(initial, {
    kind: 'FUSION_BURST_INFLICTED',
    actorId: 'denia',
  });
}
