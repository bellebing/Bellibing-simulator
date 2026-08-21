import type {
  Echo,
  EchoRollRuntime,
  RandomSource,
  RollStep,
} from './echoCoreDomain.ts';
import {
  checkpointIncrement,
  effectiveRefundAtLevel,
  nextCheckpoint,
  rollNewSubstat,
} from './echoCoreRules.ts';

/**
 * Source-backed runtime for already-eligible Rank-5 Echo candidates.
 *
 * This runtime deliberately has no knowledge of characters, builds, DPS,
 * weapons, teams or rotations. It can therefore power a standalone Echo Lab.
 *
 * Still outside verified coverage:
 * - overworld/Tacet acquisition rate,
 * - Sonata/main-stat acquisition probability,
 * - Frequency Tuner rerolls,
 * - Shell Credit economics.
 *
 * `acquireFresh` currently means "another eligible +0 candidate is available",
 * not "the game guarantees the desired main stat on every drop".
 */
export class VerifiedWuwaEchoRuntime implements EchoRollRuntime {
  acquireFresh(template: Echo, _rng: RandomSource): RollStep {
    return {
      echo: {
        ...template,
        id: `${template.id}:fresh`,
        level: 0,
        substats: [],
      },
      cost: { echoes: 1, tuners: 0, exp: 0 },
    };
  }

  rollNext(current: Echo, rng: RandomSource): RollStep | null {
    const to = nextCheckpoint(current.level);
    if (to === null) return null;

    const nextStat = rollNewSubstat(current.substats, rng);
    return {
      echo: {
        ...current,
        level: to,
        substats: [...current.substats, nextStat],
      },
      cost: checkpointIncrement(current.level, to),
    };
  }

  refundOnDiscard(current: Echo) {
    return effectiveRefundAtLevel(current.level);
  }
}
