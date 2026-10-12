import { coordinateTeamRotation } from '../teamRotationCoordination.ts';
import type { TeamRotationCoordinationInput } from '../teamRotationCoordinationDomain.ts';
import { ROTATION_HIT_BINDINGS } from '../data/teamRotationCoordination.ts';
import { PROFILE_CATALOGS } from '../data/profileCatalogs.ts';
import { hasRotationEngineModel } from '../rotationEngineRegistry.ts';
import { evaluateCharacterDirectHit, listCharacterDirectHitSupport, type CharacterDirectHitInput } from './characterDirectHitAdapter.ts';
import { compareCharacterHitEchoReplacement, type CharacterEchoComparisonInput } from './characterEchoComparison.ts';

/** Discover actual capability, not old ENGINE_MODELED labels alone. */
export function describeTeamRotationCombatCoverage(input: TeamRotationCoordinationInput) {
  const plan = coordinateTeamRotation(input);
  const support = listCharacterDirectHitSupport();
  return {scope:'ROTATION_REFERENCE_COMBAT_PREPARATION' as const,teamDpsReady:false as const,rotationDps:null,
    authorizesUpgradeVerdict:false as const,
    members:plan.members.map(member => {
      const profiles = PROFILE_CATALOGS.rotations.filter(row => row.characterId === member.characterId && row.engineModelId);
      return {characterId:member.characterId,
        explicitHitFactIds:support.filter(row=>row.characterId===member.characterId).map(row=>row.factId),
        referenceHitBindingIds:ROTATION_HIT_BINDINGS.filter(row=>row.referenceId===member.referenceId&&member.contextCompatible).map(row=>row.id),
        declaredEngines:profiles.map(row=>({rotationProfileId:row.id,engineModelId:row.engineModelId!,registered:hasRotationEngineModel(row.engineModelId,member.characterId)})),
        skillSupport:'EXPLICIT_HIT_S0_LEVEL_10_ONLY' as const};
    }),
    nextRequirements:['REVIEWED_REFERENCE_ACTION_BINDINGS','ACTUAL_SKILL_AND_SEQUENCE_SUPPORT','PLAYER_BUILD_AND_ENEMY_CONTEXT','TEAM_BUFF_AND_RESOURCE_LIFECYCLES','SOURCE_TIMING_AND_REPEATABLE_TEAM_CYCLE','REGISTERED_AND_VALIDATED_ROTATION_ENGINE'] as const};
}

function resolveBinding(input: TeamRotationCoordinationInput, bindingId: string, hit: {characterId:string;factId:string}) {
  const binding = ROTATION_HIT_BINDINGS.find(row=>row.id===bindingId);
  if (!binding || hit.characterId!==binding.characterId || hit.factId!==binding.factId) throw new Error('Require the exact reviewed rotation-reference hit binding.');
  const plan = coordinateTeamRotation(input);
  const member = plan.members.find(row=>row.characterId===binding.characterId);
  if (!member || member.referenceId!==binding.referenceId || !member.contextCompatible) throw new Error('Hit binding must belong to the selected compatible member reference.');
  return binding;
}

/** Reuse the existing kernel for one caller-qualified hit. Never sum a guide loop. */
export function evaluateCoordinatedReferenceHit(input: {team:TeamRotationCoordinationInput;bindingId:string;hit:CharacterDirectHitInput}) {
  const binding = resolveBinding(input.team,input.bindingId,input.hit);
  return {bindingId:binding.id,referenceId:binding.referenceId,stepOrder:binding.stepOrder,
    evaluation:evaluateCharacterDirectHit(input.hit),rotationDps:null,authorizesRotationDps:false as const,authorizesUpgradeVerdict:false as const};
}

/** Current/Candidate cards and per-build qualification remain owned by the existing comparator. */
export function compareCoordinatedReferenceEchoReplacement(input: {team:TeamRotationCoordinationInput;bindingId:string;comparison:CharacterEchoComparisonInput}) {
  const binding = resolveBinding(input.team,input.bindingId,input.comparison.hit);
  return {bindingId:binding.id,referenceId:binding.referenceId,stepOrder:binding.stepOrder,
    comparison:compareCharacterHitEchoReplacement(input.comparison),rotationDps:null,authorizesRotationDps:false as const,authorizesUpgradeVerdict:false as const};
}
