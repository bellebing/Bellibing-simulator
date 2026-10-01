import { CHARACTER_CATALOG } from './characters.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHARACTER_MECHANICS_PROFILE_BY_ID,
} from './characterMechanics.ts';
import {
  CHARACTER_FORTE_RULE_SOURCE_BLOCKERS,
  type CharacterForteRuleSourceBlocker,
} from './characterMechanics/rosterForteCompletion.ts';
import { auditCharacterMechanicsCoverage } from './characterMechanicsAudit.ts';

export type CharacterForteRulesCoverageStatus = 'VERIFIED' | 'PARTIAL' | 'BLOCKED';

export interface CharacterForteRulesCoverageEntry {
  characterId: string;
  status: CharacterForteRulesCoverageStatus;
  reasons: readonly string[];
}

export interface CharacterForteRulesCoverageAudit {
  releasedCount: number;
  verifiedCharacterIds: readonly string[];
  partialCharacterIds: readonly string[];
  blockedCharacterIds: readonly string[];
  blockers: readonly CharacterForteRuleSourceBlocker[];
  entries: readonly CharacterForteRulesCoverageEntry[];
  issues: readonly string[];
}

const forteStructuralIssue = (issue: string) =>
  /FORTE_RULES|FORTE_CIRCUIT|Forte Circuit|forte/i.test(issue);

export function auditCharacterForteRulesCoverage(): CharacterForteRulesCoverageAudit {
  const releasedIds = CHARACTER_CATALOG
    .filter((character) => character.releaseStatus === 'RELEASED')
    .map((character) => character.id)
    .sort();
  const mechanicsAudit = auditCharacterMechanicsCoverage();
  const blockerByCharacter = new Map<string, CharacterForteRuleSourceBlocker[]>();

  for (const blocker of CHARACTER_FORTE_RULE_SOURCE_BLOCKERS) {
    const group = blockerByCharacter.get(blocker.characterId) ?? [];
    group.push(blocker);
    blockerByCharacter.set(blocker.characterId, group);
  }

  const issues: string[] = [];
  const entries: CharacterForteRulesCoverageEntry[] = [];
  const seenBlockerIds = new Set<string>();

  for (const blocker of CHARACTER_FORTE_RULE_SOURCE_BLOCKERS) {
    if (seenBlockerIds.has(blocker.blockerId)) {
      issues.push(`duplicate FORTE_RULES blocker id ${blocker.blockerId}`);
    }
    seenBlockerIds.add(blocker.blockerId);

    if (!releasedIds.includes(blocker.characterId)) {
      issues.push(`FORTE_RULES blocker ${blocker.blockerId} references non-released Character ${blocker.characterId}`);
    }
    if (blocker.factIds.length === 0) {
      issues.push(`FORTE_RULES blocker ${blocker.blockerId} has no canonical fact ids`);
    }
    for (const factId of blocker.factIds) {
      const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
      if (!fact || fact.characterId !== blocker.characterId || fact.section !== 'FORTE_CIRCUIT' || fact.kind === 'SEQUENCE') {
        issues.push(`FORTE_RULES blocker ${blocker.blockerId} references missing/wrong Forte fact ${factId}`);
      } else if (fact.verificationStatus === 'VERIFIED') {
        issues.push(`FORTE_RULES blocker ${blocker.blockerId} fact ${factId} must remain non-VERIFIED`);
      }
      const profile = CHARACTER_MECHANICS_PROFILE_BY_ID.get(blocker.characterId);
      if (!profile?.factIds.includes(factId)) {
        issues.push(`FORTE_RULES blocker ${blocker.blockerId} fact ${factId} is not linked by its Character profile`);
      }
    }
  }

  for (const characterId of releasedIds) {
    const profile = CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId);
    const blockers = blockerByCharacter.get(characterId) ?? [];
    if (!profile) {
      entries.push({
        characterId,
        status: blockers.length ? 'BLOCKED' : 'PARTIAL',
        reasons: blockers.length ? blockers.map((blocker) => blocker.reason) : ['No canonical Character Mechanics profile links FORTE_RULES facts.'],
      });
      continue;
    }

    const forteState = profile.coverage.find((entry) => entry.area === 'FORTE_RULES');
    const forteFacts = profile.factIds
      .map((factId) => CHARACTER_MECHANIC_FACT_BY_ID.get(factId))
      .filter((fact) => fact?.section === 'FORTE_CIRCUIT' && fact.kind !== 'SEQUENCE');
    const structuralIssues = mechanicsAudit.structuralIssues
      .filter((entry) => entry.characterId === characterId && forteStructuralIssue(entry.issue))
      .map((entry) => entry.issue);

    if (blockers.length > 0) {
      if (forteState?.status === 'VERIFIED') {
        issues.push(`FORTE_RULES blockers for ${characterId} conflict with VERIFIED coverage`);
      }
      entries.push({
        characterId,
        status: 'BLOCKED',
        reasons: [...blockers.map((blocker) => blocker.reason), ...structuralIssues],
      });
      continue;
    }

    if (forteState?.status !== 'VERIFIED') {
      entries.push({
        characterId,
        status: 'PARTIAL',
        reasons: [forteState?.notes ?? 'FORTE_RULES coverage is not VERIFIED.', ...structuralIssues],
      });
      continue;
    }

    const nonVerified = forteFacts.filter((fact) => fact?.verificationStatus !== 'VERIFIED');
    const reasons = [
      ...(forteFacts.length === 0 ? ['VERIFIED FORTE_RULES coverage has no linked Forte facts.'] : []),
      ...(nonVerified.length ? [`VERIFIED FORTE_RULES links non-VERIFIED facts: ${nonVerified.map((fact) => fact?.factId).join(', ')}`] : []),
      ...structuralIssues,
    ];
    if (reasons.length) {
      issues.push(...reasons.map((reason) => `${characterId}: ${reason}`));
      entries.push({ characterId, status: 'PARTIAL', reasons });
    } else {
      entries.push({ characterId, status: 'VERIFIED', reasons: [] });
    }
  }

  const verifiedCharacterIds = entries.filter((entry) => entry.status === 'VERIFIED').map((entry) => entry.characterId);
  const partialCharacterIds = entries.filter((entry) => entry.status === 'PARTIAL').map((entry) => entry.characterId);
  const blockedCharacterIds = entries.filter((entry) => entry.status === 'BLOCKED').map((entry) => entry.characterId);

  return {
    releasedCount: releasedIds.length,
    verifiedCharacterIds,
    partialCharacterIds,
    blockedCharacterIds,
    blockers: [...CHARACTER_FORTE_RULE_SOURCE_BLOCKERS].sort((left, right) => left.blockerId.localeCompare(right.blockerId)),
    entries,
    issues,
  };
}

export function renderCharacterForteRulesCoverageReport(
  audit: CharacterForteRulesCoverageAudit = auditCharacterForteRulesCoverage(),
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

  return `# Character Mechanics FORTE_RULES Coverage

This report is deterministic output from the canonical Character Mechanics registry. It reports **FORTE_RULES only**. Source verification is separate from runtime modeling: a source-verified Forte relationship may remain \`PENDING_INTERPRETATION\` for timing/resource execution without inventing semantics.

## Roster-wide status

${line('RELEASED Characters', audit.releasedCount)}
${line('FORTE_RULES VERIFIED Characters', audit.verifiedCharacterIds.length)}
${line('FORTE_RULES PARTIAL Characters', audit.partialCharacterIds.length)}
${line('FORTE_RULES BLOCKED Characters', audit.blockedCharacterIds.length)}

### VERIFIED

${verified}

### PARTIAL

${partial}

### BLOCKED

${blockers}

## Audit issues

${issues}

## Scope boundary

This report does not change ACTIONS coverage from PR #221 and does not promote full Character Mechanics profiles. Inherent passives, Outro effects, generic resource rules, Sequence mechanics, profiles/recommendations, Team, DPS rotations and UI remain outside this slice. Buling and Danjin stay fail-closed on the exact Forte blockers above; Xiangli Yao's FORTE_RULES can be source-VERIFIED while Pivot — Impale remains an independent ACTIONS damage-class blocker.
`;
}
