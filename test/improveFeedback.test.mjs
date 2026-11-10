import test from 'node:test';
import assert from 'node:assert/strict';
import {improveFeedback,feedbackMarkup,manualTargetExpectedCost,sampledDpsFeedback} from '../docs/ui-lab/v1.1/modules/improve-feedback.js';
const advice=(chance,winner='CONTINUE')=>({decision:winner==='CONTINUE'?'Continue':'Start new Echo',targetGuidance:{status:'VERIFIED',winner,certificate:{exactFixedPoint:true},targetChance:{approximate:chance},continue:{tuners:{approximate:80}},discard:{tuners:{approximate:100}}}});
test('sample uncertainty is not displayed as impossible and global guidance is separate from selected roll advice',()=>{
 const zero={estimate:0,lower:0,upper:.0291,samples:128,successes:0};
 const search={status:'ESTIMATED',repairingEnergy:true,recommendedSlot:2,slots:[{probability:zero}],selected:{slot:0,observedRollCount:0,probability:zero,decision:'More samples needed'}};
 let value=sampledDpsFeedback(search);assert.equal(value.title,'Start with Echo 3');
 const markup=feedbackMarkup(value);assert.match(markup,/Not resolved/);assert.doesNotMatch(markup,/0%|Estimate details|2.91|outcomes/);
 search.selected.slot=2;assert.equal(sampledDpsFeedback(search).title,'Roll your new Echo');
 search.selected.observedRollCount=1;assert.equal(sampledDpsFeedback(search).title,'Comparison unresolved');
 search.selected.observedRollCount=5;search.selected.decision='ER restored';assert.equal(sampledDpsFeedback(search).reason,'Candidate meets ER');
});
test('odds reflect conditional stat targets, and success plus miss totals 100%',()=>{
 const value=improveFeedback(advice(.275),{level:10});
 assert.equal(value.scope,'STAT_TARGETS');assert.equal(value.chance,.275);
 const markup=feedbackMarkup(value);assert.match(markup,/27.5%/);assert.match(markup,/72.5%/);assert.match(markup,/DPS odds pending/);
});
test('cost recommendation controls tone independently of probability thresholds',()=>{
 assert.equal(improveFeedback(advice(.1),{level:15}).tone,'positive');
 assert.equal(improveFeedback(advice(.7,'DISCARD'),{level:15}).tone,'negative');
 assert.equal(manualTargetExpectedCost(advice(.7,'DISCARD')).tuners,100);
});
test('finish to 25 requires certain target completion, not favorite-stat count',()=>{
 assert.equal(improveFeedback(advice(1),{level:15}).title,'Finish to +25');
 assert.equal(improveFeedback(advice(.99),{level:15}).title,'Continue');
 assert.equal(improveFeedback(advice(0,'DISCARD'),{level:20}).reason,'Targets no longer reachable');
});
test('unverified and stale results cannot color a candidate or expose odds',()=>{
 const input=advice(.8);delete input.targetGuidance.certificate;
 assert.equal(improveFeedback(input,{level:10}).chance,null);
 assert.equal(manualTargetExpectedCost(input),null);
 assert.equal(improveFeedback(advice(.8),{pending:true,level:10}).tone,'neutral');
});
test('a completed target success is separate from a completed DPS win',()=>{
 const input=advice(1);input.targetGuidance.status='TARGET_SUCCESS';
 assert.equal(improveFeedback(input,{level:25}).title,'Targets met');assert.equal(manualTargetExpectedCost(input).tuners,0);
 input.buildComparison={status:'EXPERIMENTAL',delta:{teamTotal:12}};
 assert.equal(improveFeedback(input,{level:25}).title,'New Echo wins');
 input.buildComparison.delta.teamTotal=-12;assert.equal(improveFeedback(input,{level:25}).title,'Current Echo wins');
 input.buildComparison.delta.teamTotal=0;assert.equal(improveFeedback(input,{level:25}).title,'Same model DPS');
});
test('invalid probabilities stay unavailable and no expected Echo or Tube counts are inferred',()=>{
 assert.equal(improveFeedback(advice(1.01),{level:10}).chance,null);
 const costs=manualTargetExpectedCost(advice(.5));assert.equal(costs.echoes,null);assert.equal(costs.tubes,null);
});

test('Continue and Start new retain their own service odds and cost scopes',()=>{
 const input=advice(.5);input.targetGuidance.continue.chance={approximate:.3};input.targetGuidance.discard.chance={approximate:.1};
 const value=improveFeedback(input,{level:10});
 assert.equal(value.alternatives.continue.chance,.3);assert.equal(value.alternatives.restart.chance,.1);
 const markup=feedbackMarkup(value);assert.ok(markup.indexOf('<strong>Start new</strong>')<markup.indexOf('<strong>Continue</strong>'));assert.match(markup,/includes restarts/);
 assert.equal(improveFeedback(advice(1),{level:15}).tone,'achieved');
});
