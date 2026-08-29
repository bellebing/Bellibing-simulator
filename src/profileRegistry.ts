import { CHARACTER_CATALOG } from './data/characters.ts';
import { ECHO_CATALOG } from './data/echoes.ts';
import { SONATA_CATALOG } from './data/sonatas.ts';
import { WEAPON_CATALOG } from './data/weapons.ts';
import type {
  CharacterBuildPreset,
  EchoLoadoutProfile,
  ProfileBase,
  ProfileCatalogs,
  ResolvedBuildPreset,
  RotationProfile,
  StatTargetProfile,
  TeamProfile,
  WeaponRecommendationProfile,
} from './profileDomain.ts';

export interface ProfileRegistry {
  weaponRecommendations: ReadonlyMap<string, WeaponRecommendationProfile>;
  echoLoadouts: ReadonlyMap<string, EchoLoadoutProfile>;
  statTargets: ReadonlyMap<string, StatTargetProfile>;
  teams: ReadonlyMap<string, TeamProfile>;
  rotations: ReadonlyMap<string, RotationProfile>;
  presets: ReadonlyMap<string, CharacterBuildPreset>;
}

function mapUnique<T extends ProfileBase>(rows: readonly T[], label: string): ReadonlyMap<string, T> {
  const map = new Map<string, T>();
  for (const row of rows) {
    if (map.has(row.id)) throw new Error(`Duplicate ${label} profile id: ${row.id}`);
    map.set(row.id, row);
  }
  return map;
}

function requireCharacter(id: string): void {
  if (!CHARACTER_CATALOG.some((row) => row.id === id)) throw new Error(`Unknown character id: ${id}`);
}

function requireWeapon(id: string): void {
  if (!WEAPON_CATALOG.some((row) => row.id === id)) throw new Error(`Unknown weapon id: ${id}`);
}

function requireEcho(id: string): void {
  if (!ECHO_CATALOG.some((row) => row.id === id)) throw new Error(`Unknown Echo id: ${id}`);
}

function requireSonata(id: string): void {
  if (!SONATA_CATALOG.some((row) => row.id === id)) throw new Error(`Unknown Sonata id: ${id}`);
}

function validateWeaponProfile(profile: WeaponRecommendationProfile): void {
  requireCharacter(profile.characterId);
  requireWeapon(profile.defaultWeaponId);
  if (!profile.options.some((option) => option.weaponId === profile.defaultWeaponId)) {
    throw new Error(`${profile.id}: default weapon must exist in options.`);
  }
  const seen = new Set<string>();
  for (const option of profile.options) {
    requireWeapon(option.weaponId);
    if (seen.has(option.weaponId)) throw new Error(`${profile.id}: duplicate weapon option ${option.weaponId}.`);
    seen.add(option.weaponId);
    if (!Number.isInteger(option.rank) || option.rank < 1 || option.rank > 5) {
      throw new Error(`${profile.id}: invalid rank for ${option.weaponId}.`);
    }
  }
}

function validateEchoLoadout(profile: EchoLoadoutProfile): void {
  requireCharacter(profile.characterId);
  if (profile.slots.length !== 5) throw new Error(`${profile.id}: a full Echo loadout must contain 5 slots.`);
  const totalCost = profile.slots.reduce((sum, slot) => sum + slot.cost, 0);
  if (totalCost > 12) throw new Error(`${profile.id}: Echo COST ${totalCost} exceeds 12.`);

  for (const [index, slot] of profile.slots.entries()) {
    if (slot.primaryMainStats.length === 0) throw new Error(`${profile.id}: slot ${index + 1} needs at least one primary main-stat option.`);
    const seen = new Set<string>();
    let priorPriority = 0;
    for (const option of slot.primaryMainStats) {
      if (!option.stat.trim()) throw new Error(`${profile.id}: slot ${index + 1} has a blank primary main stat.`);
      if (seen.has(option.stat)) throw new Error(`${profile.id}: slot ${index + 1} duplicates primary main stat ${option.stat}.`);
      seen.add(option.stat);
      if (!Number.isInteger(option.priority) || option.priority < 1) {
        throw new Error(`${profile.id}: slot ${index + 1} priority for ${option.stat} must be a positive integer.`);
      }
      if (option.priority < priorPriority) {
        throw new Error(`${profile.id}: slot ${index + 1} main-stat options must be ordered from highest to lowest priority.`);
      }
      priorPriority = option.priority;
    }
  }

  for (const setId of profile.sonataSetIds) requireSonata(setId);
  if (profile.mainEchoId) requireEcho(profile.mainEchoId);
}

function validateStatTarget(profile: StatTargetProfile): void {
  requireCharacter(profile.characterId);
  const names = new Set<string>();
  let priorPriority = 0;
  for (const rule of profile.targetRules) {
    if (names.has(rule.stat)) throw new Error(`${profile.id}: duplicate stat rule ${rule.stat}.`);
    names.add(rule.stat);
    if (!Number.isInteger(rule.priority) || rule.priority < 1) {
      throw new Error(`${profile.id}: priority for ${rule.stat} must be a positive integer.`);
    }
    if (rule.priority < priorPriority) {
      throw new Error(`${profile.id}: stat target rules must be ordered from highest to lowest priority.`);
    }
    priorPriority = rule.priority;
  }
  for (const gate of profile.gates) {
    if (!(gate.minimum >= 0)) throw new Error(`${profile.id}: invalid minimum gate for ${gate.stat}.`);
    if (gate.preferred !== undefined && gate.preferred < gate.minimum) {
      throw new Error(`${profile.id}: preferred gate for ${gate.stat} cannot be below minimum.`);
    }
  }
}

function validateTeam(profile: TeamProfile): void {
  if (profile.members.length !== 3) throw new Error(`${profile.id}: Wuthering Waves team profile must contain 3 members.`);
  const ids = new Set<string>();
  for (const member of profile.members) {
    requireCharacter(member.characterId);
    if (ids.has(member.characterId)) throw new Error(`${profile.id}: duplicate team member ${member.characterId}.`);
    ids.add(member.characterId);
  }
}

function validateRotation(profile: RotationProfile, teams: ReadonlyMap<string, TeamProfile>): void {
  requireCharacter(profile.characterId);
  const team = teams.get(profile.teamProfileId);
  if (!team) throw new Error(`${profile.id}: unknown team profile ${profile.teamProfileId}.`);
  if (!team.members.some((member) => member.characterId === profile.characterId)) {
    throw new Error(`${profile.id}: rotation character is not in team ${profile.teamProfileId}.`);
  }
  if (!profile.variantKey.trim()) throw new Error(`${profile.id}: variantKey is required.`);
  if (profile.sourceSequence.some((step) => !step.trim())) throw new Error(`${profile.id}: source rotation contains a blank step.`);

  if (profile.executionStatus === 'ENGINE_MODELED') {
    if (!profile.engineModelId?.trim()) throw new Error(`${profile.id}: ENGINE_MODELED rotation requires engineModelId.`);
  } else {
    if (profile.sourceSequence.length === 0) throw new Error(`${profile.id}: SOURCE_SEQUENCE_ONLY rotation requires sourceSequence.`);
    if (profile.engineModelId !== undefined) throw new Error(`${profile.id}: SOURCE_SEQUENCE_ONLY rotation cannot claim engineModelId.`);
    if (profile.modeledMechanicFactIds.length > 0) {
      throw new Error(`${profile.id}: SOURCE_SEQUENCE_ONLY rotation cannot claim modeled mechanic facts.`);
    }
  }
}

export function createProfileRegistry(catalogs: ProfileCatalogs): ProfileRegistry {
  const weaponRecommendations = mapUnique(catalogs.weaponRecommendations, 'weapon recommendation');
  const echoLoadouts = mapUnique(catalogs.echoLoadouts, 'Echo loadout');
  const statTargets = mapUnique(catalogs.statTargets, 'stat target');
  const teams = mapUnique(catalogs.teams, 'team');
  const rotations = mapUnique(catalogs.rotations, 'rotation');
  const presets = mapUnique(catalogs.presets, 'preset');

  for (const profile of weaponRecommendations.values()) validateWeaponProfile(profile);
  for (const profile of echoLoadouts.values()) validateEchoLoadout(profile);
  for (const profile of statTargets.values()) validateStatTarget(profile);
  for (const profile of teams.values()) validateTeam(profile);
  for (const profile of rotations.values()) validateRotation(profile, teams);

  const defaultByCharacter = new Map<string, string>();
  for (const preset of presets.values()) {
    requireCharacter(preset.characterId);
    if (!Number.isInteger(preset.sequence) || preset.sequence < 0 || preset.sequence > 6) {
      throw new Error(`${preset.id}: sequence must be 0-6.`);
    }

    const weapon = weaponRecommendations.get(preset.weaponRecommendationProfileId);
    const echo = echoLoadouts.get(preset.echoLoadoutProfileId);
    const stat = statTargets.get(preset.statTargetProfileId);
    const team = teams.get(preset.teamProfileId);
    const rotation = rotations.get(preset.rotationProfileId);
    if (!weapon || !echo || !stat || !team || !rotation) throw new Error(`${preset.id}: dangling profile reference.`);

    for (const [kind, targetCharacter] of [
      ['weapon', weapon.characterId],
      ['echo', echo.characterId],
      ['stat', stat.characterId],
      ['rotation', rotation.characterId],
    ] as const) {
      if (targetCharacter !== preset.characterId) {
        throw new Error(`${preset.id}: ${kind} profile targets ${targetCharacter}, expected ${preset.characterId}.`);
      }
    }
    if (rotation.teamProfileId !== preset.teamProfileId) {
      throw new Error(`${preset.id}: rotation/team mismatch.`);
    }
    if (!team.members.some((member) => member.characterId === preset.characterId)) {
      throw new Error(`${preset.id}: selected character is not in selected team.`);
    }

    if (preset.isDefault) {
      const existing = defaultByCharacter.get(preset.characterId);
      if (existing) throw new Error(`${preset.characterId}: multiple default presets (${existing}, ${preset.id}).`);
      defaultByCharacter.set(preset.characterId, preset.id);
    }
  }

  return { weaponRecommendations, echoLoadouts, statTargets, teams, rotations, presets };
}

export function resolveBuildPreset(registry: ProfileRegistry, presetId: string): ResolvedBuildPreset {
  const preset = registry.presets.get(presetId);
  if (!preset) throw new Error(`Unknown preset id: ${presetId}`);
  const weaponRecommendation = registry.weaponRecommendations.get(preset.weaponRecommendationProfileId)!;
  const echoLoadout = registry.echoLoadouts.get(preset.echoLoadoutProfileId)!;
  const statTarget = registry.statTargets.get(preset.statTargetProfileId)!;
  const team = registry.teams.get(preset.teamProfileId)!;
  const rotation = registry.rotations.get(preset.rotationProfileId)!;
  return { preset, weaponRecommendation, echoLoadout, statTarget, team, rotation };
}

export function listCharacterPresets(registry: ProfileRegistry, characterId: string): readonly CharacterBuildPreset[] {
  return [...registry.presets.values()]
    .filter((preset) => preset.characterId === characterId && preset.uiSelectable)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.displayLabel.localeCompare(b.displayLabel));
}

export function getDefaultBuildPreset(registry: ProfileRegistry, characterId: string): ResolvedBuildPreset | null {
  const preset = listCharacterPresets(registry, characterId).find((row) => row.isDefault);
  return preset ? resolveBuildPreset(registry, preset.id) : null;
}
