import { resolveBuildPreset, type ProfileRegistry } from './profileRegistry.ts';

/**
 * Resolve verified preset identity and its default weapon for both personal and
 * team contexts. Rotation executability remains the consuming adapter's gate:
 * SOURCE_SEQUENCE_ONLY is valid teammate identity, never executable timing.
 */
export function resolveVerifiedProfileSelection(registry: ProfileRegistry, presetId: string) {
  const resolved = resolveBuildPreset(registry, presetId);
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
  const defaultWeapon = resolved.weaponRecommendation.options.find(
    (option) => option.weaponId === resolved.weaponRecommendation.defaultWeaponId,
  );
  if (!defaultWeapon) {
    throw new Error(`${presetId}: default weapon ${resolved.weaponRecommendation.defaultWeaponId} has no recommendation option`);
  }
  return { resolved, defaultWeapon };
}
