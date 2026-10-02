import { readFileSync } from 'node:fs';

import type { CharacterActionFact } from '../../src/characterMechanicsDomain.ts';
import { CHARACTER_CATALOG } from '../../src/data/characters.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHARACTER_MECHANICS_PROFILE_BY_ID,
} from '../../src/data/characterMechanics.ts';
import { auditCharacterMechanicsCoverage } from '../../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_OUTRO_EFFECT_SOURCE_BLOCKERS,
  type CharacterOutroEffectSourceBlocker,
} from '../../src/data/characterMechanics/rosterOutroCompletion.ts';

export type CharacterOutroEffectsCoverageStatus = 'VERIFIED' | 'PARTIAL' | 'BLOCKED';

export interface CharacterOutroEffectsCoverageEntry {
  characterId: string;
  status: CharacterOutroEffectsCoverageStatus;
  reasons: readonly string[];
}

export interface CharacterOutroEffectsCoverageAudit {
  releasedCount: number;
  sourceOutroSkillCount: number;
  verifiedCharacterIds: readonly string[];
  partialCharacterIds: readonly string[];
  blockedCharacterIds: readonly string[];
  blockers: readonly CharacterOutroEffectSourceBlocker[];
  entries: readonly CharacterOutroEffectsCoverageEntry[];
  issues: readonly string[];
}

interface SourceMove {
  id: number;
  type: number;
  name: string;
}

interface SourceCharacter {
  characterId: string;
  moves: readonly SourceMove[];
}

interface SourcePayload {
  characters: readonly SourceCharacter[];
}

const SOURCE_PATH = new URL('../../data/source/character-forte-ui.json', import.meta.url);
const sourcePayload = JSON.parse(readFileSync(SOURCE_PATH, 'utf8')) as SourcePayload;

function outroStructuralIssue(issue: string): boolean {
  return /OUTRO_EFFECT|OUTRO_SKILL|Outro Skill|outro/i.test(issue);
}

function hasExactDamageRepresentation(fact: CharacterActionFact): boolean {
  const representationCount = [
    fact.motionValueCurve !== undefined && fact.motionValueCurve !== null,
    fact.motionValueComponents !== undefined && fact.motionValueComponents !== null && fact.motionValueComponents.length > 0,
    fact.sourceFixedMotionValue !== undefined && fact.sourceFixedMotionValue !== null,
    fact.sourceFixedMotionValueComponents !== undefined && fact.sourceFixedMotionValueComponents !== null && fact.sourceFixedMotionValueComponents.length > 0,
    fact.sourceFixedFlatDamage !== undefined && fact.sourceFixedFlatDamage !== null,
  ].filter(Boolean).length;
  return representationCount === 1;
}

export function auditCharacterOutroEffectsCoverage(): CharacterOutroEffectsCoverageAudit {
  const releasedIds = CHARACTER_CATALOG
    .filter((character) => character.releaseStatus === 'RELEASED')
    .map((character) => character.id)
    .sort();
  const releasedSet = new Set(releasedIds);
  const sourceByCharacter = new Map(sourcePayload.characters.map((character) => [character.characterId, character]));
  const blockerByCharacter = new Map<string, CharacterOutroEffectSourceBlocker[]>();
  const mechanicsAudit = auditCharacterMechanicsCoverage();
  const issues: string[] = [];
  const entries: CharacterOutroEffectsCoverageEntry[] = [];
  const seenBlockerIds = new Set<string>();

  for (const blocker of CHARACTER_OUTRO_EFFECT_SOURCE_BLOCKERS) {
    if (seenBlockerIds.has(blocker.blockerId)) issues.push(`duplicate OUTRO_EFFECT blocker id ${blocker.blockerId}`);
    seenBlockerIds.add(blocker.blockerId);
    if (!releasedSet.has(blocker.characterId)) {
      issues.push(`OUTRO_EFFECT blocker ${blocker.blockerId} references non-released Character ${blocker.characterId}`);
    }
    const group = blockerByCharacter.get(blocker.characterId) ?? [];
    group.push(blocker);
    blockerByCharacter.set(blocker.characterId, group);

    if (blocker.factIds.length === 0) issues.push(`OUTRO_EFFECT blocker ${blocker.blockerId} has no canonical fact ids`);
    for (const factId of blocker.factIds) {
      const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
      if (!fact || fact.characterId !== blocker.characterId || fact.section !== 'OUTRO_SKILL' || (fact.kind !== 'PASSIVE' && fact.kind !== 'ACTION')) {
        issues.push(`OUTRO_EFFECT blocker ${blocker.blockerId} references missing/wrong Outro fact ${factId}`);
      } else if (fact.verificationStatus === 'VERIFIED') {
        issues.push(`OUTRO_EFFECT blocker ${blocker.blockerId} fact ${factId} must remain non-VERIFIED`);
      }
      const profile = CHARACTER_MECHANICS_PROFILE_BY_ID.get(blocker.characterId);
      if (!profile?.factIds.includes(factId)) {
        issues.push(`OUTRO_EFFECT blocker ${blocker.blockerId} fact ${factId} is not linked by its Character profile`);
      }
    }
  }

  for (const sourceCharacter of sourcePayload.characters) {
    if (!releasedSet.has(sourceCharacter.characterId)) {
      issues.push(`Skills/Forte source includes non-released Character ${sourceCharacter.characterId}`);
    }
  }

  let sourceOutroSkillCount = 0;
  for (const characterId of releasedIds) {
    const sourceCharacter = sourceByCharacter.get(characterId);
    const sourceMoves = sourceCharacter?.moves.filter((move) => move.type === 11) ?? [];
    sourceOutroSkillCount += sourceMoves.length;
    const blockers = blockerByCharacter.get(characterId) ?? [];
    const profile = CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId);
    const structuralIssues = mechanicsAudit.structuralIssues
      .filter((entry) => entry.characterId === characterId && outroStructuralIssue(entry.issue))
      .map((entry) => entry.issue);

    if (!sourceCharacter) {
      entries.push({ characterId, status: blockers.length ? 'BLOCKED' : 'PARTIAL', reasons: ['Character is missing from the pinned Skills/Forte source payload.', ...structuralIssues] });
      continue;
    }

    if (sourceMoves.length !== 1) {
      entries.push({
        characterId,
        status: blockers.length ? 'BLOCKED' : 'PARTIAL',
        reasons: [`Pinned Skills/Forte source must contain exactly one Outro Skill row; found ${sourceMoves.length}.`, ...structuralIssues],
      });
      continue;
    }

    if (blockers.length > 0) {
      if (profile?.coverage.find((entry) => entry.area === 'OUTRO_EFFECT')?.status === 'VERIFIED') {
        issues.push(`OUTRO_EFFECT blockers for ${characterId} conflict with VERIFIED coverage`);
      }
      entries.push({ characterId, status: 'BLOCKED', reasons: [...blockers.map((blocker) => blocker.reason), ...structuralIssues] });
      continue;
    }

    if (!profile) {
      entries.push({ characterId, status: 'PARTIAL', reasons: ['No canonical Character Mechanics profile links Outro facts.', ...structuralIssues] });
      continue;
    }

    const outroState = profile.coverage.find((entry) => entry.area === 'OUTRO_EFFECT');
    const facts = profile.factIds
      .map((factId) => CHARACTER_MECHANIC_FACT_BY_ID.get(factId))
      .filter((fact) => fact?.section === 'OUTRO_SKILL' && (fact.kind === 'PASSIVE' || fact.kind === 'ACTION'));
    const nonVerified = facts.filter((fact) => fact?.verificationStatus !== 'VERIFIED');
    const malformedActions = facts.filter((fact) => {
      if (fact?.kind !== 'ACTION') return false;
      return fact.actionRole !== 'DAMAGE'
        || fact.actionKind !== 'OUTRO'
        || fact.damageClass !== 'OUTRO'
        || fact.scalingStat === 'UNKNOWN'
        || fact.scalingStat === 'SHARED_SYSTEM'
        || !hasExactDamageRepresentation(fact);
    });
    const reasons = [
      ...(outroState?.status !== 'VERIFIED' ? [outroState?.notes ?? 'OUTRO_EFFECT coverage is not VERIFIED.'] : []),
      ...(facts.length === 0 ? ['VERIFIED OUTRO_EFFECT coverage has no linked Outro fact.'] : []),
      ...(nonVerified.length ? [`OUTRO_EFFECT links non-VERIFIED facts: ${nonVerified.map((fact) => fact?.factId).join(', ')}`] : []),
      ...(malformedActions.length ? [`OUTRO_EFFECT damage facts are missing canonical Outro damage semantics or an exact source representation: ${malformedActions.map((fact) => fact?.factId).join(', ')}`] : []),
      ...structuralIssues,
    ];

    if (reasons.length) issues.push(...reasons.map((reason) => `${characterId}: ${reason}`));
    entries.push({ characterId, status: reasons.length ? 'PARTIAL' : 'VERIFIED', reasons });
  }

  const verifiedCharacterIds = entries.filter((entry) => entry.status === 'VERIFIED').map((entry) => entry.characterId);
  const partialCharacterIds = entries.filter((entry) => entry.status === 'PARTIAL').map((entry) => entry.characterId);
  const blockedCharacterIds = entries.filter((entry) => entry.status === 'BLOCKED').map((entry) => entry.characterId);

  return {
    releasedCount: releasedIds.length,
    sourceOutroSkillCount,
    verifiedCharacterIds,
    partialCharacterIds,
    blockedCharacterIds,
    blockers: [...CHARACTER_OUTRO_EFFECT_SOURCE_BLOCKERS].sort((left, right) => left.blockerId.localeCompare(right.blockerId)),
    entries,
    issues,
  };
}

export function renderCharacterOutroEffectsCoverageReport(
  audit: CharacterOutroEffectsCoverageAudit = auditCharacterOutroEffectsCoverage(),
): string {
  const line = (label: string, value: string | number) => `- **${label}:** ${value}`;
  const verified = audit.verifiedCharacterIds.join(', ') || 'none';
  const partial = audit.partialCharacterIds.join(', ') || 'none';
  const blockers = audit.blockers.length
    ? audit.blockers
      .map((blocker) => `- \`${blocker.blockerId}\` — \`${blocker.characterId}\`: ${blocker.reason} Source moves ${blocker.sourceMoveIds.join(', ')}; canonical facts ${blocker.factIds.join(', ')}.`)
      .join('\n')
    : '- none';
  const issues = audit.issues.length ? audit.issues.map((issue) => `- ${issue}`).join('\n') : '- none';

  return `# Character Mechanics OUTRO_EFFECT Coverage

This report is deterministic output from the pinned Skills/Forte source payload plus the canonical Character Mechanics registry. It reports **OUTRO_EFFECT only**. A RELEASED Character must have exactly one pinned source Outro row and VERIFIED canonical Outro evidence. Source-declared Outro damage remains an ACTION with its exact source representation; non-damage transfer/buff/heal logic remains PASSIVE data. Runtime application, uptime and event scheduling are separate concerns.

## Roster-wide status

${line('RELEASED Characters', audit.releasedCount)}
${line('Source Outro Skill rows', audit.sourceOutroSkillCount)}
${line('OUTRO_EFFECT VERIFIED Characters', audit.verifiedCharacterIds.length)}
${line('OUTRO_EFFECT PARTIAL Characters', audit.partialCharacterIds.length)}
${line('OUTRO_EFFECT BLOCKED Characters', audit.blockedCharacterIds.length)}

### VERIFIED

${verified}

### PARTIAL

${partial}

### BLOCKED

${blockers}

## Audit issues

${issues}

## Scope boundary

This report does not change ACTIONS, FORTE_RULES or INHERENT_PASSIVES coverage and does not promote full Character Mechanics profiles. Buling, Danjin and Xiangli Yao remain PARTIALLY_VERIFIED overall because their existing independent ACTIONS/FORTE blockers remain fail-closed and RESOURCE_RULES plus SEQUENCES remain PENDING. No profile/recommendation, Team, DPS, rotation, execution or UI behavior is added by this source-coverage slice.
`;
}
