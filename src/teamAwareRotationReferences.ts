import { CHARACTER_CATALOG } from './data/characters.ts';
import { ROTATION_REFERENCES_BY_CHARACTER_ID } from './data/teamAwareRotationReferences.ts';
import type { TeamAwareRotationReference } from './teamAwareRotationDomain.ts';

export interface RotationReferenceContext {
  readonly modeKey?: string;
  readonly phase?: TeamAwareRotationReference['phase'];
  readonly introAvailable?: boolean;
  /** Complete known party, including the queried Character; examples do not restrict it. */
  readonly teamCharacterIds?: readonly string[];
}

export interface RotationReferenceMatch {
  readonly reference: TeamAwareRotationReference;
  readonly contextStatus: 'MATCHED_DECLARED_CONTEXT' | 'NEEDS_CONTEXT_REVIEW';
  readonly needsReview: readonly ('MODE' | 'TEAM' | 'INTRO' | 'GUIDE_CONDITIONS')[];
  readonly teamAffinity: 'EXPLICIT_SOURCE_EXAMPLE' | 'SOURCE_REQUIRED_CONTEXT' | 'UNSPECIFIED';
}

const releasedIds = new Set(CHARACTER_CATALOG.filter(row => row.releaseStatus === 'RELEASED').map(row => row.id));

/**
 * Discover source references for an explicitly supplied context. Returns all
 * candidates in source order; never selects a default, scores a team, infers a
 * mode, allocates an Intro or establishes runtime/legal/DPS readiness.
 */
export function findTeamAwareRotationReferences(characterId: string, context: RotationReferenceContext = {}): readonly RotationReferenceMatch[] {
  const references = ROTATION_REFERENCES_BY_CHARACTER_ID.get(characterId) ?? [];
  const party = context.teamCharacterIds;
  if (party && (party.length > 3 || new Set(party).size !== party.length || !party.includes(characterId) || party.some(id => !releasedIds.has(id)))) {
    throw new Error('Rotation reference party must contain the Character and at most three unique released identities.');
  }
  const contains = (combination: readonly string[]) => combination.every(id => party?.includes(id));
  return references.flatMap(reference => {
    if (context.phase !== undefined && reference.phase !== context.phase) return [];
    // An unclassified mode cannot confirm a supplied, arbitrary mode.
    if (context.modeKey !== undefined && !reference.context.modeKeys.includes(context.modeKey)) return [];
    if (context.introAvailable !== undefined && reference.context.introAvailability !== null && reference.context.introAvailability !== context.introAvailable) return [];
    if (party && reference.context.requiredTeamCombinations.length && !reference.context.requiredTeamCombinations.some(contains)) return [];
    if (party && reference.context.excludedTeamCombinations.some(contains)) return [];
    const needsReview: ('MODE' | 'TEAM' | 'INTRO' | 'GUIDE_CONDITIONS')[] = [];
    if (context.modeKey === undefined && reference.context.modeKeys.length) needsReview.push('MODE');
    if (!party && (reference.context.requiredTeamCombinations.length || reference.context.excludedTeamCombinations.length)) needsReview.push('TEAM');
    if (context.introAvailable === undefined && reference.context.introAvailability !== null) needsReview.push('INTRO');
    if (reference.context.conditions.length) needsReview.push('GUIDE_CONDITIONS');
    const teamAffinity = party && reference.context.exampleTeams.some(contains) ? 'EXPLICIT_SOURCE_EXAMPLE' as const
      : party && reference.context.requiredTeamCombinations.length ? 'SOURCE_REQUIRED_CONTEXT' as const : 'UNSPECIFIED' as const;
    return [{ reference, contextStatus: needsReview.length ? 'NEEDS_CONTEXT_REVIEW' as const : 'MATCHED_DECLARED_CONTEXT' as const, needsReview, teamAffinity }];
  });
}
