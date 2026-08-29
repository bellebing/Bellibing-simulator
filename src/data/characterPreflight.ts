import type { VerificationStatus } from '../contentRegistry.ts';
import { CHARACTER_INTRINSIC_BY_ID, RELEASED_CHARACTER_INTRINSIC_PENDING } from './characterIntrinsicStats.ts';
import { getCharacterGameData } from './characters.ts';
import { getCharacterMechanicsProfile } from './characterMechanics.ts';
import {
  auditCharacterMechanicsCoverage,
  type CharacterMechanicsCoverageAudit,
} from './characterMechanicsAudit.ts';
import { RELEASED_CHARACTER_RAW_PENDING } from './characterRawAudit.ts';
import { PROFILE_CATALOGS } from './profileCatalogs.ts';
import { auditRotationMechanicDependencies } from './rotationMechanicsAudit.ts';

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
  | 'COMBAT_MODEL'
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
  return status === 'VERIFIED' ? 'PASS' : 'PENDING';
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

export function getCharacterMechanicsPreflightCheck(
  characterId: string,
  audit: CharacterMechanicsCoverageAudit = auditCharacterMechanicsCoverage(),
): CharacterPreflightCheck {
  const profile = getCharacterMechanicsProfile(characterId);
  if (!profile) {
    return {
      area: 'CHARACTER_MECHANICS',
      status: 'MISSING',
      details: ['No character mechanics profile exists yet: actions/Forte/passives/Outro/resources/sequences still require ingestion.'],
      requiredFor: RAW_REQUIRED,
    };
  }

  const structuralIssues = audit.structuralIssues.filter((issue) => issue.characterId === characterId);
  if (structuralIssues.length > 0) {
    return {
      area: 'CHARACTER_MECHANICS',
      status: 'PENDING',
      details: structuralIssues.map((issue) => `Structural audit: ${issue.issue}`),
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
    details: [`${profile.factIds.length} mechanic facts linked; all required raw mechanics areas are verified and structurally clean.`],
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

function rotationProfileCheck(characterId: string): CharacterPreflightCheck {
  const rotations = PROFILE_CATALOGS.rotations.filter((profile) => profile.characterId === characterId);
  if (rotations.length === 0) {
    return {
      area: 'ROTATION_PROFILE',
      status: 'MISSING',
      details: ['No verified rotation profile exists for this character.'],
      requiredFor: DPS_REQUIRED,
    };
  }

  const executable = rotations.filter(
    (profile) => profile.verificationStatus === 'VERIFIED' && profile.executionStatus === 'ENGINE_MODELED',
  );
  if (executable.length > 0) {
    return {
      area: 'ROTATION_PROFILE',
      status: 'PASS',
      details: executable.map((profile) => `${profile.id}: VERIFIED ENGINE_MODELED rotation.`),
      requiredFor: DPS_REQUIRED,
    };
  }

  const sourceOnly = rotations.filter(
    (profile) => profile.verificationStatus === 'VERIFIED' && profile.executionStatus === 'SOURCE_SEQUENCE_ONLY',
  );
  if (sourceOnly.length > 0) {
    return {
      area: 'ROTATION_PROFILE',
      status: 'PENDING',
      details: sourceOnly.map((profile) => `${profile.id}: source-reviewed sequence exists but has no executable engine model.`),
      requiredFor: DPS_REQUIRED,
    };
  }

  return {
    area: 'ROTATION_PROFILE',
    status: 'PENDING',
    details: [`${rotations.length} rotation profile(s) exist but none is VERIFIED and ENGINE_MODELED.`],
    requiredFor: DPS_REQUIRED,
  };
}

function combatModelCheck(characterId: string): CharacterPreflightCheck {
  const rotations = PROFILE_CATALOGS.rotations.filter(
    (profile) => profile.characterId === characterId
      && profile.verificationStatus === 'VERIFIED'
      && profile.executionStatus === 'ENGINE_MODELED',
  );
  if (rotations.length === 0) {
    const sourceOnly = PROFILE_CATALOGS.rotations.some(
      (profile) => profile.characterId === characterId
        && profile.verificationStatus === 'VERIFIED'
        && profile.executionStatus === 'SOURCE_SEQUENCE_ONLY',
    );
    return {
      area: 'COMBAT_MODEL',
      status: sourceOnly ? 'PENDING' : 'MISSING',
      details: [sourceOnly
        ? 'A VERIFIED source rotation exists, but no ENGINE_MODELED rotation/combat profile exists yet.'
        : 'No VERIFIED executable rotation/combat profile exists to audit against mechanic facts.'],
      requiredFor: DPS_REQUIRED,
    };
  }

  const audits = rotations.map((rotation) => auditRotationMechanicDependencies(rotation));
  const clean = audits.filter((audit) => audit.issues.length === 0);
  if (clean.length > 0) {
    return {
      area: 'COMBAT_MODEL',
      status: 'PASS',
      details: clean.map((audit) => `${audit.rotationId}: ${audit.modeledFactCount} modeled + ${audit.assumedFactCount} verified-assumed mechanic dependencies are coherent.`),
      requiredFor: DPS_REQUIRED,
    };
  }

  return {
    area: 'COMBAT_MODEL',
    status: 'PENDING',
    details: audits.flatMap((audit) => audit.issues.map((issue) => `${audit.rotationId} / ${issue.factId}: ${issue.issue}`)),
    requiredFor: DPS_REQUIRED,
  };
}

/**
 * Executable onboarding guide. It reads the current catalogs instead of relying
 * on a manually checked Markdown list, so resolved gaps disappear automatically.
 * Raw fact completeness and combat-model dependency coherence are separate gates.
 * Character Mechanics PASS also requires a clean structural audit so malformed
 * VERIFIED metadata cannot bypass the source-completeness contract at runtime.
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

  const weaponStatuses = PROFILE_CATALOGS.weaponRecommendations.filter((profile) => profile.characterId === characterId).map((profile) => profile.verificationStatus);
  const echoStatuses = PROFILE_CATALOGS.echoLoadouts.filter((profile) => profile.characterId === characterId).map((profile) => profile.verificationStatus);
  const statStatuses = PROFILE_CATALOGS.statTargets.filter((profile) => profile.characterId === characterId).map((profile) => profile.verificationStatus);
  const teamStatuses = PROFILE_CATALOGS.teams.filter((profile) => profile.members.some((member) => member.characterId === characterId)).map((profile) => profile.verificationStatus);
  const presetStatuses = PROFILE_CATALOGS.presets.filter((profile) => profile.characterId === characterId).map((profile) => profile.verificationStatus);

  const checks: CharacterPreflightCheck[] = [
    releaseStatus,
    rawLevel90Check(characterId),
    intrinsicCheck(characterId),
    getCharacterMechanicsPreflightCheck(characterId),
    profileCheck('WEAPON_PROFILE', weaponStatuses, BUILD_REQUIRED, 'No verified character↔weapon recommendation profile exists.'),
    profileCheck('ECHO_LOADOUT_PROFILE', echoStatuses, BUILD_REQUIRED, 'No verified Echo/Sonata loadout profile exists.'),
    profileCheck('STAT_TARGET_PROFILE', statStatuses, BUILD_REQUIRED, 'No verified target/gate profile exists.'),
    profileCheck('TEAM_PROFILE', teamStatuses, DPS_REQUIRED, 'No verified team profile currently includes this character.'),
    rotationProfileCheck(characterId),
    combatModelCheck(characterId),
    profileCheck('BUILD_PRESET', presetStatuses, DPS_REQUIRED, 'No verified composition/build preset exists for this character.'),
  ];

  const blockers = checks.filter((check) => check.requiredFor.includes(target) && check.status !== 'PASS');
  return { characterId, characterName: character.name, target, checks, ready: blockers.length === 0, blockers };
}
