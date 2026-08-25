import type {
  CharacterMechanicsCoverageArea,
  CharacterMechanicsProfile,
} from '../characterMechanicsDomain.ts';
import { CHARACTER_CATALOG } from './characters.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHARACTER_MECHANICS_PROFILES,
} from './characterMechanics.ts';

export const CHARACTER_MECHANICS_REQUIRED_AREAS: readonly CharacterMechanicsCoverageArea[] = [
  'ACTIONS',
  'FORTE_RULES',
  'INHERENT_PASSIVES',
  'OUTRO_EFFECT',
  'RESOURCE_RULES',
  'SEQUENCES',
] as const;

export interface CharacterMechanicsAuditIssue {
  characterId: string;
  issue: string;
}

export interface CharacterMechanicsCoverageAudit {
  releasedCount: number;
  profileCount: number;
  verifiedCharacterIds: readonly string[];
  partialCharacterIds: readonly string[];
  unstartedCharacterIds: readonly string[];
  structuralIssues: readonly CharacterMechanicsAuditIssue[];
}

function auditProfile(
  profile: CharacterMechanicsProfile,
  issues: CharacterMechanicsAuditIssue[],
): void {
  const areaNames = profile.coverage.map((entry) => entry.area);
  if (new Set(areaNames).size !== areaNames.length) {
    issues.push({ characterId: profile.characterId, issue: 'duplicate mechanics coverage area' });
  }

  for (const required of CHARACTER_MECHANICS_REQUIRED_AREAS) {
    if (!areaNames.includes(required)) {
      issues.push({ characterId: profile.characterId, issue: `missing mechanics coverage area ${required}` });
    }
  }
  for (const area of areaNames) {
    if (!CHARACTER_MECHANICS_REQUIRED_AREAS.includes(area)) {
      issues.push({ characterId: profile.characterId, issue: `unknown mechanics coverage area ${area}` });
    }
  }

  for (const factId of profile.factIds) {
    const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
    if (!fact) {
      issues.push({ characterId: profile.characterId, issue: `unknown mechanics fact ${factId}` });
      continue;
    }
    if (fact.characterId !== profile.characterId) {
      issues.push({ characterId: profile.characterId, issue: `mechanics fact ${factId} belongs to ${fact.characterId}` });
    }
  }

  const allVerified = profile.coverage.every((entry) => entry.status === 'VERIFIED');
  if (allVerified && profile.verificationStatus !== 'VERIFIED') {
    issues.push({ characterId: profile.characterId, issue: 'all mechanics areas are verified but profile is not VERIFIED' });
  }
  if (!allVerified && profile.verificationStatus === 'VERIFIED') {
    issues.push({ characterId: profile.characterId, issue: 'profile is VERIFIED while one or more mechanics areas are incomplete' });
  }
}

/**
 * Structural audit + progress report.
 *
 * Missing character profiles are intentionally reported as `unstarted` rather
 * than structural errors while the Pre-DPS foundation is being populated. A
 * character can never become DPS-ready through the preflight while it remains
 * in that set.
 */
export function auditCharacterMechanicsCoverage(
  profiles: readonly CharacterMechanicsProfile[] = CHARACTER_MECHANICS_PROFILES,
): CharacterMechanicsCoverageAudit {
  const released = CHARACTER_CATALOG.filter((character) => character.releaseStatus === 'RELEASED');
  const releasedIds = new Set(released.map((character) => character.id));
  const profileById = new Map<string, CharacterMechanicsProfile>();
  const structuralIssues: CharacterMechanicsAuditIssue[] = [];

  for (const profile of profiles) {
    if (profileById.has(profile.characterId)) {
      structuralIssues.push({ characterId: profile.characterId, issue: 'duplicate character mechanics profile' });
      continue;
    }
    profileById.set(profile.characterId, profile);
    if (!releasedIds.has(profile.characterId)) {
      structuralIssues.push({ characterId: profile.characterId, issue: 'mechanics profile exists for non-released/unknown character' });
    }
    auditProfile(profile, structuralIssues);
  }

  const verifiedCharacterIds: string[] = [];
  const partialCharacterIds: string[] = [];
  const unstartedCharacterIds: string[] = [];

  for (const character of released) {
    const profile = profileById.get(character.id);
    if (!profile) {
      unstartedCharacterIds.push(character.id);
      continue;
    }
    const allVerified = profile.coverage.every((entry) => entry.status === 'VERIFIED');
    if (allVerified && profile.verificationStatus === 'VERIFIED') verifiedCharacterIds.push(character.id);
    else partialCharacterIds.push(character.id);
  }

  return {
    releasedCount: released.length,
    profileCount: profiles.length,
    verifiedCharacterIds: verifiedCharacterIds.sort(),
    partialCharacterIds: partialCharacterIds.sort(),
    unstartedCharacterIds: unstartedCharacterIds.sort(),
    structuralIssues,
  };
}
