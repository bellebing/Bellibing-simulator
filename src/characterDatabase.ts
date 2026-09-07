import { readCharacterActionValues } from './characterActionValues.ts';
import { listCharacterBasicHitSupport } from './combat/characterBasicHitAdapter.ts';
import { CHARACTER_CATALOG } from './data/characters.ts';
import { CHARACTER_INTRINSIC_BY_ID } from './data/characterIntrinsicStats.ts';
import { CHARACTER_MECHANIC_FACTS, CHARACTER_MECHANICS_PROFILE_BY_ID } from './data/characterMechanics.ts';
import { CHARACTER_MECHANICS_SOURCE_BLOCKERS } from './data/characterMechanicsSourceReview.ts';
import { PROFILE_CATALOGS } from './data/profileCatalogs.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from './data/profileBackwardImpactReviewCatalog.ts';
import { buildReferenceTeam01ExecutionContext } from './data/referenceTeam01ExecutionContext.ts';
import { assertProfileReadinessAudit } from './profileReadinessRegistry.ts';

const byId = <T extends { readonly id: string }>(rows: readonly T[]): T[] =>
  [...rows].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * One derived, serializable read model over canonical catalogs. Add/review data
 * in its owning catalog; no per-Character export configuration is needed.
 * This is source data for clients and engines, not a generic damage evaluator.
 */
export function buildCharacterDatabase() {
  const readiness = assertProfileReadinessAudit();
  const readinessById = new Map(readiness.characters.map((row) => [row.characterId, row]));
  const blockersById = new Map(CHARACTER_MECHANICS_SOURCE_BLOCKERS.map((row) => [row.characterId, row]));
  const mechanicsFacts = [...CHARACTER_MECHANIC_FACTS].sort((a, b) => a.factId < b.factId ? -1 : a.factId > b.factId ? 1 : 0);
  const referenceTeam01 = buildReferenceTeam01ExecutionContext();
  return structuredClone({
    schemaVersion: 1 as const,
    sourceAuthority: 'BELLIBING_CANONICAL_CATALOGS' as const,
    scope: {
      activeSequences: [0, 1, 2],
      skillLevel: 10,
      rawLowerSkillLevelsAndHigherSequencesRetained: true,
      quickswap: 'DEFERRED',
      actionValuesAreNotDamageOrExecutionReadiness: true,
    } as const,
    characters: byId(CHARACTER_CATALOG).map((character) => ({
      ...character,
      intrinsic: CHARACTER_INTRINSIC_BY_ID.get(character.id) ?? null,
      mechanics: CHARACTER_MECHANICS_PROFILE_BY_ID.get(character.id) ?? null,
      sourceBlocker: blockersById.get(character.id) ?? null,
      // Non-released identities have no readiness approval; null is not ready.
      readiness: readinessById.get(character.id) ?? null,
    })),
    mechanicsFacts,
    actionValuesAtMaxSkill: mechanicsFacts.flatMap((fact) => fact.kind === 'ACTION'
      ? [{ factId: fact.factId, values: readCharacterActionValues(fact, 10) }] : []),
    hitPrimitives: { basicHits: listCharacterBasicHitSupport() },
    profiles: {
      presets: byId(PROFILE_CATALOGS.presets),
      weaponRecommendations: byId(PROFILE_CATALOGS.weaponRecommendations),
      echoLoadouts: byId(PROFILE_CATALOGS.echoLoadouts),
      statTargets: byId(PROFILE_CATALOGS.statTargets),
      teams: byId(PROFILE_CATALOGS.teams),
      rotations: byId(PROFILE_CATALOGS.rotations),
    },
    executionReviews: [...PROFILE_BACKWARD_IMPACT_REVIEWS_V36].sort((a, b) =>
      a.reviewId < b.reviewId ? -1 : a.reviewId > b.reviewId ? 1 : 0),
    referenceTeam01,
  });
}

export type CharacterDatabase = ReturnType<typeof buildCharacterDatabase>;

/** Stable bytes: no wall clock, network refresh, provider candidates or inferred facts. */
export function serializeCharacterDatabase(): string {
  return `${JSON.stringify(buildCharacterDatabase(), null, 2)}\n`;
}
