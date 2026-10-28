// Presentation fixtures only; these values are not gameplay evidence.
import test from 'node:test';import assert from 'node:assert/strict';
import {renderImproveOpportunities,renderCheckpointOptions,interval} from '../docs/ui-lab/v1.1/modules/improve-decision-view.js';
const fixture=()=>({status:'EXPERIMENTAL',provenance:{contract:'BELLIBING_FULL_BUILD_DPS_V1',provider:{id:'TEST_PROVIDER',version:'1',sourceBinding:'TEST_SOURCE'},context:{id:'TEST_CONTEXT',validity:'VALID'},readiness:'TEST_ONLY'},current:{characterDps:123,teamDps:456},ranking:{easiest:[1],cheapest:{tuners:[1]},bestBenefitPerResource:{tuners:[3]}},slots:Array.from({length:5},(_,slot)=>({slot,probability:{estimate:.25,lower:.2,upper:.3},attempts:{estimate:4,lower:3,upper:5},expectedNetCost:{tuners:99,exp:555,echoes:4,tubes:{premium:1,advanced:2,medium:3,basic:4}},gain:{conditionalOnImprovement:7,expectedRetained:1.75,standardError:.1},benefitPerResource:{tuners:.07},finiteStock:{status:'UNLIMITED'},estimation:{kind:'ESTIMATED',confidence:.99}})),decisionEvidence:{version:1,status:'ESTIMATED_RECOMMENDATION',recommendedSlot:3,runnerUpSlot:1,objective:{label:'Supplied objective',metric:'TEAM_DPS'},rationale:{summary:'Actual private explanation <safe>'},alternatives:[{alternativeSlot:1,probability:{estimate:.25},attempts:{estimate:-2},netCost:{tuners:{estimate:-70},exp:{estimate:-333},echoes:{estimate:-2},tubes:{}},gain:{conditional:{estimate:-99},retained:{estimate:-24.5}},benefitPerResource:{}}]}});
test('presentation preserves private recommendation, objective, rationale and signed comparisons without ranking locally',()=>{
 const input=fixture(),before=structuredClone(input),view=renderImproveOpportunities(input);
 assert.match(view,/data-recommended-slot="3"/);assert.match(view,/Echo 4 recommended/);assert.match(view,/Echo 4 vs Echo 2/);assert.match(view,/Supplied objective/);assert.match(view,/Actual private explanation &lt;safe&gt;/);
 for(const value of ['+25 pp','-2 ','-70 ','-333 ','-99 DPS','-24.5 DPS','99 Tuners','555 EXP','1 premium','Highest chance: Echo 2','Best DPS\/Tuner: Echo 4'])assert.match(view,new RegExp(value.replace('+','\\+')));
 assert.equal((view.match(/data-opportunity-slot=/g)??[]).length,5);assert.match(view,/ordering not established/);assert.deepEqual(input,before);
 assert.match(view,/<button[^>]*class="improve-next"[^>]*data-improve-slot="3"[^>]*>Work on Echo 4/);
 assert.match(view,/<details class="improve-comparison"><summary>Echo 4 vs Echo 2/);
 assert.match(renderImproveOpportunities(input,{comparisonOpen:true}),/<details class="improve-comparison" open>/,'An opened comparison remains readable across redraws');
 assert.ok(view.indexOf('data-decision-rationale')>view.indexOf('<details class="improve-comparison">'),'Full supplied evidence stays available on demand');
});
test('unsupported and older result contracts remain Pending without stale DPS or fallback recommendations',()=>{
 for(const input of [{status:'PENDING',reason:'SOURCE_CONTEXT_PENDING'},{...fixture(),provenance:null}]){const view=renderImproveOpportunities(input);assert.match(view,/PENDING/);assert.doesNotMatch(view,/data-recommended-slot|456 DPS|improve-next/);}
 assert.equal(interval({estimate:null,lower:0,upper:null}),'— (0–—)');
 const unresolved=fixture();unresolved.decisionEvidence.recommendedSlot=null;
 const view=renderImproveOpportunities(unresolved);assert.doesNotMatch(view,/class="improve-next"/);assert.match(view,/Why no recommendation\?/);assert.match(view,/Actual private explanation &lt;safe&gt;/);

});
test('contextual contribution is unavailable unless an accepted named reference and numeric comparison are supplied',()=>{
 const input=fixture();assert.match(renderImproveOpportunities(input),/UNAVAILABLE/);
 input.slots[0].currentContribution={status:'AVAILABLE',delta:8,currentDps:123,referenceDps:115,reference:{id:'LEGAL_TEST',label:'Legal <reference>',cost:1,mainStat:'ATK%'}};
 const view=renderImproveOpportunities(input);assert.match(view,/\+8 DPS relative to Legal &lt;reference&gt;/);assert.match(view,/Reference-dependent; not an intrinsic Echo score/);
 input.slots[0].currentContribution.status='UNAVAILABLE';assert.doesNotMatch(renderImproveOpportunities(input),/\+8 DPS relative/);
});
test('confidence support and each checkpoint alternative are presented only as supplied',()=>{
 const input=fixture();input.decisionEvidence.status='CONFIDENCE_SUPPORTED_RECOMMENDATION';input.decisionEvidence.confidence=.99;assert.match(renderImproveOpportunities(input),/supported by stated 99% bounds/);
 const view=renderCheckpointOptions({choices:[{action:'CONTINUE',chance:{estimate:.5,lower:.4,upper:.6},expectedFutureNetCost:{tuners:10,exp:25,echoes:0,tubes:{premium:2}}},{action:'RESTART_DATA_RECOVERY',status:'RESOURCE_BLOCKED'},{action:'RESTART_FEED'}]});
 assert.match(view,/CONTINUE/);assert.match(view,/RESTART · Data Recovery/);assert.match(view,/RESTART · Direct feed/);assert.match(view,/10 Tuners/);assert.match(view,/Stock cannot complete this alternative/);
});

test('rare/high-cost caution is shown only when supplied privately, never inferred from attempts in the frontend',()=>{
 const input=fixture();input.slots[0].attempts={estimate:300,lower:150,upper:null};
 assert.doesNotMatch(renderImproveOpportunities(input),/Potentially not worthwhile/);
 input.slots[0].potentiallyNotWorthwhile=true;input.slots[0].estimation.precision='RARE_EVENT_UNRESOLVED';
 const view=renderImproveOpportunities(input);assert.match(view,/Potentially not worthwhile/);assert.match(view,/Rare event unresolved/);assert.match(view,/300 \(150–—\)/);
});
