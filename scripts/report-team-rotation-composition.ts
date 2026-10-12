import {writeFileSync,readFileSync} from 'node:fs';
import {getTeamRotationCompositionCoverage,findTeamCompositionContexts,describeTeamCompositionContext} from '../src/teamRotationComposition.ts';
import {compareTeamRotationScenarios} from '../src/combat/teamRotationScenarioPreparation.ts';
const coverage=getTeamRotationCompositionCoverage();
const scenarios=['iuno','mortefi'].map(partner=>{
 const context=findTeamCompositionContexts({characterIds:['augusta',partner,'the-shorekeeper']})[0];
 const option=context.timingOptions.find(o=>o.status==='DECLARED_MODEL_VARIANT_AVAILABLE')!;
 return {contextId:context.context.id,characterIds:context.context.characterIds,modelId:option.modelId,rotationNumber:2,acceptModelVariant:true,shorekeeper:{insideStellarealm:true,energyRegenRatio:2.5}};
});
const comparison=compareTeamRotationScenarios(scenarios[0],scenarios[1]);
if(comparison.status!=='REFERENCE_SCENARIO_COMPARISON')throw Error('Augusta comparison blocked');
const brief=(r:typeof comparison.baseline)=>({contextId:r.contextId,modelId:r.modelId,clock:r.clock,cycleSeconds:r.cycleSeconds,sourceBuilds:r.sourceBuilds,sourceResourceRequirements:r.sourceResourceRequirements,contextDifferences:r.contextDifferences,referenceIds:r.references.map(m=>({characterId:m.characterId,mode:m.classifiedReferenceMode,ids:m.candidates.map(c=>c.reference.id)})),
 visits:r.visits.map(v=>({characterId:v.characterId,startSeconds:v.startSeconds,endSeconds:v.endSeconds,fieldSeconds:v.fieldSeconds,waitSeconds:v.waitSeconds})),anchorCoverage:r.combatPreparation.anchorCoverage,
 intervals:r.combatPreparation.intervals.filter(i=>i.characterId==='augusta').map(i=>({startSeconds:i.startSeconds,endSeconds:i.endSeconds,stellarealm:i.stellarealm,transfers:i.incomingAmplifications.map(w=>({sourceId:w.sourceId,sourceActorId:w.sourceActorId,value:w.value,statOrEffect:w.statOrEffect,startedAtSeconds:w.startedAtSeconds,expiresAtSeconds:w.expiresAtSeconds}))})),pending:r.combatPreparation.pending});
const report={scope:'ALL_REVIEWED_COMPOSITION_CONTEXTS',scenarioAssumptions:scenarios[0].shorekeeper,counts:Object.fromEntries(Object.entries(Object.groupBy(coverage,c=>c.status)).map(([key,value])=>[key,value!.length])),
 augustaComparison:{baseline:brief(comparison.baseline),replacement:brief(comparison.replacement),cycleSecondsDelta:comparison.cycleSecondsDelta,anchorFieldSecondsDelta:comparison.anchorFieldSecondsDelta,lostTransfers:comparison.lostTransfers,gainedTransfers:comparison.gainedTransfers,infoSv:comparison.infoSv},
 coverage:coverage.map(c=>{const d=describeTeamCompositionContext(c.contextId)!;return {...c,references:d.references.map(r=>({characterId:r.characterId,referenceIds:r.candidates.map(c=>c.reference.id)})),blockedModels:d.timingOptions.filter(o=>o.failure||o.modeReview.some(m=>m.status==='NAMED_MODE_MISMATCH')).map(o=>({modelId:o.modelId,failure:o.failure,modeReview:o.modeReview,resourceRequirements:o.resourceRequirements})),conditionsSv:d.context.conditionsSv};}),teamDpsReady:false};
const path=process.argv.find((arg,i)=>i>1&&arg!=='--check')??'data/generated/team-rotation-composition-report.json';
const text=JSON.stringify(report,null,2)+'\n';
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==text)throw Error('Composition report parity drift');}else writeFileSync(path,text);console.log(JSON.stringify(report.counts));
