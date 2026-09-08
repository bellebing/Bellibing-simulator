import { readCharacterActionValues } from './characterActionValues.ts';
import { listCharacterBasicHitSupport } from './combat/characterBasicHitAdapter.ts';
import { listCharacterDirectHitSupport } from './combat/characterDirectHitAdapter.ts';
import { listWeaponResourceCastSupport } from './combat/weaponResourceCastAdapter.ts';
import { CHARACTER_CATALOG } from './data/characters.ts';
import { CHARACTER_INTRINSIC_BY_ID } from './data/characterIntrinsicStats.ts';
import { CHARACTER_MECHANIC_FACTS, CHARACTER_MECHANICS_PROFILE_BY_ID } from './data/characterMechanics.ts';
import { CHARACTER_MECHANICS_SOURCE_BLOCKERS } from './data/characterMechanicsSourceReview.ts';
import { PROFILE_CATALOGS } from './data/profileCatalogs.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from './data/profileBackwardImpactReviewCatalog.ts';
import { WEAPON_CATALOG } from './data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from './data/weaponEffectCatalog.ts';
import { getWeaponEffectCoverageStatus } from './data/weaponEffectAudit.ts';
import { ECHO_CATALOG } from './data/echoes.ts';
import { ECHO_EFFECT_MODELS } from './data/echoEffects.ts';
import { ECHO_ATTACK_PROFILES } from './data/echoAttacks.ts';
import { ECHO_SKILL_SOURCE_REVIEW_V36, ECHO_SKILL_PENDING_ADAPTER_FACTS } from './data/echoSkillSourceReview.ts';
import { SONATA_CATALOG } from './data/sonatas.ts';
import { SONATA_EFFECT_MODELS } from './data/sonataEffects.ts';
import { SONATA_EFFECT_SOURCE_REVIEWS } from './data/sonataEffectSourceReview.ts';
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
    hitPrimitives: { basicHits: listCharacterBasicHitSupport(), directHits: listCharacterDirectHitSupport() },
    // Gear facts retain their own source/modeling status. Profile selection and
    // audited source coverage do not authorize conditional effects or uptime.
    gear: {
      weapons: byId(WEAPON_CATALOG),
      weaponEffects: [...WEAPON_EFFECT_CATALOG].sort((a, b) => a.effectId < b.effectId ? -1 : a.effectId > b.effectId ? 1 : 0),
      weaponEffectCoverage: byId(WEAPON_CATALOG).map((weapon) => ({
        weaponId: weapon.id,
        status: getWeaponEffectCoverageStatus(weapon.id),
      })),
      weaponResourceCasts: listWeaponResourceCastSupport(),
      echoes: byId(ECHO_CATALOG),
      echoEffects: [...ECHO_EFFECT_MODELS].sort((a, b) => a.effectId < b.effectId ? -1 : a.effectId > b.effectId ? 1 : 0),
      echoAttacks: [...ECHO_ATTACK_PROFILES].sort((a, b) => a.echoId < b.echoId ? -1 : a.echoId > b.echoId ? 1 : 0),
      echoSkillSourceReview: ECHO_SKILL_SOURCE_REVIEW_V36,
      echoSkillPendingAdapterFacts: ECHO_SKILL_PENDING_ADAPTER_FACTS,
      sonatas: byId(SONATA_CATALOG),
      sonataEffects: [...SONATA_EFFECT_MODELS].sort((a, b) => a.effectId < b.effectId ? -1 : a.effectId > b.effectId ? 1 : 0),
      sonataSourceReviews: SONATA_EFFECT_SOURCE_REVIEWS,
    },
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
