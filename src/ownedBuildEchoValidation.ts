import {
  primaryMainStatValueAtLevel,
  secondaryMainStatValueAtLevel,
  type Echo,
} from './echoCore.ts';
import { PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import { assertExactOwnedEchoRoll } from './ownedEchoCheckpointAnalysis.ts';
import { resolveBuildPreset } from './profileRegistry.ts';

const EPSILON = 1e-12;

export function validateOwnedBuildEchoSlot(input: {
  readonly presetId: string;
  readonly slotIndex: number;
  readonly echo: Echo;
}): void {
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, input.presetId);
  const canonical = resolved.echoLoadout.slots[input.slotIndex];
  if (!canonical) throw new RangeError(`${input.presetId}: invalid owned-build Echo slot ${input.slotIndex + 1}.`);

  if (input.echo.rank !== 5) throw new Error(`${input.presetId}: owned-build DPS requires Rank-5 Echoes.`);
  if (input.echo.level !== 25) throw new Error(`${input.presetId}: owned-build DPS requires all five Echoes at +25.`);
  if (input.echo.cost !== canonical.cost) {
    throw new Error(`${input.presetId}: Echo ${input.slotIndex + 1} COST ${input.echo.cost} does not match canonical COST ${canonical.cost}.`);
  }
  if (!canonical.primaryMainStats.some((row) => row.stat === input.echo.mainStat.name)) {
    throw new Error(`${input.presetId}: Echo ${input.slotIndex + 1} main stat ${input.echo.mainStat.name} is outside the canonical slot recommendation.`);
  }

  const expectedMain = primaryMainStatValueAtLevel(input.echo.cost, input.echo.mainStat.name, 25);
  if (expectedMain === null || Math.abs(input.echo.mainStat.value - expectedMain) > EPSILON) {
    throw new Error(`${input.presetId}: Echo ${input.slotIndex + 1} primary main-stat value is not the exact Rank-5 +25 value.`);
  }

  if (input.echo.secondaryMainStat) {
    const expectedSecondaryName = input.echo.cost === 1 ? 'Flat HP' : 'Flat ATK';
    const expectedSecondaryValue = secondaryMainStatValueAtLevel(input.echo.cost, 25);
    if (input.echo.secondaryMainStat.name !== expectedSecondaryName
        || Math.abs(input.echo.secondaryMainStat.value - expectedSecondaryValue) > EPSILON) {
      throw new Error(`${input.presetId}: Echo ${input.slotIndex + 1} secondary main stat is not the exact COST-bound Rank-5 +25 value.`);
    }
  }

  if (input.echo.substats.length !== 5) {
    throw new Error(`${input.presetId}: Echo ${input.slotIndex + 1} must contain exactly five +25 substats.`);
  }
  const names = new Set<string>();
  for (const roll of input.echo.substats) {
    if (names.has(roll.name)) throw new Error(`${input.presetId}: Echo ${input.slotIndex + 1} contains duplicate substat ${roll.name}.`);
    names.add(roll.name);
    assertExactOwnedEchoRoll(roll);
  }
}

export function validateOwnedBuildEchoLoadout(input: {
  readonly presetId: string;
  readonly echoes: readonly Echo[];
}): void {
  if (input.echoes.length !== 5) {
    throw new Error(`${input.presetId}: owned-build DPS requires exactly five Echoes.`);
  }
  input.echoes.forEach((echo, slotIndex) => validateOwnedBuildEchoSlot({
    presetId: input.presetId,
    slotIndex,
    echo,
  }));
}
