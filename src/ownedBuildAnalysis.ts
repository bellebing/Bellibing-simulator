import { augustaStandardEchoDamageEvaluator } from './characters/augustaEchoEvaluator.ts';
import { primaryMainStatValueAtLevel, type Echo } from './echoCore.ts';
import { PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import type { DamageEvaluator } from './domain.ts';
import { assertExactOwnedEchoRoll } from './ownedEchoCheckpointAnalysis.ts';
import { buildContextFromVerifiedPreset } from './profileBuildContext.ts';
import { resolveBuildPreset } from './profileRegistry.ts';
import { getRotationEngineRegistration } from './rotationEngineRegistry.ts';

export interface OwnedBuildDpsBinding {
  readonly presetId: string;
  readonly characterId: string;
  readonly engineModelId: string;
  readonly evaluator: DamageEvaluator;
}

export interface OwnedBuildAnalysisResult {
  readonly presetId: string;
  readonly characterId: string;
  readonly engineModelId: string;
  readonly personalRotationDps: number;
  readonly energyRegen: number;
  readonly erGate: 'PASS' | 'FAIL';
  readonly headline: string;
  readonly notes: readonly string[];
}

type BindingSpec = OwnedBuildDpsBinding;
const EPSILON = 1e-12;

const BINDING_SPECS: readonly BindingSpec[] = [
  {
    presetId: 'augusta-standard',
    characterId: 'augusta',
    engineModelId: 'AUGUSTA_STD_V1',
    evaluator: augustaStandardEchoDamageEvaluator,
  },
] as const;

function validateBinding(spec: BindingSpec): OwnedBuildDpsBinding {
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, spec.presetId);
  if (resolved.preset.characterId !== spec.characterId) {
    throw new Error(`${spec.presetId}: owned-build DPS character drift (${resolved.preset.characterId} != ${spec.characterId}).`);
  }
  if (resolved.rotation.verificationStatus !== 'VERIFIED'
      || resolved.rotation.executionStatus !== 'ENGINE_MODELED'
      || resolved.rotation.engineModelId !== spec.engineModelId) {
    throw new Error(`${spec.presetId}: owned-build DPS binding requires the exact VERIFIED ENGINE_MODELED rotation ${spec.engineModelId}.`);
  }
  const engine = getRotationEngineRegistration(spec.engineModelId);
  if (!engine || engine.characterId !== spec.characterId) {
    throw new Error(`${spec.presetId}: rotation engine registration is missing or belongs to another Character.`);
  }
  if (resolved.echoLoadout.verificationStatus !== 'VERIFIED' || resolved.echoLoadout.slots.length !== 5) {
    throw new Error(`${spec.presetId}: owned-build DPS requires a VERIFIED five-slot canonical Echo loadout.`);
  }
  return Object.freeze({ ...spec });
}

const BINDINGS = BINDING_SPECS.map(validateBinding);
const BY_PRESET = new Map(BINDINGS.map((binding) => [binding.presetId, binding]));

export function listOwnedBuildDpsBindings(): readonly OwnedBuildDpsBinding[] {
  return BINDINGS;
}

export function resolveOwnedBuildDpsBinding(presetId: string): OwnedBuildDpsBinding | null {
  return BY_PRESET.get(presetId) ?? null;
}

function validateOwnedEchoSlot(input: {
  presetId: string;
  slotIndex: number;
  echo: Echo;
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

/**
 * Evaluate one complete owned loadout only where Bellibing has both a canonical
 * ENGINE_MODELED profile and a source-backed Echo→DamageEvaluator adapter.
 * No generic score or synthetic Character build is allowed at this boundary.
 */
export function analyzeOwnedBuild(input: {
  readonly presetId: string;
  readonly echoes: readonly Echo[];
}): OwnedBuildAnalysisResult {
  const binding = resolveOwnedBuildDpsBinding(input.presetId);
  if (!binding) {
    throw new Error(`${input.presetId}: no verified owned-build DPS adapter is registered for this canonical profile.`);
  }
  if (input.echoes.length !== 5) {
    throw new Error(`${input.presetId}: owned-build DPS requires exactly five Echoes.`);
  }

  input.echoes.forEach((echo, slotIndex) => validateOwnedEchoSlot({
    presetId: input.presetId,
    slotIndex,
    echo,
  }));

  const build = buildContextFromVerifiedPreset(input.presetId, input.echoes.map((echo) => ({
    ...echo,
    mainStat: { ...echo.mainStat },
    secondaryMainStat: echo.secondaryMainStat ? { ...echo.secondaryMainStat } : undefined,
    substats: echo.substats.map((roll) => ({ ...roll })),
  })));
  const result = binding.evaluator.evaluate(build);
  if (result.erGate === 'PENDING' || !Number.isFinite(result.personalRotationDps) || !Number.isFinite(result.energyRegen)) {
    throw new Error(`${input.presetId}: registered owned-build evaluator did not produce an executable result.`);
  }

  return {
    presetId: binding.presetId,
    characterId: binding.characterId,
    engineModelId: binding.engineModelId,
    personalRotationDps: result.personalRotationDps,
    energyRegen: result.energyRegen,
    erGate: result.erGate,
    headline: result.erGate === 'PASS' ? 'PERSONAL ROTATION DPS' : 'ER GATE FAIL',
    notes: result.notes ?? [],
  };
}
