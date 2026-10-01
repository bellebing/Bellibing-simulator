import { readFileSync } from 'node:fs';

import { CHARACTER_CATALOG } from '../../src/data/characters.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHARACTER_MECHANICS_PROFILE_BY_ID,
} from '../../src/data/characterMechanics.ts';
import { auditCharacterMechanicsCoverage } from '../../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_INHERENT_PASSIVE_SOURCE_BLOCKERS,
  type CharacterInherentPassiveSourceBlocker,
} from '../../src/data/characterMechanics/rosterInherentPassiveCompletion.ts';

export type CharacterInherentPassivesCoverageStatus = 'VERIFIED' | 'PARTIAL' | 'BLOCKED';

export interface CharacterInherentPassivesCoverageEntry {
  characterId: string;
  status: CharacterInherentPassivesCoverageStatus;
  reasons: readonly string[];
}

export interface CharacterInherentPassivesCoverageAudit {
  releasedCount: number;
  sourceInherentSkillCount: number;
  verifiedCharacterIds: readonly string[];
  partialCharacterIds: readonly string[];
  blockedCharacterIds: readonly string[];
  blockers: readonly CharacterInherentPassiveSourceBlocker[];
  entries: readonly CharacterInherentPassivesCoverageEntry[];
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

function canonicalInherentName(name: string): string {
  return name.replace(/^Inherent Skill\s*[—-]\s*/, '');
}

function inherentStructuralIssue(issue: string): boolean {
  return /INHERENT_PASSIVES|INHERENT_SKILL|Inherent Skill|inherent/i.test(issue);
}

export function auditCharacterInherentPassivesCoverage(): CharacterInherentPassivesCoverageAudit {
  const releasedIds = CHARACTER_CATALOG
    .filter((character) => character.releaseStatus === 'RELEASED')
    .map((character) => character.id)
    .sort();
  const releasedSet = new Set(releasedIds);
  const sourceByCharacter = new Map(sourcePayload.characters.map((character) => [character.characterId, character]));
  const blockerByCharacter = new Map<string, CharacterInherentPassiveSourceBlocker[]>();
  const issues: string[] = [];
  const entries: CharacterInherentPassivesCoverageEntry[] = [];
  const seenBlockerIds = new Set<string>();
  const mechanicsAudit = auditCharacterMechanicsCoverage();

  for (const blocker of CHARACTER_INHERENT_PASSIVE_SOURCE_BLOCKERS) {
    if (seenBlockerIds.has(blocker.blockerId)) issues.push(`duplicate INHERENT_PASSIVES blocker id ${blocker.blockerId}`);
    seenBlockerIds.add(blocker.blockerId);
    if (!releasedSet.has(blocker.characterId)) {
      issues.push(`INHERENT_PASSIVES blocker ${blocker.blockerId} references non-released Character ${blocker.characterId}`);
    }
    const group = blockerByCharacter.get(blocker.characterId) ?? [];
    group.push(blocker);
    blockerByCharacter.set(blocker.characterId, group);

    if (blocker.factIds.length === 0) issues.push(`INHERENT_PASSIVES blocker ${blocker.blockerId} has no canonical fact ids`);
    for (const factId of blocker.factIds) {
      const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
      if (!fact || fact.characterId !== blocker.characterId || fact.kind !== 'PASSIVE' || fact.section !== 'INHERENT_SKILL') {
        issues.push(`INHERENT_PASSIVES blocker ${blocker.blockerId} references missing/wrong Inherent Skill fact ${factId}`);
      } else if (fact.verificationStatus === 'VERIFIED') {
        issues.push(`INHERENT_PASSIVES blocker ${blocker.blockerId} fact ${factId} must remain non-VERIFIED`);
      }
      const profile = CHARACTER_MECHANICS_PROFILE_BY_ID.get(blocker.characterId);
      if (!profile?.factIds.includes(factId)) {
        issues.push(`INHERENT_PASSIVES blocker ${blocker.blockerId} fact ${factId} is not linked by its Character profile`);
      }
    }
  }

  for (const sourceCharacter of sourcePayload.characters) {
    if (!releasedSet.has(sourceCharacter.characterId)) {
      issues.push(`Skills/Forte source includes non-released Character ${sourceCharacter.characterId}`);
    }
  }

  let sourceInherentSkillCount = 0;
  for (const characterId of releasedIds) {
    const sourceCharacter = sourceByCharacter.get(characterId);
    const sourceMoves = sourceCharacter?.moves.filter((move) => move.type === 4) ?? [];
    sourceInherentSkillCount += sourceMoves.length;
    const blockers = blockerByCharacter.get(characterId) ?? [];
    const profile = CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId);
    const structuralIssues = mechanicsAudit.structuralIssues
      .filter((entry) => entry.characterId === characterId && inherentStructuralIssue(entry.issue))
      .map((entry) => entry.issue);

    if (!sourceCharacter) {
      entries.push({ characterId, status: blockers.length ? 'BLOCKED' : 'PARTIAL', reasons: ['Character is missing from the pinned Skills/Forte source payload.', ...structuralIssues] });
      continue;
    }

    if (sourceMoves.length !== 2) {
      entries.push({
        characterId,
        status: blockers.length ? 'BLOCKED' : 'PARTIAL',
        reasons: [`Pinned Skills/Forte source must contain exactly two Inherent Skill rows; found ${sourceMoves.length}.`, ...structuralIssues],
      });
      continue;
    }

    if (blockers.length > 0) {
      if (profile?.coverage.find((entry) => entry.area === 'INHERENT_PASSIVES')?.status === 'VERIFIED') {
        issues.push(`INHERENT_PASSIVES blockers for ${characterId} conflict with VERIFIED coverage`);
      }
      entries.push({ characterId, status: 'BLOCKED', reasons: [...blockers.map((blocker) => blocker.reason), ...structuralIssues] });
      continue;
    }

    if (!profile) {
      entries.push({ characterId, status: 'PARTIAL', reasons: ['No canonical Character Mechanics profile links Inherent Skill facts.', ...structuralIssues] });
      continue;
    }

    const inherentState = profile.coverage.find((entry) => entry.area === 'INHERENT_PASSIVES');
    const facts = profile.factIds
      .map((factId) => CHARACTER_MECHANIC_FACT_BY_ID.get(factId))
      .filter((fact) => fact?.kind === 'PASSIVE' && fact.section === 'INHERENT_SKILL');
    const canonicalNames = facts.map((fact) => canonicalInherentName(fact?.name ?? '')).sort();
    const sourceNames = sourceMoves.map((move) => move.name).sort();
    const nonVerified = facts.filter((fact) => fact?.verificationStatus !== 'VERIFIED');
    const reasons = [
      ...(inherentState?.status !== 'VERIFIED' ? [inherentState?.notes ?? 'INHERENT_PASSIVES coverage is not VERIFIED.'] : []),
      ...(facts.length !== 2 ? [`Canonical profile must link exactly two Inherent Skill facts; found ${facts.length}.`] : []),
      ...(nonVerified.length ? [`INHERENT_PASSIVES links non-VERIFIED facts: ${nonVerified.map((fact) => fact?.factId).join(', ')}`] : []),
      ...(JSON.stringify(canonicalNames) !== JSON.stringify(sourceNames)
        ? [`Canonical Inherent Skill names do not match pinned source rows. Source: ${sourceNames.join(' | ')}; canonical: ${canonicalNames.join(' | ') || 'none'}.`]
        : []),
      ...structuralIssues,
    ];

    entries.push({ characterId, status: reasons.length ? 'PARTIAL' : 'VERIFIED', reasons });
  }

  const verifiedCharacterIds = entries.filter((entry) => entry.status === 'VERIFIED').map((entry) => entry.characterId);
  const partialCharacterIds = entries.filter((entry) => entry.status === 'PARTIAL').map((entry) => entry.characterId);
  const blockedCharacterIds = entries.filter((entry) => entry.status === 'BLOCKED').map((entry) => entry.characterId);

  return {
    releasedCount: releasedIds.length,
    sourceInherentSkillCount,
    verifiedCharacterIds,
    partialCharacterIds,
    blockedCharacterIds,
    blockers: [...CHARACTER_INHERENT_PASSIVE_SOURCE_BLOCKERS].sort((left, right) => left.blockerId.localeCompare(right.blockerId)),
    entries,
    issues,
  };
}

export function renderCharacterInherentPassivesCoverageReport(
  audit: CharacterInherentPassivesCoverageAudit = auditCharacterInherentPassivesCoverage(),
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

  return `# Character Mechanics INHERENT_PASSIVES Coverage

This report is deterministic output from the pinned Skills/Forte source payload plus the canonical Character Mechanics registry. It reports **INHERENT_PASSIVES only** and requires each RELEASED Character to link the exact two source Inherent Skill names as source-VERIFIED canonical passive facts. Runtime modeling remains a separate concern and is not inferred from source verification.

## Roster-wide status

${line('RELEASED Characters', audit.releasedCount)}
${line('Source Inherent Skill rows', audit.sourceInherentSkillCount)}
${line('INHERENT_PASSIVES VERIFIED Characters', audit.verifiedCharacterIds.length)}
${line('INHERENT_PASSIVES PARTIAL Characters', audit.partialCharacterIds.length)}
${line('INHERENT_PASSIVES BLOCKED Characters', audit.blockedCharacterIds.length)}

### VERIFIED

${verified}

### PARTIAL

${partial}

### BLOCKED

${blockers}

## Audit issues

${issues}

## Scope boundary

This report does not change ACTIONS or FORTE_RULES behavior and does not promote full Character Mechanics profiles. Outro effects, generic Resource rules, Sequence mechanics, profiles/recommendations, Team, DPS rotations and UI remain outside this slice. Existing ACTIONS/FORTE source blockers remain independently fail-closed.
`;
}
