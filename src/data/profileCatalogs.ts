import { CHARACTER_BUILD_PRESETS } from './characterBuildPresets.ts';
import { ECHO_LOADOUT_PROFILES } from './echoLoadoutProfiles.ts';
import {
  PROFILE_MULTIMODE_AALTO_ECHOES,
  PROFILE_MULTIMODE_AALTO_PRESETS,
  PROFILE_MULTIMODE_AALTO_ROTATIONS,
  PROFILE_MULTIMODE_AALTO_STATS,
  PROFILE_MULTIMODE_AALTO_TEAMS,
  PROFILE_MULTIMODE_AALTO_WEAPONS,
} from './profileMultiModeAalto20260829.ts';
import {
  PROFILE_SOURCE_BATCH_20260829_ECHOES,
  PROFILE_SOURCE_BATCH_20260829_PRESETS,
  PROFILE_SOURCE_BATCH_20260829_ROTATIONS,
  PROFILE_SOURCE_BATCH_20260829_STATS,
  PROFILE_SOURCE_BATCH_20260829_TEAMS,
  PROFILE_SOURCE_BATCH_20260829_WEAPONS,
} from './profileSourceBatch20260829.ts';
import { ROTATION_PROFILES } from './rotationProfiles.ts';
import { STAT_TARGET_PROFILES } from './statTargetProfiles.ts';
import { TEAM_PROFILES } from './teamProfiles.ts';
import { WEAPON_RECOMMENDATION_PROFILES } from './weaponRecommendations.ts';
import type { ProfileCatalogs } from '../profileDomain.ts';
import { createProfileRegistry } from '../profileRegistry.ts';

export const PROFILE_CATALOGS: ProfileCatalogs = {
  weaponRecommendations: [
    ...WEAPON_RECOMMENDATION_PROFILES,
    ...PROFILE_SOURCE_BATCH_20260829_WEAPONS,
    ...PROFILE_MULTIMODE_AALTO_WEAPONS,
  ],
  echoLoadouts: [
    ...ECHO_LOADOUT_PROFILES,
    ...PROFILE_SOURCE_BATCH_20260829_ECHOES,
    ...PROFILE_MULTIMODE_AALTO_ECHOES,
  ],
  statTargets: [
    ...STAT_TARGET_PROFILES,
    ...PROFILE_SOURCE_BATCH_20260829_STATS,
    ...PROFILE_MULTIMODE_AALTO_STATS,
  ],
  teams: [
    ...TEAM_PROFILES,
    ...PROFILE_SOURCE_BATCH_20260829_TEAMS,
    ...PROFILE_MULTIMODE_AALTO_TEAMS,
  ],
  rotations: [
    ...ROTATION_PROFILES,
    ...PROFILE_SOURCE_BATCH_20260829_ROTATIONS,
    ...PROFILE_MULTIMODE_AALTO_ROTATIONS,
  ],
  presets: [
    ...CHARACTER_BUILD_PRESETS,
    ...PROFILE_SOURCE_BATCH_20260829_PRESETS,
    ...PROFILE_MULTIMODE_AALTO_PRESETS,
  ],
};

/** Canonical resolved profile registry consumed by future UI/engines. */
export const PROFILE_REGISTRY = createProfileRegistry(PROFILE_CATALOGS);
