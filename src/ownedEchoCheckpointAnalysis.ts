import {
  SUBSTAT_TYPES,
  SUBSTAT_VALUE_TABLE,
  createRank5EchoAtLevel0,
  nextCheckpoint,
  withRank5MainStatsAtLevel,
  type Echo,
  type EchoLevel,
  type PrimaryMainStatName,
  type StatName,
  type StatRoll,
} from './echoCore.ts';
import { resolveRollAssistProfileBinding } from './rollAssistProfileRegistry.ts';
import { evaluateTargetCheckpoint } from './targetCheckpointPolicy.ts';

export type OwnedEchoCheckpointLevel = Exclude<EchoLevel, 0>;
export type OwnedEchoCheckpointDecision = 'ROLL' | 'DISCARD' | 'KEEP' | 'TEMPORARY';

export interface OwnedEchoRollOption {
  readonly name: StatName;
  readonly values: readonly number[];
}

export interface OwnedEchoCheckpointInput {
  readonly presetId: string;
  readonly slotIndex: number;
  readonly level: OwnedEchoCheckpointLevel;
  readonly substats: readonly StatRoll[];
}

export interface OwnedEchoCheckpointResult {
  readonly presetId: string;
  readonly policyId: string;
  readonly slotIndex: number;
  readonly level: OwnedEchoCheckpointLevel;
  readonly decision: OwnedEchoCheckpointDecision;
  readonly headline: string;
  readonly reason: string;
  readonly targetHits: readonly string[];
  readonly targetMisses: readonly string[];
  readonly deadCount: number;
  readonly remainingRolls: number;
  readonly finalRequirementSatisfied: boolean;
  readonly finalRequirementStillPossible: boolean;
  readonly hasAnyCore: boolean;
}

export const OWNED_ECHO_CHECKPOINT_LEVELS: readonly OwnedEchoCheckpointLevel[] = [5, 10, 15, 20, 25] as const;
const EPSILON = 1e-12;

export function listOwnedEchoRollOptions(): readonly OwnedEchoRollOption[] {
  return SUBSTAT_TYPES.map((name) => ({
    name,
    values: SUBSTAT_VALUE_TABLE[name] ?? [],
  }));
}

function assertCheckpointLevel(level: number): asserts level is OwnedEchoCheckpointLevel {
  if (!OWNED_ECHO_CHECKPOINT_LEVELS.includes(level as OwnedEchoCheckpointLevel)) {
    throw new RangeError(`Owned Echo analysis requires +5/+10/+15/+20/+25, got +${level}.`);
  }
}

export function assertExactOwnedEchoRoll(roll: StatRoll): void {
  if (!SUBSTAT_TYPES.includes(roll.name)) throw new RangeError(`Unknown Echo substat: ${roll.name}.`);
  const values = SUBSTAT_VALUE_TABLE[roll.name];
  if (!values?.some((value) => Math.abs(value - roll.value) <= EPSILON)) {
    throw new RangeError(`${roll.name} value ${roll.value} is not an exact verified Rank-5 roll value.`);
  }
}

function resolveOwnedEchoInput(input: OwnedEchoCheckpointInput): {
  readonly policyId: string;
  readonly echo: Echo;
} {
  assertCheckpointLevel(input.level);
  if (!Number.isInteger(input.slotIndex)) throw new RangeError('Owned Echo slot index must be an integer.');

  const binding = resolveRollAssistProfileBinding(input.presetId);
  if (!binding) {
    throw new Error(`${input.presetId}: no verified Roll Assist checkpoint policy is bound to this canonical profile.`);
  }

  const policySlot = binding.policy.slots[input.slotIndex];
  if (!policySlot) throw new RangeError(`${input.presetId}: invalid Echo slot ${input.slotIndex + 1}.`);

  const expectedSubstats = input.level / 5;
  if (input.substats.length !== expectedSubstats) {
    throw new Error(`+${input.level} owned Echo requires exactly ${expectedSubstats} substats.`);
  }

  const seen = new Set<string>();
  for (const roll of input.substats) {
    if (seen.has(roll.name)) throw new Error(`Duplicate Echo substat: ${roll.name}.`);
    seen.add(roll.name);
    assertExactOwnedEchoRoll(roll);
  }

  const level0 = createRank5EchoAtLevel0({
    id: `owned-${binding.characterId}-${input.slotIndex + 1}`,
    cost: policySlot.cost,
    primaryMainStat: policySlot.primaryMain as PrimaryMainStatName,
  });
  const echo: Echo = {
    ...withRank5MainStatsAtLevel(level0, input.level),
    substats: input.substats.map((roll) => ({ ...roll })),
  };
  return { policyId: binding.policy.id, echo };
}

/** Build the exact Rank-5 Echo card represented by one validated owned-checkpoint input. */
export function buildOwnedEchoFromCheckpointInput(input: OwnedEchoCheckpointInput): Echo {
  return resolveOwnedEchoInput(input).echo;
}

function headline(decision: OwnedEchoCheckpointDecision, level: OwnedEchoCheckpointLevel): string {
  if (decision === 'ROLL') {
    const next = nextCheckpoint(level);
    if (next === null) throw new Error('Final +25 checkpoint cannot request another roll.');
    return `ROLL TO +${next}`;
  }
  if (decision === 'DISCARD') return 'DISCARD';
  if (decision === 'KEEP') return 'KEEP';
  return 'TEMPORARY';
}

export function analyzeOwnedEchoCheckpoint(input: OwnedEchoCheckpointInput): OwnedEchoCheckpointResult {
  const resolved = resolveOwnedEchoInput(input);
  const binding = resolveRollAssistProfileBinding(input.presetId);
  if (!binding) throw new Error(`${input.presetId}: verified Roll Assist binding disappeared during analysis.`);
  const evaluation = evaluateTargetCheckpoint(binding.policy, resolved.echo);

  return {
    presetId: binding.presetId,
    policyId: resolved.policyId,
    slotIndex: input.slotIndex,
    level: input.level,
    decision: evaluation.assessment.decision,
    headline: headline(evaluation.assessment.decision, input.level),
    reason: evaluation.assessment.reason ?? '',
    targetHits: evaluation.state.targetHits,
    targetMisses: evaluation.state.targetMisses,
    deadCount: evaluation.state.deadCount,
    remainingRolls: evaluation.state.remainingRolls,
    finalRequirementSatisfied: evaluation.state.finalRequirementSatisfied,
    finalRequirementStillPossible: evaluation.state.finalRequirementStillPossible,
    hasAnyCore: evaluation.state.hasAnyCore,
  };
}
