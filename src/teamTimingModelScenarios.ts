import {TEAM_TIMING_MODEL_SCENARIOS,TEAM_TIMING_RESEARCH_COVERAGE} from './data/teamTimingModelScenarios.ts';

/** Describes timing evidence available for one existing coordination case; does not select a variant. */
export function getTeamTimingResearchCoverage(coordinationCaseId:string){
  return TEAM_TIMING_RESEARCH_COVERAGE.find(c=>c.coordinationCaseId===coordinationCaseId)??null;
}

/** The caller chooses a declared recipe and actual trio. Context changes require explicit acceptance. */
export function describeTeamTimingModelScenario(input:{scenarioId:string;characterIds:readonly string[];rotationNumber:number;acceptContextVariant?:boolean}){
  const scenario=TEAM_TIMING_MODEL_SCENARIOS.find(s=>s.id===input.scenarioId);
  if(!scenario||input.characterIds.length!==3||new Set(input.characterIds).size!==3||scenario.characterIds.some(id=>!input.characterIds.includes(id)))return null;
  if(scenario.contextChangeRequired&&!input.acceptContextVariant)return {status:'CONTEXT_VARIANT_REQUIRED' as const,contextVariant:scenario.contextVariant,infoSv:scenario.infoSv};
  const phase=scenario.phases.find(p=>p.rotationNumber===input.rotationNumber);
  if(!phase)return null;
  return {status:'DECLARED_TIMING_SCENARIO' as const,scenarioId:scenario.id,contextVariant:scenario.contextVariant,
    clock:scenario.clock,cycleSeconds:phase.cycleFrames/60,
    meanLaterCycleSeconds:scenario.meanLaterCycleSeconds,meanMemberSeconds:scenario.meanMemberSeconds,
    visits:phase.visits.map(v=>({...v,startSeconds:v.startFrame/60,endSeconds:v.endFrame/60,fieldSeconds:v.durationFrames/60,workSeconds:v.workFrames/60,waitSeconds:v.waitFrames/60})),
    members:phase.members.map(m=>({...m,fieldSeconds:m.fieldFrames/60,workSeconds:m.workFrames/60,waitSeconds:m.waitFrames/60})),
    sourceUrl:scenario.sourceUrl,sourceCommit:scenario.sourceCommit,sourcePaths:scenario.sourcePaths,sourceBuilds:scenario.builds,
    referenceRelationship:scenario.referenceRelationship,infoSv:scenario.infoSv,
    teamDpsReady:false as const,rotationDps:null,automaticBuffUptime:null,authorizesUpgradeVerdict:false as const};
}
