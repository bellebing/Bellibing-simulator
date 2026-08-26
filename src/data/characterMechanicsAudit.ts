import type {
  CharacterMechanicFact,
  CharacterMechanicsCoverageArea,
  CharacterMechanicsProfile,
  CharacterMotionValueCurve,
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

function supportsArea(
  area: CharacterMechanicsCoverageArea,
  fact: CharacterMechanicFact,
): boolean {
  switch (area) {
    case 'ACTIONS':
      return fact.kind === 'ACTION';
    case 'FORTE_RULES':
      return fact.section === 'FORTE_CIRCUIT' && fact.kind !== 'SEQUENCE';
    case 'INHERENT_PASSIVES':
      return fact.kind === 'PASSIVE' && fact.section === 'INHERENT_SKILL';
    case 'OUTRO_EFFECT':
      return fact.section === 'OUTRO_SKILL' && (fact.kind === 'PASSIVE' || fact.kind === 'ACTION');
    case 'RESOURCE_RULES':
      return fact.kind === 'RESOURCE';
    case 'SEQUENCES':
      return fact.kind === 'SEQUENCE';
  }
}

function validCurve(curve: CharacterMotionValueCurve | readonly number[]): boolean {
  return curve.length === 10 && curve.every((value) => Number.isFinite(value) && value >= 0);
}

function auditVerifiedActionCurves(
  profile: CharacterMechanicsProfile,
  facts: readonly CharacterMechanicFact[],
  issues: CharacterMechanicsAuditIssue[],
): void {
  const actionsState = profile.coverage.find((entry) => entry.area === 'ACTIONS');
  if (actionsState?.status !== 'VERIFIED') return;

  for (const fact of facts) {
    if (fact.kind !== 'ACTION') continue;

    const curve = fact.motionValueCurve ?? null;
    const components = fact.motionValueComponents ?? null;
    const hasCurve = curve !== null;
    const hasComponents = components !== null && components.length > 0;
    const hasDamageMotionData = fact.motionValue !== null || hasCurve || hasComponents;

    if (fact.damageClass === null) {
      if (hasDamageMotionData) {
        issues.push({
          characterId: profile.characterId,
          issue: `verified ACTIONS fact ${fact.factId} has damage motion-value data while damageClass is null`,
        });
      }
      continue;
    }

    if (fact.scalingStat === 'UNKNOWN') {
      issues.push({
        characterId: profile.characterId,
        issue: `verified ACTIONS fact ${fact.factId} has UNKNOWN damage scaling`,
      });
    }

    if (fact.motionValueContext === null || fact.motionValueContext.trim().length === 0) {
      issues.push({
        characterId: profile.characterId,
        issue: `verified ACTIONS fact ${fact.factId} is missing motion-value level/source context`,
      });
    }

    if ((hasCurve || hasComponents) && fact.motionValue !== null) {
      issues.push({
        characterId: profile.characterId,
        issue: `verified ACTIONS fact ${fact.factId} mixes selected-level motionValue with an Lv1-Lv10 source representation`,
      });
    }

    if (hasCurve && hasComponents) {
      issues.push({
        characterId: profile.characterId,
        issue: `verified ACTIONS fact ${fact.factId} mixes single-curve and component-curve representations`,
      });
      continue;
    }

    if (!hasCurve && !hasComponents) {
      issues.push({
        characterId: profile.characterId,
        issue: `verified ACTIONS fact ${fact.factId} is missing an exact Lv1-Lv10 motion-value representation`,
      });
      continue;
    }

    if (hasCurve) {
      if (!validCurve(curve)) {
        issues.push({
          characterId: profile.characterId,
          issue: `verified ACTIONS fact ${fact.factId} has an invalid Lv1-Lv10 motion-value curve`,
        });
      }
      if (!Number.isInteger(fact.hitCount) || (fact.hitCount ?? 0) <= 0) {
        issues.push({
          characterId: profile.characterId,
          issue: `verified ACTIONS fact ${fact.factId} has an invalid single-curve hitCount`,
        });
      }
    }

    if (hasComponents) {
      if (fact.hitCount !== null) {
        issues.push({
          characterId: profile.characterId,
          issue: `verified ACTIONS fact ${fact.factId} uses component curves and must not also define action-level hitCount`,
        });
      }
      for (const [index, component] of components.entries()) {
        if (!Number.isInteger(component.hitCount) || component.hitCount <= 0 || !validCurve(component.curve)) {
          issues.push({
            characterId: profile.characterId,
            issue: `verified ACTIONS fact ${fact.factId} has an invalid Lv1-Lv10 motion-value component ${index + 1}`,
          });
        }
      }
    }
  }
}

function auditVerifiedAreaEvidence(
  profile: CharacterMechanicsProfile,
  facts: readonly CharacterMechanicFact[],
  issues: CharacterMechanicsAuditIssue[],
): void {
  for (const areaState of profile.coverage) {
    if (areaState.status !== 'VERIFIED') continue;

    const supportingFacts = facts.filter((fact) => supportsArea(areaState.area, fact));
    if (supportingFacts.length === 0) {
      issues.push({
        characterId: profile.characterId,
        issue: `verified mechanics area ${areaState.area} has no supporting fact`,
      });
      continue;
    }

    const unverifiedFacts = supportingFacts.filter((fact) => fact.verificationStatus !== 'VERIFIED');
    if (unverifiedFacts.length > 0) {
      issues.push({
        characterId: profile.characterId,
        issue: `verified mechanics area ${areaState.area} includes non-VERIFIED facts: ${unverifiedFacts.map((fact) => fact.factId).join(', ')}`,
      });
    }

    if (areaState.area === 'SEQUENCES') {
      const sequences = supportingFacts
        .filter((fact): fact is Extract<CharacterMechanicFact, { kind: 'SEQUENCE' }> => fact.kind === 'SEQUENCE')
        .map((fact) => fact.sequence)
        .sort((a, b) => a - b);
      if (
        sequences.length !== 6
        || sequences.some((sequence, index) => sequence !== index + 1)
      ) {
        issues.push({
          characterId: profile.characterId,
          issue: `verified mechanics area SEQUENCES must include exact S1-S6 facts; found ${sequences.join(', ') || 'none'}`,
        });
      }
    }
  }

  auditVerifiedActionCurves(profile, facts, issues);
}

function auditProfile(
  profile: CharacterMechanicsProfile,
  issues: CharacterMechanicsAuditIssue[],
  factById: ReadonlyMap<string, CharacterMechanicFact>,
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

  if (new Set(profile.factIds).size !== profile.factIds.length) {
    issues.push({ characterId: profile.characterId, issue: 'duplicate mechanics fact link' });
  }

  const linkedFacts: CharacterMechanicFact[] = [];
  for (const factId of profile.factIds) {
    const fact = factById.get(factId);
    if (!fact) {
      issues.push({ characterId: profile.characterId, issue: `unknown mechanics fact ${factId}` });
      continue;
    }
    if (fact.characterId !== profile.characterId) {
      issues.push({ characterId: profile.characterId, issue: `mechanics fact ${factId} belongs to ${fact.characterId}` });
      continue;
    }
    linkedFacts.push(fact);
  }

  const linkedIds = new Set(profile.factIds);
  for (const fact of factById.values()) {
    if (fact.characterId === profile.characterId && !linkedIds.has(fact.factId)) {
      issues.push({
        characterId: profile.characterId,
        issue: `mechanics fact ${fact.factId} is not linked by the character mechanics profile`,
      });
    }
  }

  if (profile.verificationStatus === 'VERIFIED') {
    const nonVerifiedLinkedFacts = linkedFacts.filter((fact) => fact.verificationStatus !== 'VERIFIED');
    if (nonVerifiedLinkedFacts.length > 0) {
      issues.push({
        characterId: profile.characterId,
        issue: `VERIFIED profile links non-VERIFIED facts: ${nonVerifiedLinkedFacts.map((fact) => fact.factId).join(', ')}`,
      });
    }
  }

  auditVerifiedAreaEvidence(profile, linkedFacts, issues);

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
 *
 * A coverage area may only be marked VERIFIED when the profile links concrete,
 * source-VERIFIED facts that support that area. VERIFIED profiles may not hide
 * non-VERIFIED linked utility facts outside those coverage buckets. VERIFIED
 * ACTIONS additionally require a finite non-negative Lv1-Lv10 source
 * representation for every damaging action: either one coefficient curve plus
 * a positive integer action-level `hitCount`, or explicit mixed coefficient
 * components with their own positive integer hit counts and no action-level
 * `hitCount`. Damage motion-value data may not be hidden behind a null
 * `damageClass`; source-complete damaging actions also require explicit scaling
 * and source-level context, and may not mix a selected-level scalar with their
 * Lv1-Lv10 representation. This prevents status metadata, omitted multiplicity,
 * selected-level leakage or ambiguous double-counting from making a partially
 * ingested character look source-complete.
 */
export function auditCharacterMechanicsCoverage(
  profiles: readonly CharacterMechanicsProfile[] = CHARACTER_MECHANICS_PROFILES,
  factById: ReadonlyMap<string, CharacterMechanicFact> = CHARACTER_MECHANIC_FACT_BY_ID,
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
    auditProfile(profile, structuralIssues, factById);
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
    const structurallyClean = !structuralIssues.some((issue) => issue.characterId === character.id);
    if (allVerified && profile.verificationStatus === 'VERIFIED' && structurallyClean) {
      verifiedCharacterIds.push(character.id);
    } else {
      partialCharacterIds.push(character.id);
    }
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
