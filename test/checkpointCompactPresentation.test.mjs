// Synthetic UI contracts; values do not establish gameplay results.
import test from 'node:test';import assert from 'node:assert/strict';
import {checkpointVerdict,renderCheckpointOptions} from '../docs/ui-lab/v1.1/modules/improve-decision-view.js';
const fixture=(status='UNCERTAIN')=>({status:'EXPERIMENTAL',decision:'CONTINUE',uncertain:false,comparison:{version:1,status,recommendedAction:status==='CLEAR_COST_ADVANTAGE'?'CONTINUE':null,options:[{action:'CONTINUE',advantages:['LESS_NEW_ECHOES']},{action:'RESTART_DATA_RECOVERY',advantages:['HIGHER_FIVE_STAT_CHANCE']}]},continue:{action:'CONTINUE',status:'EXPERIMENTAL',expectedFutureNetCost:{tuners:100}},discard:{action:'RESTART_DATA_RECOVERY',status:'EXPERIMENTAL',expectedFutureNetCost:{tuners:101}}});
test('close and uncertain comparisons offer two neutral actions, short benefits and one shared details disclosure',()=>{
 for(const state of ['UNCERTAIN','SIMILAR_TUNER_COST']){
  const a=fixture(state),view=renderCheckpointOptions(a);assert.doesNotMatch(view,/is-recommended/);assert.match(view,/Less Echoes needed/);assert.doesNotMatch(view,/Chance for 5\/5/);
  assert.equal((view.match(/data-checkpoint-action=/g)??[]).length,2);assert.equal((view.match(/<details/g)??[]).length,1);
  assert.match(view,/≈100 Tuners/);assert.match(checkpointVerdict(a),state==='UNCERTAIN'?/No clear/:/your choice/);
 }
});
test('clear recommendation, legacy uncertainty, terminal and blocked states remain distinct',()=>{
 const a=fixture('CLEAR_COST_ADVANTAGE');assert.equal((renderCheckpointOptions(a).match(/is-recommended/g)??[]).length,1);
 a.uncertain=true;assert.doesNotMatch(renderCheckpointOptions(a),/is-recommended/);assert.equal(checkpointVerdict(a),'No clear recommendation');
 a.status='RESOURCE_BLOCKED';assert.equal(checkpointVerdict(a),'Not enough resources');assert.equal((renderCheckpointOptions(a).match(/ disabled/g)??[]).length,2);
 a.winner='KEEP_TEMPORARY';assert.match(checkpointVerdict(a),/Keep for comparison/);
});
test('5/5 label requires supplied qualified probability; details escape supplied stat names',()=>{
 const a=fixture(),o=a.comparison.options[1];o.fiveStatQuality={status:'AVAILABLE',kind:'FIVE_CONTEXT_QUALIFIED_TYPES',probability:.01,statNames:['<script>','B','C','D','E']};
 const view=renderCheckpointOptions(a);assert.match(view,/Chance for 5\/5 stats/);assert.match(view,/&lt;script&gt;/);assert.doesNotMatch(view,/<script>/);assert.match(view,/Stat types only/);
});
