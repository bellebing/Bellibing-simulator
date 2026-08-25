import { CHARACTER_CATALOG } from './characters.ts';
import {
  CHARACTER_INTRINSIC_BY_ID,
  RELEASED_CHARACTER_INTRINSIC_PENDING,
} from './characterIntrinsicStats.ts';

export interface CharacterIntrinsicAuditIssue {
  characterId: string;
  issue: string;
}

export interface CharacterIntrinsicCompletenessAudit {
  releasedCount: number;
  profileCount: number;
  issues: readonly CharacterIntrinsicAuditIssue[];
}

/**
 * Current Wuthering Waves Minor-Forte summaries resolve into two permanent stat
 * categories per released Resonator. A disputed category may be pending, but it
 * must be named explicitly rather than represented by an empty array/zero.
 */
export function auditReleasedCharacterIntrinsics(): CharacterIntrinsicCompletenessAudit {
  const released = CHARACTER_CATALOG.filter((character) => character.releaseStatus === 'RELEASED');
  const releasedIds = new Set(released.map((character) => character.id));
  const issues: CharacterIntrinsicAuditIssue[] = [];

  const pendingByCharacter = new Map<string, string[]>();
  for (const pending of RELEASED_CHARACTER_INTRINSIC_PENDING) {
    if (!releasedIds.has(pending.characterId)) {
      issues.push({ characterId: pending.characterId, issue: 'pending intrinsic references non-released/unknown character' });
    }
    const list = pendingByCharacter.get(pending.characterId) ?? [];
    if (list.includes(pending.stat)) {
      issues.push({ characterId: pending.characterId, issue: `duplicate pending intrinsic ${pending.stat}` });
    }
    list.push(pending.stat);
    pendingByCharacter.set(pending.characterId, list);
  }

  for (const character of released) {
    const profile = CHARACTER_INTRINSIC_BY_ID.get(character.id);
    if (!profile) {
      issues.push({ characterId: character.id, issue: 'missing intrinsic profile' });
      continue;
    }

    const pending = pendingByCharacter.get(character.id) ?? [];
    const verifiedNames = profile.stats.map((stat) => stat.stat);
    for (const pendingName of pending) {
      if (verifiedNames.includes(pendingName as never)) {
        issues.push({ characterId: character.id, issue: `pending intrinsic ${pendingName} is already present as verified` });
      }
    }

    const accounted = profile.stats.length + pending.length;
    if (accounted !== 2) {
      issues.push({ characterId: character.id, issue: `expected 2 intrinsic categories, accounted for ${accounted}` });
    }

    if (pending.length === 0 && profile.verificationStatus !== 'VERIFIED') {
      issues.push({ characterId: character.id, issue: 'complete intrinsic profile is not VERIFIED' });
    }
    if (pending.length > 0 && profile.verificationStatus !== 'PARTIALLY_VERIFIED') {
      issues.push({ characterId: character.id, issue: 'profile with pending intrinsic is not PARTIALLY_VERIFIED' });
    }

    if (character.intrinsicStats !== profile.stats) {
      issues.push({ characterId: character.id, issue: 'Character roster is not consuming the canonical intrinsic profile' });
    }
  }

  for (const characterId of CHARACTER_INTRINSIC_BY_ID.keys()) {
    if (!releasedIds.has(characterId)) {
      issues.push({ characterId, issue: 'intrinsic profile exists for non-released/unknown character' });
    }
  }

  return {
    releasedCount: released.length,
    profileCount: CHARACTER_INTRINSIC_BY_ID.size,
    issues,
  };
}
