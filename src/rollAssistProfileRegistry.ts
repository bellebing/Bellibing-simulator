import { AUGUSTA_RECOMMENDED_V915 } from './characters/augustaRecommended.ts';
import { PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import { resolveBuildPreset } from './profileRegistry.ts';
import type { CharacterRollProfile } from './targetCheckpointPolicy.ts';

export interface RollAssistProfileBinding {
  readonly presetId: string;
  readonly characterId: string;
  readonly characterName: string;
  readonly policy: CharacterRollProfile;
}

type BindingSpec = RollAssistProfileBinding;

const BINDING_SPECS: readonly BindingSpec[] = [
  {
    presetId: 'augusta-standard',
    characterId: 'augusta',
    characterName: 'Augusta',
    policy: AUGUSTA_RECOMMENDED_V915,
  },
] as const;

function validateBinding(spec: BindingSpec): RollAssistProfileBinding {
  const preset = PROFILE_REGISTRY.presets.get(spec.presetId);
  if (!preset) throw new Error(`${spec.presetId}: Roll Assist binding preset is missing from PROFILE_REGISTRY.`);
  if (preset.characterId !== spec.characterId) {
    throw new Error(`${spec.presetId}: Roll Assist character drift (${preset.characterId} != ${spec.characterId}).`);
  }
  if (preset.verificationStatus !== 'VERIFIED') {
    throw new Error(`${spec.presetId}: Roll Assist binding requires a VERIFIED canonical preset.`);
  }

  const resolved = resolveBuildPreset(PROFILE_REGISTRY, spec.presetId);
  if (resolved.echoLoadout.verificationStatus !== 'VERIFIED') {
    throw new Error(`${spec.presetId}: Roll Assist binding requires a VERIFIED canonical Echo loadout.`);
  }
  if (resolved.echoLoadout.slots.length !== spec.policy.slots.length) {
    throw new Error(`${spec.presetId}: Roll Assist slot count drift.`);
  }

  for (let index = 0; index < spec.policy.slots.length; index += 1) {
    const policySlot = spec.policy.slots[index]!;
    const canonicalSlot = resolved.echoLoadout.slots[index]!;
    if (canonicalSlot.cost !== policySlot.cost) {
      throw new Error(`${spec.presetId}: Roll Assist slot ${index + 1} cost drift (${canonicalSlot.cost} != ${policySlot.cost}).`);
    }
    if (!canonicalSlot.primaryMainStats.some((row) => row.stat === policySlot.primaryMain)) {
      throw new Error(`${spec.presetId}: Roll Assist slot ${index + 1} main-stat drift (${policySlot.primaryMain}).`);
    }
  }

  return Object.freeze({ ...spec });
}

const BINDINGS = BINDING_SPECS.map(validateBinding);
const BINDING_BY_PRESET = new Map(BINDINGS.map((binding) => [binding.presetId, binding]));

export function listRollAssistProfileBindings(): readonly RollAssistProfileBinding[] {
  return BINDINGS;
}

export function resolveRollAssistProfileBinding(presetId: string): RollAssistProfileBinding | null {
  return BINDING_BY_PRESET.get(presetId) ?? null;
}

export function getDefaultRollAssistProfileBinding(): RollAssistProfileBinding {
  const binding = resolveRollAssistProfileBinding('augusta-standard');
  if (!binding) throw new Error('Default Augusta Roll Assist binding is missing.');
  return binding;
}

export function buildRollAssistHref(binding: RollAssistProfileBinding): string {
  return `./roll-assistant.html?character=${encodeURIComponent(binding.characterId)}&preset=${encodeURIComponent(binding.presetId)}`;
}
