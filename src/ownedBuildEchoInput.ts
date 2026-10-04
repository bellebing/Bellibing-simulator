import {
  createRank5EchoAtLevel0,
  withRank5MainStatsAtLevel,
  type Echo,
  type EchoLevel,
  type PrimaryMainStatName,
  type StatName,
  type StatRoll,
} from './echoCore.ts';
import { PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import { assertExactRank5SubstatRoll } from './echoCoreRules.ts';
import { resolveBuildPreset } from './profileRegistry.ts';

export type OwnedBuildEchoInputLevel = Exclude<EchoLevel, 0>;

export interface OwnedBuildEchoInput {
  readonly presetId: string;
  readonly slotIndex: number;
  readonly level: OwnedBuildEchoInputLevel;
  readonly primaryMainStat: string;
  readonly substats: readonly StatRoll[];
}

const CHECKPOINT_LEVELS: readonly OwnedBuildEchoInputLevel[] = [5, 10, 15, 20, 25] as const;

/** Build an exact user-owned Rank-5 card from canonical slot/main-stat and roll data. */
export function buildOwnedBuildEchoFromCanonicalInput(input: OwnedBuildEchoInput): Echo {
  if (!CHECKPOINT_LEVELS.includes(input.level)) {
    throw new RangeError(`Owned-build Echo input requires +5/+10/+15/+20/+25, got +${input.level}.`);
  }
  if (!Number.isInteger(input.slotIndex)) throw new RangeError('Owned-build Echo slot index must be an integer.');

  const resolved = resolveBuildPreset(PROFILE_REGISTRY, input.presetId);
  const slot = resolved.echoLoadout.slots[input.slotIndex];
  if (!slot) throw new RangeError(`${input.presetId}: invalid owned-build Echo slot ${input.slotIndex + 1}.`);
  if (!slot.primaryMainStats.some((option) => option.stat === input.primaryMainStat)) {
    throw new Error(`${input.presetId}: ${input.primaryMainStat} is outside canonical main-stat options for Echo ${input.slotIndex + 1}.`);
  }

  const expectedSubstats = input.level / 5;
  if (input.substats.length !== expectedSubstats) {
    throw new Error(`+${input.level} owned-build Echo requires exactly ${expectedSubstats} substats.`);
  }
  const seen = new Set<StatName>();
  for (const roll of input.substats) {
    if (seen.has(roll.name)) throw new Error(`Duplicate Echo substat: ${roll.name}.`);
    seen.add(roll.name);
    assertExactRank5SubstatRoll(roll);
  }

  const level0 = createRank5EchoAtLevel0({
    id: `owned-${resolved.preset.characterId}-${input.slotIndex + 1}`,
    cost: slot.cost,
    primaryMainStat: input.primaryMainStat as PrimaryMainStatName,
  });
  return {
    ...withRank5MainStatsAtLevel(level0, input.level),
    substats: input.substats.map((roll) => ({ ...roll })),
  };
}
