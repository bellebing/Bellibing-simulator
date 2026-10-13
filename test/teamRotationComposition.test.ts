import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {TEAM_ROTATION_COMPOSITION_MODELS,TEAM_ROTATION_COMPOSITION_SOURCE} from '../src/data/teamRotationCompositionModels.ts';
import {getTeamRotationCompositionCoverage,findTeamCompositionContexts,describeTeamCompositionContext,findTeamRotationReplacements,composeTeamRotation} from '../src/teamRotationComposition.ts';
import {prepareTeamRotationScenario,compareTeamRotationScenarios} from '../src/combat/teamRotationScenarioPreparation.ts';
const hash=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex');
function scenario(partner='iuno'){
 const c=findTeamCompositionContexts({characterIds:['augusta',partner,'the-shorekeeper']})[0];
 return {contextId:c.context.id,characterIds:c.context.characterIds,modelId:c.timingOptions.find(o=>o.status==='DECLARED_MODEL_VARIANT_AVAILABLE')!.modelId,rotationNumber:2,acceptModelVariant:true,shorekeeper:{insideStellarealm:true,energyRegenRatio:2.5}};
}
test('pinned capture and generated models preserve all source scenarios',()=>{
 const bytes=readFileSync(TEAM_ROTATION_COMPOSITION_SOURCE.artifact),data=JSON.parse(bytes.toString());
 assert.equal(hash(bytes),TEAM_ROTATION_COMPOSITION_SOURCE.sha256);
 assert.equal(hash(readFileSync('scripts/capture-team-rotation-composition.mjs')),data.captureSha256);
 assert.deepEqual(data.records,TEAM_ROTATION_COMPOSITION_MODELS);
 assert.equal(new Set(data.records.map((r:{id:string})=>r.id)).size,data.records.length);
 for(const r of TEAM_ROTATION_COMPOSITION_MODELS)for(const p of r.phases){
  assert.equal(p.visits[0].startFrame,0);assert.equal(p.visits.at(-1)!.endFrame,p.cycleFrames);
  p.visits.forEach((v,i)=>{assert.ok(r.characterIds.includes(v.characterId));if(i)assert.equal(p.visits[i-1].endFrame,v.startFrame);assert.ok(v.actions.every(a=>a.atFrame>=v.startFrame&&a.atFrame<=v.endFrame));});
 }
});
test('every reviewed context is accounted for; discovery remains opt-in',()=>{
 const coverage=getTeamRotationCompositionCoverage();assert.equal(coverage.length,390);
 assert.equal(new Set(coverage.map(r=>r.contextId)).size,390);
 assert.ok(getTeamRotationCompositionCoverage(true).length>coverage.length);
 for(const c of coverage){const d=describeTeamCompositionContext(c.contextId)!;assert.equal(d.references.length,3);
  for(const id of c.modelIds){const r=composeTeamRotation({contextId:c.contextId,characterIds:c.characterIds,modelId:id,rotationNumber:2,acceptModelVariant:true});assert.equal(r.status,'COMPOSED_REFERENCE_SCENARIO');}
 }
});
test('a replacement resolves its own party and requires a declared variant',()=>{
 const input=scenario();assert.equal(composeTeamRotation({...input,acceptModelVariant:false}).status,'MODEL_VARIANT_REVIEW_REQUIRED');
 const alternatives=findTeamRotationReplacements(input.contextId,'iuno');assert.ok(alternatives.some(c=>c.incomingCharacterId==='mortefi'));
 assert.throws(()=>composeTeamRotation({...input,characterIds:['augusta','mortefi','the-shorekeeper']}),/exact new trio/);
 assert.throws(()=>composeTeamRotation({...scenario('mortefi'),modelId:input.modelId}),/does not belong/);
 assert.throws(()=>composeTeamRotation({...input,rotationNumber:0}),/opener/);
});
test('named mode incompatibility cannot be accepted into a timeline',()=>{
 const c=findTeamCompositionContexts({characterIds:['hsin','jinhsi','the-shorekeeper']})[0];
 const model=c.timingOptions.find(o=>o.status==='DECLARED_MODEL_VARIANT_AVAILABLE')!;
 assert.equal(composeTeamRotation({contextId:c.context.id,characterIds:c.context.characterIds,modelId:model.modelId,rotationNumber:2,acceptModelVariant:true,modeKeys:{hsin:'electro-flare'}}).status,'MODE_MISMATCH');
});
test('Augusta swap recomputes the cycle and preserves buff ownership',()=>{
 const result=compareTeamRotationScenarios(scenario(),scenario('mortefi'));
 assert.equal(result.status,'REFERENCE_SCENARIO_COMPARISON');if(result.status!=='REFERENCE_SCENARIO_COMPARISON')return;
 assert.ok(Math.abs(result.cycleSecondsDelta+67/60)<1e-9);assert.equal(result.anchorFieldSecondsDelta,0);
 assert.equal(result.lostTransfers[0].sourceActorId,'iuno');assert.equal(result.gainedTransfers[0].sourceActorId,'mortefi');
 assert.equal(result.lostTransfers[0].value,0.5);assert.equal(result.gainedTransfers[0].value,0.38);
 for(const r of [result.baseline,result.replacement]){const c=r.combatPreparation.anchorCoverage;assert.ok(Math.abs(c.fieldSeconds-c.stellarealmCritDamageSeconds!)<1e-9);assert.equal(r.combatPreparation.teamDpsReady,false);
  assert.ok(r.combatPreparation.intervals.filter(i=>i.characterId==='augusta').every(i=>i.incomingAmplifications.every(w=>w.incomingResonatorId==='augusta')));}
 assert.ok(!result.replacement.combatPreparation.transferWindows.some(w=>w.sourceActorId==='iuno'));
 assert.ok(result.baseline.references.find(m=>m.characterId==='iuno')!.candidates.every(c=>c.reference.context.modeKeys.includes('semi-dps')));
 assert.ok(result.baseline.contextDifferences.some(d=>d.characterId==='iuno'&&d.moduleMode==='semi-dps'));
});
test('range/ER are explicit and a missing sample is unknown, not zero',()=>{
 const r=prepareTeamRotationScenario({...scenario(),shorekeeper:undefined});assert.equal(r.status,'COMPOSED_REFERENCE_SCENARIO');if(r.status!=='COMPOSED_REFERENCE_SCENARIO')return;
 assert.equal(r.combatPreparation.anchorCoverage.stellarealmCritDamageSeconds,null);
 const outside=prepareTeamRotationScenario({...scenario(),shorekeeper:{insideStellarealm:false,energyRegenRatio:2.5}});
 assert.equal(outside.status,'COMPOSED_REFERENCE_SCENARIO');if(outside.status==='COMPOSED_REFERENCE_SCENARIO')assert.equal(outside.combatPreparation.anchorCoverage.stellarealmCritDamageSeconds,null); // source Discernment assumes prior in-range upgrades; fail closed on conflicting history
 const low=prepareTeamRotationScenario({...scenario(),shorekeeper:{insideStellarealm:true,energyRegenRatio:1}});
 if(low.status==='COMPOSED_REFERENCE_SCENARIO')assert.ok(low.combatPreparation.intervals.filter(i=>i.characterId==='augusta').every(i=>i.stellarealm!.critRateBonus<0.125));
});
test('unsupported source sequences remain blocked alongside explicit higher-sequence alternatives',()=>{
 const blocked=TEAM_ROTATION_COMPOSITION_MODELS.find(m=>m.failure?.includes('Jianxin declares no rotation below S2'))!;
 assert.ok(blocked);const higher=TEAM_ROTATION_COMPOSITION_MODELS.find(m=>m.id===blocked.id+'-higher-sequence')!;assert.ok(higher);assert.equal(higher.builds!.find(b=>b.characterId==='jianxin')!.sequence,2);
});
test('split Jinhsi visits receive the correct stage and the later Zhezhi transfer',()=>{
 const c=findTeamCompositionContexts({characterIds:['jinhsi','zhezhi','the-shorekeeper']})[0];
 const model=c.timingOptions.find(o=>o.status==='DECLARED_MODEL_VARIANT_AVAILABLE')!;
 const r=prepareTeamRotationScenario({contextId:c.context.id,characterIds:c.context.characterIds,modelId:model.modelId,rotationNumber:2,acceptModelVariant:true,shorekeeper:{insideStellarealm:true,energyRegenRatio:2.5}});
 assert.equal(r.status,'COMPOSED_REFERENCE_SCENARIO');if(r.status!=='COMPOSED_REFERENCE_SCENARIO')return;
 const visits=r.visits.filter(v=>v.characterId==='jinhsi');assert.equal(visits.length,2);
 const intervals=r.combatPreparation.intervals.filter(i=>i.characterId==='jinhsi');
 const first=intervals.filter(i=>i.startSeconds<visits[0].endSeconds),second=intervals.filter(i=>i.startSeconds>=visits[1].startSeconds);
 assert.ok(first.every(i=>i.stellarealm?.stage==='INNER'));assert.ok(first.every(i=>!i.incomingAmplifications.some(w=>w.sourceActorId==='zhezhi')));
 assert.ok(second.every(i=>i.stellarealm?.stage==='SUPERNAL'));assert.ok(second.some(i=>i.incomingAmplifications.some(w=>w.sourceActorId==='zhezhi')));
});
test('later cycles replay prior history with an absolute time origin',()=>{
 const r=prepareTeamRotationScenario({...scenario(),rotationNumber:4});assert.equal(r.status,'COMPOSED_REFERENCE_SCENARIO');if(r.status!=='COMPOSED_REFERENCE_SCENARIO')return;
 assert.ok(r.combatPreparation.timeOriginSeconds>70);assert.ok(r.combatPreparation.eventHistory[0].absoluteSeconds<r.combatPreparation.timeOriginSeconds);
 assert.ok(r.combatPreparation.intervals.filter(i=>i.characterId==='augusta').every(i=>i.stellarealm?.stage==='SUPERNAL'));
 assert.ok(Math.abs(r.combatPreparation.anchorCoverage.fieldSeconds-r.combatPreparation.anchorCoverage.stellarealmCritDamageSeconds!)<1e-9);
});
