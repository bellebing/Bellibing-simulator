import type { ContentProvenance, VerificationStatus } from './contentRegistry.ts';
import type { EchoCost } from './gameDataDomain.ts';
import type { StatName } from './echoCore.ts';

export type ProfileStatus = VerificationStatus;

export interface ProfileBase {
  id: string;
  name: string;
  verificationStatus: ProfileStatus;
  provenance: ContentProvenance;
}

/**
 * Character -> weapon recommendations are a relationship layer, not raw weapon
 * or raw character data. The UI may pick the default and expose alternatives.
 */
export interface WeaponRecommendationOption {
  weaponId: string;
  rank: number;
  label?: string;
  relativePerformance?: number;
}

export interface WeaponRecommendationProfile extends ProfileBase {
  kind: 'WEAPON_RECOMMENDATION';
  characterId: string;
  defaultWeaponId: string;
  options: readonly WeaponRecommendationOption[];
}

/** Priority 1 is preferred; equal values are source-explicit ties. */
export interface EchoMainStatOption {
  stat: string;
  priority: number;
  notes?: string;
}

export interface EchoSlotProfile {
  cost: EchoCost;
  primaryMainStats: readonly EchoMainStatOption[];
}

/**
 * Which Echo shell a build wants. This owns layout/set/main-Echo assumptions,
 * including source-backed main-stat alternatives, but deliberately does not own
 * substat stopping policy or Roll Assistant decisions.
 */
export interface EchoLoadoutProfile extends ProfileBase {
  kind: 'ECHO_LOADOUT';
  characterId: string;
  slots: readonly EchoSlotProfile[];
  sonataSetIds: readonly string[];
  mainEchoId?: string;
}

/**
 * Source-facing build-stat priority. Priority 1 is highest; equal numbers are
 * explicit ties from the reviewed source/context.
 *
 * Core/Useful roll roles, minimum roll magnitudes and required hit counts belong
 * to CharacterRollProfile in targetCheckpointPolicy.ts instead.
 */
export interface TargetStatRule {
  stat: StatName;
  priority: number;
  notes?: string;
}

export interface StatGate {
  stat: StatName | 'Energy Regen Total';
  minimum: number;
  preferred?: number;
  notes?: string;
}

/**
 * Build stat priorities and source-backed total-stat gates are independent from
 * the Echo shell and from Roll Assistant checkpoint policy.
 */
export interface StatTargetProfile extends ProfileBase {
  kind: 'STAT_TARGET';
  characterId: string;
  targetRules: readonly TargetStatRule[];
  gates: readonly StatGate[];
}

export interface TeamMemberProfile {
  characterId: string;
  role: 'DPS' | 'SUB_DPS' | 'SUPPORT' | 'FLEX';
}

/** Team identity only. Detailed support gear/effects can be linked separately. */
export interface TeamProfile extends ProfileBase {
  kind: 'TEAM';
  members: readonly TeamMemberProfile[];
}

export type RotationExecutionStatus = 'SOURCE_SEQUENCE_ONLY' | 'ENGINE_MODELED';

/**
 * Rotation recommendation and execution are separate claims.
 *
 * A current guide can verify a sequence before Bellibing has an executable
 * rotation adapter. `SOURCE_SEQUENCE_ONLY` preserves that source truth without
 * inventing an engine model. `ENGINE_MODELED` requires an actual engineModelId.
 *
 * `modeledMechanicFactIds` are facts the engine explicitly evaluates.
 * `assumedMechanicFactIds` are source-verified facts required for the fixed
 * rotation/context to be legal or coherent but whose lifecycle is not yet
 * simulated generically.
 */
export interface RotationProfile extends ProfileBase {
  kind: 'ROTATION';
  characterId: string;
  teamProfileId: string;
  executionStatus: RotationExecutionStatus;
  sourceSequence: readonly string[];
  engineModelId?: string;
  rotationSeconds?: number;
  variantKey: string;
  modeledMechanicFactIds: readonly string[];
  assumedMechanicFactIds: readonly string[];
}

/**
 * This is the tiny composition layer the UI selects.
 * It contains no game numbers; it only points at independent databases.
 */
export interface CharacterBuildPreset extends ProfileBase {
  kind: 'CHARACTER_PRESET';
  characterId: string;
  modeKey: string;
  displayLabel: string;
  sequence: number;
  isDefault: boolean;
  uiSelectable: boolean;
  weaponRecommendationProfileId: string;
  echoLoadoutProfileId: string;
  statTargetProfileId: string;
  teamProfileId: string;
  rotationProfileId: string;
}

export interface ProfileCatalogs {
  weaponRecommendations: readonly WeaponRecommendationProfile[];
  echoLoadouts: readonly EchoLoadoutProfile[];
  statTargets: readonly StatTargetProfile[];
  teams: readonly TeamProfile[];
  rotations: readonly RotationProfile[];
  presets: readonly CharacterBuildPreset[];
}

export interface ResolvedBuildPreset {
  preset: CharacterBuildPreset;
  weaponRecommendation: WeaponRecommendationProfile;
  echoLoadout: EchoLoadoutProfile;
  statTarget: StatTargetProfile;
  team: TeamProfile;
  rotation: RotationProfile;
}
