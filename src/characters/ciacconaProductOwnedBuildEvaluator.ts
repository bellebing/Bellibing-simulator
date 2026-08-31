import { CIACCONA_OWNED_BUILD_COMBAT_CONTEXT_REVIEW_20260831 } from '../data/ciacconaOwnedBuildCombatContext20260831.ts';
import { PROFILE_REGISTRY } from '../data/profileCatalogs.ts';
import { resolveBuildPreset } from '../profileRegistry.ts';
import {
  createCiacconaOwnedEchoDamageEvaluator,
  type CiacconaOwnedBuildCombatContext,
} from './ciacconaEchoEvaluator.ts';

const REVIEW = CIACCONA_OWNED_BUILD_COMBAT_CONTEXT_REVIEW_20260831;
const PRODUCT_CONTEXT: CiacconaOwnedBuildCombatContext = REVIEW.combatContext;

function validateProductContextDependencies(): void {
  const ciaccona = resolveBuildPreset(PROFILE_REGISTRY, REVIEW.presetId);
  if (ciaccona.preset.characterId !== 'ciaccona') {
    throw new Error(`${REVIEW.reviewId}: preset no longer resolves to Ciaccona.`);
  }
  if (ciaccona.team.id !== REVIEW.team.teamId) {
    throw new Error(`${REVIEW.reviewId}: Ciaccona team drifted from ${REVIEW.team.teamId}.`);
  }
  if (ciaccona.rotation.engineModelId !== REVIEW.engineModelId
      || ciaccona.rotation.rotationSeconds !== REVIEW.rotationSeconds) {
    throw new Error(`${REVIEW.reviewId}: Ciaccona executable rotation drifted from the reviewed 4.5-second engine context.`);
  }

  const rover = resolveBuildPreset(PROFILE_REGISTRY, REVIEW.team.predecessorPresetId);
  if (rover.preset.characterId !== 'rover-aero' || rover.team.id !== REVIEW.team.teamId) {
    throw new Error(`${REVIEW.reviewId}: reviewed Rover (Aero) predecessor/team binding drifted.`);
  }
  if (rover.weaponRecommendation.defaultWeaponId !== REVIEW.team.predecessorWeaponId) {
    throw new Error(`${REVIEW.reviewId}: Rover (Aero) default weapon drifted from Bloodpact's Pledge.`);
  }
  const defaultWeapon = rover.weaponRecommendation.options.find(
    (option) => option.weaponId === rover.weaponRecommendation.defaultWeaponId,
  );
  if (!defaultWeapon || defaultWeapon.rank !== REVIEW.team.predecessorWeaponRank) {
    throw new Error(`${REVIEW.reviewId}: Rover (Aero) Bloodpact rank drifted from reviewed R${REVIEW.team.predecessorWeaponRank}.`);
  }

  if (REVIEW.team.durationSeconds < REVIEW.rotationSeconds) {
    throw new Error(`${REVIEW.reviewId}: reviewed Bloodpact window no longer covers the full Ciaccona rotation.`);
  }
  if (PRODUCT_CONTEXT.enemyDefense !== REVIEW.target.enemyDefense
      || PRODUCT_CONTEXT.enemyAeroResistance !== REVIEW.target.enemyAeroResistance
      || PRODUCT_CONTEXT.allDamageAmplification !== REVIEW.team.aeroDamageAmplification) {
    throw new Error(`${REVIEW.reviewId}: numeric product context drifted from reviewed target/team facts.`);
  }
}

validateProductContextDependencies();

export const CIACCONA_OWNED_BUILD_PRODUCT_CONTEXT_20260831: CiacconaOwnedBuildCombatContext = Object.freeze({
  ...PRODUCT_CONTEXT,
});

export const ciacconaProductOwnedBuildDamageEvaluator = createCiacconaOwnedEchoDamageEvaluator(
  CIACCONA_OWNED_BUILD_PRODUCT_CONTEXT_20260831,
);

export const CIACCONA_OWNED_BUILD_PRODUCT_CONTEXT_LABEL = REVIEW.target.label;
