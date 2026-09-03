import type { ProfileBase, ResolvedBuildPreset, RotationExecutionStatus } from './profileDomain.ts';
import { resolveBuildPreset, type ProfileRegistry } from './profileRegistry.ts';

export type TeamExecutionResolutionStatus = 'RESOLVED' | 'PENDING' | 'UNKNOWN';
export type TeamExecutionSourceKind =
  | 'CHARACTER_MECHANIC'
  | 'WEAPON_EFFECT'
  | 'ECHO_EFFECT'
  | 'SONATA_EFFECT';

export interface TeamExecutionMemberSelection {
  characterId: string;
  presetId: string;
  modeKey: string;
  weaponRecommendationProfileId: string;
  defaultWeapon: {
    id: string;
    rank: number;
  };
  echoLoadoutProfileId: string;
  sonataSetIds: readonly string[];
  mainEchoId?: string;
  statTargetProfileId: string;
  rotationProfileId: string;
  rotationExecutionStatus: RotationExecutionStatus;
  rotationEngineModelId?: string;
}

/**
 * A source-linked contribution/dependency declaration contains identity and
 * resolution state only. Numeric values remain owned by the canonical source
 * catalog named by sourceKind/sourceId.
 */
export interface TeamExecutionContributionDependency {
  id: string;
  sourceKind: TeamExecutionSourceKind;
  sourceId: string;
  sourceCharacterId: string;
  sourcePresetId: string;
  targetCharacterId: string;
  resolutionStatus: TeamExecutionResolutionStatus;
  requiredForDps: boolean;
  requirementSummary: string;
}

export interface TeamExecutionContextInput {
  actorPresetId: string;
  memberPresetIds: readonly string[];
  contributionDependencies: readonly TeamExecutionContributionDependency[];
}

export interface ResolvedTeamExecutionContext {
  teamProfileId: string;
  actorPresetId: string;
  members: readonly TeamExecutionMemberSelection[];
  contributions: readonly TeamExecutionContributionDependency[];
  unresolvedDependencies: readonly TeamExecutionContributionDependency[];
  dpsReady: boolean;
}

function packageRows(resolved: ResolvedBuildPreset): readonly ProfileBase[] {
  return [
    resolved.preset,
    resolved.weaponRecommendation,
    resolved.echoLoadout,
    resolved.statTarget,
    resolved.team,
    resolved.rotation,
  ];
}

function resolveMemberSelection(
  registry: ProfileRegistry,
  presetId: string,
): { resolved: ResolvedBuildPreset; selection: TeamExecutionMemberSelection } {
  const resolved = resolveBuildPreset(registry, presetId);
  const unverified = packageRows(resolved).find((row) => row.verificationStatus !== 'VERIFIED');
  if (unverified) {
    throw new Error(`${presetId}: profile package row ${unverified.id} is not VERIFIED`);
  }

  const defaultWeapon = resolved.weaponRecommendation.options.find(
    (option) => option.weaponId === resolved.weaponRecommendation.defaultWeaponId,
  );
  if (!defaultWeapon) {
    throw new Error(
      `${presetId}: default weapon ${resolved.weaponRecommendation.defaultWeaponId} has no recommendation option`,
    );
  }

  return {
    resolved,
    selection: {
      characterId: resolved.preset.characterId,
      presetId: resolved.preset.id,
      modeKey: resolved.preset.modeKey,
      weaponRecommendationProfileId: resolved.weaponRecommendation.id,
      defaultWeapon: { id: defaultWeapon.weaponId, rank: defaultWeapon.rank },
      echoLoadoutProfileId: resolved.echoLoadout.id,
      sonataSetIds: resolved.echoLoadout.sonataSetIds,
      ...(resolved.echoLoadout.mainEchoId ? { mainEchoId: resolved.echoLoadout.mainEchoId } : {}),
      statTargetProfileId: resolved.statTarget.id,
      rotationProfileId: resolved.rotation.id,
      rotationExecutionStatus: resolved.rotation.executionStatus,
      ...(resolved.rotation.engineModelId ? { rotationEngineModelId: resolved.rotation.engineModelId } : {}),
    },
  };
}

/**
 * Resolve exact member preset/loadout identity before any team contribution can
 * cross into DPS. This does not calculate buffs or infer timing/state.
 * Required PENDING/UNKNOWN dependencies keep the context fail-closed.
 */
export function resolveTeamExecutionContext(
  registry: ProfileRegistry,
  input: TeamExecutionContextInput,
): ResolvedTeamExecutionContext {
  const actor = resolveBuildPreset(registry, input.actorPresetId);
  const team = actor.team;

  if (input.memberPresetIds.length !== team.members.length) {
    throw new Error(
      `${input.actorPresetId}: expected ${team.members.length} member presets for team ${team.id}, got ${input.memberPresetIds.length}`,
    );
  }

  const selections: TeamExecutionMemberSelection[] = [];
  const selectionByCharacter = new Map<string, TeamExecutionMemberSelection>();
  const selectionByPreset = new Map<string, TeamExecutionMemberSelection>();

  for (const presetId of input.memberPresetIds) {
    const { resolved, selection } = resolveMemberSelection(registry, presetId);
    if (resolved.team.id !== team.id) {
      throw new Error(`${presetId}: selected team ${resolved.team.id} does not match actor team ${team.id}`);
    }
    if (!team.members.some((member) => member.characterId === selection.characterId)) {
      throw new Error(`${presetId}: character ${selection.characterId} is not a member of team ${team.id}`);
    }
    if (selectionByCharacter.has(selection.characterId)) {
      throw new Error(`${team.id}: duplicate selected preset for character ${selection.characterId}`);
    }
    if (selectionByPreset.has(selection.presetId)) {
      throw new Error(`${team.id}: duplicate selected preset ${selection.presetId}`);
    }
    selections.push(selection);
    selectionByCharacter.set(selection.characterId, selection);
    selectionByPreset.set(selection.presetId, selection);
  }

  for (const member of team.members) {
    if (!selectionByCharacter.has(member.characterId)) {
      throw new Error(`${team.id}: missing selected preset for character ${member.characterId}`);
    }
  }

  const actorSelection = selectionByPreset.get(input.actorPresetId);
  if (!actorSelection || actorSelection.characterId !== actor.preset.characterId) {
    throw new Error(`${team.id}: actor preset ${input.actorPresetId} must be one of the selected member presets`);
  }

  const contributionIds = new Set<string>();
  for (const dependency of input.contributionDependencies) {
    if (!dependency.id.trim()) throw new Error(`${team.id}: contribution dependency id is required`);
    if (contributionIds.has(dependency.id)) {
      throw new Error(`${team.id}: duplicate contribution dependency ${dependency.id}`);
    }
    contributionIds.add(dependency.id);

    const sourceSelection = selectionByPreset.get(dependency.sourcePresetId);
    if (!sourceSelection) {
      throw new Error(
        `${dependency.id}: source preset ${dependency.sourcePresetId} is not selected for team ${team.id}`,
      );
    }
    if (sourceSelection.characterId !== dependency.sourceCharacterId) {
      throw new Error(
        `${dependency.id}: source preset ${dependency.sourcePresetId} resolves to ${sourceSelection.characterId}, expected ${dependency.sourceCharacterId}`,
      );
    }
    if (!selectionByCharacter.has(dependency.targetCharacterId)) {
      throw new Error(
        `${dependency.id}: target character ${dependency.targetCharacterId} is not selected for team ${team.id}`,
      );
    }
    if (!dependency.sourceId.trim()) throw new Error(`${dependency.id}: canonical sourceId is required`);
    if (!dependency.requirementSummary.trim()) {
      throw new Error(`${dependency.id}: requirementSummary is required`);
    }
  }

  const unresolvedDependencies = input.contributionDependencies.filter(
    (dependency) => dependency.resolutionStatus !== 'RESOLVED',
  );
  const dpsReady = !unresolvedDependencies.some((dependency) => dependency.requiredForDps);

  return {
    teamProfileId: team.id,
    actorPresetId: input.actorPresetId,
    members: selections,
    contributions: [...input.contributionDependencies],
    unresolvedDependencies,
    dpsReady,
  };
}
