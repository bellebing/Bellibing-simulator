import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {TEAM_ROTATION_CASES} from '../src/data/teamRotationCoordination.ts';
import {STANDARD_TEAM_ROTATION_TIMING_CASE_COVERAGE} from '../src/data/standardTeamRotationTiming.ts';
import {TEAM_AWARE_ROTATION_REFERENCES} from '../src/data/teamAwareRotationReferences.ts';
const path='data/source/team-timing-model-review-2026-10-12.json';
const bytes=readFileSync(path),review=JSON.parse(bytes),hash=x=>createHash('sha256').update(x).digest('hex');
for(const k of ['evidence','coordination','captureScript']){
 const p=k==='captureScript'?review.captureScript:review[k+'Artifact'];
 if(hash(readFileSync(p))!==review[k+'Sha256'])throw Error(k+' drift; model review required');
}
const evidence=JSON.parse(readFileSync(review.evidenceArtifact));
const refs=new Set(TEAM_AWARE_ROTATION_REFERENCES.map(r=>r.id)),cases=new Map(TEAM_ROTATION_CASES.map(c=>[c.id,c]));
const sourcePaths=new Set(evidence.sourceFiles.map(f=>f.path));
const actorId=name=>review.actorIds[name]??name.toLowerCase();
if(review.models.length!==evidence.records.length||new Set(review.models.map(m=>m.id)).size!==review.models.length)throw Error('Incomplete/duplicate model review');
const scenarios=review.models.map(m=>{
 const r=evidence.records.find(r=>r.caseId===m.coordinationCaseId),c=cases.get(m.coordinationCaseId);
 if(!r||!c||m.relatedReferenceIds.some(id=>!refs.has(id))||m.sourcePaths.some(p=>!sourcePaths.has(p)))throw Error('Unpinned model join');
 const party=r.builds.map(b=>actorId(b.actor));
 if(new Set(party).size!==3||JSON.stringify(party)!==JSON.stringify(m.characterIds)||c.requiredCharacters.some(id=>!party.includes(id)))throw Error('Wrong model party');
 const phases=r.phases.map((p,i)=>{
  if(p.rotationNumber!==i+1||!Number.isInteger(p.cycleFrames)||p.cycleFrames<=0)throw Error('Invalid model clock');
  let end=0;
  const visits=p.visits.map((v,n)=>{
   if(v.startFrame!==end||!Number.isInteger(v.endFrame)||v.endFrame<v.startFrame||!party.includes(actorId(v.actor)))throw Error('Broken visit timeline');
   const durationFrames=v.endFrame-v.startFrame;end=v.endFrame;
   const waits=v.actions.filter(a=>a.waitFrames>0).map(a=>({atFrame:a.atFrame,durationFrames:a.waitFrames}));
   for(const a of v.actions)if(a.atFrame<v.startFrame||a.atFrame>v.endFrame||(a.castUnmet&&a.castUnmet.some(Boolean)))throw Error('Unmet model resource condition or misplaced action');
   const waitFrames=waits.reduce((sum,w)=>sum+w.durationFrames,0);
   if(waitFrames>durationFrames||waits.some(w=>w.atFrame+w.durationFrames>v.endFrame))throw Error('Wait exceeds visit');
   return {characterId:actorId(v.actor),startFrame:v.startFrame,endFrame:v.endFrame,durationFrames,workFrames:durationFrames-waitFrames,waitFrames,waits,kind:n===p.visits.length-1&&v.actions.every(a=>a.name.startsWith('Intro'))?'CYCLE_CLOSING_INTRO':'ACTOR_VISIT',sourceActionCount:v.actions.length};
  });
  if(end!==p.cycleFrames)throw Error('Cycle budget drift');
  const members=party.map(characterId=>{
   const owned=visits.filter(v=>v.characterId===characterId);
   return {characterId,fieldFrames:owned.reduce((sum,v)=>sum+v.durationFrames,0),workFrames:owned.reduce((sum,v)=>sum+v.workFrames,0),waitFrames:owned.reduce((sum,v)=>sum+v.waitFrames,0),visitCount:owned.length};
  });
  return {rotationNumber:p.rotationNumber,cycleFrames:p.cycleFrames,visits,members};
 });
 if(phases.length!==4)throw Error('Expected opener and three later loops');
 const meanMemberSeconds=party.map(characterId=>({characterId,fieldSeconds:phases.slice(1).reduce((sum,p)=>sum+p.members.find(m=>m.characterId===characterId).fieldFrames,0)/180,workSeconds:phases.slice(1).reduce((sum,p)=>sum+p.members.find(m=>m.characterId===characterId).workFrames,0)/180,waitSeconds:phases.slice(1).reduce((sum,p)=>sum+p.members.find(m=>m.characterId===characterId).waitFrames,0)/180}));
 return {...m,sourceCommit:evidence.sourceCommit,sourceUrl:evidence.sourceUrl,clock:evidence.clock,builds:r.builds.map(b=>({...b,characterId:actorId(b.actor)})),phases,meanLaterCycleSeconds:phases.slice(1).reduce((sum,p)=>sum+p.cycleFrames,0)/180,meanMemberSeconds};
});
const coverage=TEAM_ROTATION_CASES.map(c=>({coordinationCaseId:c.id,publishedSourceIds:STANDARD_TEAM_ROTATION_TIMING_CASE_COVERAGE.find(x=>x.coordinationCaseId===c.id)?.sourceIds??[],modelScenarioIds:scenarios.filter(s=>s.coordinationCaseId===c.id).map(s=>s.id)}));
if(coverage.some(c=>!c.publishedSourceIds.length&&!c.modelScenarioIds.length))throw Error('Unfilled timing research case');
const meta={reviewedAt:review.reviewedAt,reviewArtifact:path,reviewSha256:hash(bytes),evidenceArtifact:review.evidenceArtifact,evidenceSha256:review.evidenceSha256,sourceCommit:evidence.sourceCommit,authority:evidence.authority,scope:'DECLARED_TIMING_SCENARIOS_NOT_GAMEPLAY_MEASUREMENTS_OR_DPS'};
const out=`// Generated timing-only scenarios; source traces stay in evidence.\nexport const TEAM_TIMING_MODEL_REVIEW = ${JSON.stringify(meta,null,2)} as const;\nexport const TEAM_TIMING_MODEL_SCENARIOS = ${JSON.stringify(scenarios,null,2)} as const;\nexport const TEAM_TIMING_RESEARCH_COVERAGE = ${JSON.stringify(coverage,null,2)} as const;\n`;
const target='src/data/teamTimingModelScenarios.ts';
if(process.argv.includes('--check')){if(readFileSync(target,'utf8')!==out)throw Error('Model projection drift');}else writeFileSync(target,out);
console.log(`${scenarios.length} declared models / ${coverage.length} accounted-for cases; no engine or DPS promotion.`);
