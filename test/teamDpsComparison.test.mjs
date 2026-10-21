import test from 'node:test';
import assert from 'node:assert/strict';
import {teamDpsComparison,teamDpsDelta,TEAM_COMPARISON_VERSION as version} from '../src/teamDpsComparison.mjs';
import {dpsConceptMarkup} from '../docs/ui-lab/v1.1/modules/dps-concept.js';
// Contract-only arithmetic. These are not gameplay/provider qualification facts.
const provider={id:'UNIT_PROVIDER',version:'UNIT_V1',sourceBinding:'UNIT_SOURCE'};
const context={version,teamContextId:'unit-team',selectedCharacterId:'b',characterIds:['a','b','c'],sourceRevision:'unit-source',enemyIdentity:'unit-enemy',rotationIdentity:'unit-rotation',cycles:2,durationSeconds:60,fixedEquipmentIdentity:'unit-fixed-gear',provider};
const qualifiedProviders=[{identity:provider,scenarios:['RECOMMENDED','EXPECTED','SIMULATED','CURRENT','CANDIDATE'],expectationModelIds:['unit-distribution']}];
const interpretation={RECOMMENDED:'REFERENCE_BUILD',EXPECTED:'EXPECTATION_OF_TEAM_RUNS',SIMULATED:'OBSERVED_LOADOUT',CURRENT:'EQUIPPED_BUILD',CANDIDATE:'CANDIDATE_BUILD'};
function row(scenario,multiplier=1){return {version,scenario,interpretation:interpretation[scenario],status:'VERIFIED',verification:'SOURCE_QUALIFIED_TEAM_RUN',measurementContext:structuredClone(context),loadoutIdentity:'unit-loadout-'+scenario,runIdentity:'unit-run-'+scenario,rotationLegal:true,coverage:{complete:true},expectation:{modelId:'unit-distribution',method:'EXACT_DISTRIBUTION'},characterContributions:['a','b','c'].map((characterId,i)=>({characterId,dps:i*multiplier})),teamTotal:3*multiplier};}
test('one qualified context supports Sandbox scenarios and zero-safe comparable deltas',()=>{
 const comparison=teamDpsComparison({context,qualifiedProviders,results:[row('RECOMMENDED'),row('EXPECTED'),row('SIMULATED',2)]});
 assert.ok(comparison.rows.every(r=>r.status==='VERIFIED'));assert.equal(teamDpsDelta(comparison,'RECOMMENDED','SIMULATED').teamTotal.absolute,3);assert.equal(teamDpsDelta(comparison,'RECOMMENDED','SIMULATED').characterContributions[0].relative,null);
});
test('self-reported verified, experimental, wrong-context and illegal-rotation rows cannot qualify',()=>{
 assert.equal(teamDpsComparison({context,results:[row('SIMULATED')]}).rows[2].status,'PENDING');
 for(const mutate of [r=>r.verification='EXPERIMENTAL',r=>r.measurementContext.provider.version='old',r=>r.measurementContext.enemyIdentity='other',r=>r.measurementContext.fixedEquipmentIdentity='other',r=>r.rotationLegal=false,r=>r.characterContributions[1].characterId='a',r=>r.teamTotal=999]){
  const r=row('SIMULATED');mutate(r);assert.equal(teamDpsComparison({context,qualifiedProviders,results:[r]}).rows[2].status,'PENDING');
 }
});
test('DPS at mean stats is rejected as Expected; missing expectation model stays Pending',()=>{
 for(const mutate of [r=>r.interpretation='DPS_AT_MEAN_STATS',r=>r.expectation.method='DPS_AT_MEAN_STATS',r=>r.expectation.modelId='unreviewed']){
  const r=row('EXPECTED');mutate(r);assert.equal(teamDpsComparison({context,qualifiedProviders,results:[r]}).rows[1].status,'PENDING');
 }
});
test('Improve reuses two rows and rejects hand-built or mutated comparison deltas',()=>{
 const c=teamDpsComparison({mode:'IMPROVE',context,qualifiedProviders,results:[row('CURRENT'),row('CANDIDATE',2)]});
 assert.deepEqual(c.rows.map(r=>r.scenario),['CURRENT','CANDIDATE']);assert.equal(teamDpsDelta(c,'CURRENT','CANDIDATE').status,'VERIFIED');
 assert.equal(teamDpsDelta(structuredClone(c),'CURRENT','CANDIDATE').status,'PENDING');c.context.durationSeconds=1;assert.equal(teamDpsDelta(c,'CURRENT','CANDIDATE').status,'PENDING');
 const markup=dpsConceptMarkup({hasCurrentBuild:true,characterId:'iuno',comparisonMode:'IMPROVE'});assert.equal((markup.match(/data-dps-scenario=/g)??[]).length,2);assert.doesNotMatch(markup,/data-dps-scenario="EXPECTED"/);
});
