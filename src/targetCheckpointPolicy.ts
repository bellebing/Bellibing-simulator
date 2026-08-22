import {
  SUBSTAT_TYPES,
  SUBSTAT_VALUE_PROBABILITIES,
  SUBSTAT_VALUE_TABLE,
  type Echo,
  type EchoCost,
  type EchoLevel,
  type StatName,
} from './echoCore.ts';
import type { BuildTargetMode, CheckpointAssessment } from './rollAssistantSession.ts';

export type TargetStatRole = 'CORE' | 'USEFUL';
export type NonTargetStatRole = 'FILLER' | 'DEAD';

export interface TargetStatRule {
  name: StatName;
  role: TargetStatRole;
  minimum: number;
}

export interface RecommendedEchoSlot {
  cost: EchoCost;
  primaryMain: string;
}

export interface CharacterRollProfile {
  id: string;
  characterId: string;
  targetMode: BuildTargetMode;
  firstCheckLevel: Exclude<EchoLevel, 0>;
  /** Number of Useful target hits required after both Core targets pass. */
  requiredUsefulHits: number;
  targets: readonly TargetStatRule[];
  nonTargetRoles: Readonly<Partial<Record<string, NonTargetStatRole>>>;
  slots: readonly RecommendedEchoSlot[];
  provenance: string;
}

export interface CheckpointPolicyState {
  level: EchoLevel;
  targetHits: readonly string[];
  targetMisses: readonly string[];
  deadCount: number;
  remainingRolls: number;
  finalRequirementSatisfied: boolean;
  finalRequirementStillPossible: boolean;
  hasAnyCore: boolean;
}

export interface CheckpointPolicyResult {
  assessment: CheckpointAssessment;
  state: CheckpointPolicyState;
}

export interface ExactPolicyDistribution {
  rejectionByLevel: Readonly<Record<Exclude<EchoLevel, 0>, number>>;
  acceptance: number;
  totalProbability: number;
}

const CHECKPOINTS = [5, 10, 15, 20, 25] as const;
const EPSILON = 1e-12;

function targetIndexByName(profile: CharacterRollProfile): Map<string, number> {
  return new Map(profile.targets.map((target, index) => [target.name, index]));
}

function coreIndexes(profile: CharacterRollProfile): number[] {
  return profile.targets
    .map((target, index) => ({ target, index }))
    .filter(({ target }) => target.role === 'CORE')
    .map(({ index }) => index);
}

function usefulIndexes(profile: CharacterRollProfile): number[] {
  return profile.targets
    .map((target, index) => ({ target, index }))
    .filter(({ target }) => target.role === 'USEFUL')
    .map(({ index }) => index);
}

function hasBit(mask: number, index: number): boolean {
  return (mask & (1 << index)) !== 0;
}

function countBits(mask: number): number {
  let value = mask >>> 0;
  let count = 0;
  while (value) {
    value &= value - 1;
    count += 1;
  }
  return count;
}

function requirementSatisfiedFromMask(profile: CharacterRollProfile, hitMask: number): boolean {
  const cores = coreIndexes(profile);
  if (cores.some((index) => !hasBit(hitMask, index))) return false;
  const usefulHits = usefulIndexes(profile).filter((index) => hasBit(hitMask, index)).length;
  return usefulHits >= profile.requiredUsefulHits;
}

function requirementStillPossibleFromMasks(input: {
  profile: CharacterRollProfile;
  seenTypeMask: number;
  hitMask: number;
  remainingRolls: number;
}): boolean {
  const typeIndex = new Map(SUBSTAT_TYPES.map((name, index) => [name, index]));
  let missingCores = 0;

  for (const targetIndex of coreIndexes(input.profile)) {
    if (hasBit(input.hitMask, targetIndex)) continue;
    const target = input.profile.targets[targetIndex]!;
    const statTypeIndex = typeIndex.get(target.name);
    if (statTypeIndex === undefined) return false;
    if (hasBit(input.seenTypeMask, statTypeIndex)) return false;
    missingCores += 1;
  }

  const useful = usefulIndexes(input.profile);
  const usefulHits = useful.filter((index) => hasBit(input.hitMask, index)).length;
  const missingUsefulHits = Math.max(0, input.profile.requiredUsefulHits - usefulHits);
  let unseenUseful = 0;

  for (const targetIndex of useful) {
    if (hasBit(input.hitMask, targetIndex)) continue;
    const target = input.profile.targets[targetIndex]!;
    const statTypeIndex = typeIndex.get(target.name);
    if (statTypeIndex !== undefined && !hasBit(input.seenTypeMask, statTypeIndex)) unseenUseful += 1;
  }

  if (unseenUseful < missingUsefulHits) return false;
  return missingCores + missingUsefulHits <= input.remainingRolls;
}

function policyDecisionFromMasks(input: {
  profile: CharacterRollProfile;
  level: Exclude<EchoLevel, 0>;
  seenTypeMask: number;
  hitMask: number;
  deadCount: number;
}): 'ROLL' | 'DISCARD' | 'KEEP' | 'TEMPORARY' {
  const slotsRolled = input.level / 5;
  const isFinal = input.level === 25;
  const firstCheckSlots = input.profile.firstCheckLevel / 5;
  const accepted = requirementSatisfiedFromMask(input.profile, input.hitMask);

  if (isFinal) {
    if (accepted && input.deadCount < 2) return 'KEEP';
    const coreSeen = coreIndexes(input.profile).some((targetIndex) => {
      const targetName = input.profile.targets[targetIndex]!.name;
      const typeIndex = SUBSTAT_TYPES.indexOf(targetName);
      return typeIndex >= 0 && hasBit(input.seenTypeMask, typeIndex);
    });
    return coreSeen ? 'TEMPORARY' : 'DISCARD';
  }

  if (slotsRolled < firstCheckSlots) return 'ROLL';

  const remainingRolls = 5 - slotsRolled;
  if (!requirementStillPossibleFromMasks({
    profile: input.profile,
    seenTypeMask: input.seenTypeMask,
    hitMask: input.hitMask,
    remainingRolls,
  })) {
    return 'DISCARD';
  }

  const targetHits = countBits(input.hitMask);

  // Exact V9.15 Bellibing Budget policy:
  // one Dead may survive, two do not; a Dead opener is recycled immediately;
  // by +10 at least one passing Target must already exist; from +15 onward
  // feasibility of the final Requirement owns the decision.
  if (input.deadCount >= 2) return 'DISCARD';
  if (slotsRolled === 1 && input.deadCount >= 1 && targetHits === 0) return 'DISCARD';
  if (slotsRolled >= Math.max(firstCheckSlots, 2) && targetHits === 0) return 'DISCARD';

  return 'ROLL';
}

function validateProfile(profile: CharacterRollProfile): void {
  if (profile.targets.filter((target) => target.role === 'CORE').length !== 2) {
    throw new Error(`${profile.id} must define exactly two Core targets.`);
  }
  if (profile.requiredUsefulHits < 0 || !Number.isInteger(profile.requiredUsefulHits)) {
    throw new RangeError('requiredUsefulHits must be a non-negative integer.');
  }
  const names = profile.targets.map((target) => target.name);
  if (new Set(names).size !== names.length) throw new Error(`${profile.id} contains duplicate Target stats.`);
  for (const target of profile.targets) {
    if (!SUBSTAT_TYPES.includes(target.name)) throw new Error(`Unknown target substat ${target.name}.`);
  }
}

function buildMasksForEcho(profile: CharacterRollProfile, echo: Echo): {
  seenTypeMask: number;
  hitMask: number;
  deadCount: number;
} {
  validateProfile(profile);
  const targetIndexes = targetIndexByName(profile);
  let seenTypeMask = 0;
  let hitMask = 0;
  let deadCount = 0;
  const seenNames = new Set<string>();

  for (const roll of echo.substats) {
    if (seenNames.has(roll.name)) throw new Error(`Duplicate Echo substat: ${roll.name}.`);
    seenNames.add(roll.name);

    const statTypeIndex = SUBSTAT_TYPES.indexOf(roll.name);
    if (statTypeIndex < 0) throw new Error(`Unknown Echo substat: ${roll.name}.`);
    seenTypeMask |= 1 << statTypeIndex;

    const targetIndex = targetIndexes.get(roll.name);
    if (targetIndex !== undefined) {
      const target = profile.targets[targetIndex]!;
      if (roll.value + EPSILON >= target.minimum) hitMask |= 1 << targetIndex;
      continue;
    }

    if (profile.nonTargetRoles[roll.name] === 'DEAD') deadCount += 1;
  }

  return { seenTypeMask, hitMask, deadCount };
}

/** Evaluate one real in-game checkpoint using the selected character target profile. */
export function evaluateTargetCheckpoint(
  profile: CharacterRollProfile,
  echo: Echo,
): CheckpointPolicyResult {
  if (echo.level === 0) throw new RangeError('Checkpoint policy requires a tuned Echo at +5 or higher.');
  const expectedSubstats = echo.level / 5;
  if (echo.substats.length !== expectedSubstats) {
    throw new Error(`+${echo.level} Echo must contain exactly ${expectedSubstats} tuned substats.`);
  }

  const masks = buildMasksForEcho(profile, echo);
  const decision = policyDecisionFromMasks({
    profile,
    level: echo.level,
    ...masks,
  });

  const targetHits = profile.targets
    .filter((_, index) => hasBit(masks.hitMask, index))
    .map((target) => target.name);
  const targetMisses = profile.targets.filter((target) => {
    const statTypeIndex = SUBSTAT_TYPES.indexOf(target.name);
    const targetIndex = profile.targets.indexOf(target);
    return statTypeIndex >= 0 && hasBit(masks.seenTypeMask, statTypeIndex) && !hasBit(masks.hitMask, targetIndex);
  }).map((target) => target.name);
  const slotsRolled = echo.level / 5;
  const remainingRolls = 5 - slotsRolled;
  const possible = requirementStillPossibleFromMasks({
    profile,
    seenTypeMask: masks.seenTypeMask,
    hitMask: masks.hitMask,
    remainingRolls,
  });
  const coreSeen = coreIndexes(profile).some((targetIndex) => {
    const typeIndex = SUBSTAT_TYPES.indexOf(profile.targets[targetIndex]!.name);
    return typeIndex >= 0 && hasBit(masks.seenTypeMask, typeIndex);
  });

  const assessment: CheckpointAssessment = decision === 'ROLL'
    ? { decision: 'ROLL', reason: 'Still on a viable path to the selected build target.' }
    : decision === 'KEEP'
      ? { decision: 'KEEP', reason: 'Meets the selected final Echo target.' }
      : decision === 'TEMPORARY'
        ? { decision: 'TEMPORARY', reason: 'Usable now, but below the selected final target.' }
        : { decision: 'DISCARD', reason: 'This branch no longer reaches the selected target efficiently under the active policy.' };

  return {
    assessment,
    state: {
      level: echo.level,
      targetHits,
      targetMisses,
      deadCount: masks.deadCount,
      remainingRolls,
      finalRequirementSatisfied: requirementSatisfiedFromMask(profile, masks.hitMask) && masks.deadCount < 2,
      finalRequirementStillPossible: possible,
      hasAnyCore: coreSeen,
    },
  };
}

function normalizedPassingProbability(target: TargetStatRule): number {
  const values = SUBSTAT_VALUE_TABLE[target.name];
  const probabilities = SUBSTAT_VALUE_PROBABILITIES[target.name];
  if (!values || !probabilities || values.length !== probabilities.length) {
    throw new Error(`Missing verified roll distribution for ${target.name}.`);
  }
  const total = probabilities.reduce((sum, value) => sum + value, 0);
  if (!(total > 0)) throw new Error(`Invalid probability mass for ${target.name}.`);
  return probabilities.reduce(
    (sum, probability, index) => sum + (values[index]! + EPSILON >= target.minimum ? probability : 0),
    0,
  ) / total;
}

/**
 * Exact dynamic probability distribution for the V9.15 Budget checkpoint policy.
 * Roll magnitudes are collapsed to pass/fail mass for Target stats because the
 * legacy checkpoint decision only needs Minimum pass/fail at this layer.
 */
export function calculateExactTargetPolicyDistribution(
  profile: CharacterRollProfile,
): ExactPolicyDistribution {
  validateProfile(profile);
  const targetIndexes = targetIndexByName(profile);
  type State = { seenTypeMask: number; hitMask: number; deadCount: number; probability: number };
  let states = new Map<string, State>();
  states.set('0|0|0', { seenTypeMask: 0, hitMask: 0, deadCount: 0, probability: 1 });
  const rejected: Record<Exclude<EchoLevel, 0>, number> = { 5: 0, 10: 0, 15: 0, 20: 0, 25: 0 };
  let acceptance = 0;

  for (const level of CHECKPOINTS) {
    const slotsRolled = level / 5;
    const nextStates = new Map<string, State>();

    for (const state of states.values()) {
      const remainingTypes = SUBSTAT_TYPES.length - (slotsRolled - 1);
      for (let statTypeIndex = 0; statTypeIndex < SUBSTAT_TYPES.length; statTypeIndex += 1) {
        if (hasBit(state.seenTypeMask, statTypeIndex)) continue;
        const name = SUBSTAT_TYPES[statTypeIndex]!;
        const targetIndex = targetIndexes.get(name);
        const typeProbability = 1 / remainingTypes;
        const target = targetIndex === undefined ? undefined : profile.targets[targetIndex];
        const passProbability = target ? normalizedPassingProbability(target) : 0;
        const branches = target
          ? [
              { passes: true, probability: passProbability },
              { passes: false, probability: 1 - passProbability },
            ]
          : [{ passes: false, probability: 1 }];

        for (const branch of branches) {
          if (!(branch.probability > 0)) continue;
          const seenTypeMask = state.seenTypeMask | (1 << statTypeIndex);
          const hitMask = targetIndex !== undefined && branch.passes
            ? state.hitMask | (1 << targetIndex)
            : state.hitMask;
          const deadCount = state.deadCount + (targetIndex === undefined && profile.nonTargetRoles[name] === 'DEAD' ? 1 : 0);
          const probability = state.probability * typeProbability * branch.probability;
          const decision = policyDecisionFromMasks({ profile, level, seenTypeMask, hitMask, deadCount });

          if (decision === 'KEEP') {
            acceptance += probability;
            continue;
          }
          if (decision === 'DISCARD' || decision === 'TEMPORARY') {
            // Strategy Cache's reject distribution owns all non-Kept terminal
            // policy mass; Temporary is a later equipment lifecycle overlay.
            rejected[level] += probability;
            continue;
          }

          const key = `${seenTypeMask}|${hitMask}|${deadCount}`;
          const existing = nextStates.get(key);
          if (existing) existing.probability += probability;
          else nextStates.set(key, { seenTypeMask, hitMask, deadCount, probability });
        }
      }
    }

    states = nextStates;
  }

  const totalProbability = acceptance + CHECKPOINTS.reduce((sum, level) => sum + rejected[level], 0);
  return { rejectionByLevel: rejected, acceptance, totalProbability };
}
