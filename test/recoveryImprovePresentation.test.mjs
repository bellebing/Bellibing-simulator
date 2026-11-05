import test from 'node:test';
import assert from 'node:assert/strict';
import {renderSelectedImproveOpportunity,renderObservedCheckpointOptions} from '../docs/ui-lab/v1.1/modules/improve-decision-view.js';
test('selected-slot advice is fail-closed and renders only supplied slot values without an analysis table',()=>{
 const pending=renderSelectedImproveOpportunity({reason:'<unsupported>'},0);assert.match(pending,/&lt;unsupported&gt;/);assert.doesNotMatch(pending,/Tuners|data-improve-slot/);
 const input={provenance:{contract:'BELLIBING_FULL_BUILD_DPS_V1',context:{validity:'VALID'}},decisionEvidence:{version:1,recommendedSlot:1},slots:[{slot:0,probability:{estimate:.2,lower:.1,upper:.3},expectedNetCost:{tuners:22},attempts:{estimate:5}},{slot:1,expectedNetCost:{tuners:999}}]};
 const view=renderSelectedImproveOpportunity(input,0);assert.match(view,/Work on Echo 2/);assert.match(view,/22 Tuners/);assert.doesNotMatch(view,/<table|999/);
});
test('observed choices need supplied private alternatives and do not manufacture a recommendation',()=>{
 const absent=renderObservedCheckpointOptions(null);assert.equal((absent.match(/disabled/g)??[]).length,2);
 const view=renderObservedCheckpointOptions({choices:[{action:'CONTINUE',expectedFutureNetCost:{tuners:12},chance:{estimate:.3}},{action:'RESTART_DATA_RECOVERY',expectedFutureNetCost:{tuners:15},status:'RESOURCE_BLOCKED'}]});
 assert.match(view,/12 Tuners/);assert.match(view,/15 Tuners/);assert.match(view,/Start new Echo/);assert.doesNotMatch(view,/is-winner|is-recommended|SIMILAR/);
});
