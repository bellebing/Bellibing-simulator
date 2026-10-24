import test from 'node:test';
import assert from 'node:assert/strict';
import {observedEchoScenario} from '../src/observedEchoScenario.mjs';
import {observedScenarioFixture} from './helpers/observedScenarioFixture.mjs';
import {dpsConceptMarkup} from '../docs/ui-lab/v1.1/modules/dps-concept.js';
test('same-run observed baseline and one-Echo alternative expose zero-safe experimental deltas only',()=>{
 const input=observedScenarioFixture(),before=JSON.stringify(input),out=observedEchoScenario(input);
 assert.equal(out.status,'EXPERIMENTAL');assert.equal(out.baseline.teamTotal,6);assert.equal(out.alternatives[0].teamTotal,7);assert.equal(out.alternatives[0].delta.teamTotal.absolute,1);
 assert.equal(out.alternatives[0].delta.characterContributions[1].absolute,0);assert.ok(out.alternatives.slice(1).every(a=>a.teamTotal===null));assert.equal(JSON.stringify(input),before);
 const zero=observedScenarioFixture();zero.dps.beforeAfter.baseline.characterContributions[0].dps=0;zero.dps.beforeAfter.baseline.teamTotal=zero.dps.teamTotal=5;
 const a=zero.dps.beforeAfter.alternatives[0];a.delta.teamTotal={absolute:2,relative:2/5};a.delta.characterContributions[0]={characterId:'augusta',absolute:2,relative:null};
 assert.equal(observedEchoScenario(zero).alternatives[0].delta.characterContributions[0].relative,null);
});
test('stale view, foreign cards, source/clock/provider drift and forged deltas cannot populate a comparison',()=>{
 for(const mutate of [i=>i.view.revision++,i=>i.view.sessionId+='other',i=>i.view.slots[0].current.id+='other',i=>i.dps.beforeAfter.measurement.durationSeconds++,i=>i.dps.beforeAfter.measurement.clock='real seconds',i=>i.dps.provider.sourceRevision='other',i=>i.dps.beforeAfter.measurement.hitEvidenceSha256='other',i=>i.dps.beforeAfter.baseline.teamTotal++]){const i=observedScenarioFixture();mutate(i);assert.equal(observedEchoScenario(i),null);}
 for(const mutate of [i=>i.view.slots[0].trash=[],i=>i.view.slots[0].trash[0].card.level=20,i=>i.view.slots[0].trash[0].card.selectedSonataSetId='other',i=>i.dps.beforeAfter.alternatives[0].delta.teamTotal.absolute=100]){const i=observedScenarioFixture();mutate(i);const a=observedEchoScenario(i).alternatives[0];assert.equal(a.status,'PENDING');assert.equal(a.teamTotal,null);assert.equal(a.delta,null);}
});
test('experimental reference remains separate from the shared qualified comparison rows',()=>{
 const i=observedScenarioFixture(),args={hasCurrentBuild:true,characterId:'augusta',dps:i.dps,view:i.view,evaluationContext:i.dps.context};
 const normal=dpsConceptMarkup(args);assert.match(normal,/>Reference<.*>Simulated<.*>Change</s);assert.doesNotMatch(normal,/dps-experimental|data-observed-row|>6<|>7<|data-status="VERIFIED"/);
 // Legacy research values cannot populate the normal unified product table.
 const markup=dpsConceptMarkup({...args,expertMode:true});assert.match(markup,/Experimental Echo comparison/);assert.match(markup,/data-observed-row="DELTA"/);
 assert.equal((markup.match(/data-dps-scenario=/g)??[]).length,2);assert.ok(!markup.includes('data-status="VERIFIED"'));
 assert.ok(!dpsConceptMarkup({...args,expertMode:true,evaluationContext:null}).includes('class="observed-echo-comparison"'));
});
