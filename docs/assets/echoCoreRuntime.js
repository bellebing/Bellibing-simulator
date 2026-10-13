import { withRank5MainStatsAtLevel } from "./echoMainStats.js";
import { checkpointIncrement, effectiveRefundAtLevel, nextCheckpoint, rollNewSubstat, } from "./echoCoreRules.js";
/**
 * Source-backed runtime for already-eligible Rank-5 Echo candidates.
 *
 * This runtime deliberately has no knowledge of characters, builds, DPS,
 * weapons, teams or rotations. It can therefore power a standalone Echo Lab.
 *
 * Still outside verified coverage:
 * - overworld/Tacet acquisition rate,
 * - Sonata/main-stat acquisition probability,
 * - Frequency Tuner rerolls / other newer reroll systems until verified.
 *
 * `acquireFresh` currently means "another eligible +0 candidate is available",
 * not "the game guarantees the desired main stat on every drop".
 */
export class VerifiedWuwaEchoRuntime {
    acquireFresh(template, _rng) {
        const fresh = withRank5MainStatsAtLevel({
            ...template,
            id: `${template.id}:fresh`,
            substats: [],
        }, 0);
        return {
            echo: fresh,
            cost: { echoes: 1, tuners: 0, exp: 0 },
        };
    }
    rollNext(current, rng) {
        const to = nextCheckpoint(current.level);
        if (to === null)
            return null;
        const nextStat = rollNewSubstat(current.substats, rng);
        const progressed = withRank5MainStatsAtLevel(current, to);
        return {
            echo: {
                ...progressed,
                substats: [...current.substats, nextStat],
            },
            cost: checkpointIncrement(current.level, to),
        };
    }
    refundOnDiscard(current) {
        return effectiveRefundAtLevel(current.level);
    }
}
