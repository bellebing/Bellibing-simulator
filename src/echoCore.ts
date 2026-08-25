/**
 * Public character-independent Echo API.
 *
 * Echo Lab and any future tooling that only cares about Wuthering Waves Echo
 * mechanics should import from this module. This module must never import
 * character, weapon, team, rotation, combat or DPS code.
 */
export type {
  Echo,
  EchoCost,
  EchoLevel,
  EchoRank,
  EchoRollRuntime,
  RandomSource,
  ResourceCost,
  RollStep,
  StatName,
  StatRoll,
} from './echoCoreDomain.ts';

export {
  CHECKPOINT_CUMULATIVE_COST,
  ECHO_ECONOMY_PROVENANCE,
  ECHO_EXP_RECOVERY_FRACTION,
  ECHO_RNG_PROVENANCE,
  SUBSTAT_TYPES,
  SUBSTAT_VALUE_PROBABILITIES,
  SUBSTAT_VALUE_TABLE,
  TUNER_RECOVERY_FRACTION,
  checkpointIncrement,
  effectiveRefundAtLevel,
  nextCheckpoint,
  rollNewSubstat,
  rollSubstatValue,
  weightedIndex,
} from './echoCoreRules.ts';

export {
  ECHO_MAIN_STAT_PROVENANCE,
  RANK5_MAIN_STAT_GROWTH,
  RANK5_PRIMARY_MAIN_STATS,
  RANK5_SECONDARY_MAIN_STATS,
  createRank5EchoAtLevel0,
  isPrimaryMainStatAllowed,
  primaryMainStatProfile,
  primaryMainStatValueAtLevel,
  secondaryMainStatValueAtLevel,
  withRank5MainStatsAtLevel,
  type PrimaryMainStatName,
  type Rank5MainStatProfile,
  type Rank5SecondaryMainStatProfile,
} from './echoMainStats.ts';

export {
  EchoLab,
  type EchoLabAcquisitionRequest,
  type EchoLabSession,
} from './echoCoreLab.ts';
export {
  ECHO_STRATEGY_SIMULATOR_PROVENANCE,
  simulateDesiredSubstatStrategy,
  type DesiredSubstatStrategy,
  type EchoStrategySimulationResult,
  type StrategyCheckpoint,
} from './echoStrategySimulator.ts';
export { createSeededRng, SeededRng, seedFromString } from './seededRng.ts';
export { VerifiedWuwaEchoRuntime } from './echoCoreRuntime.ts';
