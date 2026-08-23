import { CHARACTER_BUILD_PRESETS } from './characterBuildPresets.ts';
import { ECHO_LOADOUT_PROFILES } from './echoLoadoutProfiles.ts';
import { ROTATION_PROFILES } from './rotationProfiles.ts';
import { STAT_TARGET_PROFILES } from './statTargetProfiles.ts';
import { TEAM_PROFILES } from './teamProfiles.ts';
import { WEAPON_RECOMMENDATION_PROFILES } from './weaponRecommendations.ts';
import type { ProfileCatalogs } from '../profileDomain.ts';
import { createProfileRegistry } from '../profileRegistry.ts';

export const PROFILE_CATALOGS: ProfileCatalogs = {
  weaponRecommendations: WEAPON_RECOMMENDATION_PROFILES,
  echoLoadouts: ECHO_LOADOUT_PROFILES,
  statTargets: STAT_TARGET_PROFILES,
  teams: TEAM_PROFILES,
  rotations: ROTATION_PROFILES,
  presets: CHARACTER_BUILD_PRESETS,
};

/** Canonical resolved profile registry consumed by future UI/engines. */
export const PROFILE_REGISTRY = createProfileRegistry(PROFILE_CATALOGS);
