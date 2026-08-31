import { analyzeEchoCandidate } from './analysis.ts';
import { forecastCandidateViability } from './candidateViability.ts';
import {
  primaryMainStatValueAtLevel,
  secondaryMainStatValueAtLevel,
  type Echo,
  type EchoLevel,
  type EchoRollRuntime,
  type RandomSource,
  type ResourceCost,
} from './echoCore.ts';
import type { EchoAnalysis, UpgradeEconomics } from './domain.ts';
import { PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import { resolveOwnedBuildDpsBinding } from './ownedBuildAnalysis.ts';
import { validateOwnedBuildEchoLoadout } from './ownedBuildEchoValidation.ts';
import { assertExactOwnedEchoRoll } from './ownedEchoCheckpointAnalysis.ts';
import { compareContinueVsRestart, type PathComparison } from './pathComparison.ts';
import { buildContextFromVerifiedPreset } from './profileBuildContext.ts';
import { resolveBuildPreset } from './profileRegistry.ts';
import { summarizeUpgradeTrials, type UpgradeTrial } from './upgradeEconomics.ts';

const EPSILON = 1e-12;

export type FinishedCandidateDecision = 'BETTER' | 'DO_NOT_REPLACE';
export type PartialCandidateAction = 'ROLL' | 'STOP_RECYCLE' | 'TRADEOFF' | 'PENDING';

export interface FinishedOwnedBuildCandidateResult {
  readonly presetId: string;
  readonly slotIndex: number;
  readonly currentDps: number;
  readonly candidateDps: number;
  readonly absoluteDpsDelta: number;
  readonly percentageDpsDelta: number | null;
  readonly currentErGate: 'PASS' | 'FAIL';
  readonly candidateErGate: 'PASS' | 'FAIL';
  readonly decision: FinishedCandidateDecision;
  readonly headline: string;
  readonly reason: string;
  readonly analysis: EchoAnalysis;
}

export interface PartialOwnedBuildCandidateForecast {
  readonly presetId: string;
  readonly slotIndex: number;
  readonly candidateLevel: Exclude<EchoLevel, 0 | 25>;
  readonly nextCheckpoint: EchoLevel;
  readonly trials: number;
  readonly probabilityBeatsIncumbent: number;
  readonly probabilityMandatoryGatesPass: number;
  readonly expectedDpsGainOnSuccessfulUpgrade: number | null;
  readonly expectedAbsoluteDpsGainOnSuccessfulUpgrade: number | null;
  /** Gross resources still needed to take this exact partial Echo to +25. */
  readonly expectedRemainingCost: Required<ResourceCost>;
  /** Resources recoverable immediately if the user recycles the current partial Echo. */
  readonly recycleNowRefund: Required<ResourceCost>;
  /** Extra refund earned by further investment, conditional on finishing and then rejecting the Echo. */
  readonly expectedAdditionalRefundOnRejectedBranch: Required<ResourceCost> | null;
  readonly continueEconomics: UpgradeEconomics;
  readonly restartEconomics: UpgradeEconomics;
  readonly pathComparison: PathComparison;
  readonly action: PartialCandidateAction;
  readonly headline: string;
  readonly reason: string;
}

function cloneEcho(echo: Echo): Echo {
  return {
    ...echo,
    mainStat: { ...echo.mainStat },
    secondaryMainStat: echo.secondaryMainStat ? { ...echo.secondaryMainStat } : undefined,
    substats: echo.substats.map((roll) => ({ ...roll })),
  };
}

function normalizeCost(cost: ResourceCost): Required<ResourceCost> {
  return {
    echoes: cost.echoes,
    tuners: cost.tuners,
    exp: cost.exp,
    shellCredits: cost.shellCredits ?? 0,
  };
}

function addCost(a: ResourceCost, b: ResourceCost): Required<ResourceCost> {
  const aa = normalizeCost(a);
  const bb = normalizeCost(b);
  return {
    echoes: aa.echoes + bb.echoes,
    tuners: aa.tuners + bb.tuners,
    exp: aa.exp + bb.exp,
    shellCredits: aa.shellCredits + bb.shellCredits,
  };
}

function subtractNonNegativeCost(a: ResourceCost, b: ResourceCost, label: string): Required<ResourceCost> {
  const aa = normalizeCost(a);
  const bb = normalizeCost(b);
  const result = {
    echoes: aa.echoes - bb.echoes,
    tuners: aa.tuners - bb.tuners,
    exp: aa.exp - bb.exp,
    shellCredits: aa.shellCredits - bb.shellCredits,
  };
  for (const [resource, value] of Object.entries(result)) {
    if (value < -EPSILON) {
      throw new Error(`${label}: verified refund exceeds newly invested ${resource}.`);
    }
  }
  return {
    echoes: Math.max(0, result.echoes),
    tuners: Math.max(0, result.tuners),
    exp: Math.max(0, result.exp),
    shellCredits: Math.max(0, result.shellCredits),
  };
}

function scaleCost(cost: ResourceCost, scalar: number): Required<ResourceCost> {
  const value = normalizeCost(cost);
  return {
    echoes: value.echoes * scalar,
    tuners: value.tuners * scalar,
    exp: value.exp * scalar,
    shellCredits: value.shellCredits * scalar,
  };
}

function refundIncrease(from: ResourceCost, to: ResourceCost): Required<ResourceCost> {
  const start = normalizeCost(from);
  const end = normalizeCost(to);
  return {
    echoes: Math.max(0, end.echoes - start.echoes),
    tuners: Math.max(0, end.tuners - start.tuners),
    exp: Math.max(0, end.exp - start.exp),
    shellCredits: Math.max(0, end.shellCredits - start.shellCredits),
  };
}

function resolveCurrentBuild(input: { presetId: string; currentEchoes: readonly Echo[] }) {
  const binding = resolveOwnedBuildDpsBinding(input.presetId);
  if (!binding) {
    throw new Error(`${input.presetId}: no verified owned-build DPS adapter is registered for candidate comparison.`);
  }
  validateOwnedBuildEchoLoadout({ presetId: input.presetId, echoes: input.currentEchoes });
  const build = buildContextFromVerifiedPreset(
    input.presetId,
    input.currentEchoes.map(cloneEcho),
  );
  return { binding, build };
}

function validateCandidateCheckpoint(input: {
  presetId: string;
  slotIndex: number;
  candidate: Echo;
}): void {
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, input.presetId);
  const canonical = resolved.echoLoadout.slots[input.slotIndex];
  if (!canonical) throw new RangeError(`${input.presetId}: invalid candidate Echo slot ${input.slotIndex + 1}.`);
  if (input.candidate.rank !== 5) throw new Error(`${input.presetId}: candidate comparison requires a Rank-5 Echo.`);
  if (![5, 10, 15, 20, 25].includes(input.candidate.level)) {
    throw new Error(`${input.presetId}: candidate checkpoint must be +5/+10/+15/+20/+25.`);
  }
  if (input.candidate.cost !== canonical.cost) {
    throw new Error(`${input.presetId}: candidate COST ${input.candidate.cost} does not match slot ${input.slotIndex + 1} COST ${canonical.cost}.`);
  }
  if (!canonical.primaryMainStats.some((row) => row.stat === input.candidate.mainStat.name)) {
    throw new Error(`${input.presetId}: candidate main stat ${input.candidate.mainStat.name} is outside slot ${input.slotIndex + 1}.`);
  }

  const expectedMain = primaryMainStatValueAtLevel(
    input.candidate.cost,
    input.candidate.mainStat.name,
    input.candidate.level,
  );
  if (expectedMain === null || Math.abs(input.candidate.mainStat.value - expectedMain) > EPSILON) {
    throw new Error(`${input.presetId}: candidate primary main stat is not the exact Rank-5 +${input.candidate.level} value.`);
  }

  if (input.candidate.secondaryMainStat) {
    const expectedSecondaryName = input.candidate.cost === 1 ? 'Flat HP' : 'Flat ATK';
    const expectedSecondaryValue = secondaryMainStatValueAtLevel(input.candidate.cost, input.candidate.level);
    if (input.candidate.secondaryMainStat.name !== expectedSecondaryName
        || Math.abs(input.candidate.secondaryMainStat.value - expectedSecondaryValue) > EPSILON) {
      throw new Error(`${input.presetId}: candidate secondary main stat is not the exact COST-bound Rank-5 +${input.candidate.level} value.`);
    }
  }

  if (input.candidate.substats.length !== input.candidate.level / 5) {
    throw new Error(`${input.presetId}: +${input.candidate.level} candidate must contain exactly ${input.candidate.level / 5} substats.`);
  }
  const names = new Set<string>();
  for (const roll of input.candidate.substats) {
    if (names.has(roll.name)) throw new Error(`${input.presetId}: candidate contains duplicate substat ${roll.name}.`);
    names.add(roll.name);
    assertExactOwnedEchoRoll(roll);
  }
}

function assertExecutableAnalysis(analysis: EchoAnalysis, presetId: string): void {
  if (analysis.incumbent.erGate === 'PENDING' || analysis.candidate.erGate === 'PENDING') {
    throw new Error(`${presetId}: registered candidate evaluator returned PENDING_MODEL.`);
  }
  if (analysis.dpsDeltaAbsolute === null || analysis.dpsDeltaPct === null) {
    throw new Error(`${presetId}: registered candidate evaluator did not return a DPS delta.`);
  }
}

/**
 * Compare one completed +25 candidate against the user's exact five-Echo build.
 * Only the selected slot changes; Character, sequence, Weapon, Team, rotation and
 * evaluator context remain the canonical owned-build binding.
 */
export function analyzeFinishedOwnedBuildCandidate(input: {
  readonly presetId: string;
  readonly currentEchoes: readonly Echo[];
  readonly slotIndex: number;
  readonly candidate: Echo;
}): FinishedOwnedBuildCandidateResult {
  validateCandidateCheckpoint(input);
  if (input.candidate.level !== 25) {
    throw new Error('Finished owned-build candidate analysis requires a +25 Echo.');
  }
  const { binding, build } = resolveCurrentBuild(input);
  const analysis = analyzeEchoCandidate(build, input.slotIndex, cloneEcho(input.candidate), binding.evaluator);
  assertExecutableAnalysis(analysis, input.presetId);

  const candidateErGate = analysis.candidate.erGate as 'PASS' | 'FAIL';
  const currentErGate = analysis.incumbent.erGate as 'PASS' | 'FAIL';
  const rawImprovement = analysis.dpsDeltaAbsolute! > 0;
  const decision: FinishedCandidateDecision = analysis.verdict === 'UPGRADE' ? 'BETTER' : 'DO_NOT_REPLACE';
  let reason: string;
  if (candidateErGate === 'FAIL') {
    reason = rawImprovement
      ? `Raw modeled damage improves by ${(analysis.dpsDeltaPct! * 100).toFixed(2)}%, but the mandatory ER gate fails.`
      : 'The candidate fails the mandatory ER gate and does not improve the locked build.';
  } else if (analysis.verdict === 'UPGRADE') {
    reason = `Whole-build Personal Rotation DPS improves by ${(analysis.dpsDeltaPct! * 100).toFixed(2)}% with all mandatory gates passing.`;
  } else {
    reason = 'The candidate does not beat the incumbent under the same locked combat context.';
  }

  return {
    presetId: input.presetId,
    slotIndex: input.slotIndex,
    currentDps: analysis.incumbent.personalRotationDps,
    candidateDps: analysis.candidate.personalRotationDps,
    absoluteDpsDelta: analysis.dpsDeltaAbsolute!,
    percentageDpsDelta: analysis.dpsDeltaPct,
    currentErGate,
    candidateErGate,
    decision,
    headline: decision === 'BETTER' ? 'BETTER' : 'DO NOT REPLACE',
    reason,
    analysis,
  };
}

interface ForecastAccumulator {
  trials: UpgradeTrial[];
  successfulAbsoluteGainTotal: number;
  rejectedRefundIncreaseTotal: Required<ResourceCost>;
  rejectedCount: number;
}

function createAccumulator(): ForecastAccumulator {
  return {
    trials: [],
    successfulAbsoluteGainTotal: 0,
    rejectedRefundIncreaseTotal: { echoes: 0, tuners: 0, exp: 0, shellCredits: 0 },
    rejectedCount: 0,
  };
}

function forecastPath(input: {
  presetId: string;
  build: ReturnType<typeof buildContextFromVerifiedPreset>;
  slotIndex: number;
  startingEcho: Echo;
  acquisitionCost?: ResourceCost;
  trials: number;
  runtime: EchoRollRuntime;
  rng: RandomSource;
  evaluator: ReturnType<typeof resolveOwnedBuildDpsBinding> extends infer _T ? import('./domain.ts').DamageEvaluator : never;
}) {
  const accumulator = createAccumulator();
  const startingRefund = input.runtime.refundOnDiscard(input.startingEcho);
  const acquisitionCost = input.acquisitionCost ?? { echoes: 0, tuners: 0, exp: 0, shellCredits: 0 };

  const viability = forecastCandidateViability({
    current: input.startingEcho,
    trials: input.trials,
    runtime: input.runtime,
    rng: input.rng,
    assessFinal: (finalEcho, futureSpend) => {
      const analysis = analyzeEchoCandidate(input.build, input.slotIndex, finalEcho, input.evaluator);
      assertExecutableAnalysis(analysis, input.presetId);
      const grossSpend = addCost(acquisitionCost, futureSpend);
      const candidateGatePass = analysis.candidate.erGate === 'PASS';
      const success = analysis.verdict === 'UPGRADE';
      let netCost = grossSpend;

      if (!success) {
        const increase = refundIncrease(startingRefund, input.runtime.refundOnDiscard(finalEcho));
        accumulator.rejectedRefundIncreaseTotal = addCost(accumulator.rejectedRefundIncreaseTotal, increase);
        accumulator.rejectedCount += 1;
        netCost = subtractNonNegativeCost(grossSpend, increase, `${input.presetId}: rejected candidate`);
      } else {
        accumulator.successfulAbsoluteGainTotal += analysis.dpsDeltaAbsolute!;
      }

      accumulator.trials.push({
        success,
        cost: netCost,
        dpsGainPct: success ? analysis.dpsDeltaPct! : undefined,
      });

      return {
        status: success ? 'KEEP' : candidateGatePass ? 'TEMPORARY' : 'REJECT',
      };
    },
  });

  return {
    viability,
    economics: summarizeUpgradeTrials(accumulator.trials),
    successfulAbsoluteGainTotal: accumulator.successfulAbsoluteGainTotal,
    expectedAdditionalRefundOnRejectedBranch: accumulator.rejectedCount > 0
      ? scaleCost(accumulator.rejectedRefundIncreaseTotal, 1 / accumulator.rejectedCount)
      : null,
  };
}

function actionFromComparison(comparison: PathComparison): PartialCandidateAction {
  switch (comparison.decision) {
    case 'CONTINUE_DOMINATES': return 'ROLL';
    case 'RESTART_DOMINATES': return 'STOP_RECYCLE';
    case 'TRADEOFF': return 'TRADEOFF';
    case 'INSUFFICIENT_DATA': return 'PENDING';
  }
}

/**
 * Forecast legal future substat rolls from one exact +5/+10/+15/+20 candidate.
 * Every completed branch is injected into the same whole-build slot and evaluated
 * by the exact registered Character evaluator; there is no universal desired-stat score.
 */
export function forecastPartialOwnedBuildCandidate(input: {
  readonly presetId: string;
  readonly currentEchoes: readonly Echo[];
  readonly slotIndex: number;
  readonly candidate: Echo;
  readonly trials: number;
  readonly runtime: EchoRollRuntime;
  readonly continueRng: RandomSource;
  readonly restartRng: RandomSource;
}): PartialOwnedBuildCandidateForecast {
  validateCandidateCheckpoint(input);
  if (input.candidate.level === 25) {
    throw new Error('Partial owned-build candidate forecast requires +5/+10/+15/+20.');
  }
  const { binding, build } = resolveCurrentBuild(input);

  const continuation = forecastPath({
    presetId: input.presetId,
    build,
    slotIndex: input.slotIndex,
    startingEcho: cloneEcho(input.candidate),
    trials: input.trials,
    runtime: input.runtime,
    rng: input.continueRng,
    evaluator: binding.evaluator,
  });

  const fresh = input.runtime.acquireFresh(cloneEcho(input.candidate), input.restartRng);
  const restart = forecastPath({
    presetId: input.presetId,
    build,
    slotIndex: input.slotIndex,
    startingEcho: fresh.echo,
    acquisitionCost: fresh.cost,
    trials: input.trials,
    runtime: input.runtime,
    rng: input.restartRng,
    evaluator: binding.evaluator,
  });

  const pathComparison = compareContinueVsRestart(continuation.economics, restart.economics);
  const action = actionFromComparison(pathComparison);
  const nextCheckpoint = (input.candidate.level + 5) as EchoLevel;
  const expectedAbsoluteDpsGainOnSuccessfulUpgrade = continuation.viability.kept > 0
    ? continuation.successfulAbsoluteGainTotal / continuation.viability.kept
    : null;

  let headline: string;
  let reason: string;
  if (action === 'ROLL') {
    headline = `ROLL TO +${nextCheckpoint}`;
    reason = 'Continuing Pareto-dominates restarting across the tracked success, DPS and resource dimensions.';
  } else if (action === 'STOP_RECYCLE') {
    headline = 'STOP / RECYCLE';
    reason = 'Restarting Pareto-dominates continuing across the tracked success, DPS and resource dimensions.';
  } else if (action === 'TRADEOFF') {
    headline = 'RESOURCE TRADEOFF';
    reason = 'Neither path dominates without inventing a universal exchange rate between Tuners, EXP, Shell Credits and upgrade chance.';
  } else {
    headline = 'FORECAST PENDING';
    reason = 'The sampled verified branches did not produce enough successful outcomes for a Continue-vs-Restart comparison.';
  }

  return {
    presetId: input.presetId,
    slotIndex: input.slotIndex,
    candidateLevel: input.candidate.level as Exclude<EchoLevel, 0 | 25>,
    nextCheckpoint,
    trials: input.trials,
    probabilityBeatsIncumbent: continuation.viability.keepProbability,
    probabilityMandatoryGatesPass: continuation.viability.usableProbability,
    expectedDpsGainOnSuccessfulUpgrade: continuation.economics.expectedDpsGainOnSuccess,
    expectedAbsoluteDpsGainOnSuccessfulUpgrade,
    expectedRemainingCost: continuation.viability.averageFutureSpend,
    recycleNowRefund: normalizeCost(input.runtime.refundOnDiscard(input.candidate)),
    expectedAdditionalRefundOnRejectedBranch: continuation.expectedAdditionalRefundOnRejectedBranch,
    continueEconomics: continuation.economics,
    restartEconomics: restart.economics,
    pathComparison,
    action,
    headline,
    reason,
  };
}
