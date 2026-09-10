import type { BuildContext, Echo } from './domain.ts';
import { PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import { resolveVerifiedProfileSelection } from './verifiedProfileSelection.ts';

export const PROFILE_BUILD_CONTEXT_ADAPTER_ID = 'profile-build-context-v1' as const;

/**
 * Convert a composable, verified profile preset into the legacy BuildContext
 * shape consumed by current character evaluators. The user's actual Echo cards
 * remain runtime input; profile data supplies only identity/default context.
 *
 * This adapter deliberately refuses SOURCE_SEQUENCE_ONLY profiles. A source
 * sequence is review truth, not executable combat timing.
 */
export function buildContextFromVerifiedPreset(
  presetId: string,
  echoes: Echo[],
): BuildContext {
  const { resolved, defaultWeapon } = resolveVerifiedProfileSelection(PROFILE_REGISTRY, presetId);
  if (resolved.rotation.executionStatus !== 'ENGINE_MODELED' || !resolved.rotation.engineModelId) {
    throw new Error(`${presetId}: rotation ${resolved.rotation.id} is not ENGINE_MODELED`);
  }

  return {
    characterId: resolved.preset.characterId,
    sequence: resolved.preset.sequence,
    weapon: { id: defaultWeapon.weaponId, rank: defaultWeapon.rank },
    teamId: resolved.team.id,
    echoes,
    maxSkills: true,
    rotationProfileId: resolved.rotation.engineModelId,
  };
}
