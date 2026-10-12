import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateCoordinatedReferenceHit as evaluate, compareCoordinatedReferenceEchoReplacement as compare, describeTeamRotationCombatCoverage as coverage } from '../src/combat/teamRotationReferenceBridge.ts';
import { createRank5EchoAtLevel0,withRank5MainStatsAtLevel,type Echo } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import type { EchoBuildHitContext,CharacterEchoComparisonInput } from '../src/combat/characterEchoComparison.ts';
const team={members:[{characterId:'aalto'},{characterId:'jiyan'},{characterId:'verina'}]};
const bindingId='aalto-basic-stage-1-reference';
const hit={characterId:'aalto',factId:'aalto-basic-half-truths-1',sequence:0 as const,maxSkills:true,componentIndex:0,landedHitCount:1,
  snapshot:{scalingStat:'ATK' as const,damageClass:'BASIC' as const,totalScalingStat:1000,damageBonus:0,amplification:0,critRate:0,critDamage:1.5,defenseMultiplier:1,resistanceMultiplier:1,damageReduction:0}};

test('reviewed Aalto guide stage delegates to the existing exact S0/Lv10 hit kernel',()=>{
  const result=evaluate({team,bindingId,hit});
  assert.equal(result.referenceId,'prydwen-aalto-standard');assert.equal(result.stepOrder,5);
  assert.ok(Math.abs(result.evaluation.expectedDamage-318.1)<1e-10);
  assert.equal(result.authorizesRotationDps,false);assert.equal(result.rotationDps,null);assert.equal(result.authorizesUpgradeVerdict,false);
});

test('binding, canonical action, selected reference and existing skill/sequence gates all remain mandatory',()=>{
  assert.throws(()=>evaluate({team,bindingId,hit:{...hit,factId:'aalto-basic-half-truths-2'}}),/exact reviewed/);
  assert.throws(()=>evaluate({team,bindingId:'invented-binding',hit}),/exact reviewed/);
  assert.throws(()=>evaluate({team,bindingId,hit:{...hit,sequence:1}}),/S0 and max skills/);
  assert.throws(()=>evaluate({team,bindingId,hit:{...hit,maxSkills:false}}),/S0 and max skills/);
  assert.throws(()=>evaluate({team:{members:[{characterId:'aalto',modeKey:'unknown'},{characterId:'jiyan'},{characterId:'verina'}]},bindingId,hit}),/selected compatible/);
});

function fixture():CharacterEchoComparisonInput {
  const cards=()=>[4,3,3,1,1].map((cost,i)=>createRank5EchoAtLevel0({id:'card-'+i,cost:cost as 1|3|4,primaryMainStat:'ATK%'}));
  const current=cards(),candidate=cards();candidate[0]=withRank5MainStatsAtLevel(candidate[0],5);candidate[0].substats=[{name:'CRIT Rate',value:.063}];
  const ctx=(echoes:Echo[],evidenceId:string):EchoBuildHitContext=>({status:'QUALIFIED',provenance:'CALLER_QUALIFIED',characterId:hit.characterId,factId:hit.factId,componentIndex:0,landedHitCount:1,eventContextId:'test-same-hit',echoStatKey:projectRank5EchoStats(echoes).key,evidenceId,damageElement:'Aero',scalingBaseBeforePercentBonuses:1000,callerAssertions:{allNonEchoSourcesQualified:true,echoDependentEffectsRecomputed:true,equipmentStateQualified:true},nonEchoSnapshot:hit.snapshot});
  return {hit,eventContextId:'test-same-hit',slotIndex:0,current:{echoes:current,context:ctx(current,'test-current')},candidate:{echoes:candidate,context:ctx(candidate,'test-candidate')}};
}
test('real Current/Candidate Echo cards recompute one bound hit without default build substitution',()=>{
  const input=fixture(),original=structuredClone(input),result=compare({team,bindingId,comparison:input});
  assert.equal(result.comparison.status,'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status!=='EVALUATED_HIT_COMPARISON') throw Error('Expected supported fixture');
  assert.ok(Math.abs(result.comparison.relativeExpectedDamageDelta!-(1404.8*1.0315/1328-1))<1e-12);
  assert.equal(result.comparison.current.provenance,'CALLER_QUALIFIED');assert.equal(result.authorizesUpgradeVerdict,false);
  assert.deepEqual(input,original);
  const pending=fixture();pending.candidate.context={status:'PENDING',reason:'Actual weapon/team/enemy state not yet qualified'};
  assert.equal(compare({team,bindingId,comparison:pending}).comparison.status,'PENDING');
});

test('old ENGINE_MODELED labels cannot substitute for actual engine registration or reference mapping',()=>{
  const result=coverage({members:[{characterId:'augusta'},{characterId:'iuno'},{characterId:'the-shorekeeper'}]});
  const augusta=result.members.find(row=>row.characterId==='augusta')!;
  assert.ok(augusta.declaredEngines.length);assert.ok(augusta.declaredEngines.every(row=>row.registered===false));
  assert.equal(augusta.referenceHitBindingIds.length,0);
  assert.equal(result.teamDpsReady,false);assert.equal(result.rotationDps,null);
  assert.equal(result.members[0].skillSupport,'EXPLICIT_HIT_S0_LEVEL_10_ONLY');
  const pilot=coverage(team).members.find(row=>row.characterId==='aalto')!;
  assert.deepEqual(pilot.referenceHitBindingIds,[bindingId]);assert.ok(pilot.explicitHitFactIds.length);
});
