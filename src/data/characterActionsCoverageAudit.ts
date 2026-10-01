import { CHARACTER_CATALOG } from './characters.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHARACTER_MECHANICS_PROFILE_BY_ID,
} from './characterMechanics.ts';
import {
  CHARACTER_ACTION_SOURCE_BLOCKERS,
  type CharacterActionSourceBlocker,
} from './characterMechanics/rosterActionCompletion.ts';
import { auditCharacterMechanicsCoverage } from './characterMechanicsAudit.ts';

export type CharacterActionsCoverageStatus = 'VERIFIED' | 'PARTIAL' | 'BLOCKED';

export interface CharacterActionsCoverageEntry {
  characterId: string;
  status: CharacterActionsCoverageStatus;
  reasons: readonly string[];
}

export interface CharacterActionsCoverageAudit {
  releasedCount: number;
  verifiedCharacterIds: readonly string[];
  partialCharacterIds: readonly string[];
  blockedCharacterIds: readonly string[];
  blockers: readonly CharacterActionSourceBlocker[];
  entries: readonly CharacterActionsCoverageEntry[];
  issues: readonly string[];
}

const actionIssue = (issue: string) => /ACTION|Tune Break|motion-value|damage class|damageClass|scaling|source representation|shared-system/i.test(issue);

export function auditCharacterActionsCoverage(): CharacterActionsCoverageAudit {
  const releasedIds = CHARACTER_CATALOG
    .filter((character) => character.releaseStatus === 'RELEASED')
    .map((character) => character.id)
    .sort();
  const mechanicsAudit = auditCharacterMechanicsCoverage();
  const blockerByCharacter = new Map(CHARACTER_ACTION_SOURCE_BLOCKERS.map((blocker) => [blocker.characterId, blocker]));
  const issues: string[] = [];
  const entries: CharacterActionsCoverageEntry[] = [];

  for (const blocker of CHARACTER_ACTION_SOURCE_BLOCKERS) {
    if (!releasedIds.includes(blocker.characterId)) issues.push(`ACTIONS blocker ${blocker.blockerId} references non-released Character ${blocker.characterId}`);
    const profile = CHARACTER_MECHANICS_PROFILE_BY_ID.get(blocker.characterId);
    for (const factId of blocker.factIds) {
      const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
      if (!fact || fact.kind !== 'ACTION' || fact.characterId !== blocker.characterId) {
        issues.push(`ACTIONS blocker ${blocker.blockerId} references missing/wrong action fact ${factId}`);
      } else if (fact.verificationStatus === 'VERIFIED') {
        issues.push(`ACTIONS blocker ${blocker.blockerId} action fact ${factId} must remain non-VERIFIED`);
      }
      if (!profile?.factIds.includes(factId)) issues.push(`ACTIONS blocker ${blocker.blockerId} fact ${factId} is not linked by its Character profile`);
    }
  }

  for (const characterId of releasedIds) {
    const profile = CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId);
    const blocker = blockerByCharacter.get(characterId);
    if (!profile) {
      entries.push({ characterId, status: blocker ? 'BLOCKED' : 'PARTIAL', reasons: blocker ? [blocker.reason] : ['No canonical Character Mechanics profile links ACTION facts.'] });
      continue;
    }

    const actionState = profile.coverage.find((entry) => entry.area === 'ACTIONS');
    const actions = profile.factIds
      .map((factId) => CHARACTER_MECHANIC_FACT_BY_ID.get(factId))
      .filter((fact) => fact?.kind === 'ACTION');
    const actionStructuralIssues = mechanicsAudit.structuralIssues
      .filter((entry) => entry.characterId === characterId && actionIssue(entry.issue))
      .map((entry) => entry.issue);

    if (blocker) {
      if (actionState?.status === 'VERIFIED') issues.push(`ACTIONS blocker ${blocker.blockerId} conflicts with VERIFIED ACTIONS coverage`);
      entries.push({ characterId, status: 'BLOCKED', reasons: [blocker.reason, ...actionStructuralIssues] });
      continue;
    }

    if (actionState?.status !== 'VERIFIED') {
      entries.push({ characterId, status: 'PARTIAL', reasons: [actionState?.notes ?? 'ACTIONS coverage is not VERIFIED.', ...actionStructuralIssues] });
      continue;
    }

    const nonVerified = actions.filter((fact) => fact?.verificationStatus !== 'VERIFIED');
    const tuneBreakCount = actions.filter((fact) => fact?.section === 'TUNE_BREAK').length;
    const reasons = [
      ...(actions.length === 0 ? ['VERIFIED ACTIONS coverage has no linked ACTION facts.'] : []),
      ...(nonVerified.length ? [`VERIFIED ACTIONS links non-VERIFIED facts: ${nonVerified.map((fact) => fact?.factId).join(', ')}`] : []),
      ...(tuneBreakCount !== 1 ? [`VERIFIED ACTIONS must link exactly one Tune Break fact; found ${tuneBreakCount}.`] : []),
      ...actionStructuralIssues,
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
    blockers: [...CHARACTER_ACTION_SOURCE_BLOCKERS].sort((left, right) => left.blockerId.localeCompare(right.blockerId)),
    entries,
    issues,
  };
}

export function renderCharacterActionsCoverageReport(audit: CharacterActionsCoverageAudit = auditCharacterActionsCoverage()): string {
  const line = (label: string, value: string | number) => `- **${label}:** ${value}`;
  const verified = audit.verifiedCharacterIds.join(', ') || 'none';
  const partial = audit.partialCharacterIds.join(', ') || 'none';
  const blockers = audit.blockers.length
    ? audit.blockers.map((blocker) => `- \`${blocker.blockerId}\` — \`${blocker.characterId}\`: ${blocker.reason} Source move ${blocker.sourceMoveId}; value rows ${blocker.sourceValueIds.join(', ')}; canonical facts ${blocker.factIds.join(', ')}.`).join('\n')
    : '- none';
  const issues = audit.issues.length ? audit.issues.map((issue) => `- ${issue}`).join('\n') : '- none';

  return `# Character Mechanics ACTIONS Coverage

This report is deterministic output from the canonical Character Mechanics registry. It reports **ACTIONS only**; it does not promote Forte rules, resources, passives, sequences, recommendations, rotations or full Character Mechanics profiles.

## Roster-wide status

${line('RELEASED Characters', audit.releasedCount)}
${line('ACTIONS VERIFIED Characters', audit.verifiedCharacterIds.length)}
${line('ACTIONS PARTIAL Characters', audit.partialCharacterIds.length)}
${line('ACTIONS BLOCKED Characters', audit.blockedCharacterIds.length)}

### VERIFIED

${verified}

### PARTIAL

${partial}

### BLOCKED

${blockers}

## Audit issues

${issues}

## Scope boundary

Danjin's ACTIONS are source-verified even though her full Character Mechanics profile remains source-blocked by the contradictory Ruby Blossom resource threshold. Buling and Xiangli Yao remain ACTIONS-blocked only on the exact damage-classification omissions listed above. Full-profile verification remains governed by the existing six-area Character Mechanics audit and is not implied by this report.
`;
}
