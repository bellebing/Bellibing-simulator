import type { EchoEffectModel } from './echoEffectDomain.ts';
import {
  getEchoEffectsForWielder,
  type EchoEffectRegistry,
} from './echoEffectRegistry.ts';
import {
  resolveBuildPreset,
  type ProfileRegistry,
} from './profileRegistry.ts';

/**
 * Resolve permanent main-slot Echo effects for one canonical build preset.
 *
 * This is a static profile/effect bridge only. It does not execute Echo casts,
 * rotations, timed windows or active-skill damage.
 */
export function resolvePresetMainEchoEffects(
  profileRegistry: ProfileRegistry,
  echoEffectRegistry: EchoEffectRegistry,
  presetId: string,
): readonly EchoEffectModel[] {
  const build = resolveBuildPreset(profileRegistry, presetId);
  const mainEchoId = build.echoLoadout.mainEchoId;
  if (!mainEchoId) return [];

  return getEchoEffectsForWielder(
    echoEffectRegistry,
    mainEchoId,
    build.preset.characterId,
  ).filter((effect) => effect.activation === 'MAIN_SLOT_PASSIVE');
}
