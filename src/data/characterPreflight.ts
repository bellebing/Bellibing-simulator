import type { VerificationStatus } from '../contentRegistry.ts';
import { CHARACTER_INTRINSIC_BY_ID, RELEASED_CHARACTER_INTRINSIC_PENDING } from './characterIntrinsicStats.ts';
import { getCharacterGameData } from './characters.ts';
import { getCharacterMechanicsProfile } from './characterMechanics.ts';
import { RELEASED_CHARACTER_RAW_PENDING } from './characterRawAudit.ts';
import { PROFILE_CATALOGS } from './profileCatalogs.ts';

export type CharacterPreflightTarget = 'RAW_FACTS' | 'BUILD_PROFILE' | 'DPS_MODEL';
export type CharacterPreflightStatus = 'PASS' | 'PENDING' | 'MISSING' | 'NOT_APPLICABLE';

export type CharacterPreflightArea =
  | 'RELEASE_STATUS'
  | 'IDENTITY_LEVEL90'
  | 'INTRINSIC_STATS'
  | 'CHARACTER_MECHANICS'
  | 'WEAPON_PROFILE'
  | 'ECHO_LOADOUT_PROFILE'
  | 'STAT_TARGET_PROFILE'
  | 'TEAM_PROFILE'
  | 'ROTATION_PROFILE'
  | 'BUILD_PRESET';

export interface CharacterPreflightCheck {
  area: CharacterPreflightArea;
  status: CharacterPreflightStatus;
  details: readonly string[];
  requiredFor: readonly CharacterPreflightTarget[];
}

export interface CharacterPreflightReport {
  characterId: string;
  characterName: string;
  target: CharacterPreflightTarget;
  checks: readonly CharacterPreflightCheck[];
  ready: boolean;
  blockers: readonly CharacterPreflightCheck[];
}

const RAW_REQUIRED: readonly CharacterPreflightTarget[] = ['RAW_FACTS', 'BUILD_PROFILE', 'DPS_MODEL'];
const BUILD_REQUIRED: readonly CharacterPreflightTarget[] = ['BUILD_PROFILE', 'DPS_MODEL'];
const DPS_REQUIRED: readonly CharacterPreflightTarget[] = ['DPS_MODEL'];

function verificationStatusToPreflight(status: VerificationStatus): CharacterPreflightStatus {
  if (status === 'VERIFIED') return 'PASS';
  if (status === 'PARTIALLY_VERIFIED' || status === 'PENDING') return 'PENDING';
  return 'PENDING';
}

function rawLevel90Check(characterId: string): CharacterPreflightCheck {
  const character = getCharacterGameData(characterId);
  if (!character) {
    return { area: 'IDENTITY_LEVEL90', status: 'MISSING', details: ['Character record does not exist.'], requiredFor: RAW_REQUIRED };
  }

  const missing: string[] = [];
  if (character.element === null) missing.push('element');
  if (character.weaponType === null) missing.push('weaponType');
  if (character.level90.hp === null) missing.push('hp');
  if (character.level90.atk === null) missing.push('atk');
  if (character.level90.def === null) missing.push('def');
  if (character.level90.maxEnergy === null) missing.push('maxEnergy');
  if (character.baseCombat.critRate === null) missing.push('critRate');
  if (character.baseCombat.critDamage === null) missing.push('critDamage');
  if (character.baseCombat.energyRegen === null) missing.push('energyRegen');

  if (missing.length === 0) {
    return { area: 'IDENTITY_LEVEL90', status: 'PASS', details: ['All required identity/Lv90/base-combat fields are present.'], requiredFor: RAW_REQUIRED };
  }

  const pending = RELEASED_CHARACTER_RAW_PENDING.find((row) => row.characterId === characterId);
  const registered = new Set(pending?.fields ?? []);
  const unregistered = missing.filter((field) => !registered.has(field as never));
  if (unregistered.length > 0) {
    return {
      area: 'IDENTITY_LEVEL90',
      status: 'MISSING',
      details: [`Unregistered missing raw fields: ${unregistered.join(', ')}`],
      requiredFor: RAW_REQUIRED,
    };
  }

  return {
    area: 'IDENTITY_LEVEL90',
    status: 'PENDING',
    details: [`Explicit pending raw fields: ${missing.join(', ')}`, pending?.reason ?? 'Pending reason missing.'],
    requiredFor: RAW_REQUIRED,
  };
}

function intrinsicCheck(characterId: string): CharacterPreflightCheck {
  const profile = CHARACTER_INTRINSIC_BY_ID.get(characterId);
  if (!profile) {
    return { area: 'INTRINSIC_STATS', status: 'MISSING', details: ['No intrinsic/Minor-Forte profile exists.'], requiredFor: RAW_REQUIRED };
  }
  const pending = RELEASED_CHARACTER_INTRINSIC_PENDING.filter((row) => row.characterId === characterId);
  if (pending.length > 0) {
    return {
      area: 'INTRINSIC_STATS',
      status: 'PENDING',
      details: pending.map((row) => `${row.stat}: ${row.reason}`),
      requiredFor: RAW_REQUIRED,
    };
  }
  return {
    area: 'INTRINSIC_STATS',
    status: verificationStatusToPreflight(profile.verificationStatus),
    details: [`${profile.stats.length} intrinsic stat categories accounted for.`],
    requiredFor: RAW_REQUIRED,
  };
}

function mechanicsCheck(characterId: string): CharacterPreflightCheck {
  const profile = getCharacterMechanicsProfile(characterId);
  if (!profile) {
    return {
      area: 'CHARACTER_MECHANICS',
      status: 'MISSING',
      details: ['No character mechanics profile exists yet: actions/Forte/passives/Outro/resources/sequences still require ingestion.'],
      requiredFor: RAW_REQUIRED,
    };
  }
  const incomplete = profile.coverage.filter((row) => row.status !== 'VERIFIED');
  if (incomplete.length > 0) {
    return {
      area: 'CHARACTER_MECHANICS',
      status: 'PENDING',
      details: incomplete.map((row) => `${row.area}: ${row.status}${row.notes ? ` — ${row.notes}` : ''}`),
      requiredFor: RAW_REQUIRED,
    };
  }
  return {
    area: 'CHARACTER_MECHANICS',
    status: verificationStatusToPreflight(profile.verificationStatus),
    details: [`${profile.factIds.length} mechanic facts linked; all required mechanics areas are verified.`],
    requiredFor: RAW_REQUIRED,
  };
}

function profileCheck(
  area: CharacterPreflightArea,
  statuses: readonly VerificationStatus[],
  requiredFor: readonly CharacterPreflightTarget[],
  missingMessage: string,
): CharacterPreflightCheck {
  if (statuses.length === 0) return { area, status: 'MISSING', details: [missingMessage], requiredFor };
  if (statuses.some((status) => status === 'VERIFIED')) {
    return { area, status: 'PASS', details: [`${statuses.length} profile(s) exist; at least one is VERIFIED.`], requiredFor };
  }
  return { area, status: 'PENDING', details: [`${statuses.length} profile(s) exist but none is VERIFIED.`], requiredFor };
}

/**
 * Executable onboarding guide. It reads the current catalogs instead of relying
 * on a manually checked Markdown list, so resolved gaps disappear from the
 * report automatically and newly missing layers remain visible.
 */
export function getCharacterPreflight(
  characterId: string,
  target: CharacterPreflightTarget = 'DPS_MODEL',
): CharacterPreflightReport | null {
  const character = getCharacterGameData(characterId);
  if (!character) return null;

  const releaseStatus: CharacterPreflightCheck = character.releaseStatus === 'RELEASED'
    ? { area: 'RELEASE_STATUS', status: 'PASS', details: ['Character is released.'], requiredFor: RAW_REQUIRED }
    : {
        area: 'RELEASE_STATUS',
        status: 'PENDING',
        details: [`Release status is ${character.releaseStatus}; WIP/upcoming data must not route into production DPS.`],
        requiredFor: RAW_REQUIRED,
      };

  const weaponStatuses = PROFILE_CATALOGS.weaponRecommendations
    .filter((profile) => profile.characterId === characterId)
    .map((profile) => profile.verificationStatus);
  const echoStatuses = PROFILE_CATALOGS.echoLoadouts
    .filter((profile) => profile.characterId === characterId)
    .map((profile) => profile.verificationStatus);
  const statStatuses = PROFILE_CATALOGS.statTargets
    .filter((profile) => profile.characterId === characterId)
    .map((profile) => profile.verificationStatus);
  const teamStatuses = PROFILE_CATALOGS.teams
    .filter((profile) => profile.members.some((member) => member.characterId === characterId))
    .map((profile) => profile.verificationStatus);
  const rotationStatuses = PROFILE_CATALOGS.rotations
    .filter((profile) => profile.characterId === characterId)
    .map((profile) => profile.verificationStatus);
  const presetStatuses = PROFILE_CATALOGS.presets
    .filter((profile) => profile.characterId === characterId)
    .map((profile) => profile.verificationStatus);

  const checks: CharacterPreflightCheck[] = [
    releaseStatus,
    rawLevel90Check(characterId),
    intrinsicCheck(characterId),
    mechanicsCheck(characterId),
    profileCheck('WEAPON_PROFILE', weaponStatuses, BUILD_REQUIRED, 'No verified character↔weapon recommendation profile exists.'),
    profileCheck('ECHO_LOADOUT_PROFILE', echoStatuses, BUILD_REQUIRED, 'No verified Echo/Sonata loadout profile exists.'),
    profileCheck('STAT_TARGET_PROFILE', statStatuses, BUILD_REQUIRED, 'No verified target/gate profile exists.'),
    profileCheck('TEAM_PROFILE', teamStatuses, DPS_REQUIRED, 'No verified team profile currently includes this character.'),
    profileCheck('ROTATION_PROFILE', rotationStatuses, DPS_REQUIRED, 'No verified rotation profile exists for this character.'),
    profileCheck('BUILD_PRESET', presetStatuses, DPS_REQUIRED, 'No verified composition/build preset exists for this character.'),
  ];

  const blockers = checks.filter((check) => check.requiredFor.includes(target) && check.status !== 'PASS');
  return {
    characterId,
    characterName: character.name,
    target,
    checks,
    ready: blockers.length === 0,
    blockers,
  };
}
