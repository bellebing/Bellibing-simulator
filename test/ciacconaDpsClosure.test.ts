import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CIACCONA_BASIC_ENGINE_MODEL_ID,
  CIACCONA_BASIC_MODELED_MECHANIC_FACT_IDS,
  evaluateCiacconaBasicRotation,
} from '../src/characters/ciacconaStandard.ts';
import { AeroErosionTargetState } from '../src/combat/aeroErosionTargetState.ts';
import {
  WoodlandAriaAeroExecutionState,
  defiersThornAeroDamageTakenAmplification,
} from '../src/combat/aeroErosionWeaponAdapter.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { auditRotationMechanicDependencies } from '../src/data/rotationMechanicsAudit.ts';
import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';
import { assertCharacterDpsReady, assertProfileReadinessAudit } from '../src/profileReadinessRegistry.ts';
import {
  engineModelsMechanicFact,
  getRotationEngineRegistration,
} from '../src/rotationEngineRegistry.ts';

const CIACCONA_TEST_BUILD = {
  totalAttack: 1000,
  critRate: 0,
  critDamage: 1.5,
  aeroDamageBonus: 0,
  basicAttackDamageBonus: 0,
  heavyAttackDamageBonus: 0,
  resonanceSkillDamageBonus: 0,
  resonanceLiberationDamageBonus: 0,
  introSkillDamageBonus: 0,
  allDamageAmplification: 0,
  attackerLevel: 90,
  enemyDefense: 0,
  enemyAeroResistance: 0.2,
  skillLevel: 10,
  weaponRank: 1,
} as const;

test('shared Aero Erosion target state gives Woodland Aria only source-proven post-trigger benefits', () => {
  const target = new AeroErosionTargetState(4.5);
  const woodland = new WoodlandAriaAeroExecutionState(target, 1);

  assert.equal(woodland.aeroDamageBonus, 0);
  assert.equal(woodland.targetAeroResReduction, 0);
  assert.equal(defiersThornAeroDamageTakenAmplification(target, 1), 0);

  woodland.afterAeroErosionApplication(0, 'test-source-fact', 1);
  assert.equal(woodland.aeroDamageBonus, 0.24);
  assert.equal(woodland.targetAeroResReduction, 0);
  assert.ok(defiersThornAeroDamageTakenAmplification(target, 1) > 0);

  woodland.afterTargetHit(true);
  assert.equal(woodland.targetAeroResReduction, 0.10);
});

test('Ciaccona fixed fast rotation executes its canonical direct-hit state machine', () => {
  const result = evaluateCiacconaBasicRotation(CIACCONA_TEST_BUILD);

  assert.equal(result.engineModelId, CIACCONA_BASIC_ENGINE_MODEL_ID);
  assert.equal(result.rotationSeconds, 4.5);
  assert.equal(result.actions.length, 9);
  assert.ok(result.rotationDamage > 0);
  assert.equal(result.personalDirectRotationDps, result.rotationDamage / 4.5);

  assert.equal(result.actions[0]?.aeroErosionBefore, false);
  assert.equal(result.actions[0]?.woodlandAeroBefore, false);
  assert.equal(result.actions[0]?.woodlandResReductionBefore, false);

  assert.equal(result.actions[1]?.aeroErosionBefore, true);
  assert.equal(result.actions[1]?.woodlandAeroBefore, true);
  assert.equal(result.actions[1]?.woodlandResReductionBefore, false);
  assert.equal(result.actions[2]?.woodlandResReductionBefore, true);

  const firstMidair = result.actions.find((row) => row.sourceFactId === 'ciaccona-basic-attack-quadruple-time-steps-mid-air-attack-stage-1-dmg');
  assert.ok(firstMidair);
  assert.equal(firstMidair.soloConcertBefore, true);

  const downbeat = result.actions.find((row) => row.sourceFactId === 'ciaccona-forte-circuit-symphony-of-wind-and-verse-quadruple-downbeat-dmg');
  assert.ok(downbeat);
  assert.equal(downbeat.musicalEssenceBefore, 3);
  assert.equal(downbeat.musicalEssenceAfter, 0);

  assert.equal(result.finalMusicalEssence, 0);
  assert.equal(result.finalAeroErosionStacksObserved, 5);
  assert.equal(result.outroReached, true);
  assert.equal(result.excludesOptionalTonicEvents, true);
});

test('Ciaccona dependency closure reaches BuildContext and DPS_READY while Cartethyia remains fail-closed', () => {
  const ciacconaReview = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'ciaccona-cartethyia-aero');
  const cartethyiaReview = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'cartethyia-aero-erosion');
  assert.ok(ciacconaReview && cartethyiaReview);

  assert.deepEqual(ciacconaReview.pendingExecutionIds, []);
  assert.equal(ciacconaReview.result, 'REVIEWED_NO_BLOCKING_PROFILE_CHANGE');
  assert.deepEqual(cartethyiaReview.pendingExecutionIds, [
    'weapon:defiers-thorn:DT-DEF:source-timing-adapter',
    'rotation:cartethyia-basic-ciaccona-rover-aero:engine-model',
  ]);

  const ciacconaRotation = PROFILE_CATALOGS.rotations.find((row) => row.id === 'ciaccona-basic-cartethyia-rover-aero');
  const cartethyiaRotation = PROFILE_CATALOGS.rotations.find((row) => row.id === 'cartethyia-basic-ciaccona-rover-aero');
  assert.ok(ciacconaRotation && cartethyiaRotation);
  assert.equal(ciacconaRotation.executionStatus, 'ENGINE_MODELED');
  assert.equal(ciacconaRotation.engineModelId, CIACCONA_BASIC_ENGINE_MODEL_ID);
  assert.equal(ciacconaRotation.rotationSeconds, 4.5);
  assert.deepEqual(auditRotationMechanicDependencies(ciacconaRotation).issues, []);

  const registration = getRotationEngineRegistration(CIACCONA_BASIC_ENGINE_MODEL_ID);
  assert.ok(registration);
  assert.equal(registration.characterId, 'ciaccona');
  for (const factId of CIACCONA_BASIC_MODELED_MECHANIC_FACT_IDS) {
    assert.equal(engineModelsMechanicFact(CIACCONA_BASIC_ENGINE_MODEL_ID, factId), true, factId);
  }

  const buildContext = buildContextFromVerifiedPreset('ciaccona-cartethyia-aero', []);
  assert.equal(buildContext.characterId, 'ciaccona');
  assert.deepEqual(buildContext.weapon, { id: 'woodland-aria', rank: 1 });
  assert.equal(buildContext.teamId, 'cartethyia-ciaccona-rover-aero');
  assert.equal(buildContext.rotationProfileId, CIACCONA_BASIC_ENGINE_MODEL_ID);

  const readiness = assertProfileReadinessAudit();
  assert.deepEqual(readiness.dpsReadyIds, ['augusta', 'ciaccona']);
  assert.equal(assertCharacterDpsReady('ciaccona').disposition, 'DPS_READY');

  assert.equal(cartethyiaRotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(cartethyiaRotation.rotationSeconds, undefined);
  assert.throws(() => buildContextFromVerifiedPreset('cartethyia-aero-erosion', []), /not ENGINE_MODELED/);
});
