/**
 * Public character-independent Echo API.
 *
 * Echo Lab and any future tooling that only cares about Wuthering Waves Echo
 * mechanics should import from this module. This module must never import
 * character, weapon, team, rotation, combat or DPS code.
 */
export type {
  Echo,
  EchoLevel,
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

export { EchoLab, type EchoLabSession } from './echoCoreLab.ts';
export { VerifiedWuwaEchoRuntime } from './echoCoreRuntime.ts';
