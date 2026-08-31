import { augustaStandardEchoDamageEvaluator } from './characters/augustaEchoEvaluator.ts';
import {
  CIACCONA_OWNED_BUILD_PRODUCT_CONTEXT_LABEL,
  ciacconaProductOwnedBuildDamageEvaluator,
} from './characters/ciacconaProductOwnedBuildEvaluator.ts';
import type { Echo } from './echoCore.ts';
import { PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import type { DamageEvaluator } from './domain.ts';
import { validateOwnedBuildEchoLoadout } from './ownedBuildEchoValidation.ts';
import { buildContextFromVerifiedPreset } from './profileBuildContext.ts';
import { resolveBuildPreset } from './profileRegistry.ts';
import { getRotationEngineRegistration } from './rotationEngineRegistry.ts';

export interface OwnedBuildDpsBinding {
  readonly presetId: string;
  readonly characterId: string;
  readonly engineModelId: string;
  readonly contextLabel?: string;
  readonly evaluator: DamageEvaluator;
}

export interface OwnedBuildAnalysisResult {
  readonly presetId: string;
  readonly characterId: string;
  readonly engineModelId: string;
  readonly contextLabel?: string;
  readonly personalRotationDps: number;
  readonly energyRegen: number;
  readonly erGate: 'PASS' | 'FAIL';
  readonly headline: string;
  readonly notes: readonly string[];
}

type BindingSpec = OwnedBuildDpsBinding;

const BINDING_SPECS: readonly BindingSpec[] = [
  {
    presetId: 'augusta-standard',
    characterId: 'augusta',
    engineModelId: 'AUGUSTA_STD_V1',
    evaluator: augustaStandardEchoDamageEvaluator,
  },
  {
    presetId: 'ciaccona-cartethyia-aero',
    characterId: 'ciaccona',
    engineModelId: 'CIACCONA_BASIC_CARTETHYIA_ROVER_AERO_V1',
    contextLabel: CIACCONA_OWNED_BUILD_PRODUCT_CONTEXT_LABEL,
    evaluator: ciacconaProductOwnedBuildDamageEvaluator,
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

  validateOwnedBuildEchoLoadout(input);

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
    contextLabel: binding.contextLabel,
    personalRotationDps: result.personalRotationDps,
    energyRegen: result.energyRegen,
    erGate: result.erGate,
    headline: result.erGate === 'PASS' ? 'PERSONAL ROTATION DPS' : 'ER GATE FAIL',
    notes: result.notes ?? [],
  };
}
