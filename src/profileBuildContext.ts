import type { BuildContext, Echo } from './domain.ts';
import { PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import { resolveBuildPreset } from './profileRegistry.ts';

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
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, presetId);
  const packageRows = [
    resolved.preset,
    resolved.weaponRecommendation,
    resolved.echoLoadout,
    resolved.statTarget,
    resolved.team,
    resolved.rotation,
  ];

  const unverified = packageRows.find((row) => row.verificationStatus !== 'VERIFIED');
  if (unverified) {
    throw new Error(`${presetId}: profile package row ${unverified.id} is not VERIFIED`);
  }
  if (resolved.rotation.executionStatus !== 'ENGINE_MODELED' || !resolved.rotation.engineModelId) {
    throw new Error(`${presetId}: rotation ${resolved.rotation.id} is not ENGINE_MODELED`);
  }

  const defaultWeapon = resolved.weaponRecommendation.options.find(
    (option) => option.weaponId === resolved.weaponRecommendation.defaultWeaponId,
  );
  if (!defaultWeapon) {
    throw new Error(`${presetId}: default weapon ${resolved.weaponRecommendation.defaultWeaponId} has no recommendation option`);
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
